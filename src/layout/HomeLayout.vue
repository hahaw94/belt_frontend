<template>
  <div class="home-layout">
    <el-container class="layout-container">
      <!-- 首页专用Header -->
      <el-header class="home-header">
        <!-- 最左侧logo -->
        <div class="header-logo">
          <img :src="currentLogoUrl" alt="Logo" class="app-logo" />
        </div>

        <div class="header-left">
          <!-- 首页/总览按钮 -->
          <button class="nav-button home-button" @click="goToHome">
            <span>{{ $t('common.home') }}</span>
          </button>
        </div>

        <!-- 居中的标题 -->
        <div class="header-center">
          <span class="app-title">{{ $t('common.systemTitle') }}</span>
        </div>

        <div class="header-right">
          <!-- 功能列表按钮 -->
          <button class="nav-button function-button" @click="goToFunctionList">
            <span>{{ $t('common.functionList') }}</span>
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
              @alert-click="handleAlertClick"
            />
          </div>
          
          <!-- 用户下拉菜单 -->
          <el-dropdown @command="handleDropdownCommand">
            <span class="el-dropdown-link">
              <el-avatar :size="30" :src="userAvatarUrl"></el-avatar>
              <span style="margin-left: 8px;">{{ displayUsername }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">{{ $t('user.profile') }}</el-dropdown-item>
                <el-dropdown-item divided command="zh-CN" :disabled="localeStore.currentLocale === 'zh-CN'">
                  <el-icon><Globe /></el-icon>
                  <span style="margin-left: 8px;">中文</span>
                </el-dropdown-item>
                <el-dropdown-item command="en-US" :disabled="localeStore.currentLocale === 'en-US'">
                  <el-icon><Globe /></el-icon>
                  <span style="margin-left: 8px;">English</span>
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">{{ $t('user.logout') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="home-main">
        <router-view />
      </el-main>
    </el-container>

    <!-- 个人资料弹窗 -->
    <ProfileModal 
      v-model="showProfile" 
      @profile-updated="handleProfileUpdated"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { useSystemStore } from '@/stores/system';
import { useAlertStore } from '@/stores/alertStore';
import { useLocaleStore } from '@/stores/locale';
import ProfileModal from '@/components/ProfileModal.vue';
import AlertNotification from '@/components/AlertNotification.vue';
import { usePermissions } from '@/composables/usePermissions';
import { ArrowDown, Globe } from '@element-plus/icons-vue';

export default {
  name: 'HomeLayout',
  components: {
    ProfileModal,
    AlertNotification,
    ArrowDown,
    Globe
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    const systemStore = useSystemStore();
    const alertStore = useAlertStore();
    const localeStore = useLocaleStore();
    const { checkMenuPermission, checkChildPermission } = usePermissions();
    
    const userAvatarUrl = ref(require('@/assets/images/main/main-head.png'));
    const showProfile = ref(false);

    // 显示用户名
    const displayUsername = computed(() => {
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

        await authStore.logout();
        ElMessage.success('已退出登录');
        await router.replace('/login');
        
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } catch (error) {
        if (error !== 'cancel') {
          console.error('退出登录失败:', error);
        }
      }
    };

    // 显示个人资料弹窗
    const showProfileModal = () => {
      showProfile.value = true;
    };

    // 处理个人资料更新事件
    const handleProfileUpdated = () => {
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

    // 统一处理下拉菜单命令
    const handleDropdownCommand = (command) => {
      if (command === 'profile') {
        showProfileModal();
      } else if (command === 'logout') {
        handleLogout();
      } else if (command === 'zh-CN' || command === 'en-US') {
        // 语言切换
        localeStore.setLocale(command);
        ElMessage.success(command === 'zh-CN' ? t('common.switchToZh') : t('common.switchToEn'));
        // 刷新页面以确保所有组件都使用新语言
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    };

    // 处理点击告警历史，跳转到告警展示页面
    // eslint-disable-next-line no-unused-vars
    const handleAlertClick = (alert) => {
      console.log('HomeLayout: 告警点击事件触发:', alert);
      console.log('HomeLayout: 准备跳转到 /event/alarm-display');
      // 跳转到告警信息展示页面
      router.push('/event/alarm-display').then(() => {
        console.log('HomeLayout: 跳转成功');
      }).catch(err => {
        console.error('HomeLayout: 跳转失败:', err);
      });
    };

    // 监听路由变化，重置滚动位置
    watch(() => route.path, () => {
      setTimeout(() => {
        const mainEl = document.querySelector('.home-main');
        if (mainEl) {
          mainEl.scrollTop = 0;
        }
      }, 0);
    });

    onMounted(() => {
      // 加载logo配置
      systemStore.fetchLogoConfig();
    });

    return {
      t,
      userAvatarUrl,
      displayUsername,
      currentLogoUrl,
      alertStore,
      localeStore,
      checkMenuPermission,
      checkChildPermission,
      goToHome,
      goToFunctionList,
      handleLogout,
      showProfile,
      showProfileModal,
      handleProfileUpdated,
      handleTestAlert,
      handleMarkAsRead,
      handleMarkAllAsRead,
      handleClearHistory,
      handleAlertClick,
      handleDropdownCommand,
    };
  },
};
</script>

<style scoped>
.home-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  /* 整体背景图 */
  background: url('@/assets/images/main/main-background.png') center/cover no-repeat,
              linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  background-blend-mode: overlay;
}

.layout-container {
  flex: 1;
}

/* 首页专用头部样式 */
.home-header {
  /* 移除背景图片，改为使用伪元素 */
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
  background: transparent; /* 容器背景透明 */
}

/* 使用伪元素创建可以突破容器的背景图片 */
.home-header::before {
  content: '';
  position: absolute;
  top: -7vh; /* 再次减少向上延伸 */
  left: -16.5vw; /* 从左边挤压，向右收缩 */
  right: -18vw; /* 从右边挤压，向左收缩 */
  bottom: -2vh; /* 再次减少向下延伸 */
  background: url('@/assets/images/main/main-header7.png') center center/70% 100% no-repeat;
  /* 使用center center确保图片居中显示，cover确保完全覆盖 */
  z-index: -1; /* 放在内容下方 */
  pointer-events: none; /* 不影响点击事件 */
}

/* 删除多余的延伸伪元素 */

/* 删除旧的边缘渐变效果，防止与延伸效果冲突 */

/* 移除头部闪光效果 */

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

.app-logo {
  height: 35px;
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.4));
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

.home-main {
  background: transparent;
  padding: 0;
  flex: 1;
  overflow-y: auto;
  height: calc(100vh - 60px); /* 调整为新的header高度 */
  position: relative;
  z-index: 50; /* 设置较低的z-index，确保header能够覆盖 */
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
  .home-header {
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
  .home-header {
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
  .home-header {
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
