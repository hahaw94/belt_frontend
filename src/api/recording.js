import { api } from './index'

// 录像管理API
export const recordingApi = {
  // 获取录像文件列表
  getRecordingList(params) {
    return api.post('/api/recordings/list', params)
  },

  // 上传录像文件
  uploadRecording(deviceId, file) {
    const formData = new FormData()
    formData.append('device_id', deviceId)
    formData.append('file', file)
    return api.upload('/api/recordings/upload', formData)
  },

  // 批量上传录像文件
  batchUploadRecordings(deviceId, files) {
    const formData = new FormData()
    formData.append('device_id', deviceId)
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

  // 执行录像清理（根据API文档，这个接口可能不存在，先保留）
  executeCleanup(data) {
    return api.post('/api/recordings/cleanup', data)
  }
} 