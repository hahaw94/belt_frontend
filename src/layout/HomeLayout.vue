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
            <span>首页/总览</span>
          </button>
        </div>

        <!-- 居中的标题 -->
        <div class="header-center">
          <span class="app-title">智能监控系统</span>
        </div>

        <div class="header-right">
          <!-- 功能列表按钮 -->
          <button class="nav-button function-button" @click="goToFunctionList">
            <span>功能列表</span>
          </button>
        </div>

        <!-- 最右侧用户菜单 -->
        <div class="header-user">
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { useSystemStore } from '@/stores/system';
import ProfileModal from '@/components/ProfileModal.vue';
import { usePermissions } from '@/composables/usePermissions';
import { ArrowDown } from '@element-plus/icons-vue';

export default {
  name: 'HomeLayout',
  components: {
    ProfileModal,
    ArrowDown
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const systemStore = useSystemStore();
    const { checkMenuPermission, checkChildPermission } = usePermissions();
    
    const userAvatarUrl = ref(require('@/assets/images/main/main-head.png'));
    const showProfile = ref(false);

    // 显示用户名
    const displayUsername = computed(() => {
      if (!authStore.isAuthenticated || !authStore.userInfo) {
        return '未登录';
      }
      return authStore.username || authStore.userInfo?.username || '游客';
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

    onMounted(() => {
      // 加载logo配置
      systemStore.fetchLogoConfig();
    });

    return {
      userAvatarUrl,
      displayUsername,
      currentLogoUrl,
      checkMenuPermission,
      checkChildPermission,
      goToHome,
      goToFunctionList,
      handleLogout,
      showProfile,
      showProfileModal,
      handleProfileUpdated,
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
  background: url('@/assets/images/main/main-header2.png') center center/cover no-repeat,
              linear-gradient(135deg,
                rgba(15, 25, 45, 0.8) 0%,
                rgba(20, 35, 60, 0.8) 50%,
                rgba(25, 40, 65, 0.8) 100%);
  background-blend-mode: overlay;
  color: #fff;
  display: grid;
  grid-template-columns: auto 1fr auto 1fr auto;
  align-items: center;
  gap: 20px;
  height: 80px;
  padding: 0 30px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 40px rgba(0, 255, 255, 0.1),
    inset 0 1px 0 rgba(0, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

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
  justify-content: flex-end;
  z-index: 2;
  position: relative;
  transform: translateX(-27%);
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
  font-size: 16px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
  padding: 15px 40px;
  border-radius: 0;
  box-shadow: none;
  min-width: 140px;
  height: 50px;
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
}

.home-button::before {
  background-image: url('@/assets/images/main/main-header-left.png');
}

.function-button::before {
  background-image: url('@/assets/images/main/main-header-right.png');
}

.nav-button:hover {
  transform: translateY(-2px);
  background: none !important;
  background-color: transparent !important;
  color: #ffffff;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
}

.nav-button span {
  position: relative;
  z-index: 1;
}

.header-center {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  text-align: center;
  position: relative;
  transform: translateX(-20%);
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  z-index: 2;
  position: relative;
  transform: translateX(20%);
}

.header-user {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 2;
  position: relative;
  margin-right: 20px;
}

.app-logo {
  height: 35px;
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.4));
}


.app-title {
  font-size: 28px;
  font-weight: bold;
  font-style: italic;
  color: #00d4ff;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
  letter-spacing: 2px;
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

.home-main {
  background: transparent;
  padding: 0;
  flex: 1;
  overflow-y: auto;
  height: calc(100vh - 80px);
}

/* 下拉菜单样式优化 */
:deep(.el-dropdown-menu) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5) !important;
}

/* 强制覆盖Element Plus默认的popper样式 */
:deep(.el-popper.is-dark) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-popper) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
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
    margin-right: 10px;
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
    margin-right: 5px;
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
    margin-right: 2px;
  }

  .app-logo {
    height: 24px;
  }
}
</style>
