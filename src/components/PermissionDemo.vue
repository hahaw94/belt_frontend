<template>
  <div class="permission-demo">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>权限系统演示</span>
          <el-button type="primary" @click="refreshPermissions">刷新权限</el-button>
        </div>
      </template>
      
      <!-- 当前用户信息 -->
      <div class="user-info">
        <h4>当前用户信息</h4>
        <p><strong>用户名：</strong>{{ userInfo?.username || '未登录' }}</p>
        <p><strong>是否超级管理员：</strong>{{ isSuperAdmin ? '是' : '否' }}</p>
        <p><strong>权限数量：</strong>{{ userPermissions.length }}</p>
      </div>

      <!-- 用户权限列表 -->
      <div class="permissions-list">
        <h4>用户权限列表</h4>
        <div v-if="userPermissions.length > 0" class="permission-tags">
          <el-tag 
            v-for="permission in userPermissions" 
            :key="permission.id || permission"
            type="success"
            class="permission-tag"
          >
            {{ getPermissionDisplay(permission) }}
          </el-tag>
        </div>
        <el-empty v-else description="暂无权限" />
      </div>

      <!-- 菜单权限测试 -->
      <div class="menu-test">
        <h4>菜单权限测试</h4>
        <el-table :data="menuTestData" border style="width: 100%">
          <el-table-column prop="path" label="菜单路径" width="200" />
          <el-table-column prop="title" label="菜单名称" width="150" />
          <el-table-column prop="requiredPermissions" label="所需权限" width="200">
            <template #default="{ row }">
              <el-tag 
                v-for="perm in row.requiredPermissions" 
                :key="perm"
                size="small"
                class="perm-tag"
              >
                {{ perm }}
              </el-tag>
              <span v-if="row.requiredPermissions.length === 0" class="no-permission">无需权限</span>
            </template>
          </el-table-column>
          <el-table-column prop="hasAccess" label="访问权限" width="100">
            <template #default="{ row }">
              <el-tag :type="row.hasAccess ? 'success' : 'danger'">
                {{ row.hasAccess ? '有权限' : '无权限' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 权限检查工具 -->
      <div class="permission-checker">
        <h4>权限检查工具</h4>
        <div class="checker-form">
          <el-input
            v-model="testPermission"
            placeholder="输入权限标识进行测试"
            class="permission-input"
          >
            <template #append>
              <el-button @click="checkTestPermission">检查权限</el-button>
            </template>
          </el-input>
          <div v-if="testResult !== null" class="test-result">
            <el-alert
              :title="testResult ? '有权限' : '无权限'"
              :type="testResult ? 'success' : 'error'"
              :description="`权限 '${testPermission}' ${testResult ? '检查通过' : '检查失败'}`"
              show-icon
            />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usePermissions } from '@/composables/usePermissions'
import { useAuthStore } from '@/stores/auth'
import { MENU_PERMISSIONS, MENU_TITLES } from '@/utils/menu-permissions'

export default {
  name: 'PermissionDemo',
  setup() {
    const authStore = useAuthStore()
    const { 
      userPermissions, 
      isSuperAdmin, 
      checkMenuPermission, 
      hasPermission 
    } = usePermissions()
    
    const testPermission = ref('')
    const testResult = ref(null)
    
    // 用户信息
    const userInfo = computed(() => authStore.userInfo)
    
    // 菜单测试数据
    const menuTestData = computed(() => {
      return Object.keys(MENU_PERMISSIONS).map(path => {
        const requiredPermissions = MENU_PERMISSIONS[path]
        const hasAccess = checkMenuPermission(path)
        
        return {
          path,
          title: MENU_TITLES[path] || '未知菜单',
          requiredPermissions,
          hasAccess
        }
      })
    })
    
    // 获取权限显示文本
    const getPermissionDisplay = (permission) => {
      if (typeof permission === 'string') {
        return permission
      }
      if (permission.permission_name) {
        return `${permission.permission_name} (${permission.permission_code || permission.id})`
      }
      return permission.permission_code || permission.id || '未知权限'
    }
    
    // 检查测试权限
    const checkTestPermission = () => {
      if (!testPermission.value.trim()) {
        testResult.value = null
        return
      }
      testResult.value = hasPermission(testPermission.value.trim())
    }
    
    // 刷新权限
    const refreshPermissions = async () => {
      try {
        await authStore.getCurrentUserInfo()
        console.log('权限已刷新')
      } catch (error) {
        console.error('刷新权限失败:', error)
      }
    }
    
    onMounted(() => {
      console.log('权限演示组件已加载')
      console.log('当前用户权限:', userPermissions.value)
    })
    
    return {
      userInfo,
      userPermissions,
      isSuperAdmin,
      menuTestData,
      testPermission,
      testResult,
      getPermissionDisplay,
      checkTestPermission,
      refreshPermissions
    }
  }
}
</script>

<style scoped>
.permission-demo {
  padding: 20px;
}

.demo-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info,
.permissions-list,
.menu-test,
.permission-checker {
  margin-bottom: 30px;
}

.user-info h4,
.permissions-list h4,
.menu-test h4,
.permission-checker h4 {
  color: #409EFF;
  margin-bottom: 15px;
  border-bottom: 2px solid #409EFF;
  padding-bottom: 5px;
}

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-tag {
  margin-bottom: 5px;
}

.perm-tag {
  margin-right: 4px;
  margin-bottom: 2px;
}

.no-permission {
  color: #909399;
  font-style: italic;
}

.checker-form {
  max-width: 500px;
}

.permission-input {
  margin-bottom: 15px;
}

.test-result {
  margin-top: 10px;
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .demo-card {
    background-color: #2d3748;
    border-color: #4a5568;
  }
  
  .user-info h4,
  .permissions-list h4,
  .menu-test h4,
  .permission-checker h4 {
    color: #63b3ed;
    border-bottom-color: #63b3ed;
  }
}
</style>
