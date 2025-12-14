<template>
  <div class="device-management-container tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background"></div>
    
    <h2>{{ $t('device.deviceManagement') }}</h2>

    <!-- Tab分页 -->
    <el-tabs v-model="activeTab" class="management-tabs tech-tabs" @tab-change="handleTabChange">
      <!-- 相机管理 Tab -->
      <el-tab-pane :label="$t('device.cameraManagement')" name="camera">
        <CameraManagement />
      </el-tab-pane>

      <!-- 板卡管理 Tab -->
      <el-tab-pane :label="$t('device.boardManagement')" name="board">
        <BoardManagement />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import CameraManagement from './components/CameraManagement.vue'
import BoardManagement from './components/BoardManagement.vue'

// 当前激活的tab
const activeTab = ref('camera')

// Tab切换处理
const handleTabChange = (tabName) => {
  console.log('切换到Tab:', tabName)
  // 发送tab切换事件
  window.dispatchEvent(new CustomEvent('tab-changed', {
    detail: { newTab: tabName }
  }))
}

// 生命周期
onMounted(() => {
  console.log('设备管理页面已挂载')
})

onUnmounted(() => {
  console.log('设备管理页面已卸载')
})
</script>

<style scoped>
/* ==================== 科技感主题样式 ==================== */

/* 页面容器 */
.tech-page-container {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 20px;
  background: transparent;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* 自定义滚动条样式 - 科技感 */
.tech-page-container::-webkit-scrollbar {
  width: 8px;
  background: rgba(0, 0, 0, 0.1);
}

.tech-page-container::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.05);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.tech-page-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.3) 0%, 
    rgba(0, 200, 255, 0.5) 50%, 
    rgba(0, 255, 255, 0.3) 100%);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.tech-page-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.5) 0%, 
    rgba(0, 200, 255, 0.7) 50%, 
    rgba(0, 255, 255, 0.5) 100%);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
}

/* 科技感背景 */
.tech-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* 科技感选项卡样式 */
.tech-tabs {
  position: relative;
  z-index: 10;
}

.tech-tabs :deep(.el-tabs) {
  border: none !important;
}

.tech-tabs :deep(.el-tabs--card) {
  border: none !important;
}

.tech-tabs :deep(.el-tabs--card > .el-tabs__header) {
  border-bottom: none !important;
  background: transparent !important;
}

.tech-tabs :deep(.el-tabs--card > .el-tabs__header .el-tabs__nav-wrap) {
  border: none !important;
  background: transparent !important;
}

.tech-tabs :deep(.el-tabs--card > .el-tabs__header .el-tabs__nav) {
  border: none !important;
  background: transparent !important;
}

/* 强制覆盖ElementUI Card类型选项卡的默认样式 */
.tech-tabs :deep(.el-tabs--card > .el-tabs__header .el-tabs__item) {
  border: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  background: rgba(0, 255, 255, 0.05) !important;
  color: rgba(255, 255, 255, 0.7) !important;
  box-shadow: none !important;
  outline: none !important;
  padding: 12px 20px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
}

.tech-tabs :deep(.el-tabs--card > .el-tabs__header .el-tabs__item:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border: none !important;
  box-shadow: none !important;
}

.tech-tabs :deep(.el-tabs--card > .el-tabs__header .el-tabs__item.is-active) {
  color: #00ffff !important;
  background-color: rgba(0, 255, 255, 0.15) !important;
  border: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
  outline: none !important;
}

/* 全局强制覆盖，确保没有任何ElementUI默认样式 */
.device-management-container :deep(.el-tabs--card > .el-tabs__header .el-tabs__item) {
  border: none !important;
  border-color: transparent !important;
  background-color: rgba(0, 255, 255, 0.05) !important;
  background: rgba(0, 255, 255, 0.05) !important;
}

.device-management-container :deep(.el-tabs--card > .el-tabs__header .el-tabs__item.is-active) {
  border: none !important;
  border-color: transparent !important;
  background-color: rgba(0, 255, 255, 0.15) !important;
  background: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
}

.tech-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  border-bottom: none;
}

.tech-tabs :deep(.el-tabs__nav-wrap::after) {
  background-color: transparent !important;
}

.tech-tabs :deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-weight: 500;
  border: none !important;
  background: rgba(0, 255, 255, 0.05) !important;
  border-radius: 8px 8px 0 0 !important;
  margin-right: 2px !important;
  transition: all 0.3s ease !important;
}

