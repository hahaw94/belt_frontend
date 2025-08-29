# 地图管理模块

## 功能概述

地图管理模块是智能视频监控平台的核心功能之一，提供完整的地图配置和相机管理能力。

## 主要功能

### 1. 图层管理
- **图层创建**：支持上传CAD图层图片（PNG、JPG、JPEG、GIF格式）
- **图层编辑**：修改图层名称、描述和状态
- **图层删除**：支持强制删除（包含关联相机）
- **图层预览**：支持图片预览和详情查看

### 2. 相机管理
- **相机创建**：创建简化版相机设备
- **相机编辑**：修改相机配置信息
- **相机删除**：删除未绑定的相机设备
- **状态管理**：查看相机在线状态和绑定状态

### 3. 地图配置
- **可视化配置**：在图层上可视化配置相机位置
- **拖拽操作**：支持拖拽调整相机位置
- **缩放控制**：支持地图缩放和适应屏幕
- **相机绑定**：将相机绑定到指定图层位置

### 4. 备份恢复
- **备份创建**：支持全量备份和选择性备份
- **备份下载**：下载备份文件到本地
- **备份恢复**：从备份文件恢复地图配置
- **备份管理**：查看和删除备份文件

## API接口

### 图层管理接口
- `POST /system/map/layers` - 创建图层
- `GET /system/map/layers` - 获取图层列表
- `GET /system/map/layers/{id}` - 获取图层详情
- `PUT /system/map/layers/{id}` - 更新图层
- `DELETE /system/map/layers/{id}` - 删除图层
- `GET /system/map/layers/{id}/image` - 获取图层图片

### 相机管理接口
- `POST /system/map/cameras` - 创建相机
- `GET /system/map/cameras` - 获取相机列表
- `GET /system/map/cameras/unbound` - 获取未绑定相机
- `GET /system/map/cameras/{id}` - 获取相机详情
- `PUT /system/map/cameras/{id}` - 更新相机
- `DELETE /system/map/cameras/{id}` - 删除相机

### 图层相机关联接口
- `GET /system/map/layers/{id}/cameras` - 获取图层相机列表
- `POST /system/map/layers/{id}/cameras` - 添加相机到图层
- `PUT /system/map/layers/{id}/cameras/{camera_id}` - 更新相机位置
- `POST /system/map/layers/{id}/cameras/batch` - 批量更新相机位置
- `DELETE /system/map/layers/{id}/cameras/{camera_id}` - 移除图层相机

### 备份恢复接口
- `POST /system/map/backups` - 创建地图备份
- `GET /system/map/backups` - 获取备份列表
- `GET /system/map/backups/{filename}/download` - 下载备份
- `POST /system/map/backups/restore` - 恢复备份
- `DELETE /system/map/backups/{filename}` - 删除备份

## 文件结构

```
views/system-config/map-management/
├── MapManagement.vue           # 主组件，包含选项卡导航
├── components/
│   ├── LayerManagement.vue     # 图层管理组件
│   ├── CameraManagement.vue    # 相机管理组件
│   ├── MapConfiguration.vue    # 地图配置组件
│   └── BackupRestore.vue       # 备份恢复组件
└── README.md                   # 文档说明
```

## 使用说明

### 1. 图层管理
1. 点击"新建图层"按钮
2. 输入图层名称和描述
3. 上传图层图片文件
4. 点击确认创建图层

### 2. 相机管理
1. 点击"新建相机"按钮
2. 填写相机基本信息（编码、名称、IP地址等）
3. 选择协议类型（RTSP、HTTP、GB28181）
4. 点击确认创建相机

### 3. 地图配置
1. 在图层下拉框中选择要配置的图层
2. 点击"添加相机"将相机绑定到图层
3. 拖拽相机图标调整位置
4. 点击"保存位置"确认更改

### 4. 备份恢复
1. 选择备份类型（全量备份或选择备份）
2. 输入备份名称和描述
3. 点击"创建备份"生成备份文件
4. 在备份列表中可以下载、恢复或删除备份

## 技术特点

- **Vue 3 Composition API**：使用最新的Vue 3语法
- **Element Plus**：基于Element Plus UI组件库
- **响应式设计**：支持移动端和桌面端
- **可视化操作**：直观的拖拽和缩放操作
- **实时预览**：图片预览和状态实时更新
- **数据验证**：完整的表单验证和错误处理

## 权限控制

地图管理模块需要`system:config`权限，确保只有管理员用户可以访问和操作。

## 注意事项

1. 图片文件大小限制为10MB
2. 支持的图片格式：PNG、JPG、JPEG、GIF
3. 备份文件格式为tar.gz压缩包
4. 恢复操作会覆盖现有配置，请谨慎操作
5. 相机必须先解除绑定才能删除
