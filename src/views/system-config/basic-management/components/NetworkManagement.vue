<template>
  <el-card class="config-card tech-card mb-20" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>{{ $t('system.basic.ipAddress') }}</span>
        <div>
          <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="loadNetworkConfig" :loading="networkLoading">{{ $t('common.refresh') }}</el-button>
        </div>
      </div>
    </template>
    <!-- 当前网络信息显示 -->
      <div v-loading="networkLoading" style="margin-bottom: 20px;">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('system.basic.ipAddress')">
            <span class="network-value">{{ currentNetworkConfig.ip_address || $t('common.loading') }}</span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('system.basic.subnetMask')">
            <span class="network-value">{{ currentNetworkConfig.subnet_mask || $t('common.loading') }}</span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('system.basic.gateway')">
            <span class="network-value">{{ currentNetworkConfig.gateway || $t('common.loading') }}</span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('system.basic.port')">
            <span class="network-value">{{ currentNetworkConfig.port || $t('common.loading') }}</span>
            <el-button type="primary" size="small" class="tech-button-sm ml-10" @click="showPortChangeDialog" :loading="networkLoading">{{ $t('common.edit') }}</el-button>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('system.basic.currentAccessUrl')">
            <span class="network-value link-value" @click="copyToClipboard(getCurrentAccessUrl())">
              {{ getCurrentAccessUrl() }}
              <el-icon class="copy-icon"><CopyDocument /></el-icon>
            </span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('system.basic.systemConfigUrl')">
            <span class="network-value link-value" @click="copyToClipboard(getBackendConfigUrl())">
              {{ getBackendConfigUrl() }}
              <el-icon class="copy-icon"><CopyDocument /></el-icon>
            </span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('system.basic.modifiedUrl')" v-if="hasNetworkChanges()">
            <span class="network-value preview-url" @click="copyToClipboard(getPreviewAccessUrl())">
              {{ getPreviewAccessUrl() }}
              <el-icon class="copy-icon"><CopyDocument /></el-icon>
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-form :model="networkConfig" :rules="networkRules" ref="networkFormRef" label-width="120px" class="config-form" v-loading="networkLoading">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item :label="$t('system.basic.ipAddress')" prop="ip_address">
              <el-input :model-value="networkConfig.ip_address" @update:model-value="updateIpAddress" :placeholder="$t('common.pleaseInput') + $t('system.basic.ipAddress')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('system.basic.subnetMask')" prop="subnet_mask">
              <el-input :model-value="networkConfig.subnet_mask" @update:model-value="updateSubnetMask" :placeholder="$t('common.pleaseInput') + $t('system.basic.subnetMask')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('system.basic.gateway')" prop="gateway">
              <el-input :model-value="networkConfig.gateway" @update:model-value="updateGateway" :placeholder="$t('common.pleaseInput') + $t('system.basic.gateway')"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row style="margin-top: 20px;">
          <el-col :span="24">
            <el-form-item>
              <el-button type="danger" class="tech-button-danger" @click="showNetworkChangeDialog" :loading="networkLoading">{{ $t('system.basic.modifyNetworkConfig') }}</el-button>
              <el-button class="tech-button-secondary" @click="resetNetworkForm">{{ $t('common.reset') }}</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        </el-form>
  </el-card>
</template>

<script>
import { CopyDocument, Refresh } from '@element-plus/icons-vue'

