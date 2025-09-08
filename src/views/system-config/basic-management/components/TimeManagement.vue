<template>
  <el-card class="config-card tech-card mb-20" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>NTP时间设置</span>
        <div>
          <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="loadNTPConfig" :loading="ntpLoading">刷新配置</el-button>
        </div>
      </div>
    </template>
    <el-form :model="ntpConfig" :rules="ntpRules" ref="ntpFormRef" label-width="150px" class="config-form" v-loading="ntpLoading">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工作模式" prop="mode">
              <el-radio-group :model-value="ntpConfig.mode" @update:model-value="updateNtpMode">
                <el-radio label="ntp_client">NTP客户端</el-radio>
                <el-radio label="ntp_server">NTP服务器</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="ntpConfig.mode === 'ntp_client'">
            <el-form-item label="时区设置" prop="timezone">
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
            <el-form-item label="NTP服务器" prop="server">
              <el-input :model-value="ntpConfig.server" @update:model-value="updateNtpServer" placeholder="请输入NTP服务器地址"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <el-button type="primary" class="tech-button" @click="syncNTP" :loading="syncLoading">立即同步</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="ntpConfig.mode === 'ntp_server'">
          <el-col :span="12">
            <el-form-item label="手动时间" prop="manual_time">
              <el-date-picker
                :model-value="manualTime"
                @update:model-value="updateManualTime"
                type="datetime"
                placeholder="选择日期时间"
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
              <el-button type="primary" class="tech-button" @click="setManualTime" :loading="setTimeLoading">手动设置时间</el-button>
              <el-button class="tech-button-secondary" @click="syncPCTime">同步PC时间</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="当前状态">
              <el-tag :type="(ntpConfig.status === 'synced' || ntpConfig.status === 'active') ? 'success' : 'warning'">
                {{ getStatusText(ntpConfig.status) }}
              </el-tag>
              <span style="margin-left: 10px;">当前时间：{{ currentTime }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row style="margin-top: 24px;">
          <el-col :span="24">
            <el-form-item>
              <el-button type="primary" class="tech-button" @click="saveNTPConfig" :loading="ntpLoading">保存配置</el-button>
              <el-button class="tech-button-secondary" @click="resetNTPForm">重置</el-button>
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
      return selected ? selected.label : '请选择时区'
    },
    getStatusText(status) {
      switch (status) {
        case 'synced':
          return '已同步'
        case 'active':
          return '正常运行'
        case 'sync_required':
          return '需要同步'
        case 'unknown':
          return '状态未知'
        default:
          return '未同步'
      }
    }
  }
}
</script>

<style scoped>
/* 继承父组件的科技感样式 */

/* 自定义选择框容器 */
.custom-select-container {
  position: relative;
  width: 100%;
}

/* 选择框触发器 */
.custom-select-trigger {
  width: 100%;
  height: 40px;
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
