<template>
  <div class="basic-management-container sub-page-content">
    <h2>基础管理</h2>

    <!-- NTP时间设置 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>NTP时间设置</span>
          <el-button type="primary" :icon="Refresh" size="small" @click="loadNTPConfig" :loading="ntpLoading">刷新配置</el-button>
        </div>
      </template>
      <el-form :model="ntpConfig" :rules="ntpRules" ref="ntpFormRef" label-width="150px" class="config-form" v-loading="ntpLoading">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工作模式" prop="mode">
              <el-radio-group v-model="ntpConfig.mode">
                <el-radio label="ntp_client">NTP客户端</el-radio>
                <el-radio label="ntp_server">NTP服务器</el-radio>
                <el-radio label="manual">手动设置</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时区设置" prop="timezone">
              <el-select v-model="ntpConfig.timezone" placeholder="请选择时区" style="width: 100%">
                <el-option label="Asia/Shanghai" value="Asia/Shanghai"></el-option>
                <el-option label="Asia/Beijing" value="Asia/Beijing"></el-option>
                <el-option label="UTC" value="UTC"></el-option>
                <el-option label="America/New_York" value="America/New_York"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="ntpConfig.mode === 'ntp_client'">
          <el-col :span="12">
            <el-form-item label="NTP服务器" prop="server">
              <el-input v-model="ntpConfig.server" placeholder="请输入NTP服务器地址"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <el-button type="primary" @click="syncNTP" :loading="syncLoading">立即同步</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="ntpConfig.mode === 'manual'">
          <el-col :span="12">
            <el-form-item label="手动时间" prop="manual_time">
              <el-date-picker
                v-model="manualTime"
                type="datetime"
                placeholder="选择日期时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <el-button type="primary" @click="setManualTime" :loading="setTimeLoading">设置时间</el-button>
              <el-button @click="syncPCTime">同步PC时间</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="当前状态">
              <el-tag :type="ntpConfig.status === 'synced' ? 'success' : 'warning'">
                {{ ntpConfig.status === 'synced' ? '已同步' : '未同步' }}
              </el-tag>
              <span style="margin-left: 10px;">当前时间：{{ currentTime }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
        <el-form-item>
              <el-button type="primary" @click="saveNTPConfig" :loading="ntpLoading">保存配置</el-button>
              <el-button @click="resetNTPForm">重置</el-button>
        </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- IP地址设置 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>IP地址设置</span>
          <el-button type="primary" :icon="Refresh" size="small" @click="loadNetworkConfig" :loading="networkLoading">刷新配置</el-button>
        </div>
      </template>
      <el-form :model="networkConfig" :rules="networkRules" ref="networkFormRef" label-width="150px" class="config-form" v-loading="networkLoading">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="IP地址" prop="ip_address">
              <el-input v-model="networkConfig.ip_address" placeholder="请输入IP地址"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="子网掩码" prop="subnet_mask">
              <el-input v-model="networkConfig.subnet_mask" placeholder="请输入子网掩码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="网关" prop="gateway">
              <el-input v-model="networkConfig.gateway" placeholder="请输入网关地址"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-alert
              title="警告：修改IP地址将导致系统重启，您需要使用新IP地址重新访问系统并重新登录"
              type="warning"
              show-icon
              :closable="false"
            />
          </el-col>
        </el-row>
        <el-row style="margin-top: 20px;">
          <el-col :span="24">
            <el-form-item>
              <el-button type="danger" @click="showIPChangeDialog" :loading="networkLoading">修改IP地址</el-button>
              <el-button @click="resetNetworkForm">重置</el-button>
          </el-form-item>
          </el-col>
        </el-row>
        </el-form>
    </el-card>

    <!-- LOGO替换功能 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>LOGO替换</span>
          <el-button type="primary" :icon="Refresh" size="small" @click="loadCurrentLogo" :loading="logoLoading">刷新</el-button>
        </div>
      </template>
      <div v-loading="logoLoading">
          <el-row :gutter="20">
            <el-col :span="12">
            <div class="logo-preview">
              <h4>当前LOGO预览</h4>
              <div class="preview-container">
                <img v-if="currentLogo.url" :src="currentLogo.url" alt="当前LOGO" class="logo-image"/>
                <div v-else class="no-logo">暂无自定义LOGO</div>
              </div>
            </div>
            </el-col>
            <el-col :span="12">
            <div class="logo-upload">
              <h4>上传新LOGO</h4>
              <el-upload
                ref="logoUploadRef"
                :auto-upload="false"
                :show-file-list="false"
                accept=".jpg,.jpeg,.png"
                :before-upload="beforeLogoUpload"
                :on-change="handleLogoChange"
              >
                <el-button type="primary" :icon="Upload">选择文件</el-button>
              </el-upload>
              <div v-if="logoPreview" class="upload-preview">
                <img :src="logoPreview" alt="预览" class="logo-image"/>
                <div class="upload-actions">
                  <el-button type="primary" @click="uploadLogo" :loading="uploading" size="small">上传</el-button>
                  <el-button @click="clearLogoPreview" size="small">取消</el-button>
                </div>
              </div>
              <div class="upload-tips">
                <p>支持格式：JPG、PNG</p>
                <p>文件大小：不超过2MB</p>
              </div>
            </div>
            </el-col>
          </el-row>
        <el-row v-if="currentLogo.url">
          <el-col :span="24">
            <el-button type="danger" @click="deleteLogo" :loading="logoLoading">恢复默认LOGO</el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- GB28181平台对接 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>GB28181平台对接</span>
          <el-button type="primary" :icon="Refresh" size="small" @click="loadGB28181Config" :loading="gb28181Loading">刷新配置</el-button>
        </div>
      </template>
      <el-form :model="gb28181Config" :rules="gb28181Rules" ref="gb28181FormRef" label-width="150px" class="config-form" v-loading="gb28181Loading">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="平台名称" prop="platform_name">
              <el-input v-model="gb28181Config.platform_name" placeholder="请输入平台名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平台IP" prop="platform_ip">
              <el-input v-model="gb28181Config.platform_ip" placeholder="请输入平台IP地址"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="平台端口" prop="platform_port">
              <el-input-number v-model="gb28181Config.platform_port" :min="1000" :max="65535" controls-position="right" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备编码" prop="device_id">
              <el-input v-model="gb28181Config.device_id" placeholder="请输入设备编码"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="gb28181Config.username" placeholder="请输入用户名"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="gb28181Config.password" type="password" placeholder="请输入密码" show-password></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="启用状态">
              <el-switch v-model="gb28181Config.enabled" />
              <span style="margin-left: 10px; color: #909399;">启用后系统将尝试连接到GB28181平台</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item>
              <el-button type="primary" @click="saveGB28181Config" :loading="gb28181Loading">保存配置</el-button>
              <el-button @click="testGB28181Connection" :loading="testingConnection">测试连接</el-button>
              <el-button @click="resetGB28181Form">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 存储策略配置 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>存储策略配置</span>
        </div>
      </template>
      <el-tabs v-model="activeStorageTab">
        <el-tab-pane label="录像存储策略" name="video">
          <el-form :model="videoStorageConfig" :rules="videoStorageRules" ref="videoStorageFormRef" label-width="150px" v-loading="storageLoading">
        <el-row :gutter="20">
          <el-col :span="12">
                <el-form-item label="保存天数" prop="retention_days">
                  <el-input-number v-model="videoStorageConfig.retention_days" :min="1" :max="3650" controls-position="right" style="width: 100%">
                    <template #append>天</template>
                  </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
                <el-form-item label="最大存储容量" prop="max_storage_gb">
                  <el-input-number v-model="videoStorageConfig.max_storage_gb" :min="1" :max="100000" controls-position="right" style="width: 100%">
                    <template #append>GB</template>
                  </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="循环覆盖">
                  <el-switch v-model="videoStorageConfig.cyclic_overwrite" />
                  <span style="margin-left: 10px; color: #909399;">启用后，存储空间不足时将自动删除最早的录像文件</span>
        </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
        <el-form-item>
                  <el-button type="primary" @click="saveVideoStorageConfig" :loading="storageLoading">保存配置</el-button>
                  <el-button @click="loadVideoStorageConfig">重置</el-button>
        </el-form-item>
              </el-col>
            </el-row>
      </el-form>
        </el-tab-pane>
        <el-tab-pane label="告警数据存储策略" name="alarm">
          <el-form :model="alarmDataConfig" :rules="alarmDataRules" ref="alarmDataFormRef" label-width="150px" v-loading="storageLoading">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="保存天数" prop="retention_days">
                  <el-input-number v-model="alarmDataConfig.retention_days" :min="1" :max="3650" controls-position="right" style="width: 100%">
                    <template #append>天</template>
                  </el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="最大记录数" prop="max_records">
                  <el-input-number v-model="alarmDataConfig.max_records" :min="1000" :max="10000000" controls-position="right" style="width: 100%">
                    <template #append>条</template>
                  </el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="循环清理">
                  <el-switch v-model="alarmDataConfig.cyclic_cleanup" />
                  <span style="margin-left: 10px; color: #909399;">启用后，达到最大记录数时将自动删除最早的告警数据</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item>
                  <el-button type="primary" @click="saveAlarmDataConfig" :loading="storageLoading">保存配置</el-button>
                  <el-button @click="loadAlarmDataConfig">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- IP修改确认对话框 -->
    <el-dialog
      v-model="ipChangeDialogVisible"
      title="确认修改IP地址"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div>
        <el-alert
          title="警告：此操作将立即生效并重启系统服务"
          type="warning"
          show-icon
          :closable="false"
        />
        <div style="margin: 20px 0;">
          <p><strong>当前IP：</strong>{{ currentNetworkConfig.ip_address }}</p>
          <p><strong>新IP：</strong>{{ networkConfig.ip_address }}</p>
          <p><strong>新访问地址：</strong>http://{{ networkConfig.ip_address }}:{{ networkConfig.port || '8080' }}</p>
        </div>
        <el-checkbox v-model="ipChangeConfirm">我已了解风险，确认执行此操作</el-checkbox>
        </div>
      <template #footer>
        <el-button @click="ipChangeDialogVisible = false" :disabled="ipChanging">取消</el-button>
        <el-button type="danger" @click="confirmIPChange" :loading="ipChanging" :disabled="!ipChangeConfirm">确认修改</el-button>
          </template>
    </el-dialog>

    <!-- IP修改进度对话框 -->
    <el-dialog
      v-model="ipChangeProgressVisible"
      title="正在修改IP地址"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="progress-content">
        <el-progress :percentage="ipChangeProgress" :status="ipChangeStatus" />
        <p style="margin-top: 15px; text-align: center;">{{ ipChangeMessage }}</p>
        <div v-if="ipChangeProgress === 100" style="text-align: center; margin-top: 20px;">
          <p>系统将在 <strong>{{ countdown }}</strong> 秒后跳转到新地址</p>
          <el-button type="primary" @click="jumpToNewIP">立即跳转</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Upload } from '@element-plus/icons-vue'
