// pages/activity_customization/activity_customization.js
Page({
    data: {
      // 页面状态
      currentTab: 'gift', // gift: 礼物建议, activity: 活动建议
      loading: false,
      
      // 礼物推荐相关
      giftBudget: '',
      giftOccasion: '',
      giftRecommendations: [],
      
      // 活动推荐相关
      activityBudget: '',
      activityType: '',
      activityDuration: '',
      activityRecommendations: [],
      
      // 用户画像数据
      userProfile: {
        // 基本信息
        name: '',
        age: '',
        gender: '',
        province: '',
        city: '',
        occupation: '',
        incomeLevel: '',
        
        // 性格特征
        personality: [],
        personalityTags: ['外向', '内向', '浪漫', '务实', '创意', '理性', '活泼', '安静', '独立', '依赖'],
        
        // 兴趣爱好
        interests: [],
        interestOptions: ['电影', '音乐', '阅读', '运动', '美食', '旅行', '摄影', '游戏', '手工', '科技', '时尚', '艺术', '宠物', '园艺', '收藏'],
        
        // 生活习惯
        lifestyle: [],
        lifestyleOptions: ['早睡早起', '夜猫子', '健康饮食', '喜欢外卖', '爱运动', '宅家', '社交达人', '独处时光', '追求品质', '实用主义'],
        
        // 当前需求
        currentNeeds: '',
        needOptions: ['工作压力大需要放松', '正在准备考试', '对某个领域感兴趣', '想要改变生活', '寻找新的爱好', '改善健康', '提升技能', '社交需求'],
        
        // 礼物偏好
        giftPreferences: [],
        giftPreferenceOptions: ['实用型', '浪漫型', '创意型', '奢侈型', '手工型', '科技型', '传统型', '个性化'],
        
        // 预算范围
        budgetRange: '',
        budgetOptions: ['100元以下', '100-300元', '300-500元', '500-1000元', '1000-2000元', '2000元以上'],
        
        // 送礼历史
        giftHistory: []
      },
      partnerProfile: {
        // 基本信息
        name: '',
        age: '',
        gender: '',
        province: '',
        city: '',
        occupation: '',
        incomeLevel: '',
        
        // 性格特征
        personality: [],
        personalityTags: ['外向', '内向', '浪漫', '务实', '创意', '理性', '活泼', '安静', '独立', '依赖'],
        
        // 兴趣爱好
        interests: [],
        interestOptions: ['电影', '音乐', '阅读', '运动', '美食', '旅行', '摄影', '游戏', '手工', '科技', '时尚', '艺术', '宠物', '园艺', '收藏'],
        
        // 生活习惯
        lifestyle: [],
        lifestyleOptions: ['早睡早起', '夜猫子', '健康饮食', '喜欢外卖', '爱运动', '宅家', '社交达人', '独处时光', '追求品质', '实用主义'],
        
        // 当前需求
        currentNeeds: '',
        needOptions: ['工作压力大需要放松', '正在准备考试', '对某个领域感兴趣', '想要改变生活', '寻找新的爱好', '改善健康', '提升技能', '社交需求'],
        
        // 礼物偏好
        giftPreferences: [],
        giftPreferenceOptions: ['实用型', '浪漫型', '创意型', '奢侈型', '手工型', '科技型', '传统型', '个性化'],
        
        // 预算范围
        budgetRange: '',
        budgetOptions: ['100元以下', '100-300元', '300-500元', '500-1000元', '1000-2000元', '2000元以上'],
        
        // 送礼历史
        giftHistory: []
      },
      
      // 省市数据
      regionData: {
        provinces: ['北京市', '天津市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '重庆市', '四川省', '贵州省', '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区', '台湾省', '香港特别行政区', '澳门特别行政区'],
        cities: {
          '北京市': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云区', '延庆区'],
          '天津市': ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '东丽区', '西青区', '津南区', '北辰区', '武清区', '宝坻区', '滨海新区', '宁河区', '静海区', '蓟州区'],
          '河北省': ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'],
          '山西省': ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市'],
          '内蒙古自治区': ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '兴安盟', '锡林郭勒盟', '阿拉善盟'],
          '辽宁省': ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市'],
          '吉林省': ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '延边朝鲜族自治州'],
          '黑龙江省': ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市', '大兴安岭地区'],
          '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '浦东新区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区'],
          '江苏省': ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市'],
          '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'],
          '安徽省': ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市'],
          '福建省': ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'],
          '江西省': ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市'],
          '山东省': ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '莱芜市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市'],
          '河南省': ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市', '济源市'],
          '湖北省': ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市', '恩施土家族苗族自治州'],
          '湖南省': ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市', '湘西土家族苗族自治州'],
          '广东省': ['广州市', '韶关市', '深圳市', '珠海市', '汕头市', '佛山市', '江门市', '湛江市', '茂名市', '肇庆市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市'],
          '广西壮族自治区': ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市'],
          '海南省': ['海口市', '三亚市', '三沙市', '儋州市'],
          '重庆市': ['渝中区', '大渡口区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区', '綦江区', '大足区', '渝北区', '巴南区', '黔江区', '长寿区', '江津区', '合川区', '永川区', '南川区', '璧山区', '铜梁区', '潼南区', '荣昌区', '梁平区', '城口县', '丰都县', '垫江县', '武隆区', '忠县', '开州区', '云阳县', '奉节县', '巫山县', '巫溪县', '石柱土家族自治县', '秀山土家族苗族自治县', '酉阳土家族苗族自治县', '彭水苗族土家族自治县'],
          '四川省': ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市', '阿坝藏族羌族自治州', '甘孜藏族自治州', '凉山彝族自治州'],
          '贵州省': ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市', '黔西南布依族苗族自治州', '黔东南苗族侗族自治州', '黔南布依族苗族自治州'],
          '云南省': ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市', '楚雄彝族自治州', '红河哈尼族彝族自治州', '文山壮族苗族自治州', '西双版纳傣族自治州', '大理白族自治州', '德宏傣族景颇族自治州', '怒江傈僳族自治州', '迪庆藏族自治州'],
          '西藏自治区': ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市', '阿里地区'],
          '陕西省': ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市'],
          '甘肃省': ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '庆阳市', '定西市', '陇南市', '临夏回族自治州', '甘南藏族自治州'],
          '青海省': ['西宁市', '海东市', '海北藏族自治州', '黄南藏族自治州', '海南藏族自治州', '果洛藏族自治州', '玉树藏族自治州', '海西蒙古族藏族自治州'],
          '宁夏回族自治区': ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
          '新疆维吾尔自治区': ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉回族自治州', '博尔塔拉蒙古自治州', '巴音郭楞蒙古自治州', '阿克苏地区', '克孜勒苏柯尔克孜自治州', '喀什地区', '和田地区', '伊犁哈萨克自治州', '塔城地区', '阿勒泰地区']
        }
      },
      
      // 职业选项
      occupationOptions: ['不填写', '学生', '教师', '医生', '护士', '工程师', '程序员', '设计师', '销售', '市场', '财务', '会计', '律师', '公务员', '警察', '军人', '司机', '厨师', '服务员', '工人', '农民', '自由职业', '创业者', '企业主', '退休人员', '其他'],
      
      // 关系信息
      relationshipInfo: {
        // 恋爱状态
        relationshipStatus: '',
        statusOptions: ['热恋期', '稳定期', '异地恋', '新婚', '长期伴侣'],
        
        // 恋爱时长
        relationshipDuration: '',
        durationOptions: ['1个月以内', '1-6个月', '6个月-1年', '1-2年', '2-5年', '5年以上'],
        
        // 见面频率
        meetingFrequency: '',
        frequencyOptions: ['每天见面', '每周几次', '每周一次', '每月几次', '每月一次', '很少见面'],
        
        // 沟通方式
        communicationMethods: [],
        communicationOptions: ['微信聊天', '视频通话', '语音通话', '短信', '邮件', '写信', '面对面'],
        
        // 共同爱好
        commonInterests: [],
        
        // 重要纪念日
        importantDates: [],
        
        // 日常互动习惯
        dailyInteractions: [],
        interactionOptions: ['早安晚安', '分享日常', '一起看剧', '一起游戏', '一起运动', '一起学习', '一起做饭', '一起旅行']
      },
      
      // 日日心意相关
      dailyHeartInfo: {
        // 心意记录
        heartRecords: [],
        
        // 情感状态
        emotionalState: '',
        emotionalOptions: ['开心', '平静', '疲惫', '兴奋', '焦虑', '满足', '期待', '思念'],
        
        // 今日心情
        todayMood: '',
        moodOptions: ['很好', '不错', '一般', '有点低落', '很糟糕'],
        
        // 想要表达的话
        wantToSay: '',
        
        // 希望收到的关心
        wantToReceive: '',
        receiveOptions: ['陪伴', '鼓励', '安慰', '惊喜', '理解', '支持', '赞美', '拥抱'],
        
        // 特殊需求
        specialNeeds: '',
        
        // 最近困扰
        recentConcerns: '',
        
        // 关注点
        focus: [],
        focusOptions: ['工作', '学习', '健康', '感情', '家庭', '朋友', '兴趣', '未来规划']
      },
      
      // 礼物推荐数据
      giftRecommendations: [],
      giftBudget: '',
      giftOccasion: '',
      
      // 活动推荐数据
      activityRecommendations: [],
      activityBudget: '',
      activityType: 'online', // online, local, hybrid
      activityDuration: '',
      
      // 商城数据
      mallProducts: [],
      selectedProduct: null,
      
      // 攻略平台数据
      guides: [],
      selectedGuide: null,
      
      // 表单数据
      showProfileForm: false,
      showGiftForm: false,
      showActivityForm: false,
      currentFormStep: 1, // 1: 基本信息, 2: 性格兴趣, 3: 关系信息, 4: 日日心意
      
      // 天气数据
      weatherData: {
        userLocation: '',
        partnerLocation: '',
        userWeather: {},
        partnerWeather: {}
      },

      // 分享图片
      shareImageUrl: ''
    },
  
    onLoad() {
      this.initUserProfile()
      this.loadUserData()
      this.loadMallProducts()
      this.loadGuides()
      this.getWeatherData()
    },
  
    // 加载用户数据
    loadUserData() {
      const userProfile = wx.getStorageSync('userProfile') || this.data.userProfile
      const partnerProfile = wx.getStorageSync('partnerProfile') || this.data.partnerProfile
      const relationshipInfo = wx.getStorageSync('relationshipInfo') || this.data.relationshipInfo
      const dailyHeartInfo = wx.getStorageSync('dailyHeartInfo') || this.data.dailyHeartInfo
      
      this.setData({
        userProfile,
        partnerProfile,
        relationshipInfo,
        dailyHeartInfo
      })
    },
  
    // 加载推荐数据
    loadRecommendations() {
      // 移除自动加载推荐数据，只在用户主动使用AI推荐功能时生成
      // AI推荐数据现在通过 generateGiftRecommendations 和 generateActivityRecommendations 函数生成
    },
  
    // 加载商城产品
    loadMallProducts() {
      const mallProducts = [
        {
          id: 1,
          name: '情侣定制手链',
          points: 199,
          originalPoints: 299,
          image: 'https://littlehome-1301530190.cos.ap-nanjing.myqcloud.com/pic/gift-default.png',
          category: '饰品',
          tags: ['定制', '情侣', '纪念'],
          stock: 50
        },
        {
          id: 2,
          name: '智能按摩枕',
          points: 299,
          originalPoints: 399,
          image: 'https://littlehome-1301530190.cos.ap-nanjing.myqcloud.com/pic/gift-default.png',
          category: '健康',
          tags: ['智能', '按摩', '减压'],
          stock: 30
        },
        {
          id: 3,
          name: '情侣装套装',
          points: 399,
          originalPoints: 599,
          image: 'https://littlehome-1301530190.cos.ap-nanjing.myqcloud.com/pic/gift-default.png',
          category: '服装',
          tags: ['情侣', '时尚', '套装'],
          stock: 25
        }
      ]
  
      this.setData({ mallProducts })
    },
  
    // 加载攻略数据
    loadGuides() {
      const guides = [
        {
          id: 1,
          title: '情侣约会圣地推荐',
          category: '约会',
          image: 'https://littlehome-1301530190.cos.ap-nanjing.myqcloud.com/pic/gift-default.png',
          description: '精选本地最适合情侣约会的场所，包含详细攻略和优惠信息',
          rating: 4.8,
          views: 1234
        },
        {
          id: 2,
          title: '异地恋维系指南',
          category: '异地恋',
          image: 'https://littlehome-1301530190.cos.ap-nanjing.myqcloud.com/pic/gift-default.png',
          description: '实用的异地恋维系技巧和活动建议，让距离不再是问题',
          rating: 4.9,
          views: 2341
        },
        {
          id: 3,
          title: '纪念日惊喜策划',
          category: '惊喜',
          image: 'https://littlehome-1301530190.cos.ap-nanjing.myqcloud.com/pic/gift-default.png',
          description: '如何为重要纪念日制造难忘的惊喜，包含详细步骤和创意',
          rating: 4.7,
          views: 987
        }
      ]
  
      this.setData({ guides })
    },
  
    // 获取天气数据
    getWeatherData() {
      // 从用户画像中获取城市信息
      const userProfile = wx.getStorageSync('userProfile') || {}
      const partnerProfile = wx.getStorageSync('partnerProfile') || {}
      
      const userLocation = userProfile.city ? `${userProfile.province} ${userProfile.city}` : '未知城市'
      const partnerLocation = partnerProfile.city ? `${partnerProfile.province} ${partnerProfile.city}` : '未知城市'
      
      // 模拟天气数据获取
      const weatherData = {
        userLocation: userLocation,
        partnerLocation: partnerLocation,
        userWeather: {
          temperature: Math.floor(Math.random() * 20) + 10, // 10-30度随机温度
          condition: this.getRandomWeatherCondition(),
          icon: this.getWeatherIcon(userLocation)
        },
        partnerWeather: {
          temperature: Math.floor(Math.random() * 20) + 10, // 10-30度随机温度
          condition: this.getRandomWeatherCondition(),
          icon: this.getWeatherIcon(partnerLocation)
        }
      }
  
      this.setData({ weatherData })
    },
  
    // 获取随机天气状况
    getRandomWeatherCondition() {
      const conditions = ['晴天', '多云', '阴天', '小雨', '中雨', '大雨', '雪', '雾']
      return conditions[Math.floor(Math.random() * conditions.length)]
    },
  
    // 根据城市获取天气图标
    getWeatherIcon(location) {
      // 这里可以根据城市或天气状况返回不同的图标
      // 目前使用随机图标，实际应用中可以根据真实天气API返回
      const icons = ['☀️', '⛅', '☁️', '🌧️', '🌦️', '❄️', '🌫️']
      return icons[Math.floor(Math.random() * icons.length)]
    },
  
    // 切换标签页
    switchTab(e) {
      const tab = e.currentTarget.dataset.tab
      this.setData({ currentTab: tab })
    },
  
    // 显示用户画像表单
    showProfileForm() {
      // 重新初始化数据，确保数组字段正确
      this.initUserProfile()
      this.setData({ 
        showProfileForm: true, 
        currentFormStep: 1 
      })
    },
  
    // 隐藏用户画像表单
    hideProfileForm() {
      this.setData({ showProfileForm: false })
    },
  
    // 阻止事件冒泡
    stopPropagation() {
      // 阻止事件冒泡
    },
  
    // 表单步骤导航
    nextStep() {
      if (this.data.currentFormStep < 4) {
        this.setData({
          currentFormStep: this.data.currentFormStep + 1
        })
      }
    },
  
    prevStep() {
      if (this.data.currentFormStep > 1) {
        this.setData({
          currentFormStep: this.data.currentFormStep - 1
        })
      }
    },
  
    // 基本信息输入处理
    onUserBasicInfoInput(e) {
      const { field } = e.currentTarget.dataset
      let { value } = e.detail
      
      // 输入限制
      if (field === 'name') {
        // 限制只能输入中文，最多6个字符
        value = value.replace(/[^\u4e00-\u9fa5]/g, '').substring(0, 6)
      } else if (field === 'age') {
        // 限制只能输入数字，最多3位
        value = value.replace(/[^\d]/g, '').substring(0, 3)
        // 限制年龄范围1-120
        const ageNum = parseInt(value)
        if (ageNum > 120) {
          value = '120'
        }
      }
      
      this.setData({
        [`userProfile.${field}`]: value
      })
    },

    onPartnerBasicInfoInput(e) {
      const { field } = e.currentTarget.dataset
      let { value } = e.detail
      
      // 输入限制
      if (field === 'name') {
        // 限制只能输入中文，最多6个字符
        value = value.replace(/[^\u4e00-\u9fa5]/g, '').substring(0, 6)
      } else if (field === 'age') {
        // 限制只能输入数字，最多3位
        value = value.replace(/[^\d]/g, '').substring(0, 3)
        // 限制年龄范围1-120
        const ageNum = parseInt(value)
        if (ageNum > 120) {
          value = '120'
        }
      }
      
      this.setData({
        [`partnerProfile.${field}`]: value
      })
    },

    // Picker选择处理
    onUserPickerChange(e) {
      const { field } = e.currentTarget.dataset
      const { value } = e.detail
      const { userProfile, regionData, occupationOptions } = this.data
      
      let selectedValue = ''
      if (field === 'gender') {
        const genderOptions = ['女', '男']
        if (value >= 0 && value < genderOptions.length) {
          selectedValue = genderOptions[value]
        }
      } else if (field === 'province') {
        if (value >= 0 && value < regionData.provinces.length) {
          selectedValue = regionData.provinces[value]
          // 重置城市
          this.setData({
            'userProfile.city': ''
          })
        }
      } else if (field === 'city') {
        const cities = regionData.cities[userProfile.province] || []
        if (value >= 0 && value < cities.length) {
          selectedValue = cities[value]
        }
      } else if (field === 'occupation') {
        if (value >= 0 && value < occupationOptions.length) {
          selectedValue = occupationOptions[value]
        }
      }
      
      if (selectedValue) {
        this.setData({
          [`userProfile.${field}`]: selectedValue
        })
        console.log(`用户${field}已选择:`, selectedValue)
      }
    },

    onPartnerPickerChange(e) {
      const { field } = e.currentTarget.dataset
      const { value } = e.detail
      const { partnerProfile, regionData, occupationOptions } = this.data
      
      let selectedValue = ''
      if (field === 'gender') {
        const genderOptions = ['女', '男']
        if (value >= 0 && value < genderOptions.length) {
          selectedValue = genderOptions[value]
        }
      } else if (field === 'province') {
        if (value >= 0 && value < regionData.provinces.length) {
          selectedValue = regionData.provinces[value]
          // 重置城市
          this.setData({
            'partnerProfile.city': ''
          })
        }
      } else if (field === 'city') {
        const cities = regionData.cities[partnerProfile.province] || []
        if (value >= 0 && value < cities.length) {
          selectedValue = cities[value]
        }
      } else if (field === 'occupation') {
        if (value >= 0 && value < occupationOptions.length) {
          selectedValue = occupationOptions[value]
        }
      }
      
      if (selectedValue) {
        this.setData({
          [`partnerProfile.${field}`]: selectedValue
        })
        console.log(`伴侣${field}已选择:`, selectedValue)
      }
    },

    onRelationshipPickerChange(e) {
      const { field } = e.currentTarget.dataset
      const { value } = e.detail
      const { relationshipInfo } = this.data
      
      let selectedValue = ''
      if (field === 'relationshipStatus') {
        selectedValue = relationshipInfo.statusOptions[value]
      } else if (field === 'relationshipDuration') {
        selectedValue = relationshipInfo.durationOptions[value]
      } else if (field === 'meetingFrequency') {
        selectedValue = relationshipInfo.frequencyOptions[value]
      }
      
      this.setData({
        [`relationshipInfo.${field}`]: selectedValue
      })
    },



    // 性格特征选择
    onPersonalitySelect(e) {
      const { type, value } = e.currentTarget.dataset
      const { userProfile, partnerProfile } = this.data
      
      console.log('选择性格特征:', { type, value })
      console.log('选择前状态:', { 
        userPersonality: userProfile.personality, 
        partnerPersonality: partnerProfile.personality 
      })
      
      if (type === 'user') {
        // 确保personality是数组
        if (!Array.isArray(userProfile.personality)) {
          userProfile.personality = []
        }
        const index = userProfile.personality.indexOf(value)
        if (index > -1) {
          userProfile.personality.splice(index, 1)
          console.log('取消选择用户性格:', value)
        } else {
          userProfile.personality.push(value)
          console.log('选择用户性格:', value)
        }
        this.setData({ userProfile })
        console.log('选择后用户性格:', userProfile.personality)
      } else {
        // 确保personality是数组
        if (!Array.isArray(partnerProfile.personality)) {
          partnerProfile.personality = []
        }
        const index = partnerProfile.personality.indexOf(value)
        if (index > -1) {
          partnerProfile.personality.splice(index, 1)
          console.log('取消选择伴侣性格:', value)
        } else {
          partnerProfile.personality.push(value)
          console.log('选择伴侣性格:', value)
        }
        this.setData({ partnerProfile })
        console.log('选择后伴侣性格:', partnerProfile.personality)
      }
    },

    // 兴趣爱好选择
    onInterestSelect(e) {
      const { type, value } = e.currentTarget.dataset
      const { userProfile, partnerProfile } = this.data
      
      console.log('选择兴趣爱好:', { type, value })
      console.log('选择前状态:', { 
        userInterests: userProfile.interests, 
        partnerInterests: partnerProfile.interests 
      })
      
      if (type === 'user') {
        // 确保interests是数组
        if (!Array.isArray(userProfile.interests)) {
          userProfile.interests = []
        }
        const index = userProfile.interests.indexOf(value)
        if (index > -1) {
          userProfile.interests.splice(index, 1)
          console.log('取消选择用户兴趣:', value)
        } else {
          userProfile.interests.push(value)
          console.log('选择用户兴趣:', value)
        }
        this.setData({ userProfile })
        console.log('选择后用户兴趣:', userProfile.interests)
      } else {
        // 确保interests是数组
        if (!Array.isArray(partnerProfile.interests)) {
          partnerProfile.interests = []
        }
        const index = partnerProfile.interests.indexOf(value)
        if (index > -1) {
          partnerProfile.interests.splice(index, 1)
          console.log('取消选择伴侣兴趣:', value)
        } else {
          partnerProfile.interests.push(value)
          console.log('选择伴侣兴趣:', value)
        }
        this.setData({ partnerProfile })
        console.log('选择后伴侣兴趣:', partnerProfile.interests)
      }
    },

    // 生活习惯选择
    onLifestyleSelect(e) {
      const { type, value } = e.currentTarget.dataset
      const { userProfile, partnerProfile } = this.data
      
      console.log('选择生活习惯:', { type, value })
      console.log('选择前状态:', { 
        userLifestyle: userProfile.lifestyle, 
        partnerLifestyle: partnerProfile.lifestyle 
      })
      
      if (type === 'user') {
        // 确保lifestyle是数组
        if (!Array.isArray(userProfile.lifestyle)) {
          userProfile.lifestyle = []
        }
        const index = userProfile.lifestyle.indexOf(value)
        if (index > -1) {
          userProfile.lifestyle.splice(index, 1)
          console.log('取消选择用户生活习惯:', value)
        } else {
          userProfile.lifestyle.push(value)
          console.log('选择用户生活习惯:', value)
        }
        this.setData({ userProfile })
        console.log('选择后用户生活习惯:', userProfile.lifestyle)
      } else {
        // 确保lifestyle是数组
        if (!Array.isArray(partnerProfile.lifestyle)) {
          partnerProfile.lifestyle = []
        }
        const index = partnerProfile.lifestyle.indexOf(value)
        if (index > -1) {
          partnerProfile.lifestyle.splice(index, 1)
          console.log('取消选择伴侣生活习惯:', value)
        } else {
          partnerProfile.lifestyle.push(value)
          console.log('选择伴侣生活习惯:', value)
        }
        this.setData({ partnerProfile })
        console.log('选择后伴侣生活习惯:', partnerProfile.lifestyle)
      }
    },

    // 当前需求选择
    onNeedSelect(e) {
      const { type, value } = e.currentTarget.dataset
      
      if (type === 'user') {
        this.setData({
          'userProfile.currentNeeds': value
        })
      } else {
        this.setData({
          'partnerProfile.currentNeeds': value
        })
      }
    },

    // 礼物偏好选择
    onGiftPreferenceSelect(e) {
      const { type, value } = e.currentTarget.dataset
      const { userProfile, partnerProfile } = this.data
      
      if (type === 'user') {
        const index = userProfile.giftPreferences.indexOf(value)
        if (index > -1) {
          userProfile.giftPreferences.splice(index, 1)
        } else {
          userProfile.giftPreferences.push(value)
        }
        this.setData({ userProfile })
      } else {
        const index = partnerProfile.giftPreferences.indexOf(value)
        if (index > -1) {
          partnerProfile.giftPreferences.splice(index, 1)
        } else {
          partnerProfile.giftPreferences.push(value)
        }
        this.setData({ partnerProfile })
      }
    },

    // 预算范围选择
    onBudgetSelect(e) {
      const { type, value } = e.currentTarget.dataset
      
      if (type === 'user') {
        this.setData({
          'userProfile.budgetRange': value
        })
      } else {
        this.setData({
          'partnerProfile.budgetRange': value
        })
      }
    },

    // 关系信息输入处理
    onRelationshipInfoInput(e) {
      const { field } = e.currentTarget.dataset
      const { value } = e.detail
      
      this.setData({
        [`relationshipInfo.${field}`]: value
      })
    },

    // 沟通方式选择
    onCommunicationSelect(e) {
      const { value } = e.currentTarget.dataset
      const { relationshipInfo } = this.data
      
      console.log('选择沟通方式:', value)
      console.log('选择前沟通方式:', relationshipInfo.communicationMethods)
      
      // 确保communicationMethods是数组
      if (!Array.isArray(relationshipInfo.communicationMethods)) {
        relationshipInfo.communicationMethods = []
      }
      
      const index = relationshipInfo.communicationMethods.indexOf(value)
      if (index > -1) {
        relationshipInfo.communicationMethods.splice(index, 1)
        console.log('取消选择沟通方式:', value)
      } else {
        relationshipInfo.communicationMethods.push(value)
        console.log('选择沟通方式:', value)
      }
      
      this.setData({ relationshipInfo })
      console.log('选择后沟通方式:', relationshipInfo.communicationMethods)
    },

    // 日常互动选择
    onInteractionSelect(e) {
      const { value } = e.currentTarget.dataset
      const { relationshipInfo } = this.data
      
      console.log('选择互动方式:', value)
      console.log('选择前互动方式:', relationshipInfo.dailyInteractions)
      
      // 确保dailyInteractions是数组
      if (!Array.isArray(relationshipInfo.dailyInteractions)) {
        relationshipInfo.dailyInteractions = []
      }
      
      const index = relationshipInfo.dailyInteractions.indexOf(value)
      if (index > -1) {
        relationshipInfo.dailyInteractions.splice(index, 1)
        console.log('取消选择互动方式:', value)
      } else {
        relationshipInfo.dailyInteractions.push(value)
        console.log('选择互动方式:', value)
      }
      
      this.setData({ relationshipInfo })
      console.log('选择后互动方式:', relationshipInfo.dailyInteractions)
    },



    // 保存所有用户信息
    saveAllUserInfo() {
      const { userProfile, partnerProfile, relationshipInfo } = this.data
      
      // 保存到本地存储
      wx.setStorageSync('userProfile', userProfile)
      wx.setStorageSync('partnerProfile', partnerProfile)
      wx.setStorageSync('relationshipInfo', relationshipInfo)
      
      // 关闭表单
      this.setData({
        showProfileForm: false,
        currentFormStep: 1
      })

      wx.showToast({
        title: '信息保存成功',
        icon: 'success'
      })

      // 更新天气信息（因为城市信息可能已更新）
      this.getWeatherData()
      
      // 重新加载推荐
      this.loadRecommendations()
    },

    // 重置表单
    resetForm() {
      this.setData({
        currentFormStep: 1,
        userProfile: this.data.userProfile,
        partnerProfile: this.data.partnerProfile,
        relationshipInfo: this.data.relationshipInfo
      })
    },

    // 显示礼物推荐表单
    showGiftForm() {
      this.setData({ showGiftForm: true })
    },

    // 隐藏礼物推荐表单
    hideGiftForm() {
      this.setData({ showGiftForm: false })
    },

    // 礼物预算输入
    onGiftBudgetInput(e) {
      this.setData({
        giftBudget: e.detail.value
      })
    },

    // 礼物场合输入
    onGiftOccasionInput(e) {
      this.setData({
        giftOccasion: e.detail.value
      })
    },

    // 生成礼物推荐
    generateGiftRecommendations(e) {
      const budget = this.data.giftBudget
      const occasion = this.data.giftOccasion
      
      // 确保budget和occasion有值
      if (!budget || !occasion) {
        wx.showToast({
          title: '请填写预算和场合',
          icon: 'none'
        })
        return
      }
      
      this.setData({
        giftBudget: budget,
        giftOccasion: occasion,
        showGiftForm: false,
        loading: true
      })

      // 构建用户信息字符串
      const userInfo = this.data.userProfile
      const partnerInfo = this.data.partnerProfile
      const relationshipInfo = this.data.relationshipInfo
      const dailyHeartInfo = this.data.dailyHeartInfo

      // 安全获取数组字段，确保是数组
      const safeJoin = (arr, defaultValue = '未知') => {
        if (!Array.isArray(arr) || arr.length === 0) {
          return defaultValue
        }
        return arr.join(', ')
      }

      const userProfileText = `
用户信息：
- 年龄：${userInfo.age || '未知'}
- 性别：${userInfo.gender || '未知'}
- 职业：${userInfo.occupation || '未知'}
- 性格：${safeJoin(userInfo.personality)}
- 兴趣爱好：${safeJoin(userInfo.interests)}
- 生活方式：${safeJoin(userInfo.lifestyle)}
- 需求偏好：${safeJoin(userInfo.needs)}

伴侣信息：
- 年龄：${partnerInfo.age || '未知'}
- 性别：${partnerInfo.gender || '未知'}
- 职业：${partnerInfo.occupation || '未知'}
- 性格：${safeJoin(partnerInfo.personality)}
- 兴趣爱好：${safeJoin(partnerInfo.interests)}
- 生活方式：${safeJoin(partnerInfo.lifestyle)}
- 需求偏好：${safeJoin(partnerInfo.needs)}

关系信息：
- 恋爱时长：${relationshipInfo.relationshipDuration || '未知'}
- 关系状态：${relationshipInfo.relationshipStatus || '未知'}
- 沟通方式：${safeJoin(relationshipInfo.communicationMethods)}
- 互动频率：${relationshipInfo.meetingFrequency || '未知'}

日常心意：
- 最近心情：${dailyHeartInfo.recentMood || '未知'}
- 生活状态：${dailyHeartInfo.lifeStatus || '未知'}
- 关注点：${safeJoin(dailyHeartInfo.focus)}

礼物需求：
- 预算：${budget}积分
- 场合：${occasion}
- 偏好：${this.data.giftPreference || '无特殊偏好'}
      `

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
                    content: `你是一个专业的礼物推荐专家，专门为情侣提供个性化的礼物建议。你需要根据用户提供的信息，分析用户和伴侣的特点、关系状态、日常需求等，推荐3-5个最适合的礼物。

要求：
1. 推荐要个性化，基于用户和伴侣的具体情况
2. 考虑预算限制，推荐价格合理的礼物
3. 考虑场合的合适性
4. 每个推荐都要说明推荐理由
5. 返回格式为JSON数组，包含以下字段：
   - name: 礼物名称
   - points: 积分（数字）
   - reason: 推荐理由（详细说明为什么适合）
   - tags: 标签数组（如['实用', '浪漫', '健康']）
   - category: 礼物类别
   - rating: 推荐指数（4.0-5.0之间）
   - sales: 受欢迎程度（数字）

请只返回JSON格式的推荐结果，不要其他文字。`
                  },
                  {
                    role: 'user',
                    content: userProfileText
                  }
                ],
                stream: false,
                max_tokens: 2000
              },
              success: (res) => {
          console.log('DeepSeek API响应:', res)
          
          if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices[0]) {
            try {
              const content = res.data.choices[0].message.content
              console.log('AI返回内容:', content)
              
              // 尝试解析JSON
              let recommendations = []
              try {
                // 尝试直接解析
                recommendations = JSON.parse(content)
              } catch (parseError) {
                console.log('直接解析失败，尝试提取JSON:', parseError)
                // 尝试从文本中提取JSON
                const jsonMatch = content.match(/\[[\s\S]*\]/)
                if (jsonMatch) {
                  try {
                    recommendations = JSON.parse(jsonMatch[0])
                  } catch (secondError) {
                    console.error('JSON提取失败:', secondError)
                    wx.showToast({
                      title: 'AI返回格式错误',
                      icon: 'none'
                    })
                    this.setData({ loading: false })
                    return
                  }
                } else {
                  console.error('未找到JSON数组')
                  wx.showToast({
                    title: 'AI返回格式错误',
                    icon: 'none'
                  })
                  this.setData({ loading: false })
                  return
                }
              }
              
              // 验证推荐结果
              if (!Array.isArray(recommendations) || recommendations.length === 0) {
                wx.showToast({
                  title: '未生成有效推荐',
                  icon: 'none'
                })
                this.setData({ loading: false })
                return
              }
              
              // 为每个推荐添加默认图片和ID
              recommendations = recommendations.map((item, index) => ({
                ...item,
                id: index + 1,
                image: item.image || 'https://littlehome-1301530190.cos.ap-nanjing.myqcloud.com/pic/gift-default.png?q-sign-algorithm=sha1&q-ak=AKIDsRNqMPhbr4NLhLgeRT9_WUeK3ZHlXKNg9jf0O_IXa7XmRAO980XRxlRpj8HkGU6d&q-sign-time=1754626760;1754630360&q-key-time=1754626760;1754630360&q-header-list=host&q-url-param-list=ci-process&q-signature=e845045c280c590cd21e112778229e64263f9812&x-cos-security-token=6ZeW7Tn9gv4g8tNamvfKWstJwOC0u1qafeb5b6bc4f23f26fec67c70aa2f30965rn-bQ6aqVZdQ1BMeITDWkBrWhtX4nd0P5PRbt9rAKB5tNV7FT3WLTZKqd8sKMcnkbRHg1sClLWTwLwhtsvD6NqacVCOuBOTul4hJ2Ix8G0lbrfzhQUbFvDaDZdDc382GoBOFk8u2VBeMBIFLSw1FpSQrSgoBDGFTXxMaUXIsHgVdarnMuISC0eJhf_zvnUYjkJX74Q51TeKCor8cScVClH4GUjdw7osJQd1x2iK9wHGUQwxPvjH2q3HYIAIDF9GFkrxGEPyuBm_eQb7fzrDt8w&ci-process=originImage',
                points: item.points || 100,
                rating: item.rating || 4.5,
                sales: item.sales || 50,
                tags: Array.isArray(item.tags) ? item.tags : ['推荐'],
                category: item.category || '礼物'
              }))
              
              this.setData({
                giftRecommendations: recommendations,
                loading: false
              })
              
              wx.showToast({
                title: '推荐生成成功',
                icon: 'success'
              })
              
            } catch (error) {
              console.error('处理AI响应失败:', error)
              wx.showToast({
                title: '处理推荐失败',
                icon: 'none'
              })
              this.setData({ loading: false })
            }
          } else {
            console.error('API响应错误:', res)
            wx.showToast({
              title: '生成推荐失败',
              icon: 'none'
            })
            this.setData({ loading: false })
          }
        },
        fail: (error) => {
          console.error('API请求失败:', error)
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          })
          this.setData({ loading: false })
        }
      });
        } else {
          console.error('获取API密钥失败');
          wx.showToast({
            title: '服务暂时不可用',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      },
      fail: (err) => {
        console.error('获取API密钥失败:', err);
        wx.showToast({
          title: '服务暂时不可用',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    });
    },

    // 显示活动推荐表单
    showActivityForm() {
      this.setData({ showActivityForm: true })
    },

    // 隐藏活动推荐表单
    hideActivityForm() {
      this.setData({ showActivityForm: false })
    },

    // 生成活动推荐
    generateActivityRecommendations(e) {
      const { budget, type, duration } = e.detail
      
      this.setData({
        activityBudget: budget,
        activityType: type,
        activityDuration: duration,
        showActivityForm: false,
        loading: true
      })

      // 构建用户信息字符串
      const userInfo = this.data.userProfile
      const partnerInfo = this.data.partnerProfile
      const relationshipInfo = this.data.relationshipInfo
      const dailyHeartInfo = this.data.dailyHeartInfo

      // 安全获取数组字段，确保是数组
      const safeJoin = (arr, defaultValue = '未知') => {
        if (!Array.isArray(arr) || arr.length === 0) {
          return defaultValue
        }
        return arr.join(', ')
      }

      const userProfileText = `
用户信息：
- 年龄：${userInfo.age || '未知'}
- 性别：${userInfo.gender || '未知'}
- 职业：${userInfo.occupation || '未知'}
- 性格：${safeJoin(userInfo.personality)}
- 兴趣爱好：${safeJoin(userInfo.interests)}
- 生活方式：${safeJoin(userInfo.lifestyle)}
- 需求偏好：${safeJoin(userInfo.needs)}

伴侣信息：
- 年龄：${partnerInfo.age || '未知'}
- 性别：${partnerInfo.gender || '未知'}
- 职业：${partnerInfo.occupation || '未知'}
- 性格：${safeJoin(partnerInfo.personality)}
- 兴趣爱好：${safeJoin(partnerInfo.interests)}
- 生活方式：${safeJoin(partnerInfo.lifestyle)}
- 需求偏好：${safeJoin(partnerInfo.needs)}

关系信息：
- 恋爱时长：${relationshipInfo.relationshipDuration || '未知'}
- 关系状态：${relationshipInfo.relationshipStatus || '未知'}
- 沟通方式：${safeJoin(relationshipInfo.communicationMethods)}
- 互动频率：${relationshipInfo.meetingFrequency || '未知'}

日常心意：
- 最近心情：${dailyHeartInfo.todayMood || '未知'}
- 情感状态：${dailyHeartInfo.emotionalState || '未知'}
- 关注点：${safeJoin(dailyHeartInfo.focus)}

活动需求：
- 预算：${budget}积分
- 类型：${type}
- 时长：${duration}
      `

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
                    content: `你是一个专业的情侣活动推荐专家，专门为情侣提供个性化的约会和活动建议。你需要根据用户提供的信息，分析用户和伴侣的特点、关系状态、日常需求等，推荐3-5个最适合的活动。

要求：
1. 推荐要个性化，基于用户和伴侣的具体情况
2. 考虑预算限制，推荐价格合理的活动
3. 考虑活动类型（线上/本地）的合适性
4. 考虑时长安排的合理性
5. 每个推荐都要说明推荐理由
6. 返回格式为JSON数组，包含以下字段：
   - name: 活动名称
   - type: 活动类型（online/local）
   - duration: 活动时长
   - points: 积分（数字）
   - description: 活动描述（详细说明为什么适合）
   - tags: 标签数组（如['健康', '互动', '放松']）
   - category: 活动类别
   - rating: 推荐指数（4.0-5.0之间）
   - participants: 参与人数（数字）

请只返回JSON格式的推荐结果，不要其他文字。`
                  },
                  {
                    role: 'user',
                    content: userProfileText
                  }
                ],
                stream: false,
                max_tokens: 2000
              },
              success: (res) => {
          console.log('DeepSeek API响应:', res)
          
          if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices[0]) {
            try {
              const content = res.data.choices[0].message.content
              console.log('AI推荐内容:', content)
              
              // 尝试解析JSON
              const recommendations = JSON.parse(content)
              
              if (Array.isArray(recommendations)) {
                // 为每个推荐添加id和图片
                const processedRecommendations = recommendations.map((item, index) => ({
                  ...item,
                  id: index + 1,
                  image: '', // 暂时为空，后续可以添加图片
                  participants: item.participants || Math.floor(Math.random() * 500) + 50 // 模拟参与人数
                }))

                this.setData({
                  activityRecommendations: processedRecommendations,
                  loading: false
                })

                wx.showToast({
                  title: 'AI推荐生成成功',
                  icon: 'success'
                })
              } else {
                throw new Error('推荐格式不正确')
              }
            } catch (error) {
              console.error('解析AI推荐失败:', error)
              this.setData({
                loading: false
              })
              wx.showToast({
                title: '推荐生成失败，请重试',
                icon: 'none'
              })
            }
          } else {
            console.error('DeepSeek API调用失败:', res)
            this.setData({
              loading: false
            })
            wx.showToast({
              title: '推荐生成失败，请重试',
              icon: 'none'
            })
          }
        },
        fail: (err) => {
          console.error('DeepSeek API请求失败:', err)
          this.setData({
            loading: false
          })
          wx.showToast({
            title: '网络请求失败，请重试',
            icon: 'none'
          })
        }
      });
        } else {
          console.error('获取API密钥失败');
          wx.showToast({
            title: '服务暂时不可用',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      },
      fail: (err) => {
        console.error('获取API密钥失败:', err);
        wx.showToast({
          title: '服务暂时不可用',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    });
    },

    // 选择商品
    selectProduct(e) {
      const productId = e.currentTarget.dataset.id
      const product = this.data.mallProducts.find(item => item.id === productId)
      
      this.setData({ selectedProduct: product })
    },

    // 隐藏商品详情
    hideProductDetail() {
      this.setData({ selectedProduct: null })
    },

    // 兑换商品
    purchaseProduct() {
      if (!this.data.selectedProduct) {
        wx.showToast({
          title: '请先选择商品',
          icon: 'none'
        })
        return
      }

      // 检查用户积分是否足够
      const userPoints = wx.getStorageSync('points') || 0
      
      if (userPoints < this.data.selectedProduct.points) {
        wx.showModal({
          title: '积分不足',
          content: `您的积分不足，需要${this.data.selectedProduct.points}积分，当前只有${userPoints}积分`,
          showCancel: false
        })
        return
      }

      wx.showModal({
        title: '确认兑换',
        content: `确定要用${this.data.selectedProduct.points}积分兑换 ${this.data.selectedProduct.name} 吗？`,
        success: (res) => {
          if (res.confirm) {
            // 扣除用户积分
            const newPoints = userPoints - this.data.selectedProduct.points
            wx.setStorageSync('points', newPoints)
            
            wx.showToast({
              title: '兑换成功！',
              icon: 'success'
            })
            
            // 清空选择
            this.setData({ selectedProduct: null })
          }
        }
      })
    },

    // 查看攻略详情
    viewGuide(e) {
      const guideId = e.currentTarget.dataset.id
      const guide = this.data.guides.find(item => item.id === guideId)
      
      this.setData({ selectedGuide: guide })
    },

    // 隐藏攻略详情
    hideGuideDetail() {
      this.setData({ selectedGuide: null })
    },

    // 预订活动
    bookActivity(e) {
      const activityId = e.currentTarget.dataset.id
      const activity = this.data.activityRecommendations.find(item => item.id === activityId)
      
      // 检查用户积分是否足够
      const userPoints = wx.getStorageSync('points') || 0
      
      if (userPoints < activity.points) {
        wx.showModal({
          title: '积分不足',
          content: `您的积分不足，需要${activity.points}积分，当前只有${userPoints}积分`,
          showCancel: false
        })
        return
      }
      
      wx.showModal({
        title: '预订活动',
        content: `确定要用${activity.points}积分预订 ${activity.name} 吗？`,
        success: (res) => {
          if (res.confirm) {
            // 扣除用户积分
            const newPoints = userPoints - activity.points
            wx.setStorageSync('points', newPoints)
            
            wx.showToast({
              title: '预订成功！',
              icon: 'success'
            })
          }
        }
      })
    },

    // 分享推荐
    shareRecommendation(e) {
      const type = e.currentTarget.dataset.type
      const id = e.currentTarget.dataset.id
      
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      })
    },

    // 页面转发功能
    onShareAppMessage() {
      // 如果已有分享图片，直接使用；否则使用默认图片
      if (this.data.shareImageUrl) {
        return {
          title: 'LittleHome - AI定制礼物与活动推荐',
          path: '/pages/activity_customization/activity_customization',
          imageUrl: this.data.shareImageUrl
        };
      } else {
        return {
          title: 'LittleHome - AI定制礼物与活动推荐',
          path: '/pages/activity_customization/activity_customization',
          imageUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/share-customize.jpg'
        };
      }
    },

    // 分享到朋友圈
    onShareTimeline() {
      // 如果已有分享图片，直接使用；否则使用默认图片
      if (this.data.shareImageUrl) {
        return {
          title: 'LittleHome - AI定制礼物与活动推荐',
          query: '',
          imageUrl: this.data.shareImageUrl
        };
      } else {
        return {
          title: 'LittleHome - AI定制礼物与活动推荐',
          query: '',
          imageUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/share-customize.jpg'
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
          ctx.fillText('AI定制推荐', canvasWidth / 2, 55);
          
          // 绘制当前标签页
          const currentTab = this.data.currentTab === 'gift' ? '礼物推荐' : '活动推荐';
          ctx.setFillStyle('#2C1810');
          ctx.setFontSize(14);
          ctx.setTextAlign('center');
          ctx.fillText('当前: ' + currentTab, canvasWidth / 2, 120);
          
          // 绘制用户信息
          if (this.data.userProfile && this.data.userProfile.name) {
            ctx.setFillStyle('#9A8C82');
            ctx.setFontSize(12);
            ctx.setTextAlign('center');
            ctx.fillText('用户: ' + this.data.userProfile.name, canvasWidth / 2, 150);
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

    // 初始化用户资料
    initUserProfile() {
      // 从本地存储加载数据，如果没有则使用默认值
      const userProfile = wx.getStorageSync('userProfile') || {
        name: '',
        age: '',
        gender: '',
        province: '',
        city: '',
        occupation: '',
        incomeLevel: '',
        personality: [],
        personalityTags: ['外向', '内向', '浪漫', '务实', '创意', '理性', '活泼', '安静', '独立', '依赖'],
        interests: [],
        interestOptions: ['电影', '音乐', '阅读', '运动', '美食', '旅行', '摄影', '游戏', '手工', '科技', '时尚', '艺术', '宠物', '园艺', '收藏'],
        lifestyle: [],
        lifestyleOptions: ['早睡早起', '夜猫子', '健康饮食', '喜欢外卖', '爱运动', '宅家', '社交达人', '独处时光', '追求品质', '实用主义'],
        currentNeeds: '',
        needOptions: ['工作压力大需要放松', '正在准备考试', '对某个领域感兴趣', '想要改变生活', '寻找新的爱好', '改善健康', '提升技能', '社交需求'],
        giftPreferences: [],
        giftPreferenceOptions: ['实用型', '浪漫型', '创意型', '奢侈型', '手工型', '科技型', '传统型', '个性化'],
        budgetRange: '',
        budgetOptions: ['100元以下', '100-300元', '300-500元', '500-1000元', '1000-2000元', '2000元以上'],
        giftHistory: []
      };
      
      // 确保数组字段被正确初始化
      if (!Array.isArray(userProfile.personality)) {
        userProfile.personality = []
      }
      if (!Array.isArray(userProfile.interests)) {
        userProfile.interests = []
      }
      if (!Array.isArray(userProfile.lifestyle)) {
        userProfile.lifestyle = []
      }
      if (!Array.isArray(userProfile.giftPreferences)) {
        userProfile.giftPreferences = []
      }
      
      const partnerProfile = wx.getStorageSync('partnerProfile') || {
        name: '',
        age: '',
        gender: '',
        province: '',
        city: '',
        occupation: '',
        incomeLevel: '',
        personality: [],
        personalityTags: ['外向', '内向', '浪漫', '务实', '创意', '理性', '活泼', '安静', '独立', '依赖'],
        interests: [],
        interestOptions: ['电影', '音乐', '阅读', '运动', '美食', '旅行', '摄影', '游戏', '手工', '科技', '时尚', '艺术', '宠物', '园艺', '收藏'],
        lifestyle: [],
        lifestyleOptions: ['早睡早起', '夜猫子', '健康饮食', '喜欢外卖', '爱运动', '宅家', '社交达人', '独处时光', '追求品质', '实用主义'],
        currentNeeds: '',
        needOptions: ['工作压力大需要放松', '正在准备考试', '对某个领域感兴趣', '想要改变生活', '寻找新的爱好', '改善健康', '提升技能', '社交需求'],
        giftPreferences: [],
        giftPreferenceOptions: ['实用型', '浪漫型', '创意型', '奢侈型', '手工型', '科技型', '传统型', '个性化'],
        budgetRange: '',
        budgetOptions: ['100元以下', '100-300元', '300-500元', '500-1000元', '1000-2000元', '2000元以上'],
        giftHistory: []
      };
      
      // 确保partnerProfile数组字段被正确初始化
      if (!Array.isArray(partnerProfile.personality)) {
        partnerProfile.personality = []
      }
      if (!Array.isArray(partnerProfile.interests)) {
        partnerProfile.interests = []
      }
      if (!Array.isArray(partnerProfile.lifestyle)) {
        partnerProfile.lifestyle = []
      }
      if (!Array.isArray(partnerProfile.giftPreferences)) {
        partnerProfile.giftPreferences = []
      }
      
      const relationshipInfo = wx.getStorageSync('relationshipInfo') || {
        relationshipStatus: '',
        statusOptions: ['恋爱中', '已婚', '异地恋', '网恋', '暗恋', '暧昧期'],
        relationshipDuration: '',
        durationOptions: ['1个月以内', '1-3个月', '3-6个月', '6个月-1年', '1-2年', '2-5年', '5年以上'],
        meetingFrequency: '',
        frequencyOptions: ['每天见面', '每周2-3次', '每周1次', '每月2-3次', '每月1次', '很少见面'],
        communicationMethods: [],
        communicationOptions: ['微信聊天', '视频通话', '语音通话', '短信', '邮件', '写信', '面对面'],
        commonInterests: [],
        importantDates: [],
        dailyInteractions: [],
        interactionOptions: ['早安晚安', '分享日常', '一起看剧', '一起游戏', '一起运动', '一起学习', '一起做饭', '一起旅行']
      };
      
      // 确保relationshipInfo数组字段被正确初始化
      if (!Array.isArray(relationshipInfo.communicationMethods)) {
        relationshipInfo.communicationMethods = []
      }
      if (!Array.isArray(relationshipInfo.dailyInteractions)) {
        relationshipInfo.dailyInteractions = []
      }
      if (!Array.isArray(relationshipInfo.commonInterests)) {
        relationshipInfo.commonInterests = []
      }
      if (!Array.isArray(relationshipInfo.importantDates)) {
        relationshipInfo.importantDates = []
      }
      
      // 将初始化后的数据设置到页面状态中
      this.setData({
        userProfile,
        partnerProfile,
        relationshipInfo
      })
      
      console.log('用户资料初始化完成:', {
        userPersonality: userProfile.personality,
        userInterests: userProfile.interests,
        userLifestyle: userProfile.lifestyle,
        partnerPersonality: partnerProfile.personality,
        partnerInterests: partnerProfile.interests,
        partnerLifestyle: partnerProfile.lifestyle,
        communicationMethods: relationshipInfo.communicationMethods,
        dailyInteractions: relationshipInfo.dailyInteractions
      })
    },

    // 获取天气信息
    getWeatherInfo() {
      // 模拟天气数据，实际项目中可以调用天气API
      const mockWeather = {
        userWeather: {
          city: '北京',
          temperature: '22°C',
          condition: '晴天',
          humidity: '65%'
        },
        partnerWeather: {
          city: '上海',
          temperature: '25°C',
          condition: '多云',
          humidity: '70%'
        }
      };
      this.setData({ 
        userWeather: mockWeather.userWeather,
        partnerWeather: mockWeather.partnerWeather
      });
      console.log('天气信息获取完成:', mockWeather);
    }
  })