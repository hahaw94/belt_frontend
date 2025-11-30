<template>
  <div class="warning-push tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background"></div>
    
    <h2>预警推送管理</h2>
    
    <!-- 告警类型管理 -->
    <el-card class="role-list-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>告警类型管理</span>
          <div>
            <el-button type="success" :icon="Plus" size="small" class="tech-button-sm" @click="handleAddType">添加类型</el-button>
            <el-button type="warning" :icon="Setting" size="small" class="tech-button-sm" @click="showSubscriptionDialog">订阅配置</el-button>
            <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="loadAlarmTypes">刷新列表</el-button>
          </div>
        </div>
      </template>

      <!-- 类型列表 -->
      <el-table :data="paginatedTypes" v-loading="typeLoading" border stripe class="tech-table" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" header-align="center" />
        <el-table-column prop="type_name" label="类型名称" min-width="150" header-align="center" />
        <el-table-column prop="type_code" label="类型编码" min-width="200" header-align="center">
          <template #default="{ row }">
            <code class="type-code">{{ row.type_code }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="100" align="center" header-align="center" />
        <el-table-column prop="create_time" label="创建时间" width="180" header-align="center">
          <template #default="{ row }">
            {{ formatDate(row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <el-button 
              type="danger"
              :icon="Delete"
              size="small"
              class="tech-button-xs"
              @click="handleDeleteType(row)"
              :disabled="row.id <= 9"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 增强型分页组件 -->
      <div class="pagination-container tech-pagination">
        <div class="pagination-info">
          <span>共 <span class="total-count">{{ pagination.total }}</span> 条记录，每页显示 
            <el-select 
              v-model="pagination.pageSize" 
              @change="handleSizeChange"
              class="page-size-select"
              size="small"
            >
              <el-option label="5" :value="5" />
              <el-option label="10" :value="10" />
              <el-option label="20" :value="20" />
              <el-option label="50" :value="50" />
            </el-select> 条
          </span>
        </div>
        <div class="pagination-controls">
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === 1 || typeLoading"
            @click="goToPage(1)"
          >
            首页
          </el-button>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === 1 || typeLoading"
            @click="goToPage(pagination.page - 1)"
          >
            上一页
          </el-button>
          <div class="pagination-pages">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              class="page-btn"
              :class="{ active: page === pagination.page }"
              @click="goToPage(page)"
              :disabled="typeLoading"
            >
              {{ page }}
            </button>
          </div>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === totalPages || typeLoading"
            @click="goToPage(pagination.page + 1)"
          >
            下一页
          </el-button>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === totalPages || typeLoading"
            @click="goToPage(totalPages)"
          >
            末页
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 添加类型对话框 -->
    <el-dialog
      v-model="showAddForm"
      title="添加告警类型"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
      class="tech-dialog"
    >
      <el-form :model="typeForm" :rules="typeRules" ref="typeFormRef" label-width="100px">
        <el-form-item label="类型ID" prop="id">
          <el-input-number v-model="typeForm.id" :min="10" placeholder="建议从10开始" style="width: 100%" />
          <div class="form-tip">💡 ID 1-9 为系统预置类型</div>
        </el-form-item>
        <el-form-item label="类型名称" prop="type_name">
          <el-input v-model="typeForm.type_name" placeholder="如：人员闯入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddForm = false">取消</el-button>
          <el-button type="primary" @click="handleSaveType">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 订阅配置对话框 -->
    <el-dialog
      v-model="subscriptionDialogVisible"
      title="告警订阅配置"
      width="700px"
      :close-on-click-modal="false"
      destroy-on-close
      class="tech-dialog"
    >
      <div v-loading="subscriptionLoading" class="subscription-content">
        <!-- 订阅的告警类型 -->
        <div class="subscription-section">
          <div class="section-title">
            <span class="required">*</span> 订阅的告警类型
          </div>
          <div class="alarm-types-scroll-container">
            <div class="alarm-types-grid">
              <el-checkbox
                v-for="type in alarmTypes.filter(t => t.is_active)"
                :key="type.id"
                v-model="subscriptionForm.selectedTypes"
                :label="type.id"
                class="type-checkbox"
              >
                <strong>{{ type.id }}</strong> - {{ type.type_name }}
              </el-checkbox>
            </div>
          </div>
          <div class="section-actions">
            <el-button size="small" @click="selectAllTypes">全选</el-button>
            <el-button size="small" @click="deselectAllTypes">全不选</el-button>
          </div>
        </div>

        <!-- 推送方式 -->
        <div class="subscription-section">
          <div class="section-title">推送方式</div>
          <div class="push-methods">
            <div class="push-method-item">
              <el-checkbox v-model="subscriptionForm.enable_web_push">
                <span class="method-name">Web页面弹出告警</span>
              </el-checkbox>
              <div class="method-desc">实时在浏览器中弹出告警通知</div>
            </div>
            
            <div class="push-method-item">
              <el-checkbox v-model="subscriptionForm.enable_email">
                <span class="method-name">邮件推送</span>
              </el-checkbox>
              <div class="method-desc">发送告警邮件到指定邮箱</div>
              <el-input
                v-if="subscriptionForm.enable_email"
                v-model="subscriptionForm.email_address"
                placeholder="请输入邮箱地址"
                type="email"
                class="email-input"
              />
            </div>
          </div>
        </div>

        <!-- 配置提示 -->
        <el-alert
          v-if="subscriptionForm.enable_web_push"
          title="Web推送已启用"
          type="success"
          :closable="false"
          show-icon
        >
          保存配置后，系统将自动建立WebSocket连接，实时推送告警信息
        </el-alert>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="subscriptionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveSubscription">保存配置</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Setting, Delete } from '@element-plus/icons-vue'
import { eventApi } from '@/api/event'

export default {
  name: 'WarningPush',
  setup() {
    // 告警类型管理
    const alarmTypes = ref([])
    const typeLoading = ref(false)
    const showAddForm = ref(false)
    const typeFormRef = ref(null)
    
    // 分页相关
    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    })
    
    const typeForm = reactive({
      id: null,
      type_name: '',
      type_code: '',
      is_active: true
    })

    const typeRules = {
      id: [
        { required: true, message: '请输入类型ID', trigger: 'blur' },
        { type: 'number', min: 1, message: 'ID必须大于0', trigger: 'blur' }
      ],
      type_name: [
        { required: true, message: '请输入类型名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ]
    }

    // 订阅配置
    const subscriptionDialogVisible = ref(false)
    const subscriptionLoading = ref(false)
    const subscriptionForm = reactive({
      selectedTypes: [],
      enable_web_push: false,
      enable_email: false,
      email_address: ''
    })

    // 计算分页后的数据
    const paginatedTypes = computed(() => {
      const start = (pagination.page - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      return alarmTypes.value.slice(start, end)
    })

    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(pagination.total / pagination.pageSize) || 1
    })

    // 计算可见页码
    const visiblePages = computed(() => {
      const maxVisiblePages = 5
      const totalPagesValue = totalPages.value
      const currentPageValue = pagination.page
      
      let startPage = Math.max(1, currentPageValue - Math.floor(maxVisiblePages / 2))
      let endPage = Math.min(totalPagesValue, startPage + maxVisiblePages - 1)
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }
      
      const pages = []
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      return pages
    })

    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 加载告警类型
    const loadAlarmTypes = async () => {
      typeLoading.value = true
      try {
        const response = await eventApi.getAlarmTypeDict()
        console.log('告警类型响应:', response)
        
        // 处理响应数据
        if (response.data) {
          alarmTypes.value = response.data
        } else if (Array.isArray(response)) {
          alarmTypes.value = response
        } else {
          alarmTypes.value = []
        }
        
        // 更新分页总数
        pagination.total = alarmTypes.value.length
        
        ElMessage.success('加载告警类型成功')
      } catch (error) {
        console.error('加载告警类型失败:', error)
        ElMessage.error('加载告警类型失败：' + (error.message || '未知错误'))
      } finally {
        typeLoading.value = false
      }
    }

    // 显示添加表单
    const handleAddType = () => {
      showAddForm.value = true
      typeForm.id = null
      typeForm.type_name = ''
      typeForm.type_code = ''
      typeForm.is_active = true
    }

    // 保存告警类型
    const handleSaveType = async () => {
      if (!typeFormRef.value) return
      
      await typeFormRef.value.validate(async (valid) => {
        if (!valid) return
        
        try {
          // 自动生成type_code
          typeForm.type_code = `ALARM_TYPE_${typeForm.id}`
          
          await eventApi.createAlarmType(typeForm)
          ElMessage.success('添加告警类型成功')
          showAddForm.value = false
          loadAlarmTypes()
        } catch (error) {
          console.error('添加告警类型失败:', error)
          ElMessage.error('添加告警类型失败：' + (error.message || '未知错误'))
        }
      })
    }

    // 删除告警类型
    const handleDeleteType = async (row) => {
      if (row.id <= 9) {
        ElMessage.warning('系统预置类型不可删除')
        return
      }

      try {
        await ElMessageBox.confirm(
          `确定要删除告警类型 "${row.type_name}" (ID: ${row.id}) 吗？\n\n注意：如果有告警使用此类型，将无法删除！`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        await eventApi.deleteAlarmType(row.id)
        ElMessage.success('删除成功')
        loadAlarmTypes()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除告警类型失败:', error)
          ElMessage.error('删除失败：' + (error.message || '未知错误'))
        }
      }
    }

    // 加载订阅配置
    const loadSubscription = async () => {
      subscriptionLoading.value = true
      try {
        const response = await eventApi.getSubscription()
        console.log('订阅配置响应:', response)
        
        // 解析alarm_types（可能是JSON字符串或数组）
        let subscribedTypes = []
        if (response.alarm_types) {
          try {
            subscribedTypes = typeof response.alarm_types === 'string' 
              ? JSON.parse(response.alarm_types) 
              : response.alarm_types
          } catch (e) {
            console.error('解析alarm_types失败:', e)
          }
        }
        
        // 转换为数字数组
        subscriptionForm.selectedTypes = subscribedTypes.map(t => Number(t))
        subscriptionForm.enable_web_push = response.enable_web_push || false
        subscriptionForm.enable_email = response.enable_email || false
        subscriptionForm.email_address = response.email_address || ''
        
        ElMessage.success('加载订阅配置成功')
      } catch (error) {
        console.error('加载订阅配置失败:', error)
        ElMessage.error('加载订阅配置失败：' + (error.message || '未知错误'))
      } finally {
        subscriptionLoading.value = false
      }
    }

    // 显示订阅配置对话框
    const showSubscriptionDialog = () => {
      subscriptionDialogVisible.value = true
      loadSubscription()
    }

    // 保存订阅配置
    const handleSaveSubscription = async () => {
      // 验证邮箱
      if (subscriptionForm.enable_email && !subscriptionForm.email_address) {
        ElMessage.warning('请输入邮箱地址')
        return
      }

      try {
        const data = {
          alarm_types: subscriptionForm.selectedTypes.map(t => String(t)),
          enable_web_push: subscriptionForm.enable_web_push,
          enable_email: subscriptionForm.enable_email,
          email_address: subscriptionForm.enable_email ? subscriptionForm.email_address : null
        }

        console.log('保存订阅配置:', data)
        await eventApi.updateSubscription(data)
        ElMessage.success('订阅配置保存成功')
        subscriptionDialogVisible.value = false
        
        // 如果启用了Web推送，提示用户
        if (data.enable_web_push) {
          ElMessage.info('Web推送已启用，系统将实时推送告警信息')
        }
      } catch (error) {
        console.error('保存订阅配置失败:', error)
        ElMessage.error('保存失败：' + (error.message || '未知错误'))
      }
    }

    // 全选告警类型
    const selectAllTypes = () => {
      subscriptionForm.selectedTypes = alarmTypes.value
        .filter(t => t.is_active)
        .map(t => t.id)
    }

    // 全不选告警类型
    const deselectAllTypes = () => {
      subscriptionForm.selectedTypes = []
    }

    // 分页处理
    const handleSizeChange = (val) => {
      pagination.pageSize = val
      pagination.page = 1
    }

    // 跳转到指定页面
    const goToPage = (page) => {
      if (page < 1 || page > totalPages.value || page === pagination.page) {
        return
      }
      pagination.page = page
    }


    // 组件挂载时加载数据
    onMounted(() => {
      loadAlarmTypes()
    })

    return {
      // 图标
      Plus,
      Refresh,
      Setting,
      Delete,
      // 数据
      alarmTypes,
      typeLoading,
      showAddForm,
      typeFormRef,
      typeForm,
      typeRules,
      pagination,
      paginatedTypes,
      totalPages,
      visiblePages,
      subscriptionDialogVisible,
      subscriptionLoading,
      subscriptionForm,
      // 方法
      formatDate,
      loadAlarmTypes,
      handleAddType,
      handleSaveType,
      handleDeleteType,
      showSubscriptionDialog,
      loadSubscription,
      handleSaveSubscription,
      selectAllTypes,
      deselectAllTypes,
      handleSizeChange,
      goToPage
    }
  }
}
</script>

<style scoped>
/* ==================== 科技感主题样式 ==================== */

/* 页面容器 */
.tech-page-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  max-height: 100vh;
  padding: 20px;
  padding-bottom: 40px;
  background: transparent;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

/* 标题样式 */
.warning-push h2 {
  margin: 24px 0 20px 0;
  color: #00ffff;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  position: relative;
  z-index: 10;
}

/* 自定义滚动条样式 */
.tech-page-container::-webkit-scrollbar {
  width: 8px;
  background: rgba(0, 0, 0, 0.1);
}

.tech-page-container::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.05);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.tech-page-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.3) 0%, 
    rgba(0, 200, 255, 0.5) 50%, 
    rgba(0, 255, 255, 0.3) 100%);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.tech-page-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.5) 0%, 
    rgba(0, 200, 255, 0.7) 50%, 
    rgba(0, 255, 255, 0.5) 100%);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
}

