const api = require('../../services/api');

Page({
  data: {
    spaces: [],
  },

  async onLoad() {
    const spaces = await api.listSpaces();
    this.setData({ spaces });
  },

  openSpace(event) {
    const spaceId = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/space-home/space-home?spaceId=${spaceId}` });
  },
});
