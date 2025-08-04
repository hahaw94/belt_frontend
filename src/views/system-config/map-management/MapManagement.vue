<template>
  <div class="map-management-container sub-page-content">
    <h2>地图管理</h2>

    <!-- 地图背景管理 -->
    <el-card class="background-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>地图背景管理</span>
          <div>
            <el-button type="primary" :icon="Upload" size="small" @click="uploadDialogVisible = true">上传背景</el-button>
            <el-button type="info" :icon="Refresh" size="small" @click="getMapConfig" :loading="configLoading">刷新</el-button>
          </div>
        </div>
      </template>
      <div class="background-content" v-loading="configLoading">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="background-info">
              <h4>当前背景信息</h4>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="背景图片">
                  {{ mapConfig.background_image ? '已上传' : '未上传' }}
                </el-descriptions-item>
                <el-descriptions-item label="图片尺寸">
                  {{ mapConfig.width }}x{{ mapConfig.height }}
                </el-descriptions-item>
                <el-descriptions-item label="摄像头数量">
                  {{ mapConfig.camera_positions?.length || 0 }} 个
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>
          <el-col :span="16">
            <div class="background-preview">
              <h4>背景预览</h4>
              <div class="preview-container">
                <img 
                  v-if="mapConfig.background_image" 
                  :src="mapConfig.background_image" 
                  class="background-image"
                  @load="onImageLoad"
                  @error="onImageError"
                />
                <div v-else class="no-background">
                  <el-icon class="no-bg-icon"><Picture /></el-icon>
                  <p>暂无背景图片</p>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 摄像机点位编辑 -->
    <el-card class="position-editor-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>摄像机点位编辑</span>
          <div>
            <el-button type="success" :icon="Download" size="small" @click="exportPositions" :disabled="!hasPositions">导出点位</el-button>
            <el-button type="warning" :icon="Upload" size="small" @click="importDialogVisible = true">导入点位</el-button>
            <el-button type="primary" :icon="Check" size="small" @click="savePositions" :loading="saveLoading" :disabled="!hasChanges">保存更改</el-button>
          </div>
        </div>
      </template>
      <div class="position-editor-content">
        <el-alert
          v-if="!mapConfig.background_image"
          title="提示"
          type="info"
          description="请先上传地图背景图片，然后才能编辑摄像机点位。"
          show-icon
          :closable="false"
          class="mb-20">
        </el-alert>
        
        <div v-else class="editor-container">
          <div class="editor-toolbar">
            <el-button-group>
              <el-button :type="editMode === 'select' ? 'primary' : ''" :icon="Pointer" @click="setEditMode('select')">
                选择模式
              </el-button>
              <el-button :type="editMode === 'add' ? 'primary' : ''" :icon="Plus" @click="setEditMode('add')">
                添加点位
              </el-button>
              <el-button :type="editMode === 'delete' ? 'danger' : ''" :icon="Delete" @click="setEditMode('delete')">
                删除点位
              </el-button>
            </el-button-group>
            <el-divider direction="vertical"></el-divider>
            <span class="toolbar-info">当前模式: {{ editModeText }}</span>
            <el-divider direction="vertical"></el-divider>
            <span class="toolbar-info">摄像头数量: {{ cameraPositions.length }}</span>
          </div>
          
          <div class="map-editor" ref="mapEditorRef">
            <div 
              class="map-canvas" 
              :style="canvasStyle"
              @click="handleCanvasClick"
              @mousemove="handleMouseMove">
              <img 
                :src="mapConfig.background_image" 
                class="map-background"
                @load="initMapEditor"
                draggable="false"
              />
              
              <!-- 摄像机点位 -->
              <div 
                v-for="(camera, index) in cameraPositions" 
                :key="camera.device_id || index"
                class="camera-point"
                :class="{ 
                  'selected': selectedCameraIndex === index,
                  'dragging': draggingIndex === index 
                }"
                :style="getCameraStyle(camera)"
                @click.stop="selectCamera(index)"
                @mousedown="startDrag(index, $event)">
                <el-icon class="camera-icon"><VideoCamera /></el-icon>
                <div class="camera-label">{{ camera.device_name || `摄像头${index + 1}` }}</div>
              </div>
              
              <!-- 鼠标悬停预览 -->
              <div 
                v-if="editMode === 'add' && hoverPosition"
                class="camera-point preview"
                :style="getHoverStyle()">
                <el-icon class="camera-icon"><VideoCamera /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 摄像机列表 -->
    <el-card class="camera-list-card" shadow="hover" v-if="hasPositions">
      <template #header>
        <div class="card-header">
          <span>摄像机点位列表</span>
          <el-tag type="info">{{ cameraPositions.length }} 个点位</el-tag>
        </div>
      </template>
      <el-table :data="cameraPositions" border stripe>
        <el-table-column prop="device_id" label="设备ID" width="100" align="center"></el-table-column>
        <el-table-column prop="device_name" label="设备名称" min-width="150"></el-table-column>
        <el-table-column label="位置坐标" width="150" align="center">
          <template #default="{ row }">
            ({{ Math.round(row.x) }}, {{ Math.round(row.y) }})
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '在线' ? 'success' : 'danger'" size="small">
              {{ row.status || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ $index }">
            <el-button type="primary" :icon="Edit" size="small" @click="editCamera($index)">编辑</el-button>
            <el-button type="danger" :icon="Delete" size="small" @click="deleteCamera($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 上传背景对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传地图背景" width="500px">
      <el-upload
        class="upload-demo"
        drag
        :action="uploadUrl"
        :headers="uploadHeaders"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        accept=".png,.jpg,.jpeg,.bmp"
        :limit="1"
        :auto-upload="false"
        ref="uploadRef">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将图片拖拽至此 或 <em>点击选择图片</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 PNG、JPG、JPEG、BMP 格式，建议尺寸不超过 4096x4096，文件大小不超过 20MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpload" :loading="uploadLoading">
            上传背景
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入点位对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入点位配置" width="500px">
      <el-upload
        class="upload-demo"
        drag
        :action="importUrl"
        :headers="uploadHeaders"
        :on-success="handleImportSuccess"
        :on-error="handleImportError"
        :before-upload="beforeImportUpload"
        accept=".json,.xml"
        :limit="1"
        :auto-upload="false"
        ref="importRef">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将配置文件拖拽至此 或 <em>点击选择文件</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 JSON、XML 格式的点位配置文件
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitImport" :loading="importLoading">
            导入配置
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑摄像机对话框 -->
    <el-dialog v-model="editCameraVisible" title="编辑摄像机信息" width="400px">
      <el-form :model="editingCamera" label-width="100px">
        <el-form-item label="设备ID">
          <el-input v-model="editingCamera.device_id" placeholder="请输入设备ID"></el-input>
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input v-model="editingCamera.device_name" placeholder="请输入设备名称"></el-input>
        </el-form-item>
        <el-form-item label="X坐标">
          <el-input-number v-model="editingCamera.x" :min="0" :max="mapConfig.width" controls-position="right"></el-input-number>
        </el-form-item>
        <el-form-item label="Y坐标">
          <el-input-number v-model="editingCamera.y" :min="0" :max="mapConfig.height" controls-position="right"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editingCamera.status" placeholder="请选择状态">
            <el-option label="在线" value="在线"></el-option>
            <el-option label="离线" value="离线"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editCameraVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEditCamera">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Upload, Refresh, Download, Check, Plus, Delete, Edit, 
  Pointer, VideoCamera, Picture, UploadFilled 
} from '@element-plus/icons-vue'
import { systemApi } from '@/api/system'

