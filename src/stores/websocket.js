import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

/**
 * WebSocket连接管理Store
 * 功能：实时告警推送、设备状态推送、连接管理、消息处理
 */
export const useWebSocketStore = defineStore('websocket', () => {
  // State
  const connections = ref(new Map()) // 存储多个WebSocket连接
  const connectionStatus = ref('disconnected') // 总体连接状态
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = ref(5)
  const reconnectInterval = ref(3000) // 重连间隔
  const isReconnecting = ref(false)
  const lastHeartbeat = ref(null)
  const heartbeatInterval = ref(null)
  const messageQueue = ref([]) // 消息队列（离线时存储）
  const realtimeMessages = ref([]) // 实时消息列表
  const messageHandlers = ref(new Map()) // 消息处理器

  // Getters
  const isConnected = computed(() => connectionStatus.value === 'connected')
  const isConnecting = computed(() => connectionStatus.value === 'connecting')
  const isDisconnected = computed(() => connectionStatus.value === 'disconnected')
  const activeConnections = computed(() => {
    const active = []
    connections.value.forEach((conn, endpoint) => {
      if (conn.readyState === WebSocket.OPEN) {
        active.push({ endpoint, status: 'connected' })
      }
    })
    return active
  })
  const unreadMessageCount = computed(() => 
    realtimeMessages.value.filter(msg => !msg.read).length
  )

  // Actions
  /**
   * 建立WebSocket连接
   * @param {string} endpoint - 连接端点
   * @param {Object} options - 连接选项
   */
  const connect = (endpoint, options = {}) => {
    const authStore = useAuthStore()
    
    if (!authStore.token) {
      console.error('未找到认证token，无法建立WebSocket连接')
      return Promise.reject(new Error('未认证'))
    }

    return new Promise((resolve, reject) => {
      try {
        // 构建WebSocket URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const host = window.location.host
        const wsUrl = `${protocol}//${host}${endpoint}?token=${authStore.token}`
        
        connectionStatus.value = 'connecting'
        
        const ws = new WebSocket(wsUrl)
        
        ws.onopen = () => {
          console.log(`WebSocket连接已建立: ${endpoint}`)
          connectionStatus.value = 'connected'
          reconnectAttempts.value = 0
          isReconnecting.value = false
          
          // 存储连接
          connections.value.set(endpoint, ws)
          
          // 开始心跳
          startHeartbeat(endpoint)
          
          // 发送队列中的消息
          flushMessageQueue(endpoint)
          
          resolve(ws)
        }
        
        ws.onmessage = (event) => {
          handleMessage(endpoint, event.data)
        }
        
        ws.onerror = (error) => {
          console.error(`WebSocket连接错误: ${endpoint}`, error)
          connectionStatus.value = 'disconnected'
          reject(error)
        }
        
        ws.onclose = (event) => {
          console.log(`WebSocket连接已关闭: ${endpoint}`, event.code, event.reason)
          connectionStatus.value = 'disconnected'
          connections.value.delete(endpoint)
          stopHeartbeat()
          
          // 自动重连
          if (!event.wasClean && reconnectAttempts.value < maxReconnectAttempts.value) {
            scheduleReconnect(endpoint, options)
          }
        }
        
      } catch (error) {
        console.error('创建WebSocket连接失败:', error)
        connectionStatus.value = 'disconnected'
        reject(error)
      }
    })
  }

  /**
   * 处理接收到的消息
   * @param {string} endpoint - 连接端点
   * @param {string} data - 消息数据
   */
  const handleMessage = (endpoint, data) => {
    try {
      const message = JSON.parse(data)
      
      // 更新最后心跳时间
      if (message.type === 'heartbeat') {
        lastHeartbeat.value = new Date()
        return
      }
      
      // 添加到实时消息列表
      const processedMessage = {
        id: Date.now() + Math.random(),
        endpoint,
        timestamp: new Date().toISOString(),
        read: false,
        ...message
      }
      
      realtimeMessages.value.unshift(processedMessage)
      
      // 保持消息列表最多200条
      if (realtimeMessages.value.length > 200) {
        realtimeMessages.value = realtimeMessages.value.slice(0, 200)
      }
      
      // 调用相应的消息处理器
      const handler = messageHandlers.value.get(message.type)
      if (handler) {
        handler(message, endpoint)
      }
      
      // 调用通用消息处理器
      const generalHandler = messageHandlers.value.get('*')
      if (generalHandler) {
        generalHandler(message, endpoint)
      }
      
    } catch (error) {
      console.error('解析WebSocket消息失败:', error, data)
    }
  }

  /**
   * 发送消息
   * @param {string} endpoint - 连接端点
   * @param {Object} message - 消息对象
   */
  const sendMessage = (endpoint, message) => {
    const connection = connections.value.get(endpoint)
    
    if (connection && connection.readyState === WebSocket.OPEN) {
      try {
        connection.send(JSON.stringify(message))
        return true
      } catch (error) {
        console.error('发送WebSocket消息失败:', error)
        // 添加到队列中，等待重连后发送
        messageQueue.value.push({ endpoint, message })
        return false
      }
    } else {
      // 连接未建立，添加到队列
      messageQueue.value.push({ endpoint, message })
      return false
    }
  }

  /**
   * 断开连接
   * @param {string} endpoint - 连接端点
   */
  const disconnect = (endpoint) => {
    const connection = connections.value.get(endpoint)
    
    if (connection) {
      connection.close(1000, '主动断开连接')
      connections.value.delete(endpoint)
    }
    
    if (connections.value.size === 0) {
      connectionStatus.value = 'disconnected'
      stopHeartbeat()
    }
  }

  /**
   * 断开所有连接
   */
  const disconnectAll = () => {
    connections.value.forEach((connection, endpoint) => {
      connection.close(1000, '断开所有连接')
    })
    
    connections.value.clear()
    connectionStatus.value = 'disconnected'
    stopHeartbeat()
    isReconnecting.value = false
    reconnectAttempts.value = 0
  }

  /**
   * 调度重连
   * @param {string} endpoint - 连接端点
   * @param {Object} options - 连接选项
   */
  const scheduleReconnect = (endpoint, options) => {
    if (isReconnecting.value) return
    
    isReconnecting.value = true
    reconnectAttempts.value++
    
    console.log(`正在调度重连 ${endpoint}, 尝试次数: ${reconnectAttempts.value}`)
    
    setTimeout(() => {
      connect(endpoint, options).catch(() => {
        if (reconnectAttempts.value >= maxReconnectAttempts.value) {
          console.error(`WebSocket重连失败，已达到最大重试次数: ${endpoint}`)
          isReconnecting.value = false
        }
      })
    }, reconnectInterval.value)
  }

  /**
   * 开始心跳
   * @param {string} endpoint - 连接端点
   */
  const startHeartbeat = (endpoint) => {
    stopHeartbeat() // 先停止之前的心跳
    
    heartbeatInterval.value = setInterval(() => {
      sendMessage(endpoint, { type: 'heartbeat', timestamp: Date.now() })
    }, 30000) // 每30秒发送一次心跳
  }

  /**
   * 停止心跳
   */
  const stopHeartbeat = () => {
    if (heartbeatInterval.value) {
      clearInterval(heartbeatInterval.value)
      heartbeatInterval.value = null
    }
  }

  /**
   * 发送队列中的消息
   * @param {string} endpoint - 连接端点
   */
  const flushMessageQueue = (endpoint) => {
    const pendingMessages = messageQueue.value.filter(item => item.endpoint === endpoint)
    
    pendingMessages.forEach(item => {
      if (sendMessage(item.endpoint, item.message)) {
        // 发送成功，从队列中移除
        const index = messageQueue.value.indexOf(item)
        if (index > -1) {
          messageQueue.value.splice(index, 1)
        }
      }
    })
  }

  /**
   * 注册消息处理器
   * @param {string} messageType - 消息类型
   * @param {Function} handler - 处理函数
   */
  const registerMessageHandler = (messageType, handler) => {
    messageHandlers.value.set(messageType, handler)
  }

  /**
   * 注销消息处理器
   * @param {string} messageType - 消息类型
   */
  const unregisterMessageHandler = (messageType) => {
    messageHandlers.value.delete(messageType)
  }

  /**
   * 连接实时告警WebSocket
   * @param {number} userId - 用户ID
   */
  const connectAlerts = async (userId) => {
    const endpoint = `/ws/alerts/${userId}`
    
    // 注册告警消息处理器
    registerMessageHandler('alert', (message) => {
      // 通知其他store处理告警
      console.log('收到实时告警:', message.data)
      
      // 可以在这里通知dashboard store或event store
    })
    
    return connect(endpoint)
  }

  /**
   * 连接设备状态WebSocket
   * @param {number} userId - 用户ID
   */
  const connectDeviceStatus = async (userId) => {
    const endpoint = `/ws/device-status/${userId}`
    
    // 注册设备状态消息处理器
    registerMessageHandler('device_status', (message) => {
      console.log('收到设备状态变化:', message.data)
      
      // 可以在这里通知device store更新设备状态
    })
    
    return connect(endpoint)
  }

  /**
   * 连接即时告警WebSocket
   * @param {number} userId - 用户ID
   */
  const connectInstantAlerts = async (userId) => {
    const endpoint = `/ws/instant-alerts/${userId}`
    
    // 注册即时告警消息处理器
    registerMessageHandler('instant_alert', (message) => {
      console.log('收到即时告警:', message.data)
      
      // 可以显示弹窗或通知
    })
    
    return connect(endpoint)
  }

  /**
   * 建立所有必要的WebSocket连接
   * @param {number} userId - 用户ID
   */
  const connectAll = async (userId) => {
    try {
      await Promise.all([
        connectAlerts(userId),
        connectDeviceStatus(userId),
        connectInstantAlerts(userId)
      ])
      console.log('所有WebSocket连接已建立')
    } catch (error) {
      console.error('建立WebSocket连接失败:', error)
    }
  }

  /**
   * 标记消息为已读
   * @param {number} messageId - 消息ID
   */
  const markMessageAsRead = (messageId) => {
    const message = realtimeMessages.value.find(msg => msg.id === messageId)
    if (message) {
      message.read = true
    }
  }

  /**
   * 标记所有消息为已读
   */
  const markAllMessagesAsRead = () => {
    realtimeMessages.value.forEach(message => {
      message.read = true
    })
  }

  /**
   * 清空消息列表
   */
  const clearMessages = () => {
    realtimeMessages.value = []
  }

  /**
   * 获取特定类型的消息
   * @param {string} messageType - 消息类型
   */
  const getMessagesByType = (messageType) => {
    return realtimeMessages.value.filter(msg => msg.type === messageType)
  }

  /**
   * 检查连接健康状态
   */
  const checkConnectionHealth = () => {
    const healthStatus = {
      total_connections: connections.value.size,
      active_connections: activeConnections.value.length,
      last_heartbeat: lastHeartbeat.value,
      reconnect_attempts: reconnectAttempts.value,
      is_reconnecting: isReconnecting.value
    }
    
    return healthStatus
  }

  /**
   * 重置状态
   */
  const resetState = () => {
    disconnectAll()
    messageHandlers.value.clear()
    realtimeMessages.value = []
    messageQueue.value = []
    reconnectAttempts.value = 0
    isReconnecting.value = false
    lastHeartbeat.value = null
  }

  return {
    // State
    connections,
    connectionStatus,
    reconnectAttempts,
    maxReconnectAttempts,
    reconnectInterval,
    isReconnecting,
    lastHeartbeat,
    messageQueue,
    realtimeMessages,
    messageHandlers,
    
    // Getters
    isConnected,
    isConnecting,
    isDisconnected,
    activeConnections,
    unreadMessageCount,
    
    // Actions
    connect,
    sendMessage,
    disconnect,
    disconnectAll,
    registerMessageHandler,
    unregisterMessageHandler,
    connectAlerts,
    connectDeviceStatus,
    connectInstantAlerts,
    connectAll,
    markMessageAsRead,
    markAllMessagesAsRead,
    clearMessages,
    getMessagesByType,
    checkConnectionHealth,
    resetState
  }
})