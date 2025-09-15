<template>
  <div class="industrial-dashboard">
    

    <!-- 主要内容区域 - 三栏布局 -->
    <div class="dashboard-container">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 告警统计 -->
        <div class="widget widget-alarm">
          <div class="widget-title">告警统计</div>
          <div class="alarm-stats-container">
            <!-- 今日告警总数显示区域 -->
            <div class="main-alarm-display">
              <div class="alarm-label">今日告警总数</div>
              <div class="alarm-counter">
                <span class="counter-digit">{{ String(dashboardData.alarm_stats.today_total).padStart(6, '0').split('').slice(0, 1).join('') }}</span>
                <span class="counter-digit">{{ String(dashboardData.alarm_stats.today_total).padStart(6, '0').split('').slice(1, 2).join('') }}</span>
                <span class="counter-digit">{{ String(dashboardData.alarm_stats.today_total).padStart(6, '0').split('').slice(2, 3).join('') }}</span>
                <span class="counter-digit">{{ String(dashboardData.alarm_stats.today_total).padStart(6, '0').split('').slice(3, 4).join('') }}</span>
                <span class="counter-digit">{{ String(dashboardData.alarm_stats.today_total).padStart(6, '0').split('').slice(4, 5).join('') }}</span>
                <span class="counter-digit">{{ String(dashboardData.alarm_stats.today_total).padStart(6, '0').split('').slice(5, 6).join('') }}</span>
              </div>
            </div>
            <!-- 环形图统计 -->
            <div class="alarm-chart-container">
              <div class="chart-wrapper">
                <!-- 装饰圆圈背景 -->
                <div class="chart-decoration"></div>
                <svg class="alarm-ring-chart" width="130" height="130" viewBox="0 0 100 100">
                  <!-- 背景圆环 -->
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(0, 150, 255, 0.2)"
                    stroke-width="8"
                  />
                  <!-- 已处理圆弧 -->
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#00aaff"
                    stroke-width="8"
                    :stroke-dasharray="processedArcLength + ' ' + (totalCircumference - processedArcLength)"
                    stroke-dashoffset="0"
                    class="processed-arc"
                    transform="rotate(-90 50 50)"
                  />
                  <!-- 未处理圆弧 -->
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#ffaa00"
                    stroke-width="8"
                    :stroke-dasharray="unprocessedArcLength + ' ' + (totalCircumference - unprocessedArcLength)"
                    :stroke-dashoffset="-processedArcLength"
                    class="unprocessed-arc"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <!-- 图例 -->
              <div class="chart-legend">
                <div class="legend-item">
                  <span class="legend-dot processed"></span>
                  <span class="legend-text">已处理: {{ dashboardData.alarm_stats.processed }}</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot unprocessed"></span>
                  <span class="legend-text">未处理: {{ dashboardData.alarm_stats.unprocessed }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 任务统计 -->
        <div class="widget widget-task">
          <div class="widget-title">任务统计</div>
          <div class="task-stats-container">
            
            <!-- 左上角数据 -->
            <div class="corner-data top-left">
              <div class="data-number">20240805985353</div>
              <div class="data-label">暂无数据</div>
            </div>
            
            <!-- 右上角数据 -->
            <div class="corner-data top-right">
              <div class="data-number">{{ dashboardData.task_stats?.online_tasks || 16 }}</div>
              <div class="data-label">暂无数据</div>
            </div>
            
            <!-- 中心圆圈 -->
            <div class="center-circle">
              <div class="circle-background"></div>
              <div class="circle-content">
                <div class="center-number">1</div>
                <div class="center-label">在线任务</div>
              </div>
            </div>
            
            <!-- 左下角数据 -->
            <div class="corner-data bottom-left">
              <div class="data-number">0</div>
              <div class="data-label">暂无数据</div>
            </div>
            
            <!-- 右下角数据 -->
            <div class="corner-data bottom-right">
              <div class="data-number">0</div>
              <div class="data-label">暂无数据</div>
            </div>
          </div>
        </div>

        <!-- 事件通知 -->
        <div class="widget widget-event">
          <div class="widget-title">事件通知</div>
          <div class="event-list">
            <div
              v-for="alarm in recentAlarms"
              :key="alarm.id"
              class="list-item"
              @click="viewAlarmDetail(alarm)"
            >
              <div class="event-content">
                <div class="event-type">{{ alarm.type }}</div>
                <div class="event-device">{{ alarm.device_name }}</div>
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
          <div class="widget-title">设备统计</div>
          <div class="device-stats-container">
            <!-- 摄像机统计 -->
            <div class="device-category">
              <div class="device-header">
                <div class="device-icon camera-icon"></div>
                <div class="device-info-box">
                  <div class="device-type">摄像机</div>
                  <div class="device-total">
                    <span class="total-number">{{ dashboardData.camera_stats.total_cameras }}</span>
                    <span class="unit-text">个</span>
                  </div>
                </div>
              </div>
              <div class="device-details">
                <div class="detail-item">
                  <div class="detail-number status-online">
                    {{ dashboardData.camera_stats.online_cameras }}<span class="unit-text-small">个</span>
                  </div>
                  <div class="detail-label">在线</div>
                </div>
                <div class="detail-item">
                  <div class="detail-number status-offline">
                    {{ dashboardData.camera_stats.offline_cameras }}<span class="unit-text-small">个</span>
                  </div>
                  <div class="detail-label">离线</div>
                </div>
              </div>
            </div>

            <!-- 算法服务统计 -->
            <div class="device-category">
              <div class="device-header">
                <div class="device-icon algorithm-icon"></div>
                <div class="device-info-box">
                  <div class="device-type">算法服务</div>
                  <div class="device-total">
                    <span class="total-number">{{ dashboardData.device_stats.total_devices - dashboardData.camera_stats.total_cameras }}</span>
                    <span class="unit-text">个</span>
                  </div>
                </div>
              </div>
              <div class="device-details">
                <div class="detail-item">
                  <div class="detail-number status-online">
                    {{ dashboardData.device_stats.online_devices - dashboardData.camera_stats.online_cameras }}<span class="unit-text-small">个</span>
                  </div>
                  <div class="detail-label">在线</div>
                </div>
                <div class="detail-item">
                  <div class="detail-number status-offline">
                    1<span class="unit-text-small">个</span>
                  </div>
                  <div class="detail-label">离线</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 高频告警排行 -->
        <div class="widget">
          <div class="widget-title">高频告警排行</div>
          <div class="ranking-chart-container">
            <svg class="ranking-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
              <!-- 背景网格线 -->
              <defs>
                <linearGradient id="barGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#ff6b35;stop-opacity:0.8" />
                  <stop offset="100%" style="stop-color:#ff6b35;stop-opacity:0.3" />
                </linearGradient>
                <linearGradient id="barGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#ffa500;stop-opacity:0.8" />
                  <stop offset="100%" style="stop-color:#ffa500;stop-opacity:0.3" />
                </linearGradient>
                <linearGradient id="barGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#00bfff;stop-opacity:0.8" />
                  <stop offset="100%" style="stop-color:#00bfff;stop-opacity:0.3" />
                </linearGradient>
                <linearGradient id="barGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#1e90ff;stop-opacity:0.7" />
                  <stop offset="100%" style="stop-color:#1e90ff;stop-opacity:0.2" />
                </linearGradient>
                <linearGradient id="barGradient5" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#4682b4;stop-opacity:0.6" />
                  <stop offset="100%" style="stop-color:#4682b4;stop-opacity:0.2" />
                </linearGradient>
              </defs>
              
              <!-- 数据柱 -->
              <rect 
                v-for="(item, index) in rankingChartData"
                :key="index"
                :x="3"
                :y="18 + index * 18"
                :width="item.percentage * 94"
                :height="4"
                :fill="`url(#barGradient${index + 1})`"
                :stroke="item.strokeColor"
                stroke-width="0.1"
                rx="0.5"
                class="ranking-bar"
                :style="{ animationDelay: index * 0.2 + 's' }"
              />
            </svg>
            
            <!-- 排行标签和文字信息 -->
            <div class="ranking-labels">
              <div 
                v-for="(item, index) in rankingChartData"
                :key="index"
                class="ranking-item"
                :style="{ animationDelay: index * 0.1 + 's' }"
              >
                <div class="rank-badge" :class="`rank-${index + 1}`">
                  TOP{{ index + 1 }}
                </div>
                <div class="device-name">{{ item.deviceName }}</div>
                <div class="count-value">{{ item.count }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 告警趋势 -->
        <div class="widget">
          <div class="widget-title">告警趋势</div>
          <div class="svg-chart-container">
            <svg class="trend-chart" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet">
              <!-- 定义渐变和滤镜 -->
              <defs>
                <!-- 折线发光效果 -->
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                <!-- 填充渐变 -->
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.3" />
                  <stop offset="100%" style="stop-color:#00d4ff;stop-opacity:0.05" />
                </linearGradient>
              </defs>
              
              <!-- 网格线 -->
              <g class="grid-lines">
                <!-- 水平网格线 -->
                <line v-for="i in 7" :key="'h-' + i" 
                      :x1="25" :y1="15 + (i-1) * 23" 
                      :x2="300" :y2="15 + (i-1) * 23" 
                      stroke="#00bfff" stroke-width="0.5" 
                      stroke-dasharray="2,2" opacity="0.4"/>
                
                <!-- 垂直网格线 -->
                <line v-for="i in 12" :key="'v-' + i" 
                      :x1="25 + (i-1) * 24" :y1="15" 
                      :x2="25 + (i-1) * 24" :y2="150" 
                      stroke="#00bfff" stroke-width="0.5" 
                      stroke-dasharray="2,2" opacity="0.3"/>
              </g>
              
              <!-- Y轴刻度标签 -->
              <g class="y-axis-labels">
                <text v-for="(value, index) in yAxisLabels" :key="'y-' + index"
                      :x="18" :y="155 - index * 23" 
                      fill="#88ccff" font-size="10" text-anchor="end">{{ value }}</text>
              </g>
              
              <!-- X轴刻度标签 -->
              <g class="x-axis-labels">
                <text v-for="(time, index) in xAxisLabels" :key="'x-' + index"
                      :x="25 + index * 24" :y="168" 
                      fill="#88ccff" font-size="10" text-anchor="middle">{{ time }}</text>
              </g>
              
              <!-- 数据区域填充 -->
              <path :d="areaPath" fill="url(#chartGradient)" opacity="0.6"/>
              
              <!-- 折线 -->
              <path :d="linePath" fill="none" stroke="#00d4ff" 
                    stroke-width="2" filter="url(#glow)" 
                    class="trend-line"/>
              
              <!-- 数据点 -->
              <circle v-for="(point, index) in chartPoints" :key="'point-' + index"
                      :cx="point.x" :cy="point.y" r="3.5" 
                      fill="#00d4ff" stroke="#ffffff" stroke-width="1.5"
                      class="data-point" filter="url(#glow)"
                      :style="{ animationDelay: index * 0.1 + 's' }"/>
            </svg>
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
// const trendChart = ref(null) // 已替换为SVG图表

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

// 排行榜图表数据
const rankingChartData = computed(() => {
  const deviceNames = ['演示253摄像机', '演示61摄像机', '演示211摄像机', '演示102摄像机', '演示178摄像机']
  const strokeColors = ['#ff6b35', '#ffa500', '#00bfff', '#1e90ff', '#4682b4']
  
  // 扩展数据到5个项目，为后面两项添加固定假数据
  const extendedRanking = [
    ...dashboardData.alarm_ranking,
    { type: '智能监控', count: 8 },
    { type: '数据分析', count: 3 }
  ].slice(0, 5)
  
  const maxCount = Math.max(...extendedRanking.map(item => item.count), 1)
  
  return extendedRanking.map((item, index) => ({
    deviceName: deviceNames[index],
    count: item.count,
    percentage: item.count / maxCount,
    strokeColor: strokeColors[index]
  }))
})

// 趋势图表数据
const trendChartData = ref([5, 15, 6, 13, 6, 2, 1, 0, 0, 1, 9, 18])
const xAxisLabels = ref(['12', '14', '16', '18', '20', '22', '0', '2', '4', '6', '8', '10'])

// Y轴标签 - 支持动态计算或手动设置
const yAxisLabels = computed(() => {
  // 方式1：固定标签（当前使用）
  return [0, 3, 6, 9, 12, 15, 18]
  
  // 方式2：动态计算（后续可启用）
  // const maxDataValue = Math.max(...trendChartData.value)
  // const maxY = Math.ceil(maxDataValue * 1.2 / 5) * 5 // 向上取整到5的倍数，并留20%余量
  // const step = maxY / 6
  // return Array.from({length: 7}, (_, i) => Math.round(i * step))
})

// 图表点坐标计算
const chartPoints = computed(() => {
  const maxValue = Math.max(...yAxisLabels.value)
  return trendChartData.value.map((value, index) => ({
    x: 25 + index * 24, // 调整起始位置和间距以匹配新的viewBox
    y: 150 - (value / maxValue) * 135 // 调整Y轴范围以匹配新的高度
  }))
})

// 折线路径
const linePath = computed(() => {
  if (chartPoints.value.length === 0) return ''
  
  let path = `M ${chartPoints.value[0].x} ${chartPoints.value[0].y}`
  for (let i = 1; i < chartPoints.value.length; i++) {
    path += ` L ${chartPoints.value[i].x} ${chartPoints.value[i].y}`
  }
  return path
})

// 区域填充路径
const areaPath = computed(() => {
  if (chartPoints.value.length === 0) return ''
  
  let path = `M ${chartPoints.value[0].x} 150` // 调整基线位置以匹配新的Y轴底部
  path += ` L ${chartPoints.value[0].x} ${chartPoints.value[0].y}`
  
  for (let i = 1; i < chartPoints.value.length; i++) {
    path += ` L ${chartPoints.value[i].x} ${chartPoints.value[i].y}`
  }
  
  path += ` L ${chartPoints.value[chartPoints.value.length - 1].x} 150 Z` // 调整基线位置
  return path
})

// 环形图圆弧长度计算
const totalCircumference = computed(() => {
  return 2 * Math.PI * 40 // 半径为40的圆周长
})

const processedArcLength = computed(() => {
  const total = dashboardData.alarm_stats.processed + dashboardData.alarm_stats.unprocessed
  if (total === 0) return 0
  return (dashboardData.alarm_stats.processed / total) * totalCircumference.value
})

const unprocessedArcLength = computed(() => {
  const total = dashboardData.alarm_stats.processed + dashboardData.alarm_stats.unprocessed
  if (total === 0) return 0
  return (dashboardData.alarm_stats.unprocessed / total) * totalCircumference.value
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


// 获取设备名称（用于排行榜）- 已被rankingChartData计算属性替代
// const getDeviceName = (type) => {
//   const deviceMap = {
//     '异常行为': '演示253摄像机',
//     '车辆违规': '演示61摄像机',
//     '人员闯入': '演示211摄像机'
//   }
//   return deviceMap[type] || '演示102摄像机'
// }



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

// SVG图表已替代Chart.js，相关代码已移除
// 如果需要动态更新图表数据，可以直接修改trendChartData的值
// 
// Y轴范围调整说明：
// 1. 简单调整：直接修改yAxisLabels computed中的return数组
// 2. 智能调整：取消注释动态计算部分，会根据数据自动调整Y轴范围
// 3. 混合方式：可以设置最小显示范围，避免数据较小时图表过于扁平

onMounted(() => {
  loadDashboardData()
  loadCadMapData()
  
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
  background: transparent; /* 移除原有背景，使用布局的背景图 */
  color: #ffffff;
  min-height: 100vh;
  overflow-x: hidden;
}



/* 主容器三栏布局 - 全屏宽度 */
.dashboard-container {
  display: grid;
  grid-template-columns: 420px 1fr 420px; /* 从350px增加到420px，进一步增加左右面板宽度 */
  grid-template-rows: 1fr;
  height: calc(100vh - 80px); /* 减去新的header高度 */
  gap: 20px;
  padding: 15px; /* 减少外边距 */
  max-width: 100vw;
}

/* 左右面板样式 */
.left-panel, .right-panel {
  display: flex;
  flex-direction: column;
  gap: 15px; /* 恢复卡片间隔，让透明效果更明显 */
  height: calc(100vh - 110px); /* 调整高度计算：80px header + 30px padding */
  overflow: hidden; /* 不允许滚动，强制卡片拉伸 */
  padding: 10px; /* 添加内边距 */
  margin: 0; /* 确保面板没有margin */
  background: transparent; /* 确保面板背景透明 */
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
  height: calc(100vh - 110px); /* 与左右面板保持一致的高度 */
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
  background: transparent; /* 完全透明背景 */
  border: 1px solid transparent; /* 透明边框，保留边界但不可见 */
  border-radius: 8px; /* 轻微圆角 */
  padding: 25px 15px 15px 15px;
  box-shadow: none; /* 移除所有阴影效果 */
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex: 1 1 0; /* 默认flex分配 */
  min-height: 0; /* 移除最小高度限制，让flex完全控制 */
  margin: 0 !important; /* 强制确保没有外边距 */
  padding-top: 45px !important; /* 增加顶部内边距为图片留出空间 */
  padding-bottom: 15px !important;
  box-sizing: border-box; /* 确保盒模型正确 */
}

/* 告警统计 - 适中高度 */
.widget-alarm {
  flex: 1 1 0; /* 调整到1倍高度 */
}

/* 任务统计 - 保持原有高度 */
.widget-task {
  flex: 1 1 0; /* 保持1倍高度 */
}

/* 事件通知 - 增加高度 */
.widget-event {
  flex: 1.4 1 0; /* 增加到1.4倍高度 */
}

/* 小部件顶部图片 */
.widget::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 0;
  right: 0;
  opacity: 0.5;
  width: 100%; /* 铺满整个宽度 */
  height: 40px; /* 缩短高度 */
  background: url('@/assets/images/main/main-containier-header.png') center/cover no-repeat;
  z-index: 3;
}

/* 移除widget悬停效果 */

/* 移除特殊圆角设置，使用统一的圆角 */

.widget-title {
  color: #00d4ff;
  font-size: 18px; /* 从16px调大到18px */
  font-weight: bold;
  font-style: italic; /* 添加倾斜样式 */
  margin-bottom: 15px;
  text-align: center; /* 改回居中对齐 */
  position: absolute;
  top: 12px; /* 向上移动，让标题显示在标题栏图片内部 */
  left: 50%;
  transform: translateX(-50%); /* 恢复居中变换 */
  z-index: 4; /* 提高层级确保显示在图片上方 */
  width: calc(100% - 30px);
}

/* 设备统计容器 */
.device-stats-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px 0;
  height: 100%;
  justify-content: space-around;
}

.device-category {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 15px 10px;
  background: transparent;
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.device-category:hover {
  background: transparent;
}

.device-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.device-icon {
  width: 70px;
  height: 70px;
  flex-shrink: 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.3));
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  top: 28px; /* 增加到28像素，继续向下移动图标 */
}

.camera-icon {
  background-image: url('@/assets/images/main/main-container-camera.png');
}

.algorithm-icon {
  background-image: url('@/assets/images/main/main-container-algorithm.png');
}

.device-info-box {
  flex: 1;
  background-image: url('@/assets/images/main/main-container-box.png');
  background-size: 120% 70%; /* 宽度拉长到120%，高度压缩到70% */
  background-repeat: no-repeat;
  background-position: center;
  padding: 10px 30px; /* 减少上下内边距，增加左右内边距 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 35px; /* 减少最小高度 */
  position: relative;
  opacity: 0.5; /* 添加透明度 */
}

.device-type {
  font-size: 16px;
  font-weight: bold;
  color: #00d4ff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}

.device-total {
  flex-shrink: 0;
}

.total-number {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

.unit-text {
  font-size: 18px;
  font-weight: normal;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
  margin-left: 2px;
}

.unit-text-small {
  font-size: 14px;
  font-weight: normal;
  color: inherit;
  text-shadow: 0 0 6px currentColor;
  margin-left: 1px;
}

.device-details {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  padding-left: 85px; /* 对齐到图标右侧 (70px图标 + 15px间隔) */
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  text-align: center;
}

.detail-number {
  font-size: 20px;
  font-weight: bold;
  text-shadow: 0 0 8px currentColor;
  line-height: 1;
}

.detail-label {
  color: #88ccff;
  font-weight: 500;
  font-size: 14px;
  line-height: 1;
}


/* 统计网格 - 保留用于其他组件 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 10px;
  margin-top: 10px;
  position: relative;
  z-index: 2;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: transparent; /* 透明背景 */
  border-radius: 6px;
  border: 1px solid transparent; /* 透明边框，保留边界但不可见 */
  box-shadow: none; /* 移除发光效果 */
  transition: none; /* 移除过渡效果 */
}

/* 移除stat-item悬停效果 */

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

/* 任务统计容器 */
.task-stats-container {
  position: relative;
  width: calc(100% - 30px); /* 与标题框宽度保持一致 */
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0; /* 移除左右padding，使用width控制 */
  margin: 0 15px; /* 使用margin确保与标题框对齐 */
}


/* 中心圆圈 */
.center-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px; /* 从120px增加到160px */
  height: 200px; /* 从120px增加到160px */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5; /* 最高层级，确保中心圆圈在最上方 */
}

.circle-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('@/assets/images/main/main-container-circle2.png') center/contain no-repeat;
  opacity: 0.8;
  z-index: 1;
}

.circle-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #ffffff;
}

