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

async function callCloud(name, data = {}) {
  if (getAppConfig().useMock) {
    throw new Error('Mock mode uses local service methods');
  }
  const result = await wx.cloud.callFunction({ name, data });
  return result.result;
}

async function login() {
  if (!getAppConfig().useMock) {
    return callCloud('login');
  }
  const currentUser = mock.users[0];
  getApp().globalData.currentUser = currentUser;
  return currentUser;
}

async function listSpaces() {
  if (!getAppConfig().useMock) {
    return callCloud('listSpaces');
  }
  return mock.spaces;
}

async function getSpace(spaceId) {
  return mock.spaces.find((space) => space._id === spaceId) || mock.spaces[0];
}

async function listMembers(spaceId) {
  return mock.members
    .filter((member) => member.space_id === spaceId)
    .map((member) => ({
      ...member,
      user: mock.users.find((user) => user._id === member.user_id),
    }));
}

async function listDishes(spaceId, keyword = '') {
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
  return mock.menuSessions.filter((session) => session.space_id === spaceId);
}

async function getMenuSessionDetail(menuSessionId) {
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
  const order = mock.orders.find((item) => item._id === orderId) || mock.orders[0];
  const versions = mock.orderVersions.filter((item) => item.order_id === order._id);
  const detail = await getMenuSessionDetail(order.menu_session_id);
  return { order, versions, ...detail };
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
};
