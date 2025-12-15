<template>
  <el-dialog
    v-model="visible"
    :title="t('user.profileDialog.title')"
    width="600px"
    @close="handleClose"
    :close-on-click-modal="false"
    destroy-on-close
    class="tech-dialog profile-form-dialog"
    :style="{
      '--el-dialog-bg-color': 'rgba(45, 55, 75, 0.92)',
      '--el-dialog-header-bg-color': 'rgba(45, 55, 75, 0.92)',
      '--el-dialog-content-bg-color': 'rgba(45, 55, 75, 0.92)',
      '--el-dialog-title-font-color': '#00ffff',
      '--el-text-color-primary': '#00ffff',
      '--el-color-primary': '#00ffff'
    }"
  >
    <div v-loading="loading" class="profile-content">
      <el-tabs 
        v-model="activeTab" 
        @tab-change="handleTabChange"
        :style="{
          '--el-tabs-header-bg-color': 'rgba(0, 255, 255, 0.1)',
          '--el-color-primary': '#00ffff',
          '--el-text-color-primary': '#00ffff',
          '--el-text-color-regular': 'rgba(255, 255, 255, 0.8)',
          '--el-text-color-secondary': 'rgba(255, 255, 255, 0.6)',
          '--el-border-color': 'rgba(0, 255, 255, 0.3)',
          '--el-border-color-light': 'rgba(0, 255, 255, 0.2)',
          '--el-border-color-lighter': 'rgba(0, 255, 255, 0.1)'
        }"
      >
        <!-- 查看个人资料 -->
        <el-tab-pane :label="t('user.profileDialog.viewTab')" name="view">
          <div class="profile-view">
            <!-- 自定义用户信息表格，避免Element Plus的白色背景问题 -->
            <div 
              class="custom-info-table"
              :style="{
                'background': 'rgba(45, 55, 75, 0.8)',
                'backgroundColor': 'rgba(45, 55, 75, 0.8)',
                'border': '1px solid rgba(0, 255, 255, 0.2)',
                'borderRadius': '8px',
                'overflow': 'hidden',
                'display': 'grid',
                'gridTemplateColumns': '1fr 1fr',
                'gap': '0'
              }"
            >
              <!-- 用户名 -->
              <div :style="{
                'display': 'flex',
                'borderBottom': '1px solid rgba(0, 255, 255, 0.2)',
                'borderRight': '1px solid rgba(0, 255, 255, 0.2)'
              }">
                <div :style="{
                  'padding': '12px 16px',
                  'background': 'rgba(0, 255, 255, 0.15)',
                  'backgroundColor': 'rgba(0, 255, 255, 0.15)',
                  'color': '#00ffff',
                  'fontWeight': '500',
                  'minWidth': '80px',
                  'borderRight': '1px solid rgba(0, 255, 255, 0.2)',
                  'textShadow': '0 0 8px rgba(0, 255, 255, 0.3)'
                }">{{ t('user.profileDialog.username') }}</div>
                <div :style="{
                  'padding': '12px 16px',
                  'background': 'rgba(45, 55, 75, 0.8)',
                  'backgroundColor': 'rgba(45, 55, 75, 0.8)',
                  'color': 'rgba(255, 255, 255, 0.9)',
                  'flex': '1'
                }">{{ profileData.username || t('common.noData') }}</div>
              </div>
              
              <!-- 用户ID -->
              <div :style="{
                'display': 'flex',
                'borderBottom': '1px solid rgba(0, 255, 255, 0.2)'
              }">
                <div :style="{
                  'padding': '12px 16px',
                  'background': 'rgba(0, 255, 255, 0.15)',
                  'backgroundColor': 'rgba(0, 255, 255, 0.15)',
                  'color': '#00ffff',
                  'fontWeight': '500',
                  'minWidth': '80px',
                  'borderRight': '1px solid rgba(0, 255, 255, 0.2)',
                  'textShadow': '0 0 8px rgba(0, 255, 255, 0.3)'
                }">{{ t('user.profileDialog.userId') }}</div>
                <div :style="{
                  'padding': '12px 16px',
                  'background': 'rgba(45, 55, 75, 0.8)',
                  'backgroundColor': 'rgba(45, 55, 75, 0.8)',
                  'color': 'rgba(255, 255, 255, 0.9)',
                  'flex': '1'
                }">{{ profileData.id || t('common.noData') }}</div>
              </div>
              
              <!-- 邮箱 -->
              <div :style="{
                'display': 'flex',
                'borderRight': '1px solid rgba(0, 255, 255, 0.2)'
              }">
                <div :style="{
                  'padding': '12px 16px',
                  'background': 'rgba(0, 255, 255, 0.15)',
                  'backgroundColor': 'rgba(0, 255, 255, 0.15)',
                  'color': '#00ffff',
                  'fontWeight': '500',
                  'minWidth': '80px',
                  'borderRight': '1px solid rgba(0, 255, 255, 0.2)',
                  'textShadow': '0 0 8px rgba(0, 255, 255, 0.3)'
                }">{{ t('user.profileDialog.email') }}</div>
                <div :style="{
                  'padding': '12px 16px',
                  'background': 'rgba(45, 55, 75, 0.8)',
                  'backgroundColor': 'rgba(45, 55, 75, 0.8)',
                  'color': 'rgba(255, 255, 255, 0.9)',
                  'flex': '1'
                }">{{ profileData.email || t('user.profileDialog.notSet') }}</div>
              </div>
              
              <!-- 手机号 -->
              <div :style="{
                'display': 'flex'
              }">
                <div :style="{
                  'padding': '12px 16px',
                  'background': 'rgba(0, 255, 255, 0.15)',
                  'backgroundColor': 'rgba(0, 255, 255, 0.15)',
                  'color': '#00ffff',
                  'fontWeight': '500',
                  'minWidth': '80px',
                  'borderRight': '1px solid rgba(0, 255, 255, 0.2)',
                  'textShadow': '0 0 8px rgba(0, 255, 255, 0.3)'
                }">{{ t('user.profileDialog.phone') }}</div>
                <div :style="{
                  'padding': '12px 16px',
                  'background': 'rgba(45, 55, 75, 0.8)',
                  'backgroundColor': 'rgba(45, 55, 75, 0.8)',
                  'color': 'rgba(255, 255, 255, 0.9)',
                  'flex': '1'
                }">{{ profileData.phone || t('user.profileDialog.notSet') }}</div>
              </div>
            </div>

            <!-- 角色信息 -->
            <div 
              class="roles-section" 
              :style="{
                'margin-top': '24px',
                'background-color': 'rgba(45, 55, 75, 0.8)',
                'background': 'rgba(45, 55, 75, 0.8)',
                'border': '1px solid rgba(0, 255, 255, 0.3)',
                'border-radius': '8px',
                'padding': '16px',
                'box-shadow': '0 0 15px rgba(0, 255, 255, 0.1)'
              }"
            >
              <h4 :style="{
                'margin-bottom': '12px',
                'margin-top': '0',
                'color': '#00ffff',
                'font-size': '16px',
                'font-weight': '600',
                'text-shadow': '0 0 8px rgba(0, 255, 255, 0.4)'
              }">{{ t('user.profileDialog.roleInfo') }}</h4>
              <div class="roles-list">
                <el-tag
                  v-for="role in profileData.roles"
                  :key="role.id"
                  type="success"
                  class="role-tag"
                  :style="{
                    'margin-right': '8px',
                    'margin-bottom': '8px',
                    'background-color': 'rgba(0, 200, 255, 0.2)',
                    'background': 'rgba(0, 200, 255, 0.2)',
                    'border': '1px solid rgba(0, 255, 255, 0.4)',
                    'color': '#00ffff',
                    'border-radius': '4px'
                  }"
                >
                  {{ role.role_name }}
                </el-tag>
                <span v-if="!profileData.roles || profileData.roles.length === 0" class="no-data">
                  {{ t('user.profileDialog.noRoles') }}
                </span>
              </div>
            </div>

            <!-- 权限信息 -->
            <div 
              class="permissions-section"
              :style="{
                'margin-top': '24px',
                'background-color': 'rgba(45, 55, 75, 0.8)',
                'background': 'rgba(45, 55, 75, 0.8)',
                'border': '1px solid rgba(0, 255, 255, 0.3)',
                'border-radius': '8px',
                'padding': '16px',
                'box-shadow': '0 0 15px rgba(0, 255, 255, 0.1)'
              }"
            >
              <h4 :style="{
                'margin-bottom': '12px',
                'margin-top': '0',
                'color': '#00ffff',
                'font-size': '16px',
                'font-weight': '600',
                'text-shadow': '0 0 8px rgba(0, 255, 255, 0.4)'
              }">{{ t('user.profileDialog.permissionInfo') }}</h4>
              <div class="permissions-list">
                <el-tag
                  v-for="permission in profileData.permissions"
                  :key="permission.id"
                  type="info"
                  size="small"
                  class="permission-tag"
                  :style="{
                    'margin-right': '4px',
                    'margin-bottom': '4px',
                    'background-color': 'rgba(0, 200, 255, 0.2)',
                    'background': 'rgba(0, 200, 255, 0.2)',
                    'border': '1px solid rgba(0, 255, 255, 0.4)',
                    'color': '#00ffff',
                    'border-radius': '4px'
                  }"
                >
                  {{ permission.permission_name }}
                </el-tag>
                <span v-if="!profileData.permissions || profileData.permissions.length === 0" class="no-data">
                  {{ t('user.profileDialog.noPermissions') }}
                </span>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 编辑个人资料 -->
        <el-tab-pane :label="t('user.profileDialog.editTab')" name="edit">
          <el-form
            ref="editFormRef"
            :model="editForm"
            :rules="editRules"
            label-width="100px"
            class="profile-edit-form"
            :style="{
              '--el-text-color-regular': '#00ffff',
              '--el-text-color-primary': '#00ffff',
              '--el-form-label-font-size': '14px'
            }"
          >
            <el-form-item 
              :label="t('user.profileDialog.username')"
              :style="{
                '--el-form-item-label-color': '#00ffff'
              }"
            >
              <template #label>
                <span :style="{
                  'color': '#00ffff',
                  'fontWeight': '500',
                  'textShadow': '0 0 8px rgba(0, 255, 255, 0.3)'
                }">{{ t('user.profileDialog.username') }}</span>
              </template>
              <el-input 
                v-model="profileData.username" 
                disabled 
                :style="{
                  '--el-input-bg-color': 'rgba(65, 75, 95, 0.85)',
                  '--el-input-border-color': 'rgba(0, 255, 255, 0.4)',
                  '--el-input-text-color': 'rgba(255, 255, 255, 0.95)',
                  '--el-disabled-bg-color': 'rgba(65, 75, 95, 0.6)',
                  '--el-disabled-text-color': 'rgba(255, 255, 255, 0.7)',
                  '--el-disabled-border-color': 'rgba(0, 255, 255, 0.3)',
                  'background': 'rgba(65, 75, 95, 0.6)',
                  'backgroundColor': 'rgba(65, 75, 95, 0.6)'
                }"
              />
              <div class="form-help" :style="{
                'color': 'rgba(255, 255, 255, 0.6)'
                }">{{ t('user.profileDialog.usernameReadonly') }}</div>
            </el-form-item>

          <el-form-item 
              :label="t('user.profileDialog.email')" 
              prop="email"
              :style="{
                '--el-form-item-label-color': '#00ffff'
              }"
            >
              <template #label>
                <span :style="{
                  'color': '#00ffff',
                  'fontWeight': '500',
                  'textShadow': '0 0 8px rgba(0, 255, 255, 0.3)'
                }">{{ t('user.profileDialog.email') }}</span>
              </template>
              <el-input
                v-model="editForm.email"
                type="email"
                :placeholder="t('user.profileDialog.emailPlaceholder')"
                clearable
                style="--el-input-bg-color: rgba(65, 75, 95, 0.85); --el-input-border-color: rgba(0, 255, 255, 0.4); --el-input-text-color: rgba(255, 255, 255, 0.95);"
              />
            </el-form-item>

            <el-form-item 
              :label="t('user.profileDialog.phone')" 
              prop="phone"
              :style="{
                '--el-form-item-label-color': '#00ffff'
              }"
            >
              <template #label>
                <span :style="{
                  'color': '#00ffff',
                  'fontWeight': '500',
                  'textShadow': '0 0 8px rgba(0, 255, 255, 0.3)'
                }">{{ t('user.profileDialog.phone') }}</span>
              </template>
              <el-input
                v-model="editForm.phone"
                :placeholder="t('user.profileDialog.phonePlaceholder')"
                clearable
                maxlength="11"
                style="--el-input-bg-color: rgba(65, 75, 95, 0.85); --el-input-border-color: rgba(0, 255, 255, 0.4); --el-input-text-color: rgba(255, 255, 255, 0.95);"
              />
            </el-form-item>

            <!-- 修改密码部分 - 自定义分割线 -->
            <div :style="{
              'display': 'flex',
              'alignItems': 'center',
              'margin': '24px 0 16px 0',
              'position': 'relative'
            }">
              <div :style="{
                'flex': '1',
                'height': '1px',
                'background': 'rgba(0, 255, 255, 0.3)',
                'backgroundColor': 'rgba(0, 255, 255, 0.3)'
              }"></div>
              <div :style="{
                'padding': '0 16px',
                'color': '#00ffff',
                'background': 'rgba(45, 55, 75, 0.92)',
                'backgroundColor': 'rgba(45, 55, 75, 0.92)',
                'fontSize': '14px',
                'fontWeight': '500',
                'textShadow': '0 0 8px rgba(0, 255, 255, 0.3)',
                'borderRadius': '4px'
            }">{{ t('user.profileDialog.changePassword') }}</div>
              <div :style="{
                'flex': '1',
                'height': '1px',
                'background': 'rgba(0, 255, 255, 0.3)',
                'backgroundColor': 'rgba(0, 255, 255, 0.3)'
              }"></div>
            </div>
            
            <el-form-item 
              :label="t('user.profileDialog.oldPassword')" 
              prop="oldPassword"
              :style="{
                '--el-form-item-label-color': '#00ffff'
              }"
            >
              <template #label>
                <span :style="{
                  'color': '#00ffff',
                  'fontWeight': '500',
                  'textShadow': '0 0 8px rgba(0, 255, 255, 0.3)'
                }">{{ t('user.profileDialog.oldPassword') }}</span>
              </template>
              <el-input
                v-model="editForm.oldPassword"
                type="password"
                :placeholder="t('user.profileDialog.oldPasswordPlaceholder')"
                clearable
                show-password
                style="--el-input-bg-color: rgba(65, 75, 95, 0.85); --el-input-border-color: rgba(0, 255, 255, 0.4); --el-input-text-color: rgba(255, 255, 255, 0.95);"
              />
            </el-form-item>

            <el-form-item 
              :label="t('user.profileDialog.newPassword')" 
              prop="newPassword"
              :style="{
                '--el-form-item-label-color': '#00ffff'
              }"
            >
              <template #label>
                <span :style="{
                  'color': '#00ffff',
                  'fontWeight': '500',
                  'textShadow': '0 0 8px rgba(0, 255, 255, 0.3)'
                }">{{ t('user.profileDialog.newPassword') }}</span>
              </template>
              <el-input
                v-model="editForm.newPassword"
                type="password"
                :placeholder="t('user.profileDialog.newPasswordPlaceholder')"
                clearable
                show-password
                style="--el-input-bg-color: rgba(65, 75, 95, 0.85); --el-input-border-color: rgba(0, 255, 255, 0.4); --el-input-text-color: rgba(255, 255, 255, 0.95);"
              />
            </el-form-item>

            <el-form-item 
              :label="t('user.profileDialog.confirmPassword')" 
              prop="confirmPassword"
              :style="{
                '--el-form-item-label-color': '#00ffff'
              }"
            >
              <template #label>
                <span :style="{
                  'color': '#00ffff',
                  'fontWeight': '500',
                  'textShadow': '0 0 8px rgba(0, 255, 255, 0.3)'
                }">{{ t('user.profileDialog.confirmPassword') }}</span>
              </template>
              <el-input
                v-model="editForm.confirmPassword"
                type="password"
                :placeholder="t('user.profileDialog.confirmPasswordPlaceholder')"
                clearable
                show-password
                style="--el-input-bg-color: rgba(65, 75, 95, 0.85); --el-input-border-color: rgba(0, 255, 255, 0.4); --el-input-text-color: rgba(255, 255, 255, 0.95);"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleUpdate" :loading="updating">
                {{ t('common.save') }}
              </el-button>
              <el-button @click="resetEditForm">{{ t('common.reset') }}</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">{{ t('common.close') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api/user'