import { systemAPI } from '@/api/system'
import { useSystemStore } from '@/stores/system'

// ===================== 响应式数据 =====================

// Store
const systemStore = useSystemStore()

// 加载状态
const ntpLoading = ref(false)
const networkLoading = ref(false)
const logoLoading = ref(false)
const storageLoading = ref(false)
const syncLoading = ref(false)
const setTimeLoading = ref(false)
const uploading = ref(false)
const gb28181Loading = ref(false)
const testingConnection = ref(false)

// NTP配置
const ntpConfig = reactive({
  mode: 'manual',
  server: '',
  timezone: 'Asia/Shanghai',
  status: 'unknown'
})

// 手动时间设置
const manualTime = ref('')

// 当前时间显示
const currentTime = ref('')
const timeInterval = ref(null)

// 网络配置
const networkConfig = reactive({
  ip_address: '',
  subnet_mask: '',
  gateway: ''
})

const currentNetworkConfig = reactive({
  ip_address: '',
  subnet_mask: '',
  gateway: ''
})

// IP修改相关
const ipChangeDialogVisible = ref(false)
const ipChangeProgressVisible = ref(false)
const ipChangeConfirm = ref(false)
const ipChanging = ref(false)
const ipChangeProgress = ref(0)
const ipChangeStatus = ref('')
const ipChangeMessage = ref('')
const countdown = ref(10)
const countdownInterval = ref(null)

