<template>
  <div class="login-container">
    <!-- 动态背景 -->
    <div class="background-animation">
      <div class="particle" v-for="n in 50" :key="n" :style="getParticleStyle(n)"></div>
    </div>
    
    <!-- 网格背景 -->
    <div class="grid-background"></div>
    
    <!-- 登录表单 -->
    <div class="login-form-container">
      <div class="login-header">
        <h1 class="system-title">
          <span class="title-text">智能监控系统</span>
          <span class="title-subtitle">INTELLIGENT MONITORING SYSTEM</span>
        </h1>
      </div>
      
      <div class="login-form-wrapper">
        <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="tech-form">
          <el-form-item prop="username" class="form-item-wrapper">
            <el-input 
              v-model="loginForm.username" 
              placeholder="用户名 / Username"
              class="tech-input"
              size="large"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon class="input-icon"><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="password" class="form-item-wrapper">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="密码 / Password"
              class="tech-input"
              size="large"
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon class="input-icon"><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              :loading="loading" 
              @click="handleLogin" 
              class="tech-button"
              size="large"
            >
              <span v-if="!loading">登录系统</span>
              <span v-else>正在验证...</span>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 装饰线条 -->
      <div class="decoration-lines">
        <div class="line line-1"></div>
        <div class="line line-2"></div>
        <div class="line line-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup name="LoginView">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const loading = ref(false)
const loginFormRef = ref(null)
const authStore = useAuthStore()

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: ['blur', 'change'] }],
  password: [{ required: true, message: '请输入密码', trigger: ['blur', 'change'] }]
}

// 生成粒子样式
const getParticleStyle = (index) => {
  // 使用index来确保每个粒子有不同的随机种子
  const seed = index * 0.1
  const size = Math.random() * 3 + 1
  const left = Math.random() * 100
  const animationDelay = Math.random() * 20 + seed
  const animationDuration = Math.random() * 10 + 10 + seed
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${animationDelay}s`,
    animationDuration: `${animationDuration}s`
  }
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    // 先进行表单验证
    const valid = await loginFormRef.value.validate()
    if (valid) {
      loading.value = true
      try {
        // 使用auth store进行登录
        const response = await authStore.login({
          username: loginForm.username,
          password: loginForm.password
        })
        
        if (response.code === 200 && response.success) {
          ElMessage.success('登录成功')
          // 跳转到首页
          router.push('/')
        } else {
          ElMessage.error(response.message || '登录失败')
        }
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error(error.message || '登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    } else {
      // 验证失败时，确保错误信息显示
      console.log('表单验证失败')
    }
  } catch (error) {
    // 表单验证出错，通常是验证失败
    console.log('表单验证失败:', error)
  }
}
</script>

<style scoped>
/* 主容器 */
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: 
    linear-gradient(135deg, rgba(12, 12, 12, 0.7) 0%, rgba(26, 26, 46, 0.8) 50%, rgba(22, 33, 62, 0.7) 100%),
    url('@/assets/images/login.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  position: relative;
}

/* 动态粒子背景 */
.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  background: rgba(0, 255, 255, 0.6);
  border-radius: 50%;
  animation: float infinite linear;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

/* 网格背景 */
.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;
  z-index: 1;
}

@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* 登录表单容器 */
.login-form-container {
  position: relative;
  z-index: 10;
  width: 450px;
  padding: 40px;
}

/* 标题区域 */
.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.system-title {
  margin: 0;
  color: #ffffff;
}

.title-text {
  display: block;
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(45deg, #00ffff, #0080ff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
  margin-bottom: 8px;
}

.title-subtitle {
  display: block;
  font-size: 14px;
  font-weight: normal;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 2px;
}

/* 表单包装器 */
.login-form-wrapper {
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 15px;
  padding: 40px 30px;
  box-shadow: 
    0 0 50px rgba(0, 255, 255, 0.1),
    inset 0 0 50px rgba(0, 255, 255, 0.05);
}



/* 表单样式 */
.tech-form {
  width: 100%;
}

.form-item-wrapper {
  width: 100%;
}

/* 输入框样式重写 */
.tech-input {
  width: 100% !important;
}

.tech-input :deep(.el-input__wrapper) {
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.1),
    inset 0 0 20px rgba(0, 255, 255, 0.05) !important;
  transition: all 0.3s ease !important;
  height: 50px !important;
  width: 100% !important;
}

.tech-input :deep(.el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.6) !important;
  box-shadow: 
    0 0 30px rgba(0, 255, 255, 0.2),
    inset 0 0 30px rgba(0, 255, 255, 0.1) !important;
}

.tech-input :deep(.el-input__wrapper.is-focus) {
  border-color: #00ffff !important;
  box-shadow: 
    0 0 40px rgba(0, 255, 255, 0.3),
    inset 0 0 40px rgba(0, 255, 255, 0.1) !important;
}

.tech-input :deep(.el-input__inner) {
  color: #ffffff !important;
  background: transparent !important;
  font-size: 16px !important;
  height: 48px !important;
  line-height: 48px !important;
}

.tech-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

.input-icon {
  color: #00ffff !important;
  font-size: 18px !important;
}

/* 按钮样式 */
.tech-button {
  width: 100% !important;
  height: 50px !important;
  background: linear-gradient(45deg, #00ffff, #0080ff) !important;
  border: none !important;
  border-radius: 8px !important;
  font-size: 16px !important;
  font-weight: bold !important;
  color: #000000 !important;
  position: relative !important;
  overflow: hidden !important;
  transition: all 0.3s ease !important;
}

.tech-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 
    0 10px 30px rgba(0, 255, 255, 0.4),
    0 0 50px rgba(0, 255, 255, 0.3) !important;
}

.tech-button:active {
  transform: translateY(0) !important;
}

.tech-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.tech-button:hover::before {
  left: 100%;
}

/* 装饰线条 */
.decoration-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.line {
  position: absolute;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
  opacity: 0.3;
}

.line-1 {
  width: 200px;
  height: 1px;
  top: 20%;
  left: -100px;
  animation: line-move-1 8s linear infinite;
}

.line-2 {
  width: 150px;
  height: 1px;
  top: 60%;
  right: -75px;
  animation: line-move-2 6s linear infinite;
}

.line-3 {
  width: 100px;
  height: 1px;
  top: 80%;
  left: -50px;
  animation: line-move-3 10s linear infinite;
}

@keyframes line-move-1 {
  0% { left: -200px; }
  100% { left: 100%; }
}

@keyframes line-move-2 {
  0% { right: -150px; }
  100% { right: 100%; }
}

@keyframes line-move-3 {
  0% { left: -100px; }
  100% { left: 100%; }
}

/* 表单项间距调整 */
.tech-form :deep(.el-form-item) {
  margin-bottom: 30px !important;
}

.tech-form :deep(.el-form-item__error) {
  color: #ff4757 !important;
  font-size: 12px !important;
  margin-top: 8px !important;
  margin-left: 0 !important;
  margin-bottom: 0 !important;
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
  z-index: 10 !important;
}

/* 确保表单项有足够的相对定位空间 */
.tech-form :deep(.form-item-wrapper) {
  position: relative !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-form-container {
    width: 90%;
    padding: 20px;
  }
  
  .login-form-wrapper {
    padding: 30px 20px;
  }
  
  .title-text {
    font-size: 24px;
  }
  
  .title-subtitle {
    font-size: 12px;
  }
}
</style> 