import { authApi } from '@/api/auth'

export default {
  name: 'ProfileModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'profile-updated'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const visible = ref(false)
    const loading = ref(false)
    const updating = ref(false)
    const changingPassword = ref(false)
    const activeTab = ref('view')
    const editFormRef = ref()

    // 个人资料数据
    const profileData = reactive({
      id: null,
      username: '',
      email: '',
      phone: '',
      status: 0,
      last_login_at: null,
      login_count: 0,
      create_time: null,
      update_time: null,
      roles: [],
      permissions: []
    })

    // 编辑表单数据
    const editForm = reactive({
      email: '',
      phone: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    // 密码验证函数（必须在 editRules 之前定义）
    const validateOldPassword = (rule, value, callback) => {
      if (editForm.newPassword || editForm.confirmPassword) {
        if (!value) {
          callback(new Error('请输入原密码'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }

    const validateNewPassword = (rule, value, callback) => {
      if (editForm.oldPassword || editForm.confirmPassword) {
        if (!value) {
          callback(new Error('请输入新密码'))
        } else if (value.length < 6 || value.length > 20) {
          callback(new Error('密码长度必须为6-20位'))
        } else if (value === editForm.oldPassword) {
          callback(new Error('新密码不能与原密码相同'))
        } else {
          // 如果确认密码已输入，重新验证确认密码
          if (editForm.confirmPassword) {
            editFormRef.value?.validateField('confirmPassword')
          }
          callback()
        }
      } else {
        callback()
      }
    }

    const validateConfirmPassword = (rule, value, callback) => {
      if (editForm.oldPassword || editForm.newPassword) {
        if (!value) {
          callback(new Error('请确认新密码'))
        } else if (value !== editForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }

    // 表单验证规则
    const editRules = {
      email: [
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      phone: [
        { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
      ],
      oldPassword: [
        { validator: validateOldPassword, trigger: 'blur' }
      ],
      newPassword: [
        { validator: validateNewPassword, trigger: 'blur' }
      ],
      confirmPassword: [
        { validator: validateConfirmPassword, trigger: 'blur' }
      ]
    }

    // 监听弹窗显示状态
    watch(() => props.modelValue, (newVal) => {
      visible.value = newVal
      if (newVal) {
        loadProfile()
      }
    })

    watch(visible, (newVal) => {
      emit('update:modelValue', newVal)
    })

    // 加载个人资料
    const loadProfile = async () => {
      loading.value = true
      try {
        const response = await userApi.getMyProfile()
        if (response.success && response.data) {
          Object.assign(profileData, response.data)
          // 初始化编辑表单
          editForm.email = profileData.email || ''
          editForm.phone = profileData.phone || ''
        } else {
          ElMessage.error('获取个人资料失败')
        }
      } catch (error) {
        console.error('加载个人资料失败:', error)
        ElMessage.error('加载个人资料失败，请重试')
      } finally {
        loading.value = false
      }
    }

    // 更新个人资料
    const handleUpdate = async () => {
      try {
        await editFormRef.value.validate()
        
        updating.value = true
        
        // 检查是否需要修改密码
        const hasPasswordChange = editForm.oldPassword || editForm.newPassword || editForm.confirmPassword
        
        // 准备更新数据（只传递有变化的字段）
        const updateData = {}
        if (editForm.email !== profileData.email) {
          updateData.email = editForm.email || null
        }
        if (editForm.phone !== profileData.phone) {
          updateData.phone = editForm.phone || null
        }

        // 如果有密码修改，先处理密码修改
        if (hasPasswordChange) {
          // 验证密码字段
          if (!editForm.oldPassword || !editForm.newPassword || !editForm.confirmPassword) {
            ElMessage.warning('请完整填写密码信息')
            return
          }

          try {
            const passwordResponse = await authApi.changePassword({
              old_password: editForm.oldPassword,
              new_password: editForm.newPassword
            })

            if (passwordResponse.success) {
              ElMessage.success('密码修改成功！系统将自动退出，请使用新密码重新登录')
              
              // 清空密码字段
              editForm.oldPassword = ''
              editForm.newPassword = ''
              editForm.confirmPassword = ''
              
              // 密码修改成功后，后端会使所有token失效，需要重新登录
              // 延迟3秒后自动退出登录，给用户足够时间看到成功提示
              setTimeout(() => {
                // 清除本地存储
                localStorage.removeItem('token')
                localStorage.removeItem('refreshToken') 
                localStorage.removeItem('userInfo')
                
                // 关闭弹窗
                visible.value = false
                
                // 跳转到登录页面
                window.location.href = '/login'
              }, 3000)
              
              // 不继续处理其他更新，直接返回
              return
            } else {
              ElMessage.error(passwordResponse.message || '密码修改失败')
              return
            }
          } catch (passwordError) {
            console.error('修改密码失败:', passwordError)
            ElMessage.error(passwordError.message || '密码修改失败，请重试')
            return
          }
        }

        // 处理个人资料更新
        if (Object.keys(updateData).length > 0) {
          const response = await userApi.updateMyProfile(updateData)
          if (response.success) {
            ElMessage.success('个人资料更新成功')
          } else {
            ElMessage.error(response.message || '个人资料更新失败')
            return
          }
        } else if (!hasPasswordChange) {
          ElMessage.info('没有需要更新的信息')
          return
        }

        // 重新加载数据
        await loadProfile()
        // 切换到查看标签页
        activeTab.value = 'view'
        // 触发更新事件
        emit('profile-updated')
        
      } catch (error) {
        console.error('更新失败:', error)
        if (error.message) {
          ElMessage.error(error.message)
        } else {
          ElMessage.error('更新失败，请重试')
        }
      } finally {
        updating.value = false
      }
    }

    // 修改密码
    const handleChangePassword = async () => {
      try {
        // 验证密码字段
        await editFormRef.value.validateField(['oldPassword', 'newPassword', 'confirmPassword'])
        
        // 检查是否输入了密码信息
        if (!editForm.oldPassword || !editForm.newPassword || !editForm.confirmPassword) {
          ElMessage.warning('请完整填写密码信息')
          return
        }

        changingPassword.value = true

        const response = await authApi.changePassword({
          old_password: editForm.oldPassword,
          new_password: editForm.newPassword
        })

        if (response.success) {
          ElMessage.success('密码修改成功')
          // 清空密码字段
          editForm.oldPassword = ''
          editForm.newPassword = ''
          editForm.confirmPassword = ''
          editFormRef.value?.clearValidate(['oldPassword', 'newPassword', 'confirmPassword'])
        } else {
          ElMessage.error(response.message || '密码修改失败')
        }
      } catch (error) {
        console.error('修改密码失败:', error)
        if (error.message) {
          ElMessage.error(error.message)
        } else {
          ElMessage.error('密码修改失败，请重试')
        }
      } finally {
        changingPassword.value = false
      }
    }

    // 重置编辑表单
    const resetEditForm = () => {
      editForm.email = profileData.email || ''
      editForm.phone = profileData.phone || ''
      editForm.oldPassword = ''
      editForm.newPassword = ''
      editForm.confirmPassword = ''
      editFormRef.value?.clearValidate()
    }

    // 关闭弹窗
    const handleClose = () => {
      visible.value = false
      activeTab.value = 'view'
      editFormRef.value?.clearValidate()
    }

    // 标签页切换
    const handleTabChange = (tabName) => {
      if (tabName === 'edit') {
        resetEditForm()
      }
    }

    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      try {
        const date = new Date(dateStr)
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } catch (error) {
        return dateStr
      }
    }

    // 获取状态类型
    const getStatusType = (status) => {
      switch (status) {
        case 1: return 'success'
        case 2: return 'danger'
        default: return 'info'
      }
    }

    // 获取状态文本
    const getStatusText = (status) => {
      switch (status) {
        case 1: return t('user.profileDialog.status.normal')
        case 2: return t('user.profileDialog.status.locked')
        default: return t('user.profileDialog.status.unknown')
      }
    }

    // 获取角色类型文本
    const getRoleTypeText = (roleType) => {
      switch (roleType) {
        case 0: return t('user.profileDialog.roleType.system')
        case 1: return t('user.profileDialog.roleType.custom')
        default: return t('user.profileDialog.roleType.unknown')
      }
    }

    return {
      t,
      visible,
      loading,
      updating,
      changingPassword,
      activeTab,
      editFormRef,
      profileData,
      editForm,
      editRules,
      loadProfile,
      handleUpdate,
      handleChangePassword,
      resetEditForm,
      handleClose,
      handleTabChange,
      formatDate,
      getStatusType,
      getStatusText,
      getRoleTypeText
    }
  }
}
</script>

<style scoped>
.profile-content {
  min-height: 400px;
}

.profile-view {
  padding: 10px 0;
}

.roles-section,
.permissions-section {
  margin-top: 24px !important;
  background-color: rgba(45, 55, 75, 0.8) !important;
  background: rgba(45, 55, 75, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  padding: 16px !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.1) !important;
}

.roles-section h4,
.permissions-section h4 {
  margin-bottom: 12px !important;
  margin-top: 0 !important;
  color: #00ffff !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}

.roles-list,
.permissions-list {
  min-height: 32px !important;
  line-height: 32px !important;
  background-color: transparent !important;
  background: transparent !important;
}

.role-tag,
.permission-tag {
  margin-right: 8px !important;
  margin-bottom: 8px !important;
  background-color: rgba(0, 200, 255, 0.2) !important;
  background: rgba(0, 200, 255, 0.2) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  color: #00ffff !important;
  border-radius: 4px !important;
}

.permission-tag {
  margin-right: 4px !important;
  margin-bottom: 4px !important;
}

.no-data {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.profile-edit-form {
  padding: 20px 0;
}

.form-help {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 科技感对话框样式 */
.tech-dialog :deep(.el-dialog),
:deep(.tech-dialog.el-dialog),
:deep(.el-dialog.tech-dialog) {
  background: rgba(45, 55, 75, 0.92) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 12px !important;
  box-shadow: 
    0 0 50px rgba(0, 255, 255, 0.3),
    inset 0 0 50px rgba(0, 255, 255, 0.08) !important;
}

:deep(.tech-dialog .el-dialog__header) {
  background: rgba(45, 55, 75, 0.92);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px 12px 0 0;
}

:deep(.tech-dialog .el-dialog__title) {
  color: #00ffff !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  font-weight: bold;
}

:deep(.tech-dialog .el-dialog__body) {
  background: rgba(45, 55, 75, 0.92);
  color: rgba(255, 255, 255, 0.9);
}

/* 科技感表单标签 */
.tech-dialog :deep(.el-form-item__label),
:deep(.tech-dialog .el-form-item__label) {
  color: #00ffff !important;
  font-weight: 500 !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
}

/* 科技感输入框样式 */
.tech-dialog :deep(.el-input__wrapper),
:deep(.tech-dialog .el-input__wrapper),
.tech-dialog :deep(.el-input .el-input__wrapper) {
  background: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 6px !important;
  box-shadow: 
    0 0 15px rgba(0, 255, 255, 0.15),
    inset 0 0 15px rgba(0, 255, 255, 0.08) !important;
}

.tech-dialog :deep(.el-input__wrapper:hover),
:deep(.tech-dialog .el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.6) !important;
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.25),
    inset 0 0 20px rgba(0, 255, 255, 0.12) !important;
}

.tech-dialog :deep(.el-input__wrapper.is-focus),
:deep(.tech-dialog .el-input__wrapper.is-focus) {
  border-color: #00ffff !important;
  box-shadow: 
    0 0 25px rgba(0, 255, 255, 0.35),
    inset 0 0 25px rgba(0, 255, 255, 0.15) !important;
}

.tech-dialog :deep(.el-input__inner),
:deep(.tech-dialog .el-input__inner) {
  color: rgba(255, 255, 255, 0.95) !important;
  background: transparent !important;
}

.tech-dialog :deep(.el-input__inner::placeholder),
:deep(.tech-dialog .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 科技感按钮样式 */
.tech-dialog :deep(.el-button),
:deep(.tech-dialog .el-button) {
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background: rgba(45, 55, 75, 0.8) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

.tech-dialog :deep(.el-button:hover),
:deep(.tech-dialog .el-button:hover) {
  border-color: rgba(0, 255, 255, 0.6) !important;
  background: rgba(55, 65, 85, 0.9) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.25) !important;
  transform: translateY(-1px) !important;
}

.tech-dialog :deep(.el-button--primary),
:deep(.tech-dialog .el-button--primary) {
  background: rgba(0, 150, 200, 0.8) !important;
  border-color: rgba(0, 200, 255, 0.6) !important;
  color: #ffffff !important;
}

.tech-dialog :deep(.el-button--primary:hover),
:deep(.tech-dialog .el-button--primary:hover) {
  background: rgba(0, 180, 230, 0.9) !important;
  border-color: #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4) !important;
}

/* 科技感分割线样式 */
.tech-dialog :deep(.el-divider),
:deep(.tech-dialog .el-divider) {
  border-color: rgba(0, 255, 255, 0.3) !important;
}

.tech-dialog :deep(.el-divider__text),
:deep(.tech-dialog .el-divider__text) {
  color: #00ffff !important;
  background: rgba(45, 55, 75, 0.92) !important;
  font-weight: 500 !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
}

/* 科技感标签页样式 */
.tech-dialog :deep(.el-tabs__nav-wrap),
:deep(.tech-dialog .el-tabs__nav-wrap) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  padding: 6px !important;
  margin-bottom: 20px !important;
}

.tech-dialog :deep(.el-tabs__nav),
:deep(.tech-dialog .el-tabs__nav) {
  border: none !important;
}

.tech-dialog :deep(.el-tabs__item),
:deep(.tech-dialog .el-tabs__item) {
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
  font-weight: 500 !important;
  padding: 8px 16px !important;
  margin: 0 4px !important;
}

.tech-dialog :deep(.el-tabs__item:hover),
:deep(.tech-dialog .el-tabs__item:hover) {
  color: #00ffff !important;
  background: rgba(0, 255, 255, 0.05) !important;
}

.tech-dialog :deep(.el-tabs__item.is-active),
:deep(.tech-dialog .el-tabs__item.is-active) {
  color: #00ffff !important;
  background: rgba(0, 255, 255, 0.15) !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

.tech-dialog :deep(.el-tabs__active-bar),
:deep(.tech-dialog .el-tabs__active-bar) {
  background: #00ffff !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.6) !important;
  height: 3px !important;
}

/* 科技感描述列表样式 - 更强的选择器 */
.profile-form-dialog :deep(.el-descriptions),
.profile-form-dialog .el-descriptions,
.tech-dialog :deep(.el-descriptions),
:deep(.tech-dialog .el-descriptions) {
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  background-color: rgba(45, 55, 75, 0.8) !important;
  background: rgba(45, 55, 75, 0.8) !important;
}

.profile-form-dialog :deep(.el-descriptions__header),
.profile-form-dialog .el-descriptions__header,
.tech-dialog :deep(.el-descriptions__header),
:deep(.tech-dialog .el-descriptions__header) {
  background-color: rgba(0, 255, 255, 0.15) !important;
  background: rgba(0, 255, 255, 0.15) !important;
}

.profile-form-dialog :deep(.el-descriptions__label),
.profile-form-dialog .el-descriptions__label,
.tech-dialog :deep(.el-descriptions__label),
:deep(.tech-dialog .el-descriptions__label) {
  color: #00ffff !important;
  font-weight: 500 !important;
  background-color: rgba(0, 255, 255, 0.15) !important;
  background: rgba(0, 255, 255, 0.15) !important;
}

.profile-form-dialog :deep(.el-descriptions__content),
.profile-form-dialog .el-descriptions__content,
.tech-dialog :deep(.el-descriptions__content),
:deep(.tech-dialog .el-descriptions__content) {
  color: rgba(255, 255, 255, 0.9) !important;
  background-color: rgba(45, 55, 75, 0.8) !important;
  background: rgba(45, 55, 75, 0.8) !important;
}

.profile-form-dialog :deep(.el-descriptions__cell),
.profile-form-dialog .el-descriptions__cell,
.tech-dialog :deep(.el-descriptions__cell),
:deep(.tech-dialog .el-descriptions__cell) {
  border-color: rgba(0, 255, 255, 0.2) !important;
}

.profile-form-dialog :deep(.el-descriptions__table),
.profile-form-dialog .el-descriptions__table,
.tech-dialog :deep(.el-descriptions__table),
:deep(.tech-dialog .el-descriptions__table) {
  background-color: rgba(45, 55, 75, 0.8) !important;
  background: rgba(45, 55, 75, 0.8) !important;
}

/* 科技感标签样式 */
.tech-dialog :deep(.el-tag),
:deep(.tech-dialog .el-tag) {
  background: rgba(0, 200, 255, 0.2) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  color: #00ffff !important;
  border-radius: 4px !important;
}

.tech-dialog :deep(.el-tag--success),
:deep(.tech-dialog .el-tag--success) {
  background: rgba(0, 255, 128, 0.2) !important;
  border-color: rgba(0, 255, 128, 0.4) !important;
  color: #00ff80 !important;
}

.tech-dialog :deep(.el-tag--info),
:deep(.tech-dialog .el-tag--info) {
  background: rgba(128, 255, 255, 0.2) !important;
  border-color: rgba(128, 255, 255, 0.4) !important;
  color: #80ffff !important;
}

/* 最高优先级样式覆盖 */
.profile-form-dialog.el-dialog,
.profile-form-dialog .el-dialog,
div.el-dialog.profile-form-dialog {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
}

.profile-form-dialog .el-dialog__header {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
}

.profile-form-dialog .el-dialog__body {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.profile-form-dialog .el-dialog__title {
  color: #00ffff !important;
  font-weight: bold !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}

.profile-form-dialog .el-form-item__label {
  color: #00ffff !important;
  font-weight: 500 !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
}

.profile-form-dialog .el-input__wrapper {
  background-color: rgba(65, 75, 95, 0.85) !important;
  background: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
}

.profile-form-dialog .el-input__inner {
  color: rgba(255, 255, 255, 0.95) !important;
  background: transparent !important;
}

.profile-form-dialog .el-button {
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background-color: rgba(45, 55, 75, 0.8) !important;
  background: rgba(45, 55, 75, 0.8) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
}

.profile-form-dialog .el-button--primary {
  background-color: rgba(0, 150, 200, 0.8) !important;
  background: rgba(0, 150, 200, 0.8) !important;
  border-color: rgba(0, 200, 255, 0.6) !important;
  color: #ffffff !important;
}

/* 特殊样式覆盖 - 确保所有背景都是深色主题 */
.profile-form-dialog :deep(.el-tab-pane) {
  background: transparent !important;
}

.profile-form-dialog :deep(.profile-view) {
  background: transparent !important;
}

.profile-form-dialog :deep(.profile-edit-form) {
  background: transparent !important;
}

/* 确保所有表格和列表背景都是深色 */
.profile-form-dialog :deep(.el-descriptions__table) {
  background: rgba(45, 55, 75, 0.6) !important;
}

.profile-form-dialog :deep(.el-descriptions__body) {
  background: rgba(45, 55, 75, 0.6) !important;
}

.profile-form-dialog :deep(.el-descriptions__row) {
  background: transparent !important;
}

/* 角色和权限区域强制深色背景 */
.profile-form-dialog .roles-section,
.profile-form-dialog .permissions-section {
  background: rgba(45, 55, 75, 0.4) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  padding: 16px !important;
}

.profile-form-dialog .roles-list,
.profile-form-dialog .permissions-list {
  background: transparent !important;
}

/* 确保所有子元素不会有白色背景 - 全局覆盖 */
.profile-form-dialog :deep(*) {
  --el-bg-color: rgba(45, 55, 75, 0.8) !important;
  --el-bg-color-page: rgba(45, 55, 75, 0.8) !important;
  --el-bg-color-overlay: rgba(45, 55, 75, 0.8) !important;
  --el-table-bg-color: rgba(45, 55, 75, 0.8) !important;
  --el-table-tr-bg-color: rgba(45, 55, 75, 0.8) !important;
  --el-table-td-bg-color: rgba(45, 55, 75, 0.8) !important;
  --el-table-th-bg-color: rgba(0, 255, 255, 0.15) !important;
}

/* 最强制的样式覆盖 - 直接针对具体元素 */
.profile-form-dialog table,
.profile-form-dialog .el-table,
.profile-form-dialog .el-descriptions,
.profile-form-dialog .el-descriptions__table,
.profile-form-dialog .el-descriptions__body,
.profile-form-dialog .el-descriptions__row,
.profile-form-dialog .el-descriptions__cell,
.profile-form-dialog .el-descriptions__label,
.profile-form-dialog .el-descriptions__content,
.profile-form-dialog .roles-section,
.profile-form-dialog .permissions-section,
.profile-form-dialog .roles-list,
.profile-form-dialog .permissions-list {
  background-color: rgba(45, 55, 75, 0.8) !important;
  background: rgba(45, 55, 75, 0.8) !important;
}

/* 特殊处理标签单元格 */
.profile-form-dialog .el-descriptions__label {
  background-color: rgba(0, 255, 255, 0.15) !important;
  background: rgba(0, 255, 255, 0.15) !important;
}

/* 强制设置所有可能的白色背景元素 */
.profile-form-dialog :deep(td),
.profile-form-dialog :deep(th),
.profile-form-dialog :deep(tr),
.profile-form-dialog :deep(table),
.profile-form-dialog td,
.profile-form-dialog th,
.profile-form-dialog tr,
.profile-form-dialog table {
  background-color: rgba(45, 55, 75, 0.8) !important;
  background: rgba(45, 55, 75, 0.8) !important;
}

/* 强制覆盖禁用状态的输入框 */
.profile-form-dialog :deep(.el-input.is-disabled .el-input__wrapper),
.profile-form-dialog .el-input.is-disabled .el-input__wrapper {
  background-color: rgba(65, 75, 95, 0.6) !important;
  background: rgba(65, 75, 95, 0.6) !important;
  color: rgba(255, 255, 255, 0.7) !important;
}

.profile-form-dialog :deep(.el-input.is-disabled .el-input__inner),
.profile-form-dialog .el-input.is-disabled .el-input__inner {
  background-color: transparent !important;
  background: transparent !important;
  color: rgba(255, 255, 255, 0.7) !important;
}

/* 强化对话框标题样式 - 多重选择器确保生效 */
.profile-form-dialog .el-dialog__title,
.profile-form-dialog :deep(.el-dialog__title),
.tech-dialog .el-dialog__title,
.tech-dialog :deep(.el-dialog__title),
:deep(.profile-form-dialog .el-dialog__title),
:deep(.tech-dialog .el-dialog__title) {
  color: #00ffff !important;
  font-weight: bold !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
  font-size: 18px !important;
}

/* 对话框头部区域强化 */
.profile-form-dialog .el-dialog__header,
.profile-form-dialog :deep(.el-dialog__header),
.tech-dialog .el-dialog__header,
.tech-dialog :deep(.el-dialog__header) {
  background: rgba(45, 55, 75, 0.92) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3) !important;
  padding: 20px 24px !important;
}

/* 最高优先级的标题样式覆盖 */
div.el-dialog.profile-form-dialog .el-dialog__title,
div.el-dialog.tech-dialog .el-dialog__title {
  color: #00ffff !important;
  font-weight: bold !important;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6) !important;
  font-size: 18px !important;
}

/* 强化标签页样式 */
.profile-form-dialog :deep(.el-tabs__item),
.profile-form-dialog .el-tabs__item {
  color: rgba(255, 255, 255, 0.8) !important;
  background: transparent !important;
  font-weight: 500 !important;
  font-size: 14px !important;
}

.profile-form-dialog :deep(.el-tabs__item:hover),
.profile-form-dialog .el-tabs__item:hover {
  color: #00ffff !important;
}

.profile-form-dialog :deep(.el-tabs__item.is-active),
.profile-form-dialog .el-tabs__item.is-active {
  color: #00ffff !important;
  background: rgba(0, 255, 255, 0.1) !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}

/* 强化标签页导航区域 */
.profile-form-dialog :deep(.el-tabs__nav-wrap),
.profile-form-dialog .el-tabs__nav-wrap {
  background: rgba(0, 255, 255, 0.05) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  padding: 4px !important;
  margin-bottom: 20px !important;
}

.profile-form-dialog :deep(.el-tabs__active-bar),
.profile-form-dialog .el-tabs__active-bar {
  background: #00ffff !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.6) !important;
  height: 3px !important;
}

/* 修复标签页下方的白线 */
.profile-form-dialog :deep(.el-tabs__nav),
.profile-form-dialog .el-tabs__nav {
  border-bottom: 1px solid rgba(0, 255, 255, 0.3) !important;
}

.profile-form-dialog :deep(.el-tabs__header),
.profile-form-dialog .el-tabs__header {
  border-bottom: 1px solid rgba(0, 255, 255, 0.3) !important;
  margin-bottom: 0 !important;
}

.profile-form-dialog :deep(.el-tabs__content),
.profile-form-dialog .el-tabs__content {
  border-top: none !important;
  padding-top: 20px !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-content {
    padding: 0 10px;
  }
  
  :deep(.el-descriptions) {
    font-size: 14px;
  }
}
</style>
