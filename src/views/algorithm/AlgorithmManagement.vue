<template>
  <div class="algorithm-management-container tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background">
    </div>
    
    <h2>算法配置</h2>

    <!-- 算法下发 -->
    <el-card class="dispatch-card tech-card mb-20" shadow="hover">
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
                <div class="custom-select" ref="algorithmSelectRef">
                  <div class="custom-select-input" @click="toggleAlgorithmDropdown">
                    <span class="custom-select-value">{{ getAlgorithmDisplayText(dispatchForm.algorithm_version_id) }}</span>
                    <el-icon class="custom-select-arrow" :class="{ 'is-reverse': algorithmDropdownVisible }">
                      <ArrowDown />
                    </el-icon>
                  </div>
                </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
              <el-form-item label="目标板卡" prop="target_card">
                <div class="custom-select" ref="targetCardSelectRef">
                  <div class="custom-select-input" @click="toggleTargetCardDropdown">
                    <span class="custom-select-value">{{ getTargetCardDisplayText(dispatchForm.target_card) }}</span>
                    <el-icon class="custom-select-arrow" :class="{ 'is-reverse': targetCardDropdownVisible }">
                      <ArrowDown />
                    </el-icon>
                  </div>
                </div>
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
        </el-form-item>
      </el-form>
      </div>
    </el-card>

    <!-- 算法版本列表 -->
    <el-card class="algorithm-list-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>算法版本列表</span>
          <div>
            <el-button type="success" :icon="Plus" size="small" class="tech-button-sm" @click="handleAddAlgorithm">添加算法</el-button>
            <el-button type="warning" :icon="Upload" size="small" class="tech-button-sm" @click="handleBatchImport">批量导入</el-button>
            <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="getAlgorithmList">刷新列表</el-button>
          </div>
        </div>
      </template>

      <!-- 算法搜索和筛选 -->
      <div class="search-filters-card tech-card mb-20">
        <div class="search-section">
          <div class="search-filters">
            <div class="search-row">
              <div class="search-item">
                <label>算法名称</label>
                <el-input
                  v-model="algorithmFilters.name"
                  placeholder="请输入算法名称"
                  :prefix-icon="Search"
                  clearable
                  class="search-input"
                />
              </div>
              <div class="search-item">
                <label>算法状态</label>
                <div class="custom-select" ref="statusSelectRef">
                  <div class="custom-select-input" @click="toggleStatusDropdown">
                    <span class="custom-select-value">{{ getStatusDisplayText(algorithmFilters.status) }}</span>
                    <el-icon class="custom-select-arrow" :class="{ 'is-reverse': statusDropdownVisible }">
                      <ArrowDown />
                    </el-icon>
                  </div>
                </div>
              </div>
              <div class="search-item">
                <label>版本范围</label>
                <el-input
                  v-model="algorithmFilters.version"
                  placeholder="请输入版本号"
                  clearable
                  class="search-input"
                />
              </div>
            </div>
            <div class="filter-actions">
              <el-button type="primary" :icon="Search" class="tech-button-sm" @click="searchAlgorithms">搜索</el-button>
              <el-button :icon="RefreshRight" class="tech-button-sm" @click="resetAlgorithmFilters">重置</el-button>
            </div>
          </div>
        </div>
      </div>

      <el-table :data="paginatedAlgorithms" v-loading="loading" stripe class="tech-table" style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80" align="center" header-align="center"></el-table-column>
        <el-table-column prop="name" label="算法名称" min-width="150" header-align="center"></el-table-column>
        <el-table-column prop="version" label="版本号" width="120" align="center" header-align="center"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" header-align="center"></el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="model_size" label="模型大小" width="120" align="center" header-align="center">
          <template #default="{ row }">
            {{ formatFileSize(row.model_size) }}
          </template>
        </el-table-column>
        <el-table-column prop="accuracy" label="准确率" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <span v-if="row.accuracy">{{ (row.accuracy * 100).toFixed(1) }}%</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="180" header-align="center"></el-table-column>
        <el-table-column label="操作" width="280" align="center" header-align="center">
          <template #default="{ row }">
            <el-button type="primary" :icon="View" size="small" class="tech-button-xs" @click="handleViewAlgorithm(row)">查看</el-button>
            <el-button type="warning" :icon="Edit" size="small" class="tech-button-xs" @click="handleEditAlgorithm(row)">编辑</el-button>
            <el-button type="success" :icon="Download" size="small" class="tech-button-xs" @click="handleDownloadAlgorithm(row)">下载</el-button>
            <el-button 
              v-if="row.status !== 'published'" 
              type="info" 
              :icon="Promotion" 
              size="small" 
              class="tech-button-xs" 
              @click="handlePublishAlgorithm(row)"
            >
              发布
            </el-button>
            <el-button type="danger" :icon="Delete" size="small" class="tech-button-xs" @click="handleDeleteAlgorithm(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container tech-pagination">
        <el-pagination
          v-model:current-page="algorithmPagination.currentPage"
          v-model:page-size="algorithmPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredAlgorithms.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleAlgorithmSizeChange"
          @current-change="handleAlgorithmCurrentChange"
        />
      </div>
    </el-card>

    <!-- 算法配置 -->
    <el-card class="config-card tech-card mb-20" shadow="hover">
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
                <div class="custom-select" ref="analysisCardSelectRef">
                  <div class="custom-select-input" @click="toggleAnalysisCardDropdown">
                    <span class="custom-select-value">{{ getAnalysisCardDisplayText(configForm.analysis_card_id) }}</span>
                    <el-icon class="custom-select-arrow" :class="{ 'is-reverse': analysisCardDropdownVisible }">
                      <ArrowDown />
                    </el-icon>
                  </div>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="视频通道" prop="channel">
                <div class="custom-select" ref="channelSelectRef">
                  <div class="custom-select-input" @click="toggleChannelDropdown">
                    <span class="custom-select-value">{{ getChannelDisplayText(configForm.channel) }}</span>
                    <el-icon class="custom-select-arrow" :class="{ 'is-reverse': channelDropdownVisible }">
                      <ArrowDown />
                    </el-icon>
                  </div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="检测规则">
            <el-button type="primary" :icon="Plus" @click="addRule" :disabled="!configForm.analysis_card_id">添加规则</el-button>
          </el-form-item>
          
          <!-- 规则列表 -->
          <div v-if="configForm.rules.length > 0" class="rules-section">
            <el-table :data="configForm.rules" size="small">
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
          <div class="custom-select" ref="ruleTypeSelectRef">
            <div class="custom-select-input" @click="toggleRuleTypeDropdown">
              <span class="custom-select-value">{{ getRuleTypeDisplayText(ruleForm.rule_type) }}</span>
              <el-icon class="custom-select-arrow" :class="{ 'is-reverse': ruleTypeDropdownVisible }">
                <ArrowDown />
              </el-icon>
            </div>
          </div>
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

  </div>

  <!-- 状态下拉框 - 使用Teleport渲染到body -->
  <Teleport to="body">
    <div 
      class="custom-select-dropdown-teleport" 
      v-show="statusDropdownVisible"
      :style="dropdownStyle"
    >
      <div 
        class="custom-select-option" 
        :class="{ 'is-selected': algorithmFilters.status === '' }"
        @click.stop="selectStatus('')"
      >
        全部
      </div>
      <div 
        class="custom-select-option" 
        :class="{ 'is-selected': algorithmFilters.status === 'published' }"
        @click.stop="selectStatus('published')"
      >
        已发布
      </div>
      <div 
        class="custom-select-option" 
        :class="{ 'is-selected': algorithmFilters.status === 'testing' }"
        @click.stop="selectStatus('testing')"
      >
        测试中
      </div>
      <div 
        class="custom-select-option" 
        :class="{ 'is-selected': algorithmFilters.status === 'disabled' }"
        @click.stop="selectStatus('disabled')"
      >
        已禁用
      </div>
    </div>
  </Teleport>

  <!-- 算法版本下拉框 -->
  <Teleport to="body">
    <div 
      class="custom-select-dropdown-teleport" 
      v-show="algorithmDropdownVisible"
      :style="getDropdownStyle(algorithmSelectRef, algorithmDropdownVisible)"
    >
      <template v-for="group in algorithmGroups" :key="group.name">
        <div class="custom-select-group-title">{{ group.name }}</div>
        <div 
          v-for="version in group.versions"
          :key="version.id"
          class="custom-select-option" 
          :class="{ 'is-selected': dispatchForm.algorithm_version_id === version.id }"
          @click.stop="selectAlgorithm(version.id)"
        >
          <span>{{ version.name }} {{ version.version }}</span>
          <el-tag size="small" :type="getStatusType(version.status)">{{ getStatusText(version.status) }}</el-tag>
        </div>
      </template>
    </div>
  </Teleport>

  <!-- 目标板卡下拉框 -->
  <Teleport to="body">
    <div 
      class="custom-select-dropdown-teleport" 
      v-show="targetCardDropdownVisible"
      :style="getDropdownStyle(targetCardSelectRef, targetCardDropdownVisible)"
    >
      <div 
        v-for="card in analysisCards"
        :key="card.id"
        class="custom-select-option" 
        :class="{ 'is-selected': dispatchForm.target_card === card.id }"
        @click.stop="selectTargetCard(card.id)"
      >
        <span>{{ card.name }}</span>
        <el-tag size="small" :type="card.status === '在线' ? 'success' : 'danger'">{{ card.status }}</el-tag>
      </div>
    </div>
  </Teleport>

  <!-- 分析板卡下拉框 -->
  <Teleport to="body">
    <div 
      class="custom-select-dropdown-teleport" 
      v-show="analysisCardDropdownVisible"
      :style="getDropdownStyle(analysisCardSelectRef, analysisCardDropdownVisible)"
    >
      <div 
        v-for="card in analysisCards"
        :key="card.id"
        class="custom-select-option" 
        :class="{ 'is-selected': configForm.analysis_card_id === card.id }"
        @click.stop="selectAnalysisCard(card.id)"
      >
        {{ card.name }}
      </div>
    </div>
  </Teleport>

  <!-- 视频通道下拉框 -->
  <Teleport to="body">
    <div 
      class="custom-select-dropdown-teleport" 
      v-show="channelDropdownVisible"
      :style="getDropdownStyle(channelSelectRef, channelDropdownVisible)"
    >
      <div 
        v-for="n in 8"
        :key="n"
        class="custom-select-option" 
        :class="{ 'is-selected': configForm.channel === n }"
        @click.stop="selectChannel(n)"
      >
        通道 {{ n }}
      </div>
    </div>
  </Teleport>

  <!-- 规则类型下拉框 -->
  <Teleport to="body">
    <div 
      class="custom-select-dropdown-teleport" 
      v-show="ruleTypeDropdownVisible"
      :style="getDropdownStyle(ruleTypeSelectRef, ruleTypeDropdownVisible)"
    >
      <div 
        class="custom-select-option" 
        :class="{ 'is-selected': ruleForm.rule_type === 'area_intrusion' }"
        @click.stop="selectRuleType('area_intrusion')"
      >
        区域入侵
      </div>
      <div 
        class="custom-select-option" 
        :class="{ 'is-selected': ruleForm.rule_type === 'line_crossing' }"
        @click.stop="selectRuleType('line_crossing')"
      >
        越线检测
      </div>
      <div 
        class="custom-select-option" 
        :class="{ 'is-selected': ruleForm.rule_type === 'object_left' }"
        @click.stop="selectRuleType('object_left')"
      >
        物体遗留
      </div>
      <div 
        class="custom-select-option" 
        :class="{ 'is-selected': ruleForm.rule_type === 'object_removed' }"
        @click.stop="selectRuleType('object_removed')"
      >
        物体移除
      </div>
      <div 
        class="custom-select-option" 
        :class="{ 'is-selected': ruleForm.rule_type === 'people_counting' }"
        @click.stop="selectRuleType('people_counting')"
      >
        人数统计
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Promotion, Refresh, Setting, Plus, Edit, Delete, Check,
  Search, RefreshRight, View, Download, Upload, ArrowDown
} from '@element-plus/icons-vue'
import { algorithmApi } from '@/api/algorithm'

