// pages/center/center.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoggedIn: false,
    userInfo: {
      avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg',
      nickName: ''
    },
    points: 520,
    loginShow: false,
    modal: {
      title: '用户登录',
      content: '授权登录后，开始使用完整功能',
      confirmText: '登录',
      cancelText: '取消'
    },
    hasClockIn: false,
    selectedMood: '',
    showMoodPicker: false,
    showDiceResult: false,
    diceNumber: 0,
    diceResult: '',
    showHomework: false,
    cityData: {
      education: [
        { name: '成都', value: 92.27 },
        { name: '武汉', value: 92.56 },
        { name: '郑州', value: 86.57 },
        { name: '杭州', value: 82.45 },
        { name: '宁波', value: 86.62 }
      ],
      health: [
        { name: '青岛', value: 88.94 },
        { name: '长沙', value: 92.75 },
        { name: '西安', value: 77.42 },
        { name: '重庆', value: 59.86 }
      ],
      house: [
        { name: '合肥', value: 67.51 },
        { name: '苏州', value: 59.61 },
        { name: '天津', value: 53.73 }
      ],
      society: [
        { name: '东莞', value: 89.08 },
        { name: '无锡', value: 51.35 },
        { name: '深圳', value: 73.71 },
        { name: '南京', value: 57.69 },
        { name: '上海', value: 73.48 },
        { name: '广州', value: 50.43 },
        { name: '北京', value: 57.87 }
      ]
    },
    categoryColors: {
      education: '#8B9CFF',
      health: '#36E2BE',
      house: '#95F959',
      society: '#FF6B8B'
    },
    categoryNames: {
      education: '教育',
      health: '健康',
      house: '住房',
      society: '社会'
    },
    anniversaries: [], // 纪念日列表
    // 新增：主动注册相关
    registerNickName: '',
    registerAvatarUrl: '',
    openid: '', // 新增：当前用户openid
    showRegisterModal: false, // 新增：注册弹窗显示

    // 隐私保护相关
    showPrivacySettingsModal: false,
    privacySettings: {
      emotionAnalysis: true,
      textEmotionAnalysis: true,
      voiceEmotionAnalysis: true,
      mediaEmotionAnalysis: true,
      conversationStorage: true,
      mediaStorage: true,
      locationTracking: false,
      privacyTime: false,
      burnAfterRead: false
    },
    shareImageUrl: '', // 新增：分享图片URL

    // 登录相关
    showLoginModal: false,
    tempAvatarUrl: '',
    tempAvatarFileID: '',  // 新增：存储头像的 fileID
    tempNickName: '',

    showEditUserModal: false,
    editAvatarFileID: '', // 新增，存 fileID
    editAvatarUrl: '',    // 展示用
    editNickName: '',
    editGender: 'unknown',


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 等待OpenID获取完成后再初始化用户信息
    this.waitForOpenIDAndInitUser();
    
    // 延迟预生成分享图片
    setTimeout(() => {
      this.generateShareImage();
    }, 1000);
    this.refreshAvatarUrlFromFileID();
  },

  // 刷新头像链接
  refreshAvatarUrlFromFileID() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.avatarFileID) {
      // 检查 fileID 格式
      if (!userInfo.avatarFileID.startsWith('cloud://')) {
        const updatedUserInfo = {
          ...userInfo,
          avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg'
        };
        this.setData({
          userInfo: updatedUserInfo
        });
        return;
      }
      wx.cloud.getTempFileURL({
        fileList: [userInfo.avatarFileID],
        success: urlRes => {
          if (urlRes.fileList && urlRes.fileList.length > 0) {
            const fileInfo = urlRes.fileList[0];
            if (fileInfo && fileInfo.tempFileURL && fileInfo.tempFileURL.trim() !== '' && (!fileInfo.status || fileInfo.status === 0)) {
              const updatedUserInfo = {
                ...userInfo,
                avatarUrl: fileInfo.tempFileURL
              };
              this.setData({
                userInfo: updatedUserInfo
              });
              // 更新本地存储
              wx.setStorageSync('userInfo', updatedUserInfo);
            } else {
              // 如果获取失败，使用默认头像
              const updatedUserInfo = {
                ...userInfo,
                avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg'
              };
              this.setData({
                userInfo: updatedUserInfo
              });
            }
          } else {
            // 如果获取失败，使用默认头像
            const updatedUserInfo = {
              ...userInfo,
              avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg'
            };
            this.setData({
              userInfo: updatedUserInfo
            });
          }
        },
        fail: err => {
          // 如果获取失败，使用默认头像
          const updatedUserInfo = {
            ...userInfo,
            avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg'
          };
          this.setData({
            userInfo: updatedUserInfo
          });
        }
      });
    }
  },

  // 等待OpenID获取完成并初始化用户信息
  waitForOpenIDAndInitUser() {
    const maxAttempts = 10; // 最大尝试次数
    let attempts = 0;
    
    const checkOpenID = () => {
      attempts++;
      const openid = getApp().getAccount();
      
      if (openid) {
        // OpenID已获取，执行用户信息初始化
        this.getUserInfo();
        this.loadPoints();
        this.checkClockInStatus();
      } else if (attempts < maxAttempts) {
        // 继续等待
        setTimeout(checkOpenID, 500);
      } else {
        // 超时后使用默认状态
        this.setData({ 
          isLoggedIn: false,
          userInfo: {
            avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg',
            nickName: ''
          },
          points: 520,
          openid: ''
        });
      }
    };
    
    // 开始检查
    checkOpenID();
  },

  // 获取用户信息
  getUserInfo() {
    const openid = getApp().getAccount();
    if (!openid) {
      return;
    }
    
    this.setData({ openid });
    
    // 检查本地缓存的登录状态
    const isLoggedIn = wx.getStorageSync('isLoggedIn') || false;
    const userInfo = wx.getStorageSync('userInfo') || {
      avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg',
      nickName: ''
    };
    
    this.setData({
      isLoggedIn,
      userInfo,
      points: wx.getStorageSync('points') || 520
    });
    
    // 查询SCF user表，判断是否注册
    wx.request({
      url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
      method: 'GET',
      data: {
        table: 'user',
        action: 'query',
        openid
      },
      success: res => {
        wx.hideLoading();
        let result = res.data;
        if (typeof result === 'string') {
          try { result = JSON.parse(result); } catch (e) {}
        }
        if (Array.isArray(result) && result.length && result[0].avatar) {
          // 已注册
          const userInfo = {
            avatarFileID: result[0].avatar, // 只存 fileID
            nickName: result[0].nickname,
            gender: result[0].gender || 'unknown'
          };
          wx.cloud.getTempFileURL({
            fileList: [userInfo.avatarFileID],
            success: urlRes => {
              console.log('getUserInfo getTempFileURL 返回结果:', urlRes);
              if (urlRes.fileList && urlRes.fileList.length > 0) {
                const fileInfo = urlRes.fileList[0];
                if (fileInfo && fileInfo.tempFileURL && fileInfo.tempFileURL.trim() !== '' && (!fileInfo.status || fileInfo.status === 0)) {
                  userInfo.avatarUrl = fileInfo.tempFileURL;
                  this.setData({
                    isLoggedIn: true,
                    userInfo
                  });
                  wx.setStorageSync('userInfo', userInfo);
                  console.log('getUserInfo 成功获取临时链接:', fileInfo.tempFileURL);
                } else {
                  console.error('getUserInfo 文件信息中缺少 tempFileURL 或 status 不为0:', fileInfo);
                  this.setData({
                    isLoggedIn: true,
                    userInfo: {
                      ...userInfo,
                      avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg'
                    }
                  });
                }
              } else {
                console.error('getUserInfo 获取临时链接失败: fileList 为空或不存在:', urlRes);
                this.setData({
                  isLoggedIn: true,
                  userInfo: {
                    ...userInfo,
                    avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg'
                  }
                });
              }
            },
            fail: err => {
              console.error('getUserInfo 获取临时链接失败:', err);
              this.setData({
                isLoggedIn: true,
                userInfo: {
                  ...userInfo,
                  avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg'
                }
              });
            }
          });
        } else {
          // 未注册
          this.setData({
            isLoggedIn: false,
            userInfo: {
              avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg',
              nickName: '',
              gender: 'unknown'
            }
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.checkClockInStatus();
    const points = wx.getStorageSync('points') || 520;
    this.setData({ points });
    this.refreshAvatarUrlFromFileID();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    // 如果已有分享图片，直接使用；否则使用默认图片
    if (this.data.shareImageUrl) {
      return {
        title: 'LittleHome - 小管家，情侣生活管理助手',
        path: '/pages/butler/butler',
        imageUrl: this.data.shareImageUrl
      };
    } else {
      return {
        title: 'LittleHome - 小管家，情侣生活管理助手',
        path: '/pages/butler/butler',
        imageUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/share-butler.jpg'
      };
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    // 如果已有分享图片，直接使用；否则使用默认图片
    if (this.data.shareImageUrl) {
      return {
        title: 'LittleHome - 小管家，情侣生活管理助手',
        query: '',
        imageUrl: this.data.shareImageUrl
      };
    } else {
      return {
        title: 'LittleHome - 小管家，情侣生活管理助手',
        query: '',
        imageUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/share-butler.jpg'
      };
    }
  },

  // 生成分享图片
  generateShareImage() {
    const query = wx.createSelectorQuery();
    query.select('.container').boundingClientRect();
    query.exec((res) => {
      if (res[0]) {
        const rect = res[0];
        
        // 创建Canvas
        const canvas = wx.createCanvasContext('shareCanvas');
        const ctx = canvas;
        
        // 设置画布尺寸
        const canvasWidth = 300;
        const canvasHeight = 400;
        
        // 绘制背景
        ctx.setFillStyle('#FEFBF6');
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // 绘制渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, '#E6A4B4');
        gradient.addColorStop(1, '#ACD7E5');
        ctx.setFillStyle(gradient);
        ctx.fillRect(0, 0, canvasWidth, 80);
        
        // 绘制标题
        ctx.setFillStyle('#FFFFFF');
        ctx.setFontSize(18);
        ctx.setTextAlign('center');
        ctx.fillText('LittleHome', canvasWidth / 2, 30);
        ctx.fillText('小管家', canvasWidth / 2, 55);
        
        // 绘制用户信息
        if (this.data.userInfo && this.data.userInfo.nickName) {
          ctx.setFillStyle('#2C1810');
          ctx.setFontSize(14);
          ctx.setTextAlign('center');
          ctx.fillText('用户: ' + this.data.userInfo.nickName, canvasWidth / 2, 120);
        }
        
        // 绘制积分信息
        if (this.data.points !== undefined) {
          ctx.setFillStyle('#E6A4B4');
          ctx.setFontSize(16);
          ctx.setTextAlign('center');
          ctx.fillText('积分: ' + this.data.points, canvasWidth / 2, 150);
        }
        
        // 绘制打卡状态
        if (this.data.hasClockIn) {
          ctx.setFillStyle('#36E2BE');
          ctx.setFontSize(12);
          ctx.setTextAlign('center');
          ctx.fillText('今日已打卡', canvasWidth / 2, 180);
        }
        
        // 绘制装饰元素
        ctx.setFillStyle('#E6A4B4');
        ctx.beginPath();
        ctx.arc(50, 200, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(canvasWidth - 50, 200, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // 绘制底部装饰
        ctx.setFillStyle('#ACD7E5');
        ctx.fillRect(0, canvasHeight - 40, canvasWidth, 40);
        
        ctx.setFillStyle('#FFFFFF');
        ctx.setFontSize(10);
        ctx.setTextAlign('center');
        ctx.fillText('扫码体验 LittleHome', canvasWidth / 2, canvasHeight - 20);
        
        // 绘制到Canvas
        ctx.draw(false, () => {
          // 将Canvas转换为图片
          wx.canvasToTempFilePath({
            canvasId: 'shareCanvas',
            success: (res) => {
              this.setData({
                shareImageUrl: res.tempFilePath
              });
              console.log('分享图片生成成功:', res.tempFilePath);
            },
            fail: (err) => {
              console.error('分享图片生成失败:', err);
            }
          });
        });
      }
    });
  },

  // 加载积分信息
  loadPoints() {
    const points = wx.getStorageSync('points') || 520;
    this.setData({ points });
  },

  // 检查今日打卡状态
  checkClockInStatus() {
    const today = new Date().toDateString();
    const clockInDate = wx.getStorageSync('clockInDate');
    
    if (clockInDate === today) {
      this.setData({ hasClockIn: true });
    } else {
      this.setData({ hasClockIn: false });
    }
  },

  clockIn() {
    const today = new Date().toISOString().split('T')[0];
    const lastClockInDate = wx.getStorageSync('lastClockInDate');
    
    if (lastClockInDate && lastClockInDate === today) {
      wx.showToast({
        title: '今天已经打过卡了哦',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 保存打卡记录
    wx.setStorageSync('lastClockInDate', today);
    
    // 保存打卡历史记录
    const clockInHistory = wx.getStorageSync('clockInHistory') || [];
    if (!clockInHistory.includes(today)) {
      clockInHistory.push(today);
      wx.setStorageSync('clockInHistory', clockInHistory);
    }
    
    // 获取当前积分
    let points = this.data.points + 52;
    
    // 保存新的积分
    wx.setStorageSync('points', points);
    
    this.setData({
      hasClockIn: true,
      points
    });
    
    wx.showToast({
      title: '打卡成功！获得52积分',
      icon: 'none',
      duration: 2000
    });
  },



  goToSouvenirs() {
    wx.navigateTo({
      url: '/pages/souvenirs/souvenirs'
    });
  },

  goToAnniversary() {
    wx.navigateTo({
      url: '/pages/daily-record/daily-record',
    });
  },

  showMoodPicker() {
    this.setData({ showMoodPicker: true })
  },

  hideMoodPicker() {
    this.setData({ showMoodPicker: false })
  },

  selectMood(e) {
    const index = e.currentTarget.dataset.index;
    const moodUrl = `emotion${index}.png`;
    const today = new Date().toISOString().split('T')[0];
    
    // 保存心情记录
    const moodRecords = wx.getStorageSync('moodRecords') || {};
    moodRecords[today] = moodUrl;
    wx.setStorageSync('moodRecords', moodRecords);
    
    // 增加积分
    const points = this.data.points + 10;
    wx.setStorageSync('points', points);
    
    this.setData({
      selectedMood: `https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/emotion/${moodUrl}`,
      showMoodPicker: false,
      points
    });
    
    wx.showToast({
      title: '记录成功 +10分',
      icon: 'success'
    });
  },

  openMiHome() {
    wx.showToast({
      title: '功能开发中...',
      icon: 'none',
      duration: 2000
    });
  },

  rollDiceForLaundry() {
    this.rollDice('洗衣')
  },

  rollDiceForCleaning() {
    this.rollDice('扫地')
  },

  rollDice(type) {
    const number = Math.floor(Math.random() * 6) + 1;
    const person = number <= 3 ? '老公' : '老婆';
    
    // 如果是老婆做家务，增加积分
    if (person === '老婆') {
      const points = this.data.points + 10;
      this.setData({ points });
      wx.setStorageSync('points', points);
    }
    
    this.setData({
      showDiceResult: true,
      diceNumber: number,
      diceResult: `今天该${person}${type}`
    });
  },

  hideDiceResult() {
    this.setData({ showDiceResult: false })
  },

  goToDailyRecord() {
    wx.navigateTo({
      url: '/pages/daily-record/daily-record'
    });
  },

  // 获取保存的图片列表
  getSavedImages() {
    return wx.getStorageSync('savedHomeworkImages') || [];
  },
  
  // 删除保存的图片
  deleteSavedImage(fileName) {
    const fs = wx.getFileSystemManager();
    const savedImages = this.getSavedImages();
    const imageInfo = savedImages.find(img => img.fileName === fileName);
    
    if (imageInfo) {
      try {
        fs.unlinkSync(imageInfo.path);
        const newSavedImages = savedImages.filter(img => img.fileName !== fileName);
        wx.setStorageSync('savedHomeworkImages', newSavedImages);
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  },

  // 辅助函数：获取颜色的亮版本
  getLighterColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return `#${(0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1)}`;
  },

  showLogin() {
    this.setData({ loginShow: true });
  },

  loginSuccess(e) {
    this.setData({ loginShow: false });
    const info = e.detail.res;
    const userInfo = {
      avatarUrl: info.avatarUrl,
      nickName: info.nickName
    };
    this.setData({
      isLoggedIn: true,
      userInfo,
      points: 520 // 登录后分配默认分数
    });
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('points', 520);
    // 可调用云函数/后端注册接口
    wx.cloud.callFunction({
      name: 'userRegister',
      data: {
        openid: info.openid,
        nickname: info.nickName,
        avatar: info.avatarUrl
      }
    });
  },

  loginFail() {
    wx.hideLoading();
    wx.showToast({ title: '登录失败', icon: 'none' });
    this.setData({ loginShow: false });
  },

  loginCancel() {
    wx.hideLoading();
    wx.showToast({ title: '已取消登录', icon: 'none' });
    this.setData({
      loginShow: false,
      isLoggedIn: false,
      userInfo: {
        avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg',
        nickName: '未登录'
      },
      points: 520
    });
    wx.setStorageSync('userInfo', {
      avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg',
      nickName: '未登录'
    });
    wx.setStorageSync('points', 520);
  },

  // 主动注册相关方法
  onRegisterNickNameInput(e) {
    this.setData({ registerNickName: e.detail.value });
  },
  onRegisterAvatarUrlInput(e) {
    this.setData({ registerAvatarUrl: e.detail.value });
  },
  // 显示注册弹窗
  showRegisterModal() {
    this.setData({ showRegisterModal: true });
  },
  // 关闭注册弹窗
  hideRegisterModal() {
    this.setData({ showRegisterModal: false });
  },
  
  // 注册时选择头像
  onRegisterAvatarChoose(e) {
    const { avatarUrl } = e.detail;
    wx.showLoading({ title: '正在上传头像...' });
    const cloudPath = 'avatar/' + Date.now() + '_' + Math.floor(Math.random()*100000) + '.jpg';
    console.log('上传头像 cloudPath:', cloudPath, '本地路径:', avatarUrl);
    wx.cloud.uploadFile({
      cloudPath,
      filePath: avatarUrl,
      success: res => {
        console.log('上传成功 fileID:', res.fileID);
        wx.cloud.getTempFileURL({
          fileList: [res.fileID],
          success: urlRes => {
            wx.hideLoading();
            const httpsUrl = urlRes.fileList[0].tempFileURL;
            console.log('头像 HTTPS 链接:', httpsUrl);
            this.setData({ registerAvatarUrl: httpsUrl });
            wx.showToast({ title: '头像上传成功', icon: 'success' });
          },
          fail: err => {
            wx.hideLoading();
            console.error('获取头像链接失败:', err);
            wx.showToast({ title: '获取头像链接失败', icon: 'none' });
          }
        });
      },
      fail: err => {
        wx.hideLoading();
        console.error('头像上传失败:', err);
        wx.showToast({ title: '头像上传失败', icon: 'none' });
      }
    });
  },
  // 提交注册
  onRegisterUser() {
    const { openid, registerNickName, registerAvatarUrl } = this.data;
    if (!registerNickName || !registerAvatarUrl) {
      wx.showToast({ title: '请填写昵称和选择头像', icon: 'none' });
      return;
    }
    if (!/^https:\/\//.test(registerAvatarUrl)) {
      wx.showToast({
        title: '请等待头像上传完成',
        icon: 'none'
      });
      return;
    }
    wx.showLoading({ title: '正在注册...' });
    
    // 先获取绑定码，再注册
    this.getBindingCode(openid, (bindingCode) => {
      wx.request({
        url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
        method: 'GET',
        data: {
          table: 'user',
          action: 'add',
          openid,
          nickname: registerNickName,
          avatar: registerAvatarUrl,
          binding_code: bindingCode
        },
        success: res => {
          wx.hideLoading();
          console.log('注册接口返回:', res);
          let result = res.data;
          if (typeof result === 'string') {
            try { result = JSON.parse(result); } catch (e) {}
          }
          if (
            (result && (result.id || result.affectedRows || result.success)) ||
            (result && result.code === 0) ||
            (result && result.data === true) ||
            (result && result.message && result.message.includes('成功')) ||
            (result && !result.error && !result.errMsg)
          ) {
            wx.showToast({ title: '注册成功', icon: 'success' });
            this.setData({
              isLoggedIn: true,
              userInfo: {
                avatarUrl: registerAvatarUrl,
                nickName: registerNickName,
                binding_code: bindingCode
              },
              showRegisterModal: false
            });
            wx.setStorageSync('userInfo', {
              avatarUrl: registerAvatarUrl,
              nickName: registerNickName,
              binding_code: bindingCode
            });
          } else {
            wx.showToast({ title: '注册失败', icon: 'none' });
            console.error('注册失败 result:', result);
          }
        },
        fail: err => {
          wx.hideLoading();
          wx.showToast({ title: '网络错误', icon: 'none' });
          console.error('注册接口请求失败:', err);
        }
      });
    });
  },

  // 纪念日管理相关方法
  // 跳转到小家页面
  goToHome() {
    wx.navigateTo({ url: '/pages/my-home/my-home' });
  },

  // 隐私保护相关方法
  showPrivacySettings() {
    this.setData({
      showPrivacySettingsModal: true
    });
  },

  hidePrivacySettingsModal() {
    this.setData({
      showPrivacySettingsModal: false
    });
  },

  showDataExport() {
    wx.showModal({
      title: '数据导出',
      content: '此功能将导出您的所有数据到本地文件，包括聊天记录、照片、设置等。',
      confirmText: '导出',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.exportUserData();
        }
      }
    });
  },

  exportUserData() {
    wx.showLoading({
      title: '正在导出数据...'
    });

    // 模拟数据导出过程
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '数据导出成功',
        icon: 'success'
      });
    }, 2000);
  },

  showDataDelete() {
    wx.showModal({
      title: '删除所有数据',
      content: '此操作将永久删除您的所有数据，包括聊天记录、照片、设置等，且无法恢复。确定要继续吗？',
      confirmText: '删除',
      cancelText: '取消',
      confirmColor: '#FF5722',
      success: (res) => {
        if (res.confirm) {
          this.deleteAllData();
        }
      }
    });
  },

  deleteAllData() {
    wx.showLoading({
      title: '正在删除数据...'
    });

    // 模拟数据删除过程
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '数据删除成功',
        icon: 'success'
      });
      
      // 清除本地存储
      wx.clearStorageSync();
      
      // 重新加载页面
      this.onLoad();
    }, 2000);
  },

  showPrivacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: 'LittleHome 严格保护您和伴侣的隐私，所有数据都经过端到端加密处理。我们承诺不会向第三方分享您的个人信息，您可以随时删除所有数据。',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  // 隐私设置切换方法
  toggleEmotionAnalysis(e) {
    const value = e.detail.value;
    this.setData({
      'privacySettings.emotionAnalysis': value
    });
    this.savePrivacySettings();
  },

  toggleTextEmotionAnalysis(e) {
    const value = e.detail.value;
    this.setData({
      'privacySettings.textEmotionAnalysis': value
    });
    this.savePrivacySettings();
  },

  toggleVoiceEmotionAnalysis(e) {
    const value = e.detail.value;
    this.setData({
      'privacySettings.voiceEmotionAnalysis': value
    });
    this.savePrivacySettings();
  },

  toggleMediaEmotionAnalysis(e) {
    const value = e.detail.value;
    this.setData({
      'privacySettings.mediaEmotionAnalysis': value
    });
    this.savePrivacySettings();
  },

  toggleConversationStorage(e) {
    const value = e.detail.value;
    this.setData({
      'privacySettings.conversationStorage': value
    });
    this.savePrivacySettings();
  },

  toggleMediaStorage(e) {
    const value = e.detail.value;
    this.setData({
      'privacySettings.mediaStorage': value
    });
    this.savePrivacySettings();
  },

  toggleLocationTracking(e) {
    const value = e.detail.value;
    this.setData({
      'privacySettings.locationTracking': value
    });
    this.savePrivacySettings();
  },

  togglePrivacyTime(e) {
    const value = e.detail.value;
    this.setData({
      'privacySettings.privacyTime': value
    });
    this.savePrivacySettings();
  },

  toggleBurnAfterRead(e) {
    const value = e.detail.value;
    this.setData({
      'privacySettings.burnAfterRead': value
    });
    this.savePrivacySettings();
  },

  savePrivacySettings() {
    wx.setStorageSync('privacySettings', this.data.privacySettings);
    wx.showToast({
      title: '设置已保存',
      icon: 'success'
    });
  },

  loadPrivacySettings() {
    const privacySettings = wx.getStorageSync('privacySettings');
    if (privacySettings) {
      this.setData({
        privacySettings: privacySettings
      });
    }
  },

  // 显示登录弹窗
  showLoginModal() {
    this.setData({
      showLoginModal: true,
      tempAvatarUrl: this.data.userInfo.avatarUrl,
      tempNickName: this.data.userInfo.nickName
    });
  },

  // 隐藏登录弹窗
  hideLoginModal() {
    this.setData({
      showLoginModal: false,
      tempAvatarUrl: '',
      tempNickName: ''
    });
  },

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    wx.showLoading({ title: '正在上传头像...' });
    const cloudPath = 'avatar/' + Date.now() + '_' + Math.floor(Math.random()*100000) + '.jpg';
    console.log('上传头像 cloudPath:', cloudPath, '本地路径:', avatarUrl);
    wx.cloud.uploadFile({
      cloudPath,
      filePath: avatarUrl,
      success: res => {
        console.log('上传成功 fileID:', res.fileID);
        wx.cloud.getTempFileURL({
          fileList: [res.fileID],
          success: urlRes => {
            wx.hideLoading();
            if (urlRes.fileList && urlRes.fileList[0] && urlRes.fileList[0].tempFileURL) {
              const httpsUrl = urlRes.fileList[0].tempFileURL;
              console.log('头像 HTTPS 链接:', httpsUrl);
              this.setData({ 
                tempAvatarUrl: httpsUrl,
                tempAvatarFileID: res.fileID  // 同时存储 fileID
              });
              wx.showToast({ title: '头像上传成功', icon: 'success' });
            } else {
              console.error('获取临时链接失败:', urlRes);
              wx.showToast({ title: '获取头像链接失败', icon: 'none' });
            }
          },
          fail: err => {
            wx.hideLoading();
            console.error('获取头像链接失败:', err);
            wx.showToast({ title: '获取头像链接失败', icon: 'none' });
          }
        });
      },
      fail: err => {
        wx.hideLoading();
        console.error('头像上传失败:', err);
        wx.showToast({ title: '头像上传失败', icon: 'none' });
      }
    });
  },

  // 输入昵称
  onNickNameInput(e) {
    const { value } = e.detail;
    this.setData({
      tempNickName: value
    });
  },

  // 确认登录
  confirmLogin() {
    const { tempAvatarUrl, tempNickName, tempAvatarFileID } = this.data;
    
    if (!tempNickName.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    if (!tempAvatarFileID) {
      wx.showToast({
        title: '请等待头像上传完成',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '正在登录...'
    });

    const openid = getApp().getAccount();
    if (!openid) {
      wx.hideLoading();
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
      return;
    }

    // 先查询用户是否已存在
    wx.request({
      url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
      method: 'GET',
      data: {
        table: 'user',
        action: 'query',
        openid: openid
      },
      success: queryRes => {
        console.log('登录查询接口返回:', queryRes);
        let queryResult = queryRes.data;
        if (typeof queryResult === 'string') {
          try { queryResult = JSON.parse(queryResult); } catch (e) {}
        }
        
        const action = (Array.isArray(queryResult) && queryResult.length > 0) ? 'update' : 'add';
        
        // 先获取绑定码，再更新用户信息
        this.getBindingCode(openid, (bindingCode) => {
          wx.request({
            url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
            method: 'GET',
            data: {
              table: 'user',
              action: action,
              openid: openid,
              nickname: tempNickName,
              avatar: tempAvatarFileID,  // 使用 fileID 而不是临时链接
              binding_code: bindingCode
            },
            success: res => {
              wx.hideLoading();
              console.log('登录写入接口返回:', res);
              let result = res.data;
              if (typeof result === 'string') {
                try { result = JSON.parse(result); } catch (e) {}
              }
              
              if (
                (result && (result.id || result.affectedRows || result.success)) ||
                (result && result.code === 0) ||
                (result && result.data === true) ||
                (result && result.message && result.message.includes('成功')) ||
                (result && !result.error && !result.errMsg)
              ) {
                this.setData({
                  userInfo: {
                    avatarFileID: tempAvatarFileID,
                    avatarUrl: tempAvatarUrl,
                    nickName: tempNickName,
                    binding_code: bindingCode
                  },
                  isLoggedIn: true,
                  showLoginModal: false
                });

                wx.setStorageSync('userInfo', {
                  avatarFileID: tempAvatarFileID,
                  avatarUrl: tempAvatarUrl,
                  nickName: tempNickName,
                  binding_code: bindingCode
                });
                wx.setStorageSync('isLoggedIn', true);

                wx.showToast({
                  title: '登录成功',
                  icon: 'success'
                });

                console.log('登录成功并上传到云数据库:', { 
                  openid: openid,
                  avatarFileID: tempAvatarFileID,
                  avatarUrl: tempAvatarUrl, 
                  nickName: tempNickName,
                  binding_code: bindingCode
                });
              } else {
                wx.showToast({
                  title: '登录失败，请重试',
                  icon: 'none'
                });
                console.error('登录失败 result:', result);
              }
            },
            fail: err => {
              wx.hideLoading();
              wx.showToast({ title: '网络错误', icon: 'none' });
              console.error('登录写入接口请求失败:', err);
            }
          });
        });
      },
      fail: queryErr => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
        console.error('登录查询接口请求失败:', queryErr);
      }
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态
          this.setData({
            userInfo: {
              avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg',
              nickName: ''
            },
            isLoggedIn: false
          });

          // 清除本地存储
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('isLoggedIn');

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });

          console.log('退出登录成功');
        }
      }
    });
  },

  // 点击头像，弹出编辑弹窗
  editUserInfo() {
    if (!this.data.isLoggedIn) return;
    this.setData({
      showEditUserModal: true,
      editAvatarFileID: '',
      editNickName: this.data.userInfo.nickName,
      editGender: this.data.userInfo.gender || 'unknown'
    });
  },
  // 隐藏编辑弹窗
  hideEditUserModal() {
    this.setData({ showEditUserModal: false });
  },
  // 编辑弹窗选择头像
  onEditAvatarChoose(e) {
    const { avatarUrl } = e.detail;
    wx.showLoading({ title: '正在上传头像...' });
    const cloudPath = 'avatar/' + Date.now() + '_' + Math.floor(Math.random()*100000) + '.jpg';
    wx.cloud.uploadFile({
      cloudPath,
      filePath: avatarUrl,
      success: res => {
        // 只存 fileID
        this.setData({ editAvatarFileID: res.fileID });
        wx.cloud.getTempFileURL({
          fileList: [res.fileID],
          success: urlRes => {
            wx.hideLoading();
            if (urlRes.fileList && urlRes.fileList[0] && urlRes.fileList[0].tempFileURL) {
              this.setData({ editAvatarUrl: urlRes.fileList[0].tempFileURL });
              wx.showToast({ title: '头像上传成功', icon: 'success' });
            } else {
              console.error('获取临时链接失败:', urlRes);
              wx.showToast({ title: '获取头像链接失败', icon: 'none' });
            }
          },
          fail: err => {
            wx.hideLoading();
            console.error('获取临时链接失败:', err);
            wx.showToast({ title: '获取头像链接失败', icon: 'none' });
          }
        });
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({ title: '头像上传失败', icon: 'none' });
      }
    });
  },
  // 编辑弹窗昵称输入
  onEditNickNameInput(e) {
    this.setData({ editNickName: e.detail.value });
  },
  // 编辑弹窗性别选择
  onEditGenderChange(e) {
    this.setData({ editGender: e.detail.value });
  },
  // 编辑弹窗保存
  onEditUserSave() {
    const { editAvatarFileID, editNickName, editGender, userInfo, openid } = this.data;
    if (!editNickName.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    const avatarFileID = editAvatarFileID || userInfo.avatarFileID;
    wx.showLoading({ title: '正在保存...' });
    
    // 先获取绑定码，再更新用户信息
    this.getBindingCode(openid, (bindingCode) => {
      wx.request({
        url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
        method: 'GET',
        data: {
          table: 'user',
          action: 'update',
          openid,
          nickname: editNickName,
          avatar: avatarFileID,
          gender: editGender,
          binding_code: bindingCode
        },
        success: res => {
          wx.hideLoading();
          let result = res.data;
          if (typeof result === 'string') {
            try { result = JSON.parse(result); } catch (e) {}
          }
          console.log('保存接口返回 result:', result);
          if (
            (result && (result.id || result.affectedRows || result.success)) ||
            (result && result.code === 0) ||
            (result && result.data === true) ||
            (result && result.message && result.message.includes('成功')) ||
            (result && !result.error && !result.errMsg)
          ) {
            wx.showToast({ title: '保存成功', icon: 'success' });
            wx.cloud.getTempFileURL({
              fileList: [avatarFileID],
              success: urlRes => {
                if (urlRes.fileList && urlRes.fileList[0] && urlRes.fileList[0].tempFileURL) {
                  this.setData({
                    showEditUserModal: false,
                    userInfo: {
                      avatarFileID: avatarFileID,
                      avatarUrl: urlRes.fileList[0].tempFileURL,
                      nickName: editNickName,
                      gender: editGender,
                      binding_code: bindingCode
                    }
                  });
                  wx.setStorageSync('userInfo', {
                    avatarFileID: avatarFileID,
                    avatarUrl: urlRes.fileList[0].tempFileURL,
                    nickName: editNickName,
                    gender: editGender,
                    binding_code: bindingCode
                  });
                } else {
                  console.error('获取临时链接失败:', urlRes);
                  wx.showToast({ title: '保存成功，但头像显示可能异常', icon: 'none' });
                  this.setData({
                    showEditUserModal: false,
                    userInfo: {
                      avatarFileID: avatarFileID,
                      avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg',
                      nickName: editNickName,
                      gender: editGender,
                      binding_code: bindingCode
                    }
                  });
                }
              },
              fail: err => {
                console.error('获取临时链接失败:', err);
                wx.showToast({ title: '保存成功，但头像显示可能异常', icon: 'none' });
                this.setData({
                  showEditUserModal: false,
                  userInfo: {
                    avatarFileID: avatarFileID,
                    avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg',
                    nickName: editNickName,
                    gender: editGender,
                    binding_code: bindingCode
                  }
                });
              }
            });
          } else {
            wx.showToast({ title: '保存失败', icon: 'none' });
            console.error('保存失败 result:', result);
          }
        },
        fail: err => {
          wx.hideLoading();
          wx.showToast({ title: '网络错误', icon: 'none' });
          console.error('保存接口请求失败:', err);
        }
      });
    });
  },

  // 获取绑定码的通用方法
  getBindingCode(openid, callback) {
    wx.request({
      url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
      method: 'GET',
      data: {
        table: 'bind_code',
        action: 'query',
        openid: openid
      },
      success: bindingRes => {
        let bindingResult = bindingRes.data;
        if (typeof bindingResult === 'string') {
          try { bindingResult = JSON.parse(bindingResult); } catch (e) {}
        }
        const bindingCode = (Array.isArray(bindingResult) && bindingResult.length > 0) 
          ? bindingResult[0].binding_code 
          : '';
        callback(bindingCode);
      },
      fail: () => {
        callback('');
      }
    });
  }
});