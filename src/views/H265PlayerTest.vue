<template>
  <div class="h265-test-page">
    <div class="page-header">
      <h1>H265 视频播放器测试页面</h1>
      <p>测试基于 h265web.js 的视频播放器功能</p>
    </div>

    <div class="test-container">
      <!-- 主播放器 -->
      <div class="main-player">
        <h2>主播放器</h2>
        <H265Player 
          :default-url="testUrl"
          :autoplay="false"
        />
      </div>

      <!-- 测试控制面板 -->
      <div class="test-controls">
        <h2>测试控制</h2>
        
        <div class="control-group">
          <h3>预设流地址</h3>
          <el-button 
            v-for="(test, index) in testStreams" 
            :key="index"
            @click="selectStream(test.url)"
            type="primary"
            plain
          >
            {{ test.name }}
          </el-button>
        </div>

        <div class="control-group">
          <h3>自定义流地址</h3>
          <el-input 
            v-model="customUrl" 
            placeholder="输入自定义流地址"
            @keyup.enter="selectStream(customUrl)"
          />
          <el-button @click="selectStream(customUrl)" type="success">
            加载自定义流
          </el-button>
        </div>

        <div class="control-group">
          <h3>测试信息</h3>
          <div class="info-item">
            <span class="label">当前流地址：</span>
            <span class="value">{{ testUrl || '未选择' }}</span>
          </div>
          <div class="info-item">
            <span class="label">浏览器：</span>
            <span class="value">{{ browserInfo }}</span>
          </div>
          <div class="info-item">
            <span class="label">是否支持 WASM：</span>
            <span class="value">{{ wasmSupported ? '✅ 支持' : '❌ 不支持' }}</span>
          </div>
        </div>

        <div class="control-group">
          <h3>工具类测试</h3>
          <el-button @click="testUtils" type="info">运行工具类测试</el-button>
          <div v-if="utilsTestResult" class="test-result">
            <pre>{{ utilsTestResult }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * H265 播放器测试页面
 * 
 * @description
 * 用于测试 H265Player 组件的各项功能
 * 包括播放器功能测试、工具类测试等
 * 
 * @author Belt System
 * @date 2025-10-29
 */

import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import H265Player from '@/components/H265Player.vue'
import {
  ByteConverter,
  BitrateConverter,
  TimeConverter,
  StreamUrlParser
} from '@/utils/videoPlayerUtils'

// ==================== 响应式数据 ====================

const testUrl = ref('')
const customUrl = ref('')
const browserInfo = ref('')
const wasmSupported = ref(false)
const utilsTestResult = ref('')

// 测试流地址列表
const testStreams = ref([
  { 
    name: 'WebSocket 测试流', 
    url: 'ws://localhost:8080/live/stream1' 
  },
  { 
    name: 'HTTP-FLV 测试流', 
    url: 'http://localhost:8080/live/stream1.flv' 
  },
  { 
    name: 'HLS 测试流', 
    url: 'http://localhost:8080/live/stream1.m3u8' 
  },
  { 
    name: '公共 HLS 示例', 
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' 
  }
])

// ==================== 方法 ====================

/**
 * 选择流地址
 */
const selectStream = (url) => {
  if (!url) {
    ElMessage.warning('请输入流地址')
    return
  }
  
  testUrl.value = url
  ElMessage.success(`已选择流: ${url}`)
}

/**
 * 检测浏览器信息
 */
const detectBrowser = () => {
  const ua = navigator.userAgent
  let browser = 'Unknown'
  
  if (ua.indexOf('Chrome') > -1) {
    browser = 'Chrome'
  } else if (ua.indexOf('Safari') > -1) {
    browser = 'Safari'
  } else if (ua.indexOf('Firefox') > -1) {
    browser = 'Firefox'
  } else if (ua.indexOf('Edge') > -1) {
    browser = 'Edge'
  }
  
  browserInfo.value = browser
}

/**
 * 检测 WASM 支持
 */
const checkWasmSupport = () => {
  try {
    if (typeof WebAssembly === 'object' 
        && typeof WebAssembly.instantiate === 'function') {
      wasmSupported.value = true
    }
  } catch (e) {
    wasmSupported.value = false
  }
}

/**
 * 测试工具类
 */
const testUtils = () => {
  const results = []
  
  results.push('========== 字节转换测试 ==========')
  results.push(`1024 bytes = ${ByteConverter.format(1024)}`)
  results.push(`1048576 bytes = ${ByteConverter.format(1048576)}`)
  results.push(`1073741824 bytes = ${ByteConverter.format(1073741824)}`)
  results.push(`速度: ${ByteConverter.toSpeed(1048576)}`)
  
  results.push('\n========== 比特率转换测试 ==========')
  results.push(`1000 bps = ${BitrateConverter.format(1000)}`)
  results.push(`1000000 bps = ${BitrateConverter.format(1000000)}`)
  results.push(`8000000 bps = ${BitrateConverter.format(8000000)}`)
  
  results.push('\n========== 时间转换测试 ==========')
  results.push(`61 秒 = ${TimeConverter.format(61)}`)
  results.push(`3661 秒 = ${TimeConverter.format(3661)}`)
  results.push(`当前时间 = ${TimeConverter.formatTimestamp(Date.now())}`)
  results.push(`当前时间（含日期）= ${TimeConverter.formatTimestamp(Date.now(), true)}`)
  
  results.push('\n========== 流地址解析测试 ==========')
  const testUrls = [
    'http://localhost:8080/live/stream1.flv',
    'ws://localhost:8080/live',
    'http://example.com/video.m3u8'
  ]
  
  testUrls.forEach(url => {
    const type = StreamUrlParser.detectType(url)
    const valid = StreamUrlParser.isValid(url)
    const info = StreamUrlParser.parse(url)
    
    results.push(`\nURL: ${url}`)
    results.push(`  类型: ${type}`)
    results.push(`  有效: ${valid}`)
    if (info) {
      results.push(`  协议: ${info.protocol}`)
      results.push(`  主机: ${info.host}`)
      results.push(`  端口: ${info.port}`)
      results.push(`  路径: ${info.path}`)
      results.push(`  流名: ${info.streamName}`)
    }
  })
  
  utilsTestResult.value = results.join('\n')
  ElMessage.success('工具类测试完成')
}

// ==================== 生命周期 ====================

onMounted(() => {
  detectBrowser()
  checkWasmSupport()
  
  if (!wasmSupported.value) {
    ElMessage.warning('您的浏览器不支持 WebAssembly，无法使用 H265 播放器')
  }
})
</script>

<style scoped lang="less">
.h265-test-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 50%, #0d1b2a 100%);
  padding: 20px;
  color: #fff;
  
  .page-header {
    text-align: center;
    margin-bottom: 30px;
    
    h1 {
      font-size: 32px;
      margin-bottom: 10px;
      color: #00d4ff;
    }
    
    p {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
  
  .test-container {
    display: flex;
    gap: 20px;
    max-width: 1800px;
    margin: 0 auto;
    
    .main-player {
      flex: 2;
      
      h2 {
        margin-bottom: 15px;
        color: #00d4ff;
      }
    }
    
    .test-controls {
      flex: 1;
      min-width: 400px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      padding: 20px;
      
      h2 {
        margin-bottom: 20px;
        color: #00d4ff;
        border-bottom: 2px solid rgba(0, 212, 255, 0.3);
        padding-bottom: 10px;
      }
      
      h3 {
        margin: 15px 0 10px 0;
        font-size: 16px;
        color: rgba(255, 255, 255, 0.8);
      }
      
      .control-group {
        margin-bottom: 25px;
        
        .el-button {
          margin: 5px;
        }
        
        .el-input {
          margin-bottom: 10px;
          
          :deep(.el-input__wrapper) {
            background: rgba(10, 14, 39, 0.6);
            border: 1px solid rgba(0, 212, 255, 0.3);
          }
          
          :deep(.el-input__inner) {
            color: #fff;
          }
        }
        
        .info-item {
          display: flex;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          
          .label {
            color: rgba(255, 255, 255, 0.6);
            min-width: 150px;
          }
          
          .value {
            color: #00d4ff;
            word-break: break-all;
          }
        }
        
        .test-result {
          margin-top: 10px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 4px;
          padding: 15px;
          max-height: 400px;
          overflow-y: auto;
          
          pre {
            margin: 0;
            color: #52c41a;
            font-size: 12px;
            font-family: 'Consolas', 'Monaco', monospace;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          
          &::-webkit-scrollbar {
            width: 6px;
          }
          
          &::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
          }
          
          &::-webkit-scrollbar-thumb {
            background: rgba(0, 212, 255, 0.3);
            border-radius: 3px;
          }
        }
      }
    }
  }
  
  @media (max-width: 1200px) {
    .test-container {
      flex-direction: column;
      
      .test-controls {
        min-width: auto;
      }
    }
  }
}
</style>


