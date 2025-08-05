// 设备管理Mock数据
class DeviceMockData {
  constructor() {
    this.devices = []
    this.initData()
  }

  initData() {
    const deviceTypes = ['IPC摄像机', '球型摄像机', '枪型摄像机', '半球摄像机']
    const manufacturers = ['海康威视', '大华', '宇视', '华为']
    const statuses = ['在线', '离线']
    const areas = ['区域1', '区域2', '区域3', '区域4', '区域5']
    const algorithms = ['人脸识别', '车辆识别', '行为分析', '物体检测']

    for (let i = 1; i <= 30; i++) {
      const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)]
      const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const area = areas[Math.floor(Math.random() * areas.length)]
      const algorithm = algorithms[Math.floor(Math.random() * algorithms.length)]
      
      const createTime = new Date(Date.now() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000))
      const updateTime = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))

      this.devices.push({
        id: i,
        device_name: `${area}摄像头${i.toString().padStart(2, '0')}`,
        device_sn: `SN${new Date().getFullYear()}${i.toString().padStart(4, '0')}`,
        device_type: deviceType,
        manufacturer: manufacturer,
        ip_address: `192.168.1.${100 + i}`,
        status: status,
        area: area,
        internal_code: `CODE-${i.toString().padStart(4, '0')}`,
        install_location: `楼宇${Math.floor(i/10) + 1}层${(i % 10) + 1}号房间`,
        install_time: createTime.toISOString().split('T')[0],
        line_info: `网线${i}号`,
        direction: ['朝向东', '朝向西', '朝向南', '朝向北'][Math.floor(Math.random() * 4)],
        related_camera_sn: `CAM-${i.toString().padStart(4, '0')}`,
        related_camera_name: `摄像头-${i}`,
        algorithm_model: algorithm,
        model_version: `V${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
        create_time: createTime.toLocaleString('zh-CN'),
        update_time: updateTime.toLocaleString('zh-CN')
      })
    }
  }

  getAllDevices() {
    return [...this.devices]
  }

  getDeviceById(id) {
    return this.devices.find(device => device.id === id)
  }

  addDevice(deviceData) {
    const newId = Math.max(0, ...this.devices.map(d => d.id)) + 1
    const newDevice = {
      id: newId,
      device_name: deviceData.device_name,
      device_sn: deviceData.device_sn,
      device_type: deviceData.device_type || 'IPC摄像机',
      manufacturer: deviceData.manufacturer,
      ip_address: deviceData.ip_address,
      status: deviceData.status || '在线',
      area: deviceData.area,
      internal_code: deviceData.internal_code,
      install_location: deviceData.install_location,
      install_time: deviceData.install_time,
      line_info: deviceData.line_info,
      direction: deviceData.direction,
      related_camera_sn: deviceData.related_camera_sn,
      related_camera_name: deviceData.related_camera_name,
      algorithm_model: deviceData.algorithm_model,
      model_version: deviceData.model_version,
      create_time: new Date().toLocaleString('zh-CN'),
      update_time: new Date().toLocaleString('zh-CN')
    }
    this.devices.unshift(newDevice)
    return newDevice
  }

  updateDevice(id, deviceData) {
    const index = this.devices.findIndex(device => device.id === id)
    if (index === -1) return false

    Object.assign(this.devices[index], {
      ...deviceData,
      update_time: new Date().toLocaleString('zh-CN')
    })
    return true
  }

  deleteDevice(id) {
    const index = this.devices.findIndex(device => device.id === id)
    if (index === -1) return false

    this.devices.splice(index, 1)
    return true
  }

  toggleDeviceStatus(id, status) {
    const device = this.devices.find(d => d.id === id)
    if (!device) return false

    device.status = status
    device.update_time = new Date().toLocaleString('zh-CN')
    return true
  }

  getDeviceStatistics() {
    const total = this.devices.length
    const online = this.devices.filter(d => d.status === '在线').length
    const offline = total - online

    return {
      total_devices: total,
      online_devices: online,
      offline_devices: offline,
      online_rate: total > 0 ? (online / total).toFixed(3) : 0
    }
  }

  // 批量添加设备
  batchAddDevices(devicesData) {
    const addedDevices = []
    devicesData.forEach(deviceData => {
      const newDevice = this.addDevice(deviceData)
      addedDevices.push(newDevice)
    })
    return addedDevices
  }

  // 导出设备列表数据
  exportDevicesData() {
    return this.devices.map(device => ({
      设备名称: device.device_name,
      设备序列号: device.device_sn,
      设备类型: device.device_type,
      制造商: device.manufacturer,
      IP地址: device.ip_address,
      状态: device.status,
      区域: device.area,
      安装位置: device.install_location,
      创建时间: device.create_time
    }))
  }

  // 同步设备数据
  syncDevicesFromPlatform() {
    // 模拟从平台同步的新设备
    const syncedDevices = []
    for (let i = 1; i <= 5; i++) {
      const syncedDevice = {
        device_name: `同步设备${i.toString().padStart(2, '0')}`,
        device_sn: `SYNC${new Date().getFullYear()}${i.toString().padStart(4, '0')}`,
        device_type: 'IPC摄像机',
        manufacturer: '海康威视',
        ip_address: `192.168.2.${100 + i}`,
        status: '在线',
        area: '同步区域',
        internal_code: `SYNC-${i.toString().padStart(4, '0')}`,
        install_location: `同步位置${i}`,
        install_time: new Date().toISOString().split('T')[0],
        line_info: `同步网线${i}号`,
        direction: '朝向东',
        related_camera_sn: `SYNC-CAM-${i.toString().padStart(4, '0')}`,
        related_camera_name: `同步摄像头-${i}`,
        algorithm_model: '人脸识别',
        model_version: 'V1.0.0'
      }
      const newDevice = this.addDevice(syncedDevice)
      syncedDevices.push(newDevice)
    }
    return syncedDevices
  }

  // 获取分析板卡数据
  getAnalysisCards() {
    return [
      { id: 1, name: '分析卡001', ip: '192.168.1.201', status: '在线', algorithm_count: 3, cpu_usage: '45%', memory_usage: '60%' },
      { id: 2, name: '分析卡002', ip: '192.168.1.202', status: '离线', algorithm_count: 1, cpu_usage: '0%', memory_usage: '0%' },
      { id: 3, name: '分析卡003', ip: '192.168.1.203', status: '在线', algorithm_count: 5, cpu_usage: '78%', memory_usage: '85%' },
      { id: 4, name: '分析卡004', ip: '192.168.1.204', status: '在线', algorithm_count: 2, cpu_usage: '32%', memory_usage: '45%' },
      { id: 5, name: '分析卡005', ip: '192.168.1.205', status: '在线', algorithm_count: 4, cpu_usage: '65%', memory_usage: '70%' }
    ]
  }

  // 获取摄像机列表（简化版）
  getCameras() {
    return this.devices.map(device => ({
      id: device.id,
      name: device.device_name,
      sn: device.device_sn,
      ip: device.ip_address,
      status: device.status,
      type: device.device_type,
      area: device.area,
      manufacturer: device.manufacturer
    }))
  }

  // 测试设备连接
  testDeviceConnection(deviceId) {
    const device = this.getDeviceById(deviceId)
    if (!device) return null

    // 模拟连接测试结果
    const isConnected = Math.random() > 0.2 // 80% 成功率
    const responseTime = Math.floor(Math.random() * 150) + 30 // 30-180ms

    return {
      device_id: deviceId,
      device_name: device.device_name,
      connected: isConnected,
      response_time: responseTime,
      test_time: new Date().toISOString().replace('T', ' ').split('.')[0],
      error_message: isConnected ? null : ['网络超时', '设备离线', '认证失败'][Math.floor(Math.random() * 3)]
    }
  }
}

export const deviceMockData = new DeviceMockData()