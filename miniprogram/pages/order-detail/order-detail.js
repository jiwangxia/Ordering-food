const api = require('../../services/api');

Page({
  data: {
    order: {},
    versions: [],
    items: [],
  },

  async onLoad(options) {
    const detail = await api.getOrderDetail(options.orderId || 'order-1');
    this.setData({
      order: detail.order,
      versions: detail.versions,
      items: detail.summary.items,
    });
  },
});
