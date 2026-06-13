const assert = require('node:assert/strict');
const test = require('node:test');

const { createAppApi } = require('../cloudfunctions/appApi/core');
const { createMemoryDatabase } = require('./helpers/memoryDatabase');

test('login creates and updates a user by openid', async () => {
  const db = createMemoryDatabase();
  const api = createAppApi({ db, now: () => '2026-06-13T10:00:00.000Z' });

  const created = await api.login({
    openid: 'openid-a',
    data: { nickname: '阿夏', avatar_url: 'cloud://avatar-a' },
  });
  const updated = await api.login({
    openid: 'openid-a',
    data: { nickname: '阿夏新名字', avatar_url: 'cloud://avatar-b' },
  });

  assert.equal(created.user.openid, 'openid-a');
  assert.equal(updated.user._id, created.user._id);
  assert.equal(updated.user.nickname, '阿夏新名字');
  assert.equal(db.dump().users.length, 1);
});

test('createSpace creates owner membership and joinSpace adds member by invite code', async () => {
  const db = createMemoryDatabase();
  const api = createAppApi({
    db,
    now: () => '2026-06-13T10:00:00.000Z',
    inviteCode: () => 'MENU88',
  });

  const owner = await api.login({ openid: 'owner-openid', data: { nickname: '主人' } });
  const member = await api.login({ openid: 'member-openid', data: { nickname: '朋友' } });
  const spaceResult = await api.createSpace({
    openid: 'owner-openid',
    data: { name: '周末饭局', description: '朋友一起点菜', currency_name: '饭票' },
  });
  const joinResult = await api.joinSpace({
    openid: 'member-openid',
    data: { invite_code: 'MENU88' },
  });

  assert.equal(spaceResult.space.owner_id, owner.user._id);
  assert.equal(spaceResult.member.role, 'owner');
  assert.equal(joinResult.space._id, spaceResult.space._id);
  assert.equal(joinResult.member.user_id, member.user._id);
  assert.equal(joinResult.member.role, 'member');
  assert.equal(db.dump().space_members.length, 2);
});

test('submitMenuSession creates an order version snapshot with final totals', async () => {
  const db = createMemoryDatabase();
  const api = createAppApi({
    db,
    now: () => '2026-06-13T10:00:00.000Z',
    inviteCode: () => 'MENU88',
  });

  await api.login({ openid: 'owner-openid', data: { nickname: '阿夏' } });
  await api.login({ openid: 'chef-openid', data: { nickname: '小陆' } });
  const { space } = await api.createSpace({
    openid: 'owner-openid',
    data: { name: '周末饭局', currency_name: '饭票' },
  });
  await api.joinSpace({ openid: 'chef-openid', data: { invite_code: 'MENU88' } });
  const chef = db.dump().users.find((user) => user.openid === 'chef-openid');
  await api.updateMemberRole({
    openid: 'owner-openid',
    data: { space_id: space._id, user_id: chef._id, role: 'chef' },
  });
  const dish = await api.createDish({
    openid: 'owner-openid',
    data: { space_id: space._id, name: '可乐鸡翅', price: 20 },
  });
  const session = await api.createMenuSession({
    openid: 'owner-openid',
    data: { space_id: space._id, name: '周六晚饭' },
  });
  await api.addDishToMenu({
    openid: 'owner-openid',
    data: { space_id: space._id, menu_session_id: session.menu_session._id, dish_id: dish.dish._id, quantity: 2 },
  });
  await api.confirmDishAvailability({
    openid: 'chef-openid',
    data: {
      space_id: space._id,
      menu_session_id: session.menu_session._id,
      dish_id: dish.dish._id,
      status: 'partial',
      available_quantity: 1,
    },
  });

  const orderResult = await api.submitMenuSession({
    openid: 'owner-openid',
    data: { space_id: space._id, menu_session_id: session.menu_session._id },
  });

  assert.equal(orderResult.version.version_no, 1);
  assert.equal(orderResult.version.snapshot.final.total_quantity, 1);
  assert.equal(orderResult.version.snapshot.final.total_amount, 20);
  assert.equal(db.dump().orders.length, 1);
  assert.equal(db.dump().order_versions.length, 1);
});
