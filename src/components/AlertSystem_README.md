# Web告警推送系统使用说明

## 功能概述

本告警推送系统为Vue 3 + Element Plus项目提供了完整的告警通知功能，包括：

- **右下角弹窗通知**：支持多个告警同时显示，最多堆叠3个
- **右上角铃铛通知**：显示告警历史记录和未读数量
- **自动消失机制**：每个弹窗5秒后自动消失
- **测试功能**：内置测试按钮，可快速验证功能

## 组件结构

### 1. AlertToast.vue - 告警弹窗组件
- 位置：页面右下角
- 功能：显示实时告警弹窗
- 特性：
  - 支持4种告警类型：error、warning、info、success
  - 最多同时显示3个弹窗
  - 向上堆叠显示
  - 5秒自动消失
  - 支持手动关闭

### 2. AlertNotification.vue - 告警通知铃铛
- 位置：页面右上角
- 功能：显示告警历史和未读数量
- 特性：
  - 铃铛图标显示未读数量
  - 下拉菜单显示历史记录
  - 分页显示历史告警
  - 支持标记已读/全部已读
  - 内置测试按钮

### 3. alertStore.js - 状态管理
- 基于Pinia的状态管理
- 管理活动告警和历史记录
- 提供完整的CRUD操作

## 使用方法

### 基本集成

系统已集成到App.vue中，无需额外配置即可使用。

### 发送告警

```javascript
import { useAlertStore } from '@/stores/alertStore'

const alertStore = useAlertStore()

// 发送告警
alertStore.addAlert({
  type: 'error',        // 告警类型：error、warning、info、success
  message: '告警消息',   // 告警文本
  image: 'image_url'    // 告警图片URL（可选）
})
```

### 告警类型

- **error**: 错误告警（红色边框）
- **warning**: 警告告警（黄色边框）
- **info**: 信息告警（青色边框）
- **success**: 成功告警（绿色边框）

### API方法

```javascript
const alertStore = useAlertStore()

// 添加告警
alertStore.addAlert(alertData)

// 创建测试告警
alertStore.createTestAlert()

// 移除活动告警
alertStore.removeActiveAlert(alertId)

// 标记为已读
alertStore.markAsRead(alertId)

// 标记所有为已读
alertStore.markAllAsRead()

// 清空历史
alertStore.clearHistory()

// 批量添加告警（测试用）
alertStore.addMultipleAlerts(3)
```

## 样式定制

### 告警弹窗样式
- 背景：半透明深色背景 + 毛玻璃效果
- 边框：根据告警类型显示不同颜色
- 动画：滑入滑出 + 缩放效果
- 响应式：支持移动端适配

### 铃铛通知样式
- 科技感圆形按钮
- 未读数量红色徽章
- 摇摆动画提醒
- 下拉菜单深色主题

## 测试功能

1. 点击右上角铃铛图标
2. 在下拉菜单中点击"测试"按钮
3. 系统会随机生成一个测试告警
4. 观察右下角弹窗效果

## 技术特性

- **Vue 3 Composition API**：现代化的组件开发方式
- **Pinia状态管理**：响应式状态管理
- **Element Plus UI**：企业级UI组件库
- **CSS3动画**：流畅的过渡效果
- **响应式设计**：支持各种屏幕尺寸
- **TypeScript友好**：完整的类型支持

## 配置选项

### AlertToast组件配置
```vue
<AlertToast
  :alerts="alerts"          // 告警列表
  :max-visible="3"          // 最大显示数量
  :duration="5000"          // 显示时长(ms)
  @remove-alert="handler"   // 移除告警事件
/>
```

### AlertNotification组件配置
```vue
<AlertNotification
  :alert-history="history"      // 历史记录
  @test-alert="handler"         // 测试告警事件
  @mark-as-read="handler"       // 标记已读事件
  @mark-all-as-read="handler"   // 全部已读事件
  @clear-history="handler"      // 清空历史事件
/>
```

## 注意事项

1. 告警图片建议使用300x200尺寸
2. 告警消息建议控制在50字以内
3. 系统会自动限制历史记录数量（最多1000条）
4. 测试告警使用SVG格式的base64图片
5. 组件已集成到App.vue，全局可用

## 扩展建议

1. **WebSocket集成**：接收实时告警推送
2. **声音提醒**：添加告警音效
3. **邮件通知**：重要告警邮件推送
4. **告警统计**：添加告警数据分析
5. **自定义主题**：支持多种视觉主题

## 故障排除

### 常见问题

1. **告警不显示**
   - 检查alertStore是否正确导入
   - 确认组件已在App.vue中注册

2. **样式异常**
   - 检查Element Plus样式是否正确加载
   - 确认CSS优先级设置

3. **动画卡顿**
   - 检查浏览器性能
   - 减少同时显示的告警数量

4. **图片不显示**
   - 检查图片URL是否有效
   - 确认跨域设置正确
