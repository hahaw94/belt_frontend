<template>
  <div class="industrial-dashboard">
    <!-- 可拖拽地图叠加层 -->
    <div class="map-container"
         :class="{ 'dragging': isDragging }"
         @mousedown="startDrag"
         @touchstart="startTouchDrag"
         @wheel.prevent="handleWheel">
      <!-- 地图内容包裹层 - 统一应用 transform -->
      <div class="map-content-wrapper"
           :style="{ transform: `translateX(-50%) translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${mapScale})` }">
        <img ref="mapImage"
             :src="mapImageUrl"
             alt="地图"
             class="draggable-map"
             @dragstart.prevent
             @selectstart.prevent
             @contextmenu.prevent>
        
        <!-- 地图上的摄像头图标 - 随地图一起移动 -->
        <div class="map-cameras">
          <div
            class="map-camera-icon camera-1"
            @click.stop="showCameraPopup(cameraData[0])"
            @mouseenter="showTooltip($event, cameraData[0])"
            @mouseleave="hideTooltip"
            title="点击查看摄像头画面"
          >
            <div class="camera-label">摄像机1</div>
          </div>
          <div
            class="map-camera-icon camera-2"
            @click.stop="showCameraPopup(cameraData[1])"
            @mouseenter="showTooltip($event, cameraData[1])"
            @mouseleave="hideTooltip"
            title="点击查看摄像头画面"
          >
            <div class="camera-label">摄像机2</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 左侧渐变过渡效果 -->
    <div class="left-gradient-overlay"></div>
    <!-- 右侧渐变过渡效果 -->
    <div class="right-gradient-overlay"></div>
    <!-- 左上角渐变效果 -->
    <div class="corner-gradient top-left"></div>
    <!-- 右上角渐变效果 -->
    <div class="corner-gradient top-right"></div>
    <!-- 左下角渐变效果 -->
    <div class="corner-gradient bottom-left"></div>
    <!-- 右下角渐变效果 -->
    <div class="corner-gradient bottom-right"></div>

    <!-- 主要内容区域 - 三栏布局 -->
    <div class="dashboard-container">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 告警统计 -->
        <div class="widget widget-alarm">
          <div class="widget-title">告警统计</div>
          <div class="alarm-stats-container">
            <!-- 今日告警总数显示区域 -->
            <div class="main-alarm-display">
              <div class="alarm-label">今日告警总数</div>
              <div class="alarm-counter">
                <span class="counter-digit">{{ String(dashboardData.alarm_stats.today_total).padStart(6, '0').split('').slice(0, 1).join('') }}</span>
                <span class="counter-digit">{{ String(dashboardData.alarm_stats.today_total).padStart(6, '0').split('').slice(1, 2).join('') }}</span>
                <span class="counter-digit">{{ String(dashboardData.alarm_stats.today_total).padStart(6, '0').split('').slice(2, 3).join('') }}</span>
                <span class="counter-digit">{{ String(dashboardData.alarm_stats.today_total).padStart(6, '0').split('').slice(3, 4).join('') }}</span>
                <span class="counter-digit">{{ String(dashboardData.alarm_stats.today_total).padStart(6, '0').split('').slice(4, 5).join('') }}</span>
                <span class="counter-digit">{{ String(dashboardData.alarm_stats.today_total).padStart(6, '0').split('').slice(5, 6).join('') }}</span>
              </div>
            </div>
            <!-- 环形图统计 -->
            <div class="alarm-chart-container">
              <div class="chart-wrapper">
                <!-- 装饰圆圈背景 -->
                <div class="chart-decoration"></div>
                <svg class="alarm-ring-chart" viewBox="0 0 100 100" style="width: 75%; height: auto; aspect-ratio: 1;">
                  <!-- 背景圆环 -->
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(0, 150, 255, 0.2)"
                    stroke-width="6"
                  />
                  <!-- 已处理圆弧 -->
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#00aaff"
                    stroke-width="6"
                    :stroke-dasharray="processedArcLength + ' ' + (totalCircumference - processedArcLength)"
                    stroke-dashoffset="0"
                    class="processed-arc"
                    transform="rotate(-90 50 50)"
                  />
                  <!-- 未处理圆弧 -->
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#ffaa00"
                    stroke-width="6"
                    :stroke-dasharray="unprocessedArcLength + ' ' + (totalCircumference - unprocessedArcLength)"
                    :stroke-dashoffset="-processedArcLength"
                    class="unprocessed-arc"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <!-- 图例 -->
              <div class="chart-legend">
                <div class="legend-item">
                  <span class="legend-dot processed"></span>
                  <span class="legend-text">已处理: {{ dashboardData.alarm_stats.processed }}</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot unprocessed"></span>
                  <span class="legend-text">未处理: {{ dashboardData.alarm_stats.unprocessed }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 任务统计 -->
        <div class="widget widget-task">
          <div class="widget-title">任务统计</div>
          <div class="task-stats-container">
            
            <!-- 左上角数据 -->
            <div class="corner-data top-left">
              <div class="data-number">20240805985353</div>
              <div class="data-label">暂无数据</div>
            </div>
            
            <!-- 右上角数据 -->
            <div class="corner-data top-right">
              <div class="data-number">{{ dashboardData.task_stats?.online_tasks || 16 }}</div>
              <div class="data-label">暂无数据</div>
            </div>
            
            <!-- 中心圆圈 -->
            <div class="center-circle">
              <div class="circle-background"></div>
              <div class="circle-content">
                <div class="center-number">1</div>
                <div class="center-label">在线任务</div>
              </div>
            </div>
            
            <!-- 左下角数据 -->
            <div class="corner-data bottom-left">
              <div class="data-number">0</div>
              <div class="data-label">暂无数据</div>
            </div>
            
            <!-- 右下角数据 -->
            <div class="corner-data bottom-right">
              <div class="data-number">0</div>
              <div class="data-label">暂无数据</div>
            </div>
          </div>
        </div>

        <!-- 事件通知 -->
        <div class="widget widget-event">
          <div class="widget-title">事件通知</div>
          <div class="event-list">
            <div
              v-for="alarm in recentAlarms"
              :key="alarm.id"
              class="list-item"
              @click="viewAlarmDetail(alarm)"
            >
              <div class="event-content">
                <div class="event-type">{{ alarm.type }}</div>
                <div class="event-device">{{ alarm.device_name }}</div>
                </div>
              <div class="event-time">{{ formatEventTime(alarm.time) }}</div>
              </div>
            </div>
          </div>
            </div>

      <!-- 中央内容区域 - 已删除地图框，仅保留背景 -->
      <div class="main-content">
              </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <!-- 设备统计 -->
        <div class="widget">
          <div class="widget-title">设备统计</div>
          <div class="device-stats-container">
            <!-- 摄像机统计 -->
            <div class="device-category">
              <div class="device-header">
                <div class="device-icon camera-icon"></div>
                <div class="device-info-box">
                  <div class="device-type">摄像机</div>
                  <div class="device-total">
                    <span class="total-number">{{ dashboardData.camera_stats.total_cameras }}</span>
                    <span class="unit-text">个</span>
                  </div>
                </div>
              </div>
              <div class="device-details">
                <div class="detail-item">
                  <div class="detail-number status-online">
                    {{ dashboardData.camera_stats.online_cameras }}<span class="unit-text-small">个</span>
                  </div>
                  <div class="detail-label">在线</div>
                </div>
                <div class="detail-item">
                  <div class="detail-number status-offline">
                    {{ dashboardData.camera_stats.offline_cameras }}<span class="unit-text-small">个</span>
                  </div>
                  <div class="detail-label">离线</div>
                </div>
              </div>
            </div>

            <!-- 算法服务统计 -->
            <div class="device-category">
              <div class="device-header">
                <div class="device-icon algorithm-icon"></div>
                <div class="device-info-box">
                  <div class="device-type">算法服务</div>
                  <div class="device-total">
                    <span class="total-number">{{ dashboardData.device_stats.total_devices - dashboardData.camera_stats.total_cameras }}</span>
                    <span class="unit-text">个</span>
                  </div>
                </div>
              </div>
              <div class="device-details">
                <div class="detail-item">
                  <div class="detail-number status-online">
                    {{ dashboardData.device_stats.online_devices - dashboardData.camera_stats.online_cameras }}<span class="unit-text-small">个</span>
                  </div>
                  <div class="detail-label">在线</div>
                </div>
                <div class="detail-item">
                  <div class="detail-number status-offline">
                    1<span class="unit-text-small">个</span>
                  </div>
                  <div class="detail-label">离线</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 高频告警排行 -->
        <div class="widget">
          <div class="widget-title">高频告警排行</div>
          <div class="ranking-chart-container">
            <svg class="ranking-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
              <!-- 定义渐变 -->
              <defs>
                <!-- 灰色背景渐变 -->
                <linearGradient id="grayBackground" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#666666;stop-opacity:0.3" />
                  <stop offset="100%" style="stop-color:#444444;stop-opacity:0.2" />
                </linearGradient>
                
                <!-- 彩色柱状图渐变 -->
                <linearGradient id="barGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#ff6b35;stop-opacity:0.8" />
                  <stop offset="100%" style="stop-color:#ff6b35;stop-opacity:0.3" />
                </linearGradient>
                <linearGradient id="barGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#ffa500;stop-opacity:0.8" />
                  <stop offset="100%" style="stop-color:#ffa500;stop-opacity:0.3" />
                </linearGradient>
                <linearGradient id="barGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#00bfff;stop-opacity:0.8" />
                  <stop offset="100%" style="stop-color:#00bfff;stop-opacity:0.3" />
                </linearGradient>
                <linearGradient id="barGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#1e90ff;stop-opacity:0.7" />
                  <stop offset="100%" style="stop-color:#1e90ff;stop-opacity:0.2" />
                </linearGradient>
                <linearGradient id="barGradient5" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#4682b4;stop-opacity:0.6" />
                  <stop offset="100%" style="stop-color:#4682b4;stop-opacity:0.2" />
                </linearGradient>
              </defs>
              
              <!-- 灰色背景柱 -->
              <rect
                v-for="(item, index) in rankingChartData"
                :key="'bg-' + index"
                :x="3"
                :y="10 + index * 18"
                :width="94"
                :height="6"
                fill="url(#grayBackground)"
                stroke="rgba(102, 102, 102, 0.3)"
                stroke-width="0.1"
                rx="1"
                class="ranking-bar-background"
              />

              <!-- 数据柱 -->
              <rect
                v-for="(item, index) in rankingChartData"
                :key="index"
                :x="3"
                :y="10 + index * 18"
                :width="item.percentage * 94"
                :height="6"
                :fill="`url(#barGradient${index + 1})`"
                :stroke="item.strokeColor"
                stroke-width="0.1"
                rx="1"
                class="ranking-bar"
                :style="{ animationDelay: index * 0.2 + 's' }"
              />
            </svg>
            
            <!-- 排行标签和文字信息 -->
            <div class="ranking-labels">
              <div 
                v-for="(item, index) in rankingChartData"
                :key="index"
                class="ranking-item"
                :style="{ animationDelay: index * 0.1 + 's' }"
              >
                <div class="rank-badge" :class="`rank-${index + 1}`">
                  TOP{{ index + 1 }}
                </div>
                <div class="device-name">{{ item.deviceName }}</div>
                <div class="count-value">{{ item.count }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 告警趋势 -->
        <div class="widget">
          <div class="widget-title">告警趋势</div>
          <div class="svg-chart-container">
            <svg class="trend-chart" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet">
              <!-- 定义渐变和滤镜 -->
              <defs>
                <!-- 折线发光效果 -->
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                <!-- 填充渐变 -->
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.3" />
                  <stop offset="100%" style="stop-color:#00d4ff;stop-opacity:0.05" />
                </linearGradient>
              </defs>
              
              <!-- 网格线 -->
              <g class="grid-lines">
                <!-- 水平网格线 -->
                <line v-for="i in 7" :key="'h-' + i"
                      :x1="30" :y1="20 + (i-1) * 16.67"
                      :x2="290" :y2="20 + (i-1) * 16.67"
                      stroke="#00bfff" stroke-width="0.3"
                      stroke-dasharray="3,3" opacity="0.6"/>
                
                <!-- 垂直网格线 -->
                <line v-for="i in 12" :key="'v-' + i"
                      :x1="30 + (i-1) * 24" :y1="20"
                      :x2="30 + (i-1) * 24" :y2="120"
                      stroke="#00bfff" stroke-width="0.3"
                      stroke-dasharray="3,3" opacity="0.4"/>
              </g>
              
              <!-- Y轴刻度标签 -->
              <g class="y-axis-labels">
                <text v-for="(value, index) in yAxisLabels" :key="'y-' + index"
                      :x="25" :y="120 - index * 16.67"
                      fill="#88ccff" font-size="10" text-anchor="end" dominant-baseline="central">{{ value }}</text>
              </g>
              
              <!-- X轴刻度标签 -->
              <g class="x-axis-labels">
                <text v-for="(time, index) in xAxisLabels" :key="'x-' + index"
                      :x="30 + index * 24" :y="140" 
                      fill="#88ccff" font-size="10" text-anchor="middle">{{ time }}</text>
              </g>
              
              <!-- 数据区域填充 -->
              <path :d="areaPath" fill="url(#chartGradient)" opacity="0.6"/>
              
              <!-- 折线 -->
              <path :d="linePath" fill="none" stroke="#00d4ff" 
                    stroke-width="2" filter="url(#glow)" 
                    class="trend-line"/>
              
              <!-- 数据点 -->
              <circle v-for="(point, index) in chartPoints" :key="'point-' + index"
                      :cx="point.x" :cy="point.y" r="3.5" 
                      fill="#00d4ff" stroke="#ffffff" stroke-width="1.5"
                      class="data-point" filter="url(#glow)"
                      :style="{ animationDelay: index * 0.1 + 's' }"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 实时画面弹窗 -->
    <el-dialog
      v-model="videoDialogVisible"
      :title="currentCamera.device_name + ' - 实时画面'"
      width="800px"
      @close="closeVideoDialog"
    >
      <div class="live-video-container">
        <video
          v-if="currentCamera.stream_url"
          :src="currentCamera.stream_url"
          controls
          autoplay
          muted
          width="100%"
          height="400px"
        />
        <div v-else class="video-loading">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <p>正在加载实时画面...</p>
        </div>
      </div>
      <div class="camera-info">
        <p><strong>设备信息：</strong></p>
        <p>设备名称：{{ currentCamera.device_name }}</p>
        <p>设备状态：<el-tag :type="currentCamera.status === '在线' ? 'success' : 'danger'" size="small">{{ currentCamera.status }}</el-tag></p>
        <p>分辨率：{{ currentCamera.resolution }}</p>
        <p>帧率：{{ currentCamera.fps }}fps</p>
      </div>
    </el-dialog>

    <!-- 告警详情弹窗 -->
    <el-dialog
      v-model="alarmDetailVisible"
      title="告警详情"
      width="600px"
    >
      <div class="alarm-detail">
        <div class="alarm-detail-image">
          <img :src="selectedAlarm.image" :alt="selectedAlarm.type" />
        </div>
        <div class="alarm-detail-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="告警类型">{{ selectedAlarm.type }}</el-descriptions-item>
            <el-descriptions-item label="发生时间">{{ selectedAlarm.time }}</el-descriptions-item>
            <el-descriptions-item label="告警位置">{{ selectedAlarm.location }}</el-descriptions-item>
            <el-descriptions-item label="设备名称">{{ selectedAlarm.device_name }}</el-descriptions-item>
            <el-descriptions-item label="告警ID" :span="2">{{ selectedAlarm.id }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>

    <!-- 自定义摄像头弹窗 - 手动输入流地址播放 -->
    <teleport to="body">
      <div 
        v-if="cameraPopupVisible" 
        class="custom-modal-overlay"
        @click.self="closeCameraPopup"
      >
        <div class="custom-modal live-video-modal">
          <!-- 弹窗头部 -->
          <div class="custom-modal-header">
            <h3 class="custom-modal-title">
              流媒体播放器
              <span v-if="currentStreamUrl && isPlaying" class="live-badge">
                <span class="live-dot-small"></span>
                LIVE
              </span>
            </h3>
            <button class="custom-modal-close" @click="closeCameraPopup">&times;</button>
          </div>
          
          <!-- 弹窗内容 -->
          <div class="custom-modal-body">
            <!-- 流地址输入区域 -->
            <div class="stream-input-area">
              <div class="input-row">
                <label class="input-label">流地址：</label>
                <input 
                  v-model="inputStreamUrl" 
                  type="text" 
                  class="stream-input"
                  placeholder="请输入流地址，例如：http://localhost/live/camera1.live.flv"
                  @keyup.enter="playStream"
                />
              </div>
              <div class="input-row">
                <label class="input-label">协议类型：</label>
                <select v-model="selectedProtocol" class="protocol-select">
                  <option value="auto">自动检测</option>
                  <option value="flv">HTTP-FLV (推荐，低延迟)</option>
                  <option value="hls">HLS (兼容性好)</option>
                  <option value="rtmp">RTMP</option>
                </select>
                <button @click="playStream" class="play-btn">
                  <span>▶</span> 播放
                </button>
                <button @click="stopStream" class="stop-btn">
                  <span>■</span> 停止
                </button>
              </div>
              <div class="quick-links">
                <span class="quick-label">快捷操作：</span>
                <button @click="setQuickUrl('flv')" class="quick-btn">FLV示例</button>
                <button @click="setQuickUrl('hls')" class="quick-btn">HLS示例</button>
                <button @click="getAvailableStreams" class="quick-btn check-btn">🔍 查看可用流</button>
              </div>
              
              <!-- 可用流列表 -->
              <div v-if="availableStreams.length > 0" class="streams-list">
                <div class="streams-title">📡 当前可用的流：</div>
                <div class="stream-item" v-for="(stream, index) in availableStreams" :key="index">
                  <div class="stream-info">
                    <span class="stream-name">{{ stream.app }}/{{ stream.stream }}</span>
                    <span class="stream-schema">{{ stream.schema }}</span>
                  </div>
                  <button @click="selectStream(stream)" class="use-btn">使用此流</button>
                </div>
              </div>
              <div v-else-if="checkingStreams" class="streams-loading">
                正在获取流列表...
              </div>
              <div v-else-if="noStreamsFound" class="streams-empty">
                ⚠️ 未发现活动的流，请先推流到ZLMediaKit服务器
              </div>
            </div>
            
            <!-- 实时视频播放区域 -->
            <div class="video-display-area">
              <div class="video-player-container">
                <!-- 通用流媒体播放器组件 - 支持FLV/HLS/RTMP等多种格式 -->
                <SimpleStreamPlayer 
                  v-if="currentStreamUrl"
                  :key="playerKey"
                  :src="currentStreamUrl"
                  :autoplay="false"
                  :type="selectedProtocol"
                />
                <div v-else class="no-stream-hint">
                  <div class="hint-icon">📺</div>
                  <div class="hint-text">请在上方输入流地址后点击播放</div>
                  <div class="hint-example">
                    <p>示例地址：</p>
                    <p>• http://localhost/live/camera1.live.flv</p>
                    <p>• http://localhost/live/camera1/hls.m3u8</p>
                    <p>• rtmp://localhost:1935/live/camera1</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 提示信息区域 -->
            <div class="info-display-area">
              <div class="stream-tips">
                <div class="tip-title">💡 使用说明：</div>
                <div class="tip-item">
                  <strong>1. 推流：</strong>使用OBS或FFmpeg推流到ZLMediaKit服务器
                </div>
                <div class="tip-item">
                  <strong>2. 推流地址：</strong>rtmp://服务器IP:1935/live/流名称
                </div>
                <div class="tip-item">
                  <strong>3. 播放地址：</strong>根据协议选择对应的播放地址格式
                </div>
                <div class="tip-item">
                  <strong>• FLV格式：</strong>http://服务器IP/live/流名称.live.flv (低延迟)
                </div>
                <div class="tip-item">
                  <strong>• HLS格式：</strong>http://服务器IP/live/流名称/hls.m3u8 (兼容性好)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </teleport>


    <!-- 摄像头悬停提示框 - 实时视频预览 -->
    <teleport to="body">
      <div 
        v-if="tooltipVisible"
        class="camera-tooltip"
        :style="{
          left: tooltipPosition.x + 'px',
          top: tooltipPosition.y + 'px'
        }"
      >
        <div class="tooltip-background">
          <div class="tooltip-content">
            <div class="tooltip-header">实时画面预览</div>
            <div class="tooltip-image">
              <!-- 实时截图预览 -->
              <img 
                :src="getStreamSnapshot(tooltipData.stream_name)" 
                :alt="tooltipData.device_name"
                class="live-snapshot"
                @error="handleSnapshotError"
              />
              <div class="live-indicator">
                <span class="live-dot"></span>
                LIVE
              </div>
            </div>
            <div class="tooltip-info">
              <div class="info-item">
                <span class="info-label">设备名称:</span>
                <span class="info-value">{{ tooltipData.device_name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">推流状态:</span>
                <span class="info-value" :class="isStreamOnline(tooltipData.stream_name) ? 'status-online' : 'status-offline'">
                  {{ isStreamOnline(tooltipData.stream_name) ? '在线' : '离线' }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">点击查看:</span>
                <span class="info-value">全屏实时画面</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 实时告警弹窗 - 使用 teleport 直接渲染到 body -->
    <teleport to="body">
      <div 
        v-if="showAlertPopup" 
        class="alert-popup-overlay"
        @click.self="closeAlert"
      >
        <div 
          class="alert-popup-container"
          @click="showAlertDetails"
          @mouseover="() => console.log('弹窗容器鼠标悬停')"
        >
          <button 
            class="alert-close-btn" 
            @click.stop="closeAlert"
            @mouseover="() => console.log('关闭按钮鼠标悬停')"
            title="关闭告警"
          >&times;</button>
          <div class="alert-popup-content">
            <h3>🚨 实时告警</h3>
            <p><strong>设备名称:</strong> {{ currentAlert.device_name }}</p>
            <p><strong>事件名称:</strong> {{ currentAlert.type }}</p>
            <p><strong>告警时间:</strong> {{ currentAlert.time }}</p>
            <p class="alert-tip">点击查看详情 →</p>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup name="HomeView">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { dashboardApi } from '@/api/dashboard'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import SimpleStreamPlayer from '@/components/SimpleStreamPlayer.vue'
// import { useAuthStore } from '@/stores/auth'
// const authStore = useAuthStore() // 暂时注释，如果需要可以取消注释
const loading = ref(false)
const videoDialogVisible = ref(false)
const alarmDetailVisible = ref(false)
// const cadMapContainer = ref(null) // 暂时注释，如果需要可以取消注释
// const trendChart = ref(null) // 已替换为SVG图表

// 地图拖拽相关状态
const mapImage = ref(null)
// 调整初始位置，让地图更好地居中显示，避免图片被切割
const mapPosition = reactive({ x: 0, y: 0 }) // 初始位置居中，高度匹配容器
const mapScale = ref(1) // 地图缩放比例
const isDragging = ref(false)
const dragStartPos = reactive({ x: 0, y: 0 })
const dragStartMapPos = reactive({ x: 0, y: 0 })

// 地图图片URL - 支持动态切换
const defaultMapImageUrl = new URL('@/assets/images/main/main-map.png', import.meta.url).href
const mapImageUrl = ref(defaultMapImageUrl)

// 新增状态
const showAlertPopup = ref(false)
const currentAlert = ref({})

// 摄像头弹窗状态
const cameraPopupVisible = ref(false)
const currentCameraPopup = ref({})

// 流媒体播放状态
const inputStreamUrl = ref('')
const currentStreamUrl = ref('')
const selectedProtocol = ref('auto')
const isPlaying = ref(false)
const playerKey = ref(0)

// 流列表状态
const availableStreams = ref([])
const checkingStreams = ref(false)
const noStreamsFound = ref(false)

// Tooltip状态
const tooltipVisible = ref(false)
const tooltipPosition = ref({ x: 0, y: 0 })
const tooltipData = ref({})
let tooltipTimer = null

// 数据看板数据
const dashboardData = reactive({
  camera_stats: {
    total_cameras: 30,
    online_cameras: 28,
    offline_cameras: 2,
    online_rate: 0.933
  },
  alarm_stats: {
    week_total: 85,
    today_total: 12,
    unprocessed: 5,
    processed: 7,
    processing: 1
  },
  device_stats: {
    total_devices: 35,
    online_devices: 32,
    online_rate: 0.914
  },
  system_stats: {
    detection_accuracy: 92.5,
    uptime: '99.8%'
  },
  task_stats: {
    online_tasks: 16,
    progress: 85
  },
  alarm_ranking: [
    { type: '异常行为', count: 35, percentage: 0.412 },
    { type: '车辆违规', count: 28, percentage: 0.329 },
    { type: '人员闯入', count: 22, percentage: 0.259 }
  ],
  latest_alarms: [
    {
      id: 101,
      time: '2024-01-20 15:45:30',
      type: '异常行为',
      location: '前门',
      image: '/uploads/alarms/20240120_1545_101.jpg',
      device_name: '前门摄像头'
    },
    {
      id: 102,
      time: '2024-01-20 11:03:06',
      type: '未戴安全帽',
      location: '演示61摄像机',
      image: '/uploads/alarms/20240120_1103_102.jpg',
      device_name: '演示61摄像机'
    },
    {
      id: 103,
      time: '2024-01-20 11:01:23',
      type: '烟火检测',
      location: '演示253摄像机',
      image: '/uploads/alarms/20240120_1101_103.jpg',
      device_name: '演示253摄像机'
    },
    {
      id: 104,
      time: '2024-01-20 10:56:31',
      type: '人员闯入',
      location: '演示211摄像机',
      image: '/uploads/alarms/20240120_1056_104.jpg',
      device_name: '演示211摄像机'
    }
  ]
})

// 最近告警（用于事件通知）
const recentAlarms = computed(() => {
  return dashboardData.latest_alarms.slice(0, 3)
})

// 排行榜图表数据
const rankingChartData = computed(() => {
  const deviceNames = ['演示253摄像机', '演示61摄像机', '演示211摄像机', '演示102摄像机', '演示178摄像机']
  const strokeColors = ['#ff6b35', '#ffa500', '#00bfff', '#1e90ff', '#4682b4']
  
  // 扩展数据到5个项目，为后面两项添加固定假数据
  const extendedRanking = [
    ...dashboardData.alarm_ranking,
    { type: '智能监控', count: 8 },
    { type: '数据分析', count: 3 }
  ].slice(0, 5)
  
  const maxCount = Math.max(...extendedRanking.map(item => item.count), 1)
  
  return extendedRanking.map((item, index) => ({
    deviceName: deviceNames[index],
    count: item.count,
    percentage: item.count / maxCount,
    strokeColor: strokeColors[index]
  }))
})

// 趋势图表数据
const trendChartData = ref([5, 15, 6, 13, 6, 2, 1, 0, 0, 1, 9, 18])
const xAxisLabels = ref(['12', '14', '16', '18', '20', '22', '0', '2', '4', '6', '8', '10'])

// Y轴标签 - 支持动态计算或手动设置
const yAxisLabels = computed(() => {
  // 方式1：固定标签（当前使用）
  return [0, 3, 6, 9, 12, 15, 18]
  
  // 方式2：动态计算（后续可启用）
  // const maxDataValue = Math.max(...trendChartData.value)
  // const maxY = Math.ceil(maxDataValue * 1.2 / 5) * 5 // 向上取整到5的倍数，并留20%余量
  // const step = maxY / 6
  // return Array.from({length: 7}, (_, i) => Math.round(i * step))
})

// 图表点坐标计算
const chartPoints = computed(() => {
  const maxValue = Math.max(...yAxisLabels.value)
  return trendChartData.value.map((value, index) => ({
    x: 30 + index * 24, // 与垂直网格线对齐
    y: 120 - (value / maxValue) * 100 // Y轴范围 20-120，总高度100
  }))
})

// 折线路径
const linePath = computed(() => {
  if (chartPoints.value.length === 0) return ''
  
  let path = `M ${chartPoints.value[0].x} ${chartPoints.value[0].y}`
  for (let i = 1; i < chartPoints.value.length; i++) {
    path += ` L ${chartPoints.value[i].x} ${chartPoints.value[i].y}`
  }
  return path
})

// 区域填充路径
const areaPath = computed(() => {
  if (chartPoints.value.length === 0) return ''

  let path = `M ${chartPoints.value[0].x} 120` // 与网格线底部对齐
  path += ` L ${chartPoints.value[0].x} ${chartPoints.value[0].y}`

  for (let i = 1; i < chartPoints.value.length; i++) {
    path += ` L ${chartPoints.value[i].x} ${chartPoints.value[i].y}`
  }

  path += ` L ${chartPoints.value[chartPoints.value.length - 1].x} 120 Z` // 与网格线底部对齐
  return path
})

// 环形图圆弧长度计算
const totalCircumference = computed(() => {
  return 2 * Math.PI * 40 // 半径为40的圆周长
})

const processedArcLength = computed(() => {
  const total = dashboardData.alarm_stats.processed + dashboardData.alarm_stats.unprocessed
  if (total === 0) return 0
  return (dashboardData.alarm_stats.processed / total) * totalCircumference.value
})

const unprocessedArcLength = computed(() => {
  const total = dashboardData.alarm_stats.processed + dashboardData.alarm_stats.unprocessed
  if (total === 0) return 0
  return (dashboardData.alarm_stats.unprocessed / total) * totalCircumference.value
})


// 已删除CAD图层数据相关代码

// 地图拖拽方法
const startDrag = (event) => {
  // 检查是否点击了弹窗区域，如果是则不启动拖拽
  if (showAlertPopup.value) {
    const alertPopup = document.querySelector('.alert-popup')
    if (alertPopup) {
      const rect = alertPopup.getBoundingClientRect()
      const x = event.clientX
      const y = event.clientY
      
      // 如果点击位置在弹窗区域内，不启动拖拽
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return
      }
    }
  }

  event.preventDefault()
  event.stopPropagation()

  isDragging.value = true
  dragStartPos.x = event.clientX
  dragStartPos.y = event.clientY
  dragStartMapPos.x = mapPosition.x
  dragStartMapPos.y = mapPosition.y

  // 添加全局鼠标事件监听器
  document.addEventListener('mousemove', handleMouseMove, { passive: false })
  document.addEventListener('mouseup', handleMouseUp, { passive: false })
  
  // 添加容器事件监听，确保在容器范围内也能响应
  const mapContainer = document.querySelector('.map-container')
  if (mapContainer) {
    mapContainer.addEventListener('mousemove', handleMouseMove, { passive: false })
    mapContainer.addEventListener('mouseup', handleMouseUp, { passive: false })
    mapContainer.addEventListener('mouseleave', handleMouseUp, { passive: false })
  }
  
  document.body.style.cursor = 'grabbing'
  document.body.style.userSelect = 'none'
  
  // 禁用页面滚动
  document.body.style.overflow = 'hidden'
}

const handleMouseMove = (event) => {
  if (!isDragging.value) return
  
  // 检查是否在弹窗区域内，如果是则不处理拖拽
  if (showAlertPopup.value) {
    const alertPopup = document.querySelector('.alert-popup')
    if (alertPopup) {
      const rect = alertPopup.getBoundingClientRect()
      const x = event.clientX
      const y = event.clientY
      
      // 如果鼠标位置在弹窗区域内，不处理拖拽
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return
      }
    }
  }
  
  event.preventDefault()
  event.stopPropagation()

  const deltaX = event.clientX - dragStartPos.x
  const deltaY = event.clientY - dragStartPos.y

  // 计算新位置
  let newX = dragStartMapPos.x + deltaX
  let newY = dragStartMapPos.y + deltaY

  // 边界限制 - 根据缩放比例动态调整边界
  const baseLimit = 400
  const scaledLimit = baseLimit * mapScale.value
  const maxX = scaledLimit  // 向右最大移动距离
  const minX = -scaledLimit // 向左最大移动距离
  const maxY = scaledLimit  // 向上最大移动距离
  const minY = -scaledLimit // 向下最大移动距离

  newX = Math.max(minX, Math.min(maxX, newX))
  newY = Math.max(minY, Math.min(maxY, newY))

  mapPosition.x = newX
  mapPosition.y = newY
}

const handleMouseUp = (event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  isDragging.value = false
  document.body.style.cursor = 'default'
  document.body.style.userSelect = ''
  document.body.style.overflow = ''

  // transform 现在由 Vue 的响应式系统自动更新，无需手动设置

  // 移除全局事件监听器
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
  
  // 移除容器事件监听器
  const mapContainer = document.querySelector('.map-container')
  if (mapContainer) {
    mapContainer.removeEventListener('mousemove', handleMouseMove)
    mapContainer.removeEventListener('mouseup', handleMouseUp)
    mapContainer.removeEventListener('mouseleave', handleMouseUp)
    mapContainer.removeEventListener('touchmove', handleTouchMove)
    mapContainer.removeEventListener('touchend', handleTouchEnd)
  }
}

// 触摸设备拖拽支持
const startTouchDrag = (event) => {
  const touch = event.touches[0]
  if (!touch) return

  // 检查是否触摸了弹窗区域，如果是则不启动拖拽
  if (showAlertPopup.value) {
    const alertPopup = document.querySelector('.alert-popup')
    if (alertPopup) {
      const rect = alertPopup.getBoundingClientRect()
      const x = touch.clientX
      const y = touch.clientY
      
      // 如果触摸位置在弹窗区域内，不启动拖拽
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return
      }
    }
  }

  event.preventDefault()
  event.stopPropagation()

  isDragging.value = true
  dragStartPos.x = touch.clientX
  dragStartPos.y = touch.clientY
  dragStartMapPos.x = mapPosition.x
  dragStartMapPos.y = mapPosition.y

  // 添加触摸事件监听器
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd, { passive: false })
  
  const mapContainer = document.querySelector('.map-container')
  if (mapContainer) {
    mapContainer.addEventListener('touchmove', handleTouchMove, { passive: false })
    mapContainer.addEventListener('touchend', handleTouchEnd, { passive: false })
  }
  
  document.body.style.overflow = 'hidden'
}

const handleTouchMove = (event) => {
  if (!isDragging.value) return
  event.preventDefault()
  event.stopPropagation()

  const touch = event.touches[0]
  if (!touch) return

  const deltaX = touch.clientX - dragStartPos.x
  const deltaY = touch.clientY - dragStartPos.y

  // 计算新位置
  let newX = dragStartMapPos.x + deltaX
  let newY = dragStartMapPos.y + deltaY

  // 边界限制 - 根据缩放比例动态调整边界
  const baseLimit = 400
  const scaledLimit = baseLimit * mapScale.value
  const maxX = scaledLimit  // 向右最大移动距离
  const minX = -scaledLimit // 向左最大移动距离
  const maxY = scaledLimit  // 向上最大移动距离
  const minY = -scaledLimit // 向下最大移动距离

  newX = Math.max(minX, Math.min(maxX, newX))
  newY = Math.max(minY, Math.min(maxY, newY))

  mapPosition.x = newX
  mapPosition.y = newY
}

const handleTouchEnd = (event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  isDragging.value = false

  // transform 现在由 Vue 的响应式系统自动更新，无需手动设置
  
  handleMouseUp()
}

// 地图缩放功能 - 鼠标滚轮
const handleWheel = (event) => {
  // 检查是否在弹窗区域内，如果是则不处理缩放
  if (showAlertPopup.value) {
    const alertPopup = document.querySelector('.alert-popup')
    if (alertPopup) {
      const rect = alertPopup.getBoundingClientRect()
      const x = event.clientX
      const y = event.clientY
      
      // 如果鼠标位置在弹窗区域内，不处理缩放
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return
      }
    }
  }

  event.preventDefault()
  event.stopPropagation()

  // 计算缩放增量
  const delta = -event.deltaY * 0.001
  let newScale = mapScale.value + delta

  // 限制缩放范围：0.5 到 3 倍
  newScale = Math.max(0.5, Math.min(3, newScale))

  // 如果缩放值没有变化，直接返回
  if (newScale === mapScale.value) return

  // 更新缩放值
  mapScale.value = newScale

  // 当缩放变化时，调整边界限制
  const baseLimit = 400
  const scaledLimit = baseLimit * mapScale.value
  const maxX = scaledLimit
  const minX = -scaledLimit
  const maxY = scaledLimit
  const minY = -scaledLimit

  // 确保当前位置在新的边界内
  mapPosition.x = Math.max(minX, Math.min(maxX, mapPosition.x))
  mapPosition.y = Math.max(minY, Math.min(maxY, mapPosition.y))
}

