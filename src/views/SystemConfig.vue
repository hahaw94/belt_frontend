<template>
  <div class="page-container">
    <router-view /> </div>
</template>

<script>
export default {
  name: 'SystemConfig'
}
</script>

<style scoped>
/* 可选：为所有页面容器添加一些基本样式 */
.page-container {
  padding: 20px;
  background-color: #fff; /* 页面内容区域背景色 */
  border-radius: 8px;
  min-height: calc(100vh - 60px - 40px); /* 视口高度 - 头部高度 - 上下padding */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>