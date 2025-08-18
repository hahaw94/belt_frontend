import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const request = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? '' : (process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080'),
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
    
    // 根据后端响应格式处理 {code: 200, message: "success", data: {...}}
    if (res.code === 200) {
      // 成功响应，添加 success 标志以保持与前端 store 的兼容性
      return {
        code: res.code,
        success: true,
        message: res.message,
        data: res.data || {}
      }
    } else {
      // 显示错误消息
      ElMessage.error(res.message || '请求失败')
      
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
          message = '请求参数错误'
          break
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

// 默认导出request实例，以便其他地方使用
export default request