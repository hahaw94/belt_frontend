<template>
  <div class="role-management-integrated-container tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background">
    </div>
    
    <h2>{{ $t('user.role.title') }}</h2>

    <el-card class="role-list-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ $t('user.role.title') }}</span>
          <div>
            <el-button type="success" :icon="Plus" size="small" class="tech-button-sm" @click="handleAddRole">{{ $t('user.role.addRole') }}</el-button>
            <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="getRoles">{{ $t('common.refresh') }}</el-button>
          </div>
        </div>
      </template>



      <el-table :data="paginatedRoles" v-loading="loading" border stripe class="tech-table" style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80" align="center" header-align="center"></el-table-column>
        <el-table-column prop="name" :label="$t('user.role.roleName')" min-width="120" header-align="center"></el-table-column>
        <el-table-column prop="description" :label="$t('common.description')" min-width="200" header-align="center"></el-table-column>
        <el-table-column prop="permissions" :label="$t('user.role.permissions')" min-width="300" header-align="center">
          <template #default="{ row }">
            <el-tag
              v-for="permission in row.permissions?.slice(0, 3)"
              :key="permission.id"
              size="small"
              style="margin-right: 5px; margin-bottom: 2px;"
            >
              {{ permission.permission_name }}
            </el-tag>
            <el-tag
              v-if="row.permissions?.length > 3"
              size="small"
              type="info"
              style="margin-right: 5px;"
            >
              +{{ row.permissions.length - 3 }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" :label="$t('common.createTime')" width="180" header-align="center"></el-table-column>
        <el-table-column :label="$t('common.operation')" width="280" align="center" header-align="center">
          <template #default="{ row }">
            <el-button type="primary" :icon="Edit" size="small" class="tech-button-xs" @click="handleEditRole(row)">{{ $t('common.edit') }}</el-button>
            <el-button type="info" :icon="View" size="small" class="tech-button-xs" @click="handleViewPermissions(row)">{{ $t('user.role.permissions') }}</el-button>
            <el-button 
              v-if="!row.is_default"
              type="danger" 
              :icon="Delete"
              size="small" 
              class="tech-button-xs"
              @click="handleDeleteRole(row)"
            >
{{ $t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 增强型分页组件 -->
      <div class="pagination-container tech-pagination">
        <div class="pagination-info">
          <span>{{ $t('common.total') }} <span class="total-count">{{ pagination.total }}</span> {{ $t('common.records') }}，{{ $t('common.perPage') }} 
            <el-select 
              v-model="pagination.pageSize" 
              @change="handleSizeChange"
              class="page-size-select"
              size="small"
            >
              <el-option label="5" :value="5" />
              <el-option label="10" :value="10" />
              <el-option label="20" :value="20" />
              <el-option label="50" :value="50" />
            </el-select> {{ $t('common.items') }}
          </span>
        </div>
        <div class="pagination-controls">
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === 1 || loading"
            @click="goToRolePage(1)"
          >
            {{ $t('common.firstPage') }}
          </el-button>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === 1 || loading"
            @click="goToRolePage(pagination.page - 1)"
          >
            {{ $t('common.prevPage') }}
          </el-button>
          <div class="pagination-pages">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              class="page-btn"
              :class="{ active: page === pagination.page }"
              @click="goToRolePage(page)"
              :disabled="loading"
            >
              {{ page }}
            </button>
          </div>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === totalRolePages || loading"
            @click="goToRolePage(pagination.page + 1)"
          >
            {{ $t('common.nextPage') }}
          </el-button>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === totalRolePages || loading"
            @click="goToRolePage(totalRolePages)"
          >
            {{ $t('common.lastPage') }}
          </el-button>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="roleDialogVisible"
      :title="isEditMode ? $t('user.role.editRole') : $t('user.role.addRole')"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
      class="tech-dialog role-form-dialog"
      :style="{
        '--el-dialog-bg-color': 'rgba(45, 55, 75, 0.92)',
        '--el-dialog-header-bg-color': 'rgba(45, 55, 75, 0.92)',
        '--el-dialog-content-bg-color': 'rgba(45, 55, 75, 0.92)'
      }"
    >
      <el-form :model="currentRole" :rules="roleRules" ref="roleFormRef" label-width="100px">
        <el-form-item :label="$t('user.role.roleName')" prop="name">
          <el-input 
            v-model="currentRole.name" 
            :disabled="isEditMode"
            :placeholder="$t('user.role.pleaseInputRoleName')"
            style="--el-input-bg-color: rgba(65, 75, 95, 0.85); --el-input-border-color: rgba(0, 255, 255, 0.4); --el-input-text-color: rgba(255, 255, 255, 0.95);"
          ></el-input>
          <div v-if="isEditMode" class="form-hint">
            {{ $t('user.role.roleNameNotEditable') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('user.role.roleCode')" prop="code">
          <el-input 
            v-model="currentRole.code" 
            :disabled="isEditMode"
            :placeholder="$t('user.role.pleaseInputRoleCode')"
            style="--el-input-bg-color: rgba(65, 75, 95, 0.85); --el-input-border-color: rgba(0, 255, 255, 0.4); --el-input-text-color: rgba(255, 255, 255, 0.95);"
          ></el-input>
          <div v-if="isEditMode" class="form-hint">
            {{ $t('user.role.roleCodeNotEditable') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('user.role.roleDescription')" prop="description">
          <el-input 
            v-model="currentRole.description"
            type="textarea" 
            :placeholder="$t('user.role.pleaseInputRoleDescription')"
            :rows="3"
            style="--el-input-bg-color: rgba(65, 75, 95, 0.85); --el-input-border-color: rgba(0, 255, 255, 0.4); --el-input-text-color: rgba(255, 255, 255, 0.95);"
          ></el-input>
        </el-form-item>

        <el-form-item :label="$t('user.role.permissionModules')">
          <el-checkbox-group v-model="currentRole.permissions" class="permission-checkbox-group">
            <el-checkbox v-for="permission in availablePermissions" :key="permission.id" :label="permission.id">
              {{ permission.permission_name }}
            </el-checkbox>
          </el-checkbox-group>
          <div class="permission-tip">{{ $t('user.role.permissionTip') }}</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="submitRoleForm" :loading="loading">{{ $t('common.save') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 权限详情对话框 -->
    <el-dialog 
      v-model="permissionDialogVisible" 
:title="$t('user.role.permissionDetail')" 
      width="500px" 
      class="tech-dialog permission-detail-dialog"
      :style="{
        '--el-dialog-bg-color': 'rgba(45, 55, 75, 0.92)',
        '--el-dialog-header-bg-color': 'rgba(45, 55, 75, 0.92)',
        '--el-dialog-content-bg-color': 'rgba(45, 55, 75, 0.92)'
      }"
    >
      <div class="permission-detail">
        <h4>{{ selectedRole.name }} - {{ $t('user.role.permissionModules') }}</h4>
      <div class="permission-list">
          <el-tag
            v-for="permission in selectedRole.permissions"
            :key="permission.id"
            size="large"
            style="margin: 5px;"
          >
            {{ permission.permission_name }}
        </el-tag>
        </div>
        <div v-if="!selectedRole.permissions || selectedRole.permissions.length === 0" class="empty-permission">
          {{ $t('user.role.noPermissions') }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="RoleManagementIntegrated">
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh, Edit, View, Delete } from '@element-plus/icons-vue';
import { roleApi } from '@/api/user';

const { t } = useI18n();

// ===================== 数据定义 =====================
const loading = ref(false);
const roleDialogVisible = ref(false);
const permissionDialogVisible = ref(false);
const isEditMode = ref(false);
const currentRole = reactive({
  id: null,
  name: '',
  code: '',
  description: '',
  permissions: [],
  is_default: false,
  createTime: '',
});

// 角色数据
const roleList = ref([]);



// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

// 表单验证规则
const roleFormRef = ref(null);
const roleRules = reactive({
  name: [
    { required: true, message: () => t('user.role.pleaseInputRoleName'), trigger: 'blur' },
    { min: 2, max: 50, message: () => t('user.role.roleNameLength'), trigger: 'blur' }
  ],
  code: [
    { required: true, message: () => t('user.role.pleaseInputRoleCode'), trigger: 'blur' },
    { min: 2, max: 20, message: () => t('user.role.roleCodeLength'), trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: () => t('user.role.roleCodePattern'), trigger: 'blur' }
  ],
  description: [
    { max: 200, message: () => t('user.role.descriptionMaxLength'), trigger: 'blur' }
  ]
});

// 选中的角色（用于查看权限）
const selectedRole = ref({});

// 可用权限列表
const availablePermissions = ref([]);

// ===================== Computed 属性 =====================
// 当前页角色数据（直接使用API返回的分页数据）
const paginatedRoles = computed(() => {
  return roleList.value;
});

// 总页数
const totalRolePages = computed(() => {
  return Math.ceil(pagination.total / pagination.pageSize) || 1;
});

// 可见页码（类似HTML版本的分页逻辑）
const visiblePages = computed(() => {
  const maxVisiblePages = 5;
  const totalPages = totalRolePages.value;
  const currentPage = pagination.page;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // 调整起始页
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});

// ===================== 方法 =====================

/**
 * 获取角色列表
 */
const getRoleList = async () => {
  try {
    loading.value = true;
    
    // 构建查询参数 - 与HTML版本保持一致
    const params = {
      page: pagination.page,
      size: pagination.pageSize
    };
    
    console.log('正在获取角色列表...', {
      page: pagination.page,
      pageSize: pagination.pageSize,
      params,
      token: localStorage.getItem('token') ? '已设置' : '未设置'
    });
    
    const response = await roleApi.getRoleList(params);
    
    console.log('角色列表API响应:', response);
    
    if (response.code === 200 && response.success) {
      // 后端使用PageResponse格式：{code, message, data: [...], total, page, size}
      const roleListData = response.data || [];
      
      console.log('原始角色数据:', {
        data: response.data,
        total: response.total,
        page: response.page,
        size: response.size
      });
      
      // 处理返回的角色数据，后端角色列表已包含权限信息，无需额外请求
      const processedRoles = Array.isArray(roleListData) ? roleListData.map((role) => {
        return {
          ...role,
          id: role.id,
          name: role.role_name,
          description: role.description,
          is_default: role.role_type === 0, // 系统角色为默认角色
          permissions: role.permissions || [], // 后端已返回权限信息
          createTime: role.create_time ? new Date(role.create_time).toLocaleString('zh-CN') : new Date().toLocaleString('zh-CN')
        };
      }) : [];
      
      roleList.value = processedRoles;
      pagination.total = response.total || processedRoles.length;
    } else {
      throw new Error(response.message || t('user.role.getRoleListFailed'));
    }
  } catch (error) {
    console.error('获取角色列表失败详情:', error);
    ElMessage.error(error.message || t('user.role.getRoleListFailed'));
  } finally {
    loading.value = false;
  }
};

/**
 * 获取权限列表
 */
const getPermissionList = async () => {
  try {
    console.log('正在获取权限列表...');
    const response = await roleApi.getPermissionList();
    console.log('权限列表API响应:', response);
    
    if (response.code === 200 && response.success) {
      // 权限列表使用普通响应格式：{code, message, data: [...]}
      const permissionListData = response.data || [];
      console.log('原始权限数据:', permissionListData);
      
      // 处理权限数据字段映射
      const processedPermissions = Array.isArray(permissionListData) ? permissionListData.map(permission => ({
        ...permission,
        id: permission.id,
        permission_name: permission.permission_name,
        permission_code: permission.permission_code,
        resource: permission.resource,
        action: permission.action,
        category: permission.category
      })) : [];
      
      availablePermissions.value = processedPermissions;
    } else {
      throw new Error(response.message || t('user.role.getPermissionListFailed'));
    }
  } catch (error) {
    console.error('获取权限列表失败详情:', error);
    ElMessage.error(error.message || t('user.role.getPermissionListFailed'));
  }
};

/**
 * 刷新角色列表
 */
const getRoles = () => {
  getRoleList();
};



/**
 * 处理添加角色按钮点击
 */
const handleAddRole = () => {
  isEditMode.value = false;
  Object.assign(currentRole, {
    id: null,
    name: '',
    code: '',
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
const handleEditRole = async (row) => {
  isEditMode.value = true;
  
  try {
    loading.value = true;
    // 获取角色详情（包含权限信息）
    const roleDetailResponse = await roleApi.getRoleDetail(row.id);
    let permissions = [];
    if (roleDetailResponse.code === 200 && roleDetailResponse.success) {
      permissions = roleDetailResponse.data.permissions || [];
    }
    
    Object.assign(currentRole, { 
      ...row, 
      code: roleDetailResponse.data.role_code || row.role_code || '', // 确保显示正确的角色编码
      permissions: permissions.map(p => p.id) // 使用权限ID
    });
    
    roleDialogVisible.value = true;
    
    if (roleFormRef.value) {
      roleFormRef.value.clearValidate();
    }
  } catch (error) {
    ElMessage.error(error.message || t('user.role.getRoleDetailFailed'));
  } finally {
    loading.value = false;
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
      try {
        loading.value = true;
        // eslint-disable-next-line no-unused-vars
        const { id, createTime, ...roleData } = currentRole;
        
        if (isEditMode.value) {
          // 编辑角色 - 分别更新基本信息和权限
          // 更新基本信息
          // eslint-disable-next-line no-unused-vars
          const { permissions, ...basicData } = roleData;
          // 映射字段名
          const updateData = {
            roleName: basicData.name,
            description: basicData.description
          };
          const updateResponse = await roleApi.updateRole(currentRole.id, updateData);
          if (updateResponse.code !== 200 || !updateResponse.success) {
            throw new Error(updateResponse.message || t('user.role.updateRoleBasicInfoFailed'));
          }
          
          // 更新权限
          const permissionResponse = await roleApi.setRolePermissions(currentRole.id, currentRole.permissions);
          if (permissionResponse.code !== 200 || !permissionResponse.success) {
            throw new Error(permissionResponse.message || t('user.role.setRolePermissionsFailed'));
          }
          
          ElMessage.success(t('user.role.roleUpdateSuccess', { name: currentRole.name }));
        } else {
          // 添加角色 - 映射字段名到API文档要求的格式
          const createData = {
            roleName: roleData.name,
            roleCode: roleData.code,
            description: roleData.description,
            permissionIds: roleData.permissions || []
          };
          const response = await roleApi.createRole(createData);
          if (response.code !== 200 || !response.success) {
            throw new Error(response.message || t('user.role.createRoleFailed'));
          }
          
          ElMessage.success(t('user.role.roleAddSuccess', { name: currentRole.name }));
        }
        
        roleDialogVisible.value = false;
        getRoleList(); // 重新加载角色列表
      } catch (error) {
        ElMessage.error(error.message || t('common.operationFailed'));
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.error(t('user.role.pleaseCheckFormInput'));
    }
  });
};

/**
 * 处理删除角色操作
 */
const handleDeleteRole = async (row) => {
  try {
    await ElMessageBox.confirm(t('user.role.confirmDeleteRole', { name: row.name }), t('common.warning'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning',
    });
    
    loading.value = true;
    const response = await roleApi.deleteRole(row.id);
    if (response.code === 200 && response.success) {
      ElMessage.success(t('user.role.roleDeleteSuccess', { name: row.name }));
      getRoleList(); // 重新加载角色列表
    } else {
      throw new Error(response.message || t('user.role.deleteRoleFailed'));
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('user.role.deleteRoleFailed'));
    } else {
      ElMessage.info(t('common.deleteOperationCancelled'));
    }
  } finally {
    loading.value = false;
  }
};

/**
 * 处理每页显示条数变化
 */
const handleSizeChange = (val) => {
  pagination.pageSize = val;
  pagination.page = 1;
  getRoleList();
};



/**
 * 跳转到指定页面（类似HTML版本的goToRolePage）
 * @param {number} page - 目标页码
 */
const goToRolePage = (page) => {
  if (page < 1 || page > totalRolePages.value || page === pagination.page || loading.value) {
    return;
  }
  pagination.page = page;
  getRoleList();
};



// ===================== 生命周期钩子 =====================
onMounted(() => {
  getRoleList();
  getPermissionList();
});
</script>

<style scoped>
/* ==================== 科技感主题样式 ==================== */

/* 页面容器 */
.tech-page-container {
  position: relative;
  width: 100%;
  min-height: 100vh; /* 最小高度为视口高度，允许内容撑开 */
  max-height: 100vh; /* 最大高度为视口高度，超出时滚动 */
  padding: 20px;
  padding-bottom: 40px; /* 底部额外留白，确保分页控件可见 */
  background: transparent; /* 使用全局背景 */
  overflow-y: auto; /* 垂直滚动 */
  overflow-x: hidden; /* 隐藏水平滚动 */
  box-sizing: border-box; /* 包含padding在内的盒子模型 */
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

/* 标题样式 */
.role-management-integrated-container h2 {
  margin: 24px 0 20px 0;
  color: #00ffff;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  position: relative;
  z-index: 10;
}

/* 自定义滚动条样式 - 科技感 */
.tech-page-container::-webkit-scrollbar {
  width: 8px;
  background: rgba(0, 0, 0, 0.1);
}

.tech-page-container::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.05);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.tech-page-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.3) 0%, 
    rgba(0, 200, 255, 0.5) 50%, 
    rgba(0, 255, 255, 0.3) 100%);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.tech-page-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.5) 0%, 
    rgba(0, 200, 255, 0.7) 50%, 
    rgba(0, 255, 255, 0.5) 100%);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
}

.tech-page-container::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.7) 0%, 
    rgba(0, 200, 255, 0.9) 50%, 
    rgba(0, 255, 255, 0.7) 100%);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
}

