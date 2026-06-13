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

  setStatus(event) {
    const index = event.currentTarget.dataset.index;
    const status = event.currentTarget.dataset.status;
    this.setData({
      [`items[${index}].confirmation.status`]: status,
      [`items[${index}].confirmText`]: confirmStatusText(status),
    });
  },

  handleQuantity(event) {
    const index = event.currentTarget.dataset.index;
    this.setData({ [`items[${index}].confirmation.available_quantity`]: Number(event.detail.value || 0) });
  },

  handleNote(event) {
    const index = event.currentTarget.dataset.index;
    this.setData({ [`items[${index}].confirmation.note`]: event.detail.value });
  },

  async saveConfirmations() {
    const space = getApp().globalData.currentSpace;
    for (const item of this.data.items) {
      await api.confirmDishAvailability({
        space_id: space && space._id,
        menu_session_id: this.data.menuSessionId,
        dish_id: item.dish._id,
        status: item.confirmation.status || 'available',
        available_quantity: item.confirmation.available_quantity || item.original_total_quantity,
        note: item.confirmation.note || '',
      });
    }
    wx.showToast({ title: '已保存', icon: 'success' });
  },
});
