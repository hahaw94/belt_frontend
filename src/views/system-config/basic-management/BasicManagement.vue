<template>
  <div class="basic-management-container sub-page-content">
    <h2>基础管理</h2>

    <!-- NTP时间设置 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>NTP时间设置</span>
          <el-button type="primary" :icon="Refresh" size="small" @click="loadNTPConfig" :loading="ntpLoading">刷新配置</el-button>
        </div>
      </template>
      <el-form :model="ntpConfig" :rules="ntpRules" ref="ntpFormRef" label-width="150px" class="config-form" v-loading="ntpLoading">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工作模式" prop="mode">
              <el-radio-group v-model="ntpConfig.mode">
                <el-radio label="ntp_client">NTP客户端</el-radio>
                <el-radio label="ntp_server">NTP服务器</el-radio>
                <el-radio label="manual">手动设置</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时区设置" prop="timezone">
              <el-select v-model="ntpConfig.timezone" placeholder="请选择时区" style="width: 100%">
                <el-option label="Asia/Shanghai" value="Asia/Shanghai"></el-option>
                <el-option label="Asia/Beijing" value="Asia/Beijing"></el-option>
                <el-option label="UTC" value="UTC"></el-option>
                <el-option label="America/New_York" value="America/New_York"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="ntpConfig.mode === 'ntp_client'">
          <el-col :span="12">
            <el-form-item label="NTP服务器" prop="server">
              <el-input v-model="ntpConfig.server" placeholder="请输入NTP服务器地址"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <el-button type="primary" @click="syncNTP" :loading="syncLoading">立即同步</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="ntpConfig.mode === 'manual'">
          <el-col :span="12">
            <el-form-item label="手动时间" prop="manual_time">
              <el-date-picker
                v-model="manualTime"
                type="datetime"
                placeholder="选择日期时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <el-button type="primary" @click="setManualTime" :loading="setTimeLoading">设置时间</el-button>
              <el-button @click="syncPCTime">同步PC时间</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="当前状态">
              <el-tag :type="ntpConfig.status === 'synced' ? 'success' : 'warning'">
                {{ ntpConfig.status === 'synced' ? '已同步' : '未同步' }}
              </el-tag>
              <span style="margin-left: 10px;">当前时间：{{ currentTime }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
        <el-form-item>
              <el-button type="primary" @click="saveNTPConfig" :loading="ntpLoading">保存配置</el-button>
              <el-button @click="resetNTPForm">重置</el-button>
        </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>


    <!-- IP地址设置 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>IP地址设置</span>
          <el-button type="primary" :icon="Refresh" size="small" @click="loadNetworkConfig" :loading="networkLoading">刷新配置</el-button>
        </div>
      </template>
      <el-form :model="networkConfig" :rules="networkRules" ref="networkFormRef" label-width="150px" class="config-form" v-loading="networkLoading">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="IP地址" prop="ip_address">
              <el-input v-model="networkConfig.ip_address" placeholder="请输入IP地址"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="子网掩码" prop="subnet_mask">
              <el-input v-model="networkConfig.subnet_mask" placeholder="请输入子网掩码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="网关" prop="gateway">
              <el-input v-model="networkConfig.gateway" placeholder="请输入网关地址"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-alert
              title="警告：修改IP地址将导致系统重启，您需要使用新IP地址重新访问系统并重新登录"
              type="warning"
              show-icon
              :closable="false"
            />
          </el-col>
        </el-row>
        <el-row style="margin-top: 20px;">
          <el-col :span="24">
            <el-form-item>
              <el-button type="danger" @click="showIPChangeDialog" :loading="networkLoading">修改IP地址</el-button>
              <el-button @click="resetNetworkForm">重置</el-button>
          </el-form-item>
          </el-col>
        </el-row>
        </el-form>
    </el-card>

    <!-- LOGO替换功能 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>LOGO替换</span>
          <el-button type="primary" :icon="Refresh" size="small" @click="loadCurrentLogo" :loading="logoLoading">刷新</el-button>
        </div>
      </template>
      <div v-loading="logoLoading">
          <el-row :gutter="20">
            <el-col :span="12">
            <div class="logo-preview">
              <h4>当前LOGO预览</h4>
              <div class="preview-container">
                <img v-if="currentLogo.url" :src="currentLogo.url" alt="当前LOGO" class="logo-image"/>
                <div v-else class="no-logo">暂无自定义LOGO</div>
              </div>
            </div>
            </el-col>
            <el-col :span="12">
            <div class="logo-upload">
              <h4>上传新LOGO</h4>
              <el-upload
                ref="logoUploadRef"
                :auto-upload="false"
                :show-file-list="false"
                accept=".jpg,.jpeg,.png"
                :before-upload="beforeLogoUpload"
                :on-change="handleLogoChange"
              >
                <el-button type="primary" :icon="Upload">选择文件</el-button>
              </el-upload>
              <div v-if="logoPreview" class="upload-preview">
                <img :src="logoPreview" alt="预览" class="logo-image"/>
                <div class="upload-actions">
                  <el-button type="primary" @click="uploadLogo" :loading="uploading" size="small">上传</el-button>
                  <el-button @click="clearLogoPreview" size="small">取消</el-button>
                </div>
              </div>
              <div class="upload-tips">
                <p>支持格式：JPG、PNG</p>
                <p>文件大小：不超过2MB</p>
              </div>
            </div>
            </el-col>
          </el-row>
        <el-row v-if="currentLogo.url">
          <el-col :span="24">
            <el-button type="danger" @click="deleteLogo" :loading="logoLoading">恢复默认LOGO</el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- GB28181平台对接 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>GB28181平台对接</span>
          <el-button type="primary" :icon="Refresh" size="small" @click="loadGB28181Config" :loading="gb28181Loading">刷新配置</el-button>
        </div>
      </template>
      <el-form :model="gb28181Config" :rules="gb28181Rules" ref="gb28181FormRef" label-width="150px" class="config-form" v-loading="gb28181Loading">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="平台名称" prop="platform_name">
              <el-input v-model="gb28181Config.platform_name" placeholder="请输入平台名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平台IP" prop="platform_ip">
              <el-input v-model="gb28181Config.platform_ip" placeholder="请输入平台IP地址"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="平台端口" prop="platform_port">
              <el-input-number v-model="gb28181Config.platform_port" :min="1000" :max="65535" controls-position="right" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备编码" prop="device_id">
              <el-input v-model="gb28181Config.device_id" placeholder="请输入设备编码"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="gb28181Config.username" placeholder="请输入用户名"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="gb28181Config.password" type="password" placeholder="请输入密码" show-password></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="启用状态">
              <el-switch v-model="gb28181Config.enabled" />
              <span style="margin-left: 10px; color: #909399;">启用后系统将尝试连接到GB28181平台</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item>
              <el-button type="primary" @click="saveGB28181Config" :loading="gb28181Loading">保存配置</el-button>
              <el-button @click="testGB28181Connection" :loading="testingConnection">测试连接</el-button>
              <el-button @click="resetGB28181Form">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 存储策略配置 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>存储策略配置</span>
        </div>
      </template>
      <el-tabs v-model="activeStorageTab">
        <el-tab-pane label="录像存储策略" name="video">
          <el-form :model="videoStorageConfig" :rules="videoStorageRules" ref="videoStorageFormRef" label-width="150px" v-loading="storageLoading">
        <el-row :gutter="20">
          <el-col :span="12">
                <el-form-item label="保存天数" prop="retention_days">
                  <el-input-number v-model="videoStorageConfig.retention_days" :min="1" :max="3650" controls-position="right" style="width: 100%">
                    <template #append>天</template>
                  </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
                <el-form-item label="最大存储容量" prop="max_storage_gb">
                  <el-input-number v-model="videoStorageConfig.max_storage_gb" :min="1" :max="100000" controls-position="right" style="width: 100%">
                    <template #append>GB</template>
                  </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="循环覆盖">
                  <el-switch v-model="videoStorageConfig.cyclic_overwrite" />
                  <span style="margin-left: 10px; color: #909399;">启用后，存储空间不足时将自动删除最早的录像文件</span>
        </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
        <el-form-item>
                  <el-button type="primary" @click="saveVideoStorageConfig" :loading="storageLoading">保存配置</el-button>
                  <el-button @click="loadVideoStorageConfig">重置</el-button>
        </el-form-item>
              </el-col>
            </el-row>
      </el-form>
        </el-tab-pane>
        <el-tab-pane label="告警数据存储策略" name="alarm">
          <el-form :model="alarmDataConfig" :rules="alarmDataRules" ref="alarmDataFormRef" label-width="150px" v-loading="storageLoading">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="保存天数" prop="retention_days">
                  <el-input-number v-model="alarmDataConfig.retention_days" :min="1" :max="3650" controls-position="right" style="width: 100%">
                    <template #append>天</template>
                  </el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="最大记录数" prop="max_records">
                  <el-input-number v-model="alarmDataConfig.max_records" :min="1000" :max="10000000" controls-position="right" style="width: 100%">
                    <template #append>条</template>
                  </el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="循环清理">
                  <el-switch v-model="alarmDataConfig.cyclic_cleanup" />
                  <span style="margin-left: 10px; color: #909399;">启用后，达到最大记录数时将自动删除最早的告警数据</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item>
                  <el-button type="primary" @click="saveAlarmDataConfig" :loading="storageLoading">保存配置</el-button>
                  <el-button @click="loadAlarmDataConfig">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 系统维护 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>系统维护</span>
          <el-button type="primary" :icon="Refresh" size="small" @click="loadSnapshotList" :loading="maintenanceLoading">刷新列表</el-button>
        </div>
      </template>
      <div v-loading="maintenanceLoading">
        <!-- 镜像点管理 -->
        <el-row class="maintenance-section">
          <el-col :span="24">
            <h4>系统镜像点管理</h4>
            <div class="maintenance-actions mb-20">
              <el-button type="primary" @click="showCreateSnapshotDialog" :loading="creatingSnapshot">
                <el-icon><Camera /></el-icon>
                创建镜像点
              </el-button>
              <el-text class="ml-10" type="info">镜像点用于备份当前系统状态，包括配置文件和数据库</el-text>
            </div>
            
            <!-- 镜像点列表 -->
            <el-table :data="snapshotList" border style="width: 100%" empty-text="暂无镜像点">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="镜像点名称" min-width="150" />
              <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
              <el-table-column prop="file_size" label="文件大小" width="120">
                <template #default="scope">
                  {{ formatFileSize(scope.row.file_size) }}
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="创建时间" width="180">
                <template #default="scope">
                  {{ formatDateTime(scope.row.created_at) }}
                </template>
              </el-table-column>
              <el-table-column prop="created_by" label="创建者" width="120" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getSnapshotStatusType(scope.row.status)">
                    {{ getSnapshotStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" fixed="right">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="restoreSnapshot(scope.row.id)" :loading="restoringSnapshot">
                    恢复
                  </el-button>
                  <el-button type="danger" size="small" @click="confirmDeleteSnapshot(scope.row)" :loading="deletingSnapshot">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
        
        <el-divider />
        
        <!-- 系统重启管理 -->
        <el-row class="maintenance-section">
          <el-col :span="24">
            <h4>系统重启管理</h4>
            <div class="restart-actions">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-card shadow="hover" class="restart-card">
                    <div class="restart-item">
                      <div class="restart-icon">
                        <el-icon size="24" color="#409EFF"><Refresh /></el-icon>
                      </div>
                      <div class="restart-content">
                        <h5>服务重启</h5>
                        <p>重启应用服务，保持服务器运行</p>
                        <el-button type="primary" @click="confirmRestartService" :loading="restartingService">
                          重启服务
                        </el-button>
                      </div>
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="12">
                  <el-card shadow="hover" class="restart-card">
                    <div class="restart-item">
                      <div class="restart-icon">
                        <el-icon size="24" color="#F56C6C"><PowerOff /></el-icon>
                      </div>
                      <div class="restart-content">
                        <h5>服务器重启</h5>
                        <p>重启整个服务器系统</p>
                        <el-button type="danger" @click="confirmRebootServer" :loading="rebootingServer">
                          重启服务器
                        </el-button>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 创建镜像点对话框 -->
    <el-dialog
      v-model="createSnapshotDialogVisible"
      title="创建系统镜像点"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="snapshotForm" :rules="snapshotRules" ref="snapshotFormRef" label-width="100px">
        <el-form-item label="镜像点名称" prop="name">
          <el-input v-model="snapshotForm.name" placeholder="请输入镜像点名称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="snapshotForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息（可选）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-alert
          title="提示：创建镜像点将备份当前系统的配置文件和数据库，请确保系统处于稳定状态"
          type="info"
          show-icon
          :closable="false"
        />
      </el-form>
      <template #footer>
        <el-button @click="createSnapshotDialogVisible = false" :disabled="creatingSnapshot">取消</el-button>
        <el-button type="primary" @click="createSnapshot" :loading="creatingSnapshot">创建镜像点</el-button>
      </template>
    </el-dialog>



    <!-- 重启确认对话框 -->
    <el-dialog
      v-model="restartConfirmDialogVisible"
      :title="restartDialogTitle"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div>
        <el-alert
          :title="restartWarningMessage"
          type="warning"
          show-icon
          :closable="false"
        />
        <div style="margin: 20px 0;">
          <p>{{ restartDetailMessage }}</p>
        </div>
        <el-checkbox v-model="restartConfirm">我确认执行此操作</el-checkbox>
      </div>
      <template #footer>
        <el-button @click="restartConfirmDialogVisible = false" :disabled="performingRestart">取消</el-button>
        <el-button 
          :type="restartType === 'service' ? 'primary' : 'danger'" 
          @click="performRestart" 
          :loading="performingRestart" 
          :disabled="!restartConfirm"
        >
          确认{{ restartType === 'service' ? '重启服务' : '重启服务器' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 进度对话框（重启/恢复通用） -->
    <el-dialog
      v-model="restartProgressDialogVisible"
      :title="restartProgressTitle"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="restartProgress === 100 && restartProgressTitle === '镜像点恢复'"
    >
      <div class="progress-content">
        <el-progress :percentage="restartProgress" :status="restartProgressStatus" />
        <p style="margin-top: 15px; text-align: center;">{{ restartProgressMessage }}</p>
        
        <!-- 服务重启完成后的倒计时 -->
        <div v-if="restartProgress === 100 && restartType === 'service'" style="text-align: center; margin-top: 20px;">
          <p>服务重启完成，页面将在 <strong>{{ serviceRestartCountdown }}</strong> 秒后自动刷新</p>
          <el-button type="primary" @click="refreshPage">立即刷新</el-button>
        </div>
        
        <!-- 镜像点恢复完成后的提示 -->
        <div v-if="restartProgress === 100 && restartProgressTitle === '镜像点恢复'" style="text-align: center; margin-top: 20px;">
          <el-icon size="24" color="#67C23A" style="margin-bottom: 8px;"><SuccessFilled /></el-icon>
          <p style="color: #67C23A; font-weight: 500; margin: 8px 0;">恢复完成！系统数据已回滚到镜像点状态</p>
          <p style="color: #909399; font-size: 13px;">对话框将在 3 秒后自动关闭</p>
        </div>
      </div>
    </el-dialog>

    <!-- IP修改确认对话框 -->
    <el-dialog
      v-model="ipChangeDialogVisible"
      title="确认修改IP地址"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div>
        <el-alert
          title="警告：此操作将立即生效并重启系统服务"
          type="warning"
          show-icon
          :closable="false"
        />
        <div style="margin: 20px 0;">
          <p><strong>当前IP：</strong>{{ currentNetworkConfig.ip_address }}</p>
          <p><strong>新IP：</strong>{{ networkConfig.ip_address }}</p>
          <p><strong>新访问地址：</strong>http://{{ networkConfig.ip_address }}:{{ networkConfig.port || '8080' }}</p>
        </div>
        <el-checkbox v-model="ipChangeConfirm">我已了解风险，确认执行此操作</el-checkbox>
        </div>
      <template #footer>
        <el-button @click="ipChangeDialogVisible = false" :disabled="ipChanging">取消</el-button>
        <el-button type="danger" @click="confirmIPChange" :loading="ipChanging" :disabled="!ipChangeConfirm">确认修改</el-button>
          </template>
    </el-dialog>

    <!-- IP修改进度对话框 -->
    <el-dialog
      v-model="ipChangeProgressVisible"
      title="正在修改IP地址"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="progress-content">
        <el-progress :percentage="ipChangeProgress" :status="ipChangeStatus" />
        <p style="margin-top: 15px; text-align: center;">{{ ipChangeMessage }}</p>
        <div v-if="ipChangeProgress === 100" style="text-align: center; margin-top: 20px;">
          <p>系统将在 <strong>{{ countdown }}</strong> 秒后跳转到新地址</p>
          <el-button type="primary" @click="jumpToNewIP">立即跳转</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 镜像点任务进度弹窗 (实时轮询) -->
    <ProgressModal
      :visible="showSnapshotProgressModal"
      :title="snapshotProgressTitle"
      :progress="snapshotProgress"
      :message="snapshotMessage"
      :is-polling="snapshotPolling"
      :is-completed="snapshotCompleted"
      :is-error="snapshotError"
      :error-message="snapshotErrorMessage"
      :task-data="snapshotTaskData"
      :show-details="true"
      :allow-cancel="false"
      @close="handleSnapshotProgressModalClose"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Upload, Camera, PowerOff, SuccessFilled } from '@element-plus/icons-vue'
import { systemAPI } from '@/api/system'
import { useSystemStore } from '@/stores/system'
import { useTaskProgress } from '@/composables/useTaskProgress'
import { createSystemSnapshot } from '@/api/map'
import ProgressModal from '@/components/ProgressModal.vue'

// ===================== 响应式数据 =====================

// Store
const systemStore = useSystemStore()

// 加载状态
const ntpLoading = ref(false)
const networkLoading = ref(false)
const logoLoading = ref(false)
const storageLoading = ref(false)
const syncLoading = ref(false)
const setTimeLoading = ref(false)
const uploading = ref(false)
const gb28181Loading = ref(false)
const testingConnection = ref(false)


// 系统维护相关加载状态
const maintenanceLoading = ref(false)
const creatingSnapshot = ref(false)
const restoringSnapshot = ref(false)
const deletingSnapshot = ref(false)
const restartingService = ref(false)
const rebootingServer = ref(false)
const performingRestart = ref(false)

// NTP配置
const ntpConfig = reactive({
  mode: 'manual',
  server: '',
  timezone: 'Asia/Shanghai',
  status: 'unknown'
})

// 手动时间设置
const manualTime = ref('')

// 当前时间显示
const currentTime = ref('')
const timeInterval = ref(null)

// 网络配置
const networkConfig = reactive({
  ip_address: '',
  subnet_mask: '',
  gateway: ''
})

const currentNetworkConfig = reactive({
  ip_address: '',
  subnet_mask: '',
  gateway: ''
})

// IP修改相关
const ipChangeDialogVisible = ref(false)
const ipChangeProgressVisible = ref(false)
const ipChangeConfirm = ref(false)
const ipChanging = ref(false)
const ipChangeProgress = ref(0)
const ipChangeStatus = ref('')
const ipChangeMessage = ref('')
const countdown = ref(10)
const countdownInterval = ref(null)

// LOGO相关
const currentLogo = reactive({
  url: '',
  filename: '',
  size: 0
})

const logoPreview = ref('')
const logoUploadRef = ref(null)
const selectedLogoFile = ref(null)

// 存储策略配置
const activeStorageTab = ref('video')

const videoStorageConfig = reactive({
  retention_days: 30,
  max_storage_gb: 1000,
  cyclic_overwrite: true
})

const alarmDataConfig = reactive({
  retention_days: 90,
  max_records: 1000000,
  cyclic_cleanup: true
})

// GB28181配置
const gb28181Config = reactive({
  platform_name: '',
  platform_ip: '',
  platform_port: 5060,
  device_id: '',
  username: '',
  password: '',
  enabled: false
})

// 系统维护相关数据
const snapshotList = ref([])

// 镜像点表单
const snapshotForm = reactive({
  name: '',
  description: ''
})

// 进度轮询Hook
const {
  progress: snapshotProgress,
  message: snapshotMessage,
  isPolling: snapshotPolling,
  isCompleted: snapshotCompleted,
  isError: snapshotError,
  errorMessage: snapshotErrorMessage,
  taskData: snapshotTaskData,
  startPolling: startSnapshotPolling,
  stopPolling: stopSnapshotPolling,
  reset: resetSnapshotProgress
} = useTaskProgress({
  interval: 1000,
  onProgress: (data) => {
    console.log('镜像点任务进度更新:', data)
  },
  onComplete: (data) => {
    console.log('镜像点任务完成:', data)
    ElMessage.success('镜像点任务执行完成！')
    loadSnapshotList()
  },
  onError: (error) => {
    console.error('镜像点任务失败:', error)
    ElMessage.error('镜像点任务执行失败：' + (error.message || '未知错误'))
  }
})

// 镜像点进度弹窗状态
const showSnapshotProgressModal = ref(false)
const snapshotProgressTitle = ref('')

// 对话框显示状态
const createSnapshotDialogVisible = ref(false)
const restartConfirmDialogVisible = ref(false)
const restartProgressDialogVisible = ref(false)

// 确认状态
const restartConfirm = ref(false)

// 重启相关状态
const restartType = ref('') // 'service' | 'server'
const restartDialogTitle = ref('')
const restartWarningMessage = ref('')
const restartDetailMessage = ref('')
const restartProgress = ref(0)
const restartProgressStatus = ref('')
const restartProgressMessage = ref('')
const restartProgressTitle = ref('')
const serviceRestartCountdown = ref(5)

// 表单引用
const ntpFormRef = ref(null)
const networkFormRef = ref(null)
const videoStorageFormRef = ref(null)
const alarmDataFormRef = ref(null)
const gb28181FormRef = ref(null)
const snapshotFormRef = ref(null)

// ===================== 验证规则 =====================

const ntpRules = {
  server: [
    { required: true, message: '请输入NTP服务器地址', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9.-]+$/, message: '请输入有效的服务器地址', trigger: 'blur' }
  ],
  timezone: [
    { required: true, message: '请选择时区', trigger: 'change' }
  ]
}

const networkRules = {
  ip_address: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    { pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, message: '请输入有效的IP地址', trigger: 'blur' }
  ],
  subnet_mask: [
    { required: true, message: '请输入子网掩码', trigger: 'blur' },
    { pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, message: '请输入有效的子网掩码', trigger: 'blur' }
  ],
  gateway: [
    { required: true, message: '请输入网关地址', trigger: 'blur' },
    { pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, message: '请输入有效的网关地址', trigger: 'blur' }
  ]
}

const videoStorageRules = {
  retention_days: [
    { required: true, message: '请输入保存天数', trigger: 'blur' },
    { type: 'number', min: 1, max: 3650, message: '保存天数必须在1-3650天之间', trigger: 'blur' }
  ],
  max_storage_gb: [
    { required: true, message: '请输入最大存储容量', trigger: 'blur' },
    { type: 'number', min: 1, max: 100000, message: '存储容量必须在1-100000GB之间', trigger: 'blur' }
  ]
}

const alarmDataRules = {
  retention_days: [
    { required: true, message: '请输入保存天数', trigger: 'blur' },
    { type: 'number', min: 1, max: 3650, message: '保存天数必须在1-3650天之间', trigger: 'blur' }
  ],
  max_records: [
    { required: true, message: '请输入最大记录数', trigger: 'blur' },
    { type: 'number', min: 1000, max: 10000000, message: '记录数必须在1000-10000000条之间', trigger: 'blur' }
  ]
}

const gb28181Rules = {
  platform_name: [
    { required: true, message: '请输入平台名称', trigger: 'blur' }
  ],
  platform_ip: [
    { required: true, message: '请输入平台IP地址', trigger: 'blur' },
    { pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, message: '请输入有效的IP地址', trigger: 'blur' }
  ],
  platform_port: [
    { required: true, message: '请输入平台端口', trigger: 'blur' },
    { type: 'number', min: 1000, max: 65535, message: '端口范围1000-65535', trigger: 'blur' }
  ],
  device_id: [
    { required: true, message: '请输入设备编码', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const snapshotRules = {
  name: [
    { required: true, message: '请输入镜像点名称', trigger: 'blur' },
    { min: 2, max: 100, message: '名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述长度不能超过 500 个字符', trigger: 'blur' }
  ]
}

// ===================== NTP时间设置方法 =====================

// 加载NTP配置
const loadNTPConfig = async () => {
  ntpLoading.value = true
  try {
    const response = await systemAPI.getNTPConfig()
    if (response.code === 200) {
      Object.assign(ntpConfig, response.data)
    }
  } catch (error) {
    console.error('加载NTP配置失败:', error)
    ElMessage.error('加载NTP配置失败')
  } finally {
    ntpLoading.value = false
  }
}

// 保存NTP配置
const saveNTPConfig = async () => {
  if (!ntpFormRef.value) return
  
  try {
    await ntpFormRef.value.validate()
    ntpLoading.value = true
    
    const response = await systemAPI.setNTPConfig(ntpConfig)
    if (response.code === 200) {
      ElMessage.success('NTP配置保存成功')
      await loadNTPConfig()
    }
  } catch (error) {
    console.error('保存NTP配置失败:', error)
    ElMessage.error('保存NTP配置失败')
  } finally {
    ntpLoading.value = false
  }
}

// 立即同步时间
const syncNTP = async () => {
  syncLoading.value = true
  try {
    const response = await systemAPI.syncNTP()
    if (response.code === 200) {
      ElMessage.success('时间同步成功')
      await loadNTPConfig()
    }
  } catch (error) {
    console.error('时间同步失败:', error)
    ElMessage.error('时间同步失败')
  } finally {
    syncLoading.value = false
  }
}

// 设置手动时间
const setManualTime = async () => {
  if (!manualTime.value) {
    ElMessage.error('请选择要设置的时间')
    return
  }
  
  setTimeLoading.value = true
  try {
    const response = await systemAPI.setManualTime({
      time: manualTime.value
    })
    if (response.code === 200) {
      ElMessage.success('时间设置成功')
      await loadNTPConfig()
    }
  } catch (error) {
    console.error('设置时间失败:', error)
    ElMessage.error('设置时间失败')
  } finally {
    setTimeLoading.value = false
  }
}

// 同步PC时间
const syncPCTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  
  manualTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 重置NTP表单
const resetNTPForm = () => {
  if (ntpFormRef.value) {
    ntpFormRef.value.resetFields()
  }
  loadNTPConfig()
}

// ===================== 网络配置方法 =====================

// 加载网络配置
const loadNetworkConfig = async () => {
  networkLoading.value = true
  try {
    const response = await systemAPI.getNetworkConfig()
    if (response.code === 200) {
      Object.assign(networkConfig, response.data)
      Object.assign(currentNetworkConfig, response.data)
    }
  } catch (error) {
    console.error('加载网络配置失败:', error)
    ElMessage.error('加载网络配置失败')
  } finally {
    networkLoading.value = false
  }
}

// 显示IP修改确认对话框
const showIPChangeDialog = async () => {
  if (!networkFormRef.value) return
  
  try {
    await networkFormRef.value.validate()
    ipChangeDialogVisible.value = true
    ipChangeConfirm.value = false
  } catch (error) {
    ElMessage.error('请填写正确的网络配置信息')
  }
}

// 确认修改IP地址
const confirmIPChange = async () => {
  ipChanging.value = true
  ipChangeDialogVisible.value = false
  ipChangeProgressVisible.value = true
  ipChangeProgress.value = 0
  ipChangeStatus.value = ''
  ipChangeMessage.value = '正在修改网络配置...'
  
  try {
    // 模拟进度更新
    const progressTimer = setInterval(() => {
      if (ipChangeProgress.value < 90) {
        ipChangeProgress.value += 10
      }
    }, 500)
    
    const response = await systemAPI.setNetworkConfig(networkConfig)
    
    clearInterval(progressTimer)
    
    if (response.code === 200) {
      ipChangeProgress.value = 100
      ipChangeStatus.value = 'success'
      ipChangeMessage.value = '网络配置修改成功，正在重启服务...'
      
      // 开始倒计时并跳转
      startCountdown(response.data.new_url)
    }
  } catch (error) {
    console.error('修改网络配置失败:', error)
    ipChangeStatus.value = 'exception'
    ipChangeMessage.value = '网络配置修改失败'
    ElMessage.error('网络配置修改失败')
  } finally {
    ipChanging.value = false
  }
}

// 开始倒计时并跳转
const startCountdown = (newUrl) => {
  countdown.value = 10
  countdownInterval.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval.value)
      jumpToNewIP(newUrl)
    }
  }, 1000)
}

// 跳转到新IP地址
const jumpToNewIP = (url) => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }
  
  const newUrl = url || `http://${networkConfig.ip_address}:8080`
  window.location.href = newUrl
}

