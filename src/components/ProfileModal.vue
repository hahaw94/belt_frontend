<template>
  <el-dialog
    v-model="visible"
    title="个人资料"
    width="600px"
    @close="handleClose"
  >
    <div v-loading="loading" class="profile-content">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 查看个人资料 -->
        <el-tab-pane label="查看资料" name="view">
          <div class="profile-view">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户名">
                {{ profileData.username || '暂无数据' }}
              </el-descriptions-item>
              <el-descriptions-item label="用户ID">
                {{ profileData.id || '暂无数据' }}
              </el-descriptions-item>
              <el-descriptions-item label="邮箱">
                {{ profileData.email || '未设置' }}
              </el-descriptions-item>
              <el-descriptions-item label="手机号">
                {{ profileData.phone || '未设置' }}
              </el-descriptions-item>

            </el-descriptions>

            <!-- 角色信息 -->
            <div class="roles-section" style="margin-top: 20px;">
              <h4>角色信息</h4>
              <div class="roles-list">
                <el-tag
                  v-for="role in profileData.roles"
                  :key="role.id"
                  type="success"
                  style="margin-right: 8px; margin-bottom: 8px;"
                >
                  {{ role.role_name }}
                </el-tag>
                <span v-if="!profileData.roles || profileData.roles.length === 0" class="no-data">
                  暂无角色
                </span>
              </div>
            </div>

            <!-- 权限信息 -->
            <div class="permissions-section" style="margin-top: 20px;">
              <h4>权限信息</h4>
              <div class="permissions-list">
                <el-tag
                  v-for="permission in profileData.permissions"
                  :key="permission.id"
                  type="info"
                  size="small"
                  style="margin-right: 4px; margin-bottom: 4px;"
                >
                  {{ permission.permission_name }}
                </el-tag>
                <span v-if="!profileData.permissions || profileData.permissions.length === 0" class="no-data">
                  暂无权限
                </span>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 编辑个人资料 -->
        <el-tab-pane label="编辑资料" name="edit">
          <el-form
            ref="editFormRef"
            :model="editForm"
            :rules="editRules"
            label-width="100px"
            class="profile-edit-form"
          >
            <el-form-item label="用户名">
              <el-input v-model="profileData.username" disabled />
              <div class="form-help">用户名不可修改</div>
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="editForm.email"
                type="email"
                placeholder="请输入邮箱地址"
                clearable
              />
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input
                v-model="editForm.phone"
                placeholder="请输入手机号"
                clearable
                maxlength="11"
              />
            </el-form-item>

            <!-- 修改密码部分 -->
            <el-divider content-position="left">修改密码</el-divider>
            
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="editForm.oldPassword"
                type="password"
                placeholder="请输入原密码"
                clearable
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="editForm.newPassword"
                type="password"
                placeholder="请输入新密码（6-20位）"
                clearable
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="editForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                clearable
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleUpdate" :loading="updating">
                保存修改
              </el-button>
              <el-button @click="resetEditForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive, watch } from 'vue'
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
        
        // 准备更新数据（只传递有变化的字段）
        const updateData = {}
        if (editForm.email !== profileData.email) {
          updateData.email = editForm.email || null
        }
        if (editForm.phone !== profileData.phone) {
          updateData.phone = editForm.phone || null
        }

        // 如果没有任何变化
        if (Object.keys(updateData).length === 0) {
          ElMessage.info('没有需要更新的信息')
          return
        }

        const response = await userApi.updateMyProfile(updateData)
        if (response.success) {
          ElMessage.success('个人资料更新成功')
          // 重新加载数据
          await loadProfile()
          // 切换到查看标签页
          activeTab.value = 'view'
          // 触发更新事件
          emit('profile-updated')
        } else {
          ElMessage.error(response.message || '更新失败')
        }
      } catch (error) {
        console.error('更新个人资料失败:', error)
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
        case 1: return '正常'
        case 2: return '锁定'
        default: return '未知'
      }
    }

    // 获取角色类型文本
    const getRoleTypeText = (roleType) => {
      switch (roleType) {
        case 0: return '系统角色'
        case 1: return '自定义角色'
        default: return '未知类型'
      }
    }

    return {
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
  margin-top: 24px;
}

.roles-section h4,
.permissions-section h4 {
  margin-bottom: 12px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.roles-list,
.permissions-list {
  min-height: 32px;
  line-height: 32px;
}

.no-data {
  color: #909399;
  font-style: italic;
}

.profile-edit-form {
  padding: 20px 0;
}

.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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
