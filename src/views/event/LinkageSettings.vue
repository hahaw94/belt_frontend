<template>
  <div class="linkage-settings">
    <div class="content-area">
      <div class="table-header">
        <h3>联动规则管理</h3>
      <el-button type="primary" @click="handleAddRule">
        <el-icon><Plus /></el-icon>
        新增规则
      </el-button>
    </div>

      <div class="tech-table">
        <el-table :data="ruleList" style="width: 100%" @row-click="handleRowClick" :border="false">
        <el-table-column type="index" width="80" label="序号" />
        <el-table-column prop="name" label="规则名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="type" label="告警类型" width="120" />
        <el-table-column prop="condition" label="触发条件" min-width="180" show-overflow-tooltip />
        <el-table-column prop="action" label="联动动作" width="140" />
        <el-table-column prop="target" label="执行对象" min-width="140" show-overflow-tooltip />
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
}

.content-area {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: none !important;
  background: transparent !important;
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
  border-top: none !important;
  display: flex;
  justify-content: center;
  background: transparent !important;
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

/* 单元格样式 - 高级科技感设计 */
.tech-table :deep(.el-table__body-wrapper .el-table__body td) {
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
  background: transparent !important;
  padding: 16px 14px !important;
  font-size: 13px !important;
  line-height: 1.6 !important;
  position: relative !important;
  font-weight: 400 !important;
  letter-spacing: 0.3px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
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
  box-shadow: none !important;
}

.tech-table :deep(td) {
  border: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
  box-shadow: none !important;
}

.tech-table :deep(th) {
  border: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
  box-shadow: none !important;
}

/* 强制重置所有可能的背景和边框 */
.tech-table :deep(.el-table),
.tech-table :deep(.el-table *) {
  background-color: transparent !important;
  background-image: none !important;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* 重新定义表格头部背景 - 只应用到正确的元素 */
.tech-table :deep(.el-table__header-wrapper),
.tech-table :deep(.el-table__header-wrapper .el-table__header),
.tech-table :deep(.el-table__header-wrapper .el-table__header th) {
  background: linear-gradient(135deg, 
    rgba(20, 35, 60, 1) 0%, 
    rgba(25, 40, 65, 1) 100%) !important;
}

/* 重新定义表格行背景 - 只应用到数据行 */
.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(even)) {
  background: rgba(20, 30, 50, 0.7) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(odd)) {
  background: rgba(25, 35, 55, 0.6) !important;
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
}

.tech-table {
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 255, 255, 0.2) !important;
}

/* 彻底移除表格周围的所有装饰元素 */
.tech-table::before,
.tech-table::after {
  display: none !important;
  content: none !important;
}

.tech-table :deep(.el-table)::before,
.tech-table :deep(.el-table)::after {
  display: none !important;
  content: none !important;
}

/* 高级科技感分页组件 */
:deep(.el-pagination) {
  --el-pagination-bg-color: transparent !important;
  --el-pagination-text-color: #ffffff !important;
  --el-pagination-border-color: rgba(0, 255, 255, 0.2) !important;
  --el-pagination-hover-color: #00ffff !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 20px 0 !important;
}

:deep(.el-pagination .el-pager li) {
  background: linear-gradient(135deg, 
    rgba(20, 30, 50, 0.8) 0%,
    rgba(25, 35, 55, 0.6) 100%) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
  margin: 0 2px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  backdrop-filter: blur(5px) !important;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
}

