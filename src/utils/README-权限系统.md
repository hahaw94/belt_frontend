# 权限系统使用说明

## 概述

本系统实现了基于个人资料权限信息的动态菜单控制，不依赖用户管理API，而是直接从用户的个人资料中获取权限信息来控制菜单显示。

## 核心文件

### 1. `menu-permissions.js` - 权限配置文件
定义了菜单项与权限的映射关系：

```javascript
export const MENU_PERMISSIONS = {
  '/dashboard': [],  // 首页不需要权限，所有用户可访问
  '/system-config': ['system:config'],  // 系统配置需要 system:config 权限
  '/usermanagement': ['module:user'],  // 用户管理需要 module:user 权限
  // ... 其他菜单配置
}
```

### 2. `usePermissions.js` - 权限管理组合式函数
提供便捷的权限检查方法：

```javascript
const { checkMenuPermission, checkChildPermission, hasPermission } = usePermissions()
```

### 3. `route-permission.js` - 路由权限守卫工具
提供路由级别的权限检查和强制登出功能：

```javascript
import { routePermissionGuard, forceLogout, checkRoutePermission } from '@/utils/route-permission'
```

### 4. 布局组件 - 菜单权限控制
在 `layout/index.vue` 中为每个菜单项添加了权限控制：

```vue
<el-menu-item v-if="checkMenuPermission('/dashboard')" index="/dashboard">
  首页/总览
</el-menu-item>

<el-sub-menu v-if="checkChildPermission('/usermanagement')" index="/usermanagement">
  <template #title>用户管理</template>
  <el-menu-item v-if="checkMenuPermission('/usermanagement/user-management-manage')">
    用户列表
  </el-menu-item>
</el-sub-menu>
```

### 5. 路由守卫 - 路由级权限保护
在 `router/index.js` 中添加了全局路由守卫：

```javascript
router.beforeEach((to, from, next) => {
  // 更新页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 智能监控系统`;
  }
  
  // 执行权限检查
  routePermissionGuard(to, from, next)
});
```

**路由守卫功能：**
- **登录检查**：验证用户是否已登录
- **权限验证**：检查用户是否有访问目标路由的权限
- **强制登出**：无权限时清除认证信息并跳转到登录页
- **消息提示**：显示权限不足的错误提示

## 权限数据结构

用户权限信息存储在 `userInfo.permissions` 中，支持以下格式：

```javascript
// 权限对象格式（推荐）
{
  id: 1,
  permission_code: "user_management",
  permission_name: "用户管理",
  resource: "user",
  action: "manage"
}

// 字符串格式
"user_management"

// 超级管理员权限
{
  permission_code: "*",
  permission_name: "超级管理员"
}
```

## 权限配置说明

### 菜单权限映射

| 菜单路径 | 所需权限 | 说明 |
|---------|---------|------|
| `/dashboard` | 无 | 首页，所有用户可访问 |
| `/system-config` | `system:config` | 系统配置主菜单 |
| `/system-config/basic-management` | `system:config` | 基础管理 |
| `/system-config/version-management` | `system:config` | 版本管理 |
| `/system-config/map-management` | `system:config` | 地图管理 |
| `/usermanagement` | `module:user` | 用户管理主菜单 |
| `/usermanagement/user-management-manage` | `module:user` | 用户列表 |
| `/usermanagement/role-management` | `module:user` | 角色列表 |
| `/algorithm` | `module:algorithm` | 算法管理主菜单 |
| `/algorithm/upload` | `module:algorithm` | 算法仓 |
| `/algorithm/config` | `module:algorithm` | 算法配置 |
| `/access` | `module:access` | 接入管理主菜单 |
| `/access/device` | `module:access` | 设备管理 |
| `/detection` | `module:monitor` | 实时检测主菜单 |
| `/detection/realtime` | `module:monitor` | 实时画面 |
| `/detection/playback` | `module:monitor` | 录像回放 |
| `/recording` | `module:video` | 录像管理主菜单 |
| `/recording/list` | `module:video` | 录像列表 |
| `/recording/statistics` | `module:video` | 录像统计 |
| `/event` | `module:event` | 事件中心主菜单 |
| `/event/alarm-display` | `module:event` | 告警信息展示 |
| `/event/data-collection` | `module:event` | 告警数据收集 |
| `/event/immediate-command` | `module:event` | 即时告警批示 |
| `/event/linkage-settings` | `module:event` | 告警联动设置 |
| `/event/warning-push` | `module:event` | 预警推送 |
| `/log` | `module:log` | 日志中心 |
| `/statistics` | `module:statistics` | 统计分析 |

### 权限检查逻辑

1. **超级管理员权限**：拥有 `*` 或 `super_admin` 权限的用户可以访问所有菜单
2. **OR逻辑**：用户只需要拥有配置中任一权限即可访问对应菜单
3. **子菜单检查**：父菜单会检查用户是否有任一子菜单的访问权限

## 使用方法

### 在组件中使用权限检查

```vue
<template>
  <div>
    <!-- 基于权限显示/隐藏元素 -->
    <el-button v-if="hasPermission('user_management')">
      用户管理
    </el-button>
    
    <!-- 检查菜单权限 -->
    <div v-if="checkMenuPermission('/system-config')">
      系统配置内容
    </div>
    
    <!-- 使用权限指令 -->
    <el-button v-if="can('user_management')">
      单个权限检查
    </el-button>
    
    <el-button v-if="can(['user_management', 'system_config'], 'and')">
      需要所有权限
    </el-button>
    
    <el-button v-if="can(['user_management', 'system_config'], 'or')">
      需要任一权限
    </el-button>
  </div>
