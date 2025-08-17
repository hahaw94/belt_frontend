import { api } from './index'

// 认证API
export const authApi = {
  // 用户登录
  login(data) {
    return api.post('/api/v1/auth/login', data)
  },

  // Token验证
  verifyToken() {
    return api.post('/api/v1/auth/verify')
  },

  // 刷新Token
  refreshToken(refreshToken) {
    return api.post('/api/v1/auth/refresh', { refresh_token: refreshToken })
  },

  // 用户登出
  logout() {
    return api.post('/api/v1/auth/logout')
  },

  // 获取当前用户信息
  getUserInfo() {
    return api.get('/api/v1/auth/userinfo')
  },

  // 修改密码
  changePassword(data) {
    return api.put('/api/v1/auth/change-password', data)
  }
}

// 用户管理API
export const userApi = {
  // 创建用户
  createUser(data) {
    return api.post('/api/v1/users', data)
  },

  // 删除用户
  deleteUser(userId) {
    return api.delete(`/api/v1/users/${userId}`)
  },

  // 批量删除用户
  batchDeleteUsers(userIds) {
    return api.delete('/api/v1/users/batch', { user_ids: userIds })
  },

  // 编辑用户信息
  updateUser(userId, data) {
    return api.put(`/api/v1/users/${userId}`, data)
  },

  // 锁定用户
  lockUser(userId) {
    return api.put(`/api/v1/users/${userId}/lock`)
  },

  // 解锁用户
  unlockUser(userId) {
    return api.put(`/api/v1/users/${userId}/unlock`)
  },

  // 重置用户密码
  resetPassword(userId, data) {
    return api.put(`/api/v1/users/${userId}/reset-password`, data)
  },

  // 获取用户列表
  getUserList(params) {
    return api.get('/api/v1/users', params)
  },

  // 获取用户详情
  getUserDetail(userId) {
    return api.get(`/api/v1/users/${userId}`)
  },

  // 用户个人资料管理 - 获取
  getUserProfile(userId) {
    return api.get(`/api/v1/users/${userId}/profile`)
  },

  // 用户个人资料管理 - 更新
  updateUserProfile(userId, data) {
    return api.put(`/api/v1/users/${userId}/profile`, data)
  },

  // 用户个人资料管理 - 删除
  deleteUserProfile(userId) {
    return api.delete(`/api/v1/users/${userId}/profile`)
  }
}

// 角色管理API
export const roleApi = {
  // 创建角色
  createRole(data) {
    return api.post('/api/v1/roles', data)
  },

  // 删除角色
  deleteRole(roleId) {
    return api.delete(`/api/v1/roles/${roleId}`)
  },

  // 编辑角色基本信息
  updateRole(roleId, data) {
    return api.put(`/api/v1/roles/${roleId}`, data)
  },

  // 获取角色列表
  getRoleList(params) {
    return api.get('/api/v1/roles', params)
  },

  // 获取角色详情
  getRoleDetail(roleId) {
    return api.get(`/api/v1/roles/${roleId}`)
  },

  // 分配用户角色
  assignUserRole(userId, data) {
    return api.post(`/api/v1/users/${userId}/roles`, data)
  },

  // 移除用户角色
  removeUserRole(userId, roleId) {
    return api.delete(`/api/v1/users/${userId}/roles/${roleId}`)
  },

  // 获取用户角色列表
  getUserRoles(userId) {
    return api.get(`/api/v1/users/${userId}/roles`)
  },

  // 获取权限列表
  getPermissionList() {
    return api.get('/api/v1/permissions')
  },

  // 批量设置角色权限
  setRolePermissions(roleId, data) {
    return api.put(`/api/v1/roles/${roleId}/permissions`, data)
  },

  // 添加角色权限
  addRolePermission(roleId, data) {
    return api.post(`/api/v1/roles/${roleId}/permissions`, data)
  },

  // 移除角色权限
  removeRolePermission(roleId, permissionId) {
    return api.delete(`/api/v1/roles/${roleId}/permissions/${permissionId}`)
  },

  // 获取角色权限列表
  getRolePermissions(roleId) {
    return api.get(`/api/v1/roles/${roleId}/permissions`)
  }
}

// 兼容性API (保持原有API接口名称)
export const userApiLegacy = {
  // 获取用户列表
  getUserList(params) {
    return userApi.getUserList(params)
  },

  // 添加用户
  addUser(data) {
    return userApi.createUser(data)
  },

  // 更新用户信息
  updateUser(userId, data) {
    return userApi.updateUser(userId, data)
  },

  // 删除用户
  deleteUser(userId) {
    return userApi.deleteUser(userId)
  },

  // 重置用户密码
  resetPassword(userId, data) {
    return userApi.resetPassword(userId, data)
  },

  // 获取角色列表
  getRoleList(params) {
    return roleApi.getRoleList(params)
  },

  // 添加角色
  addRole(data) {
    return roleApi.createRole(data)
  },

  // 更新角色
  updateRole(roleId, data) {
    return roleApi.updateRole(roleId, data)
  },

  // 删除角色
  deleteRole(roleId) {
    return roleApi.deleteRole(roleId)
  }
} 