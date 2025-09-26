<template>
  <div class="user-management-integrated-container tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background">
    </div>
    
    <h2>智能板卡设备管理</h2>

    <!-- 页面操作区 -->
    <div class="page-operations">
      <el-button type="success" :icon="Plus" size="small" class="tech-button-sm" @click="showAddBoard">添加设备</el-button>
      <el-button type="warning" :icon="Upload" size="small" class="tech-button-sm" @click="getBoardStats" :loading="boardStatsLoading">获取统计</el-button>
      <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="getBoardList" :loading="boardLoading">刷新列表</el-button>
    </div>

      <!-- 设备搜索和筛选 -->
      <div class="search-filters-card tech-card mb-20">
        <div class="search-filters-header">
          <span class="filter-title">搜索筛选</span>
          <div class="header-stats">
            <el-tag class="stat-tag online" size="small">
              <i class="status-dot online"></i>
              在线: {{ onlineBoardCount }}
            </el-tag>
            <el-tag class="stat-tag offline" size="small">
              <i class="status-dot offline"></i>
              离线: {{ offlineBoardCount }}
            </el-tag>
          </div>
        </div>
        <div class="search-filters-content">
          <div class="filter-row">
            <div class="filter-item">
              <label for="deviceNameFilter">设备名称</label>
              <el-input
                v-model="boardSearchForm.deviceName"
                id="deviceNameFilter"
                placeholder="搜索设备名称"
                class="tech-input"
                clearable
                @keyup.enter="handleBoardSearch"
                @clear="handleBoardSearch"
              />
            </div>
            <div class="filter-item">
              <label for="deviceCodeFilter">设备编号</label>
              <el-input
                v-model="boardSearchForm.deviceCode"
                id="deviceCodeFilter"
                placeholder="搜索设备编号"
                class="tech-input"
                clearable
                @keyup.enter="handleBoardSearch"
                @clear="handleBoardSearch"
              />
            </div>
            <div class="filter-item">
              <label for="deviceStatusFilter">设备状态</label>
              <el-select
                v-model="boardSearchForm.status"
                id="deviceStatusFilter"
                placeholder="全部"
                class="tech-select"
                clearable
                @change="handleBoardSearch"
              >
                <el-option label="全部" value="" />
                <el-option label="在线" value="online" />
                <el-option label="离线" value="offline" />
                <el-option label="错误" value="error" />
              </el-select>
            </div>
            <div class="filter-item">
              <label for="manufacturerFilter">设备厂商</label>
              <el-select
                v-model="boardSearchForm.manufacturer"
                id="manufacturerFilter"
                placeholder="全部"
                class="tech-select"
                clearable
                @change="handleBoardSearch"
              >
                <el-option label="全部" value="" />
                <el-option label="海康威视" value="海康威视" />
                <el-option label="大华" value="大华" />
                <el-option label="华为" value="华为" />
              </el-select>
            </div>
            <div class="filter-actions">
              <el-button type="primary" :icon="Search" class="tech-button-sm" @click="handleBoardSearch">搜索</el-button>
              <el-button :icon="RefreshRight" class="tech-button-sm" @click="resetBoardSearch">重置</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义表格 -->
      <div class="custom-table" v-loading="boardLoading">
        <!-- 表格头部 -->
        <div class="table-header">
          <div class="header-cell expand-cell"></div>
          <div class="header-cell id-cell">设备ID</div>
          <div class="header-cell name-cell">设备名称</div>
          <div class="header-cell number-cell">设备编号</div>
          <div class="header-cell ip-cell">设备IP</div>
          <div class="header-cell status-cell">设备状态</div>
          <div class="header-cell firmware-cell">固件版本</div>
          <div class="header-cell camera-cell">绑定摄像机</div>
          <div class="header-cell action-cell">操作</div>
        </div>

        <!-- 表格内容 -->
        <div class="table-body">
          <div
            v-for="(row, index) in paginatedBoards"
            :key="row.ID || row.id || index"
            class="table-row-wrapper"
          >
            <!-- 主行 -->
            <div class="table-row" :class="{ 'expanded': expandedRows.has(row.ID || row.id) }">
              <div class="body-cell expand-cell">
                <button
                  class="expand-btn"
                  @click="toggleExpand(row)"
                  :class="{ 'expanded': expandedRows.has(row.ID || row.id) }"
                >
                  <span class="expand-icon">▶</span>
                </button>
              </div>
              <div class="body-cell id-cell">{{ row.ID || row.id || 'N/A' }}</div>
              <div class="body-cell name-cell">{{ row.DeviceName || row.device_name || 'N/A' }}</div>
              <div class="body-cell number-cell">{{ row.DeviceNumber || row.device_number || 'N/A' }}</div>
              <div class="body-cell ip-cell">{{ row.DeviceIP || row.device_ip || 'N/A' }}</div>
              <div class="body-cell status-cell">
                <span class="status-tag" :class="getStatusClass(row.DeviceStatus || row.device_status)">
                  {{ getStatusText(row.DeviceStatus || row.device_status) }}
                </span>
              </div>
              <div class="body-cell firmware-cell">{{ row.FirmwareVersion || row.firmware_version || 'N/A' }}</div>
              <div class="body-cell camera-cell">
                <span v-if="row.BoundCameraName || row.bound_camera_name" class="camera-tag bound">
                  {{ row.BoundCameraName || row.bound_camera_name }}
                </span>
                <span v-else class="camera-tag unbound">未绑定</span>
              </div>
              <div class="body-cell action-cell">
                <button class="action-btn view-btn" @click="viewBoardDetail(row)">
                  <i class="btn-icon">👁</i>详情
                </button>
                <button class="action-btn edit-btn" @click="editBoard(row)">
                  <i class="btn-icon">✏</i>编辑
                </button>
                <button class="action-btn bind-btn" @click="showBindCamera(row)">
                  <i class="btn-icon">🔗</i>绑定
                </button>
                <button class="action-btn delete-btn" @click="deleteBoard(row)">
                  <i class="btn-icon">🗑</i>删除
                </button>
              </div>
            </div>

            <!-- 展开行 -->
            <div v-if="expandedRows.has(row.ID || row.id)" class="expanded-row">
              <div class="device-detail-panel">
                <div class="detail-title">
                  <i class="detail-icon">🔧</i>
                  设备详细信息
                </div>
                <div class="detail-grid">
                  <div class="detail-group">
                    <h4>基础信息</h4>
                    <div class="detail-item">
                      <span class="label">设备ID:</span>
                      <span class="value">{{ row.ID || row.id || 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">设备名称:</span>
                      <span class="value">{{ row.DeviceName || row.device_name || 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">设备编号:</span>
                      <span class="value">{{ row.DeviceNumber || row.device_number || 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">设备IP:</span>
                      <span class="value">{{ row.DeviceIP || row.device_ip || 'N/A' }}</span>
                    </div>
                  </div>

                  <div class="detail-group">
                    <h4>连接配置</h4>
                    <div class="detail-item">
                      <span class="label">RTSP端口:</span>
                      <span class="value">{{ row.RtspPort || row.rtsp_port || 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">RTSP路径:</span>
                      <span class="value">{{ row.RtspPath || row.rtsp_path || 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">绑定摄像机:</span>
                      <span class="value">{{ row.BoundCameraName || row.bound_camera_name || '未绑定' }}</span>
                    </div>
                  </div>

                  <div class="detail-group">
                    <h4>算法信息</h4>
                    <div class="detail-item">
                      <span class="label">模型类型:</span>
                      <span class="value">{{ row.AlgorithmModelType || row.algorithm_model_type || 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">模型版本:</span>
                      <span class="value">{{ row.AlgorithmModelVersion || row.algorithm_model_version || 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">固件版本:</span>
                      <span class="value">{{ row.FirmwareVersion || row.firmware_version || 'N/A' }}</span>
                    </div>
                  </div>

                  <div class="detail-group">
                    <h4>状态信息</h4>
                    <div class="detail-item">
                      <span class="label">设备状态:</span>
                      <span class="value status" :class="getStatusClass(row.DeviceStatus || row.device_status)">
                        {{ getStatusText(row.DeviceStatus || row.device_status) }}
                      </span>
                    </div>
                    <div class="detail-item">
                      <span class="label">流状态:</span>
                      <span class="value status" :class="getStatusClass(row.StreamStatus || row.stream_status)">
                        {{ getStatusText(row.StreamStatus || row.stream_status) }}
                      </span>
                    </div>
                    <div class="detail-item">
                      <span class="label">创建时间:</span>
                      <span class="value">{{ formatTime(row.CreatedAt || row.created_at) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">更新时间:</span>
                      <span class="value">{{ formatTime(row.UpdatedAt || row.updated_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="flex-center">
        <el-pagination
          v-model:current-page="boardPagination.pageNum"
          v-model:page-size="boardPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="boardPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleBoardSizeChange"
          @current-change="handleBoardCurrentChange"
        />
      </div>

    <!-- 设备配置对话框 -->
    <el-dialog 
      v-model="boardDialogVisible" 
      :title="boardDialogTitle" 
      width="900px"
      class="tech-dialog"
      :modal-class="'tech-modal'"
      destroy-on-close>
      <div class="dialog-content">
        <el-form :model="boardForm" :rules="boardRules" ref="boardFormRef" label-width="120px" class="tech-form">
          <div class="form-section">
            <h3 class="section-title">基础信息配置</h3>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="deviceName">
                  <el-input 
                    v-model="boardForm.deviceName" 
                    placeholder="请输入设备名称"
                    class="tech-input">
                  </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备编号" prop="deviceCode">
                  <el-input 
                    v-model="boardForm.deviceCode" 
                    placeholder="请输入设备编号"
                    class="tech-input">
                  </el-input>
            </el-form-item>
          </el-col>
        </el-row>
          </div>
          
          <div class="form-section">
            <h3 class="section-title">网络连接配置</h3>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备IP地址" prop="ipAddress">
                  <el-input 
                    v-model="boardForm.ipAddress" 
                    placeholder="请输入IP地址"
                    class="tech-input">
                  </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="通信端口" prop="port">
                  <el-input-number 
                    v-model="boardForm.port" 
                    :min="1" 
                    :max="65535" 
                    style="width: 100%"
                    class="tech-input-number">
                  </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
          </div>
          
          <div class="form-section">
            <h3 class="section-title">设备属性配置</h3>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备厂商">
                  <el-select 
                    v-model="boardForm.manufacturer" 
                    placeholder="请选择厂商" 
                    style="width: 100%"
                    class="tech-select">
                <el-option label="海康威视" value="海康威视"></el-option>
                <el-option label="大华" value="大华"></el-option>
                <el-option label="华为" value="华为"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备型号">
                  <el-input 
                    v-model="boardForm.model" 
                    placeholder="请输入设备型号"
                    class="tech-input">
                  </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="安装位置">
                  <el-input 
                    v-model="boardForm.location" 
                    placeholder="请输入安装位置"
                    class="tech-input">
                  </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="序列号">
                  <el-input 
                    v-model="boardForm.serialNumber" 
                    placeholder="请输入序列号"
                    class="tech-input">
                  </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="固件版本">
              <el-input 
                v-model="boardForm.firmwareVersion" 
                placeholder="请输入固件版本，如: v2.1.0"
                class="tech-input">
              </el-input>
        </el-form-item>
          </div>
      </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <el-button class="tech-button cancel" @click="boardDialogVisible = false">
            取消操作
          </el-button>
          <el-button class="tech-button primary" @click="saveBoard" :loading="boardSaving">
            <span v-if="!boardSaving">确认保存</span>
            <span v-else>正在保存...</span>
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 摄像机绑定对话框 -->
    <el-dialog 
      v-model="bindCameraDialogVisible" 
      title="摄像机绑定配置" 
      width="700px"
      class="tech-dialog"
      :modal-class="'tech-modal'"
      destroy-on-close>
      <div class="dialog-content">
        <el-form :model="bindForm" :rules="bindRules" ref="bindFormRef" label-width="120px" class="tech-form">
          <div class="form-section">
            <h3 class="section-title">绑定配置</h3>
        <el-form-item label="板卡设备">
              <el-input 
                :model-value="currentBoardForBinding?.DeviceName || currentBoardForBinding?.device_name" 
                readonly 
                class="tech-input readonly">
              </el-input>
        </el-form-item>
        <el-form-item label="选择摄像机" prop="cameraId">
              <el-select 
                v-model="bindForm.cameraId" 
                placeholder="请选择要绑定的摄像机" 
                style="width: 100%" 
                filterable
                class="tech-select">
            <el-option
              v-for="camera in cameraList"
              :key="camera.cameraId"
              :label="`${camera.deviceName} (${camera.ipAddress})`"
              :value="camera.cameraId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="摄像机名称">
              <el-input 
                v-model="bindForm.cameraName" 
                placeholder="请输入摄像机显示名称"
                class="tech-input">
              </el-input>
        </el-form-item>
          </div>
      </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <el-button class="tech-button cancel" @click="bindCameraDialogVisible = false">
            取消绑定
          </el-button>
          <el-button class="tech-button primary" @click="saveCameraBinding" :loading="bindSaving">
            <span v-if="!bindSaving">确认绑定</span>
            <span v-else>正在绑定...</span>
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh, Plus, Upload, Search, RefreshRight
} from '@element-plus/icons-vue'
import { deviceApi } from '@/api/device'

// 响应式数据
const boardLoading = ref(false)
const boardStatsLoading = ref(false)

// 展开行管理
const expandedRows = ref(new Set())

// 板卡对话框状态
const boardDialogVisible = ref(false)
const boardDialogTitle = ref('添加智能板卡')
const editingBoardId = ref(null)
const boardSaving = ref(false)

// 绑定对话框状态
const bindCameraDialogVisible = ref(false)
const bindSaving = ref(false)
const currentBoardForBinding = ref(null)

// 摄像机列表
const cameraList = ref([])

// 板卡数据
const boardList = ref([])

// 表单引用
const boardFormRef = ref()
const bindFormRef = ref()

// 板卡搜索表单
const boardSearchForm = reactive({
  deviceName: '',
  deviceCode: '',
  status: '',
  manufacturer: ''
})

// 板卡表单
const boardForm = reactive({
  deviceName: '',
  deviceCode: '',
  ipAddress: '',
  port: 8080,
  manufacturer: '',
  model: '',
  location: '',
  serialNumber: '',
  firmwareVersion: ''
})

// 绑定表单
const bindForm = reactive({
  cameraId: '',
  cameraName: ''
})

// 板卡分页
const boardPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})

// 计算属性
const filteredBoards = computed(() => {
  let filtered = boardList.value

  if (boardSearchForm.deviceName) {
    filtered = filtered.filter(item => {
      const deviceName = item.DeviceName || item.device_name || ''
      return deviceName.toLowerCase().includes(boardSearchForm.deviceName.toLowerCase())
    })
  }

  if (boardSearchForm.deviceCode) {
    filtered = filtered.filter(item => {
      const deviceCode = item.DeviceNumber || item.device_number || ''
      return deviceCode.toLowerCase().includes(boardSearchForm.deviceCode.toLowerCase())
    })
  }

  if (boardSearchForm.status) {
    filtered = filtered.filter(item => {
      const status = item.DeviceStatus || item.device_status
      return status === boardSearchForm.status
    })
  }

  if (boardSearchForm.manufacturer) {
    filtered = filtered.filter(item => {
      const manufacturer = item.manufacturer || item.vendor
      return manufacturer === boardSearchForm.manufacturer
    })
  }

  return filtered
})

// const totalBoards = computed(() => filteredBoards.value.length)

const paginatedBoards = computed(() => {
  const start = (boardPagination.pageNum - 1) * boardPagination.pageSize
  const end = start + boardPagination.pageSize
  return filteredBoards.value.slice(start, end)
})

const onlineBoardCount = computed(() => {
  return boardList.value.filter(board => {
    const status = board.DeviceStatus || board.device_status
    return status === 'online' || status === 'connected' || status === 'active'
  }).length
})

const offlineBoardCount = computed(() => {
  return boardList.value.filter(board => {
    const status = board.DeviceStatus || board.device_status
    return status === 'offline' || status === 'disconnected' || status === 'inactive'
  }).length
})

// 表单验证规则
const boardRules = {
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  deviceCode: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  ipAddress: [
    { required: true, message: '请输入设备IP地址', trigger: 'blur' },
    { pattern: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, message: '请输入正确的IP地址', trigger: 'blur' }
  ],
  port: [{ required: true, message: '请输入通信端口', trigger: 'blur' }]
}

const bindRules = {
  cameraId: [{ required: true, message: '请选择摄像机', trigger: 'change' }],
  cameraName: [{ required: true, message: '请输入摄像机名称', trigger: 'blur' }]
}

// 生命周期
onMounted(() => {
  getBoardList()
})

// ==================== 展开/折叠功能 ====================

// 切换行展开状态
const toggleExpand = (row) => {
  const rowId = row.ID || row.id
  if (expandedRows.value.has(rowId)) {
    expandedRows.value.delete(rowId)
  } else {
    expandedRows.value.add(rowId)
  }
}

// ==================== 板卡管理方法 ====================

// 获取板卡列表
const getBoardList = async () => {
  try {
    boardLoading.value = true
    
    // 检查认证状态
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.error('请先登录')
      return
    }
    
    console.log('正在获取板卡列表...')
    // 映射前端参数到后端期望的参数名
    const apiParams = {
      page: boardPagination.pageNum,
      page_size: boardPagination.pageSize,
      keyword: boardSearchForm.deviceName || boardSearchForm.deviceCode || '',
      device_status: boardSearchForm.status,
      // 映射厂商参数
      manufacturer: boardSearchForm.manufacturer
    }
    
    console.log('API请求参数:', apiParams)
    const response = await deviceApi.getBoardList(apiParams)
    
    console.log('板卡API响应:', response)
    console.log('响应完整结构:', JSON.stringify(response, null, 2))
    
    // 检查响应格式
    if (response && response.code === 200) {
      // 直接从响应中获取数据
      const rawData = response.data?.list || response.data || []
      console.log('原始板卡数据:', rawData)
      
      // 如果有数据，打印第一条数据的字段结构
      if (rawData.length > 0) {
        console.log('第一条板卡数据字段:', Object.keys(rawData[0]))
        console.log('第一条板卡完整数据:', JSON.stringify(rawData[0], null, 2))
      }
      
      boardList.value = rawData
      boardPagination.total = response.data?.total || response.total || rawData.length
      boardPagination.totalPages = response.data?.totalPages || response.totalPages || Math.ceil(boardPagination.total / boardPagination.pageSize)
      console.log('处理后的板卡列表数据:', boardList.value)
      ElMessage.success(`成功获取 ${boardList.value.length} 条板卡数据`)
    } else {
      const errorMsg = response?.message || '获取板卡列表失败'
      console.error('板卡API错误响应:', response)
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    console.error('板卡API错误:', error)
    
    // 根据错误类型提供更详细的错误信息
    if (error.response?.status === 401) {
      ElMessage.error('认证失败，请重新登录')
      // 可以在这里跳转到登录页面
    } else if (error.response?.status === 403) {
      ElMessage.error('权限不足，无法访问板卡管理')
    } else if (error.response?.status === 404) {
      ElMessage.error('板卡管理API接口不存在')
    } else if (error.response?.status >= 500) {
      ElMessage.error('服务器错误，请联系管理员')
    } else {
      ElMessage.error(`获取板卡列表失败：${error.message}`)
    }
  } finally {
    boardLoading.value = false
  }
}

// 获取板卡统计信息
const getBoardStats = async () => {
  try {
    boardStatsLoading.value = true
    const response = await deviceApi.getBoardStats()
    if (response.data && response.data.code === 200) {
      ElMessage.success('统计信息获取成功')
      console.log('板卡统计信息:', response.data.data)
    } else {
      ElMessage.error('获取统计信息失败')
    }
  } catch (error) {
    console.error('获取统计信息错误:', error)
    ElMessage.error('获取统计信息失败：' + error.message)
  } finally {
    boardStatsLoading.value = false
  }
}

// 板卡搜索
const handleBoardSearch = () => {
  boardPagination.pageNum = 1
  getBoardList()
}

// 重置板卡搜索
const resetBoardSearch = () => {
  Object.assign(boardSearchForm, {
    deviceName: '',
    deviceCode: '',
    status: '',
    manufacturer: ''
  })
  boardPagination.pageNum = 1
  getBoardList()
}

// 显示添加板卡对话框
const showAddBoard = () => {
  boardDialogVisible.value = true
  boardDialogTitle.value = '添加智能板卡'
  editingBoardId.value = null
  Object.assign(boardForm, {
    deviceName: '',
    deviceCode: '',
    ipAddress: '',
    port: 8080,
    manufacturer: '',
    model: '',
    location: '',
    serialNumber: '',
    firmwareVersion: ''
  })
}

// 查看板卡详情
const viewBoardDetail = (board) => {
  ElMessage.info(`查看板卡详情：${board.DeviceName || board.device_name}`)
}

// 显示编辑板卡对话框
const editBoard = (board) => {
  boardDialogVisible.value = true
  boardDialogTitle.value = '编辑智能板卡'
  editingBoardId.value = board.ID || board.id
  Object.assign(boardForm, {
    deviceName: board.DeviceName || board.device_name || '',
    deviceCode: board.DeviceNumber || board.device_number || '',
    ipAddress: board.DeviceIP || board.device_ip || '',
    port: board.RtspPort || board.rtsp_port || 8080,
    manufacturer: board.manufacturer || board.vendor || '',
    model: board.model || board.device_model || '',
    location: board.location || board.install_location || '',
    serialNumber: board.serialNumber || board.serial_number || board.sn || '',
    firmwareVersion: board.FirmwareVersion || board.firmware_version || ''
  })
}

// 保存板卡
const saveBoard = async () => {
  try {
    // 表单验证
    if (!boardFormRef.value) {
      ElMessage.error('表单引用未找到')
      return
    }
    
    const isValid = await boardFormRef.value.validate()
    if (!isValid) {
      ElMessage.error('请填写完整的板卡信息')
      return
    }

    // 检查认证状态
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.error('请先登录')
      return
    }

    boardSaving.value = true

    if (editingBoardId.value) {
      // 更新板卡
      console.log('正在更新板卡...', editingBoardId.value, boardForm)
      const response = await deviceApi.updateBoard(editingBoardId.value, boardForm)
      
      if (response && response.code === 200) {
        ElMessage.success('板卡更新成功')
        boardDialogVisible.value = false
        getBoardList()
      } else {
        const errorMsg = response?.message || '更新板卡失败'
        ElMessage.error(errorMsg)
      }
    } else {
      // 创建板卡
      console.log('正在创建板卡...', boardForm)
      const response = await deviceApi.createBoard(boardForm)
      
      if (response && response.code === 200) {
        ElMessage.success('板卡创建成功')
        boardDialogVisible.value = false
        getBoardList()
      } else {
        const errorMsg = response?.message || '创建板卡失败'
        ElMessage.error(errorMsg)
      }
    }
  } catch (error) {
    console.error('保存板卡错误:', error)
    
    // 根据错误类型提供更详细的错误信息
    if (error.response?.status === 401) {
      ElMessage.error('认证失败，请重新登录')
    } else if (error.response?.status === 403) {
      ElMessage.error('权限不足，无法操作板卡')
    } else if (error.response?.status === 409) {
      ElMessage.error('板卡已存在，请检查设备编号或IP地址')
    } else if (error.response?.status >= 500) {
      ElMessage.error('服务器错误，请联系管理员')
    } else {
      ElMessage.error(`保存板卡失败：${error.message}`)
    }
  } finally {
    boardSaving.value = false
  }
}

// 删除板卡
const deleteBoard = async (board) => {
  try {
    const boardName = board.DeviceName || board.device_name || '未知板卡'
    const boardId = board.ID || board.id
    
    await ElMessageBox.confirm(
      `确认要删除板卡 "${boardName}" 吗？此操作不可撤销。`,
      '确认删除',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    const response = await deviceApi.deleteBoard(boardId)
    if (response.data && response.data.code === 200) {
      ElMessage.success('板卡删除成功')
      getBoardList()
    } else {
      ElMessage.error(response.data?.message || '删除板卡失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除板卡错误:', error)
      ElMessage.error('删除板卡失败：' + error.message)
    }
  }
}

// 显示绑定摄像机对话框
const showBindCamera = (board) => {
  currentBoardForBinding.value = board
  bindCameraDialogVisible.value = true
  Object.assign(bindForm, {
    cameraId: board.BoundCameraID || board.bound_camera_id || '',
    cameraName: board.BoundCameraName || board.bound_camera_name || ''
  })
  // 获取摄像机列表
  getCameraList()
}

// 获取摄像机列表
const getCameraList = async () => {
  try {
    // 检查认证状态
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.error('请先登录')
      return
    }
    
    console.log('正在获取摄像机列表...')
    const response = await deviceApi.getCameraList()
    
    if (response && response.code === 200) {
      cameraList.value = response.data || []
      console.log('摄像机列表数据:', cameraList.value)
    } else {
      const errorMsg = response?.message || '获取摄像机列表失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    console.error('获取摄像机列表错误:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('认证失败，请重新登录')
    } else if (error.response?.status === 403) {
      ElMessage.error('权限不足，无法访问摄像机列表')
    } else {
      ElMessage.error(`获取摄像机列表失败：${error.message}`)
    }
  }
}

// 保存摄像机绑定
const saveCameraBinding = async () => {
  try {
    bindSaving.value = true

    const response = await deviceApi.bindBoardToCamera(currentBoardForBinding.value.boardId, bindForm)
    if (response.data && response.data.code === 200) {
      ElMessage.success('摄像机绑定成功')
      bindCameraDialogVisible.value = false
      getBoardList()
    } else {
      ElMessage.error(response.data?.message || '绑定摄像机失败')
    }
  } catch (error) {
    console.error('绑定摄像机错误:', error)
    ElMessage.error('绑定摄像机失败：' + error.message)
  } finally {
    bindSaving.value = false
  }
}


// 固件升级
// const upgradeFirmware = async (board) => {
//   ElMessage.info(`固件升级功能：${board.deviceName}`)
//   // TODO: 实现固件升级功能
// }

// 测试板卡连接
// const testBoardConnection = async (board) => {
//   try {
//     const boardId = board.ID || board.id
//     const boardName = board.DeviceName || board.device_name || '未知板卡'
//     
//     if (!boardId) {
//       ElMessage.error('板卡ID不存在，无法测试连接')
//       return
//     }
//     
//     const response = await deviceApi.testBoardConnection(boardId)
//     if (response && response.code === 200) {
//       ElMessage.success(`板卡 ${boardName} 连接测试成功`)
//     } else {
//       ElMessage.error(`板卡 ${boardName} 连接测试失败`)
//     }
//   } catch (error) {
//     console.error('测试连接错误:', error)
//     ElMessage.error('连接测试失败：' + error.message)
//   }
// }

// 板卡分页变化
const handleBoardCurrentChange = (pageNum) => {
  boardPagination.pageNum = pageNum
  getBoardList()
}

const handleBoardSizeChange = (pageSize) => {
  boardPagination.pageSize = pageSize
  boardPagination.pageNum = 1
  getBoardList()
}

// 状态文本辅助函数
const getStatusText = (status) => {
  const textMap = {
    'online': '在线',
    'offline': '离线', 
    'error': '错误',
    'connected': '在线',
    'disconnected': '离线',
    'active': '在线',
    'inactive': '离线'
  }
  return textMap[status] || status || '未知'
}

// 时间格式化函数
const formatTime = (time) => {
  if (!time) return 'N/A'
  try {
    const date = new Date(time)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return time
  }
}

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    'online': 'online',
    'offline': 'offline',
    'error': 'error',
    '在线': 'online',
    '离线': 'offline',
    '错误': 'error',
    'connected': 'online',
    'disconnected': 'offline',
    'active': 'online',
    'inactive': 'offline'
  }
  return classMap[status] || 'offline'
}

</script>

<style scoped>
/* 页面容器 */
.tech-page-container {
  position: relative;
  width: 100%;
  min-height: 100vh; /* 最小高度为视口高度，允许内容撑开 */
  max-height: 100vh; /* 最大高度为视口高度，超出时滚动 */
  padding: 20px;
  padding-bottom: 40px; /* 底部额外留白，确保分页控件可见 */
  background: transparent; /* 使用全局背景 */
  overflow-y: auto; /* 垂直滚动 */
  overflow-x: hidden; /* 隐藏水平滚动 */
  box-sizing: border-box; /* 包含padding在内的盒子模型 */
}

.tech-page-container::-webkit-scrollbar {
  width: 8px;
  background: rgba(0, 0, 0, 0.1);
}

.tech-page-container::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.05);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.tech-page-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.3) 0%, 
    rgba(0, 200, 255, 0.5) 50%, 
    rgba(0, 255, 255, 0.3) 100%);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

/* ==================== 背景效果 ==================== */
.tech-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  background: 
    radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 200, 255, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.03) 0%, transparent 50%);
}


/* ==================== 页面标题 ==================== */
.tech-page-container h2 {
  position: relative;
  z-index: 10;
  color: #00ffff;
  font-size: 24px;
  font-weight: 600;
  margin: 20px 0 30px 0;
  padding-left: 0;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
  letter-spacing: 1px;
}

/* ==================== 科技感卡片 ==================== */
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
  transition: all 0.3s ease;
}

/* ==================== 页面标题 ==================== */
.tech-page-container h2 {
  position: relative;
  z-index: 10;
  color: #00ffff;
  font-size: 24px;
  font-weight: 600;
  margin: 20px 0 30px 0;
  padding-left: 0;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
  letter-spacing: 1px;
}

/* ==================== 页面操作区 ==================== */
.page-operations {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
  justify-content: flex-end;
}

.tech-card:hover {
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(0, 255, 255, 0.2) !important;
  transform: translateY(-2px);
}

.tech-card :deep(.el-card__header) {
  background: rgba(20, 30, 50, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
  color: #00ffff !important;
  padding: 16px 20px !important;
}

.tech-card :deep(.el-card__body) {
  background: rgba(15, 25, 45, 0.95) !important;
  padding: 20px !important;
  border-radius: 0 0 12px 12px !important;
}

/* ==================== 卡片头部 ==================== */
.card-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  font-weight: bold;
  color: #00ffff;
  width: 100% !important;
}

.card-header span {
  color: #00ffff;
  font-weight: 600;
  font-size: 16px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
  letter-spacing: 1px;
}


.stat-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  border: none !important;
}

.stat-tag.online {
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
}

.stat-tag.offline {
  background: rgba(255, 69, 0, 0.1);
  color: #ff4500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  position: relative;
}

.status-dot.online {
  background: #00ff00;
  box-shadow: 0 0 8px rgba(0, 255, 0, 0.6);
}

.status-dot.offline {
  background: #ff4500;
  box-shadow: 0 0 8px rgba(255, 69, 0, 0.6);
}

.status-dot.error {
  background: #ffff00;
  box-shadow: 0 0 8px rgba(255, 255, 0, 0.6);
}

/* ==================== 搜索筛选样式 ==================== */
.search-filters-card {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 255, 255, 0.03) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
}

.search-filters-header {
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  padding-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-title {
  color: #00ffff;
  font-weight: bold;
  font-size: 16px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

.header-stats {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-filters-content {
  padding: 0;
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr auto;
  gap: 15px;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-item label {
  color: #00ffff;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
}

.filter-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* ==================== 操作区域 ==================== */
.operation-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0 20px 0;
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
}

.left-operations, .right-operations {
  display: flex;
  gap: 16px;
  align-items: center;
}


/* ==================== 科技感按钮 ==================== */
.tech-button {
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  font-weight: 500 !important;
  padding: 10px 20px !important;
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.4) !important;
  position: relative;
  overflow: hidden;
}

.tech-button:hover {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-1px) !important;
  border-color: rgba(0, 255, 255, 0.6) !important;
}

.tech-button.primary {
  background: rgba(0, 120, 255, 0.2) !important;
  border-color: rgba(0, 120, 255, 0.5) !important;
}

.tech-button.success {
  background: rgba(0, 255, 0, 0.1) !important;
  border-color: rgba(0, 255, 0, 0.4) !important;
  color: #00ff00 !important;
}

.tech-button.info {
  background: rgba(255, 255, 0, 0.1) !important;
  border-color: rgba(255, 255, 0, 0.4) !important;
  color: #ffff00 !important;
}

.tech-button.refresh {
  background: rgba(255, 165, 0, 0.1) !important;
  border-color: rgba(255, 165, 0, 0.4) !important;
  color: #ffa500 !important;
}

.tech-button.cancel {
  background: rgba(128, 128, 128, 0.1) !important;
  border-color: rgba(128, 128, 128, 0.4) !important;
  color: #808080 !important;
}

.button-text {
  position: relative;
  z-index: 2;
}

/* ==================== 小按钮样式 ==================== */
.tech-button-sm {
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  font-size: 12px !important;
  padding: 6px 12px !important;
  text-shadow: 0 0 4px rgba(0, 255, 255, 0.3) !important;
  font-weight: 500 !important;
}

.tech-button-sm:hover {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-1px) !important;
}

.tech-button-sm.view {
  color: #87ceeb !important;
  border-color: rgba(135, 206, 235, 0.4) !important;
  background: rgba(135, 206, 235, 0.1) !important;
}

.tech-button-sm.edit {
  color: #00ff00 !important;
  border-color: rgba(0, 255, 0, 0.4) !important;
  background: rgba(0, 255, 0, 0.1) !important;
}

.tech-button-sm.bind {
  color: #ffff00 !important;
  border-color: rgba(255, 255, 0, 0.4) !important;
  background: rgba(255, 255, 0, 0.1) !important;
}

.tech-button-sm.upgrade {
  color: #ffa500 !important;
  border-color: rgba(255, 165, 0, 0.4) !important;
  background: rgba(255, 165, 0, 0.1) !important;
}

.tech-button-sm.test {
  color: #9370db !important;
  border-color: rgba(147, 112, 219, 0.4) !important;
  background: rgba(147, 112, 219, 0.1) !important;
}

.tech-button-sm.delete {
  color: #ff6b6b !important;
  border-color: rgba(255, 107, 107, 0.4) !important;
  background: rgba(255, 107, 107, 0.1) !important;
}

/* ==================== 自定义表格样式 ==================== */
.custom-table {
  background: rgba(15, 25, 45, 0.95);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1);
}

/* 表格头部 */
.table-header {
  display: grid;
  grid-template-columns: 60px 80px 1fr 150px 150px 100px 120px 150px 280px;
  background: rgba(20, 30, 50, 0.8);
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.header-cell {
  padding: 12px 8px;
  color: #00ffff;
  font-weight: 600;
  text-align: center;
  border-right: 1px solid rgba(0, 255, 255, 0.1);
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.3);
  font-size: 14px;
}

.header-cell:last-child {
  border-right: none;
}

/* 表格主体 */
.table-body {
  background: rgba(15, 25, 45, 0.95);
}

.table-row-wrapper {
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
}

.table-row-wrapper:last-child {
  border-bottom: none;
}

.table-row {
  display: grid;
  grid-template-columns: 60px 80px 1fr 150px 150px 100px 120px 150px 280px;
  transition: all 0.3s ease;
  background: rgba(15, 25, 45, 0.95);
}

.table-row:nth-child(even) {
  background: rgba(20, 30, 50, 0.6);
}

.body-cell {
  padding: 12px 8px;
  color: rgba(255, 255, 255, 0.9);
  border-right: 1px solid rgba(0, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  min-height: 48px;
}

.body-cell:last-child {
  border-right: none;
}

/* 展开按钮 */
.expand-cell {
  justify-content: center;
}

.expand-btn {
  background: transparent;
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #00ffff;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.5);
}

.expand-icon {
  transition: transform 0.3s ease;
  font-size: 12px;
}

.expand-btn.expanded .expand-icon {
  transform: rotate(90deg);
}

/* ID单元格 */
.id-cell {
  color: #00ffff;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.4);
}

/* 名称单元格 */
.name-cell {
  justify-content: flex-start;
  padding-left: 12px;
}

/* 编号单元格 */
.number-cell {
  font-family: 'Courier New', monospace;
  justify-content: flex-start;
  padding-left: 12px;
}

/* IP单元格 */
.ip-cell {
  color: #00ffff;
  font-family: 'Courier New', monospace;
}

/* 状态标签 */
.status-tag {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-tag.online {
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  border: 1px solid rgba(0, 255, 0, 0.3);
}

.status-tag.offline {
  background: rgba(255, 69, 0, 0.1);
  color: #ff4500;
  border: 1px solid rgba(255, 69, 0, 0.3);
}

.status-tag.error {
  background: rgba(255, 255, 0, 0.1);
  color: #ffff00;
  border: 1px solid rgba(255, 255, 0, 0.3);
}

/* 固件版本 */
.firmware-cell {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

/* 摄像机标签 */
.camera-tag {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.camera-tag.bound {
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  border: 1px solid rgba(0, 255, 0, 0.3);
}

.camera-tag.unbound {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

/* 操作按钮 */
.action-cell {
  gap: 6px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 3px;
  min-width: 50px;
  justify-content: center;
}

.btn-icon {
  font-size: 10px;
}

.view-btn {
  color: #87ceeb;
  border-color: rgba(135, 206, 235, 0.4);
}

.view-btn:hover {
  background: rgba(135, 206, 235, 0.1);
  border-color: rgba(135, 206, 235, 0.6);
}

.edit-btn {
  color: #00ff00;
  border-color: rgba(0, 255, 0, 0.4);
}

.edit-btn:hover {
  background: rgba(0, 255, 0, 0.1);
  border-color: rgba(0, 255, 0, 0.6);
}

.bind-btn {
  color: #ffff00;
  border-color: rgba(255, 255, 0, 0.4);
}

.bind-btn:hover {
  background: rgba(255, 255, 0, 0.1);
  border-color: rgba(255, 255, 0, 0.6);
}

.delete-btn {
  color: #ff6b6b;
  border-color: rgba(255, 107, 107, 0.4);
}

.delete-btn:hover {
  background: rgba(255, 107, 107, 0.1);
  border-color: rgba(255, 107, 107, 0.6);
}

/* 展开行 */
.expanded-row {
  background: rgba(20, 30, 50, 0.6);
  border-top: 1px solid rgba(0, 255, 255, 0.2);
  animation: expandAnimation 0.3s ease-out;
}

@keyframes expandAnimation {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

/* 分页组件样式 */
.flex-center {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-pagination) {
  color: #00ffff !important;
}

:deep(.el-pagination .el-pager li) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  border-radius: 4px !important;
  margin: 0 2px !important;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: rgba(0, 255, 255, 0.3) !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  border-radius: 4px !important;
}


/* ==================== 详情面板 ==================== */
.device-detail-panel {
  background: rgba(20, 30, 50, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 20px;
  margin: 15px;
}

.detail-title {
  color: #00ffff;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
}

.detail-icon {
  font-size: 16px;
  margin-right: 5px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.detail-group {
  background: rgba(15, 25, 45, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.1);
  border-radius: 6px;
  padding: 15px;
}

.detail-group h4 {
  color: #00ffff;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.3);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  min-width: 80px;
}

.detail-item .value {
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 500;
  text-align: right;
}

.detail-item .value.status.online {
  color: #00ff00;
}

.detail-item .value.status.offline {
  color: #ff4500;
}

.detail-item .value.status.error {
  color: #ffff00;
}


/* ==================== 输入框样式 ==================== */
.tech-input :deep(.el-input__wrapper),
.tech-select :deep(.el-select__wrapper) {
  background-color: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
}

.tech-input :deep(.el-input__wrapper:hover),
.tech-select :deep(.el-select__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.6) !important;
}

.tech-input :deep(.el-input__wrapper.is-focus),
.tech-select :deep(.el-select__wrapper.is-focused) {
  border-color: rgba(0, 255, 255, 0.8) !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.2) !important;
}

.tech-input :deep(.el-input__inner),
.tech-select :deep(.el-select__input) {
  color: rgba(255, 255, 255, 0.95) !important;
  background: transparent !important;
}

.tech-input.readonly :deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.6) !important;
  background: rgba(128, 128, 128, 0.1) !important;
}

/* ==================== 对话框样式 ==================== */
.tech-dialog :deep(.el-dialog) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 12px !important;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(0, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
}

.tech-dialog :deep(.el-dialog__header) {
  background: rgba(20, 30, 50, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
  padding: 16px 20px !important;
}

.tech-dialog :deep(.el-dialog__title) {
  color: #00ffff !important;
  font-weight: 600 !important;
  font-size: 18px !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}

.tech-dialog :deep(.el-dialog__body) {
  background: rgba(15, 25, 45, 0.95) !important;
  padding: 20px !important;
}

.tech-dialog :deep(.el-dialog__footer) {
  background: rgba(20, 30, 50, 0.8) !important;
  border-top: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 0 0 12px 12px !important;
  padding: 16px 20px !important;
}

/* ==================== 表单区域 ==================== */
.dialog-content {
  color: rgba(255, 255, 255, 0.9);
}

.form-section {
  margin-bottom: 25px;
  padding: 15px;
  background: rgba(20, 30, 50, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.1);
  border-radius: 8px;
}

.section-title {
  color: #00ffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.3);
}

.tech-form :deep(.el-form-item__label) {
  color: rgba(0, 255, 255, 0.9) !important;
  font-weight: 500;
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.3);
  font-size: 14px;
}

.dialog-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

/* ==================== 视图控制 ==================== */
.list-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}


.view-controls {
  display: flex;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  overflow: hidden;
}

.view-controls .tech-button-sm {
  border: none !important;
  border-radius: 0 !important;
  margin: 0 !important;
}

.view-controls .tech-button-sm:first-child {
  border-radius: 6px 0 0 6px !important;
}

.view-controls .tech-button-sm:last-child {
  border-radius: 0 6px 6px 0 !important;
}
</style>

<!-- 全局样式覆盖 -->
<style>
/* 模态背景 */
.tech-modal {
  background: rgba(0, 0, 0, 0.8) !important;
  backdrop-filter: blur(5px) !important;
}

/* Element Plus 下拉框样式覆盖 */
.el-select-dropdown {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
}

.el-select-dropdown .el-select-dropdown__item {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
  transition: all 0.3s ease !important;
}

.el-select-dropdown .el-select-dropdown__item:hover {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

.el-select-dropdown .el-select-dropdown__item.is-selected {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}

/* 分页下拉框样式 */
.el-select-dropdown__item {
  color: rgba(255, 255, 255, 0.9) !important;
}

/* 加载动画样式 */
.el-loading-mask {
  background: rgba(0, 0, 0, 0.8) !important;
}

.el-loading-spinner .el-loading-text {
  color: #00ffff !important;
}

.el-loading-spinner .circular {
  border-color: rgba(0, 255, 255, 0.2) !important;
  border-top-color: #00ffff !important;
}
</style>