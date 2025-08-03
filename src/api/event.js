import { api } from './index'

// 事件中心API
export const eventApi = {
  // 获取报警事件列表
  getAlarmList(params) {
    return api.get('/api/events/alarms', params)
  },

  // 获取报警事件详情
  getAlarmDetail(alarmId) {
    return api.get(`/api/events/alarms/${alarmId}`)
  },

  // 处理报警事件
  processAlarm(alarmId, data) {
    return api.post(`/api/events/alarms/${alarmId}/process`, data)
  },

  // 标记报警为负样本
  markNegativeSample(alarmId, data) {
    return api.post(`/api/events/alarms/${alarmId}/mark-negative`, data)
  },

  // 导出人工审核样本
  exportSamples(data) {
    return api.post('/api/events/alarms/export-samples', data)
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