// 云端碎碎念（日记）功能
// 使用SCF函数URL进行数据库操作
// diary表字段：account, content

const commonMethods = require('../../common-methods.js');

Page({
  data: {
    notes: [],
    showNoteInput: false,
    currentNote: '',
    editingNoteId: null,
    loading: false,
    openid: '' // 新增openid字段
  },

  onLoad() {
    // 优先用全局或本地缓存
    const app = getApp();
    const openid = app.globalData.account || wx.getStorageSync('account');
    if (openid) {
      this.setData({ openid }, () => {
        this.loadNotes();
      });
    } else if (wx.cloud) {
      // 没有再用云函数
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          this.setData({ openid: res.result.openid }, () => {
            this.loadNotes();
          });
          app.globalData.account = res.result.openid;
          wx.setStorageSync('account', res.result.openid);
        },
        fail: err => {
          wx.showToast({ title: '获取用户信息失败', icon: 'none' });
          this.loadNotes();
        }
      });
    } else {
      this.loadNotes();
    }
  },

  // 加载日记列表
  loadNotes() {
    console.log('loadNotes被调用');
    this.setData({ loading: true });
    const account = this.data.openid;
    wx.request({
      url: 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/',
      method: 'GET',
      data: {
        table: 'diary',
        action: 'list',
        account
      },
      success: (res) => {
        console.log('loadNotes返回:', res);
        let notes = [];
        if (Array.isArray(res.data.data)) {
          notes = res.data.data;
        } else if (Array.isArray(res.data)) {
          notes = res.data;
        }
        console.log('notes raw:', notes);
        notes = notes.map(note => ({
          ...note,
          displayDate: this.formatDisplayDate(note.date)
        }));
        this.setData({ notes });
      },
      fail: (err) => {
        console.log('loadNotes fail:', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  // 日期格式化方法
  formatDisplayDate(dateStr) {
    if (!dateStr) return '';
    let date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const pad = n => n < 10 ? '0' + n : n;
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  },

  // 显示输入弹窗
  showNoteInput() {
    console.log('showNoteInput被调用');
    this.setData({ showNoteInput: true, currentNote: '', editingNoteId: null });
  },

  // 隐藏输入弹窗
  hideNoteInput() {
    console.log('hideNoteInput被调用');
    this.setData({ showNoteInput: false, currentNote: '', editingNoteId: null });
  },

  // 输入框内容同步
  onNoteInput(e) {
    this.setData({ currentNote: e.detail.value });
  },

  // 保存日记（新增或编辑）
  saveNote() {
    console.log('saveNote被调用');
    const content = this.data.currentNote.trim();
    if (!content) {
      wx.showToast({ title: '内容不能为空', icon: 'none' });
      return;
    }
    this.setData({ loading: true });
    const isEdit = !!this.data.editingNoteId;
    let url = '';
    let data = {};
    const account = this.data.openid;
    if (isEdit) {
      url = 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/';
      data = {
        table: 'diary',
        action: 'update',
        account,
        content: content,
        id: this.data.editingNoteId
      };
    } else {
      url = 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/';
      data = {
        table: 'diary',
        action: 'add',
        account,
        content: content
      };
    }
    wx.request({
      url,
      method: 'GET',
      data,
      success: (res) => {
        console.log('saveNote返回:', res);
        if (res.statusCode === 200) {
          let body = res.data && res.data.body ? res.data.body : res.data;
          try {
            const result = typeof body === 'string' ? JSON.parse(body) : body;
            wx.showToast({ title: isEdit ? '修改成功' : '保存成功', icon: 'success' });
            this.loadNotes();
            this.hideNoteInput();
          } catch (e) {
            console.error('saveNote解析失败:', e);
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        } else {
          wx.showToast({ title: '操作失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.log('saveNote fail:', err);
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  // 编辑日记
  editNote(e) {
    console.log('editNote被调用', e);
    const { id } = e.currentTarget.dataset;
    const note = this.data.notes.find(n => n.id === id);
    if (note) {
      this.setData({ showNoteInput: true, currentNote: note.content, editingNoteId: id });
    }
  },

  // 长按操作菜单
  showNoteOptions(e) {
    console.log('showNoteOptions被调用', e);
    const { id } = e.currentTarget.dataset;
    wx.showActionSheet({
      itemList: ['修改', '删除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 修改
          this.editNote({ currentTarget: { dataset: { id } } });
        } else if (res.tapIndex === 1) {
          // 删除
          this.deleteNote(id);
        }
      }
    });
  },

  // 删除日记
  deleteNote(id) {
    console.log('deleteNote被调用', id);
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条日记吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          const account = this.data.openid;
          const url = 'https://1301530190-3k16qmdyez.ap-guangzhou.tencentscf.com/';
          const data = {
            table: 'diary',
            action: 'delete',
            account,
            id
          };
          wx.request({
            url,
            method: 'GET',
            data,
            success: (res) => {
              console.log('deleteNote返回:', res);
              if (res.statusCode === 200) {
                let body = res.data && res.data.body ? res.data.body : res.data;
                try {
                  const result = typeof body === 'string' ? JSON.parse(body) : body;
                  wx.showToast({ title: '删除成功', icon: 'success' });
                  this.loadNotes();
                } catch (e) {
                  console.error('deleteNote解析失败:', e);
                  wx.showToast({ title: '删除失败', icon: 'none' });
                }
              } else {
                wx.showToast({ title: '删除失败', icon: 'none' });
              }
            },
            fail: (err) => {
              console.log('deleteNote fail:', err);
              wx.showToast({ title: '网络错误', icon: 'none' });
            },
            complete: () => {
              this.setData({ loading: false });
            }
          });
        }
      }
    });
  },

  goBack() {
    commonMethods.goBack();
  }
}); 