<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* 这里放置全局的 CSS 样式 */
html, body, #app {
  margin: 0;
  padding: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh; /* 确保 html, body, #app 都占满整个视口高度 */
  overflow: hidden; /* 隐藏全局滚动条，由内部的 el-main 控制 */
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%); /* 添加科技感背景 */
}

/* 全局强制覆盖Element Plus下拉菜单样式 - 最高优先级 */
body .el-dropdown-menu,
html .el-dropdown-menu,
#app .el-dropdown-menu {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  backdrop-filter: blur(12px) !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6) !important;
}

body .el-popper,
html .el-popper,
#app .el-popper {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
}

/* 强制覆盖所有可能的popper类 */
.el-popper.el-dropdown__popper {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
}
</style>