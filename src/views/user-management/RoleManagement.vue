<template>
  <div class="role-management-integrated-container sub-page-content">
    <h2>角色管理</h2>

    <el-card class="role-list-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
          <div>
            <el-button type="success" :icon="Plus" size="small" @click="handleAddRole">添加角色</el-button>
            <el-button type="primary" :icon="Refresh" size="small" @click="getRoles">刷新列表</el-button>
          </div>
        </div>
      </template>

      <el-table :data="paginatedRoles" v-loading="loading" border stripe style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="角色名称" min-width="120"></el-table-column>
        <el-table-column prop="description" label="角色描述" min-width="200"></el-table-column>
        <el-table-column prop="permissions" label="权限模块" min-width="300">
          <template #default="{ row }">
            <el-tag
              v-for="permission in row.displayPermissions.slice(0, 3)"
              :key="permission"
              size="small"
              style="margin-right: 5px; margin-bottom: 2px;"
            >
              {{ getPermissionDisplayName(permission) }}
            </el-tag>
            <el-tag
              v-if="row.displayPermissions.length > 3"
              size="small"
              type="info"
              style="margin-right: 5px;"
            >
              +{{ row.displayPermissions.length - 3 }}个权限
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_default" label="默认角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_default ? 'success' : 'info'" size="small">
              {{ row.is_default ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" :icon="Edit" size="small" @click="handleEditRole(row)">编辑</el-button>
            <el-button type="info" :icon="View" size="small" @click="handleViewPermissions(row)">权限</el-button>
            <el-button 
              v-if="!row.is_default"
              type="danger" 
              :icon="Delete"
              size="small" 
              @click="handleDeleteRole(row)"
            >
              删除
            </el-button>
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
        :total="mockRoles.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        class="mt-20 flex-center"
        />
    </el-card>

    <el-dialog
      v-model="roleDialogVisible"
      :title="isEditMode ? '编辑角色' : '添加角色'"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="currentRole" :rules="roleRules" ref="roleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="currentRole.name" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input 
            v-model="currentRole.description"
            type="textarea" 
            placeholder="请输入角色描述"
            :rows="3"
          ></el-input>
        </el-form-item>

        <el-form-item label="权限模块">
          <el-checkbox-group v-model="currentRole.permissions" class="permission-checkbox-group">
            <el-checkbox v-for="route in allParentRoutesForPermission" :key="route.name" :label="route.name">
              {{ route.meta?.title || route.name }}
            </el-checkbox>
          </el-checkbox-group>
          <div class="permission-tip">请勾选该角色可以访问的页面模块（仅包含主要功能模块）。</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRoleForm" :loading="loading">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 权限详情对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="权限详情" width="500px">
      <div class="permission-detail">
        <h4>{{ selectedRole.name }} - 权限模块</h4>
      <div class="permission-list">
          <el-tag
            v-for="permission in selectedRole.displayPermissions"
            :key="permission"
            size="large"
            style="margin: 5px;"
          >
            {{ getPermissionDisplayName(permission) }}
        </el-tag>
        </div>
        <div v-if="selectedRole.displayPermissions.length === 0" class="empty-permission">
          该角色暂无分配权限
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="RoleManagementIntegrated">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh, Edit, View, Delete } from '@element-plus/icons-vue';
import router from '@/router';

// ===================== 数据定义 =====================
const loading = ref(false);
const roleDialogVisible = ref(false);
const permissionDialogVisible = ref(false);
const isEditMode = ref(false);
const currentRole = reactive({
  id: null,
  name: '',
  description: '',
  permissions: [],
  is_default: false,
  createTime: '',
});

// 模拟角色数据
const mockRoles = ref([]);

// 分页数据
const currentPage = ref(1);
const pageSize = ref(10);

// 表单验证规则
const roleFormRef = ref(null);
const roleRules = reactive({
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' },
    { min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur' }
  ]
});

// 选中的角色（用于查看权限）
const selectedRole = ref({});

// 用于权限勾选的所有父路由（仅包含主要功能模块）
const allParentRoutesForPermission = computed(() => {
  // 只获取带有children的父路由，且不包含根路径
  const parentRoutes = router.getRoutes().filter(route => {
    return route.meta?.title && 
           route.children && 
           route.children.length > 0 && 
           route.path !== '/' &&
           !route.meta?.hidden;
  });
  
  return parentRoutes;
});

// ===================== Computed 属性 =====================
// 根据分页信息获取当前页的角色数据
const paginatedRoles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return mockRoles.value.slice(start, end);
});

// ===================== 方法 =====================

/**
 * 获取权限显示名称
 */
const getPermissionDisplayName = (permissionName) => {
  const route = router.getRoutes().find(r => r.name === permissionName);
  return route?.meta?.title || permissionName;
};

/**
 * 模拟初始化角色数据
 */
