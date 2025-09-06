<template>
  <div class="tech-input-container">
    <div class="tech-input-wrapper" :class="{ 'is-focus': isFocused, 'has-value': hasValue }">
      <!-- 前缀图标 -->
      <div v-if="$slots.prefix" class="tech-input-prefix">
        <slot name="prefix"></slot>
      </div>
      
      <!-- 输入框 -->
      <input
        ref="inputRef"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        :readonly="readonly"
        class="tech-input-inner"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup="handleKeyup"
        @keydown="handleKeydown"
        v-bind="$attrs"
      />
      
      <!-- 后缀图标 -->
      <div v-if="$slots.suffix" class="tech-input-suffix">
        <slot name="suffix"></slot>
      </div>
    </div>
    
    <!-- 错误信息 -->
    <div v-if="errorMessage" class="tech-input-error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
/* eslint-disable no-undef */
import { ref, computed, nextTick, inject } from 'vue'

// 定义组件属性
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['small', 'default', 'large'].includes(value)
  },
  errorMessage: {
    type: String,
    default: ''
  },
  validateEvent: {
    type: Boolean,
    default: true
  }
})

// 定义事件
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input', 'keyup', 'keydown'])

// 注入表单项上下文（用于Element Plus表单验证）
const elFormItem = inject('elFormItem', {})

// 触发表单验证
const triggerValidation = (trigger) => {
  if (props.validateEvent && elFormItem?.validate) {
    elFormItem.validate(trigger).catch(() => {})
  }
}

// 响应式数据
const inputRef = ref(null)
const isFocused = ref(false)

// 计算属性
const hasValue = computed(() => {
  return props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined
})

// 事件处理函数
const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
  emit('input', event)
  triggerValidation('input')
}

const handleFocus = (event) => {
  isFocused.value = true
  emit('focus', event)
  triggerValidation('focus')
}

const handleBlur = (event) => {
  isFocused.value = false
  emit('blur', event)
  triggerValidation('blur')
}

const handleKeyup = (event) => {
  emit('keyup', event)
}

const handleKeydown = (event) => {
  emit('keydown', event)
}

// 对外暴露的方法
const focus = () => {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const blur = () => {
  nextTick(() => {
    inputRef.value?.blur()
  })
}

const select = () => {
  nextTick(() => {
    inputRef.value?.select()
  })
}

// 暴露方法给父组件
defineExpose({
  focus,
  blur,
  select,
  inputRef
})
</script>

<style scoped>
.tech-input-container {
  width: 100%;
  position: relative;
  font-feature-settings: 'liga', 'kern';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.tech-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 50px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.1),
    inset 0 0 20px rgba(0, 255, 255, 0.05);
}

.tech-input-wrapper:hover {
  border-color: rgba(0, 255, 255, 0.6);
  box-shadow: 
    0 0 30px rgba(0, 255, 255, 0.2),
    inset 0 0 30px rgba(0, 255, 255, 0.1);
}

.tech-input-wrapper.is-focus {
  border-color: #00ffff;
  box-shadow: 
    0 0 40px rgba(0, 255, 255, 0.3),
    inset 0 0 40px rgba(0, 255, 255, 0.1);
}

.tech-input-prefix,
.tech-input-suffix {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  color: #00ffff;
  font-size: 18px;
  flex-shrink: 0;
}

.tech-input-inner {
  flex: 1;
  height: 100%;
  padding: 0 16px;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  color: #ffffff !important;
  font-size: 16px;
  font-weight: 400;
  font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', sans-serif;
  line-height: 48px;
  letter-spacing: 0.5px;
  
  /* 强制覆盖所有可能的自动填充样式 */
  -webkit-box-shadow: none !important;
  -webkit-text-fill-color: #ffffff !important;
  -webkit-background-clip: text !important;
  transition: all 0.2s ease !important;
  
  /* 禁用自动填充样式 */
  -webkit-autofill: none !important;
  box-shadow: none !important;
  background-color: transparent !important;
  background-image: none !important;
  background: transparent !important;
}

.tech-input-inner::placeholder {
  color: rgba(255, 255, 255, 0.6) !important;
  font-size: 16px;
  font-weight: 300;
  font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', sans-serif;
  letter-spacing: 0.3px;
}

/* 强制覆盖所有自动填充相关样式 */
.tech-input-inner:-webkit-autofill,
.tech-input-inner:-webkit-autofill:hover,
.tech-input-inner:-webkit-autofill:focus,
.tech-input-inner:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
  -webkit-text-fill-color: #ffffff !important;
  background-color: transparent !important;
  background-image: none !important;
  background: transparent !important;
  color: #ffffff !important;
  transition: background-color 5000s ease-in-out 0s !important;
}

/* Firefox 自动填充样式 */
.tech-input-inner:-moz-autofill,
.tech-input-inner:-moz-autofill-preview {
  background-color: transparent !important;
  color: #ffffff !important;
  box-shadow: none !important;
}

.tech-input-error {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  color: #ff4757;
  font-size: 12px;
  line-height: 1;
}

/* 不同尺寸 */
.tech-input-wrapper.size-small {
  height: 32px;
}

.tech-input-wrapper.size-small .tech-input-inner {
  font-size: 14px;
  line-height: 30px;
}

.tech-input-wrapper.size-large {
  height: 56px;
}

.tech-input-wrapper.size-large .tech-input-inner {
  font-size: 18px;
  line-height: 54px;
}

/* 禁用状态 */
.tech-input-wrapper.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tech-input-wrapper.is-disabled .tech-input-inner {
  cursor: not-allowed;
}

/* 只读状态 */
.tech-input-wrapper.is-readonly {
  background: rgba(0, 0, 0, 0.2);
}

.tech-input-wrapper.is-readonly .tech-input-inner {
  cursor: default;
}

/* 密码框特殊样式 */
.tech-input-inner[type="password"] {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'Courier New', monospace;
  font-weight: 500;
  letter-spacing: 3px;
  font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tech-input-wrapper {
    height: 44px;
  }
  
  .tech-input-inner {
    font-size: 16px;
    line-height: 42px;
  }
  
  .tech-input-prefix,
  .tech-input-suffix {
    padding: 0 10px;
    font-size: 16px;
  }
}
</style>
