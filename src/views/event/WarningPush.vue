<template>
  <div class="warning-push">
    <div class="control-panel">
      <el-button type="primary" @click="handleAddRule">
        <el-icon><Plus /></el-icon>
        新增推送规则
      </el-button>
    </div>

    <div class="content-area">
      <el-table :data="pushRules" style="width: 100%" @row-click="handleRowClick">
        <el-table-column type="index" width="50" />
        <el-table-column prop="name" label="规则名称" width="150" />
        <el-table-column prop="type" label="预警类型" width="120" />
        <el-table-column prop="level" label="预警级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pushType" label="推送方式" width="150">
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
        <el-table-column prop="receivers" label="接收对象" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="true"
              :inactive-value="false"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150">
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
  gap: 20px;
}

.control-panel {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.content-area {
  flex: 1;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.content-area .el-table {
  flex: 1;
}

.content-area .el-pagination {
  margin-top: 16px;
}

.mx-2 {
  margin: 0 8px;
}
</style>