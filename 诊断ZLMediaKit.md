# 🔍 ZLMediaKit 404错误诊断

## ❌ 当前问题
```
找不到与以下网址对应的网页：
http://localhost/live/board_1_1760063437.live.flv
HTTP ERROR 404
```

**这个错误说明：**
- ✅ ZLMediaKit服务器可以访问（不是跨域问题）
- ❌ 但是这个流不存在或流名称不对

---

## 🎯 诊断步骤

### 步骤1：检查ZLMediaKit是否运行

#### 方法A：检查进程
```bash
# Windows
tasklist | findstr MediaServer

# 如果没有输出，说明没有运行
```

#### 方法B：访问ZLMediaKit API
在浏览器打开：
```
http://localhost/index/api/getServerConfig
```

**结果：**
- ✅ 显示JSON配置 → ZLMediaKit正常运行
- ❌ 404/无法访问 → ZLMediaKit未运行或端口不对

---

### 步骤2：查看当前推流列表

在浏览器打开：
```
http://localhost/index/api/getMediaList
```

这会显示当前所有活动的流，例如：
```json
{
  "code": 0,
  "data": [
    {
      "app": "live",
      "stream": "camera1",
      "schema": "rtmp",
      "vhost": "__defaultVhost__"
    }
  ]
}
```

**注意查看：**
- `app`: 应用名（默认是 live）
- `stream`: 流名称（你要播放的流ID）

---

### 步骤3：确认正确的FLV地址格式

ZLMediaKit的FLV地址格式通常是：
```
http://服务器IP:端口/app/stream.live.flv
```

**示例：**
```
http://localhost/live/camera1.live.flv
http://localhost:80/live/camera1.live.flv
http://192.168.1.100/live/test.live.flv
```

**你的地址：**
```
http://localhost/live/board_1_1760063437.live.flv
```

这个格式是正确的，但流 `board_1_1760063437` 可能不存在。

---

## 🚀 解决方案

### 方案1：检查推流是否成功

#### 使用FFmpeg测试推流
```bash
# 推流到 board_1_1760063437
ffmpeg -re -i test.mp4 -c copy -f flv rtmp://localhost:1935/live/board_1_1760063437

# 或者推流到简单的名称
ffmpeg -re -i test.mp4 -c copy -f flv rtmp://localhost:1935/live/camera1
```

#### 使用OBS推流
1. **服务器**: `rtmp://localhost:1935/live`
2. **串流密钥**: `board_1_1760063437` 或 `camera1`

---

### 方案2：检查ZLMediaKit端口配置

#### 1. 打开 config.ini

#### 2. 查看 [http] 部分：
```ini
[http]
port=80        # 确认这里是80
sslport=443
```

#### 3. 如果端口不是80，需要在URL中指定：
```
http://localhost:8080/live/camera1.live.flv
```

---

### 方案3：使用ZLMediaKit内置的流（测试用）

如果你只是想测试播放器，可以使用ZLMediaKit的内置测试流。

#### 1. 启动ZLMediaKit后，它会自动生成一些测试流

#### 2. 访问ZLMediaKit的Web界面：
```
http://localhost/
```

#### 3. 查看可用的流列表

---

## 📝 推荐的完整测试流程

### 1️⃣ 启动ZLMediaKit
```bash
cd ZLMediaKit目录
MediaServer.exe -c config.ini
```

### 2️⃣ 查看启动日志
确认看到类似信息：
```
[2024-xx-xx xx:xx:xx] [I] [HttpSession.cpp:xxx] http服务器监听端口: 80
[2024-xx-xx xx:xx:xx] [I] [RtmpSession.cpp:xxx] rtmp服务器监听端口: 1935
```

### 3️⃣ 使用FFmpeg推流（简单测试）
```bash
# 如果没有视频文件，可以生成测试视频
ffmpeg -f lavfi -i testsrc=size=1280x720:rate=25 -f lavfi -i sine=frequency=1000 -c:v libx264 -preset ultrafast -c:a aac -f flv rtmp://localhost:1935/live/test
```

### 4️⃣ 验证流是否存在
浏览器访问：
```
http://localhost/index/api/getMediaList
```

应该能看到 `test` 流。

### 5️⃣ 在播放器中播放
```
http://localhost/live/test.live.flv
```

---

## 🔧 常见问题

### Q1: MediaServer.exe启动后立即关闭
**原因：** 端口被占用

**解决：**
```bash
# 查看80端口被谁占用
netstat -ano | findstr :80

# 关闭占用的进程或更改config.ini的端口
```

### Q2: 推流成功但播放404
**原因：** 流名称不匹配

**检查：**
1. 推流的流名称是什么
2. 播放的URL中的流名称是否一致
3. 大小写是否一致

### Q3: 浏览器显示 "无法访问此网站"
**原因：** ZLMediaKit未运行

**解决：** 启动MediaServer.exe

---

## 💡 快速调试命令

### 检查ZLMediaKit状态
```bash
# Windows
netstat -ano | findstr :80
netstat -ano | findstr :1935

# 如果有输出，说明端口在监听
```

### 获取所有API列表
```
http://localhost/index/api/getApiList
```

### 获取服务器配置
```
http://localhost/index/api/getServerConfig
```

### 获取流列表
```
http://localhost/index/api/getMediaList
```

### 关闭某个流
```
http://localhost/index/api/close_stream?app=live&stream=test&force=1
```

---

## ✅ 成功的标志

当一切正常时：

1. ✅ `http://localhost/index/api/getServerConfig` 返回配置
2. ✅ `http://localhost/index/api/getMediaList` 能看到你的流
3. ✅ `http://localhost/live/你的流名.live.flv` 浏览器提示下载
4. ✅ 播放器能正常播放

---

## 🎯 针对你的情况

你的流名称是：`board_1_1760063437`

### 检查这个流是否存在：
```
http://localhost/index/api/getMediaList
```

### 如果不存在，推流到这个名称：
```bash
ffmpeg -re -i 你的视频.mp4 -c copy -f flv rtmp://localhost:1935/live/board_1_1760063437
```

### 或者在播放器中使用已存在的流名称
先查看 getMediaList 返回的流名称，然后使用那个名称。