// 响应式数据
const dispatchLoading = ref(false)
const configLoading = ref(false)
const syncLoading = ref(false)
const batchLoading = ref(false)
const loading = ref(false)

const batchDispatchVisible = ref(false)
const ruleConfigVisible = ref(false)
const statusDropdownVisible = ref(false)
const statusSelectRef = ref()

// 其他下拉框状态
const algorithmDropdownVisible = ref(false)
const algorithmSelectRef = ref()
const targetCardDropdownVisible = ref(false)
const targetCardSelectRef = ref()
const analysisCardDropdownVisible = ref(false)
const analysisCardSelectRef = ref()
const channelDropdownVisible = ref(false)
const channelSelectRef = ref()
const ruleTypeDropdownVisible = ref(false)
const ruleTypeSelectRef = ref()

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
const editingRuleIndex = ref(-1)

// 算法列表相关数据
const algorithmFilters = reactive({
  name: '',
  status: '',
  version: ''
})

const algorithmPagination = reactive({
  currentPage: 1,
  pageSize: 10
})

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

// 算法列表相关计算属性
const filteredAlgorithms = computed(() => {
  let filtered = algorithmList.value
  
  if (algorithmFilters.name) {
    filtered = filtered.filter(algo => 
      algo.name.toLowerCase().includes(algorithmFilters.name.toLowerCase())
    )
  }
  
  if (algorithmFilters.status) {
    filtered = filtered.filter(algo => algo.status === algorithmFilters.status)
  }
  
  if (algorithmFilters.version) {
    filtered = filtered.filter(algo => 
      algo.version.includes(algorithmFilters.version)
    )
  }
  
  return filtered
})

