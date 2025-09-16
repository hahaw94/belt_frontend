<template>
  <div class="home-layout">
    <el-container class="layout-container">
      <!-- 首页专用Header -->
      <el-header class="home-header">
        <div class="header-left">
          <!-- 系统功能下拉菜单 -->
          <el-dropdown trigger="click" @command="handleMenuCommand">
            <el-button type="primary" class="system-menu-btn">
              <el-icon><Menu /></el-icon>
              <span style="margin-left: 8px;">系统功能</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="/dashboard" disabled>
                  <el-icon><HomeFilled /></el-icon>
                  <span>首页/总览</span>
                </el-dropdown-item>
                <el-dropdown-item divided command="/system-config" v-if="checkChildPermission('/system-config')">
                  <el-icon><Setting /></el-icon>
                  <span>系统配置</span>
                </el-dropdown-item>
                <el-dropdown-item command="/algorithm" v-if="checkChildPermission('/algorithm')">
                  <el-icon><Cpu /></el-icon>
                  <span>算法管理</span>
                </el-dropdown-item>
                <el-dropdown-item command="/usermanagement" v-if="checkChildPermission('/usermanagement')">
                  <el-icon><User /></el-icon>
                  <span>用户管理</span>
                </el-dropdown-item>
                <el-dropdown-item command="/access" v-if="checkChildPermission('/access')">
                  <el-icon><Connection /></el-icon>
                  <span>接入管理</span>
                </el-dropdown-item>
                <el-dropdown-item command="/detection" v-if="checkChildPermission('/detection')">
                  <el-icon><Monitor /></el-icon>
                  <span>实时检测</span>
                </el-dropdown-item>
                <el-dropdown-item command="/recording" v-if="checkChildPermission('/recording')">
                  <el-icon><VideoCamera /></el-icon>
                  <span>录像管理</span>
                </el-dropdown-item>
                <el-dropdown-item command="/event" v-if="checkChildPermission('/event')">
                  <el-icon><Bell /></el-icon>
                  <span>事件中心</span>
                </el-dropdown-item>
                <el-dropdown-item command="/log" v-if="checkMenuPermission('/log')">
                  <el-icon><Document /></el-icon>
                  <span>日志中心</span>
                </el-dropdown-item>
                <el-dropdown-item command="/statistics" v-if="checkMenuPermission('/statistics')">
                  <el-icon><TrendCharts /></el-icon>
                  <span>统计分析</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        
        <!-- 居中的标题 -->
        <div class="header-center">
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
import ProfileModal from '@/components/ProfileModal.vue';
import { usePermissions } from '@/composables/usePermissions';
import { Menu, ArrowDown, HomeFilled, Setting, Cpu, User, Connection, Monitor, VideoCamera, Bell, Document, TrendCharts } from '@element-plus/icons-vue';

export default {
  name: 'HomeLayout',
  components: {
    ProfileModal,
    Menu,
    ArrowDown,
    HomeFilled,
    Setting,
    Cpu,
    User,
    Connection,
    Monitor,
    VideoCamera,
    Bell,
    Document,
    TrendCharts
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
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


    // 处理菜单命令
    const handleMenuCommand = (command) => {
      if (command !== '/dashboard') {
        router.push(command);
      }
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
      // 不再需要加载logo配置
    });

    return {
      userAvatarUrl,
      displayUsername,
      checkMenuPermission,
      checkChildPermission,
      handleMenuCommand,
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
  background: url('@/assets/images/main/main-header1.png') center/cover no-repeat, 
              linear-gradient(135deg, 
                rgba(15, 25, 45, 0.8) 0%, 
                rgba(20, 35, 60, 0.8) 50%, 
                rgba(25, 40, 65, 0.8) 100%);
  background-blend-mode: overlay;
  color: #fff;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
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

.header-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  z-index: 2;
}

.header-center {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 2;
}

.system-menu-btn {
  background: linear-gradient(135deg, 
    rgba(0, 150, 255, 0.8) 0%, 
    rgba(0, 200, 255, 0.9) 100%);
  border: 1px solid rgba(0, 255, 255, 0.5);
  color: white;
  font-weight: bold;
  padding: 12px 20px;
  border-radius: 6px;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(0, 150, 255, 0.3);
}

.system-menu-btn:hover {
  background: linear-gradient(135deg, 
    rgba(0, 200, 255, 0.9) 0%, 
    rgba(0, 255, 255, 1) 100%);
  box-shadow: 0 0 25px rgba(0, 200, 255, 0.5);
  transform: translateY(-2px);
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
</style>
