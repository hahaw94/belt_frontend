<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <el-header class="layout-header">
        <!-- 最左侧logo -->
        <div class="header-logo">
          <img :src="currentLogoUrl" alt="Logo" class="app-logo" />
        </div>

        <div class="header-left">
          <!-- 首页/总览按钮 -->
          <button class="nav-button home-button" @click="goToHome">
            <span>{{ $t('menu.home') }}</span>
          </button>
        </div>

        <!-- 居中的标题 -->
        <div class="header-center">
          <span class="app-title">{{ $t('common.systemTitle') }}</span>
        </div>

        <div class="header-right">
          <!-- 功能列表按钮 -->
          <button class="nav-button function-button" @click="goToFunctionList">
            <span>{{ $t('menu.functionList') }}</span>
          </button>
        </div>

        <!-- 最右侧用户菜单和告警通知 -->
        <div class="header-user">
          <!-- 告警通知铃铛 -->
          <div class="alert-notification-wrapper">
            <AlertNotification
              :alert-history="alertStore.recentAlerts"
              @test-alert="handleTestAlert"
              @mark-as-read="handleMarkAsRead"
              @mark-all-as-read="handleMarkAllAsRead"
              @clear-history="handleClearHistory"
            />
          </div>
          
          <!-- 用户下拉菜单 -->
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-avatar :size="30" :src="userAvatarUrl"></el-avatar>
              <span style="margin-left: 8px;">{{ displayUsername }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="showProfileModal">{{ $t('menu.profile') }}</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">{{ $t('menu.logout') }}</el-dropdown-item>
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


            <el-sub-menu v-if="checkChildPermission('/system-config')" index="/system-config">
              <template #title>
                <el-icon><Setting /></el-icon>
                <span>{{ $t('menu.systemConfig') }}</span>
              </template>
              <el-menu-item v-if="checkMenuPermission('/system-config/basic-management')" index="/system-config/basic-management">{{ $t('menu.basicManagement') }}</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/system-config/version-management')" index="/system-config/version-management">{{ $t('menu.versionManagement') }}</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/system-config/map-management')" index="/system-config/map-management">{{ $t('menu.mapManagement') }}</el-menu-item>
            </el-sub-menu>

            <el-sub-menu v-if="checkChildPermission('/algorithm')" index="/algorithm">
              <template #title>
                <el-icon><Cpu /></el-icon>
                <span>{{ $t('menu.algorithmManagement') }}</span>
              </template>
              <el-menu-item v-if="checkMenuPermission('/algorithm/upload')" index="/algorithm/upload">{{ $t('menu.algorithmWarehouse') }}</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/algorithm/config')" index="/algorithm/config">{{ $t('menu.algorithmConfig') }}</el-menu-item>
            </el-sub-menu>

            <el-sub-menu v-if="checkChildPermission('/usermanagement')" index="/usermanagement">
              <template #title>
                <el-icon><User /></el-icon>
                <span>{{ $t('menu.userManagement') }}</span>
              </template>
              <el-menu-item v-if="checkMenuPermission('/usermanagement/user-management-manage')" index="/usermanagement/user-management-manage">{{ $t('menu.userManage') }}</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/usermanagement/role-management')" index="/usermanagement/role-management">{{ $t('menu.roleManagement') }}</el-menu-item>
            </el-sub-menu>

            <el-sub-menu v-if="checkChildPermission('/access')" index="/access">
              <template #title>
                <el-icon><Connection /></el-icon>
                <span>{{ $t('menu.accessManagement') }}</span>
              </template>
              <el-menu-item v-if="checkMenuPermission('/access/device')" index="/access/device">{{ $t('menu.deviceManagement') }}</el-menu-item>
            </el-sub-menu>

            <el-sub-menu v-if="checkChildPermission('/detection')" index="/detection">
              <template #title>
                <el-icon><Monitor /></el-icon>
                <span>{{ $t('menu.detection') }}</span>
              </template>
              <el-menu-item v-if="checkMenuPermission('/detection/realtime')" index="/detection/realtime">{{ $t('menu.realtimeDetection') }}</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/detection/playback')" index="/detection/playback">{{ $t('menu.videoPlayback') }}</el-menu-item>
            </el-sub-menu>

            <el-sub-menu v-if="checkChildPermission('/event')" index="/event">
              <template #title>
                <el-icon><Bell /></el-icon>
                <span>{{ $t('menu.eventCenter') }}</span>
              </template>
              <el-menu-item v-if="checkMenuPermission('/event/alarm-display')" index="/event/alarm-display">{{ $t('menu.alarmDisplay') }}</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/event/data-collection')" index="/event/data-collection">{{ $t('menu.dataCollection') }}</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/event/linkage-settings')" index="/event/linkage-settings">{{ $t('menu.linkageSettings') }}</el-menu-item>
              <el-menu-item v-if="checkMenuPermission('/event/warning-push')" index="/event/warning-push">{{ $t('menu.warningPush') }}</el-menu-item>
            </el-sub-menu>

            <el-menu-item v-if="checkMenuPermission('/log')" index="/log">
              <el-icon><Document /></el-icon>
              <template #title>{{ $t('menu.logCenter') }}</template>
            </el-menu-item>

            <el-menu-item v-if="checkMenuPermission('/statistics')" index="/statistics">
              <el-icon><TrendCharts /></el-icon>
              <template #title>{{ $t('menu.statisticsAnalysis') }}</template>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { useSystemStore } from '@/stores/system';
