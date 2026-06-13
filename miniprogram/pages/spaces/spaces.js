const api = require('../../services/api');

Page({
  data: {
    spaces: [],
    newSpaceName: '',
    newSpaceDescription: '',
    currencyName: '饭票',
    inviteCode: '',
  },

  async onLoad() {
    const spaces = await api.listSpaces();
    this.setData({ spaces });
  },

  openSpace(event) {
    const spaceId = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/space-home/space-home?spaceId=${spaceId}` });
  },

  handleNewSpaceName(event) {
    this.setData({ newSpaceName: event.detail.value });
  },

  handleNewSpaceDescription(event) {
    this.setData({ newSpaceDescription: event.detail.value });
  },

  handleCurrencyName(event) {
    this.setData({ currencyName: event.detail.value });
  },

  handleInviteCode(event) {
    this.setData({ inviteCode: event.detail.value });
  },

  async createSpace() {
    if (!this.data.newSpaceName.trim()) {
      wx.showToast({ title: '请填写空间名称', icon: 'none' });
      return;
    }
    const result = await api.createSpace({
      name: this.data.newSpaceName.trim(),
      description: this.data.newSpaceDescription.trim(),
      currency_name: this.data.currencyName.trim() || '饭票',
    });
    if (result && result.space) {
      wx.navigateTo({ url: `/pages/space-home/space-home?spaceId=${result.space._id}` });
    }
  },

  async joinSpace() {
    if (!this.data.inviteCode.trim()) {
      wx.showToast({ title: '请填写邀请码', icon: 'none' });
      return;
    }
    const result = await api.joinSpace(this.data.inviteCode.trim());
    if (result && result.space) {
      wx.navigateTo({ url: `/pages/space-home/space-home?spaceId=${result.space._id}` });
    }
  },
});
