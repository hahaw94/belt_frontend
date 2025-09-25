<template>
  <div class="platform-management">
    <!-- GB28181视频管理总览 -->
    <el-card class="config-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>📹 GB28181视频管理平台</span>
          <div>
            <el-button type="primary" :icon="Setting" size="small" class="tech-button-sm" @click="showConfigDialog">基础配置</el-button>
            <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="refreshAll" :loading="globalLoading">全局刷新</el-button>
          </div>
        </div>
      </template>
      <div class="overview-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon device">📱</div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.devices }}</div>
                <div class="stat-label">设备总数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon channel">📺</div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.channels }}</div>
                <div class="stat-label">通道总数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon stream">🎬</div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.streams }}</div>
                <div class="stat-label">活动流数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon record">📼</div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.records }}</div>
                <div class="stat-label">录像文件</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 设备管理区域 -->
    <el-card class="management-section tech-card" shadow="hover">
      <template #header>
        <div class="section-header">
          <span>📱 设备管理</span>
        </div>
      </template>
      <div class="section-content">
            <!-- 设备操作区 -->
            <div class="operation-toolbar">
              <div class="toolbar-left">
                <el-button type="primary" :icon="Plus" @click="showDeviceDialog('add')">创建设备</el-button>
                <el-button type="success" :icon="Refresh" @click="loadDevices" :loading="deviceLoading">刷新列表</el-button>
              </div>
              <div class="toolbar-right">
                <el-input
                  v-model="deviceSearch"
                  placeholder="搜索设备..."
                  :prefix-icon="Search"
                  style="width: 200px"
                  @input="handleDeviceSearch"
                  clearable
                />
              </div>
            </div>

            <!-- 设备列表表格 -->
            <el-table
              :data="filteredDevices"
              v-loading="deviceLoading"
              class="tech-table"
              stripe
              style="width: 100%"
            >
              <el-table-column prop="deviceid" label="设备ID" width="200">
                <template #default="{ row }">
                  <code class="device-id">{{ row.deviceid }}</code>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="设备名称" min-width="150"></el-table-column>
              <el-table-column label="操作" width="200" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" :icon="Edit" @click="showDeviceDialog('edit', row)">编辑</el-button>
                  <el-button type="danger" size="small" :icon="Delete" @click="confirmDeleteDevice(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
        </div>
    </el-card>

    <!-- 通道管理区域 -->
    <el-card class="management-section tech-card" shadow="hover">
      <template #header>
        <div class="section-header">
          <span>📺 通道管理</span>
        </div>
      </template>
      <div class="section-content">
            <!-- 通道操作区 -->
            <div class="operation-toolbar">
              <div class="toolbar-left">
                <el-select v-model="selectedDeviceForChannel" placeholder="选择设备" style="width: 200px" @change="loadChannelsForDevice">
                  <el-option
                    v-for="device in devices"
                    :key="device.deviceid"
                    :label="device.name || device.deviceid"
                    :value="device.deviceid"
                  />
                </el-select>
                <el-button type="primary" :icon="Plus" @click="showChannelDialog('add')" :disabled="!selectedDeviceForChannel">创建通道</el-button>
                <el-button type="success" :icon="Refresh" @click="loadChannelsForDevice" :loading="channelLoading" :disabled="!selectedDeviceForChannel">刷新通道</el-button>
              </div>
            </div>

            <!-- 通道列表表格 -->
            <el-table
              :data="channels"
              v-loading="channelLoading"
              class="tech-table"
              stripe
              style="width: 100%"
            >
              <el-table-column prop="deviceid" label="设备ID" width="180">
                <template #default="{ row }">
                  <code class="device-id">{{ row.deviceid }}</code>
                </template>
              </el-table-column>
              <el-table-column prop="channelid" label="通道ID" width="180">
                <template #default="{ row }">
                  <code class="channel-id">{{ row.channelid }}</code>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="通道名称" min-width="150"></el-table-column>
              <el-table-column prop="manufacturer" label="厂家" width="120"></el-table-column>
              <el-table-column prop="address" label="地址" min-width="200"></el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)" size="small">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" :icon="Edit" @click="showChannelDialog('edit', row)">编辑</el-button>
                  <el-button type="danger" size="small" :icon="Delete" @click="confirmDeleteChannel(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
        </div>
    </el-card>

    <!-- 流管理区域 -->
    <el-card class="management-section tech-card" shadow="hover">
      <template #header>
        <div class="section-header">
          <span>🎬 流管理</span>
        </div>
      </template>
      <div class="section-content">
            <!-- 流操作区 -->
            <div class="operation-toolbar">
              <div class="toolbar-left">
                <el-button type="primary" :icon="VideoPlay" @click="showPlayDialog">开始播放</el-button>
                <el-button type="success" :icon="Refresh" @click="loadStreams" :loading="streamLoading">刷新流列表</el-button>
                <el-button type="warning" :icon="Monitor" @click="showUrlsDialog" :disabled="!selectedStream">获取播放地址</el-button>
              </div>
            </div>

            <!-- 流列表表格 -->
            <el-table
              :data="streams"
              v-loading="streamLoading"
              class="tech-table"
              stripe
              style="width: 100%"
              @selection-change="handleStreamSelection"
            >
              <el-table-column type="selection" width="55"></el-table-column>
              <el-table-column prop="streamid" label="流ID" width="200">
                <template #default="{ row }">
                  <code class="stream-id">{{ row.streamid }}</code>
                </template>
              </el-table-column>
              <el-table-column prop="channelid" label="通道ID" width="180">
                <template #default="{ row }">
                  <code class="channel-id">{{ row.channelid }}</code>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)" size="small">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="starttime" label="开始时间" width="160">
                <template #default="{ row }">
                  {{ formatTime(row.starttime) }}
                </template>
              </el-table-column>
              <el-table-column prop="type" label="类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.type === 'live' ? 'success' : 'warning'" size="small">
                    {{ row.type === 'live' ? '实时' : '回放' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button type="warning" size="small" :icon="Link" @click="getPlayUrls(row)">播放地址</el-button>
                  <el-button type="danger" size="small" :icon="VideoPause" @click="stopStream(row)">停止</el-button>
                </template>
              </el-table-column>
            </el-table>
        </div>
    </el-card>

    <!-- 录像管理区域 -->
    <el-card class="management-section tech-card" shadow="hover">
      <template #header>
        <div class="section-header">
          <span>📼 录像管理</span>
        </div>
      </template>
      <div class="section-content">
            <!-- 录像查询区 -->
            <div class="search-toolbar">
              <el-form :model="recordQuery" inline class="search-form">
                <el-form-item label="通道ID:">
                  <el-input v-model="recordQuery.channelId" placeholder="请输入通道ID" style="width: 200px" />
                </el-form-item>
                <el-form-item label="开始时间:">
                  <el-date-picker
                    v-model="recordQuery.startTime"
                    type="datetime"
                    placeholder="选择开始时间"
                    value-format="YYYY-MM-DD HH:mm:ss"
                  />
                </el-form-item>
                <el-form-item label="结束时间:">
                  <el-date-picker
                    v-model="recordQuery.endTime"
                    type="datetime"
                    placeholder="选择结束时间"
                    value-format="YYYY-MM-DD HH:mm:ss"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :icon="Search" @click="searchRecords" :loading="recordLoading">查询录像</el-button>
                  <el-button :icon="Refresh" @click="resetRecordQuery">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 录像列表表格 -->
            <el-table
              :data="records"
              v-loading="recordLoading"
              class="tech-table"
              stripe
              style="width: 100%"
            >
              <el-table-column prop="recordid" label="录像ID" width="200">
                <template #default="{ row }">
                  <code class="record-id">{{ row.recordid }}</code>
                </template>
              </el-table-column>
              <el-table-column prop="channelid" label="通道ID" width="180">
                <template #default="{ row }">
                  <code class="channel-id">{{ row.channelid }}</code>
                </template>
              </el-table-column>
              <el-table-column prop="starttime" label="开始时间" width="160">
                <template #default="{ row }">
                  {{ formatTime(row.starttime) }}
                </template>
              </el-table-column>
              <el-table-column prop="endtime" label="结束时间" width="160">
                <template #default="{ row }">
                  {{ formatTime(row.endtime) }}
                </template>
              </el-table-column>
              <el-table-column prop="duration" label="时长" width="120">
                <template #default="{ row }">
                  {{ formatDuration(row.duration) }}
                </template>
              </el-table-column>
              <el-table-column prop="filesize" label="文件大小" width="120">
                <template #default="{ row }">
                  {{ formatFileSize(row.filesize) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" :icon="VideoPlay" @click="playRecord(row)">回放</el-button>
                  <el-button type="success" size="small" :icon="Download" @click="downloadRecord(row)">下载</el-button>
                </template>
              </el-table-column>
            </el-table>
        </div>
    </el-card>

    <!-- 设备添加/编辑对话框 -->
    <el-dialog
      :model-value="deviceDialogVisible"
      @update:model-value="updateDeviceDialogVisible"
      :title="deviceDialogMode === 'add' ? '创建设备' : '编辑设备'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="deviceForm" :rules="deviceRules" ref="deviceFormRef" label-width="100px">
        <el-form-item label="设备密码" prop="pwd">
          <el-input v-model="deviceForm.pwd" type="password" placeholder="请输入设备密码" show-password />
        </el-form-item>
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="deviceForm.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item v-if="deviceDialogMode === 'edit'" label="设备ID" prop="deviceid">
          <el-input v-model="deviceForm.deviceid" placeholder="设备ID" readonly />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="updateDeviceDialogVisible(false)">取消</el-button>
        <el-button type="primary" @click="submitDeviceForm" :loading="deviceLoading">
          {{ deviceDialogMode === 'add' ? '创建' : '更新' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 通道添加/编辑对话框 -->
    <el-dialog
      :model-value="channelDialogVisible"
      @update:model-value="updateChannelDialogVisible"
      :title="channelDialogMode === 'add' ? '创建通道' : '编辑通道'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="channelForm" :rules="channelRules" ref="channelFormRef" label-width="100px">
        <el-form-item label="设备ID" prop="deviceId">
          <el-input v-model="channelForm.deviceId" :readonly="true" />
        </el-form-item>
        <el-form-item label="通道备注" prop="memo">
          <el-input v-model="channelForm.memo" placeholder="请输入通道备注" />
        </el-form-item>
        <el-form-item label="播放类型" prop="streamtype">
          <el-select v-model="channelForm.streamtype" style="width: 100%">
            <el-option label="push (摄像头推流)" value="push" />
            <el-option label="pull (媒体服务器拉流)" value="pull" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="channelForm.streamtype === 'pull'" label="拉流地址" prop="url">
          <el-input v-model="channelForm.url" placeholder="rtsp://192.168.1.100:554/stream" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="updateChannelDialogVisible(false)">取消</el-button>
        <el-button type="primary" @click="submitChannelForm" :loading="channelLoading">
          {{ channelDialogMode === 'add' ? '创建' : '更新' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 开始播放对话框 -->
    <el-dialog
      :model-value="playDialogVisible"
      @update:model-value="updatePlayDialogVisible"
      title="开始播放"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="playForm" :rules="playRules" ref="playFormRef" label-width="100px">
        <el-form-item label="通道ID" prop="channelId">
          <el-input v-model="playForm.channelId" placeholder="请输入通道ID" />
        </el-form-item>
        <el-form-item label="播放类型">
          <el-radio-group v-model="playForm.type">
            <el-radio label="live">实时播放</el-radio>
            <el-radio label="playback">录像回放</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="playForm.type === 'playback'">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="playForm.startTime"
              type="datetime"
              placeholder="选择开始时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="playForm.endTime"
              type="datetime"
              placeholder="选择结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="updatePlayDialogVisible(false)">取消</el-button>
        <el-button type="primary" @click="startPlay" :loading="streamLoading">开始播放</el-button>
      </template>
    </el-dialog>

    <!-- 播放地址查看对话框 -->
    <el-dialog
      :model-value="urlsDialogVisible"
      @update:model-value="updateUrlsDialogVisible"
      title="播放地址"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="urls-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="RTMP地址" v-if="playUrls.rtmp">
            <div class="url-item">
              <el-input :model-value="playUrls.rtmp" readonly />
              <el-button :icon="CopyDocument" @click="copyToClipboard(playUrls.rtmp)" style="margin-left: 8px">复制</el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="RTSP地址" v-if="playUrls.rtsp">
            <div class="url-item">
              <el-input :model-value="playUrls.rtsp" readonly />
              <el-button :icon="CopyDocument" @click="copyToClipboard(playUrls.rtsp)" style="margin-left: 8px">复制</el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="HTTP-FLV地址" v-if="playUrls.flv">
            <div class="url-item">
              <el-input :model-value="playUrls.flv" readonly />
              <el-button :icon="CopyDocument" @click="copyToClipboard(playUrls.flv)" style="margin-left: 8px">复制</el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="HLS地址" v-if="playUrls.hls">
            <div class="url-item">
              <el-input :model-value="playUrls.hls" readonly />
              <el-button :icon="CopyDocument" @click="copyToClipboard(playUrls.hls)" style="margin-left: 8px">复制</el-button>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button type="primary" @click="updateUrlsDialogVisible(false)">关闭</el-button>
      </template>
    </el-dialog>

    <!-- GB28181基础配置对话框 (保留原有功能) -->
    <el-dialog
      :model-value="configDialogVisible"
      @update:model-value="updateConfigDialogVisible"
      title="GB28181基础配置"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="configFormData" :rules="configRules" ref="configFormRef" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="平台名称" prop="platform_name">
              <el-input v-model="configFormData.platform_name" placeholder="请输入平台名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="SIP服务器IP" prop="sip_server_ip">
              <el-input v-model="configFormData.sip_server_ip" placeholder="请输入SIP服务器IP" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="SIP端口" prop="sip_port">
              <el-input-number v-model="configFormData.sip_port" :min="1000" :max="65535" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平台ID" prop="platform_id">
              <el-input v-model="configFormData.platform_id" placeholder="请输入平台编码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="本地IP" prop="local_ip">
              <el-input v-model="configFormData.local_ip" placeholder="请输入本地IP" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="本地端口" prop="local_port">
              <el-input-number v-model="configFormData.local_port" :min="1000" :max="65535" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="启用状态">
              <el-switch v-model="configFormData.enabled" />
              <span style="margin-left: 10px; color: #909399;">启用后GB28181服务将开始运行</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="updateConfigDialogVisible(false)">取消</el-button>
        <el-button type="primary" @click="saveGB28181Config" :loading="configLoading">保存配置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { systemAPI, gb28181API } from '@/api/system'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'PlatformManagement',
  components: ElementPlusIconsVue,
  emits: ['show-add-gb28181-dialog', 'load-gb28181-platforms', 'toggle-gb28181-platform', 'test-gb28181-connection', 'edit-gb28181-platform', 'delete-gb28181-platform', 'save-gb28181-platform', 'update-dialog-visible', 'update-platform-name', 'update-platform-ip', 'update-platform-port', 'update-device-id', 'update-username', 'update-password', 'update-enabled'],
  props: {
    gb28181Platforms: {
      type: Array,
      required: true
    },
    gb28181Loading: {
      type: Boolean,
      default: false
    },
    gb28181DialogVisible: {
      type: Boolean,
      default: false
    },
    gb28181DialogMode: {
      type: String,
      default: 'add'
    },
    gb28181FormData: {
      type: Object,
      required: true
    },
    gb28181Rules: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      globalLoading: false,

      // 统计数据
      stats: {
        devices: 0,
        channels: 0,
        streams: 0,
        records: 0
      },

      // 基础配置
      configDialogVisible: false,
      configLoading: false,
      configFormData: {
        platform_name: '',
        sip_server_ip: '',
        sip_port: 5060,
        platform_id: '',
        local_ip: '',
        local_port: 5061,
        enabled: false
      },
      configRules: {
        platform_name: [{ required: true, message: '请输入平台名称', trigger: 'blur' }],
        sip_server_ip: [{ required: true, message: '请输入SIP服务器IP', trigger: 'blur' }],
        sip_port: [{ required: true, message: '请输入SIP端口', trigger: 'blur' }],
        platform_id: [{ required: true, message: '请输入平台ID', trigger: 'blur' }],
        local_ip: [{ required: true, message: '请输入本地IP', trigger: 'blur' }],
        local_port: [{ required: true, message: '请输入本地端口', trigger: 'blur' }]
      },

      // 设备管理
      devices: [],
      filteredDevices: [],
      deviceSearch: '',
      deviceLoading: false,
      deviceDialogVisible: false,
      deviceDialogMode: 'add',
      deviceForm: {
        pwd: '123456',
        name: '',
        deviceid: ''
      },
      deviceRules: {
        pwd: [{ required: true, message: '请输入设备密码', trigger: 'blur' }],
        name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }]
      },

      // 通道管理
      channels: [],
      channelLoading: false,
      selectedDeviceForChannel: '',
      channelDialogVisible: false,
      channelDialogMode: 'add',
      channelForm: {
        deviceId: '',
        memo: '通道01',
        streamtype: 'push',
        url: ''
      },
      channelRules: {
        deviceId: [{ required: true, message: '请选择设备', trigger: 'blur' }],
        memo: [{ required: true, message: '请输入通道备注', trigger: 'blur' }]
      },

      // 流管理
      streams: [],
      streamLoading: false,
      selectedStream: null,
      playDialogVisible: false,
      playForm: {
        channelId: '',
        type: 'live',
        startTime: '',
        endTime: ''
      },
      playRules: {
        channelId: [{ required: true, message: '请输入通道ID', trigger: 'blur' }]
      },
      urlsDialogVisible: false,
      playUrls: {},

      // 录像管理
      records: [],
      recordLoading: false,
      recordQuery: {
        channelId: '',
        startTime: '',
        endTime: ''
      }
    }
  },
  async mounted() {
    await this.loadGB28181Config()
    await this.refreshAll()
  },
  methods: {
    // ==================== 全局方法 ====================
    async refreshAll() {
      this.globalLoading = true
      try {
        await Promise.all([
          this.loadDevices(),
          this.loadStreams(),
          this.updateStats()
        ])
      } catch (error) {
        console.error('刷新数据失败:', error)
      } finally {
        this.globalLoading = false
      }
    },

    async updateStats() {
      try {
        const [devicesRes, streamsRes] = await Promise.all([
          gb28181API.getDevices().catch(() => ({ data: [] })),
          gb28181API.getStreams().catch(() => ({ data: [] }))
        ])

        const deviceList = devicesRes.data?.data?.List || devicesRes.data?.list || devicesRes.data || []
        const streamList = streamsRes.data?.data?.List || streamsRes.data?.list || streamsRes.data || []

        this.stats = {
          devices: Array.isArray(deviceList) ? deviceList.length : 0,
          channels: Array.isArray(this.channels) ? this.channels.length : 0,
          streams: Array.isArray(streamList) ? streamList.length : 0,
          records: Array.isArray(this.records) ? this.records.length : 0
        }
      } catch (error) {
        console.error('更新统计失败:', error)
      }
    },

    // ==================== 设备管理 ====================
    async loadDevices() {
      this.deviceLoading = true
      try {
        const response = await gb28181API.getDevices()
        if (response && response.data) {
          const deviceList = response.data.data?.List || response.data.list || response.data || []
          this.devices = Array.isArray(deviceList) ? deviceList : []
          this.filteredDevices = [...this.devices]
        } else {
          this.devices = []
          this.filteredDevices = []
        }
      } catch (error) {
        console.error('加载设备列表失败:', error)
        ElMessage.error('加载设备列表失败')
        this.devices = []
        this.filteredDevices = []
      } finally {
        this.deviceLoading = false
      }
    },

    handleDeviceSearch(keyword) {
      if (!Array.isArray(this.devices)) {
        this.devices = []
      }

      if (!keyword) {
        this.filteredDevices = [...this.devices]
      } else {
        this.filteredDevices = this.devices.filter(device =>
          (device.name && device.name.toLowerCase().includes(keyword.toLowerCase())) ||
          (device.deviceid && device.deviceid.toLowerCase().includes(keyword.toLowerCase()))
        )
      }
    },

    showDeviceDialog(mode, device = null) {
      this.deviceDialogMode = mode
      if (mode === 'add') {
        this.deviceForm = { pwd: '123456', name: '', deviceid: '' }
      } else {
        this.deviceForm = { ...device }
      }
      this.deviceDialogVisible = true
    },

    updateDeviceDialogVisible(value) {
      this.deviceDialogVisible = value
    },

    async submitDeviceForm() {
      if (!this.$refs.deviceFormRef) return

      try {
        await this.$refs.deviceFormRef.validate()
        this.deviceLoading = true

        const data = {
          pwd: this.deviceForm.pwd,
          name: this.deviceForm.name
        }

        let response
        if (this.deviceDialogMode === 'add') {
          response = await gb28181API.createDevice(data)
        } else {
          response = await gb28181API.updateDevice(this.deviceForm.deviceid, data)
        }

        if (response) {
          ElMessage.success(`设备${this.deviceDialogMode === 'add' ? '创建' : '更新'}成功`)
          this.deviceDialogVisible = false
          await this.loadDevices()
          await this.updateStats()
        }
      } catch (error) {
        console.error('提交设备表单失败:', error)
        ElMessage.error(`设备${this.deviceDialogMode === 'add' ? '创建' : '更新'}失败`)
      } finally {
        this.deviceLoading = false
      }
    },

    async confirmDeleteDevice(device) {
      try {
        await ElMessageBox.confirm(`确定要删除设备 "${device.name || device.deviceid}" 吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.deleteDevice(device.deviceid)
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除设备失败:', error)
        }
      }
    },

    async deleteDevice(deviceId) {
      try {
        const response = await gb28181API.deleteDevice(deviceId)
        if (response) {
          ElMessage.success('设备删除成功')
          await this.loadDevices()
          await this.updateStats()
        }
      } catch (error) {
        console.error('删除设备失败:', error)
        ElMessage.error('删除设备失败')
      }
    },

    // ==================== 通道管理 ====================
    async loadChannelsForDevice() {
      if (!this.selectedDeviceForChannel) return

      this.channelLoading = true
      try {
        const response = await gb28181API.getDeviceChannels(this.selectedDeviceForChannel)
        if (response && response.data) {
          const channelList = response.data.data?.List || response.data.list || response.data || []
          this.channels = Array.isArray(channelList) ? channelList : []
          await this.updateStats()
        } else {
          this.channels = []
        }
      } catch (error) {
        console.error('加载通道列表失败:', error)
        ElMessage.error('加载通道列表失败')
        this.channels = []
      } finally {
        this.channelLoading = false
      }
    },

    showChannelDialog(mode, channel = null) {
      this.channelDialogMode = mode
      if (mode === 'add') {
        this.channelForm = {
          deviceId: this.selectedDeviceForChannel,
          memo: '通道01',
          streamtype: 'push',
          url: ''
        }
      } else {
        this.channelForm = { ...channel, deviceId: channel.deviceid }
      }
      this.channelDialogVisible = true
    },

    updateChannelDialogVisible(value) {
      this.channelDialogVisible = value
    },

    async submitChannelForm() {
      if (!this.$refs.channelFormRef) return

      try {
        await this.$refs.channelFormRef.validate()
        this.channelLoading = true

        const data = {
          memo: this.channelForm.memo,
          streamtype: this.channelForm.streamtype
        }

        if (this.channelForm.streamtype === 'pull' && this.channelForm.url) {
          data.url = this.channelForm.url
        }

        let response
        if (this.channelDialogMode === 'add') {
          response = await gb28181API.createChannel(this.channelForm.deviceId, data)
        } else {
          response = await gb28181API.updateChannel(this.channelForm.channelid, data)
        }

        if (response) {
          ElMessage.success(`通道${this.channelDialogMode === 'add' ? '创建' : '更新'}成功`)
          this.channelDialogVisible = false
          await this.loadChannelsForDevice()
        }
      } catch (error) {
        console.error('提交通道表单失败:', error)
        ElMessage.error(`通道${this.channelDialogMode === 'add' ? '创建' : '更新'}失败`)
      } finally {
        this.channelLoading = false
      }
    },

    async confirmDeleteChannel(channel) {
      try {
        await ElMessageBox.confirm(`确定要删除通道 "${channel.name || channel.channelid}" 吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.deleteChannel(channel.channelid)
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除通道失败:', error)
        }
      }
    },

    async deleteChannel(channelId) {
      try {
        const response = await gb28181API.deleteChannel(channelId)
        if (response) {
          ElMessage.success('通道删除成功')
          await this.loadChannelsForDevice()
        }
      } catch (error) {
        console.error('删除通道失败:', error)
        ElMessage.error('删除通道失败')
      }
    },

    // ==================== 流管理 ====================
    async loadStreams() {
      this.streamLoading = true
      try {
        const response = await gb28181API.getStreams()
        if (response && response.data) {
          const streamList = response.data.data?.List || response.data.list || response.data || []
          this.streams = Array.isArray(streamList) ? streamList : []
          await this.updateStats()
        } else {
          this.streams = []
        }
      } catch (error) {
        console.error('加载流列表失败:', error)
        ElMessage.error('加载流列表失败')
        this.streams = []
      } finally {
        this.streamLoading = false
      }
    },

    handleStreamSelection(selection) {
      this.selectedStream = selection.length > 0 ? selection[0] : null
    },

    showPlayDialog() {
      this.playForm = {
        channelId: '',
        type: 'live',
        startTime: '',
        endTime: ''
      }
      this.playDialogVisible = true
    },

    updatePlayDialogVisible(value) {
      this.playDialogVisible = value
    },

    async startPlay() {
      if (!this.$refs.playFormRef) return

      try {
        await this.$refs.playFormRef.validate()
        this.streamLoading = true

        const data = {}
        if (this.playForm.type === 'playback') {
          if (this.playForm.startTime) data.start_time = this.playForm.startTime
          if (this.playForm.endTime) data.end_time = this.playForm.endTime
        }

        const response = await gb28181API.startPlay(this.playForm.channelId, data)
        if (response) {
          ElMessage.success('播放开始成功')
          this.playDialogVisible = false
          await this.loadStreams()
        }
      } catch (error) {
        console.error('开始播放失败:', error)
        ElMessage.error('开始播放失败')
      } finally {
        this.streamLoading = false
      }
    },

    async stopStream(stream) {
      try {
        const response = await gb28181API.stopPlay(stream.streamid)
        if (response) {
          ElMessage.success('流停止成功')
          await this.loadStreams()
        }
      } catch (error) {
        console.error('停止流失败:', error)
        ElMessage.error('停止流失败')
      }
    },

    async getPlayUrls(stream) {
      try {
        const response = await gb28181API.getPlayUrls(stream.streamid)
        if (response && response.data) {
          this.playUrls = response.data
          this.urlsDialogVisible = true
        }
      } catch (error) {
        console.error('获取播放地址失败:', error)
        ElMessage.error('获取播放地址失败')
      }
    },

    showUrlsDialog() {
      if (this.selectedStream) {
        this.getPlayUrls(this.selectedStream)
      }
    },

    updateUrlsDialogVisible(value) {
      this.urlsDialogVisible = value
    },

    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text)
        ElMessage.success('地址已复制到剪贴板')
      } catch (error) {
        console.error('复制失败:', error)
        ElMessage.error('复制失败')
      }
    },

    // ==================== 录像管理 ====================
    async searchRecords() {
      if (!this.recordQuery.channelId) {
        ElMessage.warning('请输入通道ID')
        return
      }

      this.recordLoading = true
      try {
        const params = {}
        if (this.recordQuery.startTime) params.start_time = this.recordQuery.startTime
        if (this.recordQuery.endTime) params.end_time = this.recordQuery.endTime

        const response = await gb28181API.getRecords(this.recordQuery.channelId, params)
        if (response && response.data) {
          const recordList = response.data.data?.List || response.data.list || response.data || []
          this.records = Array.isArray(recordList) ? recordList : []
          await this.updateStats()
        } else {
          this.records = []
        }
      } catch (error) {
        console.error('查询录像失败:', error)
        ElMessage.error('查询录像失败')
        this.records = []
      } finally {
        this.recordLoading = false
      }
    },

    resetRecordQuery() {
      this.recordQuery = {
        channelId: '',
        startTime: '',
        endTime: ''
      }
      this.records = []
      this.updateStats()
    },

    async playRecord(record) {
      try {
        const data = {
          start_time: record.starttime,
          end_time: record.endtime
        }

        const response = await gb28181API.startPlay(record.channelid, data)
        if (response) {
          ElMessage.success('录像回放开始')
          await this.loadStreams()
        }
      } catch (error) {
        console.error('录像回放失败:', error)
        ElMessage.error('录像回放失败')
      }
    },

    async downloadRecord() {
      ElMessage.info('录像下载功能开发中...')
    },

    // ==================== 基础配置 (保留原有功能) ====================
    async loadGB28181Config() {
      this.configLoading = true
      try {
        const response = await systemAPI.getGB28181Config()
        if (response && response.data) {
          this.configFormData = { ...this.configFormData, ...response.data }
        }
      } catch (error) {
        console.error('加载GB28181配置失败:', error)
      } finally {
        this.configLoading = false
      }
    },

    showConfigDialog() {
      this.configDialogVisible = true
    },

    updateConfigDialogVisible(value) {
      this.configDialogVisible = value
    },

    async saveGB28181Config() {
      if (!this.$refs.configFormRef) return

      try {
        await this.$refs.configFormRef.validate()
        this.configLoading = true

        const response = await systemAPI.setGB28181Config(this.configFormData)
        if (response) {
          ElMessage.success('GB28181配置保存成功')
          this.configDialogVisible = false
        }
      } catch (error) {
        console.error('保存GB28181配置失败:', error)
        ElMessage.error('保存GB28181配置失败')
      } finally {
        this.configLoading = false
      }
    },

    // ==================== 工具方法 ====================
    getStatusType(status) {
      if (!status) return 'info'
      const statusStr = status.toString().toLowerCase()
      if (statusStr === 'on' || statusStr === 'online' || statusStr === 'active') return 'success'
      if (statusStr === 'off' || statusStr === 'offline' || statusStr === 'inactive') return 'danger'
      return 'warning'
    },

    getStatusText(status) {
      if (!status) return '未知'
      const statusStr = status.toString().toLowerCase()
      if (statusStr === 'on' || statusStr === 'online' || statusStr === 'active') return '在线'
      if (statusStr === 'off' || statusStr === 'offline' || statusStr === 'inactive') return '离线'
      return status
    },

    formatTime(time) {
      if (!time) return '-'
      return new Date(time).toLocaleString()
    },

    formatDuration(seconds) {
      if (!seconds) return '-'
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    },

    formatFileSize(bytes) {
      if (!bytes) return '-'
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
      if (bytes === 0) return '0 Bytes'
      const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    },

    // ==================== 原有方法保留（兼容性） ====================
    showAddGB28181Dialog() {
      this.$emit('show-add-gb28181-dialog')
    },
    loadGB28181Platforms() {
      this.$emit('load-gb28181-platforms')
    },
    toggleGB28181Platform(row) {
      this.$emit('toggle-gb28181-platform', row)
    },
    testGB28181Connection(row) {
      this.$emit('test-gb28181-connection', row)
    },
    editGB28181Platform(row) {
      this.$emit('edit-gb28181-platform', row)
    },
    deleteGB28181Platform(row) {
      this.$emit('delete-gb28181-platform', row)
    },
    saveGB28181Platform() {
      this.$emit('save-gb28181-platform')
    },
    getConnectionStatusText(status) {
      return this.$parent?.getConnectionStatusText?.(status) || status
    },
    updateDialogVisible(value) {
      this.$emit('update-dialog-visible', value)
    },
    updatePlatformName(value) {
      this.$emit('update-platform-name', value)
    },
    updatePlatformIp(value) {
      this.$emit('update-platform-ip', value)
    },
    updatePlatformPort(value) {
      this.$emit('update-platform-port', value)
    },
    updateDeviceId(value) {
      this.$emit('update-device-id', value)
    },
    updateUsername(value) {
      this.$emit('update-username', value)
    },
    updatePassword(value) {
      this.$emit('update-password', value)
    },
    updateEnabled(value) {
      this.$emit('update-enabled', value)
    }
  }
}
</script>

<style scoped>
.platform-management {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

/* 总览统计样式 */
.overview-stats {
  padding: 20px 0;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: rgba(20, 30, 50, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(20, 30, 50, 0.8);
  border-color: rgba(0, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 255, 255, 0.15);
}

.stat-icon {
  font-size: 36px;
  margin-right: 15px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.stat-icon.device { background: rgba(76, 175, 80, 0.2); }
.stat-icon.channel { background: rgba(33, 150, 243, 0.2); }
.stat-icon.stream { background: rgba(255, 152, 0, 0.2); }
.stat-icon.record { background: rgba(156, 39, 176, 0.2); }

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: rgba(0, 255, 255, 0.9);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
  margin-bottom: 5px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

/* 管理区域样式 */
.management-section {
  margin-bottom: 20px;
}

.management-section:last-child {
  margin-bottom: 0;
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

/* 工具栏样式 */
.operation-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(20, 30, 50, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.toolbar-left {
  display: flex;
  gap: 10px;
}

.toolbar-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 搜索工具栏 */
.search-toolbar {
  margin-bottom: 20px;
  padding: 20px;
  background: rgba(20, 30, 50, 0.4);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.search-form {
  margin: 0;
}

/* 代码样式 */
code.device-id,
code.channel-id,
code.stream-id,
code.record-id {
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

/* 播放地址对话框 */
.urls-content {
  max-height: 400px;
  overflow-y: auto;
}

.url-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 管理区域卡片样式 */
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

/* 科技感卡片样式继承 */
.config-card.tech-card {
  position: relative;
  z-index: 10;
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  margin-bottom: 20px;
  height: auto !important;
  min-height: auto !important;
  max-height: none !important;
}

.config-card.tech-card :deep(.el-card__header) {
  background: rgba(20, 30, 50, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
  padding: 16px 20px !important;
  color: #ffffff !important;
}

.config-card.tech-card :deep(.el-card__header .card-header) {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin: 0 !important;
  width: 100% !important;
}

.config-card.tech-card :deep(.el-card__body) {
  background: rgba(15, 25, 45, 0.95) !important;
  padding: 20px !important;
  border-radius: 0 0 12px 12px !important;
}

.card-header span {
  color: #00ffff;
  font-weight: 600;
  font-size: 16px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
  letter-spacing: 1px;
}

/* 按钮样式 */
.tech-button-sm {
  text-shadow: 0 0 4px rgba(0, 255, 255, 0.3) !important;
  font-weight: 500 !important;
}

/* 表格样式 */
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

.tech-table :deep(.el-table) {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
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

/* 响应式处理 */
@media (max-width: 768px) {
  .overview-stats {
    padding: 15px 0;
  }

  .stat-card {
    padding: 15px;
    margin-bottom: 15px;
  }

  .stat-icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }

  .stat-number {
    font-size: 20px;
  }

  .operation-toolbar {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    flex-wrap: wrap;
    justify-content: center;
  }
}

.mb-20 {
  margin-bottom: 20px;
}
</style>