// 从localStorage加载自定义地图图层
const loadCustomMapLayer = () => {
  try {
    const savedMapData = localStorage.getItem('homePageMapLayer')
    if (savedMapData) {
      const mapData = JSON.parse(savedMapData)
      if (mapData.imageUrl) {
        mapImageUrl.value = mapData.imageUrl
        console.log('已加载自定义地图图层:', mapData.layerName)
      }
    }
  } catch (error) {
    console.error('加载自定义地图图层失败:', error)
    // 如果加载失败，使用默认地图
    mapImageUrl.value = defaultMapImageUrl
  }
}

// 处理地图更新事件
const handleMapUpdate = (event) => {
  try {
    const mapData = event.detail
    if (mapData && mapData.imageUrl) {
      mapImageUrl.value = mapData.imageUrl
      console.log('地图已更新为:', mapData.layerName)
      ElMessage.success(`地图已切换为: ${mapData.layerName}`)
    }
  } catch (error) {
    console.error('更新地图失败:', error)
    ElMessage.error('更新地图失败')
  }
}

// 当前摄像头
const currentCamera = ref({})

// 选中的告警
const selectedAlarm = ref({})

// 背景摄像头数据 - 支持实时视频流
const cameraData = ref([
  {
    id: 1,
    device_name: '摄像机1',
    status: '在线',
    stream_name: 'camera1', // OBS推流密钥
    image: 'https://via.placeholder.com/600x400/1a1a1a/00d4ff?text=摄像机1实时画面',
    alert_time: '2024-08-27 14:02:45',
    alert_type: '未戴安全帽'
  },
  {
    id: 2,
    device_name: '摄像机2', 
    status: '在线',
    stream_name: 'camera2', // OBS推流密钥
    image: 'https://via.placeholder.com/600x400/1a1a1a/00d4ff?text=摄像机2实时画面',
    alert_time: '2024-08-27 13:58:32',
    alert_type: '异常行为'
  }
])

