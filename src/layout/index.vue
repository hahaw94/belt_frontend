<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <el-header class="layout-header">
        <div class="header-left">
          <img :src="currentLogoUrl" alt="Logo" class="app-logo" />
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
                background-color="transparent"
                text-color="rgba(255, 255, 255, 0.9)"
                active-text-color="#00ffff"
            >

            <el-menu-item v-if="checkMenuPermission('/dashboard')" index="/dashboard">
              <el-icon><HomeFilled /></el-icon>
              <template #title>首页/总览</template>
            </el-menu-item>

            <el-sub-menu v-if="checkChildPermission('/system-config')" index="/system-config">
              <template #title>
                <el-icon><Setting /></el-icon>
                <span>系统配置</span>
              </template>
              <el-menu-item v-if="checkMenuPermission('/system-config/basic-management')" index="/system-config/basic-management">基础管理</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/system-config/version-management')" index="/system-config/version-management">版本管理</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/system-config/map-management')" index="/system-config/map-management">地图管理</el-menu-item>
            </el-sub-menu>

            <el-sub-menu v-if="checkChildPermission('/algorithm')" index="/algorithm">
              <template #title>
                <el-icon><Cpu /></el-icon>
                <span>算法管理</span>
              </template>
              <el-menu-item v-if="checkMenuPermission('/algorithm/upload')" index="/algorithm/upload">算法仓</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/algorithm/config')" index="/algorithm/config">算法配置</el-menu-item>
            </el-sub-menu>

            <el-sub-menu v-if="checkChildPermission('/usermanagement')" index="/usermanagement">
              <template #title>
                <el-icon><User /></el-icon>
                <span>用户管理</span>
              </template>
              <el-menu-item v-if="checkMenuPermission('/usermanagement/user-management-manage')" index="/usermanagement/user-management-manage">用户列表</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/usermanagement/role-management')" index="/usermanagement/role-management">角色列表</el-menu-item>
            </el-sub-menu>

            <el-sub-menu v-if="checkChildPermission('/access')" index="/access">
              <template #title>
                <el-icon><Connection /></el-icon>
                <span>接入管理</span>
              </template>
              <el-menu-item v-if="checkMenuPermission('/access/device')" index="/access/device">设备管理</el-menu-item>
<!--              <el-menu-item v-if="checkMenuPermission('/access/info')" index="/access/info">设备信息</el-menu-item>-->
<!--              <el-menu-item v-if="checkMenuPermission('/access/protocol')" index="/access/protocol">设备接入协议</el-menu-item>-->
            </el-sub-menu>

            <el-sub-menu v-if="checkChildPermission('/detection')" index="/detection">
              <template #title>
                <el-icon><Monitor /></el-icon>
                <span>实时检测</span>
              </template>
              <el-menu-item v-if="checkMenuPermission('/detection/realtime')" index="/detection/realtime">实时画面</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/detection/playback')" index="/detection/playback">录像回放</el-menu-item>
            </el-sub-menu>

            <el-sub-menu v-if="checkChildPermission('/recording')" index="/recording">
              <template #title>
                <el-icon><VideoCamera /></el-icon>
                <span>录像管理</span>
              </template>
              <el-menu-item v-if="checkMenuPermission('/recording/list')" index="/recording/list">录像列表</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/recording/statistics')" index="/recording/statistics">录像统计</el-menu-item>
            </el-sub-menu>

            <el-sub-menu v-if="checkChildPermission('/event')" index="/event">
              <template #title>
                <el-icon><Bell /></el-icon>
                <span>事件中心</span>
              </template>
              <el-menu-item v-if="checkMenuPermission('/event/alarm-display')" index="/event/alarm-display">告警信息展示</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/event/data-collection')" index="/event/data-collection">告警数据收集</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/event/immediate-command')" index="/event/immediate-command">即时告警批示</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/event/linkage-settings')" index="/event/linkage-settings">告警联动设置</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/event/warning-push')" index="/event/warning-push">预警推送</el-menu-item>
            </el-sub-menu>

            <el-menu-item v-if="checkMenuPermission('/log')" index="/log">
              <el-icon><Document /></el-icon>
              <template #title>日志中心</template>
            </el-menu-item>

            <el-menu-item v-if="checkMenuPermission('/statistics')" index="/statistics">
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
import { useSystemStore } from '@/stores/system';
import ProfileModal from '@/components/ProfileModal.vue';
import { usePermissions } from '@/composables/usePermissions';

