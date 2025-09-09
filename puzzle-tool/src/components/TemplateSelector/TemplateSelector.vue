<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTemplateStore } from '@/stores/template'
import { useCanvasStore } from '@/stores/canvas'
import { useAppStore } from '@/stores/app'
import TemplateItem from './TemplateItem.vue'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import { trackEvent } from '@/analytics/umami'

const templateStore = useTemplateStore()
const canvasStore = useCanvasStore()
const appStore = useAppStore()

const selectedImageCount = ref<number>(canvasStore.imageSlots.filter(Boolean).length || 2)

const currentTemplates = computed(() => {
  return templateStore.templates[selectedImageCount.value]?.templates || []
})

function selectTemplate(id: string) {
  templateStore.setTemplate(id)
  appStore.showSuccess('模板已应用', '新的布局已在画布上更新。')
  // 分析埋点：模板选择
  const tpl = templateStore.templates[selectedImageCount.value]?.templates?.find(t => t.id === id)
  trackEvent('template_selected', {
    templateId: id,
    imageCount: selectedImageCount.value,
    name: tpl?.name
  })
}

function handleCountSelection(count: number) {
  selectedImageCount.value = count
  // 自动选择该数量下的第一个模板
  const firstTemplate = currentTemplates.value[0]
  if (firstTemplate) {
    selectTemplate(firstTemplate.id)
  }
}
</script>

<template>
  <div class="flex flex-col h-full space-y-4">
    <div>
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">图片数量</h3>
      <div class="relative">
        <div class="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin">
          <button
            v-for="count in templateStore.availableImageCounts"
            :key="count"
            @click="handleCountSelection(count)"
            :class="[
              'px-4 py-2 text-sm font-semibold rounded-[9px] transition-all duration-200 whitespace-nowrap',
              selectedImageCount === count
                ? 'bg-primary-500 text-white shadow'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            {{ count }} 张
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto -mx-4 px-4">
      <div v-if="currentTemplates.length > 0" class="grid grid-cols-2 gap-3">
        <TemplateItem
          v-for="template in currentTemplates"
          :key="template.id"
          :template="template"
          :is-selected="templateStore.currentTemplateId === template.id"
          @select="selectTemplate(template.id)"
        />
      </div>
      <div v-else class="text-center py-10">
        <p class="text-gray-500">没有找到该数量的模板。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #a0aec0 #edf2f7;
}
.dark .scrollbar-thin {
  scrollbar-color: #4a5568 #2d3748;
}
.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 20px;
}
.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}
</style>