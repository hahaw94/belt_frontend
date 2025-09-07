<template>
  <div class="map-configuration">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-select
        v-model="selectedLayerId"
        placeholder="选择图层"
        style="width: 250px;"
        class="tech-select"
        @change="handleLayerChange"
      >
        <el-option
          v-for="layer in layerList"
          :key="layer.id"
          :label="layer.layer_name"
          :value="layer.id"
        />
      </el-select>
      
      <div class="toolbar-right">
        <el-button type="primary" class="tech-button" :icon="Plus" @click="showAddCameraDialog" :disabled="!selectedLayerId">
          添加相机
        </el-button>
        <el-button type="success" class="tech-button-success" :icon="Check" @click="savePositions" :disabled="!hasChanges">
          保存位置
        </el-button>
        <el-button type="warning" class="tech-button-warning" @click="resetBackgroundPosition" :disabled="!currentLayer">
          重置背景
        </el-button>
        <el-button type="info" class="tech-button-info" :icon="Refresh" @click="refreshData">刷新</el-button>
      </div>
    </div>

    <!-- 地图显示区域 -->
    <div class="map-container" v-if="currentLayer">
      <div class="map-info">
        <span>{{ currentLayer.layer_name }}</span>
        <span>{{ currentLayer.image_width }}×{{ currentLayer.image_height }}</span>
        <span>相机数量: {{ layerCameras.length }}</span>
        <span>背景位置: ({{ backgroundDragState.currentX }}, {{ backgroundDragState.currentY }})</span>
      </div>
      
      <div class="map-wrapper" ref="mapWrapper">
        <div 
          class="map-canvas"
          ref="mapCanvas"
          :style="{ 
            width: canvasSize.width + 'px',
            height: canvasSize.height + 'px',
            transform: `scale(${zoomLevel}) translate(${backgroundDragState.currentX}px, ${backgroundDragState.currentY}px)`,
            transformOrigin: 'top left'
          }"
          @click="handleCanvasClick"
          @mousemove="handleCanvasMouseMove"
        >
          <!-- 背景图片 -->
          <img
            :src="currentLayer.image_url"
            alt="地图背景"
            class="map-background"
            :class="{ 'dragging': backgroundDragState.isDragging }"
            @load="onImageLoad"
            @error="onImageError"
            @mousedown="startBackgroundDrag"
            draggable="false"
          />
          
          <!-- 聚合相机图标 -->
          <div
            v-for="cluster in clusteredCameras"
            :key="cluster.id"
            class="camera-marker"
            :class="{ 
              'selected': cluster.cameras.some(camera => String(selectedCameraId) === String(camera.camera_id)),
              'dragging': cluster.cameras.some(camera => String(draggingCameraId) === String(camera.camera_id)),
              'clustered': cluster.cameras.length > 1
            }"
            :style="{
              left: cluster.position_x + 'px',
              top: cluster.position_y + 'px',
              transform: cluster.camera_angle ? `rotate(${cluster.camera_angle}deg)` : 'none'
            }"
            @click.stop="selectCluster(cluster)"
            @mousedown="startClusterDrag(cluster, $event)"
            @mouseenter="showClusterTooltip($event, cluster)"
            @mouseleave="hideClusterTooltip"
          >
            <el-icon class="camera-icon">
              <VideoCamera />
            </el-icon>
            
            <!-- 聚合数量标识 -->
            <div 
              v-if="cluster.cameras.length > 1" 
              class="cluster-count"
            >
              {{ cluster.cameras.length }}
            </div>
            
            <!-- 显示主相机名称或聚合提示 -->
            <div class="camera-label">
              {{ cluster.cameras.length > 1 ? `${cluster.cameras[0].camera_name} 等${cluster.cameras.length}个` : cluster.cameras[0].camera_name }}
            </div>
            
            <!-- 在线状态指示器 -->
            <div 
              v-if="cluster.cameras.some(camera => camera.is_online === 1)" 
              class="online-indicator"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 缩放控制 -->
    <div 
      v-if="currentLayer"
      ref="zoomControlsRef"
      class="zoom-controls"
      :class="{ 'dragging': isDraggingControls }"
      :style="{
        transform: `translate(${controlsPosition.x}px, ${controlsPosition.y}px)`,
        cursor: isDraggingControls ? 'grabbing' : 'grab'
      }"
      @mousedown="startDragControls"
    >
      <el-button-group class="tech-button-group">
        <el-button class="tech-button-secondary" @click="zoomIn">
          <el-icon><ZoomIn /></el-icon>
        </el-button>
        <el-button class="tech-button-secondary" @click="resetZoom">{{ Math.round(zoomLevel * 100) }}%</el-button>
        <el-button class="tech-button-secondary" @click="zoomOut">
          <el-icon><ZoomOut /></el-icon>
        </el-button>
      </el-button-group>
    </div>

    <!-- 空状态 -->
    <el-empty v-else description="请选择图层查看地图配置" />

    <!-- 聚合相机悬停提示 -->
    <teleport to="body">
      <div 
        v-if="tooltipVisible"
        class="cluster-tooltip"
        :style="{
          left: tooltipPosition.x + 'px',
          top: tooltipPosition.y + 'px'
        }"
      >
        <div class="tooltip-content">
          <div 
            v-for="line in tooltipContent.split('\n')" 
            :key="line"
            class="tooltip-line"
          >
            {{ line }}
          </div>
        </div>
      </div>
    </teleport>

    <!-- 相机信息面板 -->
    <div v-if="selectedCamera" class="camera-panel">
      <div class="panel-header">
        <h4>相机信息</h4>
        <el-button type="text" class="tech-button-text" @click="clearSelection">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      <div class="panel-content">
        <!-- 检查是否是聚合相机 -->
        <div v-if="isSelectedCameraClustered" class="cluster-info">
          <!-- 聚合相机列表 -->
          <div class="cluster-cameras">
            <div 
              v-for="camera in selectedCluster.cameras" 
              :key="camera.camera_id"
              class="cluster-camera-item"
              :class="{ 'active': camera.camera_id === selectedCameraId }"
              @click="selectedCameraId = camera.camera_id"
            >
              <div class="camera-indicator">
                <el-icon><VideoCamera /></el-icon>
                <div 
                  v-if="camera.is_online === 1" 
                  class="mini-online-indicator"
                ></div>
              </div>
              <div class="camera-info">
                <div class="camera-name">{{ camera.camera_name }}</div>
                <div class="camera-status">
                  <el-tag 
                    :type="camera.is_online === 1 ? 'success' : 'danger'" 
                    size="small"
                  >
                    {{ camera.is_online === 1 ? '在线' : '离线' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 选中相机的详细信息 -->
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="名称">{{ selectedCamera.camera_name }}</el-descriptions-item>
          <el-descriptions-item label="编码">{{ selectedCamera.camera_code }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ selectedCamera.ip_address }}</el-descriptions-item>
          <el-descriptions-item label="位置">
            ({{ selectedCamera.position_x }}, {{ selectedCamera.position_y }})
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedCamera.is_online === 1 ? 'success' : 'danger'">
              {{ selectedCamera.is_online === 1 ? '在线' : '离线' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="panel-actions">
          <el-button type="primary" size="small" class="tech-button-sm" @click="editCameraPosition">编辑位置</el-button>
          <el-button type="danger" size="small" class="tech-button-danger tech-button-sm" @click="removeCameraFromLayerAction">移除相机</el-button>
        </div>
      </div>
    </div>

    <!-- 添加相机对话框 -->
    <el-dialog
      title="添加相机到图层"
      v-model="addCameraVisible"
      width="500px"
    >
      <div style="margin-bottom: 20px;">
        <el-input
          v-model="cameraSearchKeyword"
          placeholder="搜索相机名称或编码"
          clearable
          @input="filterUnboundCameras"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <el-table
        :data="filteredUnboundCameras"
        height="300"
        @selection-change="handleSelectionChange"
        ref="cameraTableRef"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="camera_name" label="相机名称" />
        <el-table-column prop="camera_code" label="编码" />
        <el-table-column prop="ip_address" label="IP地址" />
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.is_online === 1 ? 'success' : 'danger'" size="small">
              {{ scope.row.is_online === 1 ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button class="tech-button-secondary" @click="addCameraVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            class="tech-button"
            @click="confirmAddCamera"
            :disabled="!selectedUnboundCameras || selectedUnboundCameras.length === 0"
          >
            确认添加 {{ selectedUnboundCameras && selectedUnboundCameras.length > 0 ? `(${selectedUnboundCameras.length})` : '' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑位置对话框 -->
    <el-dialog
      title="编辑相机位置"
      v-model="editPositionVisible"
      width="400px"
    >
      <el-form :model="positionForm" label-width="80px">
        <el-form-item label="X坐标">
          <el-input-number
            v-model="positionForm.position_x"
            :min="0"
            :max="currentLayer?.image_width || 1920"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="Y坐标">
          <el-input-number
            v-model="positionForm.position_y"
            :min="0"
            :max="currentLayer?.image_height || 1080"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="角度">
          <el-input-number
            v-model="positionForm.camera_angle"
            :min="0"
            :max="359"
            style="width: 100%;"
          />
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">
            0° = 向右，90° = 向下，180° = 向左，270° = 向上
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="tech-button-secondary" @click="editPositionVisible = false">取消</el-button>
          <el-button type="primary" class="tech-button" @click="confirmEditPosition">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  VideoCamera, 
  Close, 
  Search,
  ZoomIn,
  ZoomOut,
  Plus,
  Check,
  Refresh
} from '@element-plus/icons-vue'
import { 
  getLayerList,
  getLayerCameras,
  addCameraToLayer,
  updateCameraPosition,
  batchUpdateCameraPositions,
  removeCameraFromLayer,
  getUnboundCameras
} from '@/api/map'

export default {
  name: 'MapConfiguration',
  components: {
    VideoCamera,
    Close,
    Search
  },
  setup() {
    // 响应式数据
    const layerList = ref([])
    const selectedLayerId = ref(null)
    const currentLayer = ref(null)
    const layerCameras = ref([])
    const unboundCameras = ref([])
    const selectedCameraId = ref(null)
    const draggingCameraId = ref(null)
    const addCameraVisible = ref(false)
    const editPositionVisible = ref(false)
    const cameraSearchKeyword = ref('')
    const selectedUnboundCameras = ref([])
    const cameraTableRef = ref(null)
    const hasChanges = ref(false)
    
    const mapWrapper = ref(null)
    const mapCanvas = ref(null)
    
    const zoomLevel = ref(1)
    const canvasSize = reactive({
      width: 1920,
      height: 1080
    })
    
    const positionForm = reactive({
      position_x: 0,
      position_y: 0,
      camera_angle: 0
    })
    
    // 拖拽相关
    const dragState = reactive({
      isDragging: false,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0
    })
    
    // 背景图片拖拽相关
    const backgroundDragState = reactive({
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0
    })
    
    // 缩放控制器拖拽相关
    const zoomControlsRef = ref(null)
    const isDraggingControls = ref(false)
    const controlsPosition = reactive({
      x: 0,
      y: 0
    })

    // 计算属性
    const selectedCamera = computed(() => {
      return layerCameras.value.find(camera => camera.camera_id === selectedCameraId.value)
    })
    
    const filteredUnboundCameras = computed(() => {
      if (!cameraSearchKeyword.value) return unboundCameras.value
      const keyword = cameraSearchKeyword.value.toLowerCase()
      return unboundCameras.value.filter(camera => 
        camera.camera_name.toLowerCase().includes(keyword) ||
        camera.camera_code.toLowerCase().includes(keyword)
      )
    })

    // 相机聚合计算 - 将位置相同或接近的相机聚合在一起
    const clusteredCameras = computed(() => {
      if (!layerCameras.value.length) return []
      
      const clusters = []
      const processed = new Set()
      const tolerance = 20 // 位置容差，像素为单位
      
      layerCameras.value.forEach((camera, index) => {
        if (processed.has(index)) return
        
        const cluster = {
          id: `cluster_${clusters.length}`,
          cameras: [camera],
          position_x: camera.position_x,
          position_y: camera.position_y,
          camera_angle: camera.camera_angle
        }
        
        processed.add(index)
        
        // 查找位置相近的其他相机
        layerCameras.value.forEach((otherCamera, otherIndex) => {
          if (processed.has(otherIndex) || index === otherIndex) return
          
          const distance = Math.sqrt(
            Math.pow(camera.position_x - otherCamera.position_x, 2) +
            Math.pow(camera.position_y - otherCamera.position_y, 2)
          )
          
          if (distance <= tolerance) {
            cluster.cameras.push(otherCamera)
            processed.add(otherIndex)
          }
        })
        
        clusters.push(cluster)
      })
      
      console.log('聚合相机结果:', clusters.map(c => ({
        位置: `(${c.position_x}, ${c.position_y})`,
        相机数量: c.cameras.length,
        相机列表: c.cameras.map(cam => cam.camera_name)
      })))
      
      return clusters
    })

    // 检查选中的相机是否属于聚合
    const isSelectedCameraClustered = computed(() => {
      if (!selectedCameraId.value) return false
      const cluster = clusteredCameras.value.find(c => 
        c.cameras.some(camera => camera.camera_id === selectedCameraId.value)
      )
      return cluster && cluster.cameras.length > 1
    })

    // 获取选中相机所在的聚合
    const selectedCluster = computed(() => {
      if (!selectedCameraId.value) return null
      return clusteredCameras.value.find(c => 
        c.cameras.some(camera => camera.camera_id === selectedCameraId.value)
      )
    })

    // 加载图层列表
    const loadLayers = async () => {
      try {
        const response = await getLayerList({ page: 1, size: 100, status: 1 })
        if (response.code === 200) {
          // 确保 layerList 总是一个数组
          layerList.value = Array.isArray(response.data?.list) ? response.data.list : []
        }
      } catch (error) {
        ElMessage.error('加载图层列表失败')
      }
    }

    // 图层切换
    const handleLayerChange = async (layerId) => {
      if (!layerId) return
      
      const layer = layerList.value.find(l => l.id === layerId)
      if (layer) {
        currentLayer.value = layer
        canvasSize.width = layer.image_width
        canvasSize.height = layer.image_height
        await loadLayerCameras(layerId)
        clearSelection()
        resetZoom()
        resetBackgroundPosition()
      }
    }

    // 加载图层相机
    const loadLayerCameras = async (layerId) => {
      try {
        const response = await getLayerCameras(layerId)
        if (response.code === 200) {
          // 确保 layerCameras 总是一个数组
          layerCameras.value = Array.isArray(response.data) ? response.data : []
          console.log('加载图层相机数据:', layerCameras.value.map(c => ({
            关联ID: c.id,
            相机ID: c.camera_id,
            相机ID类型: typeof c.camera_id,
            name: c.camera_name,
            位置: { x: c.position_x, y: c.position_y }
          })))
        }
      } catch (error) {
        ElMessage.error('加载图层相机失败')
      }
    }

    // 加载未绑定相机
    const loadUnboundCameras = async () => {
      try {
        const response = await getUnboundCameras()
        if (response.code === 200) {
          // 确保 unboundCameras 总是一个数组
          unboundCameras.value = Array.isArray(response.data) ? response.data : []
        }
      } catch (error) {
        ElMessage.error('加载未绑定相机失败')
      }
    }

    // 图片加载完成
    const onImageLoad = () => {
      // 适应容器大小
      nextTick(() => {
        fitToContainer()
      })
    }

    // 图片加载错误
    const onImageError = () => {
      ElMessage.error('地图图片加载失败')
    }

    // 适应容器大小
    const fitToContainer = () => {
      if (!mapWrapper.value || !currentLayer.value) return
      
      const container = mapWrapper.value
      const containerWidth = container.clientWidth - 40 // 留出边距
      const containerHeight = container.clientHeight - 40
      
      const scaleX = containerWidth / currentLayer.value.image_width
      const scaleY = containerHeight / currentLayer.value.image_height
      
      zoomLevel.value = Math.min(scaleX, scaleY, 1) // 不超过原始大小
    }

    // 缩放控制
    const zoomIn = () => {
      zoomLevel.value = Math.min(zoomLevel.value * 1.2, 3)
    }

    const zoomOut = () => {
      zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.1)
    }

    const resetZoom = () => {
      fitToContainer()
    }
    
    // 缩放控制器拖拽方法
    const startDragControls = (event) => {
      event.preventDefault()
      isDraggingControls.value = true
      
      const startX = event.clientX - controlsPosition.x
      const startY = event.clientY - controlsPosition.y
      
      const handleMouseMove = (e) => {
        if (!isDraggingControls.value) return
        
        controlsPosition.x = e.clientX - startX
        controlsPosition.y = e.clientY - startY
      }
      
      const handleMouseUp = () => {
        isDraggingControls.value = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    // 画布点击处理
    const handleCanvasClick = () => {
      if (draggingCameraId.value) return
      
      // 清除选择
      clearSelection()
    }

    // 画布鼠标移动处理
    const handleCanvasMouseMove = (event) => {
      if (!dragState.isDragging) return
      
      const rect = mapCanvas.value.getBoundingClientRect()
      const x = (event.clientX - rect.left) / zoomLevel.value
      const y = (event.clientY - rect.top) / zoomLevel.value
      
      const newX = Math.max(0, Math.min(Math.round(x - dragState.offsetX), canvasSize.width))
      const newY = Math.max(0, Math.min(Math.round(y - dragState.offsetY), canvasSize.height))
      
      // 如果是聚合相机拖拽，同步移动所有相机
      if (dragState.clusterCameras && dragState.clusterCameras.length > 0) {
        dragState.clusterCameras.forEach(clusterCamera => {
          const camera = layerCameras.value.find(c => {
            const cId = typeof c.camera_id === 'string' ? c.camera_id : String(c.camera_id)
            const clusterId = typeof clusterCamera.camera_id === 'string' ? clusterCamera.camera_id : String(clusterCamera.camera_id)
            return cId === clusterId
          })
          
          if (camera) {
            camera.position_x = newX
            camera.position_y = newY
          }
        })
        
        hasChanges.value = true
        console.log('同步移动聚合相机:', dragState.clusterCameras.map(c => c.camera_name), '位置:', newX, newY)
      } else {
        // 单个相机拖拽
        const camera = layerCameras.value.find(c => {
          const cId = typeof c.camera_id === 'string' ? c.camera_id : String(c.camera_id)
          const dragId = typeof draggingCameraId.value === 'string' ? draggingCameraId.value : String(draggingCameraId.value)
          return cId === dragId
        })
        
        if (camera) {
          camera.position_x = newX
          camera.position_y = newY
          hasChanges.value = true
          console.log('更新相机位置:', camera.camera_name, '位置:', camera.position_x, camera.position_y)
        }
      }
    }

    // 选择相机
    const selectCamera = (camera) => {
      selectedCameraId.value = camera.camera_id
    }

    // 选择聚合相机
    const selectCluster = (cluster) => {
      // 如果聚合包含多个相机，选择第一个作为代表
      selectedCameraId.value = cluster.cameras[0].camera_id
      
      // 如果聚合只有一个相机，直接选择
      if (cluster.cameras.length === 1) {
        selectedCameraId.value = cluster.cameras[0].camera_id
      } else {
        // 多个相机时，可以显示选择列表或其他处理逻辑
        console.log('选择了聚合相机:', cluster.cameras.map(c => c.camera_name))
      }
    }

    // 清除选择
    const clearSelection = () => {
      selectedCameraId.value = null
    }

    // 开始拖拽
    const startDrag = (camera, event) => {
      event.preventDefault()
      console.log('开始拖拽相机:', camera.camera_id, camera.camera_name)
      draggingCameraId.value = camera.camera_id
      selectedCameraId.value = camera.camera_id
      
      const rect = mapCanvas.value.getBoundingClientRect()
      const x = (event.clientX - rect.left) / zoomLevel.value
      const y = (event.clientY - rect.top) / zoomLevel.value
      
      dragState.isDragging = true
      dragState.offsetX = x - camera.position_x
      dragState.offsetY = y - camera.position_y
      
      // 添加全局事件监听
      document.addEventListener('mousemove', handleDocumentMouseMove)
      document.addEventListener('mouseup', stopDrag)
    }

    // 开始拖拽聚合相机
    const startClusterDrag = (cluster, event) => {
      event.preventDefault()
      console.log('开始拖拽聚合相机:', cluster.cameras.map(c => c.camera_name))
      
      // 选择第一个相机作为拖拽代表
      const primaryCamera = cluster.cameras[0]
      draggingCameraId.value = primaryCamera.camera_id
      selectedCameraId.value = primaryCamera.camera_id
      
      const rect = mapCanvas.value.getBoundingClientRect()
      const x = (event.clientX - rect.left) / zoomLevel.value
      const y = (event.clientY - rect.top) / zoomLevel.value
      
      dragState.isDragging = true
      dragState.offsetX = x - cluster.position_x
      dragState.offsetY = y - cluster.position_y
      
      // 记录聚合中的所有相机，用于同步移动
      dragState.clusterCameras = cluster.cameras
      
      // 添加全局事件监听
      document.addEventListener('mousemove', handleDocumentMouseMove)
      document.addEventListener('mouseup', stopDrag)
    }

    // 文档鼠标移动处理
    const handleDocumentMouseMove = (event) => {
      if (mapCanvas.value) {
        handleCanvasMouseMove(event)
      }
    }

    // 停止拖拽
    const stopDrag = () => {
      dragState.isDragging = false
      draggingCameraId.value = null
      
      // 清理聚合拖拽状态
      if (dragState.clusterCameras) {
        delete dragState.clusterCameras
      }
      
      // 移除全局事件监听
      document.removeEventListener('mousemove', handleDocumentMouseMove)
      document.removeEventListener('mouseup', stopDrag)
    }

    // 背景图片拖拽开始
    const startBackgroundDrag = (event) => {
      // 只有当没有拖拽相机时才允许拖拽背景
      if (dragState.isDragging || draggingCameraId.value) return
      
      event.preventDefault()
      backgroundDragState.isDragging = true
      backgroundDragState.startX = event.clientX - backgroundDragState.currentX
      backgroundDragState.startY = event.clientY - backgroundDragState.currentY
      
      console.log('开始拖拽背景图片')
      
      // 添加全局事件监听
      document.addEventListener('mousemove', handleBackgroundDragMove)
      document.addEventListener('mouseup', stopBackgroundDrag)
    }
    
    // 背景图片拖拽移动
    const handleBackgroundDragMove = (event) => {
      if (!backgroundDragState.isDragging) return
      
      event.preventDefault()
      backgroundDragState.currentX = event.clientX - backgroundDragState.startX
      backgroundDragState.currentY = event.clientY - backgroundDragState.startY
      
      console.log('拖拽背景图片位置:', {
        x: backgroundDragState.currentX,
        y: backgroundDragState.currentY
      })
    }
    
    // 停止背景图片拖拽
    const stopBackgroundDrag = () => {
      backgroundDragState.isDragging = false
      
      console.log('停止拖拽背景图片')
      
      // 移除全局事件监听
      document.removeEventListener('mousemove', handleBackgroundDragMove)
      document.removeEventListener('mouseup', stopBackgroundDrag)
    }
    
    // 重置背景图片位置
    const resetBackgroundPosition = () => {
      backgroundDragState.currentX = 0
      backgroundDragState.currentY = 0
      console.log('重置背景图片位置')
    }

    // 聚合相机悬停提示
    const clusterTooltip = ref(null)
    const tooltipVisible = ref(false)
    const tooltipPosition = reactive({ x: 0, y: 0 })
    const tooltipContent = ref('')

    const showClusterTooltip = (event, cluster) => {
      if (cluster.cameras.length <= 1) return
      
      const rect = event.target.getBoundingClientRect()
      tooltipPosition.x = rect.left + rect.width / 2
      tooltipPosition.y = rect.top - 10
      
      tooltipContent.value = cluster.cameras.map(camera => 
        `${camera.camera_name} (${camera.is_online === 1 ? '在线' : '离线'})`
      ).join('\n')
      
      tooltipVisible.value = true
      console.log('显示聚合提示:', cluster.cameras.map(c => c.camera_name))
    }

    const hideClusterTooltip = () => {
      tooltipVisible.value = false
    }

    // 显示添加相机对话框
    const showAddCameraDialog = async () => {
      await loadUnboundCameras()
      addCameraVisible.value = true
      cameraSearchKeyword.value = ''
      selectedUnboundCameras.value = []
      // 清空表格选择
      if (cameraTableRef.value) {
        cameraTableRef.value.clearSelection()
      }
    }

    // 过滤未绑定相机
    const filterUnboundCameras = () => {
      // 计算属性会自动处理过滤
    }

    // 处理多选变化
    const handleSelectionChange = (selection) => {
      selectedUnboundCameras.value = selection
    }

    // 确认添加相机
    const confirmAddCamera = async () => {
      if (!selectedUnboundCameras.value || selectedUnboundCameras.value.length === 0 || !selectedLayerId.value) return
      
      try {
        // 批量添加相机
        const promises = selectedUnboundCameras.value.map((camera, index) => {
          // 为多个相机设置不同的默认位置，避免重叠
          const centerX = Math.floor(canvasSize.width / 2) + (index * 50) - (selectedUnboundCameras.value.length * 25)
          const centerY = Math.floor(canvasSize.height / 2) + (index * 30) - (selectedUnboundCameras.value.length * 15)
          
          return addCameraToLayer(selectedLayerId.value, {
            camera_id: camera.id,
            position_x: Math.max(0, Math.min(centerX, canvasSize.width - 50)),
            position_y: Math.max(0, Math.min(centerY, canvasSize.height - 50)),
            camera_angle: 0
          })
        })
        
        await Promise.all(promises)
        
        ElMessage.success(`成功添加 ${selectedUnboundCameras.value.length} 个相机`)
        addCameraVisible.value = false
        await loadLayerCameras(selectedLayerId.value)
        
        // 发出全局事件，通知其他组件刷新相机数据
        window.dispatchEvent(new CustomEvent('camera-data-updated', {
          detail: {
            type: 'camera_added',
            layerId: selectedLayerId.value,
            cameras: selectedUnboundCameras.value
          }
        }))
      } catch (error) {
        ElMessage.error('添加相机失败: ' + (error.message || '未知错误'))
      }
    }

    // 编辑相机位置
    const editCameraPosition = () => {
      if (!selectedCamera.value) return
      
      positionForm.position_x = selectedCamera.value.position_x
      positionForm.position_y = selectedCamera.value.position_y
      positionForm.camera_angle = selectedCamera.value.camera_angle || 0
      editPositionVisible.value = true
    }

    // 确认编辑位置
    const confirmEditPosition = async () => {
      if (!selectedCamera.value || !selectedLayerId.value) return
      
      try {
        await updateCameraPosition(selectedLayerId.value, selectedCamera.value.camera_id, {
          position_x: positionForm.position_x,
          position_y: positionForm.position_y,
          camera_angle: positionForm.camera_angle
        })
        
        ElMessage.success('位置更新成功')
        editPositionVisible.value = false
        await loadLayerCameras(selectedLayerId.value)
        hasChanges.value = false
      } catch (error) {
        ElMessage.error('更新位置失败: ' + (error.message || '未知错误'))
      }
    }

    // 保存位置
    const savePositions = async () => {
      if (!selectedLayerId.value || !hasChanges.value) return
      
      try {
        // 批量更新所有有变化的相机位置
        const cameras = layerCameras.value.map(camera => {
          const cameraId = typeof camera.camera_id === 'string' ? parseInt(camera.camera_id, 10) : camera.camera_id
          const positionX = typeof camera.position_x === 'string' ? parseInt(camera.position_x, 10) : camera.position_x
          const positionY = typeof camera.position_y === 'string' ? parseInt(camera.position_y, 10) : camera.position_y
          
          console.log('处理相机:', {
            关联ID: camera.id,
            相机ID: camera.camera_id,
            转换后相机ID: cameraId,
            相机名称: camera.camera_name,
            位置: { x: positionX, y: positionY }
          })
          
          return {
            camera_id: cameraId,
            position_x: positionX,
            position_y: positionY
          }
        })
        
        console.log('保存位置数据:', { cameras })
        
        // 使用批量更新接口
        await batchUpdateCameraPositions(parseInt(selectedLayerId.value), { cameras })
        
        ElMessage.success('位置保存成功')
        hasChanges.value = false
        
        // 发出全局事件，通知其他组件刷新相机数据
        window.dispatchEvent(new CustomEvent('camera-data-updated', {
          detail: {
            type: 'position_updated',
            layerId: selectedLayerId.value,
            cameras: cameras
          }
        }))
        
        console.log('已发出相机数据更新事件')
      } catch (error) {
        console.error('保存位置失败:', error)
        ElMessage.error('保存位置失败: ' + (error.response?.data?.message || error.message || '未知错误'))
      }
    }

    // 从图层移除相机
    const removeCameraFromLayerAction = () => {
      if (!selectedCamera.value || !selectedLayerId.value) return
      
      ElMessageBox.confirm(
        `确定要从图层中移除相机"${selectedCamera.value.camera_name}"吗？`,
        '移除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          await removeCameraFromLayer(selectedLayerId.value, selectedCamera.value.camera_id)
          ElMessage.success('相机移除成功')
          await loadLayerCameras(selectedLayerId.value)
          clearSelection()
          
          // 发出全局事件，通知其他组件刷新相机数据
          window.dispatchEvent(new CustomEvent('camera-data-updated', {
            detail: {
              type: 'camera_removed',
              layerId: selectedLayerId.value,
              cameraId: selectedCamera.value.camera_id
            }
          }))
        } catch (error) {
          ElMessage.error('移除相机失败: ' + (error.message || '未知错误'))
        }
      })
    }

    // 刷新数据
    const refreshData = () => {
      if (selectedLayerId.value) {
        loadLayerCameras(selectedLayerId.value)
      }
      loadLayers()
    }

    onMounted(() => {
      loadLayers()
    })

    return {
      layerList,
      selectedLayerId,
      currentLayer,
      layerCameras,
      unboundCameras,
      selectedCameraId,
      draggingCameraId,
      addCameraVisible,
      editPositionVisible,
      cameraSearchKeyword,
      selectedUnboundCameras,
      cameraTableRef,
      hasChanges,
      mapWrapper,
      mapCanvas,
      zoomLevel,
      canvasSize,
      positionForm,
      selectedCamera,
      filteredUnboundCameras,
      clusteredCameras,
      isSelectedCameraClustered,
      selectedCluster,
      selectCluster,
      startClusterDrag,
      clusterTooltip,
      tooltipVisible,
      tooltipPosition,
      tooltipContent,
      showClusterTooltip,
      hideClusterTooltip,
      handleLayerChange,
      onImageLoad,
      onImageError,
      zoomIn,
      zoomOut,
      resetZoom,
      handleCanvasClick,
      handleCanvasMouseMove,
      selectCamera,
      clearSelection,
      startDrag,
      showAddCameraDialog,
      filterUnboundCameras,
      handleSelectionChange,
      confirmAddCamera,
      editCameraPosition,
      confirmEditPosition,
      savePositions,
      removeCameraFromLayerAction,
      refreshData,
      // 缩放控制器拖拽
      zoomControlsRef,
      isDraggingControls,
      controlsPosition,
      startDragControls,
      // 背景图片拖拽
      backgroundDragState,
      startBackgroundDrag,
      resetBackgroundPosition,
      // 图标
      ZoomIn,
      ZoomOut,
      Plus,
      Check,
      Refresh
    }
  }
}
</script>

<style scoped>
.map-configuration {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background: rgba(0, 20, 40, 0.4);
  border-radius: 4px;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

.map-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.map-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: rgba(0, 20, 40, 0.6);
  border-bottom: 1px solid #e4e7ed;
  font-size: 14px;
  color: #606266;
}

.map-wrapper {
  flex: 1;
  position: relative;
  overflow: auto;
  background: rgba(0, 20, 40, 0.3);
  padding: 20px;
}

.map-canvas {
  position: relative;
  margin: 0 auto;
  cursor: crosshair;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.map-background {
  width: 100%;
  height: 100%;
  display: block;
  user-select: none;
  cursor: grab;
  transition: filter 0.2s ease;
}

.map-background:hover {
  filter: brightness(1.05);
}

.map-background.dragging {
  cursor: grabbing;
  filter: brightness(0.95);
}

.camera-marker {
  position: absolute;
  width: 24px;
  height: 24px;
  cursor: pointer;
  transform-origin: center;
  z-index: 10;
}

.camera-marker.selected {
  z-index: 20;
}

.camera-marker.dragging {
  z-index: 30;
}

.camera-marker.clustered {
  z-index: 25;
}

.camera-icon {
  width: 24px;
  height: 24px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.camera-marker:hover .camera-icon,
.camera-marker.selected .camera-icon {
  background: #67c23a;
  transform: scale(1.2);
}

.camera-label {
  position: absolute;
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.camera-marker:hover .camera-label,
.camera-marker.selected .camera-label {
  opacity: 1;
}

.online-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #67c23a;
  border: 2px solid white;
  border-radius: 50%;
}

/* 聚合数量标识 */
.cluster-count {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 18px;
  height: 18px;
  background: #f56c6c;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

/* 聚合相机样式增强 */
.camera-marker.clustered .camera-icon {
  background: linear-gradient(135deg, #f56c6c, #e6a23c);
  border-color: #f56c6c;
  box-shadow: 0 0 15px rgba(245, 108, 108, 0.4);
}

.camera-marker.clustered:hover .camera-icon {
  background: linear-gradient(135deg, #f78989, #eebe77);
  transform: scale(1.3);
  box-shadow: 0 0 20px rgba(245, 108, 108, 0.6);
}

/* 聚合提示框样式 */
.cluster-tooltip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  transform: translateX(-50%) translateY(-100%);
}

.tooltip-content {
  background: rgba(0, 20, 40, 0.95);
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 6px;
  padding: 8px 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  max-width: 250px;
}

.tooltip-line {
  color: #ffffff;
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.3);
}

.tooltip-line + .tooltip-line {
  margin-top: 4px;
}

.zoom-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}

.camera-panel {
  position: absolute;
  top: 80px;
  right: 20px;
  width: 280px;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.panel-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.panel-content {
  padding: 15px;
}

.panel-actions {
  margin-top: 15px;
  display: flex;
  gap: 8px;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 10px;
  }
  
  .camera-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 400px;
  }
}
/* ==================== 间距优化 ==================== */

/* 工具栏按钮间距 */
.toolbar-right .el-button + .el-button {
  margin-left: 16px !important;
}



/* 背景图片拖拽状态样式 */
.map-background.dragging {
  filter: brightness(0.95) drop-shadow(0 0 20px rgba(0, 255, 255, 0.5)) !important;
  transition: none !important;
}

/* 重置背景按钮科技感样式 */
.tech-button-warning {
  background: linear-gradient(135deg, rgba(255, 177, 0, 0.8), rgba(255, 140, 0, 0.9)) !important;
  border: 1px solid rgba(255, 177, 0, 0.6) !important;
  color: #ffffff !important;
  text-shadow: 0 0 5px rgba(255, 177, 0, 0.5) !important;
  box-shadow: 0 0 10px rgba(255, 177, 0, 0.3) !important;
  transition: all 0.3s ease !important;
}

.tech-button-warning:hover {
  background: linear-gradient(135deg, rgba(255, 177, 0, 1), rgba(255, 140, 0, 1)) !important;
  box-shadow: 0 0 20px rgba(255, 177, 0, 0.6) !important;
  transform: translateY(-2px) !important;
}

.tech-button-warning:active {
  transform: translateY(0) !important;
  box-shadow: 0 0 15px rgba(255, 177, 0, 0.4) !important;
}

.tech-button-warning:disabled {
  background: rgba(255, 177, 0, 0.3) !important;
  border-color: rgba(255, 177, 0, 0.2) !important;
  box-shadow: none !important;
  transform: none !important;
  opacity: 0.5 !important;
}

/* 缩放按钮样式增强 */
.zoom-controls {
  display: flex !important;
  justify-content: center !important;
  margin-top: 16px !important;
  margin-bottom: 16px !important;
  user-select: none !important;
  transition: transform 0.2s ease !important;
}

.zoom-controls.dragging {
  transition: none !important;
  z-index: 1000 !important;
}

.zoom-controls .el-button-group {
  display: flex !important;
  flex-direction: row !important;
  gap: 0 !important;
  background: rgba(0, 20, 40, 0.9) !important;
  border-radius: 6px !important;
  padding: 2px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

.zoom-controls .el-button {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  padding: 4px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
  border: none !important;
  color: #00ffff !important;
  transition: all 0.3s ease !important;
  font-size: 12px !important;
  margin: 0 !important;
}

.zoom-controls .el-button + .el-button {
  border-left: 1px solid rgba(0, 255, 255, 0.2) !important;
  margin-left: 0 !important;
}

.zoom-controls .el-button:first-child {
  border-radius: 4px 0 0 4px !important;
}

.zoom-controls .el-button:last-child {
  border-radius: 0 4px 4px 0 !important;
}

.zoom-controls .el-button:only-child {
  border-radius: 4px !important;
}

.zoom-controls .el-button:not(:first-child):not(:last-child) {
  border-radius: 0 !important;
}

.zoom-controls .el-button:hover {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #ffffff !important;
  transform: scale(1.05) !important;
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.3) !important;
  z-index: 10 !important;
}

.zoom-controls .el-button .el-icon {
  font-size: 14px !important;
  width: 14px !important;
  height: 14px !important;
}

.zoom-controls .el-button:active {
  transform: scale(0.95) !important;
}

/* 相机面板按钮间距 */
.panel-actions .el-button + .el-button {
  margin-left: 12px !important;
}

/* 表单项间距 */
:deep(.el-form-item) {
  margin-bottom: 24px !important;
}

/* 对话框按钮间距 */
:deep(.dialog-footer .el-button + .el-button) {
  margin-left: 16px !important;
}

/* 表格间距优化 */
:deep(.el-table .el-table__row) {
  height: 50px !important;
}

/* ==================== 科技感主题样式 ==================== */

/* 主容器样式 */
.map-configuration {
  padding: 20px !important;
  min-height: calc(100vh - 100px) !important;
  background: transparent !important;
}

/* 工具栏样式 */
.toolbar {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  padding: 15px !important;
  margin-bottom: 20px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.1) !important;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 图层选择框样式 */
.tech-select :deep(.el-select__wrapper) {
  background-color: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
}

.tech-select :deep(.el-select__input) {
  color: rgba(255, 255, 255, 0.95) !important;
  background: transparent !important;
}

/* 地图容器样式 */
.map-container {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  backdrop-filter: blur(10px) !important;
  min-height: calc(100vh - 300px) !important;
  max-height: none !important;
  overflow: visible !important;
  padding-bottom: 50px !important;
}

.map-info {
  background: rgba(0, 30, 60, 0.8) !important;
  color: #ffffff !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
}

.map-info span {
  color: #00ffff !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3) !important;
}

/* 地图包装器样式 */
.map-wrapper {
  overflow: auto !important;
  max-height: calc(100vh - 350px) !important;
  padding: 20px !important;
  border-radius: 6px !important;
}

/* 自定义滚动条样式 */
.map-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.map-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.05);
  border-radius: 4px;
}

.map-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.3) 0%, 
    rgba(0, 200, 255, 0.5) 50%, 
    rgba(0, 255, 255, 0.3) 100%);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.map-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.5) 0%, 
    rgba(0, 200, 255, 0.7) 50%, 
    rgba(0, 255, 255, 0.5) 100%);
}