export default {
  name: 'LayoutIndex',
  components: {
    ProfileModal
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const systemStore = useSystemStore();
    const { checkMenuPermission, checkChildPermission } = usePermissions();
    
    const userAvatarUrl = ref(require('@/assets/images/main/main-head.png'));
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

    // 当前logo URL
    const currentLogoUrl = computed(() => systemStore.currentLogoUrl);

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
      // 加载logo配置
      systemStore.fetchLogoConfig();
    });

    onUnmounted(() => {
      window.removeEventListener('resize', adjustMenuHeight);
    });

    return {
      userAvatarUrl,
      isCollapse,
      displayUsername,
      currentLogoUrl,
      checkMenuPermission,
      checkChildPermission,
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

/* 科技感头部样式 */
.layout-header {
  background: linear-gradient(135deg, 
    rgba(15, 25, 45, 0.98) 0%, 
    rgba(20, 35, 60, 0.98) 50%, 
    rgba(25, 40, 65, 0.98) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px; /* 固定头部高度 */
  padding: 0 20px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 40px rgba(0, 255, 255, 0.1),
    inset 0 1px 0 rgba(0, 255, 255, 0.2);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

/* 首页专用头部样式 */
.layout-header.home-header {
  background: url('@/assets/images/main/main-header.png') center/cover no-repeat, 
              linear-gradient(135deg, 
                rgba(15, 25, 45, 0.8) 0%, 
                rgba(20, 35, 60, 0.8) 50%, 
                rgba(25, 40, 65, 0.8) 100%);
  background-blend-mode: overlay;
}

/* 头部科技感背景效果 */
.layout-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(0, 255, 255, 0.1) 50%, 
    transparent 100%);
  animation: tech-shimmer 3s ease-in-out infinite;
}

@keyframes tech-shimmer {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

.header-left {
  display: flex;
  align-items: center;
  z-index: 2;
}

.app-logo {
  height: 35px;
  margin-right: 10px;
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.4));
}

.app-title {
  font-size: 20px;
  font-weight: bold;
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.header-right {
  display: flex;
  align-items: center;
  z-index: 2;
}

.el-dropdown-link {
  cursor: pointer;
  color: #00d4ff;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}

.el-dropdown-link:hover {
  color: #ffffff;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  transform: translateY(-1px);
}

.el-icon--right {
  margin-left: 6px;
}

.layout-body-container {
  flex: 1;
  height: calc(100vh - 60px); /* 减去头部高度 */
}

/* 科技感侧边栏样式 */
.layout-aside {
  background: linear-gradient(180deg, 
    rgba(15, 25, 45, 0.95) 0%, 
    rgba(20, 30, 50, 0.95) 50%, 
    rgba(15, 25, 45, 0.95) 100%);
  backdrop-filter: blur(10px);
  transition: width 0.3s ease; /* 添加宽度过渡效果 */
  display: flex;
  flex-direction: column;
  height: 100%; /* 确保侧边栏占满容器高度 */
  overflow: hidden; /* 防止整个侧边栏滚动 */
  border-right: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 
    4px 0 20px rgba(0, 0, 0, 0.3),
    inset -1px 0 0 rgba(0, 255, 255, 0.1);
  position: relative;
}

/* 侧边栏科技感背景纹理 */
.layout-aside::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(0, 255, 255, 0.03) 1px, transparent 1px),
    radial-gradient(circle at 80% 80%, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 1;
}

/* 菜单容器样式 */
.menu-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  /* Firefox 滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 255, 255, 0.3) rgba(0, 255, 255, 0.1);
  /* 确保滚动条始终可见 */
  scrollbar-gutter: stable;
  /* 高度由JavaScript动态管理 */
  height: 100%;
  position: relative;
  z-index: 2;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 100%;
}

/* 科技感菜单主体样式 */
.el-menu-vertical-demo {
  border-right: none; /* 移除菜单右边框 */
  height: auto; /* 让菜单根据内容自动调整高度 */
  min-height: fit-content; /* 根据内容自适应高度 */
  padding-bottom: 20px; /* 添加底部内边距 */
  background: transparent !important;
}

