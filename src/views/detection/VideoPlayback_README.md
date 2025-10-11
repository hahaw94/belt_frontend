# VideoPlayback 录像回放模块 - 重构说明

## 概述

本模块已完成重构，实现了完整的录像管理功能，包括上传、查询、播放和删除录像等功能。

## 主要功能

### 1. 录像上传
- ✅ 支持视频文件选择（支持所有主流视频格式）
- ✅ 必填字段：视频标题
- ✅ 可选字段：视频描述
- ✅ 实时上传进度显示（进度条）
- ✅ 文件大小限制：最大 2GB
- ✅ 上传成功后自动刷新列表

### 2. 录像查询
- ✅ 支持按标题搜索
- ✅ 支持按格式筛选（MP4、AVI、MKV、MOV、FLV）
- ✅ 支持重置搜索条件
- ✅ 分页显示（可配置每页数量：10/20/50/100）

### 3. 录像播放
- ✅ 使用HTML5原生视频播放器
- ✅ 点击表格行或播放按钮播放视频
- ✅ 显示视频信息（标题、格式、大小、时长）
- ✅ 正在播放的录像高亮显示
- ✅ 自动获取播放地址

### 4. 录像删除
- ✅ 删除确认对话框
- ✅ 删除成功后自动刷新列表
- ✅ 如果删除的是正在播放的视频，自动清空播放器

### 5. 录像下载
- ⏳ 预留功能，待后续实现

## API 接口对接

### 后端 API 端点

所有录像相关的 API 都已添加到 `belt/src/api/detection.js` 文件中：

1. **获取录像列表**
   - 端点: `GET /api/v1/recordings`
   - 参数: `{ page, page_size, title, format, uploader_id }`
   - 响应: 录像列表及分页信息

2. **上传录像**
   - 端点: `POST /api/v1/recordings/upload`
   - 参数: `FormData { title, description (可选), file }`
   - 响应: 上传成功的录像信息

3. **获取录像详情**
   - 端点: `GET /api/v1/recordings/{id}`
   - 响应: 单个录像的详细信息

4. **删除录像**
   - 端点: `DELETE /api/v1/recordings/{id}`
   - 响应: 删除结果

5. **获取播放地址**
   - 端点: `GET /api/v1/recordings/{id}/play`
   - 响应: 包含 `file_url` 的播放信息

### 响应格式

后端统一返回格式：
```json
{
  "code": 0,          // 0表示成功
  "message": "success",
  "data": {
    "list": [...],    // 录像列表
    "total": 100      // 总数（用于分页）
  }
}
```

录像对象结构：
```json
{
  "id": 1,
  "title": "视频标题",
  "description": "视频描述",
  "file_name": "原始文件名",
  "file_size": 1234567,
  "file_size_str": "1.18 MB",
  "duration": 120,
  "duration_str": "02:00",
  "format": "mp4",
  "resolution": "1920x1080",
  "file_url": "http://...",
  "upload_time": "2024-01-20 10:30:00",
  "uploader_id": 1
}
```

## 技术实现

### 1. 文件上传
使用 `XMLHttpRequest` 实现文件上传，支持实时进度监控：
```javascript
const xhr = new XMLHttpRequest()
xhr.upload.onprogress = (e) => {
  if (e.lengthComputable) {
    uploadProgress.value = Math.round((e.loaded / e.total) * 100)
  }
}
```

### 2. 视频播放
使用 HTML5 `<video>` 标签，支持原生控件：
```vue
<video 
  ref="videoPlayer"
  :src="currentVideoUrl"
  controls
  @loadedmetadata="onVideoLoaded"
  @timeupdate="onTimeUpdate"
  @ended="onVideoEnded"
>
```

### 3. 数据管理
- 使用 Vue 3 Composition API
- 响应式数据管理（ref/reactive）
- 自动刷新机制

### 4. 用户体验
- 科技感界面设计（青色主题）
- 加载状态提示
- 操作反馈（成功/失败消息）
- 表格行高亮
- 分页导航

## 样式设计

### 主题色
- 主色调：青色 (#00ffff)
- 背景：深蓝色半透明 (rgba(15, 25, 45, 0.95))
- 边框：青色半透明 (rgba(0, 255, 255, 0.2))

### 组件样式
- 卡片：带有模糊背景和发光边框
- 按钮：悬停时高亮
- 表格：半透明背景，选中行高亮
- 进度条：彩虹渐变色

## 使用方法

### 上传录像
1. 在上传区域输入视频标题（必填）
2. 可选输入视频描述
3. 点击"选择视频"按钮选择文件
4. 点击"开始上传"
5. 等待上传完成

### 查询录像
1. 在搜索框输入标题关键词
2. 或在格式下拉框选择视频格式
3. 点击"查询"按钮
4. 点击"重置"清空搜索条件

### 播放录像
1. 方式一：直接点击表格中的任意录像行
2. 方式二：点击操作列的"播放"按钮
3. 视频将在左侧播放器中自动播放

### 删除录像
1. 点击操作列的"删除"按钮
2. 在确认对话框中点击"确定"
3. 删除成功后列表自动刷新

## 文件结构

```
belt/src/
├── api/
│   └── detection.js        # 录像相关API（新增）
├── views/
│   └── detection/
│       ├── VideoPlayback.vue           # 录像回放主组件（重构）
│       └── VideoPlayback_README.md     # 本文档
```

## 依赖项

- Vue 3
- Element Plus
- Axios
- @element-plus/icons-vue

## 注意事项

1. **文件大小限制**：上传文件最大 2GB，超过会提示错误
2. **视频格式**：支持 MP4, AVI, MKV, MOV, WMV, FLV 等格式
3. **认证要求**：所有API请求需要携带有效的 Bearer Token
4. **播放兼容性**：视频播放依赖浏览器对格式的支持，建议使用 MP4 格式
5. **响应码**：后端返回 `code: 0` 表示成功，其他值表示错误

## 后续计划

- [ ] 实现下载功能
- [ ] 添加视频预览缩略图
- [ ] 支持批量上传
- [ ] 支持批量删除
- [ ] 添加视频剪辑功能
- [ ] 添加播放历史记录

## 更新日志

### 2024-10-10
- ✅ 完成录像回放模块重构
- ✅ 实现上传、查询、播放、删除功能
- ✅ 对接后端 API（`/api/v1/recordings/*`）
- ✅ 优化界面设计（科技感主题）
- ✅ 添加加载状态和进度提示
- ✅ 完善错误处理和用户反馈
- ✅ 更新 API 拦截器支持 `code: 0` 格式

## 参考文件

- 后端 API Handler: `smart-video-platform/internal/recording/handler/recording_handler.go`
- 参考实现: `smart-video-platform/web/recording-management.html`
- 数据模型: `smart-video-platform/internal/recording/models/recording.go`