// 响应式数据
const configLoading = ref(false)
const saveLoading = ref(false)
const uploadLoading = ref(false)
const importLoading = ref(false)
const uploadDialogVisible = ref(false)
const importDialogVisible = ref(false)
const editCameraVisible = ref(false)

const editMode = ref('select') // select, add, delete
const selectedCameraIndex = ref(-1)
const draggingIndex = ref(-1)
const hasChanges = ref(false)
const hoverPosition = ref(null)

// 表单引用
const uploadRef = ref()
const importRef = ref()
const mapEditorRef = ref()

// 地图配置
const mapConfig = reactive({
  background_image: '',
  width: 1920,
  height: 1080,
  camera_positions: []
})

// 摄像机点位数据
const cameraPositions = ref([])

// 编辑中的摄像机
const editingCamera = reactive({
  device_id: '',
  device_name: '',
  x: 0,
  y: 0,
  status: '在线'
})
const editingIndex = ref(-1)

// 拖拽相关
const isDragging = ref(false)
const dragStartPos = reactive({ x: 0, y: 0 })

// 计算属性
const editModeText = computed(() => {
  const modes = {
    select: '选择/移动点位',
    add: '点击添加点位',
    delete: '点击删除点位'
  }
  return modes[editMode.value] || '未知模式'
})

