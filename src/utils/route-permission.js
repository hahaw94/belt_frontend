/**
 * 路由权限检查工具
 * 用于路由守卫中的权限验证
 */

import { hasMenuPermission } from './menu-permissions'

/**
 * 清除所有认证数据
 */
export function clearAuthData() {
  // 清除 localStorage 中的认证信息
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
  
  console.log('已清除所有认证信息')
}

/**
 * 强制退出登录并跳转到登录页
 * @param {string} reason - 退出原因
 * @param {Function} next - 路由跳转函数
 */
export function forceLogout(reason = '权限验证失败', next) {
  console.log(`强制退出登录: ${reason}`)
  
  // 清除认证数据
  clearAuthData()
  
  // 显示提示信息
  if (typeof window !== 'undefined' && window.ElMessage) {
    window.ElMessage.error(`${reason}，请重新登录`)
  }
  
  // 跳转到登录页
  if (next) {
    next('/login')
  } else if (typeof window !== 'undefined' && window.location) {
    window.location.href = '/login'
  }
}

/**
 * 检查用户是否有访问指定路由的权限
 * @param {string} path - 路由路径
 * @param {Array} userPermissions - 用户权限列表
 * @returns {boolean} 是否有权限
 */
export function checkRoutePermission(path, userPermissions = []) {
  // 登录页面总是允许访问
  if (path === '/login') {
    return true
  }
  
  // 使用菜单权限检查函数
  return hasMenuPermission(path, userPermissions)
}

/**
 * 获取并验证用户认证信息
 * @returns {Object} 认证信息对象
 */
export function getAuthInfo() {
  const token = localStorage.getItem('token')
  const userInfoStr = localStorage.getItem('userInfo')
  
  let isValidAuth = false
  let parsedUserInfo = null
  
  if (token && userInfoStr && userInfoStr !== 'null' && userInfoStr !== 'undefined') {
    try {
      parsedUserInfo = JSON.parse(userInfoStr)
      isValidAuth = parsedUserInfo && 
                   parsedUserInfo.username && 
                   parsedUserInfo.id &&
                   Array.isArray(parsedUserInfo.permissions)
    } catch (error) {
      console.error('用户信息解析失败:', error)
    }
  }
  
  return {
    isValidAuth,
    userInfo: parsedUserInfo,
    token,
    permissions: parsedUserInfo?.permissions || []
  }
}

/**
 * 路由权限守卫主函数
 * @param {Object} to - 目标路由
 * @param {Object} from - 来源路由
 * @param {Function} next - 路由跳转函数
 */
export function routePermissionGuard(to, from, next) {
  const { isValidAuth, userInfo, permissions } = getAuthInfo()
  const isLoginPage = to.path === '/login'
  
  // 如果访问登录页面
  if (isLoginPage) {
    if (isValidAuth) {
      // 已经登录，重定向到首页
      console.log('已登录用户访问登录页，重定向到首页')
      next('/')
    } else {
      // 未登录，允许访问登录页
      next()
    }
    return
  }
  
  // 检查是否已登录
  if (!isValidAuth) {
    forceLogout('认证信息无效', next)
    return
  }
  
  // 检查路由权限
  if (!checkRoutePermission(to.path, permissions)) {
    console.log(`用户 ${userInfo.username} 尝试访问无权限的路由: ${to.path}`)
    forceLogout('您没有权限访问此页面', next)
    return
  }
  
  // 权限检查通过，允许访问
  console.log(`权限检查通过，允许访问路由: ${to.path}`)
  next()
}

export default {
  clearAuthData,
  forceLogout,
  checkRoutePermission,
  getAuthInfo,
  routePermissionGuard
}