/* 科技感背景 */
.tech-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* 科技感卡片 */
.tech-card {
  position: relative;
  z-index: 10;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  margin-bottom: 20px;
}

.tech-card :deep(.el-card__header) {
  background: transparent;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 0;
}

.tech-card :deep(.el-card__body) {
  background: transparent;
  padding: 0;
}

.mb-20 {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

/* 科技感按钮 */
.tech-button-sm {
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2) !important;
}

.tech-button-sm:hover {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-1px) !important;
}

.tech-button-xs {
  font-size: 12px !important;
  padding: 4px 8px !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background: rgba(0, 255, 255, 0.08) !important;
  color: #00ffff !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
  margin: 0 2px !important;
}

.tech-button-xs:hover {
  background: rgba(0, 255, 255, 0.15) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
  transform: translateY(-1px) !important;
}


.form-tip {
  font-size: 12px;
  color: #00ffff;
  margin-top: 4px;
  opacity: 0.8;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 类型编码样式 */
.type-code {
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

/* 科技感表格 - 彻底解决白线问题 */
.tech-table {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  border: none !important;
  position: relative !important;
}

/* 强制隐藏表格容器的边框 */
.tech-table::before,
.tech-table::after {
  display: none !important;
  content: none !important;
}

/* 表格整体容器 - 彻底移除所有边框 */
.tech-table :deep(.el-table) {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  border: none !important;
  border-collapse: separate !important;
}

.tech-table :deep(.el-table::before) {
  display: none !important;
}

.tech-table :deep(.el-table::after) {
  display: none !important;
}

/* 移除所有可能的白色边框和分隔线 */
.tech-table :deep(.el-table__inner-wrapper) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

.tech-table :deep(.el-table__inner-wrapper::after) {
  display: none !important;
}

.tech-table :deep(.el-table__inner-wrapper::before) {
  display: none !important;
}

/* 移除表格外层的所有边框元素 */
.tech-table :deep(.el-table__border-left-patch) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.tech-table :deep(.el-table__border-right-patch) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.tech-table :deep(.el-table__border-bottom-patch) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.tech-table :deep(.el-table__border-top-patch) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

/* 表头样式 */
.tech-table :deep(.el-table__header-wrapper) {
  background: linear-gradient(135deg, 
    rgba(20, 35, 60, 1) 0%, 
    rgba(25, 40, 65, 1) 100%) !important;
  border-radius: 12px 12px 0 0 !important;
  border: none !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header) {
  background: linear-gradient(135deg, 
    rgba(20, 35, 60, 1) 0%, 
    rgba(25, 40, 65, 1) 100%) !important;
  border: none !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header th) {
  background: linear-gradient(135deg, 
    rgba(20, 35, 60, 1) 0%, 
    rgba(25, 40, 65, 1) 100%) !important;
  color: #00d4ff !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  padding: 16px 12px !important;
  border: none !important;
  border-bottom: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
  border-left: none !important;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.6) !important;
  letter-spacing: 0.5px !important;
  position: relative !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header th:first-child) {
  border-left: none !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header th:last-child) {
  border-right: none !important;
}

/* 表格头部发光效果 */
.tech-table :deep(.el-table__header-wrapper .el-table__header th::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(0, 255, 255, 0.6) 50%, 
    transparent 100%);
  opacity: 0.8;
}

