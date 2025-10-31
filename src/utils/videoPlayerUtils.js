/**
 * 视频播放器工具类
 * 
 * @description
 * 提供视频播放相关的工具函数和类型转换方法
 * 用于处理视频流信息、格式化显示数据等
 * 
 * @author Belt System
 * @date 2025-10-29
 */

/**
 * 字节单位转换类
 */
export class ByteConverter {
  /**
   * 将字节转换为人类可读的格式
   * 
   * @param {number} bytes - 字节数
   * @param {number} decimals - 小数位数，默认2位
   * @returns {string} 格式化后的字符串，如 "1.23 MB"
   * 
   * @example
   * ByteConverter.format(1024) // "1.00 KB"
   * ByteConverter.format(1048576) // "1.00 MB"
   * ByteConverter.format(1073741824, 3) // "1.000 GB"
   */
  static format(bytes, decimals = 2) {
    if (bytes === 0 || bytes === null || bytes === undefined) {
      return '0 B'
    }
    
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const value = bytes / Math.pow(k, i)
    
    return `${value.toFixed(dm)} ${sizes[i]}`
  }
  
  /**
   * 将字节/秒转换为速度格式
   * 
   * @param {number} bytesPerSecond - 每秒字节数
   * @param {number} decimals - 小数位数，默认2位
   * @returns {string} 格式化后的速度字符串，如 "1.23 MB/s"
   * 
   * @example
   * ByteConverter.toSpeed(1048576) // "1.00 MB/s"
   */
  static toSpeed(bytesPerSecond, decimals = 2) {
    return `${this.format(bytesPerSecond, decimals)}/s`
  }
  
  /**
   * 将字节转换为千字节
   * 
   * @param {number} bytes - 字节数
   * @returns {number} 千字节数
   */
  static toKB(bytes) {
    return bytes / 1024
  }
  
  /**
   * 将字节转换为兆字节
   * 
   * @param {number} bytes - 字节数
   * @returns {number} 兆字节数
   */
  static toMB(bytes) {
    return bytes / (1024 * 1024)
  }
  
  /**
   * 将字节转换为吉字节
   * 
   * @param {number} bytes - 字节数
   * @returns {number} 吉字节数
   */
  static toGB(bytes) {
    return bytes / (1024 * 1024 * 1024)
  }
}

/**
 * 比特率转换类
 */
export class BitrateConverter {
  /**
   * 将比特率转换为人类可读的格式
   * 
   * @param {number} bitrate - 比特率（bps）
   * @param {number} decimals - 小数位数，默认2位
   * @returns {string} 格式化后的比特率字符串，如 "1.23 Mbps"
   * 
   * @example
   * BitrateConverter.format(1000) // "1.00 Kbps"
   * BitrateConverter.format(1000000) // "1.00 Mbps"
   */
  static format(bitrate, decimals = 2) {
    if (bitrate === 0 || bitrate === null || bitrate === undefined) {
      return '0 bps'
    }
    
    const k = 1000
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['bps', 'Kbps', 'Mbps', 'Gbps']
    
    const i = Math.floor(Math.log(bitrate) / Math.log(k))
    const value = bitrate / Math.pow(k, i)
    
    return `${value.toFixed(dm)} ${sizes[i]}`
  }
  
  /**
   * 将字节数转换为比特率
   * 
   * @param {number} bytes - 字节数
   * @returns {number} 比特率（bps）
   */
  static fromBytes(bytes) {
    return bytes * 8
  }
  
  /**
   * 将比特率转换为字节数
   * 
   * @param {number} bitrate - 比特率（bps）
   * @returns {number} 字节数
   */
  static toBytes(bitrate) {
    return bitrate / 8
  }
}

/**
 * 时间转换类
 */
export class TimeConverter {
  /**
   * 将秒数转换为时:分:秒格式
   * 
   * @param {number} seconds - 秒数
   * @param {boolean} includeHours - 是否包含小时，默认true
   * @returns {string} 格式化后的时间字符串，如 "01:23:45"
   * 
   * @example
   * TimeConverter.format(3661) // "01:01:01"
   * TimeConverter.format(61, false) // "01:01"
   */
  static format(seconds, includeHours = true) {
    if (seconds === null || seconds === undefined || isNaN(seconds)) {
      return includeHours ? '00:00:00' : '00:00'
    }
    
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    
    if (includeHours) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    } else {
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
  }
  
  /**
   * 将毫秒转换为秒
   * 
   * @param {number} milliseconds - 毫秒数
   * @returns {number} 秒数
   */
  static msToSeconds(milliseconds) {
    return milliseconds / 1000
  }
  
  /**
   * 将秒转换为毫秒
   * 
   * @param {number} seconds - 秒数
   * @returns {number} 毫秒数
   */
  static secondsToMs(seconds) {
    return seconds * 1000
  }
  
  /**
   * 将时间戳转换为可读时间
   * 
   * @param {number} timestamp - 时间戳（毫秒）
   * @param {boolean} includeDate - 是否包含日期，默认false
   * @returns {string} 格式化后的时间字符串
   * 
   * @example
   * TimeConverter.formatTimestamp(Date.now()) // "14:23:45"
   * TimeConverter.formatTimestamp(Date.now(), true) // "2025-10-29 14:23:45"
   */
  static formatTimestamp(timestamp, includeDate = false) {
    const date = new Date(timestamp)
    
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    
    if (includeDate) {
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    } else {
      return `${hours}:${minutes}:${seconds}`
    }
  }
}

