<template>
  <div class="realtime-detection">
    <div class="control-panel tech-card">
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
  padding: 16px;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
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
  padding: 12px 16px;
  flex-shrink: 0;
}

.video-grid {
  flex: 1;
  display: grid;
  gap: 2px;
  background: linear-gradient(135deg, 
    rgba(15, 25, 45, 0.4) 0%, 
    rgba(20, 30, 50, 0.3) 50%, 
    rgba(15, 25, 45, 0.4) 100%);
  padding: 8px;
  border-radius: 16px;
  border: 2px solid rgba(0, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  box-shadow: 
    inset 0 0 30px rgba(0, 255, 255, 0.05),
    0 8px 25px rgba(0, 0, 0, 0.3);
  min-height: 0;
  overflow: hidden;
}

/* 单屏模式 - 居中大画面 */
.grid-1 {
  grid-template-columns: 1fr;
  place-items: center;
  padding: 20px;
}

.grid-1 .video-cell {
  width: min(800px, 90%);
  height: min(450px, 60vh);
  aspect-ratio: 16/9;
}

/* 4分屏模式 - 2x2网格 */
.grid-4 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.grid-4 .video-cell {
  aspect-ratio: 16/9;
  min-height: 200px;
  max-height: min(280px, calc((100vh - 240px) / 2));
  border-radius: 2px;
}

/* 9分屏模式 - 3x3网格 */
.grid-9 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

.grid-9 .video-cell {
  aspect-ratio: 16/9;
  min-height: 140px;
  max-height: min(180px, calc((100vh - 280px) / 3));
  border-radius: 1px;
}

/* 16分屏模式 - 4x4网格 */
.grid-16 {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
}

.grid-16 .video-cell {
  aspect-ratio: 16/9;
  min-height: 100px;
  max-height: min(130px, calc((100vh - 320px) / 4));
  border-radius: 1px;
}

.video-cell {
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.9) 0%, 
    rgba(10, 15, 25, 0.95) 100%);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 0 15px rgba(0, 255, 255, 0.05);
}

.video-cell::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 0%, 
    rgba(0, 255, 255, 0.02) 50%, 
    transparent 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.video-cell:hover {
  border-color: rgba(0, 255, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 0 25px rgba(0, 255, 255, 0.3),
    inset 0 0 30px rgba(0, 255, 255, 0.1);
}

.video-cell:hover::before {
  opacity: 1;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(0, 255, 255, 0.8);
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  position: relative;
}

.video-placeholder::before {
  content: '📹';
  font-size: 2.5em;
  margin-bottom: 10px;
  opacity: 0.6;
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.3));
}

/* 不同分屏模式下的字体大小调整 */
.grid-1 .video-placeholder {
  font-size: 24px;
}

.grid-1 .video-placeholder::before {
  font-size: 4em;
  margin-bottom: 20px;
}

.grid-4 .video-placeholder {
  font-size: 16px;
}

.grid-4 .video-placeholder::before {
  font-size: 2.5em;
  margin-bottom: 12px;
}

.grid-9 .video-placeholder {
  font-size: 14px;
}

.grid-9 .video-placeholder::before {
  font-size: 2em;
  margin-bottom: 8px;
}

.grid-16 .video-placeholder {
  font-size: 12px;
}

.grid-16 .video-placeholder::before {
  font-size: 1.5em;
  margin-bottom: 6px;
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

/* Element Plus 组件深色主题样式 */
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

:deep(.el-button-group .el-button:active),
:deep(.el-button-group .el-button.is-active) {
  background: rgba(0, 150, 200, 0.6) !important;
  border-color: #00ffff !important;
  color: #ffffff !important;
}

:deep(.el-tag--danger) {
  background: rgba(245, 108, 108, 0.8) !important;
  border-color: rgba(245, 108, 108, 0.6) !important;
  color: #ffffff !important;
}

:deep(.el-space) {
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .grid-1 .video-cell {
    width: min(700px, 90%);
    height: min(400px, 55vh);
  }
  
  .grid-4 .video-cell {
    max-height: min(240px, calc((100vh - 220px) / 2));
  }
  
  .grid-9 .video-cell {
    max-height: min(160px, calc((100vh - 260px) / 3));
  }
  
  .grid-16 .video-cell {
    max-height: min(110px, calc((100vh - 300px) / 4));
  }
}

@media (max-width: 1200px) {
  .realtime-detection {
    padding: 12px;
    gap: 12px;
  }
  
  .video-grid {
    padding: 6px;
    gap: 1px;
  }
  
  .grid-1 .video-cell {
    width: min(600px, 95%);
    height: min(350px, 50vh);
  }
  
  .grid-4 .video-cell {
    max-height: min(200px, calc((100vh - 200px) / 2));
    min-height: 150px;
  }
  
  .grid-9 .video-cell {
    max-height: min(140px, calc((100vh - 240px) / 3));
    min-height: 100px;
  }
  
  .grid-16 .video-cell {
    max-height: min(90px, calc((100vh - 280px) / 4));
    min-height: 80px;
  }
}

@media (max-width: 768px) {
  .realtime-detection {
    padding: 8px;
    height: calc(100vh - 80px);
  }
  
  .control-panel {
    padding: 8px 12px;
  }
  
  .video-grid {
    padding: 4px;
    gap: 1px;
  }
  
  /* 移动端优化分屏布局 */
  .grid-1 .video-cell {
    width: 100%;
    height: min(300px, 45vh);
  }
  
  .grid-4 .video-cell {
    max-height: min(160px, calc((100vh - 160px) / 2));
    min-height: 120px;
  }
  
  .grid-9 .video-cell {
    max-height: min(100px, calc((100vh - 200px) / 3));
    min-height: 80px;
  }
  
  .grid-16 .video-cell {
    max-height: min(70px, calc((100vh - 240px) / 4));
    min-height: 60px;
  }
  
  /* 移动端按钮组优化 */
  :deep(.el-button-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  
  :deep(.el-button-group .el-button) {
    font-size: 12px;
    padding: 6px 12px;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .realtime-detection {
    padding: 6px;
  }
  
  .video-grid {
    padding: 4px;
    gap: 1px;
  }
  
  .grid-1 .video-cell {
    height: min(250px, 40vh);
  }
  
  .grid-4 .video-cell {
    max-height: min(120px, calc((100vh - 140px) / 2));
    min-height: 90px;
  }
  
  .grid-9 .video-cell {
    max-height: min(80px, calc((100vh - 180px) / 3));
    min-height: 60px;
  }
  
  .grid-16 .video-cell {
    max-height: min(60px, calc((100vh - 220px) / 4));
    min-height: 50px;
  }
  
  /* 超小屏幕下的字体调整 */
  .grid-9 .video-placeholder,
  .grid-16 .video-placeholder {
    font-size: 10px;
  }
  
  .grid-9 .video-placeholder::before,
  .grid-16 .video-placeholder::before {
    font-size: 1.2em;
    margin-bottom: 4px;
  }
}
</style>