const commonMethods = require('../../common-methods.js');

Page({
  data: {
    selectedDate: '',
    currentMonth: '',
    days: [],
    records: {},
    clockInDates: [],
    moodRecords: {},
    anniversaries: [],
    showAddAnniversary: false,
    pickerDate: '',
    points: 520,
    avatarUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/profile.jpg',
    heartUrl: 'https://dis-1301530190.cos.ap-nanjing.myqcloud.com/LittlehomePic/rice/heart.png'
  },

  onLoad() {
    this.initCalendar();
    this.loadRecords();
    this.checkAnniversaries();
    
    const now = new Date();
    const points = wx.getStorageSync('points') || 520;
    
    this.setData({
      pickerDate: now.toISOString().split('T')[0],
      points
    });
  },

  initCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    this.setData({
      currentMonth: `${year}年${month + 1}月`,
      selectedDate: now.toISOString().split('T')[0]
    });
    this.generateDays(year, month);
  },

  generateDays(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days = Array(firstDay).fill(null);
    
    for (let i = 1; i <= lastDate; i++) {
      days.push({
        date: i,
        fullDate: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }
    
    this.setData({ days });
  },

  loadRecords() {
    // 获取打卡历史记录
    const clockInDates = wx.getStorageSync('clockInHistory') || [];
    // 获取心情记录
    const moodRecords = wx.getStorageSync('moodRecords') || {};
    // 获取纪念日记录，统一结构为 {id, title, date}
    let anniversaries = wx.getStorageSync('anniversaries') || [
      { id: 'default', title: '我们已经在一起', date: '2022-02-12' }
    ];
    this.setData({ 
      clockInDates,
      moodRecords,
      anniversaries
    });
  },

  selectDate(e) {
    const { date } = e.currentTarget.dataset;
    this.setData({ selectedDate: date });
  },

  goBack() {
    wx.navigateBack();
  },

  checkDateRecord(date) {
    const hasClockIn = this.data.clockInDates.includes(date);
    const mood = this.data.moodRecords[date];
    const anniversary = this.data.anniversaries.find(a => a.date === date);
    
    return {
      hasClockIn,
      mood,
      anniversary
    };
  },

  // 检查是否是纪念日
  checkIsAnniversary(date) {
    return this.data.anniversaries.some(a => a.date === date);
  },

  // 获取纪念日名称
  getAnniversaryName(date) {
    const anniversary = this.data.anniversaries.find(a => a.date === date);
    return anniversary ? anniversary.name : '';
  },

  showAddAnniversaryModal() {
    this.setData({ 
      showAddAnniversary: true,
      pickerDate: this.data.selectedDate
    });
  },

  hideAddAnniversaryModal() {
    this.setData({ showAddAnniversary: false });
  },

  onDateChange(e) {
    this.setData({
      pickerDate: e.detail.value
    });
  },

  addAnniversary(e) {
    const { name } = e.detail.value;
    if (!name.trim()) {
      wx.showToast({
        title: '请输入纪念日名称',
        icon: 'none'
      });
      return;
    }
    const { pickerDate, anniversaries } = this.data;
    anniversaries.push({
      id: Date.now().toString(),
      title: name.trim(),
      date: pickerDate.replace(/-/g, '/') // 兼容iOS
    });
    this.setData({ anniversaries, showAddAnniversary: false });
    wx.setStorageSync('anniversaries', anniversaries);
    wx.showToast({ title: '添加成功', icon: 'success' });
  },

  deleteAnniversary(e) {
    const { index } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除纪念日',
      content: '确定要删除这个纪念日吗？',
      success: (res) => {
        if (res.confirm) {
          const { anniversaries } = this.data;
          anniversaries.splice(index, 1);
          this.setData({ anniversaries });
          wx.setStorageSync('anniversaries', anniversaries);
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 获取连续打卡天数
  getConsecutiveDays() {
    const clockInDates = this.data.clockInDates;
    if (!clockInDates.length) return 0;
    
    let consecutiveDays = 1;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (!clockInDates.includes(today) && !clockInDates.includes(yesterday)) {
      return 0;
    }
    
    for (let i = clockInDates.length - 1; i > 0; i--) {
      const currentDate = new Date(clockInDates[i]);
      const prevDate = new Date(clockInDates[i - 1]);
      const diffDays = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        consecutiveDays++;
      } else {
        break;
      }
    }
    
    return consecutiveDays;
  },

  // 打卡获得积分
  clockIn() {
    const today = new Date().toISOString().split('T')[0];
    if (this.data.clockInDates.includes(today)) {
      wx.showToast({
        title: '今日已打卡',
        icon: 'none'
      });
      return;
    }

    const clockInDates = [...this.data.clockInDates, today];
    const points = this.data.points + 52;
    
    this.setData({
      clockInDates,
      points
    });
    
    wx.setStorageSync('clockInDates', clockInDates);
    wx.setStorageSync('points', points);

    const consecutiveDays = this.getConsecutiveDays();
    wx.showModal({
      title: '打卡成功',
      content: `获得52积分！\n已连续打卡${consecutiveDays}天`,
      showCancel: false
    });
  },

  // 记录心情时获得积分
  recordMood(e) {
    const mood = e.currentTarget.dataset.mood;
    const { selectedDate, moodRecords } = this.data;
    
    if (!selectedDate) return;
    
    moodRecords[selectedDate] = mood;
    const points = this.data.points + 10;
    
    this.setData({ 
      moodRecords,
      points 
    });
    
    wx.setStorageSync('moodRecords', moodRecords);
    wx.setStorageSync('points', points);
    
    wx.showToast({
      title: '记录成功 +10分',
      icon: 'success'
    });
  },

  // 检查纪念日并发放积分
  checkAnniversaries() {
    const today = new Date().toISOString().split('T')[0];
    const { anniversaries } = this.data;
    
    anniversaries.forEach(anni => {
      if (anni.date === today) {
        const points = this.data.points + 520;
        this.setData({ points });
        wx.setStorageSync('points', points);
        
        wx.showModal({
          title: '纪念日快乐',
          content: `今天是${anni.name}\n奖励520积分！`,
          showCancel: false
        });
      }
    });
  }
}); 