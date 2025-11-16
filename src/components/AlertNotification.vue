<template>
  <div class="alert-notification">
    <el-dropdown
      ref="dropdownRef"
      trigger="click"
      placement="bottom-end"
      @visible-change="handleDropdownVisible"
    >
      <div class="notification-bell" :class="{ 'has-unread': hasUnreadAlerts }">
        <el-icon class="bell-icon">
          <Bell />
        </el-icon>
        <span v-if="unreadCount > 0" class="notification-badge">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </div>
      
      <template #dropdown>
        <el-dropdown-menu class="notification-dropdown">
          <div class="notification-header">
            <h4>告警通知</h4>
            <div class="header-actions">
              <el-button 
                size="small" 
                type="primary" 
                @click="testAlert"
                class="test-btn"
              >
                测试
              </el-button>
              <el-button 
                size="small" 
                text 
                @click="markAllAsRead"
                v-if="hasUnreadAlerts"
              >
                全部已读
              </el-button>
            </div>
          </div>
          
          <div class="notification-content">
            <div v-if="alertHistory.length === 0" class="empty-state">
              <el-icon class="empty-icon"><DocumentRemove /></el-icon>
              <p>暂无告警记录</p>
            </div>
            
            <div v-else class="alert-list">
              <div
                v-for="alert in paginatedAlerts"
                :key="alert.id"
                class="alert-item"
                :class="{ 'unread': !alert.read }"
                @click="handleAlertClick(alert)"
              >
                <div class="alert-image">
                  <img :src="alert.image" :alt="alert.type" />
                </div>
                <div class="alert-info">
                  <p class="alert-message">{{ alert.message }}</p>
                  <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
                  <span class="alert-type-badge" :class="alert.type">
                    {{ getTypeText(alert.type) }}
                  </span>
                </div>
                <div v-if="!alert.read" class="unread-dot"></div>
              </div>
            </div>
            
            <div v-if="alertHistory.length > pageSize" class="pagination">
              <el-button 
                size="small" 
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                上一页
              </el-button>
              <span class="page-info">
                {{ currentPage }} / {{ totalPages }}
              </span>
              <el-button 
                size="small" 
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                下一页
              </el-button>
            </div>
          </div>
          
          <div class="notification-footer">
            <el-button size="small" text @click="clearHistory">
              清空历史
            </el-button>
          </div>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, DocumentRemove } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'AlertNotification',
  components: {
    Bell,
    DocumentRemove
  },
  props: {
    alertHistory: {
      type: Array,
      default: () => []
    }
  },
  emits: ['test-alert', 'mark-as-read', 'mark-all-as-read', 'clear-history', 'alert-click'],
  setup(props, { emit }) {
    const router = useRouter()
    const dropdownRef = ref(null)
    const currentPage = ref(1)
    const pageSize = ref(10)

    const unreadCount = computed(() => {
      return props.alertHistory.filter(alert => !alert.read).length
    })

    const hasUnreadAlerts = computed(() => {
      return unreadCount.value > 0
    })

    const totalPages = computed(() => {
      return Math.ceil(props.alertHistory.length / pageSize.value)
    })

    const paginatedAlerts = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return props.alertHistory.slice(start, end)
    })

    const testAlert = () => {
      const testAlerts = [
        {
          type: 'error',
          message: '检测到异常行为：人员进入危险区域',
          image: 'https://via.placeholder.com/300x200/1a2a4a/ff4d4f?text=危险区域告警'
        },
        {
          type: 'warning',
          message: '设备温度过高，请及时检查',
          image: 'https://via.placeholder.com/300x200/1a2a4a/ffc107?text=温度告警'
        },
        {
          type: 'info',
          message: '新的检测任务已开始执行',
          image: 'https://via.placeholder.com/300x200/1a2a4a/00ffff?text=任务通知'
        },
        {
          type: 'success',
          message: '系统自检完成，所有设备正常',
          image: 'https://via.placeholder.com/300x200/1a2a4a/67c23a?text=系统正常'
        }
      ]
      
      const randomAlert = testAlerts[Math.floor(Math.random() * testAlerts.length)]
      emit('test-alert', randomAlert)
      ElMessage.success('测试告警已发送')
    }

    const markAsRead = (alertId) => {
      emit('mark-as-read', alertId)
    }

    const handleAlertClick = (alert) => {
      console.log('AlertNotification: 点击告警项', alert)
      markAsRead(alert.id)
      // 直接跳转到告警展示页面
      console.log('AlertNotification: 准备跳转到 /event/alarm-display')
      router.push('/event/alarm-display').then(() => {
        console.log('AlertNotification: 跳转成功')
      }).catch(err => {
        console.error('AlertNotification: 跳转失败:', err)
      })
      // 也触发事件，以便父组件可以做其他处理
      emit('alert-click', alert)
      // 关闭下拉菜单
      setTimeout(() => {
        if (dropdownRef.value) {
          dropdownRef.value.handleClose()
        }
      }, 100)
    }

    const markAllAsRead = () => {
      emit('mark-all-as-read')
      ElMessage.success('已标记所有告警为已读')
    }

    const clearHistory = () => {
      emit('clear-history')
      currentPage.value = 1
      ElMessage.success('历史记录已清空')
    }

    const handleDropdownVisible = (visible) => {
      if (visible) {
        currentPage.value = 1
      }
    }

    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return `${Math.floor(diff / 60000)}分钟前`
      } else if (diff < 86400000) { // 24小时内
        return `${Math.floor(diff / 3600000)}小时前`
      } else {
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5)
      }
    }

    const getTypeText = (type) => {
      const typeMap = {
        error: '错误',
        warning: '警告',
        info: '信息',
        success: '成功'
      }
      return typeMap[type] || '未知'
    }

    return {
      dropdownRef,
      currentPage,
      pageSize,
      unreadCount,
      hasUnreadAlerts,
      totalPages,
      paginatedAlerts,
      testAlert,
      markAsRead,
      markAllAsRead,
      clearHistory,
      handleDropdownVisible,
      handleAlertClick,
      formatTime,
      getTypeText
    }
  }
}
</script>

