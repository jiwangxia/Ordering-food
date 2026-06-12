const api = require('../../services/api');

Page({
  async handleLogin() {
    await api.login();
    wx.redirectTo({ url: '/pages/spaces/spaces' });
  },
});
