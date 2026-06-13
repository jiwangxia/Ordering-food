const api = require('../../services/api');
const { sessionStatusText } = require('../../utils/status');

Page({
  data: {
    spaceId: '',
    sessions: [],
    newSessionName: '',
    newSessionDescription: '',
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

  handleSessionName(event) {
    this.setData({ newSessionName: event.detail.value });
  },

  handleSessionDescription(event) {
    this.setData({ newSessionDescription: event.detail.value });
  },

  async createSession() {
    if (!this.data.newSessionName.trim()) {
      wx.showToast({ title: '请填写点单局名称', icon: 'none' });
      return;
    }
    const result = await api.createMenuSession({
      space_id: this.data.spaceId,
      name: this.data.newSessionName.trim(),
      description: this.data.newSessionDescription.trim(),
    });
    if (result && result.menu_session) {
      wx.navigateTo({ url: `/pages/menu-session-detail/menu-session-detail?menuSessionId=${result.menu_session._id}` });
    }
  },
});