/* 菜单项科技感样式 */
.el-menu-vertical-demo .el-menu-item {
  height: 48px;
  line-height: 48px;
  padding: 0 20px;
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.el-menu-vertical-demo .el-menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, 
    transparent 0%, 
    rgba(0, 255, 255, 0.8) 50%, 
    transparent 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.el-menu-vertical-demo .el-menu-item:hover {
  background: linear-gradient(90deg, 
    rgba(0, 255, 255, 0.08) 0%, 
    rgba(0, 255, 255, 0.12) 50%, 
    rgba(0, 255, 255, 0.08) 100%) !important;
  color: rgba(255, 255, 255, 1) !important;
  box-shadow: 
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 0 20px rgba(0, 255, 255, 0.1);
  transform: translateX(5px);
}

.el-menu-vertical-demo .el-menu-item:hover::before {
  transform: scaleY(1);
}

/* 激活状态的菜单项 */
.el-menu-vertical-demo .el-menu-item.is-active {
  background: linear-gradient(90deg, 
    rgba(0, 255, 255, 0.15) 0%, 
    rgba(0, 255, 255, 0.2) 50%, 
    rgba(0, 255, 255, 0.15) 100%) !important;
  color: #00ffff !important;
  box-shadow: 
    inset 0 0 25px rgba(0, 255, 255, 0.2),
    0 0 25px rgba(0, 255, 255, 0.2);
  font-weight: 600;
}

.el-menu-vertical-demo .el-menu-item.is-active::before {
  transform: scaleY(1);
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 1) 0%, 
    rgba(0, 255, 255, 0.8) 50%, 
    rgba(0, 255, 255, 1) 100%);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
}

/* 子菜单标题样式 */
.el-menu-vertical-demo .el-sub-menu__title {
  height: 48px;
  line-height: 48px;
  padding: 0 20px;
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.el-menu-vertical-demo .el-sub-menu__title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, 
    transparent 0%, 
    rgba(0, 255, 255, 0.8) 50%, 
    transparent 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.el-menu-vertical-demo .el-sub-menu__title:hover {
  background: linear-gradient(90deg, 
    rgba(0, 255, 255, 0.08) 0%, 
    rgba(0, 255, 255, 0.12) 50%, 
    rgba(0, 255, 255, 0.08) 100%) !important;
  color: rgba(255, 255, 255, 1) !important;
  box-shadow: 
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 0 20px rgba(0, 255, 255, 0.1);
  transform: translateX(5px);
}

.el-menu-vertical-demo .el-sub-menu__title:hover::before {
  transform: scaleY(1);
}

/* 子菜单展开样式 */
.el-menu-vertical-demo .el-sub-menu.is-opened > .el-sub-menu__title {
  background: linear-gradient(90deg, 
    rgba(0, 255, 255, 0.1) 0%, 
    rgba(0, 255, 255, 0.15) 50%, 
    rgba(0, 255, 255, 0.1) 100%) !important;
  color: #00ffff !important;
}

.el-menu-vertical-demo .el-sub-menu.is-opened > .el-sub-menu__title::before {
  transform: scaleY(1);
}

/* 子菜单项样式 */
.el-menu-vertical-demo .el-sub-menu .el-menu {
  background: rgba(10, 20, 35, 0.8) !important;
  backdrop-filter: blur(5px);
  border-left: 2px solid rgba(0, 255, 255, 0.1);
  margin-left: 10px;
}

.el-menu-vertical-demo .el-sub-menu .el-menu-item {
  min-height: 40px;
  line-height: 40px;
  padding: 0 20px 0 30px;
  font-size: 13px;
  background: transparent !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.03);
}

.el-menu-vertical-demo .el-sub-menu .el-menu-item:hover {
  background: linear-gradient(90deg, 
    rgba(0, 255, 255, 0.06) 0%, 
    rgba(0, 255, 255, 0.1) 50%, 
    rgba(0, 255, 255, 0.06) 100%) !important;
  color: rgba(255, 255, 255, 1) !important;
  transform: translateX(8px);
}

