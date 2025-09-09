import { ref, computed, type Ref } from 'vue'
import type { Template, ImageFile, CanvasConfig, ExportOptions, LayoutConfig, StyleParams } from '@/types'

export const useCanvas = (canvasRef: Ref<HTMLCanvasElement | null>) => {
  const isRendering = ref(false)
  const lastRenderTime = ref(0)

  // 获取Canvas上下文
  const getContext = (): CanvasRenderingContext2D | null => {
    return canvasRef.value?.getContext('2d') || null
  }

  // 加载图片
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.crossOrigin = 'anonymous' // 支持跨域图片
      img.src = src
    })
  }

  // 绘制圆角矩形
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  // 计算图片在布局中的绘制参数
  const calculateImageDrawParams = (
    img: HTMLImageElement,
    layout: LayoutConfig,
    canvasWidth: number,
    canvasHeight: number,
    spacing: number
  ) => {
    const x = (layout.x / 100) * canvasWidth + spacing / 2
    const y = (layout.y / 100) * canvasHeight + spacing / 2
    const width = (layout.width / 100) * canvasWidth - spacing
    const height = (layout.height / 100) * canvasHeight - spacing

    // 计算图片裁剪参数（保持宽高比，居中裁剪）
    const imgAspect = img.width / img.height
    const layoutAspect = width / height

    let sx, sy, sWidth, sHeight

    if (imgAspect > layoutAspect) {
      // 图片比布局更宽，裁剪宽度
      sHeight = img.height
      sWidth = img.height * layoutAspect
      sx = (img.width - sWidth) / 2
      sy = 0
    } else {
      // 图片比布局更高，裁剪高度
      sWidth = img.width
      sHeight = img.width / layoutAspect
      sx = 0
      sy = (img.height - sHeight) / 2
    }

    return {
      // 源图片参数
      sx: Math.max(0, sx),
      sy: Math.max(0, sy),
      sWidth: Math.min(sWidth, img.width),
      sHeight: Math.min(sHeight, img.height),
      // 目标Canvas参数
      dx: x,
      dy: y,
      dWidth: width,
      dHeight: height
    }
  }

  // 渲染Canvas
  const render = async (
    template: Template,
    images: ImageFile[],
    config: CanvasConfig,
    styleParams: StyleParams
  ): Promise<void> => {
    const ctx = getContext()
    if (!ctx || !canvasRef.value) return

    isRendering.value = true
    const startTime = performance.now()

    try {
      const canvas = canvasRef.value
      
      // 设置Canvas尺寸
      const [aspectWidth, aspectHeight] = config.aspectRatio.split(':').map(Number)
      const aspectRatio = aspectWidth / aspectHeight

      // 计算实际尺寸
      const maxWidth = 800
      const maxHeight = 600
      
      let canvasWidth, canvasHeight
      
      if (aspectRatio >= 1) {
        canvasWidth = Math.min(maxWidth, canvas.parentElement?.clientWidth || maxWidth)
        canvasHeight = canvasWidth / aspectRatio
      } else {
        canvasHeight = Math.min(maxHeight, canvas.parentElement?.clientHeight || maxHeight)
        canvasWidth = canvasHeight * aspectRatio
      }

      canvas.width = canvasWidth
      canvas.height = canvasHeight

      // 清空画布
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)

      // 绘制背景
      ctx.fillStyle = styleParams.backgroundColor
      if (styleParams.borderRadius > 0) {
        ctx.save()
        drawRoundedRect(ctx, 0, 0, canvasWidth, canvasHeight, styleParams.borderRadius)
        ctx.fill()
        ctx.restore()
      } else {
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      }

      // 如果没有图片，绘制占位符
      if (images.length === 0) {
        drawPlaceholder(ctx, template, canvasWidth, canvasHeight)
        return
      }

      // 加载并绘制图片
      const loadedImages = await Promise.all(
        images.slice(0, template.imageCount).map(img => loadImage(img.url))
      )

      template.layout.forEach((layout, index) => {
        if (index < loadedImages.length) {
          const img = loadedImages[index]
          const params = calculateImageDrawParams(
            img, 
            layout, 
            canvasWidth, 
            canvasHeight, 
            styleParams.spacing
          )

          // 保存状态
          ctx.save()

          // 如果有圆角，创建剪切路径
          if (styleParams.borderRadius > 0) {
            const radius = Math.min(
              styleParams.borderRadius, 
              params.dWidth / 4, 
              params.dHeight / 4
            )
            drawRoundedRect(ctx, params.dx, params.dy, params.dWidth, params.dHeight, radius)
            ctx.clip()
          }

          // 绘制图片
          ctx.drawImage(
            img,
            params.sx, params.sy, params.sWidth, params.sHeight,
            params.dx, params.dy, params.dWidth, params.dHeight
          )

          // 恢复状态
          ctx.restore()
        }
      })

    } catch (error) {
      console.error('Canvas rendering error:', error)
      throw error
    } finally {
      isRendering.value = false
      lastRenderTime.value = performance.now() - startTime
    }
  }

  // 绘制占位符
  const drawPlaceholder = (
    ctx: CanvasRenderingContext2D,
    template: Template,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    // 绘制模板布局线框
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    template.layout.forEach((layout, index) => {
      const x = (layout.x / 100) * canvasWidth
      const y = (layout.y / 100) * canvasHeight
      const width = (layout.width / 100) * canvasWidth
      const height = (layout.height / 100) * canvasHeight

      ctx.strokeRect(x + 2, y + 2, width - 4, height - 4)

      // 绘制序号
      ctx.fillStyle = '#6b7280'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        `${index + 1}`,
        x + width / 2,
        y + height / 2
      )
    })

    ctx.setLineDash([])
  }

  // 导出Canvas
  const exportCanvas = async (options: ExportOptions): Promise<Blob | null> => {
    const canvas = canvasRef.value
    if (!canvas) return null

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        `image/${options.format}`,
        options.quality / 100
      )
    })
  }

  // 导出高分辨率版本
  const exportHighRes = async (
    template: Template,
    images: ImageFile[],
    config: CanvasConfig,
    styleParams: StyleParams,
    options: ExportOptions
  ): Promise<Blob | null> => {
    // 创建临时高分辨率Canvas
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return null

    const scale = options.pixelRatio || 2
    const [aspectWidth, aspectHeight] = config.aspectRatio.split(':').map(Number)
    const aspectRatio = aspectWidth / aspectHeight

    // 设置高分辨率尺寸
    const baseWidth = 1200 * scale
    const baseHeight = baseWidth / aspectRatio

    tempCanvas.width = baseWidth
    tempCanvas.height = baseHeight

    try {
      // 使用临时Canvas渲染高分辨率版本
      const originalCanvas = canvasRef.value
      canvasRef.value = tempCanvas

      await render(template, images, config, styleParams)

      // 恢复原Canvas引用
      canvasRef.value = originalCanvas

      // 导出临时Canvas
      return new Promise((resolve) => {
        tempCanvas.toBlob(
          (blob) => resolve(blob),
          `image/${options.format}`,
          options.quality / 100
        )
      })

    } catch (error) {
      console.error('High-res export error:', error)
      return null
    }
  }

  // 获取Canvas数据URL
  const getDataURL = (format: string = 'image/png', quality: number = 1): string | null => {
    const canvas = canvasRef.value
    if (!canvas) return null

    return canvas.toDataURL(format, quality)
  }

  // 重置Canvas
  const clear = () => {
    const ctx = getContext()
    const canvas = canvasRef.value
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  return {
    // 状态
    isRendering: computed(() => isRendering.value),
    lastRenderTime: computed(() => lastRenderTime.value),
    
    // 方法
    render,
    exportCanvas,
    exportHighRes,
    getDataURL,
    clear,
    
    // 工具方法
    loadImage,
    drawRoundedRect,
    calculateImageDrawParams
  }
}