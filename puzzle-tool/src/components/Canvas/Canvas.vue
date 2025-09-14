<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import { useCanvasStore } from '@/stores/canvas'
import { useTemplateStore } from '@/stores/template'
import { logger } from '@/utils'
import Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { useWindowSize } from '@vueuse/core'

defineOptions({
  name: 'PuzzleCanvas'
})

const canvasStore = useCanvasStore()
const templateStore = useTemplateStore()

const containerRef = ref<HTMLDivElement | null>(null)
const stageRef = ref<{ getStage: () => Konva.Stage } | null>(null)
const imageLayerRef = ref<{ getStage: () => Konva.Layer } | null>(null)
const watermarkLayerRef = ref<{ getStage: () => Konva.Layer } | null>(null)

const hoveredIndex = ref<number | null>(null)
const activeIndex = ref<number | null>(null) // 移动端激活的插槽
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 1024)
const hoverTimeoutId = ref<number | null>(null)

const stageConfig = ref({
  width: 800,
  height: 600,
})

const images = ref<(Konva.Image | null)[]>([])
const draggedIndex = ref<number | null>(null)
const panMode = ref<boolean>(false) // 平移模式标志

// 计算画布尺寸以适应容器
const calculateStageSize = () => {
  if (containerRef.value) {
    const containerWidth = containerRef.value.offsetWidth - 32 // padding
    const containerHeight = containerRef.value.offsetHeight - 32 // padding
    const [aspectWidth, aspectHeight] = canvasStore.canvasConfig.aspectRatio.split(':').map(Number)
    const ratio = aspectWidth / aspectHeight

    let width, height

    if (containerWidth / ratio <= containerHeight) {
      width = containerWidth
      height = containerWidth / ratio
    } else {
      height = containerHeight
      width = containerHeight * ratio
    }
    stageConfig.value = { width, height }
  }
}

// 辅助：根据密度计算水印间距
const getWMSpacingX = () => {
  const base = stageConfig.value.width / 6
  const density = canvasStore.watermark.density
  if (density === 'dense') return base * 0.6
  if (density === 'sparse') return base * 1.4
  return base
}
const getWMSpacingY = () => {
  const base = stageConfig.value.height / 6
  const density = canvasStore.watermark.density
  if (density === 'dense') return base * 0.6
  if (density === 'sparse') return base * 1.4
  return base
}

// 悬停处理函数
const handleMouseEnter = (index: number) => {
  if (hoverTimeoutId.value) {
    clearTimeout(hoverTimeoutId.value)
    hoverTimeoutId.value = null
  }
  hoveredIndex.value = index
}

const handleMouseLeave = () => {
  hoverTimeoutId.value = window.setTimeout(() => {
    hoveredIndex.value = null
    hoverTimeoutId.value = null
  }, 100) // 100ms 延迟，防止鼠标快速移动时按钮闪烁
}

// 处理插槽点击（用于移动端激活控制面板）
const handleSlotTap = (index: number) => {
  if (isMobile.value) {
    activeIndex.value = index
  }
}

// 舞台空白处点击，关闭激活
const handleStageTap = () => {
  if (isMobile.value) {
    activeIndex.value = null
  }
}

// 根据位置与旋转返回水印组配置（偏移）
// const getWMGroupConfig = () => {
//   const rotation = canvasStore.watermark.rotation
//   const padding = 16
//   let x = 0
//   let y = 0

//   // 基于舞台大小确定起点
//   const w = stageConfig.value.width
//   const h = stageConfig.value.height

//   switch (canvasStore.watermark.position) {
//     case 'top-left':
//       x = padding
//       y = padding
//       break
//     case 'top-right':
//       x = w - padding
//       y = padding
//       break
//     case 'bottom-left':
//       x = padding
//       y = h - padding
//       break
//     case 'bottom-right':
//       x = w - padding
//       y = h - padding
//       break
//     case 'center':
//     default:
//       x = w / 2
//       y = h / 2
//       break
//   }

//   return { rotation, x, y }
// }

// 获取单个水印的配置
const getSingleWatermarkConfig = () => {
  const padding = 24
  const w = stageConfig.value.width
  const h = stageConfig.value.height

  const commonConfig = {
    text: canvasStore.watermark.text,
    fontSize: canvasStore.watermark.fontSize,
    fill: `rgba(0,0,0,${canvasStore.watermark.opacity})`,
    rotation: canvasStore.watermark.rotation,
  }

  switch (canvasStore.watermark.position) {
    case 'top-left':
      return { ...commonConfig, x: padding, y: padding, align: 'left', verticalAlign: 'top' }
    case 'top-right':
      return { ...commonConfig, x: 0, y: padding, width: w - padding, align: 'right', verticalAlign: 'top' }
    case 'bottom-left':
      return { ...commonConfig, x: padding, y: 0, width: w - padding, height: h - padding, align: 'left', verticalAlign: 'bottom' }
    case 'bottom-right':
      return { ...commonConfig, x: 0, y: 0, width: w - padding, height: h - padding, align: 'right', verticalAlign: 'bottom' }
    case 'center':
    default:
      return { ...commonConfig, x: 0, y: 0, width: w, height: h, align: 'center', verticalAlign: 'middle' }
  }
}

