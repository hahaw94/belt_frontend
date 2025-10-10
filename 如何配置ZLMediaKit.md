# 🔧 如何配置ZLMediaKit连接参数

## 📋 根据你的情况

从日志可以看到，你的ZLMediaKit配置是：
- **HTTP端口**: `18080`（不是默认的80）
- **需要API密钥**: `secret` 参数

---

## 🎯 快速配置步骤

### 步骤1：查找ZLMediaKit的config.ini文件

在ZLMediaKit目录下找到 `config.ini` 文件。

### 步骤2：查找关键配置参数

#### 2.1 查找HTTP端口
```ini
[http]
port=18080      # 这是HTTP服务端口
sslport=443
```

#### 2.2 查找API密钥（secret）
```ini
[api]
secret=035c73f7-bb6b-4889-a715-d9eb2d1925cc    # 这是API密钥
```

**注意：** 你的secret值可能不同，请使用你config.ini中的实际值！

### 步骤3：修改HomeView.vue中的配置

找到 `streamConfig` 配置（约在第1137行）：

```javascript
const streamConfig = {
  baseUrl: 'http://localhost',
  httpPort: 18080,        // ⬅️ 改为你的实际端口
  app: 'live',
  protocol: 'flv',
  snapshotPath: '/snapshots',
  secret: '你的实际secret值'  // ⬅️ 从config.ini复制过来
}
```

---

## 🔍 如何验证配置是否正确

### 方法1：直接在浏览器测试

在浏览器地址栏输入：
```
http://localhost:18080/index/api/getMediaList?secret=你的secret值
```

**期望结果：**
```json
{
  "code": 0,
  "data": [
    // 流列表
  ]
}
```

如果返回 `"code": -300` 说明secret错误。

### 方法2：查看ZLMediaKit Web界面

访问：
```
http://localhost:18080/
```

应该能看到ZLMediaKit的管理界面。

---

## 📝 完整的流地址格式

根据你的配置，流地址应该是：

### FLV格式（推荐）：
```
http://localhost:18080/live/流名称.live.flv
```

### HLS格式：
```
http://localhost:18080/live/流名称/hls.m3u8
```

### 例如：
如果你推流到 `camera1`，那么播放地址是：
```
http://localhost:18080/live/camera1.live.flv
```

---

## 🚀 推流配置

### OBS设置
- **服务器**: `rtmp://localhost:1935/live`
- **串流密钥**: `camera1`（或任何流名称）

**注意：** RTMP端口通常是1935，不是18080！

### FFmpeg推流
```bash
ffmpeg -re -i test.mp4 -c copy -f flv rtmp://localhost:1935/live/camera1
```

---

## ⚠️ 常见错误

### 错误1：端口连接失败
```
获取流列表失败，请检查ZLMediaKit是否运行在正确的端口
```

**解决：**
1. 确认ZLMediaKit正在运行
2. 确认 `httpPort: 18080` 与config.ini中的端口一致
3. 使用 `netstat -ano | findstr :18080` 检查端口是否在监听

### 错误2：API密钥错误
```
Required parameter missed: "secret"
或
API密钥错误
```

**解决：**
1. 打开config.ini
2. 找到 `[api]` 部分的 `secret=xxx`
3. 复制完整的secret值到 `streamConfig.secret`

### 错误3：404找不到流
```
HTTP ERROR 404
```

**原因：** 
- 流不存在
- 没有推流
- 流名称不匹配

**解决：**
1. 确认已经推流
2. 点击"🔍 查看可用流"按钮查看实际的流列表
3. 使用列表中显示的实际流名称

---

## 💡 配置示例

### 示例1：默认配置
```javascript
const streamConfig = {
  baseUrl: 'http://localhost',
  httpPort: 80,
  app: 'live',
  protocol: 'flv',
  snapshotPath: '/snapshots',
  secret: '035c73f7-bb6b-4889-a715-d9eb2d1925cc'
}
```

### 示例2：自定义端口
```javascript
const streamConfig = {
  baseUrl: 'http://localhost',
  httpPort: 18080,     // 你的实际端口
  app: 'live',
  protocol: 'flv',
  snapshotPath: '/snapshots',
  secret: 'your-actual-secret-here'  // 你的实际secret
}
```

### 示例3：远程服务器
```javascript
const streamConfig = {
  baseUrl: 'http://192.168.1.100',
  httpPort: 18080,
  app: 'live',
  protocol: 'flv',
  snapshotPath: '/snapshots',
  secret: 'your-actual-secret-here'
}
```

---

## 🔐 关于Secret的说明

### Secret是什么？
ZLMediaKit的API密钥，用于保护API接口不被未授权访问。

### 如何找到Secret？

#### 方法1：查看config.ini
```ini
[api]
secret=035c73f7-bb6b-4889-a715-d9eb2d1925cc
```

#### 方法2：查看ZLMediaKit启动日志
启动时会显示：
```
[api] secret: 035c73f7-bb6b-4889-a715-d9eb2d1925cc
```

#### 方法3：如果找不到，可以自己设置
在config.ini中添加：
```ini
[api]
secret=my-custom-secret-123456
```

然后重启ZLMediaKit。

---

## ✅ 验证配置成功

当一切配置正确后：

1. ✅ 点击"🔍 查看可用流"能看到流列表
2. ✅ 选择流后能自动填入正确的播放地址
3. ✅ 点击播放能正常播放视频

---

## 🎬 完整测试流程

### 1. 启动ZLMediaKit
```bash
MediaServer.exe -c config.ini
```

### 2. 记录关键信息
- HTTP端口：从日志或config.ini查看
- Secret：从config.ini的[api]部分获取

### 3. 修改HomeView.vue配置
```javascript
httpPort: 你的端口,
secret: '你的secret'
```

### 4. 推流测试
```bash
ffmpeg -re -i test.mp4 -c copy -f flv rtmp://localhost:1935/live/test
```

### 5. 在播放器中测试
- 点击"🔍 查看可用流"
- 应该能看到 `live/test`
- 点击"使用此流"
- 点击"播放"

---

## 📞 还有问题？

检查以下内容：

1. **ZLMediaKit是否运行？**
   ```bash
   tasklist | findstr MediaServer
   ```

2. **端口是否正确？**
   ```bash
   netstat -ano | findstr :18080
   ```

3. **能否访问API？**
   ```
   http://localhost:18080/index/api/getServerConfig?secret=你的secret
   ```

4. **推流是否成功？**
   ```
   http://localhost:18080/index/api/getMediaList?secret=你的secret
   ```

如果这些都正常，播放器就应该能工作了！

