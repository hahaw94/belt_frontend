<template>
  <div class="progress-modal-overlay" v-if="visible" @click.self="handleOverlayClick">
    <div class="progress-modal">
      <div class="progress-header">
        <h3>{{ displayTitle }}</h3>
        <button 
          v-if="!isPolling && (isCompleted || isError)" 
          @click="handleClose" 
          class="close-btn"
        >
          ×
        </button>
      </div>
      
      <div class="progress-content">
        <!-- 进度条 -->
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progress + '%' }"
              :class="{ 
                'success': isCompleted, 
                'error': isError,
                'active': isPolling 
              }"
            ></div>
          </div>
          <div class="progress-text">{{ progress }}%</div>
        </div>
        
        <!-- 状态消息 -->
          <div class="progress-message">
          <div v-if="isError" class="error-message">
            {{ errorMessage }}
          </div>
          <div v-else-if="isCompleted" class="success-message">
            {{ message || texts.completed }}
          </div>
          <div v-else class="info-message">
            {{ message || texts.processing }}
          </div>
        </div>
        
        <!-- 任务详情 -->
        <div v-if="taskData && showDetails" class="task-details">
          <h4>{{ texts.detailTitle }}</h4>
          <div class="detail-item" v-if="taskData.task_type">
            <span class="label">{{ texts.taskType }}:</span>
            <span class="value">{{ getTaskTypeText(taskData.task_type) }}</span>
          </div>
          <div class="detail-item" v-if="taskData.start_time">
            <span class="label">{{ texts.startTime }}:</span>
            <span class="value">{{ formatTime(taskData.start_time) }}</span>
          </div>
          <div class="detail-item" v-if="taskData.end_time">
            <span class="label">{{ texts.endTime }}:</span>
            <span class="value">{{ formatTime(taskData.end_time) }}</span>
          </div>
          <div class="detail-item" v-if="taskData.steps && taskData.steps.length">
            <span class="label">{{ texts.currentStep }}:</span>
            <span class="value">{{ taskData.current_step || texts.preparing }}</span>
          </div>
        </div>
      </div>
      
      <div class="progress-footer">
        <button 
          v-if="isPolling" 
          @click="handleCancel" 
          class="cancel-btn"
          :disabled="!allowCancel"
        >
          {{ allowCancel ? texts.cancel : texts.waiting }}
        </button>
        <button 
          v-else-if="isCompleted || isError" 
          @click="handleClose" 
          class="confirm-btn"
        >
          {{ texts.confirm }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
// eslint-disable-next-line no-undef
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  progress: {
    type: Number,
    default: 0
  },
  message: {
    type: String,
    default: ''
  },
  isPolling: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isError: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  taskData: {
    type: Object,
    default: null
  },
  showDetails: {
    type: Boolean,
    default: true
  },
  allowCancel: {
    type: Boolean,
    default: false
  },
  closeOnOverlay: {
    type: Boolean,
    default: false
  },
  locale: {
    type: String,
    default: 'zh'
  }
})

// eslint-disable-next-line no-undef
const emit = defineEmits(['close', 'cancel'])

const localeTexts = {
  zh: {
    title: '任务进度',
    completed: '任务完成',
    processing: '处理中...',
    detailTitle: '任务详情',
    taskType: '任务类型',
    startTime: '开始时间',
    endTime: '结束时间',
    currentStep: '当前步骤',
    preparing: '准备中',
    cancel: '取消',
    waiting: '请稍候...',
    confirm: '确定',
    typeMap: {
      backup_create: '系统备份',
      snapshot_create: '创建镜像点',
      snapshot_restore: '恢复镜像点',
      system_upgrade: '系统升级',
      system_restore: '系统恢复'
    }
  },
  en: {
    title: 'Task Progress',
    completed: 'Task completed',
    processing: 'Processing...',
    detailTitle: 'Task Details',
    taskType: 'Task Type',
    startTime: 'Start Time',
    endTime: 'End Time',
    currentStep: 'Current Step',
    preparing: 'Preparing',
    cancel: 'Cancel',
    waiting: 'Please wait...',
    confirm: 'OK',
    typeMap: {
      backup_create: 'System Backup',
      snapshot_create: 'Create Snapshot',
      snapshot_restore: 'Restore Snapshot',
      system_upgrade: 'System Upgrade',
      system_restore: 'System Restore'
    }
  }
}

