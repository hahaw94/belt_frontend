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

/* 卡片自适应高度 */
.config-card.tech-card {
  height: auto !important;
  min-height: auto !important;
  max-height: none !important;
}

.config-card.tech-card :deep(.el-card__body) {
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
</style>
