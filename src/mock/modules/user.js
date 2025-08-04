// 用户管理Mock数据
class UserMockData {
  constructor() {
    this.users = []
    this.roles = []
    this.initData()
  }

  initData() {
    // 初始化角色数据
    this.roles = [
      {
        id: 1,
        name: '管理员',
        description: '系统管理员，拥有所有权限',
        permissions: ['*'],
        is_default: true
      },
      {
        id: 2,
        name: '操作员',
        description: '普通操作员，可自定义权限',
        permissions: ['DeviceManagement', 'Detection', 'RecordingManagement'],
        is_default: true
      },
      {
        id: 3,
        name: '访客',
        description: '只读权限用户',
        permissions: ['Detection'],
        is_default: true
      }
    ]

    // 初始化用户数据
    const permissions = [
      'UserManagement', 'DeviceManagement', 'AlgorithmConfig', 
      'Detection', 'RecordingManagement', 'EventCenter', 
      'SystemConfig', 'StatisticsAnalysis', 'LogCenter'
    ]

    for (let i = 1; i <= 50; i++) {
      const roleIndex = Math.floor(Math.random() * this.roles.length)
      const role = this.roles[roleIndex]
      const status = Math.random() > 0.2 ? '启用' : '禁用'
      const createTime = new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000))
      const lastLogin = Math.random() > 0.3 ? new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) : null

      // 随机分配权限
      const userPermissions = []
      const numPermissions = Math.floor(Math.random() * permissions.length) + 1
      for (let j = 0; j < numPermissions; j++) {
        const randomPermission = permissions[Math.floor(Math.random() * permissions.length)]
        if (!userPermissions.includes(randomPermission)) {
          userPermissions.push(randomPermission)
        }
      }

      this.users.push({
        id: i,
        username: `user${i.toString().padStart(2, '0')}`,
        role: role.name,
        status: status,
        permissions: userPermissions,
        create_time: createTime.toLocaleString('zh-CN'),
        last_login: lastLogin ? lastLogin.toLocaleString('zh-CN') : '从未登录'
      })
    }
  }

  getAllUsers() {
    return [...this.users]
  }

  getUserById(id) {
    return this.users.find(user => user.id === id)
  }

  addUser(userData) {
    const newId = Math.max(0, ...this.users.map(u => u.id)) + 1
    const newUser = {
      id: newId,
      username: userData.username,
      role: userData.role,
      status: userData.status || '启用',
      permissions: userData.permissions || [],
      create_time: new Date().toLocaleString('zh-CN'),
      last_login: '从未登录'
    }
    this.users.unshift(newUser)
    return newUser
  }

  updateUser(id, userData) {
    const index = this.users.findIndex(user => user.id === id)
    if (index === -1) return false

    Object.assign(this.users[index], userData)
    return true
  }

  deleteUser(id) {
    const index = this.users.findIndex(user => user.id === id)
    if (index === -1) return false

    this.users.splice(index, 1)
    return true
  }

  getAllRoles() {
    return [...this.roles]
  }

  getRoleById(id) {
    return this.roles.find(role => role.id === id)
  }

  addRole(roleData) {
    const newId = Math.max(0, ...this.roles.map(r => r.id)) + 1
    const newRole = {
      id: newId,
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions || [],
      is_default: false
    }
    this.roles.push(newRole)
    return newRole
  }

  updateRole(id, roleData) {
    const index = this.roles.findIndex(role => role.id === id)
    if (index === -1) return false

    Object.assign(this.roles[index], roleData)
    return true
  }

  deleteRole(id) {
    const role = this.roles.find(r => r.id === id)
    if (!role || role.is_default) return false

    const index = this.roles.findIndex(role => role.id === id)
    this.roles.splice(index, 1)
    return true
  }
}

export const userMockData = new UserMockData()