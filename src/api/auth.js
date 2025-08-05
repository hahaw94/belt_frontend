import { api } from './index'

// 用户认证API
export const authApi = {
  // 用户登录
  login(data) {
    return api.post('/api/auth/login', data)
  },
  
  // 刷新token
  refreshToken() {
    return api.post('/api/auth/refresh')
  },
  
  // 获取用户信息
  getUserInfo() {
    return api.get('/api/auth/userinfo')
  },
  
  // 修改密码
  changePassword(data) {
    return api.post('/api/auth/change-password', data)
  },
  
  // 登出
  logout() {
    return api.post('/api/auth/logout')
  },

  // 用户管理相关API
  // 获取用户列表
  getUsers(params) {
    return api.get('/api/users', { params })
  },

  // 添加用户
  addUser(data) {
    return api.post('/api/users', data)
  },

  // 批量添加用户
  batchAddUsers(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload('/api/users/batch-import', formData)
  },

  // 更新用户
  updateUser(userId, data) {
    return api.put(`/api/users/${userId}`, data)
  },

  // 删除用户
  deleteUser(userId) {
    return api.delete(`/api/users/${userId}`)
  },

  // 重置用户密码
  resetUserPassword(userId) {
    return api.post(`/api/users/${userId}/reset-password`)
  },

  // 角色管理相关API
  // 获取角色列表
  getRoles() {
    return api.get('/api/roles')
  },

  // 添加角色
  addRole(data) {
    return api.post('/api/roles', data)
  },

  // 更新角色
  updateRole(roleId, data) {
    return api.put(`/api/roles/${roleId}`, data)
  },

  // 删除角色
  deleteRole(roleId) {
    return api.delete(`/api/roles/${roleId}`)
  }
} 