// LOGO相关
const currentLogo = reactive({
  url: '',
  filename: '',
  size: 0
})

const logoPreview = ref('')
const logoUploadRef = ref(null)
const selectedLogoFile = ref(null)

// 存储策略配置
const activeStorageTab = ref('video')

const videoStorageConfig = reactive({
  retention_days: 30,
  max_storage_gb: 1000,
  cyclic_overwrite: true
})

const alarmDataConfig = reactive({
  retention_days: 90,
  max_records: 1000000,
  cyclic_cleanup: true
})

// GB28181配置
const gb28181Config = reactive({
  platform_name: '',
  platform_ip: '',
  platform_port: 5060,
  device_id: '',
  username: '',
  password: '',
  enabled: false
})

// 表单引用
const ntpFormRef = ref(null)
const networkFormRef = ref(null)
const videoStorageFormRef = ref(null)
const alarmDataFormRef = ref(null)
const gb28181FormRef = ref(null)

// ===================== 验证规则 =====================

const ntpRules = {
  server: [
    { required: true, message: '请输入NTP服务器地址', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9.-]+$/, message: '请输入有效的服务器地址', trigger: 'blur' }
  ],
  timezone: [
    { required: true, message: '请选择时区', trigger: 'change' }
  ]
}

const networkRules = {
  ip_address: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    { pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, message: '请输入有效的IP地址', trigger: 'blur' }
  ],
  subnet_mask: [
    { required: true, message: '请输入子网掩码', trigger: 'blur' },
    { pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, message: '请输入有效的子网掩码', trigger: 'blur' }
  ],
  gateway: [
    { required: true, message: '请输入网关地址', trigger: 'blur' },
    { pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, message: '请输入有效的网关地址', trigger: 'blur' }
  ]
}