.center-number {
  font-size: 36px; /* 从40px缩小到36px */
  font-weight: bold;
  color: #00d4ff;
  text-shadow: 0 0 12px rgba(0, 212, 255, 0.8);
  line-height: 1;
  margin-bottom: 6px;
}

.center-label {
  font-size: 16px; /* 从14px增加到16px，与放大的圆圈协调 */
  color: #88ccff;
  font-weight: 500;
}

/* 四角数据显示 */
.corner-data {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 4; /* 提高层级，显示在连接线之上 */
  width: 140px; /* 从110px增加到140px，增大约27% */
  height: 45px; /* 从45px增加到55px，增大约22% */
  background: url('@/assets/images/main/main-container-box1.png') center/100% 100% no-repeat;
  opacity: 0.5; /* 设置透明度 */
  padding: 8px 12px; /* 添加内边距让文字位置更好 */
  box-sizing: border-box;
}

.top-left {
  top: 15px;
  left: -25px; /* 从-20px继续向左移动到-25px */
}

.top-right {
  top: 15px;
  right: -25px; /* 从-20px继续向右移动到-25px */
}

.bottom-left {
  bottom: 15px;
  left: -25px; /* 从-20px继续向左移动到-25px */
}

.bottom-right {
  bottom: 15px;
  right: -25px; /* 从-20px继续向右移动到-25px */
}