import { useAlertStore } from '@/stores/alertStore';
import ProfileModal from '@/components/ProfileModal.vue';
import AlertNotification from '@/components/AlertNotification.vue';
import { usePermissions } from '@/composables/usePermissions';
import {
  ArrowDown,
  Expand,
  Fold,
  Setting,
  Cpu,
  User,
  Connection,
  Monitor,
  Bell,
  Document,
  TrendCharts
} from '@element-plus/icons-vue';

export default {
  name: 'LayoutIndex',
  components: {
    ProfileModal,
    AlertNotification,
    ArrowDown,
    Expand,
    Fold,
    Setting,
    Cpu,
    User,
    Connection,
    Monitor,
    Bell,
    Document,
    TrendCharts
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    const systemStore = useSystemStore();
    const alertStore = useAlertStore();
    const { checkMenuPermission, checkChildPermission } = usePermissions();
    
    const userAvatarUrl = ref(require('@/assets/images/main/main-head.png'));
    const isCollapse = ref(false);
    const menuContainer = ref(null);
    const showProfile = ref(false);

    // 显示用户名
    const displayUsername = computed(() => {
      // 如果没有认证信息，不显示任何用户名
      if (!authStore.isAuthenticated || !authStore.userInfo) {
        return t('common.notLoggedIn');
      }
      return authStore.username || authStore.userInfo?.username || t('common.guest');
    });

    // 当前logo URL
    const currentLogoUrl = computed(() => systemStore.currentLogoUrl);

    // 导航到首页
    const goToHome = () => {
      router.push('/dashboard');
    };

    // 导航到功能列表
    const goToFunctionList = () => {
      router.push('/function-list');
    };

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

    // 告警相关处理方法
    const handleTestAlert = (alertData) => {
      alertStore.addAlert(alertData);
    };

    const handleMarkAsRead = (alertId) => {
      alertStore.markAsRead(alertId);
    };

    const handleMarkAllAsRead = () => {
      alertStore.markAllAsRead();
    };

    const handleClearHistory = () => {
      alertStore.clearHistory();
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

    // 监听路由变化，重置滚动位置
    watch(() => route.path, () => {
      // 使用 nextTick 确保 DOM 已更新
      setTimeout(() => {
        const mainEl = document.querySelector('.layout-main');
        if (mainEl) {
          mainEl.scrollTop = 0;
        }
      }, 0);
    });

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
      t,
      userAvatarUrl,
      isCollapse,
      displayUsername,
      currentLogoUrl,
      alertStore,
      checkMenuPermission,
      checkChildPermission,
      goToHome,
      goToFunctionList,
      handleLogout,
      toggleCollapse,
      menuContainer,
      showProfile,
      showProfileModal,
      handleProfileUpdated,
      handleTestAlert,
      handleMarkAsRead,
      handleMarkAllAsRead,
      handleClearHistory,
    };
  },
};
</script>

<style scoped>
.common-layout {
  height: 100vh; /* 确保整个布局容器占满视口高度 */
  display: flex;
  flex-direction: column;
  background: url('@/assets/images/main/main-background.png') center/cover no-repeat,
              linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  background-blend-mode: overlay;
  background-attachment: fixed;
  /* 调亮背景图片 */
  filter: brightness(1.2) contrast(1.05);
}

