import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const request = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 根据API文档的响应格式处理
    if (res.error === 0) {
      return res
    } else {
      // 显示错误消息
      ElMessage.error(res.message || '请求失败')
      
      // 处理特定错误码
      switch (res.error) {
        case 1001:
          ElMessage.error('参数错误，请检查请求参数格式和必填项')
          break
        case 1002:
          // 认证失败，跳转登录页
          ElMessage.error('认证失败，请重新登录')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 1003:
          // 权限不足
          ElMessage.error('权限不足，请联系管理员分配相应权限')
          break
        case 2001:
          ElMessage.error('用户不存在，请检查用户ID是否正确')
          break
        case 2002:
          ElMessage.error('用户名已存在，请使用其他用户名')
          break
        case 2003:
          ElMessage.error('密码错误，请输入正确的密码')
          break
        case 2004:
          ElMessage.error('角色不存在，请检查角色ID是否正确')
          break
        case 2005:
          ElMessage.error('默认角色无法删除，只能删除自定义角色')
          break
        case 3001:
          ElMessage.error('设备不存在，请检查设备ID是否正确')
          break
        case 3002:
          ElMessage.error('设备离线，请检查设备网络连接')
          break
        case 3003:
          ElMessage.error('设备编号已存在，请使用其他设备编号')
          break
        case 3004:
          ElMessage.error('设备协议配置错误，请检查协议参数配置')
          break
        case 4001:
          ElMessage.error('算法文件格式错误，请上传正确格式的算法文件')
          break
        case 4002:
          ElMessage.error('算法下发失败，请检查目标分析卡状态')
          break
        case 4003:
          ElMessage.error('算法模型数量超限，每个算法最多存储5个模型')
          break
        case 5001:
          ElMessage.error('报警事件不存在，请检查报警ID是否正确')
          break
        case 5002:
          ElMessage.error('录像文件不存在，请检查录像ID是否正确')
          break
        case 5003:
          ElMessage.error('联动规则配置错误，请检查联动规则参数')
          break
        case 6001:
          ElMessage.error('文件上传失败，请检查文件格式和大小限制')
          break
        case 6002:
          ElMessage.error('系统升级失败，请检查升级包完整性')
          break
        case 6003:
          ElMessage.error('备份创建失败，请检查存储空间是否充足')
          break
        case 7001:
          ElMessage.error('WebSocket连接失败，请检查网络连接和认证信息')
          break
        case 7002:
          ElMessage.error('推送服务不可用，请联系技术支持')
          break
        case 9999:
          ElMessage.error('系统内部错误，请联系技术支持')
          break
        default:
          ElMessage.error(res.message || '未知错误')
          break
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  error => {
    console.error('响应错误:', error)
    
    // 处理网络错误
    if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请重试')
    } else if (error.response) {
      const status = error.response.status
      switch (status) {
        case 400:
          ElMessage.error('请求参数错误')
          break
        case 401:
          ElMessage.error('未授权，请重新登录')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求地址不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(`连接错误: ${status}`)
      }
    } else {
      ElMessage.error('网络连接失败')
    }
    
    return Promise.reject(error)
  }
)

// 封装通用请求方法
export const api = {
  // GET请求
  get(url, params = {}) {
    return request.get(url, { params })
  },
  
  // POST请求
  post(url, data = {}) {
    return request.post(url, data)
  },
  
  // PUT请求
  put(url, data = {}) {
    return request.put(url, data)
  },
  
  // DELETE请求
  delete(url, params = {}) {
    return request.delete(url, { params })
  },
  
  // 文件上传请求
  upload(url, formData) {
    return request.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 文件下载请求
  download(url, params = {}) {
    return request.get(url, {
      params,
      responseType: 'blob'
    })
  }
}

// Mock拦截器配置
if (process.env.NODE_ENV === 'development') {
  const { setupMock } = require('../mock')
  setupMock(request)
}

export default request 