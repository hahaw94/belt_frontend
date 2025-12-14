<template>
  <div class="layer-management">
    <!-- 操作工具栏 -->
    <div class="toolbar">
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchForm.layer_name"
          :placeholder="$t('map.searchLayerName')"
          clearable
          style="width: 250px;"
          class="tech-input"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="searchForm.status"
          :placeholder="$t('map.status')"
          clearable
          style="width: 120px; margin-left: 10px;"
          class="tech-select"
          @change="handleSearch"
        >
          <el-option :label="$t('map.enabled')" :value="1" />
          <el-option :label="$t('map.disabled')" :value="0" />
        </el-select>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" class="tech-button" :icon="Plus" @click="showCreateDialog">{{ $t('map.createLayer') }}</el-button>
        <el-button type="info" class="tech-button-info" :icon="Refresh" @click="refreshLayers">{{ $t('common.refresh') }}</el-button>
      </div>
    </div>

    <!-- 图层列表 -->
    <div class="table-container">
      <el-table
        :data="layerList"
        v-loading="loading"
        stripe
        style="width: 100%; min-width: 1500px;"
        class="layer-table"
        :scroll-x="true"
      >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="layer_name" :label="$t('map.layerName')" min-width="150" />
      <el-table-column prop="layer_description" :label="$t('map.description')" min-width="200" show-overflow-tooltip />
      <el-table-column :label="$t('map.layerPreview')" width="120">
        <template #default="scope">
          <el-image
            :src="scope.row.image_url"
            fit="cover"
            style="width: 80px; height: 60px; border-radius: 4px;"
            :preview-src-list="[scope.row.image_url]"
            preview-teleported
          >
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column :label="$t('map.dimensions')" width="120">
        <template #default="scope">
          {{ scope.row.image_width }}×{{ scope.row.image_height }}
        </template>
      </el-table-column>
      <el-table-column prop="camera_count" :label="$t('map.cameraCount')" width="100" />
      <el-table-column :label="$t('map.status')" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? $t('map.enabled') : $t('map.disabled') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" :label="$t('map.createTime')" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.create_time) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('map.operations')" width="300">
        <template #default="scope">
          <div class="action-buttons-container">
            <el-button type="text" size="small" class="tech-button-text" @click="viewLayer(scope.row)">{{ $t('common.view') }}</el-button>
            <el-button type="text" size="small" class="tech-button-text" @click="editLayer(scope.row)">{{ $t('common.edit') }}</el-button>
            <el-button type="text" size="small" class="tech-button-text tech-button-success" @click="applyToHomePage(scope.row)">{{ $t('map.applyToHomePage') }}</el-button>
            <el-button type="text" size="small" class="tech-button-text tech-button-danger" @click="deleteLayer(scope.row)">{{ $t('common.delete') }}</el-button>
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

    <!-- 新建/编辑图层对话框 -->
    <el-dialog
      :title="dialogForm.id ? $t('map.editLayer') : $t('map.createLayer')"
      v-model="dialogVisible"
      width="600px"
      @close="resetDialog"
    >
      <el-form
        ref="dialogFormRef"
        :model="dialogForm"
        :rules="dialogRules"
        label-width="100px"
      >
        <el-form-item :label="$t('map.layerName')" prop="layer_name">
          <el-input v-model="dialogForm.layer_name" :placeholder="$t('map.pleaseInputLayerName')" />
        </el-form-item>
        <el-form-item :label="$t('map.layerDescription')" prop="layer_description">
          <el-input
            v-model="dialogForm.layer_description"
            type="textarea"
            :rows="3"
            :placeholder="$t('map.pleaseInputLayerDescription')"
          />
        </el-form-item>
        <el-form-item v-if="!dialogForm.id" :label="$t('map.layerImage')" prop="file">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".png,.jpg,.jpeg,.gif"
            :before-upload="beforeUpload"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            drag
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              {{ $t('map.dragFileHere') }}<em>{{ $t('map.clickToUpload') }}</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                {{ $t('map.uploadTip') }}
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item v-if="dialogForm.id" :label="$t('map.status')" prop="status">
          <el-radio-group v-model="dialogForm.status">
            <el-radio :label="1">{{ $t('map.enabled') }}</el-radio>
            <el-radio :label="0">{{ $t('map.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="tech-button-secondary" @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" class="tech-button" @click="submitDialog" :loading="submitting">{{ $t('common.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 图层详情对话框 -->
    <el-dialog
      :title="$t('map.layerDetail')"
      v-model="detailVisible"
      width="800px"
    >
      <div v-if="currentLayer" class="layer-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('map.layerName')">{{ currentLayer.layer_name }}</el-descriptions-item>
          <el-descriptions-item :label="$t('map.status')">
            <el-tag :type="currentLayer.status === 1 ? 'success' : 'danger'">
              {{ currentLayer.status === 1 ? $t('map.enabled') : $t('map.disabled') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('map.imageDimensions')">{{ currentLayer.image_width }}×{{ currentLayer.image_height }}</el-descriptions-item>
          <el-descriptions-item :label="$t('map.cameraCount')">{{ currentLayer.camera_count }}</el-descriptions-item>
          <el-descriptions-item :label="$t('map.fileSize')">{{ formatFileSize(currentLayer.file_size) }}</el-descriptions-item>
          <el-descriptions-item :label="$t('map.fileType')">{{ currentLayer.file_type }}</el-descriptions-item>
          <el-descriptions-item :label="$t('map.createTime')" :span="2">{{ formatDate(currentLayer.create_time) }}</el-descriptions-item>
          <el-descriptions-item :label="$t('map.description')" :span="2">{{ currentLayer.layer_description || $t('map.noDescription') }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="layer-image">
          <h4>{{ $t('map.layerPreview') }}</h4>
          <el-image
            :src="currentLayer.image_url"
            fit="none"
            style="width: 100%; height: auto;"
            :preview-src-list="[currentLayer.image_url]"
            preview-teleported
          >
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
                <div>{{ $t('map.loadFailed') }}</div>
              </div>
            </template>
          </el-image>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Picture, UploadFilled, Plus, Refresh } from '@element-plus/icons-vue'
import { 
  getLayerList, 
  createLayer, 
  updateLayer, 
  deleteLayer as deleteLayerApi,
  getLayerById 
} from '@/api/map'

export default {
  name: 'LayerManagement',
  components: {
    Search,
    Picture,
    UploadFilled
  },
  setup() {
    // 响应式数据
    const loading = ref(false)
    const submitting = ref(false)
    const layerList = ref([])
    const currentLayer = ref(null)
    const dialogVisible = ref(false)
    const detailVisible = ref(false)
    const uploadRef = ref(null)
    const dialogFormRef = ref(null)

    const searchForm = reactive({
      layer_name: '',
      status: null
    })

    const pagination = reactive({
      page: 1,
      size: 10,
      total: 0
    })

    const dialogForm = reactive({
      id: null,
      layer_name: '',
      layer_description: '',
      status: 1,
      file: null
    })

    const dialogRules = {
      layer_name: [
        { required: true, message: '请输入图层名称', trigger: 'blur' },
        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
      ],
      file: [
        { required: true, message: '请上传图层图片', trigger: 'change' }
      ]
    }

    // 获取图层列表
    const loadLayers = async () => {
      loading.value = true
      try {
        const params = {
          page: pagination.page,
          size: pagination.size,
          ...searchForm
        }
        // 移除空值
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null) {
            delete params[key]
          }
        })

        const response = await getLayerList(params)
        if (response.code === 200) {
          // 确保 layerList 总是一个数组
          layerList.value = Array.isArray(response.data?.list) ? response.data.list : []
          pagination.total = response.data?.total || 0
        }
      } catch (error) {
        ElMessage.error('获取图层列表失败: ' + (error.message || '未知错误'))
      } finally {
        loading.value = false
      }
    }

    // 搜索处理
    const handleSearch = () => {
      pagination.page = 1
      loadLayers()
    }

    // 刷新
    const refreshLayers = () => {
      loadLayers()
    }

    // 分页处理
    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.page = 1
      loadLayers()
    }

    const handleCurrentChange = (page) => {
      pagination.page = page
      loadLayers()
    }

    // 显示新建对话框
    const showCreateDialog = () => {
      resetDialog()
      dialogVisible.value = true
    }

    // 编辑图层
    const editLayer = (layer) => {
      dialogForm.id = layer.id
      dialogForm.layer_name = layer.layer_name
      dialogForm.layer_description = layer.layer_description || ''
      dialogForm.status = layer.status
      dialogVisible.value = true
    }

    // 查看图层详情
    const viewLayer = async (layer) => {
      try {
        const response = await getLayerById(layer.id)
        if (response.code === 200) {
          currentLayer.value = response.data
          detailVisible.value = true
        }
      } catch (error) {
        ElMessage.error('获取图层详情失败: ' + (error.message || '未知错误'))
      }
    }

    // 应用图层到首页
    const applyToHomePage = (layer) => {
      ElMessageBox.confirm(
        `确定要将图层"${layer.layer_name}"应用到首页地图吗？`,
        '应用确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      ).then(() => {
        try {
          // 将图层信息保存到localStorage
          const homePageMapData = {
            imageUrl: layer.image_url,
            layerId: layer.id,
            layerName: layer.layer_name,
            imageWidth: layer.image_width,
            imageHeight: layer.image_height,
            appliedAt: new Date().toISOString()
          }
          localStorage.setItem('homePageMapLayer', JSON.stringify(homePageMapData))
          
          ElMessage.success(`已将图层"${layer.layer_name}"应用到首页`)
          
          // 发出自定义事件通知首页更新
          window.dispatchEvent(new CustomEvent('homePageMapUpdate', { detail: homePageMapData }))
        } catch (error) {
          ElMessage.error('应用失败: ' + (error.message || '未知错误'))
        }
      }).catch(() => {
        // 用户取消操作
      })
    }



    // 删除图层
    const deleteLayer = (layer) => {
      const message = layer.camera_count > 0 
        ? `图层"${layer.layer_name}"还有 ${layer.camera_count} 个关联的相机，是否强制删除？`
        : `确定要删除图层"${layer.layer_name}"吗？`
      
      ElMessageBox.confirm(message, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const force = layer.camera_count > 0
          await deleteLayerApi(layer.id, force)
          ElMessage.success('删除成功')
          loadLayers()
        } catch (error) {
          ElMessage.error('删除失败: ' + (error.message || '未知错误'))
        }
      })
    }

    // 文件上传前验证
    const beforeUpload = (file) => {
      const isValidType = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(file.type)
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isValidType) {
        ElMessage.error('只能上传 PNG/JPG/JPEG/GIF 格式的图片!')
        return false
      }
      if (!isLt10M) {
        ElMessage.error('图片大小不能超过 10MB!')
        return false
      }
      return false // 阻止自动上传
    }

    // 文件变化处理
    const handleFileChange = (file) => {
      dialogForm.file = file.raw
    }

    // 文件移除处理
    const handleFileRemove = () => {
      dialogForm.file = null
    }

    // 提交对话框
    const submitDialog = async () => {
      try {
        await dialogFormRef.value.validate()
        submitting.value = true

        if (dialogForm.id) {
          // 编辑图层
          const data = {
            layer_name: dialogForm.layer_name,
            layer_description: dialogForm.layer_description,
            status: dialogForm.status
          }
          await updateLayer(dialogForm.id, data)
          ElMessage.success('更新成功')
        } else {
          // 新建图层
          const formData = new FormData()
          formData.append('layer_name', dialogForm.layer_name)
          if (dialogForm.layer_description) {
            formData.append('layer_description', dialogForm.layer_description)
          }
          formData.append('file', dialogForm.file)

          await createLayer(formData)
          ElMessage.success('创建成功')
        }

        dialogVisible.value = false
        loadLayers()
      } catch (error) {
        ElMessage.error('操作失败: ' + (error.message || '未知错误'))
      } finally {
        submitting.value = false
      }
    }

    // 重置对话框
    const resetDialog = () => {
      dialogForm.id = null
      dialogForm.layer_name = ''
      dialogForm.layer_description = ''
      dialogForm.status = 1
      dialogForm.file = null
      if (uploadRef.value) {
        uploadRef.value.clearFiles()
      }
      if (dialogFormRef.value) {
        dialogFormRef.value.resetFields()
      }
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleString('zh-CN')
    }

    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (!bytes) return '-'
      const units = ['B', 'KB', 'MB', 'GB']
      let size = bytes
      let unitIndex = 0
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      return `${size.toFixed(1)} ${units[unitIndex]}`
    }

    onMounted(() => {
      loadLayers()
    })

    return {
      loading,
      submitting,
      layerList,
      currentLayer,
      dialogVisible,
      detailVisible,
      uploadRef,
      dialogFormRef,
      searchForm,
      pagination,
      dialogForm,
      dialogRules,
      loadLayers,
      handleSearch,
      refreshLayers,
      handleSizeChange,
      handleCurrentChange,
      showCreateDialog,
      editLayer,
      viewLayer,
      applyToHomePage,
      deleteLayer,
      beforeUpload,
      handleFileChange,
      handleFileRemove,
      submitDialog,
      resetDialog,
      formatDate,
      formatFileSize,
      Plus,
      Refresh
    }
  }
}
</script>

