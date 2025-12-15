<template>
  <div class="basic-management-container tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background">
    </div>
    
    <h2>{{ $t('system.basic.title') }}</h2>

    <!-- 选项卡导航 -->
    <el-tabs v-model="activeTab" class="management-tabs tech-tabs">
      <el-tab-pane :label="$t('system.basic.timeSettings')" name="time">
        <TimeManagement
          :ntp-config="ntpConfig"
          :ntp-rules="ntpRules"
          :ntp-loading="ntpLoading"
          :sync-loading="syncLoading"
          :set-time-loading="setTimeLoading"
          :manual-time="manualTime"
          :current-time="currentTime"
          :show-timezone-dropdown="showTimezoneDropdown"
          :timezone-options="timezoneOptions"
          @load-ntp-config="loadNTPConfig"
          @sync-ntp="syncNTP"
          @set-manual-time="setManualTime"
          @sync-pc-time="syncPCTime"
          @save-ntp-config="saveNTPConfig"
          @reset-ntp-form="resetNTPForm"
          @toggle-timezone-dropdown="toggleTimezoneDropdown"
          @select-timezone="selectTimezone"
          @update-ntp-mode="updateNtpMode"
          @update-timezone="updateTimezone"
          @update-manual-time="updateManualTime"
          @update-ntp-server="updateNtpServer"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t('system.basic.networkSettings')" name="network">
        <NetworkManagement
          :network-config="networkConfig"
          :current-network-config="currentNetworkConfig"
          :network-rules="networkRules"
          :network-loading="networkLoading"
          @load-network-config="loadNetworkConfig"
          @show-network-change-dialog="showNetworkChangeDialog"
          @show-port-change-dialog="showPortChangeDialog"
          @reset-network-form="resetNetworkForm"
          @copy-to-clipboard="copyToClipboard"
          @update-ip-address="updateIpAddress"
          @update-subnet-mask="updateSubnetMask"
          @update-gateway="updateGateway"
          @update-port="updatePort"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t('system.basic.appearanceSettings')" name="appearance">
        <LogoManagement
          ref="logoManagementRef"
          :current-logo="currentLogo"
          :logo-preview="logoPreview"
          :logo-loading="logoLoading"
          :uploading="uploading"
          @load-current-logo="loadCurrentLogo"
          @delete-logo="deleteLogo"
          @handle-logo-change="handleLogoChange"
          @trigger-reselect="triggerReselect"
          @upload-logo="uploadLogo"
          @clear-logo-preview="clearLogoPreview"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t('system.basic.platformDocking')" name="platform">
        <PlatformManagement
          :gb28181-dialog-visible="gb28181DialogVisible"
          :gb28181-platforms="gb28181Platforms"
          :gb28181-loading="gb28181Loading"
          :gb28181-dialog-mode="gb28181DialogMode"
          :gb28181-form-data="gb28181FormData"
          :gb28181-rules="gb28181Rules"
          @show-add-gb28181-dialog="showAddGB28181Dialog"
          @load-gb28181-platforms="loadGB28181Platforms"
          @toggle-gb28181-platform="toggleGB28181Platform"
          @test-gb28181-connection="testGB28181Connection"
          @edit-gb28181-platform="editGB28181Platform"
          @delete-gb28181-platform="deleteGB28181Platform"
          @save-gb28181-platform="saveGB28181Platform"
          @update-dialog-visible="updateDialogVisible"
          @update-platform-name="updatePlatformName"
          @update-platform-ip="updatePlatformIp"
          @update-platform-port="updatePlatformPort"
          @update-device-id="updateDeviceId"
          @update-username="updateUsername"
          @update-password="updatePassword"
          @update-enabled="updateEnabled"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t('system.basic.storageSettings')" name="storage">
        <StorageManagement
          :video-storage-config="videoStorageConfig"
          :alarm-data-config="alarmDataConfig"
          :video-storage-rules="videoStorageRules"
          :alarm-data-rules="alarmDataRules"
          :storage-loading="storageLoading"
          @save-video-storage="saveVideoStorageConfig"
          @load-video-storage="loadVideoStorageConfig"
          @save-alarm-data="saveAlarmDataConfig"
          @load-alarm-data="loadAlarmDataConfig"
          @update-video-retention-days="updateVideoRetentionDays"
          @update-video-max-storage="updateVideoMaxStorage"
          @update-video-cyclic-overwrite="updateVideoCyclicOverwrite"
          @update-alarm-retention-days="updateAlarmRetentionDays"
          @update-alarm-max-records="updateAlarmMaxRecords"
          @update-alarm-cyclic-cleanup="updateAlarmCyclicCleanup"
        />
      </el-tab-pane>
      <el-tab-pane :label="$t('system.basic.systemMaintenanceTab')" name="maintenance">
        <MaintenanceManagement
          :maintenance-loading="maintenanceLoading"
          :restarting-service="restartingService"
          :rebooting-server="rebootingServer"
          @confirm-restart-service="confirmRestartService"
          @confirm-reboot-server="confirmRebootServer"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 保留所有原有的对话框和弹窗 -->
    <!-- 网络配置修改确认对话框 -->
    <el-dialog
      v-model="networkChangeDialogVisible"
      :title="$t('system.basic.confirmNetworkChange')"
      width="600px"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <div class="network-change-warning">
        <el-icon size="48" color="#E6A23C"><WarningFilled /></el-icon>
        <div class="warning-content">
          <h3>{{ $t('system.basic.networkChangeWarning') }}</h3>
          <div class="network-change-details">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="config-section">
                  <h4>{{ $t('system.basic.currentConfig') }}</h4>
                  <p><strong>{{ $t('system.basic.ipAddress') }}{{ $t('common.colon') }}</strong>{{ currentNetworkConfig.ip_address }}</p>
                  <p><strong>{{ $t('system.basic.subnetMask') }}{{ $t('common.colon') }}</strong>{{ currentNetworkConfig.subnet_mask }}</p>
                  <p><strong>{{ $t('system.basic.gateway') }}{{ $t('common.colon') }}</strong>{{ currentNetworkConfig.gateway }}</p>
                  <p><strong>{{ $t('system.basic.port') }}{{ $t('common.colon') }}</strong>{{ currentNetworkConfig.port }}</p>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="config-section">
                  <h4>{{ $t('system.basic.changeTo') }}</h4>
                  <p><strong>{{ $t('system.basic.ipAddress') }}{{ $t('common.colon') }}</strong>{{ networkConfig.ip_address }}</p>
                  <p><strong>{{ $t('system.basic.subnetMask') }}{{ $t('common.colon') }}</strong>{{ networkConfig.subnet_mask }}</p>
                  <p><strong>{{ $t('system.basic.gateway') }}{{ $t('common.colon') }}</strong>{{ networkConfig.gateway }}</p>
                  <p><strong>{{ $t('system.basic.port') }}{{ $t('common.colon') }}</strong>{{ networkConfig.port }}</p>
                </div>
              </el-col>
            </el-row>
            <div style="margin-top: 15px; text-align: center;">
              <p><strong>{{ $t('system.basic.newAccessUrl') }}{{ $t('common.colon') }}</strong><span style="color: #409EFF; font-size: 16px;">{{ getPreviewAccessUrl() }}</span></p>
            </div>
          </div>
          <div class="network-change-tips">
            <p>{{ $t('system.basic.networkChangeTip1') }}</p>
            <p>{{ $t('system.basic.networkChangeTip2') }}</p>
            <p>{{ $t('system.basic.networkChangeTip3') }}</p>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 20px; text-align: center;">
        <el-checkbox v-model="networkChangeConfirm">{{ $t('system.basic.confirmNetworkRisk') }}</el-checkbox>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="networkChangeDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="danger" @click="changeNetworkConfig" :disabled="!networkChangeConfirm" :loading="networkChanging">
            {{ $t('common.confirmChange') }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 网络配置修改进度对话框 -->
    <el-dialog
      v-model="networkChangeProgressVisible"
      :title="$t('system.basic.changingNetwork')"
      width="500px"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <div class="progress-content">
        <el-progress :percentage="networkChangeProgress" :status="networkChangeProgress === 100 ? 'success' : ''" />
        <p style="margin-top: 15px;">{{ networkChangeMessage }}</p>
        
        <div v-if="networkChangeProgress === 100" style="text-align: center; margin-top: 20px;">
          <el-alert 
            :title="$t('system.basic.networkChangeComplete')" 
            type="success" 
            :closable="false"
            style="margin-bottom: 15px;"
          >
            <template #default>
              <p>{{ $t('system.basic.useNewUrl') }}</p>
              <p style="font-weight: bold; color: #409EFF;">{{ getPreviewAccessUrl() }}</p>
            </template>
          </el-alert>
          <p>{{ $t('system.basic.pageWillRedirect', { seconds: countdown }) }}</p>
        </div>
      </div>
    </el-dialog>



    <!-- 重启确认对话框 -->
    <el-dialog
      v-model="restartDialogVisible"
      :title="restartDialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="restart-warning">
        <el-icon size="48" color="#F56C6C"><WarningFilled /></el-icon>
        <div class="warning-content">
          <h3>{{ restartDialogTitle }}</h3>
          <p>{{ restartDialogMessage }}</p>
          <div v-if="restartType === 'service'" class="restart-tips">
            <p>{{ $t('system.basic.serviceRestartTip1') }}</p>
            <p>{{ $t('system.basic.serviceRestartTip2') }}</p>
            <p>{{ $t('system.basic.serviceRestartTip3') }}</p>
          </div>
          <div v-else class="restart-tips">
            <p>{{ $t('system.basic.serverRestartTip1') }}</p>
            <p>{{ $t('system.basic.serverRestartTip2') }}</p>
            <p>{{ $t('system.basic.serverRestartTip3') }}</p>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="restartDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="danger" @click="performRestart" :loading="performingRestart">
            {{ restartType === 'service' ? $t('system.basic.confirmRestartService') : $t('system.basic.confirmRebootServer') }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 进度对话框（重启/恢复通用） -->
    <el-dialog
      v-model="restartProgressVisible"
      :title="restartProgressTitle"
      width="500px"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <div class="progress-content">
        <el-progress :percentage="restartProgress" :status="restartProgress === 100 ? 'success' : ''" />
        <p style="margin-top: 15px;">{{ restartProgressMessage }}</p>
        
        <!-- 服务重启完成后的倒计时 -->
        <div v-if="restartProgress === 100 && restartType === 'service'" style="text-align: center; margin-top: 20px;">
          <el-alert :title="$t('system.basic.serviceRestartComplete')" type="success" :closable="false">
            {{ $t('system.basic.pageWillRefresh', { seconds: serviceRestartCountdown }) }}
          </el-alert>
        </div>
        
      </div>
    </el-dialog>

    <!-- 端口修改对话框 -->
    <el-dialog
      v-model="portChangeDialogVisible"
      :title="$t('system.basic.changePort')"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="port-change-content">
        <el-alert
          type="warning"
          :closable="false"
          style="margin-bottom: 20px;"
        >
          <template #default>
            <p>{{ $t('system.basic.changePortTip') }}</p>
          </template>
        </el-alert>
        
        <el-form :model="{ port: newPort }" :rules="portRules" ref="portFormRef" label-width="100px">
          <el-form-item :label="$t('system.basic.currentPort')">
            <span>{{ currentNetworkConfig.port || '8080' }}</span>
          </el-form-item>
          <el-form-item :label="$t('system.basic.newPort')" prop="port">
            <el-input v-model="newPort" :placeholder="$t('system.basic.pleaseInputPort')"></el-input>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="portChangeDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="changePort" :loading="portChanging" :disabled="!isPortChanged">
            {{ $t('common.confirmChange') }}
          </el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { systemAPI } from '@/api/system'
import { updateBaseURL } from '@/api/index'
import { useI18n } from 'vue-i18n'

// 初始化 i18n
const { t } = useI18n()

// 导入子组件
import TimeManagement from './components/TimeManagement.vue'
import NetworkManagement from './components/NetworkManagement.vue'
import LogoManagement from './components/LogoManagement.vue'
import PlatformManagement from './components/PlatformManagement.vue'
import StorageManagement from './components/StorageManagement.vue'
import MaintenanceManagement from './components/MaintenanceManagement.vue'

// Tab相关
const activeTab = ref('time')

// 加载状态
const ntpLoading = ref(false)
const networkLoading = ref(false)
const logoLoading = ref(false)
const storageLoading = ref(false)
const syncLoading = ref(false)
const setTimeLoading = ref(false)
const uploading = ref(false)
const gb28181Loading = ref(false)
const maintenanceLoading = ref(false)
const restartingService = ref(false)
const rebootingServer = ref(false)
const performingRestart = ref(false)

// 自定义时区选择器相关
const showTimezoneDropdown = ref(false)
const timezoneOptions = ref([
  { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
  { label: 'Asia/Beijing', value: 'Asia/Beijing' },
  { label: 'UTC', value: 'UTC' },
  { label: 'America/New_York', value: 'America/New_York' }
])

// NTP配置
const ntpConfig = reactive({
  mode: 'ntp_client',
  server: '',
  timezone: 'Asia/Shanghai',
  status: 'unknown',
  auto_sync: false,
  current_time: '',
  system_time: '',
  time_offset: '',
  last_sync_time: ''
})

// 手动时间设置
const manualTime = ref('')
const currentTime = ref('')
const timeInterval = ref(null)

// 独立的时间状态管理
const clientModeTime = reactive({
  current_time: '',
  lastLoadTime: Date.now()
})

const serverModeTime = reactive({
  current_time: '',
  lastLoadTime: Date.now()
})

const lastConfigLoadTime = ref(Date.now())

// 网络配置
const networkConfig = reactive({
  ip_address: '',
  subnet_mask: '',
  gateway: '',
  port: ''
})

const currentNetworkConfig = reactive({
  ip_address: '',
  subnet_mask: '',
  gateway: '',
  port: ''
})

// 网络配置修改相关
const networkChangeDialogVisible = ref(false)
const networkChangeProgressVisible = ref(false)
const networkChangeConfirm = ref(false)
const networkChanging = ref(false)
const networkChangeProgress = ref(0)
const networkChangeMessage = ref('')
const countdown = ref(10)
const countdownInterval = ref(null)

// 端口修改相关
const portChangeDialogVisible = ref(false)
const newPort = ref('')
const portChanging = ref(false)

// 检查端口是否发生变化的计算属性
const isPortChanged = computed(() => {
  const currentPort = currentNetworkConfig.port || '8080'
  return newPort.value && newPort.value !== currentPort.toString()
})

// LOGO相关
const logoManagementRef = ref(null)
const currentLogo = reactive({
  url: '',
  name: '',
  size: 0
})
const logoPreview = ref('')
const logoFile = ref(null)

// GB28181平台相关
const gb28181Platforms = ref([])
const gb28181DialogVisible = ref(false)
const gb28181DialogMode = ref('add')
const gb28181FormData = reactive({
  id: null,
  platform_name: '',
  platform_ip: '',
  platform_port: 5060,
  device_id: '',
  username: '',
  password: '',
  enabled: true
})

// 存储策略配置
const videoStorageConfig = reactive({
  retention_days: 30,
  max_storage_gb: 1000,
  cyclic_overwrite: true
})

const alarmDataConfig = reactive({
  retention_days: 90,
  max_records: 100000,
  cyclic_cleanup: true
})

// 系统维护相关 - 仅保留重启相关

// 重启相关
const restartDialogVisible = ref(false)
const restartDialogTitle = ref('')
const restartDialogMessage = ref('')
const restartType = ref('')
const restartProgressVisible = ref(false)
const restartProgressTitle = ref('')
const restartProgressMessage = ref('')
const restartProgress = ref(0)
const serviceRestartCountdown = ref(10)


// 表单验证规则
const ntpRules = reactive({
  server: [{ required: true, message: t('system.basic.pleaseInputNtpServer'), trigger: 'blur' }],
  timezone: [{ required: true, message: t('system.basic.pleaseSelectTimezone'), trigger: 'change' }]
})

const networkRules = reactive({
  ip_address: [
    { required: true, message: t('system.basic.pleaseInputIpAddress'), trigger: 'blur' },
    { pattern: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, message: t('system.basic.pleaseInputCorrectIpFormat'), trigger: 'blur' }
  ],
  subnet_mask: [
    { required: true, message: t('system.basic.pleaseInputSubnetMask'), trigger: 'blur' },
    { pattern: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, message: t('system.basic.pleaseInputCorrectSubnetMaskFormat'), trigger: 'blur' }
  ],
  gateway: [
    { required: true, message: t('system.basic.pleaseInputGateway'), trigger: 'blur' },
    { pattern: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, message: t('system.basic.pleaseInputCorrectGatewayFormat'), trigger: 'blur' }
  ],
  port: [
    { required: true, message: t('system.basic.pleaseInputServicePort'), trigger: 'blur' },
    { pattern: /^[1-9]\d{0,4}$/, message: t('system.basic.portShouldBeNumber'), trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        const port = parseInt(value)
        if (port < 1 || port > 65535) {
          callback(new Error(t('system.basic.portRangeError')))
        } else if (port < 1024) {
          callback(new Error(t('system.basic.portRecommendation')))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
})

const gb28181Rules = reactive({
  platform_name: [{ required: true, message: t('system.basic.pleaseInputPlatformName'), trigger: 'blur' }],
  platform_ip: [
    { required: true, message: t('system.basic.pleaseInputPlatformIp'), trigger: 'blur' },
    { pattern: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, message: t('system.basic.pleaseInputCorrectIpFormat'), trigger: 'blur' }
  ],
  platform_port: [
    { required: true, message: t('system.basic.pleaseInputPlatformPort'), trigger: 'blur' },
    { type: 'number', min: 1000, max: 65535, message: t('system.basic.portRange1000To65535'), trigger: 'change' }
  ],
  device_id: [{ required: true, message: t('system.basic.pleaseInputDeviceId'), trigger: 'blur' }],
  username: [{ required: true, message: t('system.basic.pleaseInputUsername'), trigger: 'blur' }],
  password: [{ required: true, message: t('system.basic.pleaseInputPassword'), trigger: 'blur' }]
})

const videoStorageRules = reactive({
  retention_days: [
    { required: true, message: t('system.basic.pleaseInputRetentionDays'), trigger: 'blur' },
    { type: 'number', min: 1, max: 3650, message: t('system.basic.retentionDaysRange'), trigger: 'change' }
  ],
  max_storage_gb: [
    { required: true, message: t('system.basic.pleaseInputMaxStorage'), trigger: 'blur' },
    { type: 'number', min: 1, max: 100000, message: t('system.basic.storageCapacityRange'), trigger: 'change' }
  ]
})

const alarmDataRules = reactive({
  retention_days: [
    { required: true, message: t('system.basic.pleaseInputRetentionDays'), trigger: 'blur' },
    { type: 'number', min: 1, max: 3650, message: t('system.basic.retentionDaysRange'), trigger: 'change' }
  ],
  max_records: [
    { required: true, message: t('system.basic.pleaseInputMaxRecords'), trigger: 'blur' },
    { type: 'number', min: 1000, max: 10000000, message: t('system.basic.recordsRange'), trigger: 'change' }
  ]
})

const portRules = reactive({
  port: [
    { required: true, message: t('system.basic.pleaseInputServicePort'), trigger: 'blur' },
    { pattern: /^[1-9]\d{0,4}$/, message: t('system.basic.portShouldBeNumber'), trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        const port = parseInt(value)
        if (port < 1 || port > 65535) {
          callback(new Error(t('system.basic.portRangeError')))
        } else if (port < 1024) {
          callback(new Error(t('system.basic.portRecommendation')))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
})


// 时间相关方法
const loadNTPConfig = async () => {
  ntpLoading.value = true
  try {
    const response = await systemAPI.getNTPConfig()
    if (response.code === 200 || response.success) {
      const currentMode = ntpConfig.mode // 保存当前前端模式
      const configData = { ...response.data }
      
      // 将后端的manual模式映射为前端的ntp_server模式
      if (configData.mode === 'manual') {
        configData.mode = 'ntp_server'
      }
      
      Object.assign(ntpConfig, configData)
      
      // 如果有当前时间，更新对应模式的时间状态
      if (response.data.current_time) {
        lastConfigLoadTime.value = Date.now()
        
        // 根据后端返回的模式更新对应的时间状态
        if (response.data.mode === 'ntp_client' || response.data.mode === 'client') {
          clientModeTime.current_time = response.data.current_time
          clientModeTime.lastLoadTime = Date.now()
        } else if (response.data.mode === 'ntp_server' || response.data.mode === 'manual') {
          serverModeTime.current_time = response.data.current_time
          serverModeTime.lastLoadTime = Date.now()
        }
      }
      
      // 如果有前端模式保存，则恢复它
      if (currentMode) {
        ntpConfig.mode = currentMode
      }
      
      console.log('NTP配置加载完成:', {
        后端模式: response.data.mode,
        前端模式: ntpConfig.mode,
        时间: response.data.current_time,
        客户端时间: clientModeTime.current_time,
        服务器时间: serverModeTime.current_time
      })
    }
  } catch (error) {
    console.error('加载NTP配置失败:', error)
    ElMessage.error(t('system.basic.loadNtpConfigFailed'))
  } finally {
    ntpLoading.value = false
  }
}

const syncNTP = async () => {
  // 检查前置条件
  if (ntpConfig.mode !== 'ntp_client') {
    ElMessage.error(t('system.basic.onlyNtpClientCanSync'))
    return
  }
  
  if (!ntpConfig.server || ntpConfig.server.trim() === '') {
    ElMessage.error(t('system.basic.pleaseConfigNtpServer'))
    return
  }
  
  syncLoading.value = true
  try {
    console.log('开始时间同步:', {
      模式: ntpConfig.mode,
      服务器: ntpConfig.server,
      时区: ntpConfig.timezone
    })
    
    // 先保存当前配置，确保时区设置已保存到后端
    console.log('同步前先保存配置...')
    const configToSend = {
      server: ntpConfig.server,
      timezone: ntpConfig.timezone,
      mode: ntpConfig.mode === 'ntp_server' ? 'manual' : ntpConfig.mode
    }
    
    const saveResponse = await systemAPI.setNTPConfig(configToSend)
    if (!(saveResponse.code === 200 || saveResponse.success)) {
      console.error('保存配置失败:', saveResponse)
      ElMessage.error(t('system.basic.saveConfigFailed'))
      return
    }
    
    console.log('配置保存成功，开始同步...')
    
    // 执行同步
    const response = await systemAPI.syncNTP()
    console.log('同步响应:', response)
    
    if (response.success) {
      ElMessage.success(t('system.basic.ntpSyncSuccess'))
      
      // 保存当前前端模式
      const currentFrontendMode = ntpConfig.mode
      
      // 重新加载配置以获取最新的时间信息
      await loadNTPConfig()
      ntpConfig.mode = currentFrontendMode
      
      // 将同步后的时间保存到客户端模式时间状态
      if (ntpConfig.current_time) {
        clientModeTime.current_time = ntpConfig.current_time
        clientModeTime.lastLoadTime = Date.now()
      }
      
      // 立即更新时间显示以反映时区变化
      updateCurrentTime()
    } else {
      console.error('同步失败响应:', response)
      ElMessage.error(response.message || t('system.basic.ntpSyncFailed'))
    }
  } catch (error) {
    console.error('NTP同步失败:', error)
    // 提供更详细的错误信息
    let errorMessage = 'NTP同步失败'
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    // 为常见错误提供更友好的提示
    if (errorMessage.includes('服务器内部错误')) {
      errorMessage = 'NTP服务器连接失败，请检查服务器地址和网络连接'
    } else if (errorMessage.includes('未配置')) {
      errorMessage = '请先配置NTP服务器地址和时区'
    }
    
    ElMessage.error(errorMessage)
  } finally {
    syncLoading.value = false
  }
}

const setManualTime = async () => {
  if (!manualTime.value) {
    ElMessage.warning(t('system.basic.pleaseSelectTime'))
    return
  }
  
  setTimeLoading.value = true
  try {
    console.log('手动设置时间:', manualTime.value)
    
    // 使用与备份文件相同的格式
    const response = await systemAPI.setManualTime({
      time: manualTime.value,
      sync_mode: 'manual'
    })
    console.log('设置时间响应:', response)
    
    if (response.code === 200 || response.success) {
      ElMessage.success(t('system.basic.timeSetSuccess'))
      
      // 保存当前前端模式
      const currentFrontendMode = ntpConfig.mode
      
      // 将手动设置的时间保存到服务器模式时间状态
      serverModeTime.current_time = manualTime.value
      serverModeTime.lastLoadTime = Date.now()
      
      // 重新加载配置但保持前端模式
      await loadNTPConfig()
      ntpConfig.mode = currentFrontendMode
      
      // 立即更新时间显示
      updateCurrentTime()
    } else {
      console.error('设置时间失败响应:', response)
      ElMessage.error(response.message || response.data?.message || t('system.basic.timeSetFailed'))
    }
  } catch (error) {
    console.error('设置时间失败:', error)
    // 提供更详细的错误信息
    let errorMessage = '设置时间失败'
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    ElMessage.error(errorMessage)
  } finally {
    setTimeLoading.value = false
  }
}

const syncPCTime = async () => {
  setTimeLoading.value = true
  try {
    // 获取当前PC时间（前端时间）
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const seconds = now.getSeconds().toString().padStart(2, '0')
    
    const currentDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    console.log('同步PC时间:', currentDateTime)
    
    // 使用与备份文件相同的格式
    const response = await systemAPI.setManualTime({
      time: currentDateTime,
      sync_mode: 'manual'
    })
    console.log('PC时间同步响应:', response)
    
    if (response.code === 200 || response.success) {
      ElMessage.success(t('system.basic.pcTimeSyncSuccess'))
      
      // 保存当前前端模式
      const currentFrontendMode = ntpConfig.mode
      
      // 将PC时间保存到服务器模式时间状态
      serverModeTime.current_time = currentDateTime
      serverModeTime.lastLoadTime = Date.now()
      
      // 同时更新手动时间选择器的值
      manualTime.value = currentDateTime
      
      // 重新加载配置但保持前端模式
      await loadNTPConfig()
      ntpConfig.mode = currentFrontendMode
      
      // 立即更新时间显示
      updateCurrentTime()
    } else {
      console.error('PC时间同步失败响应:', response)
      ElMessage.error(response.message || response.data?.message || t('system.basic.pcTimeSyncFailed'))
    }
  } catch (error) {
    console.error('PC时间同步失败:', error)
    // 提供更详细的错误信息
    let errorMessage = 'PC时间同步失败'
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    ElMessage.error(errorMessage)
  } finally {
    setTimeLoading.value = false
  }
}

const saveNTPConfig = async () => {
  ntpLoading.value = true
  try {
    // 准备发送给后端的配置，只发送后端需要的字段
    const configToSend = {
      server: ntpConfig.server,
      timezone: ntpConfig.timezone,
      mode: ntpConfig.mode === 'ntp_server' ? 'manual' : ntpConfig.mode
    }
    
    // 调试日志
    console.log('保存NTP配置:', {
      前端模式: ntpConfig.mode,
      后端模式: configToSend.mode,
      服务器: configToSend.server,
      时区: configToSend.timezone
    })
    
    // 保存当前前端模式
    const currentFrontendMode = ntpConfig.mode
    
    const response = await systemAPI.setNTPConfig(configToSend)
    if (response.code === 200 || response.success) {
      ElMessage.success(t('system.basic.ntpConfigSaveSuccess'))
      // 重新加载配置但保持前端模式
      await loadNTPConfig()
      // 确保模式保持不变
      ntpConfig.mode = currentFrontendMode
    } else {
      console.error('保存失败响应:', response)
      ElMessage.error(response.message || response.data?.message || t('system.basic.ntpConfigSaveFailed'))
    }
  } catch (error) {
    console.error('保存NTP配置失败:', error)
    // 提供更详细的错误信息
    let errorMessage = '保存NTP配置失败'
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    ElMessage.error(errorMessage)
  } finally {
    ntpLoading.value = false
  }
}

const resetNTPForm = () => {
  loadNTPConfig()
}

// 网络相关方法
const loadNetworkConfig = async () => {
  networkLoading.value = true
  try {
    const response = await systemAPI.getNetworkConfig()
    if (response.success) {
      Object.assign(currentNetworkConfig, response.data)
      Object.assign(networkConfig, response.data)
    }
  } catch (error) {
    console.error('加载网络配置失败:', error)
    ElMessage.error(t('system.basic.loadNetworkConfigFailed'))
  } finally {
    networkLoading.value = false
  }
}

const showNetworkChangeDialog = () => {
  // 检查是否有任何配置发生了变化
  if (networkConfig.ip_address === currentNetworkConfig.ip_address &&
      networkConfig.subnet_mask === currentNetworkConfig.subnet_mask &&
      networkConfig.gateway === currentNetworkConfig.gateway &&
      networkConfig.port === currentNetworkConfig.port) {
    ElMessage.warning(t('system.basic.pleaseModifyNetworkConfig'))
    return
  }
  networkChangeDialogVisible.value = true
  networkChangeConfirm.value = false
}

const resetNetworkForm = () => {
  Object.assign(networkConfig, currentNetworkConfig)
}

// LOGO相关方法
const loadCurrentLogo = async () => {
  logoLoading.value = true
  try {
    const response = await systemAPI.getCurrentLogo()
    if (response.success && response.data) {
      Object.assign(currentLogo, response.data)
    } else {
      currentLogo.url = ''
      currentLogo.name = ''
      currentLogo.size = 0
    }
  } catch (error) {
    console.error('加载LOGO失败:', error)
    ElMessage.error(t('system.basic.loadLogoFailed'))
  } finally {
    logoLoading.value = false
  }
}

const deleteLogo = async () => {
  try {
    await ElMessageBox.confirm(t('system.basic.confirmRestoreDefaultLogo'), t('common.confirm'), {
      type: 'warning'
    })
    
    logoLoading.value = true
    const response = await systemAPI.deleteLogo()
    if (response.success) {
      ElMessage.success(t('system.basic.restoreDefaultLogoSuccess'))
      await loadCurrentLogo()
    } else {
      ElMessage.error(response.message || t('system.basic.restoreDefaultLogoFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除LOGO失败:', error)
      ElMessage.error(t('system.basic.deleteLogoFailed'))
    }
  } finally {
    logoLoading.value = false
  }
}

const handleLogoChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
  logoFile.value = file.raw
}

const triggerReselect = () => {
  // 通过引用触发隐藏上传组件的点击事件
  if (logoManagementRef.value && logoManagementRef.value.$refs.hiddenLogoUploadRef) {
    const input = logoManagementRef.value.$refs.hiddenLogoUploadRef.$el.querySelector('input')
    if (input) {
      input.click()
    }
  }
}

const uploadLogo = async () => {
  if (!logoFile.value) {
    ElMessage.warning(t('system.basic.pleaseSelectLogoFile'))
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('logo', logoFile.value)
    
    const response = await systemAPI.uploadLogo(formData)
    if (response.success) {
      ElMessage.success(t('system.basic.logoChangeSuccess'))
      clearLogoPreview()
      await loadCurrentLogo()
    } else {
      ElMessage.error(response.message || t('system.basic.logoChangeFailed'))
    }
  } catch (error) {
    console.error('上传LOGO失败:', error)
    ElMessage.error(t('system.basic.uploadLogoFailed'))
  } finally {
    uploading.value = false
  }
}

const clearLogoPreview = () => {
  logoPreview.value = ''
  logoFile.value = null
}

// GB28181平台相关方法
const loadGB28181Platforms = async () => {
  gb28181Loading.value = true
  try {
    const response = await systemAPI.getGB28181Platforms()
    if (response.success) {
      gb28181Platforms.value = response.data || []
    }
  } catch (error) {
    console.error('加载GB28181平台失败:', error)
    ElMessage.error(t('system.basic.loadGB28181PlatformFailed'))
  } finally {
    gb28181Loading.value = false
  }
}

const showAddGB28181Dialog = () => {
  gb28181DialogMode.value = 'add'
  resetGB28181Form()
  gb28181DialogVisible.value = true
}

const editGB28181Platform = (row) => {
  gb28181DialogMode.value = 'edit'
  Object.assign(gb28181FormData, row)
  gb28181DialogVisible.value = true
}

const resetGB28181Form = () => {
  Object.assign(gb28181FormData, {
    id: null,
    platform_name: '',
    platform_ip: '',
    platform_port: 5060,
    device_id: '',
    username: '',
    password: '',
    enabled: true
  })
}

const saveGB28181Platform = async () => {
  gb28181Loading.value = true
  try {
    let response
    if (gb28181DialogMode.value === 'add') {
      response = await systemAPI.addGB28181Platform(gb28181FormData)
    } else {
      response = await systemAPI.updateGB28181Platform(gb28181FormData.id, gb28181FormData)
    }
    
    if (response.success) {
      const action = gb28181DialogMode.value === 'add' ? t('common.add') : t('common.update')
      ElMessage.success(t('system.basic.saveGB28181PlatformSuccess', { action }))
      gb28181DialogVisible.value = false
      await loadGB28181Platforms()
    } else {
      const action = gb28181DialogMode.value === 'add' ? t('common.add') : t('common.update')
      ElMessage.error(response.message || t('system.basic.saveGB28181PlatformFailed', { action }))
    }
  } catch (error) {
    console.error('保存GB28181平台失败:', error)
    ElMessage.error(t('system.basic.saveGB28181PlatformError'))
  } finally {
    gb28181Loading.value = false
  }
}

const toggleGB28181Platform = async (row) => {
  row.switching = true
  try {
    const response = await systemAPI.toggleGB28181Platform(row.id, row.enabled)
    if (response.success) {
      ElMessage.success(row.enabled ? t('system.basic.platformEnableSuccess') : t('system.basic.platformDisableSuccess'))
      await loadGB28181Platforms()
    } else {
      row.enabled = !row.enabled
      ElMessage.error(response.message || t('common.statusToggleFailed'))
    }
  } catch (error) {
    row.enabled = !row.enabled
    console.error('切换平台状态失败:', error)
    ElMessage.error(t('system.basic.platformToggleFailed'))
  } finally {
    row.switching = false
  }
}

const testGB28181Connection = async (row) => {
  row.testing = true
  try {
    const response = await systemAPI.testGB28181Connection(row.id)
    if (response.success) {
      ElMessage.success(t('common.testConnectionSuccess'))
    } else {
      ElMessage.error(response.message || t('common.testConnectionFailed'))
    }
  } catch (error) {
    console.error('测试连接失败:', error)
    ElMessage.error(t('common.testConnectionFailed'))
  } finally {
    row.testing = false
  }
}

const deleteGB28181Platform = async (row) => {
  try {
    await ElMessageBox.confirm(t('common.confirmDeleteWithName', { name: row.platform_name }), t('common.confirmDeleteTitle'), {
      type: 'warning'
    })
    
    gb28181Loading.value = true
    const response = await systemAPI.deleteGB28181Platform(row.id)
    if (response.success) {
      ElMessage.success(t('common.deleteSuccess'))
      await loadGB28181Platforms()
    } else {
      ElMessage.error(response.message || t('common.deleteFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除GB28181平台失败:', error)
      ElMessage.error(t('common.deleteFailed'))
    }
  } finally {
    gb28181Loading.value = false
  }
}

// 存储策略相关方法
const loadVideoStorageConfig = async () => {
  storageLoading.value = true
  try {
    const response = await systemAPI.getVideoStorageConfig()
    if (response.success) {
      Object.assign(videoStorageConfig, response.data)
    }
  } catch (error) {
    console.error('加载录像存储配置失败:', error)
    ElMessage.error(t('system.basic.loadVideoStorageConfigFailed'))
  } finally {
    storageLoading.value = false
  }
}

const saveVideoStorageConfig = async () => {
  storageLoading.value = true
  try {
    const response = await systemAPI.setVideoStorageConfig(videoStorageConfig)
    if (response.success) {
      ElMessage.success(t('system.basic.saveVideoStorageConfigSuccess'))
    } else {
      ElMessage.error(response.message || t('system.basic.saveVideoStorageConfigFailed'))
    }
  } catch (error) {
    console.error('保存录像存储配置失败:', error)
    ElMessage.error(t('system.basic.saveVideoStorageConfigFailed'))
  } finally {
    storageLoading.value = false
  }
}

const loadAlarmDataConfig = async () => {
  storageLoading.value = true
  try {
    const response = await systemAPI.getAlarmDataConfig()
    if (response.success) {
      Object.assign(alarmDataConfig, response.data)
    }
  } catch (error) {
    console.error('加载告警数据配置失败:', error)
    ElMessage.error(t('system.basic.loadAlarmDataConfigFailed'))
  } finally {
    storageLoading.value = false
  }
}

const saveAlarmDataConfig = async () => {
  storageLoading.value = true
  try {
    const response = await systemAPI.setAlarmDataConfig(alarmDataConfig)
    if (response.success) {
      ElMessage.success(t('system.basic.saveAlarmDataConfigSuccess'))
    } else {
      ElMessage.error(response.message || t('system.basic.saveAlarmDataConfigFailed'))
    }
  } catch (error) {
    console.error('保存告警数据配置失败:', error)
    ElMessage.error(t('system.basic.saveAlarmDataConfigFailed'))
  } finally {
    storageLoading.value = false
  }
}

// 系统维护相关方法 - 仅保留重启相关

const confirmRestartService = () => {
  restartType.value = 'service'
  restartDialogTitle.value = t('system.basic.confirmRestartServiceTitle')
  restartDialogMessage.value = t('system.basic.confirmRestartServiceMessage')
  restartDialogVisible.value = true
}

const confirmRebootServer = () => {
  restartType.value = 'server'
  restartDialogTitle.value = t('system.basic.confirmRebootServerTitle')
  restartDialogMessage.value = t('system.basic.confirmRebootServerMessage')
  restartDialogVisible.value = true
}

const performRestart = async () => {
  performingRestart.value = true
  restartDialogVisible.value = false
  
  try {
    let response
    if (restartType.value === 'service') {
      response = await systemAPI.restartService()
      restartProgressTitle.value = t('system.basic.restartService')
    } else {
      response = await systemAPI.rebootServer()
      restartProgressTitle.value = t('system.basic.restartServer')
    }
    
    if (response.success) {
      restartProgressVisible.value = true
      startRestartProgress()
    } else {
      ElMessage.error(response.message || t('system.basic.restartFailed'))
    }
  } catch (error) {
    console.error('重启失败:', error)
    ElMessage.error(t('system.basic.restartFailed'))
  } finally {
    performingRestart.value = false
  }
}

const startRestartProgress = () => {
  restartProgress.value = 0
  restartProgressMessage.value = restartType.value === 'service' ? t('system.basic.restartingService') : t('system.basic.restartingServer')
  
  const progressInterval = setInterval(() => {
    restartProgress.value += 2
    if (restartProgress.value >= 100) {
      clearInterval(progressInterval)
      restartProgress.value = 100
      restartProgressMessage.value = restartType.value === 'service' ? t('system.basic.serviceRestartComplete') : t('system.basic.serverRestartComplete')
      
      if (restartType.value === 'service') {
        startServiceRestartCountdown()
      }
    }
  }, 1000)
}

const startServiceRestartCountdown = () => {
  serviceRestartCountdown.value = 10
  const countdownTimer = setInterval(() => {
    serviceRestartCountdown.value--
    if (serviceRestartCountdown.value <= 0) {
      clearInterval(countdownTimer)
      location.reload()
    }
  }, 1000)
}

// 工具方法
const toggleTimezoneDropdown = () => {
  showTimezoneDropdown.value = !showTimezoneDropdown.value
}

const selectTimezone = (value) => {
  ntpConfig.timezone = value
  showTimezoneDropdown.value = false
}

const updateNtpMode = (value) => {
  const oldMode = ntpConfig.mode
  ntpConfig.mode = value
  
  console.log(`模式从 ${oldMode} 切换到 ${value}`)
  
  // 立即更新时间显示以使用对应模式的时间
  updateCurrentTime()
}

const updateTimezone = (value) => {
  console.log('时区更新:', value)
  ntpConfig.timezone = value
  showTimezoneDropdown.value = false
  
  // 提示用户保存配置
  if (ntpConfig.mode === 'ntp_client') {
    ElMessage.info(t('system.basic.timezoneChanged'))
  }
}

const updateManualTime = (value) => {
  manualTime.value = value
}

const updateNtpServer = (value) => {
  ntpConfig.server = value
}

// 网络配置更新方法
const updateIpAddress = (value) => {
  networkConfig.ip_address = value
}

const updateSubnetMask = (value) => {
  networkConfig.subnet_mask = value
}

const updateGateway = (value) => {
  networkConfig.gateway = value
}

const updatePort = (value) => {
  networkConfig.port = value
}

const showPortChangeDialog = () => {
  portChangeDialogVisible.value = true
  newPort.value = currentNetworkConfig.port || '8080'
}

const changePort = async () => {
  // 检查端口是否真的发生了变化
  if (!isPortChanged.value) {
    ElMessage.info(t('system.basic.portNotChanged'))
    return
  }

  // 表单验证
  try {
    portChanging.value = true
    
    // 调用端口修改API
    const portResponse = await systemAPI.setPortConfig({ port: newPort.value })
    if (portResponse.code !== 200 && !portResponse.success) {
      ElMessage.error(portResponse.message || t('system.basic.portChangeFailed'))
      return
    }
    
    ElMessage.success(t('system.basic.portChangeSuccess'))
    
    // 立即更新API请求的baseURL到新端口
    updateBaseURL(newPort.value)
    
    // 更新当前配置和表单中的端口
    currentNetworkConfig.port = newPort.value
    networkConfig.port = newPort.value
    
    // 关闭对话框
    portChangeDialogVisible.value = false
  } catch (error) {
    console.error('修改端口失败:', error)
    ElMessage.error(t('system.basic.portModifyFailed'))
  } finally {
    portChanging.value = false
  }
}

// GB28181平台更新方法
const updateDialogVisible = (value) => {
  gb28181DialogVisible.value = value
}

const updatePlatformName = (value) => {
  gb28181FormData.platform_name = value
}

const updatePlatformIp = (value) => {
  gb28181FormData.platform_ip = value
}

const updatePlatformPort = (value) => {
  gb28181FormData.platform_port = value
}

const updateDeviceId = (value) => {
  gb28181FormData.device_id = value
}

const updateUsername = (value) => {
  gb28181FormData.username = value
}

const updatePassword = (value) => {
  gb28181FormData.password = value
}

const updateEnabled = (value) => {
  gb28181FormData.enabled = value
}

// 存储配置更新方法
const updateVideoRetentionDays = (value) => {
  videoStorageConfig.retention_days = value
}

const updateVideoMaxStorage = (value) => {
  videoStorageConfig.max_storage_gb = value
}

const updateVideoCyclicOverwrite = (value) => {
  videoStorageConfig.cyclic_overwrite = value
}

const updateAlarmRetentionDays = (value) => {
  alarmDataConfig.retention_days = value
}

const updateAlarmMaxRecords = (value) => {
  alarmDataConfig.max_records = value
}

const updateAlarmCyclicCleanup = (value) => {
  alarmDataConfig.cyclic_cleanup = value
}


// eslint-disable-next-line no-unused-vars
const getCurrentAccessUrl = () => {
  // 获取当前浏览器地址栏的地址
  return window.location.origin
}

// eslint-disable-next-line no-unused-vars
const getBackendConfigUrl = () => {
  const ip = currentNetworkConfig.ip_address || 'localhost'
  const port = currentNetworkConfig.port || '8080'
  return `http://${ip}:${port}`
}

const getPreviewAccessUrl = () => {
  const ip = networkConfig.ip_address || 'localhost'
  const port = networkConfig.port || currentNetworkConfig.port || '8080'
  return `http://${ip}:${port}`
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(t('common.copyToClipboard'))
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error(t('common.copyFailed'))
  }
}

const changeNetworkConfig = async () => {
  networkChanging.value = true
  networkChangeDialogVisible.value = false
  
  try {
    // 修改网络配置（IP、子网掩码、网关）
    const networkResponse = await systemAPI.setNetworkConfig({
      ip_address: networkConfig.ip_address,
      subnet_mask: networkConfig.subnet_mask,
      gateway: networkConfig.gateway
    })
    
    if (networkResponse.code !== 200 && !networkResponse.success) {
      ElMessage.error(networkResponse.message || t('system.basic.networkConfigChangeFailed'))
      return
    }
    
    // 修改成功，显示进度
    networkChangeProgressVisible.value = true
    startNetworkChangeProgress()
    
  } catch (error) {
    console.error('修改网络配置失败:', error)
    ElMessage.error(t('system.basic.networkConfigChangeFailed'))
  } finally {
    networkChanging.value = false
  }
}

const startNetworkChangeProgress = () => {
  networkChangeProgress.value = 0
  networkChangeMessage.value = t('system.basic.changingNetworkConfig')
  
  const progressInterval = setInterval(() => {
    networkChangeProgress.value += 3
    if (networkChangeProgress.value >= 100) {
      clearInterval(progressInterval)
      networkChangeProgress.value = 100
      networkChangeMessage.value = t('system.basic.networkConfigChangeComplete')
      startNetworkChangeCountdown()
    }
  }, 1000)
}

const startNetworkChangeCountdown = () => {
  countdown.value = 10
  countdownInterval.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval.value)
      jumpToNewUrl()
    }
  }, 1000)
}

const jumpToNewUrl = () => {
  const newUrl = getPreviewAccessUrl()
  window.location.href = newUrl
}

const updateCurrentTime = () => {
  let targetTime = ''
  let targetLoadTime = Date.now()
  
  // 根据当前模式选择相应的时间状态
  if (ntpConfig.mode === 'ntp_client') {
    // 客户端模式：优先使用客户端时间，否则使用通用时间
    if (clientModeTime.current_time) {
      targetTime = clientModeTime.current_time
      targetLoadTime = clientModeTime.lastLoadTime
    } else if (ntpConfig.current_time) {
      targetTime = ntpConfig.current_time
      targetLoadTime = lastConfigLoadTime.value
    }
  } else if (ntpConfig.mode === 'ntp_server') {
    // 服务器模式：优先使用服务器时间，否则使用通用时间
    if (serverModeTime.current_time) {
      targetTime = serverModeTime.current_time
      targetLoadTime = serverModeTime.lastLoadTime
    } else if (ntpConfig.current_time) {
      targetTime = ntpConfig.current_time
      targetLoadTime = lastConfigLoadTime.value
    }
  }
  
  // 如果有目标时间，基于它计算当前时间
  if (targetTime) {
    const programTime = new Date(targetTime)
    if (!isNaN(programTime.getTime())) {
      // 如果程序时间有效，使用它并加上经过的时间
      const now = new Date(programTime.getTime() + (Date.now() - targetLoadTime))
      const year = now.getFullYear()
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const day = now.getDate().toString().padStart(2, '0')
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const seconds = now.getSeconds().toString().padStart(2, '0')
      
      currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      return
    }
  }
  
  // 后备方案：使用PC时间
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  
  currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}


// 监听路由参数，设置默认选项卡
watch(() => activeTab.value, (newTab, oldTab) => {
  if (oldTab && newTab !== oldTab) {
    nextTick(() => {
      window.dispatchEvent(new CustomEvent('tab-changed', {
        detail: {
          newTab: newTab,
          oldTab: oldTab
        }
      }))
    })
  }
}, { immediate: true })


// 生命周期
onMounted(async () => {
  const tab = new URLSearchParams(window.location.search).get('tab')
  if (tab && ['time', 'network', 'appearance', 'platform', 'storage', 'maintenance'].includes(tab)) {
    activeTab.value = tab
  }
  
  await Promise.all([
    loadNTPConfig(),
    loadNetworkConfig(),
    loadCurrentLogo(),
    loadGB28181Platforms(),
    loadVideoStorageConfig(),
    loadAlarmDataConfig()
  ])
  
  timeInterval.value = setInterval(updateCurrentTime, 1000)
  
  // 添加全局点击事件，用于关闭时区下拉框
  document.addEventListener('click', handleGlobalClick)
})

// 处理全局点击事件
const handleGlobalClick = (event) => {
  // 如果点击的不是时区选择器相关元素，则关闭下拉框
  if (!event.target.closest('.custom-select-container')) {
    showTimezoneDropdown.value = false
  }
}


onUnmounted(() => {
  if (timeInterval.value) {
    clearInterval(timeInterval.value)
  }
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }
  // 移除全局点击事件监听器
  document.removeEventListener('click', handleGlobalClick)
})
</script>

<style scoped>
/* 科技感主题样式 */
.tech-page-container {
  position: relative;
  width: 100%;
  min-height: 100%;
  height: auto;
  padding: 20px;
  padding-bottom: 100px;
  background: transparent;
  overflow: visible;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.tech-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* 科技感卡片 */
.tech-card {
  position: relative;
  z-index: 10;
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
  margin-bottom: 20px;
}

.tech-card :deep(.el-card__header) {
  background: rgba(20, 30, 50, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
  color: #00ffff !important;
  padding: 16px 20px !important;
}

/* 强制覆盖Element Plus卡片头部的默认样式 */
.tech-card :deep(.el-card__header .card-header) {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  flex-direction: row !important;
  width: 100% !important;
}

.tech-card :deep(.el-card__body) {
  background: rgba(15, 25, 45, 0.95) !important;
  padding: 20px !important;
  border-radius: 0 0 12px 12px !important;
}

.config-card {
  margin-bottom: 24px;
}

/* 卡片头部样式 */
.card-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  font-weight: bold;
  color: #00ffff;
  width: 100% !important;
  flex-direction: row !important;
}

.card-header span {
  flex: 1 !important;
  white-space: nowrap !important;
}

.card-header > div {
  display: flex !important;
  align-items: center !important;
  flex-shrink: 0 !important;
  margin-left: auto !important;
}

.card-header .el-button {
  margin-left: 8px !important;
  flex-shrink: 0 !important;
}

.card-header .el-button:first-child {
  margin-left: 0 !important;
}

/* 科技感按钮 */
.tech-button-sm {
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  font-size: 12px !important;
  padding: 6px 12px !important;
}

.tech-button-sm:hover {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-1px) !important;
}

/* 科技感主要按钮 */
.tech-button {
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  font-weight: 500 !important;
  padding: 10px 20px !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3) !important;
}

.tech-button:hover {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-1px) !important;
  border-color: rgba(0, 255, 255, 0.6) !important;
}

/* 科技感次要按钮 */
.tech-button-secondary {
  border: 1px solid rgba(128, 128, 128, 0.4) !important;
  background: rgba(64, 64, 64, 0.1) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  font-weight: 500 !important;
  padding: 10px 20px !important;
}

.tech-button-secondary:hover {
  background: rgba(128, 128, 128, 0.2) !important;
  box-shadow: 0 0 15px rgba(128, 128, 128, 0.3) !important;
  transform: translateY(-1px) !important;
  color: #ffffff !important;
  border-color: rgba(128, 128, 128, 0.6) !important;
}

/* 科技感危险按钮 */
.tech-button-danger {
  border: 1px solid rgba(255, 82, 82, 0.4) !important;
  background: rgba(255, 82, 82, 0.1) !important;
  color: #ff5252 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  font-weight: 500 !important;
  padding: 10px 20px !important;
  text-shadow: 0 0 5px rgba(255, 82, 82, 0.3) !important;
}

.tech-button-danger:hover {
  background: rgba(255, 82, 82, 0.2) !important;
  box-shadow: 0 0 20px rgba(255, 82, 82, 0.4) !important;
  transform: translateY(-1px) !important;
  border-color: rgba(255, 82, 82, 0.6) !important;
}

/* 科技感警告按钮 */
.tech-button-warning {
  border: 1px solid rgba(255, 193, 7, 0.4) !important;
  background: rgba(255, 193, 7, 0.1) !important;
  color: #ffc107 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  font-weight: 500 !important;
  padding: 10px 20px !important;
  text-shadow: 0 0 5px rgba(255, 193, 7, 0.3) !important;
}

.tech-button-warning:hover {
  background: rgba(255, 193, 7, 0.2) !important;
  box-shadow: 0 0 20px rgba(255, 193, 7, 0.4) !important;
  transform: translateY(-1px) !important;
  border-color: rgba(255, 193, 7, 0.6) !important;
}

/* 网络配置修改对话框样式 */
.network-change-warning {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.network-change-details {
  margin: 20px 0;
  width: 100%;
}

.config-section {
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.config-section h4 {
  color: #00ffff;
  margin: 0 0 10px 0;
  font-size: 16px;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
}

.config-section p {
  margin: 5px 0;
  color: rgba(255, 255, 255, 0.9);
}

.network-change-tips {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
  text-align: left;
}

.network-change-tips p {
  margin: 5px 0;
  color: rgba(255, 255, 255, 0.9);
}

.tech-tabs {
  position: relative;
  z-index: 10;
}

.tech-tabs :deep(.el-tabs) {
  border: none !important;
}

.tech-tabs :deep(.el-tabs__header) {
  border-bottom: none;
}

.tech-tabs :deep(.el-tabs__nav-wrap::after) {
  background-color: transparent !important;
}

.tech-tabs :deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-weight: 500;
  border: none !important;
  background: rgba(0, 255, 255, 0.05) !important;
  border-radius: 8px 8px 0 0 !important;
  margin-right: 2px !important;
  padding: 12px 20px !important;
  transition: all 0.3s ease !important;
  height: auto !important;
  line-height: 1.4 !important;
}

.tech-tabs :deep(.el-tabs__item:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.tech-tabs :deep(.el-tabs__item.is-active) {
  color: #00ffff !important;
  background: rgba(0, 255, 255, 0.15) !important;
  border: none !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

.tech-tabs :deep(.el-tabs__active-bar) {
  background-color: #00ffff !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.tech-tabs :deep(.el-tabs__content) {
  position: relative;
  z-index: 10;
  background: transparent;
  border: none !important;
}

.basic-management-container {
  padding: 20px;
  padding-bottom: 60px;
  min-height: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
}

.basic-management-container h2 {
  margin: 24px 0 20px 0;
  color: #00ffff;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  position: relative;
  z-index: 10;
}

.management-tabs {
  display: flex;
  flex-direction: column;
  border: none !important;
  overflow: visible;
  height: auto;
}

.management-tabs :deep(.el-tabs__content) {
  padding: 20px 0 0 0;
  display: flex;
  flex-direction: column;
  border: none !important;
  overflow: visible;
  height: auto;
  min-height: auto;
}

.management-tabs :deep(.el-tab-pane) {
  display: flex;
  flex-direction: column;
  border: none !important;
  overflow: visible;
  height: auto;
  min-height: auto;
}

.management-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.management-tabs :deep(.el-tabs__nav-wrap) {
  padding-left: 0;
}

/* 科技感表格 */
.tech-table {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
}

.tech-table :deep(.el-table) {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  border: none !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header thead tr th) {
  background: rgba(20, 30, 50, 0.9) !important;
  color: #00ffff !important;
  border-bottom: 2px solid rgba(0, 255, 255, 0.3) !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
  padding: 16px 12px !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr) {
  background: rgba(25, 35, 55, 0.6) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.08) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(even)) {
  background: rgba(20, 30, 50, 0.7) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:hover) {
  background: rgba(0, 255, 255, 0.08) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.15) !important;
  transform: translateY(-1px) !important;
}

/* 输入框通用样式 */
:deep(.el-input__wrapper) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 4px !important;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.3),
    0 0 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #00ffff !important;
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.3),
    0 0 12px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-input__inner) {
  color: #ffffff !important;
  background: transparent !important;
  border: none !important;
  font-size: 14px !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 重启卡片样式 */
.restart-card :deep(.el-card) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
}