const videoStorageRules = {
  retention_days: [
    { required: true, message: '请输入保存天数', trigger: 'blur' },
    { type: 'number', min: 1, max: 3650, message: '保存天数必须在1-3650天之间', trigger: 'blur' }
  ],
  max_storage_gb: [
    { required: true, message: '请输入最大存储容量', trigger: 'blur' },
    { type: 'number', min: 1, max: 100000, message: '存储容量必须在1-100000GB之间', trigger: 'blur' }
  ]
}

const alarmDataRules = {
  retention_days: [
    { required: true, message: '请输入保存天数', trigger: 'blur' },
    { type: 'number', min: 1, max: 3650, message: '保存天数必须在1-3650天之间', trigger: 'blur' }
  ],
  max_records: [
    { required: true, message: '请输入最大记录数', trigger: 'blur' },
    { type: 'number', min: 1000, max: 10000000, message: '记录数必须在1000-10000000条之间', trigger: 'blur' }
  ]
}

const gb28181Rules = {
  platform_name: [
    { required: true, message: '请输入平台名称', trigger: 'blur' }
  ],
  platform_ip: [
    { required: true, message: '请输入平台IP地址', trigger: 'blur' },
    { pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, message: '请输入有效的IP地址', trigger: 'blur' }
  ],
  platform_port: [
    { required: true, message: '请输入平台端口', trigger: 'blur' },
    { type: 'number', min: 1000, max: 65535, message: '端口范围1000-65535', trigger: 'blur' }
  ],
  device_id: [
    { required: true, message: '请输入设备编码', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// ===================== NTP时间设置方法 =====================

// 加载NTP配置
const loadNTPConfig = async () => {
  ntpLoading.value = true
  try {
    const response = await systemAPI.getNTPConfig()
    if (response.code === 200) {
      Object.assign(ntpConfig, response.data)
    }
  } catch (error) {
    console.error('加载NTP配置失败:', error)
    ElMessage.error('加载NTP配置失败')
  } finally {
    ntpLoading.value = false
  }
}

// 保存NTP配置
const saveNTPConfig = async () => {
  if (!ntpFormRef.value) return
  
  try {
    await ntpFormRef.value.validate()
    ntpLoading.value = true
    
    const response = await systemAPI.setNTPConfig(ntpConfig)
    if (response.code === 200) {
      ElMessage.success('NTP配置保存成功')
      await loadNTPConfig()
    }
  } catch (error) {
    console.error('保存NTP配置失败:', error)
    ElMessage.error('保存NTP配置失败')
  } finally {
    ntpLoading.value = false
  }
}

// 立即同步时间
const syncNTP = async () => {
  syncLoading.value = true
  try {
    const response = await systemAPI.syncNTP()
    if (response.code === 200) {
      ElMessage.success('时间同步成功')
      await loadNTPConfig()
    }
  } catch (error) {
    console.error('时间同步失败:', error)
    ElMessage.error('时间同步失败')
  } finally {
    syncLoading.value = false
  }
}

// 设置手动时间
const setManualTime = async () => {
  if (!manualTime.value) {
    ElMessage.error('请选择要设置的时间')
    return
  }
  
  setTimeLoading.value = true
  try {
    const response = await systemAPI.setManualTime({
      time: manualTime.value
    })
    if (response.code === 200) {
      ElMessage.success('时间设置成功')
      await loadNTPConfig()
    }
  } catch (error) {
    console.error('设置时间失败:', error)
    ElMessage.error('设置时间失败')
  } finally {
    setTimeLoading.value = false
  }
}

// 同步PC时间
const syncPCTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  
  manualTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 重置NTP表单
const resetNTPForm = () => {
  if (ntpFormRef.value) {
    ntpFormRef.value.resetFields()
  }
  loadNTPConfig()
}

// ===================== 网络配置方法 =====================

// 加载网络配置
const loadNetworkConfig = async () => {
  networkLoading.value = true
  try {
    const response = await systemAPI.getNetworkConfig()
    if (response.code === 200) {
      Object.assign(networkConfig, response.data)
      Object.assign(currentNetworkConfig, response.data)
    }
  } catch (error) {
    console.error('加载网络配置失败:', error)
    ElMessage.error('加载网络配置失败')
  } finally {
    networkLoading.value = false
  }
}

// 显示IP修改确认对话框
const showIPChangeDialog = async () => {
  if (!networkFormRef.value) return
  
  try {
    await networkFormRef.value.validate()
    ipChangeDialogVisible.value = true
    ipChangeConfirm.value = false
  } catch (error) {
    ElMessage.error('请填写正确的网络配置信息')
  }
}

// 确认修改IP地址
const confirmIPChange = async () => {
  ipChanging.value = true
  ipChangeDialogVisible.value = false
  ipChangeProgressVisible.value = true
  ipChangeProgress.value = 0
  ipChangeStatus.value = ''
  ipChangeMessage.value = '正在修改网络配置...'
  
  try {
    // 模拟进度更新
    const progressTimer = setInterval(() => {
      if (ipChangeProgress.value < 90) {
        ipChangeProgress.value += 10
      }
    }, 500)
    
    const response = await systemAPI.setNetworkConfig(networkConfig)
    
    clearInterval(progressTimer)
    
    if (response.code === 200) {
      ipChangeProgress.value = 100
      ipChangeStatus.value = 'success'
      ipChangeMessage.value = '网络配置修改成功，正在重启服务...'
      
      // 开始倒计时并跳转
      startCountdown(response.data.new_url)
    }
  } catch (error) {
    console.error('修改网络配置失败:', error)
    ipChangeStatus.value = 'exception'
    ipChangeMessage.value = '网络配置修改失败'
    ElMessage.error('网络配置修改失败')
  } finally {
    ipChanging.value = false
  }
}

// 开始倒计时并跳转
const startCountdown = (newUrl) => {
  countdown.value = 10
  countdownInterval.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval.value)
      jumpToNewIP(newUrl)
    }
  }, 1000)
}

