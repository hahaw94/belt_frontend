<template>
  <div class="dashboard">
    <!-- 数据概览卡片 -->
    <div class="overview-cards">
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="stat-card camera-stats">
            <div class="stat-icon">
              <el-icon><VideoCamera /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ dashboardData.camera_stats.online_cameras }}</div>
              <div class="stat-label">在线摄像头</div>
              <div class="stat-desc">总数: {{ dashboardData.camera_stats.total_cameras }}</div>
            </div>
            <div class="stat-rate">
              <span :class="['rate-text', getStatusColor(dashboardData.camera_stats.online_rate)]">
                {{ (dashboardData.camera_stats.online_rate * 100).toFixed(1) }}%
              </span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card alarm-stats">
            <div class="stat-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ dashboardData.alarm_stats.today_total }}</div>
              <div class="stat-label">今日告警</div>
              <div class="stat-desc">一周: {{ dashboardData.alarm_stats.week_total }}</div>
            </div>
            <div class="stat-rate">
              <span class="unprocessed-count">
                {{ dashboardData.alarm_stats.unprocessed }} 未处理
              </span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card device-stats">
            <div class="stat-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ dashboardData.device_stats.total_devices }}</div>
              <div class="stat-label">设备总数</div>
              <div class="stat-desc">在线: {{ dashboardData.device_stats.online_devices }}</div>
            </div>
            <div class="stat-rate">
              <span :class="['rate-text', getStatusColor(dashboardData.device_stats.online_rate)]">
                {{ (dashboardData.device_stats.online_rate * 100).toFixed(1) }}%
              </span>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card system-stats">
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ dashboardData.system_stats.detection_accuracy }}%</div>
              <div class="stat-label">检测准确率</div>
              <div class="stat-desc">运行时间: {{ dashboardData.system_stats.uptime }}</div>
            </div>
            <div class="stat-rate">
              <span class="status-normal">正常运行</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <el-row :gutter="24" class="main-content">
      <!-- 左侧：告警分类排名和最新告警 -->
      <el-col :span="12">
        <!-- 告警分类排名 -->
        <el-card class="ranking-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">告警分类排名</span>
              <el-button type="text" size="small" @click="refreshRanking">刷新</el-button>
            </div>
          </template>
          <div class="ranking-list">
            <div
              v-for="(item, index) in dashboardData.alarm_ranking"
              :key="index"
              class="ranking-item"
            >
              <div class="ranking-index">{{ index + 1 }}</div>
              <div class="ranking-content">
                <div class="ranking-name">{{ item.type }}</div>
                <div class="ranking-progress">
                  <el-progress
                    :percentage="item.percentage * 100"
                    :color="getRankingColor(index)"
                    :show-text="false"
                    :stroke-width="8"
                  />
                </div>
              </div>
              <div class="ranking-count">{{ item.count }}</div>
            </div>
          </div>
        </el-card>

        <!-- 最新告警截图 -->
        <el-card class="alarm-images-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">最新告警截图</span>
              <el-button type="text" size="small" @click="refreshAlarmImages">刷新</el-button>
            </div>
          </template>
          <div class="alarm-images">
            <div
              v-for="alarm in dashboardData.latest_alarms"
              :key="alarm.id"
              class="alarm-item"
              @click="viewAlarmDetail(alarm)"
            >
              <div class="alarm-image">
                <img :src="alarm.image" :alt="alarm.type" />
                <div class="alarm-overlay">
                  <div class="alarm-time">{{ formatTime(alarm.time) }}</div>
                  <div class="alarm-type">{{ alarm.type }}</div>
                </div>
              </div>
              <div class="alarm-info">
                <div class="alarm-location">{{ alarm.location }}</div>
                <div class="alarm-device">{{ alarm.device_name }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：CAD图层 -->
      <el-col :span="12">
        <el-card class="cad-map-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">监控布局图</span>
              <div class="map-controls">
                <el-button type="text" size="small" @click="refreshCadMap">刷新</el-button>
                <el-button type="text" size="small" @click="fullscreenMap">全屏</el-button>
              </div>
            </div>
          </template>
          <div class="cad-map-container" ref="cadMapContainer">
            <div class="map-background">
              <img
                v-if="cadMapData.map_config.background_image"
                :src="cadMapData.map_config.background_image"
                alt="监控布局图"
                class="background-image"
              />
              <div class="camera-points">
                <div
                  v-for="camera in cadMapData.camera_points"
                  :key="camera.device_id"
                  class="camera-point"
                  :class="{ 'camera-online': camera.status === '在线' }"
                  :style="{ left: camera.x + 'px', top: camera.y + 'px' }"
                  @click="showCameraLive(camera)"
                >
                  <el-tooltip :content="camera.device_name" placement="top">
                    <div class="camera-icon">
                      <el-icon><VideoCamera /></el-icon>
                    </div>
                  </el-tooltip>
                  <div class="camera-status" :class="camera.status === '在线' ? 'online' : 'offline'"></div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { dashboardApi } from '@/api/dashboard'
import { ElMessage } from 'element-plus'
import { VideoCamera, Warning, Monitor, TrendCharts, Loading } from '@element-plus/icons-vue'

const loading = ref(false)
const videoDialogVisible = ref(false)
const alarmDetailVisible = ref(false)
const cadMapContainer = ref(null)

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
    processed: 7
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
    }
  ]
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

