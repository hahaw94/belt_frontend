import axios from 'axios'
import { ElMessage } from 'element-plus'

// 获取当前页面的baseURL，用于API请求
const getCurrentBaseURL = () => {
  if (process.env.NODE_ENV === 'development') {
    // 开发环境下使用空字符串，依赖代理配置
    return ''
  }
  
  // 在生产环境中，使用当前浏览器的地址作为baseURL
  const currentOrigin = window.location.origin
  return process.env.VUE_APP_API_BASE_URL || currentOrigin
}

// 创建axios实例
const request = axios.create({
  baseURL: getCurrentBaseURL(),
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
    
    console.log('API响应原始数据:', {
      url: response.config?.url,
      status: response.status,
      data: res
    })
    
    // 检查是否是文件下载响应（blob类型）
    if (res instanceof Blob) {
      return response // 直接返回原始响应，保留blob数据
    }
    
    // 根据后端响应格式处理，支持多种格式：
    // 1. {code: 0, message: "success", data: {...}} (标准格式，code=0表示成功)
    // 2. {code: 200, message: "success", data: {...}, total?, page?, size?}
    // 3. {error: 0, body: {...}, message: "...", success: true} (Mock格式)
    if (res.code === 0 || res.code === 200 || res.error === 0) {
      // 成功响应，保留完整的响应信息包括分页数据
      return {
        code: res.code === 0 ? 0 : (res.code || 200),
        success: true,
        message: res.message,
        data: res.data || {},
        // 处理Mock格式的body字段
        body: res.body || res.data || {},
        // 保留分页信息
        total: res.total,
        page: res.page,
        size: res.size,
        current_page: res.current_page,
        per_page: res.per_page,
        totalCount: res.totalCount,
        pageSize: res.pageSize
      }
    } else {
      // 检查消息内容，如果包含"成功"字样，使用成功提示，否则使用错误提示
      const message = res.message || '请求失败'
      if (message.includes('成功')) {
        ElMessage.success(message)
      } else {
        ElMessage.error(message)
      }
      
      // 处理特定错误码
      switch (res.code) {
        case 400:
          break
        case 401:
          // 认证失败，跳转登录页
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('userInfo')
          // 避免无限循环，只有不在登录页时才跳转
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
        case 403:
          break
        case 404:
          break
        case 500:
          break
        default:
          break
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  error => {
    console.error('响应错误:', error)
    
    // 处理HTTP状态码错误
    if (error.response) {
      const { status, data } = error.response
      let message = data?.message || '请求失败'
      
      switch (status) {
        case 400:
          // 不显示弹窗，静默处理400错误
          return Promise.reject(error)
        case 401:
          message = '未授权，请重新登录'
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('userInfo')
          // 避免无限循环，只有不在登录页时才跳转
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
        case 403:
          message = '权限不足'
          break
        case 404:
          message = '资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        default:
          message = `请求失败 (${status})`
      }
      
      ElMessage.error(message)
    } else if (error.request) {
      console.error('网络请求详情:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout
      })
      ElMessage.error('网络错误，请检查网络连接。详情请查看控制台。')
    } else {
      console.error('请求配置错误详情:', error.message)
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

// 封装通用请求方法
export const api = {
  // GET请求
  get(url, config = {}) {
    // 如果config已经是一个包含params的配置对象，直接使用
    if (config.params) {
      return request.get(url, config)
    }
    // 否则将config作为params使用（向后兼容）
    return request.get(url, { params: config })
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
    // 如果params包含data属性，则作为请求体发送
    if (params.data) {
      return request.delete(url, { data: params.data })
    }
    // 否则作为查询参数发送
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
      responseType: 'blob' // 重要：设置响应类型为blob
    })
  }
}

// 动态更新baseURL的方法
export const updateBaseURL = (newPort) => {
  if (process.env.NODE_ENV === 'development') {
    // 开发环境下，API请求通过代理，需要重启开发服务器才能生效
    console.warn('开发环境检测到端口变更，需要重启前端开发服务器才能生效')
    ElMessage.warning('开发环境下端口已修改，请重启前端开发服务器 (npm run serve) 以应用新的代理配置')
    return ''
  }
  
  // 生产环境下构建新的baseURL
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const newBaseURL = `${protocol}//${hostname}:${newPort}`
  
  // 更新axios实例的baseURL
  request.defaults.baseURL = newBaseURL
  
  console.log('API baseURL已更新为:', newBaseURL)
  return newBaseURL
}

// 获取当前baseURL的方法
export const getAxiosBaseURL = () => {
  return request.defaults.baseURL
}

// Mock拦截器配置
if (process.env.NODE_ENV === 'development') {
  const { setupMock } = require('../mock')
  setupMock(request)
}

// 默认导出request实例，以便其他地方使用
export default request