// 跳转到新IP地址
const jumpToNewIP = (url) => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }
  
  const newUrl = url || `http://${networkConfig.ip_address}:8080`
  window.location.href = newUrl
}

// 重置网络表单
const resetNetworkForm = () => {
  if (networkFormRef.value) {
    networkFormRef.value.resetFields()
  }
  Object.assign(networkConfig, currentNetworkConfig)
}

// ===================== LOGO管理方法 =====================

// 加载当前LOGO
const loadCurrentLogo = async () => {
  logoLoading.value = true
  try {
    const response = await systemAPI.getCurrentLogo()
    if (response.code === 200) {
      Object.assign(currentLogo, response.data)
    }
  } catch (error) {
    console.error('加载当前LOGO失败:', error)
    ElMessage.error('加载当前LOGO失败')
  } finally {
    logoLoading.value = false
  }
}

// LOGO上传前验证
const beforeLogoUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('LOGO只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('LOGO大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理LOGO文件选择
const handleLogoChange = (file) => {
  selectedLogoFile.value = file.raw
  
  // 创建预览
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 上传LOGO
const uploadLogo = async () => {
  if (!selectedLogoFile.value) {
    ElMessage.error('请先选择LOGO文件')
    return
  }
  
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('logo', selectedLogoFile.value)
    
    const response = await systemAPI.uploadLogo(formData)
    if (response.code === 200) {
      ElMessage.success('LOGO上传成功')
      clearLogoPreview()
      await loadCurrentLogo()
      // 更新全局store状态（包含favicon更新）
      await systemStore.updateLogoConfig(response.data)
    }
  } catch (error) {
    console.error('LOGO上传失败:', error)
    ElMessage.error('LOGO上传失败')
  } finally {
    uploading.value = false
  }
}

// 清除LOGO预览
const clearLogoPreview = () => {
  logoPreview.value = ''
  selectedLogoFile.value = null
  if (logoUploadRef.value) {
    logoUploadRef.value.clearFiles()
  }
}

// 删除LOGO
const deleteLogo = async () => {
  try {
    await ElMessageBox.confirm('确定要删除当前LOGO并恢复默认LOGO吗？', '确认删除', {
        type: 'warning'
    })
    
    logoLoading.value = true
    const response = await systemAPI.deleteLogo()
    if (response.code === 200) {
      ElMessage.success('LOGO已删除，恢复默认LOGO')
      await loadCurrentLogo()
      // 重置全局store状态（包含favicon重置）
      await systemStore.resetLogoConfig()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除LOGO失败:', error)
      ElMessage.error('删除LOGO失败')
    }
  } finally {
    logoLoading.value = false
  }
}

// ===================== 存储策略配置方法 =====================

// 加载录像存储配置
const loadVideoStorageConfig = async () => {
  storageLoading.value = true
  try {
    const response = await systemAPI.getVideoStorageConfig()
    if (response.code === 200) {
      Object.assign(videoStorageConfig, response.data)
    }
  } catch (error) {
    console.error('加载录像存储配置失败:', error)
    ElMessage.error('加载录像存储配置失败')
  } finally {
    storageLoading.value = false
  }
}

// 保存录像存储配置
const saveVideoStorageConfig = async () => {
  if (!videoStorageFormRef.value) return
  
  try {
    await videoStorageFormRef.value.validate()
    storageLoading.value = true
    
    const response = await systemAPI.setVideoStorageConfig(videoStorageConfig)
    if (response.code === 200) {
      ElMessage.success('录像存储配置保存成功')
    }
  } catch (error) {
    console.error('保存录像存储配置失败:', error)
    ElMessage.error('保存录像存储配置失败')
  } finally {
    storageLoading.value = false
  }
}

// 加载告警数据配置
const loadAlarmDataConfig = async () => {
  storageLoading.value = true
  try {
    const response = await systemAPI.getAlarmDataConfig()
    if (response.code === 200) {
      Object.assign(alarmDataConfig, response.data)
    }
  } catch (error) {
    console.error('加载告警数据配置失败:', error)
    ElMessage.error('加载告警数据配置失败')
  } finally {
    storageLoading.value = false
  }
}

// 保存告警数据配置
const saveAlarmDataConfig = async () => {
  if (!alarmDataFormRef.value) return
  
  try {
    await alarmDataFormRef.value.validate()
    storageLoading.value = true
    
    const response = await systemAPI.setAlarmDataConfig(alarmDataConfig)
    if (response.code === 200) {
      ElMessage.success('告警数据配置保存成功')
    }
  } catch (error) {
    console.error('保存告警数据配置失败:', error)
    ElMessage.error('保存告警数据配置失败')
  } finally {
    storageLoading.value = false
  }
}

// ===================== GB28181配置方法 =====================

// 加载GB28181配置
const loadGB28181Config = async () => {
  gb28181Loading.value = true
  try {
    const response = await systemAPI.getGB28181Config()
    if (response.code === 200) {
      Object.assign(gb28181Config, response.data)
    }
  } catch (error) {
    console.error('加载GB28181配置失败:', error)
    ElMessage.error('加载GB28181配置失败')
  } finally {
    gb28181Loading.value = false
  }
}

// 保存GB28181配置
const saveGB28181Config = async () => {
  if (!gb28181FormRef.value) return
  
  try {
    await gb28181FormRef.value.validate()
    gb28181Loading.value = true
    
    const response = await systemAPI.setGB28181Config(gb28181Config)
    if (response.code === 200) {
      ElMessage.success('GB28181配置保存成功')
    }
  } catch (error) {
    console.error('保存GB28181配置失败:', error)
    ElMessage.error('保存GB28181配置失败')
  } finally {
    gb28181Loading.value = false
  }
}

// 测试GB28181连接 (后端暂未实现)
const testGB28181Connection = async () => {
  if (!gb28181FormRef.value) return
  
  try {
    await gb28181FormRef.value.validate()
    testingConnection.value = true
    
    // 模拟测试功能，后端实现后需要替换为真实API调用
    setTimeout(() => {
      ElMessage.info('GB28181连接测试功能待后端实现')
      testingConnection.value = false
    }, 1000)
    
    // const response = await systemAPI.testGB28181Connection(gb28181Config)
    // if (response.code === 200) {
    //   ElMessage.success('GB28181连接测试成功')
    // }
  } catch (error) {
    console.error('GB28181连接测试失败:', error)
    ElMessage.error('表单验证失败')
    testingConnection.value = false
  }
}

// 重置GB28181表单
const resetGB28181Form = () => {
  if (gb28181FormRef.value) {
    gb28181FormRef.value.resetFields()
  }
  loadGB28181Config()
}

// ===================== 时间相关方法 =====================

// 更新当前时间显示
const updateCurrentTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  
  currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// ===================== 生命周期钩子 =====================

onMounted(async () => {
  // 开始时间更新
  updateCurrentTime()
  timeInterval.value = setInterval(updateCurrentTime, 1000)
  
  // 加载各模块配置
  await Promise.all([
    loadNTPConfig(),
    loadNetworkConfig(),
    loadCurrentLogo(),
    loadVideoStorageConfig(),
    loadAlarmDataConfig(),
    loadGB28181Config()
  ])
})

onUnmounted(() => {
  // 清理定时器
  if (timeInterval.value) {
    clearInterval(timeInterval.value)
  }
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }
})
</script>

