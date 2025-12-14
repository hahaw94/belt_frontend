<template>
  <div class="alarm-display tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background"></div>
    
    <h2>{{ $t('event.alarm.title') }}</h2>
    
    <!-- 搜索筛选卡片 -->
    <div class="search-filters-card tech-card mb-20">
      <div class="search-filters-header">
        <span class="filter-title">{{ $t('common.search') }}{{ $t('common.filter') }}</span>
        <div class="view-toggle-buttons">
          <el-button 
            :type="viewMode === 'list' ? 'primary' : ''"
            :class="['view-toggle-btn', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
            size="small"
          >
            <el-icon><List /></el-icon>
{{ $t('common.list') }}
          </el-button>
          <el-button 
            :type="viewMode === 'thumbnail' ? 'primary' : ''"
            :class="['view-toggle-btn', { active: viewMode === 'thumbnail' }]"
            @click="viewMode = 'thumbnail'"
            size="small"
          >
            <el-icon><Grid /></el-icon>
{{ $t('common.thumbnail') }}
          </el-button>
        </div>
      </div>
      <div class="search-filters-content">
        <div class="filter-row">
          <div class="filter-item filter-item-wide">
            <label>{{ $t('common.timeRange') }}</label>
            <el-date-picker
              v-model="searchForm.timeRange"
              type="datetimerange"
              range-separator="-"
              :start-placeholder="$t('common.startTime')"
              :end-placeholder="$t('common.endTime')"
              :shortcuts="dateShortcuts"
              class="tech-input"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </div>
          <div class="filter-item">
            <label>{{ $t('event.alarm.alarmType') }}</label>
            <el-select
              v-model="searchForm.alarmType"
              :placeholder="$t('common.all')"
              class="tech-select"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option 
                v-for="type in alarmTypes" 
                :key="type.id" 
                :label="type.name" 
                :value="type.id" 
              />
            </el-select>
          </div>
          <div class="filter-item">
            <label>板卡</label>
            <el-select
              v-model="searchForm.boardId"
              placeholder="全部"
              class="tech-select"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option 
                v-for="board in boardList" 
                :key="board" 
                :label="board" 
                :value="board" 
              />
            </el-select>
          </div>
          <div class="filter-item">
            <label>告警级别</label>
            <el-select
              v-model="searchForm.alarmLevel"
              placeholder="全部"
              class="tech-select"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="低" :value="1" />
              <el-option label="中" :value="2" />
              <el-option label="高" :value="3" />
            </el-select>
          </div>
          <div class="filter-item">
            <label>处理状态</label>
            <el-select
              v-model="searchForm.status"
              placeholder="全部"
              class="tech-select"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="未处理" :value="0" />
              <el-option label="已处理" :value="1" />
            </el-select>
          </div>
          <div class="filter-actions">
            <el-button type="primary" :icon="Search" @click="handleSearch" class="tech-button">
              搜索
            </el-button>
            <el-button :icon="Refresh" @click="handleReset" class="tech-button">
              重置
            </el-button>
            <el-button type="warning" @click="showBatchMarkDialog" class="tech-button">
              批量标记误报
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格和分页 -->
    <div class="content-area tech-card">
      <!-- 批量操作栏 -->
      <div v-if="viewMode === 'list' && selectedAlarms.length > 0" class="batch-operation-bar">
        <div class="batch-info">
          <strong>📋 已选择: <span class="count">{{ selectedAlarms.length }}</span> 条</strong>
        </div>
        <div class="batch-actions">
          <el-button type="warning" size="small" @click="batchMarkFalsePositive">
            📦 标记为误报
          </el-button>
          <el-button size="small" @click="clearSelection">
            ✖ 清空选择
          </el-button>
        </div>
      </div>

      <!-- 列表视图 -->
      <el-table
        v-if="viewMode === 'list'"
        :data="displayAlarmList"
        v-loading="loading"
        border
        stripe
        class="tech-table"
        style="width: 100%"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
        ref="alarmTableRef"
      >
        <el-table-column type="selection" width="50" align="center" :selectable="checkSelectable" />
        <el-table-column type="index" label="序号" width="80" align="center" header-align="center" />
        <el-table-column prop="alarm_code" label="告警编码" min-width="150" header-align="center">
          <template #default="{ row }">
            <code style="font-size: 12px; color: #00ffff;">{{ row.alarm_code || '-' }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="告警类型" min-width="120" header-align="center" />
        <el-table-column prop="level" label="级别" width="80" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" size="small">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="board_id" label="板卡" min-width="100" header-align="center" />
        <el-table-column prop="time" label="时间" min-width="140" header-align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200" align="center" header-align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" class="tech-button-xs" @click.stop="handleView(row)">
              查看
            </el-button>
            <el-button type="warning" size="small" class="tech-button-xs" @click.stop="handleProcess(row)">
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 缩略图视图 -->
      <div v-if="viewMode === 'thumbnail'" class="thumbnail-view" v-loading="loading">
        <div class="thumbnail-grid">
          <div 
            v-for="alarm in displayAlarmList" 
            :key="alarm.id" 
            class="thumbnail-card"
            :class="getThumbnailCardClass(alarm)"
          >
            <!-- 卡片头部 -->
            <div class="thumbnail-header" :class="getLevelClass(alarm.level)">
              <div class="thumbnail-header-content">
                <strong class="thumbnail-type">{{ alarm.type }}</strong>
                <el-tag :type="getLevelType(alarm.level)" size="small">{{ alarm.level }}</el-tag>
              </div>
            </div>
            
            <!-- 卡片主体 -->
            <div class="thumbnail-body" @click="handleView(alarm)">
              <!-- 缩略图 -->
              <div class="thumbnail-image">
                <el-image 
                  v-if="alarm.images && alarm.images.length > 0"
                  :src="alarm.images[0]"
                  fit="cover"
                  class="alarm-thumbnail"
                  :preview-src-list="alarm.images"
                >
                  <template #error>
                    <div class="image-slot">
                      <el-icon><Picture /></el-icon>
                      <div>暂无截图</div>
                    </div>
                  </template>
                </el-image>
                <div v-else class="image-slot">
                  <el-icon><Picture /></el-icon>
                  <div>暂无截图</div>
                </div>
              </div>
              
              <!-- 信息区 -->
              <div class="thumbnail-info">
                <div class="info-item">
                  <span class="info-label">编码:</span>
                  <code class="info-value">{{ alarm.alarm_code || '-' }}</code>
                </div>
                <div class="info-item">
                  <span class="info-label">时间:</span>
                  <span class="info-value">{{ alarm.time }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">板卡:</span>
                  <span class="info-value">{{ alarm.board_id }}</span>
                </div>
                <div class="info-item" v-if="alarm.cameraName">
                  <span class="info-label">摄像头:</span>
                  <span class="info-value">{{ alarm.cameraName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">状态:</span>
                  <el-tag :type="getStatusType(alarm.status)" size="small">{{ alarm.status }}</el-tag>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div class="thumbnail-actions">
                <el-button type="primary" size="small" @click.stop="handleView(alarm)">
                  查看详情
                </el-button>
                <el-button 
                  v-if="alarm.statusRaw === 0"
                  type="success" 
                  size="small" 
                  @click.stop="handleProcess(alarm)"
                >
                  处理
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 增强型分页组件 -->
      <div class="pagination-container tech-pagination">
        <div class="pagination-info">
          <span>共 <span class="total-count">{{ total }}</span> 条记录，每页显示 
            <el-select 
              v-model="pageSize" 
              @change="handleSizeChange"
              class="page-size-select"
              size="small"
            >
              <el-option label="10" :value="10" />
              <el-option label="20" :value="20" />
              <el-option label="50" :value="50" />
              <el-option label="100" :value="100" />
            </el-select> 条
          </span>
        </div>
        <div class="pagination-controls">
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="currentPage === 1"
            @click="goToPage(1)"
          >
            首页
          </el-button>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            上一页
          </el-button>
          <div class="pagination-pages">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              class="page-btn"
              :class="{ active: page === currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            下一页
          </el-button>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="currentPage === totalPages"
            @click="goToPage(totalPages)"
          >
            末页
          </el-button>
        </div>
      </div>
    </div>

    <!-- 告警详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="告警详情"
      width="60%"
      class="tech-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div v-if="selectedAlarm" class="alarm-detail">
        <div class="detail-section">
          <h4 class="section-title">基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">告警编码：</span>
              <span class="value">{{ selectedAlarm.alarmCode || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">告警时间：</span>
              <span class="value">{{ selectedAlarm.time }}</span>
            </div>
            <div class="detail-item">
              <span class="label">告警类型：</span>
              <span class="value">{{ selectedAlarm.type }}</span>
            </div>
            <div class="detail-item">
              <span class="label">告警级别：</span>
              <span class="value">
                <el-tag :type="selectedAlarm.level === '高' ? 'danger' : selectedAlarm.level === '中' ? 'warning' : 'info'" size="small">
                  {{ selectedAlarm.level }}
                </el-tag>
              </span>
            </div>
            <div class="detail-item" v-if="selectedAlarm.cameraName">
              <span class="label">摄像头：</span>
              <span class="value">{{ selectedAlarm.cameraName }}</span>
            </div>
            <div class="detail-item" v-if="selectedAlarm.boardId">
              <span class="label">板卡ID：</span>
              <span class="value">{{ selectedAlarm.boardId }}</span>
            </div>
            <div class="detail-item">
              <span class="label">状态：</span>
              <span class="value">
                <el-tag :type="getStatusType(selectedAlarm.status)">
                  {{ selectedAlarm.status }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="selectedAlarm.handleTime">
          <h4 class="section-title">处理信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">处理时间：</span>
              <span class="value">{{ selectedAlarm.handleTime }}</span>
            </div>
            <div class="detail-item" v-if="selectedAlarm.handleRemark">
              <span class="label">备注：</span>
              <span class="value">{{ selectedAlarm.handleRemark }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">描述</h4>
          <p class="detail-description">{{ selectedAlarm.description }}</p>
        </div>

        <!-- 截图和视频 -->
        <div class="detail-section">
          <h4 class="section-title">截图和视频</h4>
          <div class="media-section">
            <!-- 截图 -->
            <div class="media-item" v-if="selectedAlarm.images && selectedAlarm.images.length > 0">
              <div class="media-label">告警截图</div>
              <div class="detail-images">
                <!-- 使用Canvas绘制检测框 -->
                <div v-for="(image, index) in selectedAlarm.images" :key="index" class="image-wrapper">
                  <canvas 
                    :ref="el => setCanvasRef(el, index)"
                    class="alarm-image detection-canvas"
                    @click="previewImage(index)"
                  ></canvas>
                </div>
              </div>
              <el-button size="small" type="primary" @click="downloadSnapshot" v-if="selectedAlarm.images[0]">
                下载截图
              </el-button>
            </div>
            <!-- 视频 -->
            <div class="media-item">
              <div class="media-label">告警录像</div>
              <!-- 加载中 -->
              <div v-if="selectedAlarm.videoLoading" class="video-loading">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>正在加载录像...</span>
              </div>
              <!-- 有录像 -->
              <div v-else-if="selectedAlarm.videoUrl" class="video-container">
                <video 
                  :src="selectedAlarm.videoUrl" 
                  controls 
                  class="alarm-video"
                  preload="metadata"
                >
                  您的浏览器不支持视频播放
                </video>
                <div class="video-actions">
                  <el-button size="small" type="success" @click="downloadVideo">
                    下载录像
                  </el-button>
                  <el-button size="small" @click="openVideoInNewTab">
                    在新窗口打开
                  </el-button>
                </div>
              </div>
              <!-- 无录像 -->
              <div v-else class="video-info no-video">
                <el-icon><VideoCamera /></el-icon>
                <span>暂无录像</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 原始数据 -->
        <div class="detail-section" v-if="selectedAlarm.rawData && Object.keys(selectedAlarm.rawData).length > 0">
          <h4 class="section-title">原始数据</h4>
          <div class="raw-data-container">
            <el-button size="small" @click="toggleRawData" class="toggle-btn">
              {{ showRawData ? '收起' : '展开' }}
            </el-button>
            <pre v-show="showRawData" class="raw-data">{{ JSON.stringify(selectedAlarm.rawData, null, 2) }}</pre>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleConfirm">
            确认处理
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量标记误报弹窗 -->
    <el-dialog
      v-model="batchMarkDialogVisible"
      title="📦 批量标记误报"
      width="650px"
      class="tech-dialog"
      :close-on-click-modal="false"
    >
      <div class="batch-mark-content">
        <!-- 筛选条件摘要 -->
        <div class="filter-summary">
          <h4>📋 筛选条件</h4>
          <div class="summary-content">
            <div v-if="searchForm.timeRange && searchForm.timeRange.length === 2">
              <strong>时间范围:</strong> {{ searchForm.timeRange[0] }} ~ {{ searchForm.timeRange[1] }}
            </div>
            <div v-if="searchForm.alarmType">
              <strong>告警类型:</strong> {{ getAlarmTypeName(searchForm.alarmType) }}
            </div>
            <div v-if="searchForm.boardId">
              <strong>板卡:</strong> {{ searchForm.boardId }}
            </div>
            <div v-if="searchForm.alarmLevel">
              <strong>告警级别:</strong> {{ alarmLevelMap[searchForm.alarmLevel] }}
            </div>
            <div v-if="searchForm.status !== ''">
              <strong>处理状态:</strong> {{ searchForm.status === 0 ? '未处理' : '已处理' }}
            </div>
            <div v-if="!hasFilters">
              <span style="color: #6b7280;">未设置筛选条件（将标记所有未处理告警）</span>
            </div>
          </div>
        </div>

        <!-- 预览结果 -->
        <div class="batch-preview">
          <div class="preview-item">
            <div class="preview-count">{{ batchMarkPreview.total }}</div>
            <div class="preview-label">符合条件</div>
          </div>
          <div class="preview-item danger">
            <div class="preview-count">{{ batchMarkPreview.unhandled }}</div>
            <div class="preview-label">将被标记</div>
          </div>
          <div class="preview-item gray">
            <div class="preview-count">{{ batchMarkPreview.handled }}</div>
            <div class="preview-label">已处理(跳过)</div>
          </div>
        </div>

        <!-- 待标记告警列表 -->
        <div v-if="batchMarkPreview.alarmList.length > 0" class="batch-alarm-list-container">
          <div class="list-header">
            <h4>📋 待标记告警列表 <span class="list-count">(最多显示100条)</span></h4>
            <div class="list-actions">
              <el-checkbox v-model="selectAllPreview" @change="toggleSelectAllPreview">全选</el-checkbox>
              <span class="selected-count">已选: <strong>{{ selectedPreviewCount }}</strong> 条</span>
            </div>
          </div>
          <div class="alarm-list-table">
            <table>
              <thead>
                <tr>
                  <th width="50">
                    <el-checkbox v-model="selectAllPreview" @change="toggleSelectAllPreview" />
                  </th>
                  <th width="80">ID</th>
                  <th width="180">告警编码</th>
                  <th width="120">类型</th>
                  <th width="80">级别</th>
                  <th width="120">板卡</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="alarm in batchMarkPreview.alarmList" :key="alarm.id">
                  <td>
                    <el-checkbox v-model="alarm.selected" @change="updatePreviewSelection" />
                  </td>
                  <td>{{ alarm.id }}</td>
                  <td><code style="font-size: 12px; color: #00ffff;">{{ alarm.alarm_code }}</code></td>
                  <td>{{ alarm.alarm_type_name }}</td>
                  <td>
                    <el-tag :type="alarm.alarm_level === 3 ? 'danger' : alarm.alarm_level === 2 ? 'warning' : 'info'" size="small">
                      {{ alarmLevelMap[alarm.alarm_level] }}
                    </el-tag>
                  </td>
                  <td>{{ alarm.board_id || '-' }}</td>
                  <td>{{ alarm.alarm_time }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 处理说明 -->
        <el-form :model="batchMarkForm" ref="batchMarkFormRef">
          <el-form-item label="处理说明（必填）" required>
            <el-input
              v-model="batchMarkForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请说明批量标记的原因，如：算法误报率高、光线问题导致误报等..."
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchMarkDialogVisible = false">取消</el-button>
          <el-button type="warning" @click="confirmBatchMark" :loading="batchMarkLoading">
            ⚠️ 确认批量标记
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 处理告警对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      title="处理告警"
      width="500px"
      class="tech-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理结果" required>
          <el-radio-group v-model="processForm.result">
            <el-radio label="confirmed">
              <span style="margin-left: 5px;">✅ 确认告警 - 需要人工处理，上传报修信息</span>
            </el-radio>
            <el-radio label="false_positive">
              <span style="margin-left: 5px;">❌ 误报 - 将作为负样本分类封禁训练使用</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input
            v-model="processForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入处理备注..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmProcess">
            确认处理
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, List, Grid, Picture, VideoCamera, Loading } from '@element-plus/icons-vue'
import { eventApi } from '@/api/event'
import { detectionApi } from '@/api/detection'

export default {
  name: 'AlarmDisplay',
  setup() {
    // 搜索表单
    const searchForm = reactive({
      timeRange: [],
      alarmType: '',
      boardId: '', // 板卡ID
      alarmLevel: '', // 告警级别
      status: '', // 处理状态
      location: ''
    })

    // 分页相关
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)

    // 点位列表（已移除，不再使用）
    // const locations = ref([])

    // 告警列表
    const alarmList = ref([])

    // 视图模式：list 或 thumbnail（默认为缩略图）
    const viewMode = ref('thumbnail')

    // 表格引用
    const alarmTableRef = ref(null)

    // 选中的告警
    const selectedAlarms = ref([])

    // 板卡列表
    const boardList = ref([])

    // 批量标记误报相关
    const batchMarkDialogVisible = ref(false)
    const batchMarkLoading = ref(false)
    const batchMarkPreview = reactive({
      total: 0,
      unhandled: 0,
      handled: 0,
      alarmList: []  // 待标记的告警列表
    })
    const batchMarkForm = reactive({
      remark: ''
    })
    const batchMarkFormRef = ref(null)
    const selectAllPreview = ref(false)
    
    // 选中的预览告警数量
    const selectedPreviewCount = computed(() => {
      return batchMarkPreview.alarmList.filter(a => a.selected).length
    })

    // 告警类型映射
    // 告警类型列表（从后端加载）
    const alarmTypes = ref([])

    // 告警级别映射
    const alarmLevelMap = {
      1: '低',
      2: '中',
      3: '高'
    }

    // 日期快捷选项
    const dateShortcuts = [
      {
        text: '最近一小时',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000)
          return [start, end]
        }
      },
      {
        text: '今天',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setHours(0, 0, 0, 0)
          return [start, end]
        }
      }
    ]

    // 对话框相关
    const dialogVisible = ref(false)
    const selectedAlarm = ref(null)
    const showRawData = ref(false)
    
    // Canvas相关
    const canvasRefs = ref([])

    // 计算显示的告警列表
    const displayAlarmList = computed(() => {
      return alarmList.value
    })

    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(total.value / pageSize.value) || 1
    })

    // 计算可见页码
    const visiblePages = computed(() => {
      const maxVisiblePages = 5
      const totalPagesValue = totalPages.value
      const currentPageValue = currentPage.value
      
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

    // 加载告警列表
    const loadAlarmList = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value,
          page_size: pageSize.value
        }

        // 时间范围（需要转换为ISO8601格式）
        if (searchForm.timeRange && searchForm.timeRange.length === 2) {
          // 将 "YYYY-MM-DD HH:mm:ss" 格式转换为 ISO8601 格式
          // 替换空格为T，然后转换为Date对象再调用toISOString()
          const startDateTime = new Date(searchForm.timeRange[0].replace(' ', 'T'))
          const endDateTime = new Date(searchForm.timeRange[1].replace(' ', 'T'))
          params.start_time = startDateTime.toISOString()
          params.end_time = endDateTime.toISOString()
        }

        // 告警类型（后端使用复数形式 alarm_types）
        if (searchForm.alarmType) {
          params.alarm_types = searchForm.alarmType
        }

        // 板卡（后端使用复数形式 board_ids）
        if (searchForm.boardId) {
          params.board_ids = searchForm.boardId
        }

        // 告警级别（后端使用复数形式 alarm_levels）
        if (searchForm.alarmLevel) {
          params.alarm_levels = searchForm.alarmLevel
        }

        // 状态
        if (searchForm.status !== '') {
          params.status = searchForm.status
        }

        console.log('请求参数:', params)
        const response = await eventApi.getAlarmList(params)
        console.log('API响应:', response)
        
        // 后端响应格式: { code: 200, data: {data: [...], total: 2, page: 1, page_size: 10} }
        // 经过 api/index.js 处理后，结构为: { code: 200, data: {...}, total: 2 }
        if (response && response.data) {
          // response.data 是对象 {data: [...], total: 2, ...}
          const alarmData = response.data.data || []
          
          // 确保 alarmData 是数组
          if (Array.isArray(alarmData)) {
            alarmList.value = alarmData.map(alarm => ({
              id: alarm.id,
              alarm_code: alarm.alarm_code,
              time: alarm.alarm_time,
              // 直接使用后端返回的alarm_type_name
              type: alarm.alarm_type_name || '未知类型',
              typeRaw: alarm.alarm_type,
              level: alarmLevelMap[alarm.alarm_level] || '未知',
              levelRaw: alarm.alarm_level,
              board_id: alarm.board_id || '-',
              description: getAlarmDescription(alarm),
              status: getAlarmStatus(alarm),
              statusRaw: alarm.status,
              handleResult: alarm.handle_result,
              isFalsePositive: alarm.is_false_positive,
              // 使用snapshot_url和video_url(完整URL)
              snapshotUrl: alarm.snapshot_url,
              videoUrl: alarm.video_url,
              handleRemark: alarm.handle_remark,
              handleTime: alarm.handle_time,
              cameraName: alarm.camera_name,
              // 直接使用后端返回的snapshot_url
              images: alarm.snapshot_url ? [alarm.snapshot_url] : []
            }))
            
            // 提取板卡列表（去重）
            const boards = new Set()
            alarmData.forEach(alarm => {
              if (alarm.board_id && alarm.board_id !== '-') {
                boards.add(alarm.board_id)
              }
            })
            boardList.value = Array.from(boards).sort()
          } else {
            console.error('API返回的data不是数组:', alarmData)
            alarmList.value = []
          }
          
          console.log('解析后的告警数据条数:', alarmData.length)
          total.value = response.data.total || 0
        } else {
          alarmList.value = []
          total.value = 0
        }
      } catch (error) {
        console.error('加载告警列表失败：', error)
        ElMessage.error('加载告警列表失败：' + (error.message || '未知错误'))
        alarmList.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    // 处理搜索
    const handleSearch = () => {
      console.log('搜索条件：', searchForm)
      currentPage.value = 1
      loadAlarmList()
    }

    // 重置搜索
    const handleReset = () => {
      searchForm.timeRange = []
      searchForm.alarmType = ''
      searchForm.boardId = ''
      searchForm.alarmLevel = ''
      searchForm.status = ''
      searchForm.location = ''
      currentPage.value = 1
      loadAlarmList()
    }

    // 判断是否有筛选条件
    const hasFilters = computed(() => {
      return !!(searchForm.timeRange && searchForm.timeRange.length === 2) ||
             !!searchForm.alarmType ||
             !!searchForm.boardId ||
             !!searchForm.alarmLevel ||
             searchForm.status !== ''
    })

    // 判断行是否可选（只有未处理的可选）
    const checkSelectable = (row) => {
      return row.statusRaw === 0 && !row.isFalsePositive
    }

    // 处理选择变化
    const handleSelectionChange = (selection) => {
      selectedAlarms.value = selection
    }

    // 清空选择
    const clearSelection = () => {
      alarmTableRef.value?.clearSelection()
      selectedAlarms.value = []
    }

    // 切换预览列表全选
    const toggleSelectAllPreview = () => {
      batchMarkPreview.alarmList.forEach(alarm => {
        alarm.selected = selectAllPreview.value
      })
    }

    // 更新预览选择状态
    const updatePreviewSelection = () => {
      // 检查是否全部选中
      const allSelected = batchMarkPreview.alarmList.length > 0 && 
                          batchMarkPreview.alarmList.every(a => a.selected)
      selectAllPreview.value = allSelected
    }

    // 通过选中的告警批量标记误报
    const batchMarkFalsePositive = async () => {
      if (selectedAlarms.value.length === 0) {
        ElMessage.warning('请先选择要标记的告警')
        return
      }

      try {
        await ElMessageBox.confirm(
          `确定将选中的 ${selectedAlarms.value.length} 条告警标记为误报吗？`,
          '批量标记确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        batchMarkLoading.value = true
        const ids = selectedAlarms.value.map(alarm => alarm.id)
        
        // 后端可能没有批量API，使用循环调用单个API
        let successCount = 0
        let failCount = 0
        
        for (const id of ids) {
          try {
            await eventApi.handleAlarm(id, {
              result: 'false_positive',
              remark: '批量标记为误报'
            })
            successCount++
          } catch (error) {
            console.error(`标记告警${id}失败:`, error)
            failCount++
          }
        }

        if (successCount > 0) {
          ElMessage.success(`批量标记成功：${successCount}条, 失败：${failCount}条`)
        } else {
          ElMessage.error('批量标记全部失败')
        }
        
        clearSelection()
        loadAlarmList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量标记失败：', error)
          ElMessage.error('批量标记失败：' + (error.message || '未知错误'))
        }
      } finally {
        batchMarkLoading.value = false
      }
    }

    // 打开批量标记对话框（通过筛选条件）
    const showBatchMarkDialog = async () => {
      batchMarkDialogVisible.value = true
      batchMarkForm.remark = ''
      
      // 获取预览数据
      try {
        const params = {
          page: 1,
          page_size: 100  // 后端有最大值限制，不能设置太大
        }

        // 时间范围处理
        if (searchForm.timeRange && searchForm.timeRange.length === 2) {
          try {
            // 确保时间字符串有效
            if (searchForm.timeRange[0] && searchForm.timeRange[1]) {
              const startDateTime = new Date(searchForm.timeRange[0].replace(' ', 'T'))
              const endDateTime = new Date(searchForm.timeRange[1].replace(' ', 'T'))
              
              // 验证日期是否有效
              if (!isNaN(startDateTime.getTime()) && !isNaN(endDateTime.getTime())) {
                params.start_time = startDateTime.toISOString()
                params.end_time = endDateTime.toISOString()
              } else {
                console.warn('时间范围无效，跳过时间筛选')
              }
            }
          } catch (dateError) {
            console.error('时间转换失败:', dateError)
          }
        }
        
        // 告警类型
        if (searchForm.alarmType) {
          params.alarm_types = searchForm.alarmType
        }
        
        // 板卡
        if (searchForm.boardId) {
          params.board_ids = searchForm.boardId
        }
        
        // 告警级别
        if (searchForm.alarmLevel) {
          params.alarm_levels = searchForm.alarmLevel
        }
        
        // 状态
        if (searchForm.status !== '') {
          params.status = searchForm.status
        }

        console.log('=== 批量标记预览 ===')
        console.log('筛选条件:', { 
          timeRange: searchForm.timeRange,
          alarmType: searchForm.alarmType, 
          boardId: searchForm.boardId,
          alarmLevel: searchForm.alarmLevel,
          status: searchForm.status
        })
        console.log('请求参数:', params)
        
        const response = await eventApi.getAlarmList(params)
        console.log('API响应:', response)
        
        const alarmData = response.data?.data || []
        const totalCount = response.data?.total || alarmData.length
        console.log('告警数据条数:', alarmData.length, '总数:', totalCount)
        
        // 筛选出未处理的告警
        const unhandledAlarms = alarmData.filter(a => a.status === 0 && !a.is_false_positive)
        
        batchMarkPreview.total = alarmData.length
        batchMarkPreview.unhandled = unhandledAlarms.length
        batchMarkPreview.handled = alarmData.filter(a => a.status !== 0 || a.is_false_positive).length
        
        // 保存告警列表，添加selected属性
        batchMarkPreview.alarmList = unhandledAlarms.map(alarm => ({
          ...alarm,
          selected: false
        }))
        
        // 重置全选状态
        selectAllPreview.value = false
        
        console.log('预览统计:', {
          total: batchMarkPreview.total,
          unhandled: batchMarkPreview.unhandled,
          handled: batchMarkPreview.handled
        })
        
        // 如果实际总数超过100，给出提示
        if (totalCount > 100) {
          ElMessage.warning(`符合条件的告警共${totalCount}条，预览仅显示前100条`)
        }
      } catch (error) {
        console.error('=== 获取预览数据失败 ===')
        console.error('错误详情:', error)
        console.error('错误响应:', error.response?.data)
        
        let errorMsg = '获取预览数据失败'
        if (error.response?.data?.message) {
          errorMsg += ': ' + error.response.data.message
        } else if (error.message) {
          errorMsg += ': ' + error.message
        }
        
        ElMessage.error(errorMsg)
        
        // 重置预览数据
        batchMarkPreview.total = 0
        batchMarkPreview.unhandled = 0
        batchMarkPreview.handled = 0
      }
    }

    // 确认批量标记
    const confirmBatchMark = async () => {
      if (!batchMarkForm.remark.trim()) {
        ElMessage.warning('请填写处理说明')
        return
      }

      // 获取要标记的告警列表（优先使用选中的，否则使用全部）
      const selectedAlarms = batchMarkPreview.alarmList.filter(a => a.selected)
      const alarmsToMark = selectedAlarms.length > 0 ? selectedAlarms : batchMarkPreview.alarmList
      
      if (alarmsToMark.length === 0) {
        ElMessage.warning('没有可标记的告警')
        return
      }

      try {
        const confirmMsg = selectedAlarms.length > 0
          ? `确定将选中的 ${alarmsToMark.length} 条告警标记为误报吗？`
          : `确定将全部 ${alarmsToMark.length} 条未处理告警标记为误报吗？`
          
        await ElMessageBox.confirm(
          confirmMsg,
          '批量标记确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        batchMarkLoading.value = true

        // 循环调用单个API进行批量标记
        let successCount = 0
        let failCount = 0
        
        for (const alarm of alarmsToMark) {
          try {
            await eventApi.handleAlarm(alarm.id, {
              result: 'false_positive',
              remark: batchMarkForm.remark
            })
            successCount++
          } catch (error) {
            console.error(`标记告警${alarm.id}失败:`, error)
            failCount++
          }
        }

        if (successCount > 0) {
          ElMessage.success(`批量标记成功：${successCount}条, 失败：${failCount}条`)
        } else {
          ElMessage.error('批量标记全部失败')
        }
        
        batchMarkDialogVisible.value = false
        loadAlarmList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量标记失败：', error)
          ElMessage.error('批量标记失败：' + (error.message || '未知错误'))
        }
      } finally {
        batchMarkLoading.value = false
      }
    }

    // 获取告警类型名称
    const getAlarmTypeName = (typeId) => {
      const type = alarmTypes.value.find(t => t.id === typeId)
      return type ? type.name : typeId
    }

    // 获取告警描述
    const getAlarmDescription = (alarm) => {
      // 直接使用后端返回的alarm_type_name
      const typeText = alarm.alarm_type_name || '未知类型'
      const cameraInfo = alarm.camera_name ? `${alarm.camera_name} - ` : ''
      const boardInfo = alarm.board_id ? `板卡${alarm.board_id} - ` : ''
      return `${boardInfo}${cameraInfo}检测到${typeText}`
    }

    // 获取告警状态
    const getAlarmStatus = (alarm) => {
      // 优先判断是否误报
      if (alarm.is_false_positive) {
        return '误报'
      }
      // 判断处理状态
      if (alarm.status === 0) {
        return '未处理'
      } else if (alarm.status === 1) {
        if (alarm.handle_result === 'confirmed') {
          return '已确认'
        } else {
          return '已处理'
        }
      }
      return '未知'
    }

    // 获取状态标签类型
    const getStatusType = (status) => {
      const typeMap = {
        '未处理': 'warning',
        '已确认': 'success',
        '已处理': 'info',
        '误报': 'danger'
      }
      return typeMap[status] || 'info'
    }

    // 获取级别标签类型
    const getLevelType = (level) => {
      const typeMap = {
        '低': 'info',
        '中': 'warning',
        '高': 'danger'
      }
      return typeMap[level] || 'info'
    }

    // 获取默认图片（根据告警类型）
    const getDefaultImage = () => {
      // 返回空字符串，由el-image的error插槽处理
      return ''
    }

    // 获取级别样式类
    const getLevelClass = (level) => {
      const classMap = {
        '低': 'level-low',
        '中': 'level-medium',
        '高': 'level-high'
      }
      return classMap[level] || 'level-low'
    }

    // 获取缩略图卡片样式类
    const getThumbnailCardClass = (alarm) => {
      const classes = []
      // 根据告警级别添加边框颜色类
      if (alarm.level === '高') {
        classes.push('border-danger')
      } else if (alarm.level === '中') {
        classes.push('border-warning')
      } else {
        classes.push('border-info')
      }
      // 根据状态添加背景色类
      if (alarm.isFalsePositive) {
        classes.push('bg-false-positive')
      } else if (alarm.statusRaw === 1) {
        classes.push('bg-handled')
      }
      return classes.join(' ')
    }

    // 查看告警详情
    const handleView = async (row) => {
      try {
        // 从后端获取完整的告警详情
        const response = await eventApi.getAlarmDetail(row.id)
        console.log('告警详情响应:', response)
        
        // 后端响应可能是 { data: {...} } 或直接是告警对象
        const alarm = response.data || response
        
        if (alarm && alarm.id) {
          selectedAlarm.value = {
            id: alarm.id,
            alarmCode: alarm.alarm_code,
            time: alarm.alarm_time,
            // 直接使用后端返回的alarm_type_name
            type: alarm.alarm_type_name || '未知类型',
            description: getAlarmDescription(alarm),
            status: getAlarmStatus(alarm),
            statusRaw: alarm.status,
            level: alarmLevelMap[alarm.alarm_level] || '未知',
            handleRemark: alarm.handle_remark,
            handleTime: alarm.handle_time,
            boardId: alarm.board_id,
            cameraName: alarm.camera_name,
            isFalsePositive: alarm.is_false_positive,
            // 直接使用后端返回的snapshot_url
            images: alarm.snapshot_url ? [alarm.snapshot_url] : [],
            videoUrl: null, // 先设为null，稍后从录像API加载
            videoLoading: false,
            // MongoDB详细数据
            confidence: alarm.confidence,
            detectionBoxes: alarm.detection_boxes,
            trackingData: alarm.tracking_data,
            algorithmData: alarm.algorithm_data,
            rawData: alarm.raw_data
          }
          
          dialogVisible.value = true
          
          // 异步加载录像
          loadAlarmRecording(alarm.alarm_code)
          
          // 绘制检测框到截图上
          nextTick(() => {
            drawDetectionBoxes()
          })
        } else {
          ElMessage.error('获取告警详情失败：数据格式错误')
        }
      } catch (error) {
        console.error('获取告警详情失败：', error)
        ElMessage.error('获取告警详情失败：' + (error.message || '未知错误'))
      }
    }

    // 加载告警录像
    const loadAlarmRecording = async (alarmCode) => {
      if (!alarmCode || !selectedAlarm.value) return
      
      try {
        selectedAlarm.value.videoLoading = true
        console.log('查询告警录像:', alarmCode)
        
        const response = await detectionApi.getRecordingByAlarmId(alarmCode)
        console.log('录像查询响应:', response)
        
        if (response && response.code === 200 && response.data) {
          const recording = response.data
          if (recording.play_url) {
            selectedAlarm.value.videoUrl = recording.play_url
            selectedAlarm.value.recordingInfo = recording
            console.log('录像加载成功:', recording.play_url)
          } else {
            console.log('录像数据中没有play_url')
          }
        }
      } catch (error) {
        console.log('该告警暂无关联录像:', error.message)
      } finally {
        if (selectedAlarm.value) {
          selectedAlarm.value.videoLoading = false
        }
      }
    }

    // 设置Canvas引用
    const setCanvasRef = (el, index) => {
      if (el) {
        canvasRefs.value[index] = el
      }
    }

    // 绘制检测框到截图上
    const drawDetectionBoxes = () => {
      if (!selectedAlarm.value || !selectedAlarm.value.images || selectedAlarm.value.images.length === 0) {
        return
      }

      const detectionBoxes = selectedAlarm.value.detectionBoxes || []
      
      selectedAlarm.value.images.forEach((imageUrl, index) => {
        const canvas = canvasRefs.value[index]
        if (!canvas) return

        const img = new Image()
        img.crossOrigin = 'anonymous' // 处理跨域问题
        
        img.onload = () => {
          // 设置canvas尺寸为图片尺寸
          canvas.width = img.width
          canvas.height = img.height
          
          const ctx = canvas.getContext('2d')
          
          // 绘制原始图片
          ctx.drawImage(img, 0, 0)
          
          // 绘制检测框
          if (detectionBoxes && detectionBoxes.length > 0) {
            detectionBoxes.forEach((box) => {
              const { x, y, width, height, confidence, label } = box
              
              // 计算框的左上角坐标（x,y是中心点）
              const left = x - width / 2
              const top = y - height / 2
              
              // 设置绘制样式
              ctx.strokeStyle = '#00ffff' // 青色边框
              ctx.lineWidth = 3
              ctx.fillStyle = 'rgba(0, 255, 255, 0.2)' // 半透明填充
              
              // 绘制矩形框
              ctx.fillRect(left, top, width, height)
              ctx.strokeRect(left, top, width, height)
              
              // 绘制标签背景
              const labelText = `${label || '未知'} ${(confidence * 100).toFixed(1)}%`
              ctx.font = 'bold 24px Arial'
              const textMetrics = ctx.measureText(labelText)
              const textWidth = textMetrics.width
              const textHeight = 30
              const padding = 8
              
              // 智能计算标签位置
              let labelX, labelY, textX, textY
              
              // 检查上侧是否有足够空间
              if (top - textHeight - 6 >= 0) {
                // 上侧有空间，放在上侧
                labelX = left
                labelY = top - textHeight - 6
                textX = left + padding
                textY = top - 10
              } 
              // 检查下侧是否有足够空间
              else if (top + height + textHeight + 6 <= img.height) {
                // 下侧有空间，放在下侧
                labelX = left
                labelY = top + height + 2
                textX = left + padding
                textY = top + height + textHeight - 4
              }
              // 检查右侧是否有足够空间
              else if (left + width + textWidth + 16 <= img.width) {
                // 右侧有空间，放在右侧
                labelX = left + width + 2
                labelY = top
                textX = left + width + 2 + padding
                textY = top + textHeight - 6
              }
              // 检查左侧是否有足够空间
              else if (left - textWidth - 16 >= 0) {
                // 左侧有空间，放在左侧
                labelX = left - textWidth - 16
                labelY = top
                textX = left - textWidth - 16 + padding
                textY = top + textHeight - 6
              }
              // 如果都没有空间，强制放在框内上方
              else {
                labelX = left
                labelY = top + 2
                textX = left + padding
                textY = top + textHeight - 4
              }
              
              // 标签背景
              ctx.fillStyle = 'rgba(0, 255, 255, 0.9)'
              ctx.fillRect(labelX, labelY, textWidth + 16, textHeight + 6)
              
              // 标签文字
              ctx.fillStyle = '#000'
              ctx.fillText(labelText, textX, textY)
            })
          }
        }
        
        img.onerror = () => {
          console.error('图片加载失败:', imageUrl)
        }
        
        img.src = imageUrl
      })
    }

    // 预览图片
    const previewImage = (index) => {
      // 可以使用Element Plus的图片预览功能
      // 这里暂时留空，后续可以实现
      console.log('预览图片:', index)
    }

    // 处理表单数据
    const processForm = reactive({
      result: 'confirmed',
      remark: ''
    })
    const processDialogVisible = ref(false)
    const currentProcessAlarm = ref(null)

    // 处理告警
    const handleProcess = async (row) => {
      console.log('处理告警：', row)
      currentProcessAlarm.value = row
      processForm.result = 'confirmed'
      processForm.remark = ''
      processDialogVisible.value = true
    }

    // 确认处理
    const confirmProcess = async () => {
      if (!currentProcessAlarm.value) return
      
      try {
        // 调用API处理告警
        await eventApi.handleAlarm(currentProcessAlarm.value.id, {
          result: processForm.result,
          remark: processForm.remark || ''
        })

        ElMessage({
          type: 'success',
          message: '告警处理成功'
        })

        processDialogVisible.value = false
        // 重新加载列表
        loadAlarmList()
      } catch (error) {
        console.error('处理告警失败：', error)
        ElMessage.error('处理告警失败：' + (error.message || '未知错误'))
      }
    }

    // 确认处理告警（从详情对话框）
    const handleConfirm = async () => {
      if (!selectedAlarm.value) return
      
      // 复用处理表单
      currentProcessAlarm.value = selectedAlarm.value
      processForm.result = 'confirmed'
      processForm.remark = ''
      dialogVisible.value = false
      processDialogVisible.value = true
    }

    // 切换原始数据显示
    const toggleRawData = () => {
      showRawData.value = !showRawData.value
    }

    // 下载截图
    const downloadSnapshot = () => {
      if (selectedAlarm.value && selectedAlarm.value.images && selectedAlarm.value.images[0]) {
        window.open(selectedAlarm.value.images[0], '_blank')
      }
    }

    // 播放/下载视频
    const playVideo = () => {
      if (selectedAlarm.value && selectedAlarm.value.videoUrl) {
        window.open(selectedAlarm.value.videoUrl, '_blank')
      }
    }

    // 下载视频
    const downloadVideo = async () => {
      if (!selectedAlarm.value || !selectedAlarm.value.videoUrl) {
        ElMessage.warning('没有可下载的录像')
        return
      }

      try {
        ElMessage.info('正在准备下载录像...')
        
        // 使用fetch下载视频
        const response = await fetch(selectedAlarm.value.videoUrl)
        if (!response.ok) {
          throw new Error('下载失败')
        }
        
        // 获取blob数据
        const blob = await response.blob()
        
        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `alarm_${selectedAlarm.value.alarmCode}_${Date.now()}.mp4`
        document.body.appendChild(link)
        link.click()
        
        // 清理
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        ElMessage.success('录像下载成功')
      } catch (error) {
        console.error('下载录像失败:', error)
        ElMessage.error('下载录像失败，请尝试在新窗口打开')
      }
    }

    // 在新窗口打开视频
    const openVideoInNewTab = () => {
      if (selectedAlarm.value && selectedAlarm.value.videoUrl) {
        window.open(selectedAlarm.value.videoUrl, '_blank')
      }
    }

    // 分页处理
    const handleSizeChange = (val) => {
      console.log('每页显示条数：', val)
      pageSize.value = val
      currentPage.value = 1
      loadAlarmList()
    }

    const handleCurrentChange = (val) => {
      console.log('当前页：', val)
      currentPage.value = val
      loadAlarmList()
    }

    // 跳转到指定页面
    const goToPage = (page) => {
      if (page < 1 || page > totalPages.value || page === currentPage.value) {
        return
      }
      currentPage.value = page
      loadAlarmList()
    }

    const handleRowClick = (row) => {
      console.log('点击行：', row)
      handleView(row)
    }

    // 加载告警类型列表
    const loadAlarmTypes = async () => {
      try {
        const response = await eventApi.getAlarmTypes()
        console.log('告警类型响应:', response)
        if (response && response.data) {
          alarmTypes.value = response.data
        }
      } catch (error) {
        console.error('加载告警类型失败：', error)
      }
    }

    // 组件挂载时加载数据
    onMounted(() => {
      loadAlarmTypes()
      loadAlarmList()
    })

    return {
      loading,
      searchForm,
      alarmList,
      alarmTypes,
      boardList,
      displayAlarmList,
      currentPage,
      pageSize,
      total,
      totalPages,
      visiblePages,
      dateShortcuts,
      dialogVisible,
      selectedAlarm,
      viewMode,
      alarmTableRef,
      selectedAlarms,
      batchMarkDialogVisible,
      batchMarkLoading,
      batchMarkPreview,
      batchMarkForm,
      batchMarkFormRef,
      selectAllPreview,
      selectedPreviewCount,
      toggleSelectAllPreview,
      updatePreviewSelection,
      processForm,
      processDialogVisible,
      confirmProcess,
      alarmLevelMap,
      hasFilters,
      checkSelectable,
      handleSelectionChange,
      clearSelection,
      batchMarkFalsePositive,
      showBatchMarkDialog,
      confirmBatchMark,
      getAlarmTypeName,
      handleSearch,
      handleReset,
      getStatusType,
      getLevelType,
      handleView,
      handleProcess,
      handleConfirm,
      handleSizeChange,
      handleCurrentChange,
      handleRowClick,
      goToPage,
      getDefaultImage,
      getLevelClass,
      getThumbnailCardClass,
      showRawData,
      toggleRawData,
      downloadSnapshot,
      playVideo,
      downloadVideo,
      openVideoInNewTab,
      loadAlarmRecording,
      setCanvasRef,
      drawDetectionBoxes,
      previewImage,
      Search,
      Refresh,
      List,
      Grid,
      Picture,
      VideoCamera,
      Loading
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
  padding: 20px;
  padding-bottom: 40px;
  background: transparent;
  overflow: visible;
  box-sizing: border-box;
}

/* 标题样式 */
.alarm-display h2 {
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

.alarm-display {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.mb-20 {
  margin-bottom: 20px;
}

.content-area {
  padding: 0;
  background: transparent !important;
  border: none !important;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-title {
  color: #00ffff;
  font-weight: bold;
  font-size: 16px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

/* 视图切换按钮样式 */
.view-toggle-buttons {
  display: flex;
  gap: 8px;
}

.view-toggle-btn {
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background: rgba(0, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  padding: 6px 12px !important;
  font-size: 13px !important;
}

.view-toggle-btn:hover {
  background: rgba(0, 255, 255, 0.15) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
  transform: translateY(-1px) !important;
  color: #00ffff !important;
}

.view-toggle-btn.active {
  background: rgba(0, 255, 255, 0.25) !important;
  border-color: #00ffff !important;
  color: #00ffff !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
}

.view-toggle-btn :deep(.el-icon) {
  margin-right: 4px;
}

.search-filters-content {
  padding: 0;
}

.filter-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
  gap: 12px;
  align-items: end;
}

.filter-item-wide {
  grid-column: span 1;
}

.filter-item {
  min-width: 0;
}

/* 1920px以下改为两行布局 */
@media (max-width: 1920px) {
  .filter-row {
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 10px;
  }
  
  .filter-item:nth-child(5),
  .filter-actions {
    grid-row: 2;
  }
  
  .filter-item:nth-child(5) {
    grid-column: 1;
  }
  
  .filter-actions {
    grid-column: 2 / -1;
    justify-self: end;
  }
}

@media (max-width: 1600px) {
  .filter-row {
    grid-template-columns: 2fr 1fr 1fr;
  }
  
  .filter-item:nth-child(4) {
    grid-column: 1;
    grid-row: 2;
  }
  
  .filter-item:nth-child(5) {
    grid-column: 2;
    grid-row: 2;
  }
  
  .filter-actions {
    grid-column: 3;
    grid-row: 2;
  }
}

@media (max-width: 1200px) {
  .filter-row {
    grid-template-columns: 1fr 1fr;
  }
  
  .filter-item-wide {
    grid-column: span 2;
  }
  
  .filter-actions {
    grid-column: span 2;
  }
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

.alarm-detail {
  padding: 20px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  color: #00ffff;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item .label {
  min-width: 90px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.detail-item .value {
  color: rgba(255, 255, 255, 0.95);
  flex: 1;
}

.detail-description {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0;
  padding: 10px;
  background: rgba(0, 255, 255, 0.05);
  border-radius: 6px;
  border-left: 3px solid rgba(0, 255, 255, 0.4);
}

.detail-images {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.image-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.alarm-image {
  width: 100%;
  height: auto;
  max-height: 400px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.detection-canvas {
  display: block;
  max-width: 100%;
  object-fit: contain;
}

/* Element Plus 组件深色主题样式 */
:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-input__wrapper) {
  background: rgba(20, 30, 50, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: 
    inset 0 0 10px rgba(0, 255, 255, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(5px) !important;
}

:deep(.el-input__wrapper:hover) {
  background: rgba(25, 35, 55, 0.9) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 
    inset 0 0 15px rgba(0, 255, 255, 0.08),
    0 0 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-input__wrapper.is-focus) {
  background: rgba(25, 35, 55, 0.95) !important;
  border-color: #00ffff !important;
  box-shadow: 
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 0 0 2px rgba(0, 255, 255, 0.3),
    0 0 15px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-input__inner) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 500 !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
  font-style: italic !important;
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  box-shadow: inset 0 0 10px rgba(0, 255, 255, 0.05) !important;
}

:deep(.el-select .el-input__wrapper:hover) {
  background: rgba(25, 35, 55, 0.9) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 
    inset 0 0 15px rgba(0, 255, 255, 0.08),
    0 0 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-select-dropdown) {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  backdrop-filter: blur(15px) !important;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
  border-radius: 8px !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.85) !important;
  padding: 8px 16px !important;
  transition: all 0.3s ease !important;
  border-radius: 4px !important;
  margin: 2px 4px !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
  transform: translateX(2px) !important;
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  background: rgba(0, 255, 255, 0.25) !important;
  color: #00ffff !important;
  font-weight: 600 !important;
  box-shadow: 
    0 2px 8px rgba(0, 255, 255, 0.3),
    inset 0 0 10px rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-date-editor) {
  background: rgba(20, 30, 50, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: 
    inset 0 0 10px rgba(0, 255, 255, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(5px) !important;
}

:deep(.el-date-editor:hover) {
  background: rgba(25, 35, 55, 0.9) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 
    inset 0 0 15px rgba(0, 255, 255, 0.08),
    0 0 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-date-editor.is-active) {
  background: rgba(25, 35, 55, 0.95) !important;
  border-color: #00ffff !important;
  box-shadow: 
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 0 0 2px rgba(0, 255, 255, 0.3),
    0 0 15px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-picker-panel) {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  backdrop-filter: blur(15px) !important;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-picker-panel__body) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-date-table) {
  background: transparent !important;
}

:deep(.el-date-table td) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-date-table td:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

:deep(.el-date-table td.current) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
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

/* 表格头部样式 */
.tech-table :deep(.el-table__header-wrapper) {
  background: linear-gradient(135deg, 
    rgba(20, 35, 60, 1) 0%, 
    rgba(25, 40, 65, 1) 100%) !important;
  border-radius: 12px 12px 0 0 !important;
  border: none !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header) {
  background: transparent !important;
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

.tech-table :deep(.el-table__header-wrapper .el-table__header th::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.05), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header th:hover::before) {
  opacity: 1;
}

/* 表格体样式 */
.tech-table :deep(.el-table__body-wrapper) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: none !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body) {
  background: transparent !important;
  border: none !important;
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

/* 悬停效果 - 参考联动规则管理的交互效果 */
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

/* 单元格样式 - 参考联动规则管理的单元格设计 */
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

/* 移除所有可能的边框和分隔线 */
.tech-table :deep(.el-table th.el-table__cell) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

.tech-table :deep(.el-table td.el-table__cell) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

/* 终极解决方案 - 强制覆盖所有可能的白边 */
.tech-table :deep(.el-table),
.tech-table :deep(.el-table *),
.tech-table :deep(.el-table__inner-wrapper),
.tech-table :deep(.el-table__inner-wrapper *) {
  border: 0 !important;
  border-width: 0 !important;
  border-style: none !important;
  border-color: transparent !important;
  outline: 0 !important;
  outline-width: 0 !important;
  outline-style: none !important;
  outline-color: transparent !important;
  box-shadow: none !important;
}

/* 强制移除 Element Plus 的所有默认样式 */
.tech-table :deep(.el-table--border),
.tech-table :deep(.el-table--group),
.tech-table :deep(.el-table--striped) {
  border: 0 !important;
  border-width: 0 !important;
  border-style: none !important;
  border-color: transparent !important;
}

/* 覆盖所有伪元素的边框 */
.tech-table :deep(.el-table::before),
.tech-table :deep(.el-table::after),
.tech-table :deep(.el-table *::before),
.tech-table :deep(.el-table *::after) {
  border: 0 !important;
  border-width: 0 !important;
  border-style: none !important;
  border-color: transparent !important;
  content: none !important;
  display: none !important;
}

/* 强制设置表格内所有元素的背景色 */
.tech-table :deep(.el-table),
.tech-table :deep(.el-table__inner-wrapper) {
  background-color: rgba(15, 25, 45, 0.95) !important;
  background: rgba(15, 25, 45, 0.95) !important;
}

/* 移除表格的默认边距和内边距 */
.tech-table :deep(.el-table),
.tech-table :deep(.el-table *) {
  margin: 0 !important;
}

/* 重新设置单元格的内边距 */
.tech-table :deep(.el-table th),
.tech-table :deep(.el-table td) {
  padding: 14px 12px !important;
}

/* 确保表格宽度100%且没有额外空白 */
.tech-table :deep(.el-table) {
  width: 100% !important;
  margin: 0 !important;
  border-spacing: 0 !important;
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

/* 空状态样式 */
.tech-table :deep(.el-table__empty-block) {
  background: transparent !important;
  border: none !important;
}

.tech-table :deep(.el-table__empty-text) {
  color: rgba(255, 255, 255, 0.6) !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3) !important;
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

:deep(.el-pagination) {
  background: rgba(15, 25, 45, 0.8) !important;
  padding: 12px 16px !important;
  border-radius: 8px !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 0 10px rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next),
:deep(.el-pagination .el-pager li) {
  background: rgba(20, 30, 50, 0.6) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover),
:deep(.el-pagination .el-pager li:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  border-color: #00ffff !important;
}

:deep(.el-pagination .el-pagination__sizes .el-select .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-pagination .el-pagination__jump .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

/* 科技感对话框 - 完整样式 */
:deep(.el-dialog) {
  background: rgba(45, 55, 75, 0.92) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 15px !important;
  box-shadow: 
    0 0 50px rgba(0, 255, 255, 0.3),
    inset 0 0 50px rgba(0, 255, 255, 0.08) !important;
}

:deep(.el-dialog__header) {
  background: rgba(45, 55, 75, 0.92) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 15px 15px 0 0 !important;
}

:deep(.el-dialog__title) {
  color: #00ffff !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
  font-weight: bold !important;
}

:deep(.el-dialog__body) {
  background: rgba(45, 55, 75, 0.92) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

/* 对话框内的标签 */
.detail-item .label {
  color: #00ffff !important;
  font-weight: 500 !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3) !important;
}

/* 对话框按钮 */
:deep(.el-dialog .el-button) {
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-dialog .el-button:hover) {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-1px) !important;
}

:deep(.el-dialog .el-button--primary) {
  background: rgba(0, 255, 255, 0.3) !important;
  border-color: #00ffff !important;
  color: #ffffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-dialog .el-button--primary:hover) {
  background: rgba(0, 255, 255, 0.4) !important;
  box-shadow: 0 0 25px rgba(0, 255, 255, 0.5) !important;
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
  margin-top: 20px;
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

.select-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  background: rgba(20, 30, 50, 0.85);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  height: 32px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    inset 0 0 10px rgba(0, 255, 255, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
}

.selected-text {
  flex: 1;
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: transparent;
  transition: color 0.3s ease;
}

.select-arrow {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0088aa 0%, #005577 50%, #003344 100%);
  border-left: 1px solid rgba(0, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.select-arrow::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.select-arrow svg {
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.3));
}

/* 悬停状态 */
.custom-select:hover .select-input {
  background: rgba(25, 35, 55, 0.9);
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 
    inset 0 0 15px rgba(0, 255, 255, 0.08),
    0 0 8px rgba(0, 255, 255, 0.2);
}

.custom-select:hover .select-arrow {
  background: linear-gradient(135deg, #00ccff 0%, #0077aa 50%, #004466 100%);
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.6),
    0 0 40px rgba(0, 255, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}

.custom-select:hover .select-arrow::before {
  opacity: 1;
}

/* 展开状态 */
.custom-select.is-open .select-input {
  border-color: #00ffff;
  background: rgba(25, 35, 55, 0.95);
  box-shadow: 
    0 0 0 2px rgba(0, 255, 255, 0.3),
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 0 15px rgba(0, 255, 255, 0.2);
}

.custom-select.is-open .select-arrow {
  background: linear-gradient(135deg, #00ddff 0%, #0088bb 50%, #005577 100%);
  box-shadow: 
    0 0 25px rgba(0, 255, 255, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
}

.custom-select.is-open .select-arrow svg {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: rgba(15, 25, 45, 0.98);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(15px);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.1);
  z-index: 9999;
  max-height: 200px;
  overflow-y: auto;
  animation: dropdownFadeIn 0.2s ease-out;
}

.dropdown-item {
  padding: 10px 16px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  margin: 2px 4px;
  position: relative;
  overflow: hidden;
  min-height: 36px;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.dropdown-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.dropdown-item:hover {
  background: rgba(0, 255, 255, 0.15);
  color: #00ffff;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2);
}

.dropdown-item:hover::before {
  left: 100%;
}

.dropdown-item.is-selected {
  background: rgba(0, 255, 255, 0.25);
  color: #00ffff;
  font-weight: 600;
  box-shadow: 
    0 2px 8px rgba(0, 255, 255, 0.3),
    inset 0 0 10px rgba(0, 255, 255, 0.1);
}

.dropdown-item.is-selected::after {
  content: '✓';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #00ffff;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

/* 滚动条样式 */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: rgba(20, 30, 50, 0.5);
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #00ffff, #0099cc);
  border-radius: 3px;
  box-shadow: inset 0 0 2px rgba(255, 255, 255, 0.2);
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #00ccff, #0077aa);
}

/* 下拉菜单动画 */
@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ==================== 超强力移除表格左右白线 ==================== */
/* 这是最终的强制覆盖，确保表格左右没有任何边框 */
.tech-table,
.tech-table :deep(.el-table),
.tech-table :deep(.el-table__inner-wrapper),
.tech-table :deep(.el-table__header-wrapper),
.tech-table :deep(.el-table__body-wrapper),
.tech-table :deep(.el-table__footer-wrapper) {
  border-left: 0 !important;
  border-right: 0 !important;
  border-left-width: 0 !important;
  border-right-width: 0 !important;
  border-left-style: none !important;
  border-right-style: none !important;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
}

/* 移除所有可能的左右边框伪元素 */
.tech-table::before,
.tech-table::after,
.tech-table :deep(.el-table)::before,
.tech-table :deep(.el-table)::after,
.tech-table :deep(.el-table__inner-wrapper)::before,
.tech-table :deep(.el-table__inner-wrapper)::after,
.tech-table :deep(.el-table__header-wrapper)::before,
.tech-table :deep(.el-table__header-wrapper)::after,
.tech-table :deep(.el-table__body-wrapper)::before,
.tech-table :deep(.el-table__body-wrapper)::after {
  display: none !important;
  content: none !important;
  border: 0 !important;
  border-left: 0 !important;
  border-right: 0 !important;
  width: 0 !important;
  height: 0 !important;
}

/* 强制表格容器没有左右边框 */
.tech-table {
  border-left: 0 !important;
  border-right: 0 !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

/* 确保表格的第一列和最后一列没有额外边框 */
.tech-table :deep(.el-table th:first-child),
.tech-table :deep(.el-table td:first-child) {
  border-left: 0 !important;
}

.tech-table :deep(.el-table th:last-child),
.tech-table :deep(.el-table td:last-child) {
  border-right: 0 !important;
}

/* 移除所有 border-patch 元素（Element Plus 添加的边框修复元素） */
.tech-table :deep([class*="border-left"]),
.tech-table :deep([class*="border-right"]) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  border: 0 !important;
}

/* 最终的全局覆盖 */
.tech-table :deep(*[class*="el-table"]) {
  border-left: 0 !important;
  border-right: 0 !important;
}

/* ==================== 缩略图视图样式 ==================== */
.thumbnail-view {
  width: 100%;
  padding: 20px 0;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.thumbnail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
  padding-bottom: 20px; /* 底部留白 */
}

.thumbnail-card {
  background: rgba(25, 35, 55, 0.8);
  border: 2px solid rgba(0, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.thumbnail-card:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.3);
  background: rgba(30, 40, 60, 0.9);
}

/* 卡片边框颜色 */
.thumbnail-card.border-danger {
  border-color: rgba(245, 108, 108, 0.5);
}

.thumbnail-card.border-warning {
  border-color: rgba(230, 162, 60, 0.5);
}

.thumbnail-card.border-info {
  border-color: rgba(144, 202, 249, 0.5);
}

/* 卡片背景色 */
.thumbnail-card.bg-false-positive {
  background: rgba(120, 120, 120, 0.2);
}

.thumbnail-card.bg-handled {
  background: rgba(76, 175, 80, 0.1);
}

/* 卡片头部 */
.thumbnail-header {
  padding: 10px 15px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.thumbnail-header.level-low {
  background: linear-gradient(135deg, rgba(144, 147, 153, 0.2), rgba(144, 147, 153, 0.1));
}

.thumbnail-header.level-medium {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.2), rgba(230, 162, 60, 0.1));
}

.thumbnail-header.level-high {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.2), rgba(245, 108, 108, 0.1));
}

.thumbnail-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.thumbnail-type {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 8px;
}

/* 卡片主体 */
.thumbnail-body {
  cursor: pointer;
}

.thumbnail-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: rgba(20, 30, 50, 0.8);
}

.alarm-thumbnail {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.thumbnail-card:hover .alarm-thumbnail {
  transform: scale(1.05);
}

.image-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(20, 30, 50, 0.9);
  color: rgba(0, 255, 255, 0.5);
  gap: 8px;
}

.image-slot .el-icon {
  font-size: 48px;
}

.image-slot div {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.thumbnail-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.thumbnail-badge.level-low {
  background: rgba(144, 147, 153, 0.8);
  border: 1px solid rgba(144, 147, 153, 0.5);
  color: #ffffff;
}

.thumbnail-badge.level-medium {
  background: rgba(230, 162, 60, 0.8);
  border: 1px solid rgba(230, 162, 60, 0.5);
  color: #ffffff;
}

.thumbnail-badge.level-high {
  background: rgba(245, 108, 108, 0.8);
  border: 1px solid rgba(245, 108, 108, 0.5);
  color: #ffffff;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
  }
  50% {
    box-shadow: 0 2px 15px rgba(245, 108, 108, 0.6);
  }
}

.thumbnail-info {
  padding: 12px 15px;
  background: rgba(20, 30, 50, 0.6);
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  min-width: 45px;
}

.info-value {
  color: rgba(255, 255, 255, 0.9);
  flex: 1;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
}

.info-value code {
  background: rgba(0, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  color: rgba(0, 255, 255, 0.9);
  font-size: 10px;
}

/* 操作按钮 */
.thumbnail-actions {
  padding: 10px 15px;
  display: flex;
  gap: 8px;
  border-top: 1px solid rgba(0, 255, 255, 0.1);
  background: rgba(15, 25, 45, 0.6);
}

.thumbnail-actions .el-button {
  flex: 1;
  font-size: 12px;
}

.thumbnail-title {
  color: #00ffff;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.thumbnail-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 批量操作栏 */
.batch-operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  margin-bottom: 15px;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(99, 102, 241, 0.05));
  border: 1px solid rgba(79, 70, 229, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.batch-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.batch-info .count {
  color: #6366f1;
  font-size: 18px;
  font-weight: bold;
  margin: 0 5px;
}

.batch-actions {
  display: flex;
  gap: 10px;
}

/* 批量标记弹窗内容 */
.batch-mark-content {
  color: rgba(255, 255, 255, 0.9);
}

.filter-summary {
  padding: 15px;
  background: rgba(248, 250, 252, 0.05);
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.filter-summary h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #00ffff;
  font-size: 16px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

.summary-content {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.8;
}

.summary-content div {
  margin-bottom: 6px;
}

.summary-content strong {
  color: rgba(255, 255, 255, 0.9);
  margin-right: 8px;
}

.batch-preview {
  display: flex;
  justify-content: space-around;
  padding: 15px;
  background: rgba(254, 243, 199, 0.1);
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.preview-item {
  flex: 1;
}

.preview-count {
  font-size: 24px;
  font-weight: bold;
  color: rgba(146, 64, 14, 0.9);
  margin-bottom: 5px;
}

.preview-item.danger .preview-count {
  color: #ef4444;
}

.preview-item.gray .preview-count {
  color: #6b7280;
}

.preview-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.preview-item.danger .preview-label {
  color: #fca5a5;
}

.preview-item.gray .preview-label {
  color: #9ca3af;
}

/* 处理对话框样式 */
.tech-dialog :deep(.el-radio-group) {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.tech-dialog :deep(.el-radio) {
  margin-right: 0;
  white-space: normal;
  align-items: flex-start;
  height: auto;
  padding: 10px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 6px;
  transition: all 0.3s;
}

.tech-dialog :deep(.el-radio:hover) {
  border-color: rgba(0, 255, 255, 0.5);
  background: rgba(0, 255, 255, 0.05);
}

.tech-dialog :deep(.el-radio.is-checked) {
  border-color: #00ffff;
  background: rgba(0, 255, 255, 0.1);
}

.tech-dialog :deep(.el-radio__label) {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

/* 批量标记告警列表样式 */
.batch-alarm-list-container {
  margin-bottom: 20px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.batch-alarm-list-container .list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: rgba(0, 255, 255, 0.05);
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.batch-alarm-list-container .list-header h4 {
  margin: 0;
  color: #00ffff;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-alarm-list-container .list-count {
  color: #6b7280;
  font-size: 12px;
  font-weight: normal;
}

.batch-alarm-list-container .list-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.batch-alarm-list-container .selected-count {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}

.batch-alarm-list-container .selected-count strong {
  color: #3b82f6;
  font-size: 16px;
  margin: 0 3px;
}

.alarm-list-table {
  max-height: 400px;
  overflow-y: auto;
}

.alarm-list-table table {
  width: 100%;
  border-collapse: collapse;
}

.alarm-list-table thead {
  position: sticky;
  top: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1;
}

.alarm-list-table th {
  padding: 10px 8px;
  text-align: left;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 13px;
  border-bottom: 2px solid rgba(0, 255, 255, 0.3);
}

.alarm-list-table tbody tr {
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  transition: background 0.2s;
}

.alarm-list-table tbody tr:hover {
  background: rgba(0, 255, 255, 0.05);
}

.alarm-list-table td {
  padding: 10px 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.alarm-list-table td code {
  background: rgba(0, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
}

/* 响应式布局 */
@media (max-width: 1600px) {
  .thumbnail-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 1200px) {
  .thumbnail-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (max-width: 768px) {
  .thumbnail-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
  }
  
  .thumbnail-image {
    height: 140px;
  }
  
  .thumbnail-info {
    padding: 10px 12px;
  }
}

/* 媒体区域样式 */
.media-section {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.media-item {
  flex: 1;
  padding: 15px;
  background: rgba(0, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.media-label {
  color: #00ffff;
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 14px;
}

/* 视频容器 */
.video-container {
  width: 100%;
}

.alarm-video {
  width: 100%;
  max-height: 400px;
  background: #000;
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.video-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  justify-content: flex-start;
}

/* 媒体区域按钮统一样式 */
.media-item .el-button {
  background: rgba(0, 150, 200, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  color: #ffffff !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
}

.media-item .el-button:hover {
  background: rgba(0, 180, 220, 0.9) !important;
  border-color: #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
  transform: translateY(-1px);
}

.media-item .el-button--primary {
  background: rgba(0, 150, 200, 0.8) !important;
  border-color: rgba(0, 255, 255, 0.4) !important;
}

.media-item .el-button--success {
  background: rgba(0, 150, 200, 0.8) !important;
  border-color: rgba(0, 255, 255, 0.4) !important;
}

.video-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 30px;
  background: rgba(0, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px dashed rgba(0, 255, 255, 0.2);
}

.video-info.no-video {
  opacity: 0.6;
  flex-direction: column;
}

.video-info.no-video .el-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 10px;
}

.video-info span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

/* 视频加载状态 */
.video-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px;
  background: rgba(0, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px dashed rgba(0, 255, 255, 0.2);
}

.video-loading .el-icon {
  font-size: 32px;
  color: #00ffff;
}

.video-loading span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

/* 置信度样式 */
.confidence-value {
  color: #00ffff;
  font-weight: 600;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

/* 检测框样式 */
.detection-boxes {
  margin-top: 15px;
}

.box-label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  margin-bottom: 8px;
}

.box-data {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 6px;
  padding: 12px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  max-height: 300px;
}

/* 原始数据样式 */
.raw-data-container {
  position: relative;
}

.toggle-btn {
  margin-bottom: 10px;
}

.raw-data {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 6px;
  padding: 12px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  max-height: 400px;
  margin: 0;
}

.raw-data::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.raw-data::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.05);
  border-radius: 3px;
}

.raw-data::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 3px;
}

.raw-data::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}
</style>