// pages/daily_heart/daily_heart.js
Page({
  data: {
    sharedContent: '', // 用户输入的内容
    emotionTag: '', // 情绪标签
    isLoadingAI: false, // AI识别加载状态
    showHistoryModal: false, // 历史记录弹窗显示状态
    historyList: [], // 历史记录列表
    editingId: null, // 正在编辑的记录ID
    aiAnalysisHistory: [], // AI分析历史
    showAIAnalysisModal: false, // AI分析历史弹窗
    shareImageUrl: '' // 分享图片URL
  },

  // 输入内容更新
  onInputContent(e) {
    this.setData({
      sharedContent: e.detail.value
    });
  },

  // 分析情绪
  analyzeEmotion() {
    const content = this.data.sharedContent.trim();
    
    if (!content) {
      wx.showToast({
        title: '请先输入内容',
        icon: 'none'
      });
      return;
    }

    // 设置加载状态
    this.setData({
      isLoadingAI: true,
      emotionTag: 'AI识别中...'
    });

    // 调用DeepSeek API进行情绪分析
    wx.request({
      url: 'https://api.deepseek.com/chat/completions',
      method: 'POST',
      timeout: 30000, // 设置30秒超时
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-4c5a825922094bd2ba46f3fbd5b5113f'
      },
      data: {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的情绪分析师。请分析用户文字中的情绪状态，只返回一个最准确的情绪标签。可选标签：开心、快乐、兴奋、满足、平静、放松、期待、希望、感动、温暖、难过、悲伤、沮丧、失望、焦虑、紧张、愤怒、烦躁、孤独、寂寞、困惑、迷茫、感恩、感激、自豪、自信、害羞、尴尬、惊讶、震惊、恐惧、害怕、厌恶、讨厌、嫉妒、羡慕、愧疚、后悔、内疚、释然、解脱、无奈、无力、疲惫、累、无聊、空虚、思念、想念、怀念、回忆、憧憬、向往、向往、期待、期待、期待。请只返回一个情绪标签，不要解释。'
          },
          {
            role: 'user',
            content: `请分析以下文字的情绪状态：${content}`
          }
        ],
        stream: false,
        temperature: 0.3
      },
      success: (res) => {
        console.log('DeepSeek API响应状态码:', res.statusCode);
        console.log('DeepSeek API响应数据:', res.data);
        
        if (res.statusCode === 200 && res.data.choices && res.data.choices[0]) {
          const emotion = res.data.choices[0].message.content.trim();
          console.log('识别到的情绪:', emotion);
          
          // 保存AI分析历史
          const analysisRecord = {
            id: Date.now(),
            content: content,
            emotion: emotion,
            timestamp: new Date().toLocaleString()
          };
          
          const newHistory = [analysisRecord, ...this.data.aiAnalysisHistory];
          this.setData({
            emotionTag: emotion,
            isLoadingAI: false,
            aiAnalysisHistory: newHistory.slice(0, 20) // 只保留最近20条记录
          });
          
          wx.showToast({
            title: '情绪识别完成',
            icon: 'success'
          });
        } else {
          console.error('API返回数据格式错误:', res.data);
          throw new Error('API返回数据格式错误');
        }
      },
      fail: (err) => {
        console.error('DeepSeek API调用失败:', err);
        console.error('错误详情:', err.errMsg);
        
        this.setData({
          emotionTag: '识别失败',
          isLoadingAI: false
        });
        
        let errorMsg = '情绪识别失败，请重试';
        if (err.errMsg && err.errMsg.includes('timeout')) {
          errorMsg = '网络超时，请检查网络连接';
        } else if (err.errMsg && err.errMsg.includes('fail')) {
          errorMsg = '网络请求失败，请检查域名配置';
        }
        
        wx.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000
        });
      }
    });
  },

  // 发布内容
  publishContent() {
    const content = this.data.sharedContent.trim();
    
    if (!content) {
      wx.showToast({
        title: '请先输入内容',
        icon: 'none'
      });
      return;
    }

    const isEditing = this.data.editingId !== null;
    const action = isEditing ? 'update' : 'add';
        const requestData = {
            table: 'daily_heart',
            action: action,
            openid: getApp().getAccount(),
            content: content,
            emotion: this.data.emotionTag || '无',
            emotion_confidence: this.data.emotionTag ? 0.8 : 0
        };

        // 如果是编辑模式，添加ID
        if (isEditing) {
          requestData.id = this.data.editingId;
        }

    // 发送到云函数保存
    console.log('发送的请求数据:', JSON.stringify(requestData, null, 2));
    wx.request({
      url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
      method: 'GET',
      data: requestData,
      success: (res) => {
        console.log(isEditing ? '更新成功:' : '发布成功:', res.data);
        
        // 检查云函数返回的错误信息
        if (res.data && res.data.message && res.data.message.includes('错误')) {
          console.error('云函数返回错误:', res.data.message);
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 3000
          });
          return;
        }
        
        wx.showToast({
          title: isEditing ? '更新成功' : '发布成功',
          icon: 'success'
        });

        // 清空内容和编辑状态
        this.setData({
          sharedContent: '',
          emotionTag: '',
          editingId: null
        });
      },
      fail: (err) => {
        console.error(isEditing ? '更新失败:' : '发布失败:', err);
        wx.showToast({
          title: isEditing ? '更新失败，请重试' : '发布失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  onLoad() {
    // 等待OpenID获取完成后再初始化
    this.waitForOpenIDAndInit();
    
    // 延迟预生成分享图片
    setTimeout(() => {
      this.generateShareImage();
    }, 1000);
  },

  // 等待OpenID获取完成并初始化
  waitForOpenIDAndInit() {
    const maxAttempts = 10; // 最大尝试次数
    let attempts = 0;
    
    const checkOpenID = () => {
      attempts++;
      const openid = getApp().getAccount();
      
      if (openid) {
        console.log('OpenID已获取，开始初始化心意页面:', openid);
        // OpenID已获取，执行初始化
        this.getUserInfo();
        this.loadHistory();
      } else if (attempts < maxAttempts) {
        console.log(`OpenID未获取，第${attempts}次重试...`);
        // 继续等待
        setTimeout(checkOpenID, 500);
      } else {
        console.log('OpenID获取超时，使用默认状态');
        // 超时后使用默认状态
        this.setData({ 
          userInfo: {
            nickName: '未登录用户',
            avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg'
          },
          historyList: []
        });
      }
    };
    
    // 开始检查
    checkOpenID();
  },

  onShow() {
    // 页面显示时的逻辑
  },

  // 显示历史记录
  showHistory() {
    this.loadHistory();
    this.setData({
      showHistoryModal: true
    });
  },

  // 隐藏历史记录
  hideHistory() {
    this.setData({
      showHistoryModal: false
    });
  },

  // 获取用户信息
  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
      console.log('用户信息获取完成:', userInfo);
    } else {
      // 如果没有用户信息，设置默认值
      this.setData({
        userInfo: {
          nickName: '未登录用户',
          avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg'
        }
      });
      console.log('使用默认用户信息');
    }
  },

  // 加载历史记录
  loadHistory() {
    const openid = getApp().getAccount();
    if (!openid) {
      console.log('OpenID未获取，无法加载历史记录');
      this.setData({ history: [] });
      return;
    }

    wx.request({
      url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
      method: 'GET',
      data: {
        table: 'daily_heart',
        action: 'list',
        openid
      },
      success: res => {
        console.log('加载历史记录响应:', res.data);
        try {
          let result = res.data;
          if (typeof result === 'string') {
            try { result = JSON.parse(result); } catch (e) {}
          }
          
          if (Array.isArray(result)) {
            // 按时间倒序排列
            const sortedHistory = result.sort((a, b) => {
              return new Date(b.created_at) - new Date(a.created_at);
            });
            this.setData({ historyList: sortedHistory });
            console.log('历史记录加载完成，共', sortedHistory.length, '条');
          } else {
            this.setData({ historyList: [] });
            console.log('历史记录为空');
          }
        } catch (error) {
          console.error('解析历史记录失败:', error);
          this.setData({ historyList: [] });
        }
      },
      fail: err => {
        console.error('加载历史记录失败:', err);
        this.setData({ historyList: [] });
      }
    });
  },

  // 编辑记录
  editRecord(e) {
    const { id, content, emotion } = e.currentTarget.dataset;
    this.setData({
      sharedContent: content,
      emotionTag: emotion || '',
      editingId: id,
      showHistoryModal: false
    });
  },

  // 删除记录
  deleteRecord(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条心情记录吗？',
      success: (res) => {
        if (res.confirm) {
                      wx.request({
              url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
              method: 'GET',
                            data: {
                table: 'daily_heart',
                action: 'delete',
                id: id,
                openid: getApp().getAccount()
              },
            success: (res) => {
              console.log('删除成功:', res.data);
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
              this.loadHistory(); // 重新加载列表
            },
            fail: (err) => {
              console.error('删除失败:', err);
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  },

  // 显示AI分析历史
  showAIAnalysisHistory() {
    this.setData({
      showAIAnalysisModal: true
    });
  },

  // 隐藏AI分析历史
  hideAIAnalysisHistory() {
    this.setData({
      showAIAnalysisModal: false
    });
  },

  // 重新分析历史记录
  reanalyzeHistory(e) {
    const { content } = e.currentTarget.dataset;
    this.setData({
      sharedContent: content,
      showAIAnalysisModal: false
    });
    
    // 自动触发分析
    setTimeout(() => {
      this.analyzeEmotion();
    }, 100);
  },

  // 页面转发功能
  onShareAppMessage() {
    // 如果已有分享图片，直接使用；否则使用默认图片
    if (this.data.shareImageUrl) {
      return {
        title: 'LittleHome - 日日心意，记录美好心情',
        path: '/pages/daily_heart/daily_heart',
        imageUrl: this.data.shareImageUrl
      };
    } else {
      return {
        title: 'LittleHome - 日日心意，记录美好心情',
        path: '/pages/daily_heart/daily_heart',
        imageUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/share-heart.jpg'
      };
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    // 如果已有分享图片，直接使用；否则使用默认图片
    if (this.data.shareImageUrl) {
      return {
        title: 'LittleHome - 日日心意，记录美好心情',
        query: '',
        imageUrl: this.data.shareImageUrl
      };
    } else {
      return {
        title: 'LittleHome - 日日心意，记录美好心情',
        query: '',
        imageUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/share-heart.jpg'
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
        ctx.fillText('日日心意', canvasWidth / 2, 55);
        
        // 绘制当前心情
        if (this.data.emotionTag && this.data.emotionTag !== 'AI识别中...' && this.data.emotionTag !== '识别失败') {
          ctx.setFillStyle('#2C1810');
          ctx.setFontSize(16);
          ctx.setTextAlign('center');
          ctx.fillText('今日心情: ' + this.data.emotionTag, canvasWidth / 2, 120);
        }
        
        // 绘制内容预览
        if (this.data.sharedContent) {
          ctx.setFillStyle('#9A8C82');
          ctx.setFontSize(12);
          ctx.setTextAlign('center');
          const content = this.data.sharedContent.length > 20 ? 
            this.data.sharedContent.substring(0, 20) + '...' : 
            this.data.sharedContent;
          ctx.fillText(content, canvasWidth / 2, 150);
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
  }
}); 