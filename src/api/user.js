import { api } from './index'

// 用户管理API
export const userApi = {
  // 获取用户列表
  getUserList(params) {
    return api.get('/api/users', params)
  },

  // 添加用户
  addUser(data) {
    return api.post('/api/users', data)
  },

  // 批量添加用户
  batchAddUsers(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload('/api/users/batch', formData)
  },

  // 更新用户信息
  updateUser(userId, data) {
    return api.put(`/api/users/${userId}`, data)
  },

  // 删除用户
  deleteUser(userId) {
    return api.delete(`/api/users/${userId}`)
  },

  // 重置用户密码
  resetPassword(userId, data) {
    return api.post(`/api/users/${userId}/reset-password`, data)
  },

  // 获取角色列表
  getRoleList(params) {
    return api.get('/api/roles', params)
  },

  // 添加角色
  addRole(data) {
    return api.post('/api/roles', data)
  },

  // 更新角色权限
  updateRole(roleId, data) {
    return api.put(`/api/roles/${roleId}`, data)
  },

  // 删除角色
  deleteRole(roleId) {
    return api.delete(`/api/roles/${roleId}`)
  }
} 