.layout-container {
  flex: 1; /* 让 ElContainer 占据所有可用空间 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 科技感头部样式 */
.layout-header {
  background: url('@/assets/images/main/header-simple.png') center center/cover no-repeat;
  color: #fff;
  display: grid;
  grid-template-columns: auto 0.5fr 0.6fr 0.5fr auto;
  align-items: center;
  justify-items: center; /* 让所有项目居中对齐 */
  gap: 8px; /* 进一步减少间隙，让按钮更靠近中心 */
  height: 60px; /* 缩小容器高度 */
  padding: 0 30px;
  box-shadow: none;
  border: none;
  outline: none;
  position: relative;
  overflow: visible; /* 允许内容溢出 */
  z-index: 1000; /* 确保在最顶层 */
}


/* 首页专用头部样式 */
.layout-header.home-header {
  background: url('@/assets/images/main/main-header1.png') center/cover no-repeat,
              linear-gradient(135deg,
                rgba(15, 25, 45, 1) 0%,
                rgba(20, 35, 60, 1) 50%,
                rgba(25, 40, 65, 1) 100%);
  background-blend-mode: overlay;
}


.header-logo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  z-index: 2;
  position: relative;
  margin-left: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 改为右对齐，向中间靠拢 */
  z-index: 3;
  position: relative;
  /* 移除transform，让按钮自然居中 */
}

.app-logo {
  height: 35px;
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.4));
}

.nav-button {
  position: relative;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background: none !important;
  background-color: transparent !important;
  color: #00d4ff;
  font-weight: bold;
  font-size: 14px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
  padding: 10px 25px;
  border-radius: 0;
  box-shadow: none;
  min-width: 100px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.nav-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
  transition: all 0.3s ease;
}

/* 为按钮添加连接过渡效果 */
.nav-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(0, 255, 255, 0.05) 0%,
    rgba(0, 255, 255, 0.1) 50%,
    rgba(0, 255, 255, 0.05) 100%
  );
  z-index: -2;
  opacity: 0;
  transition: opacity 0.4s ease;
  border-radius: 8px;
  filter: blur(2px);
}

.home-button::before {
  background-image: url('@/assets/images/main/main-header-left.png');
}

.function-button::before {
  background-image: url('@/assets/images/main/main-header-right.png');
}

/* 为左右按钮添加特殊的融合效果 */
.header-left::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -10px;
  right: -10px;
  bottom: -5px;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 255, 255, 0.1) 0%,
    rgba(0, 255, 255, 0.05) 40%,
    transparent 70%
  );
  z-index: -1;
  opacity: 0;
  transition: opacity 0.4s ease;
  border-radius: 15px;
}

.header-right::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -10px;
  right: -10px;
  bottom: -5px;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 255, 255, 0.1) 0%,
    rgba(0, 255, 255, 0.05) 40%,
    transparent 70%
  );
  z-index: -1;
  opacity: 0;
  transition: opacity 0.4s ease;
  border-radius: 15px;
}

.header-left:hover::before,
.header-right:hover::before {
  opacity: 1;
}

.nav-button:hover {
  transform: translateY(-2px);
  background: none !important;
  background-color: transparent !important;
  color: #ffffff;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
}

.nav-button:hover::after {
  opacity: 1;
}

.nav-button:hover::before {
  filter: brightness(1.2) contrast(1.1);
  transform: scale(1.02);
}

.nav-button span {
  position: relative;
  z-index: 1;
}

.header-center {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  text-align: center;
  position: relative;
  /* 移除transform，让标题真正居中 */
}

.app-title {
  font-size: 32px; /* 从28px增加到32px */
  font-weight: bold;
  font-style: italic;
  color: #00d4ff;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
  letter-spacing: 2px;
  transform: translateY(3px); /* 向下移动3px */
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 改为左对齐，向中间靠拢 */
  z-index: 3;
  position: relative;
  /* 移除transform，让按钮自然居中 */
}

.header-user {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px; /* 减小铃铛和用户信息之间的间距 */
  z-index: 10000;
  position: relative;
  margin-right: 1.5%; /* 使用百分比向右移动 */
}

.alert-notification-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 语言切换器样式 */
.language-selector-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20px;
  margin-right: 20px;
}

.language-selector {
  cursor: pointer;
  color: #00d4ff;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  transition: all 0.3s ease;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}

.language-selector:hover {
  color: #ffffff;
  background: rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.5);
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
}

.language-selector .el-icon {
  font-size: 18px;
}

.language-text {
  font-size: 14px;
  font-weight: 500;
}

.header-user .el-dropdown {
  z-index: 10000;
}

.el-dropdown-link {
  cursor: pointer;
  color: #00d4ff;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
  pointer-events: auto; /* 确保可以点击 */
  position: relative;
  z-index: 10000;
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
  min-height: calc(100vh - 60px); /* 调整为新的header高度 */
  height: 100%;
  overflow: hidden;
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
  /* Firefox 滚动条样式 - 青蓝色配色 */
  scrollbar-width: thin;
  scrollbar-color: #00a8cc rgba(20, 30, 50, 0.5);
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
  overflow-x: hidden;
  height: 100%;
  min-height: 0;
  position: relative;
}

