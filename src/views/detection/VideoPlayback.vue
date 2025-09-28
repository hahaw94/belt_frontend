<template>
  <div class="video-playback">
    <div class="control-panel tech-card">
      <el-form :inline="true">
        <el-form-item label="选择设备">
          <div class="custom-select" :class="{ 'is-open': isDropdownOpen }" @click="toggleDropdown">
            <div class="select-input">
              <span class="selected-text">{{ selectedDeviceName || '请选择设备' }}</span>
              <div class="select-arrow">
                <svg viewBox="0 0 1024 1024" width="14" height="14">
                  <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3 0.1-12.7-6.4-12.7z" fill="currentColor"></path>
                </svg>
              </div>
            </div>
            <div class="dropdown-menu" v-show="isDropdownOpen">
              <div 
                class="dropdown-item" 
              v-for="device in devices"
              :key="device.id"
                :class="{ 'is-selected': selectedDevice === device.id }"
                @click.stop="selectDevice(device)"
              >
                {{ device.name }}
              </div>
            </div>
          </div>
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
import { ref, onMounted, onUnmounted } from 'vue'
import {
  ElButton,
  ElButtonGroup,
  ElForm,
  ElFormItem,
  ElDatePicker,
  ElSpace,
  ElSlider,
  ElTable,
  ElTableColumn
} from 'element-plus'
import {
  Search,
  VideoPlay,
  VideoPause
} from '@element-plus/icons-vue'

export default {
  name: 'VideoPlayback',
  components: {
    ElButton,
    ElButtonGroup,
    ElForm,
    ElFormItem,
    ElDatePicker,
    ElSpace,
    ElSlider,
    ElTable,
    ElTableColumn,
    Search,
    VideoPlay,
    VideoPause
  },
  setup() {
    const selectedDevice = ref('')
    const selectedDeviceName = ref('')
    const isDropdownOpen = ref(false)
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

    const playRecord = (record) => {
      console.log('播放录像', record)
    }

    const downloadRecord = (record) => {
      console.log('下载录像', record)
    }

    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value
    }

    const selectDevice = (device) => {
      selectedDevice.value = device.id
      selectedDeviceName.value = device.name
      isDropdownOpen.value = false
    }

    // 点击外部关闭下拉菜单
    const handleClickOutside = (event) => {
      const customSelect = event.target.closest('.custom-select')
      if (!customSelect) {
        isDropdownOpen.value = false
      }
    }

    // 组件挂载时添加事件监听
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    // 组件卸载时移除事件监听
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      selectedDevice,
      selectedDeviceName,
      isDropdownOpen,
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
      playRecord,
      downloadRecord,
      toggleDropdown,
      selectDevice
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
  overflow: visible;
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
  overflow: visible;
  position: relative;
  z-index: 50;
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

/* 自定义下拉选择器样式 */
.custom-select {
  position: relative;
  min-width: 200px;
  cursor: pointer;
  user-select: none;
  z-index: 100;
}

.select-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  background: rgba(20, 30, 50, 0.85);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  height: 32px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    inset 0 0 10px rgba(0, 255, 255, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
}

.selected-text {
  flex: 1;
  padding: 0 12px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.select-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 100%;
  background: linear-gradient(135deg, #00ffff 0%, #0099cc 50%, #006699 100%);
  color: #ffffff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 3px 12px rgba(0, 255, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  position: relative;
}

.select-arrow::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.select-arrow svg {
  transition: transform 0.3s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

/* 悬停效果 */
.custom-select:hover .select-input {
  background: rgba(25, 35, 55, 0.9);
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 
    inset 0 0 15px rgba(0, 255, 255, 0.08),
    0 0 8px rgba(0, 255, 255, 0.2);
}

.custom-select:hover .select-arrow {
  background: linear-gradient(135deg, #00ccff 0%, #0077aa 50%, #004466 100%);
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.6),
    0 0 40px rgba(0, 255, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}

.custom-select:hover .select-arrow::before {
  opacity: 1;
}

/* 展开状态 */
.custom-select.is-open .select-input {
  border-color: #00ffff;
  background: rgba(25, 35, 55, 0.95);
  box-shadow: 
    0 0 0 2px rgba(0, 255, 255, 0.3),
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 0 15px rgba(0, 255, 255, 0.2);
}

.custom-select.is-open .select-arrow {
  background: linear-gradient(135deg, #00ddff 0%, #0088bb 50%, #005577 100%);
  box-shadow: 
    0 0 25px rgba(0, 255, 255, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
}

.custom-select.is-open .select-arrow svg {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: rgba(15, 25, 45, 0.98);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(15px);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.1);
  z-index: 9999;
  max-height: 200px;
  overflow-y: auto;
  animation: dropdownFadeIn 0.2s ease-out;
  min-height: 120px; /* 确保有足够高度显示所有选项 */
  width: 100%; /* 确保宽度正确 */
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  padding: 10px 16px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  margin: 2px 4px;
  position: relative;
  overflow: hidden;
  min-height: 36px;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.dropdown-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.dropdown-item:hover {
  background: rgba(0, 255, 255, 0.15);
  color: #00ffff;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2);
}

.dropdown-item:hover::before {
  left: 100%;
}

.dropdown-item.is-selected {
  background: rgba(0, 255, 255, 0.25);
  color: #00ffff;
  font-weight: 600;
  box-shadow: 
    0 2px 8px rgba(0, 255, 255, 0.3),
    inset 0 0 10px rgba(0, 255, 255, 0.1);
}

.dropdown-item.is-selected::after {
  content: '✓';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #00ffff;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

/* 滚动条样式 */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: rgba(20, 30, 50, 0.5);
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #00ffff, #0099cc);
  border-radius: 3px;
  box-shadow: inset 0 0 2px rgba(255, 255, 255, 0.2);
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #00ccff, #0077aa);
}

/* Element Plus 组件深色主题样式 */
:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-form--inline) {
  overflow: visible !important;
}

:deep(.el-form-item) {
  overflow: visible !important;
  position: relative !important;
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

/* Element UI选择器样式已移除，使用自定义组件 */

/* Element UI选择器相关样式已完全移除，使用自定义下拉组件 */

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