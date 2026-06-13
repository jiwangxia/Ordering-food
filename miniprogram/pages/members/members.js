const api = require('../../services/api');

Page({
  data: {
    spaceId: '',
    members: [],
  },

  async onLoad(options) {
    const spaceId = options.spaceId || 'space-1';
    const members = await api.listMembers(spaceId);
    this.setData({ spaceId, members });
  },

  async setRole(event) {
    const result = await api.updateMemberRole({
      space_id: this.data.spaceId,
      user_id: event.currentTarget.dataset.userId,
      role: event.currentTarget.dataset.role,
    });
    if (result && result.member) {
      wx.showToast({ title: '已更新', icon: 'success' });
      this.onLoad({ spaceId: this.data.spaceId });
    }
  },
});