.tech-tabs :deep(.el-tabs__item:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.tech-tabs :deep(.el-tabs__item.is-active) {
  color: #00ffff !important;
  background: rgba(0, 255, 255, 0.15) !important;
  border: none !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

.tech-tabs :deep(.el-tabs__active-bar) {
  background-color: #00ffff !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.tech-tabs :deep(.el-tabs__content) {
  position: relative;
  z-index: 10;
  background: transparent;
  border: none !important;
}

.device-management-container {
  display: flex;
  flex-direction: column;
}

.device-management-container h2 {
  margin: 24px 0 20px 0;
  color: #00ffff;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  position: relative;
  z-index: 10;
}

.management-tabs {
  flex: 0 0 auto;
  border: none !important;
}

.management-tabs :deep(.el-tabs__content) {
  padding: 20px 0 0 0;
  border: none !important;
  overflow: visible !important;
}

.management-tabs :deep(.el-tab-pane) {
  height: auto !important;
  border: none !important;
  overflow: visible !important;
}

.management-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.management-tabs :deep(.el-tabs__nav-wrap) {
  padding-left: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .device-management-container {
    padding: 10px;
  }
  
  .device-management-container h2 {
    font-size: 20px;
    margin: 16px 0;
  }
  
  .management-tabs :deep(.el-tabs--card > .el-tabs__header .el-tabs__item) {
    padding: 10px 15px;
    font-size: 13px;
  }
}

/* ==================== 输入框和表单样式 ==================== */

/* 输入框通用样式 */
:deep(.el-input__wrapper) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 4px !important;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #00ffff !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.4) !important;
}

:deep(.el-input__inner) {
  color: #ffffff !important;
  background: transparent !important;
  text-shadow: 0 0 3px rgba(255, 255, 255, 0.3) !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 选择器样式 */
:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-select .el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
}

/* 下拉面板样式 */
:deep(.el-select-dropdown) {
  background: rgba(0, 20, 40, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item) {
  color: #ffffff !important;
  background: transparent !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}

/* 表单标签样式 */
:deep(.el-form-item__label) {
  color: #ffffff !important;
  text-shadow: 0 0 3px rgba(255, 255, 255, 0.3) !important;
  font-weight: 500;
}

/* 文本区域样式 */
:deep(.el-textarea__inner) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
  border-radius: 4px !important;
}

:deep(.el-textarea__inner:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-textarea__inner:focus) {
  border-color: #00ffff !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
}

/* 数字输入框样式 */
:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__wrapper) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

/* 上传组件样式 */
:deep(.el-upload) {
  border: 1px dashed rgba(0, 255, 255, 0.3) !important;
  background: rgba(0, 20, 40, 0.3) !important;
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.el-upload:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.2) !important;
}

/* 对话框样式 */
:deep(.el-dialog) {
  background: rgba(0, 20, 40, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.el-dialog__header) {
  background: transparent !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-dialog__title) {
  color: #00ffff !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-dialog__body) {
  background: transparent !important;
  color: #ffffff !important;
}

/* 表格样式 */
:deep(.el-table) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
}

:deep(.el-table th) {
  background: rgba(0, 30, 60, 0.8) !important;
  color: #00ffff !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-table td) {
  background: transparent !important;
  color: #ffffff !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-table tr:hover td) {
  background: rgba(0, 255, 255, 0.1) !important;
}

/* 分页样式 */
:deep(.el-pagination) {
  color: #ffffff !important;
  background: transparent !important;
}

:deep(.el-pagination .el-pager li) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
  border-radius: 4px !important;
  margin: 0 2px !important;
}

:deep(.el-pagination .el-pager li:hover) {
  color: #00ffff !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-pagination .el-pager li.active) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  border-color: #00ffff !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3) !important;
}

/* 分页按钮样式 */
:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
  border-radius: 4px !important;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  color: #00ffff !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-pagination .btn-prev:disabled),
:deep(.el-pagination .btn-next:disabled) {
  background: rgba(0, 20, 40, 0.3) !important;
  border-color: rgba(0, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.3) !important;
}

/* 分页输入框和选择器样式 */
:deep(.el-pagination .el-select) {
  background: transparent !important;
}

:deep(.el-pagination .el-select .el-input__wrapper) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
}

:deep(.el-pagination .el-select .el-input__inner) {
  color: #ffffff !important;
  background: transparent !important;
}

:deep(.el-pagination .el-input) {
  background: transparent !important;
}

:deep(.el-pagination .el-input .el-input__wrapper) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
}

:deep(.el-pagination .el-input .el-input__inner) {
  color: #ffffff !important;
  background: transparent !important;
}

/* 分页总数文字样式 */
:deep(.el-pagination__total) {
  color: #ffffff !important;
}

:deep(.el-pagination__jump) {
  color: #ffffff !important;
}

