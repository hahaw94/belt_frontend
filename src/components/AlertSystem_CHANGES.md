# 告警系统修改说明

## 问题解决

### 1. 登录页面显示告警系统问题 ✅
**问题**: 在登录页面也会显示铃铛和弹窗
**解决方案**: 
- 在App.vue中添加了`v-if="authStore.isAuthenticated"`条件判断
- 只有在用户已登录状态下才显示告警系统

### 2. 铃铛位置问题 ✅
**问题**: 铃铛位置与右上角用户信息不在同一行
**解决方案**:
- 将告警通知铃铛从App.vue移动到具体的布局组件中
- 在HomeLayout.vue和Layout.vue中都添加了告警通知铃铛
- 铃铛现在位于用户头像左侧，在同一行显示

## 修改的文件

### 1. App.vue
- 移除了告警通知铃铛组件
- 只保留告警弹窗组件
- 添加了登录状态检查

### 2. HomeLayout.vue (首页布局)
- 在header-user区域添加了告警通知铃铛
- 导入了AlertNotification组件和alertStore
- 添加了告警相关的事件处理方法
- 添加了CSS样式调整

### 3. Layout.vue (其他页面布局)
- 在header-user区域添加了告警通知铃铛
- 导入了AlertNotification组件和alertStore
- 添加了告警相关的事件处理方法
- 添加了CSS样式调整

## 功能验证

### 测试步骤
1. **登录前**: 访问登录页面，确认没有铃铛和弹窗显示
2. **登录后**: 
   - 首页(/dashboard): 右上角应显示铃铛，位于用户头像左侧
   - 其他功能页面: 右上角应显示铃铛，位于用户头像左侧
   - 点击铃铛测试按钮: 右下角应出现弹窗
3. **弹窗功能**: 
   - 最多显示3个弹窗
   - 5秒自动消失
   - 支持手动关闭

### 预期效果
- ✅ 登录页面无告警系统显示
- ✅ 已登录页面铃铛与用户信息在同一行
- ✅ 告警弹窗全局显示在右下角
- ✅ 测试功能正常工作

## 技术实现

### 布局集成
```vue
<!-- 在header-user中添加 -->
<div class="header-user">
  <div class="alert-notification-wrapper">
    <AlertNotification ... />
  </div>
  <el-dropdown>...</el-dropdown>
</div>
```

### CSS调整
```css
.header-user {
  gap: 15px; /* 铃铛和用户信息间距 */
}

.alert-notification-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 状态管理
- 使用统一的alertStore管理告警状态
- 在两个布局组件中都可以操作告警
- 弹窗在App.vue中全局显示

## 注意事项

1. 告警系统现在集成在两个布局组件中，确保所有页面都有告警功能
2. 登录状态检查确保只有已登录用户才能看到告警系统
3. CSS样式确保铃铛与用户信息对齐显示
4. 响应式设计保证在不同屏幕尺寸下正常显示
