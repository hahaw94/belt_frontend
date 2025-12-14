<template>
  <div class="storage-management">
    <!-- 录像存储策略 -->
    <el-card class="config-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ $t('system.basic.videoStoragePolicy') }}</span>
        </div>
      </template>
    <el-form :model="videoStorageConfig" :rules="videoStorageRules" ref="videoStorageFormRef" label-width="150px" v-loading="storageLoading" class="config-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('system.basic.retentionDays')" prop="retention_days">
              <el-input-number :model-value="videoStorageConfig.retention_days" @update:model-value="updateVideoRetentionDays" :min="1" :max="3650" :controls="false" style="width: 100%">
                <template #suffix>{{ $t('system.basic.days') }}</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('system.basic.maxStorage')" prop="max_storage_gb">
              <el-input-number :model-value="videoStorageConfig.max_storage_gb" @update:model-value="updateVideoMaxStorage" :min="1" :max="100000" :controls="false" style="width: 100%">
                <template #suffix>GB</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('system.basic.cyclicOverwrite')">
              <el-switch :model-value="videoStorageConfig.cyclic_overwrite" @update:model-value="updateVideoCyclicOverwrite" />
              <span style="margin-left: 10px; color: #909399;">{{ $t('system.basic.cyclicOverwriteDesc') }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row style="margin-top: 24px;">
          <el-col :span="24">
            <el-form-item>
              <el-button type="primary" class="tech-button" @click="saveVideoStorageConfig" :loading="storageLoading">{{ $t('common.save') }}</el-button>
              <el-button class="tech-button-secondary" @click="loadVideoStorageConfig">{{ $t('common.reset') }}</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 告警数据存储策略 -->
    <el-card class="config-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ $t('system.basic.alarmStoragePolicy') }}</span>
        </div>
      </template>
    <el-form :model="alarmDataConfig" :rules="alarmDataRules" ref="alarmDataFormRef" label-width="150px" v-loading="storageLoading" class="config-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('system.basic.retentionDays')" prop="retention_days">
              <el-input-number :model-value="alarmDataConfig.retention_days" @update:model-value="updateAlarmRetentionDays" :min="1" :max="3650" :controls="false" style="width: 100%">
                <template #suffix>{{ $t('system.basic.days') }}</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('system.basic.maxRecords')" prop="max_records">
              <el-input-number :model-value="alarmDataConfig.max_records" @update:model-value="updateAlarmMaxRecords" :min="1000" :max="10000000" :controls="false" style="width: 100%">
                <template #suffix>{{ $t('system.basic.records') }}</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('system.basic.cyclicCleanup')">
              <el-switch :model-value="alarmDataConfig.cyclic_cleanup" @update:model-value="updateAlarmCyclicCleanup" />
              <span style="margin-left: 10px; color: #909399;">{{ $t('system.basic.cyclicCleanupDesc') }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row style="margin-top: 24px;">
          <el-col :span="24">
            <el-form-item>
              <el-button type="primary" class="tech-button" @click="saveAlarmDataConfig" :loading="storageLoading">{{ $t('common.save') }}</el-button>
              <el-button class="tech-button-secondary" @click="loadAlarmDataConfig">{{ $t('common.reset') }}</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'StorageManagement',
  emits: ['save-video-storage', 'load-video-storage', 'save-alarm-data', 'load-alarm-data', 'update-video-retention-days', 'update-video-max-storage', 'update-video-cyclic-overwrite', 'update-alarm-retention-days', 'update-alarm-max-records', 'update-alarm-cyclic-cleanup'],
  props: {
    videoStorageConfig: {
      type: Object,
      required: true
    },
    alarmDataConfig: {
      type: Object,
      required: true
    },
    videoStorageRules: {
      type: Object,
      required: true
    },
    alarmDataRules: {
      type: Object,
      required: true
    },
    storageLoading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    saveVideoStorageConfig() {
      this.$emit('save-video-storage')
    },
    loadVideoStorageConfig() {
      this.$emit('load-video-storage')
    },
    saveAlarmDataConfig() {
      this.$emit('save-alarm-data')
    },
    loadAlarmDataConfig() {
      this.$emit('load-alarm-data')
    },
    updateVideoRetentionDays(value) {
      this.$emit('update-video-retention-days', value)
    },
    updateVideoMaxStorage(value) {
      this.$emit('update-video-max-storage', value)
    },
    updateVideoCyclicOverwrite(value) {
      this.$emit('update-video-cyclic-overwrite', value)
    },
    updateAlarmRetentionDays(value) {
      this.$emit('update-alarm-retention-days', value)
    },
    updateAlarmMaxRecords(value) {
      this.$emit('update-alarm-max-records', value)
    },
    updateAlarmCyclicCleanup(value) {
      this.$emit('update-alarm-cyclic-cleanup', value)
    }
  }
}
</script>

<style scoped>
.storage-management {
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

/* 卡片标题样式 */
.card-header span {
  color: #00ffff;
  font-weight: 600;
  font-size: 16px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
  letter-spacing: 1px;
}

/* 表单标签样式 */
.config-form :deep(.el-form-item__label) {
  color: rgba(0, 255, 255, 0.9) !important;
  font-weight: 500;
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.3);
  font-size: 14px;
}

/* 输入框文字样式 */
.config-form :deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.9) !important;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.2);
}

/* 数字输入框样式 */
.config-form :deep(.el-input-number .el-input__inner) {
  color: rgba(255, 255, 255, 0.9) !important;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.2);
}

/* 按钮文字增强 */
.tech-button {
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.4) !important;
  font-weight: 500 !important;
  letter-spacing: 0.5px;
}

.tech-button-secondary {
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.3) !important;
  font-weight: 400 !important;
}

/* 开关说明文字样式 */
.config-form span[style*="color: #909399"] {
  color: rgba(255, 255, 255, 0.7) !important;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.2);
  font-style: italic;
}
</style>
