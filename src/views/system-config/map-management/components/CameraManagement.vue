<template>
  <div class="camera-management">
    <!-- 操作工具栏 -->
    <div class="toolbar">
      <el-button type="primary" class="tech-button" :icon="Plus" @click="showCreateDialog">新建相机</el-button>
      <el-button type="info" class="tech-button-info" :icon="Refresh" @click="refreshCameras">刷新</el-button>
      
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchForm.camera_name"
          placeholder="搜索相机名称"
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
        
        <el-select
          v-model="searchForm.is_bound"
          placeholder="绑定状态"
          clearable
          style="width: 120px; margin-left: 10px;"
          @change="handleSearch"
        >
          <el-option label="已绑定" :value="1" />
          <el-option label="未绑定" :value="0" />
        </el-select>
      </div>
    </div>

    <!-- 相机列表 -->
    <el-table
      :data="cameraList"
      v-loading="loading"
      stripe
      style="width: 100%"
      class="camera-table"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="camera_code" label="相机编码" min-width="120" />
      <el-table-column prop="camera_name" label="相机名称" min-width="150" />
      <el-table-column label="网络信息" min-width="200">
        <template #default="scope">
          <div>{{ scope.row.ip_address }}:{{ scope.row.port }}</div>
          <div style="color: #909399; font-size: 12px;">{{ scope.row.protocol }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="位置" min-width="150" show-overflow-tooltip />
      <el-table-column label="在线状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.is_online === 1 ? 'success' : 'danger'">
            {{ scope.row.is_online === 1 ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="绑定状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.is_bound === 1 ? 'warning' : 'info'">
            {{ scope.row.is_bound === 1 ? '已绑定' : '未绑定' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
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
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="scope">
          <el-button type="text" size="small" class="tech-button-text" @click="viewCamera(scope.row)">查看</el-button>
          <el-button type="text" size="small" class="tech-button-text" @click="editCamera(scope.row)">编辑</el-button>
          <el-button 
            type="text" 
            size="small" 
            class="tech-button-text tech-button-danger"
            @click="deleteCamera(scope.row)" 
            :disabled="scope.row.is_bound === 1"
          >
            删除
          </el-button>
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

    <!-- 新建/编辑相机对话框 -->
    <el-dialog
      :title="dialogForm.id ? '编辑相机' : '新建相机'"
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
        <el-form-item label="相机编码" prop="camera_code">
          <el-input 
            v-model="dialogForm.camera_code" 
            placeholder="请输入相机编码"
            :disabled="!!dialogForm.id"
          />
        </el-form-item>
        <el-form-item label="相机名称" prop="camera_name">
          <el-input v-model="dialogForm.camera_name" placeholder="请输入相机名称" />
        </el-form-item>
        <el-form-item label="IP地址" prop="ip_address">
          <el-input v-model="dialogForm.ip_address" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input-number
            v-model="dialogForm.port"
            :min="1"
            :max="65535"
            placeholder="请输入端口"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="协议" prop="protocol">
          <el-select v-model="dialogForm.protocol" placeholder="请选择协议" style="width: 100%;">
            <el-option label="RTSP" value="RTSP" />
            <el-option label="HTTP" value="HTTP" />
            <el-option label="GB28181" value="GB28181" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="dialogForm.username" placeholder="请输入用户名（可选）" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="dialogForm.password"
            type="password"
            placeholder="请输入密码（可选）"
            show-password
          />
        </el-form-item>
        <el-form-item label="位置描述" prop="location">
          <el-input v-model="dialogForm.location" placeholder="请输入位置描述（可选）" />
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

    <!-- 相机详情对话框 -->
    <el-dialog
      title="相机详情"
      v-model="detailVisible"
      width="600px"
    >
      <div v-if="currentCamera" class="camera-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="相机编码">{{ currentCamera.camera_code }}</el-descriptions-item>
          <el-descriptions-item label="相机名称">{{ currentCamera.camera_name }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ currentCamera.ip_address }}</el-descriptions-item>
          <el-descriptions-item label="端口">{{ currentCamera.port }}</el-descriptions-item>
          <el-descriptions-item label="协议">{{ currentCamera.protocol }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentCamera.username || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="在线状态">
            <el-tag :type="currentCamera.is_online === 1 ? 'success' : 'danger'">
              {{ currentCamera.is_online === 1 ? '在线' : '离线' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="绑定状态">
            <el-tag :type="currentCamera.is_bound === 1 ? 'warning' : 'info'">
              {{ currentCamera.is_bound === 1 ? '已绑定' : '未绑定' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentCamera.status === 1 ? 'success' : 'danger'">
              {{ currentCamera.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后心跳">
            {{ formatDate(currentCamera.last_heartbeat) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ formatDate(currentCamera.create_time) }}</el-descriptions-item>
          <el-descriptions-item label="位置描述" :span="2">{{ currentCamera.location || '暂无描述' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { 
  getCameraList, 
  createCamera, 
  updateCamera, 
  deleteCamera as deleteCameraApi,
  getCameraById 
} from '@/api/map'

export default {
  name: 'CameraManagement',
  components: {
    Search
  },
  setup() {
    // 响应式数据
    const loading = ref(false)
    const submitting = ref(false)
    const cameraList = ref([])
    const currentCamera = ref(null)
    const dialogVisible = ref(false)
    const detailVisible = ref(false)
    const dialogFormRef = ref(null)

    const searchForm = reactive({
      camera_name: '',
      status: null,
      is_bound: null
    })

    const pagination = reactive({
      page: 1,
      size: 10,
      total: 0
    })

    const dialogForm = reactive({
      id: null,
      camera_code: '',
      camera_name: '',
      ip_address: '',
      port: 554,
      protocol: 'RTSP',
      username: '',
      password: '',
      location: '',
      status: 1
    })

    // 验证IP地址的正则表达式
    const validateIP = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入IP地址'))
        return
      }
      const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      if (!ipPattern.test(value)) {
        callback(new Error('请输入有效的IP地址'))
      } else {
        callback()
      }
    }

    const dialogRules = {
      camera_code: [
        { required: true, message: '请输入相机编码', trigger: 'blur' },
        { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
      ],
      camera_name: [
        { required: true, message: '请输入相机名称', trigger: 'blur' },
        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
      ],
      ip_address: [
        { required: true, validator: validateIP, trigger: 'blur' }
      ],
      port: [
        { required: true, message: '请输入端口', trigger: 'blur' },
        { type: 'number', min: 1, max: 65535, message: '端口范围 1-65535', trigger: 'blur' }
      ],
      protocol: [
        { required: true, message: '请选择协议', trigger: 'change' }
      ]
    }

    // 获取相机列表
    const loadCameras = async () => {
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

        const response = await getCameraList(params)
        if (response.code === 200) {
          // 确保 cameraList 总是一个数组
          cameraList.value = Array.isArray(response.data?.list) ? response.data.list : []
          pagination.total = response.data?.total || 0
        }
      } catch (error) {
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

    // 显示新建对话框
    const showCreateDialog = () => {
      resetDialog()
      dialogVisible.value = true
    }

    // 编辑相机
    const editCamera = (camera) => {
      dialogForm.id = camera.id
      dialogForm.camera_code = camera.camera_code
      dialogForm.camera_name = camera.camera_name
      dialogForm.ip_address = camera.ip_address
      dialogForm.port = camera.port
      dialogForm.protocol = camera.protocol
      dialogForm.username = camera.username || ''
      dialogForm.password = '' // 不显示原密码
      dialogForm.location = camera.location || ''
      dialogForm.status = camera.status
      dialogVisible.value = true
    }

    // 查看相机详情
    const viewCamera = async (camera) => {
      try {
        const response = await getCameraById(camera.id)
        if (response.code === 200) {
          currentCamera.value = response.data
          detailVisible.value = true
        }
      } catch (error) {
        ElMessage.error('获取相机详情失败: ' + (error.message || '未知错误'))
      }
    }

    // 删除相机
    const deleteCamera = (camera) => {
      if (camera.is_bound === 1) {
        ElMessage.warning('相机已绑定图层，无法删除')
        return
      }

      ElMessageBox.confirm(`确定要删除相机"${camera.camera_name}"吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteCameraApi(camera.id)
          ElMessage.success('删除成功')
          loadCameras()
        } catch (error) {
          ElMessage.error('删除失败: ' + (error.message || '未知错误'))
        }
      })
    }

    // 提交对话框
    const submitDialog = async () => {
      try {
        await dialogFormRef.value.validate()
        submitting.value = true

        if (dialogForm.id) {
          // 编辑相机
          const data = {
            camera_name: dialogForm.camera_name,
            ip_address: dialogForm.ip_address,
            port: dialogForm.port,
            protocol: dialogForm.protocol,
            username: dialogForm.username || null,
            password: dialogForm.password || null,
            location: dialogForm.location || null,
            status: dialogForm.status
          }
          // 移除空值，但保留password字段（即使为空也发送）
          Object.keys(data).forEach(key => {
            if (data[key] === '' && key !== 'password') {
              data[key] = null
            }
          })

          await updateCamera(dialogForm.id, data)
          ElMessage.success('更新成功')
        } else {
          // 新建相机
          const data = {
            camera_code: dialogForm.camera_code,
            camera_name: dialogForm.camera_name,
            ip_address: dialogForm.ip_address,
            port: dialogForm.port,
            protocol: dialogForm.protocol,
            username: dialogForm.username || null,
            password: dialogForm.password || null,
            location: dialogForm.location || null
          }
          // 移除空值，但保留password字段（即使为空也发送）
          Object.keys(data).forEach(key => {
            if (data[key] === '' && key !== 'password') {
              data[key] = null
            }
          })

          await createCamera(data)
          ElMessage.success('创建成功')
        }

        dialogVisible.value = false
        loadCameras()
      } catch (error) {
        ElMessage.error('操作失败: ' + (error.message || '未知错误'))
      } finally {
        submitting.value = false
      }
    }

    // 重置对话框
    const resetDialog = () => {
      dialogForm.id = null
      dialogForm.camera_code = ''
      dialogForm.camera_name = ''
      dialogForm.ip_address = ''
      dialogForm.port = 554
      dialogForm.protocol = 'RTSP'
      dialogForm.username = ''
      dialogForm.password = ''
      dialogForm.location = ''
      dialogForm.status = 1
      if (dialogFormRef.value) {
        dialogFormRef.value.resetFields()
      }
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleString('zh-CN')
    }

    onMounted(() => {
      loadCameras()
    })

    return {
      loading,
      submitting,
      cameraList,
      currentCamera,
      dialogVisible,
      detailVisible,
      dialogFormRef,
      searchForm,
      pagination,
      dialogForm,
      dialogRules,
      loadCameras,
      handleSearch,
      refreshCameras,
      handleSizeChange,
      handleCurrentChange,
      showCreateDialog,
      editCamera,
      viewCamera,
      deleteCamera,
      submitDialog,
      resetDialog,
      formatDate
    }
  }
}
</script>

<style scoped>
.camera-management {
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

.camera-table {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
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
