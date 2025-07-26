<template>
  <div class="basic-management-container sub-page-content">
    <h2>基础管理</h2>

    <el-card class="settings-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>硬件设备参数配置</span>
          <el-button type="primary" :icon="Upload" size="small" @click="handleBatchImport">批数据导入</el-button>
        </div>
      </template>
      <el-form :model="deviceSettings" label-width="150px" class="settings-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备连接超时 (s)">
              <el-input-number v-model="deviceSettings.connectionTimeout" :min="5" :max="300"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据上报频率 (s)">
              <el-input-number v-model="deviceSettings.uploadFrequency" :min="1" :max="60"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="视频流质量">
              <el-select v-model="deviceSettings.videoQuality" placeholder="请选择">
                <el-option label="高清" value="HD"></el-option>
                <el-option label="标清" value="SD"></el-option>
                <el-option label="流畅" value="FLUENT"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="日志保留天数">
              <el-input-number v-model="deviceSettings.logRetentionDays" :min="7" :max="365"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="默认存储路径">
          <el-input v-model="deviceSettings.defaultStoragePath" placeholder="请输入存储路径"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Save" @click="saveDeviceSettings">保存设备参数</el-button>
          <el-button :icon="Refresh" @click="resetDeviceSettings">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="platform-sync-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>平台参数与状态同步</span>
          <el-button type="warning" :icon="MagicStick" size="small" @click="handlePlatformSync">一键同步平台 </el-button>
        </div>
      </template>
      <div class="sync-info">
        <p>上次同步时间：<el-tag>{{ lastSyncTime }}</el-tag></p>
        <p>同步状态：<el-tag :type="syncStatus === '成功' ? 'success' : 'info'">{{ syncStatus }}</el-tag></p>
        <p>平台 IP 地址：<el-input v-model="platformIp" placeholder="请输入平台IP" style="width: 200px; margin-left: 10px;" size="small"></el-input></p>
        <el-button :icon="Link" size="small" @click="handleReconnectPlatform" class="mt-10">修改 IP 并重连 </el-button>
      </div>
      <el-divider content-position="left">最近同步日志</el-divider>
      <el-table :data="syncLogs" stripe border style="width: 100%;" :max-height="250">
        <el-table-column prop="time" label="同步时间" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '成功' ? 'success' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="消息"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, Save, Refresh, MagicStick, Link } from '@element-plus/icons-vue';

// ===================== 硬件设备参数配置 =====================
const deviceSettings = reactive({
  connectionTimeout: 60, // 设备连接超时，单位秒
  uploadFrequency: 5,    // 数据上报频率，单位秒
  videoQuality: 'HD',    // 视频流质量
  logRetentionDays: 30,  // 日志保留天数
  defaultStoragePath: '/data/recordings/' // 默认存储路径
});

/**
 * 保存设备参数 ()
 */
const saveDeviceSettings = () => {
  ElMessage.success('设备参数已保存 ()。');
  console.log('保存的设备参数:', deviceSettings);
  // 实际：调用后端 API 保存
  // request.post('/api/settings/device', deviceSettings).then(...)
};

/**
 * 重置设备参数 ()
 */
const resetDeviceSettings = () => {
  ElMessageBox.confirm('确定要重置所有设备参数为默认值吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 重置为初始值
    Object.assign(deviceSettings, {
      connectionTimeout: 60,
      uploadFrequency: 5,
      videoQuality: 'HD',
      logRetentionDays: 30,
      defaultStoragePath: '/data/recordings/'
    });
    ElMessage.success('设备参数已重置。');
  }).catch(() => {
    ElMessage.info('已取消重置。');
  });
};

/**
 * 批数据导入 ()
 */
const handleBatchImport = () => {
  ElMessage.info('正在批数据导入...');
  setTimeout(() => {
    ElMessage.success('批数据导入成功 ()！');
  }, 1500);
  // 实际：触发文件上传组件或调用后端接口
};

// ===================== 平台参数与状态同步 =====================
const lastSyncTime = ref('N/A'); // 上次同步时间
const syncStatus = ref('未同步');  // 同步状态
const platformIp = ref('192.168.1.100'); // 平台IP

// 同步日志数据
const syncLogs = ref([]);

/**
 * 一键同步平台 ()
 */
const handlePlatformSync = () => {
  syncStatus.value = '同步中...';
  ElMessage.info('正在执行平台参数同步 ()...');
  setTimeout(() => {
    lastSyncTime.value = new Date().toLocaleString('zh-CN');
    syncStatus.value = '成功';
    const newLog = {
      time: lastSyncTime.value,
      status: '成功',
      message: '平台参数同步完成。'
    };
    syncLogs.value.unshift(newLog); // 添加到日志顶部
    ElMessage.success('平台参数同步成功！');
  }, 2000);
  // 实际：调用后端 API 进行同步
};

/**
 * 修改 IP 并重连 ()
 */
const handleReconnectPlatform = () => {
  ElMessageBox.confirm(`确定要将平台IP修改为 ${platformIp.value} 并尝试重连吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    ElMessage.info(`正在尝试连接到新IP：${platformIp.value} ()...`);
    // 重连过程
    setTimeout(() => {
      const success = Math.random() > 0.3; // 成功或失败
      const logMessage = success ? `成功连接到平台 IP: ${platformIp.value}。` : `连接平台 IP: ${platformIp.value} 失败，请检查网络。`;
      const logStatus = success ? '成功' : '失败';

      syncLogs.value.unshift({
        time: new Date().toLocaleString('zh-CN'),
        status: logStatus,
        message: logMessage
      });
      if (success) {
        ElMessage.success(logMessage);
      } else {
        ElMessage.error(logMessage);
      }
    }, 2500);
  }).catch(() => {
    ElMessage.info('已取消操作。');
  });
};

// ===================== 生命周期钩子 =====================
onMounted(() => {
  // 页面加载时可以执行一些初始化操作，例如获取当前配置或同步状态
  // 这里我们仅初始化一些数据
});
</script>

<style scoped>
/* 继承父级页面容器的基础样式 */
.sub-page-content {
  padding: 15px;
  border-radius: 6px;
  margin-top: 0;
  min-height: auto;
}

h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.settings-card, .platform-sync-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #333;
}

.settings-form .el-form-item {
  margin-bottom: 18px; /* 调整表单项底部间距 */
}

.sync-info p {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  color: #606266;
}
.sync-info .el-tag {
  margin-left: 10px;
}

.mt-10 {
  margin-top: 10px;
}

/* 调整表格头部样式 */
:deep(.el-table__header-wrapper .el-table__header th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: bold;
}
</style>