// 视频流相关状态
const streamStatus = ref({
  camera1: false,
  camera2: false
})

// 流媒体服务器配置
const streamConfig = {
  baseUrl: 'http://localhost',  // ZLMediaKit服务器地址
  httpPort: 18080,               // HTTP端口（根据你的ZLMediaKit实际端口修改）
  app: 'live',                   // 应用名，默认live
  protocol: 'flv',               // 播放协议: 'flv' | 'hls' | 'rtmp'
  snapshotPath: '/snapshots',
  secret: 'siPkSq8Wq07uQTIOOJagCwolXp2ErmcH'  // API密钥（从config.ini中的api.secret获取）
}

// 这些函数暂时注释，如果需要可以取消注释
// const getStatusColor = (rate) => {
//   if (rate >= 0.9) return 'success'
//   if (rate >= 0.7) return 'warning'
//   return 'danger'
// }

// const getRankingColor = (index) => {
//   const colors = ['#f56c6c', '#e6a23c', '#67c23a', '#409eff', '#909399']
//   return colors[index] || '#909399'
// }

// const formatTime = (timeStr) => {
//   const time = new Date(timeStr)
//   return time.toLocaleTimeString('zh-CN', { hour12: false })
// }

// 格式化事件时间（仅显示时分秒）
const formatEventTime = (timeStr) => {
  const time = new Date(timeStr)
  return time.toLocaleTimeString('zh-CN', { hour12: false }).slice(0, 8)
}


// 获取设备名称（用于排行榜）- 已被rankingChartData计算属性替代
// const getDeviceName = (type) => {
//   const deviceMap = {
//     '异常行为': '演示253摄像机',
//     '车辆违规': '演示61摄像机',
//     '人员闯入': '演示211摄像机'
//   }
//   return deviceMap[type] || '演示102摄像机'
// }



// 关闭告警弹窗
const closeAlert = (event) => {
  console.log('closeAlert called', event) // 添加调试日志
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  showAlertPopup.value = false
}

// 显示告警详情
const showAlertDetails = () => {
  ElMessage.info('跳转到告警详情页面...')
  showAlertPopup.value = false
}

// 显示摄像头弹窗
const showCameraPopup = (camera) => {
  if (!camera) return
  currentCameraPopup.value = camera
  cameraPopupVisible.value = true
}

// 关闭摄像头弹窗
const closeCameraPopup = () => {
  cameraPopupVisible.value = false
  currentCameraPopup.value = {}
  stopStream() // 关闭弹窗时停止播放
}

// 播放流
const playStream = () => {
  if (!inputStreamUrl.value.trim()) {
    ElMessage.warning('请输入流地址')
    return
  }
  
  currentStreamUrl.value = inputStreamUrl.value.trim()
  isPlaying.value = true
  playerKey.value++ // 强制重新渲染播放器
  
  ElMessage.success('开始播放...')
}

// 停止播放
const stopStream = () => {
  currentStreamUrl.value = ''
  isPlaying.value = false
  playerKey.value++
}

// 设置快捷示例地址
const setQuickUrl = (type) => {
  const { baseUrl, httpPort, app } = streamConfig
  const port = httpPort === 80 ? '' : `:${httpPort}`
  const streamName = 'camera1' // 默认流名称
  
  if (type === 'flv') {
    inputStreamUrl.value = `${baseUrl}${port}/${app}/${streamName}.live.flv`
    selectedProtocol.value = 'flv'
    ElMessage.info('已填入FLV格式示例地址')
  } else if (type === 'hls') {
    inputStreamUrl.value = `${baseUrl}${port}/${app}/${streamName}/hls.m3u8`
    selectedProtocol.value = 'hls'
    ElMessage.info('已填入HLS格式示例地址')
  }
}

