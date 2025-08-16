// pages/souvenirs/souvenirs.js
const app = getApp()

Page({
  data: {
    // 页面状态
    currentCategory: 'all',
    showDetailModal: false,
    showCartModal: false,
    
    // 商品数据
    souvenirs: [],
    filteredSouvenirs: [],
    selectedSouvenir: null,
    
    // 定制选项
    selectedTemplate: '',
    selectedStyle: '',
    selectedSize: '',
    quantity: 1,
    
    // 购物车
    cartItems: [],
    cartItemCount: 0,
    cartTotal: 0,
    shareImageUrl: '' // 新增：用于存储分享图片路径
  },

  onLoad() {
    // 初始化数据
    this.initData();
    
    // 延迟预生成分享图片
    setTimeout(() => {
      this.generateShareImage();
    }, 1000);
  },

  onShow() {
    // 页面显示时刷新购物车
    this.loadCart()
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 初始化数据
  initData() {
    this.loadSouvenirs();
    this.loadCart();
    console.log('纪念品页面数据初始化完成');
  },

  // 加载纪念品数据
  loadSouvenirs() {
    const mockSouvenirs = [
      {
        id: 1,
        name: '定制日常回忆录',
        description: '将共享日常整理成精美定制的实体书',
        fullDescription: '将你们在"LittleHome"中记录的共享日常（包括文字、精选照片、视频截图和语音文本摘要）整理编辑，根据选择的模板定制成一本精美的实体回忆录。每一页都承载着你们的美好回忆，是独一无二的情感收藏。',
        points: 128,
        originalPoints: 168,
        image: '',
        images: [

        ],
        category: 'book',
        rating: 4.8,
        ratingCount: 156,
        isNew: true,
        isHot: true,
        tags: ['回忆录', '定制', '实体书'],
        templates: [
          { id: 'simple', name: '简约温情', preview: '' },
          { id: 'fresh', name: '清新插画', preview: '' },
          { id: 'vintage', name: '复古胶片', preview: '' },
          { id: 'modern', name: '现代手账', preview: '' }
        ],
        sizes: [
          { id: 'small', name: '小尺寸', description: 'A5大小，适合随身携带', pointsAdjustment: 0 },
          { id: 'medium', name: '标准尺寸', description: 'A4大小，经典选择', pointsAdjustment: 20 },
          { id: 'large', name: '大尺寸', description: 'A3大小，豪华收藏版', pointsAdjustment: 50 }
        ],
        reviews: [
          {
            id: 1,
            name: '小美',
            avatar: '/images/avatar1.png',
            date: '2024-01-15',
            content: '收到回忆录的那一刻真的很感动，每一页都承载着我们的美好回忆，质量也很好！',
            images: ['/images/review1.jpg']
          },
          {
            id: 2,
            name: '小明',
            avatar: '/images/avatar2.png',
            date: '2024-01-10',
            content: '定制过程很顺利，客服很耐心，成品超出预期，强烈推荐！'
          }
        ]
      },
      {
        id: 2,
        name: '漫想相册',
        description: 'AI将照片转化为指定艺术风格的插画',
        fullDescription: '选择你们"情侣相册集"中的照片，通过AI智能转化技术，一键生成指定漫画/艺术风格的插画，最终制作成一本充满趣味的情侣专属画册。让你们的照片以全新的艺术形式呈现。',
        points: 98,
        originalPoints: 128,
        image: '',
        images: [

        ],
        category: 'album',
        rating: 4.6,
        ratingCount: 89,
        isHot: true,
        tags: ['相册', 'AI', '艺术风格'],
        styles: [
          { id: 'anime', name: '日系动漫', icon: '🎌' },
          { id: 'cyberpunk', name: '赛博朋克', icon: '🤖' },
          { id: 'oil', name: '油画复古', icon: '🎨' },
          { id: 'ink', name: '水墨写意', icon: '🖋️' },
          { id: 'cute', name: '卡通Q萌', icon: '🐱' }
        ],
        sizes: [
          { id: 'small', name: '小尺寸', description: '15x15cm，精致便携', pointsAdjustment: 0 },
          { id: 'medium', name: '标准尺寸', description: '20x20cm，经典选择', pointsAdjustment: 15 },
          { id: 'large', name: '大尺寸', description: '25x25cm，豪华收藏', pointsAdjustment: 30 }
        ],
        reviews: [
          {
            id: 3,
            name: '小红',
            avatar: '',
            date: '2024-01-12',
            content: 'AI转换的效果很棒，照片变成了可爱的动漫风格，很有创意！',
            images: []
          }
        ]
      },
      {
        id: 3,
        name: '情侣泥塑雕像',
        description: '手工打造独一无二的情侣雕像艺术品',
        fullDescription: '选择你们的甜蜜照片，由专业匠人手工打造独一无二的泥塑雕像，将幸福的瞬间定格成永恒的艺术品。每一件都是独一无二的手工艺术品，承载着你们深厚的感情。',
        points: 298,
        originalPoints: 398,
        image: '',
        images: [

        ],
        category: 'sculpture',
        rating: 4.9,
        ratingCount: 67,
        isNew: true,
        tags: ['雕像', '手工', '艺术品'],
        styles: [
          { id: 'cute', name: 'Q版卡通', icon: '😊' },
          { id: 'realistic', name: '写实浪漫', icon: '💕' },
          { id: 'abstract', name: '艺术抽象', icon: '🎭' }
        ],
        sizes: [
          { id: 'small', name: '小尺寸', description: '8cm高，桌面摆件', pointsAdjustment: 0 },
          { id: 'medium', name: '标准尺寸', description: '12cm高，经典选择', pointsAdjustment: 50 },
          { id: 'large', name: '大尺寸', description: '18cm高，收藏级别', pointsAdjustment: 100 }
        ],
        reviews: [
          {
            id: 4,
            name: '小李',
            avatar: '',
            date: '2024-01-08',
            content: '雕像做工非常精细，完全还原了我们的样子，放在家里很有纪念意义！',
            images: ['']
          }
        ]
      }
    ]

    this.setData({
      souvenirs: mockSouvenirs,
      filteredSouvenirs: mockSouvenirs
    })
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category
    })
    this.filterSouvenirs()
  },

  // 筛选商品
  filterSouvenirs() {
    let filtered = this.data.souvenirs
    
    if (this.data.currentCategory !== 'all') {
      filtered = filtered.filter(item => item.category === this.data.currentCategory)
    }
    
    this.setData({
      filteredSouvenirs: filtered
    })
  },

  // 查看商品详情
  viewSouvenirDetail(e) {
    const id = e.currentTarget.dataset.id
    const souvenir = this.data.souvenirs.find(item => item.id === id)
    
    if (souvenir) {
      this.setData({
        selectedSouvenir: souvenir,
        showDetailModal: true,
        selectedTemplate: souvenir.templates ? souvenir.templates[0].id : '',
        selectedStyle: souvenir.styles ? souvenir.styles[0].id : '',
        selectedSize: souvenir.sizes ? souvenir.sizes[0].id : '',
        quantity: 1
      })
      this.calculateTotalPoints()
    }
  },

  // 隐藏详情弹窗
  hideDetailModal() {
    this.setData({
      showDetailModal: false,
      selectedSouvenir: null
    })
  },

  // 选择模板
  selectTemplate(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      selectedTemplate: id
    })
    this.calculateTotalPoints()
  },

  // 选择风格
  selectStyle(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      selectedStyle: id
    })
    this.calculateTotalPoints()
  },

  // 选择尺寸
  selectSize(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      selectedSize: id
    })
    this.calculateTotalPoints()
  },

  // 增加数量
  increaseQuantity() {
    this.setData({
      quantity: this.data.quantity + 1
    })
    this.calculateTotalPoints()
  },

  // 减少数量
  decreaseQuantity() {
    if (this.data.quantity > 1) {
      this.setData({
        quantity: this.data.quantity - 1
      })
      this.calculateTotalPoints()
    }
  },

  // 计算总积分
  calculateTotalPoints() {
    if (!this.data.selectedSouvenir) return
    
    let basePoints = this.data.selectedSouvenir.points
    let sizeAdjustment = 0
    
    // 计算尺寸积分调整
    if (this.data.selectedSouvenir.sizes && this.data.selectedSize) {
      const selectedSizeObj = this.data.selectedSouvenir.sizes.find(
        size => size.id === this.data.selectedSize
      )
      if (selectedSizeObj) {
        sizeAdjustment = selectedSizeObj.pointsAdjustment
      }
    }
    
    const totalPoints = (basePoints + sizeAdjustment) * this.data.quantity
    
    this.setData({
      totalPoints: totalPoints
    })
  },

  // 加入购物车
  addToCart() {
    if (!this.data.selectedSouvenir) return
    
    const cartItem = {
      id: Date.now(),
      souvenirId: this.data.selectedSouvenir.id,
      name: this.data.selectedSouvenir.name,
      image: this.data.selectedSouvenir.image,
      points: this.data.totalPoints / this.data.quantity,
      quantity: this.data.quantity,
      options: this.getOptionsText()
    }
    
    const cartItems = [...this.data.cartItems, cartItem]
    
    this.setData({
      cartItems: cartItems
    })
    
    this.updateCart()
    this.hideDetailModal()
    
    wx.showToast({
      title: '已加入购物车',
      icon: 'success'
    })
  },

  // 获取选项文本
  getOptionsText() {
    const options = []
    
    if (this.data.selectedTemplate) {
      const template = this.data.selectedSouvenir.templates.find(t => t.id === this.data.selectedTemplate)
      if (template) options.push(template.name)
    }
    
    if (this.data.selectedStyle) {
      const style = this.data.selectedSouvenir.styles.find(s => s.id === this.data.selectedStyle)
      if (style) options.push(style.name)
    }
    
    if (this.data.selectedSize) {
      const size = this.data.selectedSouvenir.sizes.find(s => s.id === this.data.selectedSize)
      if (size) options.push(size.name)
    }
    
    return options.join('、')
  },

  // 立即购买
  buyNow() {
    this.addToCart()
    this.showCartModal()
  },

  // 显示购物车
  showCartModal() {
    this.setData({
      showCartModal: true
    })
  },

  // 隐藏购物车
  hideCartModal() {
    this.setData({
      showCartModal: false
    })
  },

  // 加载购物车
  loadCart() {
    const cartItems = wx.getStorageSync('cartItems') || []
    this.setData({
      cartItems: cartItems
    })
    this.updateCart()
  },

  // 更新购物车
  updateCart() {
    const cartItems = this.data.cartItems
    const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
    const cartTotal = cartItems.reduce((total, item) => total + (item.points * item.quantity), 0)
    
    this.setData({
      cartItemCount: cartItemCount,
      cartTotal: cartTotal
    })
    
    wx.setStorageSync('cartItems', cartItems)
  },

  // 增加购物车商品数量
  increaseCartQuantity(e) {
    const id = e.currentTarget.dataset.id
    const cartItems = this.data.cartItems.map(item => {
      if (item.id === id) {
        return { ...item, quantity: item.quantity + 1 }
      }
      return item
    })
    
    this.setData({
      cartItems: cartItems
    })
    this.updateCart()
  },

  // 减少购物车商品数量
  decreaseCartQuantity(e) {
    const id = e.currentTarget.dataset.id
    const cartItems = this.data.cartItems.map(item => {
      if (item.id === id && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 }
      }
      return item
    })
    
    this.setData({
      cartItems: cartItems
    })
    this.updateCart()
  },

  // 从购物车移除
  removeFromCart(e) {
    const id = e.currentTarget.dataset.id
    const cartItems = this.data.cartItems.filter(item => item.id !== id)
    
    this.setData({
      cartItems: cartItems
    })
    this.updateCart()
    
    wx.showToast({
      title: '已移除',
      icon: 'success'
    })
  },

  // 结算
  checkout() {
    if (this.data.cartItems.length === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      })
      return
    }
    
    // 检查用户积分是否足够
    const app = getApp()
    const userPoints = wx.getStorageSync('points') || 0
    
    if (userPoints < this.data.cartTotal) {
      wx.showModal({
        title: '积分不足',
        content: `您的积分不足，需要${this.data.cartTotal}积分，当前只有${userPoints}积分`,
        showCancel: false
      })
      return
    }
    
    // 确认兑换
    wx.showModal({
      title: '确认兑换',
      content: `总计：${this.data.cartTotal}积分\n确认兑换吗？`,
      success: (res) => {
        if (res.confirm) {
          this.processExchange()
        }
      }
    })
  },

  // 处理兑换
  processExchange() {
    wx.showLoading({
      title: '处理中...'
    })
    
    setTimeout(() => {
      // 扣除用户积分
      const currentPoints = wx.getStorageSync('points') || 0
      const newPoints = currentPoints - this.data.cartTotal
      wx.setStorageSync('points', newPoints)
      
      // 清空购物车
      this.setData({
        cartItems: []
      })
      this.updateCart()
      
      wx.hideLoading()
      wx.showToast({
        title: '兑换成功',
        icon: 'success'
      })
      
      // 跳转到订单页面（如果有的话）
      wx.showModal({
        title: '订单创建成功',
        content: '您的定制纪念品订单已创建，我们将在7-15个工作日内完成制作并寄出。',
        showCancel: false
      })
    }, 2000)
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 分享功能
  onShareAppMessage() {
    // 如果已有分享图片，直接使用；否则使用默认图片
    if (this.data.shareImageUrl) {
      return {
        title: 'LittleHome - 定制化情侣纪念品',
        path: '/pages/souvenirs/souvenirs',
        imageUrl: this.data.shareImageUrl
      };
    } else {
      return {
        title: 'LittleHome - 定制化情侣纪念品',
        path: '/pages/souvenirs/souvenirs',
        imageUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/share-souvenirs.jpg'
      };
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    // 如果已有分享图片，直接使用；否则使用默认图片
    if (this.data.shareImageUrl) {
      return {
        title: 'LittleHome - 定制化情侣纪念品',
        query: '',
        imageUrl: this.data.shareImageUrl
      };
    } else {
      return {
        title: 'LittleHome - 定制化情侣纪念品',
        query: '',
        imageUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/share-souvenirs.jpg'
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
        ctx.fillText('定制纪念品', canvasWidth / 2, 55);
        
        // 绘制当前分类
        const categoryNames = {
          'all': '全部纪念品',
          'book': '回忆录',
          'album': '相册',
          'sculpture': '雕像'
        };
        const currentCategory = categoryNames[this.data.currentCategory] || '全部纪念品';
        ctx.setFillStyle('#2C1810');
        ctx.setFontSize(14);
        ctx.setTextAlign('center');
        ctx.fillText('当前: ' + currentCategory, canvasWidth / 2, 120);
        
        // 绘制商品数量
        if (this.data.filteredSouvenirs) {
          ctx.setFillStyle('#9A8C82');
          ctx.setFontSize(12);
          ctx.setTextAlign('center');
          ctx.fillText('共 ' + this.data.filteredSouvenirs.length + ' 件商品', canvasWidth / 2, 150);
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

  // 下拉刷新
  onPullDownRefresh() {
    this.loadSouvenirs()
    this.loadCart()
    
    setTimeout(() => {
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '刷新完成',
        icon: 'success'
      })
    }, 1000)
  }
}) 