<style scoped>
.layer-management {
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

.layer-table {
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
:deep(.layer-table.el-table) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: none !important;
  border-radius: 0 !important;
}

/* 强制去除表格的所有白色背景和边框 */
:deep(.layer-table.el-table),
:deep(.layer-table.el-table *) {
  background-color: transparent !important;
  background: transparent !important;
}

:deep(.layer-table.el-table) {
  background: rgba(0, 20, 40, 0.6) !important;
}

/* 去除表格底部和边框的白线 */
:deep(.layer-table.el-table::before),
:deep(.layer-table.el-table::after) {
  display: none !important;
  content: none !important;
  border: none !important;
  background: none !important;
}

:deep(.layer-table .el-table__inner-wrapper) {
  background: transparent !important;
  border: none !important;
}

:deep(.layer-table .el-table__inner-wrapper::before),
:deep(.layer-table .el-table__inner-wrapper::after) {
  display: none !important;
  content: none !important;
  border: none !important;
  background: none !important;
}

:deep(.layer-table .el-table__header-wrapper) {
  background: rgba(0, 30, 60, 0.8) !important;
  border: none !important;
}

:deep(.layer-table .el-table__header-wrapper::before),
:deep(.layer-table .el-table__header-wrapper::after) {
  display: none !important;
  content: none !important;
  border: none !important;
  background: none !important;
}

/* 去除表格左右边框和底部边框 */
:deep(.layer-table .el-table__body),
:deep(.layer-table .el-table__header),
:deep(.layer-table .el-table__body-wrapper),
:deep(.layer-table .el-table__header-wrapper) {
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  background: transparent !important;
}

/* 强制移除所有可能的边框元素 */
:deep(.layer-table) {
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-left: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-right: 1px solid rgba(0, 255, 255, 0.3) !important;
  box-sizing: border-box !important;
  position: relative !important;
}

/* 去除表格滚动条区域的白色背景 */
:deep(.layer-table .el-scrollbar) {
  background: transparent !important;
}

:deep(.layer-table .el-scrollbar__wrap) {
  background: transparent !important;
}

:deep(.layer-table .el-scrollbar__view) {
  background: transparent !important;
}

:deep(.layer-table .el-table__header th) {
  background: rgba(0, 30, 60, 0.8) !important;
  color: #00ffff !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
  font-weight: 500 !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3) !important;
}

