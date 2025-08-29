import { ref, onUnmounted } from 'vue'
import { getTaskProgress } from '@/api/map'

/**
 * 进度轮询Hook
 * @param {Object} options - 配置选项
 * @param {number} options.interval - 轮询间隔（毫秒），默认1000ms
 * @param {Function} options.onProgress - 进度更新回调
 * @param {Function} options.onComplete - 完成回调
 * @param {Function} options.onError - 错误回调
 * @returns {Object} 返回进度相关的响应式数据和方法
 */
export function useTaskProgress(options = {}) {
  const {
    interval = 1000, // 默认1秒轮询一次
    onProgress,
    onComplete,
    onError
  } = options

  // 响应式数据
  const progress = ref(0)
  const message = ref('')
  const isPolling = ref(false)
  const isCompleted = ref(false)
  const isError = ref(false)
  const errorMessage = ref('')
  const taskData = ref(null)

  // 轮询定时器
  let pollTimer = null

  /**
   * 开始轮询任务进度
   * @param {string} taskId - 任务ID
   */
  const startPolling = async (taskId) => {
    if (!taskId) {
      console.error('TaskId is required for progress polling')
      return
    }

    console.log(`开始轮询任务进度，TaskId: ${taskId}，间隔: ${interval}ms`)
    
    isPolling.value = true
    isCompleted.value = false
    isError.value = false
    errorMessage.value = ''
    progress.value = 0
    message.value = '任务已开始...'

    const poll = async () => {
      try {
        const response = await getTaskProgress(taskId)
        const data = response.data

        console.log('进度轮询响应:', data)

        // 更新进度数据
        progress.value = data.progress || 0
        message.value = data.message || data.current_step || '处理中...'
        taskData.value = data

        // 调用进度更新回调
        if (onProgress) {
          onProgress(data)
        }

        // 检查任务状态
        if (data.status === 'completed' || data.progress >= 100) {
          console.log('任务已完成')
          isCompleted.value = true
          isPolling.value = false
          stopPolling()
          
          if (onComplete) {
            onComplete(data)
          }
        } else if (data.status === 'failed' || data.status === 'error') {
          console.error('任务失败:', data.error || data.message)
          isError.value = true
          errorMessage.value = data.error || data.message || '任务执行失败'
          isPolling.value = false
          stopPolling()
          
          if (onError) {
            onError(data)
          }
        } else {
          // 继续轮询
          pollTimer = setTimeout(poll, interval)
        }
      } catch (error) {
        console.error('轮询进度时发生错误:', error)
        isError.value = true
        errorMessage.value = error.message || '获取进度失败'
        isPolling.value = false
        stopPolling()
        
        if (onError) {
          onError(error)
        }
      }
    }

    // 开始第一次轮询
    await poll()
  }

  /**
   * 停止轮询
   */
  const stopPolling = () => {
    if (pollTimer) {
      clearTimeout(pollTimer)
      pollTimer = null
    }
    isPolling.value = false
    console.log('进度轮询已停止')
  }

  /**
   * 重置状态
   */
  const reset = () => {
    stopPolling()
    progress.value = 0
    message.value = ''
    isCompleted.value = false
    isError.value = false
    errorMessage.value = ''
    taskData.value = null
  }

  // 组件卸载时清理定时器
  onUnmounted(() => {
    stopPolling()
  })

  return {
    // 响应式数据
    progress,
    message,
    isPolling,
    isCompleted,
    isError,
    errorMessage,
    taskData,
    
    // 方法
    startPolling,
    stopPolling,
    reset
  }
}
