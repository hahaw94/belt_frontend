<template>
  <div class="device-management-container sub-page-content">
    <h2>设备管理</h2>

    <el-card class="search-card mb-20" shadow="hover">
      <el-form :model="searchForm" :inline="true" label-width="80px">
        <el-form-item label="设备名称">
          <el-input v-model="searchForm.deviceName" placeholder="请输入设备名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="设备编号">
          <el-input v-model="searchForm.deviceSn" placeholder="请输入设备编号" clearable></el-input>
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="searchForm.deviceType" placeholder="请选择设备类型" clearable style="width: 180px;">
            <el-option label="IPC摄像机" value="IPC摄像机"></el-option>
            <el-option label="NVR录像机" value="NVR录像机"></el-option>
            <el-option label="编码器" value="编码器"></el-option>
            <el-option label="解码器" value="解码器"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="device-list-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>设备列表</span>
          <div>
            <el-button type="success" :icon="Plus" size="small" @click="handleAddDevice">添加设备</el-button>
            <el-button type="primary" :icon="Download" size="small" @click="exportDevices">导出</el-button>
          </div>
        </div>
      </template>

      <el-table :data="paginatedDevices" v-loading="loading" border stripe style="width: 100%;">
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="deviceName" label="设备名称" min-width="150"></el-table-column>
        <el-table-column prop="deviceSn" label="设备编号" min-width="180"></el-table-column>
        <el-table-column prop="deviceType" label="设备类型" width="120"></el-table-column>
        <el-table-column prop="manufacturer" label="生产厂家" width="120"></el-table-column>
        <el-table-column prop="ipAddress" label="IP地址" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '在线' ? 'success' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="添加时间" width="180"></el-table-column>
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" :icon="Edit" size="small" @click="handleEditDevice(row)">编辑</el-button>
            <el-button type="info" :icon="View" size="small" @click="handleViewDetail(row)">详情</el-button>
            <el-button :type="row.status === '在线' ? 'warning' : 'success'" :icon="row.status === '在线' ? CircleClose : Select" size="small" @click="toggleDeviceStatus(row)">
              {{ row.status === '在线' ? '离线' : '上线' }}
            </el-button>
            <el-button type="danger" :icon="Delete" size="small" @click="handleDeleteDevice(row)">删除</el-button>
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
          :total="filteredDevices.length"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="mt-20 flex-center"
      />
    </el-card>

    <el-dialog
        v-model="deviceDialogVisible"
        :title="dialogTitle"
        width="700px"
        :close-on-click-modal="false"
        destroy-on-close
    >
      <el-form :model="currentDevice" :rules="deviceRules" ref="deviceFormRef" label-width="120px" v-if="!isViewMode">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备名称" prop="deviceName">
              <el-input v-model="currentDevice.deviceName" placeholder="请输入设备名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备编号" prop="deviceSn">
              <el-input v-model="currentDevice.deviceSn" placeholder="请输入设备编号" :disabled="isEditMode"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备型号" prop="model">
              <el-input v-model="currentDevice.model" placeholder="请输入设备型号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产厂家" prop="manufacturer">
              <el-input v-model="currentDevice.manufacturer" placeholder="请输入生产厂家"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备类型" prop="deviceType">
              <el-select v-model="currentDevice.deviceType" placeholder="请选择设备类型" style="width: 100%;">
                <el-option label="IPC摄像机" value="IPC摄像机"></el-option>
                <el-option label="NVR录像机" value="NVR录像机"></el-option>
                <el-option label="编码器" value="编码器"></el-option>
                <el-option label="解码器" value="解码器"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="IP地址" prop="ipAddress">
              <el-input v-model="currentDevice.ipAddress" placeholder="请输入IP地址"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属区域" prop="area">
              <el-input v-model="currentDevice.area" placeholder="请输入所属区域"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="内部代码" prop="internalCode">
              <el-input v-model="currentDevice.internalCode" placeholder="请输入内部代码"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>安装信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="安装地点" prop="installLocation">
              <el-input v-model="currentDevice.installLocation" placeholder="请输入安装地点"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安装时间" prop="installTime">
              <el-date-picker
                  v-model="currentDevice.installTime"
                  type="date"
                  placeholder="请选择安装时间"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="线路信息" prop="lineInfo">
              <el-input v-model="currentDevice.lineInfo" placeholder="请输入线路信息"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="方向信息" prop="direction">
              <el-input v-model="currentDevice.direction" placeholder="请输入方向信息"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>智能截取信息 (模拟)</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="关联相机SN" prop="relatedCameraSn">
              <el-input v-model="currentDevice.relatedCameraSn" placeholder="请输入关联相机SN"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="相机名称" prop="relatedCameraName">
              <el-input v-model="currentDevice.relatedCameraName" placeholder="请输入关联相机名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="算法模型" prop="algorithmModel">
              <el-select v-model="currentDevice.algorithmModel" placeholder="请选择算法模型" style="width: 100%;">
                <el-option label="人脸识别" value="人脸识别"></el-option>
                <el-option label="车辆识别" value="车辆识别"></el-option>
                <el-option label="行为分析" value="行为分析"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模型版本" prop="modelVersion">
              <el-input v-model="currentDevice.modelVersion" placeholder="请输入模型版本"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-descriptions v-else :column="2" border size="large">
        <el-descriptions-item label="ID">{{ currentDevice.id }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ currentDevice.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="设备编号">{{ currentDevice.deviceSn }}</el-descriptions-item>
        <el-descriptions-item label="设备型号">{{ currentDevice.model }}</el-descriptions-item>
        <el-descriptions-item label="生产厂家">{{ currentDevice.manufacturer }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">{{ currentDevice.deviceType }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentDevice.ipAddress }}</el-descriptions-item>
        <el-descriptions-item label="所属区域">{{ currentDevice.area }}</el-descriptions-item>
        <el-descriptions-item label="内部代码">{{ currentDevice.internalCode }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentDevice.status === '在线' ? 'success' : 'danger'">{{ currentDevice.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="添加时间">{{ currentDevice.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentDevice.updateTime }}</el-descriptions-item>

        <el-descriptions-item label="安装地点">{{ currentDevice.installLocation }}</el-descriptions-item>
        <el-descriptions-item label="安装时间">{{ currentDevice.installTime }}</el-descriptions-item>
        <el-descriptions-item label="线路信息">{{ currentDevice.lineInfo }}</el-descriptions-item>
        <el-descriptions-item label="方向信息">{{ currentDevice.direction }}</el-descriptions-item>

        <el-descriptions-item label="关联相机SN">{{ currentDevice.relatedCameraSn || '无' }}</el-descriptions-item>
        <el-descriptions-item label="相机名称">{{ currentDevice.relatedCameraName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="算法模型">{{ currentDevice.algorithmModel || '无' }}</el-descriptions-item>
        <el-descriptions-item label="模型版本">{{ currentDevice.modelVersion || '无' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentDevice.remark || '无' }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deviceDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="submitDeviceForm" :loading="loading" v-if="!isViewMode">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="DeviceManage">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Plus, Download, Edit, View, CircleClose, Select, Delete } from '@element-plus/icons-vue';

// ===================== 数据定义 =====================
const loading = ref(false); // 表格加载状态
const deviceDialogVisible = ref(false); // 控制弹窗显示
const isEditMode = ref(false); // 是否是编辑模式
const isViewMode = ref(false); // 是否是详情查看模式
const dialogTitle = computed(() => {
  if (isViewMode.value) return '设备详情';
  return isEditMode.value ? '编辑设备' : '添加设备';
});

// 搜索表单
const searchForm = reactive({
  deviceName: '',
  deviceSn: '',
  deviceType: '',
});

// 当前操作的设备数据
const currentDevice = reactive({
  id: null,
  deviceName: '',
  deviceSn: '',
  model: '',
  manufacturer: '',
  deviceType: '',
  ipAddress: '',
  area: '',
  internalCode: '', // 内部代码
  installLocation: '', // 安装地点
  installTime: '', // 安装时间
  lineInfo: '', // 线路信息
  direction: '', // 方向信息
  relatedCameraSn: '', // 关联相机SN (智能截取)
  relatedCameraName: '', // 关联相机名称 (智能截取)
  algorithmModel: '', // 算法模型 (智能截取)
  modelVersion: '', // 模型版本 (智能截取)
  status: '在线', // 默认在线
  createTime: '',
  updateTime: '',
  remark: '',
});

// 模拟设备数据
const mockDevices = ref([]);

// 分页数据
const currentPage = ref(1);
const pageSize = ref(10);

// 表单验证规则
const deviceFormRef = ref(null);
const deviceRules = reactive({
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  deviceSn: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  model: [{ required: true, message: '请输入设备型号', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
  deviceType: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  ipAddress: [
    { required: true, message: '请输入IP地址', trigger: 'blur' },
    {
      pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
      message: '请输入有效的IP地址',
      trigger: 'blur'
    }
  ],
  installLocation: [{ required: true, message: '请输入安装地点', trigger: 'blur' }],
  installTime: [{ required: true, message: '请选择安装时间', trigger: 'change' }],
});

// ===================== Computed 属性 =====================
// 根据搜索条件过滤设备数据
const filteredDevices = computed(() => {
  return mockDevices.value.filter(device => {
    const nameMatch = searchForm.deviceName ? device.deviceName.includes(searchForm.deviceName) : true;
    const snMatch = searchForm.deviceSn ? device.deviceSn.includes(searchForm.deviceSn) : true;
    const typeMatch = searchForm.deviceType ? device.deviceType === searchForm.deviceType : true;
    return nameMatch && snMatch && typeMatch;
  });
});

// 根据分页信息获取当前页的设备数据
const paginatedDevices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredDevices.value.slice(start, end);
});

// ===================== 方法 =====================

/**
 * 模拟初始化设备数据
 */
const initMockDevices = () => {
  const devices = [];
  const deviceTypes = ['IPC摄像机', 'NVR录像机', '编码器', '解码器'];
  const manufacturers = ['海康威视', '大华', '宇视', '华为'];
  const statuses = ['在线', '离线'];
  const algorithmModels = ['人脸识别', '车辆识别', '行为分析', '无'];

  for (let i = 1; i <= 30; i++) {
    const type = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createTime = new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toLocaleString('zh-CN');
    const updateTime = Math.random() > 0.5 ? new Date().toLocaleString('zh-CN') : createTime;
    const ipLastOctet = Math.floor(Math.random() * 254) + 1; // 1 to 254
    const ipAddress = `192.168.1.${ipLastOctet}`;

    // 模拟智能截取信息
    const hasAI = Math.random() > 0.3; // 70%的设备有AI功能
    const algorithm = hasAI ? algorithmModels[Math.floor(Math.random() * (algorithmModels.length - 1))] : ''; // 排除“无”
    const modelVer = hasAI ? `V${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 5) + 1}` : '';
    const cameraSn = hasAI ? `CAM-${Math.floor(1000 + Math.random() * 9000)}` : '';
    const cameraName = hasAI ? `摄像头-${Math.floor(Math.random() * 50) + 1}` : '';

    devices.push({
      id: i,
      deviceName: `设备名称_${i < 10 ? '0' + i : i}`,
      deviceSn: `SN${Date.now().toString().slice(-6)}-${i < 10 ? '0' + i : i}`,
      model: `型号-X${i % 5 + 1}00`,
      manufacturer: manufacturer,
      deviceType: type,
      ipAddress: ipAddress,
      area: `区域${Math.floor(Math.random() * 5) + 1}`,
      internalCode: `CODE-${Math.floor(1000 + Math.random() * 9000)}`,
      installLocation: `楼宇${Math.floor(Math.random() * 10) + 1}层${Math.floor(Math.random() * 20) + 1}号房间`,
      installTime: new Date(Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10), // YYYY-MM-DD
      lineInfo: `网线${Math.floor(Math.random() * 100) + 1}号`,
      direction: `朝向${['东', '南', '西', '北'][Math.floor(Math.random() * 4)]}`,
      relatedCameraSn: cameraSn,
      relatedCameraName: cameraName,
      algorithmModel: algorithm,
      modelVersion: modelVer,
      status: status,
      createTime: createTime,
      updateTime: updateTime,
      remark: '这是设备的模拟备注信息。',
    });
  }
  mockDevices.value = devices;
};

/**
 * 获取设备列表 (模拟)
 */
const getDevices = () => {
  loading.value = true;
  ElMessage.info('正在加载设备列表...');
  setTimeout(() => {
    initMockDevices(); // 重新加载模拟数据
    loading.value = false;
    ElMessage.success('设备列表已加载！');
    currentPage.value = 1; // 刷新后回到第一页
  }, 500);
};

/**
 * 处理搜索
 */
const handleSearch = () => {
  currentPage.value = 1; // 搜索后回到第一页
  // 实际场景中，这里会调用后端API进行带条件的查询
};

/**
 * 重置搜索条件
 */
const resetSearch = () => {
  Object.assign(searchForm, {
    deviceName: '',
    deviceSn: '',
    deviceType: '',
  });
  handleSearch(); // 重置后重新触发搜索
};

/**
 * 处理添加设备按钮点击
 */
const handleAddDevice = () => {
  isEditMode.value = false;
  isViewMode.value = false;
  // 重置 currentDevice
  Object.assign(currentDevice, {
    id: null,
    deviceName: '',
    deviceSn: '',
    model: '',
    manufacturer: '',
    deviceType: '',
    ipAddress: '',
    area: '',
    internalCode: '',
    installLocation: '',
    installTime: '',
    lineInfo: '',
    direction: '',
    relatedCameraSn: '',
    relatedCameraName: '',
    algorithmModel: '',
    modelVersion: '',
    status: '在线',
    createTime: '',
    updateTime: '',
    remark: '',
  });
  deviceDialogVisible.value = true;
  if (deviceFormRef.value) {
    deviceFormRef.value.clearValidate();
  }
};

/**
 * 处理编辑设备按钮点击
 * @param {Object} row - 当前行设备数据
 */
const handleEditDevice = (row) => {
  isEditMode.value = true;
  isViewMode.value = false;
  Object.assign(currentDevice, { ...row });
  deviceDialogVisible.value = true;
  if (deviceFormRef.value) {
    deviceFormRef.value.clearValidate();
  }
};

/**
 * 处理查看详情按钮点击
 * @param {Object} row - 当前行设备数据
 */
const handleViewDetail = (row) => {
  isEditMode.value = false;
  isViewMode.value = true;
  Object.assign(currentDevice, { ...row });
  deviceDialogVisible.value = true;
};

/**
 * 提交设备表单 (添加/编辑)
 */
const submitDeviceForm = async () => {
  if (!deviceFormRef.value) return;

  await deviceFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      const messagePrefix = isEditMode.value ? '更新' : '添加';
      ElMessage.info(`正在${messagePrefix}设备: ${currentDevice.deviceName}...`);

      setTimeout(() => {
        loading.value = false;
        if (isEditMode.value) {
          // 编辑设备
          const index = mockDevices.value.findIndex(d => d.id === currentDevice.id);
          if (index !== -1) {
            Object.assign(mockDevices.value[index], {
              ...currentDevice,
              updateTime: new Date().toLocaleString('zh-CN'),
            });
            ElMessage.success(`设备 ${currentDevice.deviceName} 更新成功！`);
          }
        } else {
          // 添加设备
          const newId = Math.max(0, ...mockDevices.value.map(d => d.id)) + 1;
          mockDevices.value.unshift({
            ...currentDevice,
            id: newId,
            createTime: new Date().toLocaleString('zh-CN'),
            updateTime: new Date().toLocaleString('zh-CN'),
          });
          ElMessage.success(`设备 ${currentDevice.deviceName} 添加成功！`);
        }
        deviceDialogVisible.value = false;
      }, 1000);
    } else {
      ElMessage.error('请检查表单输入！');
    }
  });
};

/**
 * 切换设备状态 (在线/离线)
 * @param {Object} row - 当前行设备数据
 */
const toggleDeviceStatus = (row) => {
  ElMessageBox.confirm(`确定要将设备 "${row.deviceName}" 设置为${row.status === '在线' ? '离线' : '在线'}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
      .then(() => {
        loading.value = true;
        setTimeout(() => {
          const index = mockDevices.value.findIndex(d => d.id === row.id);
          if (index !== -1) {
            mockDevices.value[index].status = row.status === '在线' ? '离线' : '在线';
            mockDevices.value[index].updateTime = new Date().toLocaleString('zh-CN');
          }
          loading.value = false;
          ElMessage.success(`设备 ${row.deviceName} 已设置为${row.status === '在线' ? '离线' : '在线'}！`);
        }, 300);
      })
      .catch(() => {
        ElMessage.info('已取消操作。');
      });
};

/**
 * 处理删除设备操作
 * @param {Object} row - 要删除的设备数据
 */
const handleDeleteDevice = (row) => {
  ElMessageBox.confirm(`确定要删除设备 "${row.deviceName}" 吗？此操作不可逆！`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
      .then(() => {
        loading.value = true;
        setTimeout(() => {
          mockDevices.value = mockDevices.value.filter(device => device.id !== row.id);
          loading.value = false;
          ElMessage.success(`设备 ${row.deviceName} 删除成功！`);
          if (paginatedDevices.value.length === 0 && currentPage.value > 1) {
            currentPage.value--;
          }
        }, 300);
      })
      .catch(() => {
        ElMessage.info('已取消删除操作。');
      });
};

/**
 * 导出设备列表 (模拟)
 */
const exportDevices = () => {
  ElMessage.info('正在导出设备列表...');
  // 实际场景中，这里会调用后端API生成并下载文件
  setTimeout(() => {
    ElMessage.success('设备列表导出成功！');
  }, 800);
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
  getDevices(); // 组件挂载时加载设备数据
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

.search-card, .device-list-card {
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

/* El-Descriptions 细节调整 */
:deep(.el-descriptions__header) {
  margin-bottom: 20px;
}
:deep(.el-descriptions__title) {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
</style>