<template>
  <div class="function-list-page">
    <!-- 科技感背景 -->
    <div class="tech-background"></div>

    <div class="content-container">
      <div class="welcome-section">
        <h1 class="main-title">功能列表</h1>
        <p class="subtitle">请从左侧菜单选择相应功能模块</p>
      </div>

      <div class="instruction-section">
        <div class="instruction-card">
          <div class="icon-container">
            <i class="icon-arrow">→</i>
          </div>
          <div class="text-container">
            <h3>选择功能模块</h3>
            <p>在左侧菜单栏中选择您需要的功能模块，开始使用智能监控系统的各项功能。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FunctionList'
}
</script>

<style scoped>
.function-list-page {
  min-height: 100vh;
  position: relative;
  background: url('@/assets/images/main/main-background.png') center/cover no-repeat,
              linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  background-blend-mode: overlay;
  background-attachment: fixed;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tech-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(0, 255, 255, 0.03) 1px, transparent 1px),
    radial-gradient(circle at 80% 70%, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}

.content-container {
  position: relative;
  z-index: 2;
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.welcome-section {
  margin-bottom: 60px;
}

.main-title {
  font-size: 64px;
  font-weight: bold;
  color: #00d4ff;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
  margin-bottom: 20px;
  letter-spacing: 3px;
}


.subtitle {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
  font-weight: 300;
  letter-spacing: 1px;
}

.instruction-section {
  display: flex;
  justify-content: center;
}

.instruction-card {
  background: linear-gradient(135deg,
    rgba(0, 255, 255, 0.1) 0%,
    rgba(0, 200, 255, 0.05) 100%);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 40px;
  backdrop-filter: blur(10px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(0, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 30px;
  transition: all 0.3s ease;
  max-width: 600px;
}

.instruction-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(0, 255, 255, 0.2),
    inset 0 1px 0 rgba(0, 255, 255, 0.3);
}

.icon-container {
  flex-shrink: 0;
}

.icon-arrow {
  font-size: 48px;
  color: #00d4ff;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
}


.text-container {
  text-align: left;
}

.text-container h3 {
  font-size: 28px;
  color: #00d4ff;
  margin-bottom: 15px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  font-weight: bold;
}

.text-container p {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-title {
    font-size: 48px;
  }

  .subtitle {
    font-size: 20px;
  }

  .instruction-card {
    flex-direction: column;
    text-align: center;
    padding: 30px;
  }

  .text-container {
    text-align: center;
  }

  .icon-arrow {
    font-size: 36px;
  }
}
</style>