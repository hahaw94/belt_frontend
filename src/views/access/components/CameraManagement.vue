<template>
  <div class="camera-management">
    <!-- 相机列表卡片 -->
    <el-card class="camera-list-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ $t('camera.title') }}</span>
          <div>
            <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="syncWVPCameras" :loading="syncing">{{ $t('camera.syncWVPCameras') }}</el-button>
          </div>
        </div>
      </template>

    <!-- 搜索筛选卡片 -->
    <div class="search-filters-card mb-20">
      <div class="search-filters-header">
        <span class="filter-title">{{ $t('camera.searchFilter') }}</span>
        <div class="header-stats">
          <el-tag class="stat-tag online" size="small">
            <i class="status-dot online"></i>
            {{ $t('common.online') }}: {{ onlineCameraCount }}
          </el-tag>
          <el-tag class="stat-tag offline" size="small">
            <i class="status-dot offline"></i>
            {{ $t('common.offline') }}: {{ offlineCameraCount }}
          </el-tag>
        </div>
      </div>
      <div class="search-filters-content">
        <div class="filter-row">
          <div class="filter-item">
            <label for="cameraNameFilter">{{ $t('camera.cameraName') }}</label>
            <el-input
              v-model="searchForm.camera_name"
              id="cameraNameFilter"
              :placeholder="$t('camera.searchCameraName')"
              class="tech-input"
              clearable
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
          </div>
          <div class="filter-item">
            <label for="cameraCodeFilter">{{ $t('camera.cameraCode') }}</label>
            <el-input
              v-model="searchForm.camera_code"
              id="cameraCodeFilter"
              :placeholder="$t('camera.searchCameraCode')"
              class="tech-input"
              clearable
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
          </div>
          <div class="filter-item">
            <label for="statusFilter">{{ $t('common.status') }}</label>
            <el-select
              v-model="searchForm.status"
              id="statusFilter"
              :placeholder="$t('common.all')"
              class="tech-select"
              clearable
              @change="handleSearch"
            >
              <el-option :label="$t('common.all')" value="" />
              <el-option :label="$t('common.enable')" :value="1" />
              <el-option :label="$t('common.disable')" :value="0" />
            </el-select>
          </div>
          <div class="filter-item">
            <label for="bindStatusFilter">{{ $t('camera.bindStatus') }}</label>
            <el-select
              v-model="searchForm.is_bound"
              id="bindStatusFilter"
              :placeholder="$t('common.all')"
              class="tech-select"
              clearable
              @change="handleSearch"
            >
              <el-option :label="$t('common.all')" value="" />
              <el-option :label="$t('camera.bound')" :value="1" />
              <el-option :label="$t('camera.unbound')" :value="0" />
            </el-select>
          </div>
          <div class="filter-actions">
            <el-button type="primary" :icon="Search" class="tech-button-sm" @click="handleSearch">{{ $t('common.search') }}</el-button>
            <el-button :icon="RefreshRight" class="tech-button-sm" @click="resetSearch">{{ $t('common.reset') }}</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 相机列表 -->
    <div class="table-container">
      <el-table
        :data="cameraList"
        v-loading="loading"
        stripe
        style="width: 100%; min-width: 1600px;"
        class="camera-table"
        :scroll-x="true"
      >
      <template #empty>
        <div class="empty-state">
          <div class="empty-icon">📹</div>
          <div class="empty-text">{{ $t('camera.noCameraData') }}</div>
          <div class="empty-hint">{{ $t('camera.syncCameraHint') }}</div>
        </div>
      </template>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="camera_code" :label="$t('camera.cameraCode')" min-width="120" />
      <el-table-column prop="camera_name" :label="$t('camera.cameraName')" min-width="150" />
      <el-table-column :label="$t('camera.networkInfo')" min-width="200">
        <template #default="scope">
          <div>{{ scope.row.ip_address }}:{{ scope.row.port }}</div>
          <div style="color: #909399; font-size: 12px;">{{ scope.row.protocol }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="location" :label="$t('camera.location')" min-width="150" show-overflow-tooltip />
      <el-table-column :label="$t('camera.onlineStatus')" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.is_online === 1 ? 'success' : 'danger'">
            {{ scope.row.is_online === 1 ? $t('common.online') : $t('common.offline') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('camera.bindStatusColumn')" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.is_bound === 1 ? 'warning' : 'info'">
            {{ scope.row.is_bound === 1 ? $t('camera.bound') : $t('camera.unbound') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('camera.boundLayers')" min-width="150" show-overflow-tooltip>
        <template #default="scope">
          <span v-if="scope.row.bound_layers && scope.row.bound_layers.length > 0">
            {{ scope.row.bound_layers.map(l => l.layer_name).join(', ') }}
          </span>
          <span v-else style="color: #909399;">-</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? $t('common.enable') : $t('common.disable') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" :label="$t('camera.createTime')" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.create_time) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" width="180">
        <template #default="scope">
          <div class="action-buttons-container">
            <el-button type="text" size="small" class="tech-button-text" @click="viewCamera(scope.row)">{{ $t('camera.view') }}</el-button>
            <el-button 
              v-if="scope.row.is_bound === 1"
              type="text" 
              size="small" 
              class="tech-button-text tech-button-warning"
              @click="showUnbindDialog(scope.row)"
            >
              {{ $t('camera.unbind') }}
            </el-button>
            <el-button 
              v-else
              type="text" 
              size="small" 
              class="tech-button-text"
              @click="showBindDialog(scope.row)"
            >
              {{ $t('camera.bind') }}
            </el-button>
          </div>
        </template>
      </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    </el-card>

    <!-- 相机详情对话框 -->
    <el-dialog
      :title="$t('camera.cameraDetail')"
      v-model="detailVisible"
      width="600px"
    >
      <div v-if="currentCamera" class="camera-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('camera.channelCode')">{{ currentCamera.camera_code }}</el-descriptions-item>
          <el-descriptions-item :label="$t('camera.channelName')">{{ currentCamera.camera_name }}</el-descriptions-item>
          <el-descriptions-item :label="$t('camera.source')">{{ $t('camera.wvpPlatform') }}</el-descriptions-item>
          <el-descriptions-item :label="$t('camera.protocol')">{{ currentCamera.protocol }}</el-descriptions-item>
          <el-descriptions-item :label="$t('camera.onlineStatus')">
            <el-tag :type="currentCamera.is_online === 1 ? 'success' : 'danger'">
              {{ currentCamera.is_online === 1 ? $t('common.online') : $t('common.offline') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('camera.bindStatusColumn')">
            <el-tag :type="currentCamera.is_bound === 1 ? 'warning' : 'info'">
              {{ currentCamera.is_bound === 1 ? $t('camera.bound') : $t('camera.unbound') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('camera.boundLayers')" :span="2">
            <span v-if="currentCamera.bound_layers && currentCamera.bound_layers.length > 0">
              {{ currentCamera.bound_layers.map(l => l.layer_name).join(', ') }}
            </span>
            <span v-else style="color: #909399;">{{ $t('camera.notBoundYet') }}</span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('camera.manufacturerInfo')" :span="2">{{ currentCamera.location || $t('camera.noInfo') }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 绑定相机到图层对话框 -->
    <el-dialog
      :title="$t('camera.bindToLayer')"
      v-model="bindDialogVisible"
      width="500px"
      @close="resetBindDialog"
    >
      <el-form
        ref="bindFormRef"
        :model="bindForm"
        :rules="bindRules"
        label-width="100px"
      >
        <el-form-item :label="$t('camera.cameraName')">
          <el-input v-model="bindForm.camera_name" disabled />
        </el-form-item>
        <el-form-item :label="$t('camera.cameraCode')">
          <el-input v-model="bindForm.camera_code" disabled />
        </el-form-item>
        <el-form-item :label="$t('camera.selectLayer')" prop="layer_id">
          <el-select v-model="bindForm.layer_id" :placeholder="$t('camera.pleaseSelectLayer')" style="width: 100%;" class="tech-select">
            <el-option 
              v-for="layer in availableLayers" 
              :key="layer.id" 
              :label="`${layer.layer_name} (${layer.camera_count}个摄像机)`" 
              :value="layer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('camera.xCoordinate')" prop="position_x">
          <el-input
            v-model="bindForm.position_x"
            type="number"
            :placeholder="$t('camera.xCoordinatePlaceholder')"
            min="0"
          />
        </el-form-item>
        <el-form-item :label="$t('camera.yCoordinate')" prop="position_y">
          <el-input
            v-model="bindForm.position_y"
            type="number"
            :placeholder="$t('camera.yCoordinatePlaceholder')"
            min="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="tech-button-secondary" @click="bindDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" class="tech-button" @click="submitBindDialog" :loading="binding">{{ $t('camera.confirmBindCamera') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 解绑相机对话框 -->
    <el-dialog
      :title="$t('camera.unbindCamera')"
      v-model="unbindDialogVisible"
      width="500px"
    >
      <el-alert
        type="warning"
        :closable="false"
        style="margin-bottom: 20px;"
      >
        <template #default>
          <div>{{ $t('camera.confirmUnbindPrompt') }}</div>
          <div style="margin-top: 10px;">
            <strong>{{ $t('camera.cameraName') }}：</strong>{{ unbindCamera?.camera_name }}<br>
            <strong>{{ $t('camera.cameraCode') }}：</strong>{{ unbindCamera?.camera_code }}<br>
            <strong>{{ $t('camera.boundLayers') }}：</strong>
            <span v-if="unbindCamera?.bound_layers && unbindCamera.bound_layers.length > 0">
              {{ unbindCamera.bound_layers.map(l => l.layer_name).join(', ') }}
            </span>
          </div>
        </template>
      </el-alert>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="tech-button-secondary" @click="unbindDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="danger" class="tech-button-danger" @click="confirmUnbind" :loading="unbinding">{{ $t('common.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, RefreshRight } from '@element-plus/icons-vue'
import { 
  syncWVPChannels,
  getWVPChannels,
  getLayerList,
  getLayerCameras,
  bindWVPChannelToLayer,
  unbindWVPChannelFromLayer
} from '@/api/map'

export default {
  name: 'CameraManagement',
  components: {
  },
  setup() {
    // 响应式数据
    const loading = ref(false)
    const syncing = ref(false)
    const binding = ref(false)
    const unbinding = ref(false)
    const cameraList = ref([])
    const currentCamera = ref(null)
    const detailVisible = ref(false)
    const bindDialogVisible = ref(false)
    const unbindDialogVisible = ref(false)
    const bindFormRef = ref(null)
    const availableLayers = ref([])
    const unbindCamera = ref(null)

    const searchForm = reactive({
      camera_name: '',
      camera_code: '',
      status: null,
      is_bound: null
    })

    const pagination = reactive({
      page: 1,
      size: 10,
      total: 0
    })

    const bindForm = reactive({
      camera_id: null,
      camera_name: '',
      camera_code: '',
      layer_id: null,
      position_x: 0,
      position_y: 0
    })

    const bindRules = {
      layer_id: [
        { required: true, message: '请选择图层', trigger: 'change' }
      ],
      position_x: [
        { required: true, message: '请输入X坐标', trigger: 'blur' }
      ],
      position_y: [
        { required: true, message: '请输入Y坐标', trigger: 'blur' }
      ]
    }

    // 获取相机列表（从WVP通道获取）
    const loadCameras = async () => {
      loading.value = true
      try {
        console.log('开始加载WVP摄像头列表...')
        // 直接从WVP通道列表获取
        const response = await getWVPChannels()
        console.log('WVP通道完整响应:', response)
        console.log('response.data类型:', typeof response.data)
        console.log('response.data内容:', response.data)
        
        // 处理不同的响应格式
        let cameras = []
        if (response.data) {
          // 如果data是数组，直接使用
          if (Array.isArray(response.data)) {
            cameras = response.data
          }
          // 如果data是对象且包含list字段
          else if (response.data.list && Array.isArray(response.data.list)) {
            cameras = response.data.list
          }
          // 如果data是对象但不是数组，可能整个response就是数据
          else if (typeof response.data === 'object') {
            // 尝试其他可能的字段名
            cameras = response.data.data || response.data.items || []
          }
        }
        // 如果response本身就是数组
        else if (Array.isArray(response)) {
          cameras = response
        }
        
        console.log('解析后的摄像头数组:', cameras)
        console.log('获取到的WVP通道数量:', cameras.length)
        
        if (cameras.length === 0) {
          console.warn('WVP通道列表为空，请先同步摄像头')
          cameraList.value = []
          pagination.total = 0
          loading.value = false
          return
        }
        
        // 转换WVP通道数据为相机格式
        cameras = cameras.map(channel => ({
          id: channel.id,
          camera_code: channel.channel_id || channel.channelId,
          camera_name: channel.channel_name || channel.name || channel.channelName,
          ip_address: '-',
          port: '-',
          protocol: 'WVP',
          is_online: channel.online === 1 || channel.online === '1' || channel.online === 'ONLINE' ? 1 : 0,
          is_bound: 0, // 初始假设未绑定
          status: 1,
          create_time: channel.create_time || new Date().toISOString(),
          location: channel.manufacturer || '-',
          bound_layers: []
        }))
        
        console.log('转换后的相机数量:', cameras.length)
        
        // 获取所有图层及其绑定的摄像机，构建映射
        try {
          const layersResponse = await getLayerList({ page: 1, size: 100 })
          if (layersResponse.code === 200) {
            const layers = layersResponse.data?.list || []
            
            // 构建camera_code到图层的映射
            const cameraToLayersMap = {}
            
            // 为每个图层获取其摄像机
            for (const layer of layers) {
              try {
                const layerCamerasResponse = await getLayerCameras(layer.id)
                if (layerCamerasResponse.code === 200) {
                  const layerCameras = layerCamerasResponse.data || []
                  layerCameras.forEach(cam => {
                    const cameraCode = cam.camera_code || cam.channel_id
                    if (!cameraToLayersMap[cameraCode]) {
                      cameraToLayersMap[cameraCode] = []
                    }
                    cameraToLayersMap[cameraCode].push({
                      layer_id: layer.id,
                      layer_name: layer.layer_name
                    })
                  })
                }
              } catch (err) {
                console.error(`获取图层 ${layer.id} 的摄像机失败:`, err)
              }
            }
            
            // 将绑定信息添加到相机列表
            cameras = cameras.map(camera => {
              const boundLayers = cameraToLayersMap[camera.camera_code] || []
              return {
                ...camera,
                is_bound: boundLayers.length > 0 ? 1 : 0,
                bound_layers: boundLayers
              }
            })
          }
        } catch (error) {
          console.error('获取图层绑定信息失败:', error)
        }
        
        // 应用搜索过滤
        let filteredCameras = cameras
        if (searchForm.camera_name) {
          filteredCameras = filteredCameras.filter(cam => 
            cam.camera_name.toLowerCase().includes(searchForm.camera_name.toLowerCase())
          )
        }
        if (searchForm.camera_code) {
          filteredCameras = filteredCameras.filter(cam => 
            cam.camera_code.toLowerCase().includes(searchForm.camera_code.toLowerCase())
          )
        }
        if (searchForm.status !== null && searchForm.status !== '') {
          filteredCameras = filteredCameras.filter(cam => cam.status === searchForm.status)
        }
        if (searchForm.is_bound !== null && searchForm.is_bound !== '') {
          filteredCameras = filteredCameras.filter(cam => cam.is_bound === searchForm.is_bound)
        }
        
        console.log('过滤后的相机数量:', filteredCameras.length)
        
        // 应用分页
        pagination.total = filteredCameras.length
        const start = (pagination.page - 1) * pagination.size
        const end = start + pagination.size
        cameraList.value = filteredCameras.slice(start, end)
        
        console.log('最终显示的相机数量:', cameraList.value.length)
      } catch (error) {
        console.error('获取相机列表失败:', error)
        ElMessage.error('获取相机列表失败: ' + (error.message || '未知错误'))
      } finally {
        loading.value = false
      }
    }

    // 搜索处理
    const handleSearch = () => {
      pagination.page = 1
      loadCameras()
    }

    // 刷新
    const refreshCameras = () => {
      loadCameras()
    }

    // 分页处理
    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.page = 1
      loadCameras()
    }

    const handleCurrentChange = (page) => {
      pagination.page = page
      loadCameras()
    }

    // 查看相机详情
    const viewCamera = (camera) => {
      currentCamera.value = camera
      detailVisible.value = true
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleString('zh-CN')
    }

    // 同步WVP摄像头
    const syncWVPCameras = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要从WVP同步摄像头吗？\n\n此操作将：\n• 从所有WVP直连设备同步通道信息\n• 保存到本地数据库\n• 更新摄像头状态\n• 可能需要几分钟时间',
          '同步确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          }
        )
        
        syncing.value = true
        const response = await syncWVPChannels()
        
        let message = `${response.message || '同步完成'}\n\n• 设备数量: ${response.device_count || response.data?.device_count || 0}\n• 通道数量: ${response.channel_count || response.data?.channel_count || 0}`
        
        if (response.errors && response.errors.length > 0) {
          message += '\n\n错误详情:\n' + response.errors.join('\n')
          ElMessage.warning(message)
        } else {
          ElMessage.success(message)
        }
        
        // 重新加载摄像头列表
        await loadCameras()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('同步摄像头失败: ' + (error.message || '未知错误'))
        }
      } finally {
        syncing.value = false
      }
    }

    // 加载可用图层列表
    const loadAvailableLayers = async () => {
      try {
        const response = await getLayerList({ page: 1, size: 100, status: 1 })
        if (response.code === 200) {
          availableLayers.value = Array.isArray(response.data?.list) ? response.data.list : []
        }
      } catch (error) {
        console.error('获取图层列表失败:', error)
      }
    }

    // 显示绑定对话框
    const showBindDialog = async (camera) => {
      bindForm.camera_id = camera.id
      bindForm.camera_name = camera.camera_name
      bindForm.camera_code = camera.camera_code
      bindForm.layer_id = null
      bindForm.position_x = 0
      bindForm.position_y = 0
      
      await loadAvailableLayers()
      bindDialogVisible.value = true
    }

    // 重置绑定对话框
    const resetBindDialog = () => {
      bindForm.camera_id = null
      bindForm.camera_name = ''
      bindForm.camera_code = ''
      bindForm.layer_id = null
      bindForm.position_x = 0
      bindForm.position_y = 0
      if (bindFormRef.value) {
        bindFormRef.value.resetFields()
      }
    }

    // 提交绑定对话框
    const submitBindDialog = async () => {
      try {
        await bindFormRef.value.validate()
        binding.value = true

        await bindWVPChannelToLayer(bindForm.layer_id, {
          channel_id: bindForm.camera_code,
          position_x: parseInt(bindForm.position_x, 10),
          position_y: parseInt(bindForm.position_y, 10)
        })

        ElMessage.success('绑定成功')
        bindDialogVisible.value = false
        loadCameras()
        
        // 发送数据更新事件
        window.dispatchEvent(new CustomEvent('camera-data-updated', {
          detail: { action: 'bind', camera_code: bindForm.camera_code }
        }))
      } catch (error) {
        ElMessage.error('绑定失败: ' + (error.message || '未知错误'))
      } finally {
        binding.value = false
      }
    }

    // 显示解绑对话框
    const showUnbindDialog = (camera) => {
      unbindCamera.value = camera
      unbindDialogVisible.value = true
    }

    // 确认解绑
    const confirmUnbind = async () => {
      try {
        unbinding.value = true
        
        // 解绑所有图层
        if (unbindCamera.value.bound_layers && unbindCamera.value.bound_layers.length > 0) {
          for (const layer of unbindCamera.value.bound_layers) {
            await unbindWVPChannelFromLayer(layer.layer_id, unbindCamera.value.camera_code)
          }
        }

        ElMessage.success('解绑成功')
        unbindDialogVisible.value = false
        loadCameras()
        
        // 发送数据更新事件
        window.dispatchEvent(new CustomEvent('camera-data-updated', {
          detail: { action: 'unbind', camera_code: unbindCamera.value.camera_code }
        }))
      } catch (error) {
        ElMessage.error('解绑失败: ' + (error.message || '未知错误'))
      } finally {
        unbinding.value = false
      }
    }

    // 监听相机数据更新事件
    const handleCameraDataUpdate = (event) => {
      console.log('相机管理页面接收到数据更新事件:', event.detail)
      // 自动刷新相机列表数据
      loadCameras()
    }
    
    // 监听标签页切换事件
    const handleTabChange = (event) => {
      const { newTab } = event.detail
      if (newTab === 'camera') {
        console.log('切换到相机管理页面，刷新数据')
        // 延迟一点刷新，确保组件已完全渲染
        setTimeout(() => {
          loadCameras()
        }, 100)
      }
    }
    
    onMounted(() => {
      loadCameras()
      // 添加全局事件监听
      window.addEventListener('camera-data-updated', handleCameraDataUpdate)
      window.addEventListener('tab-changed', handleTabChange)
    })
    
    onUnmounted(() => {
      // 移除事件监听
      window.removeEventListener('camera-data-updated', handleCameraDataUpdate)
      window.removeEventListener('tab-changed', handleTabChange)
    })

    // 重置搜索
    const resetSearch = () => {
      searchForm.camera_name = ''
      searchForm.camera_code = ''
      searchForm.status = null
      searchForm.is_bound = null
      loadCameras()
    }

    // 在线相机统计
    const onlineCameraCount = computed(() => {
      return cameraList.value.filter(camera => camera.is_online === 1).length
    })

    // 离线相机统计
    const offlineCameraCount = computed(() => {
      return cameraList.value.filter(camera => camera.is_online === 0 || !camera.is_online).length
    })

    return {
      loading,
      syncing,
      binding,
      unbinding,
      cameraList,
      currentCamera,
      detailVisible,
      bindDialogVisible,
      unbindDialogVisible,
      bindFormRef,
      searchForm,
      pagination,
      bindForm,
      bindRules,
      availableLayers,
      unbindCamera,
      loadCameras,
      handleSearch,
      refreshCameras,
      handleSizeChange,
      handleCurrentChange,
      viewCamera,
      formatDate,
      syncWVPCameras,
      showBindDialog,
      resetBindDialog,
      submitBindDialog,
      showUnbindDialog,
      confirmUnbind,
      resetSearch,
      onlineCameraCount,
      offlineCameraCount,
      Refresh,
      Search,
      RefreshRight
    }
  }
}
</script>

<style scoped>
.camera-management {
  padding: 0;
}

/* 搜索筛选卡片样式 */
.camera-management .search-filters-card {
  margin-bottom: 20px !important;
  padding: 15px !important;
  background: rgba(0, 20, 40, 0.6) !important;
  background-color: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
}

.camera-management .search-filters-header {
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

.mb-20 {
  margin-bottom: 20px;
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

.camera-table {
  margin-bottom: 20px;
}

/* 表格容器样式 - 支持横向滚动 */
.table-container {
  width: 100%;
  overflow-x: auto;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(0, 20, 40, 0.6);
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

/* 科技感表格样式 */
:deep(.camera-table.el-table) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: none !important;
  border-radius: 0 !important;
}

/* 强制去除表格的所有白色背景和边框 */
:deep(.camera-table.el-table),
:deep(.camera-table.el-table *) {
  background-color: transparent !important;
  background: transparent !important;
}

:deep(.camera-table.el-table) {
  background: rgba(0, 20, 40, 0.6) !important;
}

/* 去除表格底部和边框的白线 */
:deep(.camera-table.el-table::before),
:deep(.camera-table.el-table::after) {
  display: none !important;
  content: none !important;
  border: none !important;
  background: none !important;
}

:deep(.camera-table .el-table__inner-wrapper) {
  background: transparent !important;
  border: none !important;
}

:deep(.camera-table .el-table__inner-wrapper::before),
:deep(.camera-table .el-table__inner-wrapper::after) {
  display: none !important;
  content: none !important;
  border: none !important;
  background: none !important;
}

:deep(.camera-table .el-table__header-wrapper) {
  background: rgba(0, 30, 60, 0.8) !important;
  border: none !important;
}

:deep(.camera-table .el-table__header-wrapper::before),
:deep(.camera-table .el-table__header-wrapper::after) {
  display: none !important;
  content: none !important;
  border: none !important;
  background: none !important;
}

/* 去除表格左右边框和底部边框 */
:deep(.camera-table .el-table__body),
:deep(.camera-table .el-table__header),
:deep(.camera-table .el-table__body-wrapper),
:deep(.camera-table .el-table__header-wrapper) {
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  background: transparent !important;
}

/* 强制移除所有可能的边框元素 */
:deep(.camera-table) {
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-left: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-right: 1px solid rgba(0, 255, 255, 0.3) !important;
  box-sizing: border-box !important;
  position: relative !important;
}

/* 去除表格滚动条区域的白色背景 */
:deep(.camera-table .el-scrollbar) {
  background: transparent !important;
}

:deep(.camera-table .el-scrollbar__wrap) {
  background: transparent !important;
}

:deep(.camera-table .el-scrollbar__view) {
  background: transparent !important;
}

:deep(.camera-table .el-table__header th) {
  background: rgba(0, 30, 60, 0.8) !important;
  color: #00ffff !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
  font-weight: 500 !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3) !important;
}

:deep(.camera-table .el-table__header th:last-child) {
  border-right: none !important;
}

:deep(.camera-table .el-table__body-wrapper) {
  background: transparent !important;
}

:deep(.camera-table .el-table__body tr) {
  background: transparent !important;
}

:deep(.camera-table .el-table__body tr:nth-child(even)) {
  background: rgba(0, 255, 255, 0.02) !important;
}

:deep(.camera-table .el-table__body tr:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.camera-table .el-table__body td) {
  background: transparent !important;
  color: #ffffff !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1) !important;
  border-right: 1px solid rgba(0, 255, 255, 0.05) !important;
}

:deep(.camera-table .el-table__body td:last-child) {
  border-right: none !important;
}

/* 表格内的标签样式 */
:deep(.camera-table .el-tag) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #00ffff !important;
}

:deep(.camera-table .el-tag.el-tag--success) {
  background: rgba(103, 194, 58, 0.1) !important;
  border-color: rgba(103, 194, 58, 0.3) !important;
  color: #67c23a !important;
}

:deep(.camera-table .el-tag.el-tag--danger) {
  background: rgba(255, 82, 82, 0.1) !important;
  border-color: rgba(255, 82, 82, 0.3) !important;
  color: #ff5252 !important;
}

:deep(.camera-table .el-tag.el-tag--warning) {
  background: rgba(230, 162, 60, 0.1) !important;
  border-color: rgba(230, 162, 60, 0.3) !important;
  color: #e6a23c !important;
}

:deep(.camera-table .el-tag.el-tag--info) {
  background: rgba(64, 158, 255, 0.1) !important;
  border-color: rgba(64, 158, 255, 0.3) !important;
  color: #409eff !important;
}

/* 表格加载状态样式 */
:deep(.camera-table .el-loading-mask) {
  background: rgba(0, 20, 40, 0.8) !important;
}

:deep(.camera-table .el-loading-spinner .el-loading-text) {
  color: #00ffff !important;
}

/* 表格空状态样式 */
:deep(.camera-table .el-table__empty-block) {
  background: rgba(0, 20, 40, 0.3) !important;
}

:deep(.camera-table .el-table__empty-text) {
  color: rgba(255, 255, 255, 0.6) !important;
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

/* 操作列样式优化 */
:deep(.camera-table .action-buttons-container) {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: nowrap;
  min-width: 200px;
}

.camera-detail {
  max-height: 600px;
  overflow-y: auto;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
  }
}

/* 间距优化 */
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

/* 相机详情对话框样式 */
.camera-detail {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 0 20px 0;
  background: transparent;
}

.camera-detail::-webkit-scrollbar {
  width: 8px;
}

.camera-detail::-webkit-scrollbar-track {
  background: rgba(0, 20, 40, 0.3);
  border-radius: 4px;
}

.camera-detail::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.4);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.camera-detail::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.6);
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}

.camera-detail :deep(.el-descriptions) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  overflow: hidden;
}

