<template>
  <div class="platform-management">
    <el-card class="config-card tech-card mb-20" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>GB28181平台对接</span>
        <div>
          <el-button type="primary" :icon="Plus" size="small" class="tech-button-sm" @click="showAddGB28181Dialog">添加平台</el-button>
          <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="loadGB28181Platforms" :loading="gb28181Loading">刷新</el-button>
        </div>
      </div>
    </template>
    
    <!-- GB28181平台列表表格 -->
      <el-table 
        :data="gb28181Platforms" 
        v-loading="gb28181Loading" 
        class="tech-table"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="platform_name" label="平台名称" min-width="120">
          <template #default="{ row }">
            <span class="platform-name">{{ row.platform_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="platform_ip" label="平台IP" min-width="120">
          <template #default="{ row }">
            <span class="platform-ip">{{ row.platform_ip }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="platform_port" label="端口" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.platform_port }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="device_id" label="设备编码" min-width="140">
          <template #default="{ row }">
            <span class="device-id">{{ row.device_id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="100">
          <template #default="{ row }">
            <span>{{ row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch 
              v-model="row.enabled" 
              @change="toggleGB28181Platform(row)"
              :loading="row.switching"
            />
          </template>
        </el-table-column>
        <el-table-column prop="connection_status" label="连接状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag 
              :type="row.connection_status === 'connected' ? 'success' : 
                     row.connection_status === 'connecting' ? 'warning' : 'danger'"
              size="small"
            >
              {{ getConnectionStatusText(row.connection_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              :icon="Connection" 
              @click="testGB28181Connection(row)"
              :loading="row.testing"
            >
              测试
            </el-button>
            <el-button 
              type="primary" 
              size="small" 
              :icon="Edit" 
              @click="editGB28181Platform(row)"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              :icon="Delete" 
              @click="deleteGB28181Platform(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="empty-data">
            <el-icon size="48" color="#C0C4CC"><DocumentRemove /></el-icon>
            <p>暂无GB28181平台对接配置</p>
            <el-button type="primary" @click="showAddGB28181Dialog">添加平台</el-button>
          </div>
        </template>
      </el-table>

    <!-- GB28181平台添加/编辑对话框 -->
    <el-dialog
      :model-value="gb28181DialogVisible"
      @update:model-value="updateDialogVisible"
      :title="gb28181DialogMode === 'add' ? '添加GB28181平台' : '编辑GB28181平台'"
      width="700px"
      :close-on-click-modal="false"
      class="platform-dialog"
      center
      align-center
    >
      <!-- 防止浏览器自动填充的隐藏字段 -->
      <div style="display: none;">
        <input type="text" autocomplete="username" />
        <input type="password" autocomplete="current-password" />
      </div>
      
      <el-form 
        :model="gb28181FormData" 
        :rules="gb28181Rules" 
        ref="gb28181FormRef" 
        label-width="80px"
        autocomplete="off"
        class="platform-form"
      >
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="平台名称" prop="platform_name">
              <el-input :model-value="gb28181FormData.platform_name" @update:model-value="updatePlatformName" placeholder="请输入平台名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="平台IP" prop="platform_ip">
              <el-input :model-value="gb28181FormData.platform_ip" @update:model-value="updatePlatformIp" placeholder="请输入平台IP地址"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="平台端口" prop="platform_port">
              <el-input-number 
                :model-value="gb28181FormData.platform_port" 
                @update:model-value="updatePlatformPort"
                :min="1000" 
                :max="65535" 
                :controls="false" 
                style="width: 100%"
              ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="设备编码" prop="device_id">
              <el-input :model-value="gb28181FormData.device_id" @update:model-value="updateDeviceId" placeholder="请输入设备编码"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="用户名" prop="username">
              <el-input 
                :model-value="gb28181FormData.username" 
                @update:model-value="updateUsername"
                placeholder="请输入用户名"
                autocomplete="new-username"
                :readonly="false"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="密码" prop="password">
              <el-input 
                :model-value="gb28181FormData.password" 
                @update:model-value="updatePassword"
                type="password" 
                placeholder="请输入密码" 
                show-password
                autocomplete="new-password"
                :readonly="false"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="启用状态">
              <el-switch :model-value="gb28181FormData.enabled" @update:model-value="updateEnabled" />
              <span style="margin-left: 10px; color: #909399;">启用后系统将尝试连接到GB28181平台</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="updateDialogVisible(false)">取消</el-button>
          <el-button type="primary" @click="saveGB28181Platform" :loading="gb28181Loading">
            {{ gb28181DialogMode === 'add' ? '添加' : '保存' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { DocumentRemove, Plus, Refresh, Edit, Delete } from '@element-plus/icons-vue'

export default {
  name: 'PlatformManagement',
  components: {
    DocumentRemove,
    Plus, // eslint-disable-line vue/no-unused-components
    Refresh, // eslint-disable-line vue/no-unused-components
    Edit, // eslint-disable-line vue/no-unused-components
    Delete // eslint-disable-line vue/no-unused-components
  },
  emits: ['show-add-gb28181-dialog', 'load-gb28181-platforms', 'toggle-gb28181-platform', 'test-gb28181-connection', 'edit-gb28181-platform', 'delete-gb28181-platform', 'save-gb28181-platform', 'update-dialog-visible', 'update-platform-name', 'update-platform-ip', 'update-platform-port', 'update-device-id', 'update-username', 'update-password', 'update-enabled'],
  props: {
    gb28181Platforms: {
      type: Array,
      required: true
    },
    gb28181Loading: {
      type: Boolean,
      default: false
    },
    gb28181DialogVisible: {
      type: Boolean,
      default: false
    },
    gb28181DialogMode: {
      type: String,
      default: 'add'
    },
    gb28181FormData: {
      type: Object,
      required: true
    },
    gb28181Rules: {
      type: Object,
      required: true
    }
  },
  methods: {
    showAddGB28181Dialog() {
      this.$emit('show-add-gb28181-dialog')
    },
    loadGB28181Platforms() {
      this.$emit('load-gb28181-platforms')
    },
    toggleGB28181Platform(row) {
      this.$emit('toggle-gb28181-platform', row)
    },
    testGB28181Connection(row) {
      this.$emit('test-gb28181-connection', row)
    },
    editGB28181Platform(row) {
      this.$emit('edit-gb28181-platform', row)
    },
    deleteGB28181Platform(row) {
      this.$emit('delete-gb28181-platform', row)
    },
    saveGB28181Platform() {
      this.$emit('save-gb28181-platform')
    },
    getConnectionStatusText(status) {
      return this.$parent?.getConnectionStatusText?.(status) || status
    },
    updateDialogVisible(value) {
      this.$emit('update-dialog-visible', value)
    },
    updatePlatformName(value) {
      this.$emit('update-platform-name', value)
    },
    updatePlatformIp(value) {
      this.$emit('update-platform-ip', value)
    },
    updatePlatformPort(value) {
      this.$emit('update-platform-port', value)
    },
    updateDeviceId(value) {
      this.$emit('update-device-id', value)
    },
    updateUsername(value) {
      this.$emit('update-username', value)
    },
    updatePassword(value) {
      this.$emit('update-password', value)
    },
    updateEnabled(value) {
      this.$emit('update-enabled', value)
    }
  }
}
</script>

<style scoped>
.platform-management {
  height: auto;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

/* 科技感卡片样式 - 按照基础管理主文件样式 */
.config-card.tech-card {
  position: relative;
  z-index: 10;
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  margin-bottom: 20px;
  height: auto !important;
  min-height: auto !important;
  max-height: none !important;
}

.config-card.tech-card :deep(.el-card__header) {
  background: rgba(20, 30, 50, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
  padding: 16px 20px !important;
  color: #ffffff !important;
}

.config-card.tech-card :deep(.el-card__header .card-header) {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin: 0 !important;
  width: 100% !important;
}

.config-card.tech-card :deep(.el-card__body) {
  background: rgba(15, 25, 45, 0.95) !important;
  padding: 20px !important;
  border-radius: 0 0 12px 12px !important;
  height: auto !important;
  min-height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

/* 表格容器自适应 */
.tech-table {
  height: auto !important;
  min-height: auto !important;
}

/* 对话框自适应高度和宽度 */
:deep(.el-dialog) {
  max-height: 90vh;
  overflow-y: auto;
}

:deep(.el-dialog__body) {
  max-height: calc(90vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
}

/* 平台对话框特定样式 */
.platform-dialog :deep(.el-dialog) {
  max-width: 95vw;
  width: 700px;
}

.platform-dialog :deep(.el-dialog__body) {
  padding: 20px 24px;
}

/* 表单样式优化 */
.platform-form {
  width: 100%;
  overflow: hidden;
}

.platform-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.platform-form :deep(.el-form-item__label) {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.platform-form :deep(.el-form-item__content) {
  flex: 1;
  min-width: 0;
}

.platform-form :deep(.el-input) {
  width: 100%;
}

.platform-form :deep(.el-input__wrapper) {
  width: 100%;
  box-sizing: border-box;
}

/* 平台对话框简化居中样式 */
.platform-dialog :deep(.el-dialog) {
  margin-top: 10vh !important;
  margin-bottom: 10vh !important;
}

/* 响应式处理 */
@media (max-width: 768px) {
  .platform-dialog :deep(.el-dialog) {
    width: 95vw !important;
    margin-top: 5vh !important;
    margin-bottom: 5vh !important;
  }
  
  .platform-form {
    label-width: 70px !important;
  }
  
  .platform-form :deep(.el-form-item__label) {
    font-size: 13px;
  }
}

/* 继承父组件的样式 */

/* 卡片标题样式 */
.card-header span {
  color: #00ffff;
  font-weight: 600;
  font-size: 16px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
  letter-spacing: 1px;
}

/* 表格文字样式 */
.platform-name, .platform-ip, .device-id {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.2);
  font-family: inherit;
}

/* 表单标签样式 */
.platform-form :deep(.el-form-item__label) {
  color: rgba(0, 255, 255, 0.9) !important;
  font-weight: 500;
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.3);
  font-size: 14px;
}

/* 输入框文字样式 */
.platform-form :deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.9) !important;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.2);
}

.platform-form :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
  text-shadow: none;
}

/* 按钮文字增强 */
.tech-button-sm {
  text-shadow: 0 0 4px rgba(0, 255, 255, 0.3) !important;
  font-weight: 500 !important;
}

/* 空数据状态文字 */
.empty-data p {
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 0 4px rgba(0, 255, 255, 0.2);
  font-weight: 400;
}

/* 表格标签样式 */
:deep(.el-tag) {
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  font-weight: 500;
  letter-spacing: 0.3px;
}

:deep(.el-tag.el-tag--success) {
  color: #4ade80 !important;
  text-shadow: 0 0 4px rgba(74, 222, 128, 0.3);
}

:deep(.el-tag.el-tag--warning) {
  color: #fbbf24 !important;
  text-shadow: 0 0 4px rgba(251, 191, 36, 0.3);
}

:deep(.el-tag.el-tag--danger) {
  color: #f87171 !important;
  text-shadow: 0 0 4px rgba(248, 113, 113, 0.3);
}

/* 科技感表格样式 - 完全按照网络管理样式 */
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

/* 在表格外层添加遮罩来覆盖白边 */
.tech-table::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  z-index: -1 !important;
  pointer-events: none !important;
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

/* 表头样式 */
.tech-table :deep(.el-table__header-wrapper) {
  background: linear-gradient(135deg, 
    rgba(20, 35, 60, 1) 0%, 
    rgba(25, 40, 65, 1) 100%) !important;
  border-radius: 12px 12px 0 0 !important;
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
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.6) !important;
  letter-spacing: 0.5px !important;
  position: relative !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header th:last-child) {
  border-right: none !important;
}

/* 表格行样式 */
.tech-table :deep(.el-table__body-wrapper .el-table__body tr) {
  background: rgba(25, 35, 55, 0.6) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.08) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(even)) {
  background: rgba(20, 30, 50, 0.7) !important;
}

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

.tech-table :deep(.el-table__body-wrapper .el-table__body td) {
  border: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
  background: transparent !important;
  padding: 14px 12px !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body td:last-child) {
  border-right: none !important;
}

/* 强制移除所有可能的边框 */
.tech-table :deep(*) {
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

.tech-table :deep(td) {
  border: none !important;
}

.tech-table :deep(th) {
  border: none !important;
}

/* 移除表格容器本身的边框 */
.tech-table,
.tech-table :deep(.el-table),
.tech-table :deep(.el-table__inner-wrapper) {
  border: none !important;
  outline: none !important;
}
</style>