// 获取可用的流列表
const getAvailableStreams = async () => {
  checkingStreams.value = true
  noStreamsFound.value = false
  availableStreams.value = []
  
  try {
    const { baseUrl, httpPort, secret } = streamConfig
    const port = httpPort === 80 ? '' : `:${httpPort}`
    // 添加secret参数
    const apiUrl = `${baseUrl}${port}/index/api/getMediaList?secret=${secret}`
    
    console.log('正在获取流列表:', apiUrl)
    
    const response = await fetch(apiUrl)
    const data = await response.json()
    
    console.log('流列表响应:', data)
    
    if (data.code === 0 && data.data && data.data.length > 0) {
      availableStreams.value = data.data
      ElMessage.success(`找到 ${data.data.length} 个活动的流`)
    } else if (data.code === -300) {
      // secret错误
      ElMessage.error('API密钥错误，请在config.ini中查找正确的secret值')
      noStreamsFound.value = true
    } else {
      noStreamsFound.value = true
      ElMessage.warning('未发现活动的流，请先推流到ZLMediaKit')
    }
  } catch (error) {
    console.error('获取流列表失败:', error)
    ElMessage.error('获取流列表失败，请检查ZLMediaKit是否运行在正确的端口')
    noStreamsFound.value = true
  } finally {
    checkingStreams.value = false
  }
}

// 选择并使用某个流
const selectStream = (stream) => {
  const { baseUrl, httpPort } = streamConfig
  const port = httpPort === 80 ? '' : `:${httpPort}`
  const app = stream.app
  const streamName = stream.stream
  const schema = stream.schema // 使用流对象自身的协议类型
  
  // 根据流自身的协议类型生成URL
  if (schema === 'rtsp') {
    // RTSP流使用FLV播放
    inputStreamUrl.value = `${baseUrl}${port}/${app}/${streamName}.live.flv`
    selectedProtocol.value = 'flv'
  } else if (schema === 'rtmp') {
    // RTMP流也使用FLV播放
    inputStreamUrl.value = `${baseUrl}${port}/${app}/${streamName}.live.flv`
    selectedProtocol.value = 'flv'
  } else if (schema === 'hls') {
    inputStreamUrl.value = `${baseUrl}${port}/${app}/${streamName}/hls.m3u8`
    selectedProtocol.value = 'hls'
  } else {
    // 默认使用FLV
    inputStreamUrl.value = `${baseUrl}${port}/${app}/${streamName}.live.flv`
    selectedProtocol.value = 'flv'
  }
  
  ElMessage.success(`已选择流: ${app}/${streamName} (${schema})`)
}

// 获取流地址 - 支持FLV、HLS、RTMP等多种格式
const getStreamUrl = (streamName) => {
  if (!streamName) return ''
  
  const { baseUrl, httpPort, app, protocol } = streamConfig
  const port = httpPort === 80 ? '' : `:${httpPort}`
  
  // 根据协议生成对应的流地址
  switch (protocol) {
    case 'flv':
      // FLV格式: http://ip:port/app/stream.live.flv
      return `${baseUrl}${port}/${app}/${streamName}.live.flv`
    case 'hls':
      // HLS格式: http://ip:port/app/stream/hls.m3u8
      return `${baseUrl}${port}/${app}/${streamName}/hls.m3u8`
    case 'rtmp':
      // RTMP格式: rtmp://ip:1935/app/stream
      return `rtmp://${baseUrl.replace('http://', '')}:1935/${app}/${streamName}`
    default:
      // 默认使用FLV格式（低延迟）
      return `${baseUrl}${port}/${app}/${streamName}.live.flv`
  }
}

// 获取实时截图地址
const getStreamSnapshot = (streamName) => {
  if (!streamName) return ''
  // 添加时间戳防止缓存
  const timestamp = Date.now()
  return `${streamConfig.baseUrl}${streamConfig.snapshotPath}/${streamName}_latest.jpg?t=${timestamp}`
}

// 检查流是否在线
const isStreamOnline = (streamName) => {
  return streamStatus.value[streamName] || false
}

// 处理截图加载错误
const handleSnapshotError = (event) => {
  console.warn('截图加载失败:', event.target.src)
  // 可以设置默认图片
  event.target.src = '/src/assets/images/main/main-camera-box.png'
}

// 这些视频加载函数已由 HLSVideoPlayer 组件内部处理

// 检查流状态
const checkStreamStatus = async () => {
  try {
    // 检查每个摄像头的流状态
    for (const camera of cameraData.value) {
      const streamName = camera.stream_name
      try {
        // 尝试获取HLS播放列表来检查流是否存在
        const response = await fetch(getStreamUrl(streamName), { method: 'HEAD' })
        streamStatus.value[streamName] = response.ok
      } catch (error) {
        streamStatus.value[streamName] = false
      }
    }
  } catch (error) {
    console.error('检查流状态失败:', error)
  }
}

// 显示tooltip
const showTooltip = (event, cameraData) => {
  // 清除之前的定时器
  if (tooltipTimer) {
    clearTimeout(tooltipTimer)
  }
  
  // 设置tooltip数据
  tooltipData.value = cameraData
  
  // 计算tooltip位置
  const rect = event.target.getBoundingClientRect()
  tooltipPosition.value = {
    x: rect.right + 20, // 在摄像头右侧显示，留20px间距
    y: rect.top + rect.height / 2 - 125 // 垂直居中对齐摄像头
  }
  
  // 边界检查
  const tooltipWidth = 380 // 从300px扩大到380px
  const tooltipHeight = 250 // 从200px扩大到250px
  
  // 防止超出右边界，如果右侧空间不够则显示在左侧
  if (tooltipPosition.value.x + tooltipWidth > window.innerWidth) {
    tooltipPosition.value.x = rect.left - tooltipWidth - 20 // 显示在摄像头左侧
  }
  
  // 防止超出左边界
  if (tooltipPosition.value.x < 20) {
    tooltipPosition.value.x = 20
  }
  
  // 防止超出上边界
  if (tooltipPosition.value.y < 20) {
    tooltipPosition.value.y = 20
  }
  
  // 防止超出下边界
  if (tooltipPosition.value.y + tooltipHeight > window.innerHeight) {
    tooltipPosition.value.y = window.innerHeight - tooltipHeight - 20
  }
  
  // 延迟显示tooltip
  tooltipTimer = setTimeout(() => {
    tooltipVisible.value = true
  }, 300)
}

// 隐藏tooltip
const hideTooltip = () => {
  if (tooltipTimer) {
    clearTimeout(tooltipTimer)
  }
  tooltipVisible.value = false
}

// 模拟实时数据更新 - 暂时禁用告警弹窗
const updateRealTimeData = () => {
  // 更新告警统计数据
  const totalAlerts = Math.floor(Math.random() * 15) + 5
  const processedAlerts = Math.floor(totalAlerts * 0.4)
  const processingAlerts = Math.floor(totalAlerts * 0.1)
  const unprocessedAlerts = totalAlerts - processedAlerts - processingAlerts

  dashboardData.alarm_stats.today_total = totalAlerts
  dashboardData.alarm_stats.processed = processedAlerts
  dashboardData.alarm_stats.unprocessed = unprocessedAlerts
  dashboardData.alarm_stats.processing = processingAlerts

  // 随机显示告警弹窗 - 暂时禁用
  // if (Math.random() > 0.85) {
  //   currentAlert.value = {
  //     device_name: '摄像机1',
  //     type: '未戴安全帽',
  //     time: new Date().toLocaleString('zh-CN')
  //   }
  //   showAlertPopup.value = true
  // }
}