/* 优化表格容器，避免双滚动条 */
.tech-table {
  background: transparent !important;
  max-height: none; /* 取消最大高度限制 */
}

/* 确保对话框内也有合适的滚动 */
:deep(.el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
}

/* 对话框内的滚动条样式 */
:deep(.el-dialog__body)::-webkit-scrollbar {
  width: 6px;
  background: rgba(0, 0, 0, 0.1);
}

:deep(.el-dialog__body)::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.05);
  border-radius: 3px;
}

:deep(.el-dialog__body)::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 3px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

:deep(.el-dialog__body)::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
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

/* 科技感表格 - 参考图片设计 */
.tech-table {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  border: none !important;
}

/* 表格整体容器 */
.tech-table :deep(.el-table) {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  border: none !important;
}

.tech-table :deep(.el-table::before) {
  display: none !important;
}

/* 移除所有可能的白色边框 */
.tech-table :deep(.el-table__inner-wrapper) {
  border: none !important;
}

.tech-table :deep(.el-table__inner-wrapper::after) {
  display: none !important;
}

/* 表格头部样式 - 参考图片的头部设计 */
.tech-table :deep(.el-table__header-wrapper) {
  background: linear-gradient(135deg, 
    rgba(20, 35, 60, 1) 0%, 
    rgba(25, 40, 65, 1) 100%) !important;
  border-radius: 12px 12px 0 0 !important;
  border: none !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header) {
  background: linear-gradient(135deg, 
    rgba(20, 35, 60, 1) 0%, 
    rgba(25, 40, 65, 1) 100%) !important;
  border: none !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header th) {
  background: linear-gradient(135deg, 
    rgba(20, 35, 60, 1) 0%, 
    rgba(25, 40, 65, 1) 100%) !important;
  color: #00d4ff !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  padding: 16px 12px !important;
  border: none !important;
  border-bottom: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.6) !important;
  letter-spacing: 0.5px !important;
  position: relative !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header th:last-child) {
  border-right: none !important;
}