:deep(.layer-table .el-table__header th:last-child) {
  border-right: none !important;
}

:deep(.layer-table .el-table__body-wrapper) {
  background: transparent !important;
}

:deep(.layer-table .el-table__body tr) {
  background: transparent !important;
}

:deep(.layer-table .el-table__body tr:nth-child(even)) {
  background: rgba(0, 255, 255, 0.02) !important;
}

:deep(.layer-table .el-table__body tr:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.layer-table .el-table__body td) {
  background: transparent !important;
  color: #ffffff !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1) !important;
  border-right: 1px solid rgba(0, 255, 255, 0.05) !important;
}

:deep(.layer-table .el-table__body td:last-child) {
  border-right: none !important;
}

/* 表格内的标签样式 */
:deep(.layer-table .el-tag) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #00ffff !important;
}

:deep(.layer-table .el-tag.el-tag--success) {
  background: rgba(103, 194, 58, 0.1) !important;
  border-color: rgba(103, 194, 58, 0.3) !important;
  color: #67c23a !important;
}

:deep(.layer-table .el-tag.el-tag--danger) {
  background: rgba(255, 82, 82, 0.1) !important;
  border-color: rgba(255, 82, 82, 0.3) !important;
  color: #ff5252 !important;
}

/* 表格加载状态样式 */
:deep(.layer-table .el-loading-mask) {
  background: rgba(0, 20, 40, 0.8) !important;
}

