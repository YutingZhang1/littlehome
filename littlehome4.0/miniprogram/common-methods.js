// 通用方法库
const commonMethods = {
  // 开发环境标识 - 可以通过配置切换
  isDevelopment: true, // 生产环境设为 false
  isDebugMode: true,   // 调试模式开关
  
  // 日志级别配置
  logLevels: {
    ERROR: 0,    // 错误 - 始终记录
    WARN: 1,     // 警告 - 生产环境也记录
    INFO: 2,     // 信息 - 开发环境记录
    DEBUG: 3,    // 调试 - 仅调试模式记录
    TRACE: 4     // 追踪 - 最详细，仅开发环境
  },
  
  currentLogLevel: 2, // 默认INFO级别

  // 智能日志记录 - 根据级别和环境自动过滤
  log(level, message, data = null, context = '') {
    const levelName = Object.keys(this.logLevels)[level];
    const shouldLog = this.shouldLog(level);
    
    if (shouldLog) {
      const timestamp = new Date().toISOString();
      const prefix = context ? `[${context}]` : '';
      const logMessage = `${prefix} ${levelName}: ${message}`;
      
      if (data) {
        console.log(logMessage, data);
      } else {
        console.log(logMessage);
      }
      
      // 关键日志保存到本地存储（用于离线分析）
      if (level <= this.logLevels.WARN) {
        this.saveLogToStorage(levelName, message, data, context);
      }
    }
  },

  // 判断是否应该记录日志
  shouldLog(level) {
    if (level <= this.logLevels.WARN) return true; // 错误和警告始终记录
    if (!this.isDevelopment && level > this.logLevels.INFO) return false; // 生产环境不记录调试信息
    if (!this.isDebugMode && level > this.logLevels.INFO) return false; // 非调试模式不记录调试信息
    return level <= this.currentLogLevel;
  },

  // 便捷的日志方法
  error(message, data = null, context = '') {
    this.log(this.logLevels.ERROR, message, data, context);
  },

  warn(message, data = null, context = '') {
    this.log(this.logLevels.WARN, message, data, context);
  },

  info(message, data = null, context = '') {
    this.log(this.logLevels.INFO, message, data, context);
  },

  debug(message, data = null, context = '') {
    this.log(this.logLevels.DEBUG, message, data, context);
  },

  trace(message, data = null, context = '') {
    this.log(this.logLevels.TRACE, message, data, context);
  },

  // 保存关键日志到本地存储
  saveLogToStorage(level, message, data, context) {
    try {
      const logs = wx.getStorageSync('app_logs') || [];
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data: data ? JSON.stringify(data) : null,
        context,
        page: this.getCurrentPage()
      };
      
      logs.push(logEntry);
      
      // 只保留最近100条日志
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      wx.setStorageSync('app_logs', logs);
    } catch (e) {
      // 日志保存失败时不阻塞主流程
      console.error('保存日志失败:', e);
    }
  },

  // 获取当前页面信息
  getCurrentPage() {
    try {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      return currentPage ? currentPage.route : 'unknown';
    } catch (e) {
      return 'unknown';
    }
  },

  // 获取所有日志
  getLogs() {
    try {
      return wx.getStorageSync('app_logs') || [];
    } catch (e) {
      return [];
    }
  },

  // 清理日志
  clearLogs() {
    try {
      wx.removeStorageSync('app_logs');
      return true;
    } catch (e) {
      return false;
    }
  },

  // 导出日志（用于问题排查）
  exportLogs() {
    const logs = this.getLogs();
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.level} [${log.context}] ${log.message} ${log.data || ''}`
    ).join('\n');
    
    return logText;
  },

  // 显示错误提示
  showErrorToast(message, type = 'error') {
    const iconMap = {
      'timeout': 'none',
      'network': 'none',
      'bad_request': 'none',
      'unauthorized': 'none',
      'forbidden': 'none',
      'not_found': 'none',
      'server_error': 'none',
      'service_unavailable': 'none',
      'http_error': 'none',
      'unknown': 'none'
    };
    
    wx.showToast({
      title: message,
      icon: iconMap[type] || 'none',
      duration: 3000
    });
  },

  // 显示成功提示
  showSuccessToast(message, duration = 2000) {
    wx.showToast({
      title: message,
      icon: 'success',
      duration: duration
    });
  },

  // 显示加载提示
  showLoading(title = '加载中...', mask = true) {
    wx.showLoading({
      title: title,
      mask: mask
    });
  },

  // 隐藏加载提示
  hideLoading() {
    wx.hideLoading();
  },

  // 网络请求封装
  request(options) {
    const {
      url,
      method = 'GET',
      data = {},
      header = {},
      timeout = 30000,
      showLoading = false,
      loadingText = '请求中...',
      context = '网络请求'
    } = options;

    // 显示加载提示
    if (showLoading) {
      this.showLoading(loadingText);
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method,
        data,
        header,
        timeout,
        success: (res) => {
          if (showLoading) {
            this.hideLoading();
          }
          
          // 检查响应状态
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res);
          } else {
            const error = {
              statusCode: res.statusCode,
              data: res.data,
              errMsg: `HTTP ${res.statusCode}`
            };
            const handledError = this.handleError(error, context);
            reject(handledError);
          }
        },
        fail: (err) => {
          if (showLoading) {
            this.hideLoading();
          }
          
          const handledError = this.handleError(err, context);
          reject(handledError);
        }
      });
    });
  },

  // 安全的API请求（带重试机制）
  safeRequest(options, maxRetries = 2) {
    const attempt = (retryCount = 0) => {
      return this.request(options).catch(error => {
        if (retryCount < maxRetries && this.shouldRetry(error)) {
          console.log(`请求失败，第${retryCount + 1}次重试...`);
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(attempt(retryCount + 1));
            }, 1000 * (retryCount + 1)); // 递增延迟
          });
        }
        throw error;
      });
    };
    
    return attempt();
  },

  // 判断是否应该重试
  shouldRetry(error) {
    const retryableErrors = ['timeout', 'network', 'service_unavailable', 'http_error'];
    return retryableErrors.includes(error.type);
  },

  // 数据验证工具
  validateData(data, rules) {
    const errors = [];
    
    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];
      
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.label || field}不能为空`);
        continue;
      }
      
      if (value !== undefined && value !== null && value !== '') {
        if (rule.type === 'string' && rule.minLength && value.length < rule.minLength) {
          errors.push(`${rule.label || field}长度不能少于${rule.minLength}个字符`);
        }
        
        if (rule.type === 'string' && rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${rule.label || field}长度不能超过${rule.maxLength}个字符`);
        }
        
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`${rule.label || field}格式不正确`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  // 防抖函数
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // 节流函数
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // 格式化时间
  formatTime(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  // 相对时间显示
  getRelativeTime(timestamp) {
    if (!timestamp) return '';
    
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    
    return this.formatTime(timestamp, 'MM-DD');
  }
};

// 导出方法
module.exports = commonMethods; 