/**
 * WebSocket告警推送工具类
 */
class AlarmWebSocket {
  constructor() {
    this.ws = null
    this.reconnectTimer = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000 // 5秒
    this.messageHandlers = []
    this.statusHandlers = []
  }

  /**
   * 连接WebSocket
   */
  connect() {
    // 检查是否已连接
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket已连接')
      this.notifyStatus('已连接', 'success')
      return
    }

    // 获取token
    const token = localStorage.getItem('token')
    if (!token) {
      console.error('未找到认证token')
      this.notifyStatus('未认证', 'error')
      return
    }

    // 构建WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = process.env.NODE_ENV === 'development' 
      ? 'localhost:8080' 
      : window.location.host
    const wsUrl = `${protocol}//${host}/api/v1/ws/alarms?token=${token}`

    console.log('正在连接WebSocket:', wsUrl)
    this.notifyStatus('正在连接...', 'info')

    try {
      this.ws = new WebSocket(wsUrl)

      // 连接成功
      this.ws.onopen = () => {
        console.log('✅ WebSocket连接成功')
        this.reconnectAttempts = 0
        this.notifyStatus('已连接', 'success')
        this.notifyMessage('WebSocket连接成功', 'success')
      }

      // 接收消息
      this.ws.onmessage = (event) => {
        console.log('📨 收到WebSocket消息:', event.data)
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (e) {
          console.error('解析消息失败:', e)
          this.notifyMessage('消息解析失败: ' + e.message, 'error')
        }
      }

      // 连接错误
      this.ws.onerror = (error) => {
        console.error('❌ WebSocket错误:', error)
        this.notifyStatus('连接错误', 'error')
        this.notifyMessage('WebSocket连接错误', 'error')
      }

      // 连接关闭
      this.ws.onclose = (event) => {
        console.log('WebSocket连接关闭:', event)
        this.notifyStatus('已断开', 'warning')
        
        if (event.code !== 1000) {
          // 非正常关闭，尝试重连
          this.notifyMessage(`连接异常断开 (代码: ${event.code})`, 'warning')
          this.attemptReconnect()
        } else {
          this.notifyMessage('连接已关闭', 'warning')
        }
      }
    } catch (error) {
      console.error('创建WebSocket连接失败:', error)
      this.notifyStatus('连接失败', 'error')
      this.notifyMessage('创建连接失败: ' + error.message, 'error')
    }
  }

  /**
   * 尝试重新连接
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('已达到最大重连次数')
      this.notifyMessage(`已达到最大重连次数(${this.maxReconnectAttempts})`, 'error')
      return
    }

    this.reconnectAttempts++
    console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
    this.notifyMessage(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`, 'info')

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, this.reconnectInterval)
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close(1000, '主动断开')
      this.ws = null
    }

    this.reconnectAttempts = 0
    this.notifyStatus('未连接', 'info')
    console.log('WebSocket已断开')
  }

  /**
   * 处理接收到的消息
   */
  handleMessage(message) {
    // 通知所有消息处理器
    this.messageHandlers.forEach(handler => {
      try {
        handler(message)
      } catch (e) {
        console.error('消息处理器错误:', e)
      }
    })
  }

  /**
   * 通知状态变化
   */
  notifyStatus(status, type) {
    this.statusHandlers.forEach(handler => {
      try {
        handler(status, type)
      } catch (e) {
        console.error('状态处理器错误:', e)
      }
    })
  }

  /**
   * 通知消息
   */
  notifyMessage(text, type) {
    const time = new Date().toLocaleTimeString()
    const message = {
      time,
      text,
      type
    }
    
    // 触发消息事件
    this.messageHandlers.forEach(handler => {
      try {
        handler(message)
      } catch (e) {
        console.error('消息处理器错误:', e)
      }
    })
  }

  /**
   * 添加消息处理器
   */
  onMessage(handler) {
    this.messageHandlers.push(handler)
  }

  /**
   * 添加状态处理器
   */
  onStatusChange(handler) {
    this.statusHandlers.push(handler)
  }

  /**
   * 移除消息处理器
   */
  offMessage(handler) {
    const index = this.messageHandlers.indexOf(handler)
    if (index > -1) {
      this.messageHandlers.splice(index, 1)
    }
  }

  /**
   * 移除状态处理器
   */
  offStatusChange(handler) {
    const index = this.statusHandlers.indexOf(handler)
    if (index > -1) {
      this.statusHandlers.splice(index, 1)
    }
  }

  /**
   * 获取连接状态
   */
  getStatus() {
    if (!this.ws) return '未连接'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return '正在连接...'
      case WebSocket.OPEN:
        return '已连接'
      case WebSocket.CLOSING:
        return '正在断开...'
      case WebSocket.CLOSED:
        return '已断开'
      default:
        return '未知'
    }
  }

  /**
   * 检查是否已连接
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }
}

// 创建单例实例
const alarmWebSocket = new AlarmWebSocket()

export default alarmWebSocket
