<template>
  <div class="algorithm-setup-container sub-page-content">
    <h2>算法配置</h2>

    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>智能分析卡基础配置</span>
        </div>
      </template>
      <el-form :model="cardConfig" label-width="150px" class="config-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分析卡IP地址">
              <el-input v-model="cardConfig.ipAddress" placeholder="例如: 192.168.1.101"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="端口">
              <el-input-number v-model="cardConfig.port" :min="1" :max="65535"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分析模式">
              <el-select v-model="cardConfig.analysisMode" placeholder="请选择分析模式">
                <el-option label="实时分析" value="realtime"></el-option>
                <el-option label="离线分析" value="offline"></el-option>
                <el-option label="混合模式" value="hybrid"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大并发任务">
              <el-input-number v-model="cardConfig.maxConcurrentTasks" :min="1" :max="100"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="cardConfig.remark" :rows="3" placeholder="请输入备注信息"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Save" @click="saveCardConfig">保存配置</el-button>
          <el-button :icon="Refresh" @click="resetCardConfig">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="data-dispatch-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>算法及规则下发</span>
          <el-button type="success" :icon="Download" size="small" @click="handleAlgorithmDispatch" :loading="dispatchLoading">执行算法下发 (模拟)</el-button>
        </div>
      </template>
      <p class="dispatch-tip">支持将已发布算法包和配置规则下发到智能分析卡节点，实现自动部署。</p>
      <el-form :model="dispatchForm" label-width="120px">
        <el-form-item label="选择算法版本">
          <el-select v-model="dispatchForm.algorithmVersionId" placeholder="请选择要下发的算法版本" style="width: 100%;" :loading="dispatchLoading">
            <el-option
                v-for="version in availableAlgorithms"
                :key="version.id"
                :label="`${version.name} (V${version.version})`"
                :value="version.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="目标分析卡">
          <el-select v-model="dispatchForm.targetCard" placeholder="请选择目标分析卡" style="width: 100%;" :loading="dispatchLoading">
            <el-option label="分析卡-001 (192.168.1.101)" value="card001"></el-option>
            <el-option label="分析卡-002 (192.168.1.102)" value="card002"></el-option>
            <el-option label="所有分析卡" value="all"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="同步规则到板">
          <el-switch
              v-model="dispatchForm.syncRules"
              active-text="是"
              inactive-text="否"
              :disabled="dispatchLoading"
          ></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" :icon="Promotion" @click="handleRuleSync" :loading="dispatchLoading">单独同步规则 (模拟)</el-button>
        </el-form-item>
      </el-form>

      <el-divider content-position="left">最近下发日志</el-divider>
      <el-table :data="dispatchLogs" stripe border style="width: 100%;" :max-height="250" v-loading="dispatchLoading">
        <el-table-column prop="time" label="操作时间" width="180"></el-table-column>
        <el-table-column prop="operator" label="操作人" width="100"></el-table-column>
        <el-table-column prop="algorithmName" label="算法名称" width="180"></el-table-column>
        <el-table-column prop="target" label="目标卡" width="150"></el-table-column>
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

<script setup name="AlgorithmSetup">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Save, Refresh, Download, Promotion } from '@element-plus/icons-vue';

// ===================== 智能分析卡配置 =====================
const cardConfig = reactive({
  ipAddress: '192.168.1.101',
  port: 8080,
  analysisMode: 'realtime',
  maxConcurrentTasks: 10,
  remark: '这是智能分析卡的基础配置。'
});

/**
 * 保存分析卡配置 (模拟)
 */
const saveCardConfig = () => {
  ElMessage.success('智能分析卡配置已保存 (模拟)。');
  console.log('保存的分析卡配置:', cardConfig);
};

/**
 * 重置分析卡配置 (模拟)
 */
const resetCardConfig = () => {
  ElMessageBox.confirm('确定要重置分析卡配置为默认值吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    Object.assign(cardConfig, {
      ipAddress: '192.168.1.101',
      port: 8080,
      analysisMode: 'realtime',
      maxConcurrentTasks: 10,
      remark: ''
    });
    ElMessage.success('分析卡配置已重置。');
  }).catch(() => {
    ElMessage.info('已取消重置。');
  });
};

// ===================== 算法及规则下发 =====================
const dispatchLoading = ref(false); // 下发操作的加载状态

const dispatchForm = reactive({
  algorithmVersionId: null, // 选择的算法版本ID
  targetCard: 'card001',
  syncRules: true, // 默认同步规则
});

// 模拟已发布的算法版本列表 (在此页面独立模拟数据)
const mockAvailableAlgorithms = ref([]);