/* 地图画布样式 */
.map-canvas {
  background: rgba(0, 10, 20, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.1) !important;
  margin-bottom: 50px !important;
}

/* 相机面板样式 */
.camera-panel {
  background: rgba(0, 20, 40, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
}

.panel-header {
  background: rgba(0, 30, 60, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px 8px 0 0 !important;
}

.panel-header h4 {
  color: #00ffff !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

.panel-content {
  background: transparent !important;
  color: #ffffff !important;
}

/* 相机图标科技感样式 */
.camera-icon {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.8), rgba(0, 200, 255, 0.9)) !important;
  border: 2px solid rgba(0, 255, 255, 0.6) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4) !important;
}

/* 聚合相机科技感样式 */
.camera-marker.clustered .camera-icon {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.8), rgba(230, 162, 60, 0.9)) !important;
  border: 2px solid rgba(245, 108, 108, 0.6) !important;
  box-shadow: 0 0 15px rgba(245, 108, 108, 0.4) !important;
}

.camera-marker.clustered:hover .camera-icon {
  background: linear-gradient(135deg, rgba(247, 137, 137, 0.9), rgba(238, 190, 119, 1)) !important;
  border-color: rgba(245, 108, 108, 0.8) !important;
  box-shadow: 0 0 20px rgba(245, 108, 108, 0.6) !important;
}

