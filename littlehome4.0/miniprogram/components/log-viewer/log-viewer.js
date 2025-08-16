Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    logs: [],
    logLevels: ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'],
    selectedLevel: 'ALL',
    searchText: '',
    autoRefresh: true,
    refreshInterval: null
  },

  lifetimes: {
    attached() {
      this.loadLogs();
      if (this.data.autoRefresh) {
        this.startAutoRefresh();
      }
    },

    detached() {
      if (this.data.refreshInterval) {
        clearInterval(this.data.refreshInterval);
      }
    }
  },

  methods: {
    // 加载日志
    loadLogs() {
      try {
        const logs = wx.getStorageSync('app_logs') || [];
        this.setData({ logs: logs.reverse() }); // 最新的日志在前面
      } catch (e) {
        console.error('加载日志失败:', e);
      }
    },

    // 刷新日志
    refreshLogs() {
      this.loadLogs();
    },

    // 开始自动刷新
    startAutoRefresh() {
      if (this.data.refreshInterval) {
        clearInterval(this.data.refreshInterval);
      }
      
      const interval = setInterval(() => {
        if (this.data.autoRefresh) {
          this.loadLogs();
        }
      }, 2000); // 每2秒刷新一次
      
      this.setData({ refreshInterval: interval });
    },

    // 停止自动刷新
    stopAutoRefresh() {
      if (this.data.refreshInterval) {
        clearInterval(this.data.refreshInterval);
        this.setData({ refreshInterval: null });
      }
    },

    // 切换自动刷新
    toggleAutoRefresh() {
      const newAutoRefresh = !this.data.autoRefresh;
      this.setData({ autoRefresh: newAutoRefresh });
      
      if (newAutoRefresh) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    },

    // 过滤日志
    filterLogs() {
      this.loadLogs();
      let filteredLogs = this.data.logs;
      
      // 按级别过滤
      if (this.data.selectedLevel !== 'ALL') {
        filteredLogs = filteredLogs.filter(log => log.level === this.data.selectedLevel);
      }
      
      // 按搜索文本过滤
      if (this.data.searchText) {
        const searchLower = this.data.searchText.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.message.toLowerCase().includes(searchLower) ||
          (log.context && log.context.toLowerCase().includes(searchLower)) ||
          (log.data && log.data.toLowerCase().includes(searchLower))
        );
      }
      
      this.setData({ logs: filteredLogs });
    },

    // 清空日志
    clearLogs() {
      wx.showModal({
        title: '确认清空',
        content: '确定要清空所有日志吗？',
        success: (res) => {
          if (res.confirm) {
            try {
              wx.removeStorageSync('app_logs');
              this.loadLogs();
              wx.showToast({ title: '日志已清空', icon: 'success' });
            } catch (e) {
              wx.showToast({ title: '清空失败', icon: 'error' });
            }
          }
        }
      });
    },

    // 导出日志
    exportLogs() {
      try {
        const logs = wx.getStorageSync('app_logs') || [];
        const logText = logs.map(log => 
          `[${log.timestamp}] ${log.level} [${log.context}] ${log.message} ${log.data || ''}`
        ).join('\n');
        
        // 复制到剪贴板
        wx.setClipboardData({
          data: logText,
          success: () => {
            wx.showToast({ title: '日志已复制到剪贴板', icon: 'success' });
          }
        });
      } catch (e) {
        wx.showToast({ title: '导出失败', icon: 'error' });
      }
    },

    // 关闭日志查看器
    closeLogViewer() {
      this.triggerEvent('close');
    },

    // 搜索输入
    onSearchInput(e) {
      this.setData({ searchText: e.detail.value });
      this.filterLogs();
    },

    // 级别选择
    onLevelChange(e) {
      this.setData({ selectedLevel: e.detail.value });
      this.filterLogs();
    },

    // 格式化时间
    formatTime(timestamp) {
      try {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN');
      } catch (e) {
        return timestamp;
      }
    },

    // 获取日志级别样式
    getLogLevelStyle(level) {
      const styles = {
        ERROR: 'color: #ff4444; font-weight: bold;',
        WARN: 'color: #ff8800; font-weight: bold;',
        INFO: 'color: #2196f3;',
        DEBUG: 'color: #4caf50;',
        TRACE: 'color: #9e9e9e;'
      };
      return styles[level] || '';
    }
  }
});
