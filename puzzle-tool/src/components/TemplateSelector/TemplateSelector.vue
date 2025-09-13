<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useTemplateStore } from '@/stores/template'
import { useAppStore } from '@/stores/app'
import TemplateItem from './TemplateItem.vue'
import { trackEvent } from '@/analytics/umami'

const templateStore = useTemplateStore()
const appStore = useAppStore()

const activeImageCount = ref<number>(templateStore.availableImageCounts[0] || 2)
const scrollContainerRef = ref<HTMLElement | null>(null)
const groupRefs = ref<Map<number, HTMLElement>>(new Map())
let observer: IntersectionObserver | null = null

const setGroupRef = (el: any, count: number) => {
  if (el) {
    groupRefs.value.set(count, el)
  }
}

function selectTemplate(id: string, imageCount: number) {
  templateStore.setTemplate(id)
  appStore.showSuccess('模板已应用', '新的布局已在画布上更新。')
  // 分析埋点：模板选择
  const tpl = templateStore.templates[imageCount]?.templates?.find(t => t.id === id)
  trackEvent('template_selected', {
    templateId: id,
    imageCount: imageCount,
    name: tpl?.name
  })
  // 移动端：选择模板后自动关闭抽屉
  if (window.innerWidth < 1024) {
    appStore.closeTemplates()
  }
}

function scrollToGroup(count: number) {
  const element = groupRefs.value.get(count)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  const options = {
    root: scrollContainerRef.value,
    rootMargin: '0px',
    threshold: 0.5 // 当元素50%可见时触发
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const count = Number(entry.target.getAttribute('data-count'))
        if (count) {
          activeImageCount.value = count
        }
      }
    })
  }, options)

  groupRefs.value.forEach(el => {
    observer?.observe(el)
  })
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 顶部导航 -->
    <div class="px-4 pt-4 pb-2">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">图片数量</h3>
      <div class="relative">
        <div class="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            v-for="count in templateStore.availableImageCounts"
            :key="`btn-${count}`"
            @click="scrollToGroup(count)"
            :class="[
              'px-4 py-2 text-sm font-semibold rounded-[9px] transition-all duration-200 whitespace-nowrap',
              activeImageCount === count
                ? 'bg-primary-500 text-white shadow'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            {{ count }} 张
          </button>
        </div>
      </div>
    </div>

    <!-- 模板列表 -->
    <div ref="scrollContainerRef" class="flex-1 min-h-0 overflow-y-auto px-4 space-y-6">
      <div 
        v-for="count in templateStore.availableImageCounts"
        :key="`group-${count}`"
        :ref="(el) => setGroupRef(el, count)"
        :data-count="count"
        class="pt-2"
      >
        <div class="relative py-2">
          <hr class="absolute top-1/2 -translate-y-1/2 w-full border-t border-gray-200 dark:border-gray-700" />
          <h4 class="relative text-center bg-gray-100 dark:bg-gray-800 px-2 w-fit mx-auto">
            <span class="text-xl font-bold text-gray-800 dark:text-gray-200">{{ count }}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-1">张</span>
          </h4>
        </div>

        <div class="grid grid-cols-2 gap-2.5 mt-2">
          <TemplateItem
            v-for="template in templateStore.templates[count]?.templates"
            :key="template.id"
            :template="template"
            :is-selected="templateStore.currentTemplateId === template.id"
            @select="selectTemplate(template.id, count)"
          />
        </div>
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

/* 确保 sticky-header 背景与容器背景一致 */
.sticky {
  /* backdrop-filter: blur(5px); */ /* 可选：添加模糊效果 */
}
</style>
