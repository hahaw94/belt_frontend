import { defineStore } from 'pinia'

export const useAlertStore = defineStore('alert', {
  state: () => ({
    // 当前显示的告警列表
    activeAlerts: [],
    // 告警历史记录
    alertHistory: [],
    // 告警ID计数器
    alertIdCounter: 1
  }),

  getters: {
    // 获取未读告警数量
    unreadCount: (state) => {
      return state.alertHistory.filter(alert => !alert.read).length
    },

    // 检查是否有未读告警
    hasUnreadAlerts: (state) => {
      return state.alertHistory.some(alert => !alert.read)
    },

    // 获取最近的告警
    recentAlerts: (state) => {
      return state.alertHistory
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50) // 只保留最近50条
    }
  },

  actions: {
    // 添加新告警
    addAlert(alertData) {
      const alert = {
        id: this.alertIdCounter++,
        type: alertData.type || 'info',
        message: alertData.message || '未知告警',
        image: alertData.image || '/api/placeholder/300/200?text=默认告警',
        timestamp: Date.now(),
        read: false
      }

      // 添加到活动告警列表
      this.activeAlerts.push(alert)

      // 添加到历史记录
      this.alertHistory.unshift(alert)

      // 限制历史记录数量，避免内存溢出
      if (this.alertHistory.length > 1000) {
        this.alertHistory = this.alertHistory.slice(0, 1000)
      }

      return alert.id
    },

    // 移除活动告警
    removeActiveAlert(alertId) {
      const index = this.activeAlerts.findIndex(alert => alert.id === alertId)
      if (index > -1) {
        this.activeAlerts.splice(index, 1)
      }
    },

    // 标记告警为已读
    markAsRead(alertId) {
      const alert = this.alertHistory.find(alert => alert.id === alertId)
      if (alert) {
        alert.read = true
      }
    },

    // 标记所有告警为已读
    markAllAsRead() {
      this.alertHistory.forEach(alert => {
        alert.read = true
      })
    },

    // 清空告警历史
    clearHistory() {
      this.alertHistory = []
      this.activeAlerts = []
    },

    // 创建测试告警
    createTestAlert() {
      const testAlerts = [
        {
          type: 'error',
          message: '检测到异常行为：人员进入危险区域',
          image: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="300" height="200" fill="url(#grad1)" stroke="#ff4d4f" stroke-width="2"/>
              <text x="150" y="100" font-family="Arial" font-size="16" font-weight="bold" fill="#ff4d4f" text-anchor="middle">危险区域告警</text>
              <text x="150" y="130" font-family="Arial" font-size="12" fill="#ffffff" text-anchor="middle">${new Date().toLocaleString()}</text>
            </svg>
          `)
        },
        {
          type: 'warning',
          message: '设备温度过高，请及时检查维护',
          image: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="300" height="200" fill="url(#grad2)" stroke="#ffc107" stroke-width="2"/>
              <text x="150" y="100" font-family="Arial" font-size="16" font-weight="bold" fill="#ffc107" text-anchor="middle">温度告警</text>
              <text x="150" y="130" font-family="Arial" font-size="12" fill="#ffffff" text-anchor="middle">${new Date().toLocaleString()}</text>
            </svg>
          `)
        },
        {
          type: 'info',
          message: '新的AI检测任务已开始执行',
          image: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="300" height="200" fill="url(#grad3)" stroke="#00ffff" stroke-width="2"/>
              <text x="150" y="100" font-family="Arial" font-size="16" font-weight="bold" fill="#00ffff" text-anchor="middle">任务通知</text>
              <text x="150" y="130" font-family="Arial" font-size="12" fill="#ffffff" text-anchor="middle">${new Date().toLocaleString()}</text>
            </svg>
          `)
        },
        {
          type: 'success',
          message: '系统自检完成，所有设备运行正常',
          image: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="300" height="200" fill="url(#grad4)" stroke="#67c23a" stroke-width="2"/>
              <text x="150" y="100" font-family="Arial" font-size="16" font-weight="bold" fill="#67c23a" text-anchor="middle">系统正常</text>
              <text x="150" y="130" font-family="Arial" font-size="12" fill="#ffffff" text-anchor="middle">${new Date().toLocaleString()}</text>
            </svg>
          `)
        },
        {
          type: 'error',
          message: '摄像头连接异常，请检查网络连接',
          image: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="300" height="200" fill="url(#grad5)" stroke="#ff4d4f" stroke-width="2"/>
              <text x="150" y="100" font-family="Arial" font-size="16" font-weight="bold" fill="#ff4d4f" text-anchor="middle">网络异常</text>
              <text x="150" y="130" font-family="Arial" font-size="12" fill="#ffffff" text-anchor="middle">${new Date().toLocaleString()}</text>
            </svg>
          `)
        },
        {
          type: 'warning',
          message: '存储空间不足，建议清理历史数据',
          image: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="300" height="200" fill="url(#grad6)" stroke="#ffc107" stroke-width="2"/>
              <text x="150" y="100" font-family="Arial" font-size="16" font-weight="bold" fill="#ffc107" text-anchor="middle">存储告警</text>
              <text x="150" y="130" font-family="Arial" font-size="12" fill="#ffffff" text-anchor="middle">${new Date().toLocaleString()}</text>
            </svg>
          `)
        }
      ]

      const randomAlert = testAlerts[Math.floor(Math.random() * testAlerts.length)]
      return this.addAlert(randomAlert)
    },


    // 批量添加告警（用于模拟多个告警）
    addMultipleAlerts(count = 3) {
      const alertIds = []
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const alertId = this.createTestAlert()
          alertIds.push(alertId)
        }, i * 500) // 每500ms添加一个告警
      }
      return alertIds
    },

    // 获取指定类型的告警数量
    getAlertCountByType(type) {
      return this.alertHistory.filter(alert => alert.type === type).length
    },

    // 获取今日告警数量
    getTodayAlertCount() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayTimestamp = today.getTime()
      
      return this.alertHistory.filter(alert => alert.timestamp >= todayTimestamp).length
    }
  }
})
