<template>
  <div class="map-management-container sub-page-content">
    <h2>地图管理</h2>
    <el-card class="mt-20" shadow="hover">
      <p>平台地图编辑功能：</p>
      <ul>
        <li>支持上传图片文件作为地图背景。</li>
        <li>摄像机点位可以自行在背景图上移动调整到合适位置。</li>
        <li>调整后的点位信息可以导出保存，保存为下次导入。</li>
        <li>平台会将点位信息用于子模块中。</li>
      </ul>
      <el-divider>地图预览 ()</el-divider>
      <div class="map-preview-placeholder">
        <el-icon :size="60" color="#DCDFE6"><LocationFilled /></el-icon>
        <p>地图预览区域</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {  ElCard, ElDivider, ElIcon } from 'element-plus'; // 导入 Element Plus 组件
import { LocationFilled } from '@element-plus/icons-vue'; // 导入图标
// 如果有需要，可以导入其他 Composition API 函数
</script>

<style scoped>
.map-management-container {
  padding: 15px;
  border-radius: 6px;
  margin-top: 0;
}
h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.mt-20 {
  margin-top: 20px;
}
ul {
  padding-left: 20px;
  color: #606266;
  line-height: 1.8;
}
.map-preview-placeholder {
  height: 250px;
  border: 1px dashed #DCDFE6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 14px;
  margin-top: 20px;
  background-color: #FAFAFA;
}
</style>