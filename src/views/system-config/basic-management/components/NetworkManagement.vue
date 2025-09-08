<template>
  <el-card class="config-card tech-card mb-20" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>IP地址设置</span>
        <div>
          <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="loadNetworkConfig" :loading="networkLoading">刷新配置</el-button>
        </div>
      </div>
    </template>
    <!-- 当前网络信息显示 -->
      <div v-loading="networkLoading" style="margin-bottom: 20px;">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="当前IP地址">
            <span class="network-value">{{ currentNetworkConfig.ip_address || '获取中...' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="子网掩码">
            <span class="network-value">{{ currentNetworkConfig.subnet_mask || '获取中...' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="网关地址">
            <span class="network-value">{{ currentNetworkConfig.gateway || '获取中...' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="当前访问地址">
            <span class="network-value link-value" @click="copyToClipboard(getCurrentAccessUrl())">
              {{ getCurrentAccessUrl() }}
              <el-icon class="copy-icon"><CopyDocument /></el-icon>
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="后端配置地址">
            <span class="network-value link-value" @click="copyToClipboard(getBackendConfigUrl())">
              {{ getBackendConfigUrl() }}
              <el-icon class="copy-icon"><CopyDocument /></el-icon>
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="修改后地址" v-if="networkConfig.ip_address && networkConfig.ip_address !== currentNetworkConfig.ip_address">
            <span class="network-value preview-url" @click="copyToClipboard(getPreviewAccessUrl())">
              {{ getPreviewAccessUrl() }}
              <el-icon class="copy-icon"><CopyDocument /></el-icon>
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-form :model="networkConfig" :rules="networkRules" ref="networkFormRef" label-width="150px" class="config-form" v-loading="networkLoading">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="IP地址" prop="ip_address">
              <el-input :model-value="networkConfig.ip_address" @update:model-value="updateIpAddress" placeholder="请输入IP地址"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="子网掩码" prop="subnet_mask">
              <el-input :model-value="networkConfig.subnet_mask" @update:model-value="updateSubnetMask" placeholder="请输入子网掩码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="网关" prop="gateway">
              <el-input :model-value="networkConfig.gateway" @update:model-value="updateGateway" placeholder="请输入网关地址"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row style="margin-top: 20px;">
          <el-col :span="24">
            <el-form-item>
              <el-button type="danger" class="tech-button-danger" @click="showIPChangeDialog" :loading="networkLoading">修改IP地址</el-button>
              <el-button class="tech-button-secondary" @click="resetNetworkForm">重置</el-button>
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
  emits: ['load-network-config', 'show-ip-change-dialog', 'reset-network-form', 'copy-to-clipboard', 'update-ip-address', 'update-subnet-mask', 'update-gateway'],
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
    showIPChangeDialog() {
      this.$emit('show-ip-change-dialog')
    },
    resetNetworkForm() {
      this.$emit('reset-network-form')
    },
    copyToClipboard(text) {
      this.$emit('copy-to-clipboard', text)
    },
    getCurrentAccessUrl() {
      return this.$parent?.getCurrentAccessUrl?.() || ''
    },
    getBackendConfigUrl() {
      return this.$parent?.getBackendConfigUrl?.() || ''
    },
    getPreviewAccessUrl() {
      return this.$parent?.getPreviewAccessUrl?.() || ''
    },
    updateIpAddress(value) {
      this.$emit('update-ip-address', value)
    },
    updateSubnetMask(value) {
      this.$emit('update-subnet-mask', value)
    },
    updateGateway(value) {
      this.$emit('update-gateway', value)
    }
  }
}
</script>

<style scoped>
/* 继承父组件的科技感样式 */
</style>
