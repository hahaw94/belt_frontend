<template>
  <div class="role-management-integrated-container tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background">
    </div>
    


    <el-card class="role-list-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
          <div>
            <el-button type="success" :icon="Plus" size="small" class="tech-button-sm" @click="handleAddRole">添加角色</el-button>
            <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="getRoles">刷新列表</el-button>
          </div>
        </div>
      </template>

      <el-table :data="paginatedRoles" v-loading="loading" border stripe class="tech-table" style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80" align="center" header-align="center"></el-table-column>
        <el-table-column prop="name" label="角色名称" min-width="120" header-align="center"></el-table-column>
        <el-table-column prop="description" label="角色描述" min-width="200" header-align="center"></el-table-column>
        <el-table-column prop="permissions" label="权限模块" min-width="300" header-align="center">
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
              +{{ row.permissions.length - 3 }}个权限
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_default" label="默认角色" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_default ? 'success' : 'info'" size="small">
              {{ row.is_default ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" header-align="center"></el-table-column>
        <el-table-column label="操作" width="280" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <el-button type="primary" :icon="Edit" size="small" class="tech-button-xs" @click="handleEditRole(row)">编辑</el-button>
            <el-button type="info" :icon="View" size="small" class="tech-button-xs" @click="handleViewPermissions(row)">权限</el-button>
            <el-button 
              v-if="!row.is_default"
              type="danger" 
              :icon="Delete"
              size="small" 
              class="tech-button-xs"
              @click="handleDeleteRole(row)"
            >
              删除
            </el-button>
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
      v-model="roleDialogVisible"
      :title="isEditMode ? '编辑角色' : '添加角色'"
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
        <el-form-item label="角色名称" prop="name">
          <el-input 
            v-model="currentRole.name" 
            placeholder="请输入角色名称"
            style="--el-input-bg-color: rgba(65, 75, 95, 0.85); --el-input-border-color: rgba(0, 255, 255, 0.4); --el-input-text-color: rgba(255, 255, 255, 0.95);"
          ></el-input>
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input 
            v-model="currentRole.code" 
            placeholder="请输入角色编码（如：security）"
            style="--el-input-bg-color: rgba(65, 75, 95, 0.85); --el-input-border-color: rgba(0, 255, 255, 0.4); --el-input-text-color: rgba(255, 255, 255, 0.95);"
          ></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input 
            v-model="currentRole.description"
            type="textarea" 
            placeholder="请输入角色描述"
            :rows="3"
            style="--el-input-bg-color: rgba(65, 75, 95, 0.85); --el-input-border-color: rgba(0, 255, 255, 0.4); --el-input-text-color: rgba(255, 255, 255, 0.95);"
          ></el-input>
        </el-form-item>

        <el-form-item label="权限模块">
          <el-checkbox-group v-model="currentRole.permissions" class="permission-checkbox-group">
            <el-checkbox v-for="permission in availablePermissions" :key="permission.id" :label="permission.id">
              {{ permission.permission_name }}
            </el-checkbox>
          </el-checkbox-group>
          <div class="permission-tip">请勾选该角色可以访问的权限模块。</div>
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
    <el-dialog 
      v-model="permissionDialogVisible" 
      title="权限详情" 
      width="500px" 
      class="tech-dialog permission-detail-dialog"
      :style="{
        '--el-dialog-bg-color': 'rgba(45, 55, 75, 0.92)',
        '--el-dialog-header-bg-color': 'rgba(45, 55, 75, 0.92)',
        '--el-dialog-content-bg-color': 'rgba(45, 55, 75, 0.92)'
      }"
    >
      <div class="permission-detail">
        <h4>{{ selectedRole.name }} - 权限模块</h4>
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
import { roleApi } from '@/api/user';

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
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '角色编码必须以字母开头，只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述不能超过 200 个字符', trigger: 'blur' }
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

// ===================== 方法 =====================

/**
 * 获取角色列表
 */
const getRoleList = async () => {
  try {
    loading.value = true;
    console.log('正在获取角色列表...', {
      page: pagination.page,
      pageSize: pagination.pageSize,
      token: localStorage.getItem('token') ? '已设置' : '未设置'
    });
    
    const response = await roleApi.getRoleList({
      pageNum: pagination.page,
      pageSize: pagination.pageSize
    });
    
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
      throw new Error(response.message || '获取角色列表失败');
    }
  } catch (error) {
    console.error('获取角色列表失败详情:', error);
    ElMessage.error(error.message || '获取角色列表失败');
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
      throw new Error(response.message || '获取权限列表失败');
    }
  } catch (error) {
    console.error('获取权限列表失败详情:', error);
    ElMessage.error(error.message || '获取权限列表失败');
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
      permissions: permissions.map(p => p.id) // 使用权限ID
    });
    
    roleDialogVisible.value = true;
    
    if (roleFormRef.value) {
      roleFormRef.value.clearValidate();
    }
  } catch (error) {
    ElMessage.error(error.message || '获取角色详情失败');
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
            throw new Error(updateResponse.message || '更新角色基本信息失败');
          }
          
          // 更新权限
          const permissionResponse = await roleApi.setRolePermissions(currentRole.id, currentRole.permissions);
          if (permissionResponse.code !== 200 || !permissionResponse.success) {
            throw new Error(permissionResponse.message || '设置角色权限失败');
          }
          
          ElMessage.success(`角色 ${currentRole.name} 更新成功！`);
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
            throw new Error(response.message || '创建角色失败');
          }
          
          ElMessage.success(`角色 ${currentRole.name} 添加成功！`);
        }
        
        roleDialogVisible.value = false;
        getRoleList(); // 重新加载角色列表
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
 * 处理删除角色操作
 */
const handleDeleteRole = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗？此操作不可逆！`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    loading.value = true;
    const response = await roleApi.deleteRole(row.id);
    if (response.code === 200 && response.success) {
      ElMessage.success(`角色 ${row.name} 删除成功！`);
      getRoleList(); // 重新加载角色列表
    } else {
      throw new Error(response.message || '删除角色失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除角色失败');
    } else {
      ElMessage.info('已取消删除操作。');
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
 * 处理当前页码变化
 */
const handleCurrentChange = (val) => {
  pagination.page = val;
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
  text-align: center !important;
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