.restart-card :deep(.el-card__body) {
  background: rgba(15, 25, 45, 0.95) !important;
  padding: 20px !important;
}

.restart-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 20, 40, 0.3);
  position: relative;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.restart-item:hover {
  background: rgba(0, 255, 255, 0.05);
  border-color: rgba(0, 255, 255, 0.4);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
}

/* ==================== LOGO管理样式 ==================== */

/* LOGO管理容器 */
.logo-management-container {
  padding: 24px 0;
}

/* LOGO区块 */
.logo-section {
  height: 100%;
  min-height: 320px;
  display: flex;
  flex-direction: column;
}

/* 区块标题 */
.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #00ffff !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}

/* 预览容器 */
.preview-container {
  flex: 1;
  min-height: 180px;
  border: 2px dashed rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 20, 40, 0.3);
  position: relative;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.preview-container:hover {
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
}

/* 可点击的预览容器 */
.preview-container.clickable {
  cursor: pointer;
}

.preview-container.clickable:hover .preview-overlay {
  opacity: 1;
}

/* 预览覆盖层 */
.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 6px;
}

.overlay-icon {
  font-size: 32px;
  color: #00ffff;
  margin-bottom: 8px;
}

.overlay-text {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

/* LOGO图片 */
.logo-image {
  max-width: 90%;
  max-height: 140px;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  object-fit: contain;
  transition: all 0.3s ease;
}

.logo-image:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

/* 无LOGO状态 */
.no-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(255, 255, 255, 0.6) !important;
}

