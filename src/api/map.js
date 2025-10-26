import request from './index'

// ==================== 图层管理接口 ====================

/**
 * 创建图层（上传图片）
 * @param {Object} data - 包含图层信息的FormData对象
 * @param {string} data.layer_name - 图层名称
 * @param {string} data.layer_description - 图层描述（可选）
 * @param {File} data.file - 图层图片文件
 * @returns {Promise}
 */
export function createLayer(data) {
  return request({
    url: '/api/v1/system/map/layers',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取图层列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 页大小
 * @param {string} params.layer_name - 图层名称（模糊搜索）
 * @param {number} params.status - 状态（0-禁用，1-启用）
 * @returns {Promise}
 */
export function getLayerList(params) {
  return request({
    url: '/api/v1/system/map/layers',
    method: 'get',
    params
  })
}

/**
 * 获取图层详情
 * @param {number} layerId - 图层ID
 * @returns {Promise}
 */
export function getLayerById(layerId) {
  return request({
    url: `/api/v1/system/map/layers/${layerId}`,
    method: 'get'
  })
}

/**
 * 更新图层
 * @param {number} layerId - 图层ID
 * @param {Object} data - 更新数据
 * @param {string} data.layer_name - 图层名称
 * @param {string} data.layer_description - 图层描述
 * @param {number} data.status - 状态
 * @returns {Promise}
 */
export function updateLayer(layerId, data) {
  return request({
    url: `/api/v1/system/map/layers/${layerId}`,
    method: 'put',
    data
  })
}

/**
 * 删除图层
 * @param {number} layerId - 图层ID
 * @param {boolean} force - 是否强制删除（忽略关联的相机）
 * @returns {Promise}
 */
export function deleteLayer(layerId, force = false) {
  return request({
    url: `/api/v1/system/map/layers/${layerId}`,
    method: 'delete',
    params: { force }
  })
}

/**
 * 获取图层图片
 * @param {number} layerId - 图层ID
 * @returns {Promise}
 */
export function getLayerImage(layerId) {
  return request({
    url: `/api/v1/system/map/layers/${layerId}/image`,
    method: 'get'
  })
}

// ==================== 图层相机关联接口 ====================

/**
 * 获取图层上的相机列表
 * @param {number} layerId - 图层ID
 * @returns {Promise}
 */
export function getLayerCameras(layerId) {
  return request({
    url: `/api/v1/system/map/layers/${layerId}/cameras`,
    method: 'get'
  })
}

/**
 * 添加相机到图层
 * @param {number} layerId - 图层ID
 * @param {Object} data - 相机数据
 * @param {number} data.camera_id - 相机ID
 * @param {number} data.position_x - X坐标
 * @param {number} data.position_y - Y坐标
 * @param {string} data.camera_icon - 相机图标（可选）
 * @param {number} data.camera_angle - 相机角度（可选）
 * @returns {Promise}
 */
export function addCameraToLayer(layerId, data) {
  return request({
    url: `/api/v1/system/map/layers/${layerId}/cameras`,
    method: 'post',
    data
  })
}

/**
 * 更新相机位置
 * @param {number} layerId - 图层ID
 * @param {number} cameraId - 相机ID
 * @param {Object} data - 位置数据
 * @param {number} data.position_x - X坐标
 * @param {number} data.position_y - Y坐标
 * @param {string} data.camera_icon - 相机图标（可选）
 * @param {number} data.camera_angle - 相机角度（可选）
 * @returns {Promise}
 */
export function updateCameraPosition(layerId, cameraId, data) {
  return request({
    url: `/api/v1/system/map/layers/${layerId}/cameras/${cameraId}`,
    method: 'put',
    data
  })
}

/**
 * 批量更新相机位置
 * @param {number} layerId - 图层ID
 * @param {Object} data - 批量位置数据
 * @param {Array} data.cameras - 相机列表
 * @returns {Promise}
 */
export function batchUpdateCameraPositions(layerId, data) {
  return request({
    url: `/api/v1/system/map/layers/${layerId}/cameras/batch`,
    method: 'post',
    data
  })
}

/**
 * 从图层移除相机
 * @param {number} layerId - 图层ID
 * @param {number} cameraId - 相机ID
 * @returns {Promise}
 */
export function removeCameraFromLayer(layerId, cameraId) {
  return request({
    url: `/api/v1/system/map/layers/${layerId}/cameras/${cameraId}`,
    method: 'delete'
  })
}

// ==================== 简化版相机管理接口 ====================

/**
 * 创建相机设备
 * @param {Object} data - 相机数据
 * @param {string} data.camera_code - 相机编码
 * @param {string} data.camera_name - 相机名称
 * @param {string} data.ip_address - IP地址
 * @param {number} data.port - 端口
 * @param {string} data.protocol - 协议（RTSP/HTTP/GB28181）
 * @param {string} data.username - 用户名（可选）
 * @param {string} data.password - 密码（可选）
 * @param {string} data.location - 位置（可选）
 * @returns {Promise}
 */
export function createCamera(data) {
  return request({
    url: '/api/v1/system/map/cameras',
    method: 'post',
    data
  })
}

/**
 * 获取相机列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 页大小
 * @param {string} params.camera_name - 相机名称（模糊搜索）
 * @param {number} params.status - 状态（0-禁用，1-启用）
 * @param {number} params.is_bound - 绑定状态（0-未绑定，1-已绑定）
 * @returns {Promise}
 */
export function getCameraList(params) {
  return request({
    url: '/api/v1/system/map/cameras',
    method: 'get',
    params
  })
}

/**
 * 获取未绑定相机列表
 * @returns {Promise}
 */
export function getUnboundCameras() {
  return request({
    url: '/api/v1/system/map/cameras/unbound',
    method: 'get'
  })
}

/**
 * 获取相机详情
 * @param {number} cameraId - 相机ID
 * @returns {Promise}
 */
export function getCameraById(cameraId) {
  return request({
    url: `/api/v1/system/map/cameras/${cameraId}`,
    method: 'get'
  })
}

/**
 * 更新相机
 * @param {number} cameraId - 相机ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updateCamera(cameraId, data) {
  return request({
    url: `/api/v1/system/map/cameras/${cameraId}`,
    method: 'put',
    data
  })
}

/**
 * 删除相机
 * @param {number} cameraId - 相机ID
 * @returns {Promise}
 */
export function deleteCamera(cameraId) {
  return request({
    url: `/api/v1/system/map/cameras/${cameraId}`,
    method: 'delete'
  })
}

// ==================== 地图备份接口 ====================

/**
 * 创建地图备份
 * @param {Object} data - 备份数据
 * @param {string} data.backup_name - 备份名称
 * @param {string} data.backup_type - 备份类型（all/selected）
 * @param {Array} data.layer_ids - 图层ID列表（选择性备份时使用）
 * @param {string} data.description - 描述（可选）
 * @returns {Promise}
 */
export function createMapBackup(data) {
  return request({
    url: '/api/v1/system/map/backups',
    method: 'post',
    data
  })
}

/**
 * 获取地图备份列表
 * @returns {Promise}
 */
export function getMapBackupList() {
  return request({
    url: '/api/v1/system/map/backups',
    method: 'get'
  })
}

/**
 * 下载地图备份
 * @param {string} filename - 备份文件名
 * @returns {Promise}
 */
export function downloadMapBackup(filename) {
  return request({
    url: `/api/v1/system/map/backups/${filename}/download`,
    method: 'get',
    responseType: 'blob',
    timeout: 300000, // 5分钟超时，适用于大文件下载
    onDownloadProgress: (progressEvent) => {
      // 可以在这里添加下载进度处理
      if (progressEvent.lengthComputable) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log(`下载进度: ${percentCompleted}%`)
      }
    }
  })
}

/**
 * 恢复地图备份
 * @param {FormData} data - 包含备份文件的FormData对象
 * @param {File} data.file - 备份文件
 * @param {boolean} data.force_restore - 是否强制覆盖现有数据
 * @returns {Promise}
 */
export function restoreMapBackup(data) {
  return request({
    url: '/api/v1/system/map/backups/restore',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除地图备份
 * @param {string} filename - 备份文件名
 * @returns {Promise}
 */
export function deleteMapBackup(filename) {
  return request({
    url: `/api/v1/system/map/backups/${filename}`,
    method: 'delete'
  })
}

// ==================== 进度轮询接口 ====================

/**
 * 获取任务进度
 * @param {string} taskId - 任务ID
 * @returns {Promise}
 */
export function getTaskProgress(taskId) {
  return request({
    url: `/api/v1/system/tasks/${taskId}/progress`,
    method: 'get'
  })
}

/**
 * 创建系统备份（返回任务ID用于进度查询）
 * @param {Object} data - 备份数据
 * @param {string} data.type - 备份类型（config/database/full）
 * @param {Array} data.minio_buckets - MinIO桶列表（可选）
 * @returns {Promise}
 */
export function createSystemBackup(data) {
  return request({
    url: '/api/v1/system/backup',
    method: 'post',
    data
  })
}

// ==================== WVP摄像机管理接口 ====================

/**
 * 同步所有WVP直连设备通道
 * @returns {Promise}
 */
export function syncWVPChannels() {
  return request({
    url: '/api/v1/wvp/channels/sync-all-direct',
    method: 'post'
  })
}

/**
 * 获取WVP统一摄像机列表
 * @returns {Promise}
 */
export function getWVPChannels() {
  return request({
    url: '/api/v1/wvp/channels/unified',
    method: 'get'
  })
}

/**
 * 获取未绑定的WVP通道列表
 * @returns {Promise}
 */
export function getUnboundWVPChannels() {
  return request({
    url: '/api/v1/system/map/wvp/unbound',
    method: 'get'
  })
}

/**
 * 绑定WVP通道到图层
 * @param {number} layerId - 图层ID
 * @param {Object} data - 绑定数据
 * @param {string} data.channel_id - 通道ID
 * @param {number} data.position_x - X坐标
 * @param {number} data.position_y - Y坐标
 * @returns {Promise}
 */
export function bindWVPChannelToLayer(layerId, data) {
  return request({
    url: `/api/v1/system/map/layers/${layerId}/wvp/bind`,
    method: 'post',
    data
  })
}

/**
 * 从图层解绑WVP通道
 * @param {number} layerId - 图层ID
 * @param {string} channelId - 通道ID
 * @returns {Promise}
 */
export function unbindWVPChannelFromLayer(layerId, channelId) {
  return request({
    url: `/api/v1/system/map/layers/${layerId}/wvp/${channelId}`,
    method: 'delete'
  })
}