:deep(.el-pagination .el-pager li:hover) {
  background: linear-gradient(135deg, 
    rgba(0, 255, 255, 0.2) 0%,
    rgba(0, 200, 255, 0.3) 100%) !important;
  color: #00ffff !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  transform: translateY(-1px) !important;
  box-shadow: 
    0 4px 15px rgba(0, 255, 255, 0.2),
    0 0 20px rgba(0, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.6) !important;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, 
    rgba(0, 255, 255, 0.4) 0%,
    rgba(0, 200, 255, 0.5) 50%,
    rgba(0, 255, 255, 0.4) 100%) !important;
  color: #ffffff !important;
  border-color: rgba(0, 255, 255, 0.8) !important;
  font-weight: 600 !important;
  box-shadow: 
    0 0 25px rgba(0, 255, 255, 0.4),
    0 4px 15px rgba(0, 255, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  text-shadow: 0 0 12px rgba(0, 255, 255, 0.8) !important;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background: linear-gradient(135deg, 
    rgba(20, 30, 50, 0.8) 0%,
    rgba(25, 35, 55, 0.6) 100%) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  backdrop-filter: blur(5px) !important;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  background: linear-gradient(135deg, 
    rgba(0, 255, 255, 0.2) 0%,
    rgba(0, 200, 255, 0.3) 100%) !important;
  color: #00ffff !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  transform: translateY(-1px) !important;
  box-shadow: 
    0 4px 15px rgba(0, 255, 255, 0.2),
    0 0 20px rgba(0, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.6) !important;
}

:deep(.el-pagination .el-select .el-input__wrapper) {
  background: linear-gradient(135deg, 
    rgba(20, 30, 50, 0.8) 0%,
    rgba(25, 35, 55, 0.6) 100%) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: #ffffff !important;
  border-radius: 6px !important;
  backdrop-filter: blur(5px) !important;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
}

:deep(.el-pagination .el-select .el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.4) !important;
  box-shadow: 
    0 4px 15px rgba(0, 255, 255, 0.15),
    0 0 15px rgba(0, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
}

:deep(.el-pagination .el-pagination__total),
:deep(.el-pagination .el-pagination__jump) {
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 500 !important;
}

/* 高级科技感开关组件 */
:deep(.el-switch) {
  --el-switch-on-color: #00ffff !important;
  --el-switch-off-color: rgba(60, 70, 80, 0.8) !important;
  --el-switch-border-color: rgba(0, 255, 255, 0.3) !important;
  position: relative !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.el-switch__core) {
  background: linear-gradient(135deg, 
    rgba(60, 70, 80, 0.8) 0%,
    rgba(80, 90, 100, 0.6) 100%) !important;
  border: 2px solid rgba(0, 255, 255, 0.2) !important;
  box-shadow: 
    inset 0 2px 8px rgba(0, 0, 0, 0.3),
    0 0 16px rgba(0, 255, 255, 0.1) !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.el-switch.is-checked .el-switch__core) {
  background: linear-gradient(135deg, 
    rgba(0, 200, 255, 0.8) 0%,
    rgba(0, 255, 255, 0.9) 50%,
    rgba(0, 220, 255, 0.8) 100%) !important;
  border-color: rgba(0, 255, 255, 0.8) !important;
  box-shadow: 
    inset 0 2px 8px rgba(0, 255, 255, 0.3),
    0 0 20px rgba(0, 255, 255, 0.4),
    0 0 40px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-switch__action) {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%,
    rgba(240, 248, 255, 0.9) 100%) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 0 12px rgba(255, 255, 255, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.el-switch.is-checked .el-switch__action) {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 1) 0%,
    rgba(240, 255, 255, 0.95) 100%) !important;
  border-color: rgba(0, 255, 255, 0.6) !important;
  box-shadow: 
    0 3px 12px rgba(0, 255, 255, 0.3),
    0 0 16px rgba(255, 255, 255, 0.8),
    inset 0 1px 3px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-switch:hover .el-switch__core) {
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 
    inset 0 2px 8px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-switch:hover.is-checked .el-switch__core) {
  box-shadow: 
    inset 0 2px 8px rgba(0, 255, 255, 0.4),
    0 0 24px rgba(0, 255, 255, 0.5),
    0 0 48px rgba(0, 255, 255, 0.3) !important;
}