// 重置网络表单
const resetNetworkForm = () => {
  if (networkFormRef.value) {
    networkFormRef.value.resetFields()
  }
  Object.assign(networkConfig, currentNetworkConfig)
}

// ===================== LOGO管理方法 =====================

// 加载当前LOGO
const loadCurrentLogo = async () => {
  logoLoading.value = true
  try {
    const response = await systemAPI.getCurrentLogo()
    if (response.code === 200) {
      Object.assign(currentLogo, response.data)
    }
  } catch (error) {
    console.error('加载当前LOGO失败:', error)
    ElMessage.error('加载当前LOGO失败')
  } finally {
    logoLoading.value = false
  }
}

// LOGO上传前验证
const beforeLogoUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('LOGO只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('LOGO大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理LOGO文件选择
const handleLogoChange = (file) => {
  selectedLogoFile.value = file.raw
  
  // 创建预览
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 上传LOGO
const uploadLogo = async () => {
  if (!selectedLogoFile.value) {
    ElMessage.error('请先选择LOGO文件')
    return
  }
  
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('logo', selectedLogoFile.value)
    
    const response = await systemAPI.uploadLogo(formData)
    if (response.code === 200) {
      ElMessage.success('LOGO上传成功')
      clearLogoPreview()
      await loadCurrentLogo()
      // 更新全局store状态（包含favicon更新）
      await systemStore.updateLogoConfig(response.data)
    }
  } catch (error) {
    console.error('LOGO上传失败:', error)
    ElMessage.error('LOGO上传失败')
  } finally {
    uploading.value = false
  }
}

// 清除LOGO预览
const clearLogoPreview = () => {
  logoPreview.value = ''
  selectedLogoFile.value = null
  if (logoUploadRef.value) {
    logoUploadRef.value.clearFiles()
  }
}

// 删除LOGO
const deleteLogo = async () => {
  try {
    await ElMessageBox.confirm('确定要删除当前LOGO并恢复默认LOGO吗？', '确认删除', {
        type: 'warning'
    })
    
    logoLoading.value = true
    const response = await systemAPI.deleteLogo()
    if (response.code === 200) {
      ElMessage.success('LOGO已删除，恢复默认LOGO')
      await loadCurrentLogo()
      // 重置全局store状态（包含favicon重置）
      await systemStore.resetLogoConfig()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除LOGO失败:', error)
      ElMessage.error('删除LOGO失败')
    }
  } finally {
    logoLoading.value = false
  }
}

// ===================== 存储策略配置方法 =====================

// 加载录像存储配置
const loadVideoStorageConfig = async () => {
  storageLoading.value = true
  try {
    const response = await systemAPI.getVideoStorageConfig()
    if (response.code === 200) {
      Object.assign(videoStorageConfig, response.data)
    }
  } catch (error) {
    console.error('加载录像存储配置失败:', error)
    ElMessage.error('加载录像存储配置失败')
  } finally {
    storageLoading.value = false
  }
}

// 保存录像存储配置
const saveVideoStorageConfig = async () => {
  if (!videoStorageFormRef.value) return
  
  try {
    await videoStorageFormRef.value.validate()
    storageLoading.value = true
    
    const response = await systemAPI.setVideoStorageConfig(videoStorageConfig)
    if (response.code === 200) {
      ElMessage.success('录像存储配置保存成功')
    }
  } catch (error) {
    console.error('保存录像存储配置失败:', error)
    ElMessage.error('保存录像存储配置失败')
  } finally {
    storageLoading.value = false
  }
}

// 加载告警数据配置
const loadAlarmDataConfig = async () => {
  storageLoading.value = true
  try {
    const response = await systemAPI.getAlarmDataConfig()
    if (response.code === 200) {
      Object.assign(alarmDataConfig, response.data)
    }
  } catch (error) {
    console.error('加载告警数据配置失败:', error)
    ElMessage.error('加载告警数据配置失败')
  } finally {
    storageLoading.value = false
  }
}

// 保存告警数据配置
const saveAlarmDataConfig = async () => {
  if (!alarmDataFormRef.value) return
  
  try {
    await alarmDataFormRef.value.validate()
    storageLoading.value = true
    
    const response = await systemAPI.setAlarmDataConfig(alarmDataConfig)
    if (response.code === 200) {
      ElMessage.success('告警数据配置保存成功')
    }
  } catch (error) {
    console.error('保存告警数据配置失败:', error)
    ElMessage.error('保存告警数据配置失败')
  } finally {
    storageLoading.value = false
  }
}

// ===================== GB28181配置方法 =====================

// 加载GB28181配置
const loadGB28181Config = async () => {
  gb28181Loading.value = true
  try {
    const response = await systemAPI.getGB28181Config()
    if (response.code === 200) {
      Object.assign(gb28181Config, response.data)
    }
  } catch (error) {
    console.error('加载GB28181配置失败:', error)
    ElMessage.error('加载GB28181配置失败')
  } finally {
    gb28181Loading.value = false
  }
}

// 保存GB28181配置
const saveGB28181Config = async () => {
  if (!gb28181FormRef.value) return
  
  try {
    await gb28181FormRef.value.validate()
    gb28181Loading.value = true
    
    const response = await systemAPI.setGB28181Config(gb28181Config)
    if (response.code === 200) {
      ElMessage.success('GB28181配置保存成功')
    }
  } catch (error) {
    console.error('保存GB28181配置失败:', error)
    ElMessage.error('保存GB28181配置失败')
  } finally {
    gb28181Loading.value = false
  }
}

// 测试GB28181连接 (后端暂未实现)
const testGB28181Connection = async () => {
  if (!gb28181FormRef.value) return
  
  try {
    await gb28181FormRef.value.validate()
    testingConnection.value = true
    
    // 模拟测试功能，后端实现后需要替换为真实API调用
    setTimeout(() => {
      ElMessage.info('GB28181连接测试功能待后端实现')
      testingConnection.value = false
    }, 1000)
    
    // const response = await systemAPI.testGB28181Connection(gb28181Config)
    // if (response.code === 200) {
    //   ElMessage.success('GB28181连接测试成功')
    // }
  } catch (error) {
    console.error('GB28181连接测试失败:', error)
    ElMessage.error('表单验证失败')
    testingConnection.value = false
  }
}

// 重置GB28181表单
const resetGB28181Form = () => {
  if (gb28181FormRef.value) {
    gb28181FormRef.value.resetFields()
  }
  loadGB28181Config()
}

// ===================== 系统维护方法 =====================

// 加载镜像点列表
const loadSnapshotList = async () => {
  maintenanceLoading.value = true
  try {
    const response = await systemAPI.getSnapshots()
    if (response.code === 200) {
      snapshotList.value = response.data.snapshots || []
    }
  } catch (error) {
    console.error('加载镜像点列表失败:', error)
    ElMessage.error('加载镜像点列表失败')
  } finally {
    maintenanceLoading.value = false
  }
}

// 显示创建镜像点对话框
const showCreateSnapshotDialog = () => {
  // 重置表单
  snapshotForm.name = ''
  snapshotForm.description = ''
  
  // 生成默认名称
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_')
  snapshotForm.name = `镜像点_${timestamp}`
  
  createSnapshotDialogVisible.value = true
}

// 创建镜像点
const createSnapshot = async () => {
  if (!snapshotFormRef.value) return
  
  try {
    await snapshotFormRef.value.validate()
    creatingSnapshot.value = true
    createSnapshotDialogVisible.value = false
    
    // 设置进度弹窗
    snapshotProgressTitle.value = '创建系统镜像点'
    resetSnapshotProgress()
    showSnapshotProgressModal.value = true
    
    console.log('正在创建镜像点，参数:', snapshotForm)
    
    // 调用新的镜像点API（返回任务ID）
    const response = await createSystemSnapshot({
      name: snapshotForm.name,
      description: snapshotForm.description
    })
    
    console.log('镜像点任务响应:', response)
    
    if (response.data && response.data.task_id) {
      // 开始轮询任务进度
      await startSnapshotPolling(response.data.task_id)
    } else {
      throw new Error('未获取到任务ID')
    }
  } catch (error) {
    console.error('创建镜像点失败:', error)
    ElMessage.error('创建镜像点失败：' + error.message)
    showSnapshotProgressModal.value = false
  } finally {
    creatingSnapshot.value = false
  }
}



// 恢复镜像点
const restoreSnapshot = async (snapshotId) => {
  if (!snapshotId) return
  
  const id = snapshotId
  
  try {
    await ElMessageBox.confirm(
      '确定要恢复到此镜像点吗？此操作将覆盖当前系统配置和数据！',
      '确认恢复',
      {
        type: 'warning',
        confirmButtonText: '确认恢复',
        cancelButtonText: '取消'
      }
    )
    
    restoringSnapshot.value = true
    
    // 设置进度弹窗
    snapshotProgressTitle.value = '恢复系统镜像点'
    resetSnapshotProgress()
    showSnapshotProgressModal.value = true
    
    console.log('正在恢复镜像点，ID:', id, '类型:', typeof id)
    
    // 确保ID是数字类型
    const numericId = parseInt(id)
    if (isNaN(numericId)) {
      throw new Error('无效的镜像点ID')
    }
    
    // 调用系统API恢复镜像点
    const response = await systemAPI.restoreSnapshot(numericId)
    
    console.log('恢复任务响应:', response)
    
    if (response.data && response.data.task_id) {
      // 开始轮询任务进度
      await startSnapshotPolling(response.data.task_id)
      

    } else if (response.code === 200 || response.success) {
      // 如果没有task_id但恢复成功，直接显示成功
      showSnapshotProgressModal.value = false
      ElMessage.success('镜像点恢复成功！')
      loadSnapshotList()
      

    } else {
      throw new Error('恢复镜像点失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('恢复镜像点失败:', error)
      ElMessage.error('恢复镜像点失败：' + error.message)
      showSnapshotProgressModal.value = false
    }
  } finally {
    restoringSnapshot.value = false
  }
}

// 确认删除镜像点
const confirmDeleteSnapshot = async (snapshot) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除镜像点 "${snapshot.name}" 吗？此操作无法撤销。`, 
      '确认删除', 
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消'
      }
    )
    
    await deleteSnapshot(snapshot.id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除确认失败:', error)
    }
  }
}

// 删除镜像点
const deleteSnapshot = async (snapshotId) => {
  deletingSnapshot.value = true
  try {
    const response = await systemAPI.deleteSnapshot(snapshotId)
    if (response.code === 200) {
      ElMessage.success('镜像点删除成功')
      await loadSnapshotList()
    }
  } catch (error) {
    console.error('删除镜像点失败:', error)
    ElMessage.error('删除镜像点失败: ' + (error.response?.data?.message || error.message))
  } finally {
    deletingSnapshot.value = false
  }
}

// 确认重启服务
const confirmRestartService = () => {
  restartType.value = 'service'
  restartDialogTitle.value = '确认重启服务'
  restartWarningMessage.value = '警告：此操作将重启应用服务'
  restartDetailMessage.value = '服务重启将中断正在进行的操作，大约需要10-30秒完成。'
  restartConfirm.value = false
  restartConfirmDialogVisible.value = true
}

// 确认重启服务器
const confirmRebootServer = () => {
  restartType.value = 'server'
  restartDialogTitle.value = '确认重启服务器'
  restartWarningMessage.value = '警告：此操作将重启整个服务器'
  restartDetailMessage.value = '服务器重启将中断所有服务，大约需要1-3分钟完成。请确保保存所有工作。'
  restartConfirm.value = false
  restartConfirmDialogVisible.value = true
}

// 执行重启操作
const performRestart = async () => {
  performingRestart.value = true
  restartConfirmDialogVisible.value = false
  
  try {
    let response
    if (restartType.value === 'service') {
      response = await systemAPI.restartService()
      if (response.code === 200) {
        ElMessage.success('服务重启请求已发送')
        showRestartProgress('服务重启', '服务正在重启...', response.data.delay || 3)
      }
    } else if (restartType.value === 'server') {
      response = await systemAPI.rebootServer()
      if (response.code === 200) {
        ElMessage.success('服务器重启请求已发送')
        showRestartProgress('服务器重启', '服务器正在重启...', response.data.delay || 30)
      }
    }
  } catch (error) {
    console.error('重启操作失败:', error)
    ElMessage.error('重启操作失败: ' + (error.response?.data?.message || error.message))
  } finally {
    performingRestart.value = false
  }
}

// 显示重启进度
const showRestartProgress = (title, message, delaySeconds) => {
  restartProgressTitle.value = title
  restartProgressMessage.value = message
  restartProgress.value = 0
  restartProgressStatus.value = ''
  restartProgressDialogVisible.value = true
  
  // 模拟进度更新
  const progressInterval = setInterval(() => {
    if (restartProgress.value < 90) {
      restartProgress.value += 10
    }
  }, (delaySeconds * 1000) / 10)
  
  // 延迟后完成进度
  setTimeout(() => {
    clearInterval(progressInterval)
    restartProgress.value = 100
    restartProgressStatus.value = 'success'
    restartProgressMessage.value = title + '完成'
    
    if (restartType.value === 'service') {
      // 服务重启完成后开始倒计时刷新页面
      startServiceRestartCountdown()
    } else {
      // 服务器重启完成
      restartProgressMessage.value = '服务器重启完成，请等待系统恢复在线状态'
    }
  }, delaySeconds * 1000)
}



// 开始服务重启倒计时
const startServiceRestartCountdown = () => {
  serviceRestartCountdown.value = 5
  const countdownInterval = setInterval(() => {
    serviceRestartCountdown.value--
    if (serviceRestartCountdown.value <= 0) {
      clearInterval(countdownInterval)
      refreshPage()
    }
  }, 1000)
}

// 刷新页面
const refreshPage = () => {
  window.location.reload()
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-'
  try {
    const date = new Date(dateTimeStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return dateTimeStr
  }
}

// 获取镜像点状态类型
const getSnapshotStatusType = (status) => {
  switch (status) {
    case 1: return 'success'  // 正常
    case 2: return 'danger'   // 损坏
    case 3: return 'info'     // 已删除
    default: return 'warning'
  }
}

// 获取镜像点状态文本
const getSnapshotStatusText = (status) => {
  switch (status) {
    case 1: return '正常'
    case 2: return '损坏'
    case 3: return '已删除'
    default: return '未知'
  }
}

// ===================== 时间相关方法 =====================

// 更新当前时间显示
const updateCurrentTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  
  currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 处理镜像点进度弹窗关闭
const handleSnapshotProgressModalClose = () => {
  showSnapshotProgressModal.value = false
  if (snapshotPolling.value) {
    stopSnapshotPolling()
  }
  resetSnapshotProgress()
}

// ===================== 生命周期钩子 =====================

onMounted(async () => {
  // 开始时间更新
  updateCurrentTime()
  timeInterval.value = setInterval(updateCurrentTime, 1000)
  
  // 加载各模块配置
  await Promise.all([
    loadNTPConfig(),
    loadNetworkConfig(),
    loadCurrentLogo(),
    loadVideoStorageConfig(),
    loadAlarmDataConfig(),
    loadGB28181Config(),
    loadSnapshotList()
  ])
})

onUnmounted(() => {
  // 清理定时器
  if (timeInterval.value) {
    clearInterval(timeInterval.value)
  }
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }
})
</script>

<style scoped>
.basic-management-container {
  padding: 24px;
}

.config-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.config-form {
  padding: 20px 0;
}

.mb-20 {
  margin-bottom: 20px;
}

/* LOGO相关样式 */
.logo-preview h4,
.logo-upload h4 {
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.preview-container {
  width: 100%;
  height: 120px;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.logo-image {
  max-width: 100%;
  max-height: 100px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-logo {
  color: #909399;
  font-size: 14px;
}

.upload-preview {
  margin-top: 16px;
  text-align: center;
}

.upload-actions {
  margin-top: 12px;
}

.upload-actions .el-button {
  margin: 0 4px;
}

.upload-tips {
  margin-top: 12px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.upload-tips p {
  margin: 4px 0;
}

/* 进度对话框样式 */
.progress-content {
  text-align: center;
}

.progress-content p {
  margin: 10px 0;
  color: #606266;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .basic-management-container {
    padding: 16px;
  }
  
  .config-form {
    padding: 16px 0;
  }
}

@media (max-width: 768px) {
  .basic-management-container {
    padding: 12px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .preview-container {
    height: 100px;
  }
  
  .logo-image {
    max-height: 80px;
  }
}

/* 表单项间距优化 */
.el-form-item {
  margin-bottom: 22px;
}

.el-form-item:last-child {
  margin-bottom: 0;
}

/* 标签样式优化 */
.el-tag {
  margin-right: 8px;
}

/* 按钮组样式 */
.el-form-item .el-button + .el-button {
  margin-left: 12px;
}

/* 警告框样式调整 */
.el-alert {
  margin: 16px 0;
}

/* 选项卡内容区域 */
.el-tabs__content {
  padding: 20px 0;
}

/* ===================== 系统维护样式 ===================== */

.maintenance-section {
  margin-bottom: 24px;
}

.maintenance-section h4 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.maintenance-actions {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.ml-10 {
  margin-left: 10px;
}

/* 重启卡片样式 */
.restart-actions {
  margin-top: 16px;
}

.restart-card {
  height: 120px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.restart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.restart-item {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 16px;
}

.restart-icon {
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f5f7fa;
}

.restart-content {
  flex: 1;
}

.restart-content h5 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.restart-content p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

/* 表格样式优化 */
.el-table {
  font-size: 14px;
}

.el-table .el-button {
  margin-right: 8px;
}

.el-table .el-button:last-child {
  margin-right: 0;
}

/* 对话框内容样式 */
.el-dialog__body {
  padding: 20px 24px;
}

.el-dialog .el-form {
  margin-top: 8px;
}

.el-dialog .el-alert {
  margin-top: 16px;
}

/* 进度内容样式 */
.progress-content {
  text-align: center;
  padding: 16px 0;
}

.progress-content .el-progress {
  margin-bottom: 16px;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .restart-actions .el-col {
    margin-bottom: 16px;
  }
  
  .restart-item {
    flex-direction: column;
    text-align: center;
    padding: 20px 16px;
  }
  
  .restart-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .maintenance-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .ml-10 {
    margin-left: 0;
  }
}
</style>