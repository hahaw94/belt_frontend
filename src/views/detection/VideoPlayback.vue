<template>
  <div class="video-playback">
    <div class="control-panel tech-card">
      <el-form :inline="true">
        <el-form-item label="选择设备">
          <el-select v-model="selectedDevice" placeholder="请选择设备">
            <el-option
              v-for="device in devices"
              :key="device.id"
              :label="device.name"
              :value="device.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择时间">
          <el-date-picker
            v-model="dateTimeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :shortcuts="shortcuts"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchRecords">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="content-area">
      <div class="video-area tech-card">
        <div class="video-container">
          <div class="video-placeholder">
            <!-- 这里将来会放置真实的视频播放器 -->
            视频播放区域
          </div>
          <div class="video-controls">
            <el-space>
              <el-button-group>
                <el-button type="primary" @click="play">
                  <el-icon><VideoPlay /></el-icon>
                </el-button>
                <el-button type="primary" @click="pause">
                  <el-icon><VideoPause /></el-icon>
                </el-button>
                <el-button type="primary" @click="stop">
                  <el-icon><VideoStop /></el-icon>
                </el-button>
              </el-button-group>
              <el-slider v-model="progress" :show-tooltip="true" />
              <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(totalTime) }}</span>
            </el-space>
          </div>
        </div>
      </div>

      <div class="record-list tech-card">
        <el-table :data="recordList" height="100%" style="width: 100%">
          <el-table-column prop="time" label="时间" width="180" />
          <el-table-column prop="type" label="类型" width="100" />
          <el-table-column prop="description" label="描述" />
          <el-table-column fixed="right" label="操作" width="120">
            <template #default="scope">
              <el-button link type="primary" @click="playRecord(scope.row)">
                播放
              </el-button>
              <el-button link type="primary" @click="downloadRecord(scope.row)">
                下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import {
  ElButton,
  ElButtonGroup,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElSpace,
  ElSlider,
  ElTable,
  ElTableColumn
} from 'element-plus'
import {
  Search,
  VideoPlay,
  VideoPause,
  VideoStop
} from '@element-plus/icons-vue'

export default {
  name: 'VideoPlayback',
  components: {
    ElButton,
    ElButtonGroup,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    ElDatePicker,
    ElSpace,
    ElSlider,
    ElTable,
    ElTableColumn,
    Search,
    VideoPlay,
    VideoPause,
    VideoStop
  },
  setup() {
    const selectedDevice = ref('')
    const dateTimeRange = ref([])
    const progress = ref(0)
    const currentTime = ref(0)
    const totalTime = ref(600) // 示例：10分钟

    // 模拟数据
    const devices = ref([
      { id: 1, name: '摄像头 1' },
      { id: 2, name: '摄像头 2' },
      { id: 3, name: '摄像头 3' }
    ])

    const recordList = ref([
      {
        time: '2024-01-20 10:30:00',
        type: '预警',
        description: '检测到异常行为'
      },
      {
        time: '2024-01-20 10:35:00',
        type: '预警',
        description: '检测到可疑物品'
      }
    ])

    const shortcuts = [
      {
        text: '最近一小时',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000)
          return [start, end]
        }
      },
      {
        text: '最近一天',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24)
          return [start, end]
        }
      }
    ]

    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.floor(seconds % 60)
      return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
    }

    const searchRecords = () => {
      // 实现查询录像记录的逻辑
      console.log('查询录像记录', selectedDevice.value, dateTimeRange.value)
    }

    const play = () => {
      console.log('播放视频')
    }

    const pause = () => {
      console.log('暂停视频')
    }

    const stop = () => {
      console.log('停止视频')
    }

    const playRecord = (record) => {
      console.log('播放录像', record)
    }

    const downloadRecord = (record) => {
      console.log('下载录像', record)
    }

    return {
      selectedDevice,
      dateTimeRange,
      devices,
      shortcuts,
      progress,
      currentTime,
      totalTime,
      recordList,
      formatTime,
      searchRecords,
      play,
      pause,
      stop,
      playRecord,
      downloadRecord
    }
  }
}
</script>

<style scoped>
.video-playback {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 科技感卡片样式 */
.tech-card {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
}

.control-panel {
  padding: 16px;
}

.content-area {
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.video-area {
  padding: 16px;
}

.video-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-placeholder {
  flex: 1;
  background: #000;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.video-controls {
  padding: 12px;
  background: rgba(20, 30, 50, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.video-controls :deep(.el-slider) {
  width: 300px;
  margin: 0 16px;
}

.time-display {
  font-family: monospace;
  color: rgba(0, 255, 255, 0.8);
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
}

.record-list {
  padding: 16px;
}

/* Element Plus 组件深色主题样式 */
:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8) !important;
}

/* 通用输入框深色主题 */
:deep(.el-input__wrapper) {
  background: rgba(20, 30, 50, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: 
    inset 0 0 10px rgba(0, 255, 255, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(5px) !important;
}

:deep(.el-input__wrapper:hover) {
  background: rgba(25, 35, 55, 0.9) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 
    inset 0 0 15px rgba(0, 255, 255, 0.08),
    0 0 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-input__wrapper.is-focus) {
  background: rgba(25, 35, 55, 0.95) !important;
  border-color: #00ffff !important;
  box-shadow: 
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 0 0 2px rgba(0, 255, 255, 0.3),
    0 0 15px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-input__inner) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  box-shadow: inset 0 0 10px rgba(0, 255, 255, 0.05) !important;
}

:deep(.el-select .el-input__wrapper:hover) {
  background: rgba(25, 35, 55, 0.9) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 
    inset 0 0 15px rgba(0, 255, 255, 0.08),
    0 0 8px rgba(0, 255, 255, 0.2) !important;
}

/* 下拉菜单深色主题 */
:deep(.el-select-dropdown) {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  backdrop-filter: blur(15px) !important;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
  border-radius: 8px !important;
}

:deep(.el-popper.is-light .el-select-dropdown) {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.85) !important;
  padding: 8px 16px !important;
  transition: all 0.3s ease !important;
  border-radius: 4px !important;
  margin: 2px 4px !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
  transform: translateX(2px) !important;
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  background: rgba(0, 255, 255, 0.25) !important;
  color: #00ffff !important;
  font-weight: 600 !important;
  box-shadow: 
    0 2px 8px rgba(0, 255, 255, 0.3),
    inset 0 0 10px rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item.is-disabled) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.3) !important;
  cursor: not-allowed !important;
}