// 加载图片并返回 Konva.Image 对象
const loadImage = (src: string): Promise<Konva.Image | null> => {
  logger.log('Canvas', '🖼️ 开始加载图片', {
    src: src.substring(0, 50) + '...',
    timestamp: Date.now()
  })

  return new Promise((resolve) => {
    Konva.Image.fromURL(src, (imageNode: Konva.Image) => {
      logger.log('Canvas', '✅ 图片加载成功', {
        width: imageNode.width(),
        height: imageNode.height(),
        src: src.substring(0, 50) + '...'
      })
      resolve(imageNode)
    }, (error) => {
      logger.error('Canvas', '❌ 图片加载失败', {
        src: src.substring(0, 50) + '...',
        error
      })
      resolve(null)
    })
  })
}

// 拖拽处理
const handleDragStart = (index: number, e: KonvaEventObject<DragEvent>) => {
  draggedIndex.value = index
  const image = e.target as Konva.Image
  const slot = templateStore.currentTemplate?.layout[index]
  if (!slot) return
  
  if (panMode.value) {
    // 平移模式：不需要特殊处理，让Konva自然拖拽
    // 图片当前位置已经包含了之前的偏移量
  } else {
    // 交换模式：记录拖拽开始的原始位置
  image.setAttr('originalX', (slot.x / 100) * stageConfig.value.width + canvasStore.styleParams.spacing / 2)
  image.setAttr('originalY', (slot.y / 100) * stageConfig.value.height + canvasStore.styleParams.spacing / 2)
  }
}

// 拖拽边界限制
const handleDragMove = (index: number, e: KonvaEventObject<DragEvent>) => {
  const image = e.target as Konva.Image
  const pos = image.position()
  
  if (panMode.value) {
    // 平移模式：直接允许自由拖拽，不做实时更新
    // 边界限制：确保图片不完全移出插槽区域
    const slot = templateStore.currentTemplate?.layout[index]
    if (slot) {
      const slotX = (slot.x / 100) * stageConfig.value.width + canvasStore.styleParams.spacing / 2
      const slotY = (slot.y / 100) * stageConfig.value.height + canvasStore.styleParams.spacing / 2
      const slotWidth = (slot.width / 100) * (stageConfig.value.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right) - canvasStore.styleParams.spacing
      const slotHeight = (slot.height / 100) * (stageConfig.value.height - canvasStore.styleParams.padding.top - canvasStore.styleParams.padding.bottom) - canvasStore.styleParams.spacing
      
      // 允许图片移动，但至少保留20%在插槽内
      const imageWidth = image.width() * image.scaleX()
      const imageHeight = image.height() * image.scaleY()
      const minVisibleWidth = Math.min(imageWidth * 0.2, slotWidth)
      const minVisibleHeight = Math.min(imageHeight * 0.2, slotHeight)
      
      const minX = slotX - imageWidth + minVisibleWidth
      const maxX = slotX + slotWidth - minVisibleWidth
      const minY = slotY - imageHeight + minVisibleHeight
      const maxY = slotY + slotHeight - minVisibleHeight
      
      const constrainedX = Math.max(minX, Math.min(pos.x, maxX))
      const constrainedY = Math.max(minY, Math.min(pos.y, maxY))
      
      if (pos.x !== constrainedX || pos.y !== constrainedY) {
        image.position({ x: constrainedX, y: constrainedY })
      }
    }
  } else {
    // 交换模式：允许跨槽自由拖拽，不在局部坐标系下做0边界限制
    // 让Konva自然拖拽即可，最近插槽判定在dragend阶段用绝对坐标完成
  }
}

