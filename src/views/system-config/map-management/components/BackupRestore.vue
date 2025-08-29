<template>
  <div class="backup-restore">
    <!-- 备份操作区域 -->
    <el-card class="backup-section" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>创建地图备份</span>
          <el-button type="primary" :icon="Plus" @click="showCreateBackupDialog">
            创建备份
          </el-button>
        </div>
      </template>
      
      <div class="backup-info">
        <el-alert
          title="地图备份说明"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>地图备份将包含以下内容：</p>
            <ul>
              <li>图层信息和图片文件</li>
              <li>相机设备信息</li>
              <li>相机与图层的绑定关系</li>
              <li>相机在图层上的位置坐标</li>
            </ul>
            <p>建议定期创建备份以保障数据安全。</p>
          </template>
        </el-alert>
      </div>
    </el-card>

    <!-- 备份列表区域 -->
    <el-card class="backup-list-section" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>备份文件列表</span>
          <el-button type="info" :icon="Refresh" @click="loadBackupList">
            刷新列表
          </el-button>
        </div>
      </template>
      
      <el-table
        :data="backupList"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="file_name" label="备份文件名" min-width="250" />
        <el-table-column label="备份类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'all' ? 'primary' : 'warning'">
              {{ scope.row.type === 'all' ? '全量备份' : '选择备份' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="file_size" label="文件大小" width="120">
          <template #default="scope">
            {{ formatFileSize(scope.row.file_size) }}
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="text" size="small" @click="downloadBackup(scope.row)">
              下载
            </el-button>
            <el-button type="text" size="small" @click="showRestoreDialog(scope.row)">
              恢复
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              @click="deleteBackup(scope.row)" 
              style="color: #f56c6c;"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="!loading && backupList.length === 0" description="暂无备份文件" />
    </el-card>

    <!-- 恢复操作区域 -->
    <el-card class="restore-section" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>从文件恢复</span>
          <el-button type="warning" :icon="Upload" @click="showUploadRestoreDialog">
            上传恢复
          </el-button>
        </div>
      </template>
      
      <div class="restore-info">
        <el-alert
          title="恢复操作说明"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>从备份文件恢复时，系统将：</p>
            <ul>
              <li>恢复备份中包含的所有图层和图片</li>
              <li>恢复相机设备信息（如果不存在）</li>
              <li>重新建立相机与图层的绑定关系</li>
              <li>恢复相机在图层上的准确位置</li>
            </ul>
            <p style="color: #e6a23c; font-weight: bold;">
              ⚠️ 恢复操作可能会覆盖现有的图层配置，请谨慎操作！
            </p>
          </template>
        </el-alert>
      </div>
    </el-card>

    <!-- 创建备份对话框 -->
    <el-dialog
      title="创建地图备份"
      v-model="createBackupVisible"
      width="500px"
      @close="resetCreateBackupForm"
    >
      <el-form
        ref="createBackupFormRef"
        :model="createBackupForm"
        :rules="createBackupRules"
        label-width="100px"
      >
        <el-form-item label="备份名称" prop="backup_name">
          <el-input v-model="createBackupForm.backup_name" placeholder="请输入备份名称" />
        </el-form-item>
        <el-form-item label="备份类型" prop="backup_type">
          <el-radio-group v-model="createBackupForm.backup_type" @change="handleBackupTypeChange">
            <el-radio label="all">全量备份（所有图层）</el-radio>
            <el-radio label="selected">选择备份（指定图层）</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item 
          v-if="createBackupForm.backup_type === 'selected'" 
          label="选择图层" 
          prop="layer_ids"
        >
          <el-select
            v-model="createBackupForm.layer_ids"
            multiple
            placeholder="请选择要备份的图层"
            style="width: 100%;"
          >
            <el-option
              v-for="layer in layerList"
              :key="layer.id"
              :label="layer.layer_name"
              :value="layer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备份描述" prop="description">
          <el-input
            v-model="createBackupForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入备份描述（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createBackupVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCreateBackup" :loading="creating">
            创建备份
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 恢复确认对话框 -->
    <el-dialog
      title="恢复备份确认"
      v-model="restoreVisible"
      width="500px"
    >
      <div v-if="selectedBackup" class="restore-confirm">
        <el-alert
          title="恢复操作确认"
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 20px;"
        >
          <template #default>
            <p>您即将恢复以下备份文件：</p>
            <p><strong>{{ selectedBackup.file_name }}</strong></p>
            <p>备份类型：{{ selectedBackup.type === 'all' ? '全量备份' : '选择备份' }}</p>
            <p>创建时间：{{ formatDate(selectedBackup.create_time) }}</p>
          </template>
        </el-alert>
        
        <el-form label-width="120px">
          <el-form-item label="强制覆盖：">
            <el-switch
              v-model="restoreForm.force_restore"
              active-text="是"
              inactive-text="否"
            />
            <div style="font-size: 12px; color: #909399; margin-top: 4px;">
              开启后将强制覆盖现有的同名图层配置
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="restoreVisible = false">取消</el-button>
          <el-button type="warning" @click="confirmRestore" :loading="restoring">
            确认恢复
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 上传恢复对话框 -->
    <el-dialog
      title="上传备份文件恢复"
      v-model="uploadRestoreVisible"
      width="500px"
      @close="resetUploadForm"
    >
      <el-form label-width="120px">
        <el-form-item label="备份文件：">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".tar.gz"
            :before-upload="beforeUpload"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            drag
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将地图备份文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 .tar.gz 格式的地图备份文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="强制覆盖：">
          <el-switch
            v-model="uploadRestoreForm.force_restore"
            active-text="是"
            inactive-text="否"
          />
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">
            开启后将强制覆盖现有的同名图层配置
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadRestoreVisible = false">取消</el-button>
          <el-button 
            type="warning" 
            @click="confirmUploadRestore" 
            :loading="uploading"
            :disabled="!uploadRestoreForm.file"
          >
            开始恢复
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  UploadFilled 
} from '@element-plus/icons-vue'
import { 
  createMapBackup,
  getMapBackupList,
  downloadMapBackup,
  restoreMapBackup,
  deleteMapBackup,
  getLayerList
} from '@/api/map'

export default {
  name: 'BackupRestore',
  components: {
    UploadFilled
  },
  setup() {
    // 响应式数据
    const loading = ref(false)
    const creating = ref(false)
    const restoring = ref(false)
    const uploading = ref(false)
    const backupList = ref([])
    const layerList = ref([])
    const selectedBackup = ref(null)
    
    const createBackupVisible = ref(false)
    const restoreVisible = ref(false)
    const uploadRestoreVisible = ref(false)
    
    const createBackupFormRef = ref(null)
    const uploadRef = ref(null)

    const createBackupForm = reactive({
      backup_name: '',
      backup_type: 'all',
      layer_ids: [],
      description: ''
    })

    const restoreForm = reactive({
      force_restore: false
    })

    const uploadRestoreForm = reactive({
      file: null,
      force_restore: false
    })

    const createBackupRules = {
      backup_name: [
        { required: true, message: '请输入备份名称', trigger: 'blur' },
        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
      ],
      backup_type: [
        { required: true, message: '请选择备份类型', trigger: 'change' }
      ],
      layer_ids: [
        { 
          validator: (rule, value, callback) => {
            if (createBackupForm.backup_type === 'selected' && (!value || value.length === 0)) {
              callback(new Error('请选择要备份的图层'))
            } else {
              callback()
            }
          }, 
          trigger: 'change' 
        }
      ]
    }

    // 加载备份列表
    const loadBackupList = async () => {
      loading.value = true
      try {
        const response = await getMapBackupList()
        if (response.code === 200) {
          // 确保 backupList 总是一个数组
          backupList.value = Array.isArray(response.data) ? response.data : []
        }
      } catch (error) {
        ElMessage.error('加载备份列表失败: ' + (error.message || '未知错误'))
      } finally {
        loading.value = false
      }
    }

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

    // 显示创建备份对话框
    const showCreateBackupDialog = async () => {
      await loadLayers()
      createBackupVisible.value = true
    }

    // 备份类型变化处理
    const handleBackupTypeChange = (type) => {
      if (type === 'all') {
        createBackupForm.layer_ids = []
      }
    }

    // 创建备份
    const confirmCreateBackup = async () => {
      try {
        await createBackupFormRef.value.validate()
        creating.value = true

        const data = {
          backup_name: createBackupForm.backup_name,
          backup_type: createBackupForm.backup_type,
          description: createBackupForm.description || null
        }

        if (createBackupForm.backup_type === 'selected') {
          data.layer_ids = createBackupForm.layer_ids
        }

        await createMapBackup(data)
        ElMessage.success('备份创建成功')
        createBackupVisible.value = false
        loadBackupList()
      } catch (error) {
        ElMessage.error('创建备份失败: ' + (error.message || '未知错误'))
      } finally {
        creating.value = false
      }
    }

    // 重置创建备份表单
    const resetCreateBackupForm = () => {
      createBackupForm.backup_name = ''
      createBackupForm.backup_type = 'all'
      createBackupForm.layer_ids = []
      createBackupForm.description = ''
      if (createBackupFormRef.value) {
        createBackupFormRef.value.resetFields()
      }
    }

    // 下载备份
    const downloadBackup = async (backup) => {
      try {
        const response = await downloadMapBackup(backup.file_name)
        
        // 创建下载链接
        const blob = new Blob([response], { type: 'application/gzip' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = backup.file_name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        ElMessage.success('下载完成')
      } catch (error) {
        ElMessage.error('下载失败: ' + (error.message || '未知错误'))
      }
    }

    // 显示恢复对话框
    const showRestoreDialog = (backup) => {
      selectedBackup.value = backup
      restoreForm.force_restore = false
      restoreVisible.value = true
    }

    // 确认恢复
    const confirmRestore = async () => {
      if (!selectedBackup.value) return
      
      try {
        restoring.value = true
        
        // 先下载备份文件，然后上传恢复
        const response = await downloadMapBackup(selectedBackup.value.file_name)
        const blob = new Blob([response], { type: 'application/gzip' })
        
        // 创建FormData对象进行恢复
        const formData = new FormData()
        formData.append('file', blob, selectedBackup.value.file_name)
        formData.append('force_restore', restoreForm.force_restore.toString())
        
        await restoreMapBackup(formData)
        
        ElMessage.success('恢复成功')
        restoreVisible.value = false
        loadBackupList()
      } catch (error) {
        ElMessage.error('恢复失败: ' + (error.message || '未知错误'))
      } finally {
        restoring.value = false
      }
    }

    // 删除备份
    const deleteBackup = (backup) => {
      ElMessageBox.confirm(
        `确定要删除备份文件"${backup.file_name}"吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          await deleteMapBackup(backup.file_name)
          ElMessage.success('删除成功')
          loadBackupList()
        } catch (error) {
          ElMessage.error('删除失败: ' + (error.message || '未知错误'))
        }
      })
    }

    // 显示上传恢复对话框
    const showUploadRestoreDialog = () => {
      uploadRestoreVisible.value = true
    }

    // 文件上传前验证
    const beforeUpload = (file) => {
      const isValidType = file.name.endsWith('.tar.gz')
      const isLt100M = file.size / 1024 / 1024 < 100

      if (!isValidType) {
        ElMessage.error('只能上传 .tar.gz 格式的备份文件!')
        return false
      }
      if (!isLt100M) {
        ElMessage.error('文件大小不能超过 100MB!')
        return false
      }
      return false // 阻止自动上传
    }

    // 文件变化处理
    const handleFileChange = (file) => {
      uploadRestoreForm.file = file.raw
    }

    // 文件移除处理
    const handleFileRemove = () => {
      uploadRestoreForm.file = null
    }

    // 确认上传恢复
    const confirmUploadRestore = async () => {
      if (!uploadRestoreForm.file) {
        ElMessage.warning('请选择备份文件')
        return
      }

      try {
        uploading.value = true
        
        const formData = new FormData()
        formData.append('file', uploadRestoreForm.file)
        formData.append('force_restore', uploadRestoreForm.force_restore.toString())
        
        await restoreMapBackup(formData)
        ElMessage.success('恢复成功')
        uploadRestoreVisible.value = false
        loadBackupList()
      } catch (error) {
        ElMessage.error('恢复失败: ' + (error.message || '未知错误'))
      } finally {
        uploading.value = false
      }
    }

    // 重置上传表单
    const resetUploadForm = () => {
      uploadRestoreForm.file = null
      uploadRestoreForm.force_restore = false
      if (uploadRef.value) {
        uploadRef.value.clearFiles()
      }
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

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleString('zh-CN')
    }

    onMounted(() => {
      loadBackupList()
    })

    return {
      loading,
      creating,
      restoring,
      uploading,
      backupList,
      layerList,
      selectedBackup,
      createBackupVisible,
      restoreVisible,
      uploadRestoreVisible,
      createBackupFormRef,
      uploadRef,
      createBackupForm,
      restoreForm,
      uploadRestoreForm,
      createBackupRules,
      loadBackupList,
      showCreateBackupDialog,
      handleBackupTypeChange,
      confirmCreateBackup,
      resetCreateBackupForm,
      downloadBackup,
      showRestoreDialog,
      confirmRestore,
      deleteBackup,
      showUploadRestoreDialog,
      beforeUpload,
      handleFileChange,
      handleFileRemove,
      confirmUploadRestore,
      resetUploadForm,
      formatFileSize,
      formatDate
    }
  }
}
</script>

<style scoped>
.backup-restore {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.backup-section,
.restore-section {
  flex-shrink: 0;
}

.backup-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.backup-list-section :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.backup-info,
.restore-info {
  margin: 0;
}

.backup-info ul,
.restore-info ul {
  margin: 10px 0;
  padding-left: 20px;
}

.backup-info li,
.restore-info li {
  margin: 5px 0;
}

.restore-confirm {
  margin: 0;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .backup-restore {
    gap: 15px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
}
</style>
