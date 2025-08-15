Page({
  data: {
    // 纪念日相关
    anniversaries: [],
    currentAnniversaryId: null,
    currentAnniversary: null,
    showAnniversaryPicker: false,
    
    // 情侣绑定相关
    isBinded: false,
    partner: null,
    showCoupleBindModal: false,
    bindCode: '',
    inputBindCode: '',
    showUnbindConfirm: false,
    userInfo: {
      avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg',
      nickName: '我'
    },
    
    // 小家功能相关数据
    showAirEffect: false,
    airEffectTimer: null,
    airEffectFrame: 0,
    showFridgeEffect: false,
    fridgeEffectTimer: null,
    fridgeEffectFrame: 0,
    showFanEffect: false,
    fanEffectTimer: null,
    fanEffectFrame: 0,
    showSofaEffect: false,
    sofaEffectTimer: null,
    sofaEffectFrame: 0,
    
    // 角色相关数据
    characterImage: 'https://littlehome-1301530190.cos.ap-nanjing.myqcloud.com/shushu/shushu.png',
    currentAction: 'idle',
    actions: ['angry', 'dance', 'eyes', 'happy', 'heart', 'jump', 'napping', 'playphone', 'sad', 'walk', 'wink'],
    characterOpacity: 1,
    characterClickTimer: null, // 角色点击防抖定时器
    actionIcons: {
      'angry': '😠',
      'dance': '💃',
      'eyes': '👀',
      'happy': '😊',
      'heart': '💖',
      'jump': '🦘',
      'napping': '😴',
      'playphone': '📱',
      'sad': '😢',
      'walk': '🚶',
      'wink': '😉'
    },
    actionNames: {
      'angry': '生气',
      'dance': '跳舞',
      'eyes': '眨眼',
      'happy': '开心',
      'heart': '爱心',
      'jump': '跳跃',
      'napping': '睡觉',
      'playphone': '玩手机',
      'sad': '伤心',
      'walk': '走路',
      'wink': '眨眼'
    },
    
    // 聊天功能相关
    showChat: false,
    chatMessages: [],
    chatInputText: '',
    showEmotionReport: false,
    emotionReport: {
      analysis: '',
      suggestions: [],
      focusPoints: [],
      trend: ''
    }, // 预加载的图片缓存

    // 分享功能相关
    shareImageUrl: ''


  },

  onLoad() {
    // 初始化数据
    this.initData();
    
    // 延迟预生成分享图片，确保数据加载完成
    setTimeout(() => {
      this.generateShareImage();
    }, 1000);
  },

  // 初始化数据
  initData() {
    // 加载纪念日数据
    const anniversaries = wx.getStorageSync('anniversaries') || [];
    const currentAnniversaryId = wx.getStorageSync('currentAnniversaryId') || 'default';
    let currentAnniversary = { title: '我们已经在一起', date: '2022-02-12' };
    
    if (anniversaries.length > 0) {
      if (currentAnniversaryId === 'default') {
        currentAnniversary = anniversaries[0];
      } else {
        const found = anniversaries.find(function(item) { return item.id === currentAnniversaryId; });
        if (found) currentAnniversary = found;
      }
    }
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
    
    this.setData({
      anniversaries,
      currentAnniversaryId,
      currentAnniversary
    });
    
    // 数据更新后重新生成分享图片
    this.updateShareImage();
    
    this.startTimer();
    
    // 等待OpenID获取完成后再执行绑定相关操作
    this.waitForOpenIDAndInitBind();
    
    // 调试角色显示
    // console.log('角色图片URL:', this.data.characterImage);
  },

  // 等待OpenID获取完成并初始化绑定相关功能
  waitForOpenIDAndInitBind() {
    const maxAttempts = 10; // 最大尝试次数
    let attempts = 0;
    
    const checkOpenID = () => {
      attempts++;
      const openid = getApp().getAccount();
      
      if (openid) {
        console.log('OpenID已获取，开始初始化绑定功能:', openid);
        // OpenID已获取，执行绑定相关操作
        this.getBindStatus();
        this.generateBindCode();
      } else if (attempts < maxAttempts) {
        console.log(`OpenID未获取，第${attempts}次重试...`);
        // 继续等待
        setTimeout(checkOpenID, 500);
      } else {
        console.log('OpenID获取超时，使用默认状态');
        // 超时后使用默认状态
        this.setData({ 
          isBinded: false, 
          partner: null,
          bindCode: null 
        });
      }
    };
    
    // 开始检查
    checkOpenID();
  },

  onShow: function() {
    // 重新获取纪念日数据
    const anniversaries = wx.getStorageSync('anniversaries') || [
      { id: 'default', title: '我们已经在一起', date: '2022-02-12' }
    ];
    const currentAnniversaryId = wx.getStorageSync('currentAnniversaryId') || 'default';
    const currentAnniversary = anniversaries.find(function(a) { return a.id === currentAnniversaryId; }) || anniversaries[0];
    this.setData({ anniversaries, currentAnniversaryId, currentAnniversary });
    
    // 在onShow中也检查OpenID并获取绑定状态
    const openid = getApp().getAccount();
    if (openid) {
      this.getBindStatus();
    } else {
      console.log('onShow时OpenID未获取，跳过绑定状态查询');
    }
  },

  onGetUserProfile(e) {
    if (e.detail && e.detail.userInfo) {
      const userInfo = e.detail.userInfo;
      const nickName = userInfo.nickName;
      const avatarUrl = userInfo.avatarUrl;
      wx.setStorageSync('userInfo', { nickName: nickName, avatarUrl: avatarUrl });
      this.setData({ userInfo: { nickName: nickName, avatarUrl: avatarUrl } });
      console.log('获取到的昵称:', nickName, '头像:', avatarUrl);
      wx.showToast({ title: '获取成功', icon: 'success' });
    } else {
      wx.showToast({ title: '用户拒绝授权', icon: 'none' });
    }
  },

  // 计时器支持传入日期
  startTimer: function(dateStr) {
    if (this.timer) clearInterval(this.timer);
    // 兼容iOS，统一用 yyyy/MM/dd
    let startDate;
    if (dateStr) {
      // 支持 yyyy-MM-dd 或 yyyy/MM/dd
      startDate = new Date(dateStr.replace(/-/g, '/'));
    } else {
      startDate = new Date(2022, 1, 12, 5, 20, 0);
    }
    this.timer = setInterval(function() {
      const now = new Date();
      const diff = now - startDate;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      this.setData({ days, hours, minutes, seconds });
    }.bind(this), 1000);
  },

  // 点击纪念日区域弹出选择
  showAnniversaryPicker() {
    this.setData({ showAnniversaryPicker: true });
  },
  hideAnniversaryPicker() {
    this.setData({ showAnniversaryPicker: false });
  },
  selectAnniversary(e) {
    const id = e.currentTarget.dataset.id;
    const ann = this.data.anniversaries.find(function(a) { return a.id === id; });
    if (ann) {
      this.setData({
        currentAnniversaryId: id,
        currentAnniversary: ann,
        showAnniversaryPicker: false
      });
      wx.setStorageSync('currentAnniversaryId', id);
      this.startTimer(ann.date);
    }
  },
  showCoupleBindModal() {
    this.setData({ showCoupleBindModal: true, bindCode: wx.getStorageSync('bindCode') || '' });
    this.getBindStatus();
  },
  hideCoupleBindModal() {
    this.setData({ showCoupleBindModal: false, bindCode: '', inputBindCode: '' });
  },
  onInputBindCode(e) {
    this.setData({ inputBindCode: e.detail.value });
  },

  // 复制绑定码
  copyBindCode() {
    const bindCode = this.data.bindCode;
    if (!bindCode) {
      wx.showToast({
        title: '绑定码不存在',
        icon: 'none'
      });
      return;
    }
    
    wx.setClipboardData({
      data: bindCode,
      success: () => {
        wx.showToast({
          title: '绑定码已复制',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },
  getBindStatus() {
    const openid = getApp().getAccount();
    if (!openid) {
      console.log('未获取到openid，跳过绑定状态查询');
      return;
    }
    
    wx.request({
      url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
      method: 'GET',
      data: {
        table: 'user',
        action: 'query',
        openid
      },
      success: res => {
        console.log('获取绑定状态响应:', res.data);
        try {
          let result = res.data;
          if (typeof result === 'string') {
            try { result = JSON.parse(result); } catch (e) {}
          }
          
          if (Array.isArray(result) && result.length > 0) {
            const user = result[0];
            
            // 更新用户自己的信息
            const userInfo = {
              avatarUrl: user.avatar || 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg',
              nickName: user.nickname || '我'
            };
            
            // 如果头像是fileID格式，转换为HTTPS链接
            if (user.avatar && user.avatar.startsWith('cloud://')) {
              wx.cloud.getTempFileURL({
                fileList: [user.avatar],
                success: urlRes => {
                  userInfo.avatarUrl = urlRes.fileList[0].tempFileURL;
                  this.updateUserInfoAndBindStatus(user, userInfo);
                },
                fail: err => {
                  console.error('获取头像链接失败:', err);
                  this.updateUserInfoAndBindStatus(user, userInfo);
                }
              });
            } else {
              this.updateUserInfoAndBindStatus(user, userInfo);
            }
          } else {
            this.setData({ isBinded: false, partner: null });
            console.log('绑定状态：用户信息获取失败');
          }
        } catch (error) {
          console.error('解析绑定状态失败:', error);
          this.setData({ isBinded: false, partner: null });
        }
      },
      fail: err => {
        console.error('获取绑定状态失败:', err);
        this.setData({ isBinded: false, partner: null });
      }
    });
  },

  // 更新用户信息和绑定状态
  updateUserInfoAndBindStatus(user, userInfo) {
    if (user && user.partner_openid) {
      // 查询伴侣信息
      wx.request({
        url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
        method: 'GET',
        data: {
          table: 'user',
          action: 'query',
          openid: user.partner_openid
        },
        success: res2 => {
          console.log('获取伴侣信息响应:', res2.data);
          try {
            let partnerResult = res2.data;
            if (typeof partnerResult === 'string') {
              try { partnerResult = JSON.parse(partnerResult); } catch (e) {}
            }
            
            if (Array.isArray(partnerResult) && partnerResult.length > 0) {
              const partner = partnerResult[0];
              this.setData({ isBinded: true, partner, userInfo });
              console.log('绑定状态：已绑定', partner);
            } else {
              this.setData({ isBinded: false, partner: null, userInfo });
              console.log('绑定状态：伴侣信息获取失败');
            }
          } catch (error) {
            console.error('解析伴侣信息失败:', error);
            this.setData({ isBinded: false, partner: null, userInfo });
          }
        },
        fail: err => {
          console.error('获取伴侣信息失败:', err);
          this.setData({ isBinded: false, partner: null, userInfo });
        }
      });
    } else {
      this.setData({ isBinded: false, partner: null, userInfo });
      console.log('绑定状态：未绑定');
    }
  },

  generateBindCode() {
    const openid = getApp().getAccount(); // 获取当前用户openid
    wx.request({
      url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
      method: 'GET',
      data: {
        table: 'bind_code',
        action: 'generate',
        openid
      },
      success: res => {
        // 兼容SCF返回格式
        let result = res.data;
        if (typeof result === 'string') {
          try {
            result = JSON.parse(result);
          } catch (e) {}
        }
        if (result && result.code) {
          this.setData({ bindCode: result.code });
          wx.setStorageSync('bindCode', result.code);
          console.log('生成的绑定码:', result.code);
        } else {
          wx.showToast({ title: '生成失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },
  bindWithCode() {
    const openid = getApp().getAccount();
    const inputCode = this.data.inputBindCode.trim();
    if (!inputCode) {
      wx.showToast({ title: '请输入绑定码', icon: 'none' });
      return;
    }
    
    if (!openid) {
      wx.showToast({ title: '用户身份验证失败', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '绑定中...' });
    
    // 1. 查询绑定码有效性
    wx.request({
      url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
      method: 'GET',
      data: {
        table: 'bind_code',
        action: 'query',
        code: inputCode
      },
      success: res => {
        let result = res.data;
        if (typeof result === 'string') {
          try { result = JSON.parse(result); } catch (e) {}
        }
        
        console.log('绑定码查询结果:', result);
        
        if (Array.isArray(result) && result.length && result[0].used == 0) {
          const partner_openid = result[0].openid;
          
          // 检查不能自己绑定自己
          if (partner_openid === openid) {
            wx.hideLoading();
            wx.showToast({ title: '不能绑定自己的绑定码', icon: 'none' });
            return;
          }
          
          // 检查partner_openid是否有效
          if (!partner_openid) {
            wx.hideLoading();
            wx.showToast({ title: '绑定码无效', icon: 'none' });
            return;
          }
          
          const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
          
          // 2. 更新自己的绑定信息
          const bindData1 = {
            table: 'user',
            action: 'bind_partner',
            openid,
            partner_openid
          };
          console.log('发送绑定请求1:', bindData1);
          
          wx.request({
            url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
            method: 'GET',
            data: bindData1,
            success: (res1) => {
              console.log('更新自己绑定信息结果:', res1.data);
              
              // 3. 更新对方的绑定信息
              const bindData2 = {
                table: 'user',
                action: 'bind_partner',
                openid: partner_openid,
                partner_openid: openid
              };
              console.log('发送绑定请求2:', bindData2);
              
              wx.request({
                url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
                method: 'GET',
                data: bindData2,
                success: (res2) => {
                  console.log('更新对方绑定信息结果:', res2.data);
                  
                  // 4. 标记绑定码已用
                  wx.request({
                    url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
                    method: 'GET',
                    data: {
                      table: 'bind_code',
                      action: 'update',
                      code: inputCode,
                      used: 1,
                      used_by: openid,
                      used_at: now
                    },
                    success: (res3) => {
                      console.log('标记绑定码已用结果:', res3.data);
                      wx.hideLoading();
                      wx.showToast({ title: '绑定成功', icon: 'success' });
                      this.setData({ inputBindCode: '' });
                      this.getBindStatus();
                    },
                    fail: (err3) => {
                      console.error('标记绑定码失败:', err3);
                      wx.hideLoading();
                      wx.showToast({ title: '绑定成功，但标记绑定码失败', icon: 'none' });
                      this.getBindStatus();
                    }
                  });
                },
                fail: (err2) => {
                  console.error('更新对方绑定信息失败:', err2);
                  wx.hideLoading();
                  wx.showToast({ title: '绑定失败', icon: 'none' });
                }
              });
            },
            fail: (err1) => {
              console.error('更新自己绑定信息失败:', err1);
              wx.hideLoading();
              wx.showToast({ title: '绑定失败', icon: 'none' });
            }
          });
        } else {
          wx.hideLoading();
          wx.showToast({ title: '绑定码无效或已被使用', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('查询绑定码失败:', err);
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },
  showUnbindConfirm() {
    this.setData({ showUnbindConfirm: true });
  },

  hideUnbindConfirm() {
    this.setData({ showUnbindConfirm: false });
  },

  confirmUnbind() {
    const openid = getApp().getAccount();
    const partner_openid = this.data.partner.openid;
    if (!partner_openid) return;
    
    wx.showLoading({ title: '解绑中...' });
    
    // 解绑自己
    wx.request({
      url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
      method: 'GET',
      data: {
        table: 'user',
        action: 'unbind_partner',
        openid
      },
      success: (res1) => {
        console.log('解绑自己结果:', res1.data);
        
        // 解绑对方
        wx.request({
          url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
          method: 'GET',
          data: {
            table: 'user',
            action: 'unbind_partner',
            openid: partner_openid
          },
          success: (res2) => {
            console.log('解绑对方结果:', res2.data);
            wx.hideLoading();
            wx.showToast({ title: '解绑成功', icon: 'success' });
            this.setData({ showUnbindConfirm: false, showCoupleBindModal: false });
            this.getBindStatus();
          },
          fail: (err2) => {
            console.error('解绑对方失败:', err2);
            wx.hideLoading();
            wx.showToast({ title: '解绑失败', icon: 'none' });
          }
        });
      },
      fail: (err1) => {
        console.error('解绑自己失败:', err1);
        wx.hideLoading();
        wx.showToast({ title: '解绑失败', icon: 'none' });
      }
    });
  },

  unbindCouple() {
    // 保留原方法作为备用
    this.showUnbindConfirm();
  },

  // 小家功能相关函数
  onAirConditionTap() {
    this.setData({ showAirEffect: true, airEffectFrame: 0 });
    this.startAirEffectAnimation();
  },
  startAirEffectAnimation() {
    if (this.data.airEffectTimer) clearInterval(this.data.airEffectTimer);
    const timer = setInterval(() => {
      this.drawAirEffect();
    }, 100);
    this.setData({ airEffectTimer: timer });
  },
  drawAirEffect() {
    const ctx = wx.createCanvasContext('airEffectCanvas');
    const frame = this.data.airEffectFrame;
    
    // 绘制空调特效 - 从出风口向下吹冷气
    // 主要冷气流
    ctx.setFillStyle('#87CEEB');
    for (let i = 0; i < 3; i++) {
      const x = 60 + (i - 1) * 8; // 三个出风口
      const y = 40 + frame * 2 + i * 2;
      const width = 6;
      const height = 20 + frame * 1.5;
      
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.fill();
    }
    
    // 冷气扩散效果
    ctx.setFillStyle('#E0F6FF');
    for (let i = 0; i < 5; i++) {
      const x = 55 + Math.sin(frame * 0.1 + i) * 15;
      const y = 60 + frame * 1.5 + i * 3;
      const size = 3 + Math.sin(frame * 0.2 + i) * 2;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // 空调面板指示灯
    ctx.setFillStyle('#00FF00');
    ctx.beginPath();
    ctx.arc(65, 35, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.draw();
    
    this.setData({ airEffectFrame: frame + 1 });
    if (frame > 20) {
      this.setData({ showAirEffect: false, airEffectTimer: null });
      clearInterval(this.data.airEffectTimer);
    }
  },
  
  onFridgeTap() {
    this.setData({ showFridgeEffect: true, fridgeEffectFrame: 0 });
    this.startFridgeEffectAnimation();
  },
  
  startFridgeEffectAnimation() {
    if (this.data.fridgeEffectTimer) clearInterval(this.data.fridgeEffectTimer);
    const timer = setInterval(() => {
      this.drawFridgeEffect();
    }, 100);
    this.setData({ fridgeEffectTimer: timer });
  },
  
  drawFridgeEffect() {
    const ctx = wx.createCanvasContext('fridgeEffectCanvas');
    const frame = this.data.fridgeEffectFrame;
    
    // 绘制冰箱特效 - 冒出一团团的冷气
    ctx.setFillStyle('#E0F6FF');
    for (let i = 0; i < 4; i++) {
      const x = 65 + Math.sin(frame * 0.1 + i) * 15;
      const y = 65 - frame * 2 - i * 5;
      const size = 8 + Math.sin(frame * 0.2 + i) * 3;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // 更小的冷气团
    ctx.setFillStyle('#F0F8FF');
    for (let i = 0; i < 3; i++) {
      const x = 70 + Math.sin(frame * 0.15 + i) * 12;
      const y = 60 - frame * 1.5 - i * 4;
      const size = 5 + Math.sin(frame * 0.25 + i) * 2;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    ctx.draw();
    
    this.setData({ fridgeEffectFrame: frame + 1 });
    if (frame > 12) {
      this.setData({ showFridgeEffect: false, fridgeEffectTimer: null });
      clearInterval(this.data.fridgeEffectTimer);
    }
  },
  
  onFanTap() {
    this.setData({ showFanEffect: true, fanEffectFrame: 0 });
    this.startFanEffectAnimation();
  },
  
  startFanEffectAnimation() {
    if (this.data.fanEffectTimer) clearInterval(this.data.fanEffectTimer);
    const timer = setInterval(() => {
      this.drawFanEffect();
    }, 80);
    this.setData({ fanEffectTimer: timer });
  },
  
  drawFanEffect() {
    const ctx = wx.createCanvasContext('fanEffectCanvas');
    const frame = this.data.fanEffectFrame;
    
    // 绘制风扇特效 - 旋转叶片产生气流
    // 旋转的风扇叶片
    ctx.setStrokeStyle('#666666');
    ctx.setLineWidth(3);
    for (let i = 0; i < 3; i++) {
      const angle = (frame * 20 + i * 120) * Math.PI / 180;
      const x1 = 50 + Math.cos(angle) * 12;
      const y1 = 50 + Math.sin(angle) * 12;
      const x2 = 50 + Math.cos(angle) * 20;
      const y2 = 50 + Math.sin(angle) * 20;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    // 风扇中心
    ctx.setFillStyle('#444444');
    ctx.beginPath();
    ctx.arc(50, 50, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // 气流效果 - 从风扇中心向外扩散
    ctx.setFillStyle('#FFFFFF');
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45) * Math.PI / 180;
      const distance = 15 + frame * 1.5;
      const x = 50 + Math.cos(angle) * distance;
      const y = 50 + Math.sin(angle) * distance;
      const size = 2 + Math.sin(frame * 0.3 + i) * 1;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // 风扇指示灯
    ctx.setFillStyle('#FF0000');
    ctx.beginPath();
    ctx.arc(50, 35, 2, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.draw();
    
    this.setData({ fanEffectFrame: frame + 1 });
    if (frame > 25) {
      this.setData({ showFanEffect: false, fanEffectTimer: null });
      clearInterval(this.data.fanEffectTimer);
    }
  },
  
  onSofaTap() {
    this.setData({ showSofaEffect: true, sofaEffectFrame: 0 });
    this.startSofaEffectAnimation();
  },
  
  startSofaEffectAnimation() {
    if (this.data.sofaEffectTimer) clearInterval(this.data.sofaEffectTimer);
    const timer = setInterval(() => {
      this.drawSofaEffect();
    }, 120);
    this.setData({ sofaEffectTimer: timer });
  },
  
  drawSofaEffect() {
    const ctx = wx.createCanvasContext('sofaEffectCanvas');
    const frame = this.data.sofaEffectFrame;
    
    // 绘制沙发特效 - 向上出现zzz字的睡觉特效
    ctx.setFillStyle('#FFD700');
    ctx.setFontSize(16);
    
    // 绘制Z字母
    const zPositions = [
      { x: 30, y: 30 - frame * 2 },
      { x: 35, y: 25 - frame * 1.8 },
      { x: 40, y: 20 - frame * 1.6 }
    ];
    
    zPositions.forEach((pos, index) => {
      if (pos.y > 10) {
        ctx.fillText('Z', pos.x, pos.y);
      }
    });
    
    // 绘制小星星
    ctx.setFillStyle('#FFFF00');
    for (let i = 0; i < 3; i++) {
      const x = 25 + Math.sin(frame * 0.2 + i) * 15;
      const y = 35 - frame * 1.5 - i * 3;
      const size = 2 + Math.sin(frame * 0.3 + i) * 1;
      
      if (y > 15) {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    
    ctx.draw();
    
    this.setData({ sofaEffectFrame: frame + 1 });
    if (frame > 20) {
      this.setData({ showSofaEffect: false, sofaEffectTimer: null });
      clearInterval(this.data.sofaEffectTimer);
    }
  },


  // 角色点击处理
  onCharacterTap() {
    // 防抖处理：如果已经有定时器在运行，则清除它
    if (this.data.characterClickTimer) {
      clearTimeout(this.data.characterClickTimer);
    }
    
    // 设置新的定时器，500ms后执行
    const timer = setTimeout(() => {
      const actions = this.data.actions;
      
      // 随机选择一个动作
      const randomIndex = Math.floor(Math.random() * actions.length);
      const randomAction = actions[randomIndex];
      
      // 打印记录当前动作名字
      console.log('当前动作: ' + randomAction);
      
      // 先淡出当前图片
      this.setData({
        characterOpacity: 0
      });
      
      setTimeout(() => {
        // 直接使用网络加载GIF图片
        const characterImage = 'https://littlehome-1301530190.cos.ap-nanjing.myqcloud.com/shushu/' + randomAction + '.gif';
        
        this.setData({
          characterImage: characterImage,
          currentAction: randomAction,
          characterOpacity: 1
        });
        
        // 3秒后恢复默认图片
        setTimeout(() => {
          this.setData({
            characterImage: 'https://littlehome-1301530190.cos.ap-nanjing.myqcloud.com/shushu/shushu.png',
            currentAction: 'idle',
            characterOpacity: 1
          });
        }, 3000);
      }, 200);
      
      // 清除定时器引用
      this.setData({
        characterClickTimer: null
      });
    }, 500);
    
    // 保存定时器引用
    this.setData({
      characterClickTimer: timer
    });
  },

  // 选择动作
  selectAction(e) {
    // 防抖处理：如果已经有定时器在运行，则清除它
    if (this.data.characterClickTimer) {
      clearTimeout(this.data.characterClickTimer);
    }
    
    const selectedAction = e.currentTarget.dataset.action;
    
    // 设置新的定时器，500ms后执行
    const timer = setTimeout(() => {
      // 打印记录当前动作名字
      console.log('选择动作: ' + selectedAction);
      
      // 先淡出当前图片
      this.setData({
        characterOpacity: 0
      });
      
      setTimeout(() => {
        // 直接使用网络加载GIF图片
        const characterImage = 'https://littlehome-1301530190.cos.ap-nanjing.myqcloud.com/shushu/' + selectedAction + '.gif';
        
        this.setData({
          characterImage: characterImage,
          currentAction: selectedAction,
          characterOpacity: 1
        });
        
        // 3秒后恢复默认图片
        setTimeout(() => {
          this.setData({
            characterImage: 'https://littlehome-1301530190.cos.ap-nanjing.myqcloud.com/shushu/shushu.png',
            currentAction: 'idle',
            characterOpacity: 1
          });
        }, 3000);
      }, 200);
      
      // 清除定时器引用
      this.setData({
        characterClickTimer: null
      });
    }, 500);
    
    // 保存定时器引用
    this.setData({
      characterClickTimer: timer
    });
  },

  // 聊天功能相关方法
  openChat() {
    this.setData({
      showChat: true,
      chatMessages: []
    });
    
    // 角色欢迎语
    setTimeout(() => {
      this.addCharacterMessage('你好呀！我是鼠鼠，有什么想和我聊的吗？');
    }, 300);
  },

  closeChat() {
    // 只有当有聊天内容时才生成报告
    if (this.data.chatMessages.length > 0) {
      this.generateEmotionReport();
    }
    
    this.setData({
      showChat: false,
      chatMessages: [],
      chatInputText: ''
    });
  },

  onChatInput(e) {
    this.setData({
      chatInputText: e.detail.value
    });
  },

  sendChatMessage() {
    const message = this.data.chatInputText.trim();
    if (!message) return;

    // 添加用户消息
    this.addUserMessage(message);
    
    // 清空输入框
    this.setData({
      chatInputText: ''
    });

    // 调用AI回复
    this.getAIResponse(message);
  },

  addUserMessage(content) {
    const messages = this.data.chatMessages.slice();
    messages.push({
      type: 'user',
      content: content,
      timestamp: Date.now()
    });
    
    // 保持最多2条消息
    if (messages.length > 2) {
      messages.splice(0, messages.length - 2);
    }
    
    this.setData({
      chatMessages: messages
    });
  },

  addCharacterMessage(content) {
    const messages = this.data.chatMessages.slice();
    messages.push({
      type: 'character',
      content: content,
      timestamp: Date.now()
    });
    
    // 保持最多2条消息
    if (messages.length > 2) {
      messages.splice(0, messages.length - 2);
    }
    
    this.setData({
      chatMessages: messages
    });
  },

  getAIResponse(userMessage) {
    wx.showLoading({
      title: '思考中...'
    });

    const conversationHistory = this.data.chatMessages.map(function(msg) {
      return {
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      };
    });

    wx.request({
      url: 'https://api.deepseek.com/v1/chat/completions',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-4c5a825922094bd2ba46f3fbd5b5113f'
      },
      data: {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个温暖贴心的情感倾听者，专门为情侣提供情感支持和倾听。你的特点是：1. 温暖关怀：用温柔的语气回应，给予情感上的支持和理解 2. 积极倾听：认真倾听用户的心事，不急于给出建议 3. 情感共鸣：能够理解并回应用户的情感状态 4. 适度引导：在合适的时候给出温和的建议和鼓励 5. 保持边界：专注于情感支持，不涉及其他话题 请用简短、温暖、贴心的语言回复，每次回复控制在50字以内。'
          }
        ].concat(conversationHistory).concat([
          {
            role: 'user',
            content: userMessage
          }
        ]),
        stream: false,
        max_tokens: 200
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data && res.data.choices && res.data.choices[0]) {
          const aiResponse = res.data.choices[0].message.content;
          this.addCharacterMessage(aiResponse);
        } else {
          this.addCharacterMessage('我理解你的感受，有什么想继续聊的吗？');
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('AI回复失败:', err);
        this.addCharacterMessage('抱歉，我现在有点忙，稍后再聊好吗？');
      }
    });
  },

  generateEmotionReport() {
    // 检查是否有聊天内容，如果没有则不生成报告
    if (this.data.chatMessages.length === 0) {
      console.log('没有聊天内容，跳过报告生成');
      return;
    }
    
    // 检查是否只有角色欢迎语，如果是则不生成报告
    const messages = this.data.chatMessages;
          if (messages.length === 1 && messages[0].type === 'character' &&
          messages[0].content.includes('你好呀！我是鼠鼠')) {
      console.log('只有欢迎语，跳过报告生成');
      return;
    }

    wx.showLoading({
      title: '生成报告中...'
    });

    const conversationText = this.data.chatMessages
      .map(function(msg) { return (msg.type === 'user' ? '用户' : '助手') + ': ' + msg.content; })
      .join('\n');

    wx.request({
      url: 'https://api.deepseek.com/v1/chat/completions',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-4c5a825922094bd2ba46f3fbd5b5113f'
      },
      data: {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的情绪分析师。请分析用户对话中的情绪状态，并返回一个JSON格式的分析报告，包含以下字段：analysis（情绪分析）、suggestions（建议）、focusPoints（关注点）、trend（情绪趋势）。请确保返回的是有效的JSON格式。'
          },
          {
            role: 'user',
            content: '请分析以下对话的情感状态：\n\n' + conversationText
          }
        ],
        stream: false,
        max_tokens: 500
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data && res.data.choices && res.data.choices[0]) {
          try {
            const reportText = res.data.choices[0].message.content;
            const report = JSON.parse(reportText);
            
            this.setData({
              emotionReport: report,
              showEmotionReport: true
            });
          } catch (e) {
            console.error('解析报告失败:', e);
            this.showDefaultReport();
          }
        } else {
          this.showDefaultReport();
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('生成报告失败:', err);
        this.showDefaultReport();
      }
    });
  },

  showDefaultReport() {
    this.setData({
      emotionReport: {
        analysis: '通过这次对话，我感受到你在情感表达上很真诚。建议多关注自己的情感需求，保持与伴侣的沟通。',
        suggestions: [
          '保持开放的心态与伴侣交流',
          '关注自己的情感需求',
          '建立健康的沟通习惯'
        ],
        focusPoints: [
          '情感表达的真实性',
          '沟通的开放性',
          '自我情感认知'
        ],
        trend: '情感状态稳定，有良好的沟通基础'
      },
      showEmotionReport: true
    });
  },

  hideEmotionReport() {
    this.setData({
      showEmotionReport: false
    });
  },

  // 页面转发功能
  onShareAppMessage() {
    // 如果已有分享图片，直接使用；否则使用默认图片
    if (this.data.shareImageUrl) {
      return {
        title: 'LittleHome - 情侣生活管理平台',
        path: '/pages/index/index',
        imageUrl: this.data.shareImageUrl
      };
    } else {
      // 如果没有预生成的图片，使用默认图片
      return {
        title: 'LittleHome - 情侣生活管理平台',
        path: '/pages/index/index',
        imageUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/share-cover.jpg'
      };
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    // 如果已有分享图片，直接使用；否则使用默认图片
    if (this.data.shareImageUrl) {
      return {
        title: 'LittleHome - 情侣生活管理平台',
        query: '',
        imageUrl: this.data.shareImageUrl
      };
    } else {
      // 如果没有预生成的图片，使用默认图片
      return {
        title: 'LittleHome - 情侣生活管理平台',
        query: '',
        imageUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/share-cover.jpg'
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
        ctx.fillText('情侣生活管理平台', canvasWidth / 2, 55);
        
        // 绘制纪念日信息
        if (this.data.currentAnniversary) {
          ctx.setFillStyle('#2C1810');
          ctx.setFontSize(14);
          ctx.setTextAlign('center');
          ctx.fillText(this.data.currentAnniversary.title, canvasWidth / 2, 120);
          
          // 绘制天数
          if (this.data.days !== undefined) {
            ctx.setFontSize(24);
            ctx.setFillStyle('#E6A4B4');
            ctx.fillText(this.data.days + '天', canvasWidth / 2, 150);
          }
        }
        
        // 绘制用户信息
        if (this.data.userInfo) {
          ctx.setFillStyle('#9A8C82');
          ctx.setFontSize(12);
          ctx.setTextAlign('center');
          ctx.fillText('分享自: ' + this.data.userInfo.nickName, canvasWidth / 2, 180);
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

  // 当数据更新时重新生成分享图片
  updateShareImage() {
    setTimeout(() => {
      this.generateShareImage();
    }, 500);
  }
});
