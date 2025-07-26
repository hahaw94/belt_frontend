<template>
  <div class="user-management-integrated-container sub-page-content">
    <h2>用户管理</h2>

    <el-card class="user-list-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <div>
            <el-button type="success" :icon="Plus" size="small" @click="handleAddUser">添加用户</el-button>
            <el-button type="primary" :icon="Refresh" size="small" @click="getUsers">刷新列表</el-button>
          </div>
        </div>
      </template>

      <el-table :data="paginatedUsers" v-loading="loading" border stripe style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120"></el-table-column>
        <el-table-column prop="role" label="角色" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="lastLogin" label="上次登录" width="180"></el-table-column>
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" :icon="Edit" size="small" @click="handleEditUser(row)">编辑</el-button>
            <el-button type="info" :icon="Key" size="small" @click="handleResetPassword(row)">重置密码</el-button>
            <el-button :type="row.status === '启用' ? 'warning' : 'success'" :icon="row.status === '启用' ? CircleClose : Select" size="small" @click="toggleUserStatus(row)">
              {{ row.status === '启用' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" :icon="Delete" size="small" @click="handleDeleteUser(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          :small="false"
          :disabled="loading"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="mockUsers.length"
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
          <el-input v-model="currentUser.username" :disabled="isEditMode"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEditMode || passwordResetMode">
          <el-input type="password" v-model="currentUser.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEditMode || passwordResetMode">
          <el-input type="password" v-model="currentUser.confirmPassword" show-password></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="currentUser.role" placeholder="请选择角色" style="width: 100%;">
            <el-option label="管理员" value="管理员"></el-option>
            <el-option label="操作员" value="操作员"></el-option>
            <el-option label="访客" value="访客"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
              v-model="currentUser.status"
              active-text="启用"
              inactive-text="禁用"
              active-value="启用"
              inactive-value="禁用"
          ></el-switch>
        </el-form-item>

        <el-form-item label="模块权限">
          <el-checkbox-group v-model="currentUser.permissions" class="permission-checkbox-group">
            <el-checkbox v-for="route in allRoutesForPermission" :key="route.name" :label="route.name">
              {{ route.meta?.title || route.name }}
            </el-checkbox>
          </el-checkbox-group>
          <div class="permission-tip">请勾选该用户可以访问的页面模块。</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUserForm" :loading="loading">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="UserManagementIntegrated">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh, Edit, Key, CircleClose, Select, Delete } from '@element-plus/icons-vue';
import router from '@/router'; // 导入路由实例以获取所有路由信息

// ===================== 数据定义 =====================
const loading = ref(false); // 表格加载状态
const userDialogVisible = ref(false); // 控制添加/编辑用户弹窗的显示
const isEditMode = ref(false); // 是否是编辑模式
const passwordResetMode = ref(false); // 是否处于密码重置模式（编辑用户时可选择重置密码）
const currentUser = reactive({
  id: null,
  username: '',
  password: '',
  confirmPassword: '',
  role: '操作员', // 默认角色
  status: '启用', // 默认启用
  permissions: [], // 存储勾选的权限 (路由名称)
  createTime: '',
  lastLogin: '',
});

// 模拟用户数据
const mockUsers = ref([]);

// 分页数据
const currentPage = ref(1);
const pageSize = ref(10);

// 表单验证规则
const userFormRef = ref(null);
const userRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
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
  ],
  role: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ],
});

// 用于权限勾选的所有可访问路由模块
const allRoutesForPermission = computed(() => {
  // 过滤掉根路由和不应作为独立权限勾选的路由，只保留菜单项或有明确meta.title的路由
  const accessibleRoutes = router.getRoutes().filter(route =>
      route.meta?.title && !route.meta?.hidden && route.path !== '/'
  );
  // 为了更友好，可以对层级进行处理，这里简化为所有带title的路由
  return accessibleRoutes;
});


// ===================== Computed 属性 =====================
// 根据分页信息获取当前页的用户数据
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return mockUsers.value.slice(start, end);
});

// ===================== 方法 =====================

/**
 * 模拟初始化用户数据
 */