const paginatedAlgorithms = computed(() => {
  const start = (algorithmPagination.currentPage - 1) * algorithmPagination.pageSize
  const end = start + algorithmPagination.pageSize
  return filteredAlgorithms.value.slice(start, end)
})

// 下拉框位置计算
const dropdownStyle = computed(() => {
  if (!statusDropdownVisible.value || !statusSelectRef.value) {
    return {}
  }
  
  const rect = statusSelectRef.value.getBoundingClientRect()
  return {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 9999
  }
})

// 通用下拉框位置计算
const getDropdownStyle = (selectRef, visible) => {
  if (!visible || !selectRef) {
    return {}
  }
  
  const rect = selectRef.getBoundingClientRect()
  return {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 9999
  }
}

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
  
  // 点击外部关闭下拉框
  document.addEventListener('click', (e) => {
    if (statusSelectRef.value && !statusSelectRef.value.contains(e.target)) {
      statusDropdownVisible.value = false
    }
    if (algorithmSelectRef.value && !algorithmSelectRef.value.contains(e.target)) {
      algorithmDropdownVisible.value = false
    }
    if (targetCardSelectRef.value && !targetCardSelectRef.value.contains(e.target)) {
      targetCardDropdownVisible.value = false
    }
    if (analysisCardSelectRef.value && !analysisCardSelectRef.value.contains(e.target)) {
      analysisCardDropdownVisible.value = false
    }
    if (channelSelectRef.value && !channelSelectRef.value.contains(e.target)) {
      channelDropdownVisible.value = false
    }
    if (ruleTypeSelectRef.value && !ruleTypeSelectRef.value.contains(e.target)) {
      ruleTypeDropdownVisible.value = false
    }
  })
})

