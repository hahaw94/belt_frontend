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
  }
} 