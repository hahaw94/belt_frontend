<template>
  <div class="algorithm-warehouse-container sub-page-content">
    <h2>算法仓</h2>

    <el-card class="upload-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>算法版本包上传</span>
        </div>
      </template>
      <el-upload
          class="upload-demo"
          drag
          action="#"
          :http-request="handleUpload"
          :show-file-list="false"
          multiple
          accept=".zip,.tar,.gz,.sh,.py,.bin"
          :disabled="loading"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖拽至此 或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 .zip, .tar, .gz 等压缩包或脚本文件 (.sh, .py, .bin)，单文件大小不超过 500MB
          </div>
        </template>
      </el-upload>
    </el-card>

    <el-card class="resource-list-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>算法版本列表</span>
          <el-button type="primary" :icon="Refresh" size="small" @click="getAlgorithmVersions" :loading="loading">刷新列表</el-button>
        </div>
      </template>

      <el-table
          :data="paginatedVersions"
          v-loading="loading"
          border
          stripe
          width="100%" header-cell-class-name="table-header-cell"
      >
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="版本名称" min-width="180"></el-table-column> <el-table-column prop="version" label="版本号" width="120"></el-table-column>
        <el-table-column prop="type" label="文件类型" width="100"></el-table-column>
        <el-table-column prop="size" label="文件大小" width="120"></el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" width="180"></el-table-column>
        <el-table-column prop="status" label="发布状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '已发布' ? 'success' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" align="center"> <template #default="{ row }">
          <el-button type="primary" :icon="Edit" size="small" @click="handleEditVersion(row)" :disabled="row.status === '已发布' || loading">编辑</el-button>
          <el-button
              :type="row.status === '已发布' ? 'info' : 'success'"
              :icon="row.status === '已发布' ? View : Promotion"
              size="small"
              @click="handlePublishVersion(row)"
              :disabled="loading"
          >
            {{ row.status === '已发布' ? '查看详情' : '发布版本' }}
          </el-button>
          <el-button type="danger" :icon="Delete" size="small" @click="handleDeleteVersion(row)" :disabled="loading">删除</el-button>
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
          :total="mockVersions.length" @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="mt-20 flex-center"
      />
    </el-card>

    <el-dialog
        v-model="editDialogVisible"
        title="编辑算法版本"
        width="500px"
        :close-on-click-modal="false"
        destroy-on-close
    >
      <el-form :model="currentVersion" label-width="100px">
        <el-form-item label="版本名称">
          <el-input v-model="currentVersion.name"></el-input>
        </el-form-item>
        <el-form-item label="版本号">
          <el-input v-model="currentVersion.version"></el-input>
        </el-form-item>
        <el-form-item label="文件类型">
          <el-input v-model="currentVersion.type" disabled></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditVersion" :loading="loading">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AlgorithmWarehouse">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled, Refresh, Edit, Delete, Promotion, View } from '@element-plus/icons-vue';

// ===================== 数据定义 =====================
const loading = ref(false); // 表格加载状态
const editDialogVisible = ref(false); // 控制编辑弹窗的显示
const currentVersion = reactive({}); // 当前编辑的版本数据

// 模拟算法版本数据 (现在在组件内部管理，不通过 Pinia)
const mockVersions = ref([]);

// 分页数据
const currentPage = ref(1);
const pageSize = ref(10);

// ===================== Computed 属性 =====================
// 根据分页信息获取当前页的版本数据
const paginatedVersions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return mockVersions.value.slice(start, end);
});

// ===================== 方法 =====================

/**
 * 生成随机版本号
 */
const generateVersion = () => {
  const major = Math.floor(Math.random() * 5);
  const minor = Math.floor(Math.random() * 10);
  const patch = Math.floor(Math.random() * 20);
  return `V${major}.${minor}.${patch}`;
};

/**
 * 初始化模拟算法版本数据
 */
const initMockVersions = () => {
  const versions = [];
  const fileTypes = ['.zip', '.tar', '.gz', '.py', '.sh', '.bin'];
  for (let i = 1; i <= 25; i++) {
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const sizeMB = (Math.random() * 400 + 10).toFixed(2); // 10MB to 410MB
    versions.push({
      id: i,
      name: `AlgorithmPack_${i < 10 ? '0' + i : i}`,
      version: generateVersion(), // 使用本地方法
      type: fileType,
      size: `${sizeMB} MB`,
      uploadTime: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)).toLocaleString('zh-CN'),
      status: i % 5 === 0 ? '已发布' : '未发布', // 模拟部分已发布
      description: `这是算法包 ${i} 的详细描述。`,
    });
  }
  mockVersions.value = versions;
};

