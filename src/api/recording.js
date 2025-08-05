import { api } from './index'

// 录像管理API
export const recordingApi = {
  // 获取录像文件列表
  getRecordingList(params) {
    return api.post('/api/recordings/list', params)
  },

  // 上传录像文件 - 完全按照后端API要求重写
  uploadRecording(deviceId, file) {
    console.log('=== 开始上传录像 ===')
    console.log('设备ID:', deviceId, '类型:', typeof deviceId)
    console.log('文件信息:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    })
    
    // 创建FormData，严格按照后端要求
    const formData = new FormData()
    
    // 后端代码: deviceIDStr := c.PostForm("device_id")
    formData.append('device_id', String(deviceId))
    
    // 后端代码: file, err := c.FormFile("file") 
    formData.append('file', file)
    
    // 验证FormData内容
    console.log('FormData键值对:')
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }
    
    // 直接使用原生fetch，确保请求格式正确
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      // 设置请求
      xhr.open('POST', `${process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080'}/api/recordings/upload`)
      
      // 添加认证header
      const token = localStorage.getItem('token')
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }
      
      // 监听上传进度
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          console.log('上传进度:', percentComplete.toFixed(2) + '%')
        }
      })
      
      // 监听响应
      xhr.addEventListener('load', () => {
        console.log('响应状态:', xhr.status)
        console.log('响应内容:', xhr.responseText)
        
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText)
            console.log('解析后的响应:', response)
            resolve(response)
          } catch (e) {
            console.error('响应解析失败:', e)
            reject(new Error('响应格式错误'))
          }
        } else {
          console.error('请求失败:', xhr.status, xhr.statusText)
          reject(new Error(`请求失败: ${xhr.status} ${xhr.statusText}`))
        }
      })
      
      xhr.addEventListener('error', () => {
        console.error('网络错误')
        reject(new Error('网络连接失败'))
      })
      
      // 发送请求
      console.log('发送请求到:', xhr.responseURL || '/api/recordings/upload')
      xhr.send(formData)
    })
  },

  // 批量上传录像文件
  batchUploadRecordings(deviceId, files) {
    const formData = new FormData()
    formData.append('device_id', String(deviceId))
    files.forEach(file => {
      formData.append('files', file)
    })
    return api.upload('/api/recordings/batch-upload', formData)
  },

  // 获取录像播放地址
  getPlayUrl(recordingId) {
    return api.get(`/api/recordings/${recordingId}/play`)
  },

  // 获取录像流地址（用于视频播放）
  getStreamUrl(recordingId, format = 'mp4') {
    return api.get(`/api/recordings/stream/${recordingId}/${format}`)
  },

  // 下载录像文件
  downloadRecording(recordingId) {
    return api.download(`/api/recordings/download/${recordingId}`)
  },

  // 删除录像文件
  deleteRecording(recordingId) {
    return api.delete(`/api/recordings/${recordingId}`)
  },

  // 获取录像存储统计
  getStatistics() {
    return api.get('/api/recordings/statistics')
  },

  // 执行录像清理
  executeCleanup(data) {
    return api.post('/api/recordings/cleanup', data)
  }
} 