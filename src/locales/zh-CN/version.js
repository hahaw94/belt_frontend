export default {
  title: '版本管理',
  
  // 版本信息
  currentVersionInfo: '当前版本信息',
  refreshInfo: '刷新信息',
  appVersion: '应用版本',
  buildTime: '构建时间',
  goVersion: 'Go版本',
  operatingSystem: '操作系统',
  mysqlVersion: 'MySQL版本',
  mongodbVersion: 'MongoDB版本',
  redisVersion: 'Redis版本',
  minioStatus: 'MinIO状态',
  
  // 备份功能
  systemBackup: '系统备份',
  createBackup: '创建备份',
  backupFileName: '备份文件名',
  backupType: '备份类型',
  size: '大小',
  createTime: '创建时间',
  operations: '操作',
  restore: '恢复',
  
  // 备份类型
  fullBackup: '完整备份',
  databaseOnly: '仅数据库',
  configOnly: '仅配置',
  
  // 系统恢复
  systemRestore: '系统恢复',
  uploadBackupFile: '上传备份文件',
  dragOrClick: '将备份文件拖拽至此 或',
  clickToSelect: '点击选择文件',
  supportedFormats: '支持 .tar.gz、.zip、.sql 格式的备份文件',
  executeRestore: '执行恢复',
  clearFile: '清除文件',
  recordVersionInfoTitle: '1. 备份时记录版本信息',
  recordVersionInfoContent: '• 每个备份都会记录创建时的系统版本号<br/>• 版本信息存储在备份的元数据文件中<br/>• 包含系统版本、创建时间、创建者等信息',
  versionCompatibilityCheckTitle: '2. 恢复时的版本兼容性检查',
  versionCompatibilityCheckContent: '恢复过程中会进行以下检查：<br/><strong>检查流程：</strong><br/>• 读取备份文件中的版本信息<br/>• 获取当前系统版本<br/>• 进行版本兼容性分析<br/>• 根据检查结果决定是否允许恢复<br/><br/><strong>检查规则：</strong><br/><span style="color: #67C23A;">完全相同版本：直接允许，最安全</span><br/><span style="color: #E6A23C;">备份版本更高：警告但允许，可能需要后续升级</span><br/><span style="color: #E6A23C;">同主版本内：警告但允许，通常安全</span><br/><span style="color: #F56C6C;">跨主版本：错误级别，但可通过强制恢复</span>',
  
  // 系统升级
  systemUpgrade: '系统升级',
  dragUpgradePackage: '将升级包拖拽至此 或',
  upgradePackageFormats: '支持 .tar.gz、.zip 格式的升级包文件，文件大小不超过500MB',
  executeUpgrade: '执行升级',
  versionManagementRules: '版本号管理规则',
  versionNumberFormat: '版本号格式',
  versionNumberFormatContent: '系统采用标准的三段式版本号格式：主版本.次版本.补丁版本（如2.0.1），<br/>支持带v前缀的格式但会自动清理。',
  upgradeRules: '升级规则',
  upgradeRulesContent: '<strong>绝对禁止：</strong><br/>• 跨主版本升级（如1.x.x到2.x.x）<br/>• 任何形式的降级<br/><br/><strong>允许的升级：</strong><br/>• 补丁版本升级最安全，可直接进行<br/>• 次版本升级需要谨慎，最多允许跳跃2个版本（如1.2.x到1.4.x）<br/>• 超过2个版本跳跃会被拒绝，需要分步升级',
  securityMechanism: '安全机制',
  securityMechanismContent: '• 升级前会自动检查版本兼容性<br/>• 根据风险等级给出不同的处理建议（信息、警告、错误）<br/>• 默认在升级前创建系统备份<br/>• 支持升级失败时的自动回滚',
  
  // 按钮
  startRestore: '开始恢复',
  cancelRestore: '取消恢复',
  forceRestore: '强制恢复',
  
  // 提示信息
  versionCheckInfo: '版本检查信息',
  backupVersionCheck: '备份恢复中的版本检查',
  recordVersionInfo: '备份时记录版本信息',
  versionCompatibilityCheck: '恢复时的版本兼容性检查',
  
  // 消息提示
  backupCreatedSuccess: '备份创建成功',
  backupDeletedSuccess: '备份删除成功',
  restoreSuccess: '恢复成功',
  restoreFailed: '恢复失败',
  downloadingBackup: '正在下载备份文件...',
  uploadingBackup: '正在上传备份文件...',
  
  // 确认对话框
  confirmDeleteBackup: '确定要删除此备份吗？',
  confirmRestoreBackup: '确定要恢复此备份吗？',
  restoreWarning: '恢复操作将覆盖当前数据，请确保已做好备份',
}
