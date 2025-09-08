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
        <!-- 左侧：当前LOGO预览 -->
        <el-col :span="12">
          <div class="logo-section">
            <h4 class="section-title">当前LOGO预览</h4>
            <div class="current-logo-preview">
              <div v-if="currentLogo.url" class="logo-display">
                <img :src="currentLogo.url" alt="当前LOGO" class="current-logo-image"/>
              </div>
              <div v-else class="no-logo">
                <el-icon class="no-logo-icon"><Picture /></el-icon>
                <span>暂无自定义LOGO</span>
              </div>
            </div>
            <div v-if="currentLogo.url" class="current-logo-actions">
              <el-button type="danger" size="small" @click="deleteLogo" :loading="logoLoading">
                恢复默认LOGO
              </el-button>
            </div>
          </div>
        </el-col>
        
        <!-- 右侧：上传新LOGO -->
        <el-col :span="12">
          <div class="logo-section">
            <h4 class="section-title">上传新LOGO</h4>
            <div class="upload-area">
              <!-- 新预览区域 - 选择新文件后显示 -->
              <div v-if="logoPreview" class="new-preview-container">
                <div class="preview-box" @click="triggerReselect">
                  <img :src="logoPreview" alt="预览" class="preview-logo-image"/>
                  <div class="preview-overlay">
                    <el-icon class="overlay-icon"><Upload /></el-icon>
                    <div class="overlay-text">点击重新选择</div>
                  </div>
                </div>
                <div class="preview-actions">
                  <el-button type="primary" size="small" @click="uploadLogo" :loading="uploading">
                    <el-icon><Upload /></el-icon>
                    确认更换
                  </el-button>
                  <el-button size="small" @click="clearLogoPreview">
                    取消
                  </el-button>
                </div>
              </div>
              
              <!-- 上传区域 - 无预览时显示 -->
              <el-upload
                v-else
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
              
              <!-- 上传提示信息 -->
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
import { ElMessage } from 'element-plus'

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
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        ElMessage.error('LOGO只能是 JPG/PNG 格式!')
        return false
      }
      if (!isLt2M) {
        ElMessage.error('LOGO大小不能超过 2MB!')
        return false
      }
      return true
    },
    handleLogoChange(file) {
      this.$emit('handle-logo-change', file)
    },
    triggerUpload() {
      // 触发文件选择器
      this.$refs.hiddenLogoUploadRef?.$el?.querySelector('input')?.click()
    },
    triggerReselect() {
      // 触发重新选择文件
      this.$refs.hiddenLogoUploadRef?.$el?.querySelector('input')?.click()
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
.logo-management-container {
  padding: 20px;
}

.logo-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

/* 强制Element Plus栅格系统填满宽度 */
.logo-management-container :deep(.el-row) {
  width: 100%;
  margin: 0;
}

.logo-management-container :deep(.el-col) {
  width: 50% !important;
  padding: 0 12px;
}

.logo-management-container :deep(.el-col:first-child) {
  padding-left: 0;
}

.logo-management-container :deep(.el-col:last-child) {
  padding-right: 0;
}

.section-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 16px 0;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.3);
}

/* 左侧：当前LOGO预览 */
.current-logo-preview {
  position: relative;
  width: 100%;
  height: 220px;
  background: rgba(15, 25, 45, 0.8);
  border: 2px dashed rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.logo-display {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.current-logo-image {
  max-width: 350px;
  max-height: 180px;
  object-fit: contain;
  filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.3));
}

.no-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.no-logo-icon {
  font-size: 80px;
  color: rgba(0, 255, 255, 0.4);
}

.current-logo-actions {
  display: flex;
  justify-content: center;
}

/* 右侧：上传新LOGO */
.upload-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  width: 100% !important;
  min-width: 100%;
  box-sizing: border-box;
}

.logo-uploader {
  width: 100% !important;
  min-width: 100%;
}

/* 强制Element Plus上传组件填满宽度 */
.logo-uploader :deep(.el-upload) {
  width: 100% !important;
  min-width: 100%;
}

.logo-uploader :deep(.el-upload-dragger) {
  width: 100% !important;
  min-width: 100%;
  border: none !important;
  background: transparent !important;
}

.upload-trigger {
  width: 100% !important;
  min-width: 100%;
  height: 220px;
  background: rgba(15, 25, 45, 0.8);
  border: 2px dashed rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 12px;
  box-sizing: border-box;
}

.upload-trigger:hover {
  border-color: rgba(0, 255, 255, 0.6);
  background: rgba(15, 25, 45, 1);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
}

.upload-icon {
  font-size: 64px;
  color: rgba(0, 255, 255, 0.7);
}

.upload-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.3);
}

/* 新预览区域样式 */
.new-preview-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100% !important;
  min-width: 100%;
}

.preview-box {
  position: relative;
  width: 100% !important;
  min-width: 100%;
  height: 220px;
  background: rgba(15, 25, 45, 0.8);
  border: 2px solid rgba(0, 255, 255, 0.5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.preview-box:hover {
  border-color: rgba(0, 255, 255, 0.8);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

.preview-logo-image {
  max-width: 350px;
  max-height: 180px;
  object-fit: contain;
  filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.3));
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  gap: 8px;
}

.preview-box:hover .preview-overlay {
  opacity: 1;
}

.overlay-icon {
  font-size: 24px;
  color: rgba(0, 255, 255, 0.9);
}

.overlay-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.3);
}

.preview-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 上传提示信息 */
.upload-tips {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(15, 25, 45, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 6px;
  backdrop-filter: blur(5px);
  margin-top: auto;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.tip-icon {
  color: rgba(0, 255, 255, 0.6);
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .logo-management-container {
    padding: 16px;
  }
  
  .current-logo-preview,
  .upload-trigger,
  .preview-box {
    height: 180px;
  }
  
  .current-logo-image,
  .preview-logo-image {
    max-width: 250px;
    max-height: 140px;
  }
  
  .upload-icon {
    font-size: 48px;
  }
  
  .no-logo-icon {
    font-size: 60px;
  }
}
</style>