/* 主内容区科技感滚动条样式 - Webkit内核 */
.layout-main::-webkit-scrollbar {
  width: 10px;
  background: rgba(0, 0, 0, 0.1);
}

.layout-main::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.05);
  border-radius: 5px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.layout-main::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.3) 0%, 
    rgba(0, 200, 255, 0.5) 50%, 
    rgba(0, 255, 255, 0.3) 100%);
  border-radius: 5px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.layout-main::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.5) 0%, 
    rgba(0, 200, 255, 0.7) 50%, 
    rgba(0, 255, 255, 0.5) 100%);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
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

/* 滚动条样式 - Webkit内核 (Chrome, Safari, Edge) - 青蓝色配色 */
.menu-container::-webkit-scrollbar {
  width: 8px;
  background: rgba(0, 0, 0, 0.1);
}

.menu-container::-webkit-scrollbar-track {
  background: rgba(20, 30, 50, 0.5);
  border-radius: 4px;
}

.menu-container::-webkit-scrollbar-thumb {
  background: #00a8cc;
  border-radius: 4px;
}

.menu-container::-webkit-scrollbar-thumb:hover {
  background: #00c4e8;
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

/* 下拉菜单样式优化 */
:deep(.el-dropdown-menu) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5) !important;
  z-index: 10001 !important;
}

/* 强制覆盖Element Plus默认的popper样式 */
:deep(.el-popper.is-dark) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  z-index: 10001 !important;
}

:deep(.el-popper) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  z-index: 10001 !important;
}

:deep(.el-dropdown-menu__item) {
  color: #00d4ff !important;
  background: transparent !important;
  transition: all 0.3s ease;
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.6);
}

:deep(.el-dropdown-menu__item:hover) {
  background: linear-gradient(90deg,
    rgba(0, 255, 255, 0.08) 0%,
    rgba(0, 255, 255, 0.12) 50%,
    rgba(0, 255, 255, 0.08) 100%) !important;
  color: #00ffff !important;
}

:deep(.el-dropdown-menu__item.is-disabled) {
  color: rgba(0, 212, 255, 0.6) !important;
  background: rgba(0, 150, 255, 0.1) !important;
  text-shadow: 0 0 6px rgba(0, 212, 255, 0.3);
}

:deep(.el-dropdown-menu__item .el-icon) {
  color: rgba(0, 255, 255, 0.7);
  margin-right: 8px;
}

:deep(.el-dropdown-menu__item:hover .el-icon) {
  color: #00ffff;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .layout-header {
    grid-template-columns: auto minmax(120px, 1fr) auto minmax(120px, 1fr) auto;
    gap: 15px;
    padding: 0 20px;
  }

  .nav-button {
    min-width: 120px;
    height: 45px;
    font-size: 14px;
    padding: 12px 30px;
  }

  .app-title {
    font-size: 24px;
    letter-spacing: 1px;
  }

  .header-logo {
    margin-left: 10px;
  }

  .header-user {
    margin-right: 1.2%;
  }
}

@media (max-width: 768px) {
  .layout-aside {
    width: 200px !important;
  }

  .layout-aside.el-aside--collapsed {
    width: 64px !important;
  }

  .layout-header {
    grid-template-columns: auto auto 1fr auto auto;
    gap: 5px;
    padding: 0 10px;
    height: 70px;
  }

  .nav-button {
    min-width: 80px;
    height: 40px;
    font-size: 12px;
    padding: 10px 15px;
  }

  .nav-button span {
    display: none;
  }

  .nav-button::after {
    content: '';
    width: 20px;
    height: 20px;
    display: block;
  }

  .home-button::after {
    content: '🏠';
    font-size: 16px;
  }

  .function-button::after {
    content: '📋';
    font-size: 16px;
  }

  .app-title {
    font-size: 18px;
    letter-spacing: 0.5px;
  }

  .el-dropdown-link span {
    display: none;
  }

  .header-logo {
    margin-left: 5px;
  }

  .header-user {
    margin-right: 1%;
  }

  .app-logo {
    height: 28px;
  }
}

@media (max-width: 480px) {
  .layout-header {
    grid-template-columns: auto auto 1fr auto auto;
    gap: 2px;
    padding: 0 5px;
    height: 60px;
  }

  .nav-button {
    min-width: 60px;
    height: 35px;
    font-size: 11px;
    padding: 8px 10px;
  }

  .app-title {
    font-size: 16px;
  }

  .el-avatar {
    width: 24px !important;
    height: 24px !important;
  }

  .header-logo {
    margin-left: 2px;
  }

  .header-user {
    margin-right: 0.8%;
  }

  .app-logo {
    height: 24px;
  }
}
</style>