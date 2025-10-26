# 板卡管理 API 快速参考

## 📌 新 API 路径结构

### 接入管理（Access）
用于板卡设备的基础 CRUD 操作
```
基础路径: /api/v1/access/boards
```

### 实时监测（Monitor）
用于板卡推流控制和监控
```
基础路径: /api/v1/monitor/boards
```

## 🔧 常用 API 端点

### 板卡 CRUD
```javascript
// 获取列表
GET /api/v1/access/boards?page=1&page_size=10

// 创建板卡
POST /api/v1/access/boards

// 获取详情
GET /api/v1/access/boards/{id}

// 更新板卡
PUT /api/v1/access/boards/{id}

// 删除板卡
DELETE /api/v1/access/boards/{id}

// 批量创建
POST /api/v1/access/boards/batch
```

### 推流控制
```javascript
// 开始推流
POST /api/v1/monitor/boards/{id}/stream/start

// 停止推流
POST /api/v1/monitor/boards/{id}/stream/stop

// 获取流信息
GET /api/v1/monitor/boards/{id}/stream

// 获取所有活跃流
GET /api/v1/monitor/streams
```

## 📝 请求/响应示例

### 创建板卡请求
```json
{
  "device_name": "智能分析板卡-01",
  "device_number": "BOARD-001",
  "device_ip": "192.168.1.100",
  "rtsp_port": 554,
  "rtsp_username": "admin",
  "rtsp_password": "admin123",
  "rtsp_path": "/streaming/channels/101"
}
```

### 列表响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "page_size": 10
  }
}
```

## 🔍 查询参数

| 参数 | 类型 | 说明 |
|-----|------|------|
| page | int | 页码（默认1） |
| page_size | int | 每页数量（默认10） |
| keyword | string | 关键词搜索（设备名称/编号/IP） |
| device_status | string | 设备状态（online/offline/error） |
| stream_status | string | 推流状态（streaming/stopped/error） |

## 🎯 前端调用示例

```javascript
import { deviceApi } from '@/api/device'

// 获取板卡列表
const response = await deviceApi.getBoardList({
  page: 1,
  page_size: 10,
  keyword: '板卡',
  device_status: 'online'
})

// 创建板卡
const newBoard = await deviceApi.createBoard({
  device_name: '新板卡',
  device_number: 'BOARD-002',
  device_ip: '192.168.1.101',
  rtsp_port: 554
})

// 开始推流
await deviceApi.startBoardStream(boardId)

// 停止推流
await deviceApi.stopBoardStream(boardId)

// 获取流信息
const streamInfo = await deviceApi.getBoardStreamInfo(boardId)
```

## ⚠️ 注意事项

1. **所有 API 都需要认证**：请求头需携带 `Authorization: Bearer {token}`
2. **参数命名规则**：后端使用下划线（snake_case），前端使用驼峰（camelCase）
3. **权限要求**：
   - 接入管理需要 `module:access` 权限
   - 实时监测需要 `module:monitor` 权限
4. **代理配置**：开发环境下 API 请求会通过 Vue 代理转发到后端

## 📂 相关文件

- API 配置：`belt/src/api/device.js`
- 页面组件：`belt/src/views/access/DeviceManagement.vue`
- 详细文档：`belt/BOARD_API_UPDATE_SUMMARY.md`
- 后端路由：`smart-video-platform/cmd/main.go` (line 456-475)

## 🆚 与旧版本对比

| 操作 | 旧路径 | 新路径 |
|-----|--------|--------|
| 获取列表 | `/api/v1/algorithm/boards` | `/api/v1/access/boards` |
| 推流控制 | `/api/v1/algorithm/boards/{id}/stream/start` | `/api/v1/monitor/boards/{id}/stream/start` |

---

最后更新：2025-10-23

