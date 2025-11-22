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

  // ========== 告警类型管理 ==========

  /**
   * 获取所有告警类型（用于订阅选择）
   */
  getAlarmTypes() {
    return api.get('/api/v1/alarms/types')
  },

  /**
   * 获取告警类型字典（管理用）
   * @param {boolean} activeOnly - 是否只获取启用的类型
   */
  getAlarmTypeDict(activeOnly = false) {
    return api.get('/api/v1/alarms/type-dict', { active: activeOnly })
  },

  /**
   * 创建告警类型
   * @param {Object} data - 告警类型数据
   * @param {number} data.id - 类型ID
   * @param {string} data.type_name - 类型名称
   * @param {string} data.type_code - 类型编码
   * @param {boolean} data.is_active - 是否启用
   */
  createAlarmType(data) {
    return api.post('/api/v1/alarms/type-dict', data)
  },

  /**
   * 删除告警类型
   * @param {number} id - 类型ID
   */
  deleteAlarmType(id) {
    return api.delete(`/api/v1/alarms/type-dict/${id}`)
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

  // ==================== 联动规则管理 ====================

  /**
   * 获取规则列表
   * @param {Object} params - 查询参数
   */
  getLinkageRules(params) {
    return api.get('/api/v1/linkage/rules', params)
  },

  /**
   * 获取规则详情
   * @param {number} id - 规则ID
   */
  getLinkageRule(id) {
    return api.get(`/api/v1/linkage/rules/${id}`)
  },

  /**
   * 创建规则
   * @param {Object} data - 规则数据
   */
  createLinkageRule(data) {
    return api.post('/api/v1/linkage/rules', data)
  },

  /**
   * 更新规则
   * @param {number} id - 规则ID
   * @param {Object} data - 规则数据
   */
  updateLinkageRule(id, data) {
    return api.put(`/api/v1/linkage/rules/${id}`, data)
  },

  /**
   * 删除规则
   * @param {number} id - 规则ID
   */
  deleteLinkageRule(id) {
    return api.delete(`/api/v1/linkage/rules/${id}`)
  },

  /**
   * 切换规则状态
   * @param {number} id - 规则ID
   * @param {boolean} enabled - 是否启用
   */
  toggleLinkageRuleStatus(id, enabled) {
    return api.put(`/api/v1/linkage/rules/${id}/status`, { enabled })
  },

  /**
   * 按板卡分组获取规则列表（直接调用后端专用接口）
   */
  getRulesByBoards() {
    return api.get('/api/v1/linkage/rules/boards')
  },

  /**
   * 编辑板卡规则（使用后端专用接口）
   * @param {Object} data - 规则数据 { board_id, rule_items }
   */
  editBoardRules(data) {
    return api.post('/api/v1/linkage/rules/boards/edit', data)
  },

  // ==================== 联动预案管理 ====================

  /**
   * 获取预案列表
   * @param {Object} params - 查询参数
   */
  getLinkagePlans(params) {
    return api.get('/api/v1/linkage/plans', params)
  },

  /**
   * 获取预案详情
   * @param {number} id - 预案ID
   */
  getLinkagePlan(id) {
    return api.get(`/api/v1/linkage/plans/${id}`)
  },

  /**
   * 创建预案
   * @param {Object} data - 预案数据
   * @param {string} data.plan_name - 预案名称
   * @param {string} data.description - 描述
   * @param {string} data.category - 分类
   * @param {Array} data.rule_items - 规则项数组（前端格式）
   */
  createLinkagePlan(data) {
    // 转换前端rule_items格式为后端trigger_conditions_template和linkage_actions_template
    const backendData = {
      plan_name: data.plan_name,
      description: data.description || null,
      category: data.category || null,
      trigger_conditions_template: [],
      linkage_actions_template: []
    }
    
    // 如果有rule_items，提取第一个作为模板（或合并所有）
    if (data.rule_items && data.rule_items.length > 0) {
      const firstItem = data.rule_items[0]
      if (firstItem.trigger_condition) {
        backendData.trigger_conditions_template = [
          {
            condition_type: 'alarm_type',
            operator: 'equals',
            value: firstItem.trigger_condition.alarm_type
          },
          {
            condition_type: 'alarm_level',
            operator: 'equals',
            value: firstItem.trigger_condition.alarm_level
          }
        ]
      }
      if (firstItem.linkage_actions) {
        backendData.linkage_actions_template = firstItem.linkage_actions
      }
    }
    
    return api.post('/api/v1/linkage/plans', backendData)
  },

  /**
   * 更新预案
   * @param {number} id - 预案ID
   * @param {Object} data - 预案数据
   */
  updateLinkagePlan(id, data) {
    // 转换前端rule_items格式为后端trigger_conditions_template和linkage_actions_template
    const backendData = {
      plan_name: data.plan_name,
      description: data.description || null,
      category: data.category || null
    }
    
    // 如果有rule_items，提取第一个作为模板
    if (data.rule_items && data.rule_items.length > 0) {
      const firstItem = data.rule_items[0]
      if (firstItem.trigger_condition) {
        backendData.trigger_conditions_template = [
          {
            condition_type: 'alarm_type',
            operator: 'equals',
            value: firstItem.trigger_condition.alarm_type
          },
          {
            condition_type: 'alarm_level',
            operator: 'equals',
            value: firstItem.trigger_condition.alarm_level
          }
        ]
      }
      if (firstItem.linkage_actions) {
        backendData.linkage_actions_template = firstItem.linkage_actions
      }
    }
    
    return api.put(`/api/v1/linkage/plans/${id}`, backendData)
  },

  /**
   * 删除预案
   * @param {number} id - 预案ID
   */
  deleteLinkagePlan(id) {
    return api.delete(`/api/v1/linkage/plans/${id}`)
  },

  /**
   * 应用预案到板卡
   * @param {number} id - 预案ID
   * @param {Object} data - 应用数据
   * @param {Array} data.target_boards - 目标板卡ID数组
   */
  applyPlanToBoards(id, data) {
    // 后端只需要target_boards字段
    const backendData = {
      target_boards: data.target_boards || data.board_ids || []
    }
    return api.post(`/api/v1/linkage/plans/${id}/apply`, backendData)
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
  }
}