/* 表格头部发光效果 */
.tech-table :deep(.el-table__header-wrapper .el-table__header th::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(0, 255, 255, 0.6) 50%, 
    transparent 100%);
  opacity: 0.8;
}

/* 表格主体样式 - 参考图片的行设计 */
.tech-table :deep(.el-table__body-wrapper) {
  background: transparent !important;
}

.tech-table :deep(.el-table__body) {
  background: transparent !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr) {
  background: rgba(25, 35, 55, 0.6) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.08) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative !important;
}

/* 交替行颜色 - 创建微妙的斑马纹效果 */
.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(even)) {
  background: rgba(20, 30, 50, 0.7) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(odd)) {
  background: rgba(25, 35, 55, 0.6) !important;
}

/* 悬停效果 - 参考图片的交互效果 */
.tech-table :deep(.el-table__body-wrapper .el-table__body tr:hover) {
  background: linear-gradient(90deg, 
    rgba(0, 255, 255, 0.08) 0%, 
    rgba(0, 255, 255, 0.12) 50%, 
    rgba(0, 255, 255, 0.08) 100%) !important;
  transform: translateY(-1px) !important;
  box-shadow: 
    0 4px 20px rgba(0, 255, 255, 0.15),
    inset 0 1px 0 rgba(0, 255, 255, 0.2) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:hover td) {
  background: transparent !important;
  color: rgba(255, 255, 255, 1) !important;
}

