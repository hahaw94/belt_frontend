·<template>
  <div class="data-collection tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background"></div>
    
    <h2>{{ $t('event.dataCollection.title') }}</h2>

    <!-- 样本统计卡片（包含筛选和统计） -->
    <el-card class="stats-card tech-card mb-20" shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ $t('event.dataCollection.sampleCount') }}</span>
          <el-button 
            type="primary" 
            :icon="Refresh" 
            size="small" 
            class="tech-button-sm" 
            @click="loadStats"
            :loading="statsLoading"
          >
{{ $t('common.refresh') }}
          </el-button>
        </div>
      </template>

      <div class="stats-wrapper">
        <!-- 统计数据区域 -->
        <div v-loading="statsLoading" class="stats-content">
          <div class="stats-grid">
            <!-- 总误报数 -->
            <div class="stat-item stat-yellow">
              <div class="stat-value">{{ stats.total || 0 }}</div>
              <div class="stat-label">{{ $t('event.dataCollection.total') }}</div>
            </div>
            
            <!-- 未导出 -->
            <div class="stat-item stat-blue">
              <div class="stat-value">{{ stats.unexported || 0 }}</div>
              <div class="stat-label">{{ $t('event.dataCollection.unexported') }}</div>
            </div>
            
            <!-- 已导出 -->
            <div class="stat-item stat-green">
              <div class="stat-value">{{ stats.exported || 0 }}</div>
              <div class="stat-label">{{ $t('event.dataCollection.exported') }}</div>
            </div>
            
            <!-- 今日新增 -->
            <div class="stat-item stat-purple">
              <div class="stat-value">{{ stats.today || 0 }}</div>
              <div class="stat-label">{{ $t('common.today') }}</div>
            </div>
          </div>

        </div>

        <!-- 统计筛选区域 -->
        <div class="filter-section">
          <div class="filter-header">
            <span class="filter-title">{{ $t('common.filter') }}</span>
          </div>
          
          <div class="filter-content">
            <div class="filter-row">
              <!-- 时间范围 -->
              <div class="filter-item">
                <label>{{ $t('event.dataCollection.filter.startDate') }}</label>
                <el-date-picker
                  v-model="filterForm.startDate"
                  type="date"
                  :placeholder="$t('event.dataCollection.filter.startPlaceholder')"
                  class="tech-input"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </div>
              
              <div class="filter-item">
                <label>{{ $t('event.dataCollection.filter.endDate') }}</label>
                <el-date-picker
                  v-model="filterForm.endDate"
                  type="date"
                  :placeholder="$t('event.dataCollection.filter.endPlaceholder')"
                  class="tech-input"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </div>

              <!-- 操作按钮 -->
              <div class="filter-actions">
                <el-button 
                  type="primary" 
                  :icon="Search" 
                  class="tech-button-sm" 
                  @click="handleFilter"
                  :loading="statsLoading"
                >
                  {{ $t('common.filter') }}
                </el-button>
                <el-button 
                  :icon="Refresh" 
                  class="tech-button-sm" 
                  @click="handleReset"
                >
                  {{ $t('common.reset') }}
                </el-button>
              </div>
            </div>

            <!-- 告警类型选择 -->
            <div class="alarm-type-section">
              <label>{{ $t('event.dataCollection.filter.alarmTypeLabel') }}</label>
              <div class="alarm-type-list">
                <el-checkbox-group v-model="filterForm.alarmTypes">
                  <el-checkbox 
                    v-for="type in alarmTypeList" 
                    :key="type.id" 
                    :label="type.id"
                    class="alarm-type-checkbox"
                  >
                    {{ type.name }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 数据收集操作卡片 -->
    <el-card class="operation-card tech-card mb-20" shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ $t('event.dataCollection.operation.title') }}</span>
        </div>
      </template>

      <div class="operation-content">
        <!-- 选择数据范围 -->
        <div class="range-selection">
          <label class="section-label">{{ $t('event.dataCollection.operation.selectRange') }}</label>
          <el-radio-group v-model="operationForm.rangeType" @change="handleRangeChange">
            <el-radio label="all">{{ $t('event.dataCollection.operation.rangeAll') }}</el-radio>
            <el-radio label="timeRange">{{ $t('event.dataCollection.operation.rangeTime') }}</el-radio>
            <el-radio label="alarmType">{{ $t('event.dataCollection.operation.rangeType') }}</el-radio>
          </el-radio-group>
        </div>

        <!-- 时间范围选择 -->
        <div v-show="operationForm.rangeType === 'timeRange'" class="time-range-group">
          <div class="time-range-inputs">
            <div class="input-item">
              <label>{{ $t('event.dataCollection.operation.startDate') }}</label>
              <el-date-picker
                v-model="operationForm.startDate"
                type="date"
                :placeholder="$t('event.dataCollection.operation.startPlaceholder')"
                class="tech-input"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </div>
            <div class="input-item">
              <label>{{ $t('event.dataCollection.operation.endDate') }}</label>
              <el-date-picker
                v-model="operationForm.endDate"
                type="date"
                :placeholder="$t('event.dataCollection.operation.endPlaceholder')"
                class="tech-input"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </div>
          </div>
        </div>

        <!-- 告警类型选择 -->
        <div v-show="operationForm.rangeType === 'alarmType'" class="alarm-type-group">
          <label class="section-label">{{ $t('event.dataCollection.operation.selectAlarmType') }}</label>
          <div class="alarm-type-checkboxes">
            <el-checkbox-group v-model="operationForm.selectedTypes">
              <el-checkbox 
                v-for="type in alarmTypeList" 
                :key="type.id" 
                :label="type.id"
              >
                {{ type.name }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>

        <!-- 仅未导出选项 -->
        <div v-show="operationForm.rangeType !== 'all'" class="unexported-option">
          <el-checkbox v-model="operationForm.onlyUnexported">
            📌 {{ $t('event.dataCollection.operation.onlyUnexported') }}
            <span class="hint-text">{{ $t('event.dataCollection.operation.onlyUnexportedHint') }}</span>
          </el-checkbox>
        </div>

        <!-- 数据预览 -->
        <div v-show="previewData.visible" class="data-preview">
          <div class="preview-content">
            <div class="preview-info">
              <span class="preview-label">{{ $t('event.dataCollection.operation.previewLabel') }}</span>
              <span class="preview-count">{{ previewData.count }}</span>
              <span class="preview-unit">{{ $t('event.dataCollection.operation.previewUnit') }}</span>
            </div>
            <el-button 
              text 
              @click="previewData.visible = false"
              class="preview-close"
            >
              ✕
            </el-button>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="operation-buttons">
          <el-button 
            type="info" 
            :icon="View" 
            class="tech-button-sm"
            @click="handlePreview"
            :loading="previewLoading"
          >
            {{ $t('event.dataCollection.operation.previewCount') }}
          </el-button>
          <el-button 
            type="success" 
            :icon="Download" 
            class="tech-button-sm"
            @click="handleExport"
            :loading="exportLoading"
          >
            {{ $t('event.dataCollection.operation.exportPackage') }}
          </el-button>
          <el-button 
            type="primary" 
            :icon="Upload" 
            class="tech-button-sm"
            @click="handlePackageUpload"
            :loading="uploadLoading"
          >
            {{ $t('event.dataCollection.operation.packageUpload') }}
          </el-button>
          <el-button 
            type="warning" 
            :icon="Setting" 
            class="tech-button-sm config-button"
            @click="showConfigDialog"
          >
            {{ $t('event.dataCollection.operation.configManage') }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 训练平台配置对话框 -->
    <el-dialog
      v-model="configDialog.visible"
      :title="$t('event.dataCollection.config.title')"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-loading="configDialog.loading" class="config-form">
        <el-alert
          v-if="configDialog.status"
          :title="configDialog.statusText"
          :type="configDialog.statusType"
          :closable="false"
          style="margin-bottom: 20px"
        />

        <el-form :model="configForm" label-width="120px" label-position="left">
          <el-form-item :label="$t('event.dataCollection.config.platformName')" required>
            <el-input
              v-model="configForm.platform_name"
              :placeholder="$t('event.dataCollection.config.platformNamePlaceholder')"
              class="tech-input"
            />
          </el-form-item>

          <el-form-item :label="$t('event.dataCollection.config.platformUrl')" required>
            <el-input
              v-model="configForm.platform_url"
              :placeholder="$t('event.dataCollection.config.platformUrlPlaceholder')"
              class="tech-input"
            />
          </el-form-item>

          <el-form-item :label="$t('event.dataCollection.config.authType')" required>
            <el-select
              v-model="configForm.auth_type"
              :placeholder="$t('event.dataCollection.config.authTypePlaceholder')"
              class="tech-input"
              style="width: 100%"
            >
              <el-option :label="$t('event.dataCollection.config.authOptions.apiKey')" value="api_key" />
              <el-option :label="$t('event.dataCollection.config.authOptions.bearer')" value="bearer_token" />
              <el-option :label="$t('event.dataCollection.config.authOptions.basic')" value="basic_auth" />
            </el-select>
          </el-form-item>

          <el-form-item :label="authLabel" required>
            <el-input
              v-model="configForm.api_key"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('event.dataCollection.config.authInputPlaceholder')"
              class="tech-input"
            >
              <template #suffix>
                <el-icon @click="showPassword = !showPassword" style="cursor: pointer">
                  <View v-if="showPassword" />
                  <Hide v-else />
                </el-icon>
              </template>
            </el-input>
            <div class="form-hint">{{ authHelp }}</div>
          </el-form-item>

          <el-form-item :label="$t('event.dataCollection.config.timeout')">
            <el-input-number
              v-model="configForm.timeout"
              :min="60"
              :max="36000"
              :step="60"
              class="tech-input"
              style="width: 100%"
            />
          </el-form-item>

        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="configDialog.visible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleSaveConfig" :loading="configDialog.saving">
            {{ $t('event.dataCollection.config.save') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search, Download, Upload, View, Setting, Hide } from '@element-plus/icons-vue'
import { eventApi } from '@/api/event'
import request from '@/api/index'

export default {
  name: 'DataCollection',
  setup() {
    const { t } = useI18n()

    // 数据收集操作表单
    const operationForm = ref({
      rangeType: 'all', // all, timeRange, alarmType
      startDate: '',
      endDate: '',
      selectedTypes: [],
      onlyUnexported: true
    })

    // 预览数据
    const previewData = ref({
      visible: false,
      count: 0
    })

    // 加载状态
    const previewLoading = ref(false)
    const exportLoading = ref(false)
    const uploadLoading = ref(false)

    // 训练平台配置对话框
    const configDialog = ref({
      visible: false,
      loading: false,
      saving: false,
      status: false,
      statusText: '',
      statusType: 'info'
    })

    // 配置表单
    const configForm = ref({
      platform_name: '',
      platform_url: '',
      api_key: '',
      auth_type: 'api_key',
      timeout: 300
    })

    // 密码显示状态
    const showPassword = ref(false)

    // 认证标签和帮助文本
    const authLabel = computed(() => {
      const labels = {
        'api_key': t('event.dataCollection.config.authOptions.apiKey'),
        'bearer_token': t('event.dataCollection.config.authOptions.bearer'),
        'basic_auth': t('event.dataCollection.config.authOptions.basic')
      }
      return labels[configForm.value.auth_type] || t('event.dataCollection.config.authOptions.apiKey')
    })

    const authHelp = computed(() => {
      const helps = {
        'api_key': t('event.dataCollection.config.authHelp.apiKey'),
        'bearer_token': t('event.dataCollection.config.authHelp.bearer'),
        'basic_auth': t('event.dataCollection.config.authHelp.basic')
      }
      return helps[configForm.value.auth_type] || t('event.dataCollection.config.authHelp.default')
    })

    // 筛选表单
    const filterForm = ref({
      startDate: '',
      endDate: '',
      alarmTypes: []
    })

    // 告警类型列表
    const alarmTypeList = ref([])

    // 统计数据
    const stats = ref({
      total: 0,
      unexported: 0,
      exported: 0,
      today: 0
    })
    
    // 加载状态
    const statsLoading = ref(false)

    // 加载告警类型列表
    const loadAlarmTypes = async () => {
      try {
        const response = await eventApi.getAlarmTypes()
        console.log('告警类型响应:', response)
        if (response && response.data) {
          alarmTypeList.value = response.data
        }
      } catch (error) {
        console.error('加载告警类型失败：', error)
      }
    }

    // 构建操作参数
    const buildOperationParams = () => {
      const params = {}
      
      if (operationForm.value.rangeType === 'timeRange') {
        if (!operationForm.value.startDate || !operationForm.value.endDate) {
          throw new Error(t('event.dataCollection.messages.selectDateRange'))
        }
        params.start_date = operationForm.value.startDate
        params.end_date = operationForm.value.endDate
        params.only_unexported = operationForm.value.onlyUnexported
      } else if (operationForm.value.rangeType === 'alarmType') {
        if (operationForm.value.selectedTypes.length === 0) {
          throw new Error(t('event.dataCollection.messages.selectAlarmType'))
        }
        params.alarm_types = operationForm.value.selectedTypes
        params.only_unexported = operationForm.value.onlyUnexported
      } else if (operationForm.value.rangeType === 'all') {
        // 全部模式下，也需要根据复选框决定是否只导出未导出的
        params.only_unexported = operationForm.value.onlyUnexported
      }
      
      return params
    }

    // 范围类型改变
    const handleRangeChange = () => {
      // 清空预览
      previewData.value.visible = false
      previewData.value.count = 0
    }

    // 预览数量
    const handlePreview = async () => {
      previewLoading.value = true
      try {
        const params = buildOperationParams()
        console.log('预览参数:', params)
        
        const response = await eventApi.countFalsePositives(params)
        console.log('预览响应:', response)
        
        if (response && response.data) {
          // 响应格式: {data: {data: {count: xxx}}}
          const count = response.data.data?.count || response.data.count || 0
          previewData.value.count = count
          previewData.value.visible = true
          ElMessage.success(t('event.dataCollection.messages.previewSuccess', { count }))
        }
      } catch (error) {
        console.error('预览失败：', error)
        ElMessage.error(error.message || t('event.dataCollection.messages.previewFailed'))
      } finally {
        previewLoading.value = false
      }
    }

    // 导出样本包
    const handleExport = async () => {
      try {
        const params = buildOperationParams()
        
        await ElMessageBox.confirm(
          t('event.dataCollection.messages.exportConfirm'),
          t('common.tip'),
          {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'info'
          }
        )

        exportLoading.value = true
        console.log('导出参数:', params)
        
        // 立即清空预览数据（在请求之前）
        previewData.value.visible = false
        previewData.value.count = 0
        
        const response = await eventApi.exportFalsePositives(params)
        console.log('导出响应完整数据:', response)
        console.log('导出响应data字段:', response.data)
        
        if (response && response.data) {
          const data = response.data.data || response.data
          console.log('解析后的data:', data)
          console.log('download_url:', data.download_url)
          console.log('file_name:', data.file_name)
          console.log('alarm_count:', data.alarm_count)
          
          // 自动下载
          if (data.download_url) {
            try {
              // 使用项目的axios实例下载文件，这样可以带上token和代理配置
              const fileResponse = await request({
                url: data.download_url,
                method: 'GET',
                responseType: 'blob',
                timeout: 60000 // 60秒超时
              })
              
              console.log('文件下载响应:', fileResponse)
              
              // 创建blob URL并下载
              const blob = new Blob([fileResponse.data])
              const url = window.URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.style.display = 'none'
              link.href = url
              link.download = data.file_name || 'false_positives.zip'
              document.body.appendChild(link)
              link.click()
              
              // 清理
              setTimeout(() => {
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
              }, 100)
              
              ElMessage.success(t('event.dataCollection.messages.exportSuccess', { count: data.alarm_count || 0 }))
              
              // 刷新统计
              await loadStats()
            } catch (downloadError) {
              console.error('下载文件失败:', downloadError)
              console.error('错误详情:', downloadError.response)
              ElMessage.error(t('event.dataCollection.messages.downloadFailed', { error: downloadError.message }))
            }
          } else {
            console.error('未找到download_url字段')
            ElMessage.error(t('event.dataCollection.messages.exportNoLink'))
          }
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('导出失败：', error)
          ElMessage.error(error.message || t('event.dataCollection.messages.exportFailed'))
        }
      } finally {
        exportLoading.value = false
      }
    }

    // 打包并上传
    const handlePackageUpload = async () => {
      try {
        // 先检查是否已配置训练平台
        console.log('检查训练平台配置是否存在...')
        const configExists = await eventApi.checkTrainingPlatformConfigExists()
        console.log('配置存在检查响应:', configExists)
        
        const exists = configExists.data?.exists || configExists.data?.data?.exists || false
        console.log('配置是否存在:', exists)
        
        if (!exists) {
          ElMessage.warning(t('event.dataCollection.messages.needConfig'))
          showConfigDialog()
          return
        }

        const params = buildOperationParams()
        
        await ElMessageBox.confirm(
          t('event.dataCollection.messages.packageConfirm'),
          t('common.tip'),
          {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'warning'
          }
        )

        uploadLoading.value = true
        console.log('打包上传参数:', params)
        
        // 立即清空预览数据（在请求之前）
        previewData.value.visible = false
        previewData.value.count = 0
        
        const response = await eventApi.packageFalsePositives(params)
        console.log('打包上传响应完整数据:', response)
        console.log('打包上传响应data字段:', response.data)
        
        if (response && response.data) {
          const data = response.data.data || response.data
          console.log('解析后的data:', data)
          console.log('alarm_count:', data.alarm_count)
          
          ElMessage.success(t('event.dataCollection.messages.packageSuccess', { count: data.alarm_count || 0 }))
          
          // 刷新统计
          await loadStats()
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('打包上传失败：', error)
          ElMessage.error(error.message || t('event.dataCollection.messages.packageFailed'))
        }
      } finally {
        uploadLoading.value = false
      }
    }

    // 显示配置对话框
    const showConfigDialog = async () => {
      configDialog.value.visible = true
      configDialog.value.status = false
      await loadTrainingPlatformConfig()
    }

    // 加载训练平台配置
    const loadTrainingPlatformConfig = async () => {
      configDialog.value.loading = true
      try {
        console.log('正在加载训练平台配置...')
        const response = await eventApi.getTrainingPlatformConfig()
        console.log('训练平台配置响应:', response)
        
        if (response && response.data) {
          const config = response.data
          console.log('解析配置数据:', config)
          configForm.value = {
            platform_name: config.platform_name || '',
            platform_url: config.platform_url || '',
            api_key: config.api_key || '',
            auth_type: config.auth_type || 'api_key',
            timeout: config.timeout || 300
          }
          
          configDialog.value.status = true
          configDialog.value.statusText = t('event.dataCollection.messages.configLoaded')
          configDialog.value.statusType = 'success'
        }
      } catch (error) {
        console.error('加载配置失败 - 完整错误:', error)
        console.error('错误响应:', error.response)
        console.error('错误状态码:', error.response?.status)
        console.error('错误数据:', error.response?.data)
        
        if (error.response && error.response.status === 404) {
          console.log('配置不存在（404），显示未配置提示')
          configDialog.value.status = true
          configDialog.value.statusText = t('event.dataCollection.messages.configNotSet')
          configDialog.value.statusType = 'info'
        } else {
          const errorMsg = error.response?.data?.error || error.message || t('common.unknown')
          console.error('其他错误:', errorMsg)
          configDialog.value.status = true
          configDialog.value.statusText = t('event.dataCollection.messages.configLoadFailed', { error: errorMsg })
          configDialog.value.statusType = 'error'
        }
      } finally {
        configDialog.value.loading = false
      }
    }

    // 保存训练平台配置
    const handleSaveConfig = async () => {
      // 验证必填字段
      if (!configForm.value.platform_name) {
        ElMessage.warning(t('event.dataCollection.messages.platformNameRequired'))
        return
      }
      if (!configForm.value.platform_url) {
        ElMessage.warning(t('event.dataCollection.messages.platformUrlRequired'))
        return
      }
      if (!configForm.value.api_key) {
        ElMessage.warning(t('event.dataCollection.messages.authInfoRequired'))
        return
      }

      // 验证额外参数是否为有效JSON
      if (configForm.value.additional_params) {
        try {
          JSON.parse(configForm.value.additional_params)
        } catch (e) {
          ElMessage.warning(t('event.dataCollection.messages.extraParamsInvalid'))
          return
        }
      }

      configDialog.value.saving = true
      try {
        const data = {
          platform_name: configForm.value.platform_name,
          platform_url: configForm.value.platform_url,
          api_key: configForm.value.api_key,
          auth_type: configForm.value.auth_type,
          timeout: configForm.value.timeout
        }

        console.log('保存配置数据:', data)
        const response = await eventApi.saveTrainingPlatformConfig(data)
        console.log('保存配置响应:', response)
        
        ElMessage.success(t('event.dataCollection.messages.configSaveSuccess'))
        configDialog.value.status = true
        configDialog.value.statusText = t('event.dataCollection.messages.configSaveSuccess')
        configDialog.value.statusType = 'success'
        
        // 延迟关闭对话框
        setTimeout(() => {
          configDialog.value.visible = false
        }, 1500)
      } catch (error) {
        console.error('保存配置失败：', error)
        ElMessage.error(t('event.dataCollection.messages.configSaveFailed', { error: error.message || t('common.unknown') }))
        configDialog.value.status = true
        configDialog.value.statusText = t('event.dataCollection.messages.configSaveFailed', { error: error.message || t('common.unknown') })
        configDialog.value.statusType = 'error'
      } finally {
        configDialog.value.saving = false
      }
    }

    // 加载统计数据（支持筛选参数）
    const loadStats = async (params = {}) => {
      statsLoading.value = true
      try {
        // 构建查询参数
        const queryParams = {}
        if (params.start_date) {
          queryParams.start_date = params.start_date
        }
        if (params.end_date) {
          queryParams.end_date = params.end_date
        }
        if (params.alarm_types && params.alarm_types.length > 0) {
          // 后端接收逗号分隔的字符串
          queryParams.alarm_types = params.alarm_types.join(',')
        }

        console.log('查询参数:', queryParams)
        const response = await eventApi.getFalsePositiveStats(queryParams)
        console.log('API响应数据:', response)
        
        // 后端返回 {"data": stats}，响应拦截器包装后变成 {code: 200, data: {data: stats}}
        // 所以需要访问 response.data.data
        if (response && response.data && response.data.data) {
          stats.value = response.data.data
          console.log('统计数据已更新:', stats.value)
        } else if (response && response.data) {
          // 兼容处理：如果只有一层data
          stats.value = response.data
          console.log('统计数据已更新(兼容模式):', stats.value)
        } else {
          console.warn('响应数据格式异常:', response)
          ElMessage.warning(t('event.dataCollection.messages.statsFormatError'))
        }
      } catch (error) {
        console.error('加载统计信息失败：', error)
        ElMessage.error(t('event.dataCollection.messages.statsLoadFailed', { error: error.message || t('common.unknown') }))
      } finally {
        statsLoading.value = false
      }
    }

    // 筛选统计
    const handleFilter = () => {
      const params = {
        start_date: filterForm.value.startDate,
        end_date: filterForm.value.endDate,
        alarm_types: filterForm.value.alarmTypes
      }
      loadStats(params)
    }

    // 重置筛选
    const handleReset = () => {
      filterForm.value = {
        startDate: '',
        endDate: '',
        alarmTypes: []
      }
      loadStats()
    }

    // 组件挂载时加载数据
    onMounted(() => {
      loadAlarmTypes()
      loadStats()
    })

    return {
      operationForm,
      previewData,
      previewLoading,
      exportLoading,
      uploadLoading,
      handleRangeChange,
      handlePreview,
      handleExport,
      handlePackageUpload,
      configDialog,
      configForm,
      showPassword,
      authLabel,
      authHelp,
      showConfigDialog,
      handleSaveConfig,
      filterForm,
      alarmTypeList,
      stats,
      statsLoading,
      loadStats,
      handleFilter,
      handleReset,
      Refresh,
      Search,
      Download,
      Upload,
      View,
      Setting,
      Hide
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
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* 标题样式 */
.data-collection h2 {
  margin: 24px 0 20px 0;
  color: #00ffff;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  position: relative;
  z-index: 10;
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header > span {
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  font-size: 16px;
}

.mb-20 {
  margin-bottom: 20px;
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

.data-collection {
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 科技感卡片样式 - 恢复边框和背景 */
.tech-card {
  position: relative;
  z-index: 10;
  background: rgba(15, 25, 45, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
  margin-bottom: 20px;
  backdrop-filter: blur(10px) !important;
}

.tech-card :deep(.el-card__body) {
  padding: 20px !important;
  background: transparent !important;
  border: none !important;
}

.tech-card :deep(.el-card__header) {
  background: rgba(20, 30, 50, 0.8) !important;
  border: none !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  padding: 16px 20px !important;
  border-radius: 8px 8px 0 0 !important;
}

/* 数据收集操作卡片样式 - 修复高度问题 */
.operation-card {
  min-height: auto !important;
  height: auto !important;
  max-height: none !important;
}

.operation-card :deep(.el-card) {
  min-height: auto !important;
  height: auto !important;
  max-height: none !important;
}

.operation-card :deep(.el-card__body) {
  min-height: auto !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  padding: 20px !important;
}

.operation-content {
  min-height: auto !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.range-selection {
  margin-bottom: 0;
}

.section-label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

:deep(.el-radio) {
  color: rgba(255, 255, 255, 0.85) !important;
  margin-right: 0 !important;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  background: rgba(0, 255, 255, 0.8) !important;
  border-color: #00ffff !important;
}

:deep(.el-radio__inner) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-radio__label) {
  color: rgba(255, 255, 255, 0.85) !important;
}

.time-range-group,
.alarm-type-group {
  margin-bottom: 0;
  padding: 15px;
  background: rgba(0, 255, 255, 0.03);
  border: 1px solid rgba(0, 255, 255, 0.15);
  border-radius: 6px;
  min-height: auto;
  height: auto;
}

.time-range-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.input-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-item label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
}

.alarm-type-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.unexported-option {
  margin-bottom: 0;
  padding: 10px;
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.3);
  border-radius: 6px;
}

.unexported-option :deep(.el-checkbox__label) {
  color: rgba(96, 165, 250, 1) !important;
  font-weight: 500;
}

.hint-text {
  margin-left: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: normal;
}

.data-preview {
  margin-bottom: 0;
  padding: 12px;
  background: rgba(2, 132, 199, 0.15);
  border: 1px solid rgba(2, 132, 199, 0.4);
  border-radius: 6px;
  border-left: 4px solid rgba(2, 132, 199, 0.8);
}

.preview-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-label {
  color: rgba(7, 89, 133, 1);
  font-weight: 600;
}

.preview-count {
  font-size: 20px;
  font-weight: bold;
  color: #0284c7;
}

.preview-unit {
  color: rgba(7, 89, 133, 1);
}

.preview-close {
  color: rgba(7, 89, 133, 0.7) !important;
  padding: 4px 8px !important;
}

.operation-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.config-button {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%) !important;
  border-color: rgba(245, 158, 11, 0.5) !important;
  color: #f59e0b !important;
}

.config-button:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(251, 191, 36, 0.2) 100%) !important;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.4) !important;
}

/* 科技感对话框样式 - 与告警展示保持一致 */
/* 遮罩层样式 */
.tech-dialog :deep(.el-overlay) {
  background-color: rgba(0, 0, 0, 0.7) !important;
}

/* 弹窗主体 */
.tech-dialog :deep(.el-dialog) {
  background: rgba(45, 55, 75, 0.92) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 15px !important;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(0, 255, 255, 0.15),
    inset 0 0 50px rgba(0, 255, 255, 0.08) !important;
}

.tech-dialog :deep(.el-dialog__header) {
  background: rgba(45, 55, 75, 0.92) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 15px 15px 0 0 !important;
  padding: 20px 24px !important;
}

.tech-dialog :deep(.el-dialog__title) {
  color: #00ffff !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
  font-weight: bold !important;
  font-size: 18px !important;
}

.tech-dialog :deep(.el-dialog__headerbtn) {
  top: 20px !important;
  right: 20px !important;
}

.tech-dialog :deep(.el-dialog__close) {
  color: rgba(255, 255, 255, 0.6) !important;
  font-size: 20px !important;
}

.tech-dialog :deep(.el-dialog__close):hover {
  color: #00ffff !important;
}

.tech-dialog :deep(.el-dialog__body) {
  background: rgba(45, 55, 75, 0.92) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  padding: 24px !important;
  max-height: 70vh !important;
  overflow-y: auto !important;
}

.tech-dialog :deep(.el-dialog__footer) {
  background: rgba(45, 55, 75, 0.92) !important;
  border-top: 1px solid rgba(0, 255, 255, 0.3) !important;
  padding: 16px 24px !important;
  border-radius: 0 0 15px 15px !important;
}

/* 对话框按钮样式 */
.tech-dialog :deep(.el-button) {
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2) !important;
}

.tech-dialog :deep(.el-button:hover) {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-1px) !important;
}

.tech-dialog :deep(.el-button--primary) {
  background: rgba(0, 255, 255, 0.3) !important;
  border-color: #00ffff !important;
  color: #ffffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

.tech-dialog :deep(.el-button--primary:hover) {
  background: rgba(0, 255, 255, 0.4) !important;
  box-shadow: 0 0 25px rgba(0, 255, 255, 0.5) !important;
}

.config-form {
  min-height: 200px;
  background: transparent !important;
}

.config-form :deep(.el-form) {
  background: transparent !important;
}

.config-form :deep(.el-form-item) {
  background: transparent !important;
}

.config-form :deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.85) !important;
  font-weight: 500 !important;
  background: transparent !important;
}

.config-form :deep(.el-form-item__content) {
  background: transparent !important;
}

.config-form :deep(.el-input__wrapper) {
  background: rgba(35, 45, 65, 0.9) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
  transition: all 0.3s ease !important;
}

.config-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.2) !important;
}

