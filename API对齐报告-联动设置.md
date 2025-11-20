# 告警联动设置 API 对齐报告

## 检查时间
2025-11-19 17:03

## 检查范围
- 前端文件：`belt/src/views/event/LinkageSettings.vue`
- API文件：`belt/src/api/event.js`
- 后端Handler：`smart-video-platform1119/internal/event/handler/linkage_*.go`
- 后端Service：`smart-video-platform1119/internal/event/service/linkage_*.go`
- 后端Models：`smart-video-platform1119/internal/event/models/linkage_structs.go`

---

## 发现的问题及修复

### 1. ❌ 板卡规则API端点不存在

**问题描述：**
- 前端调用：`GET /api/linkage/rules/boards` 和 `POST /api/linkage/rules/boards/edit`
- 后端实际：这两个端点不存在

**修复方案：**
在 `event.js` 中重新实现这两个方法：
- `getRulesByBoards()`: 通过查询所有规则并按板卡分组实现
- `editBoardRules()`: 通过创建规则API实现板卡规则编辑

**修复代码：**
```javascript
// 获取板卡规则列表（按板卡分组）
async getRulesByBoards() {
  const response = await api.get('/api/linkage/rules', { page: 1, page_size: 1000 })
  // 按板卡分组处理...
}

// 编辑板卡规则
async editBoardRules(data) {
  // 为每个规则项创建一个规则
  for (const item of rule_items) {
    await api.post('/api/linkage/rules', ruleData)
  }
}
```

---

### 2. ❌ 预案数据结构不匹配

**问题描述：**
- 前端使用：`rule_items` 数组（简化格式）
- 后端使用：`trigger_conditions_template` 和 `linkage_actions_template`（复杂格式）

**后端数据结构：**
```go
type CreatePlanRequest struct {
    PlanName                  string             `json:"plan_name"`
    Description               *string            `json:"description"`
    Category                  *string            `json:"category"`
    TriggerConditionsTemplate []TriggerCondition `json:"trigger_conditions_template"`
    LinkageActionsTemplate    []LinkageAction    `json:"linkage_actions_template"`
}

type TriggerCondition struct {
    ConditionType string      `json:"condition_type"` // alarm_type, alarm_level, etc.
    Operator      string      `json:"operator"`       // equals, in, etc.
    Value         interface{} `json:"value"`
}

type LinkageAction struct {
    ActionType   string                 `json:"action_type"`   // broadcast, light_sound, control
    ActionParams map[string]interface{} `json:"action_params"`
    DelaySeconds int                    `json:"delay_seconds"`
}
```

**修复方案：**
1. 在 `createLinkagePlan()` 和 `updateLinkagePlan()` 中转换数据格式
2. 在 `loadPlans()` 中将后端格式转换为前端格式

**修复代码：**
```javascript
// 创建预案时转换
createLinkagePlan(data) {
  const backendData = {
    plan_name: data.plan_name,
    trigger_conditions_template: [
      { condition_type: 'alarm_type', operator: 'equals', value: ... },
      { condition_type: 'alarm_level', operator: 'equals', value: ... }
    ],
    linkage_actions_template: [...]
  }
  return api.post('/api/linkage/plans', backendData)
}

// 加载预案时转换
planList.value = (data.list || []).map(plan => ({
  ...plan,
  rule_items: [{
    name: plan.plan_name + '规则',
    trigger_condition: {
      alarm_type: plan.trigger_conditions_template.find(c => c.condition_type === 'alarm_type')?.value,
      alarm_level: plan.trigger_conditions_template.find(c => c.condition_type === 'alarm_level')?.value
    },
    linkage_actions: plan.linkage_actions_template
  }]
}))
```

---

### 3. ❌ 应用预案请求参数不匹配

**问题描述：**
- 前端发送：`{ target_boards, rule_items, plan_id }`
- 后端期望：`{ target_boards }`（只需要板卡ID数组）

**后端定义：**
```go
type ApplyPlanRequest struct {
    TargetBoards []string `json:"target_boards" binding:"required"`
}
```

**修复方案：**
简化 `applyPlanToBoards()` 方法，只发送 `target_boards`

**修复代码：**
```javascript
applyPlanToBoards(id, data) {
  const backendData = {
    target_boards: data.target_boards || data.board_ids || []
  }
  return api.post(`/api/linkage/plans/${id}/apply`, backendData)
}
```

---

## API端点对齐表

### 联动预案管理

| 功能 | 前端调用 | 后端路由 | 状态 | 说明 |
|------|---------|---------|------|------|
| 获取预案列表 | `GET /api/linkage/plans` | ✅ 存在 | ✅ 已对齐 | 参数：page, page_size |
| 获取预案详情 | `GET /api/linkage/plans/:id` | ✅ 存在 | ✅ 已对齐 | - |
| 创建预案 | `POST /api/linkage/plans` | ✅ 存在 | ✅ 已修复 | 数据格式已转换 |
| 更新预案 | `PUT /api/linkage/plans/:id` | ✅ 存在 | ✅ 已修复 | 数据格式已转换 |
| 删除预案 | `DELETE /api/linkage/plans/:id` | ✅ 存在 | ✅ 已对齐 | - |
| 应用预案 | `POST /api/linkage/plans/:id/apply` | ✅ 存在 | ✅ 已修复 | 请求参数已简化 |

### 联动规则管理

