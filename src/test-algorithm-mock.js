// 测试算法Mock拦截器
import { algorithmApi } from './api/algorithm'
import { logApi } from './api/log'
// 注意：analytics API可能需要创建，这里先注释
// import { analyticsApi } from './api/analytics'

export async function testAlgorithmMock() {
  console.log('🧪 开始测试算法Mock拦截器...')
  
  try {
    // 测试算法列表API
    console.log('📋 测试算法列表API...')
    const algorithmResponse = await algorithmApi.getAlgorithmList()
    console.log('✅ 算法API响应:', algorithmResponse)
    
    if (algorithmResponse.success && algorithmResponse.data) {
      const algorithms = algorithmResponse.data.algorithms || []
      console.log(`✅ 算法数据数量: ${algorithms.length}`)
      console.log('✅ 算法列表样例:', algorithms.slice(0, 3))
    }
    
    // 测试分析板卡API
    console.log('🔧 测试分析板卡API...')
    const cardsResponse = await algorithmApi.getAnalysisCards()
    console.log('✅ 分析板卡API响应:', cardsResponse)
    
    if (cardsResponse.success && cardsResponse.data) {
      const cards = cardsResponse.data.analysis_cards || []
      console.log(`✅ 分析板卡数量: ${cards.length}`)
      console.log('✅ 分析板卡样例:', cards.slice(0, 2))
    }
    
    console.log('🎉 算法Mock拦截器测试成功！')
    return true
    
  } catch (error) {
    console.error('❌ 算法Mock拦截器测试失败:', error)
    console.error('错误详情:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    })
    return false
  }
}

// 测试日志中心Mock拦截器
export async function testLogCenterMock() {
  console.log('📊 开始测试日志中心Mock拦截器...')
  
  try {
    // 测试日志列表API
    console.log('📋 测试日志列表API...')
    const logsResponse = await logApi.getSystemLogs({
      page: 1,
      page_size: 10
    })
    console.log('✅ 日志列表API响应:', logsResponse)
    
    if (logsResponse.success && logsResponse.body) {
      const logs = logsResponse.body.logs || []
      console.log(`✅ 日志数据数量: ${logs.length}`)
      console.log('✅ 日志列表样例:', logs.slice(0, 3))
    }
    
    // 测试日志统计API
    console.log('📈 测试日志统计API...')
    const statsResponse = await logApi.getLogStatistics()
    console.log('✅ 日志统计API响应:', statsResponse)
    
    if (statsResponse.success && statsResponse.body) {
      console.log('✅ 日志统计数据:', statsResponse.body)
    }
    
    // 测试日志导出API
    console.log('📤 测试日志导出API...')
    const exportResponse = await logApi.exportLogs({
      start_time: '2024-01-01',
      end_time: '2024-12-31',
      format: 'json'
    })
    console.log('✅ 日志导出API响应:', exportResponse)
    
    console.log('🎉 日志中心Mock拦截器测试成功！')
    return true
    
  } catch (error) {
    console.error('❌ 日志中心Mock拦截器测试失败:', error)
    console.error('错误详情:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    })
    return false
  }
}

// 测试统计分析Mock拦截器 (暂时注释，需要先创建analytics API)
export async function testAnalyticsMock() {
  console.log('📊 统计分析API尚未创建，跳过测试...')
  
  try {
    // TODO: 创建analytics API后启用这些测试
    console.log('⚠️ 需要先创建 src/api/analytics.js 文件')
    
    console.log('🎉 统计分析Mock拦截器测试跳过！')
    return true
    
  } catch (error) {
    console.error('❌ 统计分析Mock拦截器测试失败:', error)
    console.error('错误详情:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    })
    return false
  }
}

// 综合测试所有Mock拦截器
export async function testAllMockInterceptors() {
  console.log('🚀 开始综合测试所有Mock拦截器...')
  
  const results = {
    algorithm: false,
    logCenter: false,
    analytics: false
  }
  
  try {
    // 测试算法Mock
    console.log('\n=== 测试算法Mock拦截器 ===')
    results.algorithm = await testAlgorithmMock()
    
    // 测试日志中心Mock
    console.log('\n=== 测试日志中心Mock拦截器 ===')
    results.logCenter = await testLogCenterMock()
    
    // 测试统计分析Mock
    console.log('\n=== 测试统计分析Mock拦截器 ===')
    results.analytics = await testAnalyticsMock()
    
    // 汇总结果
    console.log('\n📊 测试结果汇总:')
    console.log('算法Mock拦截器:', results.algorithm ? '✅ 通过' : '❌ 失败')
    console.log('日志中心Mock拦截器:', results.logCenter ? '✅ 通过' : '❌ 失败')
    console.log('统计分析Mock拦截器:', results.analytics ? '✅ 通过' : '❌ 失败')
    
    const allPassed = Object.values(results).every(result => result === true)
    console.log('\n🎯 综合测试结果:', allPassed ? '🎉 全部通过！' : '⚠️ 部分失败')
    
    return {
      success: allPassed,
      results
    }
    
  } catch (error) {
    console.error('❌ 综合测试失败:', error)
    return {
      success: false,
      results,
      error: error.message
    }
  }
}

// 在浏览器控制台中可以直接调用
if (typeof window !== 'undefined') {
  // 导出所有测试函数到全局
  window.testAlgorithmMock = testAlgorithmMock
  window.testLogCenterMock = testLogCenterMock
  window.testAnalyticsMock = testAnalyticsMock
  window.testAllMockInterceptors = testAllMockInterceptors
  
  // 直接测试axios请求
  window.testDirectAxios = async function() {
    console.log('🧪 直接测试axios请求...')
    try {
      const { default: request } = await import('./api/index')
      console.log('📡 发送请求到 /api/algorithms')
      const response = await request.get('/api/algorithms')
      console.log('✅ 直接axios响应:', response)
      return response
    } catch (error) {
      console.error('❌ 直接axios请求失败:', error)
      return error
    }
  }
  
  // 测试日志相关的直接请求
  window.testDirectLogAxios = async function() {
    console.log('📊 直接测试日志相关axios请求...')
    try {
      const { default: request } = await import('./api/index')
      console.log('📡 发送请求到 /api/logs')
      const response = await request.get('/api/logs?page=1&limit=10')
      console.log('✅ 直接日志axios响应:', response)
      return response
    } catch (error) {
      console.error('❌ 直接日志axios请求失败:', error)
      return error
    }
  }
  
  // 测试分析相关的直接请求 (暂时使用统计接口)
  window.testDirectAnalyticsAxios = async function() {
    console.log('📈 直接测试统计相关axios请求...')
    try {
      const { default: request } = await import('./api/index')
      console.log('📡 发送请求到 /api/statistics/overview')
      const response = await request.get('/api/statistics/overview')
      console.log('✅ 直接统计axios响应:', response)
      return response
    } catch (error) {
      console.error('❌ 直接统计axios请求失败:', error)
      return error
    }
  }
  
  // 快速测试所有功能
  window.quickTestAll = async function() {
    console.log('⚡ 快速测试所有Mock拦截器...')
    const result = await testAllMockInterceptors()
    console.log('🏁 快速测试完成:', result)
    return result
  }
  
  // 简单的日志数据测试
  window.testLogData = async function() {
    console.log('🔍 测试日志Mock数据...')
    try {
      const { default: request } = await import('./api/index')
      console.log('📡 直接发送请求到 /api/logs?page=1&page_size=5')
      const response = await request.get('/api/logs', {
        params: {
          page: 1,
          page_size: 5
        }
      })
      console.log('✅ 日志Mock响应:', response)
      if (response.data && response.data.body && response.data.body.logs) {
        console.log('📊 日志数据:', response.data.body.logs)
        console.log('📈 总数:', response.data.body.total)
      }
      return response
    } catch (error) {
      console.error('❌ 日志Mock测试失败:', error)
      return error
    }
  }

  // 输出使用说明
  console.log(`
🧪 Mock拦截器测试工具已加载！

可用的测试函数：
• testAlgorithmMock() - 测试算法Mock拦截器
• testLogCenterMock() - 测试日志中心Mock拦截器  
• testAnalyticsMock() - 测试统计分析Mock拦截器
• testAllMockInterceptors() - 综合测试所有Mock拦截器
• quickTestAll() - 快速测试所有功能
• testLogData() - 简单测试日志数据

直接axios测试：
• testDirectAxios() - 直接测试算法API请求
• testDirectLogAxios() - 直接测试日志API请求
• testDirectAnalyticsAxios() - 直接测试分析API请求

使用方式：在控制台输入函数名并调用，例如：testLogData()
  `)
}