.config-form :deep(.el-input__wrapper.is-focus) {
  border-color: rgba(0, 255, 255, 0.6) !important;
  box-shadow: 0 0 16px rgba(0, 255, 255, 0.3) !important;
}

.config-form :deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.95) !important;
}

.config-form :deep(.el-textarea__inner) {
  background: rgba(35, 45, 65, 0.9) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
  transition: all 0.3s ease !important;
}

.config-form :deep(.el-textarea__inner:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.2) !important;
}

.config-form :deep(.el-textarea__inner:focus) {
  border-color: rgba(0, 255, 255, 0.6) !important;
  box-shadow: 0 0 16px rgba(0, 255, 255, 0.3) !important;
}

.config-form :deep(.el-select) {
  width: 100%;
}

.config-form :deep(.el-select .el-input__wrapper) {
  background: rgba(35, 45, 65, 0.9) !important;
}

.config-form :deep(.el-input-number) {
  width: 100%;
}

.config-form :deep(.el-input-number .el-input__wrapper) {
  background: rgba(35, 45, 65, 0.9) !important;
}

/* 下拉选择框弹出层样式 */
:deep(.el-select-dropdown) {
  background: rgba(45, 55, 75, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
}

:deep(.el-select-dropdown__item) {
  color: rgba(255, 255, 255, 0.9) !important;
  background: transparent !important;
}

:deep(.el-select-dropdown__item:hover) {
  background: rgba(0, 255, 255, 0.15) !important;
}

:deep(.el-select-dropdown__item.selected) {
  color: #00ffff !important;
  background: rgba(0, 255, 255, 0.2) !important;
}

/* Alert组件样式 */
.config-form :deep(.el-alert) {
  background: rgba(35, 45, 65, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

.config-form :deep(.el-alert--success) {
  background: rgba(16, 185, 129, 0.15) !important;
  border-color: rgba(16, 185, 129, 0.4) !important;
}

.config-form :deep(.el-alert--info) {
  background: rgba(59, 130, 246, 0.15) !important;
  border-color: rgba(59, 130, 246, 0.4) !important;
}

.config-form :deep(.el-alert--error) {
  background: rgba(239, 68, 68, 0.15) !important;
  border-color: rgba(239, 68, 68, 0.4) !important;
}

.config-form :deep(.el-alert__title) {
  color: rgba(255, 255, 255, 0.9) !important;
}

.form-hint {
  margin-top: 5px;
  font-size: 12px;
  color: rgba(0, 255, 255, 0.6);
  font-style: italic;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 统计卡片包装器 */
.stats-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 筛选区域样式 */
.filter-section {
  background: rgba(0, 255, 255, 0.03);
  border: 1px solid rgba(0, 255, 255, 0.15);
  border-radius: 8px;
  padding: 15px;
}

.filter-header {
  margin-bottom: 15px;
}

.filter-title {
  color: rgba(0, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
}

.filter-content {
  padding: 0;
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 15px;
  align-items: end;
  margin-bottom: 15px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-item label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.alarm-type-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 255, 255, 0.15);
}

.alarm-type-section > label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 10px;
}

.alarm-type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.alarm-type-checkbox {
  color: rgba(255, 255, 255, 0.85) !important;
}

/* 分隔线样式 */
.stats-divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 255, 255, 0.3) 20%,
    rgba(0, 255, 255, 0.5) 50%,
    rgba(0, 255, 255, 0.3) 80%,
    transparent 100%
  );
  margin: 20px 0;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

/* 日期选择器样式 */
.tech-input :deep(.el-input__wrapper) {
  background-color: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
}

.tech-input :deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.95) !important;
  background: transparent !important;
}