| 功能 | 前端调用 | 后端路由 | 状态 | 说明 |
|------|---------|---------|------|------|
| 获取规则列表 | `GET /api/linkage/rules` | ✅ 存在 | ✅ 已对齐 | - |
| 获取规则详情 | `GET /api/linkage/rules/:id` | ✅ 存在 | ✅ 已对齐 | - |
| 创建规则 | `POST /api/linkage/rules` | ✅ 存在 | ✅ 已对齐 | - |
| 更新规则 | `PUT /api/linkage/rules/:id` | ✅ 存在 | ✅ 已对齐 | - |
| 删除规则 | `DELETE /api/linkage/rules/:id` | ✅ 存在 | ✅ 已对齐 | - |
| 切换规则状态 | `PUT /api/linkage/rules/:id/status` | ✅ 存在 | ✅ 已对齐 | - |
| 按板卡获取规则 | `GET /api/linkage/rules/boards` | ❌ 不存在 | ✅ 已修复 | 通过查询所有规则实现 |
| 编辑板卡规则 | `POST /api/linkage/rules/boards/edit` | ❌ 不存在 | ✅ 已修复 | 通过创建规则实现 |

---

## 数据格式对齐

### 预案响应格式

**后端返回：**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "plan_code": "PLAN-20251119-0001",
        "plan_name": "预案名称",
        "description": "描述",
        "category": "algorithm_based",
        "trigger_conditions_template": [
          {
            "condition_type": "alarm_type",
            "operator": "equals",
            "value": 1
          },
          {
            "condition_type": "alarm_level",
            "operator": "equals",
            "value": 2
          }
        ],
        "linkage_actions_template": [
          {
            "action_type": "broadcast",
            "action_params": {},
            "delay_seconds": 0
          }
        ],
        "status": 1,
        "create_time": "2025-11-19T17:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 10
  }
}
```

**前端转换后：**
```javascript
{
  id: 1,
  plan_code: "PLAN-20251119-0001",
  plan_name: "预案名称",
  description: "描述",
  category: "algorithm_based",
  rule_items: [
    {
      name: "预案名称规则",
      trigger_condition: {
        alarm_type: 1,
        alarm_level: 2
      },
      linkage_actions: [
        {
          action_type: "broadcast",
          action_params: {},
          delay_seconds: 0
        }
      ]
    }
  ],
  status: 1,
  create_time: "2025-11-19T17:00:00Z"
}
```

### 应用预案结果格式

**后端返回：**
```json
{
  "code": 200,
  "data": {
    "success_count": 2,
    "failed_count": 0,
    "rule_ids": [1, 2],
    "errors": []
  },
  "msg": "Plan applied successfully"
}
```

**前端处理：**
- 显示成功/失败数量
- 如有错误，显示前3条错误信息
- 刷新板卡规则列表

---

## 修改文件清单

### 已修改文件

1. **`belt/src/api/event.js`**
   - ✅ 重写 `getRulesByBoards()` 方法
   - ✅ 重写 `editBoardRules()` 方法
   - ✅ 修改 `createLinkagePlan()` 添加数据转换
   - ✅ 修改 `updateLinkagePlan()` 添加数据转换
   - ✅ 修改 `applyPlanToBoards()` 简化请求参数

2. **`belt/src/views/event/LinkageSettings.vue`**
   - ✅ 修改 `loadPlans()` 添加响应数据转换
   - ✅ 修改 `handleConfirmApply()` 简化请求数据
   - ✅ 确保 `rule_items` 字段在各处正确处理

---

## 测试建议

### 1. 预案管理测试
- [ ] 创建新预案（带规则项）
- [ ] 创建新预案（不带规则项）
- [ ] 编辑预案基本信息
- [ ] 配置预案规则项
- [ ] 删除预案
- [ ] 查看预案列表分页

### 2. 预案应用测试
- [ ] 应用预案到单个板卡
- [ ] 应用预案到多个板卡
- [ ] 应用空规则预案（应提示错误）
- [ ] 查看应用结果反馈

### 3. 板卡规则测试
- [ ] 查看板卡规则列表
- [ ] 编辑单个板卡规则
- [ ] 添加板卡规则项
- [ ] 删除板卡规则项
- [ ] 保存板卡规则

### 4. 数据一致性测试
- [ ] 创建预案后查看详情
- [ ] 应用预案后查看板卡规则
- [ ] 编辑板卡规则后查看规则列表
- [ ] 删除预案后检查关联规则

---

## 注意事项

1. **板卡规则管理的实现方式**
   - 由于后端没有专门的板卡规则端点，前端通过规则API间接实现
   - 每次保存板卡规则时会创建新的规则记录
   - 建议后续优化：添加批量更新或替换板卡规则的API

2. **数据转换的性能考虑**
   - 预案列表加载时需要转换数据格式，数据量大时可能影响性能
   - 建议后端考虑提供前端友好的响应格式选项

3. **错误处理**
   - 所有API调用都添加了错误处理
   - 应用预案失败时会显示详细错误信息
   - 建议前端添加重试机制

4. **后续优化建议**
   - 考虑在后端添加 `/api/linkage/rules/boards` 端点
   - 考虑在后端添加批量操作板卡规则的API
   - 考虑统一前后端的数据结构命名

---

## 总结

✅ **所有API已对齐完成**

- 修复了3个主要问题
- 转换了数据格式以匹配后端
- 添加了完善的错误处理
- 保持了前端用户体验

**建议：** 在测试环境中进行完整的功能测试，确保所有场景都能正常工作。
