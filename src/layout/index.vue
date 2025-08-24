<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <el-header class="layout-header">
        <div class="header-left">
          <img src="../assets/logo.png" alt="Logo" class="app-logo" />
          <span class="app-title">智能监控系统</span>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-avatar :size="30" :src="userAvatarUrl"></el-avatar>
              <span style="margin-left: 8px;">{{ displayUsername }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="showProfileModal">个人资料</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-container class="layout-body-container">
        <el-aside :width="isCollapse ? '64px' : '200px'" class="layout-aside">
          <div class="collapse-toggle" @click="toggleCollapse">
            <el-icon v-if="isCollapse"><Expand /></el-icon>
            <el-icon v-else><Fold /></el-icon>
          </div>
          <div class="menu-container" ref="menuContainer">
            <el-menu
                :default-active="$route.path"
                class="el-menu-vertical-demo"
                :collapse="isCollapse"
                router
                background-color="#545c64"
                text-color="#fff"
                active-text-color="#ffd04b"
            >

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
                <span>算法管理</span>
              </template>
              <el-menu-item index="/algorithm/upload">算法仓</el-menu-item>
              <el-menu-item index="/algorithm/config">算法配置</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="/usermanagement">
              <template #title>
                <el-icon><User /></el-icon>
                <span>用户管理</span>
              </template>
              <el-menu-item index="/usermanagement/user-management-manage">用户列表</el-menu-item>
              <el-menu-item index="/usermanagement/role-management">角色列表</el-menu-item>
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
              <el-menu-item index="/detection/realtime">实时画面</el-menu-item>
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
          </div>
        </el-aside>

        <el-main class="layout-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>

    <!-- 个人资料弹窗 -->
    <ProfileModal 
      v-model="showProfile" 
      @profile-updated="handleProfileUpdated"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import ProfileModal from '@/components/ProfileModal.vue';

export default {
  name: 'LayoutIndex',
  components: {
    ProfileModal
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    const userAvatarUrl = ref('https://cube.elemecdn.com/0/88/03b0d4153c31b21f7da7534d36da500d.jpeg');
    const isCollapse = ref(false);
    const menuContainer = ref(null);
    const showProfile = ref(false);

    // 显示用户名
    const displayUsername = computed(() => {
      // 如果没有认证信息，不显示任何用户名
      if (!authStore.isAuthenticated || !authStore.userInfo) {
        return '未登录';
      }
      return authStore.username || authStore.userInfo?.username || '游客';
    });

    // 退出登录方法
    const handleLogout = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '退出确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        // 调用store的登出方法
        await authStore.logout();
        
        // 确保状态完全清除
        console.log('退出登录后的认证状态:', {
          isAuthenticated: authStore.isAuthenticated,
          userInfo: authStore.userInfo,
          token: authStore.token
        });
        
        ElMessage.success('已退出登录');
        
        // 强制跳转到登录页并清除历史记录
        await router.replace('/login');
        
        // 强制刷新页面以确保完全清除状态
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } catch (error) {
        // 用户取消登出
        if (error !== 'cancel') {
          console.error('退出登录失败:', error);
        }
      }
    };

    const toggleCollapse = () => {
      isCollapse.value = !isCollapse.value;
    };

    // 显示个人资料弹窗
    const showProfileModal = () => {
      showProfile.value = true;
    };

    // 处理个人资料更新事件
    const handleProfileUpdated = () => {
      // 可以在这里更新用户信息缓存或重新加载用户数据
      console.log('个人资料已更新');
    };

    // 动态调整菜单容器高度
    const adjustMenuHeight = () => {
      if (menuContainer.value) {
        const headerHeight = 60; // 头部高度
        const toggleHeight = 50; // 折叠按钮高度
        const availableHeight = window.innerHeight - headerHeight - toggleHeight;
        menuContainer.value.style.maxHeight = `${availableHeight}px`;
      }
    };

    // 监听窗口大小变化
    onMounted(() => {
      adjustMenuHeight();
      window.addEventListener('resize', adjustMenuHeight);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', adjustMenuHeight);
    });

    return {
      userAvatarUrl,
      isCollapse,
      displayUsername,
      handleLogout,
      toggleCollapse,
      menuContainer,
      showProfile,
      showProfileModal,
      handleProfileUpdated,
    };
  },
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
  height: calc(100vh - 60px); /* 减去头部高度 */
}

.layout-aside {
  background-color: #545c64; /* 侧边栏背景色，与菜单背景色一致 */
  transition: width 0.3s ease; /* 添加宽度过渡效果 */
  display: flex;
  flex-direction: column;
  height: 100%; /* 确保侧边栏占满容器高度 */
  overflow: hidden; /* 防止整个侧边栏滚动 */
}

/* 菜单容器样式 */
.menu-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  /* Firefox 滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #606266 #434a50;
  /* 确保滚动条始终可见 */
  scrollbar-gutter: stable;
  /* 高度由JavaScript动态管理 */
  height: 100%;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 100%;
}

.el-menu-vertical-demo {
  border-right: none; /* 移除菜单右边框 */
  height: auto; /* 让菜单根据内容自动调整高度 */
  min-height: fit-content; /* 根据内容自适应高度 */
  padding-bottom: 20px; /* 添加底部内边距 */
}

.layout-main {
  background: transparent; /* 透明背景，让科技感背景显示 */
  padding: 0; /* 移除内边距，让子组件自己控制 */
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
  flex-shrink: 0; /* 防止按钮被压缩 */
}
.collapse-toggle:hover {
  background-color: #383d42;
}

/* 自定义滚动条样式 - Webkit内核 (Chrome, Safari, Edge) */
.menu-container::-webkit-scrollbar {
  width: 6px;
}

.menu-container::-webkit-scrollbar-track {
  background: #434a50;
  border-radius: 3px;
}

.menu-container::-webkit-scrollbar-thumb {
  background: #606266;
  border-radius: 3px;
  transition: background 0.3s ease;
}

.menu-container::-webkit-scrollbar-thumb:hover {
  background: #909399;
}



/* 确保菜单项在滚动时不会被遮挡 */
.el-menu-vertical-demo .el-menu-item,
.el-menu-vertical-demo .el-sub-menu {
  position: relative;
}



/* 优化子菜单展开时的样式 */
.el-menu-vertical-demo .el-sub-menu .el-menu {
  background-color: #434a50;
}

.el-menu-vertical-demo .el-sub-menu .el-menu-item:hover {
  background-color: #383d42 !important;
}

/* 确保子菜单在展开时有足够的空间 */
.el-menu-vertical-demo .el-sub-menu .el-menu-item {
  min-height: 40px;
  line-height: 40px;
  padding: 0 20px 0 40px;
}

/* 优化菜单项的间距 */
.el-menu-vertical-demo .el-menu-item {
  height: 48px;
  line-height: 48px;
  padding: 0 20px;
}

/* 子菜单标题样式优化 */
.el-menu-vertical-demo .el-sub-menu__title {
  height: 48px;
  line-height: 48px;
  padding: 0 20px;
}

/* 菜单容器的滚动行为优化 */
.menu-container {
  scroll-behavior: smooth;
  box-sizing: border-box;
  padding-bottom: 20px; /* 统一的底部内边距 */
}

/* 确保最后的菜单项有足够的空间 */
.el-menu-vertical-demo > .el-menu-item:last-child,
.el-menu-vertical-demo > .el-sub-menu:last-child {
  margin-bottom: 20px;
}

/* 子菜单展开时的底部空间 */
.el-menu-vertical-demo .el-sub-menu .el-menu-item:last-child {
  margin-bottom: 10px;
}
</style>