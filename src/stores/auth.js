import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import { userApi, roleApi } from '@/api/user'

/**
 * 用户认证与管理Store
 * 功能：用户登录、用户管理、角色管理、权限控制
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('token') || '')
  const refreshToken = ref(localStorage.getItem('refreshToken') || '')
  const userInfo = ref(null)
  const isLoggedIn = ref(false)
  const users = ref([])
  const roles = ref([])
  const permissions = ref([])
  const currentUser = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && isLoggedIn.value)
  const hasPermission = computed(() => (permission) => {
    if (!userInfo.value) return false
    const permissions = userInfo.value.permissions || []
    // 支持超级管理员权限
    if (permissions.some(p => p === '*' || p.permission_code === '*' || p.permission_name === '超级管理员')) {
      return true
    }
    // 检查权限数组中是否包含指定权限
    return permissions.some(p => 
      p === permission || 
      p.permission_code === permission || 
      p.permission_name === permission ||
      (typeof p === 'string' && p === permission)
    )
  })
  const isAdmin = computed(() => userInfo.value?.roles?.includes('管理员') || userInfo.value?.roles?.includes('超级管理员'))
  const username = computed(() => userInfo.value?.username || '')

  // Actions
  /**
   * 用户登录
   * @param {Object} credentials - 登录凭据
   * @param {string} credentials.username - 用户名
   * @param {string} credentials.password - 密码
   */
  const login = async (credentials) => {
    try {
      console.log('正在登录...', { username: credentials.username })
      const response = await authApi.login(credentials)
      console.log('登录API响应:', response)
      
      if (response.code === 200 && response.success) {
        // 后端返回的字段名称：access_token, refresh_token, user_info
        token.value = response.data.access_token
        refreshToken.value = response.data.refresh_token
        userInfo.value = response.data.user_info
        isLoggedIn.value = true
        
        console.log('登录成功，存储认证信息:', {
          token: token.value ? '已设置' : '未设置',
          userInfo: userInfo.value
        })
        
        // 存储到localStorage
        localStorage.setItem('token', token.value)
        localStorage.setItem('refreshToken', refreshToken.value)
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
        
        return response
      }
      throw new Error(response.message || '登录失败')
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  /**
   * 用户登出
   */
  const logout = async () => {
    console.log('开始用户登出流程')
    try {
      // 如果有token，调用后端登出接口
      if (token.value) {
        await authApi.logout()
        console.log('后端登出请求成功')
      }
    } catch (error) {
      console.warn('登出请求失败:', error)
    } finally {
      // 无论后端请求是否成功，都要清除本地认证信息
      clearAuthStorage()
      
      // 验证清除结果
      console.log('登出完成，当前认证状态:', {
        token: token.value,
        isLoggedIn: isLoggedIn.value,
        userInfo: userInfo.value,
        isAuthenticated: isAuthenticated.value
      })
    }
  }

  /**
   * 刷新Token
   */
  const refreshAuthToken = async () => {
    try {
      const response = await authApi.refreshToken(refreshToken.value)
      if (response.code === 200 && response.success) {
        // 后端返回的字段名称：access_token, refresh_token
        token.value = response.data.access_token
        refreshToken.value = response.data.refresh_token
        localStorage.setItem('token', token.value)
        localStorage.setItem('refreshToken', refreshToken.value)
        return response
      }
      throw new Error(response.message || 'Token刷新失败')
    } catch (error) {
      console.error('Token刷新失败:', error)
      clearAuthStorage()
      throw error
    }
  }

  /**
   * 初始化用户信息（从localStorage恢复）
   */
  const initAuth = () => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedRefreshToken = localStorage.getItem('refreshToken')
      const storedUserInfo = localStorage.getItem('userInfo')
      
      if (storedToken && storedRefreshToken && storedUserInfo && storedUserInfo !== 'undefined') {
        token.value = storedToken
        refreshToken.value = storedRefreshToken
        userInfo.value = JSON.parse(storedUserInfo)
        isLoggedIn.value = true
      } else {
        // 如果数据不完整或无效，清除所有存储的认证信息
        clearAuthStorage()
      }
    } catch (error) {
      console.error('初始化认证信息失败:', error)
      // 如果解析失败，清除所有存储的认证信息
      clearAuthStorage()
    }
  }

  /**
   * 清除认证相关的localStorage数据
   */
  const clearAuthStorage = () => {
    console.log('清除所有认证信息')
    
    // 清除localStorage中的认证信息
    const keysToRemove = [
      'token',
      'refreshToken', 
      'userInfo',
      'user',
      'currentUser',
      'authToken'
    ]
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    // 重置store状态
    token.value = ''
    refreshToken.value = ''
    userInfo.value = null
    isLoggedIn.value = false
    users.value = []
    roles.value = []
    permissions.value = []
    currentUser.value = null
    
    console.log('认证信息清除完成')
  }

  /**
   * 验证Token有效性
   */
  const verifyToken = async () => {
    try {
      const response = await authApi.verifyToken()
      if (response.code === 200 && response.success) {
        userInfo.value = response.data.userInfo
        return response
      }
      throw new Error(response.message || 'Token验证失败')
    } catch (error) {
      console.error('Token验证失败:', error)
      clearAuthStorage()
      throw error
    }
  }

  /**
   * 获取当前用户信息
   */
  const getCurrentUserInfo = async () => {
    try {
      const response = await authApi.getUserInfo()
      if (response.code === 200 && response.success) {
        userInfo.value = response.data
        return response
      }
      throw new Error(response.message || '获取用户信息失败')
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  /**
   * 获取用户列表
   * @param {Object} params - 查询参数
   */
  const fetchUsers = async (params = {}) => {
    try {
      const response = await userApi.getUserList(params)
      if (response.code === 200 && response.success) {
        users.value = response.data.list || []
        return response
      }
      throw new Error(response.message || '获取用户列表失败')
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw error
    }
  }

  /**
   * 添加用户
   * @param {Object} userData - 用户数据
   */
  const addUser = async (userData) => {
    try {
      const response = await userApi.createUser(userData)
      if (response.code === 200 && response.success) {
        // 重新获取用户列表
        await fetchUsers()
        return response
      }
      throw new Error(response.message || '添加用户失败')
    } catch (error) {
      console.error('添加用户失败:', error)
      throw error
    }
  }

  /**
   * 批量删除用户
   * @param {Array} userIds - 用户ID数组
   */
  const batchDeleteUsers = async (userIds) => {
    try {
      const response = await userApi.batchDeleteUsers(userIds)
      if (response.code === 200 && response.success) {
        // 重新获取用户列表
        await fetchUsers()
        return response
      }
      throw new Error(response.message || '批量删除用户失败')
    } catch (error) {
      console.error('批量删除用户失败:', error)
      throw error
    }
  }

  /**
   * 更新用户信息
   * @param {string} userId - 用户ID
   * @param {Object} userData - 用户数据
   */
  const updateUser = async (userId, userData) => {
    try {
      const response = await userApi.updateUser(userId, userData)
      if (response.code === 200 && response.success) {
        // 更新本地用户列表
        const index = users.value.findIndex(user => user.userId === userId)
        if (index !== -1) {
          users.value[index] = { ...users.value[index], ...response.data }
        }
        return response
      }
      throw new Error(response.message || '更新用户失败')
    } catch (error) {
      console.error('更新用户失败:', error)
      throw error
    }
  }

  /**
   * 删除用户
   * @param {string} userId - 用户ID
   */
  const deleteUser = async (userId) => {
    try {
      const response = await userApi.deleteUser(userId)
      if (response.code === 200 && response.success) {
        // 从本地列表移除
        users.value = users.value.filter(user => user.userId !== userId)
        return response
      }
      throw new Error(response.message || '删除用户失败')
    } catch (error) {
      console.error('删除用户失败:', error)
      throw error
    }
  }

  /**
   * 锁定用户
   * @param {string} userId - 用户ID
   * @param {string} reason - 锁定原因
   */
  const lockUser = async (userId, reason) => {
    try {
      const response = await userApi.lockUser(userId, reason)
      if (response.code === 200 && response.success) {
        // 重新获取用户列表
        await fetchUsers()
        return response
      }
      throw new Error(response.message || '锁定用户失败')
    } catch (error) {
      console.error('锁定用户失败:', error)
      throw error
    }
  }

  /**
   * 解锁用户
   * @param {string} userId - 用户ID
   */
  const unlockUser = async (userId) => {
    try {
      const response = await userApi.unlockUser(userId)
      if (response.code === 200 && response.success) {
        // 重新获取用户列表
        await fetchUsers()
        return response
      }
      throw new Error(response.message || '解锁用户失败')
    } catch (error) {
      console.error('解锁用户失败:', error)
      throw error
    }
  }

  /**
   * 重置用户密码
   * @param {string} userId - 用户ID
   * @param {string} newPassword - 新密码
   */
  const resetUserPassword = async (userId, newPassword) => {
    try {
      const response = await userApi.resetPassword(userId, newPassword)
      if (response.code === 200 && response.success) {
        return response
      }
      throw new Error(response.message || '重置密码失败')
    } catch (error) {
      console.error('重置密码失败:', error)
      throw error
    }
  }

  /**
   * 获取角色列表
   * @param {Object} params - 查询参数
   */
  const fetchRoles = async (params = {}) => {
    try {
      const response = await roleApi.getRoleList(params)
      if (response.code === 200 && response.success) {
        roles.value = response.data.list || []
        return response
      }
      throw new Error(response.message || '获取角色列表失败')
    } catch (error) {
      console.error('获取角色列表失败:', error)
      throw error
    }
  }

  /**
   * 添加角色
   * @param {Object} roleData - 角色数据
   */
  const addRole = async (roleData) => {
    try {
      const response = await roleApi.createRole(roleData)
      if (response.code === 200 && response.success) {
        // 重新获取角色列表
        await fetchRoles()
        return response
      }
      throw new Error(response.message || '添加角色失败')
    } catch (error) {
      console.error('添加角色失败:', error)
      throw error
    }
  }

  /**
   * 更新角色信息
   * @param {string} roleId - 角色ID
   * @param {Object} roleData - 角色数据
   */
  const updateRole = async (roleId, roleData) => {
    try {
      const response = await roleApi.updateRole(roleId, roleData)
      if (response.code === 200 && response.success) {
        // 更新本地角色列表
        const index = roles.value.findIndex(role => role.roleId === roleId)
        if (index !== -1) {
          roles.value[index] = { ...roles.value[index], ...response.data }
        }
        return response
      }
      throw new Error(response.message || '更新角色失败')
    } catch (error) {
      console.error('更新角色失败:', error)
      throw error
    }
  }

  /**
   * 删除角色
   * @param {string} roleId - 角色ID
   */
  const deleteRole = async (roleId) => {
    try {
      const response = await roleApi.deleteRole(roleId)
      if (response.code === 200 && response.success) {
        // 从本地列表移除
        roles.value = roles.value.filter(role => role.roleId !== roleId)
        return response
      }
      throw new Error(response.message || '删除角色失败')
    } catch (error) {
      console.error('删除角色失败:', error)
      throw error
    }
  }

  /**
   * 获取权限列表
   * @param {Object} params - 查询参数
   */
  const fetchPermissions = async (params = {}) => {
    try {
      const response = await roleApi.getPermissionList(params)
      if (response.code === 200 && response.success) {
        permissions.value = response.data.list || []
        return response
      }
      throw new Error(response.message || '获取权限列表失败')
    } catch (error) {
      console.error('获取权限列表失败:', error)
      throw error
    }
  }

  return {
    // State
    token,
    refreshToken,
    userInfo,
    isLoggedIn,
    users,
    roles,
    permissions,
    currentUser,
    
    // Getters
    isAuthenticated,
    hasPermission,
    isAdmin,
    username,
    
    // Auth Actions
    login,
    logout,
    refreshAuthToken,
    verifyToken,
    initAuth,
    getCurrentUserInfo,
    
    // User Management Actions
    fetchUsers,
    addUser,
    batchDeleteUsers,
    updateUser,
    deleteUser,
    lockUser,
    unlockUser,
    resetUserPassword,
    
    // Role Management Actions
    fetchRoles,
    addRole,
    updateRole,
    deleteRole,
    fetchPermissions
  }
})