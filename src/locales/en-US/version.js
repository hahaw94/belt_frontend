export default {
  title: 'Version Management',
  
  // Version info
  currentVersionInfo: 'Current Version Info',
  refreshInfo: 'Refresh Info',
  appVersion: 'App Version',
  buildTime: 'Build Time',
  goVersion: 'Go Version',
  operatingSystem: 'Operating System',
  mysqlVersion: 'MySQL Version',
  mongodbVersion: 'MongoDB Version',
  redisVersion: 'Redis Version',
  minioStatus: 'MinIO Status',
  
  // Backup function
  systemBackup: 'System Backup',
  createBackup: 'Create Backup',
  backupFileName: 'Backup File Name',
  backupType: 'Backup Type',
  size: 'Size',
  createTime: 'Create Time',
  operations: 'Operations',
  restore: 'Restore',
  
  // Backup types
  fullBackup: 'Full Backup',
  databaseOnly: 'Database Only',
  configOnly: 'Config Only',
  
  // System restore
  systemRestore: 'System Restore',
  uploadBackupFile: 'Upload Backup File',
  dragOrClick: 'Drag backup file here or',
  clickToSelect: 'click to select file',
  supportedFormats: 'Supports .tar.gz, .zip, .sql format backup files',
  executeRestore: 'Execute Restore',
  clearFile: 'Clear File',
  recordVersionInfoTitle: '1. Record Version Info When Backing Up',
  recordVersionInfoContent: '• Each backup records the system version at creation time<br/>• Version info is stored in backup metadata file<br/>• Includes system version, creation time, creator, etc.',
  versionCompatibilityCheckTitle: '2. Version Compatibility Check When Restoring',
  versionCompatibilityCheckContent: 'The following checks are performed during restore:<br/><strong>Check Process:</strong><br/>• Read version info from backup file<br/>• Get current system version<br/>• Perform version compatibility analysis<br/>• Decide whether to allow restore based on check results<br/><br/><strong>Check Rules:</strong><br/><span style="color: #67C23A;">Exact same version: Directly allowed, safest</span><br/><span style="color: #E6A23C;">Backup version higher: Warning but allowed, may need subsequent upgrade</span><br/><span style="color: #E6A23C;">Same major version: Warning but allowed, usually safe</span><br/><span style="color: #F56C6C;">Cross major version: Error level, but can force restore</span>',
  
  // System upgrade
  systemUpgrade: 'System Upgrade',
  dragUpgradePackage: 'Drag upgrade package here or',
  upgradePackageFormats: 'Supports .tar.gz, .zip format upgrade package files, file size not exceeding 500MB',
  executeUpgrade: 'Execute Upgrade',
  versionManagementRules: 'Version Management Rules',
  versionNumberFormat: 'Version Number Format',
  versionNumberFormatContent: 'The system uses standard three-part version format: major.minor.patch (e.g., 2.0.1),<br/>Supports v-prefix format but will be automatically cleaned.',
  upgradeRules: 'Upgrade Rules',
  upgradeRulesContent: '<strong>Absolutely Prohibited:</strong><br/>• Cross major version upgrade (e.g., 1.x.x to 2.x.x)<br/>• Any form of downgrade<br/><br/><strong>Allowed Upgrades:</strong><br/>• Patch version upgrade is safest, can proceed directly<br/>• Minor version upgrade needs caution, max 2 version jumps allowed (e.g., 1.2.x to 1.4.x)<br/>• More than 2 version jumps will be rejected, need step-by-step upgrade',
  securityMechanism: 'Security Mechanism',
  securityMechanismContent: '• Version compatibility check before upgrade<br/>• Different handling suggestions based on risk level (info, warning, error)<br/>• Create system backup before upgrade by default<br/>• Support automatic rollback on upgrade failure',
  
  // Buttons
  startRestore: 'Start Restore',
  cancelRestore: 'Cancel Restore',
  forceRestore: 'Force Restore',
  
  // Tips
  versionCheckInfo: 'Version Check Info',
  backupVersionCheck: 'Version Check in Backup Restore',
  recordVersionInfo: 'Record Version Info When Backing Up',
  versionCompatibilityCheck: 'Version Compatibility Check When Restoring',
  
  // Messages
  backupCreatedSuccess: 'Backup created successfully',
  backupDeletedSuccess: 'Backup deleted successfully',
  restoreSuccess: 'Restore successful',
  restoreFailed: 'Restore failed',
  downloadingBackup: 'Downloading backup file...',
  uploadingBackup: 'Uploading backup file...',
  
  // Confirm dialogs
  confirmDeleteBackup: 'Are you sure you want to delete this backup?',
  confirmRestoreBackup: 'Are you sure you want to restore this backup?',
  restoreWarning: 'Restore operation will overwrite current data, please make sure you have backed up',
}
