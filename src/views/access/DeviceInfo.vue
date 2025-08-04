<template>
  <div class="device-info-container sub-page-content">
    <h2>设备信息</h2>

    <!-- 设备选择 -->
    <el-card class="device-select-card mb-20" shadow="hover">
      <el-form :inline="true" label-width="100px">
        <el-form-item label="选择设备">
          <el-select 
            v-model="selectedDeviceId" 
            placeholder="请选择要查看的设备" 
            @change="onDeviceChange"
            style="width: 300px"
            filterable>
            <el-option
              v-for="device in deviceList"
              :key="device.id"
              :label="`${device.deviceName} (${device.deviceSn})`"
              :value="device.id">
              <div class="device-option">
                <span>{{ device.deviceName }}</span>
                <el-tag size="small" :type="device.status === '在线' ? 'success' : 'danger'">
                  {{ device.status }}
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Refresh" @click="getDeviceList" :loading="loading">刷新列表</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 设备详细信息 -->
    <div v-if="deviceDetail.id" v-loading="detailLoading">
      <!-- 基础信息 -->
      <el-card class="device-basic-card mb-20" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>基础信息</span>
            <div>
              <el-tag :type="deviceDetail.status === '在线' ? 'success' : 'danger'" size="large">
                {{ deviceDetail.status }}
              </el-tag>
              <el-button type="warning" :icon="Edit" size="small" @click="editDevice" class="ml-10">编辑</el-button>
              <el-button type="info" :icon="Setting" size="small" @click="configDevice" class="ml-10">配置</el-button>
            </div>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="设备ID">{{ deviceDetail.id }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ deviceDetail.deviceName }}</el-descriptions-item>
          <el-descriptions-item label="设备编号">{{ deviceDetail.deviceSn }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">
            <el-tag :type="getDeviceTypeColor(deviceDetail.deviceType)">{{ deviceDetail.deviceType }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="设备型号">{{ deviceDetail.model || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="生产厂家">{{ deviceDetail.manufacturer }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ deviceDetail.ipAddress }}</el-descriptions-item>
          <el-descriptions-item label="区域">{{ deviceDetail.area }}</el-descriptions-item>
          <el-descriptions-item label="内部编号">{{ deviceDetail.internal_code }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 安装信息 -->
      <el-card class="device-install-card mb-20" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>安装信息</span>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="安装位置">{{ deviceDetail.install_location || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="安装时间">{{ deviceDetail.install_time || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="线路信息">{{ deviceDetail.line_info || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="朝向">{{ deviceDetail.direction || '未设置' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 关联信息 -->
      <el-card class="device-relation-card mb-20" shadow="hover" v-if="deviceDetail.deviceType === 'IPC摄像机'">
        <template #header>
          <div class="card-header">
            <span>关联信息</span>
            <el-button type="primary" :icon="Link" size="small" @click="showBindDialog">绑定分析板卡</el-button>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="关联摄像头SN">{{ deviceDetail.related_camera_sn || '未关联' }}</el-descriptions-item>
          <el-descriptions-item label="关联摄像头名称">{{ deviceDetail.related_camera_name || '未关联' }}</el-descriptions-item>
          <el-descriptions-item label="分析板卡">{{ deviceDetail.analysis_card_name || '未绑定' }}</el-descriptions-item>
          <el-descriptions-item label="视频通道">{{ deviceDetail.video_channel || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="算法模型">{{ deviceDetail.algorithm_model || '未配置' }}</el-descriptions-item>
          <el-descriptions-item label="模型版本">{{ deviceDetail.model_version || '未设置' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 协议配置 -->
      <el-card class="device-protocol-card mb-20" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>协议配置</span>
            <el-button type="warning" :icon="Setting" size="small" @click="showProtocolConfig">配置协议</el-button>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="协议类型">{{ deviceDetail.protocol_type || '未配置' }}</el-descriptions-item>
          <el-descriptions-item label="连接端口">{{ deviceDetail.protocol_port || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ deviceDetail.protocol_username || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="视频编码">{{ deviceDetail.video_codec || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="视频分辨率">{{ deviceDetail.video_resolution || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="帧率">{{ deviceDetail.video_fps || '未设置' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 实时状态 -->
      <el-row :gutter="20" class="mb-20">
        <el-col :span="12">
          <el-card class="device-status-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>实时状态</span>
                <el-button type="primary" :icon="Refresh" size="small" @click="refreshStatus" :loading="statusLoading">刷新</el-button>
              </div>
            </template>
            <div class="status-content">
              <div class="status-item">
                <div class="status-label">设备状态</div>
                <div class="status-value">
                  <el-tag :type="deviceDetail.status === '在线' ? 'success' : 'danger'" size="large">
                    {{ deviceDetail.status }}
                  </el-tag>
                </div>
              </div>
              <div class="status-item">
                <div class="status-label">最后在线时间</div>
                <div class="status-value">{{ deviceDetail.last_online_time || '未知' }}</div>
              </div>
              <div class="status-item">
                <div class="status-label">数据更新时间</div>
                <div class="status-value">{{ deviceDetail.update_time || '未知' }}</div>
              </div>
              <div class="status-item">
                <div class="status-label">连接测试</div>
                <div class="status-value">
                  <el-button type="primary" size="small" @click="testConnection" :loading="testLoading">测试连接</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="device-stats-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>统计信息</span>
              </div>
            </template>
            <div class="stats-content">
              <div class="stats-item">
                <div class="stats-label">创建时间</div>
                <div class="stats-value">{{ deviceDetail.create_time }}</div>
              </div>
              <div class="stats-item">
                <div class="stats-label">运行时长</div>
                <div class="stats-value">{{ getRunningTime() }}</div>
              </div>
              <div class="stats-item">
                <div class="stats-label">今日告警数</div>
                <div class="stats-value">{{ deviceDetail.today_alarms || 0 }} 次</div>
              </div>
              <div class="stats-item">
                <div class="stats-label">总告警数</div>
                <div class="stats-value">{{ deviceDetail.total_alarms || 0 }} 次</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 未选择设备提示 -->
    <el-empty v-else description="请选择要查看的设备" image-size="200">
      <el-button type="primary" @click="getDeviceList">加载设备列表</el-button>
    </el-empty>

    <!-- 绑定分析板卡对话框 -->
    <el-dialog v-model="bindDialogVisible" title="绑定智能分析板卡" width="500px">
      <el-form :model="bindForm" label-width="120px">
        <el-form-item label="分析板卡">
          <el-select v-model="bindForm.analysis_card_id" placeholder="请选择智能分析板卡" style="width: 100%">
            <el-option
              v-for="card in analysisCards"
              :key="card.id"
              :label="card.name"
              :value="card.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="视频通道">
          <el-select v-model="bindForm.channel" placeholder="请选择视频通道" style="width: 100%">
            <el-option v-for="n in 8" :key="n" :label="`通道 ${n}`" :value="n"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="算法类型">
          <el-select v-model="bindForm.algorithm_type" placeholder="请选择算法类型" style="width: 100%">
            <el-option label="人脸识别" value="人脸识别"></el-option>
            <el-option label="车辆识别" value="车辆识别"></el-option>
            <el-option label="行为分析" value="行为分析"></el-option>
            <el-option label="物体检测" value="物体检测"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="bindDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="bindAnalysisCard" :loading="bindLoading">确认绑定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Edit, Setting, Link } from '@element-plus/icons-vue'
import { deviceApi } from '@/api/device'

// 响应式数据
const loading = ref(false)
const detailLoading = ref(false)
const statusLoading = ref(false)
const testLoading = ref(false)
const bindLoading = ref(false)
const bindDialogVisible = ref(false)

const selectedDeviceId = ref('')

// 设备列表
const deviceList = ref([])

// 设备详细信息
const deviceDetail = reactive({})

// 分析板卡列表
const analysisCards = ref([])

// 绑定表单
const bindForm = reactive({
  camera_id: '',
  analysis_card_id: '',
  channel: 1,
  algorithm_type: ''
})

// 生命周期
onMounted(() => {
  getDeviceList()
  getAnalysisCards()
})

// 方法
const getDeviceList = async () => {
  try {
    loading.value = true
    const response = await deviceApi.getDeviceList()
    if (response.data.success) {
      deviceList.value = response.data.body.devices
    }
  } catch (error) {
    ElMessage.error('获取设备列表失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const onDeviceChange = async (deviceId) => {
  if (!deviceId) return
  
  try {
    detailLoading.value = true
    const response = await deviceApi.getDeviceDetail(deviceId)
    if (response.data.success) {
      Object.assign(deviceDetail, response.data.body)
      bindForm.camera_id = deviceId
    }
  } catch (error) {
    ElMessage.error('获取设备详情失败：' + error.message)
  } finally {
    detailLoading.value = false
  }
}

const getAnalysisCards = async () => {
  try {
    const response = await deviceApi.getAnalysisCards()
    if (response.data.success) {
      analysisCards.value = response.data.body.cards || []
    }
  } catch (error) {
    ElMessage.error('获取分析板卡失败：' + error.message)
  }
}

const refreshStatus = async () => {
  if (!selectedDeviceId.value) return
  
  try {
    statusLoading.value = true
    const response = await deviceApi.getDeviceDetail(selectedDeviceId.value)
    if (response.data.success) {
      Object.assign(deviceDetail, response.data.body)
    }
  } catch (error) {
    ElMessage.error('刷新状态失败：' + error.message)
  } finally {
    statusLoading.value = false
  }
}

const testConnection = async () => {
  if (!selectedDeviceId.value) return
  
  try {
    testLoading.value = true
    const response = await deviceApi.testDeviceConnection(selectedDeviceId.value)
    if (response.data.success) {
      ElMessage.success('设备连接测试成功')
    } else {
      ElMessage.error('设备连接测试失败：' + response.data.message)
    }
  } catch (error) {
    ElMessage.error('连接测试失败：' + error.message)
  } finally {
    testLoading.value = false
  }
}

const editDevice = () => {
  ElMessage.info('跳转到设备编辑页面')
}

const configDevice = () => {
  ElMessage.info('跳转到设备配置页面')
}

const showProtocolConfig = () => {
  ElMessage.info('打开协议配置对话框')
}

const showBindDialog = () => {
  bindDialogVisible.value = true
}

const bindAnalysisCard = async () => {
  try {
    bindLoading.value = true
    const response = await deviceApi.bindAnalysisCard(bindForm)
    if (response.data.success) {
      ElMessage.success('分析板卡绑定成功')
      bindDialogVisible.value = false
      // 刷新设备详情
      onDeviceChange(selectedDeviceId.value)
    }
  } catch (error) {
    ElMessage.error('绑定失败：' + error.message)
  } finally {
    bindLoading.value = false
  }
}

const getRunningTime = () => {
  if (!deviceDetail.create_time) return '未知'
  
  const createTime = new Date(deviceDetail.create_time)
  const now = new Date()
  const diffMs = now - createTime
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  return `${diffDays}天${diffHours}小时`
}

// 辅助函数
const getDeviceTypeColor = (deviceType) => {
  const colorMap = {
    'IPC摄像机': 'primary',
    '智能分析板卡': 'success',
    'NVR录像机': 'warning',
    '编码器': 'info'
  }
  return colorMap[deviceType] || 'info'
}
</script>

<style scoped>
.sub-page-content {
  min-height: calc(100vh - 140px);
  padding-bottom: 40px;
}

.device-info-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-content, .stats-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.status-item, .stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.status-label, .stats-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.status-value, .stats-value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.mb-20 {
  margin-bottom: 20px;
}

.ml-10 {
  margin-left: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-card__header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}
</style>