:deep(.el-pagination__sizes) {
  color: #ffffff !important;
}

/* ==================== 科技感按钮样式 ==================== */

/* 科技感主要按钮 */
:deep(.tech-button) {
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2) !important;
  padding: 8px 16px !important;
  font-weight: 500 !important;
}

:deep(.tech-button:hover) {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-1px) !important;
  border-color: rgba(0, 255, 255, 0.6) !important;
}

/* 科技感小按钮 */
:deep(.tech-button-sm) {
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2) !important;
}

:deep(.tech-button-sm:hover) {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-1px) !important;
}

/* 科技感次要按钮 */
:deep(.tech-button-secondary) {
  border: 1px solid rgba(128, 128, 128, 0.4) !important;
  background: rgba(64, 64, 64, 0.1) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 8px rgba(128, 128, 128, 0.1) !important;
  padding: 8px 16px !important;
}

:deep(.tech-button-secondary:hover) {
  background: rgba(128, 128, 128, 0.2) !important;
  box-shadow: 0 0 15px rgba(128, 128, 128, 0.3) !important;
  transform: translateY(-1px) !important;
  color: #ffffff !important;
  border-color: rgba(128, 128, 128, 0.6) !important;
}

/* 科技感危险按钮 */
:deep(.tech-button-danger) {
  border: 1px solid rgba(255, 82, 82, 0.4) !important;
  background: rgba(255, 82, 82, 0.1) !important;
  color: #ff5252 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(255, 82, 82, 0.2) !important;
  padding: 8px 16px !important;
  font-weight: 500 !important;
}

:deep(.tech-button-danger:hover) {
  background: rgba(255, 82, 82, 0.2) !important;
  box-shadow: 0 0 20px rgba(255, 82, 82, 0.4) !important;
  transform: translateY(-1px) !important;
  border-color: rgba(255, 82, 82, 0.6) !important;
}

/* 科技感信息按钮 */
:deep(.tech-button-info) {
  border: 1px solid rgba(64, 158, 255, 0.4) !important;
  background: rgba(64, 158, 255, 0.1) !important;
  color: #409eff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.2) !important;
  padding: 8px 16px !important;
  font-weight: 500 !important;
}

:deep(.tech-button-info:hover) {
  background: rgba(64, 158, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.4) !important;
  transform: translateY(-1px) !important;
  border-color: rgba(64, 158, 255, 0.6) !important;
}

/* 科技感成功按钮 */
:deep(.tech-button-success) {
  border: 1px solid rgba(103, 194, 58, 0.4) !important;
  background: rgba(103, 194, 58, 0.1) !important;
  color: #67c23a !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(103, 194, 58, 0.2) !important;
  padding: 8px 16px !important;
  font-weight: 500 !important;
}

:deep(.tech-button-success:hover) {
  background: rgba(103, 194, 58, 0.2) !important;
  box-shadow: 0 0 20px rgba(103, 194, 58, 0.4) !important;
  transform: translateY(-1px) !important;
  border-color: rgba(103, 194, 58, 0.6) !important;
}

/* 科技感警告按钮 */
:deep(.tech-button-warning) {
  border: 1px solid rgba(230, 162, 60, 0.4) !important;
  background: rgba(230, 162, 60, 0.1) !important;
  color: #e6a23c !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(230, 162, 60, 0.2) !important;
  padding: 8px 16px !important;
  font-weight: 500 !important;
}

:deep(.tech-button-warning:hover) {
  background: rgba(230, 162, 60, 0.2) !important;
  box-shadow: 0 0 20px rgba(230, 162, 60, 0.4) !important;
  transform: translateY(-1px) !important;
  border-color: rgba(230, 162, 60, 0.6) !important;
}

/* 科技感文本按钮 */
:deep(.tech-button-text) {
  background: transparent !important;
  border: 1px solid transparent !important;
  color: #00ffff !important;
  padding: 4px 8px !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
}

:deep(.tech-button-text:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  border-color: rgba(0, 255, 255, 0.3) !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.tech-button-text.tech-button-danger) {
  color: #ff5252 !important;
}

:deep(.tech-button-text.tech-button-danger:hover) {
  background: rgba(255, 82, 82, 0.1) !important;
  border-color: rgba(255, 82, 82, 0.3) !important;
  box-shadow: 0 0 8px rgba(255, 82, 82, 0.2) !important;
}

:deep(.tech-button-text.tech-button-info) {
  color: #409eff !important;
}

:deep(.tech-button-text.tech-button-info:hover) {
  background: rgba(64, 158, 255, 0.1) !important;
  border-color: rgba(64, 158, 255, 0.3) !important;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.2) !important;
}

