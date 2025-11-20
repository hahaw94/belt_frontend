# 告警联动设置 API 对齐总结

## ✅ 已完成的修复

### 1. 修复的文件
- **`belt/src/api/event.js`** - API接口层
- **`belt/src/views/event/LinkageSettings.vue`** - 前端页面组件

### 2. 解决的核心问题

#### 问题1：板卡规则API不存在 ❌ → ✅
**原问题：**
```javascript
// 前端调用的API后端不存在
eventApi.getRulesByBoards()  // GET /api/linkage/rules/boards
eventApi.editBoardRules()    // POST /api/linkage/rules/boards/edit
```

**解决方案：**
```javascript
// 通过现有规则API实现板卡规则管理
async getRulesByBoards() {
  // 1. 获取所有规则
  const response = await api.get('/api/linkage/rules', { page: 1, page_size: 1000 })
  // 2. 按板卡ID分组
  // 3. 转换为前端需要的格式
}

async editBoardRules(data) {
  // 为每个规则项调用创建规则API
  for (const item of rule_items) {
    await api.post('/api/linkage/rules', ruleData)
  }
}
```

#### 问题2：预案数据结构不匹配 ❌ → ✅
**原问题：**
- 前端使用：`rule_items` (简化格式)
- 后端使用：`trigger_conditions_template` + `linkage_actions_template` (标准格式)

**解决方案：**
```javascript
// 创建/更新预案时：前端格式 → 后端格式
createLinkagePlan(data) {
  const backendData = {
    plan_name: data.plan_name,
    trigger_conditions_template: [
      { condition_type: 'alarm_type', operator: 'equals', value: ... },
      { condition_type: 'alarm_level', operator: 'equals', value: ... }
    ],
    linkage_actions_template: data.rule_items[0].linkage_actions
  }
  return api.post('/api/linkage/plans', backendData)
}

// 加载预案时：后端格式 → 前端格式
loadPlans() {
  planList.value = data.list.map(plan => ({
    ...plan,
    rule_items: [{
      name: plan.plan_name + '规则',
      trigger_condition: {
        alarm_type: plan.trigger_conditions_template.find(...)?.value,
        alarm_level: plan.trigger_conditions_template.find(...)?.value
      },
      linkage_actions: plan.linkage_actions_template
    }]
  }))
}
```

#### 问题3：应用预案参数不匹配 ❌ → ✅
**原问题：**
```javascript
// 前端发送多余字段
{ target_boards: [...], rule_items: [...], plan_id: 1 }
```

**解决方案：**
```javascript
// 只发送后端需要的字段
applyPlanToBoards(id, data) {
  return api.post(`/api/linkage/plans/${id}/apply`, {
    target_boards: data.target_boards
  })
}
```

---

## 📋 API端点对照表

| 功能 | 前端调用 | 后端实际路由 | 状态 |
|------|---------|------------|------|
| 获取预案列表 | `GET /api/linkage/plans` | ✅ 存在 | ✅ 已对齐 |
| 创建预案 | `POST /api/linkage/plans` | ✅ 存在 | ✅ 已对齐（含转换） |
| 更新预案 | `PUT /api/linkage/plans/:id` | ✅ 存在 | ✅ 已对齐（含转换） |
| 删除预案 | `DELETE /api/linkage/plans/:id` | ✅ 存在 | ✅ 已对齐 |
| 应用预案 | `POST /api/linkage/plans/:id/apply` | ✅ 存在 | ✅ 已对齐 |
| 获取规则列表 | `GET /api/linkage/rules` | ✅ 存在 | ✅ 已对齐 |
| 创建规则 | `POST /api/linkage/rules` | ✅ 存在 | ✅ 已对齐 |
| 更新规则 | `PUT /api/linkage/rules/:id` | ✅ 存在 | ✅ 已对齐 |
| 删除规则 | `DELETE /api/linkage/rules/:id` | ✅ 存在 | ✅ 已对齐 |
| 按板卡获取规则 | 自定义实现 | 通过规则列表实现 | ✅ 已实现 |
| 编辑板卡规则 | 自定义实现 | 通过创建规则实现 | ✅ 已实现 |

---

## 🧪 测试检查清单

### 预案管理功能
- [ ] **创建预案**
  - [ ] 输入预案名称、分类、描述
  - [ ] 配置规则项（告警类型、等级、联动动作）
  - [ ] 保存成功后在列表中显示
  