<style scoped>
.basic-management-container {
  padding: 24px;
}

.config-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.config-form {
  padding: 20px 0;
}

.mb-20 {
  margin-bottom: 20px;
}

/* LOGO相关样式 */
.logo-preview h4,
.logo-upload h4 {
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.preview-container {
  width: 100%;
  height: 120px;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.logo-image {
  max-width: 100%;
  max-height: 100px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-logo {
  color: #909399;
  font-size: 14px;
}

.upload-preview {
  margin-top: 16px;
  text-align: center;
}

.upload-actions {
  margin-top: 12px;
}

.upload-actions .el-button {
  margin: 0 4px;
}

.upload-tips {
  margin-top: 12px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.upload-tips p {
  margin: 4px 0;
}

/* 进度对话框样式 */
.progress-content {
  text-align: center;
}

.progress-content p {
  margin: 10px 0;
  color: #606266;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .basic-management-container {
    padding: 16px;
  }
  
  .config-form {
    padding: 16px 0;
  }
}

@media (max-width: 768px) {
  .basic-management-container {
    padding: 12px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .preview-container {
    height: 100px;
  }
  
  .logo-image {
    max-height: 80px;
  }
}

/* 表单项间距优化 */
.el-form-item {
  margin-bottom: 22px;
}

.el-form-item:last-child {
  margin-bottom: 0;
}

/* 标签样式优化 */
.el-tag {
  margin-right: 8px;
}

/* 按钮组样式 */
.el-form-item .el-button + .el-button {
  margin-left: 12px;
}

/* 警告框样式调整 */
.el-alert {
  margin: 16px 0;
}

/* 选项卡内容区域 */
.el-tabs__content {
  padding: 20px 0;
}
</style>