const initMockUsers = () => {
  const users = [];
  const roles = ['管理员', '操作员', '访客'];
  const statuses = ['启用', '禁用'];
  const routeNames = allRoutesForPermission.value.map(r => r.name); // 获取所有路由名称

  for (let i = 1; i <= 25; i++) {
    const role = roles[Math.floor(Math.random() * roles.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createTime = new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toLocaleString('zh-CN');
    const lastLogin = Math.random() > 0.3 ? new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toLocaleString('zh-CN') : '从未登录';

    // 为每个用户随机分配一些权限
    const randomPermissions = [];
    const numPermissions = Math.floor(Math.random() * routeNames.length) + 1; // 至少1个权限
    for (let j = 0; j < numPermissions; j++) {
      const randomRoute = routeNames[Math.floor(Math.random() * routeNames.length)];
      if (!randomPermissions.includes(randomRoute)) {
        randomPermissions.push(randomRoute);
      }
    }

    users.push({
      id: i,
      username: `user_${i < 10 ? '0' + i : i}`,
      // 密码不存储在前端模拟数据中，仅在添加/重置时处理
      role: role,
      status: status,
      permissions: randomPermissions, // 随机分配权限
      createTime: createTime,
      lastLogin: lastLogin,
    });
  }
  mockUsers.value = users;
};

/**
 * 刷新用户列表 (模拟)
 */
const getUsers = () => {
  loading.value = true;
  ElMessage.info('正在刷新用户列表...');
  setTimeout(() => {
    initMockUsers(); // 重新加载模拟数据
    loading.value = false;
    ElMessage.success('用户列表已刷新！');
  }, 500);
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
    password: '',
    confirmPassword: '',
    role: '操作员',
    status: '启用',
    permissions: [],
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
      loading.value = true;
      const messagePrefix = isEditMode.value ? '更新' : '添加';
      ElMessage.info(`正在${messagePrefix}用户: ${currentUser.username}...`);

      setTimeout(() => {
        loading.value = false;
        if (isEditMode.value) {
          // 编辑用户
          const index = mockUsers.value.findIndex(u => u.id === currentUser.id);
          if (index !== -1) {
            // 复制除密码外的所有属性
            const { ...rest } = currentUser;
            Object.assign(mockUsers.value[index], rest);
            ElMessage.success(`用户 ${currentUser.username} 更新成功！`);
          }
        } else {
          // 添加用户
          const newId = Math.max(0, ...mockUsers.value.map(u => u.id)) + 1;
          const {  ...dataToSave } = currentUser; // 移除确认密码字段
          mockUsers.value.unshift({
            ...dataToSave,
            id: newId,
            createTime: new Date().toLocaleString('zh-CN'),
            lastLogin: '从未登录',
            // 真实场景下密码需要加密后存储
            // password: dataToSave.password // 实际不会这样直接存
          });
          ElMessage.success(`用户 ${currentUser.username} 添加成功！`);
        }
        userDialogVisible.value = false;
      }, 1000);
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
 * 切换用户状态 (启用/禁用)
 * @param {Object} row - 当前行用户数据
 */
const toggleUserStatus = (row) => {
  ElMessageBox.confirm(`确定要${row.status === '启用' ? '禁用' : '启用'}用户 "${row.username}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
      .then(() => {
        loading.value = true;
        setTimeout(() => {
          const index = mockUsers.value.findIndex(u => u.id === row.id);
          if (index !== -1) {
            mockUsers.value[index].status = row.status === '启用' ? '禁用' : '启用';
          }
          loading.value = false;
          ElMessage.success(`用户 ${row.username} 已${row.status === '启用' ? '禁用' : '启用'}！`);
        }, 300);
      })
      .catch(() => {
        ElMessage.info('已取消操作。');
      });
};

/**
 * 处理删除用户操作
 * @param {Object} row - 要删除的用户数据
 */
const handleDeleteUser = (row) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？此操作不可逆！`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
      .then(() => {
        loading.value = true;
        setTimeout(() => {
          mockUsers.value = mockUsers.value.filter(user => user.id !== row.id);
          loading.value = false;
          ElMessage.success(`用户 ${row.username} 删除成功！`);
          // 检查当前页是否为空，如果为空且不是第一页，则跳转到上一页
          if (paginatedUsers.value.length === 0 && currentPage.value > 1) {
            currentPage.value--;
          }
        }, 300);
      })
      .catch(() => {
        ElMessage.info('已取消删除操作。');
      });
};

/**
 * 处理每页显示条数变化
 * @param {number} val - 新的每页条数
 */
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 改变每页大小时，重置到第一页
};

/**
 * 处理当前页码变化
 * @param {number} val - 新的当前页码
 */
const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// ===================== 生命周期钩子 =====================
onMounted(() => {
  initMockUsers(); // 组件挂载时初始化模拟用户数据
});
</script>

<style scoped>
/* 继承父级页面容器的基础样式 */
.sub-page-content {
  padding: 15px;
  border-radius: 6px;
  margin-top: 0;
  min-height: auto;
}

h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.user-list-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #333;
}

/* 调整表格头部样式 */
:deep(.el-table__header-wrapper .el-table__header th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: bold;
}

/* 分页组件居中 */
.flex-center {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 权限勾选组样式 */
.permission-checkbox-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 每行3列 */
  gap: 10px; /* 间距 */
  width: 100%;
  border: 1px dashed #e0e0e0;
  padding: 15px;
  border-radius: 4px;
}

.permission-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>