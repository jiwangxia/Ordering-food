const api = require('../../services/api');

Page({
  data: {
    spaceId: '',
    space: {},
  },

  async onLoad(options) {
    const spaceId = options.spaceId || 'space-1';
    const space = await api.getSpace(spaceId);
    getApp().globalData.currentSpace = space;
    this.setData({ spaceId, space });
  },

  goDishes() {
    wx.navigateTo({ url: `/pages/dishes/dishes?spaceId=${this.data.spaceId}` });
  },

  goSessions() {
    wx.navigateTo({ url: `/pages/menu-sessions/menu-sessions?spaceId=${this.data.spaceId}` });
  },

  goMembers() {
    wx.navigateTo({ url: `/pages/members/members?spaceId=${this.data.spaceId}` });
  },

  goOrder() {
    wx.navigateTo({ url: '/pages/order-detail/order-detail?orderId=order-1' });
  },
});
