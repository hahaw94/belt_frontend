<template>
  <el-card class="config-card tech-card mb-20" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>LOGO替换</span>
        <div>
          <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="loadCurrentLogo" :loading="logoLoading">刷新</el-button>
        </div>
      </div>
    </template>
    <div v-loading="logoLoading" class="logo-management-container">
        <el-row :gutter="24">
          <el-col :span="12">
            <div class="logo-section">
              <h4 class="section-title">当前LOGO预览</h4>
              <div class="preview-container">
                <img v-if="currentLogo.url" :src="currentLogo.url" alt="当前LOGO" class="logo-image"/>
                <div v-else class="no-logo">
                  <el-icon class="no-logo-icon"><Picture /></el-icon>
                  <span>暂无自定义LOGO</span>
                </div>
              </div>
              <div v-if="currentLogo.url" class="logo-actions">
                <el-button type="danger" class="tech-button-danger" @click="deleteLogo" :loading="logoLoading">
                  恢复默认LOGO
                </el-button>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="logo-section">
              <h4 class="section-title">上传新LOGO</h4>
              <div class="upload-area">
                <!-- 上传区域 - 无预览时显示 -->
                <el-upload
                  v-if="!logoPreview"
                  ref="logoUploadRef"
                  :auto-upload="false"
                  :show-file-list="false"
                  accept=".jpg,.jpeg,.png"
                  :before-upload="beforeLogoUpload"
                  :on-change="handleLogoChange"
                  class="logo-uploader"
                >
                  <div class="upload-trigger">
                    <el-icon class="upload-icon"><Upload /></el-icon>
                    <div class="upload-text">选择文件</div>
                  </div>
                </el-upload>
                
                <!-- 预览区域 - 选择文件后显示，点击可重新选择 -->
                <div v-if="logoPreview" class="preview-container clickable" @click="triggerReselect">
                  <img :src="logoPreview" alt="预览" class="logo-image"/>
                  <div class="preview-overlay">
                    <el-icon class="overlay-icon"><Upload /></el-icon>
                    <div class="overlay-text">点击重新选择</div>
                  </div>
                </div>
                
                <!-- 操作按钮 - 有预览时显示 -->
                <div v-if="logoPreview" class="upload-actions">
                  <el-button type="primary" class="tech-button" @click="uploadLogo" :loading="uploading">
                    <el-icon><Upload /></el-icon>
                    更换
                  </el-button>
                  <el-button class="tech-button-secondary" @click="clearLogoPreview">
                    取消
                  </el-button>
                </div>
                
                <!-- 隐藏的上传组件，用于重新选择 -->
                <el-upload
                  v-show="false"
                  ref="hiddenLogoUploadRef"
                  :auto-upload="false"
                  :show-file-list="false"
                  accept=".jpg,.jpeg,.png"
                  :before-upload="beforeLogoUpload"
                  :on-change="handleLogoChange"
                >
                </el-upload>
                
                <div class="upload-tips">
                  <div class="tip-item">
                    <el-icon class="tip-icon"><InfoFilled /></el-icon>
                    <span>支持格式：JPG、PNG</span>
                  </div>
                  <div class="tip-item">
                    <el-icon class="tip-icon"><InfoFilled /></el-icon>
                    <span>文件大小：不超过2MB</span>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
  </el-card>
</template>

<script>
import { Picture, Upload, InfoFilled, Refresh } from '@element-plus/icons-vue'

export default {
  name: 'LogoManagement',
  components: {
    Picture,
    Upload,
    InfoFilled,
    Refresh // eslint-disable-line vue/no-unused-components
  },
  props: {
    currentLogo: {
      type: Object,
      required: true
    },
    logoPreview: {
      type: String,
      default: ''
    },
    logoLoading: {
      type: Boolean,
      default: false
    },
    uploading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    loadCurrentLogo() {
      this.$emit('load-current-logo')
    },
    deleteLogo() {
      this.$emit('delete-logo')
    },
    beforeLogoUpload(file) {
      return this.$parent?.beforeLogoUpload?.(file) ?? true
    },
    handleLogoChange(file) {
      this.$emit('handle-logo-change', file)
    },
    triggerReselect() {
      this.$emit('trigger-reselect')
    },
    uploadLogo() {
      this.$emit('upload-logo')
    },
    clearLogoPreview() {
      this.$emit('clear-logo-preview')
    }
  }
}
</script>

<style scoped>
.logo-management {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 继承父组件的样式 */
</style>
