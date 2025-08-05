<template>
  <div class="device-management-container sub-page-content">
    <h2>设备管理</h2>

    <!-- 搜索和操作栏 -->
    <el-card class="search-card mb-20" shadow="hover">
      <el-form :model="searchForm" :inline="true" label-width="80px">
        <el-form-item label="设备名称">
          <el-input v-model="searchForm.device_name" placeholder="请输入设备名称" clearable style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item label="设备编号">
          <el-input v-model="searchForm.device_sn" placeholder="请输入设备编号" clearable style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="searchForm.device_type" placeholder="请选择设备类型" clearable style="width: 180px;">
            <el-option label="IPC摄像机" value="IPC摄像机"></el-option>
            <el-option label="智能分析板卡" value="智能分析板卡"></el-option>
            <el-option label="NVR录像机" value="NVR录像机"></el-option>
            <el-option label="编码器" value="编码器"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px;">
            <el-option label="在线" value="在线"></el-option>
            <el-option label="离线" value="离线"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 设备操作栏 -->
    <el-card class="operation-card mb-20" shadow="hover">
      <div class="operation-toolbar">
        <div class="left-operations">
          <el-button type="success" :icon="Plus" @click="showAddDevice">添加设备</el-button>
          <el-button type="primary" :icon="Upload" @click="showBatchAdd">批量添加</el-button>
          <el-button type="warning" :icon="Refresh" @click="syncDevices" :loading="syncLoading">平台同步</el-button>
        </div>
        <div class="right-operations">
          <el-button type="info" :icon="Download" @click="exportDevices">导出列表</el-button>
          <el-button :icon="Refresh" @click="getDeviceList" :loading="loading">刷新</el-button>
        </div>
      </div>
    </el-card>

    <!-- 设备列表 -->
    <el-card class="device-list-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>设备列表 ({{ totalDevices }}台)</span>
          <el-tag type="info">在线: {{ onlineCount }}台 | 离线: {{ offlineCount }}台</el-tag>
        </div>
      </template>

      <el-table :data="paginatedDevices" v-loading="loading" border stripe style="width: 100%;">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="device-detail">
              <el-descriptions title="设备详细信息" :column="3" border>
                <el-descriptions-item label="设备ID">{{ row.id }}</el-descriptions-item>
                <el-descriptions-item label="内部编号">{{ row.internal_code }}</el-descriptions-item>
                <el-descriptions-item label="安装位置">{{ row.install_location }}</el-descriptions-item>
                <el-descriptions-item label="安装时间">{{ row.install_time }}</el-descriptions-item>
                <el-descriptions-item label="线路信息">{{ row.line_info }}</el-descriptions-item>
                <el-descriptions-item label="朝向">{{ row.direction }}</el-descriptions-item>
                <el-descriptions-item label="关联摄像头SN">{{ row.related_camera_sn }}</el-descriptions-item>
                <el-descriptions-item label="关联摄像头名称">{{ row.related_camera_name }}</el-descriptions-item>
                <el-descriptions-item label="算法模型">{{ row.algorithm_model }}</el-descriptions-item>
                <el-descriptions-item label="模型版本">{{ row.model_version }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ row.create_time }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ row.update_time }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="deviceName" label="设备名称" min-width="150">
          <template #default="{ row }">
            <div class="device-name">
              <strong>{{ row.deviceName }}</strong>
              <div class="device-model">{{ row.model || '未知型号' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="deviceSn" label="设备编号" min-width="180">
          <template #default="{ row }">
            <el-tag size="small">{{ row.deviceSn }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deviceType" label="设备类型" width="140">
          <template #default="{ row }">
            <el-tag :type="getDeviceTypeColor(row.deviceType)" size="small">
              {{ row.deviceType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="manufacturer" label="厂商" width="120"></el-table-column>
        <el-table-column prop="ipAddress" label="IP地址" width="150"></el-table-column>
        <el-table-column prop="area" label="区域" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '在线' ? 'success' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center">
          <template #default="{ row }">
            <el-button type="primary" :icon="View" size="small" @click="viewDevice(row)">详情</el-button>
            <el-button type="warning" :icon="Edit" size="small" @click="editDevice(row)">编辑</el-button>
            <el-button type="info" :icon="Setting" size="small" @click="configDevice(row)">配置</el-button>
            <el-button type="danger" :icon="Delete" size="small" @click="deleteDevice(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
      <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="totalDevices"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </el-card>

    <!-- 添加设备对话框 -->
    <el-dialog v-model="addDeviceVisible" title="添加设备" width="800px">
      <el-form :model="deviceForm" :rules="deviceRules" ref="deviceFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="device_name">
              <el-input v-model="deviceForm.device_name" placeholder="请输入设备名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备编号" prop="device_sn">
              <el-input v-model="deviceForm.device_sn" placeholder="请输入设备编号"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备类型" prop="device_type">
              <el-select v-model="deviceForm.device_type" placeholder="请选择设备类型" style="width: 100%">
                <el-option label="IPC摄像机" value="IPC摄像机"></el-option>
                <el-option label="智能分析板卡" value="智能分析板卡"></el-option>
                <el-option label="NVR录像机" value="NVR录像机"></el-option>
                <el-option label="编码器" value="编码器"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="厂商" prop="manufacturer">
              <el-select v-model="deviceForm.manufacturer" placeholder="请选择厂商" style="width: 100%">
                <el-option label="海康威视" value="海康威视"></el-option>
                <el-option label="大华" value="大华"></el-option>
                <el-option label="宇视" value="宇视"></el-option>
                <el-option label="华为" value="华为"></el-option>
                <el-option label="其他" value="其他"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="IP地址" prop="ip_address">
              <el-input v-model="deviceForm.ip_address" placeholder="请输入IP地址"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="区域">
              <el-input v-model="deviceForm.area" placeholder="请输入区域"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="安装位置">
              <el-input v-model="deviceForm.install_location" placeholder="请输入安装位置"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安装时间">
              <el-date-picker
                v-model="deviceForm.install_time"
                  type="date"
                  placeholder="请选择安装时间"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="内部编号">
          <el-input v-model="deviceForm.internal_code" placeholder="请输入内部编号"></el-input>
            </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDeviceVisible = false">取消</el-button>
          <el-button type="primary" @click="saveDevice" :loading="saveLoading">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量添加对话框 -->
    <el-dialog v-model="batchAddVisible" title="批量添加设备" width="500px">
      <el-upload
        class="upload-demo"
        drag
        :action="uploadUrl"
        :headers="uploadHeaders"
        :on-success="handleBatchSuccess"
        :on-error="handleBatchError"
        :before-upload="beforeBatchUpload"
        accept=".xlsx,.xls"
        :limit="1"
        :auto-upload="false"
        ref="batchUploadRef">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将Excel文件拖拽至此 或 <em>点击选择文件</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 Excel(.xlsx, .xls) 格式文件，请按照模板格式填写设备信息
          </div>
        </template>
      </el-upload>
      <div class="template-download">
        <el-button type="text" :icon="Download" @click="downloadTemplate">下载Excel模板</el-button>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchAddVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBatchAdd" :loading="batchLoading">
            批量添加
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 平台同步对话框 -->
    <el-dialog v-model="syncVisible" title="平台设备同步" width="600px">
      <el-form :model="syncForm" label-width="120px">
        <el-form-item label="网络范围">
          <el-input v-model="syncForm.network_range" placeholder="例如: 192.168.1.0/24"></el-input>
            </el-form-item>
        <el-form-item label="协议类型">
          <el-select v-model="syncForm.protocol" placeholder="请选择协议" style="width: 100%">
            <el-option label="GB28181" value="GB28181"></el-option>
            <el-option label="ONVIF" value="ONVIF"></el-option>
            <el-option label="RTSP" value="RTSP"></el-option>
              </el-select>
            </el-form-item>
        <el-form-item label="超时时间(秒)">
          <el-input-number v-model="syncForm.timeout" :min="10" :max="300" controls-position="right"></el-input-number>
            </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="syncVisible = false">取消</el-button>
          <el-button type="primary" @click="executeSync" :loading="syncLoading">开始同步</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, Refresh, Plus, Upload, Download, View, Edit, Setting, Delete, UploadFilled 
} from '@element-plus/icons-vue'
import { deviceApi } from '@/api/device'

// 响应式数据
const loading = ref(false)
const saveLoading = ref(false)
const batchLoading = ref(false)
const syncLoading = ref(false)

const addDeviceVisible = ref(false)
const batchAddVisible = ref(false)
const syncVisible = ref(false)

// 表单引用
const deviceFormRef = ref()
const batchUploadRef = ref()

// 搜索表单
const searchForm = reactive({
  device_name: '',
  device_sn: '',
  device_type: '',
  status: ''
})

// 设备表单
const deviceForm = reactive({
  device_name: '',
  device_sn: '',
  device_type: '',
  manufacturer: '',
  ip_address: '',
  area: '',
  install_location: '',
  install_time: '',
  internal_code: ''
})

// 同步表单
const syncForm = reactive({
  network_range: '192.168.1.0/24',
  protocol: 'GB28181',
  timeout: 30
})

// 设备列表
const deviceList = ref([])

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 计算属性
const filteredDevices = computed(() => {
  let filtered = deviceList.value

  if (searchForm.device_name) {
    filtered = filtered.filter(item => 
      item.deviceName.toLowerCase().includes(searchForm.device_name.toLowerCase())
    )
  }

  if (searchForm.device_sn) {
    filtered = filtered.filter(item => 
      item.deviceSn.toLowerCase().includes(searchForm.device_sn.toLowerCase())
    )
  }

  if (searchForm.device_type) {
    filtered = filtered.filter(item => item.deviceType === searchForm.device_type)
  }

  if (searchForm.status) {
    filtered = filtered.filter(item => item.status === searchForm.status)
  }

  return filtered
})

const totalDevices = computed(() => filteredDevices.value.length)

const paginatedDevices = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredDevices.value.slice(start, end)
})

const onlineCount = computed(() => {
  return deviceList.value.filter(device => device.status === '在线').length
})

const offlineCount = computed(() => {
  return deviceList.value.filter(device => device.status === '离线').length
})

const uploadUrl = computed(() => '/api/devices/batch')

const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}))

