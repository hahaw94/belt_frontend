export default {
  // 算法管理
  algorithmManagement: '算法管理',
  algorithmWarehouse: '算法仓',
  algorithmConfig: '算法配置',
  
  // 算法仓
  warehouse: {
    title: '算法仓',
    uploadAlgorithm: '算法模型上传',
    algorithmName: '算法名称',
    algorithmType: '算法类型',
    algorithmVersion: '算法版本',
    modelFile: '模型文件',
    configFile: '配置文件',
    description: '算法描述',
    uploadTime: '上传时间',
    fileSize: '文件大小',
    pleaseInputAlgorithmName: '请输入算法名称',
    pleaseSelectAlgorithmType: '请选择算法类型',
    pleaseUploadModelFile: '请上传模型文件',
    uploadNote: '上传说明',
    uploadDesc: '支持手动上传算法模型文件，也支持训练平台自动下发。算法模型文件支持 .zip、.tar、.gz 等压缩包格式。',
    uploadTip: '支持 .zip、.tar、.gz 压缩包或 .py、.sh、.bin 脚本文件，单文件大小不超过 500MB'
  },
  
  // 算法配置
  config: {
    title: '算法配置',
    selectAlgorithm: '选择算法',
    configParams: '配置参数',
    threshold: '阈值',
    confidence: '置信度',
    detectArea: '检测区域',
    saveConfig: '保存配置',
    resetConfig: '重置配置'
  },
  
  // 算法管理
  algorithm: {
    title: '算法配置',
    dispatch: '算法下发',
    dispatchNote: '下发说明',
    dispatchDesc: '选择算法模型和目标智能分析板卡，将算法下发到指定设备进行智能分析。下发过程可能需要几分钟时间。',
    selectAlgorithm: '选择算法',
    targetBoard: '目标板卡',
    syncRules: '同步规则',
    syncRulesDesc: '下发后同步配置规则',
    autoRestart: '自动重启',
    autoRestartDesc: '下发后自动重启板卡',
    versionList: '算法版本列表',
    addAlgorithm: '添加算法',
    batchImport: '批量导入'
  }
}
