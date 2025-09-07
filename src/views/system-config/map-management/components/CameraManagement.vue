<template>
  <div class="camera-management">
    <!-- 操作工具栏 -->
    <div class="toolbar">
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchForm.camera_name"
          placeholder="搜索相机名称"
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
          placeholder="状态"
          clearable
          style="width: 120px; margin-left: 10px;"
          class="tech-select"
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
          class="tech-select"
          @change="handleSearch"
        >
          <el-option label="已绑定" :value="1" />
          <el-option label="未绑定" :value="0" />
        </el-select>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" class="tech-button" :icon="Plus" @click="showCreateDialog">新建相机</el-button>
        <el-button type="info" class="tech-button-info" :icon="Refresh" @click="refreshCameras">刷新</el-button>
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
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <div class="action-buttons-container">
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
          <el-input
            v-model="dialogForm.port"
            type="number"
            placeholder="请输入端口"
            style="width: 100%;"
            min="1"
            max="65535"
          />
        </el-form-item>
        <el-form-item label="协议" prop="protocol">
          <el-select v-model="dialogForm.protocol" placeholder="请选择协议" style="width: 100%;" class="tech-select-protocol">
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Refresh } from '@element-plus/icons-vue'
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

    // 验证端口号
    const validatePort = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入端口'))
        return
      }
      const port = parseInt(value)
      if (isNaN(port) || port < 1 || port > 65535) {
        callback(new Error('端口范围 1-65535'))
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
        { required: true, validator: validatePort, trigger: 'blur' }
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
            port: parseInt(dialogForm.port),
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
            port: parseInt(dialogForm.port),
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

    // 监听相机数据更新事件
    const handleCameraDataUpdate = (event) => {
      console.log('相机管理页面接收到数据更新事件:', event.detail)
      // 自动刷新相机列表数据
      loadCameras()
    }
    
    // 监听标签页切换事件
    const handleTabChange = (event) => {
      const { newTab } = event.detail
      if (newTab === 'cameras') {
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
      formatDate,
      Plus,
      Refresh
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

.action-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
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

/* 选择框样式优化 - 强制覆盖所有白色背景 */
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

/* 强制覆盖placeholder样式 */
:deep(.el-select .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 协议选择框完全重置样式 */
.tech-select-protocol {
  position: relative !important;
}

.tech-select-protocol * {
  background: none !important;
  background-color: rgba(0, 20, 40, 0.6) !important;
  box-sizing: border-box !important;
}

.tech-select-protocol :deep(.el-select) {
  background: rgba(0, 20, 40, 0.6) !important;
  background-color: rgba(0, 20, 40, 0.6) !important;
}

.tech-select-protocol :deep(.el-input) {
  background: rgba(0, 20, 40, 0.6) !important;
  background-color: rgba(0, 20, 40, 0.6) !important;
}

.tech-select-protocol :deep(.el-input__wrapper) {
  background: rgba(0, 20, 40, 0.6) !important;
  background-color: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
  transition: all 0.3s ease !important;
}

.tech-select-protocol :deep(.el-input__wrapper):before,
.tech-select-protocol :deep(.el-input__wrapper):after {
  display: none !important;
}

.tech-select-protocol :deep(.el-input__wrapper:hover) {
  background: rgba(0, 20, 40, 0.8) !important;
  background-color: rgba(0, 20, 40, 0.8) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.2) !important;
}

.tech-select-protocol :deep(.el-input__wrapper.is-focus) {
  background: rgba(0, 20, 40, 0.8) !important;
  background-color: rgba(0, 20, 40, 0.8) !important;
  border-color: #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

.tech-select-protocol :deep(.el-input__inner) {
  color: #ffffff !important;
  background: transparent !important;
  background-color: transparent !important;
  text-shadow: 0 0 3px rgba(255, 255, 255, 0.3) !important;
  border: none !important;
  outline: none !important;
}

.tech-select-protocol :deep(.el-input__suffix) {
  background: transparent !important;
  background-color: transparent !important;
}

.tech-select-protocol :deep(.el-select__caret) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.tech-select-protocol :deep(.el-input__suffix-inner) {
  background: transparent !important;
  background-color: transparent !important;
}

/* 相机详情对话框样式 */
.camera-detail {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 0 20px 0;
  background: transparent;
}

/* 相机详情滚动条样式 */
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

.camera-detail::-webkit-scrollbar-thumb:active {
  background: rgba(0, 255, 255, 0.8);
}

/* 相机详情描述列表样式 */
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

/* 相机详情标签样式 */
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
</style>
