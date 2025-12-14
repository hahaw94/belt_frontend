<template>
  <div class="board-management">
    <!-- 板卡列表卡片 -->
    <el-card class="board-list-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ $t('board.title') }}</span>
          <div>
            <el-button type="success" :icon="Plus" size="small" class="tech-button-sm" @click="showAddBoard">{{ $t('board.addDevice') }}</el-button>
            <el-button type="warning" :icon="Upload" size="small" class="tech-button-sm" @click="getBoardStats" :loading="boardStatsLoading">{{ $t('board.getStats') }}</el-button>
            <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="getBoardList" :loading="boardLoading">{{ $t('board.refreshList') }}</el-button>
          </div>
        </div>
      </template>

      <!-- 设备搜索和筛选 -->
      <div class="search-filters-card tech-card mb-20">
        <div class="search-filters-header">
          <span class="filter-title">{{ $t('board.searchFilter') }}</span>
          <div class="header-stats">
            <el-tag class="stat-tag online" size="small">
              <i class="status-dot online"></i>
              {{ $t('board.online') }}: {{ onlineBoardCount }}
            </el-tag>
            <el-tag class="stat-tag offline" size="small">
              <i class="status-dot offline"></i>
              {{ $t('board.offline') }}: {{ offlineBoardCount }}
            </el-tag>
          </div>
        </div>
        <div class="search-filters-content">
          <div class="filter-row">
            <div class="filter-item">
              <label for="deviceNameFilter">{{ $t('board.deviceName') }}</label>
              <el-input
                v-model="boardSearchForm.deviceName"
                id="deviceNameFilter"
                :placeholder="$t('board.searchDeviceName')"
                class="tech-input"
                clearable
                @keyup.enter="handleBoardSearch"
                @clear="handleBoardSearch"
              />
            </div>
            <div class="filter-item">
              <label for="deviceCodeFilter">{{ $t('board.deviceCode') }}</label>
              <el-input
                v-model="boardSearchForm.deviceCode"
                id="deviceCodeFilter"
                :placeholder="$t('board.searchDeviceCode')"
                class="tech-input"
                clearable
                @keyup.enter="handleBoardSearch"
                @clear="handleBoardSearch"
              />
            </div>
            <div class="filter-item">
              <label for="deviceStatusFilter">{{ $t('board.deviceStatus') }}</label>
              <el-select
                v-model="boardSearchForm.status"
                id="deviceStatusFilter"
                :placeholder="$t('common.all')"
                class="tech-select"
                clearable
                @change="handleBoardSearch"
              >
                <el-option :label="$t('common.all')" value="" />
                <el-option :label="$t('board.online')" value="online" />
                <el-option :label="$t('board.offline')" value="offline" />
                <el-option :label="$t('board.error')" value="error" />
              </el-select>
            </div>
            <div class="filter-item">
              <label for="manufacturerFilter">{{ $t('board.manufacturer') }}</label>
              <el-select
                v-model="boardSearchForm.manufacturer"
                id="manufacturerFilter"
                :placeholder="$t('common.all')"
                class="tech-select"
                clearable
                @change="handleBoardSearch"
              >
                <el-option :label="$t('common.all')" value="" />
                <el-option :label="$t('board.hikvision')" value="海康威视" />
                <el-option :label="$t('board.dahua')" value="大华" />
                <el-option :label="$t('board.huawei')" value="华为" />
              </el-select>
            </div>
            <div class="filter-actions">
              <el-button type="primary" :icon="Search" class="tech-button-sm" @click="handleBoardSearch">{{ $t('common.search') }}</el-button>
              <el-button :icon="RefreshRight" class="tech-button-sm" @click="resetBoardSearch">{{ $t('common.reset') }}</el-button>
            </div>
          </div>
        </div>
      </div>

        <!-- 自定义表格 -->
        <div class="table-container">
          <div class="custom-table" v-loading="boardLoading">
          <!-- 表格头部 -->
          <div class="table-header">
            <div class="header-cell id-cell">{{ $t('board.deviceId') }}</div>
            <div class="header-cell name-cell">{{ $t('board.deviceName') }}</div>
            <div class="header-cell number-cell">{{ $t('board.deviceCode') }}</div>
            <div class="header-cell ip-cell">{{ $t('board.deviceIp') }}</div>
            <div class="header-cell status-cell">{{ $t('board.deviceStatus') }}</div>
            <div class="header-cell stream-status-cell">{{ $t('board.streamStatus') }}</div>
            <div class="header-cell camera-cell">{{ $t('board.boundCamera') }}</div>
            <div class="header-cell action-cell">{{ $t('common.operation') }}</div>
          </div>

          <!-- 表格内容 -->
          <div class="table-body">
            <div
              v-for="(row, index) in paginatedBoards"
              :key="row.ID || row.id || index"
              class="table-row-wrapper"
            >
              <!-- 主行 -->
              <div class="table-row">
                <div class="body-cell id-cell">{{ row.ID || row.id || 'N/A' }}</div>
                <div class="body-cell name-cell">{{ row.DeviceName || row.device_name || 'N/A' }}</div>
                <div class="body-cell number-cell">{{ row.DeviceNumber || row.device_number || 'N/A' }}</div>
                <div class="body-cell ip-cell">{{ row.DeviceIP || row.device_ip || 'N/A' }}</div>
                <div class="body-cell status-cell">
                  <span class="status-tag" :class="getStatusClass(row.DeviceStatus || row.device_status)">
                    {{ getStatusText(row.DeviceStatus || row.device_status) }}
                  </span>
                </div>
                <div class="body-cell stream-status-cell">
                  <span class="status-tag" :class="getStreamStatusClass(row.StreamStatus || row.stream_status)">
                    {{ getStreamStatusText(row.StreamStatus || row.stream_status) }}
                  </span>
                </div>
                <div class="body-cell camera-cell">
                  <span v-if="row.BoundCameraName || row.bound_camera_name" class="camera-tag bound">
                    {{ row.BoundCameraName || row.bound_camera_name }}
                  </span>
                  <span v-else class="camera-tag unbound">{{ $t('board.unbound') }}</span>
                </div>
                <div class="body-cell action-cell">
                  <button class="action-btn view-btn" @click="viewBoardDetail(row)">
                    {{ $t('board.detail') }}
                  </button>
                  <button class="action-btn edit-btn" @click="editBoard(row)">
                    {{ $t('common.edit') }}
                  </button>
                  <!-- 推流控制按钮 -->
                  <button 
                    v-if="(row.StreamStatus || row.stream_status) === 'streaming'"
                    class="action-btn pause-btn" 
                    @click="stopBoardStreaming(row)"
                    :disabled="streamOperationLoading"
                  >
                    {{ $t('board.stopTranscode') }}
                  </button>
                  <button 
                    v-else
                    class="action-btn start-btn" 
                    @click="startBoardStreaming(row)"
                    :disabled="streamOperationLoading"
                  >
                    {{ $t('board.startTranscode') }}
                  </button>
                  <button 
                    v-if="(row.StreamStatus || row.stream_status) === 'streaming'"
                    class="action-btn stream-btn" 
                    @click="showStreamInfo(row)"
                  >
                    {{ $t('board.streamInfo') }}
                  </button>
                  <!-- 原始流播放按钮 -->
                  <button 
                    v-if="row.BoundWVPChannelID || row.bound_wvp_channel_id"
                    class="action-btn play-btn" 
                    @click="playOriginalStream(row)"
                  >
                    {{ $t('board.originalStream') }}
                  </button>
                  <!-- 固件升级按钮 -->
                  <button 
                    v-if="(row.DeviceStatus || row.device_status) === 'online'"
                    class="action-btn upgrade-btn" 
                    @click="showUpgradeDialog(row)"
                  >
                    {{ $t('board.upgrade') }}
                  </button>
                  <button class="action-btn delete-btn" @click="deleteBoard(row)">
                    {{ $t('common.delete') }}
                  </button>
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
    </el-card>

    <!-- 设备配置对话框 -->
    <el-dialog 
      v-model="boardDialogVisible" 
      :title="boardDialogTitle" 
      width="700px"
      class="tech-dialog"
      :modal-class="'tech-modal'"
      destroy-on-close>
      <div class="dialog-content">
        <el-form :model="boardForm" :rules="boardRules" ref="boardFormRef" label-width="120px" class="tech-form simplified-form">
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
              <el-form-item label="RTSP端口" prop="port">
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
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="RTSP用户名" prop="rtspUsername">
                <el-input 
                  v-model="boardForm.rtspUsername" 
                  placeholder="请输入RTSP用户名"
                  class="tech-input"
                  clearable>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="RTSP密码" prop="rtspPassword">
                <el-input 
                  v-model="boardForm.rtspPassword" 
                  type="password"
                  placeholder="请输入RTSP密码"
                  class="tech-input"
                  show-password
                  clearable>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="RTSP路径" prop="rtspPath">
                <el-input 
                  v-model="boardForm.rtspPath" 
                  placeholder="请输入RTSP路径，例如：/stream1"
                  class="tech-input"
                  clearable>
                  <template #prepend>rtsp://</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
      </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer dialog-footer-actions">
          <el-button @click="boardDialogVisible = false">
            取消操作
          </el-button>
          <el-button type="primary" @click="saveBoard" :loading="boardSaving">
            <span v-if="!boardSaving">确认保存</span>
            <span v-else>正在保存...</span>
          </el-button>
        </div>
      </template>
    </el-dialog>


    <!-- 流信息对话框 -->
    <el-dialog 
      v-model="streamInfoDialogVisible" 
      title="设备流信息" 
      width="800px"
      class="tech-dialog"
      :modal-class="'tech-modal'"
      destroy-on-close>
      <div class="dialog-content" v-loading="streamInfoLoading">
        <div class="stream-info-panel">
          <div class="info-section">
            <h3 class="section-title">流基本信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">流ID:</span>
                <span class="value">{{ streamInfo.stream_id || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">推流状态:</span>
                <span class="value" :class="getStreamStatusClass(streamInfo.status)">
                  {{ getStreamStatusText(streamInfo.status) }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">开始时间:</span>
                <span class="value">{{ formatTime(streamInfo.start_time) }}</span>
              </div>
              <div class="info-item">
                <span class="label">最后活跃:</span>
                <span class="value">{{ formatTime(streamInfo.last_active_time) }}</span>
              </div>
            </div>
          </div>
          
          <div class="info-section" v-if="streamInfo.play_urls && Object.keys(streamInfo.play_urls).length > 0">
            <h3 class="section-title">播放地址</h3>
            <div class="play-urls-list">
              <div 
                v-for="(url, type) in streamInfo.play_urls" 
                :key="type" 
                class="url-item">
                <div class="url-type">{{ type.toUpperCase() }}:</div>
                <div class="url-content">
                  <code class="url-code">{{ url }}</code>
                  <button class="copy-btn" @click="copyToClipboard(url)">复制</button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="info-section" v-else>
            <h3 class="section-title">播放地址</h3>
            <div class="no-data">
              <p>暂无播放地址</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer dialog-footer-actions">
          <el-button @click="refreshStreamInfo" :loading="streamInfoLoading">
            刷新信息
          </el-button>
          <el-button @click="streamInfoDialogVisible = false">
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 设备详情对话框 -->
    <el-dialog 
      v-model="deviceDetailDialogVisible" 
      title="设备详细信息" 
      width="900px"
      class="tech-dialog"
      :modal-class="'tech-modal'"
      destroy-on-close>
      <div class="dialog-content" v-loading="deviceDetailLoading">
        <div class="device-full-detail-panel">
          <div class="detail-section">
            <h3 class="section-title">基础设备信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">设备ID:</span>
                <span class="value">{{ deviceDetail.id || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">设备名称:</span>
                <span class="value">{{ deviceDetail.deviceName || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">设备编号:</span>
                <span class="value">{{ deviceDetail.deviceNumber || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">设备IP:</span>
                <span class="value">{{ deviceDetail.deviceIP || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">设备型号:</span>
                <span class="value">{{ deviceDetail.model || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">厂商:</span>
                <span class="value">{{ deviceDetail.manufacturer || 'N/A' }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3 class="section-title">状态与配置</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">设备状态:</span>
                <span class="value" :class="getStatusClass(deviceDetail.deviceStatus)">
                  {{ getStatusText(deviceDetail.deviceStatus) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">推流状态:</span>
                <span class="value" :class="getStreamStatusClass(deviceDetail.streamStatus)">
                  {{ getStreamStatusText(deviceDetail.streamStatus) }}
                </span>
              </div>
              <div class="detail-item">
                <span class="label">固件版本:</span>
                <span class="value">{{ deviceDetail.firmwareVersion || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">RTSP端口:</span>
                <span class="value">{{ deviceDetail.rtspPort || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">RTSP路径:</span>
                <span class="value">{{ deviceDetail.rtspPath || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">序列号:</span>
                <span class="value">{{ deviceDetail.serialNumber || 'N/A' }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3 class="section-title">绑定与算法信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">绑定摄像机:</span>
                <span class="value">{{ deviceDetail.boundCameraName || '未绑定' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">算法模型类型:</span>
                <span class="value">{{ deviceDetail.algorithmModelType || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">算法模型版本:</span>
                <span class="value">{{ deviceDetail.algorithmModelVersion || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">安装位置:</span>
                <span class="value">{{ deviceDetail.location || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">创建时间:</span>
                <span class="value">{{ formatTime(deviceDetail.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">更新时间:</span>
                <span class="value">{{ formatTime(deviceDetail.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer dialog-footer-actions">
          <el-button @click="refreshDeviceDetail" :loading="deviceDetailLoading">
            刷新信息
          </el-button>
          <el-button @click="deviceDetailDialogVisible = false">
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 固件升级对话框 -->
    <el-dialog 
      v-model="upgradeDialogVisible" 
      title="板卡固件升级" 
      width="600px"
      class="tech-dialog"
      :modal-class="'tech-modal'"
      destroy-on-close>
      <div class="dialog-content">
        <div class="upgrade-info">
          <div class="info-row">
            <span class="label">设备名称:</span>
            <span class="value">{{ currentUpgradeBoard?.device_name || currentUpgradeBoard?.DeviceName }}</span>
          </div>
          <div class="info-row">
            <span class="label">当前版本:</span>
            <span class="value">{{ currentUpgradeBoard?.firmware_version || currentUpgradeBoard?.FirmwareVersion || '未知' }}</span>
          </div>
        </div>

        <el-form :model="upgradeForm" label-width="100px" class="upgrade-form">
          <el-form-item label="新版本号">
            <el-input 
              v-model="upgradeForm.version" 
              placeholder="例如: v2.0.0（可选）"
              class="tech-input"
            />
          </el-form-item>
          <el-form-item label="固件文件">
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :on-change="handleFirmwareFileChange"
              :show-file-list="false"
              accept=".zip,.tar,.gz,.tar.gz"
              drag
            >
              <div class="upload-area">
                <el-icon class="upload-icon"><Upload /></el-icon>
                <div class="upload-text">
                  <p>点击或拖拽文件到此处上传</p>
                  <p class="upload-hint">支持 .zip, .tar, .gz 格式</p>
                </div>
              </div>
            </el-upload>
            <div v-if="upgradeForm.file" class="file-info">
              <span class="file-name">{{ upgradeForm.file.name }}</span>
              <span class="file-size">({{ formatFileSize(upgradeForm.file.size) }})</span>
              <el-button 
                type="danger" 
                size="small" 
                text
                @click="clearFirmwareFile"
              >
                移除
              </el-button>
            </div>
          </el-form-item>
          
          <!-- 升级进度 -->
          <el-form-item v-if="upgrading" label="升级进度">
            <el-progress 
              :percentage="upgradeProgress" 
              :status="upgradeStatus"
              :stroke-width="20"
            />
            <div class="progress-text">{{ upgradeMessage }}</div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="upgradeDialogVisible = false" :disabled="upgrading">
            取消
          </el-button>
          <el-button 
            type="primary" 
            @click="startUpgrade"
            :loading="upgrading"
            :disabled="!upgradeForm.file"
          >
            {{ upgrading ? '升级中...' : '开始升级' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh, Plus, Upload, Search, RefreshRight
} from '@element-plus/icons-vue'
import { deviceApi } from '@/api/device'

// 响应式数据
const boardLoading = ref(false)
const boardStatsLoading = ref(false)
const streamOperationLoading = ref(false)


// 板卡对话框状态
const boardDialogVisible = ref(false)
const boardDialogTitle = ref('添加设备')
const editingBoardId = ref(null)
const boardSaving = ref(false)


// 流信息对话框状态
const streamInfoDialogVisible = ref(false)
const streamInfoLoading = ref(false)
const currentBoardForStream = ref(null)

// 设备详情对话框状态
const deviceDetailDialogVisible = ref(false)
const deviceDetailLoading = ref(false)
const currentBoardForDetail = ref(null)

// 固件升级对话框状态
const upgradeDialogVisible = ref(false)
const currentUpgradeBoard = ref(null)
const upgrading = ref(false)
const upgradeProgress = ref(0)
const upgradeStatus = ref('')
const upgradeMessage = ref('')
const uploadRef = ref(null)
let upgradePollingTimer = null

// 固件升级表单
const upgradeForm = reactive({
  version: '',
  file: null
})

// 摄像机列表
const cameraList = ref([])

// 流信息数据
const streamInfo = reactive({
  stream_id: '',
  status: '',
  start_time: '',
  last_active_time: '',
  play_urls: {}
})

// 设备详情数据
const deviceDetail = reactive({
  id: '',
  deviceName: '',
  deviceNumber: '',
  deviceIP: '',
  model: '',
  manufacturer: '',
  deviceStatus: '',
  streamStatus: '',
  firmwareVersion: '',
  rtspPort: '',
  rtspPath: '',
  serialNumber: '',
  boundCameraName: '',
  algorithmModelType: '',
  algorithmModelVersion: '',
  location: '',
  createdAt: '',
  updatedAt: ''
})

// 板卡数据
const boardList = ref([])

// 表单引用
const boardFormRef = ref()

// 板卡搜索表单
const boardSearchForm = reactive({
  deviceName: '',
  deviceCode: '',
  status: '',
  manufacturer: ''
})

// 板卡表单
const boardForm = reactive({
  device_name: '',
  device_number: '',
  device_ip: '',
  analyzed_stream_url: '', // 检测流地址（板卡提供）
  bound_camera_id: null,
  bound_camera_name: '',
  bound_wvp_channel_id: '', // WVP通道ID
  algorithms: [], // 多算法配置数组
  firmware_version: '',
  description: ''
})

// 算法表单（用于添加算法）- 暂未使用，后续实现算法配置功能时启用
// const algorithmForm = reactive({
//   algorithm_id: '',
//   algorithm_name: '',
//   model_type: '',
//   model_version: ''
// })


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

// 表单验证规则 - 暂未使用，后续添加表单验证时启用
// const boardFormRules = {
//   device_name: [
//     { required: true, message: '请输入设备名称', trigger: 'blur' },
//     { max: 100, message: '设备名称不能超过100个字符', trigger: 'blur' }
//   ],
//   device_number: [
//     { required: true, message: '请输入设备编号', trigger: 'blur' },
//     { max: 50, message: '设备编号不能超过50个字符', trigger: 'blur' }
//   ],
//   device_ip: [
//     { required: true, message: '请输入设备IP地址', trigger: 'blur' },
//     { pattern: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, message: '请输入正确的IP地址', trigger: 'blur' }
//   ],
//   analyzed_stream_url: [
//     { max: 500, message: '检测流地址不能超过500个字符', trigger: 'blur' }
//   ],
//   bound_camera_name: [
//     { max: 100, message: '摄像机名称不能超过100个字符', trigger: 'blur' }
//   ],
//   bound_wvp_channel_id: [
//     { max: 64, message: 'WVP通道ID不能超过64个字符', trigger: 'blur' }
//   ],
//   firmware_version: [
//     { max: 20, message: '固件版本不能超过20个字符', trigger: 'blur' }
//   ],
//   description: [
//     { max: 1000, message: '描述不能超过1000个字符', trigger: 'blur' }
//   ]
// }


// 监听升级对话框关闭，清理定时器
watch(upgradeDialogVisible, (newVal) => {
  if (!newVal && upgradePollingTimer) {
    clearTimeout(upgradePollingTimer)
    upgradePollingTimer = null
  }
})

// 生命周期
onMounted(() => {
  getBoardList()
})


// ==================== 板卡管理方法 ====================

// 获取板卡列表
const getBoardList = async () => {
  try {
    boardLoading.value = true
    
    // 检查认证状态
    const token = localStorage.getItem('token')
    console.log('当前Token状态:', token ? '已设置' : '未设置')
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
    console.log('请求URL: /api/v1/access/boards')
    const response = await deviceApi.getBoardList(apiParams)
    
    console.log('板卡API响应:', response)
    console.log('响应完整结构:', JSON.stringify(response, null, 2))
    
    // 检查响应格式
    if (response && response.code === 200) {
      // 直接从响应中获取数据，确保返回数组
      const rawData = Array.isArray(response.data?.list) ? response.data.list : []
      console.log('原始板卡数据:', rawData)
      
      // 如果有数据，打印第一条数据的字段结构
      if (rawData.length > 0) {
        console.log('第一条板卡数据字段:', Object.keys(rawData[0]))
        console.log('第一条板卡完整数据:', JSON.stringify(rawData[0], null, 2))
      }
      
      boardList.value = rawData
      boardPagination.total = response.data?.total || 0
      boardPagination.totalPages = response.data?.totalPages || Math.ceil(boardPagination.total / boardPagination.pageSize)
      console.log('处理后的板卡列表数据:', boardList.value)
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
  boardDialogTitle.value = '添加设备'
  editingBoardId.value = null
  Object.assign(boardForm, {
    device_name: '',
    device_number: '',
    device_ip: '',
    analyzed_stream_url: '',
    bound_camera_id: null,
    bound_camera_name: '',
    bound_wvp_channel_id: '',
    algorithms: [],
    firmware_version: '',
    description: ''
  })
  // 获取摄像机列表
  getCameraList()
}

// 查看板卡详情
const viewBoardDetail = async (board) => {
  try {
    currentBoardForDetail.value = board
    deviceDetailDialogVisible.value = true
    deviceDetailLoading.value = true
    
    const boardId = board.ID || board.id
    console.log('正在获取设备详情...', boardId)
    
    const response = await deviceApi.getBoardDetail(boardId)
    
    if (response && response.code === 200) {
      const detail = response.data
      Object.assign(deviceDetail, {
        id: detail.ID || detail.id || '',
        deviceName: detail.DeviceName || detail.device_name || '',
        deviceNumber: detail.DeviceNumber || detail.device_number || '',
        deviceIP: detail.DeviceIP || detail.device_ip || '',
        model: detail.model || detail.device_model || '',
        manufacturer: detail.manufacturer || detail.vendor || '',
        deviceStatus: detail.DeviceStatus || detail.device_status || '',
        streamStatus: detail.StreamStatus || detail.stream_status || '',
        firmwareVersion: detail.FirmwareVersion || detail.firmware_version || '',
        rtspPort: detail.RtspPort || detail.rtsp_port || '',
        rtspPath: detail.RtspPath || detail.rtsp_path || '',
        serialNumber: detail.serialNumber || detail.serial_number || detail.sn || '',
        boundCameraName: detail.BoundCameraName || detail.bound_camera_name || '',
        algorithmModelType: detail.AlgorithmModelType || detail.algorithm_model_type || '',
        algorithmModelVersion: detail.AlgorithmModelVersion || detail.algorithm_model_version || '',
        location: detail.location || detail.install_location || '',
        createdAt: detail.CreatedAt || detail.created_at || '',
        updatedAt: detail.UpdatedAt || detail.updated_at || ''
      })
    } else {
      ElMessage.error('获取设备详情失败')
    }
  } catch (error) {
    console.error('获取设备详情错误:', error)
    ElMessage.error('获取设备详情失败：' + error.message)
  } finally {
    deviceDetailLoading.value = false
  }
}

// 显示流信息对话框
const showStreamInfo = async (board) => {
  try {
    currentBoardForStream.value = board
    streamInfoDialogVisible.value = true
    streamInfoLoading.value = true
    
    const boardId = board.ID || board.id
    console.log('正在获取流信息...', boardId)
    
    const response = await deviceApi.getBoardStreamInfo(boardId)
    
    if (response && response.code === 200) {
      const stream = response.data
      Object.assign(streamInfo, {
        stream_id: stream.stream_id || '',
        status: stream.status || '',
        start_time: stream.start_time || '',
        last_active_time: stream.last_active_time || '',
        play_urls: stream.play_urls || {}
      })
    } else {
      ElMessage.error('获取流信息失败')
    }
  } catch (error) {
    console.error('获取流信息错误:', error)
    ElMessage.error('获取流信息失败：' + error.message)
  } finally {
    streamInfoLoading.value = false
  }
}

// 刷新流信息
const refreshStreamInfo = () => {
  if (currentBoardForStream.value) {
    showStreamInfo(currentBoardForStream.value)
  }
}

// 刷新设备详情
const refreshDeviceDetail = () => {
  if (currentBoardForDetail.value) {
    viewBoardDetail(currentBoardForDetail.value)
  }
}

// 复制到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      ElMessage.success('已复制到剪贴板')
    } catch (fallbackError) {
      ElMessage.error('复制失败')
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

// 显示编辑板卡对话框
const editBoard = (board) => {
  boardDialogVisible.value = true
  boardDialogTitle.value = '编辑设备'
  editingBoardId.value = board.ID || board.id
  Object.assign(boardForm, {
    device_name: board.DeviceName || board.device_name || '',
    device_number: board.DeviceNumber || board.device_number || '',
    device_ip: board.DeviceIP || board.device_ip || '',
    analyzed_stream_url: board.AnalyzedStreamURL || board.analyzed_stream_url || '',
    bound_camera_id: board.BoundCameraID || board.bound_camera_id || null,
    bound_camera_name: board.BoundCameraName || board.bound_camera_name || '',
    bound_wvp_channel_id: board.BoundWVPChannelID || board.bound_wvp_channel_id || '',
    algorithms: board.Algorithms || board.algorithms || [],
    firmware_version: board.FirmwareVersion || board.firmware_version || '',
    description: board.Description || board.description || ''
  })
  // 获取摄像机列表
  getCameraList()
}

// 保存板卡
const saveBoard = async () => {
  try {
    // 基本验证
    if (!boardForm.device_name || !boardForm.device_number || !boardForm.device_ip) {
      ElMessage.error('请填写设备名称、设备编号和设备IP')
      return
    }

    // 检查认证状态
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.error('请先登录')
      return
    }

    boardSaving.value = true

    // 将前端表单数据映射为后端期望的格式
    const apiData = {
      device_name: boardForm.device_name,
      device_number: boardForm.device_number,
      device_ip: boardForm.device_ip,
      analyzed_stream_url: boardForm.analyzed_stream_url || '',
      bound_camera_id: boardForm.bound_camera_id,
      bound_camera_name: boardForm.bound_camera_name || '',
      bound_wvp_channel_id: boardForm.bound_wvp_channel_id || '',
      algorithms: boardForm.algorithms || [],
      firmware_version: boardForm.firmware_version || '',
      description: boardForm.description || ''
    }

    if (editingBoardId.value) {
      // 更新板卡
      console.log('正在更新板卡...', editingBoardId.value, apiData)
      const response = await deviceApi.updateBoard(editingBoardId.value, apiData)
      
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
      console.log('正在创建板卡...', apiData)
      const response = await deviceApi.createBoard(apiData)
      
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

// 显示固件升级对话框
const showUpgradeDialog = (board) => {
  // 清理之前的定时器
  if (upgradePollingTimer) {
    clearTimeout(upgradePollingTimer)
    upgradePollingTimer = null
  }
  
  currentUpgradeBoard.value = board
  upgradeForm.version = ''
  upgradeForm.file = null
  upgrading.value = false
  upgradeProgress.value = 0
  upgradeStatus.value = ''
  upgradeMessage.value = ''
  upgradeDialogVisible.value = true
}

// 处理固件文件选择
const handleFirmwareFileChange = (file) => {
  upgradeForm.file = file.raw
}

// 清除固件文件
const clearFirmwareFile = () => {
  upgradeForm.file = null
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

// 开始升级
const startUpgrade = async () => {
  if (!upgradeForm.file) {
    ElMessage.warning('请选择固件文件')
    return
  }

  try {
    upgrading.value = true
    upgradeProgress.value = 0
    upgradeStatus.value = ''
    upgradeMessage.value = '正在上传固件文件...'

    const boardId = currentUpgradeBoard.value.ID || currentUpgradeBoard.value.id
    const formData = new FormData()
    formData.append('file', upgradeForm.file)
    if (upgradeForm.version) {
      formData.append('version', upgradeForm.version)
    }

    // 上传固件文件
    upgradeProgress.value = 30
    upgradeMessage.value = '固件上传中...'

    const response = await deviceApi.upgradeBoardFirmware(boardId, upgradeForm.file, upgradeForm.version)
    
    if (response && response.code === 200) {
      upgradeProgress.value = 50
      upgradeMessage.value = '固件安装中，请稍候...'
      
      // 开始轮询升级状态
      pollUpgradeStatus(boardId)
    } else {
      throw new Error(response?.message || '升级失败')
    }
  } catch (error) {
    console.error('固件升级失败:', error)
    upgrading.value = false
    upgradeStatus.value = 'exception'
    upgradeMessage.value = '升级失败: ' + error.message
    ElMessage.error('固件升级失败: ' + error.message)
  }
}

// 轮询升级状态
const pollUpgradeStatus = async (boardId) => {
  try {
    const response = await deviceApi.getBoardUpgradeStatus(boardId)
    
    if (response && response.code === 200) {
      const status = response.data
      
      upgradeProgress.value = status.progress || 50
      upgradeMessage.value = status.message || status.status
      
      if (status.status === 'success') {
        upgradeProgress.value = 100
        upgradeStatus.value = 'success'
        upgradeMessage.value = '升级成功！'
        upgrading.value = false
        
        ElMessage.success('固件升级成功！')
        
        // 2秒后关闭对话框并刷新列表
        setTimeout(() => {
          upgradeDialogVisible.value = false
          getBoardList()
        }, 2000)
      } else if (status.status === 'failed' || status.status === 'error') {
        upgradeStatus.value = 'exception'
        upgradeMessage.value = '升级失败: ' + (status.message || status.error)
        upgrading.value = false
        ElMessage.error('固件升级失败')
      } else {
        // 继续轮询
        upgradePollingTimer = setTimeout(() => {
          pollUpgradeStatus(boardId)
        }, 2000)
      }
    }
  } catch (error) {
    console.error('获取升级状态失败:', error)
    upgradeStatus.value = 'exception'
    upgradeMessage.value = '获取升级状态失败'
    upgrading.value = false
  }
}

// 播放原始流
const playOriginalStream = (board) => {
  const channelId = board.BoundWVPChannelID || board.bound_wvp_channel_id
  if (!channelId) {
    ElMessage.warning('该板卡未绑定WVP通道')
    return
  }
  
  // TODO: 实现原始流播放功能
  ElMessage.info(`播放原始流功能开发中，通道ID: ${channelId}`)
  // 可以打开一个新窗口或者在当前页面显示播放器
  // window.open(`/play?channelId=${channelId}`, '_blank')
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

// 获取推流状态文本
const getStreamStatusText = (status) => {
  const textMap = {
    'streaming': '推流中',
    'stopped': '已停止',
    'error': '推流错误',
    'paused': '已暂停',
    'connecting': '连接中',
    'disconnected': '已断开',
    'active': '推流中',
    'inactive': '已停止'
  }
  return textMap[status] || status || '未知'
}

// 获取推流状态样式类
const getStreamStatusClass = (status) => {
  const classMap = {
    'streaming': 'online',
    'stopped': 'offline',
    'error': 'error',
    'paused': 'offline',
    'connecting': 'online',
    'disconnected': 'offline',
    'active': 'online',
    'inactive': 'offline'
  }
  return classMap[status] || 'offline'
}

// ==================== 推流控制方法 ====================

// 开始板卡推流
const startBoardStreaming = async (board) => {
  try {
    const boardId = board.ID || board.id
    const boardName = board.DeviceName || board.device_name || '未知板卡'
    
    if (!boardId) {
      ElMessage.error('板卡ID不存在，无法开始推流')
      return
    }
    
    streamOperationLoading.value = true
    console.log('正在开始板卡推流...', boardId)
    
    const response = await deviceApi.startBoardStream(boardId)
    
    if (response && response.code === 200) {
      ElMessage.success(`板卡 ${boardName} 推流启动成功`)
      // 刷新列表以更新推流状态
      getBoardList()
    } else {
      const errorMsg = response?.message || '启动推流失败'
      ElMessage.error(`板卡 ${boardName} 启动推流失败：${errorMsg}`)
    }
  } catch (error) {
    console.error('启动推流错误:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('认证失败，请重新登录')
    } else if (error.response?.status === 403) {
      ElMessage.error('权限不足，无法控制推流')
    } else if (error.response?.status === 404) {
      ElMessage.error('板卡不存在或推流接口不可用')
    } else if (error.response?.status >= 500) {
      ElMessage.error('服务器错误，请联系管理员')
    } else {
      ElMessage.error(`启动推流失败：${error.message}`)
    }
  } finally {
    streamOperationLoading.value = false
  }
}

// 停止板卡推流
const stopBoardStreaming = async (board) => {
  try {
    const boardId = board.ID || board.id
    const boardName = board.DeviceName || board.device_name || '未知板卡'
    
    if (!boardId) {
      ElMessage.error('板卡ID不存在，无法停止推流')
      return
    }
    
    streamOperationLoading.value = true
    console.log('正在停止板卡推流...', boardId)
    
    const response = await deviceApi.stopBoardStream(boardId)
    
    if (response && response.code === 200) {
      ElMessage.success(`板卡 ${boardName} 推流已停止`)
      // 刷新列表以更新推流状态
      getBoardList()
    } else {
      const errorMsg = response?.message || '停止推流失败'
      ElMessage.error(`板卡 ${boardName} 停止推流失败：${errorMsg}`)
    }
  } catch (error) {
    console.error('停止推流错误:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('认证失败，请重新登录')
    } else if (error.response?.status === 403) {
      ElMessage.error('权限不足，无法控制推流')
    } else if (error.response?.status === 404) {
      ElMessage.error('板卡不存在或推流接口不可用')
    } else if (error.response?.status >= 500) {
      ElMessage.error('服务器错误，请联系管理员')
    } else {
      ElMessage.error(`停止推流失败：${error.message}`)
    }
  } finally {
    streamOperationLoading.value = false
  }
}

</script>

<style scoped>
.board-management {
  padding: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.search-box {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.board-management .search-filters-card {
  margin-bottom: 20px !important;
  padding: 15px !important;
  background: rgba(0, 20, 40, 0.6) !important;
  background-color: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
}

.board-management .search-filters-header {
  margin-bottom: 15px !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  padding-bottom: 8px !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
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

/* 表格容器样式 - 支持横向滚动 */
.table-container {
  width: 100%;
  overflow-x: auto;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(0, 20, 40, 0.6);
  margin-bottom: 20px;
}

/* 表格容器滚动条样式 */
.table-container::-webkit-scrollbar {
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
}

.table-container::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.05);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.table-container::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, 
    rgba(0, 255, 255, 0.3) 0%, 
    rgba(0, 255, 255, 0.6) 50%, 
    rgba(0, 255, 255, 0.3) 100%);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, 
    rgba(0, 255, 255, 0.5) 0%, 
    rgba(0, 255, 255, 0.8) 50%, 
    rgba(0, 255, 255, 0.5) 100%);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
}

/* 科技感卡片 */
.tech-card {
  background: transparent !important;
  border: none !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: none !important;
}

.tech-card :deep(.el-card__header) {
  background: transparent !important;
  border-bottom: none !important;
  color: #00ffff !important;
  padding: 16px 20px !important;
}

.tech-card :deep(.el-card__body) {
  background: transparent !important;
  padding: 20px !important;
}

.card-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  font-weight: bold;
  color: #00ffff !important;
  width: 100% !important;
}

.card-header span {
  color: #00ffff !important;
  font-weight: 600 !important;
  font-size: 16px !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}

.card-header > div {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

/* 自定义表格 */
.custom-table {
  background: rgba(0, 20, 40, 0.6);
  border: none;
  border-radius: 0;
  overflow: hidden;
  width: 100%;
  min-width: 1600px;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 150px 150px 100px 120px 150px 350px;
  background: rgba(0, 30, 60, 0.8);
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.header-cell {
  padding: 12px 8px;
  color: #00ffff;
  font-weight: 500;
  text-align: center;
  background: rgba(0, 30, 60, 0.8);
  border-right: 1px solid rgba(0, 255, 255, 0.1);
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-cell:last-child {
  border-right: none;
}

.table-body {
  background: transparent;
}

.table-row-wrapper {
  position: relative;
}

.table-row-wrapper:last-child .body-cell {
  border-bottom: none;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 150px 150px 100px 120px 150px 350px;
  transition: all 0.3s ease;
  background: transparent;
}

.table-row-wrapper:nth-child(even) .table-row {
  background: rgba(0, 255, 255, 0.02);
}

.table-row-wrapper:hover .table-row {
  background: rgba(0, 255, 255, 0.1);
}

.body-cell {
  padding: 12px 8px;
  color: #ffffff;
  border-right: 1px solid rgba(0, 255, 255, 0.05);
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  min-height: 48px;
}

.body-cell:last-child {
  border-right: none;
}

.name-cell {
  justify-content: flex-start;
  padding-left: 12px;
}

.number-cell {
  justify-content: flex-start;
  padding-left: 12px;
}

.status-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: normal;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-tag.online {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
  border: 1px solid rgba(103, 194, 58, 0.3);
}

.status-tag.offline {
  background: rgba(255, 82, 82, 0.1);
  color: #ff5252;
  border: 1px solid rgba(255, 82, 82, 0.3);
}

.status-tag.error {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
  border: 1px solid rgba(230, 162, 60, 0.3);
}

.camera-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: normal;
}

.camera-tag.bound {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
  border: 1px solid rgba(230, 162, 60, 0.3);
}

.camera-tag.unbound {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  border: 1px solid rgba(64, 158, 255, 0.3);
}

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
  font-size: 12px;
  display: flex;
  align-items: center;
  min-width: 50px;
  justify-content: center;
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

.stream-btn {
  color: #00bfff;
  border-color: rgba(0, 191, 255, 0.4);
}

.stream-btn:hover {
  background: rgba(0, 191, 255, 0.1);
  border-color: rgba(0, 191, 255, 0.6);
}

.delete-btn {
  color: #ff6b6b;
  border-color: rgba(255, 107, 107, 0.4);
}

.delete-btn:hover {
  background: rgba(255, 107, 107, 0.1);
  border-color: rgba(255, 107, 107, 0.6);
}

.start-btn {
  color: #00ff00;
  border-color: rgba(0, 255, 0, 0.4);
}

.start-btn:hover {
  background: rgba(0, 255, 0, 0.1);
  border-color: rgba(0, 255, 0, 0.6);
}

.start-btn:disabled {
  color: rgba(0, 255, 0, 0.5);
  border-color: rgba(0, 255, 0, 0.2);
  cursor: not-allowed;
}

.pause-btn {
  color: #ffa500;
  border-color: rgba(255, 165, 0, 0.4);
}

.pause-btn:hover {
  background: rgba(255, 165, 0, 0.1);
  border-color: rgba(255, 165, 0, 0.6);
}

.pause-btn:disabled {
  color: rgba(255, 165, 0, 0.5);
  border-color: rgba(255, 165, 0, 0.2);
  cursor: not-allowed;
}

.upgrade-btn {
  color: #9b59b6;
  border-color: rgba(155, 89, 182, 0.4);
}

.upgrade-btn:hover {
  background: rgba(155, 89, 182, 0.1);
  border-color: rgba(155, 89, 182, 0.6);
}

.play-btn {
  color: #f39c12;
  border-color: rgba(243, 156, 18, 0.4);
}

.play-btn:hover {
  background: rgba(243, 156, 18, 0.1);
  border-color: rgba(243, 156, 18, 0.6);
}

.pause-btn:hover {
  background: rgba(255, 165, 0, 0.1);
  border-color: rgba(255, 165, 0, 0.6);
}

.pause-btn:disabled {
  color: rgba(255, 165, 0, 0.5);
  border-color: rgba(255, 165, 0, 0.2);
  cursor: not-allowed;
}

/* 分页 */
.flex-center {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 分页器样式 */
:deep(.pagination .el-pagination) {
  color: #ffffff !important;
  background: transparent !important;
}

:deep(.pagination .el-pagination .el-pager li) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
  border-radius: 4px !important;
  margin: 0 2px !important;
}

:deep(.pagination .el-pagination .el-pager li:hover) {
  color: #00ffff !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.pagination .el-pagination .el-pager li.active) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  border-color: #00ffff !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3) !important;
}

/* 分页按钮样式 */
:deep(.pagination .el-pagination .btn-prev),
:deep(.pagination .el-pagination .btn-next) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
  border-radius: 4px !important;
}

:deep(.pagination .el-pagination .btn-prev:hover),
:deep(.pagination .el-pagination .btn-next:hover) {
  color: #00ffff !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.pagination .el-pagination .btn-prev:disabled),
:deep(.pagination .el-pagination .btn-next:disabled) {
  background: rgba(0, 20, 40, 0.3) !important;
  border-color: rgba(0, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.3) !important;
}

/* 分页输入框和选择器样式 */
:deep(.pagination .el-pagination .el-select) {
  background: transparent !important;
}

:deep(.pagination .el-pagination .el-select .el-input__wrapper) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
}

:deep(.pagination .el-pagination .el-select .el-input__inner) {
  color: #ffffff !important;
  background: transparent !important;
}

:deep(.pagination .el-pagination .el-input) {
  background: transparent !important;
}

:deep(.pagination .el-pagination .el-input .el-input__wrapper) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
}

:deep(.pagination .el-pagination .el-input .el-input__inner) {
  color: #ffffff !important;
  background: transparent !important;
}

/* 分页总数文字样式 */
:deep(.pagination .el-pagination__total) {
  color: #ffffff !important;
}

:deep(.pagination .el-pagination__jump) {
  color: #ffffff !important;
}

:deep(.pagination .el-pagination__sizes) {
  color: #ffffff !important;
}

/* 操作按钮容器样式 */
.action-buttons-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  flex-wrap: nowrap;
  width: 100%;
  overflow: visible;
}

.action-buttons-container .el-button {
  margin: 0 !important;
  padding: 4px 6px !important;
  min-width: auto !important;
  white-space: nowrap !important;
  font-size: 12px !important;
  flex-shrink: 0;
}

/* 按钮样式 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .search-box {
    justify-content: center;
    flex-wrap: wrap;
  }

  .action-buttons {
    justify-content: center;
    order: -1;
  }
}

/* 间距优化 */
.toolbar .el-button + .el-button {
  margin-left: 16px !important;
}

:deep(.el-table .el-table__row) {
  height: 50px !important;
}

:deep(.el-table .el-button + .el-button) {
  margin-left: 12px !important;
}

:deep(.el-form-item) {
  margin-bottom: 24px !important;
}

:deep(.dialog-footer .el-button + .el-button) {
  margin-left: 16px !important;
}

/* 输入框样式 */
.tech-input :deep(.el-input__wrapper),
.tech-select :deep(.el-select__wrapper) {
  background-color: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
}

.tech-input :deep(.el-input__inner),
.tech-select :deep(.el-select__input) {
  color: rgba(255, 255, 255, 0.95) !important;
  background: transparent !important;
}

/* 隐藏数字输入框的上下箭头 */
:deep(.el-input input[type="number"]::-webkit-outer-spin-button),
:deep(.el-input input[type="number"]::-webkit-inner-spin-button) {
  -webkit-appearance: none !important;
  margin: 0 !important;
}

:deep(.el-input input[type="number"]) {
  appearance: textfield !important;
  -moz-appearance: textfield !important;
}

/* 选择框样式优化 */
:deep(.el-select) {
  width: 100% !important;
}

:deep(.el-select .el-input) {
  background: rgba(0, 20, 40, 0.6) !important;
  background-color: rgba(0, 20, 40, 0.6) !important;
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(0, 20, 40, 0.6) !important;
  background-color: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-select .el-input__wrapper:hover) {
  background: rgba(0, 20, 40, 0.8) !important;
  background-color: rgba(0, 20, 40, 0.8) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-select .el-input__wrapper.is-focus) {
  background: rgba(0, 20, 40, 0.8) !important;
  background-color: rgba(0, 20, 40, 0.8) !important;
  border-color: #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-select .el-input__inner) {
  color: #ffffff !important;
  background: transparent !important;
  background-color: transparent !important;
  text-shadow: 0 0 3px rgba(255, 255, 255, 0.3) !important;
}

:deep(.el-select .el-input__suffix) {
  color: rgba(255, 255, 255, 0.7) !important;
}

:deep(.el-select .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 详情对话框 */
.section-title {
  color: #00ffff;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.detail-section {
  margin-bottom: 25px;
  padding: 15px;
  background: rgba(15, 25, 45, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.1);
  border-radius: 6px;
}

.detail-section:last-child {
  margin-bottom: 0;
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
  font-size: 13px;
  min-width: 80px;
}

.detail-item .value {
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  text-align: right;
}

.detail-item .value.online {
  color: #00ff00;
}

.detail-item .value.offline {
  color: #ff4500;
}

.detail-item .value.error {
  color: #ffff00;
}

/* 流信息面板 */
.stream-info-panel {
  background: rgba(20, 30, 50, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 20px;
}

.info-section {
  margin-bottom: 25px;
  padding: 15px;
  background: rgba(15, 25, 45, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.1);
  border-radius: 6px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  min-width: 90px;
}

.info-item .value {
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  text-align: right;
}

.play-urls-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.url-item {
  background: rgba(15, 25, 45, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.1);
  border-radius: 6px;
  padding: 12px;
}

.url-type {
  color: #00ffff;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.3);
}

.url-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.url-code {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  border: 1px solid rgba(0, 255, 255, 0.1);
  word-break: break-all;
}

.copy-btn {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.4);
  color: #00ffff;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  white-space: nowrap;
}

.copy-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 255, 255, 0.6);
}

.no-data {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
}

.device-full-detail-panel {
  background: rgba(20, 30, 50, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 20px;
}

.dialog-content {
  color: #ffffff;
}

.dialog-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

/* 固件升级对话框样式 */
.upgrade-info {
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.upgrade-info .info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.upgrade-info .info-row:last-child {
  margin-bottom: 0;
}

.upgrade-info .label {
  color: rgba(255, 255, 255, 0.7);
  min-width: 100px;
  font-size: 14px;
}

.upgrade-info .value {
  color: #00ffff;
  font-weight: 500;
  font-size: 14px;
}

.upgrade-form {
  margin-top: 20px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border: 2px dashed rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(0, 255, 255, 0.03);
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: rgba(0, 255, 255, 0.6);
  background: rgba(0, 255, 255, 0.08);
}

.upload-icon {
  font-size: 48px;
  color: rgba(0, 255, 255, 0.6);
  margin-bottom: 16px;
}

.upload-text p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.upload-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  margin-top: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 6px;
}

.file-name {
  flex: 1;
  color: #00ffff;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.progress-text {
  margin-top: 12px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

/* 对话框样式优化 */
:deep(.el-dialog) {
  background: rgba(0, 20, 40, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-dialog__title) {
  color: #00ffff !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-dialog__body) {
  color: #ffffff !important;
}

/* Alert组件样式 */
:deep(.el-alert) {
  background: rgba(0, 20, 40, 0.8) !important;
  border: 1px solid rgba(230, 162, 60, 0.3) !important;
}

:deep(.el-alert--warning) {
  border-color: rgba(230, 162, 60, 0.5) !important;
}

:deep(.el-alert__content) {
  color: #ffffff !important;
}

/* 下拉面板样式 */
:deep(.el-select-dropdown) {
  background: rgba(0, 20, 40, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item) {
  color: #ffffff !important;
  background: transparent !important;
  transition: all 0.3s ease !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  font-weight: bold !important;
}

/* 空状态样式 */
.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #ffffff;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
  font-weight: 500;
}

.empty-hint {
  font-size: 14px;
  color: rgba(0, 255, 255, 0.6);
  margin-top: 10px;
}

/* 按钮样式 */
.tech-button-text.tech-button-warning {
  color: #e6a23c !important;
}

.tech-button-text.tech-button-warning:hover {
  color: #ffaa00 !important;
  text-shadow: 0 0 8px rgba(230, 162, 60, 0.5) !important;
}

.tech-button-danger {
  background: linear-gradient(135deg, rgba(255, 82, 82, 0.2) 0%, rgba(255, 82, 82, 0.4) 100%) !important;
  border: 1px solid rgba(255, 82, 82, 0.5) !important;
  color: #ff5252 !important;
  text-shadow: 0 0 5px rgba(255, 82, 82, 0.5) !important;
  box-shadow: 0 0 10px rgba(255, 82, 82, 0.2) !important;
  transition: all 0.3s ease !important;
}

.tech-button-danger:hover {
  background: linear-gradient(135deg, rgba(255, 82, 82, 0.3) 0%, rgba(255, 82, 82, 0.5) 100%) !important;
  border-color: rgba(255, 82, 82, 0.8) !important;
  box-shadow: 0 0 15px rgba(255, 82, 82, 0.4) !important;
  transform: translateY(-2px);
}
</style>

<!-- 全局样式覆盖 -->
<style>
/* 对话框样式 */
.tech-dialog :deep(.el-dialog) {
  background: rgba(45, 55, 75, 0.92) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 15px !important;
  box-shadow: 
    0 0 50px rgba(0, 255, 255, 0.3),
    inset 0 0 50px rgba(0, 255, 255, 0.08) !important;
}

.tech-dialog :deep(.el-dialog__header) {
  background: rgba(45, 55, 75, 0.92);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 15px 15px 0 0;
}

.tech-dialog :deep(.el-dialog__title) {
  color: #00ffff !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  font-weight: bold;
}

.tech-dialog :deep(.el-dialog__body) {
  background: rgba(45, 55, 75, 0.92);
  color: #ffffff;
}

.tech-dialog :deep(.el-form-item__label) {
  color: #00ffff !important;
  font-weight: 500 !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
}

.tech-dialog :deep(.el-input__wrapper) {
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 6px !important;
  box-shadow: 
    0 0 15px rgba(0, 255, 255, 0.15),
    inset 0 0 15px rgba(0, 255, 255, 0.08) !important;
}

.tech-dialog :deep(.el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.6) !important;
}

.tech-dialog :deep(.el-input__wrapper.is-focus) {
  border-color: #00ffff !important;
}

.tech-dialog :deep(.el-input__inner) {
  color: #ffffff !important;
  background: transparent !important;
}

.tech-dialog :deep(.el-button) {
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background: rgba(45, 55, 75, 0.8) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

.tech-dialog :deep(.el-button:hover) {
  background: rgba(0, 255, 255, 0.15) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
}

.tech-dialog :deep(.el-button--primary) {
  background: rgba(0, 150, 200, 0.8) !important;
  border-color: rgba(0, 200, 255, 0.6) !important;
  color: #ffffff !important;
}

.tech-modal {
  background: rgba(0, 0, 0, 0.8) !important;
  backdrop-filter: blur(5px) !important;
}

.el-select-dropdown {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
}

.el-select-dropdown .el-select-dropdown__item {
  background: transparent !important;
  color: #ffffff !important;
}

.el-select-dropdown .el-select-dropdown__item:hover {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

.el-select-dropdown .el-select-dropdown__item.is-selected {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}
</style>