.no-logo-icon {
  font-size: 48px;
  color: rgba(0, 255, 255, 0.4) !important;
  margin-bottom: 12px;
}

/* LOGO操作按钮 */
.logo-actions {
  margin-top: 12px;
  text-align: center;
}

/* 上传区域 */
.upload-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 上传器样式 */
.logo-uploader {
  flex: 1;
  margin-bottom: 20px;
}

.logo-uploader :deep(.el-upload) {
  width: 100%;
  height: 180px;
  border: 2px dashed rgba(0, 255, 255, 0.3) !important;
  background: rgba(0, 20, 40, 0.3) !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.logo-uploader :deep(.el-upload:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2) !important;
}

/* 上传触发器 */
.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 20px;
}

.upload-trigger:hover {
  color: #00ffff;
  transform: translateY(-2px);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: rgba(0, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.upload-trigger:hover .upload-icon {
  color: #00ffff;
  transform: scale(1.1);
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
}

/* 上传操作按钮 */
.upload-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.upload-actions .el-button {
  flex: 1;
  max-width: 120px;
}

/* 上传提示 */
.upload-tips {
  background: rgba(0, 20, 40, 0.4);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 6px;
  padding: 16px;
  margin-top: auto;
}

.tip-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7) !important;
  line-height: 1.4;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-icon {
  font-size: 14px;
  margin-right: 8px;
  color: rgba(0, 255, 255, 0.6) !important;
  flex-shrink: 0;
}

/* ==================== 网络管理样式 ==================== */

/* 网络信息显示样式 */
.network-value {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95) !important;
}