/**
 * 流地址解析类
 */
export class StreamUrlParser {
  /**
   * 检测流类型
   * 
   * @param {string} url - 流地址
   * @returns {string} 流类型：'flv' | 'hls' | 'rtmp' | 'rtsp' | 'ws' | 'http' | 'unknown'
   * 
   * @example
   * StreamUrlParser.detectType('http://example.com/live.flv') // "flv"
   * StreamUrlParser.detectType('ws://example.com/live') // "ws"
   */
  static detectType(url) {
    if (!url || typeof url !== 'string') {
      return 'unknown'
    }
    
    const urlLower = url.toLowerCase()
    
    // WebSocket
    if (urlLower.startsWith('ws://') || urlLower.startsWith('wss://')) {
      return 'ws'
    }
    
    // RTMP
    if (urlLower.startsWith('rtmp://') || urlLower.startsWith('rtmps://')) {
      return 'rtmp'
    }
    
    // RTSP
    if (urlLower.startsWith('rtsp://')) {
      return 'rtsp'
    }
    
    // FLV
    if (urlLower.includes('.flv') || urlLower.includes('/flv/')) {
      return 'flv'
    }
    
    // HLS
    if (urlLower.includes('.m3u8') || urlLower.includes('/hls/')) {
      return 'hls'
    }
    
    // HTTP
    if (urlLower.startsWith('http://') || urlLower.startsWith('https://')) {
      return 'http'
    }
    
    return 'unknown'
  }
  
  /**
   * 验证流地址格式是否正确
   * 
   * @param {string} url - 流地址
   * @returns {boolean} 是否有效
   */
  static isValid(url) {
    if (!url || typeof url !== 'string') {
      return false
    }
    
    try {
      const type = this.detectType(url)
      return type !== 'unknown'
    } catch (error) {
      return false
    }
  }
  
  /**
   * 解析流地址信息
   * 
   * @param {string} url - 流地址
   * @returns {Object} 解析后的信息对象
   * 
   * @example
   * StreamUrlParser.parse('http://example.com:8080/live/stream1.flv')
   * // {
   * //   type: 'flv',
   * //   protocol: 'http',
   * //   host: 'example.com',
   * //   port: 8080,
   * //   path: '/live/stream1.flv',
   * //   streamName: 'stream1'
   * // }
   */
  static parse(url) {
    if (!url || typeof url !== 'string') {
      return null
    }
    
    try {
      const urlObj = new URL(url)
      const type = this.detectType(url)
      const pathParts = urlObj.pathname.split('/')
      const fileName = pathParts[pathParts.length - 1]
      const streamName = fileName.split('.')[0] || fileName
      
      return {
        type,
        protocol: urlObj.protocol.replace(':', ''),
        host: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname,
        streamName,
        fullUrl: url
      }
    } catch (error) {
      console.error('解析流地址失败:', error)
      return null
    }
  }
}

/**
 * 视频统计数据格式化类
 */
export class VideoStatsFormatter {
  /**
   * 格式化完整的视频统计信息
   * 
   * @param {Object} stats - 原始统计数据
   * @returns {Object} 格式化后的统计数据
   */
  static format(stats) {
    if (!stats || typeof stats !== 'object') {
      return this.getEmptyStats()
    }
    
    return {
      // 视频信息
      resolution: `${stats.width || 0} × ${stats.height || 0}`,
      fps: `${stats.fps || 0} FPS`,
      codec: stats.codec || 'Unknown',
      bitrate: BitrateConverter.format(stats.bitrate || 0),
      
      // 性能统计
      framesReceived: stats.framesReceived || 0,
      framesDecoded: stats.framesDecoded || 0,
      framesDropped: stats.framesDropped || 0,
      bufferDelay: `${stats.bufferDelay || 0} ms`,
      duration: TimeConverter.format(stats.duration || 0),
      
      // 网络统计
      bytesReceived: ByteConverter.format(stats.bytesReceived || 0),
      downloadSpeed: ByteConverter.toSpeed(stats.downloadSpeed || 0),
      connectionTime: `${stats.connectionTime || 0} ms`
    }
  }
  
  /**
   * 获取空统计数据
   * 
   * @returns {Object} 空统计数据对象
   */
  static getEmptyStats() {
    return {
      resolution: '0 × 0',
      fps: '0 FPS',
      codec: 'Unknown',
      bitrate: '0 bps',
      framesReceived: 0,
      framesDecoded: 0,
      framesDropped: 0,
      bufferDelay: '0 ms',
      duration: '00:00:00',
      bytesReceived: '0 B',
      downloadSpeed: '0 B/s',
      connectionTime: '0 ms'
    }
  }
}

/**
 * 默认导出所有工具类
 */
export default {
  ByteConverter,
  BitrateConverter,
  TimeConverter,
  StreamUrlParser,
  VideoStatsFormatter
}