// 获取状态颜色
const getStatusColor = (rate) => {
  if (rate >= 0.9) return 'success'
  if (rate >= 0.7) return 'warning'
  return 'danger'
}

// 获取排名颜色
const getRankingColor = (index) => {
  const colors = ['#f56c6c', '#e6a23c', '#67c23a', '#409eff', '#909399']
  return colors[index] || '#909399'
}

// 格式化时间
const formatTime = (timeStr) => {
  const time = new Date(timeStr)
  return time.toLocaleTimeString('zh-CN', { hour12: false })
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

// 显示摄像头实时画面
const showCameraLive = async (camera) => {
  currentCamera.value = { ...camera }
  videoDialogVisible.value = true
  
  try {
    const response = await dashboardApi.getCameraLive(camera.device_id)
    if (response.success) {
      currentCamera.value = { ...currentCamera.value, ...response.body }
    }
  } catch (error) {
    console.error('获取实时画面失败:', error)
    ElMessage.error('获取实时画面失败')
  }
}

// 关闭视频弹窗
const closeVideoDialog = () => {
  videoDialogVisible.value = false
  currentCamera.value = {}
}

// 查看告警详情
const viewAlarmDetail = (alarm) => {
  selectedAlarm.value = alarm
  alarmDetailVisible.value = true
}

// 刷新排名数据
const refreshRanking = () => {
  loadDashboardData()
}

// 刷新告警图片
const refreshAlarmImages = () => {
  loadDashboardData()
}

// 刷新CAD图层
const refreshCadMap = () => {
  loadCadMapData()
}

// 全屏地图
const fullscreenMap = () => {
  if (cadMapContainer.value) {
    if (cadMapContainer.value.requestFullscreen) {
      cadMapContainer.value.requestFullscreen()
    }
  }
}

// 定时刷新数据
let refreshInterval = null

onMounted(() => {
  loadDashboardData()
  loadCadMapData()
  
  // 每30秒刷新一次数据
  refreshInterval = setInterval(() => {
    loadDashboardData()
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.overview-cards {
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  color: white;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.stat-card.camera-stats {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.alarm-stats {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.device-stats {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.system-stats {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon {
  font-size: 48px;
  margin-right: 20px;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.stat-desc {
  font-size: 14px;
  opacity: 0.7;
}

.stat-rate {
  text-align: right;
}

.rate-text {
  font-size: 18px;
  font-weight: bold;
}

.rate-text.success {
  color: #67c23a;
}

.rate-text.warning {
  color: #e6a23c;
}

.rate-text.danger {
  color: #f56c6c;
}

.unprocessed-count {
  font-size: 14px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
}

.status-normal {
  font-size: 14px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
}

.main-content {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.ranking-list {
  max-height: 300px;
  overflow-y: auto;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-index {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 16px;
}

.ranking-content {
  flex: 1;
  margin-right: 16px;
}

.ranking-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
}

.ranking-progress {
  width: 100%;
}

.ranking-count {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.alarm-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.alarm-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
}

.alarm-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.alarm-image {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.alarm-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.alarm-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  padding: 8px;
}

.alarm-time {
  font-size: 12px;
  opacity: 0.9;
}

.alarm-type {
  font-size: 14px;
  font-weight: bold;
}

.alarm-info {
  padding: 8px;
}

.alarm-location {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.alarm-device {
  font-size: 12px;
  color: #909399;
}

.cad-map-container {
  height: 500px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f2f5;
}

.map-background {
  width: 100%;
  height: 100%;
  position: relative;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.camera-points {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.camera-point {
  position: absolute;
  cursor: pointer;
  transform: translate(-50%, -50%);
}

.camera-icon {
  width: 32px;
  height: 32px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.camera-point:hover .camera-icon {
  transform: scale(1.2);
  background: #67c23a;
}

.camera-point.camera-online .camera-icon {
  background: #67c23a;
}

.camera-status {
  position: absolute;
  bottom: -6px;
  right: -6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.camera-status.online {
  background: #67c23a;
}

.camera-status.offline {
  background: #f56c6c;
}

.live-video-container {
  width: 100%;
  height: 400px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
}

.video-loading {
  color: #fff;
  text-align: center;
}

.loading-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.camera-info {
  margin-top: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.camera-info p {
  margin: 8px 0;
  color: #606266;
}

.alarm-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alarm-detail-image {
  text-align: center;
}

.alarm-detail-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.map-controls {
  display: flex;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .overview-cards .el-col {
    margin-bottom: 16px;
  }
  
  .main-content .el-col {
    margin-bottom: 16px;
  }
  
  .alarm-images {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