/* 选择器内部样式强化 */
:deep(.el-select .el-input__inner) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 500 !important;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-select .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
  font-style: italic !important;
}

/* 下拉箭头图标 */
:deep(.el-select .el-input__suffix) {
  color: rgba(0, 255, 255, 0.8) !important;
}

:deep(.el-select .el-input__suffix:hover) {
  color: #00ffff !important;
  filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.5)) !important;
}

:deep(.el-select .el-select__caret) {
  color: rgba(0, 255, 255, 0.8) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-select .el-select__caret:hover) {
  color: #00ffff !important;
  transform: scale(1.1) !important;
}

/* 选择器展开状态 */
:deep(.el-select.is-focused .el-input__wrapper) {
  border-color: #00ffff !important;
  box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2) !important;
}

/* 选择器清除按钮 */
:deep(.el-select .el-input__suffix .el-icon) {
  color: rgba(0, 255, 255, 0.6) !important;
  transition: color 0.3s ease !important;
}

:deep(.el-select .el-input__suffix .el-icon:hover) {
  color: #00ffff !important;
}

/* 日期选择器输入框强化 */
:deep(.el-date-editor) {
  background: rgba(20, 30, 50, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: 
    inset 0 0 10px rgba(0, 255, 255, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(5px) !important;
}

:deep(.el-date-editor:hover) {
  background: rgba(25, 35, 55, 0.9) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 
    inset 0 0 15px rgba(0, 255, 255, 0.08),
    0 0 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-date-editor.is-active) {
  background: rgba(25, 35, 55, 0.95) !important;
  border-color: #00ffff !important;
  box-shadow: 
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 0 0 2px rgba(0, 255, 255, 0.3),
    0 0 15px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-date-editor .el-input__inner) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 500 !important;
}

:deep(.el-date-editor .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
  font-style: italic !important;
}

:deep(.el-date-editor .el-input__prefix),
:deep(.el-date-editor .el-input__suffix) {
  color: rgba(0, 255, 255, 0.8) !important;
}

/* 日期选择器面板深色主题 */
:deep(.el-picker-panel) {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  backdrop-filter: blur(15px) !important;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
  border-radius: 8px !important;
}

:deep(.el-picker-panel__body) {
  background: transparent !important;
}

:deep(.el-picker-panel__content) {
  background: transparent !important;
}

:deep(.el-date-range-picker__header) {
  background: rgba(20, 30, 50, 0.6) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-picker-panel__shortcut) {
  background: rgba(20, 30, 50, 0.4) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
}

:deep(.el-picker-panel__shortcut:hover) {
  background: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
  border-color: rgba(0, 255, 255, 0.4) !important;
}

:deep(.el-date-table) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-date-table th) {
  color: rgba(0, 255, 255, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-date-table td) {
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
}

:deep(.el-date-table td.available:hover) {
  background: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
  transform: scale(1.05) !important;
}

:deep(.el-date-table td.current) {
  background: rgba(0, 255, 255, 0.25) !important;
  color: #00ffff !important;
  font-weight: 600 !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-date-table td.today) {
  background: rgba(0, 150, 200, 0.2) !important;
  color: rgba(0, 255, 255, 0.9) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-date-table td.in-range) {
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-date-table td.start-date),
:deep(.el-date-table td.end-date) {
  background: rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
}

/* 时间选择器 */
:deep(.el-time-panel) {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  backdrop-filter: blur(15px) !important;
}

:deep(.el-time-spinner__item:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

:deep(.el-time-spinner__item.active) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}

:deep(.el-button-group .el-button) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-button-group .el-button:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  border-color: rgba(0, 255, 255, 0.4) !important;
  color: #00ffff !important;
}

:deep(.el-slider__runway) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-slider__bar) {
  background: linear-gradient(90deg, rgba(0, 150, 200, 0.8), #00ffff) !important;
}

:deep(.el-slider__button) {
  background: #00ffff !important;
  border: 2px solid rgba(0, 255, 255, 0.6) !important;
}

:deep(.el-slider__button:hover) {
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-table) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-table th) {
  background: rgba(20, 30, 50, 0.8) !important;
  color: #00ffff !important;
  border-color: rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-table td) {
  background: rgba(15, 25, 45, 0.6) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border-color: rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-table tr) {
  background: transparent !important;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(20, 30, 50, 0.4) !important;
}

:deep(.el-table__body tr:hover td) {
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-table__header-wrapper) {
  background: transparent !important;
}

:deep(.el-table__body-wrapper) {
  background: transparent !important;
}

:deep(.el-button--text) {
  color: rgba(0, 255, 255, 0.8) !important;
}

:deep(.el-button--text:hover) {
  color: #00ffff !important;
  background: rgba(0, 255, 255, 0.1) !important;
}
</style>