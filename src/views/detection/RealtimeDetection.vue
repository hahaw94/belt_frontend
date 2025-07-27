<template>
  <div class="realtime-detection">
    <div class="control-panel">
      <el-space wrap>
        <el-button-group>
          <el-button type="primary" @click="setLayout(1)">
            <el-icon><Monitor /></el-icon>
            单屏
          </el-button>
          <el-button type="primary" @click="setLayout(4)">
            <el-icon><Grid /></el-icon>
            4分屏
          </el-button>
          <el-button type="primary" @click="setLayout(9)">
            <el-icon><Grid /></el-icon>
            9分屏
          </el-button>
          <el-button type="primary" @click="setLayout(16)">
            <el-icon><Grid /></el-icon>
            16分屏
          </el-button>
        </el-button-group>
      </el-space>
    </div>

    <div class="video-grid" :class="'grid-' + currentLayout">
      <div v-for="n in currentLayout" :key="n" class="video-cell">
        <div class="video-container">
          <div class="video-placeholder">
            <!-- 这里将来会放置真实的视频流 -->
            摄像头 {{ n }}
          </div>
          <div class="overlay-info" v-if="hasWarning(n)">
            <el-tag type="danger">预警信息</el-tag>
            <div class="warning-text">检测到异常行为</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { ElButton, ElButtonGroup, ElSpace, ElTag } from 'element-plus'
import { Monitor, Grid } from '@element-plus/icons-vue'

export default {
  name: 'RealtimeDetection',
  components: {
    ElButton,
    ElButtonGroup,
    ElSpace,
    ElTag,
    Monitor,
    Grid
  },
  setup() {
    const currentLayout = ref(4) // 默认4分屏
    const warnings = ref(new Set([2, 4])) // 模拟某些摄像头有预警

    const setLayout = (layout) => {
      currentLayout.value = layout
    }

    const hasWarning = (cameraId) => {
      return warnings.value.has(cameraId)
    }

    return {
      currentLayout,
      setLayout,
      hasWarning
    }
  }
}
</script>

<style scoped>
.realtime-detection {
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

.video-grid {
  flex: 1;
  display: grid;
  gap: 10px;
  background: #f5f7fa;
  padding: 10px;
  border-radius: 8px;
}

.grid-1 {
  grid-template-columns: 1fr;
}

.grid-4 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-9 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-16 {
  grid-template-columns: repeat(4, 1fr);
}

.video-cell {
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.overlay-info {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.warning-text {
  color: #fff;
  background: rgba(255, 0, 0, 0.7);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>