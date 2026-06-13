App({
  globalData: {
    envId: 'cloud1-d7ghg1h5w0a2aea57',
    useMock: false,
    currentUser: null,
    currentSpace: null,
    pendingProfile: null,
  },

  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: this.globalData.envId || undefined,
        traceUser: true,
      });
    }
  },
});
