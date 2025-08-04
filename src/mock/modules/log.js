// 日志管理Mock数据
class LogMockData {
  constructor() {
    this.logs = []
    this.initData()
  }

  initData() {
    const levels = ['INFO', 'WARNING', 'ERROR', 'DEBUG']
    const modules = ['UserManagement', 'DeviceManagement', 'Detection', 'RecordingManagement', 'SystemConfig']
    const operations = [
      '用户登录', '用户登出', '添加用户', '删除用户', '修改用户权限',
      '添加设备', '删除设备', '设备状态变更', '设备配置更新',
      '开始检测', '停止检测', 'PTZ控制', '算法下发',
      '录像上传', '录像删除', '录像播放',
      '系统配置更新', '系统重启', '备份创建'
    ]
    const users = ['admin', 'operator01', 'user02', 'guest01']
    const results = ['成功', '失败', '超时', '取消']
    const ips = ['192.168.1.100', '192.168.1.101', '192.168.1.102', '10.0.0.1']

    for (let i = 1; i <= 1000; i++) {
      const level = levels[Math.floor(Math.random() * levels.length)]
      const module = modules[Math.floor(Math.random() * modules.length)]
      const operation = operations[Math.floor(Math.random() * operations.length)]
      const username = users[Math.floor(Math.random() * users.length)]
      const result = results[Math.floor(Math.random() * results.length)]
      const ip = ips[Math.floor(Math.random() * ips.length)]
      
      const timestamp = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
      
      let details = `用户 ${username} 执行 ${operation} 操作`
      if (level === 'ERROR') {
        details += ` - 错误原因: ${['网络超时', '权限不足', '参数错误', '系统异常'][Math.floor(Math.random() * 4)]}`
      } else if (level === 'WARNING') {
        details += ` - 警告信息: ${['资源使用率较高', '磁盘空间不足', '网络延迟较大'][Math.floor(Math.random() * 3)]}`
      }

      this.logs.push({
        id: i,
        timestamp: timestamp.toISOString().replace('T', ' ').split('.')[0],
        level: level,
        module: module,
        operation: operation,
        user_id: Math.floor(Math.random() * 10) + 1,
        username: username,
        ip_address: ip,
        details: details,
        result: result
      })
    }

    // 按时间倒序排列
    this.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  getAllLogs() {
    return [...this.logs]
  }

  getLogById(id) {
    return this.logs.find(log => log.id === id)
  }

  addLog(logData) {
    const newId = Math.max(0, ...this.logs.map(l => l.id)) + 1
    const newLog = {
      id: newId,
      timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
      level: logData.level || 'INFO',
      module: logData.module,
      operation: logData.operation,
      user_id: logData.user_id,
      username: logData.username,
      ip_address: logData.ip_address,
      details: logData.details,
      result: logData.result || '成功'
    }
    this.logs.unshift(newLog)
    return newLog
  }

  getStatistics() {
    const total = this.logs.length
    const logsByLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1
      return acc
    }, {})

    const logsByModule = this.logs.reduce((acc, log) => {
      acc[log.module] = (acc[log.module] || 0) + 1
      return acc
    }, {})

    // 最近1小时和24小时的日志数量
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const lastHour = this.logs.filter(log => new Date(log.timestamp) > oneHourAgo).length
    const last24Hours = this.logs.filter(log => new Date(log.timestamp) > oneDayAgo).length

    return {
      total_logs: total,
      logs_by_level: logsByLevel,
      logs_by_module: logsByModule,
      recent_activity: {
        last_hour: lastHour,
        last_24_hours: last24Hours
      }
    }
  }

  cleanOldLogs(beforeDate) {
    const cutoffDate = new Date(beforeDate)
    const initialCount = this.logs.length
    
    this.logs = this.logs.filter(log => new Date(log.timestamp) > cutoffDate)
    
    return initialCount - this.logs.length
  }
}

export const logMockData = new LogMockData()