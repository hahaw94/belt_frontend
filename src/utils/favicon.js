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
          // 在画布上绘制图片
          ctx.drawImage(img, 0, 0, size, size)
          
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