/* 聚合数量标识科技感样式 */
.cluster-count {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.9), rgba(220, 38, 127, 1)) !important;
  border: 2px solid rgba(0, 255, 255, 0.6) !important;
  box-shadow: 0 0 10px rgba(245, 108, 108, 0.6) !important;
  color: #ffffff !important;
  text-shadow: 0 0 3px rgba(245, 108, 108, 0.8) !important;
}

.camera-marker:hover .camera-icon,
.camera-marker.selected .camera-icon {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.8), rgba(67, 160, 23, 0.9)) !important;
  border-color: rgba(103, 194, 58, 0.8) !important;
  box-shadow: 0 0 20px rgba(103, 194, 58, 0.6) !important;
}

.camera-label {
  background: rgba(0, 20, 40, 0.9) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #00ffff !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5) !important;
}

.online-indicator {
  background: #00ff88 !important;
  border: 2px solid rgba(0, 255, 255, 0.8) !important;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.6) !important;
}

/* 空状态样式 */
.empty-state {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  color: rgba(255, 255, 255, 0.8) !important;
  min-height: calc(100vh - 300px) !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 50px !important;
}

.empty-state .el-icon {
  color: rgba(0, 255, 255, 0.6) !important;
  font-size: 64px !important;
  margin-bottom: 20px !important;
}

