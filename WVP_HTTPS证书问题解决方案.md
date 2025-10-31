# WVP HTTPS 证书问题解决方案

## ❌ 问题现象

使用 HTTPS 协议访问 WVP 流时出现错误：

```
FLV错误: NetworkError - Exception
流地址: https://10.18.21.219:443/rtp/xxx.live.flv
```

---

## 🔍 根本原因

WVP 服务器使用的是 **自签名 SSL 证书**，浏览器出于安全考虑会阻止这类证书：

1. **证书不受信任** - 不是由公认的 CA 机构颁发
2. **浏览器安全策略** - 自动阻止不安全的 HTTPS 连接
3. **FLV.js 无法加载** - 网络请求被浏览器拦截

---

## ✅ 解决方案（3选1）

### 方案 1：改用 HTTP 协议（最简单）⭐⭐⭐

**推荐使用 HTTP，无需证书配置**

#### 修改流地址

```
❌ HTTPS (443端口):
https://10.18.21.219:443/rtp/34020000001320000001_34020000001320000001.live.flv

✅ HTTP (18081端口):
http://10.18.21.219:18081/rtp/34020000001320000001_34020000001320000001.live.flv
```

#### WVP 默认端口

| 协议 | 端口 | 用途 | 推荐 |
|------|------|------|------|
| HTTP | 18081 | 流媒体服务 | ✅ 推荐 |
| HTTPS | 443 | 加密流媒体 | ⚠️ 需要证书 |
| HTTP | 18080 | Web 管理界面 | ✅ 推荐 |

**立即行动**：
1. 将流地址改为 `http://10.18.21.219:18081/...`
2. 点击播放即可

---

### 方案 2：在浏览器中信任证书 ⭐⭐

如果必须使用 HTTPS，需要手动信任证书。

#### Chrome/Edge 浏览器

**步骤 1：访问流地址**
1. 在浏览器地址栏输入：
   ```
   https://10.18.21.219:443/rtp/34020000001320000001_34020000001320000001.live.flv
   ```

2. 会出现安全警告：
   ```
   您的连接不是私密连接
   NET::ERR_CERT_AUTHORITY_INVALID
   ```

**步骤 2：信任证书**
1. 点击 **高级** (Advanced)
2. 点击 **继续前往 10.18.21.219（不安全）** (Proceed to 10.18.21.219 (unsafe))
3. 浏览器会显示证书错误，但已经建立了连接

**步骤 3：返回播放器**
1. 回到视频播放页面
2. 重新输入流地址并播放
3. 此时浏览器已信任证书，可以正常播放

#### Firefox 浏览器

1. 访问流地址
2. 点击 **高级**
3. 点击 **接受风险并继续**
4. 返回播放器重新播放

**注意**：
- ⚠️ 每次清除浏览器数据后需要重新信任
- ⚠️ 不同域名/IP需要分别信任
- ⚠️ 证书过期后需要重新信任

---

### 方案 3：安装受信任的 SSL 证书（高级）⭐

为 WVP 服务器配置正式的 SSL 证书。

#### 3.1 使用 Let's Encrypt（免费，需要域名）

**前提条件**：
- 有公网域名（如 `wvp.example.com`）
- 域名已解析到服务器 IP

**步骤**：

```bash
# 1. 安装 certbot
sudo apt update
sudo apt install certbot

# 2. 申请证书（需要暂停 WVP 以释放 443 端口）
sudo systemctl stop wvp
sudo certbot certonly --standalone -d wvp.example.com

# 3. 证书路径
# 证书: /etc/letsencrypt/live/wvp.example.com/fullchain.pem
# 私钥: /etc/letsencrypt/live/wvp.example.com/privkey.pem
```

**配置 WVP**：

编辑 `application.yml`:

```yaml
server:
  ssl:
    enabled: true
    key-store: /etc/letsencrypt/live/wvp.example.com/keystore.p12
    key-store-password: your_password
    key-store-type: PKCS12
```

转换证书格式：

```bash
sudo openssl pkcs12 -export \
  -in /etc/letsencrypt/live/wvp.example.com/fullchain.pem \
  -inkey /etc/letsencrypt/live/wvp.example.com/privkey.pem \
  -out /etc/letsencrypt/live/wvp.example.com/keystore.p12 \
  -name wvp
```

#### 3.2 使用自签名证书（内网环境）

**生成证书**：

```bash
# 生成私钥
openssl genrsa -out wvp.key 2048

# 生成证书签名请求
openssl req -new -key wvp.key -out wvp.csr

# 生成自签名证书（有效期 365 天）
openssl x509 -req -days 365 -in wvp.csr -signkey wvp.key -out wvp.crt

# 转换为 PKCS12 格式
openssl pkcs12 -export -in wvp.crt -inkey wvp.key -out wvp.p12 -name wvp
```

