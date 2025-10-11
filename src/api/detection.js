import { api } from './index'

// 实时检测API
export const detectionApi = {
  // 获取实时视频流
  getVideoStream(deviceId) {
    return api.get(`/api/detection/video-stream/${deviceId}`)
  },

  // 获取多路视频流
  getMultiStreams(params) {
    return api.get('/api/detection/multi-streams', params)
  },

  // 获取实时预警信息
  getWarnings(params) {
    return api.get('/api/detection/warnings', params)
  },

  // 摄像头云镜控制
  ptzControl(deviceId, data) {
    return api.post(`/api/detection/ptz-control/${deviceId}`, data)
  },

  // 获取实时检测状态
  getRealTimeStatus() {
    return api.get('/api/detection/real-time')
  },

  // 开始实时检测
  startDetection(data) {
    return api.post('/api/detection/start', data)
  },

  // 停止实时检测
  stopDetection(data) {
    return api.post('/api/detection/stop', data)
  },

  // ============ 录像回放相关 API ============
  
  // 获取录像列表
  // 参数: { page, page_size, title, format, uploader_id }
  getRecordingList(params = {}) {
    return api.get('/api/v1/recordings', { params })
  },

  // 上传录像
  // 参数: title, description (可选), file
  uploadRecording(data) {
    const formData = new FormData()
    formData.append('title', data.title)
    if (data.description) {
      formData.append('description', data.description)
    }
    formData.append('file', data.file)
    
    return api.post('/api/v1/recordings/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 获取录像详情
  getRecordingDetail(id) {
    return api.get(`/api/v1/recordings/${id}`)
  },

  // 删除录像
  deleteRecording(id) {
    return api.delete(`/api/v1/recordings/${id}`)
  },

  // 获取录像播放地址
  getRecordingPlayUrl(id) {
    return api.get(`/api/v1/recordings/${id}/play`)
  }
} 