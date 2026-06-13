const api = require('../../services/api');
const { sessionStatusText, confirmStatusText } = require('../../utils/status');

function formatUserQuantities(byUser, usersById) {
  return Object.entries(byUser)
    .map(([userId, quantity]) => `${usersById[userId] ? usersById[userId].nickname : userId} x${quantity}`)
    .join('，');
}

Page({
  data: {
    menuSessionId: '',
    session: {},
    statusText: '',
    summary: { original: {}, final: {}, items: [] },
    items: [],
    dishes: [],
  },

  async onLoad(options) {
    const menuSessionId = options.menuSessionId || 'session-1';
    const detail = await api.getMenuSessionDetail(menuSessionId);
    const space = getApp().globalData.currentSpace || { _id: detail.session.space_id };
    const dishes = await api.listDishes(space._id);
    const items = detail.summary.items.map((item) => ({
      ...item,
      originalUserText: formatUserQuantities(item.original_by_user, detail.usersById),
      confirmText: `厨师确认：${confirmStatusText(item.confirmation.status)}`,
    }));

    this.setData({
      menuSessionId,
      session: detail.session,
      statusText: sessionStatusText(detail.session.status),
      summary: detail.summary,
      items,
      dishes,
    });
  },

  goChefConfirm() {
    wx.navigateTo({ url: `/pages/chef-confirm/chef-confirm?menuSessionId=${this.data.menuSessionId}` });
  },

  submitSession() {
    const space = getApp().globalData.currentSpace;
    api.submitMenuSession({
      space_id: space && space._id,
      menu_session_id: this.data.menuSessionId,
    }).then((result) => {
      if (result && result.version) {
        wx.showToast({ title: '已提交', icon: 'success' });
      }
    });
  },

  async addDish(event) {
    const space = getApp().globalData.currentSpace;
    const result = await api.addDishToMenu({
      space_id: space && space._id,
      menu_session_id: this.data.menuSessionId,
      dish_id: event.currentTarget.dataset.id,
      quantity: 1,
    });
    if (result && result.entry) {
      wx.showToast({ title: '已添加', icon: 'success' });
      this.onLoad({ menuSessionId: this.data.menuSessionId });
    }
  },
});
