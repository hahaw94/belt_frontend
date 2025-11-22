<template>
  <div class="alarm-display tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background"></div>
    
    <h2>告警信息展示</h2>
    
    <!-- 搜索筛选卡片 -->
    <div class="search-filters-card tech-card mb-20">
      <div class="search-filters-header">
        <span class="filter-title">搜索筛选</span>
        <div class="view-toggle-buttons">
          <el-button 
            :type="viewMode === 'list' ? 'primary' : ''"
            :class="['view-toggle-btn', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
            size="small"
          >
            <el-icon><List /></el-icon>
            列表
          </el-button>
          <el-button 
            :type="viewMode === 'thumbnail' ? 'primary' : ''"
            :class="['view-toggle-btn', { active: viewMode === 'thumbnail' }]"
            @click="viewMode = 'thumbnail'"
            size="small"
          >
            <el-icon><Grid /></el-icon>
            缩略图
          </el-button>
        </div>
      </div>
      <div class="search-filters-content">
        <div class="filter-row">
          <div class="filter-item filter-item-wide">
            <label for="timeRange">时间范围</label>
            <el-date-picker
              v-model="searchForm.timeRange"
              id="timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              :shortcuts="dateShortcuts"
              class="tech-input"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </div>
          <div class="filter-item">
            <label for="alarmType">告警类型</label>
            <el-select
              v-model="searchForm.alarmType"
              id="alarmType"
              placeholder="全部"
              class="tech-select"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="人员入侵" value="person_intrusion" />
              <el-option label="异常行为" value="behavior" />
              <el-option label="可疑物品" value="object" />
              <el-option label="区域入侵" value="intrusion" />
              <el-option label="烟雾检测" value="smoke_detection" />
              <el-option label="火灾检测" value="fire_detection" />
            </el-select>
          </div>
          <div class="filter-item">
            <label for="alarmLevel">告警级别</label>
            <el-select
              v-model="searchForm.alarmLevel"
              id="alarmLevel"
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
            <label for="status">状态</label>
            <el-select
              v-model="searchForm.status"
              id="status"
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
            <el-button type="primary" :icon="Search" class="tech-button-sm" @click="handleSearch">搜索</el-button>
            <el-button :icon="Refresh" class="tech-button-sm" @click="handleReset">重置</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格和分页 -->
    <div class="content-area tech-card">
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
      >
        <el-table-column type="index" label="序号" width="80" align="center" header-align="center" />
        <el-table-column prop="time" label="时间" width="180" header-align="center" />
        <el-table-column prop="type" label="告警类型" width="120" header-align="center" />
        <el-table-column prop="level" label="级别" width="80" align="center" header-align="center" />
        <el-table-column prop="location" label="点位" width="150" header-align="center" />
        <el-table-column prop="description" label="描述" min-width="200" header-align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="180" align="center" header-align="center">
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
            @click="handleView(alarm)"
          >
            <div class="thumbnail-image">
              <el-image 
                :src="alarm.images && alarm.images.length > 0 ? alarm.images[0] : getDefaultImage(alarm.type)"
                fit="contain"
                class="alarm-thumbnail"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="thumbnail-badge" :class="getLevelClass(alarm.level)">
                {{ alarm.level }}
              </div>
            </div>
            <div class="thumbnail-info">
              <div class="thumbnail-title">{{ alarm.type }}</div>
              <div class="thumbnail-desc">{{ alarm.location }} - {{ alarm.time }}</div>
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
            <div class="detail-item">
              <span class="label">点位位置：</span>
              <span class="value">{{ selectedAlarm.location }}</span>
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

        <div class="detail-section" v-if="selectedAlarm.images && selectedAlarm.images.length > 0">
          <h4 class="section-title">现场截图</h4>
          <div class="detail-images">
            <el-image
              v-for="(image, index) in selectedAlarm.images"
              :key="index"
              :src="image"
              :preview-src-list="selectedAlarm.images"
              fit="cover"
              class="alarm-image"
            />
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
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, List, Grid, Picture } from '@element-plus/icons-vue'
import { eventApi } from '@/api/event'

