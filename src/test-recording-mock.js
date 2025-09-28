// 测试录像Mock拦截器
import { recordingApi } from './api/recording'

export async function testRecordingMock() {
  console.log('🧪 开始测试录像Mock拦截器...')
  
  try {
    // 测试录像列表API
    console.log('📋 测试录像列表API...')
    const listResponse = await recordingApi.getRecordingList({
      page: 1,
      page_size: 10
    })
    console.log('✅ 录像列表API响应:', listResponse)
    
    if (listResponse.success && listResponse.body) {
      const recordings = listResponse.body.recordings || []
      const pagination = listResponse.body.pagination || {}
      
      console.log(`✅ 录像数据数量: ${recordings.length}`)
      console.log(`✅ 总录像数: ${pagination.total}`)
      console.log('✅ 录像列表样例:', recordings.slice(0, 3))
      
      // 测试录像播放地址API
      if (recordings.length > 0) {
        console.log('🎬 测试录像播放地址API...')
        const firstRecording = recordings[0]
        const playResponse = await recordingApi.getPlayUrl(firstRecording.id)
        console.log('✅ 播放地址API响应:', playResponse)
        
        if (playResponse.success && playResponse.body) {
          console.log('✅ 播放地址:', playResponse.body.play_urls)
          console.log('✅ 录像信息:', playResponse.body.recording_info)
        }
      }
    }
    
    // 测试录像统计API
    console.log('📊 测试录像统计API...')
    const statsResponse = await recordingApi.getStatistics()
    console.log('✅ 录像统计API响应:', statsResponse)
    
    if (statsResponse.success && statsResponse.body) {
      const statistics = statsResponse.body.statistics || {}
      console.log(`✅ 总录像数: ${statistics.total_recordings}`)
      console.log(`✅ 存储使用: ${statistics.total_size_gb}GB`)
      console.log('✅ 告警分布:', statistics.alarm_distribution)
    }
    
    // 测试带过滤条件的录像列表
    console.log('🔍 测试带过滤条件的录像列表API...')
    const filteredResponse = await recordingApi.getRecordingList({
      page: 1,
      page_size: 5,
      device_id: 1,
      alarm_type: '异常行为'
    })
    console.log('✅ 过滤后的录像列表响应:', filteredResponse)
    
    if (filteredResponse.success && filteredResponse.body) {
      const filteredRecordings = filteredResponse.body.recordings || []
      console.log(`✅ 过滤后录像数量: ${filteredRecordings.length}`)
      console.log('✅ 过滤后录像样例:', filteredRecordings.slice(0, 2))
    }
    
    console.log('🎉 录像Mock拦截器测试成功！')
    return true
    
  } catch (error) {
    console.error('❌ 录像Mock拦截器测试失败:', error)
    console.error('错误详情:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    })
    return false
  }
}

// 在浏览器控制台中可以直接调用
if (typeof window !== 'undefined') {
  window.testRecordingMock = testRecordingMock
  
  // 直接测试axios请求
  window.testRecordingApi = async function() {
    console.log('🧪 直接测试录像API请求...')
    try {
      const { default: request } = await import('./api/index')
      console.log('📡 发送请求到 /api/recordings/list')
      const response = await request.post('/api/recordings/list', {
        page: 1,
        page_size: 10
      })
      console.log('✅ 直接API响应:', response)
      return response
    } catch (error) {
      console.error('❌ 直接API请求失败:', error)
      return error
    }
  }
}
