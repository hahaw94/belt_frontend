<template>
  <div class="progress-modal-overlay" v-if="visible" @click.self="handleOverlayClick">
    <div class="progress-modal">
      <div class="progress-header">
        <h3>{{ title }}</h3>
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
            <i class="error-icon">⚠️</i>
            {{ errorMessage }}
          </div>
          <div v-else-if="isCompleted" class="success-message">
            <i class="success-icon">✅</i>
            {{ message || '任务完成' }}
          </div>
          <div v-else class="info-message">
            <i class="loading-icon" v-if="isPolling">⏳</i>
            {{ message || '处理中...' }}
          </div>
        </div>
        
        <!-- 任务详情 -->
        <div v-if="taskData && showDetails" class="task-details">
          <h4>任务详情</h4>
          <div class="detail-item" v-if="taskData.task_type">
            <span class="label">任务类型:</span>
            <span class="value">{{ getTaskTypeText(taskData.task_type) }}</span>
          </div>
          <div class="detail-item" v-if="taskData.start_time">
            <span class="label">开始时间:</span>
            <span class="value">{{ formatTime(taskData.start_time) }}</span>
          </div>
          <div class="detail-item" v-if="taskData.end_time">
            <span class="label">结束时间:</span>
            <span class="value">{{ formatTime(taskData.end_time) }}</span>
          </div>
          <div class="detail-item" v-if="taskData.steps && taskData.steps.length">
            <span class="label">当前步骤:</span>
            <span class="value">{{ taskData.current_step || '准备中' }}</span>
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
          {{ allowCancel ? '取消' : '请稍候...' }}
        </button>
        <button 
          v-else-if="isCompleted || isError" 
          @click="handleClose" 
          class="confirm-btn"
        >
          确定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// eslint-disable-next-line no-undef
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '任务进度'
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
  }
})

// eslint-disable-next-line no-undef
const emit = defineEmits(['close', 'cancel'])

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
  const typeMap = {
    'backup_create': '系统备份',
    'snapshot_create': '创建镜像点',
    'snapshot_restore': '恢复镜像点',
    'system_upgrade': '系统升级',
    'system_restore': '系统恢复'
  }
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.progress-modal {
  background: white;
  border-radius: 8px;
  min-width: 480px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #eee;
}

.progress-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.progress-content {
  padding: 24px;
}

.progress-bar-container {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: #1890ff;
  border-radius: 6px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill.active {
  background: linear-gradient(45deg, #1890ff, #40a9ff);
}

.progress-fill.success {
  background: #52c41a;
}

.progress-fill.error {
  background: #ff4d4f;
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
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  text-align: center;
  margin-top: 8px;
  font-weight: 600;
  color: #666;
}

.progress-message {
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.error-message {
  color: #ff4d4f;
  background: #fff2f0;
  border: 1px solid #ffccc7;
}

.success-message {
  color: #52c41a;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.info-message {
  color: #1890ff;
  background: #f0f9ff;
  border: 1px solid #91d5ff;
}

.error-message, .success-message, .info-message {
  padding: 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-icon {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.task-details {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.task-details h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-item .label {
  color: #999;
  min-width: 80px;
}

.detail-item .value {
  color: #333;
  text-align: right;
  flex: 1;
}

.progress-footer {
  padding: 16px 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn, .confirm-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.cancel-btn:hover:not(:disabled) {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.confirm-btn {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

.confirm-btn:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