**配置 WVP**：

编辑 `application.yml`:

```yaml
server:
  ssl:
    enabled: true
    key-store: /path/to/wvp.p12
    key-store-password: your_password
    key-store-type: PKCS12
```

**客户端信任证书**：

需要在每台访问设备上手动安装 `wvp.crt`：

- **Windows**: 双击证书 → 安装到"受信任的根证书颁发机构"
- **macOS**: 双击证书 → 添加到钥匙串 → 设置为"始终信任"
- **Linux**: 复制到 `/usr/local/share/ca-certificates/` 并运行 `update-ca-certificates`

---

## 🎯 推荐方案对比

| 方案 | 难度 | 安全性 | 适用场景 | 推荐指数 |
|------|------|--------|----------|----------|
| 改用 HTTP | ⭐ 简单 | 中 | 内网环境 | ⭐⭐⭐⭐⭐ |
| 信任自签名证书 | ⭐⭐ 中等 | 低 | 临时测试 | ⭐⭐⭐ |
| Let's Encrypt | ⭐⭐⭐ 复杂 | 高 | 公网+域名 | ⭐⭐⭐⭐ |
| 自签名+全员安装 | ⭐⭐⭐⭐ 很复杂 | 中 | 企业内网 | ⭐⭐ |

---

## 💡 安全性说明

### HTTP 在内网是安全的吗？

**✅ 内网使用 HTTP 是可以接受的**：

1. **内网隔离** - 内网流量不经过公网，外部无法监听
2. **监控场景** - 视频监控数据通常不是绝对机密
3. **性能优势** - HTTP 省去 SSL 加密开销，播放更流畅

### HTTPS 的必要性

**仅在以下场景推荐 HTTPS**：

- ✅ 服务暴露在公网
- ✅ 跨公网传输
- ✅ 涉及敏感数据（如人脸识别）
- ✅ 合规要求（如等保三级）

**内网环境建议**：
- ✅ 使用 HTTP，简单高效
- ✅ 通过网络隔离保证安全
- ✅ 配置防火墙限制访问

---

## 🔧 组件已添加的功能

### 1. 自动检测 HTTPS

播放时会自动检测并警告：

```
⚠️ 检测到 HTTPS 协议
如果使用自签名证书，可能无法播放
建议改用 HTTP 或先在浏览器中信任证书

建议尝试: http://10.18.21.219:18081/...
```

### 2. 测试连接功能

点击 **测试连接** 按钮，可以诊断问题：

```
✓ URL 格式正确
  协议: https:
  主机: 10.18.21.219
  端口: 443
⚠️ 使用 HTTPS 协议
⚠️ 自签名证书会被浏览器阻止
建议改用 HTTP: http://10.18.21.219:18081/...
```

### 3. 详细错误提示

网络错误时会给出具体解决方案：

```
网络连接失败
可能原因:
1. HTTPS 证书问题（自签名证书被浏览器阻止）
   → 尝试改用 HTTP: http://10.18.21.219:18081/...
2. 或在浏览器地址栏访问一次流地址，信任证书
```

---

## 📋 快速检查清单

遇到 HTTPS 错误时，按顺序检查：

- [ ] **检查流地址** - 确认使用的是 `https://` 还是 `http://`
- [ ] **检查端口** - HTTPS 使用 443，HTTP 使用 18081
- [ ] **点击"测试连接"** - 查看详细诊断信息
- [ ] **改用 HTTP** - 最简单的解决方案
- [ ] **查看浏览器控制台** - 按 F12 查看网络错误

---

## 🎯 立即行动

**最简单的解决方案（30秒）**：

1. 将流地址从：
   ```
   https://10.18.21.219:443/rtp/xxx.live.flv
   ```
   
2. 改为：
   ```
   http://10.18.21.219:18081/rtp/xxx.live.flv
   ```

3. 点击播放 ✅

---

## 📞 常见问题

### Q1: 为什么之前能用 HTTPS，现在不行？

**A**: 可能的原因：
- 证书过期
- 浏览器更新后安全策略更严格
- 清除了浏览器缓存/证书

### Q2: 内网一定要用 HTTPS 吗？

**A**: 不需要。内网使用 HTTP 更简单，性能更好。

### Q3: HTTP 会被监听吗？

**A**: 内网环境下，只要网络隔离做好，HTTP 是安全的。

### Q4: 能否混用 HTTP 和 HTTPS？

**A**: 可以，但建议统一使用 HTTP（端口 18081）。

---

**文档版本**: 1.0  
**更新日期**: 2025-10-29  
**适用版本**: WVP 2.7.4+, H265Player.vue v1.1