- [ ] **编辑预案**
  - [ ] 修改预案基本信息
  - [ ] 修改规则项
  - [ ] 保存后更新成功

- [ ] **删除预案**
  - [ ] 确认删除提示
  - [ ] 删除后从列表移除

- [ ] **配置规则**
  - [ ] 打开规则配置对话框
  - [ ] 添加新规则项
  - [ ] 编辑现有规则项
  - [ ] 删除规则项
  - [ ] 保存规则配置

### 预案应用功能
- [ ] **应用预案到板卡**
  - [ ] 选择一个或多个板卡
  - [ ] 点击应用按钮
  - [ ] 显示应用结果（成功/失败数量）
  - [ ] 如有失败，显示错误信息

### 板卡规则管理
- [ ] **查看板卡规则**
  - [ ] 切换到"规则配置"Tab
  - [ ] 显示所有板卡及其规则
  - [ ] 显示规则数量和来源预案

- [ ] **编辑板卡规则**
  - [ ] 点击"编辑规则"按钮
  - [ ] 添加新规则项
  - [ ] 编辑现有规则项
  - [ ] 删除规则项
  - [ ] 保存后刷新列表

### 数据一致性检查
- [ ] 创建预案后立即查看详情，数据正确
- [ ] 应用预案后，板卡规则列表更新
- [ ] 编辑预案后，关联的板卡规则保持一致
- [ ] 删除预案后，相关规则处理正确

---

## 🔍 关键代码位置

### API层 (`belt/src/api/event.js`)
```javascript
// 行号 192-232: getRulesByBoards() - 板卡规则查询
// 行号 238-276: editBoardRules() - 板卡规则编辑
// 行号 304-336: createLinkagePlan() - 创建预案（含转换）
// 行号 344-374: updateLinkagePlan() - 更新预案（含转换）
// 行号 391-396: applyPlanToBoards() - 应用预案
```

### 页面组件 (`belt/src/views/event/LinkageSettings.vue`)
```javascript
// 行号 631-687: loadPlans() - 加载预案列表（含转换）
// 行号 699-721: loadBoardRules() - 加载板卡规则
// 行号 846-850: handleConfigRules() - 配置规则
// 行号 951-1006: handleConfirmApply() - 应用预案
// 行号 1032-1052: handleSaveBoardRules() - 保存板卡规则
```

---

## ⚠️ 注意事项

1. **板卡规则的实现方式**
   - 目前通过创建新规则实现板卡规则编辑
   - 每次保存会创建新的规则记录
   - 建议后续与后端协商添加专门的板卡规则管理API

2. **数据转换的位置**
   - 创建/更新预案：在API层转换（前端→后端）
   - 加载预案：在组件层转换（后端→前端）
   - 保持转换逻辑集中，便于维护

3. **错误处理**
   - 所有API调用都包含try-catch
   - 错误信息通过ElMessage显示给用户
   - 控制台输出详细错误日志便于调试

4. **性能考虑**
   - `getRulesByBoards()`获取所有规则（最多1000条）
   - 如果规则数量很大，可能需要优化
   - 建议后端提供分页的板卡规则查询接口

---

## 📝 后续优化建议

### 短期优化
1. 在测试环境进行完整功能测试
2. 收集用户反馈，优化交互体验
3. 添加加载状态提示，改善用户体验

### 长期优化
1. **后端API增强**
   - 添加 `GET /api/linkage/rules/boards` 端点
   - 添加 `PUT /api/linkage/rules/boards/:board_id` 端点
   - 支持批量操作板卡规则

2. **数据结构统一**
   - 前后端协商统一的数据结构
   - 减少数据转换的复杂度
   - 提高代码可维护性

3. **性能优化**
   - 实现板卡规则的增量更新
   - 添加本地缓存机制
   - 优化大数据量场景的处理

---

## ✅ 验证通过标准

所有以下检查项都通过，即可认为API对齐成功：

1. ✅ 所有API调用无404错误
2. ✅ 创建预案成功并正确显示
3. ✅ 编辑预案数据正确保存
4. ✅ 应用预案到板卡成功
5. ✅ 板卡规则列表正确显示
6. ✅ 编辑板卡规则成功保存
7. ✅ 无控制台错误或警告
8. ✅ 所有数据格式转换正确

---

## 📞 问题反馈

如果在测试过程中发现任何问题，请记录：
- 操作步骤
- 预期结果
- 实际结果
- 控制台错误信息
- 网络请求详情（Request/Response）

便于快速定位和修复问题。
