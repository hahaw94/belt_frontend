<template>
  <div class="alert-toast-container">
    <transition-group name="toast" tag="div" class="toast-list">
      <div
        v-for="alert in visibleAlerts"
        :key="alert.id"
        class="alert-toast"
        :class="alert.type"
        @click="handleToastClick(alert)"
      >
        <div class="toast-image">
          <img :src="alert.image" :alt="alert.type" />
        </div>
        <div class="toast-content">
          <p class="toast-message">{{ alert.message }}</p>
        </div>
        <div class="toast-close" @click.stop="removeAlert(alert.id)">
          <el-icon><Close /></el-icon>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Close } from '@element-plus/icons-vue'

export default {
  name: 'AlertToast',
  components: {
    Close
  },
  props: {
    alerts: {
      type: Array,
      default: () => []
    },
    maxVisible: {
      type: Number,
      default: 3
    },
    duration: {
      type: Number,
      default: 5000
    }
  },
  emits: ['remove-alert', 'toast-click'],
  setup(props, { emit }) {
    const timers = ref(new Map())

    const visibleAlerts = computed(() => {
      return props.alerts.slice(-props.maxVisible)
    })

    const removeAlert = (id) => {
      if (timers.value.has(id)) {
        clearTimeout(timers.value.get(id))
        timers.value.delete(id)
      }
      emit('remove-alert', id)
    }

    const handleToastClick = (alert) => {
      emit('toast-click', alert)
    }

    const startTimer = (alert) => {
      if (timers.value.has(alert.id)) {
        clearTimeout(timers.value.get(alert.id))
      }
      
      const timer = setTimeout(() => {
        removeAlert(alert.id)
      }, props.duration)
      
      timers.value.set(alert.id, timer)
    }

    // 监听新增的告警，为其设置定时器
    const watchAlerts = () => {
      visibleAlerts.value.forEach(alert => {
        if (!timers.value.has(alert.id)) {
          startTimer(alert)
        }
      })
    }

    onMounted(() => {
      watchAlerts()
    })

    onUnmounted(() => {
      timers.value.forEach(timer => clearTimeout(timer))
      timers.value.clear()
    })

    // 当alerts变化时，重新设置定时器
    const updateTimers = () => {
      watchAlerts()
    }

    return {
      visibleAlerts,
      removeAlert,
      handleToastClick,
      updateTimers
    }
  },
  watch: {
    alerts: {
      handler() {
        this.$nextTick(() => {
          this.updateTimers()
        })
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.alert-toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
}

.alert-toast {
  width: 320px;
  background: rgba(15, 25, 45, 0.95);
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 8px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  pointer-events: auto;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.alert-toast:hover {
  transform: translateX(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8);
}

.toast-image {
  width: 100%;
  height: 120px;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.toast-content {
  padding: 15px;
  background: rgba(10, 20, 35, 0.8);
}

.toast-message {
  margin: 0;
  color: #ffffff;
  font-size: 14px;
  line-height: 1.4;
  text-align: center;
  font-weight: 500;
}

.toast-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ffffff;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: rgba(255, 0, 0, 0.6);
  transform: scale(1.1);
}

/* 不同类型的告警样式 */
.alert-toast.error {
  border-color: rgba(255, 77, 79, 0.6);
}

.alert-toast.warning {
  border-color: rgba(255, 193, 7, 0.6);
}

.alert-toast.info {
  border-color: rgba(0, 255, 255, 0.6);
}

.alert-toast.success {
  border-color: rgba(103, 194, 58, 0.6);
}

/* 动画效果 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-move {
  transition: transform 0.4s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .alert-toast-container {
    right: 10px;
    bottom: 10px;
  }
  
  .alert-toast {
    width: 280px;
  }
  
  .toast-image {
    height: 100px;
  }
  
  .toast-content {
    padding: 12px;
  }
  
  .toast-message {
    font-size: 13px;
  }
}
</style>
