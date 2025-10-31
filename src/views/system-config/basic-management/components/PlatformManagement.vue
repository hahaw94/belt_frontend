<template>
  <div class="platform-management">
    <!-- 国标接入信息（SIP） -->
    <el-card class="management-section tech-card" shadow="hover">
      <template #header>
        <div class="section-header">
          <span>🌐 国标接入信息（SIP）</span>
          <el-button type="primary" size="small" :icon="Refresh" @click="loadSIPInfo" :loading="sipLoading">获取接入信息</el-button>
        </div>
      </template>
      <div class="section-content">
        <el-row :gutter="15">
          <el-col :span="8">
            <div class="info-item">
              <label>编号</label>
              <div class="info-value">
                <span class="pill">{{ sipInfo.id || '-' }}</span>
                <el-button size="small" :icon="CopyDocument" @click="copyToClipboard(sipInfo.id)">复制</el-button>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>域</label>
              <div class="info-value">
                <span class="pill">{{ sipInfo.domain || '-' }}</span>
                <el-button size="small" :icon="CopyDocument" @click="copyToClipboard(sipInfo.domain)">复制</el-button>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>端口</label>
              <div class="info-value">
                <span class="pill">{{ sipInfo.port || '-' }}</span>
                <el-button size="small" :icon="CopyDocument" @click="copyToClipboard(sipInfo.port)">复制</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="15" style="margin-top: 10px;">
          <el-col :span="12">
            <div class="info-item">
              <label>IP 列表</label>
              <div class="info-value">
                <span class="pill">{{ sipInfo.ips || '-' }}</span>
                <el-button size="small" :icon="CopyDocument" @click="copyToClipboard(sipInfo.ips)">复制</el-button>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
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

    <!-- 系统配额统计 -->
    <el-card class="management-section tech-card" shadow="hover">
      <template #header>
        <div class="section-header">
          <span>📊 系统配额统计</span>
          <el-button type="primary" size="small" :icon="Refresh" @click="loadChannelStats" :loading="statsLoading">刷新</el-button>
        </div>
      </template>
      <div class="section-content">
        <el-row :gutter="15">
          <el-col :span="6">
            <div class="stat-box" style="border-left: 4px solid #3b82f6;">
              <div class="stat-label">当前通道总数</div>
              <div class="stat-value">{{ channelStats.total_channels || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-box" style="border-left: 4px solid #10b981;">
              <div class="stat-label">全局上限</div>
              <div class="stat-value">{{ channelStats.global_limit || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-box" style="border-left: 4px solid #f59e0b;">
              <div class="stat-label">剩余配额</div>
              <div class="stat-value">{{ channelStats.remaining_quota || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-box" style="border-left: 4px solid #8b5cf6;">
              <div class="stat-label">使用率</div>
              <div class="stat-value">{{ channelStats.usage_rate || '0.00%' }}</div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="15" style="margin-top: 15px;">
          <el-col :span="12">
            <div class="stat-box">
              <div class="stat-label">当前播放流</div>
              <div class="stat-value" style="font-size: 18px;">
                {{ channelStats.current_active_plays || 0 }} / {{ channelStats.max_concurrent_plays || 0 }}
              </div>
            </div>
          </el-col>
          <el-col :span="12" v-if="channelStats.warning">
            <div class="stat-box warning-box">
              <div class="stat-label" style="color: #d97706; font-weight: bold;">⚠️ 配额告警</div>
              <div style="font-size: 12px; color: #92400e; margin-top: 5px;">通道数已超过90%，请注意管理</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 直连设备与通道 -->
    <el-card class="management-section tech-card" shadow="hover">
      <template #header>
        <div class="section-header">
          <span>🔗 直连设备与通道</span>
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
              <el-input-number v-model="wvpDeviceQuery.size" :min="1" :max="100" style="width: 120px;" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="loadWVPDevices" :loading="wvpDeviceLoading">刷新设备</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 设备列表 -->
        <el-table
          :data="wvpDevices"
          v-loading="wvpDeviceLoading"
          class="tech-table"
          stripe
          style="width: 100%; margin-top: 15px;"
          @current-change="handleWVPDeviceSelect"
          highlight-current-row
        >
          <el-table-column type="index" label="序号" width="60"></el-table-column>
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
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="loadWVPDeviceChannels" :loading="wvpChannelLoading" :disabled="!selectedWVPDevice">刷新通道</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 通道列表 -->
        <el-table
          :data="wvpChannels"
          v-loading="wvpChannelLoading"
          class="tech-table"
          stripe
          style="width: 100%; margin-top: 15px;"
        >
          <el-table-column type="index" label="序号" width="60"></el-table-column>
          <el-table-column prop="device_id" label="设备ID" width="180">
            <template #default="{ row }">
              <code class="device-id">{{ row.device_id }}</code>
            </template>
          </el-table-column>
          <el-table-column prop="channel_id" label="通道ID" width="180">
            <template #default="{ row }">
              <code class="channel-id">{{ row.channel_id || row.channelId }}</code>
            </template>
          </el-table-column>
          <el-table-column prop="channel_name" label="通道名称" min-width="120">
            <template #default="{ row }">
              {{ row.channel_name || row.name }}
            </template>
          </el-table-column>
          <el-table-column prop="manufacturer" label="厂商" width="100">
            <template #default="{ row }">
              {{ row.manufacturer || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status?.toUpperCase() === 'ON' ? 'success' : 'danger'" size="small">
                {{ row.status?.toUpperCase() || '未知' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="playChannel(row)">播放</el-button>
              <el-button type="info" size="small" @click="viewChannelDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
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
      selectedWVPDevice: null,
      wvpDeviceQuery: {
        status: '',
        query: '',
        page: 1,
        size: 20
      },

      // WVP通道
      wvpChannels: [],
      wvpChannelLoading: false,
      wvpChannelQuery: {
        online: '',
        query: ''
      }
    }
  },
  async mounted() {
    await this.loadSIPInfo()
    await this.loadChannelStats()
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
      try {
        const params = {
          page: this.wvpDeviceQuery.page,
          size: this.wvpDeviceQuery.size
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
          
          // 自动选择第一个设备
          if (this.wvpDevices.length > 0 && !this.selectedWVPDevice) {
            this.selectedWVPDevice = this.wvpDevices[0].deviceId || this.wvpDevices[0].device_id
            await this.loadWVPDeviceChannels()
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
        this.loadWVPDeviceChannels()
      }
    },

    // 加载WVP设备通道列表
    async loadWVPDeviceChannels() {
      if (!this.selectedWVPDevice) {
        ElMessage.warning('请先选择设备')
        return
      }

      this.wvpChannelLoading = true
      try {
        const params = {
          page: 1,
          size: 50
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

    // 播放通道
    playChannel(row) {
      const channelId = row.channel_id || row.channelId
      const deviceId = row.device_id || this.selectedWVPDevice
      
      if (!channelId) {
        ElMessage.warning('通道ID为空，无法播放')
        return
      }
      
      ElMessage.info(`播放功能开发中... 设备ID: ${deviceId}, 通道ID: ${channelId}`)
      
      // TODO: 跳转到播放页面或打开播放对话框
      // this.$router.push({
      //   name: 'VideoPlayer',
      //   query: { deviceId, channelId }
      // })
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

/* 表格样式 */
.tech-table :deep(.el-table) {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 8px !important;
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
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.6) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr) {
  background: rgba(25, 35, 55, 0.6) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  transition: all 0.3s ease !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(even)) {
  background: rgba(20, 30, 50, 0.7) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:hover) {
  background: linear-gradient(90deg,
    rgba(0, 255, 255, 0.08) 0%,
    rgba(0, 255, 255, 0.12) 50%,
    rgba(0, 255, 255, 0.08) 100%) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.15) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body td) {
  border: none !important;
  background: transparent !important;
  padding: 14px 12px !important;
  font-size: 13px !important;
}

/* SIP接入信息样式 */
.info-item {
  margin-bottom: 15px;
}

.info-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.info-value {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pill {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  color: #00ffff;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  flex: 1;
  text-align: center;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 系统配额统计样式 */
.stat-box {
  background: rgba(20, 30, 50, 0.6);
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid;
  transition: all 0.3s ease;
}

.stat-box:hover {
  background: rgba(20, 30, 50, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 255, 0.1);
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: rgba(0, 255, 255, 0.9);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.warning-box {
  background: rgba(254, 243, 199, 0.1) !important;
  border: 1px solid rgba(245, 158, 11, 0.5) !important;
  border-left: 4px solid #f59e0b !important;
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

/* 响应式适配 */
@media (max-width: 1200px) {
  .stat-value {
    font-size: 20px;
  }
  
  .pill {
    font-size: 12px;
    padding: 6px 12px;
  }
}

@media (max-width: 768px) {
  .info-value {
    flex-direction: column;
    align-items: stretch;
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