.empty-state p {
  font-size: 18px !important;
  color: rgba(255, 255, 255, 0.8) !important;
  text-align: center !important;
}

/* 对话框样式 */
:deep(.el-dialog) {
  background: rgba(0, 20, 40, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.el-dialog__header) {
  background: rgba(0, 30, 60, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px 8px 0 0 !important;
}

:deep(.el-dialog__title) {
  color: #00ffff !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-dialog__body) {
  background: transparent !important;
  color: #ffffff !important;
}

/* 表单样式 */
:deep(.el-form-item__label) {
  color: #00ffff !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-input__wrapper) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
}

:deep(.el-input__inner) {
  color: #ffffff !important;
  background: transparent !important;
}

:deep(.el-textarea__inner) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
}

/* 表格样式 */
:deep(.el-table) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
}

/* 强制去除表格的所有白色背景 */
:deep(.el-table),
:deep(.el-table *) {
  background-color: transparent !important;
  background: transparent !important;
}

:deep(.el-table) {
  background: rgba(0, 20, 40, 0.6) !important;
}

/* 去除表格内部白色背景 */
:deep(.el-table .el-table__inner-wrapper) {
  background: transparent !important;
  border: none !important;
}

:deep(.el-table .el-table__header-wrapper) {
  background: rgba(0, 30, 60, 0.8) !important;
  border: none !important;
}