export default {
  name: 'NetworkManagement',
  components: {
    CopyDocument,
    Refresh // eslint-disable-line vue/no-unused-components
  },
  emits: ['load-network-config', 'show-network-change-dialog', 'reset-network-form', 'copy-to-clipboard', 'update-ip-address', 'update-subnet-mask', 'update-gateway', 'update-port', 'show-port-change-dialog'],
  props: {
    networkConfig: {
      type: Object,
      required: true
    },
    currentNetworkConfig: {
      type: Object,
      required: true
    },
    networkRules: {
      type: Object,
      required: true
    },
    networkLoading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    loadNetworkConfig() {
      this.$emit('load-network-config')
    },
    showNetworkChangeDialog() {
      this.$emit('show-network-change-dialog')
    },
    resetNetworkForm() {
      this.$emit('reset-network-form')
    },
    copyToClipboard(text) {
      this.$emit('copy-to-clipboard', text)
    },
    getCurrentAccessUrl() {
      // 获取当前浏览器地址栏的地址
      return window.location.origin
    },
    getBackendConfigUrl() {
      const ip = this.currentNetworkConfig.ip_address || 'localhost'
      const port = this.currentNetworkConfig.port || '8080'
      return `http://${ip}:${port}`
    },
    getPreviewAccessUrl() {
      const ip = this.networkConfig.ip_address || 'localhost'
      const port = this.networkConfig.port || this.currentNetworkConfig.port || '8080'
      return `http://${ip}:${port}`
    },
    hasNetworkChanges() {
      return (
        this.networkConfig.ip_address !== this.currentNetworkConfig.ip_address ||
        this.networkConfig.subnet_mask !== this.currentNetworkConfig.subnet_mask ||
        this.networkConfig.gateway !== this.currentNetworkConfig.gateway ||
        this.networkConfig.port !== this.currentNetworkConfig.port
      )
    },
    updateIpAddress(value) {
      this.$emit('update-ip-address', value)
    },
    updateSubnetMask(value) {
      this.$emit('update-subnet-mask', value)
    },
    updateGateway(value) {
      this.$emit('update-gateway', value)
    },
    updatePort(value) {
      this.$emit('update-port', value)
    },
    showPortChangeDialog() {
      this.$emit('show-port-change-dialog')
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

/* 输入框文字样式 */
.config-form :deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.9) !important;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.2);
}

.config-form :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
  text-shadow: none;
}

/* 按钮文字增强 */
.tech-button-sm {
  text-shadow: 0 0 4px rgba(0, 255, 255, 0.3) !important;
  font-weight: 500 !important;
}

.tech-button-danger {
  text-shadow: 0 0 6px rgba(245, 108, 108, 0.4) !important;
  font-weight: 500 !important;
  letter-spacing: 0.5px;
}

.tech-button-secondary {
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.3) !important;
  font-weight: 400 !important;
}

/* 描述标签样式 */
:deep(.el-descriptions-item__label) {
  color: rgba(0, 255, 255, 0.9) !important;
  font-weight: 500;
  text-shadow: 0 0 6px rgba(0, 255, 255, 0.3);
}

/* 网络值样式优化 */
.network-value {
  color: rgba(255, 255, 255, 0.9) !important;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.2);
  font-family: inherit;
}

/* 描述列表样式调整 - 完全按照版本管理样式 */
:deep(.el-descriptions) {
  background: transparent !important;
}

:deep(.el-descriptions__body) {
  background: transparent !important;
}

:deep(.el-descriptions__body .el-descriptions__table) {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell) {
  background: rgba(25, 35, 55, 0.6) !important;
  color: #ffffff !important;
  border: 1px solid rgba(0, 255, 255, 0.1) !important;
  padding: 16px 12px !important;
  transition: all 0.3s ease !important;
}

:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell:nth-child(even)) {
  background: rgba(20, 30, 50, 0.7) !important;
}

:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell:hover) {
  background: rgba(0, 255, 255, 0.08) !important;
  box-shadow: inset 0 1px 0 rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__label) {
  color: #00ffff !important;
  font-weight: 600 !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3) !important;
  background: rgba(20, 35, 60, 0.8) !important;
  border-right: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__content) {
  background: rgba(25, 35, 55, 0.6) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 500 !important;
}

/* 确保表格第一行和最后一行的圆角 */
:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell:first-child) {
  border-top-left-radius: 8px !important;
}

:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell:nth-child(2)) {
  border-top-right-radius: 8px !important;
}

:deep(.el-descriptions__body .el-descriptions__table tr:last-child .el-descriptions__cell:first-child) {
  border-bottom-left-radius: 8px !important;
}

:deep(.el-descriptions__body .el-descriptions__table tr:last-child .el-descriptions__cell:last-child) {
  border-bottom-right-radius: 8px !important;
}
.url-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
  font-style: italic;
}

.network-value {
  color: rgba(255, 255, 255, 0.9);
}

.link-value {
  cursor: pointer;
  transition: all 0.3s ease;
}

.link-value:hover {
  color: #00ffff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
}

.copy-icon {
  margin-left: 8px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.link-value:hover .copy-icon {
  opacity: 1;
}

.preview-url {
  color: #409EFF;
  font-weight: 500;
}

.ml-10 {
  margin-left: 10px;
}
</style>
