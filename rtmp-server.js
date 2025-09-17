const NodeMediaServer = require('node-media-server');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

// 确保输出目录存在 - 使用外部streaming_data目录
const hlsPath = path.join(__dirname, '..', 'streaming_data', 'hls');
const snapshotPath = path.join(__dirname, '..', 'streaming_data', 'snapshots');

if (!fs.existsSync(hlsPath)) {
  fs.mkdirSync(hlsPath, { recursive: true });
}
if (!fs.existsSync(snapshotPath)) {
  fs.mkdirSync(snapshotPath, { recursive: true });
}

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  }
};

const nms = new NodeMediaServer(config);

// 当有新的推流连接时
nms.on('preConnect', (id, args) => {
  console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

// 当推流开始时
nms.on('postPublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPublish]', `id=${JSON.stringify(id)} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  
  let streamName = 'camera1'; // 默认流名称
  
  // 尝试从不同来源获取流名称
  if (StreamPath && typeof StreamPath === 'string') {
    streamName = StreamPath.split('/').pop();
  } else if (args && args.streamPath) {
    streamName = args.streamPath.split('/').pop();
  } else if (id && typeof id === 'object' && id.streamPath) {
    streamName = id.streamPath.split('/').pop();
  }
  
  console.log(`开始处理推流: ${streamName}`);
  
  // 开始HLS转换
  startHLSConversion(streamName);
  
  // 开始截图任务
  startSnapshotTask(streamName);
});

// 当推流结束时
nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePublish]', `id=${JSON.stringify(id)} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  
  let streamName = 'camera1'; // 默认流名称
  
  // 尝试从不同来源获取流名称
  if (StreamPath && typeof StreamPath === 'string') {
    streamName = StreamPath.split('/').pop();
  } else if (args && args.streamPath) {
    streamName = args.streamPath.split('/').pop();
  } else if (id && typeof id === 'object' && id.streamPath) {
    streamName = id.streamPath.split('/').pop();
  }
  
  console.log(`停止处理推流: ${streamName}`);
  
  // 停止相关任务
  stopHLSConversion(streamName);
  stopSnapshotTask(streamName);
});

// HLS转换任务管理
const hlsProcesses = new Map();
const snapshotIntervals = new Map();

function startHLSConversion(streamName) {
  const inputUrl = `rtmp://localhost:1935/live/${streamName}`;
  const outputPath = path.join(hlsPath, streamName);
  
  // 确保输出目录存在
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  const hlsOutput = path.join(outputPath, 'index.m3u8');
  
  const ffmpegProcess = ffmpeg(inputUrl)
    .addOptions([
      '-c:v libx264',
      '-c:a aac',
      '-ac 1',
      '-strict -2',
      '-crf 18',
      '-preset fast',
      '-tune zerolatency',
      '-profile:v high',
      '-level 4.0',
      '-maxrate 2000k',
      '-bufsize 4000k',
      '-pix_fmt yuv420p',
      '-g 30',
      '-keyint_min 15',
      '-sc_threshold 40',
      '-force_key_frames expr:gte(t,n_forced*1)',
      '-x264opts keyint=30:min-keyint=15:no-scenecut:bframes=0:ref=1:subme=1:me=dia:trellis=0:weightb=0:8x8dct=0:fast-pskip=1',
      '-hls_time 1',
      '-hls_list_size 3',
      '-hls_flags delete_segments+independent_segments+split_by_time',
      '-hls_segment_type mpegts',
      '-hls_segment_filename', path.join(outputPath, 'segment_%03d.ts'),
      '-start_number 1',
      '-hls_allow_cache 0'
    ])
    .output(hlsOutput)
    .on('start', () => {
      console.log(`开始HLS转换: ${streamName}`);
    })
    .on('error', (err) => {
      console.error(`HLS转换错误 ${streamName}:`, err.message);
    })
    .on('end', () => {
      console.log(`HLS转换结束: ${streamName}`);
    });
  
  ffmpegProcess.run();
  hlsProcesses.set(streamName, ffmpegProcess);
}

function stopHLSConversion(streamName) {
  const process = hlsProcesses.get(streamName);
  if (process) {
    process.kill('SIGKILL');
    hlsProcesses.delete(streamName);
    console.log(`停止HLS转换: ${streamName}`);
  }
}

function startSnapshotTask(streamName) {
  const inputUrl = `rtmp://localhost:1935/live/${streamName}`;
  
  // 每5秒截取一张图片
  const interval = setInterval(() => {
    const timestamp = Date.now();
    const outputPath = path.join(snapshotPath, `${streamName}_${timestamp}.jpg`);
    const latestPath = path.join(snapshotPath, `${streamName}_latest.jpg`);
    
    ffmpeg(inputUrl)
      .screenshots({
        timestamps: ['00:00:01'],
        filename: `${streamName}_${timestamp}.jpg`,
        folder: snapshotPath,
        size: '320x240'
      })
      .on('end', () => {
        // 创建最新截图的软链接
        if (fs.existsSync(latestPath)) {
          fs.unlinkSync(latestPath);
        }
        fs.copyFileSync(outputPath, latestPath);
        
        // 清理旧截图，只保留最近10张
        cleanOldSnapshots(streamName);
      })
      .on('error', (err) => {
        console.error(`截图错误 ${streamName}:`, err.message);
      });
  }, 5000);
  
  snapshotIntervals.set(streamName, interval);
}

function stopSnapshotTask(streamName) {
  const interval = snapshotIntervals.get(streamName);
  if (interval) {
    clearInterval(interval);
    snapshotIntervals.delete(streamName);
    console.log(`停止截图任务: ${streamName}`);
  }
}

function cleanOldSnapshots(streamName) {
  try {
    const files = fs.readdirSync(snapshotPath)
      .filter(file => file.startsWith(`${streamName}_`) && file.endsWith('.jpg') && !file.endsWith('_latest.jpg'))
      .map(file => ({
        name: file,
        path: path.join(snapshotPath, file),
        time: fs.statSync(path.join(snapshotPath, file)).mtime
      }))
      .sort((a, b) => b.time - a.time);
    
    // 删除超过10张的旧截图
    if (files.length > 10) {
      files.slice(10).forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
  } catch (err) {
    console.error('清理旧截图失败:', err);
  }
}

// 启动RTMP服务器
nms.run();

// 创建Express HTTP服务器
const app = express();

// 启用CORS
app.use(cors());

// 设置静态文件服务，添加正确的头部和MIME类型
app.use('/hls', (req, res, next) => {
  // 设置CORS头部
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // 为HLS文件设置正确的MIME类型
  if (req.path.endsWith('.m3u8')) {
    res.type('application/vnd.apple.mpegurl');
  } else if (req.path.endsWith('.ts')) {
    res.type('video/mp2t');
  }
  
  next();
}, express.static(hlsPath));

app.use('/snapshots', (req, res, next) => {
  // 设置CORS头部
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(snapshotPath));

// 添加一个健康检查端点
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    rtmp: 'rtmp://localhost:1935/live/',
    hls: 'http://localhost:8000/hls/{stream_name}/index.m3u8',
    snapshots: 'http://localhost:8000/snapshots/{stream_name}_latest.jpg'
  });
});

// 启动HTTP服务器
const httpServer = app.listen(8000, () => {
  console.log('RTMP和HTTP服务器已启动:');
  console.log('- RTMP推流地址: rtmp://localhost:1935/live/');
  console.log('- HTTP服务地址: http://localhost:8000/');
  console.log('- HLS播放地址: http://localhost:8000/hls/{stream_name}/index.m3u8');
  console.log('- 截图访问地址: http://localhost:8000/snapshots/{stream_name}_latest.jpg');
});