// 表单验证规则
const deviceRules = {
  device_name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  device_sn: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  device_type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  manufacturer: [{ required: true, message: '请选择厂商', trigger: 'change' }],
  ip_address: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    { pattern: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, message: '请输入正确的IP地址', trigger: 'blur' }
  ]
}

// 生命周期
onMounted(() => {
  getDeviceList()
})

// 方法
const getDeviceList = async () => {
  try {
    loading.value = true
    const response = await deviceApi.getDeviceList({
      page: pagination.currentPage,
      page_size: pagination.pageSize
    })
    console.log('设备API响应:', response)
    if (response.success) {
      deviceList.value = response.body.devices || []
      pagination.total = response.body.total || 0
      console.log('设备列表数据:', deviceList.value)
    } else {
      ElMessage.error(response.message || '获取设备列表失败')
    }
  } catch (error) {
    console.error('设备API错误:', error)
    ElMessage.error('获取设备列表失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
}

const resetSearch = () => {
  Object.assign(searchForm, {
    device_name: '',
    device_sn: '',
    device_type: '',
    status: ''
  })
  pagination.currentPage = 1
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
}

const showAddDevice = () => {
  addDeviceVisible.value = true
}

const saveDevice = async () => {
  try {
    await deviceFormRef.value.validate()
    saveLoading.value = true
    
    const response = await deviceApi.addDevice(deviceForm)
    if (response.data.success) {
      ElMessage.success('设备添加成功')
      addDeviceVisible.value = false
      getDeviceList()
      resetDeviceForm()
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('添加设备失败：' + error.message)
    }
  } finally {
    saveLoading.value = false
  }
}

const resetDeviceForm = () => {
  deviceFormRef.value?.resetFields()
}

const showBatchAdd = () => {
  batchAddVisible.value = true
}

const beforeBatchUpload = (file) => {
  const isValidFormat = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].includes(file.type)
  if (!isValidFormat) {
    ElMessage.error('只支持 Excel 格式文件')
    return false
  }
  
  return true
}

const submitBatchAdd = () => {
  batchLoading.value = true
  batchUploadRef.value.submit()
}

const handleBatchSuccess = (response) => {
  batchLoading.value = false
  batchAddVisible.value = false
  if (response.success) {
    ElMessage.success(`批量添加完成，成功：${response.body.success_count}，失败：${response.body.failed_count}`)
    getDeviceList()
        } else {
    ElMessage.error('批量添加失败：' + response.message)
  }
}

const handleBatchError = (error) => {
  batchLoading.value = false
  ElMessage.error('上传文件失败：' + error.message)
}

const downloadTemplate = () => {
  // 创建Excel模板下载
  const link = document.createElement('a')
  link.href = '/templates/device_template.xlsx' // 实际应该放在public目录下
  link.download = '设备信息导入模板.xlsx'
  link.click()
  ElMessage.success('模板下载开始')
}

const syncDevices = () => {
  syncVisible.value = true
}

const executeSync = async () => {
  try {
    syncLoading.value = true
    const response = await deviceApi.syncDevices(syncForm)
    if (response.data.success) {
      ElMessage.success(`设备同步完成，发现设备：${response.data.body.sync_count}台`)
      syncVisible.value = false
      getDeviceList()
    }
  } catch (error) {
    ElMessage.error('设备同步失败：' + error.message)
  } finally {
    syncLoading.value = false
  }
}

const exportDevices = () => {
  // 导出设备列表
  const data = JSON.stringify(deviceList.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `设备列表_${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  window.URL.revokeObjectURL(url)
  ElMessage.success('设备列表导出成功')
}

const viewDevice = (device) => {
  // 跳转到设备详情页面
  ElMessage.info(`查看设备详情: ${device.deviceName}`)
}

const editDevice = (device) => {
  // 编辑设备信息
  Object.assign(deviceForm, {
    device_name: device.deviceName,
    device_sn: device.deviceSn,
    device_type: device.deviceType,
    manufacturer: device.manufacturer,
    ip_address: device.ipAddress,
    area: device.area,
    install_location: device.install_location,
    install_time: device.install_time,
    internal_code: device.internal_code
  })
  addDeviceVisible.value = true
}

const configDevice = (device) => {
  // 跳转到设备配置页面
  ElMessage.info(`配置设备: ${device.deviceName}`)
}

const deleteDevice = async (device) => {
  try {
    await ElMessageBox.confirm(
      `确认要删除设备 "${device.deviceName}" 吗？此操作不可撤销。`,
      '确认删除',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    const response = await deviceApi.deleteDevice(device.id)
    if (response.data.success) {
      ElMessage.success('设备删除成功')
      getDeviceList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除设备失败：' + error.message)
    }
  }
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

.device-management-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.operation-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-operations, .right-operations {
  display: flex;
  gap: 10px;
}

.device-name {
  display: flex;
  flex-direction: column;
}

.device-model {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.device-detail {
  padding: 15px;
  background-color: #fafafa;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.template-download {
  text-align: center;
  margin-top: 15px;
}

.mb-20 {
  margin-bottom: 20px;
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

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-table__expand-icon) {
  color: #409eff;
}
</style>