// 加载数据看板数据
const loadDashboardData = async () => {
  loading.value = true
  try {
    const response = await dashboardApi.getOverview()
    if (response.success) {
      Object.assign(dashboardData, response.data)
    }
  } catch (error) {
    console.error('加载数据看板失败:', error)
    // 暂时禁用错误提示，避免资源不存在时的错误弹窗
    // ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 已删除loadCadMapData函数

// 查看告警详情
const viewAlarmDetail = (alarm) => {
  selectedAlarm.value = alarm
  alarmDetailVisible.value = true
}

// 关闭视频弹窗
const closeVideoDialog = () => {
  videoDialogVisible.value = false
  currentCamera.value = {}
}

// 这些函数暂时注释，如果需要可以取消注释
// const showCameraLive = async (camera) => {
//   currentCamera.value = { ...camera }
//   videoDialogVisible.value = true
//   
//   try {
//     const response = await dashboardApi.getCameraLive(camera.device_id)
//     if (response.success) {
//       currentCamera.value = { ...currentCamera.value, ...response.body }
//     }
//   } catch (error) {
//     console.error('获取实时画面失败:', error)
//     ElMessage.error('获取实时画面失败')
//   }
// }

// const refreshRanking = () => {
//   loadDashboardData()
// }

// const refreshAlarmImages = () => {
//   loadDashboardData()
// }

// const refreshCadMap = () => {
//   loadCadMapData()
// }

// const fullscreenMap = () => {
//   if (cadMapContainer.value) {
//     if (cadMapContainer.value.requestFullscreen) {
//       cadMapContainer.value.requestFullscreen()
//     }
//   }
// }

// 定时刷新数据
let refreshInterval = null

// SVG图表已替代Chart.js，相关代码已移除
// 如果需要动态更新图表数据，可以直接修改trendChartData的值
// 
// Y轴范围调整说明：
// 1. 简单调整：直接修改yAxisLabels computed中的return数组
// 2. 智能调整：取消注释动态计算部分，会根据数据自动调整Y轴范围
// 3. 混合方式：可以设置最小显示范围，避免数据较小时图表过于扁平

onMounted(() => {
  loadDashboardData()

  // 从localStorage加载自定义地图图层
  loadCustomMapLayer()
  
  // 监听地图更新事件
  window.addEventListener('homePageMapUpdate', handleMapUpdate)

  // 每30秒刷新一次数据
  refreshInterval = setInterval(() => {
    loadDashboardData()
    updateRealTimeData()
  }, 30000)
  
  // 初始化视频流状态检查
  checkStreamStatus()
  
  // 每10秒检查一次流状态
  const streamCheckInterval = setInterval(() => {
    checkStreamStatus()
  }, 10000)
  
  // 在组件卸载时清除定时器
  onUnmounted(() => {
    if (refreshInterval) clearInterval(refreshInterval)
    if (streamCheckInterval) clearInterval(streamCheckInterval)
  })
  
  // 8秒后显示告警弹窗 - 暂时禁用
  // setTimeout(() => {
  //   currentAlert.value = {
  //     device_name: '摄像机1',
  //     type: '未戴安全帽',
  //     time: new Date().toLocaleString('zh-CN')
  //   }
  //   showAlertPopup.value = true
  // }, 8000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  
  // 移除地图更新事件监听器
  window.removeEventListener('homePageMapUpdate', handleMapUpdate)
  
  // 清理地图拖拽事件监听器
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
  
  // 清理容器事件监听器
  const mapContainer = document.querySelector('.map-container')
  if (mapContainer) {
    mapContainer.removeEventListener('mousemove', handleMouseMove)
    mapContainer.removeEventListener('mouseup', handleMouseUp)
    mapContainer.removeEventListener('mouseleave', handleMouseUp)
    mapContainer.removeEventListener('touchmove', handleTouchMove)
    mapContainer.removeEventListener('touchend', handleTouchEnd)
  }
  
  // 恢复页面状态
  document.body.style.cursor = 'default'
  document.body.style.userSelect = ''
  document.body.style.overflow = ''
  
  // 清理tooltip定时器
  if (tooltipTimer) {
    clearTimeout(tooltipTimer)
  }
})
</script>

<style scoped>
/* 工业风格深色主题 */
.industrial-dashboard {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  /* 背景现在由App.vue统一管理 */
  background: transparent;
  color: #ffffff;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

/* 增强的顶部渐变过渡效果 - 让header区域与背景地图更自然融合 */
.industrial-dashboard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 35vh; /* 调整为视口高度的35% */
  background: linear-gradient(
    to bottom,
    rgba(0, 50, 100, 0.75) 0%,    /* 大幅加强顶部透明度从0.45到0.75 */
    rgba(0, 45, 90, 0.70) 6%,     /* 更密集且更深的渐变层次 */
    rgba(0, 42, 84, 0.65) 12%,
    rgba(0, 38, 76, 0.60) 18%,
    rgba(0, 35, 70, 0.55) 24%,
    rgba(0, 32, 64, 0.50) 30%,
    rgba(0, 30, 60, 0.45) 36%,
    rgba(0, 28, 56, 0.40) 42%,
    rgba(0, 25, 50, 0.35) 48%,
    rgba(0, 22, 44, 0.30) 54%,
    rgba(0, 20, 40, 0.25) 60%,
    rgba(0, 18, 36, 0.20) 66%,
    rgba(0, 15, 30, 0.16) 72%,
    rgba(0, 13, 26, 0.12) 78%,
    rgba(0, 12, 24, 0.09) 84%,
    rgba(0, 10, 20, 0.06) 90%,
    rgba(0, 8, 16, 0.04) 94%,
    rgba(0, 6, 12, 0.02) 97%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
  /* 增强模糊效果 */
  backdrop-filter: blur(1px);
}

/* 增强的底部渐变过渡效果 - 与顶部呼应 */
.industrial-dashboard::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 25vh; /* 调整为视口高度的25% */
  background: linear-gradient(
    to top,
    rgba(0, 45, 90, 0.55) 0%,     /* 大幅加强底部透明度从0.25到0.55 */
    rgba(0, 40, 80, 0.50) 10%,    /* 更密集且更深的渐变层次 */
    rgba(0, 38, 76, 0.45) 20%,
    rgba(0, 35, 70, 0.40) 30%,
    rgba(0, 32, 64, 0.35) 40%,
    rgba(0, 30, 60, 0.30) 50%,
    rgba(0, 25, 50, 0.25) 60%,
    rgba(0, 22, 44, 0.20) 70%,
    rgba(0, 18, 36, 0.15) 78%,
    rgba(0, 15, 30, 0.12) 84%,
    rgba(0, 13, 26, 0.09) 88%,
    rgba(0, 10, 20, 0.06) 92%,
    rgba(0, 8, 16, 0.04) 95%,
    rgba(0, 5, 10, 0.02) 98%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
  /* 增强模糊效果 */
  backdrop-filter: blur(0.8px);
}

/* 左侧渐变过渡效果 - 回到原始方法 */
.left-gradient-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 450px;
  height: 100vh;
  background: linear-gradient(
    to right,
    rgba(0, 50, 100, 0.65) 0%,
    rgba(0, 48, 96, 0.60) 5%,
    rgba(0, 45, 90, 0.55) 10%,
    rgba(0, 42, 84, 0.50) 15%,
    rgba(0, 40, 80, 0.45) 20%,
    rgba(0, 38, 76, 0.40) 25%,
    rgba(0, 35, 70, 0.35) 30%,
    rgba(0, 32, 64, 0.30) 35%,
    rgba(0, 30, 60, 0.25) 40%,
    rgba(0, 28, 56, 0.22) 45%,
    rgba(0, 25, 50, 0.19) 50%,
    rgba(0, 22, 44, 0.16) 55%,
    rgba(0, 20, 40, 0.13) 60%,
    rgba(0, 18, 36, 0.10) 65%,
    rgba(0, 15, 30, 0.08) 70%,
    rgba(0, 13, 26, 0.06) 75%,
    rgba(0, 12, 24, 0.04) 80%,
    rgba(0, 10, 20, 0.03) 85%,
    rgba(0, 8, 16, 0.02) 90%,
    rgba(0, 6, 12, 0.01) 95%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* 右侧渐变过渡效果 - 回到原始方法 */
.right-gradient-overlay {
  position: fixed;
  top: 0;
  right: 0;
  width: 450px;
  height: 100vh;
  background: linear-gradient(
    to left,
    rgba(0, 50, 100, 0.65) 0%,
    rgba(0, 48, 96, 0.60) 5%,
    rgba(0, 45, 90, 0.55) 10%,
    rgba(0, 42, 84, 0.50) 15%,
    rgba(0, 40, 80, 0.45) 20%,
    rgba(0, 38, 76, 0.40) 25%,
    rgba(0, 35, 70, 0.35) 30%,
    rgba(0, 32, 64, 0.30) 35%,
    rgba(0, 30, 60, 0.25) 40%,
    rgba(0, 28, 56, 0.22) 45%,
    rgba(0, 25, 50, 0.19) 50%,
    rgba(0, 22, 44, 0.16) 55%,
    rgba(0, 20, 40, 0.13) 60%,
    rgba(0, 18, 36, 0.10) 65%,
    rgba(0, 15, 30, 0.08) 70%,
    rgba(0, 13, 26, 0.06) 75%,
    rgba(0, 12, 24, 0.04) 80%,
    rgba(0, 10, 20, 0.03) 85%,
    rgba(0, 8, 16, 0.02) 90%,
    rgba(0, 6, 12, 0.01) 95%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
}


/* 可拖拽地图容器 - 限制在中间52%区域，优化以显示更多地图内容 */
.map-container {
  position: fixed;
  top: 20px; /* 进一步向上移动，让header的伪元素能够覆盖地图顶部 */
  left: calc(24% + 5px + 5px); /* 减少左侧间距，给地图更多空间 */
  width: calc(52% - 10px); /* 减少宽度扣减，为地图留更多空间 */
  height: calc(100vh - 20px); /* 调整高度，让地图从顶部开始 */
  overflow: hidden; /* 保持hidden，防止滚动条 */
  z-index: 900; /* 提高层级，确保在background-cameras之上，但仍低于header的1000 */
  cursor: grab;
  /* 确保容器可以接收鼠标事件，但不要拦截弹窗 */
  pointer-events: auto;
  /* 添加边框调试（可选） */
  /* border: 1px solid rgba(255, 0, 0, 0.3); */
}

.map-container:hover {
  cursor: grab;
}

.map-container:active {
  cursor: grabbing;
}

/* 地图内容包裹层 - 统一应用 transform 变换 */
.map-content-wrapper {
  position: absolute;
  top: 0;
  left: 50%;
  width: 100vw;
  height: 100%;
  pointer-events: none; /* 容器本身不拦截事件 */
  transition: none; /* 移除过渡效果，确保拖拽流畅 */
}

/* 可拖拽地图图片 */
.draggable-map {
  position: absolute;
  top: 0; /* 顶部对齐容器 */
  left: 0; /* 左侧对齐，因为父容器已经居中 */
  width: auto; /* 自动宽度，保持图片比例 */
  height: 100%; /* 高度设置为容器高度 */
  object-fit: contain; /* 使用contain保持完整图片内容 */
  opacity: 0.9; /* 增加不透明度，让标题栏遮盖效果更明显 */
  transition: opacity 0.3s ease;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  cursor: grab; /* 为图片添加抓手光标 */
  /* 确保图片可以接收鼠标事件 */
  pointer-events: none; /* 图片本身不接收事件，由父容器处理 */
  /* 防止图片被选中 */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  /* 确保图片完全覆盖并可拖拽 */
  min-width: 100vw;
  min-height: 100vh;
}

.draggable-map:active {
  cursor: grabbing;
}

/* 拖拽时的样式 */
.map-container.dragging {
  cursor: grabbing !important;
}

.map-container.dragging .draggable-map {
  opacity: 0.7; /* 拖拽时保持较高透明度，确保内容可见 */
  cursor: grabbing !important;
}


/* 地图容器响应式适配 */
@media (max-width: 1600px) {
  .map-container {
    left: calc(24% + 10px + 15px); /* 左侧面板24% + dashboard padding + grid gap */
    width: calc(52% - 30px); /* 中间区域52% - 两边的grid gap */
  }
}

@media (max-width: 1400px) {
  .map-container {
    left: calc(24% + 12px + 12px); /* 调整padding和gap */
    width: calc(52% - 24px);
  }
}

@media (max-width: 1200px) {
  .map-container {
    left: calc(24% + 10px + 10px); /* 调整padding和gap */
    width: calc(52% - 20px);
  }
}

@media (max-width: 768px) {
  .map-container {
    top: 80px; /* 向上移动，让header可以重叠到地图上 */
    left: 0; /* 移动端恢复全屏 */
    width: 100vw;
    height: calc(100vh - 120px); /* 为移动端留出更多边距 */
  }
}

@media (max-width: 480px) {
  .map-container {
    top: 80px; /* 向上移动，让header可以重叠到地图上 */
    left: 0; /* 小屏幕恢复全屏 */
    width: 100vw;
    height: calc(100vh - 100px); /* 为小屏幕留出足够边距 */
  }
}

/* 角落渐变效果基础样式 - 扩大影响范围 */
.corner-gradient {
  position: fixed;
  width: 600px; /* 从400px大幅增加到600px，扩大影响范围 */
  height: 75vh; /* 调整为视口高度的75% */
  pointer-events: none;
  z-index: 1;
}

/* 左上角渐变 - 更自然的径向过渡 */
.corner-gradient.top-left {
  top: 0;
  left: 0;
  background: radial-gradient(
    ellipse at top left,
    rgba(0, 60, 120, 0.35) 0%,   /* 降低起始强度，让过渡更自然 */
    rgba(0, 58, 116, 0.32) 8%,   /* 增加更多细腻的过渡层次 */
    rgba(0, 56, 112, 0.29) 16%,
    rgba(0, 54, 108, 0.26) 24%,
    rgba(0, 52, 104, 0.23) 32%,
    rgba(0, 50, 100, 0.20) 40%,
    rgba(0, 45, 90, 0.17) 48%,
    rgba(0, 40, 80, 0.14) 56%,
    rgba(0, 35, 70, 0.11) 64%,
    rgba(0, 30, 60, 0.08) 72%,
    rgba(0, 25, 50, 0.06) 80%,
    rgba(0, 20, 40, 0.04) 87%,
    rgba(0, 15, 30, 0.02) 93%,
    rgba(0, 10, 20, 0.01) 97%,
    transparent 100%
  );
}

/* 右上角渐变 - 更自然的径向过渡 */
.corner-gradient.top-right {
  top: 0;
  right: 0;
  background: radial-gradient(
    ellipse at top right,
    rgba(0, 60, 120, 0.35) 0%,   /* 降低起始强度，让过渡更自然 */
    rgba(0, 58, 116, 0.32) 8%,   /* 增加更多细腻的过渡层次 */
    rgba(0, 56, 112, 0.29) 16%,
    rgba(0, 54, 108, 0.26) 24%,
    rgba(0, 52, 104, 0.23) 32%,
    rgba(0, 50, 100, 0.20) 40%,
    rgba(0, 45, 90, 0.17) 48%,
    rgba(0, 40, 80, 0.14) 56%,
    rgba(0, 35, 70, 0.11) 64%,
    rgba(0, 30, 60, 0.08) 72%,
    rgba(0, 25, 50, 0.06) 80%,
    rgba(0, 20, 40, 0.04) 87%,
    rgba(0, 15, 30, 0.02) 93%,
    rgba(0, 10, 20, 0.01) 97%,
    transparent 100%
  );
}

/* 左下角渐变 - 更自然的径向过渡 */
.corner-gradient.bottom-left {
  bottom: 0;
  left: 0;
  background: radial-gradient(
    ellipse at bottom left,
    rgba(0, 55, 110, 0.28) 0%,   /* 降低起始强度，让过渡更自然 */
    rgba(0, 53, 106, 0.25) 8%,   /* 增加更多细腻的过渡层次 */
    rgba(0, 51, 102, 0.23) 16%,
    rgba(0, 49, 98, 0.21) 24%,
    rgba(0, 47, 94, 0.19) 32%,
    rgba(0, 45, 90, 0.17) 40%,
    rgba(0, 42, 84, 0.14) 48%,
    rgba(0, 38, 76, 0.12) 56%,
    rgba(0, 34, 68, 0.10) 64%,
    rgba(0, 30, 60, 0.08) 72%,
    rgba(0, 25, 50, 0.06) 80%,
    rgba(0, 20, 40, 0.04) 87%,
    rgba(0, 15, 30, 0.02) 93%,
    rgba(0, 10, 20, 0.01) 97%,
    transparent 100%
  );
}

/* 右下角渐变 - 更自然的径向过渡 */
.corner-gradient.bottom-right {
  bottom: 0;
  right: 0;
  background: radial-gradient(
    ellipse at bottom right,
    rgba(0, 55, 110, 0.28) 0%,   /* 降低起始强度，让过渡更自然 */
    rgba(0, 53, 106, 0.25) 8%,   /* 增加更多细腻的过渡层次 */
    rgba(0, 51, 102, 0.23) 16%,
    rgba(0, 49, 98, 0.21) 24%,
    rgba(0, 47, 94, 0.19) 32%,
    rgba(0, 45, 90, 0.17) 40%,
    rgba(0, 42, 84, 0.14) 48%,
    rgba(0, 38, 76, 0.12) 56%,
    rgba(0, 34, 68, 0.10) 64%,
    rgba(0, 30, 60, 0.08) 72%,
    rgba(0, 25, 50, 0.06) 80%,
    rgba(0, 20, 40, 0.04) 87%,
    rgba(0, 15, 30, 0.02) 93%,
    rgba(0, 10, 20, 0.01) 97%,
    transparent 100%
  );
}



/* 主容器三栏布局 - 全屏宽度 */
.dashboard-container {
  display: grid;
  grid-template-columns: 24% 1fr 24%; /* 调整两边宽度为24% */
  grid-template-rows: 1fr;
  height: calc(100vh - 60px); /* 调整为新的header高度 */
  gap: 10px; /* 减少间隙，为内容留更多空间 */
  padding: 5px; /* 减少外边距，为内容留更多空间 */
  max-width: 100vw;
  position: relative;
  z-index: 500; /* 提高层级，确保在地图之上，但低于header */
  box-sizing: border-box; /* 确保padding包含在总高度内 */
}

/* 添加整体氛围光效 */
.dashboard-container::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  right: -50px;
  bottom: -50px;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 80, 160, 0.02) 0%,
    rgba(0, 60, 120, 0.015) 20%,
    rgba(0, 40, 80, 0.01) 40%,
    rgba(0, 20, 40, 0.005) 60%,
    transparent 80%
  );
  pointer-events: none;
  z-index: -1;
}

/* 左右面板样式 */
.left-panel, .right-panel {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 减少卡片间隔，为内容留更多空间 */
  height: calc(100vh - 60px); /* 调整为新的header高度 */
  overflow: hidden !important; /* 强制不允许滚动 */
  padding: 5px; /* 减少内边距，为内容留更多空间 */
  margin: 0; /* 确保面板没有margin */
  background: transparent; /* 确保面板背景透明 */
  /* 添加轻微的背景模糊以增强层次感 */
  backdrop-filter: blur(1px);
  box-sizing: border-box; /* 确保padding包含在总高度内 */
  /* 强制禁用滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* 隐藏左右面板的WebKit滚动条 */
.left-panel::-webkit-scrollbar, .right-panel::-webkit-scrollbar {
  display: none;
}

/* 中央内容区域 */
.main-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 60px); /* 调整为新的header高度 */
  /* 移除背景，让整体背景透过 */
  background: transparent;
}


/* 小部件样式 */
.widget {
  background: transparent; /* 完全透明背景 */
  border: none; /* 完全移除边框 */
  border-radius: 0; /* 移除圆角 */
  padding: 20px 10px 10px 10px; /* 减少内边距 */
  box-shadow: none; /* 移除所有阴影 */
  backdrop-filter: none; /* 移除背景模糊效果 */
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex: 1 1 0; /* 默认flex分配 */
  min-height: 0; /* 移除最小高度限制，让flex完全控制 */
  margin: 0 !important; /* 强制确保没有外边距 */
  padding-top: 40px !important; /* 减少顶部内边距 */
  padding-bottom: 10px !important; /* 减少底部内边距 */
  box-sizing: border-box; /* 确保盒模型正确 */
}

/* 告警统计 - 统一高度 */
.widget-alarm {
  flex: 1 1 0; /* 统一设置为1倍高度 */
}

/* 任务统计 - 统一高度 */
.widget-task {
  flex: 1 1 0; /* 统一设置为1倍高度 */
}

/* 事件通知 - 统一高度 */
.widget-event {
  flex: 1 1 0; /* 调整为1倍高度，与其他数据框保持一致 */
}

/* 小部件顶部图片 - 增强清晰度 */
.widget::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 0;
  right: 0;
  opacity: 0.95; /* 从0.8提高到0.95，增强可见性 */
  width: 100%; /* 铺满整个宽度 */
  height: 40px; /* 缩短高度 */
  background: url('@/assets/images/main/main-containier-header.png') center/cover no-repeat;
  z-index: 3;
  /* 增强图片锐度 */
  filter: contrast(1.15) brightness(1.1) saturate(1.2);
}

