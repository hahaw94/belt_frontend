// Mock拦截器测试文件
import { deviceApi } from './api/device'
import { algorithmApi } from './api/algorithm'

// 测试函数
export async function testMockInterceptors() {
  console.log('🧪 开始测试Mock拦截器...')
  
  try {
    // 测试设备API
    console.log('测试设备API...')
    const deviceResponse = await deviceApi.getDeviceList({ page: 1, page_size: 5 })
    console.log('✓ 设备API响应:', deviceResponse)
    console.log(`✓ 设备数据数量: ${deviceResponse.body?.devices?.length || 0}`)
    
    // 测试算法API
    console.log('测试算法API...')
    const algorithmResponse = await algorithmApi.getAlgorithmList()
    console.log('✓ 算法API响应:', algorithmResponse)
    console.log(`✓ 算法数据数量: ${algorithmResponse.body?.algorithms?.length || 0}`)
    
    // 测试分析板卡API
    console.log('测试分析板卡API...')
    const cardsResponse = await deviceApi.getAnalysisCards()
    console.log('✓ 分析板卡API响应:', cardsResponse)
    console.log(`✓ 分析板卡数量: ${cardsResponse.body?.analysis_cards?.length || 0}`)
    
    console.log('🎉 所有Mock拦截器测试通过！')
    console.log('📊 数据统计:')
    console.log(`  - 设备数据: ${deviceResponse.body?.total || 0} 台`)
    console.log(`  - 算法数据: ${algorithmResponse.body?.total || 0} 个`)
    console.log(`  - 分析板卡: ${cardsResponse.body?.analysis_cards?.length || 0} 个`)
    console.log('💡 注意: 登录、用户管理、角色管理已使用真实后端接口')
    
    return true
  } catch (error) {
    console.error('❌ Mock拦截器测试失败:', error)
    return false
  }
}

// 显示Mock数据到页面的函数
export function showMockDataInPage() {
  // 创建一个悬浮的数据显示面板
  const panel = document.createElement('div')
  panel.id = 'mock-data-panel'
  panel.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-size: 12px;
    z-index: 9999;
    font-family: monospace;
    max-height: 400px;
    overflow-y: auto;
    display: none;
  `
  
  panel.innerHTML = `
    <h4 style="margin-top: 0; color: #00ff00;">🔧 Mock数据状态</h4>
    <div id="mock-status">正在检测...</div>
    <button onclick="document.getElementById('mock-data-panel').style.display='none'" 
            style="position: absolute; top: 5px; right: 5px; background: none; border: none; color: white; cursor: pointer;">✕</button>
  `
  
  document.body.appendChild(panel)
  
  // 添加快捷键显示/隐藏面板 (Ctrl+M)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'm') {
      const panel = document.getElementById('mock-data-panel')
      if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none'
        if (panel.style.display === 'block') {
          updateMockDataPanel()
        }
      }
    }
  })
  
  console.log('💡 提示: 按 Ctrl+M 显示/隐藏Mock数据面板')
}

async function updateMockDataPanel() {
  const statusDiv = document.getElementById('mock-status')
  if (!statusDiv) return
  
  try {
    const result = await testMockInterceptors()
    if (result) {
      // 获取最新数据
      const deviceResponse = await deviceApi.getDeviceList({ page: 1, page_size: 1 })
      const algorithmResponse = await algorithmApi.getAlgorithmList()
      
      statusDiv.innerHTML = `
        <div style="color: #00ff00;">✅ Mock拦截器运行正常</div>
        <hr style="border-color: #333;">
        <div><strong>📊 数据统计:</strong></div>
        <div>📱 设备数据: ${deviceResponse.body?.total || 0} 台</div>
        <div>🤖 算法数据: ${algorithmResponse.body?.total || 0} 个</div>
        <hr style="border-color: #333;">
        <div style="color: #ffff00;">💡 Mock数据正常显示</div>
        <div style="color: #ffff00;">💡 登录/用户/角色使用真实接口</div>
      `
    } else {
      statusDiv.innerHTML = `<div style="color: #ff0000;">❌ Mock拦截器异常</div>`
    }
  } catch (error) {
    statusDiv.innerHTML = `<div style="color: #ff0000;">❌ 检测失败: ${error.message}</div>`
  }
}

// 在开发环境中自动运行测试
if (process.env.NODE_ENV === 'development') {
  // 延迟执行，确保Mock拦截器已初始化
  setTimeout(() => {
    testMockInterceptors()
    showMockDataInPage()
  }, 2000)
}