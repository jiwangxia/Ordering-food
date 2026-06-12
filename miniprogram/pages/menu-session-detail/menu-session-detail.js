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
  },

  async onLoad(options) {
    const menuSessionId = options.menuSessionId || 'session-1';
    const detail = await api.getMenuSessionDetail(menuSessionId);
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
    });
  },

  goChefConfirm() {
    wx.navigateTo({ url: `/pages/chef-confirm/chef-confirm?menuSessionId=${this.data.menuSessionId}` });
  },

  submitSession() {
    wx.showToast({ title: '已预留提交接口', icon: 'none' });
  },
});