// 方法
const getAlgorithmList = async () => {
  try {
    const response = await algorithmApi.getAlgorithmList()
    console.log('🔍 算法API完整响应:', response)
    console.log('🔍 response.data:', response.data)
    console.log('🔍 response.data.algorithms:', response.data?.algorithms)
    console.log('🔍 response.body:', response.body)
    
    if (response.success) {
      // 适配新的响应格式
      const algorithms = response.data?.algorithms || response.body?.algorithms || []
      console.log('🎯 提取的算法数据:', algorithms)
      console.log('🎯 算法数据长度:', algorithms.length)
      
      algorithmList.value = algorithms
      console.log('✅ 最终设置的算法列表:', algorithmList.value)
    } else {
      console.error('❌ API响应失败:', response)
      ElMessage.error(response.message || '获取算法列表失败')
    }
  } catch (error) {
    console.error('❌ 算法API错误:', error)
    ElMessage.error('获取算法列表失败：' + error.message)
  }
}

const getAnalysisCards = async () => {
  try {
    const response = await algorithmApi.getAnalysisCards()
    console.log('🔍 分析板卡API完整响应:', response)
    console.log('🔍 response.data:', response.data)
    console.log('🔍 response.data.analysis_cards:', response.data?.analysis_cards)
    
    if (response.success) {
      // 适配新的响应格式
      const cards = response.data?.analysis_cards || response.body?.analysis_cards || []
      console.log('🎯 提取的分析板卡数据:', cards)
      console.log('🎯 分析板卡数据长度:', cards.length)
      
      analysisCards.value = cards
      console.log('✅ 最终设置的分析板卡列表:', analysisCards.value)
    } else {
      console.error('❌ 分析板卡API响应失败:', response)
    }
  } catch (error) {
    console.error('❌ 分析板卡API错误:', error)
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

// 算法列表相关方法
const searchAlgorithms = () => {
  algorithmPagination.currentPage = 1
}

const resetAlgorithmFilters = () => {
  algorithmFilters.name = ''
  algorithmFilters.status = ''
  algorithmFilters.version = ''
  algorithmPagination.currentPage = 1
  statusDropdownVisible.value = false
}

// 自定义下拉框方法
const toggleStatusDropdown = () => {
  statusDropdownVisible.value = !statusDropdownVisible.value
  // 强制重新计算位置
  if (statusDropdownVisible.value) {
    setTimeout(() => {
      // 触发位置重新计算
    }, 0)
  }
}

// 其他下拉框toggle方法
const toggleAlgorithmDropdown = () => {
  algorithmDropdownVisible.value = !algorithmDropdownVisible.value
}

const toggleTargetCardDropdown = () => {
  targetCardDropdownVisible.value = !targetCardDropdownVisible.value
}

const toggleAnalysisCardDropdown = () => {
  analysisCardDropdownVisible.value = !analysisCardDropdownVisible.value
}

const toggleChannelDropdown = () => {
  channelDropdownVisible.value = !channelDropdownVisible.value
}

const toggleRuleTypeDropdown = () => {
  ruleTypeDropdownVisible.value = !ruleTypeDropdownVisible.value
}

const selectStatus = (value) => {
  algorithmFilters.status = value
  statusDropdownVisible.value = false
  searchAlgorithms()
}

// 其他下拉框选择函数
const selectAlgorithm = (algorithmId) => {
  dispatchForm.algorithm_version_id = algorithmId
  algorithmDropdownVisible.value = false
  onAlgorithmChange()
}

const selectTargetCard = (cardId) => {
  dispatchForm.target_card = cardId
  targetCardDropdownVisible.value = false
}

const selectAnalysisCard = (cardId) => {
  configForm.analysis_card_id = cardId
  analysisCardDropdownVisible.value = false
  onCardChange()
}

const selectChannel = (channel) => {
  configForm.channel = channel
  channelDropdownVisible.value = false
}

const selectRuleType = (ruleType) => {
  ruleForm.rule_type = ruleType
  ruleTypeDropdownVisible.value = false
}

const getStatusDisplayText = (status) => {
  const statusMap = {
    '': '全部',
    'published': '已发布',
    'testing': '测试中',
    'disabled': '已禁用'
  }
  return statusMap[status] || '请选择状态'
}

// 其他下拉框显示文本函数
const getAlgorithmDisplayText = (algorithmId) => {
  if (!algorithmId) return '请选择算法版本'
  for (const group of algorithmGroups.value) {
    const version = group.versions.find(v => v.id === algorithmId)
    if (version) {
      return `${version.name} ${version.version}`
    }
  }
  return '请选择算法版本'
}

const getTargetCardDisplayText = (cardId) => {
  if (!cardId) return '请选择智能分析板卡'
  const card = analysisCards.value.find(c => c.id === cardId)
  return card ? card.name : '请选择智能分析板卡'
}

const getAnalysisCardDisplayText = (cardId) => {
  if (!cardId) return '请选择智能分析板卡'
  const card = analysisCards.value.find(c => c.id === cardId)
  return card ? card.name : '请选择智能分析板卡'
}

const getChannelDisplayText = (channel) => {
  if (!channel) return '请选择视频通道'
  return `通道 ${channel}`
}

const getRuleTypeDisplayText = (ruleType) => {
  const ruleTypeMap = {
    '': '请选择规则类型',
    'area_intrusion': '区域入侵',
    'line_crossing': '越线检测',
    'object_left': '物体遗留',
    'object_removed': '物体移除',
    'people_counting': '人数统计'
  }
  return ruleTypeMap[ruleType] || '请选择规则类型'
}

const handleAlgorithmSizeChange = (size) => {
  algorithmPagination.pageSize = size
  algorithmPagination.currentPage = 1
}

const handleAlgorithmCurrentChange = (page) => {
  algorithmPagination.currentPage = page
}

const handleAddAlgorithm = () => {
  ElMessage.info('添加算法功能开发中...')
}

const handleBatchImport = () => {
  ElMessage.info('批量导入功能开发中...')
}

const handleViewAlgorithm = (row) => {
  ElMessage.info(`查看算法：${row.name} ${row.version}`)
}

const handleEditAlgorithm = (row) => {
  ElMessage.info(`编辑算法：${row.name} ${row.version}`)
}

const handleDownloadAlgorithm = (row) => {
  ElMessage.info(`下载算法：${row.name} ${row.version}`)
}

const handlePublishAlgorithm = (row) => {
  ElMessage.info(`发布算法：${row.name} ${row.version}`)
}

const handleDeleteAlgorithm = (row) => {
  ElMessageBox.confirm(`确定要删除算法 ${row.name} ${row.version} 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 辅助函数
const formatFileSize = (bytes) => {
  if (!bytes) return '-'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

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
/* 确保页面可以滚动 */
html, body {
  overflow: visible !important;
  height: auto !important;
}

.sub-page-content {
  overflow: visible !important;
  height: auto !important;
}
/* 算法管理页面样式 */
.algorithm-management-container {
  padding: 20px 20px 40px 20px;
  max-width: 100%;
  height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-sizing: border-box;
  /* Firefox 滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 255, 255, 0.3) rgba(0, 255, 255, 0.1);
  /* 确保滚动条始终可见 */
  scrollbar-gutter: stable;
  scroll-behavior: smooth;
}

/* 科技感背景 */
.tech-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(0, 255, 255, 0.02) 0%, transparent 50%);
  pointer-events: none;
  z-index: 1;
}

.tech-page-container {
  position: relative;
  z-index: 10;
}

/* 标题样式 */
.algorithm-management-container h2 {
  margin: 24px 0 20px 0;
  color: #00ffff;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  position: relative;
  z-index: 10;
  flex-shrink: 0;
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

/* 科技感卡片样式 */
.tech-card {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
  flex-shrink: 0;
}

.tech-card :deep(.el-card__header) {
  background: rgba(20, 30, 50, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
  color: #00ffff !important;
  padding: 16px 20px !important;
}

.tech-card :deep(.el-card__body) {
  background: rgba(15, 25, 45, 0.95) !important;
  padding: 20px !important;
  border-radius: 0 0 12px 12px !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

/* Element Plus 组件深色主题样式 */
:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8) !important;
  line-height: 28px !important;
  display: flex !important;
  align-items: center !important;
}

/* 确保表单项内容与标签对齐 */
:deep(.el-form-item__content) {
  display: flex !important;
  align-items: center !important;
}

/* 算法配置区域按钮样式优化 */
.dispatch-card :deep(.el-button),
.config-card :deep(.el-button) {
  font-weight: 500 !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  margin: 0 6px 0 0 !important;
  min-height: 36px !important;
  padding: 8px 16px !important;
}

/* 主要操作按钮 - 蓝色系 */
.dispatch-card :deep(.el-button--primary),
.config-card :deep(.el-button--primary) {
  background: linear-gradient(135deg, #409eff 0%, #1890ff 100%) !important;
  border: 1px solid #409eff !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3) !important;
}

.dispatch-card :deep(.el-button--primary:hover),
.config-card :deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #66b1ff 0%, #40a9ff 100%) !important;
  border-color: #66b1ff !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4) !important;
  transform: translateY(-1px) !important;
}

/* 成功操作按钮 - 绿色系 */
.dispatch-card :deep(.el-button--success),
.config-card :deep(.el-button--success) {
  background: linear-gradient(135deg, #67c23a 0%, #52c41a 100%) !important;
  border: 1px solid #67c23a !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3) !important;
}

.dispatch-card :deep(.el-button--success:hover),
.config-card :deep(.el-button--success:hover) {
  background: linear-gradient(135deg, #85ce61 0%, #73d13d 100%) !important;
  border-color: #85ce61 !important;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4) !important;
  transform: translateY(-1px) !important;
}

/* 警告操作按钮 - 橙色系 */
.dispatch-card :deep(.el-button--warning),
.config-card :deep(.el-button--warning) {
  background: linear-gradient(135deg, #e6a23c 0%, #fa8c16 100%) !important;
  border: 1px solid #e6a23c !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(230, 162, 60, 0.3) !important;
}

.dispatch-card :deep(.el-button--warning:hover),
.config-card :deep(.el-button--warning:hover) {
  background: linear-gradient(135deg, #ebb563 0%, #ffa940 100%) !important;
  border-color: #ebb563 !important;
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.4) !important;
  transform: translateY(-1px) !important;
}

/* 信息操作按钮 - 灰蓝色系 */
.dispatch-card :deep(.el-button--info),
.config-card :deep(.el-button--info) {
  background: linear-gradient(135deg, #909399 0%, #8c8c8c 100%) !important;
  border: 1px solid #909399 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(144, 147, 153, 0.3) !important;
}

.dispatch-card :deep(.el-button--info:hover),
.config-card :deep(.el-button--info:hover) {
  background: linear-gradient(135deg, #a6a9ad 0%, #a6a6a6 100%) !important;
  border-color: #a6a9ad !important;
  box-shadow: 0 4px 12px rgba(144, 147, 153, 0.4) !important;
  transform: translateY(-1px) !important;
}

/* 默认按钮（重置等） - 深色主题 */
.dispatch-card :deep(.el-button--default),
.config-card :deep(.el-button--default) {
  background: rgba(30, 40, 60, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  color: #00ffff !important;
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2) !important;
}

.dispatch-card :deep(.el-button--default:hover),
.config-card :deep(.el-button--default:hover) {
  background: rgba(40, 50, 70, 0.9) !important;
  border-color: rgba(0, 255, 255, 0.6) !important;
  box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3) !important;
  transform: translateY(-1px) !important;
}

/* 禁用状态 */
.dispatch-card :deep(.el-button.is-disabled),
.config-card :deep(.el-button.is-disabled) {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}

/* 加载状态 */
.dispatch-card :deep(.el-button.is-loading),
.config-card :deep(.el-button.is-loading) {
  pointer-events: none !important;
}

:deep(.el-input__wrapper) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
  box-shadow: none !important;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.4) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #00ffff !important;
  box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-input__inner) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}

/* 下拉选择器样式 - 完整的主题色方案 */
:deep(.el-select .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

:deep(.el-select .el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.4) !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #00ffff !important;
  box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-select .el-input__inner) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-select .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}

:deep(.el-select .el-input__suffix) {
  color: rgba(0, 255, 255, 0.7) !important;
}

:deep(.el-select .el-input__suffix .el-icon) {
  color: rgba(0, 255, 255, 0.7) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-select .el-input__suffix .el-icon:hover) {
  color: #00ffff !important;
}

:deep(.el-select-dropdown) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 8px !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border: none !important;
  padding: 8px 12px !important;
  margin: 2px 4px !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
  transform: translateX(2px) !important;
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  font-weight: 600 !important;
  box-shadow: inset 2px 0 0 #00ffff !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item.is-disabled) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.3) !important;
}

/* 下拉框滚动条样式 */
:deep(.el-select-dropdown .el-scrollbar__wrap) {
  background: transparent !important;
}

:deep(.el-select-dropdown .el-scrollbar__bar) {
  background: rgba(0, 255, 255, 0.3) !important;
  border-radius: 4px !important;
}

:deep(.el-select-dropdown .el-scrollbar__thumb) {
  background: rgba(0, 255, 255, 0.6) !important;
  border-radius: 4px !important;
}

:deep(.el-select-dropdown .el-scrollbar__thumb:hover) {
  background: #00ffff !important;
}

:deep(.el-option-group) {
  background: transparent !important;
}

:deep(.el-option-group__title) {
  color: rgba(0, 255, 255, 0.8) !important;
  background: rgba(20, 30, 50, 0.4) !important;
}

:deep(.el-switch__core) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-switch.is-checked .el-switch__core) {
  background: rgba(0, 150, 200, 0.8) !important;
  border-color: #00ffff !important;
}

:deep(.el-switch__label) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-switch__label.is-active) {
  color: #00ffff !important;
}

:deep(.el-slider__runway) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-slider__bar) {
  background: linear-gradient(90deg, rgba(0, 150, 200, 0.8), #00ffff) !important;
}

:deep(.el-slider__button) {
  background: #00ffff !important;
  border: 2px solid rgba(0, 255, 255, 0.6) !important;
}

:deep(.el-slider__button:hover) {
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-slider) {
  margin: 0 10px;
}

:deep(.el-alert) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  margin-bottom: 20px;
}

:deep(.el-alert__title) {
  color: #00ffff !important;
}

:deep(.el-alert__description) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-alert__icon) {
  color: rgba(0, 255, 255, 0.7) !important;
}

:deep(.el-tag) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-tag--primary) {
  background: rgba(0, 150, 200, 0.6) !important;
  border-color: rgba(0, 200, 255, 0.5) !important;
  color: #ffffff !important;
}

:deep(.el-tag--success) {
  background: rgba(103, 194, 58, 0.6) !important;
  border-color: rgba(103, 194, 58, 0.5) !important;
  color: #ffffff !important;
}

:deep(.el-tag--warning) {
  background: rgba(230, 162, 60, 0.6) !important;
  border-color: rgba(230, 162, 60, 0.5) !important;
  color: #ffffff !important;
}

:deep(.el-tag--danger) {
  background: rgba(245, 108, 108, 0.6) !important;
  border-color: rgba(245, 108, 108, 0.5) !important;
  color: #ffffff !important;
}

:deep(.el-tag--info) {
  background: rgba(144, 147, 153, 0.6) !important;
  border-color: rgba(144, 147, 153, 0.5) !important;
  color: #ffffff !important;
}

/* 对话框样式 */
:deep(.el-dialog) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.el-dialog__header) {
  background: rgba(20, 30, 50, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
}

:deep(.el-dialog__title) {
  color: #00ffff !important;
}

:deep(.el-dialog__body) {
  background: rgba(15, 25, 45, 0.95) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-dialog__footer) {
  background: rgba(15, 25, 45, 0.95) !important;
  border-top: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 0 0 12px 12px !important;
}

/* 搜索筛选区域样式 */
.search-filters-card {
  background: rgba(20, 30, 50, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.15) !important;
  border-radius: 8px !important;
  padding: 16px !important;
  margin-bottom: 16px !important;
  backdrop-filter: blur(5px) !important;
}

.search-section {
  width: 100%;
}

.search-filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.search-item {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-item label {
  font-size: 13px;
  color: rgba(0, 255, 255, 0.8) !important;
  font-weight: 500;
  margin: 0;
}

.search-input {
  min-width: 180px;
}

.search-select {
  min-width: 140px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

/* 自定义下拉选择器样式 */
.custom-select {
  position: relative;
  min-width: 140px;
  width: 100%;
  cursor: pointer;
  overflow: visible !important;
  height: 32px;
  display: flex;
  align-items: center;
}

/* 确保搜索区域不会裁剪下拉框 */
.search-filters-card,
.search-section,
.search-filters,
.search-row,
.search-item {
  overflow: visible !important;
}

.custom-select-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
  padding: 0 12px;
  color: rgba(255, 255, 255, 0.9) !important;
  transition: all 0.3s ease;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.custom-select-input:hover {
  border-color: rgba(0, 255, 255, 0.4) !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.1) !important;
}

.custom-select-value {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.custom-select-arrow {
  color: rgba(0, 255, 255, 0.7) !important;
  transition: all 0.3s ease !important;
  margin-left: 8px;
}

.custom-select-arrow.is-reverse {
  transform: rotate(180deg);
}

.custom-select-dropdown {
  /* 位置由动态style控制 */
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  padding: 4px 0 !important;
}

.custom-select-option {
  display: block !important;
  padding: 8px 12px !important;
  color: rgba(255, 255, 255, 0.8) !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  margin: 2px 4px !important;
  border-radius: 4px !important;
  font-size: 14px !important;
  white-space: nowrap !important;
  min-height: 32px !important;
  line-height: 1.2 !important;
  width: auto !important;
  height: auto !important;
  overflow: visible !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.custom-select-option:hover {
  background: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2);
}

.custom-select-option.is-selected {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  font-weight: 600;
  box-shadow: inset 2px 0 0 #00ffff;
}

.custom-select-option.is-selected:hover {
  background: rgba(0, 255, 255, 0.25) !important;
}

/* 主容器科技感滚动条样式 - 与左侧菜单栏一致 */
.algorithm-management-container::-webkit-scrollbar {
  width: 8px;
  background: rgba(0, 0, 0, 0.1);
}

.algorithm-management-container::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.05);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.algorithm-management-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.3) 0%, 
    rgba(0, 200, 255, 0.5) 50%, 
    rgba(0, 255, 255, 0.3) 100%);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: inset 0 0 6px rgba(0, 255, 255, 0.1);
}

.algorithm-management-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.5) 0%, 
    rgba(0, 200, 255, 0.7) 50%, 
    rgba(0, 255, 255, 0.5) 100%);
  box-shadow: 
    inset 0 0 6px rgba(0, 255, 255, 0.2),
    0 0 15px rgba(0, 255, 255, 0.4);
}

.algorithm-management-container::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.7) 0%, 
    rgba(0, 200, 255, 0.9) 50%, 
    rgba(0, 255, 255, 0.7) 100%);
  box-shadow: 
    inset 0 0 6px rgba(0, 255, 255, 0.3),
    0 0 20px rgba(0, 255, 255, 0.6);
}

/* 下拉框滚动条样式 */
.custom-select-dropdown::-webkit-scrollbar {
  width: 6px;
}

.custom-select-dropdown::-webkit-scrollbar-track {
  background: rgba(20, 30, 50, 0.4);
  border-radius: 3px;
}

.custom-select-dropdown::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.6);
  border-radius: 3px;
}

.custom-select-dropdown::-webkit-scrollbar-thumb:hover {
  background: #00ffff;
}

/* Teleport下拉框样式 */
.custom-select-dropdown-teleport {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
  padding: 4px 0 !important;
  min-width: 140px;
}

.custom-select-dropdown-teleport .custom-select-option {
  display: block !important;
  padding: 8px 12px !important;
  color: rgba(255, 255, 255, 0.8) !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  margin: 2px 4px !important;
  border-radius: 4px !important;
  font-size: 14px !important;
  white-space: nowrap !important;
  min-height: 32px !important;
  line-height: 1.2 !important;
}

.custom-select-dropdown-teleport .custom-select-option:hover {
  background: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2);
}

.custom-select-dropdown-teleport .custom-select-option.is-selected {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  font-weight: 600;
  box-shadow: inset 2px 0 0 #00ffff;
}

.custom-select-dropdown-teleport .custom-select-option.is-selected:hover {
  background: rgba(0, 255, 255, 0.25) !important;
}

/* 下拉框分组标题样式 */
.custom-select-group-title {
  padding: 8px 12px 4px 12px;
  color: rgba(0, 255, 255, 0.8) !important;
  font-size: 12px;
  font-weight: 600;
  background: rgba(20, 30, 50, 0.4) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  margin: 2px 4px;
  border-radius: 4px 4px 0 0;
}

/* 算法选项内的标签样式优化 */
.custom-select-dropdown-teleport .custom-select-option {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}

/* 科技感按钮样式 */
.tech-button-sm {
  font-size: 13px !important;
  padding: 6px 12px !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  margin: 0 4px !important;
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

/* 移除表格外层和内层的所有白色边框 */
.tech-table :deep(.el-table__cell) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
}

.tech-table :deep(.el-table__cell::before) {
  display: none !important;
}

.tech-table :deep(.el-table__cell::after) {
  display: none !important;
}

/* 移除表格行的边框 */
.tech-table :deep(.el-table__row) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
}

/* 移除所有可能的外边框元素 */
.tech-table :deep(.el-table-v2__main) {
  border: none !important;
}

.tech-table :deep(.el-table-v2__border) {
  display: none !important;
}

/* 移除表格wrapper的边框 */
.tech-table :deep(.el-table__wrapper) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
}

/* 额外确保没有其他边框样式 */
.tech-table :deep(*) {
  border-left: none !important;
  border-right: none !important;
}

/* 强制移除表格根元素的边框 */
.tech-table:deep() {
  border: none !important;
}

.tech-table {
  border: none !important;
  outline: none !important;
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
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border: none !important;
  border-bottom: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.05) !important;
  padding: 12px !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body td:last-child) {
  border-right: none !important;
}

/* 分页器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.tech-pagination :deep(.el-pagination) {
  background: transparent !important;
}

.tech-pagination :deep(.el-pagination .el-pagination__total) {
  color: rgba(255, 255, 255, 0.8) !important;
}

.tech-pagination :deep(.el-pagination .el-pagination__sizes .el-select) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
}

.tech-pagination :deep(.el-pagination .btn-prev),
.tech-pagination :deep(.el-pagination .btn-next) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 6px !important;
}

.tech-pagination :deep(.el-pagination .btn-prev:hover),
.tech-pagination :deep(.el-pagination .btn-next:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

.tech-pagination :deep(.el-pagination .el-pager li) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 6px !important;
  margin: 0 2px !important;
}

.tech-pagination :deep(.el-pagination .el-pager li:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

.tech-pagination :deep(.el-pagination .el-pager li.is-active) {
  background: rgba(0, 200, 255, 0.8) !important;
  border-color: #00ffff !important;
  color: #ffffff !important;
}

.tech-pagination :deep(.el-pagination .el-pagination__jump) {
  color: rgba(255, 255, 255, 0.8) !important;
}

.tech-pagination :deep(.el-pagination .el-pagination__jump .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
}
</style>