:deep(.el-table .el-table__body-wrapper) {
  background: transparent !important;
}

:deep(.el-table th) {
  background: rgba(0, 30, 60, 0.8) !important;
  color: #00ffff !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-table th:last-child) {
  border-right: none !important;
}

:deep(.el-table td) {
  background: transparent !important;
  color: #ffffff !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1) !important;
  border-right: 1px solid rgba(0, 255, 255, 0.05) !important;
}

:deep(.el-table td:last-child) {
  border-right: none !important;
}

:deep(.el-table tr) {
  background: transparent !important;
}

:deep(.el-table tr:nth-child(even)) {
  background: rgba(0, 255, 255, 0.02) !important;
}

:deep(.el-table tr:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-table tr:hover td) {
  background: rgba(0, 255, 255, 0.1) !important;
}

/* 去除表格滚动条区域的白色背景 */
:deep(.el-table .el-scrollbar) {
  background: transparent !important;
}

:deep(.el-table .el-scrollbar__wrap) {
  background: transparent !important;
}

:deep(.el-table .el-scrollbar__view) {
  background: transparent !important;
}

/* 表格标签样式 */
:deep(.el-table .el-tag) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #00ffff !important;
}

:deep(.el-table .el-tag.el-tag--success) {
  background: rgba(103, 194, 58, 0.1) !important;
  border: 1px solid rgba(103, 194, 58, 0.3) !important;
  color: #67c23a !important;
}

