<template>
  <div class="platform-management">
    <!-- 国标接入信息（SIP）和系统配额统计 - 左右布局 -->
    <el-row :gutter="20" class="equal-height-row">
      <el-col :span="12" class="equal-height-col">
        <!-- 国标接入信息（SIP） -->
        <el-card class="management-section tech-card" shadow="hover">
          <template #header>
            <div class="section-header">
              <span>国标接入信息（SIP）</span>
              <el-button type="primary" size="small" :icon="Refresh" @click="loadSIPInfo" :loading="sipLoading">获取接入信息</el-button>
            </div>
          </template>
          <div class="section-content">
            <el-row :gutter="15">
              <el-col :span="12">
                <div class="info-item">
                  <label>编号</label>
                  <div class="info-value">
                    <span class="pill">{{ sipInfo.id || '-' }}</span>
                    <el-button size="small" :icon="CopyDocument" @click="copyToClipboard(sipInfo.id)">复制</el-button>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <label>域</label>
                  <div class="info-value">
                    <span class="pill">{{ sipInfo.domain || '-' }}</span>
                    <el-button size="small" :icon="CopyDocument" @click="copyToClipboard(sipInfo.domain)">复制</el-button>
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="15" style="margin-top: 10px;">
              <el-col :span="12">
                <div class="info-item">
                  <label>端口</label>
                  <div class="info-value">
                    <span class="pill">{{ sipInfo.port || '-' }}</span>
                    <el-button size="small" :icon="CopyDocument" @click="copyToClipboard(sipInfo.port)">复制</el-button>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="info-item">
                  <label>IP 列表</label>
                  <div class="info-value">
                    <span class="pill">{{ sipInfo.ips || '-' }}</span>
                    <el-button size="small" :icon="CopyDocument" @click="copyToClipboard(sipInfo.ips)">复制</el-button>
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="15" style="margin-top: 10px;">
              <el-col :span="24">
                <div class="info-item">
                  <label>设备注册密码</label>
                  <div class="info-value">
                    <span class="pill">{{ sipInfo.password || '-' }}</span>
                    <el-button size="small" :icon="CopyDocument" @click="copyToClipboard(sipInfo.password)">复制</el-button>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="equal-height-col">
        <!-- 系统配额统计 -->
        <el-card class="management-section tech-card" shadow="hover">
          <template #header>
            <div class="section-header">
              <span>系统配额统计</span>
              <el-button type="primary" size="small" :icon="Refresh" @click="loadChannelStats" :loading="statsLoading">刷新</el-button>
            </div>
          </template>
          <div class="section-content">
            <el-row :gutter="15">
              <el-col :span="12">
                <div class="stat-box" style="border-left: 4px solid #3b82f6;">
                  <div class="stat-label">当前通道总数</div>
                  <div class="stat-value">{{ channelStats.total_channels || 0 }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="stat-box" style="border-left: 4px solid #10b981;">
                  <div class="stat-label">全局上限</div>
                  <div class="stat-value">{{ channelStats.global_limit || 0 }}</div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="15" style="margin-top: 10px;">
              <el-col :span="12">
                <div class="stat-box" style="border-left: 4px solid #f59e0b;">
                  <div class="stat-label">剩余配额</div>
                  <div class="stat-value">{{ channelStats.remaining_quota || 0 }}</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="stat-box" style="border-left: 4px solid #8b5cf6;">
                  <div class="stat-label">使用率</div>
                  <div class="stat-value">{{ channelStats.usage_rate || '0.00%' }}</div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="15" style="margin-top: 10px;">
              <el-col :span="24">
                <div class="stat-box">
                  <div class="stat-label">当前播放流</div>
                  <div class="stat-value" style="font-size: 18px;">
                    {{ channelStats.current_active_plays || 0 }} / {{ channelStats.max_concurrent_plays || 0 }}
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="15" style="margin-top: 10px;" v-if="channelStats.warning">
              <el-col :span="24">
                <div class="stat-box warning-box">
                  <div class="stat-label" style="color: #d97706; font-weight: bold;">⚠️ 配额告警</div>
                  <div style="font-size: 12px; color: #92400e; margin-top: 5px;">通道数已超过90%，请注意管理</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 直连设备与通道 -->
    <el-card class="management-section tech-card" shadow="hover">
      <template #header>
        <div class="section-header">
          <span>直连设备与通道</span>
        </div>
      </template>
      <div class="section-content">
        <!-- 设备查询区 -->
        <div class="wvp-query-section">
          <el-form inline class="wvp-form">
            <el-form-item label="设备在线">
              <el-select v-model="wvpDeviceQuery.status" style="width: 120px;">
                <el-option label="全部" value=""></el-option>
                <el-option label="在线" value="true"></el-option>
                <el-option label="离线" value="false"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="关键字">
              <el-input v-model="wvpDeviceQuery.query" placeholder="设备名/编号" style="width: 200px;" />
            </el-form-item>
            <el-form-item label="页码">
              <el-input-number v-model="wvpDeviceQuery.page" :min="1" style="width: 120px;" />
            </el-form-item>
            <el-form-item label="每页">
              <el-input-number v-model="wvpDeviceQuery.count" :min="1" :max="100" style="width: 120px;" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="loadWVPDevices" :loading="wvpDeviceLoading">刷新设备</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 设备列表 -->
        <el-table
          v-if="wvpDevicesLoaded"
          :data="wvpDevices"
          v-loading="wvpDeviceLoading"
          class="tech-table"
          stripe
          style="width: 100%; margin-top: 15px;"
          @current-change="handleWVPDeviceSelect"
          highlight-current-row
          :empty-text="wvpDevices.length === 0 && !wvpDeviceLoading ? '暂无数据，请点击【刷新设备】按钮加载数据' : '暂无数据'"
        >
          <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
          <el-table-column prop="deviceId" label="设备ID" min-width="180">
            <template #default="{ row }">
              <code class="device-id">{{ row.deviceId || row.device_id }}</code>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="名称" min-width="150"></el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status?.toUpperCase() === 'ON' ? 'success' : 'danger'" size="small">
                {{ row.status?.toUpperCase() || '未知' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 通道查询区 -->
        <div class="wvp-query-section" style="margin-top: 20px;">
          <el-form inline class="wvp-form">
            <el-form-item label="通道在线">
              <el-select v-model="wvpChannelQuery.online" style="width: 120px;">
                <el-option label="全部" value=""></el-option>
                <el-option label="在线" value="true"></el-option>
                <el-option label="离线" value="false"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="关键字">
              <el-input v-model="wvpChannelQuery.query" placeholder="通道名/编号" style="width: 200px;" />
            </el-form-item>
            <el-form-item label="页码">
              <el-input-number v-model="wvpChannelQuery.page" :min="1" style="width: 120px;" />
            </el-form-item>
            <el-form-item label="每页">
              <el-input-number v-model="wvpChannelQuery.count" :min="1" :max="100" style="width: 120px;" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="loadWVPDeviceChannels" :loading="wvpChannelLoading" :disabled="!selectedWVPDevice">刷新通道</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 通道列表 -->
        <el-table
          v-if="wvpChannelsLoaded"
          :data="wvpChannels"
          v-loading="wvpChannelLoading"
          class="tech-table"
          stripe
          style="width: 100%; margin-top: 15px;"
          :empty-text="wvpChannels.length === 0 && !wvpChannelLoading ? (selectedWVPDevice ? '暂无数据，请点击【刷新通道】按钮加载数据' : '请先选择设备') : '暂无数据'"
        >
          <el-table-column type="index" label="序号" width="70" align="center"></el-table-column>
          <el-table-column prop="channel_name" label="名称" min-width="120">
            <template #default="{ row }">
              {{ row.name || row.channel_name || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="channel_id" label="编号" min-width="180">
            <template #default="{ row }">
              <code class="channel-id">{{ row.channelId || row.channel_id || row.deviceId || row.device_id || '-' }}</code>
            </template>
          </el-table-column>
          <el-table-column prop="manufacturer" label="厂家" min-width="100">
            <template #default="{ row }">
              {{ row.manufacturer || row.gbManufacturer || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="model" label="型号" min-width="120">
            <template #default="{ row }">
              {{ row.model || row.gbModel || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="在线" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="(row.status || '').toUpperCase() === 'ON' ? 'success' : 'danger'" size="small">
                {{ (row.status || '').toUpperCase() || '未知' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="viewChannelControl(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 摄像机控制弹窗 -->
    <el-dialog
      v-model="showControlDialog"
      :title="`摄像机控制 - ${currentChannel.name || '未命名'}`"
      width="800px"
      :close-on-click-modal="false"
      class="control-dialog"
    >
      <div v-loading="loadingStreamInfo" class="control-content">
        <!-- 播放地址列表 -->
        <div class="stream-section">
          <h4 class="section-title">播放地址列表</h4>
          <div v-if="streamUrls && Object.keys(streamUrls).length > 0" class="stream-urls">
            <div v-for="(url, protocol) in streamUrls" :key="protocol" class="url-item">
              <span class="protocol-label">{{ protocol }}:</span>
              <code class="url-value">{{ url }}</code>
              <el-button size="small" :icon="CopyDocument" @click="copyToClipboard(url)">复制</el-button>
            </div>
          </div>
          <div v-else class="empty-state">
            {{ loadingStreamInfo ? '正在获取播放地址...' : '未获取到播放地址' }}
          </div>
        </div>

        <!-- 云台控制 -->
        <div class="ptz-section">
          <h4 class="section-title">云台控制</h4>
          <div class="ptz-controls">
            <!-- 方向控制 -->
            <div class="direction-controls">
              <div class="direction-grid">
                <div></div>
                <el-button class="ptz-btn" @click="handlePTZControl('up')">↑</el-button>
                <div></div>
                <el-button class="ptz-btn" @click="handlePTZControl('left')">←</el-button>
                <el-button class="ptz-btn ptz-stop" @click="handlePTZControl('stop')">■</el-button>
                <el-button class="ptz-btn" @click="handlePTZControl('right')">→</el-button>
                <div></div>
                <el-button class="ptz-btn" @click="handlePTZControl('down')">↓</el-button>
                <div></div>
              </div>
              <!-- 变焦控制 -->
              <div class="zoom-controls">
                <el-button class="ptz-btn zoom-btn" @click="handlePTZControl('zoom_in')">放大 +</el-button>
                <el-button class="ptz-btn zoom-btn" @click="handlePTZControl('zoom_out')">缩小 -</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作日志 -->
        <div class="log-section">
          <h4 class="section-title">操作日志</h4>
          <div class="log-content" ref="logContent">
            <div v-for="(log, index) in controlLogs" :key="index" :class="['log-item', `log-${log.type}`]">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { gb28181API } from '@/api/system'
import { ElMessage } from 'element-plus'

export default {
  name: 'PlatformManagement',
  components: ElementPlusIconsVue,
  data() {
    return {
      // SIP接入信息
      sipInfo: {
        id: '',
        domain: '',
        port: '',
        ips: '',
        password: ''
      },
      sipLoading: false,

      // 系统配额统计
      channelStats: {
        total_channels: 0,
        global_limit: 0,
        remaining_quota: 0,
        usage_rate: '0.00%',
        current_active_plays: 0,
        max_concurrent_plays: 0,
        warning: false
      },
      statsLoading: false,

      // WVP直连设备
      wvpDevices: [],
      wvpDeviceLoading: false,
      wvpDevicesLoaded: false, // 是否已加载过设备列表
      selectedWVPDevice: null,
      wvpDeviceQuery: {
        status: '',
        query: '',
        page: 1,
        count: 20
      },

      // WVP通道
      wvpChannels: [],
      wvpChannelLoading: false,
      wvpChannelsLoaded: false, // 是否已加载过通道列表
      wvpChannelQuery: {
        online: '',
        query: '',
        page: 1,
        count: 50
      },

      // 摄像机控制弹窗
      showControlDialog: false,
      currentChannel: {},
      streamUrls: {},
      loadingStreamInfo: false,
      controlLogs: []
    }
  },
  async mounted() {
    // 添加body类名用于样式控制
    document.body.classList.add('platform-management-active')
    
    await this.loadSIPInfo()
    await this.loadChannelStats()
  },
  beforeUnmount() {
    // 移除body类名
    document.body.classList.remove('platform-management-active')
  },
  methods: {
    // ==================== WVP平台对接方法 ====================
    // 加载SIP接入信息
    async loadSIPInfo() {
      this.sipLoading = true
      try {
        const response = await gb28181API.getSIPAccessInfo()
        if (response && response.data) {
          const data = response.data
          this.sipInfo = {
            id: data.id || '-',
            domain: data.domain || '-',
            port: data.port != null ? String(data.port) : '-',
            ips: Array.isArray(data.ips) ? data.ips.join(', ') : '-',
            password: data.password || '-'
          }
        }
      } catch (error) {
        console.error('加载SIP接入信息失败:', error)
        ElMessage.error('加载SIP接入信息失败')
      } finally {
        this.sipLoading = false
      }
    },

    // 加载通道统计信息
    async loadChannelStats() {
      this.statsLoading = true
      try {
        const response = await gb28181API.getChannelStats()
        if (response && response.data) {
          this.channelStats = {
            total_channels: response.data.total_channels || 0,
            global_limit: response.data.global_limit || 0,
            remaining_quota: response.data.remaining_quota || 0,
            usage_rate: response.data.usage_rate || '0.00%',
            current_active_plays: response.data.current_active_plays || 0,
            max_concurrent_plays: response.data.max_concurrent_plays || 0,
            warning: response.data.warning || false
          }
        }
      } catch (error) {
        console.error('加载通道统计失败:', error)
        ElMessage.error('加载通道统计失败')
      } finally {
        this.statsLoading = false
      }
    },

    // 加载WVP设备列表
    async loadWVPDevices() {
      this.wvpDeviceLoading = true
      this.wvpDevicesLoaded = true // 标记已加载
      try {
        const params = {
          page: this.wvpDeviceQuery.page,
          count: this.wvpDeviceQuery.count
        }
        
        if (this.wvpDeviceQuery.query) {
          params.query = this.wvpDeviceQuery.query
        }
        
        if (this.wvpDeviceQuery.status) {
          params.status = this.wvpDeviceQuery.status
        }

        const response = await gb28181API.getWVPDevices(params)
        if (response && response.data) {
          this.wvpDevices = response.data.list || []
          
          // 自动选择第一个设备（但不自动加载通道，由用户手动点击刷新通道）
          if (this.wvpDevices.length > 0 && !this.selectedWVPDevice) {
            this.selectedWVPDevice = this.wvpDevices[0].deviceId || this.wvpDevices[0].device_id
          }
        }
      } catch (error) {
        console.error('加载WVP设备列表失败:', error)
        ElMessage.error('加载WVP设备列表失败')
      } finally {
        this.wvpDeviceLoading = false
      }
    },

    // 处理设备选择
    handleWVPDeviceSelect(row) {
      if (row) {
        this.selectedWVPDevice = row.deviceId || row.device_id
        // 清空通道列表，提示用户点击刷新通道
        this.wvpChannels = []
        this.wvpChannelsLoaded = false // 重置加载状态
      }
    },

    // 加载WVP设备通道列表
    async loadWVPDeviceChannels() {
      if (!this.selectedWVPDevice) {
        ElMessage.warning('请先选择设备')
        return
      }

      this.wvpChannelLoading = true
      this.wvpChannelsLoaded = true // 标记已加载
      try {
        const params = {
          page: this.wvpChannelQuery.page,
          count: this.wvpChannelQuery.count
        }
        
        if (this.wvpChannelQuery.query) {
          params.query = this.wvpChannelQuery.query
        }
        
        if (this.wvpChannelQuery.online) {
          params.online = this.wvpChannelQuery.online
        }

        const response = await gb28181API.getWVPDeviceChannels(this.selectedWVPDevice, params)
        if (response && response.data) {
          this.wvpChannels = response.data.list || []
          
          // 同步通道到本地数据库
          try {
            await this.syncDeviceChannelsToLocal(this.selectedWVPDevice)
          } catch (syncError) {
            console.warn('同步通道到本地数据库失败:', syncError)
          }
        }
      } catch (error) {
        console.error('加载WVP设备通道失败:', error)
        ElMessage.error('加载WVP设备通道失败')
      } finally {
        this.wvpChannelLoading = false
      }
    },

    // 同步设备通道到本地数据库
    async syncDeviceChannelsToLocal(deviceId) {
      try {
        const response = await gb28181API.syncDirectChannels(deviceId)
        if (response && response.data) {
          console.log(`同步完成: ${response.data.synced_count || 0} 个通道已保存到本地数据库`)
        }
      } catch (error) {
        console.error('同步通道到本地失败:', error)
        throw error
      }
    },

    // 查看通道控制（包含流信息和云台控制）
    async viewChannelControl(row) {
      const channelId = row.channelId || row.channel_id || row.deviceId || row.device_id
      const deviceId = this.selectedWVPDevice
      
      if (!channelId) {
        ElMessage.warning('通道ID为空')
        return
      }
      
      // 保存当前通道信息
      this.currentChannel = {
        deviceId: deviceId,
        channelId: channelId,
        name: row.name || row.channel_name || channelId
      }
      
      // 清空之前的数据
      this.streamUrls = {}
      this.controlLogs = []
      
      // 打开弹窗
      this.showControlDialog = true
      
      // 加载流信息
      await this.loadStreamInfo()
    },

    // 加载流信息
    async loadStreamInfo() {
      this.loadingStreamInfo = true
      this.addLog('正在请求播放地址...', 'info')
      
      try {
        // 调用预览开始接口获取流地址
        const response = await gb28181API.startWVPPreview({
          deviceId: this.currentChannel.deviceId,
          channelId: this.currentChannel.channelId
        })
        
        if (response && response.data) {
          const data = response.data
          // 提取所有流URL
          this.streamUrls = this.extractStreamUrls(data)
          this.addLog('播放地址获取成功', 'success')
        }
      } catch (error) {
        console.error('加载流信息失败:', error)
        this.addLog('播放地址获取失败: ' + (error.message || '未知错误'), 'error')
      } finally {
        this.loadingStreamInfo = false
      }
    },

    // 提取流URL
    extractStreamUrls(data) {
      const urls = {}
      
      // 根据后端返回的数据结构提取URL
      if (data.flv) urls['FLV'] = data.flv
      if (data.https_flv) urls['HTTPS-FLV'] = data.https_flv
      if (data.ws_flv) urls['WS-FLV'] = data.ws_flv
      if (data.wss_flv) urls['WSS-FLV'] = data.wss_flv
      if (data.hls) urls['HLS'] = data.hls
      if (data.https_hls) urls['HTTPS-HLS'] = data.https_hls
      if (data.fmp4) urls['FMP4'] = data.fmp4
      if (data.https_fmp4) urls['HTTPS-FMP4'] = data.https_fmp4
      if (data.ws_fmp4) urls['WS-FMP4'] = data.ws_fmp4
      if (data.wss_fmp4) urls['WSS-FMP4'] = data.wss_fmp4
      if (data.ts) urls['TS'] = data.ts
      if (data.https_ts) urls['HTTPS-TS'] = data.https_ts
      if (data.ws_ts) urls['WS-TS'] = data.ws_ts
      if (data.rtsp) urls['RTSP'] = data.rtsp
      if (data.rtc) urls['WebRTC'] = data.rtc
      if (data.rtcs) urls['WebRTCS'] = data.rtcs
      
      return urls
    },

    // 云台控制
    async handlePTZControl(command) {
      this.addLog(`执行云台控制: ${this.getPTZCommandName(command)}`, 'info')
      
      try {
        await gb28181API.controlWVPPTZ({
          deviceId: this.currentChannel.deviceId,
          channelId: this.currentChannel.channelId,
          cmd: command,
          speed: 50
        })
        
        this.addLog(`云台控制: ${this.getPTZCommandName(command)} 执行成功`, 'success')
      } catch (error) {
        console.error('云台控制失败:', error)
        this.addLog('云台控制失败: ' + (error.message || '未知错误'), 'error')
      }
    },

    // 获取PTZ命令名称
    getPTZCommandName(cmd) {
      const names = {
        'up': '向上',
        'down': '向下',
        'left': '向左',
        'right': '向右',
        'stop': '停止',
        'zoom_in': '放大',
        'zoom_out': '缩小'
      }
      return names[cmd] || cmd
    },

    // 添加日志
    addLog(message, type = 'info') {
      const now = new Date()
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      
      this.controlLogs.push({
        time,
        message,
        type
      })
      
      // 自动滚动到底部
      this.$nextTick(() => {
        const logContent = this.$refs.logContent
        if (logContent) {
          logContent.scrollTop = logContent.scrollHeight
        }
      })
    },

    // 查看通道详情
    async viewChannelDetail(row) {
      const channelId = row.channel_id || row.channelId
      const deviceId = row.device_id || this.selectedWVPDevice
      
      if (!channelId) {
        ElMessage.warning('通道ID为空')
        return
      }
      
      try {
        const response = await gb28181API.getWVPDeviceChannelInfo(deviceId, channelId)
        if (response && response.data) {
          // 显示通道详情对话框
          const detail = response.data
          let message = `
            <div style="text-align: left;">
              <p><strong>设备ID:</strong> ${detail.device_id || deviceId}</p>
              <p><strong>通道ID:</strong> ${detail.channel_id || channelId}</p>
              <p><strong>通道名称:</strong> ${detail.channel_name || detail.name || '-'}</p>
              <p><strong>制造商:</strong> ${detail.manufacturer || '-'}</p>
              <p><strong>型号:</strong> ${detail.model || '-'}</p>
              <p><strong>状态:</strong> ${detail.status || '-'}</p>
              <p><strong>在线状态:</strong> ${detail.online ? '在线' : '离线'}</p>
            </div>
          `
          this.$alert(message, '通道详情', {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '关闭'
          })
        }
      } catch (error) {
        console.error('获取通道详情失败:', error)
        ElMessage.error('获取通道详情失败')
      }
    },

    // ==================== 工具方法 ====================
    async copyToClipboard(text) {
      if (!text || text === '-') {
        ElMessage.warning('无可复制内容')
        return
      }
      
      try {
        await navigator.clipboard.writeText(text)
        ElMessage.success('已复制到剪贴板')
      } catch (error) {
        console.error('复制失败:', error)
        ElMessage.error('复制失败')
      }
    }
  }
}
</script>

<style scoped>
.platform-management {
  min-height: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 120px;
  overflow: visible;
}

/* 等高布局 */
.equal-height-row {
  display: flex;
  flex-wrap: wrap;
}

.equal-height-col {
  display: flex;
  flex-direction: column;
}

.equal-height-col .tech-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.equal-height-col .tech-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 代码样式 */
code.device-id,
code.channel-id {
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

/* 卡片样式 */
.management-section.tech-card {
  position: relative;
  z-index: 10;
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  height: auto;
  margin-bottom: 20px;
}

.management-section.tech-card :deep(.el-card__header) {
  background: rgba(20, 30, 50, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
  padding: 16px 20px !important;
  color: #ffffff !important;
}

.management-section.tech-card :deep(.el-card__body) {
  background: rgba(15, 25, 45, 0.95) !important;
  padding: 20px !important;
  border-radius: 0 0 12px 12px !important;
  overflow: hidden !important;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header span {
  color: #00ffff;
  font-weight: 600;
  font-size: 16px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
  letter-spacing: 1px;
}

.section-content {
  padding: 0;
  min-height: auto;
}

/* 确保row之间的间距一致 */
.section-content .el-row {
  margin-left: 0 !important;
  margin-right: 0 !important;
  flex: 1;
  display: flex;
}

.section-content .el-row .el-col {
  display: flex;
}

.section-content .el-row + .el-row {
  margin-top: 10px !important;
}

/* 确保两边内容高度完全一致 */
.equal-height-col .section-content {
  height: 210px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 表格样式 - 来自 RoleManagement */
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

/* 表格整体容器 */
.tech-table :deep(.el-table) {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  border: none !important;
  border-bottom: none !important;
}

.tech-table :deep(.el-table::before) {
  display: none !important;
}

.tech-table :deep(.el-table::after) {
  display: none !important;
}

/* 移除所有可能的白色边框 */
.tech-table :deep(.el-table__inner-wrapper) {
  border: none !important;
  border-bottom: none !important;
}

.tech-table :deep(.el-table__inner-wrapper::after) {
  display: none !important;
}

.tech-table :deep(.el-table__inner-wrapper::before) {
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

/* 表格主体样式 */
.tech-table :deep(.el-table__body-wrapper) {
  background: transparent !important;
  border: none !important;
  border-bottom: none !important;
}

.tech-table :deep(.el-table__body-wrapper::after) {
  display: none !important;
}

.tech-table :deep(.el-table__body-wrapper::before) {
  display: none !important;
}

.tech-table :deep(.el-table__body) {
  background: transparent !important;
  border: none !important;
  border-bottom: none !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr) {
  background: rgba(25, 35, 55, 0.6) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.08) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative !important;
}

/* 移除最后一行的底部边框 */
.tech-table :deep(.el-table__body-wrapper .el-table__body tr:last-child) {
  border-bottom: none !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:last-child td) {
  border-bottom: none !important;
}

/* 交替行颜色 - 创建微妙的斑马纹效果 */
.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(even)) {
  background: rgba(20, 30, 50, 0.7) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(odd)) {
  background: rgba(25, 35, 55, 0.6) !important;
}

/* 悬停效果 */
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

/* 选中行样式 */
.tech-table :deep(.el-table__body-wrapper .el-table__body tr.current-row) {
  background: rgba(0, 255, 255, 0.12) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr.current-row:hover) {
  background: rgba(0, 255, 255, 0.15) !important;
}

/* 单元格样式 */
.tech-table :deep(.el-table__body-wrapper .el-table__body td) {
  border: none !important;
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

/* 序号列特殊样式 */
.tech-table :deep(.el-table__header-wrapper .el-table__header th.el-table-column--selection),
.tech-table :deep(.el-table__header-wrapper .el-table__header th:first-child) {
  padding: 12px 8px !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body td.el-table-column--selection),
.tech-table :deep(.el-table__body-wrapper .el-table__body td:first-child) {
  padding: 12px 8px !important;
  white-space: nowrap !important;
}

/* 数据为空时的样式 */
.tech-table :deep(.el-table__empty-block) {
  background: rgba(25, 35, 55, 0.6) !important;
  color: rgba(255, 255, 255, 0.6) !important;
  border: none !important;
  border-bottom: none !important;
}

.tech-table :deep(.el-table__empty-text) {
  color: rgba(255, 255, 255, 0.6) !important;
  font-size: 14px !important;
}

/* 强制移除表格底部所有可能的边框 */
.tech-table :deep(.el-table--border),
.tech-table :deep(.el-table--striped),
.tech-table :deep(.el-table) {
  border-bottom: none !important;
}

.tech-table :deep(.el-table__footer-wrapper) {
  border: none !important;
  border-bottom: none !important;
}

/* 移除可能存在的底部分隔线 */
.tech-table :deep(.el-table__border-bottom-patch) {
  display: none !important;
}

/* SIP接入信息样式 */
.info-item {
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
  min-height: 60px;
}

.info-item label {
  min-width: 90px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  white-space: nowrap;
}

.info-value {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.pill {
  display: inline-block;
  padding: 10px 16px;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  color: #00ffff;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  flex: 1;
  text-align: center;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  word-break: break-all;
  line-height: 1.4;
}

/* 系统配额统计样式 */
.stat-box {
  background: rgba(20, 30, 50, 0.6);
  padding: 8px 12px;
  border-radius: 8px;
  border-left: 4px solid;
  flex: 1;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 0;
  width: 100%;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
  font-weight: 500;
  line-height: 1.3;
  white-space: normal;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: rgba(0, 255, 255, 0.9);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  line-height: 1.2;
  word-break: break-word;
}

.warning-box {
  background: rgba(254, 243, 199, 0.1) !important;
  border: 1px solid rgba(245, 158, 11, 0.5) !important;
  border-left: 4px solid #f59e0b !important;
  flex: 1 !important;
  min-height: 50px !important;
  margin-bottom: 0 !important;
}

/* WVP设备与通道查询样式 */
.wvp-query-section {
  padding: 15px;
  background: rgba(20, 30, 50, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.1);
  margin-bottom: 15px;
}

.wvp-form {
  margin: 0;
}

.wvp-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.wvp-form :deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* 输入框样式覆盖 */
.wvp-form :deep(.el-input__wrapper) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  box-shadow: none !important;
}

.wvp-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.4) !important;
}

.wvp-form :deep(.el-input__wrapper.is-focus) {
  border-color: rgba(0, 255, 255, 0.6) !important;
}

.wvp-form :deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.9) !important;
  background: transparent !important;
}

.wvp-form :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}

/* 选择框样式覆盖 */
.wvp-form :deep(.el-select .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

.wvp-form :deep(.el-input-number__decrease),
.wvp-form :deep(.el-input-number__increase) {
  background: rgba(20, 30, 50, 0.6) !important;
  border-color: rgba(0, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

.wvp-form :deep(.el-input-number__decrease:hover),
.wvp-form :deep(.el-input-number__increase:hover) {
  color: #00ffff !important;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .stat-value {
    font-size: 20px;
  }
  
  .stat-label {
    font-size: 12px;
  }
  
  .pill {
    font-size: 13px;
    padding: 8px 14px;
    min-height: 40px;
  }
  
  .info-item {
    min-height: 56px;
  }
  
  .info-item label {
    min-width: 80px;
    font-size: 13px;
  }
  
  .stat-box {
    min-height: 50px;
    padding: 8px 12px;
  }
  
  .warning-box {
    min-height: 50px !important;
  }
  
  .equal-height-col .section-content {
    height: 210px;
  }
}

@media (max-width: 768px) {
  /* 小屏幕时取消等高，改为堆叠 */
  .equal-height-row {
    display: block;
  }
  
  .equal-height-col {
    display: block;
    margin-bottom: 20px;
  }
  
  .equal-height-col .tech-card {
    height: auto;
  }
  
  .equal-height-col .section-content {
    height: auto !important;
  }
  
  .section-content .el-row {
    flex: none;
  }
  
  .info-value {
    flex-direction: column;
    align-items: stretch;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    min-height: auto;
  }
  
  .info-item label {
    margin-bottom: 8px;
  }
  
  .pill {
    min-height: 40px;
  }
  
  .stat-box {
    min-height: 50px;
    padding: 8px 12px;
  }
  
  .stat-label {
    font-size: 12px;
    white-space: normal;
  }
  
  .stat-value {
    font-size: 18px;
  }
  
  .warning-box {
    min-height: 50px !important;
  }
  
  .wvp-query-section .el-form {
    display: block;
  }
  
  .wvp-query-section .el-form-item {
    display: block;
    margin-bottom: 10px;
  }
}
</style>

<style>
/* 针对平台管理页面的下拉菜单样式（非scoped） */
body.platform-management-active .el-select-dropdown,
body.platform-management-active .el-popper {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

body.platform-management-active .el-select-dropdown__wrap,
body.platform-management-active .el-select-dropdown__list {
  background: transparent !important;
}

body.platform-management-active .el-select-dropdown__item {
  color: rgba(255, 255, 255, 0.9) !important;
  background: transparent !important;
}

body.platform-management-active .el-select-dropdown__item:hover {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

body.platform-management-active .el-select-dropdown__item.is-selected {
  color: #00ffff !important;
  background: rgba(0, 255, 255, 0.15) !important;
  font-weight: bold !important;
}

body.platform-management-active .el-select-dropdown__item.is-disabled {
  color: rgba(255, 255, 255, 0.3) !important;
}

body.platform-management-active .el-popper.is-light,
body.platform-management-active .el-popper.is-pure {
  background: rgba(15, 25, 45, 0.98) !important;
  border-color: rgba(0, 255, 255, 0.3) !important;
}

body.platform-management-active .el-popper.is-light .el-popper__arrow::before,
body.platform-management-active .el-popper.is-pure .el-popper__arrow::before {
  background: rgba(15, 25, 45, 0.98) !important;
  border-color: rgba(0, 255, 255, 0.3) !important;
}

/* 表格的空状态和加载状态 */
body.platform-management-active .el-table__empty-block {
  background: transparent !important;
}

body.platform-management-active .el-table__empty-text {
  color: rgba(255, 255, 255, 0.5) !important;
}

body.platform-management-active .el-loading-mask {
  background-color: rgba(15, 25, 45, 0.8) !important;
}

/* 控制弹窗样式 */
.control-dialog :deep(.el-dialog) {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 255, 255, 0.2) !important;
}

.control-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(20, 35, 60, 1) 0%, rgba(25, 40, 65, 1) 100%) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 12px 12px 0 0 !important;
  padding: 20px !important;
}

.control-dialog :deep(.el-dialog__title) {
  color: #00ffff !important;
  font-weight: 600 !important;
  font-size: 18px !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

.control-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 20px !important;
}

.control-dialog :deep(.el-dialog__headerbtn .el-dialog__close:hover) {
  color: #00ffff !important;
}

.control-dialog :deep(.el-dialog__body) {
  background: rgba(15, 25, 45, 0.98) !important;
  padding: 20px !important;
  border-radius: 0 0 12px 12px !important;
}

.control-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 各个section的标题 */
.section-title {
  color: #00ffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(0, 255, 255, 0.3);
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
}

/* 播放地址列表 */
.stream-section {
  background: rgba(20, 30, 50, 0.6);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.stream-urls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.url-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(15, 25, 45, 0.8);
  border-radius: 6px;
  border: 1px solid rgba(0, 255, 255, 0.15);
}

.protocol-label {
  min-width: 120px;
  font-weight: 600;
  color: #00d4ff;
  font-size: 13px;
}

.url-value {
  flex: 1;
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
  padding: 6px 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

/* 云台控制 */
.ptz-section {
  background: rgba(20, 30, 50, 0.6);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.ptz-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
}

.direction-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.direction-grid {
  display: grid;
  grid-template-columns: repeat(3, 75px);
  grid-template-rows: repeat(3, 75px);
  gap: 8px;
}

.ptz-btn {
  width: 100%;
  height: 100%;
  font-size: 26px;
  font-weight: bold;
  background: rgba(0, 255, 255, 0.1) !important;
  border: 2px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  color: #00ffff !important;
  transition: all 0.3s ease !important;
  padding: 0 !important;
  margin: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1 !important;
  min-height: unset !important;
}

.ptz-btn:hover {
  background: rgba(0, 255, 255, 0.2) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-2px) !important;
}

.ptz-btn:active {
  transform: translateY(0) !important;
}

.ptz-btn.ptz-stop {
  background: rgba(239, 68, 68, 0.2) !important;
  border-color: rgba(239, 68, 68, 0.4) !important;
  color: #ef4444 !important;
  font-size: 22px;
}

.ptz-btn.ptz-stop:hover {
  background: rgba(239, 68, 68, 0.3) !important;
  border-color: rgba(239, 68, 68, 0.6) !important;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.4) !important;
}

.zoom-controls {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
}

.zoom-controls .ptz-btn.zoom-btn {
  width: 100px;
  height: 50px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px !important;
}

/* 操作日志 */
.log-section {
  background: rgba(20, 30, 50, 0.6);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.log-content {
  max-height: 150px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-item {
  display: flex;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: rgba(255, 255, 255, 0.5);
  min-width: 70px;
}

.log-message {
  flex: 1;
  color: rgba(255, 255, 255, 0.8);
}

.log-item.log-info .log-message {
  color: #3b82f6;
}

.log-item.log-success .log-message {
  color: #10b981;
}

.log-item.log-error .log-message {
  color: #ef4444;
}

/* 自定义滚动条 */
.log-content::-webkit-scrollbar {
  width: 6px;
}

.log-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.log-content::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 3px;
}

.log-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}
</style>