<style scoped>
.alert-notification {
  position: relative;
}

.notification-bell {
  position: relative;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-bell:hover {
  background: transparent;
  transform: scale(1.1);
}

.notification-bell.has-unread {
  animation: bellShake 2s infinite;
}

.bell-icon {
  font-size: 18px;
  color: #ffffff;
  transition: all 0.3s ease;
}

.notification-bell:hover .bell-icon {
  color: #00d4ff;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4d4f;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: bold;
  min-width: 16px;
  text-align: center;
  line-height: 1.2;
}

.notification-dropdown {
  width: 380px;
  max-height: 500px;
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6) !important;
}

.notification-header {
  padding: 15px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-header h4 {
  margin: 0;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.test-btn {
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  border: none;
  color: white;
  font-weight: 500;
}

.test-btn:hover {
  background: linear-gradient(135deg, #0099cc, #007399);
}

.notification-content {
  max-height: 350px;
  overflow-y: auto;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  color: #666;
  margin-bottom: 10px;
}

.alert-list {
  padding: 0;
}

.alert-item {
  display: flex;
  padding: 12px 15px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.alert-item:hover {
  background: rgba(0, 255, 255, 0.05);
}

.alert-item.unread {
  background: rgba(0, 255, 255, 0.02);
}

.alert-image {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.alert-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.alert-info {
  flex: 1;
  min-width: 0;
}

.alert-message {
  margin: 0 0 6px 0;
  color: #ffffff;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.alert-time {
  font-size: 11px;
  color: #999;
  margin-right: 8px;
}

.alert-type-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.alert-type-badge.error {
  background: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.alert-type-badge.warning {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.alert-type-badge.info {
  background: rgba(0, 255, 255, 0.2);
  color: #00ffff;
}

.alert-type-badge.success {
  background: rgba(103, 194, 58, 0.2);
  color: #67c23a;
}

.unread-dot {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #00ffff;
  border-radius: 50%;
}

.pagination {
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(0, 255, 255, 0.1);
}

.page-info {
  color: #999;
  font-size: 12px;
}

.notification-footer {
  padding: 10px 15px;
  border-top: 1px solid rgba(0, 255, 255, 0.2);
  text-align: center;
}

/* 铃铛摇摆动画 */
@keyframes bellShake {
  0%, 50%, 100% {
    transform: rotate(0deg);
  }
  10%, 30% {
    transform: rotate(-10deg);
  }
  20%, 40% {
    transform: rotate(10deg);
  }
}

/* 滚动条样式 */
.notification-content::-webkit-scrollbar {
  width: 4px;
}

.notification-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.notification-content::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 2px;
}

.notification-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-dropdown {
    width: 320px;
  }
  
  .alert-item {
    padding: 10px 12px;
  }
  
  .alert-image {
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }
  
  .alert-message {
    font-size: 12px;
  }
}
</style>