.data-number {
  font-size: 13px; /* 从11px增加到13px，适应更大的框体 */
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
  line-height: 1.1;
  margin-bottom: 3px; /* 从2px增加到3px */
  max-width: 116px; /* 从86px增加到116px，适应新的框宽度 */
  word-break: break-all; /* 允许数字换行 */
  position: relative;
  z-index: 3; /* 确保文字显示在背景图片上方 */
}

.data-label {
  font-size: 12px; /* 从10px增加到12px，适应更大的框体 */
  color: #88ccff;
  font-weight: 400;
  text-shadow: 0 0 6px rgba(136, 204, 255, 0.8);
  position: relative;
  z-index: 3; /* 确保文字显示在背景图片上方 */
}

/* 移除旧的单个统计项样式 - 保留作为备用 */
.single-stat {
  display: none; /* 隐藏旧样式 */
}

/* 保留旧的任务算法描述样式作为备用 */
.task-algorithm {
  font-size: 11px;
  color: #88ccff;
  margin-top: 5px;
}

/* 保留旧的进度条样式作为备用 */
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
  padding: 8px 15px 8px 20px; /* 左边增加一些内边距 */
  margin-bottom: 12px;
  background-image: url('~@/assets/images/main/main-container-box3.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 4px;
  min-height: 45px; /* 适合2-3行文字的高度 */
  max-height: 60px;
  border: none;
  box-shadow: none;
  transition: none;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  z-index: 2;
}

