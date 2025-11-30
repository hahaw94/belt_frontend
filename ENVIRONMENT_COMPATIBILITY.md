# 环境兼容性说明

## 图片加载在不同环境下的工作方式

### ✅ 开发环境 (Development)

**特点**:
- 前端: `http://localhost:3000`
- 后端: `http://localhost:8080`
- 使用Vue代理配置

**图片加载流程**:
```
1. 后端推送: snapshot_url = "/api/v1/alarms/36/snapshot"
2. 前端fetch: "/api/v1/alarms/36/snapshot" (相对路径)
3. Vue代理转发: http://localhost:8080/api/v1/alarms/36/snapshot
4. 请求头: Authorization: Bearer <token>
5. 转换为Blob URL显示
```

**优势**:
- 无需配置CORS
- 自动端口转换
- 开发体验好

---

### ✅ 生产环境 (Production)

**特点**:
- 前后端同域部署: `https://yourdomain.com`
- 或前后端分离部署

**图片加载流程**:
```
1. 后端推送: snapshot_url = "/api/v1/alarms/36/snapshot"
2. 前端fetch: "https://yourdomain.com/api/v1/alarms/36/snapshot" (完整URL)
3. 请求头: Authorization: Bearer <token>
4. 转换为Blob URL显示
```

**配置要求**:
- 后端需要配置CORS（如果前后端分离）
- 后端需要支持Authorization请求头认证

---

### ✅ 跨域场景

**场景**: 前端 `https://app.example.com`，后端 `https://api.example.com`

**后端CORS配置**:
```python
# FastAPI示例
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**前端配置**:
```javascript
// fetch请求配置
{
  mode: 'cors',              // 支持跨域
  credentials: 'include',    // 包含cookies
  headers: {
    'Authorization': `Bearer ${token}`
  }
}
```

---

## 支持的图片格式

### 1. Base64格式（优先）

**后端推送**:
```json
{
  "snapshot_base64": "/9j/4AAQSkZJRg..."
}
```

**前端处理**:
```javascript
imageUrl = `data:image/jpeg;base64,${snapshot_base64}`
```

**优势**:
- ✅ 无需额外请求
- ✅ 即时显示
- ✅ 无认证问题
- ✅ 无跨域问题

**劣势**:
- ❌ 数据量大（+33%）
- ❌ 无法缓存

---

### 2. URL格式（降级）

**后端推送**:
```json
{
  "snapshot_url": "/api/v1/alarms/36/snapshot"
}
```

**前端处理**:
```javascript
// 1. fetch请求（带Authorization头）
// 2. 转换为Blob
// 3. 创建Blob URL
```

**优势**:
- ✅ 数据量小
- ✅ 可以缓存（Blob）
- ✅ 支持大图片

**劣势**:
- ❌ 需要额外请求
- ❌ 异步加载（有延迟）
- ❌ 需要认证配置

---

## 环境切换检查清单

### 从开发切换到生产

- [ ] 检查后端API地址配置
- [ ] 检查CORS配置（如果跨域）
- [ ] 检查Authorization认证是否正常
- [ ] 检查HTTPS证书（生产环境）
- [ ] 测试图片加载是否正常

### 从生产切换到开发

- [ ] 检查vue.config.js代理配置
- [ ] 检查后端端口是否正确
- [ ] 清除浏览器缓存
- [ ] 重启开发服务器

---

## 故障排查

### 图片无法加载

**1. 检查控制台日志**
```
加载图片URL: /api/v1/alarms/36/snapshot
图片加载成功，Blob URL: blob:http://localhost:3000/xxx
```

**2. 检查Network标签**
- 请求URL是否正确
- 状态码是否200
- 请求头是否包含Authorization
- 响应类型是否为image

**3. 常见错误**

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 401 Unauthorized | Token无效或缺失 | 检查localStorage中的token |
| 403 Forbidden | 权限不足 | 检查用户权限配置 |
| 404 Not Found | 图片不存在 | 检查alarm_id是否正确 |
| CORS Error | 跨域配置错误 | 配置后端CORS |
| Network Error | 网络问题 | 检查后端服务是否运行 |

---

## 性能优化建议

### 1. 优先使用Base64（小图片）

**适用场景**:
- 缩略图（< 100KB）
- 实时告警快照
- 需要即时显示的场景

**后端实现**:
```python
# 压缩图片并转Base64
from PIL import Image
import base64
import io

def compress_and_encode(image_path, max_size=(300, 300), quality=85):
    img = Image.open(image_path)
    img.thumbnail(max_size)
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=quality)
    return base64.b64encode(buffer.getvalue()).decode()
```

### 2. 使用URL（大图片）

**适用场景**:
- 高清图片（> 100KB）
- 历史记录查看
- 可以延迟加载的场景

### 3. 图片缓存策略

**Blob URL缓存**:
```javascript
// 缓存已加载的图片
const imageCache = new Map()

async loadImageWithAuth(url, token) {
  // 检查缓存
  if (imageCache.has(url)) {
    return imageCache.get(url)
  }
  
  // 加载图片
  const blobUrl = await this.fetchImage(url, token)
  
  // 存入缓存
  imageCache.set(url, blobUrl)
  
  return blobUrl
}
```

### 4. 内存管理

**释放Blob URL**:
```javascript
// 告警被删除时释放内存
removeActiveAlert(alertId) {
  const alert = this.activeAlerts.find(a => a.id === alertId)
  if (alert && alert.image.startsWith('blob:')) {
    URL.revokeObjectURL(alert.image)
  }
  // ...
}
```

---

## 总结

当前实现的图片加载方案：

✅ **开发环境** - 完全兼容，使用代理  
✅ **生产环境** - 完全兼容，自动切换URL  
✅ **跨域场景** - 支持CORS配置  
✅ **Base64格式** - 优先使用，即时显示  
✅ **URL格式** - 降级方案，异步加载  
✅ **认证支持** - Authorization Bearer token  
✅ **错误处理** - 完整的错误日志  

**无需额外配置，自动适应所有环境！** 🎉
