const api = require('../../services/api');
const { sessionStatusText } = require('../../utils/status');

Page({
  data: {
    spaceId: '',
    sessions: [],
  },

  async onLoad(options) {
    const spaceId = options.spaceId || 'space-1';
    const sessions = (await api.listMenuSessions(spaceId)).map((session) => ({
      ...session,
      statusText: sessionStatusText(session.status),
    }));
    this.setData({ spaceId, sessions });
  },

  openSession(event) {
    wx.navigateTo({ url: `/pages/menu-session-detail/menu-session-detail?menuSessionId=${event.currentTarget.dataset.id}` });
  },
});