:deep(.el-table .el-tag.el-tag--danger) {
  background: rgba(245, 108, 108, 0.1) !important;
  border: 1px solid rgba(245, 108, 108, 0.3) !important;
  color: #f56c6c !important;
}

/* 针对添加相机对话框的额外样式优化 */
/* 去除表格选中行的白色高亮 */
:deep(.el-table .el-table__body tr.current-row) {
  background: rgba(0, 255, 255, 0.15) !important;
}

:deep(.el-table .el-table__body tr.current-row td) {
  background: rgba(0, 255, 255, 0.15) !important;
}

/* 去除表格可能的白色边框和分割线 */
:deep(.el-table::before) {
  display: none !important;
}

:deep(.el-table .el-table__border-left-patch) {
  background: transparent !important;
}

:deep(.el-table .el-table__border-bottom-patch) {
  background: transparent !important;
}

/* 确保搜索框没有白色背景 */
:deep(.el-input__prefix) {
  color: rgba(0, 255, 255, 0.6) !important;
}

:deep(.el-input__suffix) {
  color: rgba(0, 255, 255, 0.6) !important;
}

/* 去除可能的白色遮罩或背景 */
:deep(.el-dialog__wrapper) {
  background: rgba(0, 0, 0, 0.5) !important;
}

/* 确保对话框内所有元素都没有白色背景 */
:deep(.el-dialog .el-dialog__body *) {
  background-color: transparent !important;
}