.link-value {
  color: #00ffff !important;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.link-value:hover {
  color: #66d9ff !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}

.preview-url {
  color: #e6a23c !important;
  font-weight: 600;
  text-shadow: 0 0 5px rgba(230, 162, 60, 0.3) !important;
}

.copy-icon {
  font-size: 12px;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.link-value:hover .copy-icon {
  opacity: 1;
  transform: scale(1.1);
}

/* ==================== 时区选择器样式 ==================== */

/* 主容器 */
.custom-timezone-selector {
  position: relative;
  width: 100%;
  cursor: pointer;
  user-select: none;
}

/* 显示区域 - 完全匹配日期时间选择器样式 */
.timezone-display {
  background: rgba(0, 20, 40, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  height: 32px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timezone-display:hover {
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}

.custom-timezone-selector.focused .timezone-display {
  border-color: #00ffff;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.4);
}

/* 显示文字 */
.timezone-text {
  color: #ffffff;
  text-shadow: 0 0 3px rgba(255, 255, 255, 0.3);
  font-size: 14px;
  line-height: 30px;
  flex: 1;
}

/* 下拉箭头 */
.timezone-arrow {
  color: rgba(0, 255, 255, 0.6);
  font-size: 12px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.timezone-arrow.expanded {
  transform: rotate(180deg);
  color: rgba(0, 255, 255, 0.8);
}

.timezone-display:hover .timezone-arrow {
  color: rgba(0, 255, 255, 0.8);
}

/* 下拉面板 */
.timezone-dropdown-custom {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 2000;
  background: rgba(0, 20, 40, 0.95);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

/* 选项样式 */
.timezone-option {
  padding: 10px 16px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
}

.timezone-option:last-child {
  border-bottom: none;
}

.timezone-option:hover {
  background: rgba(0, 255, 255, 0.1);
  color: rgba(255, 255, 255, 1);
}

.timezone-option.selected {
  background: rgba(0, 255, 255, 0.2);
  color: #00ffff;
  font-weight: 500;
  position: relative;
}

.timezone-option.selected::after {
  content: '✓';
  position: absolute;
  right: 16px;
  color: #00ffff;
  font-weight: bold;
}

/* 下拉面板动画 */
.timezone-dropdown-custom {
  animation: dropdownFadeIn 0.2s ease-out;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滚动条样式 */
.timezone-dropdown-custom::-webkit-scrollbar {
  width: 6px;
}

.timezone-dropdown-custom::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.1);
  border-radius: 3px;
}

.timezone-dropdown-custom::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 3px;
}

.timezone-dropdown-custom::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}

/* ==================== 系统维护样式 ==================== */

.maintenance-section {
  margin-bottom: 24px;
}

.maintenance-section h4 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #00ffff !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}

.maintenance-actions {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.ml-10 {
  margin-left: 10px;
}

/* 重启卡片样式增强 */
.restart-actions {
  margin-top: 16px;
}

.restart-card {
  height: 140px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.restart-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 255, 255, 0.3) !important;
  border-color: rgba(0, 255, 255, 0.4) !important;
}

.restart-item {
  display: flex;
  align-items: flex-start;
  height: 100%;
  padding: 24px 20px 28px 20px;
}

.restart-icon {
  margin-right: 20px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  flex-shrink: 0;
}

.restart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.restart-content h5 {
  margin: 4px 0 12px 0;
  font-size: 17px;
  font-weight: 600;
  color: #00ffff !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}

.restart-content p {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8) !important;
  line-height: 1.5;
}

.restart-content .el-button {
  margin-top: auto;
  align-self: flex-start;
}

/* 对话框样式 */
.ip-change-warning,
.restart-warning {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

/* 端口修改对话框样式 */
:deep(.el-dialog) {
  background: rgba(45, 55, 75, 0.92) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 15px !important;
  box-shadow: 
    0 0 50px rgba(0, 255, 255, 0.2),
    inset 0 0 50px rgba(0, 255, 255, 0.05) !important;
}

:deep(.el-dialog__header) {
  background: rgba(45, 55, 75, 0.92) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 15px 15px 0 0 !important;
}

:deep(.el-dialog__title) {
  color: #00ffff !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
  font-weight: bold !important;
}

:deep(.el-dialog__body) {
  background: rgba(45, 55, 75, 0.92) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

/* 端口修改表单样式 */
.port-change-content {
  color: rgba(255, 255, 255, 0.9) !important;
}

.port-change-content :deep(.el-form-item__label) {
  color: #00ffff !important;
  font-weight: 500 !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
}

.port-change-content :deep(.el-input__wrapper) {
  background-color: rgba(65, 75, 95, 0.85) !important;
  background: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
}

.port-change-content :deep(.el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.6) !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.2) !important;
}

.port-change-content :deep(.el-input__wrapper.is-focus) {
  border-color: #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

.port-change-content :deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.95) !important;
  background: transparent !important;
}

.port-change-content :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 当前端口显示样式 */
.port-change-content span {
  color: #00ffff !important;
  font-weight: 500 !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3) !important;
}

/* 警告提示样式 */
.port-change-content :deep(.el-alert) {
  background: rgba(230, 162, 60, 0.15) !important;
  border: 1px solid rgba(230, 162, 60, 0.3) !important;
  border-radius: 6px !important;
}

.port-change-content :deep(.el-alert__content) {
  color: rgba(255, 255, 255, 0.9) !important;
}

.port-change-content :deep(.el-alert__icon) {
  color: rgba(230, 162, 60, 0.8) !important;
}

/* 对话框按钮样式 */
:deep(.dialog-footer .el-button) {
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background-color: rgba(45, 55, 75, 0.8) !important;
  background: rgba(45, 55, 75, 0.8) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

:deep(.dialog-footer .el-button:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
  background: rgba(65, 75, 95, 0.9) !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.2) !important;
  transform: translateY(-1px) !important;
}

:deep(.dialog-footer .el-button--primary) {
  background: rgba(0, 150, 200, 0.8) !important;
  border-color: rgba(0, 200, 255, 0.6) !important;
  color: #ffffff !important;
}

:deep(.dialog-footer .el-button--primary:hover) {
  background: rgba(0, 180, 230, 0.9) !important;
  border-color: #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4) !important;
}

/* 禁用状态的按钮样式 */
:deep(.dialog-footer .el-button--primary.is-disabled),
:deep(.dialog-footer .el-button--primary:disabled) {
  background: rgba(100, 100, 100, 0.3) !important;
  border-color: rgba(150, 150, 150, 0.3) !important;
  color: rgba(255, 255, 255, 0.4) !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
}

:deep(.dialog-footer .el-button--primary.is-disabled:hover),
:deep(.dialog-footer .el-button--primary:disabled:hover) {
  background: rgba(100, 100, 100, 0.3) !important;
  border-color: rgba(150, 150, 150, 0.3) !important;
  color: rgba(255, 255, 255, 0.4) !important;
  transform: none !important;
  box-shadow: none !important;
}

.warning-content h3 {
  margin: 0 0 16px 0;
  color: #E6A23C;
}

.ip-change-details {
  background: rgba(230, 162, 60, 0.1);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.ip-change-details p {
  margin: 4px 0;
}

.ip-change-tips,
.restart-tips {
  font-size: 14px;
  color: #909399;
}

.ip-change-tips p,
.restart-tips p {
  margin: 4px 0;
}

.progress-content {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .basic-management-container {
    padding: 10px;
  }
  
  .basic-management-container h2 {
    font-size: 20px;
    margin: 16px 0;
  }
}
</style>
