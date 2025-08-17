// 用户管理和角色管理Mock数据
class UserMockData {
  constructor() {
    this.users = []
    this.roles = []
    this.permissions = []
    this.userRoleRelations = [] // 用户角色关联表
    this.rolePermissionRelations = [] // 角色权限关联表
    this.initData()
  }

  initData() {
    // 初始化权限数据
    this.permissions = [
      { id: 1, name: '用户管理', code: 'user:manage', description: '用户的增删改查管理' },
      { id: 2, name: '角色管理', code: 'role:manage', description: '角色的增删改查管理' },
      { id: 3, name: '设备管理', code: 'device:manage', description: '设备的增删改查管理' },
      { id: 4, name: '算法配置', code: 'algorithm:config', description: '算法配置管理' },
      { id: 5, name: '实时检测', code: 'detection:view', description: '查看实时检测数据' },
      { id: 6, name: '录像管理', code: 'recording:manage', description: '录像文件管理' },
      { id: 7, name: '事件中心', code: 'event:manage', description: '事件告警管理' },
      { id: 8, name: '系统配置', code: 'system:config', description: '系统参数配置' },
      { id: 9, name: '统计分析', code: 'statistics:view', description: '查看统计分析报表' },
      { id: 10, name: '日志中心', code: 'log:view', description: '查看系统日志' }
    ]

    // 初始化角色数据
    this.roles = [
      {
        id: 1,
        name: '超级管理员',
        description: '系统超级管理员，拥有所有权限',
        is_default: true,
        create_time: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN')
      },
      {
        id: 2,
        name: '管理员',
        description: '系统管理员，拥有大部分管理权限',
        is_default: true,
        create_time: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN')
      },
      {
        id: 3,
        name: '操作员',
        description: '普通操作员，可操作设备和查看数据',
        is_default: true,
        create_time: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN')
      },
      {
        id: 4,
        name: '访客',
        description: '只读权限用户，仅能查看部分数据',
        is_default: true,
        create_time: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN')
      }
    ]

    // 初始化角色权限关联
    this.rolePermissionRelations = [
      // 超级管理员 - 所有权限
      ...this.permissions.map(p => ({ roleId: 1, permissionId: p.id })),
      // 管理员 - 除系统配置外的所有权限
      { roleId: 2, permissionId: 1 }, { roleId: 2, permissionId: 2 }, { roleId: 2, permissionId: 3 },
      { roleId: 2, permissionId: 4 }, { roleId: 2, permissionId: 5 }, { roleId: 2, permissionId: 6 },
      { roleId: 2, permissionId: 7 }, { roleId: 2, permissionId: 9 }, { roleId: 2, permissionId: 10 },
      // 操作员 - 基本操作权限
      { roleId: 3, permissionId: 3 }, { roleId: 3, permissionId: 4 }, { roleId: 3, permissionId: 5 },
      { roleId: 3, permissionId: 6 }, { roleId: 3, permissionId: 7 },
      // 访客 - 只读权限
      { roleId: 4, permissionId: 5 }, { roleId: 4, permissionId: 9 }
    ]

    // 初始化用户数据
    const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二', '李明', '张伟', '王芳', '李娜', '张敏']
    const departments = ['技术部', '运营部', '安全部', '管理部', '监控中心']
    
    for (let i = 1; i <= 20; i++) {
      const nameIndex = (i - 1) % names.length
      const createTime = new Date(Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000))
      const lastLogin = Math.random() > 0.2 ? new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) : null
      const status = Math.random() > 0.15 ? 'active' : 'locked'