:deep(.layer-table .el-loading-spinner .el-loading-text) {
  color: #00ffff !important;
}

/* 表格空状态样式 */
:deep(.layer-table .el-table__empty-block) {
  background: rgba(0, 20, 40, 0.3) !important;
}

:deep(.layer-table .el-table__empty-text) {
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
:deep(.layer-table .action-buttons-container) {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: nowrap;
  min-width: 200px;
}

.image-slot {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: rgba(0, 20, 40, 0.4);
  color: #909399;
  font-size: 14px;
}

.layer-detail {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 0 20px 0;
  background: transparent;
}

/* 图层详情滚动条样式 */
.layer-detail::-webkit-scrollbar {
  width: 8px;
}

.layer-detail::-webkit-scrollbar-track {
  background: rgba(0, 20, 40, 0.3);
  border-radius: 4px;
}

.layer-detail::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.4);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.layer-detail::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.6);
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}

.layer-detail::-webkit-scrollbar-thumb:active {
  background: rgba(0, 255, 255, 0.8);
}

.dialog-footer {
  text-align: right;
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
    order: -1; /* 在移动端将按钮放在搜索框上方 */
  }
}
/* ==================== 间距优化 ==================== */

/* 按钮间距 */
.toolbar .el-button + .el-button {
  margin-left: 16px !important;
}

