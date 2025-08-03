<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <el-header class="layout-header">
        <div class="header-left">
          <img src="../assets/logo.png" alt="Logo" class="app-logo" />
          <span class="app-title">后台管理系统</span>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-avatar :size="30" :src="userAvatarUrl"></el-avatar>
              <span style="margin-left: 8px;">管理员</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-container class="layout-body-container">
        <el-aside :width="isCollapse ? '64px' : '200px'" class="layout-aside">
          <el-menu
              :default-active="$route.path"
              class="el-menu-vertical-demo"
              :collapse="isCollapse"
              router
              background-color="#545c64"
              text-color="#fff"
              active-text-color="#ffd04b"
          >
            <div class="collapse-toggle" @click="toggleCollapse">
              <el-icon v-if="isCollapse"><Expand /></el-icon>
              <el-icon v-else><Fold /></el-icon>
            </div>

            <el-menu-item index="/dashboard">
              <el-icon><HomeFilled /></el-icon>
              <template #title>首页/总览</template>
            </el-menu-item>

            <el-sub-menu index="/system-config">
              <template #title>
                <el-icon><Setting /></el-icon>
                <span>系统配置</span>
              </template>
              <el-menu-item index="/system-config/basic-management">基础管理</el-menu-item>
              <el-menu-item index="/system-config/version-management">版本管理</el-menu-item>
              <el-menu-item index="/system-config/map-management">地理管理</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="/algorithm">
              <template #title>
                <el-icon><Cpu /></el-icon>
                <span>算法配置</span>
              </template>
              <el-menu-item index="/algorithm/upload">算法仓</el-menu-item>
              <el-menu-item index="/algorithm/config">算法配置</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="/usermanagement">
              <template #title>
                <el-icon><User /></el-icon>
                <span>用户管理</span>
              </template>
              <el-menu-item index="/usermanagement/user-management-manage">用户管理</el-menu-item>
              <el-menu-item index="/usermanagement/role-management">角色管理</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="/access">
              <template #title>
                <el-icon><Connection /></el-icon>
                <span>接入管理</span>
              </template>
              <el-menu-item index="/access/device">设备管理</el-menu-item>
<!--              <el-menu-item index="/access/info">设备信息</el-menu-item>-->
<!--              <el-menu-item index="/access/protocol">设备接入协议</el-menu-item>-->
            </el-sub-menu>

            <el-sub-menu index="/detection">
              <template #title>
                <el-icon><Monitor /></el-icon>
                <span>实时检测</span>
              </template>
              <el-menu-item index="/detection/realtime">实时检测</el-menu-item>
              <el-menu-item index="/detection/playback">录像回放</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="/recording">
              <template #title>
                <el-icon><VideoCamera /></el-icon>
                <span>录像管理</span>
              </template>
              <el-menu-item index="/recording/list">录像列表</el-menu-item>
              <el-menu-item index="/recording/statistics">录像统计</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="/event">
              <template #title>
                <el-icon><Bell /></el-icon>
                <span>事件中心</span>
              </template>
              <el-menu-item index="/event/alarm-display">告警信息展示</el-menu-item>
              <el-menu-item index="/event/data-collection">告警数据收集</el-menu-item>
              <el-menu-item index="/event/immediate-command">即时告警批示</el-menu-item>
              <el-menu-item index="/event/linkage-settings">告警联动设置</el-menu-item>
              <el-menu-item index="/event/warning-push">预警推送</el-menu-item>
            </el-sub-menu>

            <el-menu-item index="/log">
              <el-icon><Document /></el-icon>
              <template #title>日志中心</template>
            </el-menu-item>

            <el-menu-item index="/statistics">
              <el-icon><TrendCharts /></el-icon>
              <template #title>统计分析</template>
            </el-menu-item>

          </el-menu>
        </el-aside>

        <el-main class="layout-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { ref,  } from 'vue';
// import { useRoute } from 'vue-router';
// 引入 Element Plus 的图标组件，如果全局注册了，这里就不需要单独引入了，但为了清晰性可以保留
// import { ArrowDown, Expand, Fold, HomeFilled, Setting, Cpu, User, Connection, Monitor, Bell, Document, TrendCharts } from '@element-plus/icons-vue';

export default {
  name: 'LayoutIndex',
  setup() {
    // const route = useRoute();
    const userAvatarUrl = ref('https://cube.elemecdn.com/0/88/03b0d4153c31b21f7da7534d36da500d.jpeg'); // 示例头像URL
    const isCollapse = ref(false); // 侧边栏是否折叠

    // 退出登录方法
    const handleLogout = () => {
      // 实际业务中，这里会执行清除用户凭证、重定向到登录页等操作
      alert('退出登录');
      // 例如: router.push('/login');
    };

    const toggleCollapse = () => {
      isCollapse.value = !isCollapse.value;
    };

    // 可以在这里添加一些逻辑，例如根据路由修改面包屑导航等

    return {
      userAvatarUrl,
      isCollapse,
      handleLogout,
      toggleCollapse,
    };
  },
  // components: { // 如果没有全局注册图标，需要在这里注册
  //   ArrowDown, Expand, Fold, HomeFilled, Setting, Cpu, User, Connection, Monitor, Bell, Document, TrendCharts
  // }
};
</script>

<style scoped>
.common-layout {
  height: 100vh; /* 确保整个布局容器占满视口高度 */
  display: flex;
  flex-direction: column;
}

.layout-container {
  flex: 1; /* 让 ElContainer 占据所有可用空间 */
}

.layout-header {
  background-color: #2b3547; /* 深色头部 */
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px; /* 固定头部高度 */
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
}

.app-logo {
  height: 35px;
  margin-right: 10px;
}

.app-title {
  font-size: 20px;
  font-weight: bold;
}

.header-right {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
}
.el-icon--right {
  margin-left: 6px;
}

.layout-body-container {
  flex: 1;
}

.layout-aside {
  background-color: #545c64; /* 侧边栏背景色，与菜单背景色一致 */
  transition: width 0.3s ease; /* 添加宽度过渡效果 */
  display: flex;
  flex-direction: column;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

.el-menu-vertical-demo {
  flex: 1; /* 让菜单占据 aside 的所有空间 */
  border-right: none; /* 移除菜单右边框 */
}

.layout-main {
  background-color: #f0f2f5; /* 主内容区域背景色 */
  padding: 20px;
  flex: 1; /* 让 main 区域占据剩余空间 */
  overflow-y: auto; /* 当内容溢出时显示滚动条 */
}

/* 菜单折叠/展开按钮样式 */
.collapse-toggle {
  height: 50px;
  line-height: 50px;
  text-align: center;
  background-color: #434a50; /* 比菜单背景稍深的颜色 */
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.collapse-toggle:hover {
  background-color: #383d42;
}
</style>