      this.users.push({
        id: i,
        username: `user${i.toString().padStart(2, '0')}`,
        email: `user${i}@company.com`,
        phone: `138${(1000 + i).toString().padStart(4, '0')}${(1000 + i * 2).toString().padStart(4, '0')}`,
        real_name: names[nameIndex],
        description: `${departments[i % departments.length]}成员`,
        status: status,
        create_time: createTime.toLocaleString('zh-CN'),
        last_login: lastLogin ? lastLogin.toLocaleString('zh-CN') : null
      })
    }

    // 初始化用户角色关联
    this.userRoleRelations = [
      // admin用户为超级管理员
      { userId: 1, roleId: 1 },
      // 其他用户随机分配角色
      ...Array.from({ length: 19 }, (_, i) => ({
        userId: i + 2,
        roleId: Math.floor(Math.random() * 3) + 2 // 角色2-4随机分配
      }))
    ]

    // 给部分用户分配多个角色
    for (let i = 5; i <= 8; i++) {
      if (Math.random() > 0.5) {
        this.userRoleRelations.push({
          userId: i,
          roleId: Math.floor(Math.random() * 2) + 3 // 额外的角色
        })
      }
    }
  }

  // ==================== 用户管理方法 ====================
  
  getAllUsers(page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    // 为每个用户添加角色信息
    const usersWithRoles = this.users.map(user => ({
      ...user,
      roles: this.getUserRoles(user.id)
    }))
    
    return {
      users: usersWithRoles.slice(start, end),
      total: this.users.length,
      page,
      page_size: pageSize
    }
  }

  getUserById(id) {
    const user = this.users.find(user => user.id === parseInt(id))
    if (!user) return null
    
    return {
      ...user,
      roles: this.getUserRoles(user.id)
    }
  }

  createUser(userData) {
    const newId = Math.max(0, ...this.users.map(u => u.id)) + 1
    const newUser = {
      id: newId,
      username: userData.username,
      email: userData.email,
      phone: userData.phone || '',
      real_name: userData.real_name,
      description: userData.description || '',
      status: 'active',
      create_time: new Date().toLocaleString('zh-CN'),
      last_login: null
    }
    this.users.unshift(newUser)
    return newUser
  }

  updateUser(id, userData) {
    const index = this.users.findIndex(user => user.id === parseInt(id))
    if (index === -1) return false

    // 不允许更新的字段
    // eslint-disable-next-line no-unused-vars
    const { id: _, create_time, last_login, ...updateData } = userData
    Object.assign(this.users[index], updateData)
    return this.users[index]
  }

  deleteUser(id) {
    const index = this.users.findIndex(user => user.id === parseInt(id))
    if (index === -1) return false

    // 删除用户及其角色关联
    this.users.splice(index, 1)
    this.userRoleRelations = this.userRoleRelations.filter(rel => rel.userId !== parseInt(id))
    return true
  }

  batchDeleteUsers(userIds) {
    let deletedCount = 0
    userIds.forEach(id => {
      if (this.deleteUser(id)) {
        deletedCount++
      }
    })
    return deletedCount
  }

  lockUser(id) {
    return this.updateUser(id, { status: 'locked' })
  }

  unlockUser(id) {
    return this.updateUser(id, { status: 'active' })
  }

  resetUserPassword(id) {
    // 模拟密码重置，实际不存储密码
    const user = this.getUserById(id)
    return user ? true : false
  }

  // ==================== 角色管理方法 ====================
  
  getAllRoles(page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    // 为每个角色添加权限信息
    const rolesWithPermissions = this.roles.map(role => ({
      ...role,
      permissions: this.getRolePermissions(role.id)
    }))
    
    return {
      roles: rolesWithPermissions.slice(start, end),
      total: this.roles.length,
      page,
      page_size: pageSize
    }
  }

  getRoleById(id) {
    const role = this.roles.find(role => role.id === parseInt(id))
    if (!role) return null
    
    return {
      ...role,
      permissions: this.getRolePermissions(role.id)
    }
  }

  createRole(roleData) {
    const newId = Math.max(0, ...this.roles.map(r => r.id)) + 1
    const newRole = {
      id: newId,
      name: roleData.name,
      description: roleData.description,
      is_default: false,
      create_time: new Date().toLocaleString('zh-CN')
    }
    this.roles.push(newRole)
    return newRole
  }

  updateRole(id, roleData) {
    const index = this.roles.findIndex(role => role.id === parseInt(id))
    if (index === -1) return false

    // eslint-disable-next-line no-unused-vars
    const { id: _, create_time, is_default, ...updateData } = roleData
    Object.assign(this.roles[index], updateData)
    return this.roles[index]
  }

  deleteRole(id) {
    const role = this.roles.find(r => r.id === parseInt(id))
    if (!role || role.is_default) return false

    const index = this.roles.findIndex(role => role.id === parseInt(id))
    this.roles.splice(index, 1)
    
    // 删除相关的用户角色关联和角色权限关联
    this.userRoleRelations = this.userRoleRelations.filter(rel => rel.roleId !== parseInt(id))
    this.rolePermissionRelations = this.rolePermissionRelations.filter(rel => rel.roleId !== parseInt(id))
    return true
  }

  // ==================== 用户角色关联方法 ====================
  
  getUserRoles(userId) {
    const userRoleIds = this.userRoleRelations
      .filter(rel => rel.userId === parseInt(userId))
      .map(rel => rel.roleId)
    
    return this.roles.filter(role => userRoleIds.includes(role.id))
  }

  assignUserRole(userId, roleId) {
    // 检查是否已存在关联
    const exists = this.userRoleRelations.some(
      rel => rel.userId === parseInt(userId) && rel.roleId === parseInt(roleId)
    )
    
    if (!exists) {
      this.userRoleRelations.push({
        userId: parseInt(userId),
        roleId: parseInt(roleId)
      })
    }
    return true
  }

  removeUserRole(userId, roleId) {
    this.userRoleRelations = this.userRoleRelations.filter(
      rel => !(rel.userId === parseInt(userId) && rel.roleId === parseInt(roleId))
    )
    return true
  }

  // ==================== 权限管理方法 ====================
  
  getAllPermissions() {
    return this.permissions
  }

  getRolePermissions(roleId) {
    const permissionIds = this.rolePermissionRelations
      .filter(rel => rel.roleId === parseInt(roleId))
      .map(rel => rel.permissionId)
    
    return this.permissions.filter(permission => permissionIds.includes(permission.id))
  }

  setRolePermissions(roleId, permissionIds) {
    // 删除角色的所有权限关联
    this.rolePermissionRelations = this.rolePermissionRelations.filter(
      rel => rel.roleId !== parseInt(roleId)
    )
    
    // 添加新的权限关联
    permissionIds.forEach(permissionId => {
      this.rolePermissionRelations.push({
        roleId: parseInt(roleId),
        permissionId: parseInt(permissionId)
      })
    })
    return true
  }

  addRolePermission(roleId, permissionId) {
    const exists = this.rolePermissionRelations.some(
      rel => rel.roleId === parseInt(roleId) && rel.permissionId === parseInt(permissionId)
    )
    
    if (!exists) {
      this.rolePermissionRelations.push({
        roleId: parseInt(roleId),
        permissionId: parseInt(permissionId)
      })
    }
    return true
  }

  removeRolePermission(roleId, permissionId) {
    this.rolePermissionRelations = this.rolePermissionRelations.filter(
      rel => !(rel.roleId === parseInt(roleId) && rel.permissionId === parseInt(permissionId))
    )
    return true
  }
}

export const userMockData = new UserMockData()