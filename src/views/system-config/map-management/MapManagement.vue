<template>
  <div class="map-management-container tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background">
    </div>
    
    <h2>地图管理</h2>

    <!-- 选项卡导航 -->
    <el-tabs v-model="activeTab" type="card" class="management-tabs tech-tabs">
      <el-tab-pane label="图层管理" name="layers">
        <LayerManagement />
      </el-tab-pane>
      <el-tab-pane label="相机管理" name="cameras">
        <CameraManagement />
      </el-tab-pane>
      <el-tab-pane label="地图配置" name="config">
        <MapConfiguration />
      </el-tab-pane>
      <el-tab-pane label="备份恢复" name="backup">
        <BackupRestore />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import LayerManagement from './components/LayerManagement.vue'
import CameraManagement from './components/CameraManagement.vue'
import MapConfiguration from './components/MapConfiguration.vue'
import BackupRestore from './components/BackupRestore.vue'

export default {
  name: 'MapManagement',
  components: {
    LayerManagement,
    CameraManagement,
    MapConfiguration,
    BackupRestore
  },
  data() {
  return {
      activeTab: 'layers'
    }
  },
  mounted() {
    // 根据路由参数设置默认选项卡
    const tab = this.$route.query.tab
    if (tab && ['layers', 'cameras', 'config', 'backup'].includes(tab)) {
      this.activeTab = tab
    }
  },
  watch: {
    activeTab(newTab) {
      // 更新路由参数
      if (this.$route.query.tab !== newTab) {
        this.$router.replace({
          ...this.$route,
          query: { ...this.$route.query, tab: newTab }
        })
      }
    }
  }
}
</script>

<style scoped>
/* ==================== 科技感主题样式 ==================== */

/* 页面容器 */
.tech-page-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  max-height: 100vh;
  padding: 20px;
  padding-bottom: 40px;
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

.tech-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.tech-tabs :deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(0, 255, 255, 0.2) !important;
}

.tech-tabs :deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-weight: 500;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
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
  border-color: #00ffff !important;
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
}

.map-management-container {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.map-management-container h2 {
  margin: 0 0 20px 0;
  color: #00ffff;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  position: relative;
  z-index: 10;
}

.management-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.management-tabs :deep(.el-tabs__content) {
  flex: 1;
  padding: 20px 0 0 0;
  display: flex;
  flex-direction: column;
}

.management-tabs :deep(.el-tab-pane) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.management-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.management-tabs :deep(.el-tabs__nav-wrap) {
  padding-left: 0;
}

/* 选项卡样式优化 */
.management-tabs :deep(.el-tabs--card > .el-tabs__header .el-tabs__item) {
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
}

.management-tabs :deep(.el-tabs--card > .el-tabs__header .el-tabs__item.is-active) {
  color: #409eff;
  background-color: #fff;
  border-bottom-color: #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .map-management-container {
    padding: 15px;
    height: calc(100vh - 100px);
  }
  
  .map-management-container h2 {
    font-size: 20px;
    margin-bottom: 15px;
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
}

:deep(.el-pagination .el-pager li) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
}

:deep(.el-pagination .el-pager li:hover) {
  color: #00ffff !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-pagination .el-pager li.active) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  border-color: #00ffff !important;
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