/* 科技感按钮组件 */
:deep(.el-button) {
  --el-button-bg-color: rgba(20, 30, 50, 0.8) !important;
  --el-button-border-color: rgba(0, 255, 255, 0.3) !important;
  --el-button-text-color: #ffffff !important;
  --el-button-hover-bg-color: rgba(0, 255, 255, 0.2) !important;
  --el-button-hover-border-color: #00ffff !important;
  --el-button-hover-text-color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  backdrop-filter: blur(5px) !important;
}

:deep(.el-button:hover) {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, 
    rgba(0, 255, 255, 0.3) 0%,
    rgba(0, 200, 255, 0.4) 50%,
    rgba(0, 255, 255, 0.3) 100%) !important;
  border: 1px solid rgba(0, 255, 255, 0.5) !important;
  color: #00ffff !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.6) !important;
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, 
    rgba(0, 255, 255, 0.5) 0%,
    rgba(0, 200, 255, 0.6) 50%,
    rgba(0, 255, 255, 0.5) 100%) !important;
  border-color: rgba(0, 255, 255, 0.8) !important;
  box-shadow: 
    0 0 30px rgba(0, 255, 255, 0.4),
    0 4px 20px rgba(0, 255, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  text-shadow: 0 0 12px rgba(0, 255, 255, 0.8) !important;
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, 
    rgba(220, 20, 60, 0.3) 0%,
    rgba(255, 60, 100, 0.4) 50%,
    rgba(220, 20, 60, 0.3) 100%) !important;
  border: 1px solid rgba(220, 20, 60, 0.6) !important;
  color: #ff6b6b !important;
  text-shadow: 0 0 8px rgba(255, 107, 107, 0.6) !important;
  box-shadow: 
    0 0 20px rgba(220, 20, 60, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-button--danger:hover) {
  background: linear-gradient(135deg, 
    rgba(220, 20, 60, 0.5) 0%,
    rgba(255, 60, 100, 0.6) 50%,
    rgba(220, 20, 60, 0.5) 100%) !important;
  border-color: rgba(220, 20, 60, 0.8) !important;
  box-shadow: 
    0 0 30px rgba(220, 20, 60, 0.4),
    0 4px 20px rgba(220, 20, 60, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  text-shadow: 0 0 12px rgba(255, 107, 107, 0.8) !important;
}

/* 表格内的链接按钮样式 */
:deep(.el-button.is-link) {
  background: transparent !important;
  border: none !important;
  padding: 4px 8px !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
}

:deep(.el-button.is-link.el-button--primary) {
  color: #00d4ff !important;
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.6) !important;
}

:deep(.el-button.is-link.el-button--primary:hover) {
  background: rgba(0, 255, 255, 0.15) !important;
  color: #ffffff !important;
  text-shadow: 0 0 12px rgba(0, 255, 255, 0.8) !important;
  transform: scale(1.05) !important;
}

:deep(.el-button.is-link.el-button--danger) {
  color: #ff6b6b !important;
  text-shadow: 0 0 8px rgba(255, 107, 107, 0.6) !important;
}

:deep(.el-button.is-link.el-button--danger:hover) {
  background: rgba(220, 20, 60, 0.15) !important;
  color: #ffffff !important;
  text-shadow: 0 0 12px rgba(255, 107, 107, 0.8) !important;
  transform: scale(1.05) !important;
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

/* 数字输入框 */
:deep(.el-input-number) {
  --el-input-bg-color: rgba(20, 30, 50, 0.6) !important;
  --el-input-border-color: rgba(0, 255, 255, 0.2) !important;
  --el-input-text-color: #ffffff !important;
  --el-input-hover-border-color: rgba(0, 255, 255, 0.4) !important;
  --el-input-focus-border-color: #00ffff !important;
}

:deep(.el-input-number .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-input-number__increase),
:deep(.el-input-number__decrease) {
  background: rgba(20, 30, 50, 0.8) !important;
  color: #ffffff !important;
  border-color: rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-input-number__increase:hover),
:deep(.el-input-number__decrease:hover) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}

