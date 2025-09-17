# FFmpeg 安装指南

## 方法一：使用Chocolatey（推荐）

### 1. 安装Chocolatey
以管理员身份运行PowerShell，执行：
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### 2. 安装FFmpeg
```powershell
choco install ffmpeg
```

### 3. 验证安装
```powershell
ffmpeg -version
```

## 方法二：手动安装

### 1. 下载FFmpeg
- 访问：https://www.gyan.dev/ffmpeg/builds/
- 下载 "release builds" 下的 Windows 版本
- 选择 "ffmpeg-release-essentials.zip"

### 2. 解压和配置
1. 解压到 `C:\ffmpeg`
2. 添加 `C:\ffmpeg\bin` 到系统PATH环境变量：
   - 右键"此电脑" → 属性 → 高级系统设置
   - 环境变量 → 系统变量 → Path → 编辑
   - 新建：`C:\ffmpeg\bin`
   - 确定保存

### 3. 重启命令行
关闭所有命令行窗口，重新打开测试：
```cmd
ffmpeg -version
```

## 方法三：使用winget（Windows 10/11）

```powershell
winget install ffmpeg
```

## 验证安装成功
安装完成后，应该看到类似输出：
```
ffmpeg version 6.0-full_build-www.gyan.dev
built with gcc 12.2.0 (Rev10, Built by MSYS2 project)
configuration: --enable-gpl --enable-version3 ...
```
