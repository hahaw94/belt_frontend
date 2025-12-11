# 平台前端 API 接口文档

## 目录
- [首页 (HomeView)](#首页-homeview)
- [系统配置 (SystemConfig)](#系统配置-systemconfig)
- [算法管理 (AlgorithmManagement)](#算法管理-algorithmmanagement)
- [用户管理 (UserManagement)](#用户管理-usermanagement)
- [接入管理 (AccessManagement)](#接入管理-accessmanagement)
- [实时检测 (RealtimeDetection)](#实时检测-realtimedetection)
- [事件中心 (EventCenter)](#事件中心-eventcenter)

---

## 首页 (HomeView)

### 数据看板相关
**API文件**: `src/api/dashboard.js`

| 接口路径 | 方法 | 说明 | 使用位置 |
|---------|------|------|---------|
| `/api/dashboard/overview` | GET | 获取首页数据看板概览 | 首页统计数据 |
| `/api/dashboard/cad-map` | GET | 获取CAD图层信息 | 地图背景 |
| `/api/dashboard/camera-live/{deviceId}` | GET | 获取指定摄像头实时画面 | 摄像头实时视频 |

### 设备相关
**API文件**: `src/api/device.js`

| 接口路径 | 方法 | 说明 | 使用位置 |
|---------|------|------|---------|
| `/api/devices` | GET | 获取设备列表 | 设备信息展示 |

### 地图相关
**API文件**: `src/api/map.js`

| 接口路径 | 方法 | 说明 | 使用位置 |
|---------|------|------|---------|
| `/api/v1/map/layers/{layerId}/cameras` | GET | 获取图层摄像头 | 地图摄像头标注 |

### 事件相关
**API文件**: `src/api/event.js`

| 接口路径 | 方法 | 说明 | 使用位置 |
|---------|------|------|---------|
| `/api/v1/alarms` | GET | 获取告警列表 | 首页告警统计 |

### GB28181相关
**API文件**: `src/api/system.js`

| 接口路径 | 方法 | 说明 | 使用位置 |
|---------|------|------|---------|
| `/api/v1/video/cameras` | GET | 获取GB28181摄像头列表 | 摄像头管理 |

---

## 系统配置 (SystemConfig)

### 基础管理
**API文件**: `src/api/system.js`

#### NTP时间同步
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/system/ntp/config` | GET | 获取NTP配置 |
| `/api/v1/system/ntp/config` | POST | 设置NTP配置 |

#### 网络配置
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/system/network/config` | GET | 获取网络配置 |

#### GB28181平台
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/system/gb28181/platforms` | GET | 获取GB28181平台列表 |

#### 视频存储
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/system/video-storage/config` | GET | 获取视频存储配置 |

#### 系统控制
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/system/restart` | POST | 重启服务 |
| `/api/v1/system/reboot` | POST | 重启服务器 |

### 版本管理
**API文件**: `src/api/system.js`

#### 版本信息
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/system/version` | GET | 获取版本信息 |

#### 备份管理
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/system/backup/list` | GET | 获取备份列表 |
| `/api/v1/system/backup/create` | POST | 创建系统备份 |
| `/api/v1/system/backup/restore` | POST | 恢复系统备份 |
| `/api/v1/system/backup/one-click-restore` | POST | 一键恢复 |
| `/api/v1/system/backup/{fileName}` | DELETE | 删除备份 |

#### MinIO存储
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/system/minio/buckets` | GET | 获取MinIO存储桶信息 |

#### 系统升级
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/system/upgrade` | POST | 升级系统 |

### 平台管理
**API文件**: `src/api/map.js`

| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/map/layers` | GET | 获取图层列表 |
| `/api/v1/map/layers` | POST | 创建图层 |
| `/api/v1/map/layers/{id}` | PUT | 更新图层 |
| `/api/v1/map/layers/{id}` | DELETE | 删除图层 |
| `/api/v1/map/layers/{id}/upload` | POST | 上传图层图片 |

---

## 算法管理 (AlgorithmManagement)

**API文件**: `src/api/algorithm.js`

### 算法模型管理
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/algorithms` | GET | 获取算法列表 |
| `/api/algorithms/upload` | POST | 上传算法文件 |
| `/api/algorithms/{algorithmId}` | PUT | 更新算法信息 |
| `/api/algorithms/{algorithmId}` | DELETE | 删除算法模型 |

### 算法下发
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/algorithms/dispatch` | POST | 执行算法下发 |
| `/api/algorithms/batch-dispatch` | POST | 批量下发算法模型 |
| `/api/algorithms/dispatch-logs` | GET | 获取下发日志 |

### 算法配置
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/algorithms/config` | POST | 配置智能分析规则 |
| `/api/algorithms/sync-rules` | POST | 同步规则到分析板 |

### 设备相关
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/devices/analysis-cards` | GET | 获取智能分析板卡列表 |
| `/api/devices/cameras` | GET | 获取摄像机列表 |

---

## 用户管理 (UserManagement)

### 用户管理
**API文件**: `src/api/user.js`

#### 用户CRUD
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/users` | GET | 获取用户列表 |
| `/api/v1/users` | POST | 创建用户 |
| `/api/v1/users/{userId}` | PUT | 编辑用户信息 |
| `/api/v1/users/{userId}` | DELETE | 删除用户 |
| `/api/v1/users/batch` | DELETE | 批量删除用户 |

#### 用户操作
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/users/{userId}/lock` | PUT | 锁定用户 |
| `/api/v1/users/{userId}/unlock` | PUT | 解锁用户 |
| `/api/v1/users/{userId}/reset-password` | PUT | 重置用户密码 |

#### 批量操作
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/users/batch-create` | POST | 批量创建用户 |

### 角色管理
**API文件**: `src/api/user.js`

#### 角色CRUD
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/roles` | GET | 获取角色列表 |
| `/api/v1/roles` | POST | 创建角色 |
| `/api/v1/roles/{roleId}` | GET | 获取角色详情 |
| `/api/v1/roles/{roleId}` | PUT | 更新角色 |
| `/api/v1/roles/{roleId}` | DELETE | 删除角色 |

#### 权限管理
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/permissions` | GET | 获取权限列表 |
| `/api/v1/roles/{roleId}/permissions` | PUT | 设置角色权限 |

#### 角色分配
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/users/{userId}/roles` | POST | 分配用户角色 |

### 认证相关
**API文件**: `src/api/user.js`

| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/auth/login` | POST | 用户登录 |
| `/api/v1/auth/logout` | POST | 用户登出 |
| `/api/v1/auth/verify` | POST | Token验证 |
| `/api/v1/auth/refresh` | POST | 刷新Token |
| `/api/v1/auth/userinfo` | GET | 获取当前用户信息 |
| `/api/v1/auth/change-password` | PUT | 修改密码 |

---

## 接入管理 (AccessManagement)

### 板卡管理
**API文件**: `src/api/device.js`

#### 板卡CRUD
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/access/boards` | GET | 获取板卡设备列表 |
| `/api/v1/access/boards` | POST | 创建板卡设备 |
| `/api/v1/access/boards/{boardId}` | GET | 获取板卡设备详情 |
| `/api/v1/access/boards/{boardId}` | PUT | 更新板卡设备 |
| `/api/v1/access/boards/{boardId}` | DELETE | 删除板卡设备 |

#### 板卡操作
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/access/boards/{boardId}/reboot` | POST | 重启板卡 |
| `/api/v1/access/boards/{boardId}/firmware/upgrade` | POST | 固件升级 |
| `/api/v1/access/boards/{boardId}/firmware/status` | GET | 获取升级状态 |

#### 推流控制
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/monitor/boards/{boardId}/stream/start` | POST | 启动推流 |
| `/api/v1/monitor/boards/{boardId}/stream/stop` | POST | 停止推流 |
| `/api/v1/monitor/boards/{boardId}/stream/status` | GET | 获取推流状态 |

### 摄像头管理
**API文件**: `src/api/system.js`

#### 摄像头CRUD
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/video/cameras` | GET | 获取摄像头列表 |
| `/api/v1/video/cameras/by-category` | GET | 按分类获取摄像头 |
| `/api/v1/video/cameras/unbound` | GET | 获取未绑定摄像头 |
| `/api/v1/video/cameras/by-layer` | GET | 获取图层摄像头 |

#### 摄像头操作
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/video/cameras/{id}/category` | PUT | 更新摄像头分类 |
| `/api/v1/video/cameras/{id}/bind` | POST | 绑定摄像头到图层 |
| `/api/v1/video/cameras/{id}/unbind` | DELETE | 解绑摄像头 |
| `/api/v1/video/cameras/{id}/position` | PUT | 更新摄像头位置 |
| `/api/v1/video/cameras/{id}/sync` | POST | 单个摄像头同步 |
| `/api/v1/video/cameras/smart-sync` | POST | 智能同步摄像头 |

### GB28181设备管理
**API文件**: `src/api/system.js`

#### 设备管理
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/video/devices` | GET | 获取GB28181设备列表 |
| `/api/v1/video/devices` | POST | 创建设备 |
| `/api/v1/video/devices/{id}` | POST | 更新设备 |
| `/api/v1/video/devices/{id}` | DELETE | 删除设备 |
| `/api/v1/video/devices/{id}/channels` | GET | 获取设备通道 |

#### 通道管理
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/video/devices/{deviceId}/channels` | POST | 创建通道 |
| `/api/v1/video/channels/{id}` | POST | 更新通道 |
| `/api/v1/video/channels/{id}` | DELETE | 删除通道 |
| `/api/v1/video/channels/{channelId}/records` | GET | 获取录像列表 |

---

## 实时检测 (RealtimeDetection)

**API文件**: `src/api/detection.js`

### 实时视频流
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/detection/video-stream/{deviceId}` | GET | 获取实时视频流 |
| `/api/detection/multi-streams` | GET | 获取多路视频流 |

### 检测控制
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/detection/real-time` | GET | 获取实时检测状态 |
| `/api/detection/start` | POST | 开始实时检测 |
| `/api/detection/stop` | POST | 停止实时检测 |

### 预警信息
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/detection/warnings` | GET | 获取实时预警信息 |

### PTZ控制
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/detection/ptz-control/{deviceId}` | POST | 摄像头云镜控制 |

### 录像回放
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/recordings` | GET | 获取录像列表 |
| `/api/v1/recordings/upload` | POST | 上传录像 |
| `/api/v1/recordings/{id}` | GET | 获取录像详情 |
| `/api/v1/recordings/{id}` | DELETE | 删除录像 |
| `/api/v1/recordings/{id}/play` | GET | 获取录像播放地址 |
| `/api/v1/recordings/by-alarm/{alarmId}` | GET | 根据告警ID获取录像 |
| `/api/v1/recordings/statistics` | GET | 获取录像统计信息 |

---

## 事件中心 (EventCenter)

### 告警信息管理
**API文件**: `src/api/event.js`

#### 告警查询
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/alarms` | GET | 获取告警列表 |
| `/api/v1/alarms/{alarmId}` | GET | 获取告警详情 |
| `/api/v1/alarms/statistics` | GET | 获取告警统计 |

#### 告警处理
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/alarms/{alarmId}/handle` | POST | 处理告警 |
| `/api/v1/alarms/batch-handle` | POST | 批量处理告警（通过ID列表）|
| `/api/v1/alarms/batch-mark-false-positive` | POST | 批量标记误报（通过筛选条件）|
| `/api/v1/alarms/batch/mark-false-positive` | POST | 批量标记误报（按条件）|
| `/api/v1/alarms/batch/mark-false-positive-by-ids` | POST | 批量标记误报（按ID列表）|

### 误报样本管理
**API文件**: `src/api/event.js`

#### 样本导出
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/alarms/false-positives/export` | POST | 导出误报样本 |
| `/api/v1/alarms/false-positives/package` | POST | 打包误报样本 |

#### 样本统计
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/alarms/false-positives/stats` | GET | 获取误报样本统计信息 |
| `/api/v1/alarms/false-positives/count` | GET | 统计误报数量 |

### 训练平台配置
**API文件**: `src/api/event.js`

| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/training-platform/config` | GET | 获取训练平台配置 |
| `/api/v1/training-platform/config` | POST | 保存训练平台配置 |
| `/api/v1/training-platform/config/exists` | GET | 检查训练平台配置是否存在 |

### 告警类型管理
**API文件**: `src/api/event.js`

| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/alarm-types` | GET | 获取告警类型列表 |
| `/api/v1/alarm-types` | POST | 创建告警类型 |
| `/api/v1/alarm-types/{id}` | PUT | 更新告警类型 |
| `/api/v1/alarm-types/{id}` | DELETE | 删除告警类型 |
| `/api/v1/alarm-types/dict` | GET | 获取告警类型字典 |

### 联动设置
**API文件**: `src/api/event.js`

#### 联动预案
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/linkage/plans` | GET | 获取联动预案列表 |
| `/api/v1/linkage/plans` | POST | 创建联动预案 |
| `/api/v1/linkage/plans/{id}` | GET | 获取联动预案详情 |
| `/api/v1/linkage/plans/{id}` | PUT | 更新联动预案 |
| `/api/v1/linkage/plans/{id}` | DELETE | 删除联动预案 |
| `/api/v1/linkage/plans/{id}/apply` | POST | 应用预案到板卡 |

#### 联动规则
| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/api/v1/linkage/rules` | GET | 获取联动规则列表 |
| `/api/v1/linkage/rules/by-boards` | GET | 按板卡获取规则 |
| `/api/v1/linkage/rules/{id}` | DELETE | 删除联动规则 |
| `/api/v1/linkage/boards/rules/edit` | POST | 编辑板卡规则 |

---

## 附录

### API基础配置
**文件**: `src/api/index.js`

- **基础URL**: 通过环境变量配置
- **请求超时**: 30秒
- **认证方式**: Bearer Token (存储在 localStorage)
- **响应拦截**: 统一处理错误码和Token过期

### 通用响应格式
```json
{
  "code": 200,
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

### 分页参数
大部分列表接口支持分页：
- `page`: 页码（从1开始）
- `page_size` 或 `size`: 每页数量
- 响应包含: `total`, `page`, `page_size`

### 文件上传
使用 `multipart/form-data` 格式：
- 算法文件上传
- 录像文件上传
- 图层图片上传
- 固件升级文件

---

**文档生成时间**: 2024-12-10  
**版本**: v1.0  
**维护**: 前端开发团队