/* 特别针对可能出现的白色容器 */
:deep(.el-dialog .el-table-v2),
:deep(.el-dialog .el-table-v2 *),
:deep(.el-dialog .el-virtual-list),
:deep(.el-dialog .el-virtual-list *) {
  background: transparent !important;
  background-color: transparent !important;
}

/* 完全去除表格底部白线和边框 */
:deep(.el-table::after),
:deep(.el-table::before) {
  display: none !important;
  content: none !important;
  background: none !important;
  border: none !important;
}

:deep(.el-table .el-table__inner-wrapper::after),
:deep(.el-table .el-table__inner-wrapper::before) {
  display: none !important;
  content: none !important;
  background: none !important;
  border: none !important;
}

:deep(.el-table .el-table__body::after),
:deep(.el-table .el-table__body::before) {
  display: none !important;
  content: none !important;
  background: none !important;
  border: none !important;
}

/* 去除最后一行的底部边框 */
:deep(.el-table .el-table__body tr:last-child td) {
  border-bottom: none !important;
}

/* 多选框样式优化 */
:deep(.el-table .el-checkbox) {
  background: transparent !important;
}

:deep(.el-table .el-checkbox__input) {
  background: transparent !important;
}

:deep(.el-table .el-checkbox__inner) {
  background: rgba(0, 20, 40, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
}

:deep(.el-table .el-checkbox__input.is-checked .el-checkbox__inner) {
  background: rgba(0, 255, 255, 0.8) !important;
  border-color: #00ffff !important;
}

:deep(.el-table .el-checkbox__input.is-checked .el-checkbox__inner::after) {
  border-color: #ffffff !important;
}

/* 相机信息面板 - 描述列表样式 */
:deep(.el-descriptions) {
  background: transparent !important;
  border: none !important;
}

:deep(.el-descriptions__header) {
  background: transparent !important;
  color: #00ffff !important;
}

:deep(.el-descriptions__body) {
  background: transparent !important;
}

:deep(.el-descriptions__table) {
  background: transparent !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
}

:deep(.el-descriptions__cell) {
  background: transparent !important;
  border-color: rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-descriptions__label) {
  background: rgba(0, 30, 60, 0.6) !important;
  color: #00ffff !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3) !important;
  border-color: rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-descriptions__content) {
  background: rgba(0, 20, 40, 0.4) !important;
  color: #ffffff !important;
  border-color: rgba(0, 255, 255, 0.1) !important;
}

/* 相机信息面板中的标签样式 */
:deep(.camera-panel .el-tag) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #00ffff !important;
}

