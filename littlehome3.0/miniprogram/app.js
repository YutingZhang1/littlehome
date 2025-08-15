// app.js
App({
  globalData: {
    account: null
  },
  getAccount() {
    // 优先取 globalData，其次取本地缓存
    return this.globalData.account || wx.getStorageSync('account');
  },
  onLaunch: function () {
    wx.cloud.init({
      env: 'cloud1-5g30intxfa8cc454',
        traceUser: true
      });
      wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getOpenId'
      },
        success: res => {
        // 兼容两种返回结构
        const openid = res.result.openid || (res.result.userInfo && res.result.userInfo.openId);
          console.log('openid:', openid);
          wx.setStorageSync('account', openid);
        this.globalData.account = openid; // 设置全局变量
        },
        fail: err => {
          console.error('获取openid失败', err);
        }
      });
  }
});
