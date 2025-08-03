// WebSocket连接管理
export class WebSocketManager {
  constructor() {
    this.connections = new Map()
    this.baseUrl = process.env.VUE_APP_WS_BASE_URL || 'ws://192.168.1.100:8080'
  }

  // 创建WebSocket连接
  connect(endpoint, userId, options = {}) {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('No token found for WebSocket connection')
      return null
    }

    const url = `${this.baseUrl}/ws/${endpoint}/${userId}?token=${token}`
    
    if (this.connections.has(endpoint)) {
      this.disconnect(endpoint)
    }

    try {
      const ws = new WebSocket(url)
      
      ws.onopen = () => {
        console.log(`WebSocket connected: ${endpoint}`)
        if (options.onOpen) options.onOpen()
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (options.onMessage) options.onMessage(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected: ${endpoint}`, event.code, event.reason)
        this.connections.delete(endpoint)
        if (options.onClose) options.onClose(event)
        
        // 自动重连（除非是正常关闭）
        if (event.code !== 1000 && options.autoReconnect !== false) {
          setTimeout(() => {
            console.log(`Attempting to reconnect WebSocket: ${endpoint}`)
            this.connect(endpoint, userId, options)
          }, 5000)
        }
      }

      ws.onerror = (error) => {
        console.error(`WebSocket error: ${endpoint}`, error)
        if (options.onError) options.onError(error)
      }

      this.connections.set(endpoint, ws)
      return ws
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      return null
    }
  }

  // 断开WebSocket连接
  disconnect(endpoint) {
    const ws = this.connections.get(endpoint)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close(1000, 'Client disconnect')
    }
    this.connections.delete(endpoint)
  }

  // 发送消息
  send(endpoint, data) {
    const ws = this.connections.get(endpoint)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data))
      return true
    }
    console.warn(`WebSocket not connected: ${endpoint}`)
    return false
  }

  // 断开所有连接
  disconnectAll() {
    this.connections.forEach((ws, endpoint) => {
      this.disconnect(endpoint)
    })
  }

  // 获取连接状态
  isConnected(endpoint) {
    const ws = this.connections.get(endpoint)
    return ws && ws.readyState === WebSocket.OPEN
  }
}

// 创建全局WebSocket管理实例
export const wsManager = new WebSocketManager()

// WebSocket相关的API
export const websocketApi = {
  // 连接实时告警推送
  connectAlerts(userId, callbacks) {
    return wsManager.connect('alerts', userId, {
      onMessage: (data) => {
        if (data.type === 'alert' && callbacks.onAlert) {
          callbacks.onAlert(data.data)
        }
      },
      ...callbacks
    })
  },

  // 连接设备状态推送
  connectDeviceStatus(userId, callbacks) {
    return wsManager.connect('device-status', userId, {
      onMessage: (data) => {
        if (data.type === 'device_status' && callbacks.onDeviceStatus) {
          callbacks.onDeviceStatus(data.data)
        }
      },
      ...callbacks
    })
  },

  // 连接即时告警推送
  connectInstantAlerts(userId, callbacks) {
    return wsManager.connect('instant-alerts', userId, {
      onMessage: (data) => {
        if (data.type === 'instant_alert' && callbacks.onInstantAlert) {
          callbacks.onInstantAlert(data.data)
        }
      },
      ...callbacks
    })
  },

  // 断开连接
  disconnect(endpoint) {
    wsManager.disconnect(endpoint)
  },

  // 断开所有连接
  disconnectAll() {
    wsManager.disconnectAll()
  }
} 