import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { allTemplates, templatesByCount, defaultTemplate } from '@/assets/templates/presets'
import { logger } from '@/utils'
import type { Template } from '@/types'

export const useTemplateStore = defineStore('template', () => {
  const currentTemplateId = ref<string | null>(null)
  const templates = ref(templatesByCount)

  const availableImageCounts = computed(() => {
    return Object.keys(templates.value).map(Number).sort((a, b) => a - b)
  })

  const currentTemplate = computed<Template | null>(() => {
    if (!currentTemplateId.value) return null
    // This looks over ALL templates to find the one with the matching ID
    const template = allTemplates.find(t => t.id === currentTemplateId.value)
    return template || null
  })

  function setTemplate(id: string) {
    logger.log('TemplateStore', '🎨 设置模板', { templateId: id })
    
    const template = allTemplates.find(t => t.id === id)
    if (template) {
      currentTemplateId.value = id
      logger.log('TemplateStore', '✅ 模板设置成功', {
        templateName: template.name,
        imageCount: template.imageCount
      })
    } else {
      logger.error('TemplateStore', '❌ 未找到模板', { templateId: id })
    }
  }

  // 自动选择默认模板
  setTemplate(defaultTemplate.id)

  return {
    currentTemplateId,
    templates,
    availableImageCounts,
    currentTemplate,
    setTemplate
  }
})