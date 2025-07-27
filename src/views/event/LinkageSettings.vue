<template>
  <div class="linkage-settings">
    <div class="control-panel">
      <el-button type="primary" @click="handleAddRule">
        <el-icon><Plus /></el-icon>
        新增规则
      </el-button>
    </div>

    <div class="content-area">
      <el-table :data="ruleList" style="width: 100%" @row-click="handleRowClick">
        <el-table-column type="index" width="50" />
        <el-table-column prop="name" label="规则名称" width="150" />
        <el-table-column prop="type" label="告警类型" width="120" />
        <el-table-column prop="condition" label="触发条件" width="200" />
        <el-table-column prop="action" label="联动动作" width="150" />
        <el-table-column prop="target" label="执行对象" width="150" />
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
      :title="isEdit ? '编辑规则' : '新增规则'"
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
        <el-form-item label="告警类型" prop="type">
          <el-select v-model="ruleForm.type" placeholder="请选择告警类型">
            <el-option label="异常行为" value="behavior" />
            <el-option label="可疑物品" value="object" />
            <el-option label="区域入侵" value="intrusion" />
          </el-select>
        </el-form-item>
        <el-form-item label="触发条件" prop="condition">
          <el-select v-model="ruleForm.condition" placeholder="请选择触发条件">
            <el-option label="单次告警" value="single" />
            <el-option label="连续告警" value="continuous" />
            <el-option label="累计告警" value="accumulate" />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="ruleForm.condition === 'continuous'"
          label="连续次数"
          prop="threshold"
        >
          <el-input-number
            v-model="ruleForm.threshold"
            :min="1"
            :max="100"
            placeholder="请输入连续次数"
          />
        </el-form-item>
        <el-form-item
          v-if="ruleForm.condition === 'accumulate'"
          label="时间范围"
          prop="timeRange"
        >
          <el-select v-model="ruleForm.timeRange" placeholder="请选择时间范围">
            <el-option label="1小时内" value="1h" />
            <el-option label="24小时内" value="24h" />
            <el-option label="7天内" value="7d" />
          </el-select>
        </el-form-item>
        <el-form-item label="联动动作" prop="action">
          <el-select v-model="ruleForm.action" placeholder="请选择联动动作">
            <el-option label="声光报警" value="alarm" />
            <el-option label="广播" value="broadcast" />
            <el-option label="控制" value="control" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行对象" prop="target">
          <el-select v-model="ruleForm.target" placeholder="请选择执行对象">
            <el-option
              v-for="device in deviceList"
              :key="device.id"
              :label="device.name"
              :value="device.id"
            />
          </el-select>
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
  name: 'LinkageSettings',
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
    const ruleList = ref([
      {
        id: 1,
        name: '异常行为联动',
        type: '异常行为',
        condition: '单次告警',
        action: '声光报警',
        target: '警报器1',
        status: true
      },
      {
        id: 2,
        name: '可疑物品联动',
        type: '可疑物品',
        condition: '连续告警',
        action: '广播',
        target: '广播设备1',
        status: false
      }
    ])

    const deviceList = ref([
      { id: 1, name: '警报器1' },
      { id: 2, name: '警报器2' },
      { id: 3, name: '广播设备1' },
      { id: 4, name: '广播设备2' }
    ])

    // 对话框控制
    const dialogVisible = ref(false)
    const isEdit = ref(false)

    // 表单数据
    const ruleForm = reactive({
      name: '',
      type: '',
      condition: '',
      threshold: 1,
      timeRange: '',
      action: '',
      target: '',
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
        { required: true, message: '请选择告警类型', trigger: 'change' }
      ],
      condition: [
        { required: true, message: '请选择触发条件', trigger: 'change' }
      ],
      threshold: [
        { required: true, message: '请输入连续次数', trigger: 'blur' }
      ],
      timeRange: [
        { required: true, message: '请选择时间范围', trigger: 'change' }
      ],
      action: [
        { required: true, message: '请选择联动动作', trigger: 'change' }
      ],
      target: [
        { required: true, message: '请选择执行对象', trigger: 'change' }
      ]
    }

    // 新增规则
    const handleAddRule = () => {
      isEdit.value = false
      Object.keys(ruleForm).forEach(key => {
        ruleForm[key] = key === 'status' ? true : ''
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
      ruleList,
      deviceList,
      dialogVisible,
      isEdit,
      ruleForm,
      rules,
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
.linkage-settings {
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
</style>