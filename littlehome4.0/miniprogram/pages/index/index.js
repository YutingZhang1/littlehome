// 引入通用方法
const commonMethods = require('../../common-methods.js');

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
    
    // 待机动作相关
    idleTimer: null, // 待机定时器
    lastInteractionTime: Date.now(), // 最后交互时间
    isIdle: false, // 是否处于待机状态
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
    shareImageUrl: '',
    
    // 情感报告相关状态
    isGeneratingReport: false,
    hasReportGenerated: false,
    reportButtonShaking: false,
    
    // 聊天加载状态
    isChatLoading: false,
    
    // 消息计数
    userMessageCount: 0,
    characterMessageCount: 0,
    
    // 强制更新触发器
    forceUpdate: 0


  },

  onLoad() {
    // 初始化数据
    this.initData();
    
    // 启动待机动作系统
    this.startIdleSystem();
    
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
        // OpenID已获取，执行绑定相关操作
        commonMethods.info('OpenID获取成功，开始初始化绑定功能', { openid: openid.substring(0, 8) + '...' }, '绑定系统');
        this.getBindStatus();
        this.generateBindCode();
      } else if (attempts < maxAttempts) {
        // 继续等待
        commonMethods.debug(`OpenID未获取，第${attempts}次重试`, null, '绑定系统');
        setTimeout(checkOpenID, 500);
      } else {
        // 超时后使用默认状态
        commonMethods.warn('OpenID获取超时，使用默认状态', { attempts }, '绑定系统');
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
    }
  },

  onGetUserProfile(e) {
    if (e.detail && e.detail.userInfo) {
      const userInfo = e.detail.userInfo;
      const nickName = userInfo.nickName;
      const avatarUrl = userInfo.avatarUrl;
      wx.setStorageSync('userInfo', { nickName: nickName, avatarUrl: avatarUrl });
      this.setData({ userInfo: { nickName: nickName, avatarUrl: avatarUrl } });
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
      commonMethods.warn('OpenID未获取，跳过绑定状态查询', null, '绑定系统');
      return;
    }
    
    commonMethods.info('开始查询绑定状态', { openid: openid.substring(0, 8) + '...' }, '绑定系统');
    
    wx.request({
      url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
      method: 'GET',
      data: {
        table: 'user',
        action: 'query',
        openid
      },
      success: res => {
        try {
          let result = res.data;
          if (typeof result === 'string') {
            try { result = JSON.parse(result); } catch (e) {}
          }
          
          if (Array.isArray(result) && result.length > 0) {
            const user = result[0];
            commonMethods.info('用户信息获取成功', { hasPartner: !!user.partner_openid }, '绑定系统');
            
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
                  commonMethods.error('获取头像链接失败', err, '绑定系统');
                  this.updateUserInfoAndBindStatus(user, userInfo);
                }
              });
            } else {
              this.updateUserInfoAndBindStatus(user, userInfo);
            }
          } else {
            commonMethods.warn('用户信息获取失败，设置未绑定状态', null, '绑定系统');
            this.setData({ isBinded: false, partner: null });
          }
        } catch (error) {
          commonMethods.error('解析绑定状态失败', error, '绑定系统');
          this.setData({ isBinded: false, partner: null });
        }
      },
      fail: err => {
        commonMethods.error('获取绑定状态失败', err, '绑定系统');
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
            try {
            let partnerResult = res2.data;
            if (typeof partnerResult === 'string') {
              try { partnerResult = JSON.parse(partnerResult); } catch (e) {}
            }
            
            if (Array.isArray(partnerResult) && partnerResult.length > 0) {
              const partner = partnerResult[0];
              this.setData({ isBinded: true, partner, userInfo });
            } else {
              this.setData({ isBinded: false, partner: null, userInfo });
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
          wx.request({
            url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
            method: 'GET',
            data: bindData1,
            success: (res1) => {
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
    // 更新最后交互时间
    this.setData({ lastInteractionTime: Date.now() });
    
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
      
      // 使用新的动作执行方法
      this.executeCharacterAction(randomAction, false);
      
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
    commonMethods.info('用户打开聊天界面', null, '聊天系统');
    this.setData({
      showChat: true,
      chatMessages: [],
      userMessageCount: 0,
      characterMessageCount: 0
    });
    
    // 角色欢迎语
    setTimeout(() => {
      this.addCharacterMessage('你好呀！我是鼠鼠，有什么想和我聊的吗？');
    }, 300);
  },

  closeChat() {
    const messageCount = this.data.chatMessages.length;
    commonMethods.info('用户关闭聊天界面', { messageCount, hasReport: this.data.hasReportGenerated }, '聊天系统');
    
    // 关闭聊天时检查是否需要生成情感报告
    // 只有在满足条件且用户主动关闭时才生成报告
    if (messageCount > 0 && !this.data.hasReportGenerated) {
      commonMethods.info('触发情感报告生成检查', null, '聊天系统');
      this.checkAndGenerateReport();
    }
    
    // 重置所有聊天相关状态
    this.setData({
      showChat: false,
      chatMessages: [],
      chatInputText: '',
      isChatLoading: false,
      userMessageCount: 0,
      characterMessageCount: 0
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

  // 检查并生成情感报告
  // 注意：此方法只在用户主动关闭聊天界面时调用
  // 不会在对话过程中自动触发
  checkAndGenerateReport() {
    const messages = this.data.chatMessages;
    
    // 检查对话来回次数
    const userMessages = messages.filter(msg => msg.type === 'user');
    const characterMessages = messages.filter(msg => msg.type === 'character');
    
    console.log('=== 情感报告生成条件检查 ===');
    console.log('触发条件: 用户主动关闭聊天界面');
    console.log('检查结果:', {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      characterMessages: characterMessages.length,
      hasReportGenerated: this.data.hasReportGenerated,
      messages: messages.map(m => ({ type: m.type, content: m.content.substring(0, 20) + '...' }))
    });
    
    // 如果用户消息和角色消息都超过2条，且还没有生成过报告，则生成报告
    if (userMessages.length >= 2 && characterMessages.length >= 2 && !this.data.hasReportGenerated) {
      console.log('✅ 条件满足，开始生成情感报告');
      this.generateEmotionReport();
    } else {
      console.log('❌ 条件不满足，跳过报告生成');
      if (userMessages.length < 2) console.log('  - 用户消息不足2条');
      if (characterMessages.length < 2) console.log('  - 角色消息不足2条');
      if (this.data.hasReportGenerated) console.log('  - 报告已生成过');
    }
  },

  addUserMessage(content) {
    const messages = this.data.chatMessages.slice();
    const newMessage = {
      type: 'user',
      content: content,
      timestamp: Date.now(),
      timeText: '刚刚'
    };
    
    messages.push(newMessage);
    
    // 保持最多10条消息，确保能正确计算对话来回次数
    if (messages.length > 10) {
      messages.splice(0, messages.length - 10);
    }
    
    // 格式化所有消息的时间显示
    messages.forEach(msg => {
      if (msg.timestamp && !msg.timeText) {
        const seconds = Math.floor((Date.now() - msg.timestamp) / 1000);
        if (seconds < 60) {
          msg.timeText = '刚刚';
        } else if (seconds < 3600) {
          msg.timeText = Math.floor(seconds / 60) + '分钟前';
        } else {
          msg.timeText = Math.floor(seconds / 3600) + '小时前';
        }
      }
    });
    
    console.log('添加用户消息:', {
      content: content,
      totalMessages: messages.length,
      newMessage: newMessage,
      allMessages: messages.map(m => ({ type: m.type, content: m.content.substring(0, 30) + '...' }))
    });
    
    // 计算消息数量
    const userMessageCount = messages.filter(m => m.type === 'user').length;
    const characterMessageCount = messages.filter(m => m.type === 'character').length;
    
    console.log('addUserMessage - setData调用前 - chatMessages长度:', this.data.chatMessages.length);
    
    this.setData({
      chatMessages: messages,
      userMessageCount: userMessageCount,
      characterMessageCount: characterMessageCount
    });
    
    console.log('addUserMessage - setData调用后 - chatMessages长度:', this.data.chatMessages.length);
    console.log('addUserMessage - setData调用后 - 验证数据:', {
      chatMessages: this.data.chatMessages,
      userMessageCount: this.data.userMessageCount,
      characterMessageCount: this.data.characterMessageCount
    });
    
    // 强制刷新视图 - 使用微信小程序的方式
    this.setData({
      forceUpdate: Date.now()
    });
    
    // 双重setData确保视图更新
    setTimeout(() => {
      this.setData({
        chatMessages: messages
      });
    }, 50);
  },

  addCharacterMessage(content) {
    const messages = this.data.chatMessages.slice();
    const newMessage = {
      type: 'character',
      content: content,
      timestamp: Date.now(),
      timeText: '刚刚'
    };
    
    messages.push(newMessage);
    
    // 保持最多10条消息，确保能正确计算对话来回次数
    if (messages.length > 10) {
      messages.splice(0, messages.length - 10);
    }
    
    // 格式化所有消息的时间显示
    messages.forEach(msg => {
      if (msg.timestamp && !msg.timeText) {
        const seconds = Math.floor((Date.now() - msg.timestamp) / 1000);
        if (seconds < 60) {
          msg.timeText = '刚刚';
        } else if (seconds < 3600) {
          msg.timeText = Math.floor(seconds / 60) + '分钟前';
        } else {
          msg.timeText = Math.floor(seconds / 3600) + '小时前';
        }
      }
    });
    
    console.log('添加角色消息:', {
      content: content,
      totalMessages: messages.length,
      newMessage: newMessage,
      allMessages: messages.map(m => ({ type: m.type, content: m.content.substring(0, 30) + '...' }))
    });
    
    // 计算消息数量
    const userMessageCount = messages.filter(m => m.type === 'user').length;
    const characterMessageCount = messages.filter(m => m.type === 'character').length;
    
    console.log('addCharacterMessage - setData调用前 - chatMessages长度:', this.data.chatMessages.length);
    
    this.setData({
      chatMessages: messages,
      userMessageCount: userMessageCount,
      characterMessageCount: characterMessageCount
    });
    
    console.log('addCharacterMessage - setData调用后 - chatMessages长度:', this.data.chatMessages.length);
    console.log('addCharacterMessage - setData调用后 - 验证数据:', {
      chatMessages: this.data.chatMessages,
      userMessageCount: this.data.userMessageCount,
      characterMessageCount: this.data.characterMessageCount
    });
    
    // 强制刷新视图 - 使用微信小程序的方式
    this.setData({
      forceUpdate: Date.now()
    });
    
    // 双重setData确保视图更新
    setTimeout(() => {
      this.setData({
        chatMessages: messages
      });
    }, 50);
    
    // 延迟检查视图状态
    setTimeout(() => {
      console.log('延迟检查 - 当前视图状态:', {
        showChat: this.data.showChat,
        chatMessagesLength: this.data.chatMessages.length,
        forceUpdate: this.data.forceUpdate
      });
    }, 100);
  },

  getAIResponse(userMessage) {
    commonMethods.info('用户发送消息', { messageLength: userMessage.length }, 'AI聊天');
    
    // 显示对话框内的加载动画
    this.setData({
      isChatLoading: true
    });

    const conversationHistory = this.data.chatMessages.map(function(msg) {
      return {
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      };
    });

    // 先获取API密钥
    wx.request({
      url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
      method: 'GET',
      data: {
        table: 'api_keys',
        action: 'get',
        key_name: 'deepseek_api_key'
      },
      success: (keyRes) => {
        if (keyRes.data && keyRes.data.key_value) {
          const apiKey = keyRes.data.key_value;
          
          // 使用获取到的API密钥调用DeepSeek
          wx.request({
            url: 'https://api.deepseek.com/v1/chat/completions',
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + apiKey
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
              // 隐藏对话框内的加载动画
              this.setData({
                isChatLoading: false
              });
              
              if (res.data && res.data.choices && res.data.choices[0]) {
                const aiResponse = res.data.choices[0].message.content;
                commonMethods.info('AI回复成功', { responseLength: aiResponse.length }, 'AI聊天');
                this.addCharacterMessage(aiResponse);
                
                // 检查视图状态
                setTimeout(() => {
                  this.checkViewState();
                }, 200);
              } else {
                commonMethods.warn('AI回复格式异常', res.data, 'AI聊天');
                this.addCharacterMessage('我理解你的感受，有什么想继续聊的吗？');
              }
            },
            fail: (err) => {
              // 隐藏对话框内的加载动画
              this.setData({
                isChatLoading: false
              });
              commonMethods.error('AI回复失败', err, 'AI聊天');
              this.addCharacterMessage('抱歉，我现在有点忙，稍后再聊好吗？');
              // 注意：AI调用失败时不生成情感报告
            }
          });
        } else {
          // 隐藏对话框内的加载动画
          this.setData({
            isChatLoading: false
          });
          commonMethods.error('获取API密钥失败', null, 'AI聊天');
          this.addCharacterMessage('抱歉，服务暂时不可用，请稍后再试');
        }
      },
      fail: (err) => {
        // 隐藏对话框内的加载动画
        this.setData({
          isChatLoading: false
        });
        commonMethods.error('获取API密钥失败', err, 'AI聊天');
        this.addCharacterMessage('抱歉，服务暂时不可用，请稍后再试');
      }
    });
  },

  generateEmotionReport() {
    // 检查是否有聊天内容，如果没有则不生成报告
    if (this.data.chatMessages.length === 0) {
      return;
    }
    
    // 检查是否只有角色欢迎语，如果是则不生成报告
    const messages = this.data.chatMessages;
    if (messages.length === 1 && messages[0].type === 'character' &&
        messages[0].content.includes('你好呀！我是鼠鼠')) {
      return;
    }
    
    // 检查对话来回次数，只有超过2个来回才生成报告
    const userMessages = messages.filter(msg => msg.type === 'user');
    const characterMessages = messages.filter(msg => msg.type === 'character');
    
    if (userMessages.length < 2 || characterMessages.length < 2) {
      return;
    }

    // 不显示加载提示，让用户知道正在生成
    this.setData({
      isGeneratingReport: true
    });

    const conversationText = this.data.chatMessages
      .map(function(msg) { return (msg.type === 'user' ? '用户' : '助手') + ': ' + msg.content; })
      .join('\n');

    // 先获取API密钥
    wx.request({
      url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
      method: 'GET',
      data: {
        table: 'api_keys',
        action: 'get',
        key_name: 'deepseek_api_key'
      },
      success: (keyRes) => {
        if (keyRes.data && keyRes.data.key_value) {
          const apiKey = keyRes.data.key_value;
          
          // 使用获取到的API密钥调用DeepSeek
          wx.request({
            url: 'https://api.deepseek.com/v1/chat/completions',
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + apiKey
            },
            data: {
              model: 'deepseek-chat',
              messages: [
                {
                  role: 'system',
                  content: '你是一个专业的情绪分析师。请分析用户对话中的情绪状态，并返回一个标准的JSON格式分析报告。要求：1. 只返回JSON格式，不要包含任何其他文字、代码块标记或解释 2. 必须包含以下字段：analysis（情绪分析，字符串）、suggestions（建议，字符串数组）、focusPoints（关注点，字符串数组）、trend（情绪趋势，字符串） 3. 确保JSON格式完全正确，可以被JSON.parse()直接解析 4. 不要使用反引号或其他特殊字符'
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
                  console.log('AI返回的原始内容:', reportText);
                  
                  // 调用调试函数
                  this.testJsonParsing(reportText);
                  
                  // 尝试多种方式解析JSON
                  let report = null;
                  
                  // 方法1: 直接解析
                  try {
                    report = JSON.parse(reportText);
                  } catch (parseError) {
                    console.log('直接解析失败，尝试清理内容:', parseError);
                    
                    // 方法2: 清理可能的Markdown代码块标记
                    let cleanedText = reportText;
                    
                    // 移除可能的Markdown代码块标记
                    cleanedText = cleanedText.replace(/```json\s*/g, '');
                    cleanedText = cleanedText.replace(/```\s*$/g, '');
                    cleanedText = cleanedText.replace(/^\s*```\s*/g, '');
                    
                    // 移除开头和结尾的空白字符
                    cleanedText = cleanedText.trim();
                    
                    // 尝试解析清理后的内容
                    try {
                      report = JSON.parse(cleanedText);
                      console.log('清理后解析成功');
                    } catch (secondError) {
                      console.log('清理后解析仍然失败:', secondError);
                      
                      // 方法3: 尝试提取JSON部分
                      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
                      if (jsonMatch) {
                        try {
                          report = JSON.parse(jsonMatch[0]);
                          console.log('提取JSON部分解析成功');
                        } catch (thirdError) {
                          console.log('提取JSON部分解析失败:', thirdError);
                        }
                      }
                    }
                  }
                  
                  // 验证解析结果
                  if (report && typeof report === 'object') {
                    // 确保必要字段存在，如果不存在则使用默认值
                    const validatedReport = {
                      analysis: report.analysis || '通过这次对话，我感受到你在情感表达上很真诚。',
                      suggestions: Array.isArray(report.suggestions) ? report.suggestions : ['保持开放的心态与伴侣交流'],
                      focusPoints: Array.isArray(report.focusPoints) ? report.focusPoints : ['情感表达的真实性'],
                      trend: report.trend || '情感状态稳定，有良好的沟通基础'
                    };
                    
                    this.setData({
                      emotionReport: validatedReport,
                      showEmotionReport: false, // 不直接显示报告
                      isGeneratingReport: false, // 停止生成状态
                      hasReportGenerated: true // 标记报告已生成
                    });
                    
                    // 抖动情感报告按钮
                    this.shakeReportButton();
                  } else {
                    console.error('解析结果无效，使用默认报告');
                    this.setData({
                      isGeneratingReport: false
                    });
                    this.showDefaultReport();
                  }
                } catch (e) {
                  console.error('处理报告失败:', e);
                  this.showDefaultReport();
                }
              } else {
                this.setData({
                  isGeneratingReport: false
                });
                this.showDefaultReport();
              }
            },
            fail: (err) => {
              wx.hideLoading();
              console.error('生成报告失败:', err);
              this.showDefaultReport();
            }
          });
        } else {
          console.error('获取API密钥失败');
          this.setData({
            isGeneratingReport: false
          });
          this.showDefaultReport();
        }
      },
      fail: (err) => {
        console.error('获取API密钥失败:', err);
        this.setData({
          isGeneratingReport: false
        });
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
      showEmotionReport: false, // 不直接显示
      hasReportGenerated: true // 标记报告已生成
    });
  },

  hideEmotionReport() {
    this.setData({
      showEmotionReport: false
    });
  },

  // 显示情感报告
  showEmotionReport() {
    this.setData({
      showEmotionReport: true
    });
  },
  
  // 检查视图状态
  checkViewState() {
    // 检查DOM元素
    const chatContainer = this.selectComponent('.chat-container');
    const chatBubbles = this.selectComponent('#chat-bubbles');
    
    // 检查WXML渲染状态
    const chatMessagesArray = this.data.chatMessages;
    const chatMessagesLength = this.data.chatMessages.length;
    const lastMessage = this.data.chatMessages[this.data.chatMessages.length - 1];
  },
  
  // 格式化时间显示
  formatTimeText(timestamp) {
    if (!timestamp) return '刚刚';
    
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) {
      return '刚刚';
    } else if (seconds < 3600) {
      return Math.floor(seconds / 60) + '分钟前';
    } else {
      return Math.floor(seconds / 3600) + '小时前';
    }
  },
  
  // 启动待机动作系统
  startIdleSystem() {
    // 清除可能存在的旧定时器
    if (this.data.idleTimer) {
      clearInterval(this.data.idleTimer);
    }
    
    // 启动待机检查定时器，每15秒检查一次
    const idleTimer = setInterval(() => {
      this.checkIdleStatus();
    }, 60000);
    
    this.setData({ idleTimer });
  },
  
  // 检查待机状态
  checkIdleStatus() {
    const now = Date.now();
    const timeSinceLastInteraction = now - this.data.lastInteractionTime;
    const idleThreshold = 15000; // 15秒
    
    if (timeSinceLastInteraction >= idleThreshold && !this.data.isIdle) {
      this.triggerIdleAction();
    }
  },
  
  // 触发待机动作
  triggerIdleAction() {
    // 设置待机状态
    this.setData({ isIdle: true });
    
    // 选择待机动作（比普通动作更温和）
    const idleActions = ['eyes', 'wink', 'napping', 'walk'];
    const randomAction = idleActions[Math.floor(Math.random() * idleActions.length)];
    
    // 执行待机动作
    this.executeCharacterAction(randomAction, true);
    
    // 3秒后恢复默认状态
    setTimeout(() => {
      this.setData({ 
        isIdle: false,
        currentAction: 'idle',
        characterImage: 'https://littlehome-1301530190.cos.ap-nanjing.myqcloud.com/shushu/shushu.png'
      });
    }, 3000);
  },
  
  // 执行角色动作（支持待机模式）
  executeCharacterAction(action, isIdle = false) {
    // 防抖处理：如果已经有定时器在运行，则清除它
    if (this.data.characterClickTimer) {
      clearTimeout(this.data.characterClickTimer);
    }
    
    // 先淡出当前图片
    this.setData({
      characterOpacity: 0
    });
    
    setTimeout(() => {
      // 使用网络加载GIF图片
      const characterImage = 'https://littlehome-1301530190.cos.ap-nanjing.myqcloud.com/shushu/' + action + '.gif';
      
      this.setData({
        characterImage: characterImage,
        currentAction: action,
        characterOpacity: 1
      });
      
      // 如果是待机动作，3秒后恢复；如果是点击动作，也是3秒后恢复
      setTimeout(() => {
        this.setData({
          characterImage: 'https://littlehome-1301530190.cos.ap-nanjing.myqcloud.com/shushu/shushu.png',
          currentAction: 'idle',
          characterOpacity: 1
        });
      }, 3000);
    }, 200);
  },

  // 抖动情感报告按钮
  shakeReportButton() {
    this.setData({
      reportButtonShaking: true
    });
    
    // 2秒后停止抖动
    setTimeout(() => {
      this.setData({
        reportButtonShaking: false
      });
    }, 2000);
  },
  
  // 页面卸载时清理资源
  onUnload() {
    // 清理待机定时器
    if (this.data.idleTimer) {
      clearInterval(this.data.idleTimer);
      console.log('清理待机定时器');
    }
    
    // 清理角色点击定时器
    if (this.data.characterClickTimer) {
      clearTimeout(this.data.characterClickTimer);
      console.log('清理角色点击定时器');
    }
  },

  // 调试函数：测试JSON解析
  testJsonParsing(jsonString) {
    console.log('=== JSON解析测试 ===');
    console.log('原始字符串:', jsonString);
    console.log('字符串长度:', jsonString.length);
    console.log('前10个字符:', jsonString.substring(0, 10));
    console.log('后10个字符:', jsonString.substring(jsonString.length - 10));
    
    // 检查是否包含特殊字符
    const specialChars = ['`', '```', '```json', '```\n', '\n```'];
    specialChars.forEach(char => {
      if (jsonString.includes(char)) {
        console.log(`发现特殊字符: "${char}" 在位置:`, jsonString.indexOf(char));
      }
    });
    
    // 尝试清理
    let cleaned = jsonString;
    cleaned = cleaned.replace(/```json\s*/g, '');
    cleaned = cleaned.replace(/```\s*$/g, '');
    cleaned = cleaned.replace(/^\s*```\s*/g, '');
    cleaned = cleaned.trim();
    
    console.log('清理后字符串:', cleaned);
    
    try {
      const parsed = JSON.parse(cleaned);
      console.log('解析成功:', parsed);
      return parsed;
    } catch (e) {
      console.log('解析失败:', e.message);
      return null;
    }
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
