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
              <!-- 自定义时区选择器 -->
              <div 
                ref="timezoneSelector"
                class="custom-timezone-selector" 
                @click="toggleTimezoneDropdown"
              >
                <div class="timezone-display">
                  <span class="timezone-text">{{ getTimezoneDisplayText() }}</span>
                  <i class="timezone-arrow" :class="{ 'expanded': showTimezoneDropdown }">▼</i>
                </div>
                <div v-if="showTimezoneDropdown" class="timezone-dropdown-custom" @click.stop>
                  <div 
                    v-for="option in timezoneOptions" 
                    :key="option.value"
                    class="timezone-option"
                    :class="{ 'selected': ntpConfig.timezone === option.value }"
                    @click="updateTimezone(option.value)"
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
    getTimezoneDisplayText() {
      return this.$parent?.getTimezoneDisplayText?.() || ''
    },
    getStatusText(status) {
      return this.$parent?.getStatusText?.(status) || status
    }
  }
}
</script>

<style scoped>
/* 继承父组件的科技感样式 */
</style>
