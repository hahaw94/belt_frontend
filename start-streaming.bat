@echo off
echo 正在启动RTMP流媒体服务器...
cd /d "%~dp0"

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 正在安装依赖包...
    npm install --package-lock-only --no-package-lock
    npm install node-media-server fluent-ffmpeg express cors nodemon
)

REM 创建必要的目录
if not exist "public" mkdir public
if not exist "public\hls" mkdir public\hls
if not exist "public\snapshots" mkdir public\snapshots

echo.
echo ================================
echo RTMP流媒体服务器配置信息:
echo ================================
echo RTMP推流地址: rtmp://localhost:1935/live/
echo 推流密钥: camera1 或 camera2
echo HTTP服务: http://localhost:8000/
echo HLS播放: http://localhost:8000/hls/{stream_name}/index.m3u8
echo 截图访问: http://localhost:8000/snapshots/{stream_name}_latest.jpg
echo ================================
echo.

REM 启动服务器
node rtmp-server.js

pause
