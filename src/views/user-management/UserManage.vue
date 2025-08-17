<template>
  <div class="user-management-integrated-container tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background">
    </div>
    


    <el-card class="user-list-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <div>
            <el-button type="success" :icon="Plus" size="small" class="tech-button-sm" @click="handleAddUser">添加用户</el-button>
            <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="getUsers">刷新列表</el-button>
          </div>
        </div>
      </template>

      <el-table :data="paginatedUsers" v-loading="loading" border stripe class="tech-table" style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="150"></el-table-column>
        <el-table-column prop="phone" label="电话" width="120"></el-table-column>
        <el-table-column prop="roles" label="角色" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles?.slice(0, 2)"
              :key="role.id"
              size="small"
              style="margin-right: 4px;"
            >
              {{ role.name }}
            </el-tag>
            <el-tag
              v-if="row.roles?.length > 2"
              size="small"
              type="info"
            >
              +{{ row.roles.length - 2 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '锁定' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="lastLogin" label="上次登录" width="180"></el-table-column>
        <el-table-column label="操作" width="340" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" :icon="Edit" size="small" class="tech-button-xs" @click="handleEditUser(row)">编辑</el-button>
            <el-button type="info" :icon="Key" size="small" class="tech-button-xs" @click="handleResetPassword(row)">重置密码</el-button>
            <el-button 
              :type="row.status === 'active' ? 'warning' : 'success'" 
              :icon="row.status === 'active' ? CircleClose : Select" 
              size="small" 
              class="tech-button-xs"
              @click="toggleUserStatus(row)"
            >
              {{ row.status === 'active' ? '锁定' : '解锁' }}
            </el-button>
            <el-button type="danger" :icon="Delete" size="small" class="tech-button-xs" @click="handleDeleteUser(row)">删除</el-button>
            <el-button type="warning" size="small" class="tech-button-xs" @click="handleManageRoles(row)">分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
                  v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20]"
          :small="false"
          :disabled="loading"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="mt-20 flex-center"
      />
    </el-card>

    <el-dialog
        v-model="userDialogVisible"
        :title="isEditMode ? '编辑用户' : '添加用户'"
        width="600px"
        :close-on-click-modal="false"
        destroy-on-close
    >
      <el-form :model="currentUser" :rules="userRules" ref="userFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="currentUser.username" :disabled="isEditMode" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="currentUser.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="currentUser.phone" placeholder="请输入电话号码"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="real_name">
          <el-input v-model="currentUser.real_name" placeholder="请输入真实姓名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEditMode || passwordResetMode">
          <el-input type="password" v-model="currentUser.password" show-password placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEditMode || passwordResetMode">
          <el-input type="password" v-model="currentUser.confirmPassword" show-password placeholder="请再次输入密码"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="description">
          <el-input 
            v-model="currentUser.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入用户备注信息"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUserForm" :loading="loading">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 角色分配对话框 -->
    <el-dialog
      v-model="roleAssignDialogVisible"
      title="分配角色"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
      class="tech-dialog"
    >
      <div class="role-assign-content">
        <h4>为用户 "{{ selectedUser.username }}" 分配角色</h4>
        <el-checkbox-group v-model="selectedRoles" class="role-checkbox-group">
          <el-checkbox
            v-for="role in availableRoles"
            :key="role.id"
            :label="role.id"
          >
            {{ role.name }} - {{ role.description }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleAssignDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRoleAssign" :loading="loading">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="UserManagementIntegrated">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh, Edit, Key, CircleClose, Select, Delete } from '@element-plus/icons-vue';
import { userApi, roleApi } from '@/api/user';

// ===================== 数据定义 =====================
const loading = ref(false); // 表格加载状态
const userDialogVisible = ref(false); // 控制添加/编辑用户弹窗的显示
const roleAssignDialogVisible = ref(false); // 控制角色分配弹窗的显示
const isEditMode = ref(false); // 是否是编辑模式
const passwordResetMode = ref(false); // 是否处于密码重置模式（编辑用户时可选择重置密码）
const currentUser = reactive({
  id: null,
  username: '',
  email: '',
  phone: '',
  real_name: '',
  description: '',
  password: '',
  confirmPassword: '',
  status: 'active', // 默认正常状态
  createTime: '',
  lastLogin: '',
});

// 角色分配相关数据
const selectedUser = ref({});
const selectedRoles = ref([]);
const availableRoles = ref([]);

// 用户数据
const userList = ref([]);

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

// 表单验证规则
const userFormRef = ref(null);
const userRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  real_name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, message: '密码必须包含大小写字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== currentUser.password) {
          callback(new Error('两次输入的密码不一致！'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
});




// ===================== Computed 属性 =====================
// 当前页用户数据（直接使用API返回的分页数据）
const paginatedUsers = computed(() => {
  return userList.value;
});

// ===================== 方法 =====================

/**
 * 获取用户列表
 */
const getUserList = async () => {
  try {
    loading.value = true;
    const response = await userApi.getUserList({
      page: pagination.page,
      page_size: pagination.pageSize
    });
    
    // 处理API返回的字段名称映射
    const processedUsers = response.body.users.map(user => ({
      ...user,
      createTime: user.create_time || new Date().toLocaleString('zh-CN'),
      lastLogin: user.last_login || '从未登录',
      roles: user.roles || []
    }));
    
    userList.value = processedUsers;
    pagination.total = response.body.total;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 获取角色列表
 */
const getRoleList = async () => {
  try {
    const response = await roleApi.getRoleList();
    availableRoles.value = response.body.roles || [];
  } catch (error) {
    ElMessage.error('获取角色列表失败');
  }
};

/**
 * 刷新用户列表
 */
const getUsers = () => {
  getUserList();
};

/**
 * 处理添加用户按钮点击
 */
const handleAddUser = () => {
  isEditMode.value = false;
  passwordResetMode.value = false; // 确保添加时显示密码字段
  // 重置 currentUser
  Object.assign(currentUser, {
    id: null,
    username: '',
    email: '',
    phone: '',
    real_name: '',
    description: '',
    password: '',
    confirmPassword: '',
    status: 'active',
    createTime: '',
    lastLogin: '',
  });
  userDialogVisible.value = true;
  // 清除上次的表单验证
  if (userFormRef.value) {
    userFormRef.value.clearValidate();
  }
};

/**
 * 处理编辑用户按钮点击
 * @param {Object} row - 当前行用户数据
 */
const handleEditUser = (row) => {
  isEditMode.value = true;
  passwordResetMode.value = false; // 编辑时默认不重置密码，可后续单独重置
  Object.assign(currentUser, { ...row, password: '', confirmPassword: '' }); // 复制数据，密码清空不显示
  userDialogVisible.value = true;
  // 清除上次的表单验证
  if (userFormRef.value) {
    userFormRef.value.clearValidate();
  }
};

/**
 * 提交用户表单 (添加/编辑)
 */
const submitUserForm = async () => {
  if (!userFormRef.value) return;

  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        // eslint-disable-next-line no-unused-vars
        const { confirmPassword, ...userData } = currentUser;
        
        if (isEditMode.value) {
          // 编辑用户
          if (passwordResetMode.value) {
            // 重置密码
            await userApi.resetPassword(currentUser.id, { new_password: currentUser.password });
            ElMessage.success(`用户 ${currentUser.username} 密码重置成功！`);
          } else {
            // 更新用户信息（不包含密码）
            // eslint-disable-next-line no-unused-vars
            const { password, ...updateData } = userData;
            await userApi.updateUser(currentUser.id, updateData);
            ElMessage.success(`用户 ${currentUser.username} 更新成功！`);
          }
        } else {
          // 添加用户
          await userApi.createUser(userData);
          ElMessage.success(`用户 ${currentUser.username} 添加成功！`);
        }
        
        userDialogVisible.value = false;
        getUserList(); // 重新加载用户列表
      } catch (error) {
        ElMessage.error(error.message || '操作失败');
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.error('请检查表单输入！');
    }
  });
};

/**
 * 处理重置密码按钮点击
 * @param {Object} row - 当前行用户数据
 */
const handleResetPassword = (row) => {
  isEditMode.value = true;
  passwordResetMode.value = true; // 启用密码重置模式
  Object.assign(currentUser, { ...row, password: '', confirmPassword: '' }); // 清空密码字段以便重新输入
  userDialogVisible.value = true;
  // 清除上次的表单验证
  if (userFormRef.value) {
    userFormRef.value.clearValidate();
  }
  ElMessage.info(`正在为用户 ${row.username} 重置密码，请设置新密码。`);
};


/**
 * 切换用户状态 (正常/锁定)
 * @param {Object} row - 当前行用户数据
 */
const toggleUserStatus = async (row) => {
  const isLock = row.status === 'active';
  const action = isLock ? '锁定' : '解锁';
  
  try {
    await ElMessageBox.confirm(`确定要${action}用户 "${row.username}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    loading.value = true;
    if (isLock) {
      await userApi.lockUser(row.id);
    } else {
      await userApi.unlockUser(row.id);
    }
    ElMessage.success(`用户 ${row.username} 已${action}！`);
    getUserList(); // 重新加载用户列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}操作失败`);
    } else {
      ElMessage.info('已取消操作。');
    }
  } finally {
    loading.value = false;
  }
};

