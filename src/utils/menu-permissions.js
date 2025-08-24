/**
 * 菜单权限配置
 * 定义每个菜单项对应的权限标识
 */

// 菜单权限映射配置
export const MENU_PERMISSIONS = {
  // 首页/总览 - 所有用户都能访问
  '/dashboard': [],
  
  // 系统配置
  '/system-config': ['system:config'], // 系统配置主菜单权限
  '/system-config/basic-management': ['system:config'],
  '/system-config/version-management': ['system:config'],
  '/system-config/map-management': ['system:config'],
  
  // 算法管理
  '/algorithm': ['module:algorithm'], // 算法管理主菜单权限
  '/algorithm/upload': ['module:algorithm'],
  '/algorithm/config': ['module:algorithm'],
  
  // 用户管理
  '/usermanagement': ['module:user'], // 用户管理主菜单权限
  '/usermanagement/user-management-manage': ['module:user'],
  '/usermanagement/role-management': ['module:user'],
  
  // 接入管理
  '/access': ['module:access'], // 接入管理主菜单权限
  '/access/device': ['module:access'],
  '/access/info': ['module:access'],
  '/access/protocol': ['module:access'],
  
  // 实时检测
  '/detection': ['module:monitor'], // 实时检测主菜单权限
  '/detection/realtime': ['module:monitor'],
  '/detection/playback': ['module:monitor'],
  
  // 录像管理
  '/recording': ['module:video'], // 录像管理主菜单权限
  '/recording/list': ['module:video'],
  '/recording/statistics': ['module:video'],
  
  // 事件中心
  '/event': ['module:event'], // 事件中心主菜单权限
  '/event/alarm-display': ['module:event'],
  '/event/data-collection': ['module:event'],
  '/event/immediate-command': ['module:event'],
  '/event/linkage-settings': ['module:event'],
  '/event/warning-push': ['module:event'],
  
  // 日志中心
  '/log': ['module:log'],
  
  // 统计分析
  '/statistics': ['module:statistics']
}

/**
 * 检查用户是否有访问指定路径的权限
 * @param {string} path - 路径
 * @param {Array} userPermissions - 用户权限列表
 * @returns {boolean} 是否有权限
 */
export function hasMenuPermission(path, userPermissions = []) {
  // 如果没有配置权限要求，默认允许访问
  if (!MENU_PERMISSIONS[path]) {
    return true
  }
  
  const requiredPermissions = MENU_PERMISSIONS[path]
  
  // 如果不需要任何权限，允许访问
  if (requiredPermissions.length === 0) {
    return true
  }
  
  // 确保 userPermissions 是数组
  if (!Array.isArray(userPermissions)) {
    return false
  }
  
  // 超级管理员权限，允许访问所有功能
  if (userPermissions.some(p => 
    p === '*' || 
    p.permission_code === '*' || 
    p.permission_name === '超级管理员' ||
    p.permission_code === 'super_admin' ||
    p === 'super_admin'
  )) {
    return true
  }
  
  // 检查用户是否拥有所需的任一权限（OR逻辑）
  return requiredPermissions.some(permission => 
    userPermissions.some(userPerm => {
      if (typeof userPerm === 'string') {
        return userPerm === permission
      }
      if (typeof userPerm === 'object' && userPerm !== null) {
        return userPerm.permission_code === permission || 
               userPerm.permission_name === permission
      }
      return false
    })
  )
}

/**
 * 检查用户是否有访问子菜单的权限
 * @param {string} parentPath - 父菜单路径
 * @param {Array} userPermissions - 用户权限列表
 * @returns {boolean} 是否有权限访问任一子菜单
 */
export function hasAnyChildPermission(parentPath, userPermissions = []) {
  // 超级管理员权限，允许访问所有功能
  if (userPermissions.some(p => 
    p === '*' || 
    p.permission_code === '*' || 
    p.permission_name === '超级管理员' ||
    p.permission_code === 'super_admin' ||
    p === 'super_admin'
  )) {
    return true
  }
  
  // 获取所有以父路径开头的子菜单
  const childPaths = Object.keys(MENU_PERMISSIONS).filter(path => 
    path.startsWith(parentPath + '/') && path !== parentPath
  )
  
  // 如果没有子菜单，检查父菜单权限
  if (childPaths.length === 0) {
    return hasMenuPermission(parentPath, userPermissions)
  }
  
  // 检查是否有任一子菜单的权限
  return childPaths.some(childPath => hasMenuPermission(childPath, userPermissions))
}

/**
 * 获取用户有权限访问的菜单列表
 * @param {Array} userPermissions - 用户权限列表
 * @returns {Array} 有权限的菜单路径列表
 */
export function getAccessibleMenus(userPermissions = []) {
  return Object.keys(MENU_PERMISSIONS).filter(path => 
    hasMenuPermission(path, userPermissions)
  )
}

/**
 * 菜单显示名称映射
 */
export const MENU_TITLES = {
  '/dashboard': '首页/总览',
  '/system-config': '系统配置',
  '/system-config/basic-management': '基础管理',
  '/system-config/version-management': '版本管理',
  '/system-config/map-management': '地图管理',
  '/algorithm': '算法管理',
  '/algorithm/upload': '算法仓',
  '/algorithm/config': '算法配置',
  '/usermanagement': '用户管理',
  '/usermanagement/user-management-manage': '用户列表',
  '/usermanagement/role-management': '角色列表',
  '/access': '接入管理',
  '/access/device': '设备管理',
  '/access/info': '设备信息',
  '/access/protocol': '设备接入协议',
  '/detection': '实时检测',
  '/detection/realtime': '实时画面',
  '/detection/playback': '录像回放',
  '/recording': '录像管理',
  '/recording/list': '录像列表',
  '/recording/statistics': '录像统计',
  '/event': '事件中心',
  '/event/alarm-display': '告警信息展示',
  '/event/data-collection': '告警数据收集',
  '/event/immediate-command': '即时告警批示',
  '/event/linkage-settings': '告警联动设置',
  '/event/warning-push': '预警推送',
  '/log': '日志中心',
  '/statistics': '统计分析'
}