export default {
  name: 'AlarmDisplay',
  setup() {
    // 搜索表单
    const searchForm = reactive({
      timeRange: [],
      alarmType: '',
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

    // 假数据用于缩略图展示
    const mockAlarmData = [
      {
        id: 'mock-1',
        time: '2024-11-16 14:30:25',
        type: '人员入侵',
        level: '高',
        location: '东门入口',
        description: '东门入口检测到人员入侵',
        status: '未处理',
        images: ['https://via.placeholder.com/300x200/1a2a4a/00ffff?text=人员入侵']
      },
      {
        id: 'mock-2',
        time: '2024-11-16 14:25:18',
        type: '异常行为',
        level: '中',
        location: '停车场A区',
        description: '停车场A区检测到异常行为',
        status: '未处理',
        images: ['https://via.placeholder.com/300x200/1a2a4a/00ffff?text=异常行为']
      },
      {
        id: 'mock-3',
        time: '2024-11-16 14:20:42',
        type: '可疑物品',
        level: '高',
        location: '大厅中央',
        description: '大厅中央检测到可疑物品',
        status: '已处理',
        images: ['https://via.placeholder.com/300x200/1a2a4a/00ffff?text=可疑物品']
      },
      {
        id: 'mock-4',
        time: '2024-11-16 14:15:33',
        type: '区域入侵',
        level: '中',
        location: '仓库3号',
        description: '仓库3号检测到区域入侵',
        status: '未处理',
        images: ['https://via.placeholder.com/300x200/1a2a4a/00ffff?text=区域入侵']
      },
      {
        id: 'mock-5',
        time: '2024-11-16 14:10:15',
        type: '烟雾检测',
        level: '高',
        location: '办公室201',
        description: '办公室201检测到烟雾检测',
        status: '已确认',
        images: ['https://via.placeholder.com/300x200/1a2a4a/00ffff?text=烟雾检测']
      },
      {
        id: 'mock-6',
        time: '2024-11-16 14:05:08',
        type: '火灾检测',
        level: '高',
        location: '配电房',
        description: '配电房检测到火灾检测',
        status: '已处理',
        images: ['https://via.placeholder.com/300x200/1a2a4a/00ffff?text=火灾检测']
      },
      {
        id: 'mock-7',
        time: '2024-11-16 14:00:52',
        type: '人员入侵',
        level: '低',
        location: '后门通道',
        description: '后门通道检测到人员入侵',
        status: '误报',
        images: ['https://via.placeholder.com/300x200/1a2a4a/00ffff?text=人员入侵']
      },
      {
        id: 'mock-8',
        time: '2024-11-16 13:55:30',
        type: '异常行为',
        level: '中',
        location: '电梯间B',
        description: '电梯间B检测到异常行为',
        status: '未处理',
        images: ['https://via.placeholder.com/300x200/1a2a4a/00ffff?text=异常行为']
      }
    ]

    // 告警类型映射
    const alarmTypeMap = {
      'person_intrusion': '人员入侵',
      'behavior': '异常行为',
      'object': '可疑物品',
      'intrusion': '区域入侵',
      'smoke_detection': '烟雾检测',
      'fire_detection': '火灾检测'
    }

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

    // 计算显示的告警列表（缩略图模式下如果没有真实数据则使用假数据）
    const displayAlarmList = computed(() => {
      if (viewMode.value === 'thumbnail' && alarmList.value.length === 0) {
        return mockAlarmData
      }
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

        // 时间范围（日期选择器已设置value-format，直接使用）
        if (searchForm.timeRange && searchForm.timeRange.length === 2) {
          params.start_time = searchForm.timeRange[0]
          params.end_time = searchForm.timeRange[1]
        }

        // 告警类型（后端使用复数形式 alarm_types）
        if (searchForm.alarmType) {
          params.alarm_types = searchForm.alarmType
        }

        // 告警级别（后端使用复数形式 alarm_levels）
        if (searchForm.alarmLevel) {
          params.alarm_levels = searchForm.alarmLevel
        }

        // 状态
        if (searchForm.status !== '') {
          params.status = searchForm.status
        }

        const response = await eventApi.getAlarmList(params)
        console.log('API响应:', response)
        
        // 后端响应格式: { data: [...], total: 100, page: 1, page_size: 20 }
        if (response) {
          const alarmData = response.data || []
          
          // 确保 alarmData 是数组
          if (Array.isArray(alarmData)) {
            alarmList.value = alarmData.map(alarm => ({
              id: alarm.id,
              time: alarm.alarm_time,
              type: alarmTypeMap[alarm.alarm_type] || alarm.alarm_type,
              typeRaw: alarm.alarm_type,
              level: alarmLevelMap[alarm.alarm_level] || alarm.alarm_level,
              location: alarm.location || alarm.camera_name || '-',
              description: getAlarmDescription(alarm),
              status: getAlarmStatus(alarm),
              statusRaw: alarm.status,
              handleResult: alarm.handle_result,
              isFalsePositive: alarm.is_false_positive,
              snapshotPath: alarm.snapshot_path,
              videoPath: alarm.video_path,
              alarmCode: alarm.alarm_code,
              handleRemark: alarm.handle_remark,
              handleTime: alarm.handle_time,
              images: alarm.snapshot_url ? [alarm.snapshot_url] : 
                       (alarm.snapshot_path ? [getImageUrl(alarm.snapshot_path)] : [])
            }))
          } else {
            console.error('API返回的data不是数组:', alarmData)
            alarmList.value = []
          }
          
          total.value = response.total || 0
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
      searchForm.alarmLevel = ''
      searchForm.status = ''
      searchForm.location = ''
      currentPage.value = 1
      loadAlarmList()
    }

    // 获取告警描述
    const getAlarmDescription = (alarm) => {
      const typeText = alarmTypeMap[alarm.alarm_type] || alarm.alarm_type
      const location = alarm.location || alarm.camera_name || '未知位置'
      return `${location}检测到${typeText}`
    }

    // 获取告警状态
    const getAlarmStatus = (alarm) => {
      if (alarm.status === 0) {
        return '未处理'
      } else if (alarm.status === 1) {
        if (alarm.is_false_positive || alarm.handle_result === 'false_positive') {
          return '误报'
        } else if (alarm.handle_result === 'confirmed') {
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

    // 获取图片URL
    const getImageUrl = (path) => {
      if (!path) return ''
      // 如果是完整URL，直接返回
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path
      }
      // 否则拼接后端地址（与api/index.js保持一致）
      const baseURL = process.env.NODE_ENV === 'development' 
        ? '' // 开发环境使用代理
        : (process.env.VUE_APP_API_BASE_URL || window.location.origin)
      return `${baseURL}${path}`
    }

    // 获取默认图片（根据告警类型）
    const getDefaultImage = (type) => {
      // 这里使用占位图片，实际项目中可以根据类型返回不同的默认图
      const images = {
        '人员入侵': 'https://via.placeholder.com/300x200/1a2a4a/00ffff?text=人员入侵',
        '异常行为': 'https://via.placeholder.com/300x200/1a2a4a/00ffff?text=异常行为',
        '可疑物品': 'https://via.placeholder.com/300x200/1a2a4a/00ffff?text=可疑物品',
        '区域入侵': 'https://via.placeholder.com/300x200/1a2a4a/00ffff?text=区域入侵',
        '烟雾检测': 'https://via.placeholder.com/300x200/1a2a4a/00ffff?text=烟雾检测',
        '火灾检测': 'https://via.placeholder.com/300x200/1a2a4a/00ffff?text=火灾检测'
      }
      return images[type] || 'https://via.placeholder.com/300x200/1a2a4a/00ffff?text=告警图片'
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
            time: alarm.alarm_time,
            type: alarmTypeMap[alarm.alarm_type] || alarm.alarm_type,
            location: alarm.location || alarm.camera_name || '-',
            description: getAlarmDescription(alarm),
            status: getAlarmStatus(alarm),
            alarmCode: alarm.alarm_code,
            level: alarmLevelMap[alarm.alarm_level] || alarm.alarm_level,
            handleRemark: alarm.handle_remark,
            handleTime: alarm.handle_time,
            images: alarm.snapshot_url ? [alarm.snapshot_url] : 
                   (alarm.snapshot_path ? [getImageUrl(alarm.snapshot_path)] : [])
          }
          dialogVisible.value = true
        } else {
          ElMessage.error('获取告警详情失败：数据格式错误')
        }
      } catch (error) {
        console.error('获取告警详情失败：', error)
        ElMessage.error('获取告警详情失败：' + (error.message || '未知错误'))
      }
    }

    // 处理告警
    const handleProcess = async (row) => {
      console.log('处理告警：', row)
      try {
        const { value } = await ElMessageBox.prompt(
          '请选择处理结果并填写备注',
          '处理告警',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPlaceholder: '请输入处理备注（可选）',
            beforeClose: (action, instance, done) => {
              if (action === 'confirm') {
                // 可以在这里添加验证逻辑
                done()
              } else {
                done()
              }
            }
          }
        )

        // 弹出选择处理结果的对话框
        const { value: result } = await ElMessageBox.confirm(
          '请选择处理结果',
          '确认',
          {
            confirmButtonText: '已确认',
            cancelButtonText: '误报',
            distinguishCancelAndClose: true,
            type: 'warning'
          }
        ).then(() => {
          return { value: 'confirmed' }
        }).catch((action) => {
          if (action === 'cancel') {
            return { value: 'false_positive' }
          }
          throw new Error('取消操作')
        })

        // 调用API处理告警
        await eventApi.handleAlarm(row.id, {
          result: result,
          remark: value || ''
        })

        ElMessage({
          type: 'success',
          message: '告警处理成功'
        })

        // 重新加载列表
        loadAlarmList()
      } catch (error) {
        if (error !== 'cancel' && error.message !== '取消操作') {
          console.error('处理告警失败：', error)
          ElMessage.error('处理告警失败：' + (error.message || '未知错误'))
        }
      }
    }

    // 确认处理告警（从详情对话框）
    const handleConfirm = async () => {
      if (!selectedAlarm.value) return

      try {
        const { value: result } = await ElMessageBox.confirm(
          '请选择处理结果',
          '确认',
          {
            confirmButtonText: '已确认',
            cancelButtonText: '误报',
            distinguishCancelAndClose: true,
            type: 'warning'
          }
        ).then(() => {
          return { value: 'confirmed' }
        }).catch((action) => {
          if (action === 'cancel') {
            return { value: 'false_positive' }
          }
          throw new Error('取消操作')
        })

        // 调用API处理告警
        await eventApi.handleAlarm(selectedAlarm.value.id, {
          result: result,
          remark: ''
        })

        dialogVisible.value = false
        ElMessage({
          type: 'success',
          message: '告警处理成功'
        })

        // 重新加载列表
        loadAlarmList()
      } catch (error) {
        if (error !== 'cancel' && error.message !== '取消操作') {
          console.error('处理告警失败：', error)
          ElMessage.error('处理告警失败：' + (error.message || '未知错误'))
        }
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

    // 组件挂载时加载数据
    onMounted(() => {
      loadAlarmList()
    })

    return {
      loading,
      searchForm,
      alarmList,
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
      handleSearch,
      handleReset,
      getStatusType,
      handleView,
      handleProcess,
      handleConfirm,
      handleSizeChange,
      handleCurrentChange,
      handleRowClick,
      goToPage,
      getDefaultImage,
      getLevelClass,
      Search,
      Refresh,
      List,
      Grid,
      Picture
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
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 15px;
  align-items: end;
}

.filter-item-wide {
  grid-column: span 1;
}

@media (max-width: 1600px) {
  .filter-row {
    grid-template-columns: 2fr 1fr 1fr;
  }
  
  .filter-item:nth-child(4) {
    grid-column: 1;
  }
  
  .filter-actions {
    grid-column: 2 / -1;
    justify-content: flex-end;
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

.alarm-image {
  width: 200px;
  height: 150px;
  border-radius: 4px;
  cursor: pointer;
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
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.thumbnail-card:hover {
  transform: translateY(-5px);
  border-color: #00ffff;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.3);
  background: rgba(30, 40, 60, 0.9);
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
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(20, 30, 50, 0.9);
  color: rgba(0, 255, 255, 0.5);
  font-size: 48px;
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
</style>