<template>
  <el-card class="config-card tech-card mb-20" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>系统维护</span>
        <div>
          <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="loadSnapshotList" :loading="maintenanceLoading">刷新列表</el-button>
        </div>
      </div>
    </template>
    <div v-loading="maintenanceLoading" class="config-form">
        <!-- 镜像点管理 -->
        <el-row class="maintenance-section">
          <el-col :span="24">
            <h4>系统镜像点管理</h4>
            <div class="maintenance-actions mb-20">
              <el-button type="primary" class="tech-button" @click="showCreateSnapshotDialog" :loading="creatingSnapshot">
                <el-icon><Camera /></el-icon>
                创建镜像点
              </el-button>
              <el-text class="ml-10" type="info">镜像点用于备份当前系统状态，包括配置文件和数据库</el-text>
            </div>
            
            <!-- 镜像点列表 -->
            <el-table :data="snapshotList" stripe class="tech-table" style="width: 100%" empty-text="暂无镜像点">
              <el-table-column prop="id" label="ID" width="80" header-align="center" />
              <el-table-column prop="name" label="镜像点名称" min-width="150" header-align="center" />
              <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip header-align="center" />
              <el-table-column prop="file_size" label="文件大小" width="120" header-align="center">
                <template #default="scope">
                  {{ formatFileSize(scope.row.file_size) }}
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="创建时间" width="180" header-align="center">
                <template #default="scope">
                  {{ formatDateTime(scope.row.created_at) }}
                </template>
              </el-table-column>
              <el-table-column prop="created_by" label="创建者" width="120" header-align="center" />
              <el-table-column prop="status" label="状态" width="100" header-align="center">
                <template #default="scope">
                  <el-tag :type="getSnapshotStatusType(scope.row.status)">
                    {{ getSnapshotStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" header-align="center">
                <template #default="scope">
                  <div class="operation-buttons">
                    <el-button type="primary" size="small" class="tech-button-sm" @click="restoreSnapshot(scope.row.id)" :loading="restoringSnapshot">
                      恢复
                    </el-button>
                    <el-button type="danger" size="small" class="tech-button-danger tech-button-sm" @click="confirmDeleteSnapshot(scope.row)" :loading="deletingSnapshot">
                      删除
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
        
        <!-- 系统重启管理 -->
        <el-row class="maintenance-section">
          <el-col :span="24">
            <h4>系统重启管理</h4>
            <div class="restart-actions">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-card shadow="hover" class="restart-card">
                    <div class="restart-item">
                      <div class="restart-icon">
                        <el-icon size="24" color="#409EFF"><Refresh /></el-icon>
                      </div>
                      <div class="restart-content">
                        <h5>服务重启</h5>
                        <p>重启应用服务，保持服务器运行</p>
                        <el-button type="primary" class="tech-button" @click="confirmRestartService" :loading="restartingService">
                          重启服务
                        </el-button>
                      </div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="12">
                  <el-card shadow="hover" class="restart-card">
                    <div class="restart-item">
                      <div class="restart-icon">
                        <el-icon size="24" color="#F56C6C"><PowerOff /></el-icon>
                      </div>
                      <div class="restart-content">
                        <h5>服务器重启</h5>
                        <p>重启整个服务器系统</p>
                        <el-button type="danger" class="tech-button-danger" @click="confirmRebootServer" :loading="rebootingServer">
                          重启服务器
                        </el-button>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
      </div>
  </el-card>
</template>

<script>
import { Refresh, Camera, PowerOff } from '@element-plus/icons-vue'

export default {
  name: 'MaintenanceManagement',
  components: {
    Refresh,
    Camera,
    PowerOff
  },
  props: {
    snapshotList: {
      type: Array,
      required: true
    },
    maintenanceLoading: {
      type: Boolean,
      default: false
    },
    creatingSnapshot: {
      type: Boolean,
      default: false
    },
    restoringSnapshot: {
      type: Boolean,
      default: false
    },
    deletingSnapshot: {
      type: Boolean,
      default: false
    },
    restartingService: {
      type: Boolean,
      default: false
    },
    rebootingServer: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    loadSnapshotList() {
      this.$emit('load-snapshot-list')
    },
    showCreateSnapshotDialog() {
      this.$emit('show-create-snapshot-dialog')
    },
    restoreSnapshot(id) {
      this.$emit('restore-snapshot', id)
    },
    confirmDeleteSnapshot(row) {
      this.$emit('confirm-delete-snapshot', row)
    },
    confirmRestartService() {
      this.$emit('confirm-restart-service')
    },
    confirmRebootServer() {
      this.$emit('confirm-reboot-server')
    },
    formatFileSize(size) {
      return this.$parent?.formatFileSize?.(size) || size
    },
    formatDateTime(dateTime) {
      return this.$parent?.formatDateTime?.(dateTime) || dateTime
    },
    getSnapshotStatusType(status) {
      return this.$parent?.getSnapshotStatusType?.(status) || 'info'
    },
    getSnapshotStatusText(status) {
      return this.$parent?.getSnapshotStatusText?.(status) || status
    }
  }
}
</script>

<style scoped>
.maintenance-management {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 继承父组件的样式 */
</style>
