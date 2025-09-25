import { api } from './index'

// 设备管理API
export const deviceApi = {
  // 获取设备列表
  getDeviceList(params) {
    return api.get('/api/devices', { params })
  },

  // 添加新设备
  addDevice(data) {
    return api.post('/api/devices', data)
  },

  // 批量添加设备
  batchAddDevices(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload('/api/devices/batch', formData)
  },

  // 平台设备自动同步
  syncDevices(data) {
    return api.post('/api/devices/sync', data)
  },

  // 更新设备信息
  updateDevice(deviceId, data) {
    return api.put(`/api/devices/${deviceId}`, data)
  },

  // 删除设备
  deleteDevice(deviceId) {
    return api.delete(`/api/devices/${deviceId}`)
  },

  // 切换设备状态
  toggleDeviceStatus(deviceId, data) {
    return api.post(`/api/devices/${deviceId}/toggle-status`, data)
  },

  // 导出设备列表
  exportDevices() {
    return api.download('/api/devices/export')
  },

  // 配置设备接入协议
  configProtocol(deviceId, data) {
    return api.put(`/api/devices/${deviceId}/protocol`, data)
  },

  // 绑定智能分析板卡与摄像机
  bindAnalysisCard(data) {
    return api.post('/api/devices/bind-analysis-card', data)
  },

  // 获取设备详细信息
  getDeviceDetail(deviceId) {
    return api.get(`/api/devices/${deviceId}`)
  },

  // 获取智能分析板卡列表
  getAnalysisCards() {
    return api.get('/api/devices/analysis-cards')
  },

  // 获取摄像机列表
  getCameraList() {
    return api.get('/api/devices/cameras')
  },

  // 测试设备连接
  testDeviceConnection(deviceId) {
    return api.post(`/api/devices/${deviceId}/test-connection`)
  },

  // 获取设备日志
  getDeviceLogs(deviceId, params) {
    return api.get(`/api/devices/${deviceId}/logs`, { params })
  },

  // ==================== 智能板卡管理 ====================

  // 获取板卡设备列表
  getBoardList(params) {
    return api.get('/api/v1/algorithm/boards', { params })
  },

  // 创建板卡设备
  createBoard(data) {
    return api.post('/api/v1/algorithm/boards', data)
  },

  // 获取板卡设备详情
  getBoardDetail(boardId) {
    return api.get(`/api/v1/algorithm/boards/${boardId}`)
  },

  // 更新板卡设备
  updateBoard(boardId, data) {
    return api.put(`/api/v1/algorithm/boards/${boardId}`, data)
  },

  // 删除板卡设备
  deleteBoard(boardId) {
    return api.delete(`/api/v1/algorithm/boards/${boardId}`)
  },

  // 批量创建板卡设备
  batchCreateBoards(data) {
    return api.post('/api/v1/algorithm/boards/batch', data)
  },

  // 上传板卡绑定信息
  uploadBoardBinding(file, description) {
    const formData = new FormData()
    formData.append('file', file)
    if (description) {
      formData.append('description', description)
    }
    return api.upload('/api/v1/algorithm/boards/upload-binding', formData)
  },

  // 板卡固件升级
  upgradeBoardFirmware(boardId, firmwareFile) {
    const formData = new FormData()
    formData.append('firmware', firmwareFile)
    return api.upload(`/api/v1/algorithm/boards/${boardId}/upgrade`, formData)
  },

  // 获取板卡升级状态
  getBoardUpgradeStatus(boardId) {
    return api.get(`/api/v1/algorithm/boards/${boardId}/upgrade/status`)
  },

  // 获取板卡统计信息
  getBoardStats() {
    return api.get('/api/v1/algorithm/boards/stats')
  },

  // 测试板卡连接
  testBoardConnection(boardId) {
    return api.post(`/api/v1/algorithm/boards/${boardId}/test-connection`)
  },

  // 绑定板卡到摄像机
  bindBoardToCamera(boardId, data) {
    return api.post(`/api/v1/algorithm/boards/${boardId}/cameras`, data)
  },

  // 解绑板卡摄像机
  unbindBoardFromCamera(boardId, cameraId) {
    return api.delete(`/api/v1/algorithm/boards/${boardId}/cameras/${cameraId}`)
  },

  // 获取板卡关联的摄像机
  getBoardCameras(boardId) {
    return api.get(`/api/v1/algorithm/boards/${boardId}/cameras`)
  },

  // 开始板卡推流
  startBoardStream(boardId) {
    return api.post(`/api/v1/algorithm/boards/${boardId}/stream/start`)
  },

  // 停止板卡推流
  stopBoardStream(boardId) {
    return api.post(`/api/v1/algorithm/boards/${boardId}/stream/stop`)
  },

  // 获取板卡流信息
  getBoardStreamInfo(boardId) {
    return api.get(`/api/v1/algorithm/boards/${boardId}/stream`)
  },

  // 获取所有算法流信息
  getAlgorithmStreams() {
    return api.get('/api/v1/algorithm/streams')
  }
}