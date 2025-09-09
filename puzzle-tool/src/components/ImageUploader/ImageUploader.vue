<script setup lang="ts">
import { ref } from 'vue'
import { useCanvasStore } from '@/stores/canvas'
import { useAppStore } from '@/stores/app'
import { logger } from '@/utils'
import { trackEvent } from '@/analytics/umami'

const canvasStore = useCanvasStore()
const appStore = useAppStore()

const fileInput = ref<HTMLInputElement>()
const currentTargetSlotIndex = ref<number | null>(null)

// 文件验证
const validateFile = (file: File): string | null => {
  const endGroup = logger.group('ImageUploader', '📋 开始文件验证', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    lastModified: new Date(file.lastModified).toLocaleString()
  })

  if (!file.type.startsWith('image/')) {
    logger.warn('ImageUploader', '❌ 文件类型验证失败', `文件类型: ${file.type}`)
    endGroup?.()
    return '请选择图片文件'
  }

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    logger.warn('ImageUploader', '❌ 文件大小验证失败', `文件大小: ${(file.size / 1024 / 1024).toFixed(2)}MB > 10MB`)
    endGroup?.()
    return '文件大小不能超过10MB'
  }

  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!supportedTypes.includes(file.type)) {
    logger.warn('ImageUploader', '❌ 文件格式验证失败', `不支持的格式: ${file.type}`)
    endGroup?.()
    return '仅支持 JPG, PNG, WebP 格式'
  }

  logger.log('ImageUploader', '✅ 文件验证通过')
  endGroup?.()
  return null
}

// 处理文件选择
const handleFileSelect = async (file: File) => {
  const endGroup = logger.group('ImageUploader', '🎯 开始处理文件选择', {
    fileName: file.name,
    targetSlotIndex: currentTargetSlotIndex.value
  })

  const error = validateFile(file)
  if (error) {
    logger.error('ImageUploader', '❌ 文件验证失败，终止处理', error)
    appStore.showError('文件验证失败', `${file.name}: ${error}`)
    endGroup?.()
    return
  }
  
  if (currentTargetSlotIndex.value === null) {
    logger.error('ImageUploader', '❌ 未指定上传位置，终止处理')
    appStore.showError('上传失败', '未指定上传位置')
    endGroup?.()
    return
  }

  try {
    logger.log('ImageUploader', '🔄 准备调用 canvasStore.addImage', {
      slotIndex: currentTargetSlotIndex.value,
      fileName: file.name
    })
    
    await canvasStore.addImage(file, currentTargetSlotIndex.value)
    
    logger.log('ImageUploader', '✅ 图片上传完成')
    appStore.showSuccess('图片上传成功', `图片已添加到指定位置`)
    // 分析埋点：上传成功
    trackEvent('image_upload_success', {
      slotIndex: currentTargetSlotIndex.value,
      fileType: file.type,
      fileSize: file.size
    })
  } catch (error) {
    logger.error('ImageUploader', '❌ 图片处理失败', error)
    appStore.showError('上传失败', '图片处理时出现错误，请重试')
    console.error('Image upload error:', error)
  }
  
  endGroup?.()
}

// 文件输入处理
const handleInputChange = (event: Event) => {
  logger.log('ImageUploader', '📁 检测到文件输入变化')
  
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    logger.log('ImageUploader', '📄 获取到文件，开始处理', {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      fileType: file.type
    })
    handleFileSelect(file)
  } else {
    logger.warn('ImageUploader', '⚠️ 未获取到文件')
  }
  
  // 重置 input 以便再次选择相同文件
  target.value = ''
  logger.log('ImageUploader', '🔄 已重置文件输入框')
}

// 打开文件选择器
const openFileDialog = (slotIndex: number) => {
  logger.log('ImageUploader', '🎯 触发文件选择器', {
    targetSlotIndex: slotIndex,
    currentSlotIndex: currentTargetSlotIndex.value
  })
  
  currentTargetSlotIndex.value = slotIndex
  
  if (fileInput.value) {
    fileInput.value.click()
    logger.log('ImageUploader', '✅ 已触发文件输入框点击')
  } else {
    logger.error('ImageUploader', '❌ 文件输入框引用不存在')
  }
}

export interface UploaderExpose {
  openFileDialog: (slotIndex: number) => void
}

defineExpose<UploaderExpose>({
  openFileDialog
})
</script>

<template>
  <div>
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="hidden"
      @change="handleInputChange"
    />
  </div>
</template>