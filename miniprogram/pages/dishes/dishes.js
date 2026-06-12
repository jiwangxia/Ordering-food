const api = require('../../services/api');

Page({
  data: {
    spaceId: '',
    keyword: '',
    dishes: [],
  },

  async onLoad(options) {
    const spaceId = options.spaceId || 'space-1';
    this.setData({ spaceId });
    await this.loadDishes();
  },

  async loadDishes() {
    const dishes = await api.listDishes(this.data.spaceId, this.data.keyword);
    this.setData({ dishes });
  },

  async handleKeywordInput(event) {
    this.setData({ keyword: event.detail.value });
    await this.loadDishes();
  },

  createDish() {
    wx.navigateTo({ url: `/pages/dish-edit/dish-edit?spaceId=${this.data.spaceId}` });
  },
});
