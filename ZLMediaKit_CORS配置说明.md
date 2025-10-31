# ZLMediaKit CORS跨域配置说明

## 问题描述
浏览器控制台显示CORS错误，导致无法播放流媒体。

## 症状
- VLC可以正常播放
- 浏览器无法播放（所有格式）
- 浏览器Console显示CORS错误

## 解决方案

### 方法1：修改ZLMediaKit配置文件

找到ZLMediaKit的配置文件（通常是 `config.ini`），添加或修改以下配置：

```ini
[http]
# 允许跨域访问
allow_cross_domains=1
# 允许的域名，* 表示允许所有
cross_domain_allow_origin=*
# 允许的请求方法
cross_domain_allow_methods=GET,POST,OPTIONS
# 允许的请求头
cross_domain_allow_headers=*
```

### 方法2：通过WVP配置

如果通过WVP管理ZLMediaKit：

1. 登录WVP管理后台
2. 进入"流媒体服务器"配置
3. 找到"跨域配置"或"CORS配置"
4. 启用跨域访问
5. 允许的域名设置为 `*` 或您的前端域名

### 方法3：使用Nginx反向代理

如果使用Nginx，添加以下配置：

```nginx
location /rtp/ {
    proxy_pass http://10.18.21.219:18081;
    
    # CORS配置
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers '*';
    
    # 处理OPTIONS预检请求
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

## 配置后的操作

1. 重启ZLMediaKit服务
2. 如果使用Nginx，重启Nginx
3. 清除浏览器缓存（Ctrl+Shift+Delete）
4. 刷新页面重新测试

## 验证方法

打开浏览器开发者工具（F12）：
1. 切换到Network标签
2. 播放视频
3. 找到.flv或.m3u8请求
4. 查看Response Headers
5. 应该看到：
   ```
   Access-Control-Allow-Origin: *
   ```

## 安全建议

生产环境中，建议将 `*` 改为具体的域名：
```ini
cross_domain_allow_origin=https://your-domain.com
```

## 更新日期
2025-10-29


