<template>
  <div class="version-upgrade-container sub-page-content">
    <h2>版本升级</h2>

    <el-card class="upload-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>系统版本升级包上传</span>
        </div>
      </template>
      <el-upload
          class="upload-demo"
          drag
          action="#"
          :http-request="handleUpload"
          :show-file-list="true"
          multiple
          accept=".zip,.tar,.gz"
          :limit="3"
          :on-exceed="handleExceed"
          ref="uploadRef"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将系统升级包拖拽至此 或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 .zip, .tar, .gz 等格式的压缩包，单个文件大小不超过 2GB
          </div>
        </template>
      </el-upload>
      <div class="upload-actions mt-20">
        <el-button type="primary" :icon="Upload" @click="submitUpload">开始升级</el-button>
        <el-button :icon="Delete" @click="clearFiles">清空列表</el-button>
      </div>
    </el-card>

    <el-card class="upgrade-history-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>历史升级记录</span>
          <el-button type="primary" :icon="Refresh" size="small" @click="getUpgradeHistory">刷新记录</el-button>
        </div>
      </template>

      <el-table :data="upgradeHistory" v-loading="loading" border stripe style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="fileName" label="升级包名称" min-width="200"></el-table-column>
        <el-table-column prop="version" label="版本号" width="120"></el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" width="180"></el-table-column>
        <el-table-column prop="status" label="升级状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="消息" min-width="250"></el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="info" :icon="InfoFilled" size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          :small="false"
          :disabled="loading"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="mockHistory.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="mt-20 flex-center"
      />
    </el-card>

    <el-dialog
        v-model="detailDialogVisible"
        title="升级详情"
        width="600px"
        :close-on-click-modal="false"
        destroy-on-close
    >
      <el-descriptions
          class="margin-top"
          :column="2"
          border
      >
        <el-descriptions-item label="ID">{{ currentDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="文件名">{{ currentDetail.fileName }}</el-descriptions-item>
        <el-descriptions-item label="版本号">{{ currentDetail.version }}</el-descriptions-item>
        <el-descriptions-item label="文件大小">{{ currentDetail.fileSize }}</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ currentDetail.uploadTime }}</el-descriptions-item>
        <el-descriptions-item label="升级状态">
          <el-tag :type="getStatusType(currentDetail.status)">{{ currentDetail.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="消息" :span="2">{{ currentDetail.message }}</el-descriptions-item>
        <el-descriptions-item label="操作人" :span="2">{{ currentDetail.operator }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="VersionUpgrade">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled, Upload, Delete, Refresh, InfoFilled } from '@element-plus/icons-vue';

// ===================== 数据定义 =====================
const uploadRef = ref(null); // 上传组件的引用
const loading = ref(false); // 表格加载状态
const detailDialogVisible = ref(false); // 详情弹窗显示状态
const currentDetail = reactive({}); // 当前查看的详情数据

// 模拟历史升级记录数据
const mockHistory = ref([]);

// 分页数据
const currentPage = ref(1);
const pageSize = ref(10);

// ===================== Computed 属性 =====================
// const paginatedHistory = computed(() => {
//   const start = (currentPage.value - 1) * pageSize.value;
//   const end = start + pageSize.value;
//   return mockHistory.value.slice(start, end);
// });

// ===================== 方法 =====================

/**
 * 获取状态对应的标签类型
 * @param {string} status
 */
const getStatusType = (status) => {
  switch (status) {
    case '成功':
      return 'success';
    case '失败':
      return 'danger';
    case '进行中':
      return 'warning';
    default:
      return 'info';
  }
};

/**
 * 模拟生成随机版本号
 */
const generateVersion = () => {
  const major = Math.floor(Math.random() * 5);
  const minor = Math.floor(Math.random() * 10);
  const patch = Math.floor(Math.random() * 20);
  return `V${major}.${minor}.${patch}`;
};

/**
 * 初始化模拟历史升级记录数据
 */
const initMockHistory = () => {
  const history = [];
  const statuses = ['成功', '失败', '进行中', '待升级'];
  for (let i = 1; i <= 30; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const fileSizeMB = (Math.random() * 1500 + 100).toFixed(2); // 100MB to 1.6GB
    history.push({
      id: i,
      fileName: `SystemUpgrade_${i < 10 ? '0' + i : i}.zip`,
      version: generateVersion(),
      fileSize: `${fileSizeMB} MB`,
      uploadTime: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toLocaleString('zh-CN'),
      status: status,
      message: status === '成功' ? '系统升级成功。' : (status === '失败' ? '升级失败，请检查日志。' : '正在等待执行或后台升级中。'),
      operator: `Admin${(i % 5) + 1}`,
    });
  }
  mockHistory.value = history.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime)); // 按时间倒序
};

/**
 * 自定义上传方法，模拟上传过程
 * @param {Object} options - ElUpload 的选项对象
 */
const handleUpload = (options) => {
  const file = options.file;
  ElMessage.info(`文件 ${file.name} 已选中，等待点击“开始升级”。`);
  // 这里可以存储文件信息到组件状态，但我们通过 el-upload 的 :show-file-list="true" 来管理
  // 实际上传逻辑会在 submitUpload 中触发
  return false; // 阻止 el-upload 自动上传
};

/**
 * 处理超出文件上传数量限制
 * @param {Array} files - 新选择的文件
 * @param {Array} uploadFiles - 已上传的文件
 */
