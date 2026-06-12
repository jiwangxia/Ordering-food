App({
  globalData: {
    envId: '',
    useMock: true,
    currentUser: null,
    currentSpace: null,
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
