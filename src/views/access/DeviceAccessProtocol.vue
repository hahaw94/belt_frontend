<template>
  <div class="device-protocol-container sub-page-content">
    <h2>设备接入协议</h2>

    <!-- 协议支持说明 -->
    <el-card class="protocol-intro-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>协议支持说明</span>
        </div>
      </template>
      <el-alert
        title="设备接入协议"
        type="info"
        description="本系统支持符合 GB/T28181-2016 版本规范的视频摄像机接入，具备实时视频预览、录像和云镜控制功能。同时支持 RTSP 及 ONVIF 协议，最高兼容 2688×1520@30fps，支持 H.264 及 H.265 编码格式。"
        show-icon
        :closable="false"
        class="mb-20">
      </el-alert>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="protocol-item">
            <h4>GB/T28181-2016</h4>
            <ul>
              <li>国标视频监控设备协议</li>
              <li>支持设备注册、心跳保持</li>
              <li>支持实时视频和历史回放</li>
              <li>支持云镜控制（PTZ）</li>
            </ul>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="protocol-item">
            <h4>RTSP协议</h4>
            <ul>
              <li>实时流传输协议</li>
              <li>支持TCP/UDP传输</li>
              <li>低延迟视频流</li>
              <li>广泛设备兼容性</li>
            </ul>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="protocol-item">
            <h4>ONVIF协议</h4>
            <ul>
              <li>开放网络视频接口标准</li>
              <li>支持设备发现</li>
              <li>支持媒体配置</li>
              <li>跨厂商互操作</li>
            </ul>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 协议配置 -->
    <el-card class="protocol-config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>协议配置</span>
          <el-button type="primary" @click="testConnection" :loading="testLoading" :disabled="!selectedDeviceId">测试连接</el-button>
        </div>
      </template>

      <el-form :model="configForm" :rules="configRules" ref="configFormRef" label-width="150px">
        <!-- 设备选择 -->
        <el-form-item label="选择设备" prop="device_id">
          <el-select 
            v-model="selectedDeviceId" 
            @change="onDeviceChange"
            placeholder="请选择要配置的设备" 
            style="width: 400px"
            filterable>
            <el-option
              v-for="device in deviceList"
              :key="device.id"
              :label="`${device.deviceName} (${device.deviceSn})`"
              :value="device.id">
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 协议类型选择 -->
        <el-form-item label="协议类型" prop="protocol_type">
          <el-radio-group v-model="configForm.protocol_type" @change="onProtocolChange">
            <el-radio-button label="GB28181">GB/T28181-2016</el-radio-button>
            <el-radio-button label="RTSP">RTSP</el-radio-button>
            <el-radio-button label="ONVIF">ONVIF</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- GB28181 配置 -->
        <div v-if="configForm.protocol_type === 'GB28181'" class="protocol-section">
          <el-divider content-position="left">GB/T28181 配置</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="SIP服务器IP">
                <el-input v-model="configForm.config.sip_server_ip" placeholder="请输入SIP服务器IP"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="SIP端口">
                <el-input-number v-model="configForm.config.sip_server_port" :min="1" :max="65535"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="设备ID">
                <el-input v-model="configForm.config.device_id" placeholder="请输入设备ID"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备密码">
                <el-input v-model="configForm.config.device_password" type="password" placeholder="请输入设备密码" show-password></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- RTSP 配置 -->
        <div v-if="configForm.protocol_type === 'RTSP'" class="protocol-section">
          <el-divider content-position="left">RTSP 配置</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="RTSP地址">
                <el-input v-model="configForm.config.rtsp_url" placeholder="rtsp://ip:port/stream"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用户名">
                <el-input v-model="configForm.config.username" placeholder="请输入用户名"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="密码">
            <el-input v-model="configForm.config.password" type="password" placeholder="请输入密码" show-password style="width: 300px"></el-input>
          </el-form-item>
        </div>

        <!-- ONVIF 配置 -->
        <div v-if="configForm.protocol_type === 'ONVIF'" class="protocol-section">
          <el-divider content-position="left">ONVIF 配置</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="设备地址">
                <el-input v-model="configForm.config.device_address" placeholder="http://ip:port/onvif/device_service"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用户名">
                <el-input v-model="configForm.config.username" placeholder="请输入用户名"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="密码">
            <el-input v-model="configForm.config.password" type="password" placeholder="请输入密码" show-password style="width: 300px"></el-input>
          </el-form-item>
        </div>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="saveConfiguration" :loading="saveLoading" :disabled="!selectedDeviceId">
            保存配置
          </el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="warning" @click="testConnection" :loading="testLoading" :disabled="!selectedDeviceId">
            测试连接
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 已配置设备列表 -->
    <el-card class="configured-devices-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>已配置设备列表</span>
          <el-button type="info" size="small" @click="getConfiguredDevices" :loading="loading">刷新</el-button>
        </div>
      </template>

      <el-table :data="configuredDevices" v-loading="loading" border stripe>
        <el-table-column prop="id" label="设备ID" width="80" align="center"></el-table-column>
        <el-table-column prop="device_name" label="设备名称" min-width="150"></el-table-column>
        <el-table-column prop="protocol_type" label="协议类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getProtocolColor(row.protocol_type)">{{ row.protocol_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="connection_status" label="连接状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.connection_status === '已连接' ? 'success' : 'danger'">
              {{ row.connection_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="config_time" label="配置时间" width="160"></el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editDeviceConfig(row)">编辑</el-button>
            <el-button type="warning" size="small" @click="testDeviceConnection(row.id)">测试</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { deviceApi } from '@/api/device'

// 响应式数据
const loading = ref(false)
const saveLoading = ref(false)
const testLoading = ref(false)
const selectedDeviceId = ref('')

// 表单引用
const configFormRef = ref()

// 设备列表
const deviceList = ref([])
const configuredDevices = ref([])

// 配置表单
const configForm = reactive({
  protocol_type: 'GB28181',
  config: {
    sip_server_ip: '',
    sip_server_port: 5060,
    device_id: '',
    device_password: '',
    rtsp_url: '',
    device_address: '',
    username: '',
    password: ''
  }
})

// 表单验证规则
const configRules = {
  device_id: [{ required: true, message: '请选择设备', trigger: 'change' }],
  protocol_type: [{ required: true, message: '请选择协议类型', trigger: 'change' }]
}

// 生命周期
onMounted(() => {
  getDeviceList()
  getConfiguredDevices()
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

const getConfiguredDevices = async () => {
  try {
    loading.value = true
    // 模拟数据
    configuredDevices.value = [
      {
        id: 1,
        device_name: '前门摄像头',
        protocol_type: 'GB28181',
        connection_status: '已连接',
        config_time: '2024-01-20 10:30:00'
      }
    ]
  } catch (error) {
    ElMessage.error('获取已配置设备失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const onDeviceChange = (deviceId) => {
  configForm.device_id = deviceId
}

const onProtocolChange = (protocol) => {
  // 清空配置
  Object.keys(configForm.config).forEach(key => {
    if (typeof configForm.config[key] === 'string') {
      configForm.config[key] = ''
    }
  })
  
  if (protocol === 'GB28181') {
    configForm.config.sip_server_port = 5060
  }
}

const saveConfiguration = async () => {
  try {
    await configFormRef.value.validate()
    saveLoading.value = true
    
    const response = await deviceApi.configProtocol(selectedDeviceId.value, configForm)
    if (response.data.success) {
      ElMessage.success('协议配置保存成功')
      getConfiguredDevices()
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存配置失败：' + error.message)
    }
  } finally {
    saveLoading.value = false
  }
}

const testConnection = async () => {
  if (!selectedDeviceId.value) {
    ElMessage.warning('请先选择设备')
    return
  }
  
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

const testDeviceConnection = async (deviceId) => {
  try {
    testLoading.value = true
    const response = await deviceApi.testDeviceConnection(deviceId)
    if (response.data.success) {
      ElMessage.success('设备连接测试成功')
    }
  } catch (error) {
    ElMessage.error('连接测试失败：' + error.message)
  } finally {
    testLoading.value = false
  }
}

const resetForm = () => {
  configFormRef.value?.resetFields()
}

const editDeviceConfig = (device) => {
  selectedDeviceId.value = device.id
  ElMessage.info(`编辑设备配置: ${device.device_name}`)
}

// 辅助函数
const getProtocolColor = (protocol) => {
  const colorMap = {
    'GB28181': 'primary',
    'RTSP': 'success',
    'ONVIF': 'warning'
  }
  return colorMap[protocol] || 'info'
}
</script>

<style scoped>
.sub-page-content {
  min-height: calc(100vh - 140px);
  padding-bottom: 40px;
}

.device-protocol-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.protocol-item {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  height: 100%;
}

.protocol-item h4 {
  color: #303133;
  margin-bottom: 10px;
}

.protocol-item ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.protocol-item li {
  padding: 3px 0;
  color: #606266;
  font-size: 14px;
}

.protocol-item li:before {
  content: "•";
  color: #409eff;
  margin-right: 8px;
}

.protocol-section {
  background-color: #fafafa;
  padding: 20px;
  border-radius: 4px;
  margin: 15px 0;
}

.mb-20 {
  margin-bottom: 20px;
}

:deep(.el-card__header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-divider) {
  margin: 15px 0;
}

:deep(.el-alert) {
  margin-bottom: 20px;
}
</style>