/* 表格行间距 */
:deep(.el-table .el-table__row) {
  height: 50px !important;
}

/* 表格内按钮间距 */
:deep(.el-table .el-button + .el-button) {
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
/* 使用用户管理中成功的方法 */
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

/* 文件上传组件样式 */
:deep(.el-upload) {
  border: 1px dashed rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 20, 40, 0.6) !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

:deep(.el-upload:hover) {
  border-color: rgba(0, 255, 255, 0.6) !important;
  background: rgba(0, 20, 40, 0.8) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-upload-dragger) {
  background: transparent !important;
  border: none !important;
  color: #ffffff !important;
}

:deep(.el-upload-dragger:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-upload__text) {
  color: #ffffff !important;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3) !important;
}

:deep(.el-upload__text em) {
  color: #00ffff !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-upload__tip) {
  color: rgba(255, 255, 255, 0.7) !important;
  text-shadow: 0 0 3px rgba(255, 255, 255, 0.2) !important;
}

:deep(.el-icon--upload) {
  color: #00ffff !important;
  filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.4)) !important;
}

/* 图层详情对话框样式 */
:deep(.el-descriptions) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  overflow: hidden;
}

:deep(.el-descriptions__header) {
  background: rgba(0, 30, 60, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-descriptions__body) {
  background: transparent !important;
}

:deep(.el-descriptions__table) {
  background: transparent !important;
  border: none !important;
}

:deep(.el-descriptions__cell) {
  background: transparent !important;
  border: 1px solid rgba(0, 255, 255, 0.1) !important;
  color: #ffffff !important;
  padding: 12px 16px !important;
}

:deep(.el-descriptions__label) {
  background: rgba(0, 30, 60, 0.6) !important;
  color: #00ffff !important;
  font-weight: 500 !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-descriptions__content) {
  background: rgba(0, 20, 40, 0.4) !important;
  color: #ffffff !important;
  text-shadow: 0 0 3px rgba(255, 255, 255, 0.2) !important;
}

/* 图层预览容器和标题样式 */
.layer-image {
  margin-top: 20px !important;
  margin-bottom: 20px !important;
  padding-bottom: 20px !important;
}

.layer-image h4 {
  color: #00ffff !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
  margin-bottom: 16px !important;
  font-weight: 600 !important;
}

/* 图片容器样式优化 */
:deep(.el-image) {
  border-radius: 8px !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  overflow: visible !important;
  background: rgba(0, 20, 40, 0.3) !important;
  width: 100% !important;
  height: auto !important;
  max-width: none !important;
  max-height: none !important;
}

:deep(.el-image img) {
  border-radius: 8px !important;
  width: 100% !important;
  height: auto !important;
  max-width: 100% !important;
  object-fit: scale-down !important;
  display: block !important;
  margin: 0 auto !important;
}

/* 标签样式 */
:deep(.el-tag) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #00ffff !important;
}

:deep(.el-tag.el-tag--success) {
  background: rgba(0, 255, 0, 0.1) !important;
  border-color: rgba(0, 255, 0, 0.3) !important;
  color: #00ff00 !important;
}

:deep(.el-tag.el-tag--danger) {
  background: rgba(255, 0, 0, 0.1) !important;
  border-color: rgba(255, 0, 0, 0.3) !important;
  color: #ff0000 !important;
}

/* "应用于首页"按钮样式 */
:deep(.tech-button-text.tech-button-success) {
  color: #00ff88 !important;
  text-shadow: 0 0 5px rgba(0, 255, 136, 0.4) !important;
}

:deep(.tech-button-text.tech-button-success:hover) {
  color: #00ffaa !important;
  text-shadow: 0 0 8px rgba(0, 255, 136, 0.6) !important;
}
</style>
