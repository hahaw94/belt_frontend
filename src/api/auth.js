import { api } from './index'

// 用户认证API - 对齐API文档v1接口
export const authApi = {
  // 用户登录
  login(data) {
    return api.post('/api/v1/auth/login', data)
  },
  
  // Token验证
  verifyToken() {
    return api.post('/api/v1/auth/verify')
  },
  
  // 刷新token
  refreshToken(refreshToken) {
    return api.post('/api/v1/auth/refresh', { refresh_token: refreshToken })
  },
  
  // 获取用户信息
  getUserInfo() {
    return api.get('/api/v1/auth/userinfo')
  },
  
  // 修改密码
  changePassword(data) {
    return api.put('/api/v1/auth/change-password', data)
  },
  
  // 登出
  logout() {
    return api.post('/api/v1/auth/logout')
  }
} 