/* 科技感按钮组 */
:deep(.tech-button-group .el-button) {
  border: 1px solid rgba(128, 128, 128, 0.4) !important;
  background: rgba(64, 64, 64, 0.1) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.tech-button-group .el-button:hover) {
  background: rgba(128, 128, 128, 0.2) !important;
  border-color: rgba(128, 128, 128, 0.6) !important;
  color: #ffffff !important;
}

/* 按钮样式兼容 */
:deep(.el-button--primary) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  color: #00ffff !important;
}

:deep(.el-button--primary:hover) {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

/* ==================== 文字和间距优化 ==================== */

/* 按钮间距优化 */
.el-button + .el-button {
  margin-left: 16px !important;
}

/* 增加文字行间距 */
:deep(p), :deep(div), :deep(span) {
  line-height: 1.6 !important;
}

/* 段落间距优化 */
:deep(.el-card__body p) {
  margin-bottom: 16px !important;
}

:deep(.el-card__body p:last-child) {
  margin-bottom: 0 !important;
}

/* 表格行间距优化 */
:deep(.el-table .el-table__row) {
  height: 50px !important;
}

/* 描述列表间距优化 */
:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell) {
  padding: 16px 12px !important;
  line-height: 1.6 !important;
}

/* 表单项间距优化 */
:deep(.el-form-item) {
  margin-bottom: 28px !important;
}

/* 其他文本颜色调整 */
:deep(.tab-content p),
:deep(.tab-content span),
:deep(.tab-content div) {
  color: #ffffff !important;
}
</style>

<!-- 全局样式覆盖 - 强制去除ElementUI Card类型选项卡的白边 -->
<style>
/* 最高优先级样式覆盖 */
.el-tabs--card > .el-tabs__header .el-tabs__item {
  border: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  background: rgba(0, 255, 255, 0.05) !important;
  background-color: rgba(0, 255, 255, 0.05) !important;
  border-color: transparent !important;
  box-shadow: none !important;
  outline: none !important;
}

.el-tabs--card > .el-tabs__header .el-tabs__item:hover {
  border: none !important;
  border-color: transparent !important;
  background: rgba(0, 255, 255, 0.1) !important;
  background-color: rgba(0, 255, 255, 0.1) !important;
  box-shadow: none !important;
}

.el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
  border: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  border-color: transparent !important;
  background: rgba(0, 255, 255, 0.15) !important;
  background-color: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5) !important;
}

.el-tabs--card > .el-tabs__header {
  border-bottom: none !important;
  background: transparent !important;
}

.el-tabs--card {
  border: none !important;
}

.el-tabs--border-card {
  border: none !important;
  background: transparent !important;
}

.el-tabs--border-card > .el-tabs__header {
  border-bottom: none !important;
  background: transparent !important;
}

.el-tabs--border-card > .el-tabs__header .el-tabs__item {
  border: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  background: rgba(0, 255, 255, 0.05) !important;
  background-color: rgba(0, 255, 255, 0.05) !important;
  border-color: transparent !important;
  color: rgba(255, 255, 255, 0.7) !important;
}

.el-tabs--border-card > .el-tabs__header .el-tabs__item:hover {
  border: none !important;
  border-color: transparent !important;
  background: rgba(0, 255, 255, 0.1) !important;
  background-color: rgba(0, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active {
  border: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  border-color: transparent !important;
  background: rgba(0, 255, 255, 0.15) !important;
  background-color: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5) !important;
}

.el-tabs--border-card > .el-tabs__content {
  border: none !important;
  background: transparent !important;
}

/* 默认类型tabs样式覆盖 */
.el-tabs .el-tabs__header .el-tabs__item {
  border: none !important;
  background: rgba(0, 255, 255, 0.05) !important;
  color: rgba(255, 255, 255, 0.7) !important;
  padding: 12px 20px !important;
  margin-right: 2px !important;
  border-radius: 8px 8px 0 0 !important;
}

.el-tabs .el-tabs__header .el-tabs__item:hover {
  background: rgba(0, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border: none !important;
}

.el-tabs .el-tabs__header .el-tabs__item.is-active {
  background: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
  border: none !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

.el-tabs .el-tabs__header {
  border-bottom: none !important;
}

.el-tabs .el-tabs__nav-wrap::after {
  background-color: transparent !important;
}

/* 针对设备管理页面的特定覆盖 */
.device-management-container .el-tabs--card > .el-tabs__header .el-tabs__item {
  border: none !important;
  border-color: transparent !important;
  background: rgba(0, 255, 255, 0.05) !important;
}

.device-management-container .el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
  border: none !important;
  border-color: transparent !important;
  background: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
}
</style>
