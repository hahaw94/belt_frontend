<template>
  <div class="warning-push">
    <div class="content-area tech-card">
      <div class="table-header">
        <h3>预警推送管理</h3>
        <el-button type="primary" @click="handleAddRule">
          <el-icon><Plus /></el-icon>
          新增推送规则
        </el-button>
      </div>
      
      <div class="tech-table">
        <el-table :data="pushRules" style="width: 100%" @row-click="handleRowClick" stripe border>
          <el-table-column type="index" width="80" label="序号" />
          <el-table-column prop="name" label="规则名称" min-width="160" show-overflow-tooltip />
          <el-table-column prop="type" label="预警类型" width="120" />
          <el-table-column prop="level" label="预警级别" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="getLevelType(row.level)">
                {{ row.level }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="pushType" label="推送方式" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              <el-space>
                <el-tag
                  v-for="type in row.pushType"
                  :key="type"
                  size="small"
                >
                  {{ getPushTypeName(type) }}
                </el-tag>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column prop="receivers" label="接收对象" min-width="140" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="true"
                :inactive-value="false"
                @change="handleStatusChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="140" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
        </el-table>
      </div>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 规则编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑推送规则' : '新增推送规则'"
      width="600px"
    >
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="预警类型" prop="type">
          <el-select v-model="ruleForm.type" placeholder="请选择预警类型">
            <el-option label="异常行为" value="behavior" />
            <el-option label="可疑物品" value="object" />
            <el-option label="区域入侵" value="intrusion" />
          </el-select>
        </el-form-item>
        <el-form-item label="预警级别" prop="level">
          <el-select v-model="ruleForm.level" placeholder="请选择预警级别">
            <el-option label="高危" value="high" />
            <el-option label="中危" value="medium" />
            <el-option label="低危" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="推送方式" prop="pushType">
          <el-checkbox-group v-model="ruleForm.pushType">
            <el-checkbox label="email">邮件推送</el-checkbox>
            <el-checkbox label="sms">短信推送</el-checkbox>
            <el-checkbox label="app">APP推送</el-checkbox>
            <el-checkbox label="wechat">微信推送</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="接收对象" prop="receivers">
          <el-select
            v-model="ruleForm.receivers"
            multiple
            filterable
            placeholder="请选择接收对象"
          >
            <el-option-group
              v-for="group in receiverGroups"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="推送时段" prop="pushTime">
          <el-time-picker
            v-model="ruleForm.pushTimeStart"
            placeholder="开始时间"
            format="HH:mm"
          />
          <span class="mx-2">至</span>
          <el-time-picker
            v-model="ruleForm.pushTimeEnd"
            placeholder="结束时间"
            format="HH:mm"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="ruleForm.status"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="ruleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入规则描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

export default {
  name: 'WarningPush',
  components: {
    Plus
  },
  setup() {
    // 分页相关
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(100)

    // 表单引用
    const ruleFormRef = ref(null)

    // 模拟数据
    const pushRules = ref([
      {
        id: 1,
        name: '高危预警推送',
        type: '异常行为',
        level: 'high',
        pushType: ['email', 'sms', 'app'],
        receivers: ['user1', 'user2'],
        status: true
      },
      {
        id: 2,
        name: '中危预警推送',
        type: '可疑物品',
        level: 'medium',
        pushType: ['email', 'app'],
        receivers: ['group1'],
        status: false
      }
    ])

    const receiverGroups = [
      {
        label: '用户',
        options: [
          { value: 'user1', label: '张三' },
          { value: 'user2', label: '李四' },
          { value: 'user3', label: '王五' }
        ]
      },
      {
        label: '用户组',
        options: [
          { value: 'group1', label: '管理员组' },
          { value: 'group2', label: '操作员组' },
          { value: 'group3', label: '监控员组' }
        ]
      }
    ]

    // 对话框控制
    const dialogVisible = ref(false)
    const isEdit = ref(false)

    // 表单数据
    const ruleForm = reactive({
      name: '',
      type: '',
      level: '',
      pushType: [],
      receivers: [],
      pushTimeStart: null,
      pushTimeEnd: null,
      status: true,
      description: ''
    })

    // 表单验证规则
    const rules = {
      name: [
        { required: true, message: '请输入规则名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      type: [
        { required: true, message: '请选择预警类型', trigger: 'change' }
      ],
      level: [
        { required: true, message: '请选择预警级别', trigger: 'change' }
      ],
      pushType: [
        { required: true, message: '请选择至少一种推送方式', trigger: 'change' }
      ],
      receivers: [
        { required: true, message: '请选择接收对象', trigger: 'change' }
      ]
    }

    // 获取预警级别标签类型
    const getLevelType = (level) => {
      const levelMap = {
        high: 'danger',
        medium: 'warning',
        low: 'info'
      }
      return levelMap[level] || 'info'
    }

    // 获取推送方式名称
    const getPushTypeName = (type) => {
      const typeMap = {
        email: '邮件',
        sms: '短信',
        app: 'APP',
        wechat: '微信'
      }
      return typeMap[type] || type
    }

    // 新增规则
    const handleAddRule = () => {
      isEdit.value = false
      Object.keys(ruleForm).forEach(key => {
        if (Array.isArray(ruleForm[key])) {
          ruleForm[key] = []
        } else if (key === 'status') {
          ruleForm[key] = true
        } else {
          ruleForm[key] = ''
        }
      })
      dialogVisible.value = true
    }

    // 编辑规则
    const handleEdit = (row) => {
      isEdit.value = true
      Object.keys(ruleForm).forEach(key => {
        ruleForm[key] = row[key]
      })
      dialogVisible.value = true
    }

    // 删除规则
    const handleDelete = (row) => {
      console.log('删除规则：', row)
      ElMessageBox.confirm(
        '确认要删除该规则吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 实现删除逻辑
        ElMessage.success('删除成功')
      }).catch(() => {})
    }

    // 状态变更
    const handleStatusChange = (row) => {
      console.log('状态变更：', row)
      ElMessage.success(`规则"${row.name}"已${row.status ? '启用' : '禁用'}`)
    }

    // 提交表单
    const handleSubmit = () => {
      if (!ruleFormRef.value) return
      ruleFormRef.value.validate((valid) => {
        if (valid) {
          console.log('表单数据：', ruleForm)
          dialogVisible.value = false
          ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
        }
      })
    }

    // 分页处理
    const handleSizeChange = (val) => {
      pageSize.value = val
      // 重新加载数据
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      // 重新加载数据
    }

    const handleRowClick = (row) => {
      console.log('点击行：', row)
      handleEdit(row)
    }

    return {
      currentPage,
      pageSize,
      total,
      ruleFormRef,
      pushRules,
      receiverGroups,
      dialogVisible,
      isEdit,
      ruleForm,
      rules,
      getLevelType,
      getPushTypeName,
      handleAddRule,
      handleEdit,
      handleDelete,
      handleStatusChange,
      handleSubmit,
      handleSizeChange,
      handleCurrentChange,
      handleRowClick
    }
  }
}
</script>

<style scoped>
.warning-push {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

/* 科技感卡片样式 */
.tech-card {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
}

.content-area {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.table-header h3 {
  margin: 0;
  color: #00ffff;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.content-area .el-table {
  flex: 1;
  margin-bottom: 16px;
}

.content-area .el-pagination {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 255, 255, 0.1);
  display: flex;
  justify-content: center;
}

.mx-2 {
  margin: 0 8px;
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

/* 分页组件 */
:deep(.el-pagination) {
  --el-pagination-bg-color: rgba(20, 30, 50, 0.6) !important;
  --el-pagination-text-color: #ffffff !important;
  --el-pagination-border-color: rgba(0, 255, 255, 0.2) !important;
  --el-pagination-hover-color: #00ffff !important;
}

:deep(.el-pagination .el-pager li) {
  background: rgba(20, 30, 50, 0.6) !important;
  color: #ffffff !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-pagination .el-pager li:hover) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 200, 255, 0.3)) !important;
  color: #00ffff !important;
  border-color: #00ffff !important;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background: rgba(20, 30, 50, 0.6) !important;
  color: #ffffff !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}

:deep(.el-pagination .el-select .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

/* 开关组件 */
:deep(.el-switch) {
  --el-switch-on-color: #00ffff !important;
  --el-switch-off-color: rgba(100, 100, 100, 0.6) !important;
}

/* 按钮组件 */
:deep(.el-button) {
  --el-button-bg-color: rgba(20, 30, 50, 0.8) !important;
  --el-button-border-color: rgba(0, 255, 255, 0.3) !important;
  --el-button-text-color: #ffffff !important;
  --el-button-hover-bg-color: rgba(0, 255, 255, 0.2) !important;
  --el-button-hover-border-color: #00ffff !important;
  --el-button-hover-text-color: #00ffff !important;
}

:deep(.el-button--primary) {
  --el-button-bg-color: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 200, 255, 0.3)) !important;
  --el-button-border-color: #00ffff !important;
  --el-button-text-color: #00ffff !important;
  --el-button-hover-bg-color: linear-gradient(135deg, rgba(0, 255, 255, 0.5), rgba(0, 200, 255, 0.5)) !important;
}

:deep(.el-button--danger) {
  --el-button-bg-color: rgba(220, 20, 60, 0.3) !important;
  --el-button-border-color: rgba(220, 20, 60, 0.6) !important;
  --el-button-text-color: #ff6b6b !important;
  --el-button-hover-bg-color: rgba(220, 20, 60, 0.5) !important;
}

/* 对话框 */
:deep(.el-dialog) {
  background: linear-gradient(135deg,
    rgba(15, 25, 45, 0.95) 0%,
    rgba(20, 30, 50, 0.95) 50%,
    rgba(15, 25, 45, 0.95) 100%) !important;
  border: 2px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 16px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(0, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

:deep(.el-dialog__header) {
  background: transparent !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  padding: 20px !important;
}

:deep(.el-dialog__title) {
  color: #00ffff !important;
  font-weight: 600 !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #ffffff !important;
  font-size: 18px !important;
}

:deep(.el-dialog__body) {
  background: transparent !important;
  color: #ffffff !important;
  padding: 20px !important;
}

:deep(.el-dialog__footer) {
  background: transparent !important;
  border-top: 1px solid rgba(0, 255, 255, 0.2) !important;
  padding: 20px !important;
}

/* 表单组件 */
:deep(.el-form-item__label) {
  color: #ffffff !important;
  font-weight: 500 !important;
}

:deep(.el-input__wrapper) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
  box-shadow: none !important;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.4) !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #00ffff !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-input__inner) {
  color: #ffffff !important;
  background: transparent !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

:deep(.el-textarea__inner) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
  color: #ffffff !important;
  box-shadow: none !important;
}

:deep(.el-textarea__inner:hover) {
  border-color: rgba(0, 255, 255, 0.4) !important;
}

:deep(.el-textarea__inner:focus) {
  border-color: #00ffff !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-textarea__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 选择器 */
:deep(.el-select .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
}

:deep(.el-select .el-input__inner) {
  color: #ffffff !important;
}

:deep(.el-select .el-input__suffix) {
  color: rgba(0, 255, 255, 0.7) !important;
}

/* 选择器下拉面板 */
:deep(.el-select-dropdown) {
  background: linear-gradient(135deg,
    rgba(15, 25, 45, 0.95) 0%,
    rgba(20, 30, 50, 0.95) 100%) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-select-dropdown__item) {
  background: transparent !important;
  color: #ffffff !important;
  transition: all 0.3s ease !important;
}

:deep(.el-select-dropdown__item:hover) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}

:deep(.el-select-dropdown__item.is-selected) {
  background: rgba(0, 255, 255, 0.3) !important;
  color: #00ffff !important;
  font-weight: 600 !important;
}

/* 复选框 */
:deep(.el-checkbox) {
  --el-checkbox-bg-color: rgba(20, 30, 50, 0.6) !important;
  --el-checkbox-border-color: rgba(0, 255, 255, 0.3) !important;
  --el-checkbox-checked-bg-color: #00ffff !important;
  --el-checkbox-checked-border-color: #00ffff !important;
}

:deep(.el-checkbox__label) {
  color: #ffffff !important;
}

/* 时间选择器 */
:deep(.el-time-picker) {
  --el-input-bg-color: rgba(20, 30, 50, 0.6) !important;
  --el-input-border-color: rgba(0, 255, 255, 0.2) !important;
  --el-input-text-color: #ffffff !important;
}

/* 标签 */
:deep(.el-tag) {
  background: rgba(0, 255, 255, 0.15) !important;
  border-color: rgba(0, 255, 255, 0.3) !important;
  color: #00ffff !important;
}

:deep(.el-tag--danger) {
  background: rgba(220, 20, 60, 0.15) !important;
  border-color: rgba(220, 20, 60, 0.3) !important;
  color: #ff6b6b !important;
}

:deep(.el-tag--warning) {
  background: rgba(255, 193, 7, 0.15) !important;
  border-color: rgba(255, 193, 7, 0.3) !important;
  color: #ffc107 !important;
}

:deep(.el-tag--info) {
  background: rgba(108, 117, 125, 0.15) !important;
  border-color: rgba(108, 117, 125, 0.3) !important;
  color: #6c757d !important;
}
</style>