/* Checkbox样式 */
:deep(.el-checkbox) {
  color: rgba(255, 255, 255, 0.85) !important;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: rgba(0, 255, 255, 0.8) !important;
  border-color: #00ffff !important;
}

:deep(.el-checkbox__inner) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-checkbox__inner:hover) {
  border-color: rgba(0, 255, 255, 0.6) !important;
}

:deep(.el-checkbox__label) {
  color: rgba(255, 255, 255, 0.85) !important;
}

/* 样本统计卡片样式 */
.stats-content {
  padding: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 255, 255, 0.2);
  backdrop-filter: blur(5px);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.2);
}

.stat-yellow {
  background: linear-gradient(135deg, rgba(254, 243, 199, 0.15) 0%, rgba(252, 211, 77, 0.1) 100%);
  border-color: rgba(252, 211, 77, 0.3);
}

.stat-blue {
  background: linear-gradient(135deg, rgba(219, 234, 254, 0.15) 0%, rgba(96, 165, 250, 0.1) 100%);
  border-color: rgba(96, 165, 250, 0.3);
}

.stat-green {
  background: linear-gradient(135deg, rgba(220, 252, 231, 0.15) 0%, rgba(74, 222, 128, 0.1) 100%);
  border-color: rgba(74, 222, 128, 0.3);
}