/* 表体样式 */
.tech-table :deep(.el-table__body-wrapper) {
  background: transparent !important;
}

.tech-table :deep(.el-table__body) {
  background: transparent !important;
  border: none !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr) {
  background: rgba(25, 35, 55, 0.6) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.08) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative !important;
  border: none !important;
  border-left: none !important;
  border-right: none !important;
}

/* 交替行颜色 - 创建微妙的斑马纹效果 */
.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(even)) {
  background: rgba(20, 30, 50, 0.7) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(odd)) {
  background: rgba(25, 35, 55, 0.6) !important;
}

/* 悬停效果 */
.tech-table :deep(.el-table__body-wrapper .el-table__body tr:hover) {
  background: linear-gradient(90deg, 
    rgba(0, 255, 255, 0.08) 0%, 
    rgba(0, 255, 255, 0.12) 50%, 
    rgba(0, 255, 255, 0.08) 100%) !important;
  transform: translateY(-1px) !important;
  box-shadow: 
    0 4px 20px rgba(0, 255, 255, 0.15),
    inset 0 1px 0 rgba(0, 255, 255, 0.2) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:hover td) {
  background: transparent !important;
  color: rgba(255, 255, 255, 1) !important;
}

/* 单元格样式 */
.tech-table :deep(.el-table__body-wrapper .el-table__body td) {
  border: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
  border-left: none !important;
  background: transparent !important;
  padding: 14px 12px !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
  position: relative !important;
  color: rgba(255, 255, 255, 0.95) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body td:first-child) {
  border-left: none !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body td:last-child) {
  border-right: none !important;
}