const handleDragEnd = (index: number, e: KonvaEventObject<DragEvent>) => {
  if (draggedIndex.value === null) return

  const image = e.target as Konva.Image

  if (panMode.value) {
    // 平移模式：计算并保存最终偏移量
    const slot = templateStore.currentTemplate?.layout[index]
    if (slot) {
      const slotX = (slot.x / 100) * stageConfig.value.width + canvasStore.styleParams.spacing / 2
      const slotY = (slot.y / 100) * stageConfig.value.height + canvasStore.styleParams.spacing / 2
      
      const currentX = image.x()
      const currentY = image.y()
      
      const offsetX = currentX - slotX
      const offsetY = currentY - slotY
      
      // 保存偏移量到store
      canvasStore.updateImageTransform(index, { 
        offsetX, 
        offsetY 
      })
    }
    draggedIndex.value = null
    return
  }

  // 交换模式：使用绝对坐标计算最近插槽
  const imageAbsPos = image.getAbsolutePosition()

  // 找到最接近的插槽
  let closestIndex = index
  let minDistance = Infinity

  templateStore.currentTemplate?.layout.forEach((slot, i) => {
    // 计算插槽绝对坐标与中心（与模板渲染时的 group 定位保持一致）
    const usableWidth = stageConfig.value.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right
    const usableHeight = stageConfig.value.height - canvasStore.styleParams.padding.top - canvasStore.styleParams.padding.bottom
    const slotAbsX = canvasStore.styleParams.padding.left + (slot.x / 100) * usableWidth + canvasStore.styleParams.spacing / 2
    const slotAbsY = canvasStore.styleParams.padding.top + (slot.y / 100) * usableHeight + canvasStore.styleParams.spacing / 2
    const slotWidthPx = (slot.width / 100) * usableWidth - canvasStore.styleParams.spacing
    const slotHeightPx = (slot.height / 100) * usableHeight - canvasStore.styleParams.spacing
    const slotCenterX = slotAbsX + slotWidthPx / 2
    const slotCenterY = slotAbsY + slotHeightPx / 2

    const distance = Math.sqrt(
      Math.pow(imageAbsPos.x - slotCenterX, 2) + Math.pow(imageAbsPos.y - slotCenterY, 2)
    )

    if (distance < minDistance) {
      minDistance = distance
      closestIndex = i
    }
  })

  // 如果拖拽到了不同的插槽，进行交换
  if (closestIndex !== index) {
    canvasStore.swapImages(index, closestIndex)
  }

  // 使用动画平滑移动到目标位置（回到自身插槽的偏移位置）
  const targetIndex = index
  const targetSlot = templateStore.currentTemplate?.layout[targetIndex]
  if (!targetSlot) return
  const targetOffsetX = canvasStore.imageSlots[targetIndex]?.transform?.offsetX || 0
  const targetOffsetY = canvasStore.imageSlots[targetIndex]?.transform?.offsetY || 0
  const targetX = targetOffsetX
  const targetY = targetOffsetY

  // 创建平滑的动画过渡
  const tween = new Konva.Tween({
    node: image,
    duration: 0.2,
    x: targetX,
    y: targetY,
    scaleX: 1,
    scaleY: 1,
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    easing: Konva.Easings.EaseInOut
  })

  tween.play()

  draggedIndex.value = null
}

// 监听各种变化以重新渲染
watch(
  [
    () => canvasStore.imageSlots,
    () => templateStore.currentTemplate,
    () => canvasStore.styleParams,
    () => canvasStore.canvasConfig,
  ],
  async () => {
    const endGroup = logger.group('Canvas', '🔄 监听器触发重新渲染', {
      imageSlots: canvasStore.imageSlots.map((slot, i) => slot ? `插槽${i}: ${slot.file.name}` : `插槽${i}: 空`),
      templateName: templateStore.currentTemplate?.name,
      hasTemplate: !!templateStore.currentTemplate
    })

    try {
      logger.log('Canvas', '⏱️ 等待nextTick')
      await nextTick()
      
      // 检查是否需要初始化插槽
      if (templateStore.currentTemplate && canvasStore.imageSlots.length !== templateStore.currentTemplate.imageCount) {
        logger.log('Canvas', '🎯 检测到模板变化，需要初始化插槽', {
          templateImageCount: templateStore.currentTemplate.imageCount,
          currentSlotsCount: canvasStore.imageSlots.length
        })
        canvasStore.initializeSlots(templateStore.currentTemplate.imageCount)
      }
      
      logger.log('Canvas', '📐 重新计算舞台尺寸')
      calculateStageSize()

      logger.log('Canvas', '🖼️ 开始加载所有图片', {
        totalSlots: canvasStore.imageSlots.length,
        filledSlots: canvasStore.imageSlots.filter(slot => slot !== null).length
      })

      const loadedImages = await Promise.all(
          canvasStore.imageSlots.map((slot, index) => {
            if (slot) {
              logger.log('Canvas', `📸 加载插槽${index}的图片`, { fileName: slot.file.name })
              return loadImage(slot.url)
            } else {
              logger.log('Canvas', `⭕ 插槽${index}为空，跳过加载`)
              return Promise.resolve(null)
            }
          })
      )
      
      images.value = loadedImages
      
      logger.log('Canvas', '📊 图片加载结果', {
        totalImages: loadedImages.length,
        successfulLoads: loadedImages.filter(img => img !== null).length,
        failedLoads: loadedImages.filter(img => img === null).length
      })

      // 重绘图片与水印层
      logger.log('Canvas', '🎨 开始重绘图层')
      if (imageLayerRef.value) {
        imageLayerRef.value.getStage().draw()
        logger.log('Canvas', '✅ 图片层重绘完成')
      } else {
        logger.warn('Canvas', '⚠️ 图片层引用不存在')
      }
      
      if (watermarkLayerRef.value) {
        watermarkLayerRef.value.getStage().draw()
        logger.log('Canvas', '✅ 水印层重绘完成')
      } else {
        logger.warn('Canvas', '⚠️ 水印层引用不存在')
      }
      
      logger.log('Canvas', '✅ 重新渲染完成')
    } catch (error) {
      logger.error('Canvas', '❌ 重新渲染失败', error)
    } finally {
      endGroup?.()
    }
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  logger.log('Canvas', '🚀 组件已挂载，开始初始化')
  
  logger.log('Canvas', '📐 计算初始舞台尺寸')
  calculateStageSize()
  
  logger.log('Canvas', '👀 设置尺寸观察器')
  const resizeObserver = new ResizeObserver(() => {
    logger.log('Canvas', '📱 检测到容器尺寸变化，重新计算舞台尺寸')
    calculateStageSize()
  })
  
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
    logger.log('Canvas', '✅ 尺寸观察器已设置')
  } else {
    logger.warn('Canvas', '⚠️ 容器引用不存在，无法设置尺寸观察器')
  }
  
  if (stageRef.value) {
    canvasStore.setStageRef(stageRef.value)
    logger.log('Canvas', '✅ 舞台引用已设置到store')
  } else {
    logger.warn('Canvas', '⚠️ 舞台引用不存在，无法设置到store')
  }
  
  logger.log('Canvas', '🎉 组件初始化完成')
})