const hasPositions = computed(() => {
  return cameraPositions.value.length > 0
})

const canvasStyle = computed(() => {
  return {
    cursor: editMode.value === 'add' ? 'crosshair' : 
           editMode.value === 'delete' ? 'not-allowed' : 'default'
  }
})

const uploadUrl = computed(() => {
  return '/api/system/config/map/upload-background'
})

const importUrl = computed(() => {
  return '/api/system/config/map/import-positions'
})

const uploadHeaders = computed(() => {
  return {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})

// 生命周期
onMounted(() => {
  getMapConfig()
})

// 方法
const getMapConfig = async () => {
  try {
    configLoading.value = true
    const response = await systemApi.getMapConfig()
    if (response.data.success) {
      Object.assign(mapConfig, response.data.body)
      cameraPositions.value = [...(mapConfig.camera_positions || [])]
      hasChanges.value = false
    }
  } catch (error) {
    ElMessage.error('获取地图配置失败：' + error.message)
  } finally {
    configLoading.value = false
  }
}

const initMapEditor = () => {
  // 地图背景加载完成后的初始化
  nextTick(() => {
    if (mapEditorRef.value) {
      // 可以在这里添加地图编辑器的初始化逻辑
    }
  })
}

const setEditMode = (mode) => {
  editMode.value = mode
  selectedCameraIndex.value = -1
  hoverPosition.value = null
}

const handleCanvasClick = (event) => {
  if (editMode.value === 'add') {
    addCameraAtPosition(event)
  } else {
    selectedCameraIndex.value = -1
  }
}

const handleMouseMove = (event) => {
  if (editMode.value === 'add') {
    const rect = event.currentTarget.getBoundingClientRect()
    hoverPosition.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }
}

const addCameraAtPosition = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  const newCamera = {
    device_id: Date.now(),
    device_name: `摄像头${cameraPositions.value.length + 1}`,
    x: x,
    y: y,
    status: '在线'
  }
  
  cameraPositions.value.push(newCamera)
  hasChanges.value = true
  ElMessage.success('摄像机点位添加成功')
}

const selectCamera = (index) => {
  if (editMode.value === 'delete') {
    deleteCamera(index)
  } else {
    selectedCameraIndex.value = index
  }
}

