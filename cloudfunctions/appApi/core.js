const { buildMenuSummary } = require('./summary');

const COLLECTIONS = {
  users: 'users',
  spaces: 'spaces',
  members: 'space_members',
  dishes: 'dishes',
  sessions: 'menu_sessions',
  entries: 'menu_item_entries',
  confirmations: 'chef_confirmations',
  orders: 'orders',
  versions: 'order_versions',
  notifications: 'notifications',
};

function createError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function requireValue(value, code, message) {
  if (value === undefined || value === null || value === '') {
    throw createError(code, message);
  }
  return value;
}

function normalizeQuantity(value) {
  const quantity = Number(value || 0);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw createError('INVALID_QUANTITY', '数量必须大于 0');
  }
  return quantity;
}

function createDefaultInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function createAppApi({ db, now = () => new Date().toISOString(), inviteCode = createDefaultInviteCode }) {
  async function getCurrentUser(openid) {
    requireValue(openid, 'UNAUTHENTICATED', '缺少 openid');
    const user = await db.findOne(COLLECTIONS.users, { openid });
    if (!user) {
      throw createError('USER_NOT_FOUND', '用户不存在，请先登录');
    }
    return user;
  }

  async function getMembership(openid, spaceId) {
    const user = await getCurrentUser(openid);
    const member = await db.findOne(COLLECTIONS.members, { space_id: spaceId, user_id: user._id });
    if (!member) {
      throw createError('FORBIDDEN', '你不是该空间成员');
    }
    return { user, member };
  }

  async function requireRole(openid, spaceId, roles) {
    const context = await getMembership(openid, spaceId);
    if (!roles.includes(context.member.role)) {
      throw createError('FORBIDDEN', '当前角色无权执行该操作');
    }
    return context;
  }

  async function login({ openid, data = {} }) {
    requireValue(openid, 'UNAUTHENTICATED', '缺少 openid');
    const timestamp = now();
    const existing = await db.findOne(COLLECTIONS.users, { openid });
    if (existing) {
      const user = await db.update(COLLECTIONS.users, existing._id, {
        nickname: data.nickname || existing.nickname || '微信用户',
        avatar_url: data.avatar_url || existing.avatar_url || '',
        updated_at: timestamp,
      });
      return { user };
    }

    const user = await db.add(COLLECTIONS.users, {
      openid,
      nickname: data.nickname || '微信用户',
      avatar_url: data.avatar_url || '',
      created_at: timestamp,
      updated_at: timestamp,
    });
    return { user };
  }

  async function createSpace({ openid, data = {} }) {
    const user = await getCurrentUser(openid);
    const timestamp = now();
    const space = await db.add(COLLECTIONS.spaces, {
      name: requireValue(data.name, 'INVALID_SPACE_NAME', '空间名称不能为空'),
      description: data.description || '',
      currency_name: data.currency_name || '饭票',
      owner_id: user._id,
      invite_code: data.invite_code || inviteCode(),
      created_at: timestamp,
      updated_at: timestamp,
    });
    const member = await db.add(COLLECTIONS.members, {
      space_id: space._id,
      user_id: user._id,
      role: 'owner',
      joined_at: timestamp,
    });
    return { space, member };
  }

  async function joinSpace({ openid, data = {} }) {
    const user = await getCurrentUser(openid);
    const invite = requireValue(data.invite_code, 'INVALID_INVITE_CODE', '邀请码不能为空').trim().toUpperCase();
    const space = await db.findOne(COLLECTIONS.spaces, { invite_code: invite });
    if (!space) {
      throw createError('SPACE_NOT_FOUND', '没有找到对应空间');
    }
    const existing = await db.findOne(COLLECTIONS.members, { space_id: space._id, user_id: user._id });
    if (existing) {
      return { space, member: existing };
    }
    const member = await db.add(COLLECTIONS.members, {
      space_id: space._id,
      user_id: user._id,
      role: 'member',
      joined_at: now(),
    });
    return { space, member };
  }

  async function updateMemberRole({ openid, data = {} }) {
    await requireRole(openid, data.space_id, ['owner']);
    const role = requireValue(data.role, 'INVALID_ROLE', '角色不能为空');
    if (!['owner', 'chef', 'member'].includes(role)) {
      throw createError('INVALID_ROLE', '角色不合法');
    }
    const target = await db.findOne(COLLECTIONS.members, { space_id: data.space_id, user_id: data.user_id });
    if (!target) {
      throw createError('MEMBER_NOT_FOUND', '成员不存在');
    }
    const member = await db.update(COLLECTIONS.members, target._id, { role });
    return { member };
  }

  async function createDish({ openid, data = {} }) {
    const { user } = await getMembership(openid, data.space_id);
    const timestamp = now();
    const dish = await db.add(COLLECTIONS.dishes, {
      space_id: data.space_id,
      created_by: user._id,
      name: requireValue(data.name, 'INVALID_DISH_NAME', '菜名不能为空'),
      image_file_id: data.image_file_id || '',
      price: Number(data.price || 0),
      ingredients: data.ingredients || '',
      description: data.description || '',
      is_active: true,
      created_at: timestamp,
      updated_at: timestamp,
    });
    return { dish };
  }

  async function updateDish({ openid, data = {} }) {
    const { user, member } = await getMembership(openid, data.space_id);
    const dish = await db.findOne(COLLECTIONS.dishes, { _id: data.dish_id, space_id: data.space_id });
    if (!dish || dish.is_active === false) {
      throw createError('DISH_NOT_FOUND', '菜品不存在');
    }
    if (dish.created_by !== user._id && member.role !== 'owner') {
      throw createError('FORBIDDEN', '只能编辑自己上传的菜品');
    }
    const updated = await db.update(COLLECTIONS.dishes, dish._id, {
      name: data.name || dish.name,
      image_file_id: data.image_file_id !== undefined ? data.image_file_id : dish.image_file_id,
      price: data.price !== undefined ? Number(data.price) : dish.price,
      ingredients: data.ingredients !== undefined ? data.ingredients : dish.ingredients,
      description: data.description !== undefined ? data.description : dish.description,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : dish.is_active,
      updated_at: now(),
    });
    return { dish: updated };
  }

  async function createMenuSession({ openid, data = {} }) {
    const { user } = await getMembership(openid, data.space_id);
    const timestamp = now();
    const menuSession = await db.add(COLLECTIONS.sessions, {
      space_id: data.space_id,
      name: requireValue(data.name, 'INVALID_SESSION_NAME', '点单局名称不能为空'),
      description: data.description || '',
      status: 'draft',
      created_by: user._id,
      submitted_by: '',
      submitted_at: '',
      current_order_version: 0,
      created_at: timestamp,
      updated_at: timestamp,
    });
    return { menu_session: menuSession };
  }

  async function addDishToMenu({ openid, data = {} }) {
    const { user } = await getMembership(openid, data.space_id);
    const session = await db.findOne(COLLECTIONS.sessions, { _id: data.menu_session_id, space_id: data.space_id });
    const dish = await db.findOne(COLLECTIONS.dishes, { _id: data.dish_id, space_id: data.space_id });
    if (!session) {
      throw createError('SESSION_NOT_FOUND', '点单局不存在');
    }
    if (!dish || dish.is_active === false) {
      throw createError('DISH_NOT_FOUND', '菜品不存在');
    }
    const timestamp = now();
    const entry = await db.add(COLLECTIONS.entries, {
      space_id: data.space_id,
      menu_session_id: session._id,
      dish_id: dish._id,
      user_id: user._id,
      quantity: normalizeQuantity(data.quantity),
      created_at: timestamp,
      updated_at: timestamp,
      is_deleted: false,
    });
    if (session.status === 'chef_confirmed') {
      await db.update(COLLECTIONS.sessions, session._id, { status: 'changed_after_confirmed', updated_at: timestamp });
    }
    return { entry };
  }

  async function updateMyMenuItemQuantity({ openid, data = {} }) {
    const { user } = await getMembership(openid, data.space_id);
    const entries = await db.findMany(COLLECTIONS.entries, {
      space_id: data.space_id,
      menu_session_id: data.menu_session_id,
      dish_id: data.dish_id,
      user_id: user._id,
    });
    const activeEntries = entries.filter((entry) => !entry.is_deleted);
    const currentQuantity = activeEntries.reduce((total, entry) => total + Number(entry.quantity || 0), 0);
    const nextQuantity = Number(data.quantity || 0);
    if (!Number.isFinite(nextQuantity) || nextQuantity < 0) {
      throw createError('INVALID_QUANTITY', '数量不能小于 0');
    }

    if (nextQuantity > currentQuantity) {
      return addDishToMenu({
        openid,
        data: { ...data, quantity: nextQuantity - currentQuantity },
      });
    }

    let remainingToRemove = currentQuantity - nextQuantity;
    const sorted = [...activeEntries].sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0));
    for (const entry of sorted) {
      if (remainingToRemove <= 0) {
        break;
      }
      const quantity = Number(entry.quantity || 0);
      if (quantity <= remainingToRemove) {
        await db.update(COLLECTIONS.entries, entry._id, { is_deleted: true, updated_at: now() });
        remainingToRemove -= quantity;
      } else {
        await db.update(COLLECTIONS.entries, entry._id, { quantity: quantity - remainingToRemove, updated_at: now() });
        remainingToRemove = 0;
      }
    }
    return { ok: true };
  }

  async function confirmDishAvailability({ openid, data = {} }) {
    const { user } = await requireRole(openid, data.space_id, ['owner', 'chef']);
    const status = requireValue(data.status, 'INVALID_CONFIRM_STATUS', '确认状态不能为空');
    if (!['available', 'partial', 'unavailable'].includes(status)) {
      throw createError('INVALID_CONFIRM_STATUS', '确认状态不合法');
    }
    const existing = await db.findOne(COLLECTIONS.confirmations, {
      space_id: data.space_id,
      menu_session_id: data.menu_session_id,
      dish_id: data.dish_id,
    });
    const payload = {
      space_id: data.space_id,
      menu_session_id: data.menu_session_id,
      dish_id: data.dish_id,
      status,
      available_quantity: status === 'unavailable' ? 0 : Number(data.available_quantity || 0),
      note: data.note || '',
      confirmed_by: user._id,
      confirmed_at: now(),
      updated_at: now(),
    };
    const confirmation = existing
      ? await db.update(COLLECTIONS.confirmations, existing._id, payload)
      : await db.add(COLLECTIONS.confirmations, payload);
    await db.updateWhere(COLLECTIONS.sessions, { _id: data.menu_session_id, space_id: data.space_id }, {
      status: 'chef_confirmed',
      updated_at: now(),
    });
    return { confirmation };
  }

  async function buildSessionSnapshot(spaceId, menuSessionId) {
    const dishes = await db.findMany(COLLECTIONS.dishes, { space_id: spaceId });
    const entries = await db.findMany(COLLECTIONS.entries, { space_id: spaceId, menu_session_id: menuSessionId });
    const confirmations = await db.findMany(COLLECTIONS.confirmations, { space_id: spaceId, menu_session_id: menuSessionId });
    return buildMenuSummary({ dishes, entries, confirmations });
  }

  async function submitMenuSession({ openid, data = {} }) {
    const { user } = await getMembership(openid, data.space_id);
    const session = await db.findOne(COLLECTIONS.sessions, { _id: data.menu_session_id, space_id: data.space_id });
    if (!session) {
      throw createError('SESSION_NOT_FOUND', '点单局不存在');
    }
    const timestamp = now();
    const existingOrder = await db.findOne(COLLECTIONS.orders, {
      space_id: data.space_id,
      menu_session_id: session._id,
    });
    const latestVersion = existingOrder ? Number(existingOrder.latest_version || 0) + 1 : 1;
    const order = existingOrder
      ? await db.update(COLLECTIONS.orders, existingOrder._id, { latest_version: latestVersion, updated_at: timestamp })
      : await db.add(COLLECTIONS.orders, {
        space_id: data.space_id,
        menu_session_id: session._id,
        created_by: user._id,
        latest_version: latestVersion,
        status: 'active',
        created_at: timestamp,
        updated_at: timestamp,
      });
    const snapshot = await buildSessionSnapshot(data.space_id, session._id);
    const version = await db.add(COLLECTIONS.versions, {
      space_id: data.space_id,
      order_id: order._id,
      menu_session_id: session._id,
      version_no: latestVersion,
      snapshot,
      created_by: user._id,
      created_at: timestamp,
    });
    await db.update(COLLECTIONS.sessions, session._id, {
      status: 'chef_confirming',
      submitted_by: user._id,
      submitted_at: timestamp,
      current_order_version: latestVersion,
      updated_at: timestamp,
    });
    return { order, version };
  }

  async function listSpaces({ openid }) {
    const user = await getCurrentUser(openid);
    const memberships = await db.findMany(COLLECTIONS.members, { user_id: user._id });
    const spaces = [];
    for (const membership of memberships) {
      const space = await db.findOne(COLLECTIONS.spaces, { _id: membership.space_id });
      if (space) {
        spaces.push({ ...space, my_role: membership.role });
      }
    }
    return { spaces };
  }

  async function getSpace({ openid, data = {} }) {
    await getMembership(openid, data.space_id);
    const space = await db.findOne(COLLECTIONS.spaces, { _id: data.space_id });
    return { space };
  }

  async function listMembers({ openid, data = {} }) {
    await getMembership(openid, data.space_id);
    const members = await db.findMany(COLLECTIONS.members, { space_id: data.space_id });
    const users = await db.findMany(COLLECTIONS.users);
    return {
      members: members.map((member) => ({
        ...member,
        user: users.find((user) => user._id === member.user_id) || null,
      })),
    };
  }

  async function listDishes({ openid, data = {} }) {
    await getMembership(openid, data.space_id);
    const keyword = (data.keyword || '').trim();
    const dishes = (await db.findMany(COLLECTIONS.dishes, { space_id: data.space_id }))
      .filter((dish) => dish.is_active !== false)
      .filter((dish) => !keyword || dish.name.includes(keyword))
      .map((dish) => ({ ...dish, initial: dish.name.slice(0, 1) }));
    return { dishes };
  }

  async function listMenuSessions({ openid, data = {} }) {
    await getMembership(openid, data.space_id);
    const menu_sessions = await db.findMany(COLLECTIONS.sessions, { space_id: data.space_id });
    return { menu_sessions };
  }

  async function getMenuSessionDetail({ openid, data = {} }) {
    const { user } = await getMembership(openid, data.space_id);
    const session = await db.findOne(COLLECTIONS.sessions, { _id: data.menu_session_id, space_id: data.space_id });
    if (!session) {
      throw createError('SESSION_NOT_FOUND', '点单局不存在');
    }
    const summary = await buildSessionSnapshot(data.space_id, session._id);
    const users = await db.findMany(COLLECTIONS.users);
    const usersById = users.reduce((target, item) => {
      target[item._id] = item;
      return target;
    }, {});
    return { session, summary, usersById, current_user: user };
  }

  async function getOrderDetail({ openid, data = {} }) {
    await getMembership(openid, data.space_id);
    const order = await db.findOne(COLLECTIONS.orders, { _id: data.order_id, space_id: data.space_id });
    if (!order) {
      throw createError('ORDER_NOT_FOUND', '订单不存在');
    }
    const versions = await db.findMany(COLLECTIONS.versions, { order_id: order._id, space_id: data.space_id });
    const detail = await getMenuSessionDetail({
      openid,
      data: { space_id: data.space_id, menu_session_id: order.menu_session_id },
    });
    return { order, versions, ...detail };
  }

  return {
    login,
    createSpace,
    joinSpace,
    updateMemberRole,
    createDish,
    updateDish,
    createMenuSession,
    addDishToMenu,
    updateMyMenuItemQuantity,
    submitMenuSession,
    confirmDishAvailability,
    listSpaces,
    getSpace,
    listMembers,
    listDishes,
    listMenuSessions,
    getMenuSessionDetail,
    getOrderDetail,
  };
}

module.exports = { createAppApi, createError };
