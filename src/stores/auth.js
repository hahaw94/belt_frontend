import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'

/**
 * 用户认证与管理Store
 * 功能：用户登录、用户管理、角色管理、权限控制
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('token') || '')
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
    return userInfo.value.permissions?.includes(permission) || userInfo.value.permissions?.includes('*')
  })
  const isAdmin = computed(() => userInfo.value?.role === '管理员')
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
      const response = await authApi.login(credentials)
      if (response.success) {
        token.value = response.body.token
        userInfo.value = response.body.user_info
        isLoggedIn.value = true
        
        // 存储到localStorage
        localStorage.setItem('token', token.value)
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  /**
   * 用户登出
   */
  const logout = () => {
    token.value = ''
    userInfo.value = null
    isLoggedIn.value = false
    
    // 清除localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  /**
   * 刷新Token
   */
  const refreshToken = async () => {
    try {
      const response = await authApi.refreshToken()
      if (response.success) {
        token.value = response.body.token
        localStorage.setItem('token', token.value)
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('Token刷新失败:', error)
      logout()
      throw error
    }
  }

  /**
   * 初始化用户信息（从localStorage恢复）
   */
  const initAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUserInfo = localStorage.getItem('userInfo')
    
    if (storedToken && storedUserInfo) {
      token.value = storedToken
      userInfo.value = JSON.parse(storedUserInfo)
      isLoggedIn.value = true
    }
  }

  /**
   * 获取用户列表
   * @param {Object} params - 查询参数
   */
  const fetchUsers = async (params = {}) => {
    try {
      const response = await authApi.getUsers(params)
      if (response.success) {
        users.value = response.body.users
        return response
      }
      throw new Error(response.message)
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
      const response = await authApi.addUser(userData)
      if (response.success) {
        // 重新获取用户列表
        await fetchUsers()
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('添加用户失败:', error)
      throw error
    }
  }

  /**
   * 批量添加用户
   * @param {File} file - Excel文件
   */
  const batchAddUsers = async (file) => {
    try {
      const response = await authApi.batchAddUsers(file)
      if (response.success) {
        // 重新获取用户列表
        await fetchUsers()
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('批量添加用户失败:', error)
      throw error
    }
  }

  /**
   * 更新用户信息
   * @param {number} userId - 用户ID
   * @param {Object} userData - 用户数据
   */
  const updateUser = async (userId, userData) => {
    try {
      const response = await authApi.updateUser(userId, userData)
      if (response.success) {
        // 更新本地用户列表
        const index = users.value.findIndex(user => user.id === userId)
        if (index !== -1) {
          users.value[index] = { ...users.value[index], ...userData }
        }
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('更新用户失败:', error)
      throw error
    }
  }

  /**
   * 删除用户
   * @param {number} userId - 用户ID
   */
  const deleteUser = async (userId) => {
    try {
      const response = await authApi.deleteUser(userId)
      if (response.success) {
        // 从本地列表移除
        users.value = users.value.filter(user => user.id !== userId)
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('删除用户失败:', error)
      throw error
    }
  }

  /**
   * 重置用户密码
   * @param {number} userId - 用户ID
   */
  const resetUserPassword = async (userId) => {
    try {
      const response = await authApi.resetUserPassword(userId)
      if (response.success) {
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('重置密码失败:', error)
      throw error
    }
  }

  /**
   * 获取角色列表
   */
  const fetchRoles = async () => {
    try {
      const response = await authApi.getRoles()
      if (response.success) {
        roles.value = response.body.roles
        return response
      }
      throw new Error(response.message)
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
      const response = await authApi.addRole(roleData)
      if (response.success) {
        // 重新获取角色列表
        await fetchRoles()
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('添加角色失败:', error)
      throw error
    }
  }

  /**
   * 更新角色权限
   * @param {number} roleId - 角色ID
   * @param {Object} roleData - 角色数据
   */
  const updateRole = async (roleId, roleData) => {
    try {
      const response = await authApi.updateRole(roleId, roleData)
      if (response.success) {
        // 更新本地角色列表
        const index = roles.value.findIndex(role => role.id === roleId)
        if (index !== -1) {
          roles.value[index] = { ...roles.value[index], ...roleData }
        }
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('更新角色失败:', error)
      throw error
    }
  }

  /**
   * 删除角色
   * @param {number} roleId - 角色ID
   */
  const deleteRole = async (roleId) => {
    try {
      const response = await authApi.deleteRole(roleId)
      if (response.success) {
        // 从本地列表移除
        roles.value = roles.value.filter(role => role.id !== roleId)
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('删除角色失败:', error)
      throw error
    }
  }

  return {
    // State
    token,
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
    
    // Actions
    login,
    logout,
    refreshToken,
    initAuth,
    fetchUsers,
    addUser,
    batchAddUsers,
    updateUser,
    deleteUser,
    resetUserPassword,
    fetchRoles,
    addRole,
    updateRole,
    deleteRole
  }
})