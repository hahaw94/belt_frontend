// WebSocket实时通信API
export class WebSocketManager {
  constructor() {
    this.connections = new Map()
    this.reconnectAttempts = new Map()
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 3000
  }

  /**
   * 建立WebSocket连接
   * @param {string} endpoint - WebSocket端点
   * @param {string} token - 认证令牌
   * @param {function} onMessage - 消息处理回调
   * @param {function} onError - 错误处理回调
   * @returns {WebSocket} WebSocket实例
   */
  connect(endpoint, token, onMessage, onError) {
    const baseUrl = process.env.VUE_APP_WS_BASE_URL || 'ws://localhost:8080'
    const url = `${baseUrl}${endpoint}?token=${token}`
    
    if (this.connections.has(endpoint)) {
      this.disconnect(endpoint)
    }

    const ws = new WebSocket(url)
    
    ws.onopen = () => {
      console.log(`WebSocket连接已建立: ${endpoint}`)
      this.reconnectAttempts.set(endpoint, 0)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (onMessage) {
          onMessage(data)
        }
      } catch (error) {
        console.error('WebSocket消息解析失败:', error)
      }
    }

    ws.onerror = (error) => {
      console.error(`WebSocket错误 ${endpoint}:`, error)
      if (onError) {
        onError(error)
      }
    }

    ws.onclose = (event) => {
      console.log(`WebSocket连接关闭: ${endpoint}`, event.code, event.reason)
      this.connections.delete(endpoint)
      
      // 自动重连
      if (event.code !== 1000) { // 非正常关闭
        this.handleReconnect(endpoint, token, onMessage, onError)
      }
    }

    this.connections.set(endpoint, ws)
    return ws
  }

  /**
   * 处理重连逻辑
   */
  handleReconnect(endpoint, token, onMessage, onError) {
    const attempts = this.reconnectAttempts.get(endpoint) || 0
    
    if (attempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`尝试重连 ${endpoint}, 第 ${attempts + 1} 次`)
        this.reconnectAttempts.set(endpoint, attempts + 1)
        this.connect(endpoint, token, onMessage, onError)
      }, this.reconnectInterval)
    } else {
      console.error(`WebSocket重连失败，已达到最大重试次数: ${endpoint}`)
    }
  }

  /**
   * 断开WebSocket连接
   * @param {string} endpoint - WebSocket端点
   */
  disconnect(endpoint) {
    const ws = this.connections.get(endpoint)
    if (ws) {
      ws.close(1000, '正常关闭')
      this.connections.delete(endpoint)
      this.reconnectAttempts.delete(endpoint)
    }
  }

  /**
   * 断开所有WebSocket连接
   */
  disconnectAll() {
    for (const [endpoint] of this.connections) {
      this.disconnect(endpoint)
    }
  }

  /**
   * 发送消息
   * @param {string} endpoint - WebSocket端点
   * @param {object} message - 要发送的消息
   */
  send(endpoint, message) {
    const ws = this.connections.get(endpoint)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    } else {
      console.warn(`WebSocket连接未就绪: ${endpoint}`)
    }
  }

  /**
   * 获取连接状态
   * @param {string} endpoint - WebSocket端点
   * @returns {number} WebSocket状态
   */
  getConnectionState(endpoint) {
    const ws = this.connections.get(endpoint)
    return ws ? ws.readyState : WebSocket.CLOSED
  }
}

// 创建全局WebSocket管理器实例
const wsManager = new WebSocketManager()

// WebSocket API封装
export const websocketApi = {
  /**
   * 连接实时告警推送
   * @param {number} userId - 用户ID
   * @param {function} onAlert - 告警消息处理回调
   * @param {function} onError - 错误处理回调
   */
  connectAlerts(userId, onAlert, onError) {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('未找到认证令牌')
      return null
    }

    return wsManager.connect(
      `/ws/alerts/${userId}`,
      token,
      (data) => {
        if (data.type === 'alert' && onAlert) {
          onAlert(data.data)
        }
      },
      onError
    )
  },

  /**
   * 连接设备状态推送
   * @param {number} userId - 用户ID
   * @param {function} onDeviceStatus - 设备状态变化处理回调
   * @param {function} onError - 错误处理回调
   */
  connectDeviceStatus(userId, onDeviceStatus, onError) {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('未找到认证令牌')
      return null
    }

    return wsManager.connect(
      `/ws/device-status/${userId}`,
      token,
      (data) => {
        if (data.type === 'device_status' && onDeviceStatus) {
          onDeviceStatus(data.data)
        }
      },
      onError
    )
  },

  /**
   * 连接即时告警推送
   * @param {number} userId - 用户ID
   * @param {function} onInstantAlert - 即时告警处理回调
   * @param {function} onError - 错误处理回调
   */
  connectInstantAlerts(userId, onInstantAlert, onError) {
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('未找到认证令牌')
      return null
    }

    return wsManager.connect(
      `/ws/instant-alerts/${userId}`,
      token,
      (data) => {
        if (data.type === 'instant_alert' && onInstantAlert) {
          onInstantAlert(data.data)
        }
      },
      onError
    )
  },

  /**
   * 断开指定WebSocket连接
   * @param {string} endpoint - WebSocket端点
   */
  disconnect(endpoint) {
    wsManager.disconnect(endpoint)
  },

  /**
   * 断开所有WebSocket连接
   */
  disconnectAll() {
    wsManager.disconnectAll()
  },

  /**
   * 获取连接状态
   * @param {string} endpoint - WebSocket端点
   * @returns {number} WebSocket状态
   */
  getConnectionState(endpoint) {
    return wsManager.getConnectionState(endpoint)
  }
}

export default websocketApi