/* 彻底移除所有表格边框 - 最终解决方案 */
.tech-table :deep(.el-table--border) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table--border .el-table__inner-wrapper) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table--border .el-table__inner-wrapper::after) {
  display: none !important;
  content: none !important;
}

.tech-table :deep(.el-table--border .el-table__inner-wrapper::before) {
  display: none !important;
  content: none !important;
}

.tech-table :deep(.el-table--border::after),
.tech-table :deep(.el-table--border::before) {
  display: none !important;
}

.tech-table :deep(.el-table--group::after),
.tech-table :deep(.el-table--group::before) {
  display: none !important;
}

/* 单元格边框控制 */
.tech-table :deep(.el-table--border td) {
  border: none !important;
  border-left: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table--border th) {
  border: none !important;
  border-left: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table--border td:last-child),
.tech-table :deep(.el-table--border th:last-child) {
  border-right: none !important;
}

/* 移除所有竖向边框 */
.tech-table :deep(.el-table td.el-table__cell),
.tech-table :deep(.el-table th.el-table__cell.is-leaf) {
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
  border-left: none !important;
}

.tech-table :deep(.el-table td.el-table__cell:last-child),
.tech-table :deep(.el-table th.el-table__cell.is-leaf:last-child) {
  border-right: none !important;
}

