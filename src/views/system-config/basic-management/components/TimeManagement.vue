<template>
  <el-card class="config-card tech-card mb-20" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>{{ $t('system.basic.ntpTimeSettings') }}</span>
        <div>
          <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="loadNTPConfig" :loading="ntpLoading">{{ $t('common.refresh') }}</el-button>
        </div>
      </div>
    </template>
    <el-form :model="ntpConfig" :rules="ntpRules" ref="ntpFormRef" label-width="150px" class="config-form" v-loading="ntpLoading">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('system.basic.workMode')" prop="mode">
              <el-radio-group :model-value="ntpConfig.mode" @update:model-value="updateNtpMode">
                <el-radio label="ntp_client">{{ $t('system.basic.ntpClient') }}</el-radio>
                <el-radio label="ntp_server">{{ $t('system.basic.ntpServer') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="ntpConfig.mode === 'ntp_client'">
            <el-form-item :label="$t('system.basic.timezone')" prop="timezone">
              <div class="custom-select-container">
                <div 
                  class="custom-select-trigger"
                  @click="toggleTimezoneDropdown"
                  :class="{ 'active': showTimezoneDropdown }"
                >
                  <span class="select-value">{{ getSelectedTimezoneLabel() }}</span>
                  <i class="select-arrow" :class="{ 'expanded': showTimezoneDropdown }">▼</i>
                </div>
                <div 
                  v-if="showTimezoneDropdown" 
                  class="custom-select-dropdown"
                  @click.stop
                >
                  <div
                    v-for="option in timezoneOptions"
                    :key="option.value"
                    class="select-option"
                    :class="{ 'selected': ntpConfig.timezone === option.value }"
                    @click="selectTimezone(option.value)"
                  >
                    {{ option.label }}
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="ntpConfig.mode === 'ntp_client'">
          <el-col :span="12">
            <el-form-item :label="$t('system.basic.ntpServerAddress')" prop="server">
              <el-input :model-value="ntpConfig.server" @update:model-value="updateNtpServer" :placeholder="$t('system.basic.addNtpServer')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <el-button type="primary" class="tech-button" @click="syncNTP" :loading="syncLoading">{{ $t('system.basic.syncNow') }}</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="ntpConfig.mode === 'ntp_server'">
          <el-col :span="12">
            <el-form-item :label="$t('system.basic.manualTime')" prop="manual_time">
              <el-date-picker
                :model-value="manualTime"
                @update:model-value="updateManualTime"
                type="datetime"
                :placeholder="$t('system.basic.selectDateTime')"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="ntpConfig.mode === 'ntp_server'">
          <el-col :span="24">
            <el-form-item>
              <el-button type="primary" class="tech-button" @click="setManualTime" :loading="setTimeLoading">{{ $t('system.basic.setManualTime') }}</el-button>
              <el-button class="tech-button-secondary" @click="syncPCTime">{{ $t('system.basic.syncPCTime') }}</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item :label="$t('system.basic.currentStatus')">
              <el-tag :type="(ntpConfig.status === 'synced' || ntpConfig.status === 'active') ? 'success' : 'warning'">
                {{ getStatusText(ntpConfig.status) }}
              </el-tag>
              <span style="margin-left: 10px;">{{ $t('system.basic.currentTime') }}：{{ currentTime }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row style="margin-top: 24px;">
          <el-col :span="24">
            <el-form-item>
              <el-button type="primary" class="tech-button" @click="saveNTPConfig" :loading="ntpLoading">{{ $t('common.save') }}</el-button>
              <el-button class="tech-button-secondary" @click="resetNTPForm">{{ $t('common.reset') }}</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
  </el-card>
</template>

<script>
import { Refresh } from '@element-plus/icons-vue'

export default {
  name: 'TimeManagement',
  components: {
    Refresh // eslint-disable-line vue/no-unused-components
  },
  emits: ['load-ntp-config', 'sync-ntp', 'set-manual-time', 'sync-pc-time', 'save-ntp-config', 'reset-ntp-form', 'toggle-timezone-dropdown', 'select-timezone', 'update-ntp-mode', 'update-timezone', 'update-manual-time', 'update-ntp-server'],
  props: {
    ntpConfig: {
      type: Object,
      required: true
    },
    ntpRules: {
      type: Object,
      required: true
    },
    ntpLoading: {
      type: Boolean,
      default: false
    },
    syncLoading: {
      type: Boolean,
      default: false
    },
    setTimeLoading: {
      type: Boolean,
      default: false
    },
    manualTime: {
      type: String,
      default: ''
    },
    currentTime: {
      type: String,
      default: ''
    },
    showTimezoneDropdown: {
      type: Boolean,
      default: false
    },
    timezoneOptions: {
      type: Array,
      required: true
    }
  },
  methods: {
    loadNTPConfig() {
      this.$emit('load-ntp-config')
    },
    syncNTP() {
      this.$emit('sync-ntp')
    },
    setManualTime() {
      this.$emit('set-manual-time')
    },
    syncPCTime() {
      this.$emit('sync-pc-time')
    },
    saveNTPConfig() {
      this.$emit('save-ntp-config')
    },
    resetNTPForm() {
      this.$emit('reset-ntp-form')
    },
    toggleTimezoneDropdown() {
      this.$emit('toggle-timezone-dropdown')
    },
    selectTimezone(value) {
      this.$emit('select-timezone', value)
    },
    updateNtpMode(value) {
      this.$emit('update-ntp-mode', value)
    },
    updateTimezone(value) {
      this.$emit('update-timezone', value)
    },
    updateManualTime(value) {
      this.$emit('update-manual-time', value)
    },
    updateNtpServer(value) {
      this.$emit('update-ntp-server', value)
    },
    getSelectedTimezoneLabel() {
      const selected = this.timezoneOptions.find(option => option.value === this.ntpConfig.timezone)
      return selected ? selected.label : this.$t('system.basic.pleaseSelectTimezone')
    },
    getStatusText(status) {
      switch (status) {
        case 'synced':
          return this.$t('system.basic.statusSynced')
        case 'active':
          return this.$t('system.basic.statusActive')
        case 'sync_required':
          return this.$t('system.basic.statusSyncRequired')
        case 'unknown':
          return this.$t('system.basic.statusUnknown')
        default:
          return this.$t('system.basic.statusNotSynced')
      }
    }
  }
}
</script>

<style scoped>
/* 继承父组件的科技感样式 */

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

/* 单选框文字样式 */
.config-form :deep(.el-radio__label) {
  color: rgba(255, 255, 255, 0.85) !important;
  font-weight: 400;
  text-shadow: 0 0 4px rgba(0, 255, 255, 0.2);
}

.config-form :deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #00ffff !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
  font-weight: 500;
}

/* 输入框文字样式 */
.config-form :deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.9) !important;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.2);
}

