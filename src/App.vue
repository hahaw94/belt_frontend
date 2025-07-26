<template>
  <div id="app">
    <LayoutIndex />
  </div>
</template>

<script>
import LayoutIndex from './layout/index.vue'; // 引入布局组件

export default {
  name: 'App',
  components: {
    LayoutIndex // 注册布局组件
  }
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
}
</style>