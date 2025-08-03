import { api } from './index'

// 首页数据看板API
export const dashboardApi = {
  // 获取首页数据看板概览
  getOverview() {
    return api.get('/api/dashboard/overview')
  },

  // 获取CAD图层信息
  getCadMap() {
    return api.get('/api/dashboard/cad-map')
  },

  // 获取指定摄像头实时画面
  getCameraLive(deviceId) {
    return api.get(`/api/dashboard/camera-live/${deviceId}`)
  }
} 