// 性能优化：计算图片配置的函数
const getImageConfig = (index: number, slot: { x: number; y: number; width: number; height: number }) => {
  const slotWidth = (slot.width / 100) * (stageConfig.value.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right) - canvasStore.styleParams.spacing
  const slotHeight = (slot.height / 100) * (stageConfig.value.height - canvasStore.styleParams.padding.top - canvasStore.styleParams.padding.bottom) - canvasStore.styleParams.spacing
  const imageSlot = canvasStore.imageSlots[index]
  const displayMode = imageSlot?.transform?.displayMode || 'stretch'
  const originalImage = images.value[index]

  // 安全检查：确保参数有效
  if (!imageSlot || !originalImage || slotWidth <= 0 || slotHeight <= 0) {
    return null
  }

  // 通用配置
  const baseConfig = {
    image: originalImage.image(),
    cornerRadius: canvasStore.styleParams.borderRadius,
    draggable: true,
    scaleX: (draggedIndex.value === index ? 1.05 : 1) * (imageSlot?.transform?.scale || 1),
    scaleY: (draggedIndex.value === index ? 1.05 : 1) * (imageSlot?.transform?.scale || 1),
    shadowColor: 'black',
    shadowBlur: draggedIndex.value === index ? 10 : 0,
    shadowOpacity: 0.5,
    shadowOffsetX: draggedIndex.value === index ? 5 : 0,
    shadowOffsetY: draggedIndex.value === index ? 5 : 0,
    perfectDrawEnabled: false,
    listening: true
  }

  // 根据显示模式计算图片配置
  if (displayMode === 'original') {
    // 原图模式：按照图片原始像素大小显示
    try {
      const imageWidth = originalImage.width()
      const imageHeight = originalImage.height()

      // 边界检查：防止异常尺寸
      if (imageWidth <= 0 || imageHeight <= 0) {
        logger.warn('Canvas', '⚠️ 图片尺寸无效，使用拉伸模式', { imageWidth, imageHeight, index })
        return {
          ...baseConfig,
          x: imageSlot?.transform?.offsetX || 0,
          y: imageSlot?.transform?.offsetY || 0,
          width: slotWidth,
          height: slotHeight
        }
      }

      // 使用图片原始像素尺寸
      const renderWidth = imageWidth
      const renderHeight = imageHeight

      // 居中显示（图片可能超出相框边界）
      const offsetX = (slotWidth - renderWidth) / 2 + (imageSlot?.transform?.offsetX || 0)
      const offsetY = (slotHeight - renderHeight) / 2 + (imageSlot?.transform?.offsetY || 0)

      logger.log('Canvas', '📐 原图模式配置', {
        index,
        originalSize: `${imageWidth}x${imageHeight}`,
        slotSize: `${slotWidth}x${slotHeight}`,
        renderSize: `${renderWidth}x${renderHeight}`,
        offset: `${offsetX},${offsetY}`
      })

      return {
        ...baseConfig,
        x: offsetX,
        y: offsetY,
        width: renderWidth,
        height: renderHeight
      }
    } catch (error) {
      logger.error('Canvas', '❌ 原图模式配置计算失败，回退到拉伸模式', { error, index })
    }
  }

  // 拉伸模式（默认）：图片填满整个插槽
  return {
    ...baseConfig,
    x: imageSlot?.transform?.offsetX || 0,
    y: imageSlot?.transform?.offsetY || 0,
    width: slotWidth,
    height: slotHeight
  }
}
</script>

