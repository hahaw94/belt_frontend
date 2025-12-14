<template>
  <el-card class="config-card tech-card mb-20" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>{{ $t('system.basic.systemMaintenance') }}</span>
      </div>
    </template>
    <div v-loading="maintenanceLoading" class="config-form">
        <!-- 系统重启管理 -->
        <el-row class="maintenance-section">
          <el-col :span="24">
            <h4>{{ $t('system.basic.systemRestart') }}</h4>
            <div class="restart-actions">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-card shadow="hover" class="restart-card">
                    <div class="restart-item">
                      <div class="restart-icon">
                        <el-icon size="24"><Refresh /></el-icon>
                      </div>
                      <div class="restart-content">
                        <h5>{{ $t('system.basic.restartService') }}</h5>
                        <p>{{ $t('system.basic.restartServiceDesc') }}</p>
                        <el-button type="primary" class="tech-button" @click="confirmRestartService" :loading="restartingService">
{{ $t('system.basic.restartService') }}
                        </el-button>
                      </div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="12">
                  <el-card shadow="hover" class="restart-card">
                    <div class="restart-item">
                      <div class="restart-icon">
                        <el-icon size="24"><PowerOff /></el-icon>
                      </div>
                      <div class="restart-content">
                        <h5>{{ $t('system.basic.rebootServer') }}</h5>
                        <p>{{ $t('system.basic.rebootServerDesc') }}</p>
                        <el-button type="danger" class="tech-button-danger" @click="confirmRebootServer" :loading="rebootingServer">
{{ $t('system.basic.rebootServer') }}
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
import { Refresh, PowerOff } from '@element-plus/icons-vue'

export default {
  name: 'MaintenanceManagement',
  components: {
    Refresh,
    PowerOff
  },
  props: {
    maintenanceLoading: {
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
    confirmRestartService() {
      this.$emit('confirm-restart-service')
    },
    confirmRebootServer() {
      this.$emit('confirm-reboot-server')
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

/* 重启卡片样式 - 科技感主题 */
.restart-card {
  background: rgba(20, 30, 50, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 0 12px rgba(0, 255, 255, 0.1) !important;
  backdrop-filter: blur(8px) !important;
  transition: all 0.3s ease !important;
}

.restart-card:hover {
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.2) !important;
  transform: translateY(-2px) !important;
}

.restart-card :deep(.el-card__body) {
  background: transparent !important;
  padding: 16px !important;
}

/* 卡片标题样式 */
.card-header span {
  color: #00ffff;
  font-weight: 600;
  font-size: 16px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
  letter-spacing: 1px;
}

/* 维护管理样式 */
.maintenance-section h4 {
  color: rgba(0, 255, 255, 0.9);
  font-weight: 500;
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.3);
  font-size: 18px;
  margin-bottom: 16px;
}

/* 重启卡片内容样式 */
.restart-content h5 {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-shadow: 0 0 4px rgba(0, 255, 255, 0.3);
  margin-bottom: 8px;
}

.restart-content p {
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.2);
  font-size: 14px;
  margin-bottom: 12px;
}

/* 按钮文字增强 */
.tech-button {
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.4) !important;
  font-weight: 500 !important;
  letter-spacing: 0.5px;
}

.tech-button-danger {
  text-shadow: 0 0 6px rgba(245, 108, 108, 0.4) !important;
  font-weight: 500 !important;
  letter-spacing: 0.5px;
}

/* 重启项目内容样式 */
.restart-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.restart-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.restart-icon .el-icon {
  color: #00ffff !important;
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.4));
}

.restart-content {
  flex: 1;
}

.restart-content h5 {
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 600 !important;
  text-shadow: 0 0 4px rgba(0, 255, 255, 0.3) !important;
  margin-bottom: 8px !important;
  font-size: 16px;
}

.restart-content p {
  color: rgba(255, 255, 255, 0.75) !important;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.2) !important;
  font-size: 14px !important;
  margin-bottom: 12px !important;
  line-height: 1.5;
}
</style>
