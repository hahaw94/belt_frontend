# 录像管理 Mock 数据移除总结

## 📋 概述

本次修改将录像管理模块从 Mock 数据切换到真实后端 API，确保前端直接调用后端接口，不再使用 Mock 拦截器。

## 🔧 修改内容

### 1. 禁用 Mock 拦截器 (`belt/src/mock/index.js`)

#### 修改位置：第46-47行
```javascript
// 已禁用录像管理 Mock 拦截器
// setupRecordingMock(mock) // 已禁用，直接调用后端API
// console.log('✓ 录像管理Mock已注册')
```

#### 修改位置：第83-87行  
```javascript
// 添加录像管理相关接口的 passThrough 规则
mock.onGet(/\/api\/v1\/recordings.*/).passThrough()
mock.onPost(/\/api\/v1\/recordings.*/).passThrough()
mock.onPut(/\/api\/v1\/recordings.*/).passThrough()
mock.onDelete(/\/api\/v1\/recordings.*/).passThrough()
```

#### 修改位置：第93行
```javascript
console.log('💡 注意: 认证、用户管理、系统配置、板卡管理和录像管理接口已完全移除Mock拦截，直接调用后端API，其他模块使用Mock数据')
```

### 2. 清理测试文件 (`belt/src/test-mock.js`)

#### 移除录像 API 导入（第4行）
```javascript
// import { recordingApi } from './api/recording' // 录像API已使用真实后端接口
```

#### 移除录像 API 测试代码（第29行）
```javascript
// 录像API已使用真实后端接口，无需Mock测试
```

#### 更新统计输出（第36行）
```javascript
console.log('💡 注意: 登录、用户管理、角色管理、录像管理已使用真实后端接口')
```

#### 更新面板显示（第111行）
```javascript
<div style="color: #ffff00;">💡 登录/用户/角色/录像使用真实接口</div>
```

## ✅ 后端 API 路由验证

### 后端已实现的接口（位于 `smart-video-platform/cmd/main.go` 第496-504行）

```go
// 录像管理路由组
recordingGroup := v1.Group("/recordings", middleware.AuthMiddlewareWithPasswordCheck(jwtManager, authRepo))
{
    recordingGroup.POST("/upload", permissionMw.RequirePermission("module:video"), recordingHdl.UploadVideo)      
    recordingGroup.GET("/", permissionMw.RequirePermission("module:video"), recordingHdl.GetVideoList)           
    recordingGroup.GET("/:id", permissionMw.RequirePermission("module:video"), recordingHdl.GetVideoByID)        
    recordingGroup.GET("/:id/play", permissionMw.RequirePermission("module:video"), recordingHdl.GetVideoPlayURL) 
    recordingGroup.DELETE("/:id", permissionMw.RequirePermission("module:video"), recordingHdl.DeleteVideo)       
}
```

### 前端调用的接口（`belt/src/api/detection.js`）

- ✅ `GET /api/v1/recordings` - 获取录像列表
- ✅ `POST /api/v1/recordings/upload` - 上传录像
- ✅ `GET /api/v1/recordings/{id}` - 获取录像详情  
- ✅ `GET /api/v1/recordings/{id}/play` - 获取播放地址
- ✅ `DELETE /api/v1/recordings/{id}` - 删除录像

### 接口权限要求

所有录像管理接口都需要：
1. JWT Token 认证（通过 `AuthMiddlewareWithPasswordCheck`）
2. `module:video` 权限（通过 `permissionMw.RequirePermission`）

## 🔍 前后端数据格式对齐

### 后端响应格式（标准响应）
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 100,
    "list": [...],
    "page": 1,
    "page_size": 10
  }
}
```

### 前端解析逻辑（`VideoPlayback.vue` 第356-377行）
```javascript
if (response && (response.code === 0 || response.code === 200)) {
  const dataObj = response.data || response.body || {}
  
  if (dataObj.list) {
    recordList.value = dataObj.list || []
    pagination.total = dataObj.total || response.total || 0
  }
}
```

✅ 前端解析逻辑完全兼容后端响应格式

## 📝 注意事项

### 1. 权限配置
确保用户拥有 `module:video` 权限才能访问录像管理功能。如果遇到 403 错误，需要在角色管理中为用户分配该权限。

### 2. 后端服务状态
录像管理功能依赖以下后端服务：
- ✅ MySQL 数据库（存储录像元数据）
- ✅ MinIO 存储（存储视频文件）
- ✅ JWT 认证服务

### 3. 数据库表结构
录像数据存储在 `video_recordings` 表中，包含以下主要字段：
- `id` - 录像ID（主键）
- `title` - 视频标题
- `description` - 视频描述
- `file_name` - 原始文件名
- `file_path` - MinIO存储路径
- `file_size` - 文件大小（字节）
- `duration` - 视频时长（秒）
- `format` - 视频格式
- `file_url` - 访问URL
- `uploader_id` - 上传者ID

### 4. 文件上传限制
- 最大文件大小：2GB
- 支持的视频格式：由浏览器和后端共同决定
- 上传超时时间：10秒（可在 `belt/src/api/index.js` 中调整）

## 🎯 测试建议

### 1. 功能测试
- [ ] 上传录像文件（小文件 < 100MB）
- [ ] 上传录像文件（大文件 > 500MB）
- [ ] 查看录像列表（分页功能）
- [ ] 播放录像
- [ ] 删除录像
- [ ] 搜索录像（按标题）

### 2. 权限测试
- [ ] 无权限用户访问（应返回403）
- [ ] 未登录用户访问（应返回401）
- [ ] 有权限用户访问（应正常返回）

### 3. 错误处理测试
- [ ] 后端服务不可用时的提示
- [ ] 网络错误时的提示
- [ ] 文件格式错误时的提示
- [ ] 文件大小超限时的提示

## 📦 相关文件

### 前端文件
- `belt/src/views/detection/VideoPlayback.vue` - 录像回放页面组件
- `belt/src/api/detection.js` - 录像相关 API 接口定义
- `belt/src/mock/index.js` - Mock 拦截器配置
- `belt/src/test-mock.js` - Mock 测试文件

### 后端文件  
- `smart-video-platform/cmd/main.go` - 路由注册
- `smart-video-platform/internal/recording/handler/recording_handler.go` - 录像处理器
- `smart-video-platform/internal/recording/models/recording.go` - 数据模型
- `smart-video-platform/internal/recording/service/recording_service.go` - 业务逻辑
- `smart-video-platform/internal/recording/repository/recording_repository.go` - 数据访问

## ✨ 总结

本次修改成功将录像管理模块从 Mock 数据切换到真实后端 API：

1. ✅ 禁用了录像管理的 Mock 拦截器
2. ✅ 添加了 passThrough 规则，确保请求直达后端
3. ✅ 清理了测试代码中的录像 API 引用
4. ✅ 验证了前后端接口对齐
5. ✅ 确认了数据格式兼容性

前端现在完全依赖后端 API，不再使用任何 Mock 数据。所有功能均通过真实的后端接口实现。

---

**修改日期**: 2025-10-10  
**修改人**: AI Assistant  
**版本**: 1.0.0