const initMockRoles = () => {
  const roles = [];
  const routeNames = allParentRoutesForPermission.value.map(r => r.name);

  // 添加默认角色
  roles.push(
        {
          id: 1,
          name: '管理员',
          description: '系统管理员，拥有所有权限',
      permissions: [...routeNames], // 所有权限
      displayPermissions: [...routeNames],
      is_default: true,
      createTime: '2024-01-01 10:00:00'
        },
        {
          id: 2,
          name: '操作员',
      description: '普通操作员，拥有基础操作权限',
      permissions: ['access', 'detection', 'recording'], // 部分权限
      displayPermissions: ['access', 'detection', 'recording'],
      is_default: true,
      createTime: '2024-01-01 10:00:00'
        },
        {
          id: 3,
      name: '访客',
      description: '访客角色，仅可查看基础信息',
      permissions: ['detection'], // 最少权限
      displayPermissions: ['detection'],
      is_default: false,
      createTime: '2024-01-01 10:00:00'
    }
  );

  // 添加一些自定义角色
  for (let i = 4; i <= 8; i++) {
    const numPermissions = Math.floor(Math.random() * routeNames.length) + 1;
    const randomPermissions = [];
    
    for (let j = 0; j < numPermissions; j++) {
      const randomRoute = routeNames[Math.floor(Math.random() * routeNames.length)];
      if (!randomPermissions.includes(randomRoute)) {
        randomPermissions.push(randomRoute);
      }
    }

    const createTime = new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000))
      .toLocaleString('zh-CN');

    roles.push({
      id: i,
      name: `自定义角色${i - 3}`,
      description: `这是自定义角色${i - 3}的描述信息`,
      permissions: randomPermissions,
      displayPermissions: randomPermissions,
      is_default: false,
      createTime: createTime
    });
  }

  mockRoles.value = roles;
};

/**
 * 刷新角色列表
 */
const getRoles = () => {
  loading.value = true;
  ElMessage.info('正在刷新角色列表...');
  setTimeout(() => {
    initMockRoles();
    loading.value = false;
    ElMessage.success('角色列表已刷新！');
  }, 500);
};

/**
 * 处理添加角色按钮点击
 */
const handleAddRole = () => {
  isEditMode.value = false;
  Object.assign(currentRole, {
    id: null,
    name: '',
    description: '',
    permissions: [],
    is_default: false,
    createTime: '',
  });
  roleDialogVisible.value = true;
  
  if (roleFormRef.value) {
    roleFormRef.value.clearValidate();
  }
};

/**
 * 处理编辑角色按钮点击
 */
const handleEditRole = (row) => {
  isEditMode.value = true;
  Object.assign(currentRole, { ...row });
  roleDialogVisible.value = true;
  
  if (roleFormRef.value) {
    roleFormRef.value.clearValidate();
  }
};

/**
 * 查看权限详情
 */
const handleViewPermissions = (row) => {
  selectedRole.value = { ...row };
  permissionDialogVisible.value = true;
};

/**
 * 提交角色表单
 */
const submitRoleForm = async () => {
  if (!roleFormRef.value) return;
  
  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      const messagePrefix = isEditMode.value ? '更新' : '添加';
      ElMessage.info(`正在${messagePrefix}角色: ${currentRole.name}...`);

      setTimeout(() => {
        loading.value = false;
        if (isEditMode.value) {
          // 编辑角色
          const index = mockRoles.value.findIndex(r => r.id === currentRole.id);
          if (index !== -1) {
            const updatedRole = { ...currentRole };
            updatedRole.displayPermissions = [...currentRole.permissions];
            Object.assign(mockRoles.value[index], updatedRole);
            ElMessage.success(`角色 ${currentRole.name} 更新成功！`);
          }
        } else {
          // 添加角色
          const newId = Math.max(0, ...mockRoles.value.map(r => r.id)) + 1;
          const newRole = {
            ...currentRole,
            id: newId,
            createTime: new Date().toLocaleString('zh-CN'),
            displayPermissions: [...currentRole.permissions]
          };
          mockRoles.value.unshift(newRole);
          ElMessage.success(`角色 ${currentRole.name} 添加成功！`);
        }
        roleDialogVisible.value = false;
      }, 1000);
        } else {
      ElMessage.error('请检查表单输入！');
    }
  });
};

/**
 * 处理删除角色操作
 */
const handleDeleteRole = (row) => {
  ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗？此操作不可逆！`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      loading.value = true;
      setTimeout(() => {
        mockRoles.value = mockRoles.value.filter(role => role.id !== row.id);
        loading.value = false;
        ElMessage.success(`角色 ${row.name} 删除成功！`);
        
        // 检查当前页是否为空
        if (paginatedRoles.value.length === 0 && currentPage.value > 1) {
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
 */
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

/**
 * 处理当前页码变化
 */
const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// ===================== 生命周期钩子 =====================
onMounted(() => {
  initMockRoles();
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

.role-list-card {
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

/* 权限详情对话框样式 */
.permission-detail h4 {
  color: #333;
  margin-bottom: 15px;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.permission-list {
  min-height: 80px;
  padding: 10px 0;
}

.permission-list .el-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.empty-permission {
  color: #909399;
  text-align: center;
  padding: 20px 0;
  font-style: italic;
}

/* 表格行样式优化 */
:deep(.el-table tbody tr:hover > td) {
  background-color: #f5f7fa !important;
}

/* 对话框样式优化 */
:deep(.el-dialog__header) {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #eee;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
  border-top: 1px solid #eee;
}

/* 表单样式优化 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

/* 按钮组样式 */
.card-header .el-button {
  margin-left: 8px;
}

/* 标签样式 */
.el-tag {
  border-radius: 4px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .permission-checkbox-group {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .permission-checkbox-group {
    grid-template-columns: 1fr;
  }
}
</style> 