/* 表单验证错误样式 */
:deep(.el-form-item.is-error .el-input__wrapper) {
  border-color: #ff6b6b !important;
  box-shadow: 0 0 8px rgba(255, 107, 107, 0.3) !important;
}

:deep(.el-form-item__error) {
  color: #ff6b6b !important;
}

/* 移除所有可能的容器边框和背景 */
.linkage-settings * {
  box-sizing: border-box;
}

/* 确保分页区域完全透明 */
:deep(.el-pagination__total),
:deep(.el-pagination__sizes),
:deep(.el-pagination__jump) {
  background: transparent !important;
  border: none !important;
  color: #ffffff !important;
}

/* 移除可能的重叠元素 */
:deep(.el-pagination::before),
:deep(.el-pagination::after) {
  display: none !important;
}

/* 确保内容区域没有额外的装饰 */
.content-area::before,
.content-area::after {
  display: none !important;
}

/* 彻底移除分页组件的所有装饰 */
:deep(.el-pagination) {
  position: relative !important;
  z-index: 1 !important;
}

:deep(.el-pagination *)::before,
:deep(.el-pagination *)::after {
  display: none !important;
}

/* 移除分页组件可能的边框重叠 */
:deep(.el-pagination .el-pagination__total)::before,
:deep(.el-pagination .el-pagination__total)::after,
:deep(.el-pagination .el-pagination__sizes)::before,
:deep(.el-pagination .el-pagination__sizes)::after,
:deep(.el-pagination .el-pagination__jump)::before,
:deep(.el-pagination .el-pagination__jump)::after {
  display: none !important;
  content: none !important;
}

/* 强制移除所有可能的背景和边框 */
.linkage-settings,
.content-area,
.table-header {
  position: relative !important;
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

/* 确保分页区域也没有背景重叠 */
.content-area .el-pagination {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  border: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

/* 确保没有任何元素有重叠的视觉效果 */
.linkage-settings *::before,
.linkage-settings *::after {
  content: none !important;
  display: none !important;
}

/* 最终的背景重叠修复 - 针对所有可能的元素 */
.linkage-settings * {
  background-color: transparent !important;
  background-image: none !important;
  border: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

/* 只保留我们需要的样式 */
.tech-table {
  background: rgba(15, 25, 45, 0.95) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
}

/* 只保留表格内部的伪元素 */
.tech-table :deep(.el-table__header-wrapper .el-table__header th::after) {
  display: block !important;
  content: '' !important;
}

/* 表格序号列特殊样式 */
.tech-table :deep(.el-table__body-wrapper .el-table__body td:first-child) {
  color: rgba(0, 255, 255, 0.8) !important;
  font-weight: 600 !important;
  text-align: center !important;
  font-family: 'Courier New', monospace !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}


/* 操作列按钮容器 */
.tech-table :deep(.el-table__body-wrapper .el-table__body td:last-child) {
  text-align: center !important;
  padding: 12px 8px !important;
}

/* 表格加载时的入场动画 */
.tech-table {
  animation: tableSlideIn 0.6s ease-out !important;
}

@keyframes tableSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 表格行的微妙动画效果 */
.tech-table :deep(.el-table__body-wrapper .el-table__body tr) {
  animation: rowFadeIn 0.4s ease-out both !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(1)) {
  animation-delay: 0.1s !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(2)) {
  animation-delay: 0.15s !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(3)) {
  animation-delay: 0.2s !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(4)) {
  animation-delay: 0.25s !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(5)) {
  animation-delay: 0.3s !important;
}

@keyframes rowFadeIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 表格头部标题的呼吸效果 */
.table-header h3 {
  animation: titleGlow 3s ease-in-out infinite alternate !important;
}

@keyframes titleGlow {
  from {
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }
  to {
    text-shadow: 
      0 0 15px rgba(0, 255, 255, 0.8),
      0 0 25px rgba(0, 255, 255, 0.4),
      0 0 35px rgba(0, 255, 255, 0.2);
  }
}
</style>