/* 移除widget悬停效果 */

/* 移除特殊圆角设置，使用统一的圆角 */

.widget-title {
  color: #00d4ff;
  font-size: 18px; /* 从16px调大到18px */
  font-weight: bold;
  font-style: italic; /* 添加倾斜样式 */
  margin-bottom: 15px;
  text-align: center; /* 改回居中对齐 */
  position: absolute;
  top: 12px; /* 向上移动，让标题显示在标题栏图片内部 */
  /* 增强文字可读性 - 加强阴影效果 */
  text-shadow: 
    0 0 15px rgba(0, 212, 255, 1), 
    0 0 10px rgba(0, 0, 0, 1),
    0 2px 6px rgba(0, 0, 0, 1),
    0 0 5px rgba(0, 212, 255, 0.8);
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 1));
  left: 50%;
  transform: translateX(-50%); /* 恢复居中变换 */
  z-index: 4; /* 提高层级确保显示在图片上方 */
  width: calc(100% - 30px);
}

/* 设备统计容器 */
.device-stats-container {
  display: flex;
  flex-direction: column;
  gap: 1%; /* 进一步缩小间距 */
  padding: 0.5% 0; /* 进一步缩小内边距 */
  height: 100%;
  justify-content: space-around;
}

.device-category {
  display: flex;
  flex-direction: column;
  gap: 1.2%; /* 缩小间距 */
  padding: 1.5% 1%; /* 缩小内边距 */
  background: transparent;
  border: none;
  position: relative;
  overflow: hidden;
  transition: none;
}

.device-category:hover {
  background: transparent;
}

.device-header {
  display: flex;
  align-items: center;
  gap: 2%; /* 缩小间距 */
}

.device-icon {
  width: 10%; /* 进一步缩小图标 */
  height: auto;
  aspect-ratio: 1; /* 保持正方形比例 */
  max-width: 50px; /* 缩小最大宽度限制 */
  flex-shrink: 0;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  /* 增强图标发光效果和清晰度 */
  filter:
    drop-shadow(0 0 12px rgba(0, 255, 255, 0.6))
    drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))
    contrast(1.2)
    brightness(1.15)
    saturate(1.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  top: 28px; /* 增加到28像素，继续向下移动图标 */
  /* 增加图标的可见度 */
  opacity: 0.95;
}

.camera-icon {
  background-image: url('@/assets/images/main/main-container-camera.png');
}

.algorithm-icon {
  background-image: url('@/assets/images/main/main-container-algorithm.png');
}

.device-info-box {
  flex: 1;
  background-image: url('@/assets/images/main/main-container-box.png');
  background-size: 120% 70%; /* 宽度拉长到120%，高度压缩到70% */
  background-repeat: no-repeat;
  background-position: center;
  padding: 1.5% 4%; /* 调整为相对内边距 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 4vh; /* 调整为相对高度 */
  position: relative;
  opacity: 0.92; /* 从0.8提高到0.92，增强背景图片可见性 */
  /* 增强背景图片的锐度和对比度 */
  filter: contrast(1.1) brightness(1.08);
}

.device-type {
  font-size: 16px;
  font-weight: bold;
  color: #00d4ff;
  text-shadow: 
    0 0 15px rgba(0, 212, 255, 1),
    0 0 12px rgba(0, 0, 0, 1),
    0 3px 6px rgba(0, 0, 0, 1),
    0 0 8px rgba(0, 212, 255, 0.8);
}

.device-total {
  flex-shrink: 0;
}

.total-number {
  font-size: 1.4em; /* 调整为相对字体大小，稍微缩小 */
  font-weight: bold;
  color: #ffffff;
  text-shadow: 
    0 0 18px rgba(255, 255, 255, 1),
    0 0 12px rgba(0, 0, 0, 1),
    0 4px 8px rgba(0, 0, 0, 1),
    0 0 10px rgba(255, 255, 255, 0.9);
}

.unit-text {
  font-size: 1.1em; /* 调整为相对字体大小，稍微缩小 */
  font-weight: normal;
  color: #ffffff;
  text-shadow: 
    0 0 12px rgba(255, 255, 255, 0.8),
    0 0 8px rgba(0, 0, 0, 1),
    0 2px 4px rgba(0, 0, 0, 0.9);
  margin-left: 2px;
}

.unit-text-small {
  font-size: 0.85em; /* 调整为相对字体大小，稍微缩小 */
  font-weight: normal;
  color: inherit;
  text-shadow: 0 0 6px currentColor;
  margin-left: 1px;
}

.device-details {
  display: flex;
  justify-content: space-around;
  gap: 2.5%; /* 缩小间距 */
  padding-left: 14%; /* 调整为相对内边距 */
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6%; /* 调整为相对间距 */
  font-size: 0.85em; /* 调整为相对字体大小，稍微缩小 */
  text-align: center;
}

.detail-number {
  font-size: 20px;
  font-weight: bold;
  text-shadow: 
    0 0 12px currentColor,
    0 0 8px rgba(0, 0, 0, 1),
    0 2px 4px rgba(0, 0, 0, 0.9);
  line-height: 1;
}

.detail-label {
  color: #88ccff;
  font-weight: 500;
  font-size: 14px;
  line-height: 1;
  text-shadow: 
    0 0 8px rgba(136, 204, 255, 0.8),
    0 0 6px rgba(0, 0, 0, 1),
    0 1px 3px rgba(0, 0, 0, 0.9);
}


/* 统计网格 - 保留用于其他组件 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 10px;
  margin-top: 10px;
  position: relative;
  z-index: 2;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: transparent; /* 透明背景 */
  border-radius: 0; /* 移除圆角 */
  border: none; /* 完全移除边框 */
  box-shadow: none; /* 移除发光效果 */
  transition: none; /* 移除过渡效果 */
}

/* 移除stat-item悬停效果 */

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.stat-label {
  font-size: 12px;
  color: #88ccff;
  margin-top: 5px;
}

/* 任务统计容器 */
.task-stats-container {
  position: relative;
  width: calc(100% - 20px); /* 调整宽度，适应更紧凑的布局 */
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0; /* 减少内边距 */
  margin: 0 10px; /* 减少margin */
}


/* 中心圆圈 */
.center-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px; /* 从120px增加到160px */
  height: 25vh; /* 调整为视口高度的25% */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5; /* 最高层级，确保中心圆圈在最上方 */
}

.circle-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('@/assets/images/main/main-container-circle2.png') center/contain no-repeat;
  opacity: 0.95; /* 从0.9提高到0.95 */
  z-index: 1;
  /* 增强圆圈图片的清晰度和发光效果 */
  filter:
    contrast(1.15)
    brightness(1.1)
    saturate(1.2)
    drop-shadow(0 0 8px rgba(0, 255, 255, 0.4))
    drop-shadow(0 0 4px rgba(255, 255, 255, 0.2));
}

.circle-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #ffffff;
}

.center-number {
  font-size: 36px; /* 从40px缩小到36px */
  font-weight: bold;
  color: #00d4ff;
  text-shadow: 
    0 0 25px rgba(0, 212, 255, 1),
    0 0 18px rgba(0, 0, 0, 1),
    0 4px 10px rgba(0, 0, 0, 1),
    0 0 15px rgba(0, 212, 255, 0.9),
    0 0 8px rgba(255, 255, 255, 0.3);
  line-height: 1;
  margin-bottom: 6px;
}

.center-label {
  font-size: 14px; /* 缩小一个字号，从16px调整到14px */
  color: #88ccff;
  font-weight: 500;
  text-shadow: 
    0 0 15px rgba(136, 204, 255, 1),
    0 0 10px rgba(0, 0, 0, 1),
    0 2px 6px rgba(0, 0, 0, 1),
    0 0 8px rgba(136, 204, 255, 0.8);
}

/* 四角数据显示 - 增强图片清晰度 */
.corner-data {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 4; /* 提高层级，显示在连接线之上 */
  width: 140px; /* 从110px增加到140px，增大约27% */
  height: 5.5vh; /* 调整为视口高度的5.5% */
  background: url('@/assets/images/main/main-container-box1.png') center/100% 100% no-repeat;
  opacity: 0.97; /* 从0.95进一步提高到0.97 */
  padding: 8px 12px; /* 添加内边距让文字位置更好 */
  box-sizing: border-box;
  /* 增强背景图片的清晰度和发光效果 */
  filter:
    contrast(1.12)
    brightness(1.08)
    saturate(1.15)
    drop-shadow(0 0 6px rgba(0, 200, 255, 0.3))
    drop-shadow(0 0 3px rgba(255, 255, 255, 0.15));
}

.top-left {
  top: 15px;
  left: -25px; /* 从-20px继续向左移动到-25px */
}

.top-right {
  top: 15px;
  right: -25px; /* 从-20px继续向右移动到-25px */
}

.bottom-left {
  bottom: 15px;
  left: -25px; /* 从-20px继续向左移动到-25px */
}

.bottom-right {
  bottom: 15px;
  right: -25px; /* 从-20px继续向右移动到-25px */
}

.data-number {
  font-size: 13px; /* 从11px增加到13px，适应更大的框体 */
  font-weight: bold;
  color: #ffffff;
  text-shadow: 
    0 0 12px rgba(255, 255, 255, 1),
    0 0 8px rgba(0, 0, 0, 1),
    0 2px 4px rgba(0, 0, 0, 1),
    0 0 6px rgba(255, 255, 255, 0.8);
  line-height: 1.1;
  margin-bottom: 3px; /* 从2px增加到3px */
  max-width: 116px; /* 从86px增加到116px，适应新的框宽度 */
  word-break: break-all; /* 允许数字换行 */
  position: relative;
  z-index: 3; /* 确保文字显示在背景图片上方 */
}

.data-label {
  font-size: 12px; /* 从10px增加到12px，适应更大的框体 */
  color: #88ccff;
  font-weight: 400;
  text-shadow: 
    0 0 10px rgba(136, 204, 255, 1),
    0 0 6px rgba(0, 0, 0, 1),
    0 1px 3px rgba(0, 0, 0, 0.9);
  position: relative;
  z-index: 3; /* 确保文字显示在背景图片上方 */
}

/* 移除旧的单个统计项样式 - 保留作为备用 */
.single-stat {
  display: none; /* 隐藏旧样式 */
}

/* 保留旧的任务算法描述样式作为备用 */
.task-algorithm {
  font-size: 11px;
  color: #88ccff;
  margin-top: 5px;
}

/* 保留旧的进度条样式作为备用 */
.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(0, 150, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #00ff88);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 状态颜色 */
.status-online {
  color: #00ff88;
}

.status-offline {
  color: #ff4444;
}

/* 列表项样式 - 增强背景图片清晰度 */
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px 8px 20px; /* 左边增加一些内边距 */
  margin-bottom: 12px;
  background-image: url('~@/assets/images/main/main-container-box3.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 4px;
  min-height: 45px; /* 适合2-3行文字的高度 */
  max-height: 60px;
  border: none;
  box-shadow: none;
  transition: none;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  z-index: 2;
  opacity: 0.94; /* 从0.9提高到0.94，增强背景图片可见性 */
  /* 增强背景图片的清晰度和对比度 */
  filter: contrast(1.08) brightness(1.05) saturate(1.1);
}

/* 事件列表、排行榜列表容器 */
.event-list, .ranking-list {
  margin-top: 10px;
}

/* 移除list-item悬停效果 */

/* 告警统计专用样式 */
.alarm-stats-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  padding: 3.5% 0 0.5% 0; /* 增加顶部内边距从0.5%到8%，将内容整体向下移动 */
}

.main-alarm-display {
  text-align: center;
  margin-bottom: 2%; /* 减少底部间距，使饼状图向上移动 */
}

.alarm-label {
  color: #88ccff;
  font-size: 15px; /* 从14px增加到18px */
  margin-bottom: 2.5%; /* 调整为相对间距 */
  text-shadow: 
    0 0 12px rgba(136, 204, 255, 1),
    0 0 8px rgba(0, 0, 0, 1),
    0 2px 4px rgba(0, 0, 0, 0.9);
  font-weight: 500;
}

.alarm-counter {
  display: flex;
  justify-content: center;
  gap: 0.5%; /* 调整为相对间距 */
  margin-bottom: 1.5%; /* 调整为相对间距 */
}