// 下拉框中实际显示的已发布算法版本
const availableAlgorithms = computed(() => {
  return mockAvailableAlgorithms.value.filter(algo => algo.status === '已发布');
});

// 模拟下发日志数据
const dispatchLogs = ref([]);

/**
 * 模拟生成随机版本号 (用于本页面数据)
 */
const generateVersion = () => {
  const major = Math.floor(Math.random() * 5);
  const minor = Math.floor(Math.random() * 10);
  const patch = Math.floor(Math.random() * 20);
  return `V${major}.${minor}.${patch}`;
};

/**
 * 模拟从后端获取已发布的算法版本列表 (这里在此页面内部独立模拟数据)
 */
const fetchAvailableAlgorithms = () => {
  dispatchLoading.value = true;
  ElMessage.info('正在获取可用算法版本...');
  setTimeout(() => {
    const versions = [];
    const fileTypes = ['.zip', '.tar', '.gz', '.py', '.sh', '.bin'];
    for (let i = 1; i <= 15; i++) { // 模拟15个算法
      const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
      const sizeMB = (Math.random() * 400 + 10).toFixed(2);
      versions.push({
        id: i,
        name: `CoreAlgo_${i < 10 ? '0' + i : i}`,
        version: generateVersion(),
        type: fileType,
        size: `${sizeMB} MB`,
        uploadTime: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)).toLocaleString('zh-CN'),
        status: i % 3 === 0 ? '未发布' : '已发布', // 模拟部分已发布，这里只获取已发布的
        description: `这是核心算法 ${i}。`,
      });
    }
    mockAvailableAlgorithms.value = versions;
    dispatchLoading.value = false;
    ElMessage.success('可用算法版本获取成功！');
  }, 800);
};

/**
 * 模拟执行算法下发
 */
const handleAlgorithmDispatch = () => {
  if (!dispatchForm.algorithmVersionId) {
    ElMessage.warning('请先选择要下发的算法版本！');
    return;
  }
  const selectedAlgorithm = availableAlgorithms.value.find(algo => algo.id === dispatchForm.algorithmVersionId);
  if (!selectedAlgorithm) {
    ElMessage.error('选择的算法版本不存在或未发布！');
    return;
  }

  dispatchLoading.value = true;
  ElMessage.info(`正在执行算法 "${selectedAlgorithm.name}" (V${selectedAlgorithm.version}) 下发到 ${dispatchForm.targetCard} (模拟)...`);
  setTimeout(() => {
    const success = Math.random() > 0.2; // 模拟成功或失败
    const status = success ? '成功' : '失败';
    const log = {
      time: new Date().toLocaleString('zh-CN'),
      operator: '当前用户', // 真实情况是登录用户
      algorithmName: selectedAlgorithm.name + ` (V${selectedAlgorithm.version})`,
      target: dispatchForm.targetCard === 'all' ? '所有分析卡' : dispatchForm.targetCard,
      status: status,
      message: success ? '算法下发及规则同步完成。' : '下发失败，请检查网络或目标分析卡状态。'
    };
    dispatchLogs.value.unshift(log); // 添加到日志顶部
    dispatchLoading.value = false;
    if (success) {
      ElMessage.success('算法下发成功！');
    } else {
      ElMessage.error('算法下发失败！');
    }
  }, 2000);
};

/**
 * 模拟单独同步规则
 */
const handleRuleSync = () => {
  dispatchLoading.value = true;
  ElMessage.info('正在单独同步规则到智能分析板 (模拟)...');
  setTimeout(() => {
    const success = Math.random() > 0.1; // 模拟成功或失败
    const status = success ? '成功' : '失败';
    const log = {
      time: new Date().toLocaleString('zh-CN'),
      operator: '当前用户',
      algorithmName: 'N/A (仅规则)',
      target: '智能分析板',
      status: status,
      message: success ? '规则已成功同步。' : '规则同步失败，请检查连接。'
    };
    dispatchLogs.value.unshift(log);
    dispatchLoading.value = false;
    if (success) {
      ElMessage.success('规则单独同步成功！');
    } else {
      ElMessage.error('规则单独同步失败！');
    }
  }, 1500);
};

// ===================== 生命周期钩子 =====================
onMounted(() => {
  fetchAvailableAlgorithms(); // 页面加载时模拟获取可用的算法版本
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

.config-card, .data-dispatch-card {
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

.config-form .el-form-item {
  margin-bottom: 18px; /* 调整表单项底部间距 */
}

.dispatch-tip {
  color: #606266;
  font-size: 14px;
  margin-bottom: 15px;
}

/* 调整表格头部样式 */
:deep(.el-table__header-wrapper .el-table__header th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: bold;
}
</style>