/**
 * 处理删除用户操作
 * @param {Object} row - 要删除的用户数据
 */
const handleDeleteUser = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？此操作不可逆！`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    loading.value = true;
    await userApi.deleteUser(row.id);
    ElMessage.success(`用户 ${row.username} 删除成功！`);
    
    // 检查当前页是否为空，如果为空且不是第一页，则跳转到上一页
    if (userList.value.length === 1 && pagination.page > 1) {
      pagination.page--;
    }
    
    getUserList(); // 重新加载用户列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除用户失败');
    } else {
      ElMessage.info('已取消删除操作。');
    }
  } finally {
    loading.value = false;
  }
};

/**
 * 处理每页显示条数变化
 * @param {number} val - 新的每页条数
 */
const handleSizeChange = (val) => {
  pagination.pageSize = val;
  pagination.page = 1; // 改变每页大小时，重置到第一页
  getUserList();
};

/**
 * 处理当前页码变化
 * @param {number} val - 新的当前页码
 */
const handleCurrentChange = (val) => {
  pagination.page = val;
  getUserList();
};

/**
 * 处理分配角色按钮点击
 * @param {Object} row - 当前行用户数据
 */
const handleManageRoles = async (row) => {
  selectedUser.value = { ...row };
  
  try {
    loading.value = true;
    
    // 获取用户当前角色
    const userRolesResponse = await roleApi.getUserRoles(row.id);
    const userRoles = userRolesResponse.body.roles || [];
    selectedRoles.value = userRoles.map(role => role.id);
    
    roleAssignDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取用户角色失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 提交角色分配
 */
const submitRoleAssign = async () => {
  try {
    loading.value = true;
    
    // 获取当前用户角色
    const currentRolesResponse = await roleApi.getUserRoles(selectedUser.value.id);
    const currentRoles = currentRolesResponse.body.roles || [];
    const currentRoleIds = currentRoles.map(role => role.id);
    
    // 找出需要添加和移除的角色
    const rolesToAdd = selectedRoles.value.filter(roleId => !currentRoleIds.includes(roleId));
    const rolesToRemove = currentRoleIds.filter(roleId => !selectedRoles.value.includes(roleId));
    
    // 移除角色
    for (const roleId of rolesToRemove) {
      await roleApi.removeUserRole(selectedUser.value.id, roleId);
    }
    
    // 添加角色
    for (const roleId of rolesToAdd) {
      await roleApi.assignUserRole(selectedUser.value.id, { role_id: roleId });
    }
    
    ElMessage.success(`用户 ${selectedUser.value.username} 角色分配成功！`);
    roleAssignDialogVisible.value = false;
    getUserList(); // 重新加载用户列表
  } catch (error) {
    ElMessage.error(error.message || '角色分配失败');
  } finally {
    loading.value = false;
  }
};



// ===================== 生命周期钩子 =====================
onMounted(() => {
  getUserList(); // 组件挂载时加载用户数据
  getRoleList(); // 组件挂载时加载角色数据
});
</script>

<style scoped>
/* ==================== 科技感主题样式 ==================== */

/* 页面容器 */
.tech-page-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background: transparent; /* 使用全局背景 */
  overflow: auto;
}

/* 科技感背景 */
.tech-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}







/* 科技感卡片 */
.tech-card {
  position: relative;
  z-index: 10;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  margin-bottom: 20px;
}

.tech-card :deep(.el-card__header) {
  background: transparent;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 0;
}

.tech-card :deep(.el-card__body) {
  background: transparent;
  padding: 0;
}

.mb-20 {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

/* 科技感按钮 */
.tech-button-sm {
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2) !important;
}

.tech-button-sm:hover {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-1px) !important;
}

.tech-button-xs {
  font-size: 12px !important;
  padding: 4px 8px !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background: rgba(0, 255, 255, 0.08) !important;
  color: #00ffff !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
  margin: 0 2px !important;
}

.tech-button-xs:hover {
  background: rgba(0, 255, 255, 0.15) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
  transform: translateY(-1px) !important;
}

/* 科技感表格 */
.tech-table {
  background: transparent !important;
}

/* 表格头部样式 */
.tech-table :deep(.el-table__header-wrapper) {
  background: transparent !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header) {
  background: transparent !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header th) {
  background: rgba(26, 26, 46, 0.8) !important;
  color: #00ffff !important;
  font-weight: bold !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

/* 表格主体样式 */
.tech-table :deep(.el-table__body-wrapper) {
  background: transparent !important;
}

.tech-table :deep(.el-table__body) {
  background: transparent !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

/* 移除斑马纹效果 */
.tech-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: transparent !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(even)) {
  background: transparent !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(odd)) {
  background: transparent !important;
}

/* 悬停效果 */
.tech-table :deep(.el-table__body-wrapper .el-table__body tr:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:hover td) {
  background: transparent !important;
}

/* 单元格样式 */
.tech-table :deep(.el-table__body-wrapper .el-table__body td) {
  border-bottom: 1px solid rgba(0, 255, 255, 0.1) !important;
  background: transparent !important;
}

.tech-table :deep(.el-table--border .el-table__inner-wrapper::after) {
  background-color: rgba(0, 255, 255, 0.2) !important;
}

.tech-table :deep(.el-table--border td) {
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
}

/* 确保整个表格容器透明 */
.tech-table :deep(.el-table) {
  background: transparent !important;
}

.tech-table :deep(.el-table::before) {
  background-color: transparent !important;
}

/* 分页组件样式 */
.flex-center {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-pagination) {
  color: #00ffff !important;
}

:deep(.el-pagination .el-pager li) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  border-radius: 4px !important;
  margin: 0 2px !important;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: rgba(0, 255, 255, 0.3) !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  border-radius: 4px !important;
}

/* 科技感对话框 */
:deep(.tech-dialog .el-dialog) {
  background: rgba(0, 0, 0, 0.8) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 15px !important;
  box-shadow: 
    0 0 50px rgba(0, 255, 255, 0.2),
    inset 0 0 50px rgba(0, 255, 255, 0.05) !important;
}

:deep(.tech-dialog .el-dialog__header) {
  background: rgba(0, 255, 255, 0.1);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 15px 15px 0 0;
}

:deep(.tech-dialog .el-dialog__title) {
  color: #00ffff !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  font-weight: bold;
}

:deep(.tech-dialog .el-dialog__body) {
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
}

/* 科技感表单 */
:deep(.el-form-item__label) {
  color: #00ffff !important;
  font-weight: 500 !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}

:deep(.el-input__wrapper) {
  background: rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: 
    0 0 15px rgba(0, 255, 255, 0.1),
    inset 0 0 15px rgba(0, 255, 255, 0.05) !important;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.2),
    inset 0 0 20px rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #00ffff !important;
  box-shadow: 
    0 0 25px rgba(0, 255, 255, 0.3),
    inset 0 0 25px rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.9) !important;
  background: transparent !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

:deep(.el-textarea__inner) {
  background: rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border-radius: 6px !important;
}

:deep(.el-select .el-select__wrapper) {
  background: rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

/* 科技感标签 */
:deep(.el-tag) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #00ffff !important;
  border-radius: 4px !important;
}

:deep(.el-tag.el-tag--success) {
  background: rgba(103, 194, 58, 0.2) !important;
  border-color: rgba(103, 194, 58, 0.5) !important;
  color: #67c23a !important;
}

:deep(.el-tag.el-tag--danger) {
  background: rgba(245, 108, 108, 0.2) !important;
  border-color: rgba(245, 108, 108, 0.5) !important;
  color: #f56c6c !important;
}

/* 权限和角色分配样式 */
.permission-checkbox-group,
.role-checkbox-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  width: 100%;
  border: 1px solid rgba(0, 255, 255, 0.2);
  background: rgba(0, 255, 255, 0.05);
  padding: 15px;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.role-checkbox-group {
  display: flex;
  flex-direction: column;
}

:deep(.el-checkbox) {
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #00ffff !important;
  border-color: #00ffff !important;
}

:deep(.el-checkbox__inner:hover) {
  border-color: #00ffff !important;
}

.permission-tip {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8px;
  text-align: center;
}

.role-assign-content h4 {
  color: #00ffff;
  margin-bottom: 15px;
  font-size: 16px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  padding-bottom: 8px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tech-page-container {
    padding: 10px;
  }
  
  .title-main {
    font-size: 24px;
  }
  
  .title-sub {
    font-size: 12px;
    letter-spacing: 2px;
  }
  
  .permission-checkbox-group {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .permission-checkbox-group {
    grid-template-columns: 1fr;
  }
}
</style>