.counter-digit {
  display: inline-block;
  width: 8%; /* 缩小数字框宽度 */
  height: 3.5vh; /* 缩小数字框高度 */
  line-height: 3.5vh;
  background: linear-gradient(135deg, 
    rgba(0, 150, 255, 0.3) 0%,
    rgba(0, 100, 200, 0.25) 50%,
    rgba(0, 80, 160, 0.2) 100%
  );
  border: 1px solid rgba(0, 200, 255, 0.4);
  border-radius: 6px;
  color: #ffffff;
  font-size: 18px; /* 缩小数字字体以匹配缩小的框 */
  font-weight: bold;
  text-align: center;
  box-shadow: 
    0 0 12px rgba(0, 150, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-shadow: 
    0 0 15px rgba(255, 255, 255, 1),
    0 0 10px rgba(0, 0, 0, 1),
    0 2px 4px rgba(0, 0, 0, 1),
    0 0 8px rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}


/* 数字框悬停效果 */
.counter-digit:hover {
  background: linear-gradient(135deg, 
    rgba(0, 150, 255, 0.4) 0%,
    rgba(0, 100, 200, 0.35) 50%,
    rgba(0, 80, 160, 0.3) 100%
  );
  box-shadow: 
    0 0 18px rgba(0, 150, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.alarm-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alarm-stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-dot.processed {
  background: #ffaa00;
  box-shadow: 0 0 8px rgba(255, 170, 0, 0.5);
}

.stat-dot.unprocessed {
  background: #00aaff;
  box-shadow: 0 0 8px rgba(0, 170, 255, 0.5);
}

.stat-text {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

/* 环形图样式 */
.alarm-chart-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 7%; /* 适度放大图表间距 */
  height: 100%;
  padding: 1% 0 3% 0; /* 减少顶部内边距，增加底部内边距，整体向上移动 */
}

.chart-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  width: 100%;
  max-width: 135px; /* 适度放大最大宽度 */
}

.chart-decoration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 75%; /* 适度放大装饰图片宽度 */
  height: auto; /* 自动高度保持比例 */
  aspect-ratio: 1; /* 保持正方形比例 */
  background: url('@/assets/images/main/main-container-circle.png') center/contain no-repeat;
  opacity: 0.92; /* 从0.8提高到0.92，增强可见性 */
  z-index: 1;
  pointer-events: none;
  /* 增强装饰圆圈的清晰度和发光效果 */
  filter:
    contrast(1.12)
    brightness(1.08)
    saturate(1.15)
    drop-shadow(0 0 8px rgba(0, 200, 255, 0.4))
    drop-shadow(0 0 4px rgba(255, 255, 255, 0.2));
}

.alarm-ring-chart {
  filter: drop-shadow(0 0 8px rgba(0, 150, 255, 0.3));
  position: relative;
  z-index: 2;
}

.processed-arc {
  stroke: #00aaff;
  filter: drop-shadow(0 0 6px rgba(0, 170, 255, 0.6));
  animation: drawProcessedArc 2s ease-in-out;
}

.unprocessed-arc {
  stroke: #ffaa00;
  filter: drop-shadow(0 0 6px rgba(255, 170, 0, 0.6));
  animation: drawUnprocessedArc 2s ease-in-out 0.3s both;
}

@keyframes drawProcessedArc {
  from {
    stroke-dasharray: 0 300;
  }
}

@keyframes drawUnprocessedArc {
  from {
    stroke-dasharray: 0 300;
  }
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 2.2%; /* 适度放大图例间距 */
  justify-content: center;
  min-width: 28%; /* 适度放大图例容器宽度 */
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 2%; /* 调整为相对间距 */
  padding: 1% 0; /* 调整为相对内边距 */
}

.legend-dot {
  width: 0.8em; /* 调整为相对尺寸 */
  height: 0.8em; /* 调整为相对尺寸 */
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.processed {
  background: #00aaff;
  box-shadow: 0 0 6px rgba(0, 170, 255, 0.5);
}

.legend-dot.unprocessed {
  background: #ffaa00;
  box-shadow: 0 0 6px rgba(255, 170, 0, 0.5);
}

.legend-text {
  color: #ffffff;
  font-size: 0.95em; /* 适度放大文字大小 */
  font-weight: 500;
  text-shadow: 
    0 0 10px rgba(255, 255, 255, 1),
    0 0 6px rgba(0, 0, 0, 1),
    0 2px 4px rgba(0, 0, 0, 0.9);
}

/* 事件内容 */
.event-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.event-type {
  font-size: 14px;
  color: #ff6666;
  text-shadow: 
    0 0 8px rgba(255, 102, 102, 1),
    0 0 6px rgba(0, 0, 0, 1),
    0 2px 4px rgba(0, 0, 0, 1),
    0 0 4px rgba(255, 102, 102, 0.8);
  font-weight: 500;
  position: relative;
  z-index: 3;
  margin-bottom: 2px;
}

.event-device {
  font-size: 12px;
  color: #ffffff;
  text-shadow: 
    0 0 10px rgba(255, 255, 255, 1),
    0 0 6px rgba(0, 0, 0, 1),
    0 2px 4px rgba(0, 0, 0, 1);
  font-weight: 500;
  position: relative;
  z-index: 3;
}

.event-time {
  font-size: 14px;
  color: #88ccff;
  text-shadow: 
    0 0 8px rgba(136, 204, 255, 1),
    0 0 6px rgba(0, 0, 0, 1),
    0 2px 4px rgba(0, 0, 0, 1);
  font-weight: 500;
  position: relative;
  z-index: 3;
  margin-right: 8px; /* 向左移动8像素 */
  display: flex;
  align-items: center;
}

/* 设备状态 */
.device-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: statusBlink 2s infinite;
}

.dot-online {
  background: #00ff88;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.dot-offline {
  background: #ff4444;
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
}

@keyframes statusBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 新的排行榜图表样式 */
.ranking-chart-container {
  position: relative;
  height: 100%;
  padding: 0; /* 移除内边距，使用精确定位 */
  display: flex;
  flex-direction: column;
}

.ranking-chart {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.ranking-bar-background {
  opacity: 0;
  animation: slideInBarBackground 1s ease-out forwards;
}

.ranking-bar {
  opacity: 0;
  animation: slideInBar 1s ease-out forwards;
  filter: drop-shadow(0 0 3px currentColor);
}

@keyframes slideInBarBackground {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInBar {
  from {
    opacity: 0;
    transform: scaleX(0);
    transform-origin: left;
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

.ranking-labels {
  position: relative;
  z-index: 2;
  height: 100%;
  /* 移除flex布局，改用绝对定位精确控制 */
}

.ranking-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  width: 100%;
  height: 6%; /* 直接匹配条形图的高度 */
  padding: 0 1%;
  opacity: 0;
  animation: slideInText 0.8s ease-out forwards;
  /* 使用绝对定位精确控制位置，确保与SVG条形图对齐 */
}

/* 为每个排行项目设置精确的位置，与SVG条形柱对齐 */
/* SVG条形图Y坐标: 10, 28, 46, 64, 82 (起始10，间隔18) */
/* 微调位置以实现完美对齐 */
.ranking-item:nth-child(1) { top: 9%; } /* 稍微上移 */
.ranking-item:nth-child(2) { top: 27%; } /* 稍微上移 */
.ranking-item:nth-child(3) { top: 45%; } /* 稍微上移 */
.ranking-item:nth-child(4) { top: 63%; } /* 稍微上移 */
.ranking-item:nth-child(5) { top: 81%; } /* 稍微上移 */

@keyframes slideInText {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.rank-badge {
  font-size: 0.75vw; /* 12px 转换为相对单位 */
  font-weight: bold;
  padding: 0.25vw 0.375vw; /* 4px 6px 转换为相对单位 */
  border-radius: 0.375vw; /* 6px 转换为相对单位 */
  text-align: center;
  min-width: 2.625vw; /* 42px 转换为相对单位 */
  width: 2.625vw;
  text-shadow: 0 0 0.375vw currentColor; /* 6px 转换为相对单位 */
  border: none;
  box-shadow: 0 0 0.5vw currentColor; /* 8px 转换为相对单位 */
  flex-shrink: 0;
  /* 确保垂直居中对齐 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-1 {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: #ffffff;
  border-color: #ff6b35;
}

.rank-2 {
  background: linear-gradient(135deg, #ffa500, #ffb84d);
  color: #ffffff;
  border-color: #ffa500;
}

.rank-3 {
  background: linear-gradient(135deg, #00bfff, #42d4ff);
  color: #ffffff;
  border-color: #00bfff;
}

.rank-4 {
  background: linear-gradient(135deg, #1e90ff, #4da6ff);
  color: #ffffff;
  border-color: #1e90ff;
}

.rank-5 {
  background: linear-gradient(135deg, #4682b4, #6ba3d0);
  color: #ffffff;
  border-color: #4682b4;
}

.device-name {
  flex: 1;
  margin-left: 0.5vw; /* 8px 转换为相对单位 */
  font-size: 0.875vw; /* 14px 转换为相对单位 */
  color: #ffffff;
  font-weight: 500;
  text-shadow:
    0 0 0.5vw rgba(255, 255, 255, 0.8), /* 8px 转换为相对单位 */
    0 0 0.375vw rgba(0, 0, 0, 1), /* 6px 转换为相对单位 */
    0 0.0625vw 0.1875vw rgba(0, 0, 0, 0.9); /* 1px 3px 转换为相对单位 */
  text-align: left;
  /* 确保文字垂直居中 */
  display: flex;
  align-items: center;
}

.count-value {
  font-size: 1vw; /* 16px 转换为相对单位 */
  font-weight: bold;
  color: #00ff88;
  text-shadow:
    0 0 0.75vw rgba(0, 255, 136, 0.8), /* 12px 转换为相对单位 */
    0 0 0.5vw rgba(0, 0, 0, 1), /* 8px 转换为相对单位 */
    0 0.125vw 0.25vw rgba(0, 0, 0, 0.9); /* 2px 4px 转换为相对单位 */
  min-width: 1.875vw; /* 30px 转换为相对单位 */
  width: 1.875vw;
  text-align: right;
  flex-shrink: 0;
  /* 确保数值垂直居中 */
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* 排行榜计数 - 保留旧样式作为备用 */
.ranking-count {
  font-size: 16px;
  font-weight: bold;
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

/* SVG图表容器 */
.svg-chart-container {
  height: 24vh; /* 调整高度适应紧凑布局 */
  margin-top: 0.5%; /* 减少顶部边距 */
  position: relative;
  z-index: 2;
  padding: 0.5% 2%; /* 减少内边距 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.trend-chart {
  width: 95%; /* 调整为95%宽度 */
  height: 95%; /* 调整高度 */
  background: transparent;
}

.trend-line {
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0;
  animation: drawLine 2s ease-in-out forwards;
}

@keyframes drawLine {
  from {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    opacity: 1;
  }
  to {
    stroke-dasharray: 1000;
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

.data-point {
  opacity: 0;
  animation: showPoint 0.5s ease-in-out forwards;
  cursor: pointer;
  transition: all 0.3s ease;
}

.data-point:hover {
  r: 5;
  filter: drop-shadow(0 0 10px #00d4ff);
}

@keyframes showPoint {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.grid-lines {
  opacity: 0;
  animation: fadeInGrid 1s ease-in-out 0.5s forwards;
}

@keyframes fadeInGrid {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 保留旧的图表容器样式作为备用 */
.chart-container {
  height: 22vh; /* 调整为视口高度的22% */
  margin-top: 15px;
  position: relative;
  z-index: 2;
}

/* 告警弹窗 */
.alert-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 68, 68, 0.95);
  border: 2px solid #ff4444;
  border-radius: 10px;
  padding: 25px;
  min-width: 350px;
  box-shadow: 0 0 30px rgba(255, 68, 68, 0.5);
  animation: alertPulse 2s infinite;
  cursor: pointer;
  z-index: 10000 !important;
  pointer-events: auto !important;
  /* 确保弹窗不被其他元素遮挡 */
  isolation: isolate;
}

@keyframes alertPulse {
  0%, 100% { 
    box-shadow: 0 0 30px rgba(255, 68, 68, 0.5);
    transform: translate(-50%, -50%) scale(1);
  }
  50% { 
    box-shadow: 0 0 50px rgba(255, 68, 68, 0.8);
    transform: translate(-50%, -50%) scale(1.02);
  }
}

.alert-content h3 {
  margin-bottom: 15px;
  font-size: 18px;
  color: white;
}

.alert-content p {
  margin-bottom: 8px;
  font-size: 14px;
  color: white;
}

.alert-tip {
  margin-top: 10px;
  font-size: 12px;
  opacity: 0.8;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer !important;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
  z-index: 10001 !important;
  pointer-events: auto !important;
  /* 确保按钮始终可点击 */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 150, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 150, 255, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 150, 255, 0.7);
}

/* 响应式设计 */
/* 针对1080p分辨率的专门优化 */
@media (max-height: 1080px) and (min-height: 1000px) {
  .dashboard-container {
    height: calc(100vh - 80px); /* 为1080p增加更多高度余量 */
    gap: 8px; /* 进一步减少间隙 */
    padding: 3px; /* 进一步减少内边距 */
  }
  
  .left-panel, .right-panel {
    height: calc(100vh - 80px); /* 与容器保持一致 */
    gap: 8px; /* 减少卡片间隔 */
    padding: 3px; /* 减少内边距 */
  }
  
  .widget {
    padding-top: 35px !important; /* 减少顶部内边距 */
    padding-bottom: 8px !important; /* 减少底部内边距 */
  }
  
  .main-content {
    height: calc(100vh - 80px); /* 与其他组件保持一致 */
  }
  
  /* 优化特定组件的高度 */
  .svg-chart-container {
    height: 20vh; /* 在1080p下进一步减少图表高度 */
    margin-top: 0; /* 移除顶部边距 */
    padding: 0.2% 1%; /* 进一步减少内边距 */
  }
  
  .alarm-chart-container {
    padding: 0.5% 0 1% 0; /* 减少内边距 */
  }
  
  .device-stats-container {
    gap: 0.5%; /* 进一步减少间距 */
    padding: 0.2% 0; /* 进一步减少内边距 */
  }
}

@media (max-width: 1600px) {
  .dashboard-container {
    grid-template-columns: 24% 1fr 24%; /* 保持24%宽度 */
    gap: 10px;
    padding: 5px;
  }
}

@media (max-width: 1400px) {
  .dashboard-container {
    grid-template-columns: 24% 1fr 24%; /* 保持24%宽度 */
    gap: 12px;
    padding: 12px;
  }
}

/* 大屏幕优化 (1920px+) */
@media (min-width: 1920px) {
  .rank-badge {
    font-size: 0.6vw; /* 超大屏幕适当缩小字体 */
    padding: 0.2vw 0.3vw;
    min-width: 2vw;
    width: 2vw;
  }

  .device-name {
    font-size: 0.7vw;
    margin-left: 0.4vw;
  }

  .count-value {
    font-size: 0.8vw;
    min-width: 1.5vw;
    width: 1.5vw;
  }

  /* 超大屏幕下精确位置调整 */
  .ranking-item:nth-child(1) { top: 9%; }
  .ranking-item:nth-child(2) { top: 27%; }
  .ranking-item:nth-child(3) { top: 45%; }
  .ranking-item:nth-child(4) { top: 63%; }
  .ranking-item:nth-child(5) { top: 81%; }
}

@media (max-width: 1200px) {
  .dashboard-container {
    grid-template-columns: 24% 1fr 24%; /* 保持24%宽度 */
    gap: 10px;
    padding: 10px;
  }

  /* 中等屏幕高频告警排行响应式优化 */
  .rank-badge {
    font-size: 0.9vw; /* 适中屏幕适当缩小字体 */
    padding: 0.24vw 0.4vw;
    min-width: 3vw;
    width: 3vw;
  }

  .device-name {
    font-size: 1vw;
    margin-left: 0.55vw;
  }

  .count-value {
    font-size: 1.2vw;
    min-width: 2.2vw;
    width: 2.2vw;
  }

  /* 中等屏幕下微调位置 */
  .ranking-item:nth-child(1) { top: 9%; }
  .ranking-item:nth-child(2) { top: 27%; }
  .ranking-item:nth-child(3) { top: 45%; }
  .ranking-item:nth-child(4) { top: 63%; }
  .ranking-item:nth-child(5) { top: 81%; }
}

@media (max-width: 768px) {
  .dashboard-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    height: auto;
  }

  .left-panel, .right-panel {
    max-height: none;
  }

  .main-content {
    height: 50vh; /* 调整为视口高度的50% */
  }

  /* 移动端高频告警排行响应式优化 */
  .rank-badge {
    font-size: 2.5vw; /* 移动端使用较大的vw值以保证可读性 */
    padding: 0.5vw 1vw;
    min-width: 8vw;
    width: 8vw;
  }

  .device-name {
    font-size: 3vw;
    margin-left: 1.5vw;
  }

  .count-value {
    font-size: 3.5vw;
    min-width: 6vw;
    width: 6vw;
  }

  /* 移动端下微调位置，考虑到触摸操作需要更大间距 */
  .ranking-item {
    height: 8%; /* 移动端适当增加高度 */
  }

  .ranking-item:nth-child(1) { top: 7%; }
  .ranking-item:nth-child(2) { top: 25%; }
  .ranking-item:nth-child(3) { top: 43%; }
  .ranking-item:nth-child(4) { top: 61%; }
  .ranking-item:nth-child(5) { top: 79%; }
}

/* 地图上的摄像头图标样式 - 随地图一起移动 */
.map-cameras {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10; /* 在地图之上 */
}

.map-camera-icon {
  position: absolute;
  width: 50px; /* 增大图标尺寸，提高可见性 */
  height: 50px; /* 增大图标尺寸，提高可见性 */
  background-image: url('@/assets/images/main/main-camera.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
  pointer-events: auto !important; /* 强制启用点击事件 */
  z-index: 1000; /* 提高层级，确保在地图之上 */
  /* 增强图标的可见性和交互反馈 */
  filter:
    drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))
    drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))
    contrast(1.3)
    brightness(1.2)
    saturate(1.4);
  transition: all 0.3s ease;
  /* 确保图标始终可见 */
  opacity: 0.95;
}

.map-camera-icon.camera-1 {
  top: 50%; /* 地图中的相对位置 */
  left: 45%; /* 地图中的相对位置 */
}

.map-camera-icon.camera-2 {
  top: 50%; /* 地图中的相对位置 */
  left: 55%; /* 地图中的相对位置 */
}

/* 摄像头标签样式 */
.camera-label {
  position: absolute;
  top: -30px; /* 显示在摄像头图标上方 */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 212, 255, 0.9);
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1001;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  /* 添加轻微的动画效果 */
  animation: labelFloat 2s ease-in-out infinite;
}


/* 自定义弹窗样式 */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.custom-modal {
  width: 800px;
  max-width: 90vw;
  max-height: 90vh;
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 50%, #0d1b2a 100%);
  border: 2px solid rgba(0, 212, 255, 0.6);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.custom-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 15px 20px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 50%, #0d1b2a 100%);
}

.custom-modal-title {
  color: #00d4ff;
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  text-shadow: 
    0 0 15px rgba(0, 212, 255, 0.8),
    0 0 10px rgba(0, 0, 0, 0.8);
}

.custom-modal-close {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.custom-modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #00d4ff;
  transform: scale(1.1);
}

.custom-modal-body {
  padding: 20px;
  background: linear-gradient(135deg, #0a1929 0%, #1a2332 50%, #0d1b2a 100%);
}

/* 视频显示区域 */
.video-display-area {
  width: 100%;
  height: 50vh; /* 调整为视口高度的50% */
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
}

.full-video-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

/* 信息显示区域 */
.info-display-area {
  padding: 0 10px;
}

.camera-details p {
  margin: 12px 0;
  font-size: 14px;
  line-height: 1.5;
  color: white;
  text-shadow: 
    0 0 8px rgba(255, 255, 255, 0.6),
    0 0 4px rgba(0, 0, 0, 0.8);
}

.camera-details strong {
  color: #88ccff;
  text-shadow: 
    0 0 10px rgba(136, 204, 255, 0.8),
    0 0 6px rgba(0, 0, 0, 0.8);
}

/* 自定义状态标签 */
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-shadow: none;
}

.status-tag.status-online {
  background: rgba(0, 255, 136, 0.2);
  border: 1px solid #00ff88;
  color: #00ff88;
}

.status-tag.status-offline {
  background: rgba(255, 68, 68, 0.2);
  border: 1px solid #ff4444;
  color: #ff4444;
}

/* 摄像头悬停提示框样式 */
.camera-tooltip {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  width: 380px;
  height: 31vh; /* 调整为视口高度的31% */
}

.tooltip-background {
  width: 100%;
  height: 100%;
  background-image: url('@/assets/images/main/main-camera-box.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(0, 212, 255, 0.3);
}

.tooltip-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
}

.tooltip-header {
  font-size: 18px;
  font-weight: bold;
  color: #ff6666;
  text-align: center;
  margin-bottom: 15px;
  text-shadow: 
    0 0 10px rgba(255, 102, 102, 1),
    0 0 8px rgba(0, 0, 0, 1),
    0 2px 4px rgba(0, 0, 0, 1);
}

.tooltip-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 12px 0;
}

.tooltip-image img {
  max-width: 100%;
  max-height: 120px;
  border-radius: 6px;
  border: 2px solid rgba(0, 212, 255, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.tooltip-info {
  margin-top: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-label {
  color: #88ccff;
  font-weight: 500;
  text-shadow: 
    0 0 6px rgba(136, 204, 255, 0.8),
    0 0 4px rgba(0, 0, 0, 1);
}

.info-value {
  color: #ffffff;
  font-weight: 500;
  text-shadow: 
    0 0 8px rgba(255, 255, 255, 0.8),
    0 0 4px rgba(0, 0, 0, 1);
  max-width: 200px;
  text-align: right;
  word-break: break-all;
}

/* 地图摄像头图标悬停效果增强 */
.map-camera-icon:hover {
  transform: scale(1.3); /* 增大悬停缩放效果 */
  filter:
    drop-shadow(0 0 15px rgba(0, 212, 255, 1.0))
    drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))
    contrast(1.4)
    brightness(1.3)
    saturate(1.5);
  /* 增加边框高亮效果 */
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.8);
  border-radius: 50%;
}

/* 为摄像头添加脉冲动画，增强可见性 */
.map-camera-icon::after {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: cameraPulse 3s ease-in-out infinite;
  z-index: -1;
  pointer-events: none;
}

@keyframes cameraPulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.9);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

@keyframes labelFloat {
  0%, 100% {
    transform: translateX(-50%) translateY(0px);
  }
  50% {
    transform: translateX(-50%) translateY(-3px);
  }
}

/* 实时视频相关样式 */
.live-video-modal {
  width: 1200px !important;
  max-width: 95vw !important;
  height: 80vh; /* 调整为视口高度的80% */
  max-height: 90vh;
}

.live-video-modal .custom-modal-body {
  display: flex;
  height: calc(100% - 80px);
}

.video-display-area {
  flex: 2;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  margin-right: 20px;
}

.video-player-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.live-video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.video-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  text-align: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 212, 255, 0.3);
  border-top: 4px solid #00d4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.video-offline {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  text-align: center;
  z-index: 10;
}