/* 最后一行移除底部边框 */
.tech-table :deep(.el-table__body-wrapper .el-table__body tr:last-child td) {
  border-bottom: none !important;
}

/* 分页组件样式 */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid rgba(0, 255, 255, 0.1);
  background: rgba(15, 25, 45, 0.5);
}

.pagination-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.pagination-info .total-count {
  color: #00ffff;
  font-weight: 600;
  margin: 0 4px;
}

.page-size-select {
  width: 80px;
  margin: 0 8px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  min-width: 70px;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background: rgba(0, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(0, 255, 255, 0.15) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  color: #00ffff !important;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 4px;
}

.page-btn {
  min-width: 36px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(0, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.page-btn:hover:not(:disabled) {
  background: rgba(0, 255, 255, 0.15);
  border-color: rgba(0, 255, 255, 0.5);
  color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.page-btn.active {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 200, 255, 0.3));
  border-color: #00ffff;
  color: #00ffff;
  font-weight: 600;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 订阅配置内容 */
.subscription-content {
  padding: 0;
}

.subscription-section {
  margin-bottom: 30px;
}

.subscription-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #00ffff;
  margin-bottom: 15px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.section-title .required {
  color: #ff6b6b;
  margin-right: 4px;
}

/* 告警类型滚动容器 */
.alarm-types-scroll-container {
  max-height: 300px;
  overflow-y: auto;
  padding: 15px;
  background: rgba(15, 25, 45, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.1);
  border-radius: 6px;
}

/* 滚动条样式 */
.alarm-types-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.alarm-types-scroll-container::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.05);
  border-radius: 4px;
}

.alarm-types-scroll-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.3) 0%, 
    rgba(0, 200, 255, 0.5) 50%, 
    rgba(0, 255, 255, 0.3) 100%);
  border-radius: 4px;
}

