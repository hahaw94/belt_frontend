<template>
  <div class="role-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            添加角色
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="角色名称">
            <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 角色列表 -->
      <el-table v-loading="loading" :data="roleList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="description" label="角色描述" />
        <el-table-column prop="permissions" label="权限" width="300">
          <template #default="scope">
            <el-tag v-for="permission in scope.row.permissions.slice(0, 3)" :key="permission" size="small" style="margin-right: 5px;">
              {{ permission }}
            </el-tag>
            <el-tag v-if="scope.row.permissions.length > 3" size="small" type="info">
              +{{ scope.row.permissions.length - 3 }}个权限
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_default" label="默认角色" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_default ? 'success' : 'info'" size="small">
              {{ scope.row.is_default ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="editRole(scope.row)">编辑</el-button>
            <el-button type="info" size="small" @click="viewPermissions(scope.row)">权限</el-button>
            <el-button 
              v-if="!scope.row.is_default" 
              type="danger" 
              size="small" 
              @click="deleteRole(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加角色' : '编辑角色'"
      width="500px"
    >
      <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input 
            v-model="roleForm.description" 
            type="textarea" 
            placeholder="请输入角色描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="权限配置" prop="permissions">
          <el-checkbox-group v-model="roleForm.permissions">
            <el-checkbox v-for="permission in availablePermissions" :key="permission.value" :label="permission.value">
              {{ permission.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRole" :loading="saving">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 权限详情对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="权限详情" width="400px">
      <div class="permission-list">
        <el-tag v-for="permission in selectedRole.permissions" :key="permission" style="margin: 5px;">
          {{ permission }}
        </el-tag>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="RoleManagement">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const dialogType = ref('add') // 'add' or 'edit'
const roleFormRef = ref(null)

// 搜索表单
const searchForm = reactive({
  name: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 角色列表数据
const roleList = ref([])

// 角色表单
const roleForm = reactive({
  id: null,
  name: '',
  description: '',
  permissions: []
})

// 表单验证规则
const roleRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
  permissions: [{ required: true, message: '请选择权限', trigger: 'change' }]
}

// 可用权限列表
const availablePermissions = ref([
  { label: '用户管理', value: 'UserManagement' },
  { label: '设备管理', value: 'DeviceManagement' },
  { label: '算法配置', value: 'AlgorithmConfig' },
  { label: '实时检测', value: 'Detection' },
  { label: '事件中心', value: 'EventCenter' },
  { label: '系统配置', value: 'SystemConfig' },
  { label: '日志管理', value: 'LogManagement' },
  { label: '统计分析', value: 'StatisticsAnalysis' }
])

// 选中的角色（用于查看权限）
const selectedRole = ref({})

// 加载角色列表
const loadRoleList = async () => {
  loading.value = true
  try {
    // TODO: 调用实际的API
    // const response = await roleApi.getRoleList({
    //   page: pagination.page,
    //   page_size: pagination.pageSize,
    //   name: searchForm.name
    // })
    
    // 模拟数据
    const mockData = {
      roles: [
        {
          id: 1,
          name: '管理员',
          description: '系统管理员，拥有所有权限',
          permissions: ['UserManagement', 'DeviceManagement', 'AlgorithmConfig', 'Detection', 'EventCenter', 'SystemConfig'],
          is_default: true
        },
        {
          id: 2,
          name: '操作员',
          description: '普通操作员，可自定义权限',
          permissions: ['DeviceManagement', 'Detection'],
          is_default: true
        },
        {
          id: 3,
          name: '设备管理员',
          description: '专门负责设备管理的操作员',
          permissions: ['DeviceManagement', 'AlgorithmConfig'],
          is_default: false
        }
      ],
      total: 3
    }
    
    roleList.value = mockData.roles
    pagination.total = mockData.total
  } catch (error) {
    ElMessage.error('加载角色列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadRoleList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  pagination.page = 1
  loadRoleList()
}

// 分页大小改变
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.page = 1
  loadRoleList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  pagination.page = val
  loadRoleList()
}

// 显示添加对话框
const showAddDialog = () => {
  dialogType.value = 'add'
  resetRoleForm()
  dialogVisible.value = true
}

// 编辑角色
const editRole = (role) => {
  dialogType.value = 'edit'
  roleForm.id = role.id
  roleForm.name = role.name
  roleForm.description = role.description
  roleForm.permissions = [...role.permissions]
  dialogVisible.value = true
}

// 查看权限
const viewPermissions = (role) => {
  selectedRole.value = role
  permissionDialogVisible.value = true
}

// 删除角色
const deleteRole = async (role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${role.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用实际的API
    // await roleApi.deleteRole(role.id)
    
    ElMessage.success('删除成功')
    loadRoleList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 保存角色
const saveRole = async () => {
  if (!roleFormRef.value) return
  
  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      try {
        if (dialogType.value === 'add') {
          // TODO: 调用添加API
          // await roleApi.addRole(roleForm)
          ElMessage.success('添加成功')
        } else {
          // TODO: 调用更新API
          // await roleApi.updateRole(roleForm.id, roleForm)
          ElMessage.success('更新成功')
        }
        
        dialogVisible.value = false
        loadRoleList()
      } catch (error) {
        ElMessage.error('保存失败')
      } finally {
        saving.value = false
      }
    }
  })
}

// 重置表单
const resetRoleForm = () => {
  roleForm.id = null
  roleForm.name = ''
  roleForm.description = ''
  roleForm.permissions = []
}

onMounted(() => {
  loadRoleList()
})
</script>

<style scoped>
.role-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.permission-list {
  min-height: 100px;
}

.permission-list .el-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style> 