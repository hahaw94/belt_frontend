# 录像管理 API 对齐修复总结

## 修复时间
2025-10-10

## 问题背景
前端 `VideoPlayback.vue` 与后端录像管理 API 的响应格式不一致，导致数据解析错误。

## 后端 API 规范

### 1. 通用响应格式
```json
{
  "code": 200,           // 成功时为 200，错误时为其他值
  "message": "success",  // 消息文本
  "data": { ... }        // 实际数据
}
```

**注意**：后端成功响应的 `code` 是 **200**，不是 0！

### 2. API 接口详情

#### 2.1 上传录像
- **接口**：`POST /api/v1/recordings/upload`
- **请求参数**：
  - `title` (必填): 视频标题
  - `description` (可选): 视频描述
  - `file` (必填): 视频文件
- **响应格式**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "视频标题",
    "file_name": "video.mp4",
    "file_size": 1024000,
    "file_url": "http://...",
    "message": "视频上传成功"
  }
}
```

#### 2.2 获取录像列表
- **接口**：`GET /api/v1/recordings`
- **查询参数**：
  - `page` (可选): 页码，默认 1
  - `page_size` (可选): 每页数量，默认 10
  - `title` (可选): 标题搜索
  - `format` (可选): 格式筛选
  - `uploader_id` (可选): 上传者ID
- **响应格式**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "title": "视频标题",
        "description": "视频描述",
        "file_name": "video.mp4",
        "file_size": 1024000,
        "file_size_str": "1.00 MB",
        "duration": 120,
        "duration_str": "00:02:00",
        "format": "mp4",
        "resolution": "1920x1080",
        "bitrate": 2000,
        "file_url": "http://...",
        "status": 1,
        "upload_time": "2024-01-01 12:00:00",
        "uploader_id": 1,
        "create_time": "2024-01-01 12:00:00"
      }
    ],
    "page": 1,
    "page_size": 10
  }
}
```

#### 2.3 获取播放地址
- **接口**：`GET /api/v1/recordings/{id}/play`
- **路径参数**：
  - `id`: 录像ID
- **响应格式**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "视频标题",
    "file_url": "http://...",
    "format": "mp4",
    "duration": 120,
    "file_size": 1024000,
    "resolution": "1920x1080",
    "message": "获取播放地址成功"
  }
}
```

#### 2.4 删除录像
- **接口**：`DELETE /api/v1/recordings/{id}`
- **路径参数**：
  - `id`: 录像ID
- **响应格式**：
```json
{
  "code": 200,
  "message": "视频删除成功",
  "data": null
}
```

## 前端修复内容

### 修复文件
`belt/src/views/detection/VideoPlayback.vue`

### 修复点 1：获取录像列表响应解析
**修复前**：
```javascript
if (response && (response.code === 0 || response.code === 200)) {
  const dataObj = response.data || response.body || {}
  // 支持多种数据结构...
}
```

**修复后**：
```javascript
// 后端返回格式: { code: 200, message: "success", data: { total, list, page, page_size } }
if (response && response.code === 200 && response.data) {
  const dataObj = response.data
  
  // 后端data字段包含 list 数组和 total 数量
  if (dataObj.list && Array.isArray(dataObj.list)) {
    recordList.value = dataObj.list
    pagination.total = dataObj.total || 0
  }
}
```

### 修复点 2：获取播放地址响应解析
**修复前**：
```javascript
if (response && (response.code === 0 || response.code === 200)) {
  const dataObj = response.data || response.body || {}
  let playUrl = dataObj.file_url || dataObj.url || dataObj.play_url || dataObj.playUrl
  // 多重后备方案...
}
```

**修复后**：
```javascript
// 后端返回格式: { code: 200, message: "success", data: { id, title, file_url, format, ... } }
if (response && response.code === 200 && response.data) {
  const dataObj = response.data
  
  // 后端直接在data中返回file_url
  const playUrl = dataObj.file_url
}
```

### 修复点 3：删除录像响应处理
**修复前**：
```javascript
if (response.code === 0) {
  ElMessage.success('录像删除成功')
  // ...
}
```

**修复后**：
```javascript
// 后端返回格式: { code: 200, message: "视频删除成功", data: null }
if (response && response.code === 200) {
  ElMessage.success(response.message || '录像删除成功')
  // ...
}
```

### 修复点 4：上传录像响应处理
**修复前**：
```javascript
xhr.onload = () => {
  if (xhr.status === 200) {
    const response = JSON.parse(xhr.responseText)
    if (response.code === 0) {
      resolve(response)
    }
  }
}
```

**修复后**：
```javascript
xhr.onload = () => {
  if (xhr.status === 200) {
    const response = JSON.parse(xhr.responseText)
    // 后端返回格式: { code: 200, message: "success", data: { ... } }
    if (response.code === 200) {
      resolve(response)
    }
  }
}
```

## 修复要点总结

1. **响应码统一**：后端成功响应的 `code` 统一为 **200**，不是 0
2. **响应结构固定**：统一为 `{ code, message, data }` 三字段结构
3. **数据位置明确**：实际数据始终在 `response.data` 中
4. **移除冗余逻辑**：删除了对 `response.body`、多种 URL 字段等的兼容代码
5. **添加注释说明**：在关键位置添加后端响应格式注释，方便维护

## 参考实现
后端提供的简易前端实现文件 `smart-video-platform/web/recording-management.html` 中的处理方式与本次修复对齐。

## 测试建议

1. 测试上传录像功能
2. 测试获取录像列表（空列表、有数据、分页）
3. 测试播放录像（不同格式）
4. 测试删除录像
5. 测试错误场景（网络错误、权限错误、404等）

## 相关文件
- 前端：`belt/src/views/detection/VideoPlayback.vue`
- 前端API：`belt/src/api/detection.js`
- 后端Handler：`smart-video-platform/internal/recording/handler/recording_handler.go`
- 后端Models：`smart-video-platform/internal/recording/models/recording.go`
- 后端Response：`smart-video-platform/pkg/response/response.go`
- 参考实现：`smart-video-platform/web/recording-management.html`

