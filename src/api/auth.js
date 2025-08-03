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
  }
} 