const startDrag = (index, event) => {
  if (editMode.value !== 'select') return
  
  isDragging.value = true
  draggingIndex.value = index
  dragStartPos.x = event.clientX
  dragStartPos.y = event.clientY
  
  const handleMouseMove = (moveEvent) => {
    if (!isDragging.value) return
    
    const deltaX = moveEvent.clientX - dragStartPos.x
    const deltaY = moveEvent.clientY - dragStartPos.y
    
    const camera = cameraPositions.value[index]
    camera.x = Math.max(0, Math.min(mapConfig.width, camera.x + deltaX))
    camera.y = Math.max(0, Math.min(mapConfig.height, camera.y + deltaY))
    
    dragStartPos.x = moveEvent.clientX
    dragStartPos.y = moveEvent.clientY
    hasChanges.value = true
  }
  
  const handleMouseUp = () => {
    isDragging.value = false
    draggingIndex.value = -1
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const getCameraStyle = (camera) => {
  return {
    left: camera.x + 'px',
    top: camera.y + 'px'
  }
}

const getHoverStyle = () => {
  if (!hoverPosition.value) return {}
  return {
    left: hoverPosition.value.x + 'px',
    top: hoverPosition.value.y + 'px'
  }
}

const editCamera = (index) => {
  editingIndex.value = index
  const camera = cameraPositions.value[index]
  Object.assign(editingCamera, camera)
  editCameraVisible.value = true
}

const saveEditCamera = () => {
  if (editingIndex.value >= 0) {
    Object.assign(cameraPositions.value[editingIndex.value], editingCamera)
    hasChanges.value = true
    editCameraVisible.value = false
    ElMessage.success('摄像机信息更新成功')
  }
}

const deleteCamera = (index) => {
  ElMessageBox.confirm(
    '确认要删除这个摄像机点位吗？',
    '确认删除',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    cameraPositions.value.splice(index, 1)
    hasChanges.value = true
    selectedCameraIndex.value = -1
    ElMessage.success('摄像机点位删除成功')
  })
}

const savePositions = async () => {
  try {
    saveLoading.value = true
    const params = {
      positions: cameraPositions.value.map(camera => ({
        device_id: camera.device_id,
        x: Math.round(camera.x),
        y: Math.round(camera.y)
      }))
    }
    
    const response = await systemApi.updateCameraPositions(params)
    if (response.data.success) {
      ElMessage.success('摄像机点位保存成功')
      hasChanges.value = false
    }
  } catch (error) {
    ElMessage.error('保存点位失败：' + error.message)
  } finally {
    saveLoading.value = false
  }
}

const exportPositions = async () => {
  try {
    // 创建下载链接
    const blob = new Blob([JSON.stringify(cameraPositions.value, null, 2)], { 
      type: 'application/json' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `摄像机点位配置_${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('点位配置导出成功')
  } catch (error) {
    ElMessage.error('导出点位失败：' + error.message)
  }
}

const beforeUpload = (file) => {
  const isValidFormat = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'].includes(file.type)
  if (!isValidFormat) {
    ElMessage.error('只支持 PNG、JPG、JPEG、BMP 格式的图片')
    return false
  }
  
  const isLt20M = file.size / 1024 / 1024 < 20
  if (!isLt20M) {
    ElMessage.error('图片大小不能超过 20MB')
    return false
  }
  
  return true
}

const submitUpload = () => {
  uploadLoading.value = true
  uploadRef.value.submit()
}

const handleUploadSuccess = (response) => {
  uploadLoading.value = false
  uploadDialogVisible.value = false
  if (response.success) {
    ElMessage.success('地图背景上传成功')
    getMapConfig()
  } else {
    ElMessage.error('上传失败：' + response.message)
  }
}

const handleUploadError = (error) => {
  uploadLoading.value = false
  ElMessage.error('上传文件失败：' + error.message)
}

const beforeImportUpload = (file) => {
  const isValidFormat = ['application/json', 'text/xml', 'application/xml'].includes(file.type)
  if (!isValidFormat) {
    ElMessage.error('只支持 JSON、XML 格式的配置文件')
    return false
  }
  
  return true
}

const submitImport = () => {
  importLoading.value = true
  importRef.value.submit()
}

const handleImportSuccess = (response) => {
  importLoading.value = false
  importDialogVisible.value = false
  if (response.success) {
    ElMessage.success('点位配置导入成功')
    getMapConfig()
  } else {
    ElMessage.error('导入失败：' + response.message)
  }
}

const handleImportError = (error) => {
  importLoading.value = false
  ElMessage.error('导入文件失败：' + error.message)
}

const onImageLoad = () => {
  // 图片加载成功
}

const onImageError = () => {
  ElMessage.error('背景图片加载失败')
}
</script>

<style scoped>
.sub-page-content {
  min-height: calc(100vh - 140px);
  padding-bottom: 40px;
}

.map-management-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.background-content {
  padding: 10px 0;
}

.background-info h4,
.background-preview h4 {
  margin-bottom: 15px;
  color: #303133;
}

.preview-container {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.background-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.no-background {
  text-align: center;
  color: #999;
}

.no-bg-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.position-editor-content {
  padding: 10px 0;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.toolbar-info {
  font-size: 14px;
  color: #606266;
}

.map-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.map-canvas {
  position: relative;
  overflow: hidden;
}

.map-background {
  width: 100%;
  height: auto;
  display: block;
}

.camera-point {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s ease;
}

.camera-point:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.camera-point.selected {
  z-index: 20;
}

.camera-point.selected .camera-icon {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

.camera-point.dragging {
  z-index: 30;
  transform: translate(-50%, -50%) scale(1.2);
}

.camera-point.preview {
  opacity: 0.6;
  pointer-events: none;
}

.camera-icon {
  font-size: 24px;
  color: #67c23a;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.camera-label {
  margin-top: 4px;
  font-size: 12px;
  color: #303133;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
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

:deep(.el-alert) {
  margin-bottom: 20px;
}

:deep(.el-divider--vertical) {
  margin: 0 8px;
}
</style>