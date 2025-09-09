import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  ImageFile,
  CanvasConfig,
  StyleParams,
  WatermarkOptions,
  ExportOptions,
  ImageTransform
} from '@/types'
import { useTemplateStore } from './template'
import { useAppStore } from './app'
import { logger } from '@/utils'
import type { Stage } from 'konva/lib/Stage'
import type { UploaderExpose } from '@/components/ImageUploader/ImageUploader.vue'

// 定义插槽类型，可以包含一个ImageFile或为null
export type ImageSlot = ImageFile | null

// Konva舞台组件的Ref类型
interface StageRefType {
  getStage(): Stage
}

export const useCanvasStore = defineStore('canvas', () => {
  // 状态
  const imageSlots = ref<ImageSlot[]>([])
  const uploader = ref<UploaderExpose | null>(null)
  const stageRef = ref<StageRefType | null>(null)

  const canvasConfig = ref<Omit<CanvasConfig, 'backgroundColor' | 'padding' | 'borderRadius'>>({
    width: 800,
    height: 600,
    aspectRatio: '4:3'
  })

  const styleParams = ref<StyleParams>({
    spacing: 10,
    borderRadius: 0,
    backgroundColor: '#ffffff',
    opacity: 1,
    padding: {
      top: 12,
      right: 12,
      bottom: 12,
      left: 12
    }
  })

  const exportOptions = ref<ExportOptions>({
    format: 'image/jpeg',
    quality: 0.95, // Corresponds to "High Quality JPG"
    pixelRatio: 2, // Default to 2x resolution
    filename: '无标题拼图'
  })

  // 水印设置
  const watermark = ref<WatermarkOptions>({
    enabled: false,
    mode: 'tile',
    text: '',
    fontSize: 20,
    opacity: 0.25,
    rotation: 45,
    density: 'medium',
    position: 'bottom-right'
  })

  // 计算属性
  const hasImages = computed(() => imageSlots.value.some(slot => slot !== null))

  // 初始化或更新插槽
  const initializeSlots = (count: number) => {
    logger.log('CanvasStore', '🎯 初始化插槽', {
      requestedCount: count,
      currentCount: imageSlots.value.length,
      currentSlots: imageSlots.value.map((slot, i) => slot ? `插槽${i}: ${slot.file.name}` : `插槽${i}: 空`)
    })

    if (imageSlots.value.length !== count) {
      const newSlots = Array(count).fill(null)
      // 保留已有的图片
      for (let i = 0; i < Math.min(count, imageSlots.value.length); i++) {
        newSlots[i] = imageSlots.value[i]
      }
      imageSlots.value = newSlots
      
      logger.log('CanvasStore', '✅ 插槽初始化完成', {
        newCount: count,
        preservedImages: Math.min(count, imageSlots.value.length)
      })
    } else {
      logger.log('CanvasStore', '⏭️ 插槽数量无变化，跳过初始化')
    }
  }

  // 图片相关方法
  const addImage = async (imageFile: File, slotIndex: number): Promise<void> => {
    const endGroup = logger.group('CanvasStore', '🖼️ 开始添加图片', {
      fileName: imageFile.name,
      fileSize: `${(imageFile.size / 1024).toFixed(2)} KB`,
      slotIndex,
      currentSlotStatus: imageSlots.value[slotIndex] ? '已占用' : '空闲'
    })

    try {
      logger.log('CanvasStore', '🔗 创建对象URL')
      const url = URL.createObjectURL(imageFile)
      
      logger.log('CanvasStore', '📐 开始获取图片尺寸')
      const img = new Image()
      
      const dimensions = await logger.async('CanvasStore', '获取图片尺寸', new Promise<{ width: number; height: number }>((resolve, reject) => {
        img.onload = () => {
          logger.log('CanvasStore', '✅ 图片加载成功', {
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight
          })
          resolve({ width: img.naturalWidth, height: img.naturalHeight })
        }
        img.onerror = () => {
          logger.error('CanvasStore', '❌ 图片加载失败')
          reject(new Error('Failed to load image'))
        }
        img.src = url
      }))

      const newImage: ImageFile = {
        id: `image_${Date.now()}_${slotIndex}`,
        file: imageFile,
        url,
        width: dimensions.width,
        height: dimensions.height,
        size: imageFile.size
      }

      logger.log('CanvasStore', '📦 创建ImageFile对象', {
        id: newImage.id,
        dimensions: `${newImage.width}x${newImage.height}`,
        url: url.substring(0, 50) + '...'
      })

      if (slotIndex >= 0 && slotIndex < imageSlots.value.length) {
        // 如果该位置已有图片，先释放旧的URL
        const oldImage = imageSlots.value[slotIndex]
        if (oldImage) {
          logger.log('CanvasStore', '🗑️ 释放旧图片URL', { oldImageId: oldImage.id })
          URL.revokeObjectURL(oldImage.url)
        }
        
        imageSlots.value[slotIndex] = newImage
        logger.log('CanvasStore', '✅ 图片添加到插槽成功', { slotIndex })
        
        // 输出当前所有插槽状态
        logger.log('CanvasStore', '📊 当前插槽状态', 
          imageSlots.value.map((slot, i) => ({
            index: i,
            status: slot ? `${slot.file.name} (${slot.width}x${slot.height})` : '空'
          }))
        )
      } else {
        logger.error('CanvasStore', '❌ 插槽索引无效', { slotIndex, maxIndex: imageSlots.value.length - 1 })
        throw new Error(`Invalid slot index: ${slotIndex}`)
      }
    } catch (error) {
      logger.error('CanvasStore', '❌ 添加图片失败', error)
      throw error
    } finally {
      endGroup?.()
    }
  }

  const removeImage = (slotIndex: number) => {
    logger.log('CanvasStore', '🗑️ 开始移除图片', { slotIndex })
    
    if (slotIndex >= 0 && slotIndex < imageSlots.value.length) {
      const imageToRemove = imageSlots.value[slotIndex]
      if (imageToRemove) {
        logger.log('CanvasStore', '🔗 释放图片URL', {
          imageId: imageToRemove.id,
          fileName: imageToRemove.file.name
        })
        URL.revokeObjectURL(imageToRemove.url)
        imageSlots.value[slotIndex] = null
        
        logger.log('CanvasStore', '✅ 图片移除成功', { slotIndex })
      } else {
        logger.warn('CanvasStore', '⚠️ 插槽已为空，无需移除', { slotIndex })
      }
    } else {
      logger.error('CanvasStore', '❌ 插槽索引无效', { slotIndex, maxIndex: imageSlots.value.length - 1 })
    }
  }

  const swapImages = (fromIndex: number, toIndex: number) => {
    logger.log('CanvasStore', '🔄 开始交换图片', {
      fromIndex,
      toIndex,
      fromImage: imageSlots.value[fromIndex]?.file.name || '空',
      toImage: imageSlots.value[toIndex]?.file.name || '空'
    })

    if (
      fromIndex >= 0 && fromIndex < imageSlots.value.length &&
      toIndex >= 0 && toIndex < imageSlots.value.length
    ) {
      const temp = imageSlots.value[fromIndex]
      imageSlots.value[fromIndex] = imageSlots.value[toIndex]
      imageSlots.value[toIndex] = temp
      
      logger.log('CanvasStore', '✅ 图片交换成功', {
        fromIndex,
        toIndex,
        newFromImage: imageSlots.value[fromIndex]?.file.name || '空',
        newToImage: imageSlots.value[toIndex]?.file.name || '空'
      })
    } else {
      logger.error('CanvasStore', '❌ 交换索引无效', {
        fromIndex,
        toIndex,
        maxIndex: imageSlots.value.length - 1
      })
    }
  }

  const clearImages = () => {
    imageSlots.value.forEach(slot => {
      if (slot) {
        URL.revokeObjectURL(slot.url)
      }
    })
    const templateStore = useTemplateStore()
    if (templateStore.currentTemplate) {
      initializeSlots(templateStore.currentTemplate.imageCount)
    }
  }

  // Canvas配置方法
  const updateStyleParams = (params: Partial<StyleParams>) => {
    styleParams.value = { ...styleParams.value, ...params }
  }

  // 更新水印参数
  const updateWatermark = (params: Partial<WatermarkOptions>) => {
    watermark.value = { ...watermark.value, ...params }
  }

  // 更新导出参数
  const updateExportOptions = (params: Partial<ExportOptions>) => {
    exportOptions.value = { ...exportOptions.value, ...params }
  }

  const setAspectRatio = (ratio: string) => {
    canvasConfig.value.aspectRatio = ratio
  }

  // Uploader 相关
  const setUploader = (instance: UploaderExpose | null) => {
    uploader.value = instance
  }

  const triggerUpload = (slotIndex: number) => {
    logger.log('CanvasStore', '📤 触发上传对话框', {
      slotIndex,
      uploaderExists: !!uploader.value
    })
    
    if (uploader.value) {
      uploader.value.openFileDialog(slotIndex)
      logger.log('CanvasStore', '✅ 已调用上传器的openFileDialog')
    } else {
      logger.error('CanvasStore', '❌ 上传器实例不存在')
    }
  }

  // Konva Stage 相关
  const setStageRef = (instance: StageRefType | null) => {
    stageRef.value = instance
  }

  const exportCanvas = (): string | null => {
    if (!stageRef.value) {
      const appStore = useAppStore()
      appStore.showError('导出失败', '画布实例不存在')
      return null
    }
    const stage = stageRef.value.getStage()
    return stage.toDataURL({
      mimeType: exportOptions.value.format,
      quality: exportOptions.value.quality,
      pixelRatio: exportOptions.value.pixelRatio
    })
  }

  // 图片变换相关方法
  const updateImageTransform = (slotIndex: number, transform: Partial<ImageTransform>) => {
    logger.log('CanvasStore', '🔄 更新图片变换', { 
      slotIndex, 
      transform,
      currentImage: imageSlots.value[slotIndex]?.file.name || '空'
    })
    
    if (slotIndex >= 0 && slotIndex < imageSlots.value.length) {
      const image = imageSlots.value[slotIndex]
      if (image) {
        // 获取当前变换或设置默认值
        const currentTransform = image.transform || { scale: 1, offsetX: 0, offsetY: 0 }
        
        // 合并新的变换参数
        const newTransform = { ...currentTransform, ...transform }
        
        // 应用缩放范围限制 (0.5x - 3.0x)
        newTransform.scale = Math.max(0.5, Math.min(3.0, newTransform.scale))
        
        // 更新图片的变换属性
        image.transform = newTransform
        
        logger.log('CanvasStore', '✅ 图片变换已更新', {
          slotIndex,
          newTransform,
          imageId: image.id
        })
      } else {
        logger.warn('CanvasStore', '⚠️ 指定插槽无图片，无法应用变换', { slotIndex })
      }
    } else {
      logger.error('CanvasStore', '❌ 插槽索引无效', { slotIndex, maxIndex: imageSlots.value.length - 1 })
    }
  }

  const resetImageTransform = (slotIndex: number) => {
    logger.log('CanvasStore', '🔄 重置图片变换', { slotIndex })
    updateImageTransform(slotIndex, { scale: 1, offsetX: 0, offsetY: 0 })
  }

  const scaleImage = (slotIndex: number, scaleFactor: number) => {
    logger.log('CanvasStore', '🔍 缩放图片', { slotIndex, scaleFactor })
    
    if (slotIndex >= 0 && slotIndex < imageSlots.value.length) {
      const image = imageSlots.value[slotIndex]
      if (image) {
        const currentScale = image.transform?.scale || 1
        const newScale = currentScale * scaleFactor
        updateImageTransform(slotIndex, { scale: newScale })
      }
    }
  }

  const zoomInImage = (slotIndex: number) => {
    scaleImage(slotIndex, 1.2) // 每次放大20%
  }

  const zoomOutImage = (slotIndex: number) => {
    scaleImage(slotIndex, 0.8) // 每次缩小20%
  }

  // 监听模板变化，自动初始化插槽
  const templateStore = useTemplateStore()
  watch(
    () => templateStore.currentTemplate,
    (newTemplate) => {
      if (newTemplate) {
        logger.log('CanvasStore', '🎯 检测到模板变化，自动初始化插槽', {
          templateId: newTemplate.id,
          templateName: newTemplate.name,
          imageCount: newTemplate.imageCount
        })
        initializeSlots(newTemplate.imageCount)
      }
    },
    { immediate: true }
  )

  return {
    // 状态
    imageSlots,
    canvasConfig,
    styleParams,
    watermark,
    exportOptions,
    // 计算属性
    hasImages,
    // 方法
    initializeSlots,
    addImage,
    removeImage,
    swapImages,
    clearImages,
    updateStyleParams,
    updateWatermark,
    updateExportOptions,
    setAspectRatio,
    setUploader,
    triggerUpload,
    setStageRef,
    exportCanvas,
    // 图片变换方法
    updateImageTransform,
    resetImageTransform,
    scaleImage,
    zoomInImage,
    zoomOutImage
  }
})