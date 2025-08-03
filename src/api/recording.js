import { api } from './index'

// 录像管理API
export const recordingApi = {
  // 获取录像文件列表
  getRecordingList(params) {
    return api.get('/api/recordings', params)
  },

  // 获取录像播放地址
  getPlayUrl(recordingId) {
    return api.get(`/api/recordings/${recordingId}/play`)
  },

  // 下载录像文件
  downloadRecording(recordingId) {
    return api.download(`/api/recordings/${recordingId}/download`)
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