const handleExceed = (files, uploadFiles) => {
  ElMessage.warning(`最多只能上传 3 个文件，本次选择了 ${files.length} 个文件，共 ${files.length + uploadFiles.length} 个。请先移除部分文件。`);
};

/**
 * 提交上传的文件进行模拟升级
 */
const submitUpload = async () => {
  if (!uploadRef.value || uploadRef.value.uploadFiles.length === 0) {
    ElMessage.warning('请先选择要上传的升级包！');
    return;
  }

  ElMessageBox.confirm('确定要开始系统升级吗？升级过程中系统可能短暂中断，请谨慎操作！', '警告', {
    confirmButtonText: '确定升级',
    cancelButtonText: '取消',
    type: 'warning',
  })
      .then(() => {
        loading.value = true;
        ElMessage.info('正在准备升级...');
        // 模拟遍历上传文件并处理
        uploadRef.value.uploadFiles.forEach(fileItem => {
          if (fileItem.status === 'success') { // 已经处理过的文件跳过
            return;
          }

          const file = fileItem.raw;
          if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB 限制
            ElMessage.error(`文件 ${file.name} 太大，请上传小于 2GB 的文件！`);
            fileItem.status = 'fail';
            return;
          }

          // 模拟文件上传和升级过程
          setTimeout(() => {
            const newId = Math.max(0, ...mockHistory.value.map(h => h.id)) + 1;
            const isSuccess = Math.random() > 0.1; // 90% 成功率
            const status = isSuccess ? '进行中' : '失败'; // 上传成功后，状态先变为“进行中”或“失败”

            const newRecord = {
              id: newId,
              fileName: file.name,
              version: generateVersion(), // 模拟一个新版本号
              fileSize: `${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB`, // 显示为GB
              uploadTime: new Date().toLocaleString('zh-CN'),
              status: status,
              message: isSuccess ? '升级包已接收，正在后台解压并安装...' : '文件处理失败，请重试或检查文件。',
              operator: '当前用户',
            };
            mockHistory.value.unshift(newRecord); // 添加到历史记录顶部

            // 如果是“进行中”，再模拟一段时间后变为“成功”或“失败”
            if (status === '进行中') {
              setTimeout(() => {
                const finalStatus = Math.random() > 0.2 ? '成功' : '失败'; // 80% 最终成功率
                const finalMessage = finalStatus === '成功' ? '系统已成功升级到新版本。' : '系统升级失败，请联系管理员！';
                const recordIndex = mockHistory.value.findIndex(r => r.id === newRecord.id);
                if (recordIndex !== -1) {
                  mockHistory.value[recordIndex].status = finalStatus;
                  mockHistory.value[recordIndex].message = finalMessage;
                  if (finalStatus === '成功') {
                    ElMessage.success(`系统升级成功！新版本：${newRecord.version}`);
                  } else {
                    ElMessage.error(`系统升级失败！文件：${newRecord.fileName}`);
                  }
                }
              }, 3000); // 模拟 3 秒后升级完成
            } else {
              ElMessage.error(`文件 ${file.name} 处理失败！`);
            }

            fileItem.status = 'success'; // 标记 ElUpload 文件列表中的状态
          }, 1000); // 模拟每个文件 1 秒的处理时间
        });

        // 清空已成功处理的文件列表，如果需要的话
        // uploadRef.value.clearFiles();

        loading.value = false;
      })
      .catch(() => {
        ElMessage.info('已取消系统升级操作。');
      });
};

/**
 * 清空上传列表
 */
const clearFiles = () => {
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
    ElMessage.info('上传列表已清空。');
  }
};

/**
 * 获取历史升级记录
 */
const getUpgradeHistory = () => {
  loading.value = true;
  ElMessage.info('正在刷新升级历史记录...');
  setTimeout(() => {
    initMockHistory(); // 重新加载模拟数据
    loading.value = false;
    ElMessage.success('历史记录已刷新！');
  }, 500);
};

/**
 * 查看详情
 * @param {Object} row - 当前行数据
 */
const viewDetail = (row) => {
  Object.assign(currentDetail, { ...row });
  detailDialogVisible.value = true;
};

/**
 * 处理每页显示条数变化
 * @param {number} val - 新的每页条数
 */
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 改变每页大小时，重置到第一页
};

/**
 * 处理当前页码变化
 * @param {number} val - 新的当前页码
 */
const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// ===================== 生命周期钩子 =====================
onMounted(() => {
  initMockHistory(); // 组件挂载时初始化模拟数据
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

.upload-card, .upgrade-history-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #333;
}

.upload-demo {
  text-align: center;
  padding: 20px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fcfcfc;
}

/* 调整拖拽区域的图标和文字颜色 */
.upload-demo :deep(.el-upload-dragger) {
  padding: 20px;
  border: none;
  background-color: transparent;
}
.upload-demo :deep(.el-upload-dragger .el-icon--upload) {
  font-size: 67px;
  color: #c0c4cc;
}
.upload-demo :deep(.el-upload__text) {
  color: #909399;
}
.upload-demo :deep(.el-upload__text em) {
  color: #409eff;
  font-style: normal;
}
.upload-demo :deep(.el-upload__tip) {
  margin-top: 7px;
  color: #909399;
  font-size: 12px;
}

.upload-actions {
  text-align: right;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

/* 调整表格头部样式 */
:deep(.el-table__header-wrapper .el-table__header th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: bold;
}

/* 分页组件居中 */
.flex-center {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 详情描述列表的样式 */
.el-descriptions {
  margin-top: 20px;
}
.margin-top {
  margin-top: 20px;
}
</style>