.alarm-types-scroll-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.5) 0%, 
    rgba(0, 200, 255, 0.7) 50%, 
    rgba(0, 255, 255, 0.5) 100%);
}

/* 告警类型网格 */
.alarm-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.type-checkbox {
  color: rgba(255, 255, 255, 0.9);
}

.section-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

/* 推送方式 */
.push-methods {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.push-method-item {
  padding: 15px;
  background: rgba(15, 25, 45, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.1);
  border-radius: 6px;
}

.method-name {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
}

.method-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-left: 24px;
  margin-top: 4px;
}

.email-input {
  margin-left: 24px;
  margin-top: 10px;
  max-width: 400px;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-checkbox__label) {
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-input__wrapper) {
  background: rgba(20, 30, 50, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
}

:deep(.el-input__inner) {
  color: #ffffff !important;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-color: rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-alert) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  margin-top: 20px;
}

:deep(.el-alert__title) {
  color: #00ffff !important;
}

/* 对话框样式 */
:deep(.el-dialog) {
  background: linear-gradient(135deg,
    rgba(15, 25, 45, 0.95) 0%,
    rgba(20, 30, 50, 0.95) 50%,
    rgba(15, 25, 45, 0.95) 100%) !important;
  border: 2px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 16px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-dialog__header) {
  background: transparent !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  padding: 20px !important;
}

:deep(.el-dialog__title) {
  color: #00ffff !important;
  font-size: 18px !important;
  font-weight: 600 !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-dialog__body) {
  padding: 20px !important;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid rgba(0, 255, 255, 0.1) !important;
  padding: 15px 20px !important;
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-select-dropdown) {
  background: rgba(20, 30, 50, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-select-dropdown__item) {
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-select-dropdown__item:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

</style>
