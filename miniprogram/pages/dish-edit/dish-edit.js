const api = require('../../services/api');

Page({
  data: {
    spaceId: '',
    name: '',
    price: '',
    ingredients: '',
    description: '',
    imageFileId: '',
  },

  onLoad(options) {
    this.setData({ spaceId: options.spaceId || 'space-1' });
  },

  handleName(event) {
    this.setData({ name: event.detail.value });
  },

  handlePrice(event) {
    this.setData({ price: event.detail.value });
  },

  handleIngredients(event) {
    this.setData({ ingredients: event.detail.value });
  },

  handleDescription(event) {
    this.setData({ description: event.detail.value });
  },

  async chooseImage() {
    const chooseResult = await wx.chooseMedia({ count: 1, mediaType: ['image'] });
    const filePath = chooseResult.tempFiles[0].tempFilePath;
    if (getApp().globalData.useMock) {
      this.setData({ imageFileId: filePath });
      return;
    }
    const uploadResult = await wx.cloud.uploadFile({
      cloudPath: `dishes/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`,
      filePath,
    });
    this.setData({ imageFileId: uploadResult.fileID });
  },

  async saveDish() {
    if (!this.data.name.trim()) {
      wx.showToast({ title: '请填写菜名', icon: 'none' });
      return;
    }
    const result = await api.createDish({
      space_id: this.data.spaceId,
      name: this.data.name.trim(),
      image_file_id: this.data.imageFileId,
      price: Number(this.data.price || 0),
      ingredients: this.data.ingredients.trim(),
      description: this.data.description.trim(),
    });
    if (result && result.dish) {
      wx.navigateBack();
    }
  },
});
