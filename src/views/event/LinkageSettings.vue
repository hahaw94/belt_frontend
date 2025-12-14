<template>
  <div class="linkage-settings tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background"></div>
    
    <h2>{{ $t('event.linkage.title') }}</h2>
    
    <!-- Tab切换 -->
    <el-tabs v-model="activeTab" class="linkage-tabs tech-tabs" @tab-change="handleTabChange">
      <!-- 联动预案Tab -->
      <el-tab-pane :label="$t('event.linkage.linkagePlan')" name="plans">
        <!-- 联动预案列表 -->
        <el-card class="tech-card mb-20" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>{{ $t('event.linkage.linkagePlan') }}</span>
              <div>
                <el-button type="success" :icon="Plus" size="small" class="tech-button-sm" @click="handleAddPlan">{{ $t('event.linkage.createPlan') }}</el-button>
                <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="loadPlans">{{ $t('common.refresh') }}</el-button>
              </div>
            </div>
          </template>

      <el-table
        :data="paginatedPlans"
        v-loading="loading"
        border
        stripe
        class="tech-table"
        style="width: 100%;"
      >
        <el-table-column prop="plan_code" :label="$t('common.code')" width="240" align="center" header-align="center" />
        <el-table-column prop="plan_name" :label="$t('event.linkage.planName')" min-width="150" header-align="center" show-overflow-tooltip />
        <el-table-column prop="category" :label="$t('common.type')" width="120" header-align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ getCategoryText(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rule_items" :label="$t('event.linkage.ruleItem')" width="150" align="center" header-align="center">
          <template #default="{ row }">
            {{ row.rule_items ? row.rule_items.length : 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('common.status')" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? $t('common.enable') : $t('common.disable') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" :label="$t('common.createTime')" width="180" header-align="center">
          <template #default="{ row }">
            {{ formatDate(row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" :label="$t('common.operation')" width="280" align="center" header-align="center">
          <template #default="{ row }">
            <el-button type="success" size="small" class="tech-button-xs" @click="handleViewPlanDetail(row)">
{{ $t('common.view') }}
            </el-button>
            <el-button type="primary" size="small" class="tech-button-xs" @click="handleConfigRules(row)">
              配置
            </el-button>
            <el-button type="warning" size="small" class="tech-button-xs" @click="handleApplyPlan(row)">
              应用
            </el-button>
            <el-button type="info" size="small" class="tech-button-xs" @click="handleEditPlan(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" class="tech-button-xs" @click="handleDeletePlan(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container tech-pagination">
        <div class="pagination-info">
          <span>共 <span class="total-count">{{ pagination.total }}</span> 条记录，每页显示 
            <el-select 
              v-model="pagination.pageSize" 
              @change="handleSizeChange"
              class="page-size-select"
              size="small"
            >
              <el-option label="5" :value="5" />
              <el-option label="10" :value="10" />
              <el-option label="20" :value="20" />
              <el-option label="50" :value="50" />
            </el-select> 条
          </span>
        </div>
        <div class="pagination-controls">
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === 1"
            @click="goToPage(1)"
          >
            首页
          </el-button>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === 1"
            @click="goToPage(pagination.page - 1)"
          >
            上一页
          </el-button>
          <div class="pagination-pages">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              class="page-btn"
              :class="{ active: page === pagination.page }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === totalPages"
            @click="goToPage(pagination.page + 1)"
          >
            下一页
          </el-button>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === totalPages"
            @click="goToPage(totalPages)"
          >
            末页
          </el-button>
        </div>
      </div>
        </el-card>
      </el-tab-pane>

      <!-- 规则配置Tab -->
      <el-tab-pane label="规则配置" name="rules">
        <el-card class="tech-card mb-20" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>板卡联动规则配置</span>
              <div class="header-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  class="tech-button-sm" 
                  @click="handleSelectAll"
                  :disabled="boardRulesList.length === 0"
                >
                  {{ isAllSelected ? '取消全选' : '全选' }}
                </el-button>
                <el-button 
                  type="warning" 
                  size="small" 
                  class="tech-button-sm" 
                  @click="handleBatchConfig"
                  :disabled="selectedBoardRules.length === 0"
                >
                  批量配置 ({{ selectedBoardRules.length }})
                </el-button>
                <el-button 
                  type="success" 
                  size="small" 
                  class="tech-button-sm" 
                  @click="handleApplyPlanToSelectedBoards"
                  :disabled="selectedBoardRules.length === 0"
                >
                  应用预案 ({{ selectedBoardRules.length }})
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  class="tech-button-sm" 
                  @click="handleBatchDelete"
                  :disabled="selectedBoardRules.length === 0"
                >
                  批量删除 ({{ selectedBoardRules.length }})
                </el-button>
                <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="loadBoardRules">刷新</el-button>
              </div>
            </div>
          </template>

          <el-table
            ref="boardRulesTableRef"
            :data="boardRulesList"
            v-loading="rulesLoading"
            border
            stripe
            class="tech-table"
            style="width: 100%;"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="board_id" label="板卡ID" width="150" align="center" header-align="center" />
            <el-table-column prop="board_name" label="板卡名称" min-width="120" header-align="center" />
            <el-table-column label="规则数量" width="100" align="center" header-align="center">
              <template #default="{ row }">
                <el-tag type="info" size="small">{{ row.rules ? row.rules.length : 0 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="同步状态" width="120" align="center" header-align="center">
              <template #default="{ row }">
                <el-tag :type="getSyncStatusType(row)" size="small">
                  {{ getSyncStatusText(row) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="最后同步时间" width="180" header-align="center">
              <template #default="{ row }">
                {{ getLastSyncTime(row) }}
              </template>
            </el-table-column>
            <el-table-column label="来源预案" min-width="120" header-align="center">
              <template #default="{ row }">
                <span v-if="row.plan_name">{{ row.plan_name }}</span>
                <el-tag v-else type="info" size="small">未关联</el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="150" align="center" header-align="center">
              <template #default="{ row }">
                <el-button type="primary" size="small" class="tech-button-xs" @click="handleEditBoardRules(row)">
                  编辑规则
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增/编辑预案对话框 -->
    <el-dialog
      v-model="planDialogVisible"
      :title="isEditPlan ? '编辑预案' : '新增预案'"
      width="700px"
      :close-on-click-modal="false"
      destroy-on-close
      class="tech-dialog"
    >
      <el-form
        ref="planFormRef"
        :model="planForm"
        :rules="planRules"
        label-width="100px"
      >
        <el-form-item label="预案名称" prop="plan_name">
          <el-input v-model="planForm.plan_name" placeholder="请输入预案名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="planForm.category" placeholder="请选择分类">
            <el-option label="基于算法" value="algorithm_based" />
            <el-option label="通用预案" value="general" />
            <el-option label="组合预案" value="combined" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="planForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入预案描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="planDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSavePlan">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 规则配置对话框 -->
    <el-dialog
      v-model="ruleConfigDialogVisible"
      title="配置规则"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
      class="tech-dialog"
    >
      <div class="rule-config-content">
        <div class="rule-config-header">
          <span>预案：{{ currentPlan?.plan_name }}</span>
          <el-button type="success" size="small" :icon="Plus" @click="handleAddRuleItem">添加规则项</el-button>
        </div>
        
        <el-table
          :data="ruleItems"
          stripe
          class="tech-table"
          style="width: 100%"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="name" label="规则名称" min-width="120" header-align="center" />
          <el-table-column label="触发条件" min-width="200" header-align="center">
            <template #default="{ row }">
              <div>
                <el-tag size="small">{{ getAlarmTypeName(row.trigger_condition?.alarm_type) }}</el-tag>
                <el-tag size="small" type="warning" style="margin-left: 5px;">
                  等级{{ row.trigger_condition?.alarm_level }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="联动动作" min-width="150" header-align="center">
            <template #default="{ row }">
              <el-tag 
                v-for="(action, index) in row.linkage_actions" 
                :key="index"
                size="small"
                style="margin: 2px;"
              >
                {{ getActionTypeName(action.action_type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="{ row, $index }">
              <el-button type="primary" size="small" class="tech-button-xs" @click="handleEditRuleItem(row, $index)">
                编辑
              </el-button>
              <el-button type="danger" size="small" class="tech-button-xs" @click="handleDeleteRuleItem($index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="ruleConfigDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveRuleConfig">保存配置</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 规则项编辑对话框 -->
    <el-dialog
      v-model="ruleItemDialogVisible"
      :title="isEditRuleItem ? '编辑规则项' : '添加规则项'"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
      class="tech-dialog"
    >
      <el-form
        ref="ruleItemFormRef"
        :model="ruleItemForm"
        :rules="ruleItemRules"
        label-width="100px"
      >
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleItemForm.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="告警类型" prop="alarm_type">
          <el-select v-model="ruleItemForm.alarm_type" placeholder="请选择告警类型" style="width: 100%">
            <el-option
              v-for="type in alarmTypes"
              :key="type.id"
              :label="`${type.id} - ${type.type_name}`"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="告警等级" prop="alarm_level">
          <el-select v-model="ruleItemForm.alarm_level" placeholder="请选择告警等级" style="width: 100%">
            <el-option label="等级1（低）" :value="1" />
            <el-option label="等级2（中）" :value="2" />
            <el-option label="等级3（高）" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="联动动作" prop="action_type">
          <el-select v-model="ruleItemForm.action_type" placeholder="请选择联动动作" style="width: 100%">
            <el-option label="广播" value="broadcast" />
            <el-option label="声光报警" value="light_sound" />
            <el-option label="控制" value="control" />
          </el-select>
        </el-form-item>
        <el-form-item label="延迟执行" prop="delay_seconds">
          <el-input-number v-model="ruleItemForm.delay_seconds" :min="0" :max="300" placeholder="秒" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="ruleItemDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveRuleItem">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 应用预案对话框 -->
    <el-dialog
      v-model="applyDialogVisible"
      title="应用预案到板卡"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
      class="tech-dialog"
    >
      <el-form label-width="100px">
        <el-form-item label="预案名称">
          <el-input :value="currentPlan?.plan_name" disabled />
        </el-form-item>
        <el-form-item label="目标板卡" required>
          <el-select v-model="selectedBoards" multiple placeholder="请选择目标板卡" style="width: 100%">
            <el-option
              v-for="board in boardList"
              :key="board.board_id"
              :label="`${board.board_name} (${board.board_id})`"
              :value="board.board_id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="applyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmApply" :loading="applyLoading">确认应用</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 预案详情对话框 -->
    <el-dialog
      v-model="planDetailDialogVisible"
      title="预案详情"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
      class="tech-dialog"
    >
      <div v-if="planDetailData" class="plan-detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="预案编码">{{ planDetailData.plan_code }}</el-descriptions-item>
          <el-descriptions-item label="预案名称">{{ planDetailData.plan_name }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ getCategoryText(planDetailData.category) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="planDetailData.status === 1 ? 'success' : 'info'" size="small">
              {{ planDetailData.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ planDetailData.description || '无' }}</el-descriptions-item>
        </el-descriptions>
        
        <h4 style="margin-top: 20px; color: #00ffff;">规则项列表</h4>
        <div v-if="planDetailData.rule_items && planDetailData.rule_items.length > 0" style="max-height: 400px; overflow-y: auto;">
          <el-card v-for="(item, index) in planDetailData.rule_items" :key="index" style="margin-bottom: 10px;">
            <h5>{{ index + 1 }}. {{ item.name }}</h5>
            <p><strong>触发条件：</strong>{{ getAlarmTypeName(item.trigger_condition.alarm_type) }}，等级{{ item.trigger_condition.alarm_level }}</p>
            <p><strong>联动动作：</strong></p>
            <ul>
              <li v-for="(action, aIndex) in item.linkage_actions" :key="aIndex">
                {{ getActionTypeName(action.action_type) }}
                <span v-if="action.delay_seconds > 0">（延迟{{ action.delay_seconds }}秒）</span>
              </li>
            </ul>
          </el-card>
        </div>
        <p v-else style="color: #9ca3af; text-align: center; padding: 20px;">暂无规则项</p>
      </div>
      <template #footer>
        <el-button @click="planDetailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 应用预案到选中板卡对话框 -->
    <el-dialog
      v-model="applyPlanToSelectedDialogVisible"
      title="应用预案到选中板卡"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
      class="tech-dialog"
    >
      <el-form label-width="100px">
        <el-form-item label="选中板卡">
          <el-tag v-for="board in selectedBoardRules" :key="board.board_id" style="margin: 2px;">
            {{ board.board_id }}
          </el-tag>
          <div style="margin-top: 5px; font-size: 12px; color: rgba(255, 255, 255, 0.6);">
            共选中 {{ selectedBoardRules.length }} 个板卡
          </div>
        </el-form-item>
        <el-form-item label="选择预案" required>
          <el-select v-model="selectedApplyPlanId" placeholder="请选择预案" style="width: 100%;">
            <el-option
              v-for="plan in planList"
              :key="plan.id"
              :label="plan.plan_name"
              :value="plan.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <el-alert type="warning" :closable="false" style="margin-top: 15px;">
        ⚠️ 应用预案将替换选中板卡的所有现有规则，请谨慎操作！
      </el-alert>
      <template #footer>
        <el-button @click="applyPlanToSelectedDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmApplyToSelected">确认应用</el-button>
      </template>
    </el-dialog>
    
    <!-- 编辑板卡规则对话框 -->
    <el-dialog
      v-model="boardRulesDialogVisible"
      title="编辑板卡规则"
      width="900px"
      :close-on-click-modal="false"
      destroy-on-close
      class="tech-dialog"
    >
      <div class="board-rules-content">
        <div class="board-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="板卡ID">{{ currentBoard?.board_id }}</el-descriptions-item>
            <el-descriptions-item label="板卡名称">{{ currentBoard?.board_name }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <!-- 快速应用预案 -->
        <el-card class="quick-apply-card" style="margin-top: 15px; background: rgba(0, 255, 255, 0.05);">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 14px; color: #00ffff;">📋 快速应用预案</span>
              <el-button type="primary" size="small" @click="handleQuickApplyPlan">应用</el-button>
            </div>
          </template>
          <el-select 
            v-model="selectedQuickPlanId" 
            placeholder="选择预案快速配置" 
            style="width: 100%;"
            size="small"
          >
            <el-option
              v-for="plan in planList"
              :key="plan.id"
              :label="plan.plan_name"
              :value="plan.id"
            />
          </el-select>
          <div style="margin-top: 10px; font-size: 12px; color: rgba(255, 255, 255, 0.6);">
            选择一个预案快速配置规则，或直接手动添加
          </div>
        </el-card>
        
        <div class="rules-header" style="margin-top: 20px; margin-bottom: 10px;">
          <span style="font-weight: bold;">规则项列表</span>
          <el-button type="success" size="small" :icon="Plus" @click="handleAddBoardRuleItem">添加规则项</el-button>
        </div>
        
        <el-table
          :data="boardRuleItems"
          stripe
          class="tech-table"
          style="width: 100%"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="name" label="规则名称" min-width="120" header-align="center" />
          <el-table-column label="触发条件" min-width="200" header-align="center">
            <template #default="{ row }">
              <div>
                <el-tag size="small">{{ getAlarmTypeName(row.trigger_condition?.alarm_type) }}</el-tag>
                <el-tag size="small" type="warning" style="margin-left: 5px;">
                  等级{{ row.trigger_condition?.alarm_level }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="联动动作" min-width="150" header-align="center">
            <template #default="{ row }">
              <el-tag 
                v-for="(action, index) in row.linkage_actions" 
                :key="index"
                size="small"
                style="margin: 2px;"
              >
                {{ getActionTypeName(action.action_type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="{ row, $index }">
              <el-button type="primary" size="small" class="tech-button-xs" @click="handleEditBoardRuleItem(row, $index)">
                编辑
              </el-button>
              <el-button type="danger" size="small" class="tech-button-xs" @click="handleDeleteBoardRuleItem($index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="boardRulesDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveBoardRules">保存规则</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { eventApi } from '@/api/event'

export default {
  name: 'LinkageSettings',
  setup() {
    // ESLint会误报这些变量未使用，但它们在return语句中被返回并在模板中使用
    /* eslint-disable no-unused-vars */
    const _icons = { Plus, Refresh }
    const _api = eventApi
    const _onMounted = onMounted
    /* eslint-enable no-unused-vars */
    
    // Tab切换
    const activeTab = ref('plans')
    
    // 加载状态
    const loading = ref(false)
    const rulesLoading = ref(false)
    
    // 预案列表
    const planList = ref([])
    
    // 板卡规则列表
    const boardRulesList = ref([])
    const selectedBoardRules = ref([])
    const boardRulesTableRef = ref(null)
    
    // 告警类型列表
    const alarmTypes = ref([])
    
    // 板卡列表
    const boardList = ref([])
    
    // 分页
    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    })
    
    // 计算分页后的数据
    const paginatedPlans = computed(() => {
      const start = (pagination.page - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      return planList.value.slice(start, end)
    })
    
    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(pagination.total / pagination.pageSize) || 1
    })
    
    // 计算可见页码
    const visiblePages = computed(() => {
      const maxVisiblePages = 5
      const totalPagesValue = totalPages.value
      const currentPageValue = pagination.page
      
      let startPage = Math.max(1, currentPageValue - Math.floor(maxVisiblePages / 2))
      let endPage = Math.min(totalPagesValue, startPage + maxVisiblePages - 1)
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }
      
      const pages = []
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      return pages
    })
    
    // 预案对话框
    const planDialogVisible = ref(false)
    const isEditPlan = ref(false)
    const planFormRef = ref(null)
    const planForm = reactive({
      id: null,
      plan_name: '',
      category: '',
      description: '',
      rule_items: []
    })
    
    const planRules = {
      plan_name: [
        { required: true, message: '请输入预案名称', trigger: 'blur' }
      ],
      category: [
        { required: true, message: '请选择分类', trigger: 'change' }
      ]
    }
    
    // 规则配置对话框
    const ruleConfigDialogVisible = ref(false)
    const currentPlan = ref(null)
    const ruleItems = ref([])
    
    // 规则项对话框
    const ruleItemDialogVisible = ref(false)
    const isEditRuleItem = ref(false)
    const currentRuleItemIndex = ref(-1)
    const ruleItemFormRef = ref(null)
    const ruleItemForm = reactive({
      name: '',
      alarm_type: null,
      alarm_level: null,
      action_type: '',
      delay_seconds: 0
    })
    
    const ruleItemRules = {
      name: [
        { required: true, message: '请输入规则名称', trigger: 'blur' }
      ],
      alarm_type: [
        { required: true, message: '请选择告警类型', trigger: 'change' }
      ],
      alarm_level: [
        { required: true, message: '请选择告警等级', trigger: 'change' }
      ],
      action_type: [
        { required: true, message: '请选择联动动作', trigger: 'change' }
      ]
    }
    
    // 应用预案对话框
    const applyDialogVisible = ref(false)
    const selectedBoards = ref([])
    const applyLoading = ref(false)
    
    // 编辑板卡规则对话框
    const boardRulesDialogVisible = ref(false)
    const currentBoard = ref(null)
    const boardRuleItems = ref([])
    const currentBoardRuleItemIndex = ref(-1)
    const selectedQuickPlanId = ref(null)
    
    // 批量配置对话框
    const batchConfigDialogVisible = ref(false)
    const batchConfigRuleItems = ref([])
    
    // 预案详情对话框
    const planDetailDialogVisible = ref(false)
    const planDetailData = ref(null)
    
    // 应用预案到选中板卡对话框
    const applyPlanToSelectedDialogVisible = ref(false)
    const selectedApplyPlanId = ref(null)

        // ==================== 工具方法 ====================
    
    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    // 获取分类文本
    const getCategoryText = (category) => {
      const categoryMap = {
        'algorithm_based': '基于算法',
        'general': '通用预案',
        'combined': '组合预案',
        'custom': '自定义'
      }
      return categoryMap[category] || category || '-'
    }
    
    // 获取告警类型名称
    const getAlarmTypeName = (typeId) => {
      const type = alarmTypes.value.find(t => t.id === typeId)
      return type ? `${type.id} - ${type.type_name}` : `类型${typeId}`
    }
    
    // 获取动作类型名称
    const getActionTypeName = (actionType) => {
      const actionMap = {
        'broadcast': '语音播报',
        'light_sound': '声光报警',
        'control': '继电器控制'
      }
      return actionMap[actionType] || actionType
    }
    
    // 获取同步状态类型
    const getSyncStatusType = (board) => {
      if (!board.rules || board.rules.length === 0) return 'info'
      
      let hasFailed = false
      let allSynced = true
      
      board.rules.forEach(rule => {
        if (rule.sync_status === 2) {
          hasFailed = true
          allSynced = false
        } else if (rule.sync_status !== 1) {
          allSynced = false
        }
      })
      
      if (hasFailed) return 'danger'
      if (allSynced) return 'success'
      return 'warning'
    }
    
    // 获取同步状态文本
    const getSyncStatusText = (board) => {
      if (!board.rules || board.rules.length === 0) return '无规则'
      
      let hasFailed = false
      let allSynced = true
      
      board.rules.forEach(rule => {
        if (rule.sync_status === 2) {
          hasFailed = true
          allSynced = false
        } else if (rule.sync_status !== 1) {
          allSynced = false
        }
      })
      
      if (hasFailed) return '同步失败'
      if (allSynced) return '已同步'
      return '未同步'
    }
    
    // 获取最后同步时间
    const getLastSyncTime = (board) => {
      if (!board.rules || board.rules.length === 0) return '从未同步'
      
      let lastSyncTime = null
      board.rules.forEach(rule => {
        if (rule.last_sync_time) {
          const syncTime = new Date(rule.last_sync_time)
          if (!lastSyncTime || syncTime > lastSyncTime) {
            lastSyncTime = syncTime
          }
        }
      })
      
      return lastSyncTime ? formatDate(lastSyncTime) : '从未同步'
    }
    
    // ==================== 数据加载方法 ====================
    
    // 加载预案列表
    const loadPlans = async () => {
      loading.value = true
      try {
        const response = await eventApi.getLinkagePlans({
          page: pagination.page,
          page_size: pagination.pageSize
        })
        
        console.log('预案列表响应:', response)
        
        // 处理响应数据
        if (response.code === 200 && response.data) {
          // 后端返回格式: { code: 200, data: { list: [], total: 0, page: 1, page_size: 10 } }
          const data = response.data
          // 转换后端数据格式为前端格式
          planList.value = (data.list || []).map(plan => ({
            ...plan,
            // 将trigger_conditions_template和linkage_actions_template转换为rule_items
            rule_items: plan.trigger_conditions_template && plan.linkage_actions_template ? [{
              name: plan.plan_name + '规则',
              trigger_condition: {
                alarm_type: plan.trigger_conditions_template.find(c => c.condition_type === 'alarm_type')?.value,
                alarm_level: plan.trigger_conditions_template.find(c => c.condition_type === 'alarm_level')?.value || 1
              },
              linkage_actions: plan.linkage_actions_template
            }] : []
          }))
          pagination.total = data.total || 0
          pagination.page = data.page || pagination.page
          pagination.pageSize = data.page_size || pagination.pageSize
        } else if (response.data && Array.isArray(response.data)) {
          // 兼容直接返回数组的情况
          planList.value = response.data.map(plan => ({
            ...plan,
            rule_items: plan.trigger_conditions_template && plan.linkage_actions_template ? [{
              name: plan.plan_name + '规则',
              trigger_condition: {
                alarm_type: plan.trigger_conditions_template.find(c => c.condition_type === 'alarm_type')?.value,
                alarm_level: plan.trigger_conditions_template.find(c => c.condition_type === 'alarm_level')?.value || 1
              },
              linkage_actions: plan.linkage_actions_template
            }] : []
          }))
          pagination.total = response.data.length
        } else {
          planList.value = []
          pagination.total = 0
        }
      } catch (error) {
        console.error('加载预案列表失败:', error)
        const errorMsg = error.response?.data?.error || error.message || '未知错误'
        ElMessage.error('加载预案列表失败：' + errorMsg)
        planList.value = []
        pagination.total = 0
      } finally {
        loading.value = false
      }
    }
    
    // 加载告警类型
    const loadAlarmTypes = async () => {
      try {
        const response = await eventApi.getAlarmTypeDict()
        console.log('告警类型响应:', response)
        
        if (response.data) {
          alarmTypes.value = response.data.filter(t => t.is_active)
        } else if (Array.isArray(response)) {
          alarmTypes.value = response.filter(t => t.is_active)
        }
      } catch (error) {
        console.error('加载告警类型失败:', error)
      }
    }
    
    // 加载板卡列表
    const loadBoards = async () => {
      try {
        const response = await eventApi.getRulesByBoards()
        console.log('板卡列表响应:', response)
        
        if (response.code === 200 && response.data) {
          boardList.value = response.data
        }
      } catch (error) {
        console.error('加载板卡列表失败:', error)
      }
    }
    
    // 加载板卡规则列表
    const loadBoardRules = async () => {
      rulesLoading.value = true
      try {
        const response = await eventApi.getRulesByBoards()
        console.log('板卡规则列表响应:', response)
        
        if (response.code === 200 && response.data) {
          boardRulesList.value = response.data
        } else if (Array.isArray(response.data)) {
          boardRulesList.value = response.data
        } else {
          boardRulesList.value = []
        }
      } catch (error) {
        console.error('加载板卡规则列表失败:', error)
        const errorMsg = error.response?.data?.error || error.message || '未知错误'
        ElMessage.error('加载板卡规则列表失败：' + errorMsg)
        boardRulesList.value = []
      } finally {
        rulesLoading.value = false
      }
    }
    
    // Tab切换处理
    const handleTabChange = (tabName) => {
      console.log('切换到Tab:', tabName)
      if (tabName === 'rules') {
        loadBoardRules()
      } else if (tabName === 'plans') {
        loadPlans()
      }
    }
    
    // ==================== 预案管理方法 ====================
    
    // 新增预案
    const handleAddPlan = () => {
      isEditPlan.value = false
      planForm.id = null
      planForm.plan_name = ''
      planForm.category = ''
      planForm.description = ''
      planForm.rule_items = []
      planDialogVisible.value = true
    }
    
    // 编辑预案
    const handleEditPlan = (row) => {
      isEditPlan.value = true
      planForm.id = row.id
      planForm.plan_name = row.plan_name
      planForm.category = row.category
      planForm.description = row.description
      // 确保rule_items存在
      planForm.rule_items = row.rule_items || []
      planDialogVisible.value = true
    }
    
    // 保存预案
    const handleSavePlan = async () => {
      if (!planFormRef.value) return
      
      planFormRef.value.validate(async (valid) => {
        if (!valid) return
        
        try {
          const data = {
            plan_name: planForm.plan_name,
            category: planForm.category || null,
            description: planForm.description || null,
            rule_items: planForm.rule_items && planForm.rule_items.length > 0 ? planForm.rule_items : []
          }
          
          // 创建预案时，如果没有规则项，给一个空数组（后端要求必需字段）
          if (!isEditPlan.value && data.rule_items.length === 0) {
            ElMessage.warning('请先配置规则项后再创建预案，或创建后再配置规则')
            // 允许创建空规则的预案
          }
          
          if (isEditPlan.value) {
            const response = await eventApi.updateLinkagePlan(planForm.id, data)
            console.log('更新预案响应:', response)
            ElMessage.success('预案更新成功')
          } else {
            const response = await eventApi.createLinkagePlan(data)
            console.log('创建预案响应:', response)
            ElMessage.success('预案创建成功')
          }
          
          planDialogVisible.value = false
          loadPlans()
        } catch (error) {
          console.error('保存预案失败:', error)
          const errorMsg = error.response?.data?.error || error.message || '未知错误'
          ElMessage.error('保存失败：' + errorMsg)
        }
      })
    }
    
    // 删除预案
    const handleDeletePlan = (row) => {
      ElMessageBox.confirm(
        `确认要删除预案"${row.plan_name}"吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          await eventApi.deleteLinkagePlan(row.id)
          ElMessage.success('删除成功')
          loadPlans()
        } catch (error) {
          console.error('删除预案失败:', error)
          ElMessage.error('删除失败：' + (error.message || '未知错误'))
        }
      }).catch(() => {})
    }
    
    // 查看预案详情
    const handleViewPlanDetail = async (row) => {
      try {
        const response = await eventApi.getLinkagePlan(row.id)
        if (response.code === 200 && response.data) {
          planDetailData.value = response.data
          planDetailDialogVisible.value = true
        }
      } catch (error) {
        console.error('加载预案详情失败:', error)
        ElMessage.error('加载预案详情失败：' + (error.message || '未知错误'))
      }
    }
    
    // ==================== 规则配置方法 ====================
    
    // 配置规则
    const handleConfigRules = (row) => {
      currentPlan.value = row
      // 深拷贝rule_items，确保存在
      ruleItems.value = JSON.parse(JSON.stringify(row.rule_items || []))
      ruleConfigDialogVisible.value = true
    }
    
    // 添加规则项
    const handleAddRuleItem = () => {
      isEditRuleItem.value = false
      currentRuleItemIndex.value = -1
      ruleItemForm.name = ''
      ruleItemForm.alarm_type = null
      ruleItemForm.alarm_level = null
      ruleItemForm.action_type = ''
      ruleItemForm.delay_seconds = 0
      ruleItemDialogVisible.value = true
    }
    
    // 编辑规则项
    const handleEditRuleItem = (row, index) => {
      isEditRuleItem.value = true
      currentRuleItemIndex.value = index
      ruleItemForm.name = row.name
      ruleItemForm.alarm_type = row.trigger_condition?.alarm_type
      ruleItemForm.alarm_level = row.trigger_condition?.alarm_level
      ruleItemForm.action_type = row.linkage_actions?.[0]?.action_type || ''
      ruleItemForm.delay_seconds = row.linkage_actions?.[0]?.delay_seconds || 0
      ruleItemDialogVisible.value = true
    }
    
    // 保存规则项
    const handleSaveRuleItem = async () => {
      if (!ruleItemFormRef.value) return
      
      await ruleItemFormRef.value.validate(async (valid) => {
        if (!valid) return
        
        const ruleItem = {
          name: ruleItemForm.name,
          trigger_condition: {
            alarm_type: ruleItemForm.alarm_type,
            alarm_level: ruleItemForm.alarm_level,
            additional_conditions: []
          },
          linkage_actions: [
            {
              action_type: ruleItemForm.action_type,
              action_params: {},
              delay_seconds: ruleItemForm.delay_seconds || 0
            }
          ]
        }
        
        if (isEditRuleItem.value) {
          // 编辑模式
          if (currentRuleItemIndex.value >= 0) {
            ruleItems.value[currentRuleItemIndex.value] = ruleItem
          } else if (currentBoardRuleItemIndex.value >= 0) {
            boardRuleItems.value[currentBoardRuleItemIndex.value] = ruleItem
          }
        } else {
          // 新增模式
          if (ruleConfigDialogVisible.value) {
            ruleItems.value.push(ruleItem)
          } else if (boardRulesDialogVisible.value) {
            boardRuleItems.value.push(ruleItem)
          }
        }
        
        ruleItemDialogVisible.value = false
        ElMessage.success(isEditRuleItem.value ? '规则项更新成功' : '规则项添加成功')
      })
    }
    
    // 删除规则项
    const handleDeleteRuleItem = (index) => {
      ElMessageBox.confirm(
        '确认要删除该规则项吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        ruleItems.value.splice(index, 1)
        ElMessage.success('删除成功')
      }).catch(() => {})
    }
    
    // 保存规则配置
    const handleSaveRuleConfig = async () => {
      try {
        const data = {
          rule_items: ruleItems.value
        }
        
        await eventApi.updateLinkagePlan(currentPlan.value.id, data)
        ElMessage.success('规则配置保存成功')
        ruleConfigDialogVisible.value = false
        loadPlans()
      } catch (error) {
        console.error('保存规则配置失败:', error)
        ElMessage.error('保存失败：' + (error.message || '未知错误'))
      }
    }
    
    // ==================== 应用预案方法 ====================
    
    // 应用预案
    const handleApplyPlan = (row) => {
      currentPlan.value = row
      selectedBoards.value = []
      applyDialogVisible.value = true
    }
    
    // 确认应用
    const handleConfirmApply = async () => {
      if (selectedBoards.value.length === 0) {
        ElMessage.warning('请选择目标板卡')
        return
      }
      
      if (!currentPlan.value.rule_items || currentPlan.value.rule_items.length === 0) {
        ElMessage.warning('该预案没有配置规则项，无法应用')
        return
      }
      
      applyLoading.value = true
      try {
        // 后端只需要target_boards字段
        const data = {
          target_boards: selectedBoards.value
        }
        
        console.log('应用预案请求:', {
          planId: currentPlan.value.id,
          data: data
        })
        
        const response = await eventApi.applyPlanToBoards(currentPlan.value.id, data)
        console.log('应用预案响应:', response)
        
        if (response.code === 200 && response.data) {
          const result = response.data
          ElMessage.success(`应用成功：${result.success_count}个板卡，失败：${result.failed_count}个`)
          
          if (result.errors && result.errors.length > 0) {
            console.warn('应用失败详情:', result.errors)
            // 显示部分失败的详细信息
            result.errors.slice(0, 3).forEach(err => {
              ElMessage.warning(err)
            })
          }
          
          applyDialogVisible.value = false
          // 刷新板卡规则列表
          if (activeTab.value === 'rules') {
            loadBoardRules()
          }
        } else {
          ElMessage.error('应用失败：响应格式错误')
        }
      } catch (error) {
        console.error('应用预案失败:', error)
        const errorMsg = error.response?.data?.error || error.message || '未知错误'
        ElMessage.error('应用失败：' + errorMsg)
      } finally {
        applyLoading.value = false
      }
    }
    
    // ==================== 板卡规则管理方法 ====================
    
    // 编辑板卡规则
    const handleEditBoardRules = (row) => {
      currentBoard.value = row
      // 从后端RuleResponse格式转换为前端编辑格式
      boardRuleItems.value = (row.rules || []).map(rule => ({
        name: rule.rule_name,
        trigger_condition: {
          alarm_type: rule.trigger_condition?.alarm_type,
          alarm_level: rule.trigger_condition?.alarm_level,
          additional_conditions: rule.trigger_condition?.additional_conditions || []
        },
        linkage_actions: rule.linkage_actions || []
      }))
      boardRulesDialogVisible.value = true
    }
    
    // 添加板卡规则项
    const handleAddBoardRuleItem = () => {
      isEditRuleItem.value = false
      currentBoardRuleItemIndex.value = -1
      ruleItemForm.name = ''
      ruleItemForm.alarm_type = null
      ruleItemForm.alarm_level = null
      ruleItemForm.action_type = ''
      ruleItemForm.delay_seconds = 0
      ruleItemDialogVisible.value = true
    }
    
    // 编辑板卡规则项
    const handleEditBoardRuleItem = (row, index) => {
      isEditRuleItem.value = true
      currentBoardRuleItemIndex.value = index
      ruleItemForm.name = row.name
      ruleItemForm.alarm_type = row.trigger_condition?.alarm_type
      ruleItemForm.alarm_level = row.trigger_condition?.alarm_level
      ruleItemForm.action_type = row.linkage_actions?.[0]?.action_type || ''
      ruleItemForm.delay_seconds = row.linkage_actions?.[0]?.delay_seconds || 0
      ruleItemDialogVisible.value = true
    }
    
    // 删除板卡规则项
    const handleDeleteBoardRuleItem = (index) => {
      ElMessageBox.confirm(
        '确认要删除该规则项吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        boardRuleItems.value.splice(index, 1)
        ElMessage.success('删除成功')
      }).catch(() => {})
    }
    
    // 保存板卡规则
    const handleSaveBoardRules = async () => {
      try {
        // 清理数据，只保留后端需要的字段
        const cleanedRuleItems = boardRuleItems.value.map(item => ({
          name: item.name || item.rule_name,
          trigger_condition: {
            alarm_type: item.trigger_condition?.alarm_type,
            alarm_level: item.trigger_condition?.alarm_level,
            additional_conditions: item.trigger_condition?.additional_conditions || []
          },
          linkage_actions: (item.linkage_actions || []).map(action => ({
            action_type: action.action_type,
            action_params: action.action_params || {},
            delay_seconds: action.delay_seconds || 0
          }))
        }))
        
        const data = {
          board_id: currentBoard.value.board_id,
          rule_items: cleanedRuleItems
        }
        
        console.log('保存板卡规则请求:', data)
        
        const response = await eventApi.editBoardRules(data)
        console.log('保存板卡规则响应:', response)
        
        ElMessage.success('板卡规则保存成功')
        boardRulesDialogVisible.value = false
        selectedQuickPlanId.value = null
        loadBoardRules()
      } catch (error) {
        console.error('保存板卡规则失败:', error)
        const errorMsg = error.response?.data?.error || error.message || '未知错误'
        ElMessage.error('保存失败：' + errorMsg)
      }
    }
    
    // 快速应用预案
    const handleQuickApplyPlan = async () => {
      if (!selectedQuickPlanId.value) {
        ElMessage.warning('请先选择预案')
        return
      }
      
      try {
        const response = await eventApi.getLinkagePlan(selectedQuickPlanId.value)
        if (response.code === 200 && response.data && response.data.rule_items) {
          boardRuleItems.value = JSON.parse(JSON.stringify(response.data.rule_items))
          ElMessage.success('预案应用成功，可以进一步修改或直接保存')
        }
      } catch (error) {
        console.error('应用预案失败:', error)
        ElMessage.error('应用预案失败：' + (error.message || '未知错误'))
      }
    }
    
    // ==================== 分页方法 ====================
    
    // 每页条数变化
    const handleSizeChange = (val) => {
      pagination.pageSize = val
      pagination.page = 1
      loadPlans()
    }
    
    // 跳转到指定页面
    const goToPage = (page) => {
      if (page < 1 || page > totalPages.value || page === pagination.page) {
        return
      }
      pagination.page = page
      loadPlans()
    }
    
    // ==================== 板卡规则批量操作 ====================
    
    // 全选状态
    const isAllSelected = computed(() => {
      return boardRulesList.value.length > 0 && 
             selectedBoardRules.value.length === boardRulesList.value.length
    })
    
    // 选择变化
    const handleSelectionChange = (selection) => {
      selectedBoardRules.value = selection
    }
    
    // 全选/取消全选
    const handleSelectAll = () => {
      if (isAllSelected.value) {
        boardRulesTableRef.value.clearSelection()
      } else {
        boardRulesList.value.forEach(row => {
          boardRulesTableRef.value.toggleRowSelection(row, true)
        })
      }
    }
    
    // 批量配置
    const handleBatchConfig = () => {
      if (selectedBoardRules.value.length === 0) {
        ElMessage.warning('请先选择要配置的板卡')
        return
      }
      
      batchConfigRuleItems.value = []
      selectedQuickPlanId.value = null
      batchConfigDialogVisible.value = true
    }
    
    // 应用预案到选中板卡
    const handleApplyPlanToSelectedBoards = () => {
      if (selectedBoardRules.value.length === 0) {
        ElMessage.warning('请先选择要应用预案的板卡')
        return
      }
      
      selectedApplyPlanId.value = null
      applyPlanToSelectedDialogVisible.value = true
    }
    
    // 确认应用预案到选中板卡
    const handleConfirmApplyToSelected = async () => {
      if (!selectedApplyPlanId.value) {
        ElMessage.warning('请选择要应用的预案')
        return
      }
      
      try {
        const boardIds = selectedBoardRules.value.map(b => b.board_id)
        
        // 获取预案详情
        const planResponse = await eventApi.getLinkagePlan(selectedApplyPlanId.value)
        if (!planResponse.data || !planResponse.data.rule_items) {
          ElMessage.error('获取预案信息失败')
          return
        }
        
        const requestData = {
          target_boards: boardIds,
          rule_items: planResponse.data.rule_items,
          plan_id: parseInt(selectedApplyPlanId.value)
        }
        
        const response = await eventApi.applyPlanToBoards(selectedApplyPlanId.value, requestData)
        
        if (response.code === 200 && response.data) {
          const result = response.data
          ElMessage.success(`应用完成！成功：${result.success_count}，失败：${result.failed_count}`)
          applyPlanToSelectedDialogVisible.value = false
          loadBoardRules()
        }
      } catch (error) {
        console.error('应用预案失败:', error)
        ElMessage.error('应用预案失败：' + (error.message || '未知错误'))
      }
    }
    
    // 批量删除
    const handleBatchDelete = async () => {
      if (selectedBoardRules.value.length === 0) {
        ElMessage.warning('请先选择要删除的板卡规则')
        return
      }
      
      ElMessageBox.confirm(
        `确认要删除选中的 ${selectedBoardRules.value.length} 个板卡的规则吗？此操作将删除这些板卡下的所有规则！`,
        '批量删除确认',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
          distinguishCancelAndClose: true
        }
      ).then(async () => {
        try {
          rulesLoading.value = true
          let successCount = 0
          let failCount = 0
          const errors = []
          
          // 对每个选中的板卡，获取其所有规则并删除
          for (const board of selectedBoardRules.value) {
            try {
              // 获取该板卡的所有规则
              const response = await eventApi.getLinkageRules({
                board_id: board.board_id,
                page: 1,
                page_size: 100
              })
              
              if (response.code === 200 && response.data && response.data.list) {
                // 删除该板卡的所有规则
                for (const rule of response.data.list) {
                  try {
                    await eventApi.deleteLinkageRule(rule.id)
                    successCount++
                  } catch (error) {
                    failCount++
                    errors.push(`删除规则 ${rule.rule_name} 失败: ${error.message}`)
                  }
                }
              }
            } catch (error) {
              failCount++
              errors.push(`处理板卡 ${board.board_id} 失败: ${error.message}`)
            }
          }
          
          // 显示结果
          if (failCount === 0) {
            ElMessage.success(`批量删除成功，共删除 ${successCount} 条规则`)
          } else {
            ElMessage.warning(`删除完成：成功 ${successCount} 条，失败 ${failCount} 条`)
            if (errors.length > 0) {
              console.error('批量删除错误详情:', errors)
            }
          }
          
          // 刷新列表
          await loadBoardRules()
          
        } catch (error) {
          console.error('批量删除失败:', error)
          ElMessage.error('批量删除失败：' + (error.message || '未知错误'))
        } finally {
          rulesLoading.value = false
        }
      }).catch(() => {
        // 用户取消
      })
    }
    
    // ==================== 生命周期 ====================
    
    onMounted(() => {
      loadPlans()
      loadAlarmTypes()
      loadBoards()
    })

        return {
      // 图标
      Plus,
      Refresh,
      // Tab
      activeTab,
      handleTabChange,
      // 数据
      loading,
      rulesLoading,
      planList,
      boardRulesList,
      selectedBoardRules,
      boardRulesTableRef,
      isAllSelected,
      alarmTypes,
      boardList,
      pagination,
      paginatedPlans,
      totalPages,
      visiblePages,
      // 预案对话框
      planDialogVisible,
      isEditPlan,
      planFormRef,
      planForm,
      planRules,
      // 规则配置对话框
      ruleConfigDialogVisible,
      currentPlan,
      ruleItems,
      // 规则项对话框
      ruleItemDialogVisible,
      isEditRuleItem,
      ruleItemFormRef,
      ruleItemForm,
      ruleItemRules,
      // 应用预案对话框
      applyDialogVisible,
      selectedBoards,
      applyLoading,
      // 板卡规则对话框
      boardRulesDialogVisible,
      currentBoard,
      boardRuleItems,
      // 工具方法
      formatDate,
      getCategoryText,
      getAlarmTypeName,
      getActionTypeName,
      getSyncStatusType,
      getSyncStatusText,
      getLastSyncTime,
      // 预案管理方法
      loadPlans,
      handleAddPlan,
      handleEditPlan,
      handleSavePlan,
      handleDeletePlan,
      handleViewPlanDetail,
      // 规则配置方法
      handleConfigRules,
      handleAddRuleItem,
      handleEditRuleItem,
      handleSaveRuleItem,
      handleDeleteRuleItem,
      handleSaveRuleConfig,
      // 应用预案方法
      handleApplyPlan,
      handleConfirmApply,
      // 板卡规则管理方法
      loadBoardRules,
      handleEditBoardRules,
      handleAddBoardRuleItem,
      handleEditBoardRuleItem,
      handleDeleteBoardRuleItem,
      handleSaveBoardRules,
      handleQuickApplyPlan,
      selectedQuickPlanId,
      // 分页方法
      handleSizeChange,
      goToPage,
      // 批量操作方法
      handleSelectionChange,
      handleSelectAll,
      handleBatchDelete,
      handleBatchConfig,
      handleApplyPlanToSelectedBoards,
      handleConfirmApplyToSelected,
      // 对话框状态
      batchConfigDialogVisible,
      batchConfigRuleItems,
      planDetailDialogVisible,
      planDetailData,
      applyPlanToSelectedDialogVisible,
      selectedApplyPlanId
    }
  }
}
</script>

<style scoped>
/* ==================== 科技感主题样式 ==================== */

/* 页面容器 */
.tech-page-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  max-height: 100vh;
  padding: 20px;
  padding-bottom: 40px;
  background: transparent;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

/* 标题样式 */
.linkage-settings h2 {
  margin: 24px 0 20px 0;
  color: #00ffff;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  position: relative;
  z-index: 10;
}

/* Tab样式 - 参考基础管理 */
.tech-tabs {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tech-tabs :deep(.el-tabs) {
  border: none !important;
}

.tech-tabs :deep(.el-tabs__header) {
  border-bottom: none;
  margin: 0 0 20px 0;
}

.tech-tabs :deep(.el-tabs__nav-wrap::after) {
  background-color: transparent !important;
}

.tech-tabs :deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-weight: 500;
  border: none !important;
  background: rgba(0, 255, 255, 0.05) !important;
  border-radius: 8px 8px 0 0 !important;
  margin-right: 2px !important;
  padding: 12px 20px !important;
  transition: all 0.3s ease !important;
  height: auto !important;
  line-height: 1.4 !important;
}

.tech-tabs :deep(.el-tabs__item:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.tech-tabs :deep(.el-tabs__item.is-active) {
  color: #00ffff !important;
  background: rgba(0, 255, 255, 0.15) !important;
  border: none !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

.tech-tabs :deep(.el-tabs__active-bar) {
  background-color: #00ffff !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.tech-tabs :deep(.el-tabs__content) {
  position: relative;
  z-index: 10;
  background: transparent;
  border: none !important;
  flex: 1;
  overflow-y: auto;
}

.mb-20 {
  margin-bottom: 20px;
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

/* 头部操作区域样式 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 搜索框样式 */
.header-actions :deep(.el-input) {
  --el-input-bg-color: rgba(0, 255, 255, 0.05);
  --el-input-border-color: rgba(0, 255, 255, 0.3);
  --el-input-hover-border-color: rgba(0, 255, 255, 0.5);
  --el-input-focus-border-color: rgba(0, 255, 255, 0.6);
  --el-input-text-color: rgba(255, 255, 255, 0.9);
  --el-input-placeholder-color: rgba(255, 255, 255, 0.4);
}

.header-actions :deep(.el-input__wrapper) {
  background-color: rgba(0, 255, 255, 0.05) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.15) !important;
  transition: all 0.3s ease !important;
}

.header-actions :deep(.el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.25) !important;
}

.header-actions :deep(.el-input__wrapper.is-focus) {
  border-color: rgba(0, 255, 255, 0.6) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.35) !important;
}

.header-actions :deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.9) !important;
}

.header-actions :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}

.header-actions :deep(.el-input-group__append) {
  background-color: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-left: none !important;
  box-shadow: none !important;
}

.header-actions :deep(.el-input-group__append .el-button) {
  background: transparent !important;
  border: none !important;
  color: #00ffff !important;
}

.header-actions :deep(.el-input-group__append .el-button:hover) {
  background: rgba(0, 255, 255, 0.15) !important;
}

/* 科技感卡片样式 */
.tech-card {
  position: relative;
  z-index: 10;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  margin-bottom: 20px;
}

.tech-card :deep(.el-card__body) {
  padding: 20px;
  background: transparent !important;
  border: none !important;
  border-top: none !important;
  border-bottom: none !important;
  border-left: none !important;
  border-right: none !important;
}

.tech-card :deep(.el-card__header) {
  background: transparent !important;
  border: none !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  padding: 16px 20px;
}

.content-area {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  background: transparent !important;
  border: none !important;
}

/* 科技感按钮 - 强制覆盖 */
.tech-button-sm,
.table-header .tech-button-sm,
.table-header .el-button.tech-button-sm {
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2) !important;
}

.tech-button-sm:hover,
.table-header .tech-button-sm:hover,
.table-header .el-button.tech-button-sm:hover {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-1px) !important;
  border: 1px solid rgba(0, 255, 255, 0.6) !important;
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

.linkage-settings {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
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
.tech-table.el-table {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  border: 0 !important;
  border-width: 0 !important;
  border-style: none !important;
  border-color: transparent !important;
}

/* 强制移除表格的所有边框 - 最高优先级 */
.tech-table.el-table,
.tech-table.el-table.el-table--border,
.tech-table.el-table.el-table--striped {
  border: 0 !important;
  border-width: 0 !important;
  border-style: none !important;
  border-color: transparent !important;
  border-left: 0 !important;
  border-right: 0 !important;
  border-top: 0 !important;
  border-bottom: 0 !important;
}

/* 强制移除表格外层的所有可能白色边框 */
.tech-table,
.tech-table *,
.tech-table::before,
.tech-table::after,
.tech-table *::before,
.tech-table *::after {
  box-sizing: border-box !important;
}

/* 移除表格外层的div容器边框 */
.tech-card .el-table,
.tech-card > .el-table {
  margin: 0 !important;
  border: 0 !important;
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

/* 增强型分页样式 */
.tech-pagination {
  margin-top: 20px;
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(0, 255, 255, 0.03);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  position: relative;
  z-index: 1;
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

/* 板卡规则对话框样式 */
.board-rules-content {
  padding: 10px 0;
}

.board-info {
  margin-bottom: 20px;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.rules-header span {
  font-size: 16px;
  color: #00ffff;
}
</style>