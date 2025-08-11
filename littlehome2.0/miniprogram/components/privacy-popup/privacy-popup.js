// components/privacy-popup/privacy-popup.js
Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    feature: {
      type: String,
      value: ''
    },
    dataTypes: {
      type: Array,
      value: []
    }
  },

  data: {
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
    featureTitle: '',
    featureDescription: '',
    settingsStatus: []
  },

  lifetimes: {
    attached() {
      this.loadPrivacySettings()
    }
  },

  observers: {
    'feature, dataTypes': function(feature, dataTypes) {
      this.updateFeatureInfo(feature, dataTypes)
      this.updateSettingsStatus()
    }
  },

  methods: {
    // 加载隐私设置
    loadPrivacySettings() {
      const privacySettings = wx.getStorageSync('privacySettings')
      if (privacySettings) {
        this.setData({
          privacySettings: privacySettings
        })
      }
      this.updateSettingsStatus()
    },

    // 更新功能信息
    updateFeatureInfo(feature, dataTypes) {
      const featureMap = {
        'emotion_analysis': {
          title: 'AI情感分析',
          desc: '使用AI技术分析您的情感状态，为您提供个性化的情感建议'
        },
        'text_emotion_analysis': {
          title: '文本消息情感分析',
          desc: '允许AI分析你们的文本消息中的情感倾向'
        },
        'voice_emotion_analysis': {
          title: '语音消息情感分析',
          desc: '允许AI分析你们的语音消息中的情感倾向'
        },
        'media_emotion_analysis': {
          title: '媒体消息情感分析',
          desc: '允许AI分析你们的照片、视频消息中的情感倾向'
        },
        'media_upload': {
          title: '媒体上传',
          desc: '上传照片、视频等媒体文件，与伴侣分享美好时刻'
        },
        'location_tracking': {
          title: '位置共享',
          desc: '与伴侣共享位置信息，增进彼此的安全感'
        },
        'conversation_storage': {
          title: '对话存储',
          desc: '保存对话记录，方便回顾和情感分析'
        },
        'user_profile': {
          title: '用户资料',
          desc: '收集基本信息用于个性化服务'
        },
        'privacy_time': {
          title: '隐私时间设置',
          desc: '设置私人时间段'
        },
        'burn_after_read': {
          title: '阅后即焚',
          desc: '为共享的照片、视频或消息设置过期时间，内容将自动消失'
        }
      }

      const featureInfo = featureMap[feature] || {
        title: '功能使用',
        desc: '此功能需要收集相关信息以提供服务'
      }

      this.setData({
        featureTitle: featureInfo.title,
        featureDescription: featureInfo.desc
      })
    },

    // 更新设置状态
    updateSettingsStatus() {
      const settings = this.data.privacySettings
      const statusList = []

      // 根据功能类型显示相关设置状态
      switch (this.data.feature) {
        case 'emotion_analysis':
          statusList.push({
            name: '情感分析数据',
            enabled: settings.emotionAnalysis
          })
          break
        case 'text_emotion_analysis':
          statusList.push({
            name: '文本消息情感分析',
            enabled: settings.textEmotionAnalysis
          })
          break
        case 'voice_emotion_analysis':
          statusList.push({
            name: '语音消息情感分析',
            enabled: settings.voiceEmotionAnalysis
          })
          break
        case 'media_emotion_analysis':
          statusList.push({
            name: '媒体消息情感分析',
            enabled: settings.mediaEmotionAnalysis
          })
          break
        case 'media_upload':
          statusList.push({
            name: '照片和媒体',
            enabled: settings.mediaStorage
          })
          break
        case 'location_tracking':
          statusList.push({
            name: '位置信息',
            enabled: settings.locationTracking
          })
          break
        case 'conversation_storage':
          statusList.push({
            name: '对话记录存储',
            enabled: settings.conversationStorage
          })
          break
        case 'privacy_time':
          statusList.push({
            name: '隐私时间设置',
            enabled: settings.privacyTime
          })
          break
        case 'burn_after_read':
          statusList.push({
            name: '阅后即焚',
            enabled: settings.burnAfterRead
          })
          break
        default:
          // 显示所有相关设置
          if (this.data.dataTypes.some(item => item.type === 'emotion')) {
            statusList.push({
              name: '情感分析数据',
              enabled: settings.emotionAnalysis
            })
          }
          if (this.data.dataTypes.some(item => item.type === 'text_emotion')) {
            statusList.push({
              name: '文本消息情感分析',
              enabled: settings.textEmotionAnalysis
            })
          }
          if (this.data.dataTypes.some(item => item.type === 'voice_emotion')) {
            statusList.push({
              name: '语音消息情感分析',
              enabled: settings.voiceEmotionAnalysis
            })
          }
          if (this.data.dataTypes.some(item => item.type === 'media_emotion')) {
            statusList.push({
              name: '媒体消息情感分析',
              enabled: settings.mediaEmotionAnalysis
            })
          }
          if (this.data.dataTypes.some(item => item.type === 'media')) {
            statusList.push({
              name: '照片和媒体',
              enabled: settings.mediaStorage
            })
          }
          if (this.data.dataTypes.some(item => item.type === 'location')) {
            statusList.push({
              name: '位置信息',
              enabled: settings.locationTracking
            })
          }
          if (this.data.dataTypes.some(item => item.type === 'conversation')) {
            statusList.push({
              name: '对话记录存储',
              enabled: settings.conversationStorage
            })
          }
          if (this.data.dataTypes.some(item => item.type === 'privacy_time')) {
            statusList.push({
              name: '隐私时间设置',
              enabled: settings.privacyTime
            })
          }
          if (this.data.dataTypes.some(item => item.type === 'burn_after_read')) {
            statusList.push({
              name: '阅后即焚',
              enabled: settings.burnAfterRead
            })
          }
      }

      this.setData({
        settingsStatus: statusList
      })
    },

    // 确认使用功能
    confirmUse() {
      // 检查相关隐私设置是否启用
      const requiredSettings = this.checkRequiredSettings()
      
      if (requiredSettings.allEnabled) {
        this.triggerEvent('confirm')
        this.hidePopup()
      } else {
        this.showSettingsGuide(requiredSettings.disabledSettings)
      }
    },

    // 检查必需的隐私设置
    checkRequiredSettings() {
      const settings = this.data.privacySettings
      const disabledSettings = []
      
      // 根据功能类型检查必需的设置
      switch (this.data.feature) {
        case 'emotion_analysis':
          if (!settings.emotionAnalysis) {
            disabledSettings.push('情感分析数据')
          } else {
            // 检查子功能是否都启用
            if (!settings.textEmotionAnalysis) {
              disabledSettings.push('文本消息情感分析')
            }
            if (!settings.voiceEmotionAnalysis) {
              disabledSettings.push('语音消息情感分析')
            }
            if (!settings.mediaEmotionAnalysis) {
              disabledSettings.push('媒体消息情感分析')
            }
          }
          break
        case 'text_emotion_analysis':
          if (!settings.textEmotionAnalysis) {
            disabledSettings.push('文本消息情感分析')
          }
          break
        case 'voice_emotion_analysis':
          if (!settings.voiceEmotionAnalysis) {
            disabledSettings.push('语音消息情感分析')
          }
          break
        case 'media_emotion_analysis':
          if (!settings.mediaEmotionAnalysis) {
            disabledSettings.push('媒体消息情感分析')
          }
          break
        case 'media_upload':
          if (!settings.mediaStorage) {
            disabledSettings.push('照片和媒体')
          }
          break
        case 'location_tracking':
          if (!settings.locationTracking) {
            disabledSettings.push('位置信息')
          }
          break
        case 'conversation_storage':
          if (!settings.conversationStorage) {
            disabledSettings.push('对话记录存储')
          }
          break
        case 'privacy_time':
          if (!settings.privacyTime) {
            disabledSettings.push('隐私时间设置')
          }
          break
        case 'burn_after_read':
          if (!settings.burnAfterRead) {
            disabledSettings.push('阅后即焚')
          }
          break
      }
      
      return {
        allEnabled: disabledSettings.length === 0,
        disabledSettings: disabledSettings
      }
    },

    // 显示设置引导
    showSettingsGuide(disabledSettings) {
      const settingsText = disabledSettings.join('、')
      wx.showModal({
        title: '需要启用相关权限',
        content: `此功能需要启用以下设置：${settingsText}\n\n请在隐私保护设置中开启相关设置。`,
        confirmText: '去设置',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.navigateToPrivacySettings()
          }
        }
      })
    },

    // 跳转到隐私设置
    navigateToPrivacySettings() {
      // 这里可以跳转到隐私设置页面，暂时使用showModal
      wx.showModal({
        title: '隐私设置',
        content: '请在"我的"页面中找到"隐私保护"选项进行设置',
        showCancel: false
      })
    },

    // 拒绝使用
    rejectUse() {
      this.triggerEvent('reject')
      this.hidePopup()
    },

    // 隐藏弹窗
    hidePopup() {
      this.triggerEvent('hide')
    },

    // 阻止事件冒泡
    stopPropagation() {
      // 空函数，用于阻止事件冒泡
    }
  }
}) 