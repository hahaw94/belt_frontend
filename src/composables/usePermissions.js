/**
 * 权限管理组合式函数
 * 提供权限检查的便捷方法
 */

import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { hasMenuPermission, hasAnyChildPermission, getAccessibleMenus } from '@/utils/menu-permissions'

/**
 * 权限管理 Hook
 * @returns {Object} 权限相关的方法和状态
 */
export function usePermissions() {
  const authStore = useAuthStore()
  
  // 获取当前用户权限列表
  const userPermissions = computed(() => {
    if (!authStore.userInfo || !authStore.userInfo.permissions) {
      return []
    }
    return authStore.userInfo.permissions
  })
  
  // 检查是否是超级管理员
  const isSuperAdmin = computed(() => {
    return userPermissions.value.some(p => 
      p === '*' || 
      p.permission_code === '*' || 
      p.permission_name === '超级管理员' ||
      p.permission_code === 'super_admin' ||
      p === 'super_admin'
    )
  })
  
  /**
   * 检查单个权限
   * @param {string} permission - 权限标识
   * @returns {boolean} 是否有权限
   */
  const hasPermission = (permission) => {
    return authStore.hasPermission(permission)
  }
  
  /**
   * 检查菜单访问权限
   * @param {string} path - 菜单路径
   * @returns {boolean} 是否有权限
   */
  const checkMenuPermission = (path) => {
    return hasMenuPermission(path, userPermissions.value)
  }
  
  /**
   * 检查子菜单访问权限
   * @param {string} parentPath - 父菜单路径
   * @returns {boolean} 是否有权限访问任一子菜单
   */
  const checkChildPermission = (parentPath) => {
    return hasAnyChildPermission(parentPath, userPermissions.value)
  }
  
  /**
   * 获取可访问的菜单列表
   * @returns {Array} 有权限的菜单路径列表
   */
  const getAccessibleMenuList = () => {
    return getAccessibleMenus(userPermissions.value)
  }
  
  /**
   * 检查多个权限（AND逻辑）
   * @param {Array} permissions - 权限数组
   * @returns {boolean} 是否拥有所有权限
   */
  const hasAllPermissions = (permissions = []) => {
    if (isSuperAdmin.value) return true
    return permissions.every(permission => hasPermission(permission))
  }
  
  /**
   * 检查多个权限（OR逻辑）
   * @param {Array} permissions - 权限数组
   * @returns {boolean} 是否拥有任一权限
   */
  const hasAnyPermission = (permissions = []) => {
    if (isSuperAdmin.value) return true
    return permissions.some(permission => hasPermission(permission))
  }
  
  /**
   * 权限指令 - 可在模板中使用
   * @param {string|Array} permission - 权限标识或权限数组
   * @param {string} logic - 逻辑关系 'and' | 'or'，默认 'or'
   * @returns {boolean} 是否有权限
   */
  const can = (permission, logic = 'or') => {
    if (typeof permission === 'string') {
      return hasPermission(permission)
    }
    
    if (Array.isArray(permission)) {
      return logic === 'and' 
        ? hasAllPermissions(permission)
        : hasAnyPermission(permission)
    }
    
    return false
  }
  
  return {
    // 状态
    userPermissions,
    isSuperAdmin,
    
    // 方法
    hasPermission,
    checkMenuPermission,
    checkChildPermission,
    getAccessibleMenuList,
    hasAllPermissions,
    hasAnyPermission,
    can
  }
}

/**
 * 权限检查装饰器
 * 用于页面组件的权限验证
 */
export function withPermission(permissions, options = {}) {
  const { 
    logic = 'or', 
    fallback = null,
    redirect = '/403' 
  } = options
  
  return (component) => {
    return {
      ...component,
      beforeRouteEnter(to, from, next) {
        const { can } = usePermissions()
        
        if (can(permissions, logic)) {
          next()
        } else {
          if (fallback && typeof fallback === 'function') {
            fallback(to, from, next)
          } else {
            next(redirect)
          }
        }
      }
    }
  }
}

export default usePermissions