.camera-detail :deep(.el-descriptions__header) {
  background: rgba(0, 30, 60, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
}

.camera-detail :deep(.el-descriptions__body) {
  background: transparent !important;
}

.camera-detail :deep(.el-descriptions__table) {
  background: transparent !important;
  border: none !important;
}

.camera-detail :deep(.el-descriptions__cell) {
  background: transparent !important;
  border: 1px solid rgba(0, 255, 255, 0.1) !important;
  color: #ffffff !important;
  padding: 12px 16px !important;
}

.camera-detail :deep(.el-descriptions__label) {
  background: rgba(0, 30, 60, 0.6) !important;
  color: #00ffff !important;
  font-weight: 500 !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3) !important;
}

.camera-detail :deep(.el-descriptions__content) {
  background: rgba(0, 20, 40, 0.4) !important;
  color: #ffffff !important;
  text-shadow: 0 0 3px rgba(255, 255, 255, 0.2) !important;
}

.camera-detail :deep(.el-tag) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #00ffff !important;
}

.camera-detail :deep(.el-tag.el-tag--success) {
  background: rgba(0, 255, 0, 0.1) !important;
  border-color: rgba(0, 255, 0, 0.3) !important;
  color: #00ff00 !important;
}

.camera-detail :deep(.el-tag.el-tag--danger) {
  background: rgba(255, 0, 0, 0.1) !important;
  border-color: rgba(255, 0, 0, 0.3) !important;
  color: #ff0000 !important;
}

.camera-detail :deep(.el-tag.el-tag--warning) {
  background: rgba(255, 165, 0, 0.1) !important;
  border-color: rgba(255, 165, 0, 0.3) !important;
  color: #ffaa00 !important;
}

.camera-detail :deep(.el-tag.el-tag--info) {
  background: rgba(0, 255, 255, 0.1) !important;
  border-color: rgba(0, 255, 255, 0.3) !important;
  color: #00ffff !important;
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
</style>