/* 事件列表、排行榜列表容器 */
.event-list, .ranking-list {
  margin-top: 10px;
}

/* 移除list-item悬停效果 */

/* 告警统计专用样式 */
.alarm-stats-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  padding: 10px 0;
}

.main-alarm-display {
  text-align: center;
  margin-bottom: 20px;
}

.alarm-label {
  color: #88ccff;
  font-size: 14px;
  margin-bottom: 15px;
}

.alarm-counter {
  display: flex;
  justify-content: center;
  gap: 3px;
  margin-bottom: 10px;
}

.counter-digit {
  display: inline-block;
  width: 35px;
  height: 45px;
  line-height: 45px;
  background: linear-gradient(135deg, rgba(0, 150, 255, 0.2) 0%, rgba(0, 200, 255, 0.3) 100%);
  border: 1px solid rgba(0, 150, 255, 0.4);
  border-radius: 6px;
  color: #ffffff;
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  box-shadow: 
    0 0 10px rgba(0, 150, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
}

.alarm-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alarm-stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-dot.processed {
  background: #ffaa00;
  box-shadow: 0 0 8px rgba(255, 170, 0, 0.5);
}

.stat-dot.unprocessed {
  background: #00aaff;
  box-shadow: 0 0 8px rgba(0, 170, 255, 0.5);
}

.stat-text {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

/* 环形图样式 */
.alarm-chart-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 50px;
  height: 100%;
  padding: 15px 0;
}

.chart-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.chart-decoration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 150px;
  background: url('@/assets/images/main/main-container-circle.png') center/contain no-repeat;
  opacity: 0.5;
  z-index: 1;
  pointer-events: none;
}

