const { defineConfig } = require('@vue/cli-service')

// 获取后端端口配置，支持多种来源
const getBackendPort = () => {
  // 1. 从环境变量获取
  if (process.env.VUE_APP_BACKEND_PORT) {
    return process.env.VUE_APP_BACKEND_PORT
  }
  
  // 2. 尝试从后端配置文件读取
  try {
    const fs = require('fs')
    const yaml = require('js-yaml')
    const configPath = '../smart-video-platform/configs/config.yaml'
    
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8')
      const config = yaml.load(configContent)
      if (config && config.server && config.server.port) {
        console.log(`从后端配置文件读取到端口: ${config.server.port}`)
        return config.server.port
      }
    }
  } catch (error) {
    console.warn('无法读取后端配置文件，使用默认端口:', error.message)
  }
  
  // 3. 默认端口
  return '8080'
}

const backendPort = getBackendPort()
const backendTarget = `http://localhost:${backendPort}`

console.log(`前端代理配置 - 目标后端地址: ${backendTarget}`)

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws'
    },
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      }
    }
  }
})