.offline-icon {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.6;
}

.offline-tip {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}

.info-display-area {
  flex: 1;
  padding: 0 20px;
}

.camera-details {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.detail-row:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.detail-label {
  color: #00d4ff;
  font-weight: bold;
  min-width: 80px;
}

.detail-value {
  color: #fff;
  text-align: right;
  flex: 1;
  margin-left: 10px;
}

.stream-url {
  font-family: monospace;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 4px;
  word-break: break-all;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(45deg, #ff4444, #ff6666);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  margin-left: 10px;
  animation: pulse 2s infinite;
}

.live-dot-small {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  margin-right: 4px;
  animation: blink 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

/* 悬停预览样式增强 */
.live-snapshot {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.live-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(45deg, #ff4444, #ff6666);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  animation: pulse 2s infinite;
}

.live-dot {
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
  margin-right: 3px;
  animation: blink 1s infinite;
}

.status-online {
  color: #00ff88 !important;
  font-weight: bold;
}

.status-offline {
  color: #ff4444 !important;
  font-weight: bold;
}

/* 新的告警弹窗样式 - 使用 teleport 到 body */
.alert-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  z-index: 99999 !important;
  pointer-events: auto !important;
  /* 使用更强制的居中方法 */
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}

.alert-popup-container {
  /* 使用绝对定位的居中方案作为备用 */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 68, 68, 0.95);
  border: 2px solid #ff4444;
  border-radius: 10px;
  padding: 25px;
  min-width: 350px;
  max-width: 90vw;
  box-shadow: 0 0 30px rgba(255, 68, 68, 0.5);
  cursor: pointer;
  pointer-events: auto !important;
  /* 确保居中不被动画影响 */
  margin: 0;
  animation: alertPulseNew 2s infinite;
}

/* 新的动画，保持居中定位 */
@keyframes alertPulseNew {
  0%, 100% { 
    box-shadow: 0 0 30px rgba(255, 68, 68, 0.5);
    transform: translate(-50%, -50%) scale(1);
  }
  50% { 
    box-shadow: 0 0 50px rgba(255, 68, 68, 0.8);
    transform: translate(-50%, -50%) scale(1.02);
  }
}

.alert-close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer !important;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
  z-index: 100000 !important;
  pointer-events: auto !important;
  user-select: none;
}

.alert-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.alert-popup-content {
  color: white;
  /* 移除 pointer-events: none，使内容区域可以点击 */
}

.alert-popup-content h3 {
  margin-bottom: 15px;
  font-size: 18px;
  color: white;
}

.alert-popup-content p {
  margin-bottom: 8px;
  font-size: 14px;
  color: white;
}

.alert-popup-content .alert-tip {
  margin-top: 10px;
  font-size: 12px;
  opacity: 0.8;
}

/* 流地址输入区域样式 */
.stream-input-area {
  padding: 15px 20px;
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 8px;
  margin-bottom: 15px;
}

.input-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
}

.input-row:last-child {
  margin-bottom: 0;
}

.input-label {
  color: #00d4ff;
  font-weight: bold;
  min-width: 80px;
  font-size: 14px;
}

.stream-input {
  flex: 1;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.stream-input:focus {
  border-color: #00d4ff;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.stream-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.protocol-select {
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.protocol-select:hover {
  border-color: #00d4ff;
}

.play-btn,
.stop-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.play-btn {
  background: linear-gradient(135deg, #00d4ff, #00b8e6);
  color: #fff;
}

.play-btn:hover {
  background: linear-gradient(135deg, #00b8e6, #0096c7);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
}

.stop-btn {
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
  color: #fff;
}

.stop-btn:hover {
  background: linear-gradient(135deg, #ff5252, #ff3838);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.quick-links {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid rgba(0, 212, 255, 0.1);
  margin-top: 8px;
}

.quick-label {
  color: #88ccff;
  font-size: 13px;
}

.quick-btn {
  padding: 5px 12px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  color: #00d4ff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-btn:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
  transform: translateY(-1px);
}

/* 无流提示样式 */
.no-stream-hint {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  text-align: center;
  padding: 40px;
}

.hint-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.hint-text {
  font-size: 18px;
  color: #00d4ff;
  margin-bottom: 20px;
  font-weight: bold;
}

.hint-example {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px 20px;
  border-radius: 8px;
  border: 1px solid rgba(0, 212, 255, 0.2);
  text-align: left;
}

.hint-example p {
  margin: 5px 0;
  font-size: 13px;
  color: #88ccff;
  font-family: monospace;
}

.hint-example p:first-child {
  color: #00d4ff;
  font-weight: bold;
  margin-bottom: 10px;
  font-family: inherit;
}

/* 提示信息区域样式 */
.stream-tips {
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 8px;
  padding: 15px 20px;
}

.tip-title {
  font-size: 16px;
  color: #00d4ff;
  font-weight: bold;
  margin-bottom: 12px;
}

.tip-item {
  margin-bottom: 8px;
  font-size: 13px;
  color: #ffffff;
  line-height: 1.6;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-item strong {
  color: #00d4ff;
}

/* 流列表样式 */
.streams-list {
  margin-top: 15px;
  padding: 12px;
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.streams-title {
  font-size: 14px;
  color: #00d4ff;
  font-weight: bold;
  margin-bottom: 10px;
}

.stream-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.stream-item:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
}

.stream-item:last-child {
  margin-bottom: 0;
}

.stream-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.stream-name {
  color: #ffffff;
  font-family: monospace;
  font-size: 13px;
}

.stream-schema {
  padding: 2px 8px;
  background: rgba(0, 212, 255, 0.2);
  border: 1px solid rgba(0, 212, 255, 0.4);
  border-radius: 3px;
  color: #00d4ff;
  font-size: 11px;
  font-weight: bold;
}

.use-btn {
  padding: 5px 12px;
  background: linear-gradient(135deg, #00d4ff, #00b8e6);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.use-btn:hover {
  background: linear-gradient(135deg, #00b8e6, #0096c7);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.4);
}

.streams-loading,
.streams-empty {
  margin-top: 15px;
  padding: 15px;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 6px;
  color: #88ccff;
  font-size: 13px;
}

.check-btn {
  background: rgba(0, 212, 255, 0.15) !important;
  border-color: rgba(0, 212, 255, 0.4) !important;
  font-weight: bold;
}

.check-btn:hover {
  background: rgba(0, 212, 255, 0.25) !important;
}


</style>