:deep(.camera-panel .el-tag.el-tag--success) {
  background: rgba(103, 194, 58, 0.1) !important;
  border: 1px solid rgba(103, 194, 58, 0.3) !important;
  color: #67c23a !important;
}

:deep(.camera-panel .el-tag.el-tag--danger) {
  background: rgba(245, 108, 108, 0.1) !important;
  border: 1px solid rgba(245, 108, 108, 0.3) !important;
  color: #f56c6c !important;
}

/* 聚合相机信息样式 */
.cluster-info {
  margin-bottom: 20px;
}

.cluster-cameras {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(0, 10, 20, 0.3);
}

.cluster-camera-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.cluster-camera-item:last-child {
  border-bottom: none;
}

.cluster-camera-item:hover {
  background: rgba(0, 255, 255, 0.05);
}

.cluster-camera-item.active {
  background: rgba(0, 255, 255, 0.1);
  border-left: 3px solid #00ffff;
}

.camera-indicator {
  position: relative;
  width: 24px;
  height: 24px;
  margin-right: 10px;
  flex-shrink: 0;
}

.camera-indicator .el-icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.6), rgba(0, 200, 255, 0.8));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 1px solid rgba(0, 255, 255, 0.4);
}

.mini-online-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 6px;
  height: 6px;
  background: #00ff88;
  border: 1px solid rgba(0, 255, 255, 0.6);
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(0, 255, 136, 0.4);
}

.camera-info {
  flex: 1;
}

.camera-name {
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.3);
}

.camera-status {
  font-size: 12px;
}

/* 聚合面板警告框样式 */
:deep(.cluster-info .el-alert) {
  background: rgba(230, 162, 60, 0.1) !important;
  border: 1px solid rgba(230, 162, 60, 0.3) !important;
  border-radius: 6px !important;
}

:deep(.cluster-info .el-alert__title) {
  color: #e6a23c !important;
  text-shadow: 0 0 5px rgba(230, 162, 60, 0.3) !important;
}

:deep(.cluster-info .el-alert__description) {
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.cluster-info .el-alert__icon) {
  color: #e6a23c !important;
}
</style>
