<template>
  <div class="video-playback">
    <div class="control-panel">
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
      <div class="video-area">
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

      <div class="record-list">
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

.control-panel {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.content-area {
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.video-area {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

.video-controls :deep(.el-slider) {
  width: 300px;
  margin: 0 16px;
}

.time-display {
  font-family: monospace;
  color: #606266;
}

.record-list {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>