.config-form :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
  text-shadow: none;
}

/* 日期选择器文字样式 */
.config-form :deep(.el-date-editor .el-input__inner) {
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

.tech-button-sm {
  text-shadow: 0 0 4px rgba(0, 255, 255, 0.3) !important;
  font-weight: 500 !important;
}

/* 状态标签样式 */
.config-form :deep(.el-tag) {
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  font-weight: 500;
  letter-spacing: 0.3px;
}

.config-form :deep(.el-tag.el-tag--success) {
  color: #4ade80 !important;
  text-shadow: 0 0 4px rgba(74, 222, 128, 0.3);
}

.config-form :deep(.el-tag.el-tag--warning) {
  color: #fbbf24 !important;
  text-shadow: 0 0 4px rgba(251, 191, 36, 0.3);
}

/* 当前时间显示样式 */
.config-form span[style*="margin-left"] {
  color: rgba(255, 255, 255, 0.8) !important;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 4px rgba(0, 255, 255, 0.2);
  font-weight: 400;
}

/* 自定义选择框容器 */
.custom-select-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  min-height: 32px;
}

/* 选择框触发器 */
.custom-select-trigger {
  width: 100%;
  height: 32px;
  padding: 0 12px;
  background: rgba(15, 25, 45, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1);
  line-height: 32px;
  box-sizing: border-box;
}

.custom-select-trigger:hover {
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.2);
  background: rgba(15, 25, 45, 0.9);
}

.custom-select-trigger.active {
  border-color: #00ffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  background: rgba(15, 25, 45, 1);
}

/* 选择框显示值 */
.select-value {
  flex: 1;
  text-align: left;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.2);
}

/* 箭头图标 */
.select-arrow {
  font-size: 12px;
  color: rgba(0, 255, 255, 0.7);
  transition: all 0.3s ease;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
}

.select-arrow.expanded {
  transform: rotate(180deg);
  color: #00ffff;
}

/* 下拉选项容器 */
.custom-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(15, 25, 45, 0.95);
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 6px;
  margin-top: 2px;
  max-height: 200px;
  overflow-y: auto;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.2);
}

/* 下拉选项 */
.select-option {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
}

.select-option:last-child {
  border-bottom: none;
}

.select-option:hover {
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
  box-shadow: inset 0 0 20px rgba(0, 255, 255, 0.1);
}

.select-option.selected {
  background: rgba(0, 255, 255, 0.2);
  color: #00ffff;
  font-weight: 500;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  box-shadow: inset 0 0 25px rgba(0, 255, 255, 0.15);
}

.select-option.selected:hover {
  background: rgba(0, 255, 255, 0.25);
  box-shadow: inset 0 0 30px rgba(0, 255, 255, 0.2);
}

/* 自定义滚动条 */
.custom-select-dropdown::-webkit-scrollbar {
  width: 6px;
}

.custom-select-dropdown::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.custom-select-dropdown::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.3) 0%, 
    rgba(0, 200, 255, 0.5) 50%, 
    rgba(0, 255, 255, 0.3) 100%);
  border-radius: 3px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.custom-select-dropdown::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.5) 0%, 
    rgba(0, 200, 255, 0.7) 50%, 
    rgba(0, 255, 255, 0.5) 100%);
}
</style>
