<template>
  <div class="user-management-integrated-container tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background">
    </div>
    
    <h2>{{ $t('user.user.title') }}</h2>

    <el-card class="user-list-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ $t('user.user.title') }}</span>
          <div>
            <el-button type="success" :icon="Plus" size="small" class="tech-button-sm" @click="handleAddUser">{{ $t('user.user.addUser') }}</el-button>
            <el-button type="warning" :icon="Upload" size="small" class="tech-button-sm" @click="handleBatchCreateUser">{{ $t('common.batch') }}{{ $t('user.user.addUser') }}</el-button>
            <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="getUsers">{{ $t('common.refresh') }}</el-button>
          </div>
        </div>
      </template>

      <!-- 用户搜索和筛选 -->
      <div class="search-filters-card tech-card mb-20">
        <div class="search-filters-header">
          <span class="filter-title">{{ $t('common.search') }}{{ $t('common.filter') }}</span>
        </div>
        <div class="search-filters-content">
          <div class="filter-row">
            <div class="filter-item">
              <label for="userNameFilter">{{ $t('user.user.username') }}</label>
              <el-input
                v-model="searchFilters.username"
                id="userNameFilter"
                :placeholder="$t('common.search') + $t('user.user.username')"
                class="tech-input"
                clearable
                @keyup.enter="searchUsers"
                @clear="searchUsers"
              />
            </div>
            <div class="filter-item">
              <label for="userEmailFilter">{{ $t('user.user.email') }}</label>
              <el-input
                v-model="searchFilters.email"
                id="userEmailFilter"
                :placeholder="$t('common.search') + $t('user.user.email')"
                class="tech-input"
                clearable
                @keyup.enter="searchUsers"
                @clear="searchUsers"
              />
            </div>
            <div class="filter-item">
              <label for="userStatusFilter">{{ $t('user.user.status') }}</label>
              <el-select
                v-model="searchFilters.status"
                id="userStatusFilter"
                :placeholder="$t('common.all')"
                class="tech-select"
                clearable
                @change="searchUsers"
              >
                <el-option :label="$t('common.all')" value="" />
                <el-option :label="$t('user.user.normal')" value="1" />
                <el-option :label="$t('user.user.locked')" value="2" />
              </el-select>
            </div>
            <div class="filter-actions">
              <el-button type="primary" :icon="Search" class="tech-button-sm" @click="searchUsers">{{ $t('common.search') }}</el-button>
              <el-button :icon="RefreshRight" class="tech-button-sm" @click="resetUserFilters">{{ $t('common.reset') }}</el-button>
            </div>
          </div>
        </div>
      </div>

      <el-table :data="paginatedUsers" v-loading="loading" border stripe class="tech-table" style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80" align="center" header-align="center"></el-table-column>
        <el-table-column prop="username" :label="$t('user.user.username')" min-width="120" header-align="center"></el-table-column>
        <el-table-column prop="email" :label="$t('user.user.email')" min-width="150" header-align="center"></el-table-column>
        <el-table-column prop="roles" :label="$t('user.user.roles')" min-width="200" header-align="center">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.id"
              size="small"
              style="margin-right: 4px; margin-bottom: 2px;"
            >
              {{ role.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('user.user.status')" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('user.user.createTime')" width="180" header-align="center"></el-table-column>
        <el-table-column prop="lastLogin" :label="$t('user.user.lastLogin')" width="180" header-align="center"></el-table-column>
        <el-table-column :label="$t('common.operations')" width="240" align="center" header-align="center">
          <template #default="{ row }">
            <el-button type="primary" :icon="Edit" size="small" class="tech-button-xs" @click="handleEditUser(row)">{{ $t('common.edit') }}</el-button>
            <el-button 
              :type="row.status === 1 ? 'warning' : 'success'" 
              :icon="row.status === 1 ? CircleClose : Select" 
              size="small" 
              class="tech-button-xs"
              @click="toggleUserStatus(row)"
              :disabled="row.status === 0"
            >
              {{ getStatusActionText(row.status) }}
            </el-button>
            <el-button type="danger" :icon="Delete" size="small" class="tech-button-xs" @click="handleDeleteUser(row)">{{ $t('common.delete') }}</el-button>
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
            @click="goToUserPage(1)"
          >
            {{ $t('common.firstPage') }}
          </el-button>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === 1 || loading"
            @click="goToUserPage(pagination.page - 1)"
          >
            {{ $t('common.prevPage') }}
          </el-button>
          <div class="pagination-pages">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              class="page-btn"
              :class="{ active: page === pagination.page }"
              @click="goToUserPage(page)"
              :disabled="loading"
            >
              {{ page }}
            </button>
          </div>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === totalUserPages || loading"
            @click="goToUserPage(pagination.page + 1)"
          >
            {{ $t('common.nextPage') }}
          </el-button>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === totalUserPages || loading"
            @click="goToUserPage(totalUserPages)"
          >
            {{ $t('common.lastPage') }}
          </el-button>
        </div>
      </div>
    </el-card>

    <el-dialog
        v-model="userDialogVisible"
        :title="isEditMode ? $t('user.user.editUser') : $t('user.user.addUser')"
        width="600px"
        :close-on-click-modal="false"
        destroy-on-close
        class="tech-dialog user-form-dialog"
        :style="{
          '--el-dialog-bg-color': 'rgba(45, 55, 75, 0.92)',
          '--el-dialog-header-bg-color': 'rgba(45, 55, 75, 0.92)',
          '--el-dialog-content-bg-color': 'rgba(45, 55, 75, 0.92)'
        }"
    >
      <el-form :model="currentUser" :rules="userRules" ref="userFormRef" label-width="100px">
        <el-form-item :label="$t('user.user.username')" prop="username">
          <el-input 
            v-model="currentUser.username" 
            :disabled="isEditMode" 
            :placeholder="$t('user.user.pleaseInputUsername')"
            style="--el-input-bg-color: rgba(65, 75, 95, 0.85); --el-input-border-color: rgba(0, 255, 255, 0.4); --el-input-text-color: rgba(255, 255, 255, 0.95);"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('user.user.email')" prop="email">
          <el-input 
            v-model="currentUser.email" 
            :placeholder="$t('user.user.pleaseInputEmail')"
            style="--el-input-bg-color: rgba(65, 75, 95, 0.85); --el-input-border-color: rgba(0, 255, 255, 0.4); --el-input-text-color: rgba(255, 255, 255, 0.95);"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('user.user.phone')" prop="phone">
          <el-input 
            v-model="currentUser.phone" 
            :placeholder="$t('user.user.pleaseInputPhone')"
            style="--el-input-bg-color: rgba(65, 75, 95, 0.85); --el-input-border-color: rgba(0, 255, 255, 0.4); --el-input-text-color: rgba(255, 255, 255, 0.95);"
          ></el-input>
        </el-form-item>
        <!-- 编辑模式下的密码重置选项 -->
        <el-form-item v-if="isEditMode" :label="$t('user.user.passwordReset')">
          <el-checkbox v-model="passwordResetMode" @change="onPasswordResetModeChange">
            {{ $t('user.user.resetToOriginalPassword') }}
          </el-checkbox>
          <div class="form-hint" v-if="passwordResetMode">
            {{ $t('user.user.resetPasswordHint') }}
          </div>
        </el-form-item>
        <div v-if="!isEditMode" class="password-notice">
          <el-alert
            :title="$t('user.user.passwordNotice')"
            :description="$t('user.user.passwordNoticeDesc')"
            type="info"
            :closable="false"
            show-icon
          />
        </div>
        <el-form-item :label="$t('user.user.assignRoles')" prop="roleIds">
          <el-select
            v-model="currentUser.roleIds"
            multiple
            :placeholder="$t('user.user.pleaseSelectRoles')"
            style="width: 100%; --el-select-input-bg-color: rgba(45, 55, 75, 0.8); --el-border-color: rgba(0, 255, 255, 0.3); --el-text-color-regular: rgba(255, 255, 255, 0.95);"
          >
            <el-option
              v-for="role in availableRoles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            >
              {{ role.name }} - {{ role.description }}
            </el-option>
          </el-select>
          <div class="form-hint">
            {{ isEditMode ? $t('user.user.canModifyRoles') : $t('user.user.mustAssignRole') }}
          </div>
        </el-form-item>
        <el-form-item :label="$t('user.user.remark')" prop="description">
          <el-input 
            v-model="currentUser.description" 
            type="textarea" 
            :rows="3"
            :placeholder="$t('user.user.pleaseInputRemark')"
            style="--el-input-bg-color: rgba(65, 75, 95, 0.85); --el-input-border-color: rgba(0, 255, 255, 0.4); --el-input-text-color: rgba(255, 255, 255, 0.95);"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="submitUserForm" :loading="loading">{{ $t('common.save') }}</el-button>
        </span>
      </template>
    </el-dialog>



    <!-- 批量创建用户对话框 -->
    <el-dialog
      v-model="batchCreateDialogVisible"
      title="批量创建用户"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
      class="tech-dialog batch-create-dialog"
      :style="{
        '--el-dialog-bg-color': 'rgba(45, 55, 75, 0.92)',
        '--el-dialog-header-bg-color': 'rgba(45, 55, 75, 0.92)',
        '--el-dialog-content-bg-color': 'rgba(45, 55, 75, 0.92)'
      }"
    >
      <div class="batch-create-container">
        <!-- 功能选择选项卡 -->
        <el-tabs v-model="batchCreateActiveTab" class="tech-tabs">
          <el-tab-pane label="手动输入" name="manual">
            <div class="manual-input-section">
              <div class="format-description">
                <h4>用户列表 (每行一个用户)</h4>
                <div class="format-info">
                  <p><strong>格式说明：</strong> 用户名,邮箱,手机号,角色代码 （邮箱和手机号可为空，角色代码必填）</p>
                  <div class="available-roles">
                    <p><strong>可用角色代码：</strong></p>
                    <div class="roles-list">
                      <span 
                        v-for="role in availableRoles" 
                        :key="role.id" 
                        class="role-item"
                        :title="role.description"
                      >
                        {{ role.role_code || role.code }}（{{ role.role_name || role.name }}）
                      </span>
                    </div>
                  </div>
                  <p><strong>多个角色用分号分隔，如：</strong> admin;operator</p>
                  <p><strong>系统将自动生成随机密码并在创建成功后显示</strong></p>
                </div>
                <div class="format-examples">
                  <p><strong>例如：</strong></p>
                  <p v-if="availableRoles.length >= 1">user1, user1@email.com, 13800138001, {{ availableRoles[0].role_code || availableRoles[0].code }}</p>
                  <p v-if="availableRoles.length >= 2">user2, user2@email.com, 13800138002, {{ availableRoles[0].role_code || availableRoles[0].code }};{{ availableRoles[1].role_code || availableRoles[1].code }}</p>
                  <p v-if="availableRoles.length >= 1">user3, , 13800138003, {{ availableRoles[0].role_code || availableRoles[0].code }}</p>
                </div>
              </div>
              <el-input
                v-model="batchUserText"
                type="textarea"
                :rows="12"
                placeholder="请按照格式输入用户信息，每行一个用户..."
                class="batch-input-area"
                style="--el-input-bg-color: rgba(65, 75, 95, 0.85); --el-input-border-color: rgba(0, 255, 255, 0.4); --el-input-text-color: rgba(255, 255, 255, 0.95);"
              ></el-input>
            </div>
          </el-tab-pane>
          <el-tab-pane label="文件上传" name="upload">
            <div class="upload-section">
              <div class="upload-header">
                <el-button 
                  type="info" 
                  :icon="Download" 
                  size="small" 
                  class="tech-button-sm" 
                  @click="downloadTemplate"
                  :loading="downloadingTemplate"
                >
                  下载模板
                </el-button>
                <div class="upload-tips">
                  <p>支持 CSV 和 Excel 文件格式，文件大小不超过 10MB</p>
                  <p>文件格式：用户名、邮箱、手机号、角色代码（支持多角色用分号分隔）</p>
                </div>
              </div>
              <el-upload
                ref="fileUploadRef"
                class="upload-demo tech-upload"
                drag
                action="#"
                :auto-upload="false"
                :show-file-list="true"
                :limit="1"
                :on-change="handleFileChange"
                :before-upload="beforeFileUpload"
                accept=".csv,.xls,.xlsx"
              >
                <el-icon class="el-icon--upload"><Upload /></el-icon>
                <div class="el-upload__text">
                  将文件拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    只能上传 CSV/Excel 文件，且不超过 10MB
                  </div>
                </template>
              </el-upload>
              
              <!-- 文件解析预览 -->
              <div v-if="parsedUsers.length > 0" class="file-preview-section">
                <el-divider content-position="left">文件预览</el-divider>
                <div class="preview-summary">
                  <el-tag type="info" size="large">共解析到 {{ parsedUsers.length }} 个用户</el-tag>
                </div>
                <div class="preview-table-container">
                  <el-table :data="parsedUsers.slice(0, 10)" border stripe class="tech-table preview-table" style="width: 100%;">
                    <el-table-column prop="username" label="用户名" min-width="120" header-align="center"></el-table-column>
                    <el-table-column prop="email" label="邮箱" min-width="150" header-align="center">
                      <template #default="{ row }">
                        {{ row.email || '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="phone" label="手机号" width="120" header-align="center">
                      <template #default="{ row }">
                        {{ row.phone || '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="role_codes" label="角色代码" min-width="150" header-align="center">
                      <template #default="{ row }">
                        <el-tag
                          v-for="roleCode in row.role_codes"
                          :key="roleCode"
                          size="small"
                          style="margin-right: 4px; margin-bottom: 2px;"
                        >
                          {{ roleCode }}
                        </el-tag>
                      </template>
                    </el-table-column>
                  </el-table>
                  <div v-if="parsedUsers.length > 10" class="preview-more-tip">
                    <el-text type="info">仅显示前10条数据，共 {{ parsedUsers.length }} 条</el-text>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 结果显示区域 -->
        <div v-if="batchCreateResult" class="result-section">
          <el-divider content-position="left">创建结果</el-divider>
          <div class="result-summary">
            <el-tag type="info" size="large">总计: {{ batchCreateResult.total }}</el-tag>
            <el-tag type="success" size="large">成功: {{ batchCreateResult.success }}</el-tag>
            <el-tag type="danger" size="large">失败: {{ batchCreateResult.failed }}</el-tag>
          </div>
          <div class="result-details">
            <el-table :data="batchCreateResult.details" border stripe class="tech-table" style="width: 100%;">
              <el-table-column prop="row" label="行号" width="80" align="center"></el-table-column>
              <el-table-column prop="username" label="用户名" min-width="120"></el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                    {{ row.status === 'success' ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="initial_password" label="初始密码" min-width="120">
                <template #default="{ row }">
                  <span v-if="row.initial_password">{{ row.initial_password }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="message" label="说明" min-width="200"></el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeBatchCreateDialog">取消</el-button>
          <el-button 
            type="primary" 
            @click="submitBatchCreate" 
            :loading="batchCreating"
            :disabled="!canSubmitBatch"
          >
            {{ batchCreateActiveTab === 'manual' ? '批量创建' : '上传并创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="UserManagementIntegrated">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh, Edit, CircleClose, Select, Delete, Upload, Download, Search, RefreshRight } from '@element-plus/icons-vue';
import { userApi, roleApi } from '@/api/user';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// ===================== 数据定义 =====================
const loading = ref(false); // 表格加载状态
const userDialogVisible = ref(false); // 控制添加/编辑用户弹窗的显示

const isEditMode = ref(false); // 是否是编辑模式
const passwordResetMode = ref(false); // 是否处于密码重置模式（编辑用户时可选择重置密码）

// 批量创建用户相关数据
const batchCreateDialogVisible = ref(false); // 控制批量创建用户弹窗的显示
const batchCreateActiveTab = ref('manual'); // 当前激活的选项卡：manual 或 upload
const batchUserText = ref(''); // 手动输入的用户文本
const batchCreateResult = ref(null); // 批量创建结果
const batchCreating = ref(false); // 批量创建中状态
const downloadingTemplate = ref(false); // 下载模板中状态
const selectedFile = ref(null); // 选中的文件
const fileUploadRef = ref(null); // 文件上传组件引用
const parsedUsers = ref([]); // 解析后的用户数据预览
const currentUser = reactive({
  id: null,
  username: '',
  email: '',
  phone: '',
  description: '',
  password: '',
  confirmPassword: '',
  roleIds: [], // 添加角色ID数组
  status: 1, // 默认正常状态：0=禁用，1=正常，2=锁定
  createTime: '',
  lastLogin: '',
});

// 角色数据
const availableRoles = ref([]);

// 用户数据
const userList = ref([]);

// 搜索筛选数据
const searchFilters = reactive({
  username: '',
  email: '',
  status: ''
});

// 分页数据（按照HTML版本的分页配置）
const pagination = reactive({
  page: 1,
  pageSize: 10, // 修复为10，与HTML版本保持一致，这样12条数据会分为2页
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
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的11位手机号码', trigger: 'blur' }
  ],
  roleIds: [
    { required: true, type: 'array', min: 1, message: '请至少选择一个角色', trigger: 'change' }
  ],

});




// ===================== Computed 属性 =====================
// 当前页用户数据（直接使用API返回的分页数据）
const paginatedUsers = computed(() => {
  return userList.value;
});

// 总页数（完全按照HTML版本的计算逻辑）
const totalUserPages = computed(() => {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize) || 1;
  
  // 调试信息
  console.log('========== 总页数计算 ==========');
  console.log('总数据量:', pagination.total);
  console.log('每页条数:', pagination.pageSize);
  console.log('计算的总页数:', totalPages);
  
  return totalPages;
});

// 可见页码（完全按照HTML版本的分页逻辑实现）
const visiblePages = computed(() => {
  const maxVisiblePages = 5;
  const totalPages = totalUserPages.value;
  const currentPage = pagination.page;
  
  console.log('========== 可见页码计算 ==========');
  console.log('总页数:', totalPages);
  console.log('当前页码:', currentPage);
  console.log('最大可见页数:', maxVisiblePages);
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // 调整起始页 - 与HTML版本保持一致
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  console.log('可见页码范围:', {
    startPage,
    endPage,
    pages
  });
  
  return pages;
});

// 是否可以提交批量创建
const canSubmitBatch = computed(() => {
  if (batchCreateActiveTab.value === 'manual') {
    return batchUserText.value.trim() !== '';
  } else {
    return selectedFile.value !== null && parsedUsers.value.length > 0;
  }
});

// ===================== 方法 =====================

/**
 * 获取用户列表（完全按照HTML版本的分页逻辑实现）
 */
const getUserList = async (page = pagination.page) => {
  try {
    loading.value = true;
    
    // 确保分页参数的正确性
    if (page < 1) page = 1;
    pagination.page = page;
    
    // 构建查询参数 - 完全按照HTML版本的参数格式
    const params = {
      page: page,
      size: pagination.pageSize
    };
    
    // 添加搜索筛选参数 - 修复类型不匹配问题
    if (searchFilters.username.trim()) {
      params.username = searchFilters.username.trim();
    }
    if (searchFilters.email.trim()) {
      params.email = searchFilters.email.trim();
    }
    if (searchFilters.status !== '' && searchFilters.status !== null && searchFilters.status !== undefined) {
      // 确保status参数为数字类型，符合后端期望
      const statusValue = parseInt(searchFilters.status);
      if (!isNaN(statusValue)) {
        params.status = statusValue;
        console.log('状态搜索参数:', {
          原始值: searchFilters.status,
          转换后: params.status,
          类型: typeof params.status
        });
      }
       }
    
    console.log('========== 用户分页API调用 ==========');
    console.log('请求参数:', params);
    console.log('当前页码:', page);
    console.log('每页大小:', pagination.pageSize);
    console.log('期望总数据: 12条');
    
    const response = await userApi.getUserList(params);
    
    console.log('========== API响应分析 ==========');
    console.log('完整响应:', response);
    console.log('数据列表长度:', response.data?.length);
    console.log('分页信息:');
    console.log('  total:', response.total);
    console.log('  page:', response.page);
    console.log('  size:', response.size);
    
    if (response.code === 200 && response.success) {
      const userListData = response.data || [];
      
      // 处理用户数据 - 与HTML版本保持一致的数据处理
      const processedUsers = Array.isArray(userListData) ? userListData.map(user => ({
        ...user,
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        createTime: user.create_time ? new Date(user.create_time).toLocaleString('zh-CN') : new Date().toLocaleString('zh-CN'),
        lastLogin: user.last_login_at ? new Date(user.last_login_at).toLocaleString('zh-CN') : '从未登录',
        status: user.status, // 保持原始数字状态值：0=禁用，1=正常，2=锁定
        roles: (user.roles || []).map(role => ({
          ...role,
          id: role.id,
          name: role.role_name || role.name,
          description: role.description
        }))
      })) : [];
      
      // 更新数据和分页信息 - 按照HTML版本的逻辑
      userList.value = processedUsers;
      pagination.total = response.total || 0;
      pagination.page = response.page || page;
      
      // 计算总页数 - 与HTML版本保持一致
      const calculatedTotalPages = Math.ceil(pagination.total / pagination.pageSize) || 1;
      
      console.log('========== 分页数据更新结果 ==========');
      console.log('当前页数据量:', processedUsers.length);
      console.log('总数据量:', pagination.total);
      console.log('当前页码:', pagination.page);
      console.log('每页大小:', pagination.pageSize);
      console.log('计算的总页数:', calculatedTotalPages);
      console.log('当前是否在第二页:', pagination.page === 2);
      
      // 如果是12条数据，每页10条，应该有2页
      if (pagination.total === 12 && pagination.pageSize === 10) {
        console.log('🔍 12条数据，每页10条的分页测试:');
        console.log('  第1页应显示: 10条数据');
        console.log('  第2页应显示: 2条数据');
        console.log('  当前页码:', pagination.page);
        console.log('  当前页数据量:', processedUsers.length);
        
        if (pagination.page === 2 && processedUsers.length === 0) {
          console.error('❌ 问题：第二页没有数据！可能的原因：');
          console.error('1. 后端分页逻辑问题');
          console.error('2. API参数传递问题');
          console.error('3. 数据库查询问题');
        } else if (pagination.page === 2 && processedUsers.length === 2) {
          console.log('✅ 正确：第二页显示了剩余的2条数据');
        }
      }
      
    } else {
      throw new Error(response.message || '获取用户列表失败');
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error(error.message || '获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 获取角色列表
 */
const getRoleList = async () => {
  try {
    console.log('正在获取可用角色列表...');
    // 获取所有角色，设置较大的size值确保获取所有可用角色
    const response = await roleApi.getRoleList({ page: 1, size: 100 });
    console.log('角色列表API响应:', response);
    
    if (response.code === 200 && response.success) {
      // 角色列表使用PageResponse格式：{code, message, data: [...], total, page, size}
      const roleListData = response.data || [];
      console.log('可用角色数据:', roleListData);
      
      // 处理角色数据字段映射
      const processedRoles = Array.isArray(roleListData) ? roleListData.map(role => ({
        ...role,
        id: role.id,
        name: role.role_name,
        role_name: role.role_name,
        code: role.role_code,
        role_code: role.role_code,
        description: role.description
      })) : [];
      
      availableRoles.value = processedRoles;
    } else {
      throw new Error(response.message || '获取角色列表失败');
    }
  } catch (error) {
    console.error('获取角色列表失败详情:', error);
    ElMessage.error(error.message || '获取角色列表失败');
  }
};

/**
 * 刷新用户列表
 */
const getUsers = () => {
  getUserList();
};



/**
 * 搜索用户（按照HTML版本的searchUsers实现）
 */
const searchUsers = () => {
  console.log('========== 搜索用户 ==========');
  console.log('搜索条件:', searchFilters);
  console.log('状态搜索详情:', {
    状态值: searchFilters.status,
    状态类型: typeof searchFilters.status,
    是否为空字符串: searchFilters.status === '',
    是否为null: searchFilters.status === null,
    是否为undefined: searchFilters.status === undefined
  });
  
  pagination.page = 1; // 重置到第一页 - 与HTML版本保持一致
  console.log('重置页码到第1页');
  
  getUserList(1);
};

/**
 * 重置用户筛选条件（按照HTML版本的resetUserFilters实现）
 */
const resetUserFilters = () => {
  console.log('========== 重置筛选条件 ==========');
  console.log('原筛选条件:', { ...searchFilters });
  
  searchFilters.username = '';
  searchFilters.email = '';
  searchFilters.status = '';
  pagination.page = 1;
  
  console.log('重置后筛选条件:', { ...searchFilters });
  console.log('重置页码到第1页');
  
  getUserList(1);
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
    description: '',
    roleIds: [], // 重置角色选择
    status: 1, // 默认正常状态
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
  
  // 复制数据，并设置角色ID数组
  const userRoleIds = (row.roles || []).map(role => role.id);
  Object.assign(currentUser, { 
    ...row, 
    roleIds: userRoleIds // 设置当前用户的角色ID数组
  });
  
  userDialogVisible.value = true;
  // 清除上次的表单验证
  if (userFormRef.value) {
    userFormRef.value.clearValidate();
  }
};

/**
 * 密码重置模式切换处理
 */
const onPasswordResetModeChange = () => {
  // 重置为初始密码模式不需要额外处理，只是一个开关
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
        const userData = currentUser;
        
        if (isEditMode.value) {
          // 编辑用户 - 需要处理用户信息更新、角色分配和密码重置
          let successMessages = [];
          
          // 1. 更新用户基本信息
          const { roleIds, ...updateData } = userData;
          const userUpdateResponse = await userApi.updateUser(currentUser.id, updateData);
          if (userUpdateResponse.code === 200 && userUpdateResponse.success) {
            successMessages.push('用户信息更新成功');
          } else {
            throw new Error(userUpdateResponse.message || '更新用户信息失败');
          }
          
          // 2. 更新角色分配
          if (roleIds && roleIds.length > 0) {
            const roleResponse = await roleApi.assignUserRole(currentUser.id, roleIds);
            if (roleResponse.code === 200 && roleResponse.success) {
              successMessages.push('角色分配成功');
            } else {
              throw new Error(roleResponse.message || '角色分配失败');
            }
          }
          
          // 3. 重置密码为初始密码（如果需要）
          if (passwordResetMode.value) {
            const passwordResponse = await userApi.resetPassword(currentUser.id);
            if (passwordResponse.code === 200 && passwordResponse.success) {
              successMessages.push('密码已重置为初始密码');
            } else {
              throw new Error(passwordResponse.message || '密码重置失败');
            }
          }
          
          ElMessage.success(`用户 ${currentUser.username} ${successMessages.join('，')}！`);
        } else {
          // 添加用户 - 添加调试信息
          // 添加用户 - 后端会自动生成初始密码
          const createUserData = {
            username: userData.username,
            email: userData.email,
            phone: userData.phone,
            roleIds: userData.roleIds // 确保角色ID数组正确传递
          };
          
          console.log('正在添加用户，提交数据:', createUserData);
          const response = await userApi.createUser(createUserData);
          console.log('添加用户API响应:', response);
          
          if (response.code === 200 && response.success) {
            const initialPassword = response.data.initial_password;
            ElMessage.success({
              message: `用户 ${currentUser.username} 添加成功！初始密码：${initialPassword}`,
              duration: 10000, // 显示10秒
              showClose: true
            });
            
            // 显示初始密码对话框
            ElMessageBox.alert(
              `用户创建成功！\n\n用户名：${currentUser.username}\n初始密码：${initialPassword}\n\n请妥善保管初始密码，并提醒用户首次登录后修改密码。`,
              '用户创建成功',
              {
                confirmButtonText: '我已记录',
                type: 'success'
              }
            );
          } else {
            throw new Error(response.message || '添加用户失败');
          }
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
 * 切换用户状态 (正常/锁定)
 * @param {Object} row - 当前行用户数据
 */
const toggleUserStatus = async (row) => {
  // 状态值：0=禁用，1=正常，2=锁定
  // 只能在正常(1)和锁定(2)之间切换，禁用(0)状态不可操作
  if (row.status === 0) {
    ElMessage.warning('禁用状态的用户无法进行锁定/解锁操作');
    return;
  }
  
  const isLock = row.status === 1; // 正常状态可以锁定
  const action = isLock ? '锁定' : '解锁';
  
  try {
    await ElMessageBox.confirm(`确定要${action}用户 "${row.username}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    loading.value = true;
    let response;
    if (isLock) {
      response = await userApi.lockUser(row.id, '管理员操作');
    } else {
      response = await userApi.unlockUser(row.id);
    }
    
    if (response.code === 200 && response.success) {
      ElMessage.success(`用户 ${row.username} 已${action}！`);
      getUserList(); // 重新加载用户列表
    } else {
      throw new Error(response.message || `${action}操作失败`);
    }
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
    const response = await userApi.deleteUser(row.id);
    if (response.code === 200 && response.success) {
      ElMessage.success(`用户 ${row.username} 删除成功！`);
      
      // 检查当前页是否为空，如果为空且不是第一页，则跳转到上一页
      if (userList.value.length === 1 && pagination.page > 1) {
        pagination.page--;
      }
      
      getUserList(); // 重新加载用户列表
    } else {
      throw new Error(response.message || '删除用户失败');
    }
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
 * 处理每页显示条数变化（按照HTML版本的changeUsersPageSize实现）
 * @param {number} val - 新的每页条数
 */
const handleSizeChange = (val) => {
  console.log('========== 每页条数变化 ==========');
  console.log('原每页条数:', pagination.pageSize);
  console.log('新每页条数:', val);
  console.log('原页码:', pagination.page);
  
  pagination.pageSize = parseInt(val);
  pagination.page = 1; // 重置到第一页 - 与HTML版本保持一致
  
  console.log('更新后每页条数:', pagination.pageSize);
  console.log('重置页码到:', pagination.page);
  
  getUserList(1);
};



/**
 * 跳转到指定页面（完全按照HTML版本的goToUserPage实现）
 * @param {number} page - 目标页码
 */
const goToUserPage = (page) => {
  console.log('========== 页码跳转 ==========');
  console.log('目标页码:', page);
  console.log('当前页码:', pagination.page);
  console.log('总页数:', totalUserPages.value);
  console.log('是否正在加载:', loading.value);
  
  // 页码验证 - 与HTML版本保持一致
  if (page < 1 || page > totalUserPages.value || page === pagination.page || loading.value) {
    console.log('页码跳转被阻止 - 原因:', {
      pageInvalid: page < 1,
      pageExceedsMax: page > totalUserPages.value,
      sameAsCurrentPage: page === pagination.page,
      isLoading: loading.value
    });
    return;
  }
  
  console.log('✅ 执行页码跳转到第', page, '页');
  getUserList(page);
};





/**
 * 处理批量创建用户按钮点击
 */
const handleBatchCreateUser = async () => {
  // 确保角色列表是最新的
  await getRoleList();
  
  batchCreateDialogVisible.value = true;
  batchCreateActiveTab.value = 'manual';
  batchUserText.value = '';
  batchCreateResult.value = null;
  selectedFile.value = null;
  parsedUsers.value = [];
  if (fileUploadRef.value) {
    fileUploadRef.value.clearFiles();
  }
};

/**
 * 关闭批量创建对话框
 */
const closeBatchCreateDialog = () => {
  batchCreateDialogVisible.value = false;
  batchCreateActiveTab.value = 'manual';
  batchUserText.value = '';
  batchCreateResult.value = null;
  selectedFile.value = null;
  parsedUsers.value = [];
  if (fileUploadRef.value) {
    fileUploadRef.value.clearFiles();
  }
};

/**
 * 下载用户导入模板
 */
const downloadTemplate = async () => {
  try {
    downloadingTemplate.value = true;
    
    // 获取可用角色代码列表
    const roleList = availableRoles.value.map(role => {
      const roleCode = role.role_code || role.code;
      const roleName = role.role_name || role.name;
      return `${roleCode}（${roleName}）`;
    }).join('、');
    
    // 构建带说明的模板内容
    const templateContent = `# 批量创建用户导入模板
# 
# 使用说明：
# 1. 请保留第一行标题行
# 2. 从第二行开始填写用户数据，每行一个用户
# 3. 用户名必填，长度3-50个字符
# 4. 邮箱和手机号可选，邮箱需符合格式要求，手机号需11位数字且以1开头
# 5. 角色代码必填，多个角色用分号分隔（如：admin;operator）
# 6. 可用角色代码：${roleList || 'admin（管理员）、operator（操作员）、root（超级管理员）'}
# 7. 以#开头的行为注释行，系统会自动忽略
# 8. 系统将为每个用户自动生成初始密码
用户名,邮箱,手机号,角色代码
zhangsan1,zhangsan@example.com,13800138001,operator
lisi1,lisi@example.com,13800138002,admin;operator
wangwu1,wangwu@example.com,13800138003,root
testuser1,,13800138005,operator
testuser2,test@example.com,,admin`;
    
    // 添加BOM头解决中文乱码问题
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + templateContent;
    
    // 创建下载链接
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    ElMessage.success('模板下载成功！请查看文件中的详细使用说明');
  } catch (error) {
    console.error('下载模板失败:', error);
    ElMessage.error('下载模板失败');
  } finally {
    downloadingTemplate.value = false;
  }
};

/**
 * 文件上传前验证
 */
const beforeFileUpload = (file) => {
  const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel' ||
                  file.name.endsWith('.xlsx') || 
                  file.name.endsWith('.xls');
  
  if (!isCSV && !isExcel) {
    ElMessage.error('只能上传 CSV 或 Excel 文件！');
    return false;
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB！');
    return false;
  }
  
  return false; // 阻止自动上传
};

/**
 * 文件变化处理
 */
const handleFileChange = async (file) => {
  selectedFile.value = file.raw;
  parsedUsers.value = [];
  console.log('选择的文件:', file.name);
  
  // 自动解析文件内容进行预览
  try {
    const users = await parseFileContent(file.raw);
    parsedUsers.value = users;
    console.log('解析的用户数据:', users);
    ElMessage.success(`文件解析成功，共发现 ${users.length} 个用户`);
  } catch (error) {
    console.error('文件解析失败:', error);
    ElMessage.error('文件解析失败: ' + error.message);
    selectedFile.value = null;
    parsedUsers.value = [];
    if (fileUploadRef.value) {
      fileUploadRef.value.clearFiles();
    }
  }
};

/**
 * 解析文件内容（支持 CSV 和 Excel）
 */
const parseFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      // 解析 CSV 文件
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        complete: (results) => {
          try {
            const users = parseUserData(results.data);
            resolve(users);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(new Error('CSV 文件解析失败: ' + error.message));
        }
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // 解析 Excel 文件
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const users = parseUserData(jsonData);
          resolve(users);
        } catch (error) {
          reject(new Error('Excel 文件解析失败: ' + error.message));
        }
      };
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('不支持的文件格式'));
    }
  });
};

/**
 * 解析用户数据（统一处理 CSV 和 Excel 解析后的数组数据）
 */
const parseUserData = (data) => {
  if (!data || data.length === 0) {
    throw new Error('文件内容为空');
  }
  
  const users = [];
  // 获取可用的角色代码列表
  const availableRoleCodes = availableRoles.value.map(role => role.role_code || role.code);
  let headerRowIndex = -1;
  
  // 查找标题行位置（包含"用户名"的行）
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row && row.length > 0) {
      const firstCell = row[0] ? row[0].toString().trim() : '';
      // 跳过注释行（以#开头）
      if (firstCell.startsWith('#')) {
        continue;
      }
      // 找到标题行
      if (firstCell === '用户名' || firstCell.toLowerCase() === 'username') {
        headerRowIndex = i;
        break;
      }
    }
  }
  
  if (headerRowIndex === -1) {
    throw new Error('未找到标题行，请确保文件包含"用户名,邮箱,手机号,角色代码"标题行');
  }
  
  // 从标题行的下一行开始解析数据
  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i];
    
    // 跳过空行
    if (!row || row.length === 0 || !row.some(cell => cell && cell.toString().trim())) {
      continue;
    }
    
    const firstCell = row[0] ? row[0].toString().trim() : '';
    // 跳过注释行（以#开头）
    if (firstCell.startsWith('#')) {
      continue;
    }
    
    // 确保至少有4列数据
    if (row.length < 4) {
      throw new Error(`第 ${i + 1} 行数据不完整：必须包含用户名、邮箱、手机号、角色代码四列`);
    }
    
    const username = row[0] ? row[0].toString().trim() : '';
    const email = row[1] ? row[1].toString().trim() : '';
    const phone = row[2] ? row[2].toString().trim() : '';
    const roleCodesStr = row[3] ? row[3].toString().trim() : '';
    
    // 验证用户名
    if (!username) {
      throw new Error(`第 ${i + 1} 行：用户名不能为空`);
    }
    
    if (username.length < 3 || username.length > 50) {
      throw new Error(`第 ${i + 1} 行：用户名长度必须在3-50个字符之间`);
    }
    
    // 验证邮箱格式
    if (email && !isValidEmail(email)) {
      throw new Error(`第 ${i + 1} 行：邮箱格式不正确`);
    }
    
    // 验证手机号格式
    if (phone && !isValidPhone(phone)) {
      throw new Error(`第 ${i + 1} 行：手机号格式不正确，必须是11位数字且以1开头`);
    }
    
    // 验证角色代码
    if (!roleCodesStr) {
      throw new Error(`第 ${i + 1} 行：角色代码不能为空`);
    }
    
    const roleCodes = roleCodesStr.split(';').map(code => code.trim()).filter(code => code !== '');
    
    if (roleCodes.length === 0) {
      throw new Error(`第 ${i + 1} 行：角色代码不能为空`);
    }
    
    // 验证角色代码是否存在
    for (const roleCode of roleCodes) {
      if (!availableRoleCodes.includes(roleCode)) {
        throw new Error(`第 ${i + 1} 行：角色代码 "${roleCode}" 不存在。可用角色代码：${availableRoleCodes.join(', ')}`);
      }
    }
    
    users.push({
      username,
      email: email || '',
      phone: phone || '',
      role_codes: roleCodes
    });
  }
  
  if (users.length === 0) {
    throw new Error('文件中没有有效的用户数据，请检查数据格式或确保删除了说明部分');
  }
  
  return users;
};

/**
 * 验证邮箱格式
 */
const isValidEmail = (email) => {
  if (!email) return true; // 空邮箱是允许的
  
  // 基本长度检查
  if (email.length < 5 || email.length > 100) {
    return false;
  }
  
  // 简单的邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证手机号格式（中国手机号）
 */
const isValidPhone = (phone) => {
  if (!phone) return true; // 空手机号是允许的
  
  // 检查长度和格式：11位数字，以1开头
  const phoneRegex = /^1[0-9]{10}$/;
  return phoneRegex.test(phone);
};

/**
 * 解析手动输入的用户文本
 */
const parseManualInput = (text) => {
  const lines = text.trim().split('\n').filter(line => line.trim() !== '');
  const users = [];
  
  // 获取可用的角色代码列表
  const availableRoleCodes = availableRoles.value.map(role => role.role_code || role.code);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 跳过空行和注释行
    if (!line || line.startsWith('#')) {
      continue;
    }
    
    const parts = line.split(',').map(part => part.trim());
    
    if (parts.length < 4) {
      throw new Error(`第 ${i + 1} 行格式错误：必须包含用户名,邮箱,手机号,角色代码四个字段`);
    }
    
    const username = parts[0];
    const email = parts[1] || '';
    const phone = parts[2] || '';
    const roleCodesStr = parts[3] || '';
    
    // 验证用户名
    if (!username) {
      throw new Error(`第 ${i + 1} 行：用户名不能为空`);
    }
    
    if (username.length < 3 || username.length > 50) {
      throw new Error(`第 ${i + 1} 行：用户名长度必须在3-50个字符之间`);
    }
    
    // 验证邮箱格式
    if (email && !isValidEmail(email)) {
      throw new Error(`第 ${i + 1} 行：邮箱格式不正确`);
    }
    
    // 验证手机号格式
    if (phone && !isValidPhone(phone)) {
      throw new Error(`第 ${i + 1} 行：手机号格式不正确，必须是11位数字且以1开头`);
    }
    
    // 验证角色代码
    if (!roleCodesStr) {
      throw new Error(`第 ${i + 1} 行：角色代码不能为空`);
    }
    
    const roleCodes = roleCodesStr.split(';').map(code => code.trim()).filter(code => code !== '');
    
    if (roleCodes.length === 0) {
      throw new Error(`第 ${i + 1} 行：角色代码不能为空`);
    }
    
    // 验证角色代码是否存在
    for (const roleCode of roleCodes) {
      if (!availableRoleCodes.includes(roleCode)) {
        throw new Error(`第 ${i + 1} 行：角色代码 "${roleCode}" 不存在。可用角色代码：${availableRoleCodes.join(', ')}`);
      }
    }
    
    users.push({
      username,
      email: email || '', // 空邮箱用空字符串
      phone: phone || '', // 空手机号用空字符串
      role_codes: roleCodes
    });
  }
  
  return users;
};

/**
 * 提交批量创建
 */
const submitBatchCreate = async () => {
  try {
    batchCreating.value = true;
    batchCreateResult.value = null;
    
    let result;
    
    if (batchCreateActiveTab.value === 'manual') {
      // 手动输入模式
      if (!batchUserText.value.trim()) {
        ElMessage.error('请输入用户信息');
        return;
      }
      
      const users = parseManualInput(batchUserText.value);
      console.log('解析的用户数据:', users);
      
      const requestData = { users };
      console.log('发送的请求数据:', requestData);
      
      const response = await userApi.batchCreateUsers(requestData);
      console.log('API响应:', response);
      result = response.data;
    } else {
      // 文件上传模式
      if (!selectedFile.value || parsedUsers.value.length === 0) {
        ElMessage.error('请选择文件并确保文件解析成功');
        return;
      }
      
      console.log('使用已解析的用户数据:', parsedUsers.value);
      
      const requestData = { users: parsedUsers.value };
      console.log('发送的请求数据:', requestData);
      
      const response = await userApi.batchCreateUsers(requestData);
      console.log('批量创建API响应:', response);
      result = response.data;
    }
    
    batchCreateResult.value = result;
    
    if (result.success > 0) {
      ElMessage.success(`批量创建完成！成功 ${result.success} 个，失败 ${result.failed} 个`);
      // 刷新用户列表
      getUserList();
    } else {
      ElMessage.warning('所有用户创建失败，请检查输入数据');
    }
    
  } catch (error) {
    console.error('批量创建用户失败:', error);
    console.error('错误详情:', error.response?.data);
    
    let errorMessage = '批量创建用户失败';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    ElMessage.error(errorMessage);
  } finally {
    batchCreating.value = false;
  }
};

// ===================== 状态辅助函数 =====================
/**
 * 获取状态对应的标签类型
 * @param {number} status - 状态值：0=禁用，1=正常，2=锁定
 * @returns {string} - Element Plus标签类型
 */
const getStatusType = (status) => {
  switch (status) {
    case 0: return 'info';    // 禁用 - 灰色
    case 1: return 'success'; // 正常 - 绿色
    case 2: return 'danger';  // 锁定 - 红色
    default: return 'info';
  }
};

/**
 * 获取状态对应的文本
 * @param {number} status - 状态值：0=禁用，1=正常，2=锁定
 * @returns {string} - 状态文本
 */
const getStatusText = (status) => {
  switch (status) {
    case 0: return '禁用';
    case 1: return '正常';
    case 2: return '锁定';
    default: return '未知';
  }
};

/**
 * 获取状态操作按钮文本
 * @param {number} status - 状态值：0=禁用，1=正常，2=锁定
 * @returns {string} - 操作按钮文本
 */
const getStatusActionText = (status) => {
  switch (status) {
    case 0: return '禁用'; // 禁用状态不可操作
    case 1: return '锁定'; // 正常状态可以锁定
    case 2: return '解锁'; // 锁定状态可以解锁
    default: return '操作';
  }
};


// ===================== 生命周期钩子 =====================
onMounted(() => {
  console.log('========== 组件初始化 ==========');
  console.log('初始分页配置:', {
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: pagination.total
  });
  
  // 处理ResizeObserver错误 - 这是Element Plus表格组件的已知问题
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver loop completed')) {
      // 忽略ResizeObserver错误，这是Element Plus表格的已知无害错误
      return;
    }
    originalConsoleError.apply(console, args);
  };
  
  // 处理未捕获的错误
  const handleError = (event) => {
    if (event.error && event.error.message && 
        event.error.message.includes('ResizeObserver loop completed')) {
      event.preventDefault();
      return;
    }
  };
  
  window.addEventListener('error', handleError);
  
  getUserList(1); // 组件挂载时加载第一页用户数据
  getRoleList(); // 组件挂载时加载角色数据
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
.user-management-integrated-container h2 {
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

/* 科技感表格 - 彻底解决白线问题 */
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

/* 表格整体容器 - 彻底移除所有边框 */
.tech-table :deep(.el-table) {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  border: none !important;
  border-collapse: separate !important;
}

.tech-table :deep(.el-table::before) {
  display: none !important;
}

.tech-table :deep(.el-table::after) {
  display: none !important;
}

/* 移除所有可能的白色边框和分隔线 */
.tech-table :deep(.el-table__inner-wrapper) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

.tech-table :deep(.el-table__inner-wrapper::after) {
  display: none !important;
}

.tech-table :deep(.el-table__inner-wrapper::before) {
  display: none !important;
}

/* 移除表格外层的所有边框元素 */
.tech-table :deep(.el-table__border-left-patch) {
  display: none !important;
}

.tech-table :deep(.el-table__border-right-patch) {
  display: none !important;
}

.tech-table :deep(.el-table__border-bottom-patch) {
  display: none !important;
}

.tech-table :deep(.el-table__border-top-patch) {
  display: none !important;
}

/* 强制移除Element Plus的默认边框样式 */
.tech-table :deep(.el-table--border) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

.tech-table :deep(.el-table--border::before) {
  display: none !important;
}

.tech-table :deep(.el-table--border::after) {
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

/* 科技感对话框 - 增强权重 */
.tech-dialog :deep(.el-dialog),
:deep(.tech-dialog.el-dialog),
:deep(.el-dialog.tech-dialog) {
  background: rgba(45, 55, 75, 0.92) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 15px !important;
  box-shadow: 
    0 0 50px rgba(0, 255, 255, 0.3),
    inset 0 0 50px rgba(0, 255, 255, 0.08) !important;
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

/* 科技感表单 - 增强权重 */
.tech-dialog :deep(.el-form-item__label),
:deep(.tech-dialog .el-form-item__label) {
  color: #00ffff !important;
  font-weight: 500 !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
}

.tech-dialog :deep(.el-input__wrapper),
:deep(.tech-dialog .el-input__wrapper),
.tech-dialog :deep(.el-input .el-input__wrapper) {
  background: rgba(0, 0, 0, 0.4) !important;
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
    0 0 25px rgba(0, 255, 255, 0.4),
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

.tech-dialog :deep(.el-textarea__inner),
:deep(.tech-dialog .el-textarea__inner) {
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border-radius: 6px !important;
  box-shadow: 
    0 0 15px rgba(0, 255, 255, 0.15),
    inset 0 0 15px rgba(0, 255, 255, 0.08) !important;
}

.tech-dialog :deep(.el-textarea__inner:hover),
:deep(.tech-dialog .el-textarea__inner:hover) {
  border-color: rgba(0, 255, 255, 0.6) !important;
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.25),
    inset 0 0 20px rgba(0, 255, 255, 0.12) !important;
}

.tech-dialog :deep(.el-textarea__inner:focus),
:deep(.tech-dialog .el-textarea__inner:focus) {
  border-color: #00ffff !important;
  box-shadow: 
    0 0 25px rgba(0, 255, 255, 0.4),
    inset 0 0 25px rgba(0, 255, 255, 0.15) !important;
}

.tech-dialog :deep(.el-select .el-select__wrapper),
:deep(.tech-dialog .el-select .el-select__wrapper) {
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 6px !important;
  box-shadow: 
    0 0 15px rgba(0, 255, 255, 0.15),
    inset 0 0 15px rgba(0, 255, 255, 0.08) !important;
}

.tech-dialog :deep(.el-select .el-select__wrapper:hover),
:deep(.tech-dialog .el-select .el-select__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.6) !important;
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.25),
    inset 0 0 20px rgba(0, 255, 255, 0.12) !important;
}

.tech-dialog :deep(.el-select .el-select__wrapper.is-focused),
:deep(.tech-dialog .el-select .el-select__wrapper.is-focused) {
  border-color: #00ffff !important;
  box-shadow: 
    0 0 25px rgba(0, 255, 255, 0.4),
    inset 0 0 25px rgba(0, 255, 255, 0.15) !important;
}

:deep(.el-select-dropdown) {
  background: rgba(0, 0, 0, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  backdrop-filter: blur(10px);
}

:deep(.el-select-dropdown .el-select-dropdown__item) {
  color: rgba(255, 255, 255, 0.9) !important;
  background: transparent !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item.is-selected) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}

/* 表单提示文字样式 */
.form-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6) !important;
  margin-top: 4px;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
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

/* 密码说明样式 */
.password-notice {
  margin: 15px 0;
}

.password-notice :deep(.el-alert) {
  background: rgba(0, 255, 255, 0.05) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
}

.password-notice :deep(.el-alert__title) {
  color: #00ffff !important;
}

.password-notice :deep(.el-alert__description) {
  color: rgba(255, 255, 255, 0.8) !important;
}

.password-notice :deep(.el-alert__icon) {
  color: #00ffff !important;
}

/* 对话框按钮样式 */
:deep(.tech-dialog .dialog-footer .el-button) {
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2) !important;
}

:deep(.tech-dialog .dialog-footer .el-button:hover) {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-1px) !important;
}

:deep(.tech-dialog .dialog-footer .el-button--primary) {
  background: rgba(0, 255, 255, 0.3) !important;
  border-color: #00ffff !important;
  color: #ffffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

:deep(.tech-dialog .dialog-footer .el-button--primary:hover) {
  background: rgba(0, 255, 255, 0.4) !important;
  box-shadow: 0 0 25px rgba(0, 255, 255, 0.5) !important;
}

/* 选择框中文字的颜色 */
:deep(.el-select .el-select__selected-item) {
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-select .el-select__placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

:deep(.el-select .el-select__input) {
  color: rgba(255, 255, 255, 0.9) !important;
}

/* 多选标签样式 */
:deep(.el-select .el-tag) {
  background: rgba(0, 255, 255, 0.15) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  color: #00ffff !important;
}

:deep(.el-select .el-tag .el-tag__close) {
  color: rgba(255, 255, 255, 0.7) !important;
}

:deep(.el-select .el-tag .el-tag__close:hover) {
  color: #ff4757 !important;
}

/* 搜索筛选样式 */
.search-filters-card {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 255, 255, 0.03) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
}

.search-filters-header {
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  padding-bottom: 8px;
}

.filter-title {
  color: #00ffff;
  font-weight: bold;
  font-size: 16px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

.search-filters-content {
  padding: 0;
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 15px;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-item label {
  color: #00ffff;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
}

.tech-input :deep(.el-input__wrapper),
.tech-select :deep(.el-select__wrapper) {
  background-color: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
}

.tech-input :deep(.el-input__inner),
.tech-select :deep(.el-select__input) {
  color: rgba(255, 255, 255, 0.95) !important;
  background: transparent !important;
}

.filter-actions {
  display: flex;
  gap: 8px;
  align-items: center;
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
  
  .filter-row {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  
  .filter-actions {
    grid-column: span 2;
    justify-content: center;
    margin-top: 10px;
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
  
  /* 小屏幕表格适配 */
  .tech-table {
    min-width: 800px; /* 确保表格有最小宽度，触发水平滚动 */
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

/* 强制覆盖 Element Plus 默认样式 */
.el-dialog.tech-dialog {
  background: rgba(45, 55, 75, 0.92) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 12px !important;
}

.el-dialog.tech-dialog .el-dialog__header {
  background: rgba(45, 55, 75, 0.92) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
}

.el-dialog.tech-dialog .el-dialog__title {
  color: #00ffff !important;
  font-weight: bold !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}

.el-dialog.tech-dialog .el-dialog__body {
  background: rgba(45, 55, 75, 0.92) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.el-dialog.tech-dialog .el-form-item__label {
  color: #00ffff !important;
  font-weight: 500 !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
}

.el-dialog.tech-dialog .el-input__wrapper {
  background: rgba(45, 55, 75, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
}

.el-dialog.tech-dialog .el-input__wrapper:hover {
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.2) !important;
}

.el-dialog.tech-dialog .el-input__wrapper.is-focus {
  border-color: #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

.el-dialog.tech-dialog .el-input__inner {
  color: rgba(255, 255, 255, 0.95) !important;
  background: transparent !important;
}

.el-dialog.tech-dialog .el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.5) !important;
}

.el-dialog.tech-dialog .el-textarea__inner {
  background: rgba(45, 55, 75, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
}

.el-dialog.tech-dialog .el-textarea__inner:hover {
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.2) !important;
}

.el-dialog.tech-dialog .el-textarea__inner:focus {
  border-color: #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

.el-dialog.tech-dialog .el-select .el-select__wrapper {
  background: rgba(45, 55, 75, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
}

.el-dialog.tech-dialog .el-select .el-select__wrapper:hover {
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.2) !important;
}

.el-dialog.tech-dialog .el-select .el-select__wrapper.is-focused {
  border-color: #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

.el-dialog.tech-dialog .form-hint {
  color: rgba(255, 255, 255, 0.6) !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3) !important;
}

.el-dialog.tech-dialog .el-button {
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background: rgba(45, 55, 75, 0.8) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

.el-dialog.tech-dialog .el-button:hover {
  background: rgba(0, 255, 255, 0.15) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.3) !important;
  transform: translateY(-1px) !important;
}

.el-dialog.tech-dialog .el-button--primary {
  background: rgba(0, 150, 200, 0.8) !important;
  border-color: rgba(0, 200, 255, 0.6) !important;
  color: #ffffff !important;
}

.el-dialog.tech-dialog .el-button--primary:hover {
  background: rgba(0, 180, 230, 0.9) !important;
  border-color: #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4) !important;
}

/* 选择框内的选项和标签样式 */
.el-dialog.tech-dialog .el-select .el-select__selected-item,
.el-dialog.tech-dialog .el-select .el-select__placeholder {
  color: rgba(255, 255, 255, 0.9) !important;
}

.el-dialog.tech-dialog .el-tag {
  background: rgba(0, 200, 255, 0.2) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  color: #00ffff !important;
  border-radius: 4px !important;
}

/* 密码提示框样式 */
.el-dialog.tech-dialog .password-notice .el-alert {
  background: rgba(45, 55, 75, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
}

.el-dialog.tech-dialog .password-notice .el-alert__title {
  color: #00ffff !important;
}

.el-dialog.tech-dialog .password-notice .el-alert__description {
  color: rgba(255, 255, 255, 0.8) !important;
}

.el-dialog.tech-dialog .password-notice .el-alert__icon {
  color: #00ffff !important;
}

/* 最高优先级样式覆盖 */
.user-form-dialog.el-dialog,
.user-form-dialog .el-dialog,
div.el-dialog.user-form-dialog {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
}

.user-form-dialog .el-dialog__header {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
}

.user-form-dialog .el-dialog__body {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.user-form-dialog .el-dialog__title {
  color: #00ffff !important;
  font-weight: bold !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}

.user-form-dialog .el-form-item__label {
  color: #00ffff !important;
  font-weight: 500 !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
}

.user-form-dialog .el-input__wrapper {
  background-color: rgba(65, 75, 95, 0.85) !important;
  background: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
}

.user-form-dialog .el-input__inner {
  color: rgba(255, 255, 255, 0.95) !important;
  background: transparent !important;
}

.user-form-dialog .el-textarea__inner {
  background-color: rgba(65, 75, 95, 0.85) !important;
  background: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border-radius: 6px !important;
}

.user-form-dialog .el-select .el-select__wrapper {
  background-color: rgba(65, 75, 95, 0.85) !important;
  background: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 6px !important;
}

.user-form-dialog .el-button {
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background-color: rgba(45, 55, 75, 0.8) !important;
  background: rgba(45, 55, 75, 0.8) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
}

.user-form-dialog .el-button--primary {
  background-color: rgba(0, 150, 200, 0.8) !important;
  background: rgba(0, 150, 200, 0.8) !important;
  border-color: rgba(0, 200, 255, 0.6) !important;
  color: #ffffff !important;
}

/* 角色分配对话框样式 */
.role-assign-dialog.el-dialog,
.role-assign-dialog .el-dialog,
div.el-dialog.role-assign-dialog {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
}

.role-assign-dialog .el-dialog__header {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
}

.role-assign-dialog .el-dialog__body {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.role-assign-dialog .el-dialog__title {
  color: #00ffff !important;
  font-weight: bold !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}

.role-assign-dialog .el-button {
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background-color: rgba(45, 55, 75, 0.8) !important;
  background: rgba(45, 55, 75, 0.8) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
}

.role-assign-dialog .el-button--primary {
  background-color: rgba(0, 150, 200, 0.8) !important;
  background: rgba(0, 150, 200, 0.8) !important;
  border-color: rgba(0, 200, 255, 0.6) !important;
  color: #ffffff !important;
}

/* 批量创建用户对话框样式 */
.batch-create-dialog.el-dialog,
.batch-create-dialog .el-dialog,
div.el-dialog.batch-create-dialog {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
}

.batch-create-dialog .el-dialog__header {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
}

.batch-create-dialog .el-dialog__body {
  background-color: rgba(45, 55, 75, 0.92) !important;
  background: rgba(45, 55, 75, 0.92) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.batch-create-dialog .el-dialog__title {
  color: #00ffff !important;
  font-weight: bold !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}

.batch-create-container {
  padding: 0;
}

/* 选项卡样式 */
.tech-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.tech-tabs :deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(0, 255, 255, 0.2) !important;
}

.tech-tabs :deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-weight: 500;
}

.tech-tabs :deep(.el-tabs__item.is-active) {
  color: #00ffff !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

.tech-tabs :deep(.el-tabs__active-bar) {
  background-color: #00ffff !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

/* 手动输入区域样式 */
.manual-input-section {
  margin-bottom: 20px;
}

.format-description {
  margin-bottom: 15px;
  padding: 15px;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
}

.format-description h4 {
  color: #00ffff;
  margin-bottom: 10px;
  font-size: 16px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

.format-info p,
.format-examples p {
  margin: 5px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.format-examples {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 255, 255, 0.1);
}

/* 可用角色列表样式 */
.available-roles {
  margin: 10px 0;
  padding: 10px;
  background: rgba(0, 255, 255, 0.03);
  border: 1px solid rgba(0, 255, 255, 0.1);
  border-radius: 6px;
}

.available-roles p {
  margin: 0 0 8px 0 !important;
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 500;
}

.roles-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.role-item {
  display: inline-block;
  padding: 4px 8px;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  color: #00ffff;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  white-space: nowrap;
  cursor: help;
  transition: all 0.3s ease;
}

.role-item:hover {
  background: rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}

.batch-input-area :deep(.el-textarea__inner) {
  background-color: rgba(65, 75, 95, 0.85) !important;
  background: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border-radius: 6px !important;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
}

.batch-input-area :deep(.el-textarea__inner:focus) {
  border-color: #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

/* 文件上传区域样式 */
.upload-section {
  margin-bottom: 20px;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 6px;
}

.upload-tips p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.tech-upload :deep(.el-upload) {
  width: 100%;
}

.tech-upload :deep(.el-upload-dragger) {
  background-color: rgba(65, 75, 95, 0.5) !important;
  border: 2px dashed rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  width: 100%;
  height: 180px;
  transition: all 0.3s ease;
}

.tech-upload :deep(.el-upload-dragger:hover) {
  border-color: rgba(0, 255, 255, 0.6) !important;
  background-color: rgba(65, 75, 95, 0.7) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2) !important;
}

.tech-upload :deep(.el-upload-dragger .el-icon--upload) {
  color: #00ffff !important;
  font-size: 48px;
  margin-bottom: 16px;
}

.tech-upload :deep(.el-upload-dragger .el-upload__text) {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 14px;
}

.tech-upload :deep(.el-upload-dragger .el-upload__text em) {
  color: #00ffff !important;
  font-style: normal;
  text-decoration: underline;
}

.tech-upload :deep(.el-upload__tip) {
  color: rgba(255, 255, 255, 0.6) !important;
  font-size: 12px;
  text-align: center;
  margin-top: 8px;
}

.tech-upload :deep(.el-upload-list) {
  margin-top: 15px;
}

.tech-upload :deep(.el-upload-list__item) {
  background-color: rgba(65, 75, 95, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.tech-upload :deep(.el-upload-list__item-name) {
  color: rgba(255, 255, 255, 0.9) !important;
}

.tech-upload :deep(.el-upload-list__item .el-icon--document) {
  color: #00ffff !important;
}

/* 文件预览区域样式 */
.file-preview-section {
  margin-top: 20px;
  padding: 15px;
  background: rgba(0, 255, 255, 0.03);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
}

.file-preview-section :deep(.el-divider__text) {
  color: #00ffff !important;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

.preview-summary {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.preview-summary .el-tag {
  font-size: 14px !important;
  padding: 8px 16px !important;
  border-radius: 6px !important;
}

.preview-table-container {
  max-height: 300px;
  overflow-y: auto;
}

.preview-table {
  font-size: 12px;
}

.preview-more-tip {
  text-align: center;
  margin-top: 10px;
  padding: 8px;
  background: rgba(0, 255, 255, 0.05);
  border-radius: 4px;
}

/* 结果显示区域样式 */
.result-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 255, 255, 0.2);
}

.result-section :deep(.el-divider__text) {
  color: #00ffff !important;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

.result-summary {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  justify-content: center;
}

.result-summary .el-tag {
  font-size: 14px !important;
  padding: 8px 16px !important;
  border-radius: 6px !important;
}

.result-details {
  max-height: 300px;
  overflow-y: auto;
}

/* 对话框按钮样式 */
.batch-create-dialog .el-button {
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background-color: rgba(45, 55, 75, 0.8) !important;
  background: rgba(45, 55, 75, 0.8) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

.batch-create-dialog .el-button:hover {
  background-color: rgba(0, 255, 255, 0.15) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.3) !important;
  transform: translateY(-1px) !important;
}

.batch-create-dialog .el-button--primary {
  background-color: rgba(0, 150, 200, 0.8) !important;
  background: rgba(0, 150, 200, 0.8) !important;
  border-color: rgba(0, 200, 255, 0.6) !important;
  color: #ffffff !important;
}

.batch-create-dialog .el-button--primary:hover {
  background-color: rgba(0, 180, 230, 0.9) !important;
  border-color: #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4) !important;
}

.batch-create-dialog .el-button--primary:disabled {
  background-color: rgba(0, 150, 200, 0.3) !important;
  border-color: rgba(0, 200, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.5) !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}
</style>