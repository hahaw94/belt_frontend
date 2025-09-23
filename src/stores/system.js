import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { systemAPI } from '@/api/system'
import { createFaviconFromImage, resetFavicon } from '@/utils/favicon'

/**
 * 系统配置Store
 * 功能：基础配置、版本管理、地图管理、时间同步、IP修改
 */
export const useSystemStore = defineStore('system', () => {
  // State
  const basicConfig = ref({
    system_name: '',
    platform_ip: '',
    platform_port: 8080,
    time_sync_enabled: true,
    ntp_server: '',
    timezone: 'Asia/Shanghai',
    max_camera_count: 1000,
    current_camera_count: 0
  })

  // 动态更新窗口尺寸
  const updateWindowSize = () => {
    if (typeof window !== 'undefined') {
      mapConfig.value.width = screen.availWidth || screen.width || window.innerWidth
      mapConfig.value.height = screen.availHeight || screen.height || window.innerHeight
    }
  }

  // 监听窗口大小变化
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateWindowSize)
  }
  
  const versionInfo = ref({
    version: '',        // 后端字段：软件版本号
    build_time: '',     // 后端字段：构建时间  
    go_version: '',     // 后端字段：Go运行时版本
    mysql: '',          // 后端字段：MySQL版本
    mongodb: ''         // 后端字段：MongoDB版本
  })
  
  const mapConfig = ref({
    background_image: '',
    width: screen.availWidth || screen.width || window.innerWidth,
    height: screen.availHeight || screen.height || window.innerHeight,
    camera_positions: []
  })
  
  // LOGO配置
  const logoConfig = ref({
    url: '',
    filename: '',
    size: 0,
    use_custom: false
  })
  
  const loading = ref(false)
  const ipChangeProgress = ref({
    isChanging: false,
    progress: 0,
    message: ''
  })
  const uploadProgress = ref({
    isUploading: false,
    progress: 0,
    message: ''
  })
  const backupProgress = ref({
    isCreating: false,
    progress: 0,
    message: ''
  })
  const upgradeProgress = ref({
    isUpgrading: false,
    progress: 0,
    message: ''
  })
  const syncProgress = ref({
    isSyncing: false,
    progress: 0,
    message: ''
  })

  // Getters
  const systemName = computed(() => basicConfig.value.system_name)
  const platformIp = computed(() => basicConfig.value.platform_ip)
  const platformPort = computed(() => basicConfig.value.platform_port)
  const currentVersion = computed(() => versionInfo.value.version)
  const cameraUsageRate = computed(() => {
    if (basicConfig.value.max_camera_count === 0) return 0
    return (basicConfig.value.current_camera_count / basicConfig.value.max_camera_count * 100).toFixed(1)
  })
  const mapBackgroundUrl = computed(() => mapConfig.value.background_image)
  const cameraPositions = computed(() => mapConfig.value.camera_positions)
  
  // Logo相关计算属性
  const currentLogoUrl = computed(() => {
    if (logoConfig.value.use_custom && logoConfig.value.url) {
      return logoConfig.value.url
    }
    return '/src/assets/logo.png' // 默认logo路径
  })
  
  const hasCustomLogo = computed(() => logoConfig.value.use_custom && logoConfig.value.url)

  // Actions
  /**
   * 获取系统基础配置
   */
  const fetchBasicConfig = async () => {
    loading.value = true
    try {
      const response = await systemAPI.getBasicConfig()
      if (response.success) {
        basicConfig.value = response.body
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取基础配置失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新系统基础配置
   * @param {Object} configData - 配置数据
   */
  const updateBasicConfig = async (configData) => {
    try {
      const response = await systemAPI.updateBasicConfig(configData)
      if (response.success) {
        basicConfig.value = { ...basicConfig.value, ...configData }
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('更新基础配置失败:', error)
      throw error
    }
  }

  /**
   * 一键修改平台IP
   * @param {Object} changeData - IP修改数据
   */
  const changePlatformIp = async (changeData) => {
    ipChangeProgress.value.isChanging = true
    ipChangeProgress.value.progress = 0
    ipChangeProgress.value.message = '开始修改IP地址...'
    
    try {
      const response = await systemAPI.changePlatformIp(changeData, (progress) => {
        ipChangeProgress.value.progress = progress
        if (progress < 50) {
          ipChangeProgress.value.message = '正在修改配置...'
        } else if (progress < 90) {
          ipChangeProgress.value.message = '正在重启服务...'
        } else {
          ipChangeProgress.value.message = '修改完成，请使用新地址访问'
        }
      })
      
      if (response.success) {
        ipChangeProgress.value.progress = 100
        ipChangeProgress.value.message = `IP修改成功，新地址: ${response.body.new_access_url}`
        
        // 更新本地配置
        basicConfig.value.platform_ip = response.body.new_ip
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('修改IP失败:', error)
      ipChangeProgress.value.message = '修改失败: ' + error.message
      throw error
    } finally {
      ipChangeProgress.value.isChanging = false
    }
  }

  /**
   * 执行时间同步
   * @param {Object} syncData - 同步数据
   */
  const performTimeSync = async (syncData) => {
    syncProgress.value.isSyncing = true
    syncProgress.value.progress = 0
    syncProgress.value.message = '开始时间同步...'
    
    try {
      const response = await systemAPI.performTimeSync(syncData, (progress) => {
        syncProgress.value.progress = progress
        if (progress < 30) {
          syncProgress.value.message = '正在连接NTP服务器...'
        } else if (progress < 70) {
          syncProgress.value.message = '正在同步设备时间...'
        } else {
          syncProgress.value.message = '时间同步完成'
        }
      })
      
      if (response.success) {
        syncProgress.value.progress = 100
        syncProgress.value.message = '时间同步成功'
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('时间同步失败:', error)
      syncProgress.value.message = '同步失败: ' + error.message
      throw error
    } finally {
      syncProgress.value.isSyncing = false
    }
  }

  /**
   * 获取系统版本信息
   */
  const fetchVersionInfo = async () => {
    try {
      const response = await systemAPI.getVersionInfo()
      if (response.success) {
        versionInfo.value = response.body
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取版本信息失败:', error)
      throw error
    }
  }

  /**
   * 备份系统版本
   * @param {Object} backupData - 备份数据
   */
  const createBackup = async (backupData) => {
    backupProgress.value.isCreating = true
    backupProgress.value.progress = 0
    backupProgress.value.message = '开始创建备份...'
    
    try {
      const response = await systemAPI.createBackup(backupData, (progress) => {
        backupProgress.value.progress = progress
        if (progress < 30) {
          backupProgress.value.message = '正在备份系统文件...'
        } else if (progress < 70) {
          backupProgress.value.message = '正在备份数据库...'
        } else {
          backupProgress.value.message = '正在压缩备份文件...'
        }
      })
      
      if (response.success) {
        backupProgress.value.progress = 100
        backupProgress.value.message = '备份创建成功'
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('创建备份失败:', error)
      backupProgress.value.message = '备份失败: ' + error.message
      throw error
    } finally {
      backupProgress.value.isCreating = false
    }
  }

  /**
   * 系统升级
   * @param {File} upgradeFile - 升级包文件
   * @param {Object} upgradeOptions - 升级选项
   */
  const upgradeSystem = async (upgradeFile, upgradeOptions = {}) => {
    upgradeProgress.value.isUpgrading = true
    upgradeProgress.value.progress = 0
    upgradeProgress.value.message = '开始上传升级包...'
    
    try {
      const response = await systemAPI.upgradeSystem(upgradeFile, upgradeOptions, (progress) => {
        upgradeProgress.value.progress = progress
        if (progress < 20) {
          upgradeProgress.value.message = '正在上传升级包...'
        } else if (progress < 40) {
          upgradeProgress.value.message = '正在验证升级包...'
        } else if (progress < 60) {
          upgradeProgress.value.message = '正在停止服务...'
        } else if (progress < 80) {
          upgradeProgress.value.message = '正在应用升级...'
        } else {
          upgradeProgress.value.message = '正在重启服务...'
        }
      })
      
      if (response.success) {
        upgradeProgress.value.progress = 100
        upgradeProgress.value.message = '系统升级成功'
        
        // 重新获取版本信息
        await fetchVersionInfo()
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('系统升级失败:', error)
      upgradeProgress.value.message = '升级失败: ' + error.message
      throw error
    } finally {
      upgradeProgress.value.isUpgrading = false
    }
  }

  /**
   * 获取地图配置
   */
  const fetchMapConfig = async () => {
    try {
      const response = await systemAPI.getMapConfig()
      if (response.success) {
        mapConfig.value = response.body
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取地图配置失败:', error)
      throw error
    }
  }

  /**
   * 上传地图背景图片
   * @param {File} backgroundFile - 背景图片文件
   */
  const uploadMapBackground = async (backgroundFile) => {
    uploadProgress.value.isUploading = true
    uploadProgress.value.progress = 0
    uploadProgress.value.message = '开始上传背景图片...'
    
    try {
      const response = await systemAPI.uploadMapBackground(backgroundFile, (progress) => {
        uploadProgress.value.progress = progress
        uploadProgress.value.message = `上传中... ${progress}%`
      })
      
      if (response.success) {
        uploadProgress.value.progress = 100
        uploadProgress.value.message = '上传成功'
        
        // 更新地图配置
        mapConfig.value.background_image = response.body.background_image
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('上传背景图片失败:', error)
      uploadProgress.value.message = '上传失败: ' + error.message
      throw error
    } finally {
      uploadProgress.value.isUploading = false
    }
  }

  /**
   * 更新摄像机点位信息
   * @param {Array} positions - 点位数组
   */
  const updateCameraPositions = async (positions) => {
    try {
      const response = await systemAPI.updateCameraPositions({ positions })
      if (response.success) {
        mapConfig.value.camera_positions = positions
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('更新摄像机点位失败:', error)
      throw error
    }
  }

  /**
   * 导出点位配置
   */
  const exportPositions = async () => {
    try {
      const response = await systemAPI.exportPositions()
      if (response.success) {
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('导出点位配置失败:', error)
      throw error
    }
  }

  /**
   * 导入点位配置
   * @param {File} configFile - 配置文件
   */
  const importPositions = async (configFile) => {
    try {
      const response = await systemAPI.importPositions(configFile)
      if (response.success) {
        // 重新获取地图配置
        await fetchMapConfig()
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('导入点位配置失败:', error)
      throw error
    }
  }

  /**
   * 添加摄像机点位
   * @param {Object} position - 点位数据
   */
  const addCameraPosition = (position) => {
    mapConfig.value.camera_positions.push({
      ...position,
      id: Date.now()
    })
  }

  /**
   * 删除摄像机点位
   * @param {number} deviceId - 设备ID
   */
  const removeCameraPosition = (deviceId) => {
    mapConfig.value.camera_positions = mapConfig.value.camera_positions.filter(
      pos => pos.device_id !== deviceId
    )
  }

  /**
   * 更新单个摄像机点位
   * @param {number} deviceId - 设备ID
   * @param {Object} position - 新位置
   */
  const updateSingleCameraPosition = (deviceId, position) => {
    const existingPosition = mapConfig.value.camera_positions.find(pos => pos.device_id === deviceId)
    if (existingPosition) {
      Object.assign(existingPosition, position)
    }
  }

  /**
   * 重置地图配置
   */
  const resetMapConfig = () => {
    mapConfig.value = {
      background_image: '',
      width: screen.availWidth || screen.width || window.innerWidth,
      height: screen.availHeight || screen.height || window.innerHeight,
      camera_positions: []
    }
  }

  /**
   * 获取当前LOGO配置
   */
  const fetchLogoConfig = async () => {
    try {
      loading.value = true
      const response = await systemAPI.getCurrentLogo()
      if (response.code === 200) {
        Object.assign(logoConfig.value, {
          ...response.data,
          use_custom: !!response.data.url
        })
        
        // 同步更新favicon
        await updateFaviconFromLogo()
      }
    } catch (error) {
      console.error('获取LOGO配置失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新LOGO配置（在LOGO上传后调用）
   */
  const updateLogoConfig = async (newLogoData) => {
    Object.assign(logoConfig.value, {
      ...newLogoData,
      use_custom: !!newLogoData.url
    })
    
    // 同步更新favicon
    await updateFaviconFromLogo()
  }

  /**
   * 删除自定义LOGO，恢复默认
   */
  const resetLogoConfig = async () => {
    logoConfig.value = {
      url: '',
      filename: '',
      size: 0,
      use_custom: false
    }
    
    // 恢复默认favicon
    resetFavicon()
  }

  /**
   * 根据当前logo更新favicon
   */
  const updateFaviconFromLogo = async () => {
    try {
      if (logoConfig.value.use_custom && logoConfig.value.url) {
        // 使用自定义logo作为favicon
        await createFaviconFromImage(logoConfig.value.url, 32)
      } else {
        // 使用默认favicon
        resetFavicon()
      }
    } catch (error) {
      console.error('更新favicon失败:', error)
      // 如果更新失败，使用默认favicon
      resetFavicon()
    }
  }

  /**
   * 清空上传进度
   */
  const clearUploadProgress = () => {
    uploadProgress.value = {
      isUploading: false,
      progress: 0,
      message: ''
    }
  }

  /**
   * 清空备份进度
   */
  const clearBackupProgress = () => {
    backupProgress.value = {
      isCreating: false,
      progress: 0,
      message: ''
    }
  }

  /**
   * 清空升级进度
   */
  const clearUpgradeProgress = () => {
    upgradeProgress.value = {
      isUpgrading: false,
      progress: 0,
      message: ''
    }
  }

  /**
   * 清空IP修改进度
   */
  const clearIpChangeProgress = () => {
    ipChangeProgress.value = {
      isChanging: false,
      progress: 0,
      message: ''
    }
  }

  /**
   * 清空同步进度
   */
  const clearSyncProgress = () => {
    syncProgress.value = {
      isSyncing: false,
      progress: 0,
      message: ''
    }
  }

  /**
   * 重置状态
   */
  const resetState = () => {
    basicConfig.value = {
      system_name: '',
      platform_ip: '',
      platform_port: 8080,
      time_sync_enabled: true,
      ntp_server: '',
      timezone: 'Asia/Shanghai',
      max_camera_count: 1000,
      current_camera_count: 0
    }
    versionInfo.value = {
      current_version: '',
      build_time: '',
      update_available: false,
      latest_version: '',
      update_notes: ''
    }
    resetMapConfig()
    resetLogoConfig()
    clearUploadProgress()
    clearBackupProgress()
    clearUpgradeProgress()
    clearIpChangeProgress()
    clearSyncProgress()
  }

  return {
    // State
    basicConfig,
    versionInfo,
    mapConfig,
    logoConfig,
    loading,
    ipChangeProgress,
    uploadProgress,
    backupProgress,
    upgradeProgress,
    syncProgress,
    
    // Getters
    systemName,
    platformIp,
    platformPort,
    currentVersion,
    cameraUsageRate,
    mapBackgroundUrl,
    cameraPositions,
    currentLogoUrl,
    hasCustomLogo,
    
    // Actions
    fetchBasicConfig,
    updateBasicConfig,
    changePlatformIp,
    performTimeSync,
    fetchVersionInfo,
    createBackup,
    upgradeSystem,
    fetchMapConfig,
    uploadMapBackground,
    updateCameraPositions,
    exportPositions,
    importPositions,
    addCameraPosition,
    removeCameraPosition,
    updateSingleCameraPosition,
    resetMapConfig,
    fetchLogoConfig,
    updateLogoConfig,
    resetLogoConfig,
    updateFaviconFromLogo,
    updateWindowSize,
    clearUploadProgress,
    clearBackupProgress,
    clearUpgradeProgress,
    clearIpChangeProgress,
    clearSyncProgress,
    resetState
  }
})