<template>
  <div class="layer-management">
    <!-- 操作工具栏 -->
    <div class="toolbar">
      <el-button type="primary" class="tech-button" :icon="Plus" @click="showCreateDialog">新建图层</el-button>
      <el-button type="info" class="tech-button-info" :icon="Refresh" @click="refreshLayers">刷新</el-button>
      
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchForm.layer_name"
          placeholder="搜索图层名称"
          clearable
          style="width: 250px;"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="searchForm.status"
          placeholder="状态"
          clearable
          style="width: 120px; margin-left: 10px;"
          @change="handleSearch"
        >
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </div>
    </div>

    <!-- 图层列表 -->
    <el-table
      :data="layerList"
      v-loading="loading"
      stripe
      style="width: 100%"
      class="layer-table"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="layer_name" label="图层名称" min-width="150" />
      <el-table-column prop="layer_description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column label="图层预览" width="120">
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
      <el-table-column label="尺寸" width="120">
        <template #default="scope">
          {{ scope.row.image_width }}×{{ scope.row.image_height }}
        </template>
      </el-table-column>
      <el-table-column prop="camera_count" label="相机数量" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.create_time) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="text" size="small" class="tech-button-text" @click="viewLayer(scope.row)">查看</el-button>
          <el-button type="text" size="small" class="tech-button-text" @click="editLayer(scope.row)">编辑</el-button>
          <el-button type="text" size="small" class="tech-button-text tech-button-info" @click="configCameras(scope.row)">配置相机</el-button>
          <el-button type="text" size="small" class="tech-button-text tech-button-danger" @click="deleteLayer(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

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
      :title="dialogForm.id ? '编辑图层' : '新建图层'"
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
        <el-form-item label="图层名称" prop="layer_name">
          <el-input v-model="dialogForm.layer_name" placeholder="请输入图层名称" />
        </el-form-item>
        <el-form-item label="图层描述" prop="layer_description">
          <el-input
            v-model="dialogForm.layer_description"
            type="textarea"
            :rows="3"
            placeholder="请输入图层描述"
          />
        </el-form-item>
        <el-form-item v-if="!dialogForm.id" label="图层图片" prop="file">
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
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持PNG、JPG、JPEG、GIF格式，文件大小不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item v-if="dialogForm.id" label="状态" prop="status">
          <el-radio-group v-model="dialogForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="tech-button-secondary" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" class="tech-button" @click="submitDialog" :loading="submitting">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 图层详情对话框 -->
    <el-dialog
      title="图层详情"
      v-model="detailVisible"
      width="800px"
    >
      <div v-if="currentLayer" class="layer-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="图层名称">{{ currentLayer.layer_name }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentLayer.status === 1 ? 'success' : 'danger'">
              {{ currentLayer.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="图片尺寸">{{ currentLayer.image_width }}×{{ currentLayer.image_height }}</el-descriptions-item>
          <el-descriptions-item label="相机数量">{{ currentLayer.camera_count }}</el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ formatFileSize(currentLayer.file_size) }}</el-descriptions-item>
          <el-descriptions-item label="文件类型">{{ currentLayer.file_type }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ formatDate(currentLayer.create_time) }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentLayer.layer_description || '暂无描述' }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="layer-image" style="margin-top: 20px;">
          <h4>图层预览</h4>
          <el-image
            :src="currentLayer.image_url"
            fit="contain"
            style="width: 100%; max-height: 400px;"
            :preview-src-list="[currentLayer.image_url]"
            preview-teleported
          >
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
                <div>加载失败</div>
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
import { Search, Picture, UploadFilled } from '@element-plus/icons-vue'
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

    // 配置相机
    const configCameras = () => {
      // 切换到地图配置标签页并传递图层信息
      ElMessage.info('功能开发中，敬请期待')
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
      configCameras,
      deleteLayer,
      beforeUpload,
      handleFileChange,
      handleFileRemove,
      submitDialog,
      resetDialog,
      formatDate,
      formatFileSize
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

.layer-table {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.image-slot {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 14px;
}

.layer-detail {
  max-height: 600px;
  overflow-y: auto;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    justify-content: center;
    flex-wrap: wrap;
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
</style>