/* 单元格样式 - 参考图片的单元格设计 */
.tech-table :deep(.el-table__body-wrapper .el-table__body td) {
  border: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
  background: transparent !important;
  padding: 14px 12px !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
  position: relative !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body td:last-child) {
  border-right: none !important;
}

/* 彻底移除所有表格边框 - 最终解决方案 */
.tech-table :deep(.el-table--border) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table--border .el-table__inner-wrapper) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table--border .el-table__inner-wrapper::after) {
  display: none !important;
  content: none !important;
}

.tech-table :deep(.el-table--border .el-table__inner-wrapper::before) {
  display: none !important;
  content: none !important;
}

/* 移除所有边框补丁元素 */
.tech-table :deep(.el-table__border-left-patch) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.tech-table :deep(.el-table__border-right-patch) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.tech-table :deep(.el-table__border-bottom-patch) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.tech-table :deep(.el-table__border-top-patch) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

/* 单元格边框控制 */
.tech-table :deep(.el-table--border td) {
  border: none !important;
  border-left: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table--border th) {
  border: none !important;
  border-left: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

/* 移除表格外围的所有可能边框 */
.tech-table :deep(.el-table__body-wrapper) {
  border: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table__header-wrapper) {
  border: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table__footer-wrapper) {
  border: none !important;
  outline: none !important;
}

/* 最强力的边框移除 - 覆盖所有可能的边框样式 */
.tech-table :deep(*) {
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

.tech-table :deep(td) {
  border: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
}

.tech-table :deep(th) {
  border: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
}

.tech-table :deep(td:last-child),
.tech-table :deep(th:last-child) {
  border-right: none !important;
}

/* 移除表格容器本身的边框 */
.tech-table,
.tech-table :deep(.el-table),
.tech-table :deep(.el-table__inner-wrapper) {
  border: none !important;
  outline: none !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 255, 255, 0.2) !important;
}

/* 专门针对左右边框的强力移除 */
.tech-table :deep(.el-table),
.tech-table :deep(.el-table *),
.tech-table :deep(.el-table__inner-wrapper),
.tech-table :deep(.el-table__header),
.tech-table :deep(.el-table__body),
.tech-table :deep(.el-table__header-wrapper),
.tech-table :deep(.el-table__body-wrapper) {
  border-left: none !important;
  border-right: none !important;
}

/* 强制移除表格左右的所有可能边框元素 */
.tech-table::before,
.tech-table::after,
.tech-table :deep(.el-table)::before,
.tech-table :deep(.el-table)::after,
.tech-table :deep(.el-table__inner-wrapper)::before,
.tech-table :deep(.el-table__inner-wrapper)::after {
  display: none !important;
  content: none !important;
  border: none !important;
}

/* 确保表格外层容器没有任何边框 */
.tech-table {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  box-sizing: border-box !important;
  position: relative !important;
}

/* 数据为空时的样式 */
.tech-table :deep(.el-table__empty-block) {
  background: rgba(25, 35, 55, 0.6) !important;
  color: rgba(255, 255, 255, 0.6) !important;
  border: none !important;
}

.tech-table :deep(.el-table__empty-text) {
  color: rgba(255, 255, 255, 0.6) !important;
  font-size: 14px !important;
}

/* 科技感对话框 */
:deep(.tech-dialog .el-dialog) {
  background: rgba(45, 55, 75, 0.92) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 15px !important;
  box-shadow: 
    0 0 50px rgba(0, 255, 255, 0.2),
    inset 0 0 50px rgba(0, 255, 255, 0.05) !important;
}

:deep(.tech-dialog .el-dialog__header) {
  background: rgba(45, 55, 75, 0.92);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 15px 15px 0 0;
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

:deep(.el-tag.el-tag--info) {
  background: rgba(144, 147, 153, 0.2) !important;
  border-color: rgba(144, 147, 153, 0.5) !important;
  color: #909399 !important;
}

/* 权限相关样式 */
.permission-checkbox-group {
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

/* 表单提示文字样式 */
.form-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6) !important;
  margin-top: 4px;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
}

.permission-detail h4 {
  color: #00ffff;
  margin-bottom: 15px;
  font-size: 16px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  padding-bottom: 8px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
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
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 20px 0;
  font-style: italic;
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



/* 增强型分页样式 */
.tech-pagination {
  margin-top: 20px;
  margin-bottom: 20px; /* 确保底部有足够空间 */
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(0, 255, 255, 0.03);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  position: relative; /* 确保分页组件在正确的层级 */
  z-index: 1; /* 确保分页组件不被其他元素遮挡 */
}

.pagination-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.pagination-info .total-count {
  color: #00ffff;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

.page-size-select {
  margin: 0 5px;
  width: 80px;
}

.page-size-select :deep(.el-select__wrapper) {
  background-color: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 4px !important;
  height: 28px !important;
}

.page-size-select :deep(.el-select__input) {
  color: rgba(255, 255, 255, 0.95) !important;
  font-size: 12px !important;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
  font-size: 12px !important;
  padding: 6px 12px !important;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3) !important;
  transform: translateY(-1px) !important;
}

.pagination-btn:disabled {
  background: rgba(0, 255, 255, 0.05) !important;
  color: rgba(255, 255, 255, 0.3) !important;
  border-color: rgba(0, 255, 255, 0.1) !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 10px;
}

.page-btn {
  padding: 6px 10px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  min-width: 32px;
  text-align: center;
}

.page-btn:hover:not(:disabled) {
  background: rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}

.page-btn.active {
  background: rgba(0, 255, 255, 0.3);
  color: white;
  border-color: #00ffff;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.5);
}

.page-btn:disabled {
  background: rgba(0, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
  border-color: rgba(0, 255, 255, 0.1);
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tech-page-container {
    padding: 10px;
  }
  

  
  .pagination-container {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
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
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  /* 小屏幕表格适配 */
  .tech-table {
    min-width: 900px; /* 确保表格有最小宽度，触发水平滚动 */
  }
  
  /* 表格容器添加水平滚动 */
  .tech-card :deep(.el-card__body) {
    overflow-x: auto;
    overflow-y: visible;
  }
  
  /* 表格水平滚动条样式 */
  .tech-card :deep(.el-card__body)::-webkit-scrollbar {
    height: 8px;
    background: rgba(0, 0, 0, 0.1);
  }
  
  .tech-card :deep(.el-card__body)::-webkit-scrollbar-track {
    background: rgba(0, 255, 255, 0.05);
    border-radius: 4px;
    border: 1px solid rgba(0, 255, 255, 0.1);
  }
  
  .tech-card :deep(.el-card__body)::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, 
      rgba(0, 255, 255, 0.3) 0%, 
      rgba(0, 200, 255, 0.5) 50%, 
      rgba(0, 255, 255, 0.3) 100%);
    border-radius: 4px;
    border: 1px solid rgba(0, 255, 255, 0.2);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
  }
  
  .tech-card :deep(.el-card__body)::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(90deg, 
      rgba(0, 255, 255, 0.5) 0%, 
      rgba(0, 200, 255, 0.7) 50%, 
      rgba(0, 255, 255, 0.5) 100%);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
  }
}

@media (max-width: 480px) {
  .permission-checkbox-group {
    grid-template-columns: 1fr;
  }
}

/* 角色表单对话框样式 */
.role-form-dialog.el-dialog,
.role-form-dialog .el-dialog,
div.el-dialog.role-form-dialog {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
}

.role-form-dialog .el-dialog__header {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
}

.role-form-dialog .el-dialog__body {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.role-form-dialog .el-dialog__title {
  color: #00ffff !important;
  font-weight: bold !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}

.role-form-dialog .el-form-item__label {
  color: #00ffff !important;
  font-weight: 500 !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
}

.role-form-dialog .el-input__wrapper {
  background-color: rgba(65, 75, 95, 0.85) !important;
  background: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
}

.role-form-dialog .el-input__inner {
  color: rgba(255, 255, 255, 0.95) !important;
  background: transparent !important;
}

.role-form-dialog .el-textarea__inner {
  background-color: rgba(65, 75, 95, 0.85) !important;
  background: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border-radius: 6px !important;
}

.role-form-dialog .el-button {
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background-color: rgba(45, 55, 75, 0.8) !important;
  background: rgba(45, 55, 75, 0.8) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
}

.role-form-dialog .el-button--primary {
  background-color: rgba(0, 150, 200, 0.8) !important;
  background: rgba(0, 150, 200, 0.8) !important;
  border-color: rgba(0, 200, 255, 0.6) !important;
  color: #ffffff !important;
}

/* 权限详情对话框样式 */
.permission-detail-dialog.el-dialog,
.permission-detail-dialog .el-dialog,
div.el-dialog.permission-detail-dialog {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
}

.permission-detail-dialog .el-dialog__header {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
}

.permission-detail-dialog .el-dialog__body {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.permission-detail-dialog .el-dialog__title {
  color: #00ffff !important;
  font-weight: bold !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}
</style> 