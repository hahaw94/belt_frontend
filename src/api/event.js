import { api } from './index'

// 事件中心API - 对接后端告警信息管理
export const eventApi = {
  // ========== 告警信息管理 ==========
  
  /**
   * 获取告警列表
   * @param {Object} params - 查询参数
   * @param {string} params.start_time - 开始时间 (YYYY-MM-DD HH:mm:ss)
   * @param {string} params.end_time - 结束时间
   * @param {string} params.alarm_types - 告警类型（复数形式，单个值或逗号分隔）
   * @param {number} params.alarm_levels - 告警级别（复数形式，1:低, 2:中, 3:高）
   * @param {number} params.status - 状态 (0:未处理, 1:已处理, 2:误报)
   * @param {boolean} params.is_exported - 是否已导出（可选）
   * @param {number} params.page - 页码，默认1
   * @param {number} params.page_size - 每页数量，默认20
   * @returns {Promise} 响应包含：data (数组), total, page, page_size
   */
  getAlarmList(params) {
    return api.get('/api/v1/alarms', params)
  },

  /**
   * 获取告警详情
   * @param {number} alarmId - 告警ID
   */
  getAlarmDetail(alarmId) {
    return api.get(`/api/v1/alarms/${alarmId}`)
  },

  /**
   * 处理告警
   * @param {number} alarmId - 告警ID
   * @param {Object} data - 处理数据
   * @param {string} data.result - 处理结果 ('confirmed' | 'false_positive')
   * @param {string} data.remark - 处理备注
   */
  handleAlarm(alarmId, data) {
    return api.post(`/api/v1/alarms/${alarmId}/handle`, data)
  },

  /**
   * 获取告警统计
   * @param {Object} params - 查询参数
   * @param {string} params.start_time - 开始时间
   * @param {string} params.end_time - 结束时间
   */
  getAlarmStatistics(params) {
    return api.get('/api/v1/alarms/statistics', params)
  },

  // ========== 误报样本管理 ==========

  /**
   * 导出误报样本
   * @param {Object} data - 导出参数
   * @param {Array} data.alarm_ids - 告警ID数组（可选）
   * @param {string} data.start_time - 开始时间（可选，格式：YYYY-MM-DDTHH:mm:ssZ）
   * @param {string} data.end_time - 结束时间（可选，格式：YYYY-MM-DDTHH:mm:ssZ）
   * @returns {Promise} 响应包含：file_name, file_size, alarm_count, download_url
   */
  exportFalsePositives(data) {
    return api.post('/api/v1/alarms/false-positives/export', data)
  },

  /**
   * 打包误报样本（上传训练平台）
   * @param {Object} data - 打包参数
   * @param {Array} data.alarm_ids - 告警ID数组（可选）
   * @param {string} data.start_time - 开始时间（可选，格式：YYYY-MM-DDTHH:mm:ssZ）
   * @param {string} data.end_time - 结束时间（可选，格式：YYYY-MM-DDTHH:mm:ssZ）
   * @returns {Promise} 响应包含：alarm_count, package_id, message
   */
  packageFalsePositives(data) {
    return api.post('/api/v1/alarms/false-positives/package', data)
  },

  // ========== 用户订阅配置 ==========

  /**
   * 获取订阅配置
   */
  getSubscription() {
    return api.get('/api/v1/alarms/subscriptions')
  },

  /**
   * 更新订阅配置
   * @param {Object} data - 订阅配置
   * @param {Array} data.alarm_types - 订阅的告警类型数组
   * @param {boolean} data.enable_web_push - 启用Web推送
   * @param {boolean} data.enable_email - 启用邮件推送
   * @param {string} data.email_address - 邮箱地址
   */
  updateSubscription(data) {
    return api.put('/api/v1/alarms/subscriptions', data)
  },

  // ========== 旧接口保留（向后兼容）==========

  // 处理报警事件（旧接口名称）
  processAlarm(alarmId, data) {
    return this.handleAlarm(alarmId, data)
  },

  // 标记报警为负样本（旧接口名称）
  markNegativeSample(alarmId, data) {
    return this.handleAlarm(alarmId, { result: 'false_positive', ...data })
  },

  // 导出人工审核样本（旧接口名称）
  exportSamples(data) {
    return this.exportFalsePositives(data)
  },

  // 获取监控点位列表
  getLocationList(params) {
    return api.get('/api/events/locations', params)
  },

  // 配置即时告警接收
  configInstantAlert(data) {
    return api.post('/api/events/instant-alert-config', data)
  },

  // 配置告警联动规则
  configLinkageSettings(data) {
    return api.post('/api/events/linkage-settings', data)
  },

  // 管理联动预案
  manageEmergencyPlans(data) {
    return api.post('/api/events/emergency-plans', data)
  },

  // 配置预警推送渠道
  configPushChannels(data) {
    return api.post('/api/events/push-config', data)
  },

  // 获取数据采集统计
  getDataCollection(params) {
    return api.get('/api/events/data-collection', params)
  },

  // 发送即时指令
  sendImmediateCommand(data) {
    return api.post('/api/events/immediate-command', data)
  }
}