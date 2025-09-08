<template>
  <div class="storage-management">
    <!-- 录像存储策略 -->
    <el-card class="config-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>录像存储策略</span>
        </div>
      </template>
    <el-form :model="videoStorageConfig" :rules="videoStorageRules" ref="videoStorageFormRef" label-width="150px" v-loading="storageLoading" class="config-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="保存天数" prop="retention_days">
              <el-input-number :model-value="videoStorageConfig.retention_days" @update:model-value="updateVideoRetentionDays" :min="1" :max="3650" :controls="false" style="width: 100%">
                <template #suffix>天</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大存储容量" prop="max_storage_gb">
              <el-input-number :model-value="videoStorageConfig.max_storage_gb" @update:model-value="updateVideoMaxStorage" :min="1" :max="100000" :controls="false" style="width: 100%">
                <template #suffix>GB</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="循环覆盖">
              <el-switch :model-value="videoStorageConfig.cyclic_overwrite" @update:model-value="updateVideoCyclicOverwrite" />
              <span style="margin-left: 10px; color: #909399;">启用后，存储空间不足时将自动删除最早的录像文件</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row style="margin-top: 24px;">
          <el-col :span="24">
            <el-form-item>
              <el-button type="primary" class="tech-button" @click="saveVideoStorageConfig" :loading="storageLoading">保存配置</el-button>
              <el-button class="tech-button-secondary" @click="loadVideoStorageConfig">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 告警数据存储策略 -->
    <el-card class="config-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>告警数据存储策略</span>
        </div>
      </template>
    <el-form :model="alarmDataConfig" :rules="alarmDataRules" ref="alarmDataFormRef" label-width="150px" v-loading="storageLoading" class="config-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="保存天数" prop="retention_days">
              <el-input-number :model-value="alarmDataConfig.retention_days" @update:model-value="updateAlarmRetentionDays" :min="1" :max="3650" :controls="false" style="width: 100%">
                <template #suffix>天</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大记录数" prop="max_records">
              <el-input-number :model-value="alarmDataConfig.max_records" @update:model-value="updateAlarmMaxRecords" :min="1000" :max="10000000" :controls="false" style="width: 100%">
                <template #suffix>条</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="循环清理">
              <el-switch :model-value="alarmDataConfig.cyclic_cleanup" @update:model-value="updateAlarmCyclicCleanup" />
              <span style="margin-left: 10px; color: #909399;">启用后，达到最大记录数时将自动删除最早的告警数据</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row style="margin-top: 24px;">
          <el-col :span="24">
            <el-form-item>
              <el-button type="primary" class="tech-button" @click="saveAlarmDataConfig" :loading="storageLoading">保存配置</el-button>
              <el-button class="tech-button-secondary" @click="loadAlarmDataConfig">重置</el-button>
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
</style>
