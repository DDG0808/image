// 图片相关工具函数
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

// 文件大小格式化
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 生成唯一ID
export const generateId = (prefix = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 防抖函数
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | undefined
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = window.setTimeout(() => func.apply(this, args), wait)
  }
}

// 节流函数
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 下载文件
export const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 检查是否为移动设备
export const isMobile = (): boolean => {
  return window.innerWidth < 768
}

// 计算宽高比
export const calculateAspectRatio = (width: number, height: number): string => {
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b)
  }
  
  const divisor = gcd(width, height)
  const ratioWidth = width / divisor
  const ratioHeight = height / divisor
  
  return `${ratioWidth}:${ratioHeight}`
}

// 颜色相关工具
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// 检查颜色对比度
export const getContrastColor = (hexColor: string): string => {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return '#000000'
  
  // 计算亮度
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return brightness > 128 ? '#000000' : '#ffffff'
}

// 本地存储工具
export const storage = {
  set: (key: string, value: unknown): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  },
  
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn('Failed to read from localStorage:', error)
      return defaultValue
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error)
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear()
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }
}

// 错误处理工具
export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

// 创建Canvas工具函数
export const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

// 复制到剪贴板
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // fallback
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

// 统一的日志工具
interface LogOptions {
  module: string
  level?: 'log' | 'warn' | 'error' | 'info'
  data?: any
  group?: boolean
}

export const logger = {
  // 创建带时间戳和模块标识的日志
  create: ({ module, level = 'log', data, group = false }: LogOptions) => {
    const timestamp = new Date().toLocaleTimeString('zh-CN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    }) + '.' + String(Date.now()).slice(-3)
    const prefix = `[${timestamp}] [${module}]`
    
    if (group) {
      console.group(prefix)
      if (data) console.log(data)
      return () => console.groupEnd()
    } else {
      console[level](prefix, data || '')
    }
  },

  // 快捷方法
  log: (module: string, message: string, data?: any) => {
    logger.create({ module, level: 'log', data: data ? `${message}:` : message })
    if (data) console.log(data)
  },
  
  warn: (module: string, message: string, data?: any) => {
    logger.create({ module, level: 'warn', data: data ? `${message}:` : message })
    if (data) console.warn(data)
  },
  
  error: (module: string, message: string, data?: any) => {
    logger.create({ module, level: 'error', data: data ? `${message}:` : message })
    if (data) console.error(data)
  },

  group: (module: string, title: string, data?: any) => {
    const endGroup = logger.create({ module, group: true, data: `${title}${data ? ':' : ''}` })
    if (data) console.log(data)
    return endGroup
  },

  // 专门用于追踪异步操作
  async: (module: string, operation: string, promise: Promise<any>) => {
    logger.log(module, `🔄 开始异步操作: ${operation}`)
    
    return promise
      .then((result) => {
        logger.log(module, `✅ 异步操作成功: ${operation}`, result)
        return result
      })
      .catch((error) => {
        logger.error(module, `❌ 异步操作失败: ${operation}`, error)
        throw error
      })
  }
}