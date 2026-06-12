const api = require('../../services/api');

Page({
  data: {
    members: [],
  },

  async onLoad(options) {
    const members = await api.listMembers(options.spaceId || 'space-1');
    this.setData({ members });
  },
});
