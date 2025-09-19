/**
 * Favicon 动态管理工具
 * 用于动态更新浏览器标签页图标
 */

/**
 * 更新页面favicon
 * @param {string} iconUrl - 图标的URL地址，如果为空则使用默认favicon
 */
export function updateFavicon(iconUrl) {
  try {
    // 查找现有的favicon链接
    let link = document.querySelector("link[rel*='icon']") || document.createElement('link')
    
    // 设置或更新链接属性
    link.type = 'image/x-icon'
    link.rel = 'shortcut icon'
    
    if (iconUrl && iconUrl.trim()) {
      // 使用自定义图标
      link.href = iconUrl
    } else {
      // 使用默认图标
      link.href = '/favicon.ico'
    }
    
    // 如果是新创建的link元素，需要添加到head中
    if (!document.querySelector("link[rel*='icon']")) {
      document.head.appendChild(link)
    }
    
    console.log('Favicon updated to:', link.href)
  } catch (error) {
    console.error('Failed to update favicon:', error)
  }
}

/**
 * 重置favicon为默认图标
 */
export function resetFavicon() {
  updateFavicon('/favicon.ico')
}

/**
 * 从图片URL创建favicon（将图片转换为合适的格式）
 * @param {string} imageUrl - 图片URL
 * @param {number} size - 图标尺寸，默认32px
 */
export function createFaviconFromImage(imageUrl, size = 32) {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      // 设置画布尺寸
      canvas.width = size
      canvas.height = size
      
      img.crossOrigin = 'anonymous' // 处理跨域图片
      
      img.onload = () => {
        try {
          // 检测图片是否需要增强处理
          const needsEnhancement = checkIfNeedsEnhancement(img)
          
          if (needsEnhancement) {
            // 添加细微的阴影和描边增强可见性
            addSubtleEnhancement(ctx, img, size)
          } else {
            // 直接绘制图片
            ctx.drawImage(img, 0, 0, size, size)
          }
          
          // 转换为data URL
          const dataUrl = canvas.toDataURL('image/png')
          
          // 更新favicon
          updateFavicon(dataUrl)
          resolve(dataUrl)
        } catch (error) {
          console.error('Failed to process image for favicon:', error)
          reject(error)
        }
      }
      
      img.onerror = () => {
        console.error('Failed to load image for favicon:', imageUrl)
        reject(new Error('Image load failed'))
      }
      
      img.src = imageUrl
    } catch (error) {
      console.error('Failed to create favicon from image:', error)
      reject(error)
    }
  })
}

/**
 * 检测图片是否需要增强处理（透明底板或白色内容）
 * @param {HTMLImageElement} img - 图片元素
 * @returns {boolean} - 是否需要增强处理
 */
function checkIfNeedsEnhancement(img) {
  try {
    // 创建临时画布来分析图片
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    tempCanvas.width = 32
    tempCanvas.height = 32
    
    // 绘制图片到临时画布
    tempCtx.drawImage(img, 0, 0, 32, 32)
    
    // 获取图片数据
    const imageData = tempCtx.getImageData(0, 0, 32, 32)
    const data = imageData.data
    
    let transparentPixels = 0
    let lightPixels = 0
    let totalPixels = 0
    
    // 分析像素
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      
      totalPixels++
      
      // 检查透明或半透明像素
      if (a < 200) {
        transparentPixels++
      }
      
      // 检查浅色像素（白色、浅灰色等）
      if (a >= 128) {
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114)
        if (brightness > 200) {
          lightPixels++
        }
      }
    }
    
    // 如果透明像素比例超过15%，或者浅色像素比例超过50%，则需要增强
    const transparentRatio = transparentPixels / totalPixels
    const lightRatio = lightPixels / totalPixels
    
    return transparentRatio > 0.15 || lightRatio > 0.5
  } catch (error) {
    console.warn('Failed to analyze image, applying enhancement as fallback:', error)
    return true // 如果分析失败，默认应用增强
  }
}

/**
 * 添加细微的阴影和描边增强
 * @param {CanvasRenderingContext2D} ctx - 画布上下文
 * @param {HTMLImageElement} img - 图片元素
 * @param {number} size - 尺寸
 */
function addSubtleEnhancement(ctx, img, size) {
  // 保存当前状态
  ctx.save()
  
  // 1. 添加细微的外阴影
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 2
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1
  
  // 绘制主图片
  ctx.drawImage(img, 0, 0, size, size)
  
  // 重置阴影
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
  
  // 2. 添加细微的深色描边（通过多次偏移绘制实现）
  ctx.globalCompositeOperation = 'destination-over' // 在现有内容下方绘制
  ctx.globalAlpha = 0.2
  
  // 创建描边效果 - 在8个方向上偏移1像素绘制暗色版本
  const offsets = [
    [-1, -1], [0, -1], [1, -1],
    [-1,  0],          [1,  0],
    [-1,  1], [0,  1], [1,  1]
  ]
  
  // 应用暗色滤镜
  ctx.filter = 'brightness(0.3) contrast(2)'
  
  offsets.forEach(([dx, dy]) => {
    ctx.drawImage(img, dx, dy, size, size)
  })
  
  // 恢复状态
  ctx.restore()
  
  // 3. 再次绘制原图确保清晰度
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
  ctx.filter = 'none'
  ctx.drawImage(img, 0, 0, size, size)
}

/**
 * 检查是否支持动态favicon更新
 */
export function isFaviconSupported() {
  return typeof document !== 'undefined' && document.head
}

export default {
  updateFavicon,
  resetFavicon,
  createFaviconFromImage,
  isFaviconSupported
}