.el-menu-vertical-demo .el-sub-menu .el-menu-item.is-active {
  background: linear-gradient(90deg, 
    rgba(0, 255, 255, 0.12) 0%, 
    rgba(0, 255, 255, 0.18) 50%, 
    rgba(0, 255, 255, 0.12) 100%) !important;
  color: #00ffff !important;
  font-weight: 600;
}

/* 图标样式优化 */
.el-menu-vertical-demo .el-icon {
  color: rgba(0, 255, 255, 0.7);
  margin-right: 8px;
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 4px rgba(0, 255, 255, 0.3));
}

.el-menu-vertical-demo .el-menu-item:hover .el-icon,
.el-menu-vertical-demo .el-sub-menu__title:hover .el-icon {
  color: rgba(0, 255, 255, 1);
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.6));
  transform: scale(1.1);
}

.el-menu-vertical-demo .el-menu-item.is-active .el-icon,
.el-menu-vertical-demo .el-sub-menu.is-opened > .el-sub-menu__title .el-icon {
  color: #00ffff;
  filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.8));
}

.layout-main {
  background: transparent; /* 透明背景，让科技感背景显示 */
  padding: 0; /* 移除内边距，让子组件自己控制 */
  flex: 1; /* 让 main 区域占据剩余空间 */
  overflow-y: auto; /* 当内容溢出时显示滚动条 */
}

/* 科技感菜单折叠/展开按钮样式 */
.collapse-toggle {
  height: 50px;
  line-height: 50px;
  text-align: center;
  background: linear-gradient(135deg, 
    rgba(10, 20, 35, 0.9) 0%, 
    rgba(15, 25, 40, 0.9) 100%);
  color: rgba(0, 255, 255, 0.8);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0; /* 防止按钮被压缩 */
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  position: relative;
  z-index: 2;
  box-shadow: inset 0 1px 0 rgba(0, 255, 255, 0.1);
}

.collapse-toggle:hover {
  background: linear-gradient(135deg, 
    rgba(0, 255, 255, 0.1) 0%, 
    rgba(0, 255, 255, 0.15) 100%);
  color: #00ffff;
  box-shadow: 
    inset 0 1px 0 rgba(0, 255, 255, 0.2),
    0 0 20px rgba(0, 255, 255, 0.2);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.collapse-toggle .el-icon {
  filter: drop-shadow(0 0 4px rgba(0, 255, 255, 0.3));
  transition: all 0.3s ease;
}

.collapse-toggle:hover .el-icon {
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.6));
  transform: scale(1.1);
}

/* 科技感滚动条样式 - Webkit内核 (Chrome, Safari, Edge) */
.menu-container::-webkit-scrollbar {
  width: 8px;
  background: rgba(0, 0, 0, 0.1);
}

.menu-container::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.05);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.menu-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.3) 0%, 
    rgba(0, 200, 255, 0.5) 50%, 
    rgba(0, 255, 255, 0.3) 100%);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: inset 0 0 6px rgba(0, 255, 255, 0.1);
}

.menu-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.5) 0%, 
    rgba(0, 200, 255, 0.7) 50%, 
    rgba(0, 255, 255, 0.5) 100%);
  box-shadow: 
    inset 0 0 6px rgba(0, 255, 255, 0.2),
    0 0 15px rgba(0, 255, 255, 0.4);
}

.menu-container::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.7) 0%, 
    rgba(0, 200, 255, 0.9) 50%, 
    rgba(0, 255, 255, 0.7) 100%);
  box-shadow: 
    inset 0 0 6px rgba(0, 255, 255, 0.3),
    0 0 20px rgba(0, 255, 255, 0.6);
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

/* 菜单折叠状态下的样式优化 */
.el-menu-vertical-demo.el-menu--collapse .el-menu-item,
.el-menu-vertical-demo.el-menu--collapse .el-sub-menu__title {
  text-align: center;
  padding: 0 !important;
}

.el-menu-vertical-demo.el-menu--collapse .el-menu-item .el-icon,
.el-menu-vertical-demo.el-menu--collapse .el-sub-menu__title .el-icon {
  margin-right: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .layout-aside {
    width: 200px !important;
  }
  
  .layout-aside.el-aside--collapsed {
    width: 64px !important;
  }
}
</style>