</template>

<script>
import { usePermissions } from '@/composables/usePermissions'

export default {
  setup() {
    const { 
      hasPermission, 
      checkMenuPermission, 
      checkChildPermission,
      can,
      isSuperAdmin 
    } = usePermissions()
    
    return {
      hasPermission,
      checkMenuPermission,
      checkChildPermission,
      can,
      isSuperAdmin
    }
  }
}
</script>
```

### 路由权限保护

```javascript
import { withPermission } from '@/composables/usePermissions'

// 使用装饰器保护路由
export default withPermission(['user_management'], {
  logic: 'or',
  redirect: '/403'
})(YourComponent)
```

## 添加新菜单

1. **在 `menu-permissions.js` 中添加权限配置**：
```javascript
export const MENU_PERMISSIONS = {
  // 现有配置...
  '/new-module': ['new_module_permission'],
  '/new-module/sub-page': ['new_module_permission', 'sub_page_permission']
}
```

2. **在布局组件中添加菜单项**：
```vue
<el-sub-menu v-if="checkChildPermission('/new-module')" index="/new-module">
  <template #title>
    <el-icon><NewIcon /></el-icon>
    <span>新模块</span>
  </template>
  <el-menu-item v-if="checkMenuPermission('/new-module/sub-page')" index="/new-module/sub-page">
    子页面
  </el-menu-item>
</el-sub-menu>
```

3. **在路由中添加对应路由**：
```javascript
{
  path: '/new-module',
  component: Layout,
  children: [
    {
      path: 'sub-page',
      component: () => import('@/views/new-module/SubPage.vue'),
      meta: { title: '子页面' }
    }
  ]
}
```

## 权限数据来源

权限数据来源于用户个人资料，通过以下方式获取：

1. **登录时获取**：在 `auth.js` store 的 `login` 方法中，后端返回包含权限信息的用户数据
2. **个人资料获取**：通过 `userApi.getMyProfile()` 接口获取当前用户的详细信息，包括权限列表

## 注意事项

1. **首页权限**：首页 (`/dashboard`) 配置为空数组，表示所有登录用户都可以访问
2. **超级管理员**：拥有 `*` 权限的用户可以访问所有功能
3. **权限格式兼容**：系统同时支持字符串和对象格式的权限数据
4. **子菜单逻辑**：只有当用户有任一子菜单权限时，父菜单才会显示
5. **缓存更新**：权限更改后需要重新登录或刷新个人资料以更新菜单显示

## 调试建议

1. **检查权限数据**：在浏览器控制台查看 `authStore.userInfo.permissions`
2. **权限映射检查**：确认 `MENU_PERMISSIONS` 中的权限标识与后端返回的权限数据匹配
3. **组件状态**：使用 Vue DevTools 查看权限相关的计算属性状态
