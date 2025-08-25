<template>
  <div class="industrial-dashboard">
    

    <!-- 主要内容区域 - 三栏布局 -->
    <div class="dashboard-container">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 告警统计 -->
        <div class="widget">
          <div class="widget-title">📊 告警统计</div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">{{ dashboardData.alarm_stats.today_total }}</div>
              <div class="stat-label">今日告警数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ dashboardData.alarm_stats.processed }}</div>
              <div class="stat-label">已处理</div>
            </div>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">{{ dashboardData.alarm_stats.unprocessed }}</div>
              <div class="stat-label">未处理</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ dashboardData.alarm_stats.processing || 1 }}</div>
              <div class="stat-label">处理中</div>
            </div>
            </div>
          </div>

        <!-- 任务统计 -->
        <div class="widget">
          <div class="widget-title">⚙️ 任务统计</div>
          <div class="single-stat">
            <div class="stat-number">{{ dashboardData.task_stats?.online_tasks || 16 }}</div>
            <div class="stat-label">在线任务</div>
            <div class="task-algorithm">安全帽检测、烟火检测、人员闯入</div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (dashboardData.task_stats?.progress || 85) + '%' }"></div>
            </div>
            </div>
    </div>

        <!-- 事件通知 -->
        <div class="widget">
          <div class="widget-title">🔔 事件通知</div>
          <div class="event-list">
            <div
              v-for="alarm in recentAlarms"
              :key="alarm.id"
              class="list-item"
              @click="viewAlarmDetail(alarm)"
            >
              <div class="event-content">
                <div class="event-device">{{ alarm.device_name }}</div>
                <div class="event-type">{{ getEventIcon(alarm.type) }} {{ alarm.type }}</div>
                </div>
              <div class="event-time">{{ formatEventTime(alarm.time) }}</div>
              </div>
            </div>
          </div>
            </div>

      <!-- 中央内容区域 -->
      <div class="main-content">
        <div class="factory-bg"></div>
        
        <!-- 实时告警弹窗 -->
        <div 
          v-if="showAlertPopup" 
          class="alert-popup" 
          @click="showAlertDetails"
        >
          <button class="close-btn" @click.stop="closeAlert">&times;</button>
          <div class="alert-content">
            <h3>🚨 实时告警</h3>
            <p><strong>设备名称:</strong> {{ currentAlert.device_name }}</p>
            <p><strong>事件名称:</strong> {{ currentAlert.type }}</p>
            <p><strong>告警时间:</strong> {{ currentAlert.time }}</p>
            <p class="alert-tip">点击查看详情 →</p>
                </div>
              </div>
              </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <!-- 设备统计 -->
        <div class="widget">
          <div class="widget-title">📹 设备统计</div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number status-online">{{ dashboardData.camera_stats.online_cameras }}</div>
              <div class="stat-label">摄像机在线</div>
            </div>
            <div class="stat-item">
              <div class="stat-number status-offline">{{ dashboardData.camera_stats.offline_cameras }}</div>
              <div class="stat-label">摄像机离线</div>
          </div>
              </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number status-online">{{ dashboardData.device_stats.online_devices - dashboardData.camera_stats.online_cameras }}</div>
              <div class="stat-label">算法服务在线</div>
            </div>
            <div class="stat-item">
              <div class="stat-number status-offline">1</div>
              <div class="stat-label">算法服务离线</div>
            </div>
          </div>
        </div>

        <!-- 高频告警排行 -->
        <div class="widget">
          <div class="widget-title">🏆 高频告警排行</div>
          <div class="ranking-list">
            <div
              v-for="(item, index) in dashboardData.alarm_ranking"
              :key="index"
              class="list-item"
            >
              <div class="device-status">
                <span class="status-dot" :class="index < 3 ? 'dot-online' : 'dot-offline'"></span>
                <span>TOP{{ index + 1 }} {{ getDeviceName(item.type) }}</span>
                    </div>
              <span class="ranking-count">{{ item.count }}</span>
                </div>
              </div>
            </div>

        <!-- 告警趋势 -->
        <div class="widget">
          <div class="widget-title">📈 告警趋势</div>
          <div class="chart-container">
            <canvas ref="trendChart" id="trendChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- 实时画面弹窗 -->
    <el-dialog
      v-model="videoDialogVisible"
      :title="currentCamera.device_name + ' - 实时画面'"
      width="800px"
      @close="closeVideoDialog"
    >
      <div class="live-video-container">
        <video
          v-if="currentCamera.stream_url"
          :src="currentCamera.stream_url"
          controls
          autoplay
          muted
          width="100%"
          height="400px"
        />
        <div v-else class="video-loading">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <p>正在加载实时画面...</p>
        </div>
      </div>
      <div class="camera-info">
        <p><strong>设备信息：</strong></p>
        <p>设备名称：{{ currentCamera.device_name }}</p>
        <p>设备状态：<el-tag :type="currentCamera.status === '在线' ? 'success' : 'danger'" size="small">{{ currentCamera.status }}</el-tag></p>
        <p>分辨率：{{ currentCamera.resolution }}</p>
        <p>帧率：{{ currentCamera.fps }}fps</p>
      </div>
    </el-dialog>

    <!-- 告警详情弹窗 -->
    <el-dialog
      v-model="alarmDetailVisible"
      title="告警详情"
      width="600px"
    >
      <div class="alarm-detail">
        <div class="alarm-detail-image">
          <img :src="selectedAlarm.image" :alt="selectedAlarm.type" />
        </div>
        <div class="alarm-detail-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="告警类型">{{ selectedAlarm.type }}</el-descriptions-item>
            <el-descriptions-item label="发生时间">{{ selectedAlarm.time }}</el-descriptions-item>
            <el-descriptions-item label="告警位置">{{ selectedAlarm.location }}</el-descriptions-item>
            <el-descriptions-item label="设备名称">{{ selectedAlarm.device_name }}</el-descriptions-item>
            <el-descriptions-item label="告警ID" :span="2">{{ selectedAlarm.id }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="HomeView">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { dashboardApi } from '@/api/dashboard'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
// import { useAuthStore } from '@/stores/auth'
// const authStore = useAuthStore() // 暂时注释，如果需要可以取消注释
const loading = ref(false)
const videoDialogVisible = ref(false)
const alarmDetailVisible = ref(false)
// const cadMapContainer = ref(null) // 暂时注释，如果需要可以取消注释
const trendChart = ref(null)

// 新增状态
const showAlertPopup = ref(false)
const currentAlert = ref({})

// 数据看板数据
const dashboardData = reactive({
  camera_stats: {
    total_cameras: 30,
    online_cameras: 28,
    offline_cameras: 2,
    online_rate: 0.933
  },
  alarm_stats: {
    week_total: 85,
    today_total: 12,
    unprocessed: 5,
    processed: 7,
    processing: 1
  },
  device_stats: {
    total_devices: 35,
    online_devices: 32,
    online_rate: 0.914
  },
  system_stats: {
    detection_accuracy: 92.5,
    uptime: '99.8%'
  },
  task_stats: {
    online_tasks: 16,
    progress: 85
  },
  alarm_ranking: [
    { type: '异常行为', count: 35, percentage: 0.412 },
    { type: '车辆违规', count: 28, percentage: 0.329 },
    { type: '人员闯入', count: 22, percentage: 0.259 }
  ],
  latest_alarms: [
    {
      id: 101,
      time: '2024-01-20 15:45:30',
      type: '异常行为',
      location: '前门',
      image: '/uploads/alarms/20240120_1545_101.jpg',
      device_name: '前门摄像头'
    },
    {
      id: 102,
      time: '2024-01-20 11:03:06',
      type: '未戴安全帽',
      location: '演示61摄像机',
      image: '/uploads/alarms/20240120_1103_102.jpg',
      device_name: '演示61摄像机'
    },
    {
      id: 103,
      time: '2024-01-20 11:01:23',
      type: '烟火检测',
      location: '演示253摄像机',
      image: '/uploads/alarms/20240120_1101_103.jpg',
      device_name: '演示253摄像机'
    },
    {
      id: 104,
      time: '2024-01-20 10:56:31',
      type: '人员闯入',
      location: '演示211摄像机',
      image: '/uploads/alarms/20240120_1056_104.jpg',
      device_name: '演示211摄像机'
    }
  ]
})

// 最近告警（用于事件通知）
const recentAlarms = computed(() => {
  return dashboardData.latest_alarms.slice(0, 3)
})

// CAD图层数据
const cadMapData = reactive({
  map_config: {
    background_image: '/uploads/maps/belt_layout.png',
    width: 1920,
    height: 1080
  },
  camera_points: [
    {
      device_id: 1,
      device_name: '皮带头部摄像头',
      x: 150,
      y: 200,
      status: '在线',
      stream_url: 'rtmp://192.168.1.101:1935/live/stream1',
      resolution: '1920x1080',
      fps: 25
    },
    {
      device_id: 2,
      device_name: '皮带尾部摄像头',
      x: 800,
      y: 200,
      status: '在线',
      stream_url: 'rtmp://192.168.1.102:1935/live/stream2',
      resolution: '1920x1080',
      fps: 30
    }
  ]
})

// 当前摄像头
const currentCamera = ref({})

// 选中的告警
const selectedAlarm = ref({})

// 这些函数暂时注释，如果需要可以取消注释
// const getStatusColor = (rate) => {
//   if (rate >= 0.9) return 'success'
//   if (rate >= 0.7) return 'warning'
//   return 'danger'
// }

// const getRankingColor = (index) => {
//   const colors = ['#f56c6c', '#e6a23c', '#67c23a', '#409eff', '#909399']
//   return colors[index] || '#909399'
// }

// const formatTime = (timeStr) => {
//   const time = new Date(timeStr)
//   return time.toLocaleTimeString('zh-CN', { hour12: false })
// }

// 格式化事件时间（仅显示时分秒）
const formatEventTime = (timeStr) => {
  const time = new Date(timeStr)
  return time.toLocaleTimeString('zh-CN', { hour12: false }).slice(0, 8)
}

// 获取事件图标
const getEventIcon = (type) => {
  const iconMap = {
    '未戴安全帽': '⚠️',
    '烟火检测': '🔥',
    '人员闯入': '👤',
    '异常行为': '🚨',
    '车辆违规': '🚗'
  }
  return iconMap[type] || '🔔'
}

// 获取设备名称（用于排行榜）
const getDeviceName = (type) => {
  const deviceMap = {
    '异常行为': '演示253摄像机',
    '车辆违规': '演示61摄像机',
    '人员闯入': '演示211摄像机'
  }
  return deviceMap[type] || '演示102摄像机'
}



// 关闭告警弹窗
const closeAlert = () => {
  showAlertPopup.value = false
}

// 显示告警详情
const showAlertDetails = () => {
  ElMessage.info('跳转到告警详情页面...')
  showAlertPopup.value = false
}

// 模拟实时数据更新
const updateRealTimeData = () => {
  // 更新告警统计数据
  const totalAlerts = Math.floor(Math.random() * 15) + 5
  const processedAlerts = Math.floor(totalAlerts * 0.4)
  const processingAlerts = Math.floor(totalAlerts * 0.1)
  const unprocessedAlerts = totalAlerts - processedAlerts - processingAlerts
  
  dashboardData.alarm_stats.today_total = totalAlerts
  dashboardData.alarm_stats.processed = processedAlerts
  dashboardData.alarm_stats.unprocessed = unprocessedAlerts
  dashboardData.alarm_stats.processing = processingAlerts

  // 随机显示告警弹窗
  if (Math.random() > 0.85) {
    currentAlert.value = {
      device_name: '摄像机1',
      type: '未戴安全帽',
      time: new Date().toLocaleString('zh-CN')
    }
    showAlertPopup.value = true
  }
}

// 加载数据看板数据
const loadDashboardData = async () => {
  loading.value = true
  try {
    const response = await dashboardApi.getOverview()
    if (response.success) {
      Object.assign(dashboardData, response.body)
    }
  } catch (error) {
    console.error('加载数据看板失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载CAD图层数据
const loadCadMapData = async () => {
  try {
    const response = await dashboardApi.getCadMap()
    if (response.success) {
      Object.assign(cadMapData, response.body)
    }
  } catch (error) {
    console.error('加载CAD图层失败:', error)
    ElMessage.error('加载地图数据失败')
  }
}

// 查看告警详情
const viewAlarmDetail = (alarm) => {
  selectedAlarm.value = alarm
  alarmDetailVisible.value = true
}

// 关闭视频弹窗
const closeVideoDialog = () => {
  videoDialogVisible.value = false
  currentCamera.value = {}
}

// 这些函数暂时注释，如果需要可以取消注释
// const showCameraLive = async (camera) => {
//   currentCamera.value = { ...camera }
//   videoDialogVisible.value = true
//   
//   try {
//     const response = await dashboardApi.getCameraLive(camera.device_id)
//     if (response.success) {
//       currentCamera.value = { ...currentCamera.value, ...response.body }
//     }
//   } catch (error) {
//     console.error('获取实时画面失败:', error)
//     ElMessage.error('获取实时画面失败')
//   }
// }

// const refreshRanking = () => {
//   loadDashboardData()
// }

// const refreshAlarmImages = () => {
//   loadDashboardData()
// }

// const refreshCadMap = () => {
//   loadCadMapData()
// }

// const fullscreenMap = () => {
//   if (cadMapContainer.value) {
//     if (cadMapContainer.value.requestFullscreen) {
//       cadMapContainer.value.requestFullscreen()
//     }
//   }
// }

// 定时刷新数据
let refreshInterval = null

// 初始化告警趋势图
const initTrendChart = () => {
  if (!trendChart.value) return
  
  // 动态加载 Chart.js
  if (typeof Chart === 'undefined') {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js'
    script.onload = () => {
      createChart()
    }
    document.head.appendChild(script)
  } else {
    createChart()
  }
}

// 创建图表
const createChart = () => {
  const ctx = trendChart.value.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, 0, 180)
  gradient.addColorStop(0, 'rgba(0, 212, 255, 0.4)')
  gradient.addColorStop(1, 'rgba(0, 212, 255, 0.05)')

  // eslint-disable-next-line no-undef
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      datasets: [{
        label: '告警数量',
        data: [2, 5, 3, 8, 12, 6, 4],
        borderColor: '#00d4ff',
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00d4ff',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(0, 150, 255, 0.1)',
            borderColor: 'rgba(0, 150, 255, 0.3)'
          },
          ticks: {
            color: '#88ccff',
            font: {
              size: 11
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(0, 150, 255, 0.1)',
            borderColor: 'rgba(0, 150, 255, 0.3)'
          },
          ticks: {
            color: '#88ccff',
            font: {
              size: 11
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  })
}

onMounted(() => {
  loadDashboardData()
  loadCadMapData()
  
  // 延迟初始化图表
  setTimeout(() => {
    initTrendChart()
  }, 100)
  
  // 每30秒刷新一次数据
  refreshInterval = setInterval(() => {
    loadDashboardData()
    updateRealTimeData()
  }, 30000)
  
  // 8秒后显示告警弹窗
  setTimeout(() => {
    currentAlert.value = {
      device_name: '摄像机1',
      type: '未戴安全帽',
      time: new Date().toLocaleString('zh-CN')
    }
    showAlertPopup.value = true
  }, 8000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
/* 工业风格深色主题 */
.industrial-dashboard {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  background: linear-gradient(135deg, #0f1419 0%, #1a2332 100%);
  color: #ffffff;
  min-height: 100vh;
  overflow-x: hidden;
}



/* 主容器三栏布局 */
.dashboard-container {
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  grid-template-rows: 1fr;
  height: 100vh;
  gap: 15px;
  padding: 15px;
}

/* 左右面板样式 */
.left-panel, .right-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: calc(100vh - 30px);
  overflow-y: auto;
}

/* 中央内容区域 */
.main-content {
  position: relative;
  background: linear-gradient(45deg, rgba(0, 50, 100, 0.3), rgba(0, 30, 60, 0.5));
  border: 1px solid rgba(0, 150, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 工业背景 */
.factory-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23001122;stop-opacity:1" /><stop offset="100%" style="stop-color:%23002244;stop-opacity:1" /></linearGradient></defs><rect fill="url(%23bg)" width="1200" height="800"/><g opacity="0.4"><rect x="100" y="300" width="200" height="100" fill="%23003366" rx="5"/><rect x="350" y="250" width="150" height="150" fill="%23004488" rx="5"/><rect x="550" y="280" width="300" height="80" fill="%23002244" rx="5"/><circle cx="200" cy="500" r="50" fill="%230066aa"/><circle cx="700" cy="450" r="40" fill="%230088cc"/><polygon points="900,200 950,150 1000,200 1000,350 900,350" fill="%23003366"/><polygon points="1050,180 1100,130 1150,180 1150,370 1050,370" fill="%23004488"/></g></svg>') center/cover no-repeat;
  opacity: 0.6;
}

/* 小部件样式 */
.widget {
  background: rgba(0, 40, 80, 0.9);
  border: 1px solid rgba(0, 150, 255, 0.3);
  border-radius: 8px;
  padding: 15px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.widget:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.widget-title {
  color: #00d4ff;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.widget-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: linear-gradient(45deg, #00d4ff, #0099ff);
  border-radius: 2px;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: rgba(0, 150, 255, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(0, 150, 255, 0.2);
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(0, 150, 255, 0.2);
  transform: translateY(-2px);
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.stat-label {
  font-size: 12px;
  color: #88ccff;
  margin-top: 5px;
}

/* 单个统计项 */
.single-stat {
  text-align: center;
  padding: 15px;
  background: rgba(0, 150, 255, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(0, 150, 255, 0.2);
}

/* 任务算法描述 */
.task-algorithm {
  font-size: 11px;
  color: #88ccff;
  margin-top: 5px;
}

/* 进度条 */
.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(0, 150, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #00ff88);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 状态颜色 */
.status-online {
  color: #00ff88;
}

.status-offline {
  color: #ff4444;
}

/* 列表项样式 */
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: rgba(0, 100, 200, 0.1);
  border-radius: 4px;
  border-left: 3px solid #00d4ff;
  transition: all 0.3s ease;
  font-size: 14px;
  cursor: pointer;
}

.list-item:hover {
  background: rgba(0, 150, 255, 0.2);
  transform: translateX(5px);
}

/* 事件内容 */
.event-content {
  flex: 1;
}

.event-device {
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 2px;
}

.event-type {
  font-size: 12px;
  color: #ff6666;
}

.event-time {
  font-size: 12px;
  color: #88ccff;
}

/* 设备状态 */
.device-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: statusBlink 2s infinite;
}

.dot-online {
  background: #00ff88;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.dot-offline {
  background: #ff4444;
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
}

@keyframes statusBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 排行榜计数 */
.ranking-count {
  font-size: 16px;
  font-weight: bold;
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

/* 图表容器 */
.chart-container {
  height: 180px;
  margin-top: 10px;
}

/* 告警弹窗 */
.alert-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 68, 68, 0.95);
  border: 2px solid #ff4444;
  border-radius: 10px;
  padding: 25px;
  min-width: 350px;
  box-shadow: 0 0 30px rgba(255, 68, 68, 0.5);
  animation: alertPulse 2s infinite;
  cursor: pointer;
  z-index: 1000;
}

@keyframes alertPulse {
  0%, 100% { 
    box-shadow: 0 0 30px rgba(255, 68, 68, 0.5);
    transform: translate(-50%, -50%) scale(1);
  }
  50% { 
    box-shadow: 0 0 50px rgba(255, 68, 68, 0.8);
    transform: translate(-50%, -50%) scale(1.02);
  }
}

.alert-content h3 {
  margin-bottom: 15px;
  font-size: 18px;
  color: white;
}

.alert-content p {
  margin-bottom: 8px;
  font-size: 14px;
  color: white;
}

.alert-tip {
  margin-top: 10px;
  font-size: 12px;
  opacity: 0.8;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 150, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 150, 255, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 150, 255, 0.7);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-container {
    grid-template-columns: 280px 1fr 280px;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    height: auto;
  }
  
  .left-panel, .right-panel {
    max-height: none;
  }
  
  .main-content {
    height: 400px;
  }
}


</style>