/**
 * 模拟文件上传请求
 * @param {Object} options - 上传选项
 */
const handleUpload = (options) => {
  const file = options.file;
  ElMessage.info(`正在上传文件: ${file.name}`);
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    // 模拟上传成功
    if (file.size > 500 * 1024 * 1024) { // 500MB 限制
      ElMessage.error(`文件 ${file.name} 太大，请上传小于 500MB 的文件！`);
      return;
    }
    const newId = Math.max(0, ...mockVersions.value.map(v => v.id)) + 1;
    const newVersion = {
      id: newId,
      name: file.name.split('.')[0], // 文件名作为版本名称
      version: generateVersion(),
      type: `.${file.name.split('.').pop()}`, // 获取文件扩展名
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadTime: new Date().toLocaleString('zh-CN'),
      status: '未发布',
      description: `通过上传文件 ${file.name} 创建。`
    };
    mockVersions.value.unshift(newVersion); // 添加到列表顶部
    ElMessage.success(`文件 ${file.name} 上传成功！`);
  }, 1500);
};

/**
 * 模拟获取算法版本列表 (刷新)
 */
const getAlgorithmVersions = () => {
  loading.value = true;
  ElMessage.info('正在刷新算法版本列表...');
  setTimeout(() => {
    initMockVersions(); // 重新加载模拟数据
    loading.value = false;
    ElMessage.success('列表已刷新！');
  }, 500);
};

/**
 * 处理编辑版本按钮点击
 * @param {Object} row - 当前行版本数据
 */
const handleEditVersion = (row) => {
  Object.assign(currentVersion, { ...row }); // 复制当前行数据
  editDialogVisible.value = true;
};

/**
 * 提交编辑版本表单 (模拟)
 */
const submitEditVersion = () => {
  loading.value = true;
  setTimeout(() => {
    const index = mockVersions.value.findIndex(v => v.id === currentVersion.id);
    if (index !== -1) {
      Object.assign(mockVersions.value[index], currentVersion); // 更新整个对象
      ElMessage.success(`版本 "${currentVersion.name}" (V${currentVersion.version}) 更新成功！`);
    }
    loading.value = false;
    editDialogVisible.value = false;
  }, 500);
};

/**
 * 处理发布版本按钮点击 (模拟)
 * @param {Object} row - 要发布的版本数据
 */
const handlePublishVersion = (row) => {
  if (row.status === '已发布') {
    ElMessage.info(`版本 "${row.name}" (V${row.version}) 已处于发布状态。`);
    return;
  }
  ElMessageBox.confirm(`确定要发布算法版本 "${row.name}" (V${row.version}) 吗？发布后将可用于下发到设备。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
      .then(() => {
        loading.value = true;
        setTimeout(() => {
          const index = mockVersions.value.findIndex(v => v.id === row.id);
          if (index !== -1) {
            mockVersions.value[index].status = '已发布';
          }
          loading.value = false;
          ElMessage.success(`版本 "${row.name}" (V${row.version}) 发布成功！`);
        }, 1000);
      })
      .catch(() => {
        ElMessage.info('已取消发布操作。');
      });
};

/**
 * 处理删除版本操作 (模拟)
 * @param {Object} row - 要删除的版本数据
 */
const handleDeleteVersion = (row) => {
  ElMessageBox.confirm(`确定要删除算法版本 "${row.name}" (V${row.version}) 吗？此操作不可逆！`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
      .then(() => {
        loading.value = true;
        setTimeout(() => {
          mockVersions.value = mockVersions.value.filter(version => version.id !== row.id);
          loading.value = false;
          ElMessage.success(`版本 "${row.name}" (V${row.version}) 删除成功！`);
          // 检查当前页是否为空，如果为空且不是第一页，则跳转到上一页
          if (paginatedVersions.value.length === 0 && currentPage.value > 1) {
            currentPage.value--;
          }
        }, 300);
      })
      .catch(() => {
        ElMessage.info('已取消删除操作。');
      });
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
  initMockVersions(); // 组件挂载时初始化模拟版本数据
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

.upload-card, .resource-list-card {
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

.upload-demo {
  text-align: center;
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

/* 对话框底部按钮的间距 */
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>