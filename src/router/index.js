// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import Layout from '@/layout/index.vue';
// 首页组件
// 无需在这里引入所有页面组件，因为我们使用路由懒加载

const routes = [
  // 登录页面
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login/LoginView.vue'),
    meta: { title: '用户登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'home',
        component: HomeView,
        meta: { title: '首页/总览' }
      }
    ]
  },
  // 系统配置
  {
    path: '/system-config', // 系统配置模块的父路径
    component: Layout, // 使用布局组件
    redirect: '/system-config/basic-management', // 默认重定向到基础管理
    name: 'SystemConfig',
    meta: {
      title: '系统配置', // 侧边栏显示的标题
      icon: 'Setting',    // 侧边栏显示的图标 (Element Plus Icon)
      alwaysShow: true // 总是显示子菜单，即使只有一个子菜单
    },
    children: [
      {
        path: 'basic-management', // 基础管理的子路径
        name: 'BasicManagement',
        component: () => import('@/views/system-config/basic-management/BasicManagement.vue'), // 指向基础管理组件
        meta: { title: '基础管理', icon: 'SetUp' } // Use SetUp icon for basic settings
      },
      {
        path: 'version-management', // 版本管理
        name: 'VersionManagement',
        component: () => import('@/views/system-config/version-management/VersionManagement.vue'), // 指向版本管理组件
        meta: { title: '版本管理', icon: 'Document' } // Use Document icon for versions
      },
      {
        path: 'map-management', // 地图管理
        name: 'MapManagement',
        component: () => import('@/views/system-config/map-management/MapManagement.vue'), // 指向地图管理组件
        meta: { title: '地图管理', icon: 'MapLocation' } // Use MapLocation icon for maps
      }
    ]
  },
  // 算法配置
  {
    path: '/algorithm',
    name: 'algorithm',
    redirect: '/algorithm/upload',
    component: Layout,
    meta: { title: '算法配置', requiresAuth: true },
    children: [
      {
        path: 'upload',
        name: 'algorithm-upload',
        component: () => import('../views/algorithm/AlgorithmUpload.vue'),
        meta: { title: '算法仓' }
      },
      {
        path: 'config',
        name: 'algorithm-config',
        component: () => import('../views/algorithm/AlgorithmManagement.vue'),
        meta: { title: '算法配置' }
      }
    ]
  },
  // 用户管理
  {
    path: '/usermanagement',
    name: 'UserManagement',
    component: Layout,
    redirect: '/usermanagement/user-management-manage',
    meta: { title: '用户管理', icon: 'User' },
    children: [
      {
        path: 'user-management-manage',
        name: 'UserManage',
        component: () => import('../views/user-management/UserManage.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'role-management',
        name: 'RoleManagement',
        component: () => import('../views/user-management/RoleManagement.vue'),
        meta: { title: '角色管理' }
      }
    ]
  },
  // 接入管理
  {
    path: '/access',
    name: 'access',
    redirect: '/access/device',
    component: Layout,
    meta: { title: '接入管理', requiresAuth: true },
    children: [
      {
        path: 'device',
        name: 'access-device',
        component: () => import('../views/access/DeviceManagement.vue'),
        meta: { title: '设备管理' }
      },
      {
        path: 'info',
        name: 'access-info',
        component: () => import('../views/access/DeviceInfo.vue'),
        meta: { title: '设备信息' }
      },
      {
        path: 'protocol',
        name: 'access-protocol',
        component: () => import('../views/access/DeviceAccessProtocol.vue'),
        meta: { title: '设备接入协议' }
      }
    ]
  },
  // 实时检测
  {
    path: '/detection',
    name: 'detection',
    redirect: '/detection/realtime',
    component: Layout,
    meta: { title: '实时检测', requiresAuth: true },
    children: [
      {
        path: 'realtime',
        name: 'detection-realtime',
        component: () => import('../views/detection/RealtimeDetection.vue'),
        meta: { title: '实时检测' }
      },
      {
        path: 'playback',
        name: 'detection-playback',
        component: () => import('../views/detection/VideoPlayback.vue'),
        meta: { title: '录像回放' }
      }
    ]
  },
  // 录像管理
  {
    path: '/recording',
    name: 'recording',
    redirect: '/recording/list',
    component: Layout,
    meta: { title: '录像管理', icon: 'VideoCamera', requiresAuth: true },
    children: [
      {
        path: 'list',
        name: 'recording-list',
        component: () => import('../views/recording/RecordingList.vue'),
        meta: { title: '录像列表' }
      },
      {
        path: 'statistics',
        name: 'recording-statistics',
        component: () => import('../views/recording/RecordingStatistics.vue'),
        meta: { title: '录像统计' }
      }
    ]
  },
  // 事件中心
  {
    path: '/event',
    name: 'event',
    redirect: '/event/alarm-display',
    component: Layout,
    meta: { title: '事件中心', requiresAuth: true },
    children: [
      {
        path: 'alarm-display',
        name: 'event-alarm-display',
        component: () => import('../views/event/AlarmDisplay.vue'),
        meta: { title: '告警信息展示' }
      },
      {
        path: 'data-collection',
        name: 'event-data-collection',
        component: () => import('../views/event/DataCollection.vue'),
        meta: { title: '告警数据收集' }
      },
      {
        path: 'immediate-command',
        name: 'event-immediate-command',
        component: () => import('../views/event/ImmediateCommand.vue'),
        meta: { title: '即时告警批示' }
      },
      {
        path: 'linkage-settings',
        name: 'event-linkage-settings',
        component: () => import('../views/event/LinkageSettings.vue'),
        meta: { title: '告警联动设置' }
      },
      {
        path: 'warning-push',
        name: 'event-warning-push',
        component: () => import('../views/event/WarningPush.vue'),
        meta: { title: '预警推送' }
      }
    ]
  },
  // 日志中心
  {
    path: '/log',
    component: Layout,
    children: [
      {
        path: '',
        name: 'log',
        component: () => import('../views/LogCenter.vue'),
        meta: { title: '日志中心', requiresAuth: true }
      }
    ]
  },
  // 统计分析
  {
    path: '/statistics',
    component: Layout,
    children: [
      {
        path: '',
        name: 'statistics',
        component: () => import('../views/StatisticsAnalysis.vue'),
        meta: { title: '统计分析', requiresAuth: true }
      }
    ]
  },
  // API 接口（通常不需要页面）
  // {
  //   path: '/api-docs',
  //   name: 'api-docs',
  //   component: () => import('../views/ApiDocs.vue'),
  //   meta: { title: 'API接口', requiresAuth: true }
  // }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// 全局前置守卫：每次路由跳转前执行
router.beforeEach((to, from, next) => {
  // 更新页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 后台管理系统`;
  } else {
    document.title = '后台管理系统';
  }

  // 简单的权限判断（此处仅为示例，实际应结合用户登录状态和角色）
  // if (to.meta.requiresAuth && !localStorage.getItem('token')) {
  //   alert('请先登录！');
  //   next('/login'); // 重定向到登录页
  // } else {
  next(); // 继续导航
  // }
});

export default router;