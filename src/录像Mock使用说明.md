# 录像管理 Mock 数据使用说明

## 概述

已为录像管理模块添加了完整的Mock假数据支持，包含录像列表、播放、下载、删除、统计等功能。

## Mock数据特点

### 录像数据
- **数量**: 100条模拟录像记录
- **设备**: 12个不同的摄像头设备
- **告警类型**: 12种不同的告警类型（异常行为、车辆违规、人员闯入等）
- **时间范围**: 最近30天内的随机时间
- **文件信息**: 包含时长、文件大小、分辨率、帧率等详细信息

### 支持的功能
1. **录像列表查询** - 支持分页、筛选、搜索
2. **录像播放** - 模拟播放地址生成
3. **录像下载** - 模拟文件下载
4. **录像删除** - 支持单个和批量删除
5. **录像上传** - 模拟文件上传过程
6. **统计信息** - 存储使用量、告警分布等

## 如何测试

### 1. 访问录像列表页面
启动开发服务器后，访问：
```
http://localhost:8080/#/recording/list
```

### 2. 在浏览器控制台测试Mock API
```javascript
// 测试录像Mock拦截器
window.testRecordingMock()

// 直接测试API请求
window.testRecordingApi()
```

### 3. 功能测试清单
- [ ] 录像列表加载
- [ ] 分页功能
- [ ] 设备筛选
- [ ] 告警类型筛选
- [ ] 时间范围筛选
- [ ] 录像播放
- [ ] 录像下载
- [ ] 录像删除
- [ ] 录像上传
- [ ] 统计信息展示

## Mock API 路由

| 功能 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取录像列表 | POST | `/api/recordings/list` | 支持分页和筛选 |
| 获取播放地址 | GET | `/api/recordings/{id}/play` | 返回播放URL |
| 上传录像 | POST | `/api/recordings/upload` | 模拟文件上传 |
| 删除录像 | DELETE | `/api/recordings/{id}` | 删除指定录像 |
| 下载录像 | GET | `/api/recordings/download/{id}` | 下载录像文件 |
| 获取统计 | GET | `/api/recordings/statistics` | 录像统计信息 |
| 获取流 | GET | `/api/recordings/stream/{id}/{format}` | 视频流播放 |

## 数据样例

### 录像记录样例
```json
{
  "id": "recording_001_abc123",
  "device_id": 1,
  "device_name": "前门摄像头",
  "alarm_type": "异常行为",
  "start_time": "2024-01-15 14:30:25",
  "end_time": "2024-01-15 14:32:45",
  "duration": "2:20",
  "file_size": "156.8 MB",
  "resolution": "1920x1080",
  "fps": 25,
  "has_tracking_box": true,
  "status": "正常"
}
```

### 统计信息样例
```json
{
  "total_recordings": 100,
  "total_size_gb": 345,
  "today_count": 12,
  "week_count": 67,
  "month_count": 234,
  "storage_usage_percent": 75,
  "alarm_distribution": {
    "异常行为": 25,
    "车辆违规": 18,
    "人员闯入": 15
  }
}
```

## 注意事项

1. **Mock数据会在页面刷新后重置**
2. **删除和上传操作只在内存中生效**
3. **视频播放返回模拟数据，非真实视频文件**
4. **所有API延迟为200ms，模拟真实网络请求**

## 开发建议

1. 使用录像Store进行状态管理
2. 根据实际后端API调整数据结构
3. 在真实环境中禁用Mock拦截器
4. 保持Mock数据与真实数据结构一致

## 故障排除

如果Mock数据未生效，请检查：
1. Mock拦截器是否正确初始化
2. 控制台是否有相关日志输出
3. API路径是否匹配
4. 网络请求是否被正确拦截
