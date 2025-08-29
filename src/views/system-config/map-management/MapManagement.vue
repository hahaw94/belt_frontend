<template>
  <div class="map-management-container sub-page-content">
    <h2>地图管理</h2>

    <!-- 选项卡导航 -->
    <el-tabs v-model="activeTab" type="card" class="management-tabs">
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
.map-management-container {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.map-management-container h2 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
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
</style>