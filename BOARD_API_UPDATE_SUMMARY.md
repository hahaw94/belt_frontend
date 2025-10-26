# 板卡管理 API 路径更新总结

## 更新日期
2025-10-23

## 更新原因
后端将板卡管理相关的 API 路径进行了重构和修正，将原有的 `/api/v1/algorithm/boards/*` 路径拆分为两个不同职责的路径：
- `/api/v1/access/boards/*` - 板卡设备的基础管理（增删改查）
- `/api/v1/monitor/boards/*` - 板卡设备的监控和推流控制

注意：完整的 API 路径包含 `/api/v1` 前缀。

## API 路径变更对照表

### 板卡基础管理（/api/v1/access/boards）

| 功能 | 旧路径 | 新路径 | 方法 |
|-----|--------|--------|------|
| 获取板卡列表 | `/api/v1/algorithm/boards` | `/api/v1/access/boards` | GET |
| 创建板卡 | `/api/v1/algorithm/boards` | `/api/v1/access/boards` | POST |
| 获取板卡详情 | `/api/v1/algorithm/boards/{id}` | `/api/v1/access/boards/{id}` | GET |
| 更新板卡 | `/api/v1/algorithm/boards/{id}` | `/api/v1/access/boards/{id}` | PUT |
| 删除板卡 | `/api/v1/algorithm/boards/{id}` | `/api/v1/access/boards/{id}` | DELETE |
| 批量创建板卡 | `/api/v1/algorithm/boards/batch` | `/api/v1/access/boards/batch` | POST |
| 上传绑定信息 | `/api/v1/algorithm/boards/upload-binding` | `/api/v1/access/boards/upload-binding` | POST |
| 固件升级 | `/api/v1/algorithm/boards/{id}/upgrade` | `/api/v1/access/boards/{id}/upgrade` | POST |
| 获取升级状态 | `/api/v1/algorithm/boards/{id}/upgrade/status` | `/api/v1/access/boards/{id}/upgrade/status` | GET |
| 获取统计信息 | `/api/v1/algorithm/boards/stats` | `/api/v1/access/boards/stats` | GET |
| 测试连接 | `/api/v1/algorithm/boards/{id}/test-connection` | `/api/v1/access/boards/{id}/test-connection` | POST |
| 绑定摄像机 | `/api/v1/algorithm/boards/{id}/cameras` | `/api/v1/access/boards/{id}/cameras` | POST |
| 解绑摄像机 | `/api/v1/algorithm/boards/{id}/cameras/{cameraId}` | `/api/v1/access/boards/{id}/cameras/{cameraId}` | DELETE |
| 获取关联摄像机 | `/api/v1/algorithm/boards/{id}/cameras` | `/api/v1/access/boards/{id}/cameras` | GET |

### 板卡监控控制（/api/v1/monitor/boards）

| 功能 | 旧路径 | 新路径 | 方法 |
|-----|--------|--------|------|
| 开始推流 | `/api/v1/algorithm/boards/{id}/stream/start` | `/api/v1/monitor/boards/{id}/stream/start` | POST |
| 停止推流 | `/api/v1/algorithm/boards/{id}/stream/stop` | `/api/v1/monitor/boards/{id}/stream/stop` | POST |
| 获取流信息 | `/api/v1/algorithm/boards/{id}/stream` | `/api/v1/monitor/boards/{id}/stream` | GET |
| 获取所有算法流 | `/api/v1/algorithm/streams` | `/api/v1/monitor/streams` | GET |

## 更新的文件

### 1. belt/src/api/device.js
更新了所有板卡管理相关的 API 路径，包括：
- 基础 CRUD 操作
- 批量操作
- 推流控制
- 摄像机绑定

添加了注释说明新的路径结构：
```javascript
// ==================== 智能板卡管理 ====================
// 注意：后端API路径已更新
// - 板卡基础管理：/api/v1/access/boards/*
// - 推流控制：/api/v1/monitor/boards/*
```

### 2. belt/src/views/access/DeviceManagement.vue
此文件无需修改，因为它已经通过 `deviceApi` 间接调用 API，所以 API 路径的更新会自动生效。

## 后端 API 参数格式

### 请求参数（创建/更新板卡）
```json
{
  "device_name": "智能分析板卡-01",
  "device_number": "BOARD-001",
  "device_ip": "192.168.1.100",
  "rtsp_port": 554,
  "rtsp_username": "admin",
  "rtsp_password": "admin123",
  "rtsp_path": "/streaming/channels/101",
  "bound_camera_name": "摄像头-01",
  "algorithm_model_type": "object_detection",
  "algorithm_model_version": "v1.0.0",
  "description": "描述信息"
}
```

### 响应数据格式
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "device_name": "智能分析板卡-01",
    "device_number": "BOARD-001",
    "device_ip": "192.168.1.100",
    "rtsp_port": 554,
    "rtsp_username": "admin",
    "rtsp_path": "/streaming/channels/101",
    "device_status": "online",
    "stream_status": "stopped",
    "bound_camera_name": "摄像头-01",
    "algorithm_model_type": "object_detection",
    "algorithm_model_version": "v1.0.0",
    "description": "描述信息",
    "is_active": true,
    "created_at": "2025-10-23T10:30:00Z",
    "updated_at": "2025-10-23T10:30:00Z"
  }
}
```

### 列表查询参数
```
GET /api/v1/access/boards?page=1&page_size=10&keyword=板卡&device_status=online&stream_status=streaming
```

参数说明：
- `page`: 页码（从1开始）
- `page_size`: 每页数量
- `keyword`: 搜索关键词（匹配设备名称、设备编号、设备IP）
- `device_status`: 设备状态（online/offline/error）
- `stream_status`: 推流状态（streaming/stopped/error）

## 注意事项

1. **路径分离**：新的 API 路径将板卡管理分为了两个职责域：
   - `/api/v1/access/boards/*` 负责设备的接入和基础管理
   - `/api/v1/monitor/boards/*` 负责设备的监控和推流控制

2. **参数命名**：后端使用下划线命名法（snake_case），前端使用驼峰命名法（camelCase），在 API 调用时需要做好映射。

3. **兼容性**：DeviceManagement.vue 中的代码已经做好了字段映射处理，可以兼容两种命名方式。

4. **代理配置**：如果在开发环境中遇到 404 错误，需要检查 `vue.config.js` 中的代理配置是否正确。

## 测试建议

1. 测试板卡列表查询（带分页和筛选）
2. 测试板卡创建和更新
3. 测试板卡删除
4. 测试推流启动和停止
5. 测试流信息查询
6. 测试板卡详情查询

## 相关文档

- 后端简易测试页面：`smart-video-platform/web/index.html`
- 前端 API 配置：`belt/src/api/device.js`
- 前端设备管理页面：`belt/src/views/access/DeviceManagement.vue`