const texts = computed(() => localeTexts[props.locale] || localeTexts.zh)
const displayTitle = computed(() => props.title || texts.value.title)

const handleClose = () => {
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay && !props.isPolling) {
    handleClose()
  }
}

const getTaskTypeText = (taskType) => {
  const typeMap = texts.value.typeMap
  return typeMap[taskType] || taskType
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  try {
    return new Date(timeStr).toLocaleString()
  } catch (e) {
    return timeStr
  }
}
</script>

<style scoped>
.progress-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.progress-modal {
  background: linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(0, 30, 60, 0.95));
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  min-width: 480px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(0, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  background: rgba(0, 255, 255, 0.05);
}

.progress-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.close-btn {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  font-size: 18px;
  color: #00ffff;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

.close-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 255, 255, 0.5);
  color: #ffffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
  transform: scale(1.05);
}

.progress-content {
  padding: 24px;
  background: rgba(0, 0, 0, 0.1);
}

.progress-bar-container {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 16px;
  background: rgba(0, 20, 40, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ccff, #0099cc);
  border-radius: 7px;
  transition: width 0.3s ease;
  position: relative;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.progress-fill.active {
  background: linear-gradient(90deg, #00ffff, #00ccff, #0099ff);
  animation: pulse 2s ease-in-out infinite alternate;
}

.progress-fill.success {
  background: linear-gradient(90deg, #00ff88, #00cc66);
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.6);
}

.progress-fill.error {
  background: linear-gradient(90deg, #ff4466, #cc3344);
  box-shadow: 0 0 15px rgba(255, 68, 102, 0.6);
}

.progress-fill.active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes pulse {
  0% { box-shadow: 0 0 10px rgba(0, 255, 255, 0.5); }
  100% { box-shadow: 0 0 20px rgba(0, 255, 255, 0.8); }
}

.progress-text {
  text-align: center;
  margin-top: 8px;
  font-weight: 600;
  color: #00ffff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
  font-size: 16px;
}

.progress-message {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  backdrop-filter: blur(8px);
}

.error-message {
  color: #ff6b6b;
  background: rgba(255, 68, 102, 0.1);
  border: 1px solid rgba(255, 68, 102, 0.3);
  box-shadow: 0 0 15px rgba(255, 68, 102, 0.2);
}

.success-message {
  color: #51cf66;
  background: rgba(81, 207, 102, 0.1);
  border: 1px solid rgba(81, 207, 102, 0.3);
  box-shadow: 0 0 15px rgba(81, 207, 102, 0.2);
}

.info-message {
  color: #00ffff;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
}

.error-message, .success-message, .info-message {
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  font-weight: 500;
  text-shadow: 0 0 5px currentColor;
}

.task-details {
  border-top: 1px solid rgba(0, 255, 255, 0.2);
  padding-top: 16px;
  background: rgba(0, 20, 40, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.task-details h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #00ffff;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  color: rgba(255, 255, 255, 0.7);
  min-width: 80px;
}

.detail-item .value {
  color: #ffffff;
  text-align: right;
  flex: 1;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
}

.progress-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 255, 255, 0.2);
  background: rgba(0, 255, 255, 0.05);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn, .confirm-btn {
  padding: 10px 20px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(0, 20, 40, 0.6);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  color: #ffffff;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(8px);
}

.cancel-btn:hover:not(:disabled) {
  border-color: rgba(255, 68, 102, 0.5);
  background: rgba(255, 68, 102, 0.1);
  color: #ff6b6b;
  box-shadow: 0 0 15px rgba(255, 68, 102, 0.3);
  text-shadow: 0 0 8px rgba(255, 107, 107, 0.5);
}

.confirm-btn {
  background: rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 255, 255, 0.5);
  color: #00ffff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.confirm-btn:hover {
  background: rgba(0, 255, 255, 0.3);
  border-color: rgba(0, 255, 255, 0.7);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  transform: translateY(-1px);
}

.cancel-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  color: rgba(255, 255, 255, 0.5);
  text-shadow: none;
  box-shadow: none;
}

/* 自定义滚动条样式 */
.progress-modal::-webkit-scrollbar {
  width: 6px;
}

.progress-modal::-webkit-scrollbar-track {
  background: rgba(0, 20, 40, 0.3);
  border-radius: 3px;
}

.progress-modal::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.4);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.progress-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.6);
  box-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}
</style>
