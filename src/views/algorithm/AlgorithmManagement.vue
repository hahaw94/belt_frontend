<template>
  <div class="algorithm-management-container sub-page-content">
    <h2>算法配置</h2>

    <!-- 算法下发 -->
    <el-card class="dispatch-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>算法下发</span>
          <el-button type="primary" :icon="Promotion" size="small" @click="showBatchDispatch">批量下发</el-button>
        </div>
      </template>
      <div class="dispatch-content">
        <el-alert
          title="下发说明"
          type="info"
          description="选择算法模型和目标智能分析板卡，将算法下发到指定设备进行智能分析。下发过程可能需要几分钟时间。"
          show-icon
          :closable="false"
          class="mb-20">
        </el-alert>

        <el-form :model="dispatchForm" :rules="dispatchRules" ref="dispatchFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
              <el-form-item label="选择算法" prop="algorithm_version_id">
                <el-select v-model="dispatchForm.algorithm_version_id" placeholder="请选择算法版本" style="width: 100%" @change="onAlgorithmChange">
                  <el-option-group v-for="group in algorithmGroups" :key="group.name" :label="group.name">
                    <el-option
                      v-for="version in group.versions"
                      :key="version.id"
                      :label="`${version.name} ${version.version}`"
                      :value="version.id">
                      <div class="algorithm-option">
                        <span>{{ version.name }} {{ version.version }}</span>
                        <el-tag size="small" :type="getStatusType(version.status)">{{ getStatusText(version.status) }}</el-tag>
                      </div>
                    </el-option>
                  </el-option-group>
                </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
              <el-form-item label="目标板卡" prop="target_card">
                <el-select v-model="dispatchForm.target_card" placeholder="请选择智能分析板卡" style="width: 100%">
                  <el-option
                    v-for="card in analysisCards"
                    :key="card.id"
                    :label="card.name"
                    :value="card.id">
                    <div class="card-option">
                      <span>{{ card.name }}</span>
                      <el-tag size="small" :type="card.status === '在线' ? 'success' : 'danger'">{{ card.status }}</el-tag>
                    </div>
                  </el-option>
                </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
              <el-form-item label="同步规则">
                <el-switch v-model="dispatchForm.sync_rules" active-text="下发后同步配置规则"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
              <el-form-item label="自动重启">
                <el-switch v-model="dispatchForm.auto_restart" active-text="下发后自动重启板卡"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
            <el-button type="primary" :icon="Promotion" @click="dispatchAlgorithm" :loading="dispatchLoading" :disabled="!canDispatch">
              下发算法
            </el-button>
            <el-button :icon="Refresh" @click="resetDispatchForm">重置</el-button>
            <el-button type="info" :icon="Document" @click="showDispatchLogs">查看日志</el-button>
        </el-form-item>
      </el-form>
      </div>
    </el-card>

    <!-- 算法配置 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>智能分析配置</span>
          <el-button type="success" :icon="Setting" size="small" @click="showRuleConfig">规则配置</el-button>
        </div>
      </template>
      <div class="config-content">
        <el-form :model="configForm" :rules="configRules" ref="configFormRef" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="分析板卡" prop="analysis_card_id">
                <el-select v-model="configForm.analysis_card_id" placeholder="请选择智能分析板卡" style="width: 100%" @change="onCardChange">
                  <el-option
                    v-for="card in analysisCards"
                    :key="card.id"
                    :label="card.name"
                    :value="card.id">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="视频通道" prop="channel">
                <el-select v-model="configForm.channel" placeholder="请选择视频通道" style="width: 100%">
                  <el-option v-for="n in 8" :key="n" :label="`通道 ${n}`" :value="n"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="检测规则">
            <el-button type="primary" :icon="Plus" @click="addRule" :disabled="!configForm.analysis_card_id">添加规则</el-button>
          </el-form-item>
          
          <!-- 规则列表 -->
          <div v-if="configForm.rules.length > 0" class="rules-section">
            <el-table :data="configForm.rules" border size="small">
              <el-table-column prop="rule_type" label="规则类型" width="120">
                <template #default="{ row }">
                  <el-tag size="small">{{ getRuleTypeText(row.rule_type) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="sensitivity" label="灵敏度" width="100">
                <template #default="{ row }">
                  {{ (row.sensitivity * 100).toFixed(0) }}%
                </template>
              </el-table-column>
              <el-table-column prop="min_target_size" label="最小目标" width="100"></el-table-column>
              <el-table-column prop="alarm_interval" label="告警间隔" width="100">
                <template #default="{ row }">
                  {{ row.alarm_interval }}秒
                </template>
              </el-table-column>
              <el-table-column label="检测区域" min-width="150">
                <template #default="{ row }">
                  <span v-if="row.detection_area && row.detection_area.length > 0">
                    {{ row.detection_area.length }}个点
                  </span>
                  <span v-else>全屏检测</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="{ $index }">
                  <el-button type="primary" :icon="Edit" size="small" @click="editRule($index)">编辑</el-button>
                  <el-button type="danger" :icon="Delete" size="small" @click="deleteRule($index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <el-form-item class="mt-20">
            <el-button type="success" :icon="Check" @click="saveConfiguration" :loading="configLoading" :disabled="!canSaveConfig">
              保存配置
            </el-button>
            <el-button :icon="Refresh" @click="resetConfigForm">重置</el-button>
            <el-button type="warning" :icon="Promotion" @click="syncRulesToCard" :loading="syncLoading" :disabled="!configForm.analysis_card_id">
              同步到板卡
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 批量下发对话框 -->
    <el-dialog v-model="batchDispatchVisible" title="批量算法下发" width="600px">
      <el-form :model="batchForm" label-width="120px">
        <el-form-item label="选择算法">
          <el-select v-model="batchForm.algorithm_version_id" placeholder="请选择算法版本" style="width: 100%">
            <el-option-group v-for="group in algorithmGroups" :key="group.name" :label="group.name">
            <el-option
                v-for="version in group.versions"
                :key="version.id"
                :label="`${version.name} ${version.version}`"
                :value="version.id">
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="目标板卡">
          <el-select v-model="batchForm.target_cards" multiple placeholder="请选择智能分析板卡" style="width: 100%">
            <el-option
              v-for="card in analysisCards"
              :key="card.id"
              :label="card.name"
              :value="card.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="下发选项">
          <el-checkbox v-model="batchForm.sync_rules">下发后同步配置规则</el-checkbox>
          <el-checkbox v-model="batchForm.auto_restart">下发后自动重启板卡</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDispatchVisible = false">取消</el-button>
          <el-button type="primary" @click="executeBatchDispatch" :loading="batchLoading">批量下发</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 规则配置对话框 -->
    <el-dialog v-model="ruleConfigVisible" title="配置检测规则" width="500px">
      <el-form :model="ruleForm" label-width="100px">
        <el-form-item label="规则类型">
          <el-select v-model="ruleForm.rule_type" placeholder="请选择规则类型" style="width: 100%">
            <el-option label="区域入侵" value="area_intrusion"></el-option>
            <el-option label="越线检测" value="line_crossing"></el-option>
            <el-option label="物体遗留" value="object_left"></el-option>
            <el-option label="物体移除" value="object_removed"></el-option>
            <el-option label="人数统计" value="people_counting"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="灵敏度">
          <el-slider v-model="ruleForm.sensitivity" :min="0.1" :max="1" :step="0.1" show-stops></el-slider>
        </el-form-item>
        <el-form-item label="最小目标大小">
          <el-input-number v-model="ruleForm.min_target_size" :min="10" :max="500" controls-position="right"></el-input-number>
        </el-form-item>
        <el-form-item label="告警间隔(秒)">
          <el-input-number v-model="ruleForm.alarm_interval" :min="1" :max="300" controls-position="right"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="ruleConfigVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRule">保存规则</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 下发日志对话框 -->
    <el-dialog v-model="logsVisible" title="算法下发日志" width="80%">
      <el-table :data="dispatchLogs" v-loading="logsLoading" border stripe>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="algorithm_name" label="算法名称" min-width="150"></el-table-column>
        <el-table-column prop="target_card" label="目标板卡" width="150"></el-table-column>
        <el-table-column prop="dispatch_time" label="下发时间" width="160"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '成功' ? 'success' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="结果信息" min-width="200"></el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="logsVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Promotion, Refresh, Document, Setting, Plus, Edit, Delete, Check 
} from '@element-plus/icons-vue'
import { algorithmApi } from '@/api/algorithm'

// 响应式数据
const dispatchLoading = ref(false)
const configLoading = ref(false)
const syncLoading = ref(false)
const batchLoading = ref(false)
const logsLoading = ref(false)

const batchDispatchVisible = ref(false)
const ruleConfigVisible = ref(false)
const logsVisible = ref(false)

// 表单引用
const dispatchFormRef = ref()
const configFormRef = ref()

// 下发表单
const dispatchForm = reactive({
  algorithm_version_id: '',
  target_card: '',
  sync_rules: true,
  auto_restart: false
})

// 配置表单
const configForm = reactive({
  analysis_card_id: '',
  channel: 1,
  rules: []
})

// 批量下发表单
const batchForm = reactive({
  algorithm_version_id: '',
  target_cards: [],
  sync_rules: true,
  auto_restart: false
})

// 规则表单
const ruleForm = reactive({
  rule_type: '',
  sensitivity: 0.8,
  min_target_size: 50,
  alarm_interval: 10,
  detection_area: []
})

// 数据
const algorithmList = ref([])
const analysisCards = ref([])
const dispatchLogs = ref([])
const editingRuleIndex = ref(-1)

// 计算属性
const algorithmGroups = computed(() => {
  const groups = {}
  algorithmList.value.forEach(algo => {
    if (!groups[algo.name]) {
      groups[algo.name] = { name: algo.name, versions: [] }
    }
    groups[algo.name].versions.push(algo)
  })
  return Object.values(groups)
})

const canDispatch = computed(() => {
  return dispatchForm.algorithm_version_id && dispatchForm.target_card
})

const canSaveConfig = computed(() => {
  return configForm.analysis_card_id && configForm.rules.length > 0
})

// 表单验证规则
const dispatchRules = {
  algorithm_version_id: [{ required: true, message: '请选择算法版本', trigger: 'change' }],
  target_card: [{ required: true, message: '请选择目标板卡', trigger: 'change' }]
}

const configRules = {
  analysis_card_id: [{ required: true, message: '请选择分析板卡', trigger: 'change' }],
  channel: [{ required: true, message: '请选择视频通道', trigger: 'change' }]
}

// 生命周期
onMounted(() => {
  getAlgorithmList()
  getAnalysisCards()
})

// 方法
const getAlgorithmList = async () => {
  try {
    const response = await algorithmApi.getAlgorithmList()
    console.log('算法API响应:', response)
    if (response.success) {
      algorithmList.value = response.body.algorithms || []
      console.log('算法列表数据:', algorithmList.value)
    } else {
      ElMessage.error(response.message || '获取算法列表失败')
    }
  } catch (error) {
    console.error('算法API错误:', error)
    ElMessage.error('获取算法列表失败：' + error.message)
  }
}

const getAnalysisCards = async () => {
  try {
    const response = await algorithmApi.getAnalysisCards()
    console.log('分析板卡API响应:', response)
    if (response.success) {
      analysisCards.value = response.body.analysis_cards || []
      console.log('分析板卡数据:', analysisCards.value)
    } else {
      ElMessage.error(response.message || '获取分析板卡失败')
    }
  } catch (error) {
    console.error('分析板卡API错误:', error)
    ElMessage.error('获取分析板卡失败：' + error.message)
  }
}

const onAlgorithmChange = () => {
  // 算法选择变化时的处理
}

const onCardChange = () => {
  // 板卡选择变化时的处理
  configForm.rules = []
}

const dispatchAlgorithm = async () => {
  try {
    await dispatchFormRef.value.validate()
    dispatchLoading.value = true
    
    const response = await algorithmApi.dispatchAlgorithm(dispatchForm)
    if (response.data.success) {
      ElMessage.success('算法下发成功')
      resetDispatchForm()
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('算法下发失败：' + error.message)
    }
  } finally {
    dispatchLoading.value = false
  }
}

const resetDispatchForm = () => {
  dispatchFormRef.value?.resetFields()
}

const showBatchDispatch = () => {
  batchDispatchVisible.value = true
}

const executeBatchDispatch = async () => {
  try {
    batchLoading.value = true
    const response = await algorithmApi.batchDispatchAlgorithm(batchForm)
    if (response.data.success) {
      ElMessage.success('批量下发成功')
      batchDispatchVisible.value = false
    }
  } catch (error) {
    ElMessage.error('批量下发失败：' + error.message)
  } finally {
    batchLoading.value = false
  }
}

const showDispatchLogs = async () => {
  try {
    logsLoading.value = true
    logsVisible.value = true
    const response = await algorithmApi.getDispatchLogs()
    if (response.data.success) {
      dispatchLogs.value = response.data.body.logs || []
    }
  } catch (error) {
    ElMessage.error('获取下发日志失败：' + error.message)
  } finally {
    logsLoading.value = false
  }
}

const showRuleConfig = () => {
  if (!configForm.analysis_card_id) {
    ElMessage.warning('请先选择智能分析板卡')
    return
  }
  ruleConfigVisible.value = true
}

const addRule = () => {
  showRuleConfig()
}

const editRule = (index) => {
  editingRuleIndex.value = index
  const rule = configForm.rules[index]
  Object.assign(ruleForm, rule)
  ruleConfigVisible.value = true
}

const deleteRule = (index) => {
  configForm.rules.splice(index, 1)
}

const saveRule = () => {
  if (editingRuleIndex.value >= 0) {
    Object.assign(configForm.rules[editingRuleIndex.value], ruleForm)
    editingRuleIndex.value = -1
    } else {
    configForm.rules.push({ ...ruleForm })
  }
  ruleConfigVisible.value = false
}

const saveConfiguration = async () => {
  try {
    await configFormRef.value.validate()
    configLoading.value = true
    
    const response = await algorithmApi.configAlgorithm(configForm)
    if (response.data.success) {
      ElMessage.success('配置保存成功')
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存配置失败：' + error.message)
    }
  } finally {
    configLoading.value = false
  }
}

const resetConfigForm = () => {
  configFormRef.value?.resetFields()
  configForm.rules = []
}

const syncRulesToCard = async () => {
  try {
    syncLoading.value = true
    const response = await algorithmApi.syncRules({
      analysis_card_id: configForm.analysis_card_id,
      rules: configForm.rules
    })
    if (response.data.success) {
      ElMessage.success('规则同步成功')
    }
  } catch (error) {
    ElMessage.error('规则同步失败：' + error.message)
  } finally {
    syncLoading.value = false
  }
}

// 辅助函数
const getStatusText = (status) => {
  const statusMap = {
    'published': '已发布',
    'testing': '测试中',
    'disabled': '已禁用'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    'published': 'success',
    'testing': 'warning',
    'disabled': 'danger'
  }
  return typeMap[status] || 'info'
}

const getRuleTypeText = (ruleType) => {
  const typeMap = {
    'area_intrusion': '区域入侵',
    'line_crossing': '越线检测',
    'object_left': '物体遗留',
    'object_removed': '物体移除',
    'people_counting': '人数统计'
  }
  return typeMap[ruleType] || ruleType
}
</script>

<style scoped>
/* 算法管理页面样式 */
.algorithm-management-container {
  padding: 20px;
  max-width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dispatch-content, .config-content {
  padding: 10px 0;
}

.algorithm-option, .card-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rules-section {
  margin-top: 15px;
}

.mb-20 {
  margin-bottom: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-card__header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-alert) {
  margin-bottom: 20px;
}

:deep(.el-slider) {
  margin: 0 10px;
}
</style>