.alarm-ring-chart {
  filter: drop-shadow(0 0 8px rgba(0, 150, 255, 0.3));
  position: relative;
  z-index: 2;
}

.processed-arc {
  stroke: #00aaff;
  filter: drop-shadow(0 0 6px rgba(0, 170, 255, 0.6));
  animation: drawProcessedArc 2s ease-in-out;
}

.unprocessed-arc {
  stroke: #ffaa00;
  filter: drop-shadow(0 0 6px rgba(255, 170, 0, 0.6));
  animation: drawUnprocessedArc 2s ease-in-out 0.3s both;
}

@keyframes drawProcessedArc {
  from {
    stroke-dasharray: 0 300;
  }
}

@keyframes drawUnprocessedArc {
  from {
    stroke-dasharray: 0 300;
  }
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 15px;
  justify-content: center;
  min-width: 140px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 5px 0;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.processed {
  background: #00aaff;
  box-shadow: 0 0 6px rgba(0, 170, 255, 0.5);
}

.legend-dot.unprocessed {
  background: #ffaa00;
  box-shadow: 0 0 6px rgba(255, 170, 0, 0.5);
}

.legend-text {
  color: #ffffff;
  font-size: 15px;
  font-weight: 500;
}

/* 事件内容 */
.event-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.event-type {
  font-size: 14px;
  color: #ff6666;
  text-shadow: 0 0 4px rgba(255, 102, 102, 0.8), 1px 1px 2px rgba(0, 0, 0, 0.8);
  font-weight: 500;
  position: relative;
  z-index: 3;
  margin-bottom: 2px;
}

.event-device {
  font-size: 12px;
  color: #ffffff;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.9), 1px 1px 2px rgba(0, 0, 0, 0.8);
  font-weight: 500;
  position: relative;
  z-index: 3;
}

.event-time {
  font-size: 14px;
  color: #88ccff;
  text-shadow: 0 0 4px rgba(136, 204, 255, 0.8), 1px 1px 2px rgba(0, 0, 0, 0.8);
  font-weight: 500;
  position: relative;
  z-index: 3;
  margin-right: 8px; /* 向左移动8像素 */
  display: flex;
  align-items: center;
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

/* 新的排行榜图表样式 */
.ranking-chart-container {
  position: relative;
  height: 100%;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
}

.ranking-chart {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.ranking-bar {
  opacity: 0;
  animation: slideInBar 1s ease-out forwards;
  filter: drop-shadow(0 0 3px currentColor);
}

@keyframes slideInBar {
  from {
    opacity: 0;
    transform: scaleX(0);
    transform-origin: left;
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

.ranking-labels {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 15px 0;
}

.ranking-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  padding: 0 5px;
  opacity: 0;
  animation: slideInText 0.8s ease-out forwards;
  position: relative;
  transform: translateY(-2px);
}

@keyframes slideInText {
  from {
    opacity: 0;
    transform: translateX(-20px) translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(-2px);
  }
}

.rank-badge {
  font-size: 12px;
  font-weight: bold;
  padding: 4px 6px;
  border-radius: 6px;
  text-align: center;
  min-width: 42px;
  width: 42px;
  text-shadow: 0 0 6px currentColor;
  border: 1px solid currentColor;
  box-shadow: 0 0 8px currentColor;
  flex-shrink: 0;
}

.rank-1 {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #ffffff;
  border-color: #ff6b35;
}

.rank-2 {
  background: linear-gradient(135deg, #ffa500, #ffb84d);
  color: #ffffff;
  border-color: #ffa500;
}

.rank-3 {
  background: linear-gradient(135deg, #00bfff, #42d4ff);
  color: #ffffff;
  border-color: #00bfff;
}

.rank-4 {
  background: linear-gradient(135deg, #1e90ff, #4da6ff);
  color: #ffffff;
  border-color: #1e90ff;
}

.rank-5 {
  background: linear-gradient(135deg, #4682b4, #6ba3d0);
  color: #ffffff;
  border-color: #4682b4;
}

.device-name {
  flex: 1;
  margin-left: 5px;
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.3);
  text-align: left;
}

.count-value {
  font-size: 16px;
  font-weight: bold;
  color: #00ff88;
  text-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
  min-width: 25px;
  width: 25px;
  text-align: right;
  flex-shrink: 0;
}

/* 排行榜计数 - 保留旧样式作为备用 */
.ranking-count {
  font-size: 16px;
  font-weight: bold;
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

/* SVG图表容器 */
.svg-chart-container {
  height: 240px; /* 从180px增加到240px，增大60px */
  margin-top: 15px;
  position: relative;
  z-index: 2;
  padding: 0;
  margin-left: -15px;
  margin-right: -15px;
}

.trend-chart {
  width: 100%;
  height: 100%;
  background: transparent;
}

.trend-line {
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0;
  animation: drawLine 2s ease-in-out forwards;
}

@keyframes drawLine {
  from {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    opacity: 1;
  }
  to {
    stroke-dasharray: 1000;
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

.data-point {
  opacity: 0;
  animation: showPoint 0.5s ease-in-out forwards;
  cursor: pointer;
  transition: all 0.3s ease;
}

.data-point:hover {
  r: 5;
  filter: drop-shadow(0 0 10px #00d4ff);
}

@keyframes showPoint {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.grid-lines {
  opacity: 0;
  animation: fadeInGrid 1s ease-in-out 0.5s forwards;
}

@keyframes fadeInGrid {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 保留旧的图表容器样式作为备用 */
.chart-container {
  height: 180px;
  margin-top: 15px;
  position: relative;
  z-index: 2;
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
@media (max-width: 1400px) {
  .dashboard-container {
    grid-template-columns: 380px 1fr 380px; /* 从320px增加到380px */
    gap: 15px;
    padding: 15px;
  }
}

@media (max-width: 1200px) {
  .dashboard-container {
    grid-template-columns: 350px 1fr 350px; /* 从300px增加到350px */
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