.stat-purple {
  background: linear-gradient(135deg, rgba(224, 231, 255, 0.15) 0%, rgba(129, 140, 248, 0.1) 100%);
  border-color: rgba(129, 140, 248, 0.3);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.stat-yellow .stat-value {
  color: #fbbf24;
}

.stat-blue .stat-value {
  color: #60a5fa;
}

.stat-green .stat-value {
  color: #4ade80;
}

.stat-purple .stat-value {
  color: #818cf8;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
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

/* 科技感对话框 - 完整样式 */
:deep(.el-dialog) {
  background: rgba(45, 55, 75, 0.92) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 15px !important;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(0, 255, 255, 0.15),
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

:deep(.el-dialog__close) {
  color: rgba(255, 255, 255, 0.6) !important;
}

:deep(.el-dialog__close:hover) {
  color: #00ffff !important;
}

/* 对话框按钮 */
:deep(.el-dialog .el-button) {
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
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

/* 表单输入框样式 */
:deep(.el-dialog .el-input__wrapper) {
  background: rgba(35, 45, 65, 0.9) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-dialog .el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-dialog .el-input__wrapper.is-focus) {
  border-color: rgba(0, 255, 255, 0.6) !important;
  box-shadow: 0 0 16px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-dialog .el-input__inner) {
  color: rgba(255, 255, 255, 0.95) !important;
}

:deep(.el-dialog .el-textarea__inner) {
  background: rgba(35, 45, 65, 0.9) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: rgba(255, 255, 255, 0.95) !important;
}

:deep(.el-dialog .el-textarea__inner:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-dialog .el-textarea__inner:focus) {
  border-color: rgba(0, 255, 255, 0.6) !important;
  box-shadow: 0 0 16px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-dialog .el-form-item__label) {
  color: rgba(255, 255, 255, 0.85) !important;
}

:deep(.el-dialog .el-select) {
  width: 100%;
}

:deep(.el-dialog .el-input-number) {
  width: 100%;
}

/* Alert样式 */
:deep(.el-dialog .el-alert) {
  background: rgba(35, 45, 65, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-dialog .el-alert--success) {
  background: rgba(16, 185, 129, 0.15) !important;
  border-color: rgba(16, 185, 129, 0.4) !important;
}

:deep(.el-dialog .el-alert--info) {
  background: rgba(59, 130, 246, 0.15) !important;
  border-color: rgba(59, 130, 246, 0.4) !important;
}

:deep(.el-dialog .el-alert__title) {
  color: rgba(255, 255, 255, 0.9) !important;
}
</style>
