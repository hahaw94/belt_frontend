# 告警铃铛位置和样式更新

## 更新内容

### 1. 位置调整 ✅
**变更**: 将告警铃铛从用户信息左侧移动到右侧
**影响文件**:
- `HomeLayout.vue` - 首页布局
- `Layout.vue` - 其他页面布局

**布局顺序**:
```
[用户头像] [用户名] [下拉箭头] | [告警铃铛]
```

### 2. 样式优化 ✅
**变更**: 去除铃铛的外围圆圈和底色
**影响文件**:
- `AlertNotification.vue`

**样式变更**:
- 移除背景色: `background: transparent`
- 移除边框: `border: none`
- 调整颜色: 铃铛图标使用 `#00d4ff` (与用户信息一致)
- 悬停效果: 图标变为白色并放大

## 具体修改

### HomeLayout.vue & Layout.vue
```vue
<!-- 调整后的布局 -->
<div class="header-user">
  <!-- 用户下拉菜单 -->
  <el-dropdown>...</el-dropdown>
  
  <!-- 告警通知铃铛 -->
  <div class="alert-notification-wrapper">
    <AlertNotification ... />
  </div>
</div>
```

### AlertNotification.vue
```css
.notification-bell {
  background: transparent;  /* 去除背景 */
  border: none;            /* 去除边框 */
  /* ... */
}

.bell-icon {
  color: #00d4ff;         /* 与用户信息颜色一致 */
}

.notification-bell:hover .bell-icon {
  color: #ffffff;         /* 悬停时变白 */
}
```

## 视觉效果

### 修改前
- 铃铛在用户信息左侧
- 有深色圆形背景和青色边框
- 铃铛图标为白色

### 修改后
- 铃铛在用户信息右侧
- 无背景和边框，完全透明
- 铃铛图标为青色 (#00d4ff)
- 悬停时图标变白并放大

## 功能保持不变

- ✅ 未读数量红色徽章显示
- ✅ 有未读告警时的摇摆动画
- ✅ 点击下拉菜单功能
- ✅ 测试按钮功能
- ✅ 告警历史记录管理

## 响应式适配

CSS中的响应式规则保持不变，确保在不同屏幕尺寸下正常显示：
- 桌面端: 正常显示
- 平板端: 适当调整间距
- 移动端: 保持功能可用

## 测试建议

1. **位置验证**: 确认铃铛在用户信息右侧
2. **样式验证**: 确认铃铛无背景和边框
3. **颜色验证**: 确认铃铛颜色与用户信息一致
4. **交互验证**: 确认悬停和点击效果正常
5. **功能验证**: 确认测试按钮和告警功能正常