<template>
  <div ref="containerRef" class="w-full h-full flex items-center justify-center p-2 sm:p-4 bg-gray-200/50 dark:bg-gray-800/20">
    <div
      class="shadow-lg"
      :style="{
        borderRadius: `${canvasStore.styleParams.borderRadius}px`,
        overflow: 'hidden'
      }"
    >
      <v-stage ref="stageRef" :config="stageConfig" @click="handleStageTap" @tap="handleStageTap">
        <v-layer>
          <v-rect
            :config="{
              width: stageConfig.width,
              height: stageConfig.height,
              fill: canvasStore.styleParams.backgroundColor,
            }"
          />
        </v-layer>
        <v-layer ref="imageLayerRef">
          <template v-for="(slot, index) in templateStore.currentTemplate?.layout" :key="index">
            <v-group
              :config="{
                x: canvasStore.styleParams.padding.left + (slot.x / 100) * (stageConfig.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right) + canvasStore.styleParams.spacing / 2,
                y: canvasStore.styleParams.padding.top + (slot.y / 100) * (stageConfig.height - canvasStore.styleParams.padding.top - canvasStore.styleParams.padding.bottom) + canvasStore.styleParams.spacing / 2,
                width: (slot.width / 100) * (stageConfig.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right) - canvasStore.styleParams.spacing,
                height: (slot.height / 100) * (stageConfig.height - canvasStore.styleParams.padding.top - canvasStore.styleParams.padding.bottom) - canvasStore.styleParams.spacing,
                clipFunc: (ctx: CanvasRenderingContext2D) => {
                  const clipWidth = (slot.width / 100) * (stageConfig.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right) - canvasStore.styleParams.spacing
                  const clipHeight = (slot.height / 100) * (stageConfig.height - canvasStore.styleParams.padding.top - canvasStore.styleParams.padding.bottom) - canvasStore.styleParams.spacing
                  const radius = canvasStore.styleParams.borderRadius

                  ctx.beginPath()
                  if (radius > 0) {
                    // 圆角矩形裁剪
                    ctx.moveTo(radius, 0)
                    ctx.lineTo(clipWidth - radius, 0)
                    ctx.quadraticCurveTo(clipWidth, 0, clipWidth, radius)
                    ctx.lineTo(clipWidth, clipHeight - radius)
                    ctx.quadraticCurveTo(clipWidth, clipHeight, clipWidth - radius, clipHeight)
                    ctx.lineTo(radius, clipHeight)
                    ctx.quadraticCurveTo(0, clipHeight, 0, clipHeight - radius)
                    ctx.lineTo(0, radius)
                    ctx.quadraticCurveTo(0, 0, radius, 0)
                  } else {
                    // 矩形裁剪
                    ctx.rect(0, 0, clipWidth, clipHeight)
                  }
                  ctx.closePath()
                }
              }"
            >
              <!-- 背景事件接收器 - 几乎透明但能接收鼠标事件 -->
              <v-rect
                :config="{
                  width: (slot.width / 100) * (stageConfig.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right) - canvasStore.styleParams.spacing,
                  height: (slot.height / 100) * (stageConfig.height - canvasStore.styleParams.padding.top - canvasStore.styleParams.padding.bottom) - canvasStore.styleParams.spacing,
                  fill: 'rgba(255, 255, 255, 0.01)',
                  listening: true
                }"
                @mouseenter="handleMouseEnter(index)"
                @mouseleave="handleMouseLeave"
                @click="handleSlotTap(index)"
                @tap="handleSlotTap(index)"
              />
              <v-image
                v-if="canvasStore.imageSlots[index] && images[index]"
                :config="getImageConfig(index, slot)"
                @dragstart="(e: KonvaEventObject<DragEvent>) => handleDragStart(index, e)"
                @dragmove="(e: KonvaEventObject<DragEvent>) => handleDragMove(index, e)"
                @dragend="(e: KonvaEventObject<DragEvent>) => handleDragEnd(index, e)"
                @dragover.prevent
                @mouseenter="(e: KonvaEventObject<MouseEvent>) => {
                  e.target.getStage()!.container().style.cursor = 'grab'
                  handleMouseEnter(index)
                }"
                @mouseleave="(e: KonvaEventObject<MouseEvent>) => {
                  e.target.getStage()!.container().style.cursor = 'default'
                  handleMouseLeave()
                }"
                @mousedown="(e: KonvaEventObject<MouseEvent>) => e.target.getStage()!.container().style.cursor = 'grabbing'"
                @mouseup="(e: KonvaEventObject<MouseEvent>) => e.target.getStage()!.container().style.cursor = 'grab'"
                @click="handleSlotTap(index)"
                @tap="handleSlotTap(index)"
              />
              <v-group
                v-else
                @click="canvasStore.triggerUpload(index)"
                @tap="canvasStore.triggerUpload(index)"
                @mouseenter="(e: KonvaEventObject<MouseEvent>) => e.target.getStage()!.container().style.cursor = 'pointer'"
                @mouseleave="(e: KonvaEventObject<MouseEvent>) => e.target.getStage()!.container().style.cursor = 'default'"
              >
                <v-rect
                  :config="{
                    width: (slot.width / 100) * (stageConfig.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right) - canvasStore.styleParams.spacing,
                    height: (slot.height / 100) * (stageConfig.height - canvasStore.styleParams.padding.top - canvasStore.styleParams.padding.bottom) - canvasStore.styleParams.spacing,
                    fill: 'rgba(0,0,0,0.05)',
                    stroke: 'rgba(0,0,0,0.2)',
                    strokeWidth: 2,
                    dash: [10, 5],
                    cornerRadius: canvasStore.styleParams.borderRadius
                  }"
                />
                <v-path
                  :config="{
                    data: 'M 12 6 L 12 18 M 6 12 L 18 12',
                    stroke: 'rgba(0,0,0,0.3)',
                    strokeWidth: 2,
                    x: ((slot.width / 100) * (stageConfig.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right) - canvasStore.styleParams.spacing) / 2,
                    y: ((slot.height / 100) * (stageConfig.height - canvasStore.styleParams.padding.top - canvasStore.styleParams.padding.bottom) - canvasStore.styleParams.spacing) / 2,
                    offsetX: 12,
                    offsetY: 12,
                    scaleX: 1.5,
                    scaleY: 1.5
                  }"
                />
                <v-text
                  :config="{
                    text: '点击添加图片',
                    x: 0,
                    y: ((slot.height / 100) * (stageConfig.height - canvasStore.styleParams.padding.top - canvasStore.styleParams.padding.bottom) - canvasStore.styleParams.spacing) / 2 + 20,
                    width: (slot.width / 100) * (stageConfig.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right) - canvasStore.styleParams.spacing,
                    align: 'center',
                    fill: 'rgba(0,0,0,0.45)',
                    fontSize: 14
                  }"
                />
              </v-group>

              <!-- 现代化图片控制面板 -->
              <v-group v-if="canvasStore.imageSlots[index] && (isMobile ? activeIndex === index : hoveredIndex === index)"
                @click="(e: any) => { e.cancelBubble = true }"
                @tap="(e: any) => { e.cancelBubble = true }"
              >
                <!-- 控制面板背景 - 简约设计 -->
                <v-rect
                  :config="{
                    x: (slot.width / 100) * (stageConfig.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right) - canvasStore.styleParams.spacing - 52,
                    y: 6,
                    width: 44,
                    height: 194, // 增加高度以容纳新按钮
                    fill: 'rgba(255, 255, 255, 0.9)',
                    cornerRadius: 22,
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                    shadowBlur: 12,
                    shadowOffsetY: 4,
                    shadowOffsetX: 0,
                  }"
                />

                <!-- 放大按钮 - 现代渐变设计 -->
                <v-group
                  :config="{
                    x: (slot.width / 100) * (stageConfig.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right) - canvasStore.styleParams.spacing - 30,
                    y: 22,
                  }"
                  @click="canvasStore.zoomInImage(index)"
                  @tap="canvasStore.zoomInImage(index)"
                  @mouseenter="(e: KonvaEventObject<MouseEvent>) => {
                    e.target.getStage()!.container().style.cursor = 'pointer'
                    handleMouseEnter(index)
                  }"
                  @mouseleave="(e: KonvaEventObject<MouseEvent>) => {
                    e.target.getStage()!.container().style.cursor = 'default'
                    handleMouseLeave()
                  }"
                >
                  <!-- 按钮背景 - 简约设计 -->
                  <v-circle
                    :config="{
                      radius: 14,
                      fill: 'rgba(0, 0, 0, 0.7)',
                      shadowColor: 'rgba(0, 0, 0, 0.15)',
                      shadowBlur: 8,
                      shadowOffsetY: 2,
                    }"
                  />
                  <!-- 放大图标 - 精致设计 -->
                  <v-path
                    :config="{
                      data: 'M -4 0 L 4 0 M 0 -4 L 0 4',
                      stroke: 'white',
                      strokeWidth: 2.5,
                      strokeLineCap: 'round',
                    }"
                  />
                </v-group>

                <!-- 缩小按钮 - 现代橙色渐变 -->
                <v-group
                  :config="{
                    x: (slot.width / 100) * (stageConfig.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right) - canvasStore.styleParams.spacing - 30,
                    y: 52,
                  }"
                  @click="canvasStore.zoomOutImage(index)"
                  @tap="canvasStore.zoomOutImage(index)"
                  @mouseenter="(e: KonvaEventObject<MouseEvent>) => {
                    e.target.getStage()!.container().style.cursor = 'pointer'
                    handleMouseEnter(index)
                  }"
                  @mouseleave="(e: KonvaEventObject<MouseEvent>) => {
                    e.target.getStage()!.container().style.cursor = 'default'
                    handleMouseLeave()
                  }"
                >
                  <!-- 按钮背景 - 简约设计 -->
                  <v-circle
                    :config="{
                      radius: 14,
                      fill: 'rgba(0, 0, 0, 0.7)',
                      shadowColor: 'rgba(0, 0, 0, 0.15)',
                      shadowBlur: 8,
                      shadowOffsetY: 2,
                    }"
                  />
                  <!-- 缩小图标 - 精致设计 -->
                  <v-path
                    :config="{
                      data: 'M -4 0 L 4 0',
                      stroke: 'white',
                      strokeWidth: 2.5,
                      strokeLineCap: 'round',
                    }"
                  />
                </v-group>

                <!-- 平移模式切换按钮 - 现代紫色渐变 -->
                <v-group
                  :config="{
                    x: (slot.width / 100) * (stageConfig.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right) - canvasStore.styleParams.spacing - 30,
                    y: 82,
                  }"
                  @click="panMode = !panMode"
                  @tap="panMode = !panMode"
                  @mouseenter="(e: KonvaEventObject<MouseEvent>) => {
                    e.target.getStage()!.container().style.cursor = 'pointer'
                    handleMouseEnter(index)
                  }"
                  @mouseleave="(e: KonvaEventObject<MouseEvent>) => {
                    e.target.getStage()!.container().style.cursor = 'default'
                    handleMouseLeave()
                  }"
                >
                  <!-- 按钮背景 - 简约设计 -->
                  <v-circle
                    :config="{
                      radius: 14,
                      fill: panMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)',
                      shadowColor: 'rgba(0, 0, 0, 0.15)',
                      shadowBlur: 8,
                      shadowOffsetY: 2,
                    }"
                  />
                  <!-- 平移图标 - 简单四向箭头 -->
                  <v-path
                    :config="{
                      data: 'M 0 -4 L 0 4 M -4 0 L 4 0',
                      stroke: 'white',
                      strokeWidth: 2,
                      strokeLineCap: 'round'
                    }"
                  />
                  <!-- 箭头头部 -->
                  <v-path
                    :config="{
                      data: 'M -1 -3 L 0 -4 L 1 -3 M -1 3 L 0 4 L 1 3 M -3 -1 L -4 0 L -3 1 M 3 -1 L 4 0 L 3 1',
                      stroke: 'white',
                      strokeWidth: 2,
                      strokeLineCap: 'round',
                      strokeLineJoin: 'round'
                    }"
                  />
                </v-group>

                <!-- 还原按钮 - 现代蓝色渐变 -->
                <v-group
                  :config="{
                    x: (slot.width / 100) * (stageConfig.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right) - canvasStore.styleParams.spacing - 30,
                    y: 112,
                  }"
                  @click="canvasStore.resetImageTransform(index)"
                  @tap="canvasStore.resetImageTransform(index)"
                  @mouseenter="(e: KonvaEventObject<MouseEvent>) => {
                    e.target.getStage()!.container().style.cursor = 'pointer'
                    handleMouseEnter(index)
                  }"
                  @mouseleave="(e: KonvaEventObject<MouseEvent>) => {
                    e.target.getStage()!.container().style.cursor = 'default'
                    handleMouseLeave()
                  }"
                >
                  <!-- 按钮背景 - 简约设计 -->
                  <v-circle
                    :config="{
                      radius: 14,
                      fill: 'rgba(0, 0, 0, 0.7)',
                      shadowColor: 'rgba(0, 0, 0, 0.15)',
                      shadowBlur: 8,
                      shadowOffsetY: 2,
                    }"
                  />
                  <!-- 还原图标 - 刷新符号 -->
                  <v-path
                    :config="{
                      data: 'M -3 0 A 3 3 0 1 1 3 0',
                      stroke: 'white',
                      strokeWidth: 2.5,
                      strokeLineCap: 'round'
                    }"
                  />
                  <!-- 刷新箭头 -->
                  <v-path
                    :config="{
                      data: 'M 1 -2 L 3 0 L 1 2',
                      stroke: 'white',
                      strokeWidth: 2.5,
                      strokeLineCap: 'round',
                      strokeLineJoin: 'round'
                    }"
                  />
                </v-group>

                <!-- 显示模式切换按钮 - 现代紫色渐变 -->
                <v-group
                  :config="{
                    x: (slot.width / 100) * (stageConfig.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right) - canvasStore.styleParams.spacing - 30,
                    y: 142,
                  }"
                  @click="canvasStore.toggleImageDisplayMode(index)"
                  @tap="canvasStore.toggleImageDisplayMode(index)"
                  @mouseenter="(e: KonvaEventObject<MouseEvent>) => {
                    e.target.getStage()!.container().style.cursor = 'pointer'
                    handleMouseEnter(index)
                  }"
                  @mouseleave="(e: KonvaEventObject<MouseEvent>) => {
                    e.target.getStage()!.container().style.cursor = 'default'
                    handleMouseLeave()
                  }"
                >
                  <!-- 按钮背景 - 根据当前模式改变颜色 -->
                  <v-circle
                    :config="{
                      radius: 14,
                      fill: (canvasStore.imageSlots[index]?.transform?.displayMode || 'stretch') === 'original'
                        ? 'rgba(34, 197, 94, 0.8)'
                        : 'rgba(168, 85, 247, 0.8)',
                      shadowColor: 'rgba(0, 0, 0, 0.15)',
                      shadowBlur: 8,
                      shadowOffsetY: 2,
                    }"
                  />
                  <!-- 显示模式图标 - 根据当前模式切换 -->
                  <v-path
                    v-if="(canvasStore.imageSlots[index]?.transform?.displayMode || 'stretch') === 'stretch'"
                    :config="{
                      data: 'M -4 -4 L 4 -4 L 4 4 L -4 4 Z M -2 -2 L 2 -2 L 2 2 L -2 2 Z',
                      fill: 'white',
                      strokeWidth: 0,
                    }"
                  />
                  <v-path
                    v-else
                    :config="{
                      data: 'M -4 -4 L 4 -4 L 4 4 L -4 4 Z',
                      stroke: 'white',
                      strokeWidth: 1.5,
                      fill: 'transparent'
                    }"
                  />
                  <v-rect
                    v-if="(canvasStore.imageSlots[index]?.transform?.displayMode || 'stretch') === 'original'"
                    :config="{
                      x: -2,
                      y: -2,
                      width: 4,
                      height: 4,
                      fill: 'white'
                    }"
                  />
                </v-group>

                <!-- 删除按钮 - 现代红色渐变 -->
              <v-group
                :config="{
                    x: (slot.width / 100) * (stageConfig.width - canvasStore.styleParams.padding.left - canvasStore.styleParams.padding.right) - canvasStore.styleParams.spacing - 30,
                    y: 172,
                }"
                @click="canvasStore.removeImage(index)"
                @tap="canvasStore.removeImage(index)"
                  @mouseenter="(e: KonvaEventObject<MouseEvent>) => {
                    e.target.getStage()!.container().style.cursor = 'pointer'
                    handleMouseEnter(index)
                  }"
                  @mouseleave="(e: KonvaEventObject<MouseEvent>) => {
                    e.target.getStage()!.container().style.cursor = 'default'
                    handleMouseLeave()
                  }"
                >
                  <!-- 按钮背景 - 简约设计 -->
                <v-circle
                  :config="{
                      radius: 14,
                      fill: 'rgba(239, 68, 68, 0.8)',
                      shadowColor: 'rgba(0, 0, 0, 0.15)',
                      shadowBlur: 8,
                      shadowOffsetY: 2,
                    }"
                  />
                  <!-- 删除图标 - 精致的X -->
                <v-path
                  :config="{
                      data: 'M -3 -3 L 3 3 M 3 -3 L -3 3',
                    stroke: 'white',
                      strokeWidth: 2.5,
                      strokeLineCap: 'round',
                  }"
                />
                </v-group>
              </v-group>
            </v-group>
          </template>
        </v-layer>
        <!-- 水印层 -->
        <v-layer ref="watermarkLayerRef" v-if="canvasStore.watermark.enabled && canvasStore.watermark.text">
          <!-- 平铺模式 -->
          <v-group
            v-if="canvasStore.watermark.mode === 'tile'"
            :config="{
              x: stageConfig.width / 2,
              y: stageConfig.height / 2,
              rotation: canvasStore.watermark.rotation
            }"
          >
            <template v-for="(row, rIdx) in 20" :key="'r'+rIdx">
              <template v-for="(col, cIdx) in 20" :key="'c'+cIdx">
                <v-text
                  :config="{
                    text: canvasStore.watermark.text,
                    x: (cIdx - 10) * getWMSpacingX(),
                    y: (rIdx - 10) * getWMSpacingY(),
                    fontSize: canvasStore.watermark.fontSize,
                    fill: `rgba(0,0,0,${canvasStore.watermark.opacity})`,
                  }"
                />
              </template>
            </template>
          </v-group>
          <!-- 单个模式 -->
           <v-text v-if="canvasStore.watermark.mode === 'single'" :config="getSingleWatermarkConfig()" />
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>
