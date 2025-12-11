import { defineStore } from 'pinia'
import alarmWebSocket from '@/utils/websocket'

export const useAlertStore = defineStore('alert', {
  state: () => ({
    // 当前显示的告警列表（右下角冒泡）
    activeAlerts: [],
    // 告警历史记录（右上角铃铛）
    alertHistory: [],
    // 实时告警消息列表（WarningPush弹窗）
    realtimeMessages: [],
    // 告警ID计数器
    alertIdCounter: 1,
    // WebSocket连接状态
    wsConnected: false,
    wsStatus: '未连接',
    // WebSocket消息处理器引用
    wsMessageHandler: null,
    wsStatusHandler: null
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
    // 初始化WebSocket连接
    initWebSocket() {
      if (this.wsMessageHandler) {
        console.log('WebSocket已初始化')
        return
      }

      // 创建消息处理器
      this.wsMessageHandler = (message) => {
        console.log('alertStore收到WebSocket消息:', message)
        this.handleWebSocketMessage(message)
      }

      // 创建状态处理器
      this.wsStatusHandler = (status) => {
        this.wsStatus = status
        this.wsConnected = status === '已连接'
      }

      // 注册处理器
      alarmWebSocket.onMessage(this.wsMessageHandler)
      alarmWebSocket.onStatusChange(this.wsStatusHandler)

      // 自动连接
      if (!alarmWebSocket.isConnected()) {
        alarmWebSocket.connect()
      }

      console.log('WebSocket已初始化并连接')
    },

    // 断开WebSocket连接
    disconnectWebSocket() {
      if (this.wsMessageHandler) {
        alarmWebSocket.offMessage(this.wsMessageHandler)
        this.wsMessageHandler = null
      }
      if (this.wsStatusHandler) {
        alarmWebSocket.offStatusChange(this.wsStatusHandler)
        this.wsStatusHandler = null
      }
      alarmWebSocket.disconnect()
      this.wsConnected = false
      this.wsStatus = '未连接'
    },

    // 处理WebSocket消息
    handleWebSocketMessage(message) {
      const time = new Date().toLocaleTimeString()
      
      console.log('=== WebSocket消息 ===')
      console.log('消息类型:', message.type)
      console.log('消息数据:', message.data)
      
      // 判断消息类型
      if (message.type === 'system_alert') {
        // 系统告警(IP冲突等)
        this.handleSystemAlert(message.data)
      } else if (message.type === 'alarm' && message.data) {
        // 后端发送的告警消息
        const alarmData = message.data
        console.log('告警数据字段:', Object.keys(alarmData))
        console.log('snapshot_base64存在:', !!alarmData.snapshot_base64)
        console.log('snapshot_url存在:', !!alarmData.snapshot_url)
        
        // 映射后端字段
        const mappedAlarm = {
          alarm_id: alarmData.alarm_id,
          type_name: alarmData.alarm_type_name,
          level: alarmData.alarm_level,
          device_name: alarmData.camera_name,
          device_id: alarmData.alarm_id,
          content: alarmData.message,
          location: alarmData.location,
          alarm_time: alarmData.alarm_time,
          snapshot_url: alarmData.snapshot_url,
          snapshot_base64: alarmData.snapshot_base64
        }
        
        // 处理图片：优先使用Base64，其次使用URL
        let imageUrl = '/api/placeholder/300/200?text=告警'
        if (alarmData.snapshot_base64) {
          // Base64图片需要添加data URI前缀
          imageUrl = `data:image/jpeg;base64,${alarmData.snapshot_base64}`
          console.log('使用Base64图片，长度:', alarmData.snapshot_base64.length)
        } else if (alarmData.snapshot_url) {
          // 使用fetch加载图片（可以设置Authorization请求头）
          const token = localStorage.getItem('token')
          
          // 异步加载图片并转换为Blob URL
          this.loadImageWithAuth(alarmData.snapshot_url, token).then(blobUrl => {
            // 更新已添加的告警的图片URL
            const alert = this.activeAlerts.find(a => a.rawData?.alarm_id === alarmData.alarm_id)
            if (alert) {
              alert.image = blobUrl
            }
            const historyAlert = this.alertHistory.find(a => a.rawData?.alarm_id === alarmData.alarm_id)
            if (historyAlert) {
              historyAlert.image = blobUrl
            }
          }).catch(err => {
            console.error('加载图片失败:', err)
          })
          
          // 先使用占位图
          imageUrl = '/api/placeholder/300/200?text=加载中'
          console.log('异步加载图片:', alarmData.snapshot_url)
        } else {
          console.log('使用默认占位图')
        }
        console.log('最终图片URL:', imageUrl.substring(0, 100) + '...')
        
        // 1. 添加到实时消息列表（WarningPush弹窗）
        this.realtimeMessages.unshift({
          time,
          type: 'alarm',
          alarm: mappedAlarm,
          text: null
        })
        
        // 限制实时消息数量
        if (this.realtimeMessages.length > 100) {
          this.realtimeMessages = this.realtimeMessages.slice(0, 100)
        }
        
        // 2. 添加到活动告警（右下角冒泡）
        const alertType = this.getAlertType(alarmData.alarm_level)
        console.log('添加告警，图片URL:', imageUrl.substring(0, 100) + '...')
        this.addAlert({
          type: alertType,
          message: `${alarmData.camera_name || '设备'}: ${alarmData.message}`,
          image: imageUrl,
          rawData: mappedAlarm
        })
        
      } else if (message.text) {
        // 系统消息
        this.realtimeMessages.unshift({
          time,
          type: message.type || 'info',
          alarm: null,
          text: message.text
        })
        
        if (this.realtimeMessages.length > 100) {
          this.realtimeMessages = this.realtimeMessages.slice(0, 100)
        }
      }
    },

    // 处理系统告警(IP冲突等) - 使用屏幕中心弹窗显示
    handleSystemAlert(data) {
      console.log('收到系统告警:', data)
      
      const alertType = data.type || 'unknown'
      const level = data.level || 'info'
      const message = data.message || '系统告警'
      const details = data.details || {}
      
      // 映射告警级别到MessageBox类型
      let messageBoxType = 'info'
      if (level === 'error') messageBoxType = 'error'
      else if (level === 'warning') messageBoxType = 'warning'
      else if (level === 'success') messageBoxType = 'success'
      
      // 构建弹窗标题
      let title = '系统通知'
      if (alertType === 'ip_conflict') {
        title = '⚠️ IP地址冲突警告'
      } else if (level === 'error') {
        title = '❌ 系统错误'
      } else if (level === 'warning') {
        title = '⚠️ 系统警告'
      } else if (level === 'success') {
        title = '✅ 系统成功'
      }
      
      // 构建弹窗消息内容
      let messageContent = message
      if (alertType === 'ip_conflict' && details.ip && details.board1 && details.board2) {
        messageContent = `
          <div style="line-height: 1.8;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">${message}</p>
            <div style="background: #f5f7fa; padding: 12px; border-radius: 4px; margin-top: 10px;">
              <p style="margin: 5px 0; color: #606266;"><strong>冲突IP:</strong> ${details.ip}</p>
              <p style="margin: 5px 0; color: #606266;"><strong>板卡1:</strong> ${details.board1}</p>
              <p style="margin: 5px 0; color: #606266;"><strong>板卡2:</strong> ${details.board2}</p>
            </div>
            <p style="margin: 15px 0 0 0; color: #909399; font-size: 13px;">⚠️ 请立即检查网络配置，确保每个板卡使用唯一的IP地址</p>
          </div>
        `
      }
      
      // 使用Element Plus的MessageBox显示屏幕中心弹窗
      import('element-plus').then(({ ElMessageBox }) => {
        ElMessageBox.alert(messageContent, title, {
          confirmButtonText: '我知道了',
          type: messageBoxType,
          dangerouslyUseHTMLString: true,
          center: true,
          customClass: 'system-alert-dialog',
          showClose: true,
          closeOnClickModal: false,
          closeOnPressEscape: true
        }).catch(() => {
          // 用户关闭弹窗
        })
      })
    },

    // 根据告警级别获取告警类型
    getAlertType(level) {
      if (level >= 4) return 'error'
      if (level >= 3) return 'warning'
      if (level >= 2) return 'info'
      return 'success'
    },

    // 添加新告警
    addAlert(alertData) {
      const alert = {
        id: this.alertIdCounter++,
        type: alertData.type || 'info',
        message: alertData.message || '未知告警',
        image: alertData.image || '/api/placeholder/300/200?text=默认告警',
        timestamp: Date.now(),
        read: false,
        rawData: alertData.rawData || null // 保存原始告警数据
      }

      // 添加到活动告警列表（右下角冒泡）
      this.activeAlerts.push(alert)

      // 添加到历史记录（右上角铃铛）
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
    },

    // 清空实时消息
    clearRealtimeMessages() {
      this.realtimeMessages = []
    },

    // 移除单个实时消息
    removeRealtimeMessage(index) {
      if (index >= 0 && index < this.realtimeMessages.length) {
        this.realtimeMessages.splice(index, 1)
      }
    },

    // 使用Authorization请求头加载图片
    async loadImageWithAuth(url, token) {
      try {
        // 处理URL：开发环境使用相对路径（代理），生产环境使用完整URL
        let fetchUrl = url
        if (process.env.NODE_ENV === 'production' && url.startsWith('/')) {
          // 生产环境：转换为完整URL
          fetchUrl = `${window.location.origin}${url}`
        }
        // 开发环境：直接使用相对路径，利用vue.config.js的代理配置
        
        console.log('加载图片URL:', fetchUrl)
        
        const response = await fetch(fetchUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          mode: 'cors', // 支持跨域
          credentials: 'include' // 包含cookies
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        console.log('图片加载成功，Blob URL:', blobUrl)
        return blobUrl
      } catch (error) {
        console.error('加载图片失败:', error)
        throw error
      }
    }
  }
})
