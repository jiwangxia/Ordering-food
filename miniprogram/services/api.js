const mock = require('./mock');
const { buildMenuSummary } = require('../utils/summary');

function getAppConfig() {
  const app = getApp();
  return app.globalData || {};
}

function getUserName(userId) {
  const user = mock.users.find((item) => item._id === userId);
  return user ? user.nickname : '未知成员';
}

async function callAppApi(action, data = {}) {
  if (getAppConfig().useMock) {
    throw new Error('Mock mode uses local service methods');
  }
  const result = await wx.cloud.callFunction({
    name: 'appApi',
    data: { action, data },
  });
  const payload = result.result || {};
  if (!payload.ok) {
    throw new Error(payload.message || '云函数调用失败');
  }
  return payload.data;
}

async function login() {
  if (!getAppConfig().useMock) {
    const profile = getAppConfig().pendingProfile || {};
    const result = await callAppApi('login', profile);
    getApp().globalData.currentUser = result.user;
    return result.user;
  }
  const currentUser = mock.users[0];
  getApp().globalData.currentUser = currentUser;
  return currentUser;
}

async function listSpaces() {
  if (!getAppConfig().useMock) {
    return (await callAppApi('listSpaces')).spaces;
  }
  return mock.spaces;
}

async function getSpace(spaceId) {
  if (!getAppConfig().useMock) {
    return (await callAppApi('getSpace', { space_id: spaceId })).space;
  }
  return mock.spaces.find((space) => space._id === spaceId) || mock.spaces[0];
}

async function listMembers(spaceId) {
  if (!getAppConfig().useMock) {
    return (await callAppApi('listMembers', { space_id: spaceId })).members;
  }
  return mock.members
    .filter((member) => member.space_id === spaceId)
    .map((member) => ({
      ...member,
      user: mock.users.find((user) => user._id === member.user_id),
    }));
}

async function listDishes(spaceId, keyword = '') {
  if (!getAppConfig().useMock) {
    return (await callAppApi('listDishes', { space_id: spaceId, keyword })).dishes;
  }
  const normalizedKeyword = keyword.trim();
  return mock.dishes
    .filter((dish) => {
      return dish.space_id === spaceId && dish.is_active && (!normalizedKeyword || dish.name.includes(normalizedKeyword));
    })
    .map((dish) => ({
      ...dish,
      initial: dish.name.slice(0, 1),
    }));
}

async function listMenuSessions(spaceId) {
  if (!getAppConfig().useMock) {
    return (await callAppApi('listMenuSessions', { space_id: spaceId })).menu_sessions;
  }
  return mock.menuSessions.filter((session) => session.space_id === spaceId);
}

async function getMenuSessionDetail(menuSessionId) {
  if (!getAppConfig().useMock) {
    const space = getAppConfig().currentSpace;
    return callAppApi('getMenuSessionDetail', {
      space_id: space && space._id,
      menu_session_id: menuSessionId,
    });
  }
  const session = mock.menuSessions.find((item) => item._id === menuSessionId) || mock.menuSessions[0];
  const spaceDishes = mock.dishes.filter((dish) => dish.space_id === session.space_id);
  const entries = mock.menuItemEntries.filter((entry) => entry.menu_session_id === session._id);
  const confirmations = mock.chefConfirmations.filter((item) => item.menu_session_id === session._id);
  const summary = buildMenuSummary({ dishes: spaceDishes, entries, confirmations });

  return {
    session,
    summary,
    usersById: mock.users.reduce((target, user) => {
      target[user._id] = user;
      return target;
    }, {}),
  };
}

async function getOrderDetail(orderId) {
  if (!getAppConfig().useMock) {
    const space = getAppConfig().currentSpace;
    return callAppApi('getOrderDetail', {
      space_id: space && space._id,
      order_id: orderId,
    });
  }
  const order = mock.orders.find((item) => item._id === orderId) || mock.orders[0];
  const versions = mock.orderVersions.filter((item) => item.order_id === order._id);
  const detail = await getMenuSessionDetail(order.menu_session_id);
  return { order, versions, ...detail };
}

async function createSpace(data) {
  if (!getAppConfig().useMock) {
    return callAppApi('createSpace', data);
  }
  wx.showToast({ title: 'Mock 模式未写入', icon: 'none' });
  return null;
}

async function joinSpace(inviteCode) {
  if (!getAppConfig().useMock) {
    return callAppApi('joinSpace', { invite_code: inviteCode });
  }
  wx.showToast({ title: 'Mock 模式未写入', icon: 'none' });
  return null;
}

async function updateMemberRole(data) {
  if (!getAppConfig().useMock) {
    return callAppApi('updateMemberRole', data);
  }
  wx.showToast({ title: 'Mock 模式未写入', icon: 'none' });
  return null;
}

async function createDish(data) {
  if (!getAppConfig().useMock) {
    return callAppApi('createDish', data);
  }
  wx.showToast({ title: 'Mock 模式未写入', icon: 'none' });
  return null;
}

async function updateDish(data) {
  if (!getAppConfig().useMock) {
    return callAppApi('updateDish', data);
  }
  wx.showToast({ title: 'Mock 模式未写入', icon: 'none' });
  return null;
}

async function createMenuSession(data) {
  if (!getAppConfig().useMock) {
    return callAppApi('createMenuSession', data);
  }
  wx.showToast({ title: 'Mock 模式未写入', icon: 'none' });
  return null;
}

async function addDishToMenu(data) {
  if (!getAppConfig().useMock) {
    return callAppApi('addDishToMenu', data);
  }
  wx.showToast({ title: 'Mock 模式未写入', icon: 'none' });
  return null;
}

async function updateMyMenuItemQuantity(data) {
  if (!getAppConfig().useMock) {
    return callAppApi('updateMyMenuItemQuantity', data);
  }
  wx.showToast({ title: 'Mock 模式未写入', icon: 'none' });
  return null;
}

async function submitMenuSession(data) {
  if (!getAppConfig().useMock) {
    return callAppApi('submitMenuSession', data);
  }
  wx.showToast({ title: 'Mock 模式未写入', icon: 'none' });
  return null;
}

async function confirmDishAvailability(data) {
  if (!getAppConfig().useMock) {
    return callAppApi('confirmDishAvailability', data);
  }
  wx.showToast({ title: 'Mock 模式未写入', icon: 'none' });
  return null;
}

module.exports = {
  login,
  listSpaces,
  getSpace,
  listMembers,
  listDishes,
  listMenuSessions,
  getMenuSessionDetail,
  getOrderDetail,
  getUserName,
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
};
