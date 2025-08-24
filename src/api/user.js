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
    return api.post('/api/v1/auth/refresh', { refreshToken })
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

// 用户管理API - 对齐API文档v1接口
export const userApi = {
  // 创建用户
  createUser(data) {
    // 后端期望的字段格式
    const backendData = {
      username: data.username,
      email: data.email || null,
      phone: data.phone || null,
      role_ids: data.role_ids || data.roleIds || []
    }
    return api.post('/api/v1/users', backendData)
  },

  // 删除用户
  deleteUser(userId) {
    return api.delete(`/api/v1/users/${userId}`)
  },

  // 批量删除用户
  batchDeleteUsers(userIds) {
    return api.delete('/api/v1/users/batch', { data: { userIds } })
  },

  // 编辑用户信息
  updateUser(userId, data) {
    // 后端期望的字段格式
    const backendData = {
      email: data.email || null,
      phone: data.phone || null,
      role_ids: data.role_ids || data.roleIds || []
    }
    return api.put(`/api/v1/users/${userId}`, backendData)
  },

  // 锁定用户
  lockUser(userId, reason) {
    return api.put(`/api/v1/users/${userId}/lock`, { reason })
  },

  // 解锁用户
  unlockUser(userId) {
    return api.put(`/api/v1/users/${userId}/unlock`)
  },

  // 重置用户密码
  resetPassword(userId, newPassword) {
    return api.put(`/api/v1/users/${userId}/reset-password`, { new_password: newPassword })
  },

  // 获取用户列表
  getUserList(params) {
    // 后端期望的参数格式：page, size
    const backendParams = {
      page: params.page || 1,
      size: params.size || 10
    }
    
    // 添加搜索筛选参数（只添加非空值，确保类型正确）
    if (params.username) backendParams.username = params.username
    if (params.email) backendParams.email = params.email
    if (params.status !== undefined && params.status !== '') {
      // 确保status为数字类型，符合后端int8期望
      backendParams.status = typeof params.status === 'string' ? parseInt(params.status) : params.status
    }
    
    console.log('发送到后端的用户列表参数:', backendParams)
    return api.get('/api/v1/users', { params: backendParams })
  },

  // 获取用户详情
  getUserDetail(userId) {
    return api.get(`/api/v1/users/${userId}`)
  },

  // 获取当前用户个人资料
  getMyProfile() {
    return api.get('/api/v1/users/profile')
  },

  // 更新当前用户个人资料
  updateMyProfile(data) {
    return api.put('/api/v1/users/profile', data)
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
  },

  // 批量创建用户
  batchCreateUsers(data) {
    return api.post('/api/v1/users/batch', data)
  },

  // 从文件批量创建用户
  batchCreateUsersFromFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/v1/users/batch/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 下载用户导入模板
  downloadUserTemplate() {
    return api.get('/api/v1/users/template', {
      responseType: 'blob'
    })
  }
}

// 角色管理API - 对齐API文档v1接口
export const roleApi = {
  // 创建角色
  createRole(data) {
    // 后端期望的字段格式
    const backendData = {
      role_code: data.roleCode || data.code,
      role_name: data.roleName || data.name,
      description: data.description || null,
      permission_ids: data.permissionIds || data.permission_ids || []
    }
    return api.post('/api/v1/roles', backendData)
  },

  // 删除角色
  deleteRole(roleId) {
    return api.delete(`/api/v1/roles/${roleId}`)
  },

  // 编辑角色基本信息
  updateRole(roleId, data) {
    // 后端期望的字段格式
    const backendData = {
      role_name: data.roleName || data.name,
      description: data.description || null,
      permission_ids: data.permissionIds || data.permission_ids || []
    }
    return api.put(`/api/v1/roles/${roleId}`, backendData)
  },

  // 获取角色列表
  getRoleList(params) {
    // 后端期望的参数格式：page, size
    const backendParams = {
      page: params?.page || 1,
      size: params?.size || 10
    }
    
    // 添加搜索筛选参数（只添加非空值，确保类型正确）
    if (params?.role_name) backendParams.role_name = params.role_name
    if (params?.role_type !== undefined && params?.role_type !== '') {
      // 确保role_type为数字类型，符合后端int8期望
      backendParams.role_type = typeof params.role_type === 'string' ? parseInt(params.role_type) : params.role_type
    }
    if (params?.status !== undefined && params?.status !== '') {
      // 确保status为数字类型，符合后端int8期望
      backendParams.status = typeof params.status === 'string' ? parseInt(params.status) : params.status
    }
    
    console.log('发送到后端的角色列表参数:', backendParams)
    return api.get('/api/v1/roles', { params: backendParams })
  },

  // 获取角色详情
  getRoleDetail(roleId) {
    return api.get(`/api/v1/roles/${roleId}`)
  },

  // 分配用户角色
  assignUserRole(userId, roleIds) {
    return api.put(`/api/v1/users/${userId}/roles`, { role_ids: roleIds })
  },

  // 移除用户角色
  removeUserRole(userId, roleId) {
    return api.delete(`/api/v1/users/${userId}/roles/${roleId}`)
  },

  // 获取用户角色列表 - 已废弃，请直接使用 userApi.getUserDetail
  // getUserRoles(userId) {
  //   return userApi.getUserDetail(userId)
  // },

  // 获取权限列表
  getPermissionList(params) {
    return api.get('/api/v1/permissions', { params })
  },

  // 批量设置角色权限
  setRolePermissions(roleId, permissionIds) {
    return api.put(`/api/v1/roles/${roleId}/permissions`, { permission_ids: permissionIds })
  },

  // 添加角色权限
  addRolePermission(roleId, permissionIds) {
    return api.post(`/api/v1/roles/${roleId}/permissions`, { permission_ids: permissionIds })
  },

  // 移除角色权限
  removeRolePermission(roleId, permissionId) {
    return api.delete(`/api/v1/roles/${roleId}/permissions/${permissionId}`)
  },

  // 获取角色权限列表 - 使用角色详情接口，因为后端角色详情已包含权限信息
  getRolePermissions(roleId) {
    return this.getRoleDetail(roleId)
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