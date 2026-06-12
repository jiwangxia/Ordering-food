const api = require('../../services/api');
const { confirmStatusText } = require('../../utils/status');

Page({
  data: {
    menuSessionId: '',
    items: [],
  },

  async onLoad(options) {
    const menuSessionId = options.menuSessionId || 'session-1';
    const detail = await api.getMenuSessionDetail(menuSessionId);
    const items = detail.summary.items.map((item) => ({
      ...item,
      confirmText: confirmStatusText(item.confirmation.status),
    }));
    this.setData({ menuSessionId, items });
  },

  saveConfirmations() {
    wx.showToast({ title: '已预留确认接口', icon: 'none' });
  },
});
