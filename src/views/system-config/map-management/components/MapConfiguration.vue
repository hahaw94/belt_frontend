<template>
  <div class="map-configuration">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-select
        v-model="selectedLayerId"
        placeholder="选择图层"
        style="width: 250px;"
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
        <el-button type="info" class="tech-button-info" :icon="Refresh" @click="refreshData">刷新</el-button>
      </div>
    </div>

    <!-- 地图显示区域 -->
    <div class="map-container" v-if="currentLayer">
      <div class="map-info">
        <span>{{ currentLayer.layer_name }}</span>
        <span>{{ currentLayer.image_width }}×{{ currentLayer.image_height }}</span>
        <span>相机数量: {{ layerCameras.length }}</span>
      </div>
      
      <div class="map-wrapper" ref="mapWrapper">
        <div 
          class="map-canvas"
          ref="mapCanvas"
          :style="{ 
            width: canvasSize.width + 'px',
            height: canvasSize.height + 'px',
            transform: `scale(${zoomLevel})`,
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
            @load="onImageLoad"
            @error="onImageError"
            draggable="false"
          />
          
          <!-- 相机图标 -->
          <div
            v-for="camera in layerCameras"
            :key="camera.id"
            class="camera-marker"
            :class="{ 
              'selected': selectedCameraId === camera.id,
              'dragging': draggingCameraId === camera.id
            }"
            :style="{
              left: camera.position_x + 'px',
              top: camera.position_y + 'px',
              transform: camera.camera_angle ? `rotate(${camera.camera_angle}deg)` : 'none'
            }"
            @click.stop="selectCamera(camera)"
            @mousedown="startDrag(camera, $event)"
          >
            <el-icon class="camera-icon">
              <VideoCamera />
            </el-icon>
            <div class="camera-label">{{ camera.camera_name }}</div>
            <div 
              v-if="camera.is_online === 1" 
              class="online-indicator"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- 缩放控制 -->
      <div class="zoom-controls">
        <el-button-group class="tech-button-group">
          <el-button class="tech-button-secondary" :icon="ZoomIn" @click="zoomIn" />
          <el-button class="tech-button-secondary" @click="resetZoom">{{ Math.round(zoomLevel * 100) }}%</el-button>
          <el-button class="tech-button-secondary" :icon="ZoomOut" @click="zoomOut" />
        </el-button-group>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-else description="请选择图层查看地图配置" />

    <!-- 相机信息面板 -->
    <div v-if="selectedCamera" class="camera-panel">
      <div class="panel-header">
        <h4>相机信息</h4>
        <el-button type="text" class="tech-button-text" @click="clearSelection">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      <div class="panel-content">
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
        @row-click="selectUnboundCamera"
        highlight-current-row
      >
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
            :disabled="!selectedUnboundCamera"
          >
            确认添加
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
  Search 
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
    const selectedUnboundCamera = ref(null)
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

    // 计算属性
    const selectedCamera = computed(() => {
      return layerCameras.value.find(camera => camera.id === selectedCameraId.value)
    })
    
    const filteredUnboundCameras = computed(() => {
      if (!cameraSearchKeyword.value) return unboundCameras.value
      const keyword = cameraSearchKeyword.value.toLowerCase()
      return unboundCameras.value.filter(camera => 
        camera.camera_name.toLowerCase().includes(keyword) ||
        camera.camera_code.toLowerCase().includes(keyword)
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
      }
    }

    // 加载图层相机
    const loadLayerCameras = async (layerId) => {
      try {
        const response = await getLayerCameras(layerId)
        if (response.code === 200) {
          // 确保 layerCameras 总是一个数组
          layerCameras.value = Array.isArray(response.data) ? response.data : []
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
      
      const camera = layerCameras.value.find(c => c.id === draggingCameraId.value)
      if (camera) {
        camera.position_x = Math.max(0, Math.min(Math.round(x - dragState.offsetX), canvasSize.width))
        camera.position_y = Math.max(0, Math.min(Math.round(y - dragState.offsetY), canvasSize.height))
        hasChanges.value = true
      }
    }

    // 选择相机
    const selectCamera = (camera) => {
      selectedCameraId.value = camera.id
    }

    // 清除选择
    const clearSelection = () => {
      selectedCameraId.value = null
    }

    // 开始拖拽
    const startDrag = (camera, event) => {
      event.preventDefault()
      draggingCameraId.value = camera.id
      selectedCameraId.value = camera.id
      
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
      
      // 移除全局事件监听
      document.removeEventListener('mousemove', handleDocumentMouseMove)
      document.removeEventListener('mouseup', stopDrag)
    }

    // 显示添加相机对话框
    const showAddCameraDialog = async () => {
      await loadUnboundCameras()
      addCameraVisible.value = true
      cameraSearchKeyword.value = ''
      selectedUnboundCamera.value = null
    }

    // 过滤未绑定相机
    const filterUnboundCameras = () => {
      // 计算属性会自动处理过滤
    }

    // 选择未绑定相机
    const selectUnboundCamera = (camera) => {
      selectedUnboundCamera.value = camera
    }

    // 确认添加相机
    const confirmAddCamera = async () => {
      if (!selectedUnboundCamera.value || !selectedLayerId.value) return
      
      // 默认放在图片中心
      const centerX = Math.floor(canvasSize.width / 2)
      const centerY = Math.floor(canvasSize.height / 2)
      
      try {
        await addCameraToLayer(selectedLayerId.value, {
          camera_id: selectedUnboundCamera.value.id,
          position_x: centerX,
          position_y: centerY,
          camera_angle: 0
        })
        
        ElMessage.success('相机添加成功')
        addCameraVisible.value = false
        await loadLayerCameras(selectedLayerId.value)
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
        await updateCameraPosition(selectedLayerId.value, selectedCamera.value.id, {
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
        const cameras = layerCameras.value.map(camera => ({
          camera_id: camera.id,
          position_x: camera.position_x,
          position_y: camera.position_y,
          camera_angle: camera.camera_angle || 0
        }))
        
        // 使用批量更新接口
        await batchUpdateCameraPositions(selectedLayerId.value, { cameras })
        
        ElMessage.success('位置保存成功')
        hasChanges.value = false
      } catch (error) {
        ElMessage.error('保存位置失败: ' + (error.message || '未知错误'))
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
          await removeCameraFromLayer(selectedLayerId.value, selectedCamera.value.id)
          ElMessage.success('相机移除成功')
          await loadLayerCameras(selectedLayerId.value)
          clearSelection()
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
      selectedUnboundCamera,
      hasChanges,
      mapWrapper,
      mapCanvas,
      zoomLevel,
      canvasSize,
      positionForm,
      selectedCamera,
      filteredUnboundCameras,
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
      selectUnboundCamera,
      confirmAddCamera,
      editCameraPosition,
      confirmEditPosition,
      savePositions,
      removeCameraFromLayerAction,
      refreshData
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
  background: #f5f7fa;
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
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
  font-size: 14px;
  color: #606266;
}

.map-wrapper {
  flex: 1;
  position: relative;
  overflow: auto;
  background: #f0f0f0;
  padding: 20px;
}

.map-canvas {
  position: relative;
  margin: 0 auto;
  cursor: crosshair;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.map-background {
  width: 100%;
  height: 100%;
  display: block;
  user-select: none;
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

/* 缩放按钮组间距 */
.zoom-controls .el-button-group .el-button + .el-button {
  margin-left: 0 !important;
  border-left: 1px solid rgba(128, 128, 128, 0.4) !important;
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
</style>
