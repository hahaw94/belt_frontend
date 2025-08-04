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
}

export const deviceMockData = new DeviceMockData()