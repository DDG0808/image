<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useDark, useToggle, useWindowSize } from '@vueuse/core'
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverPanel,
  RadioGroup,
  RadioGroupLabel,
  RadioGroupOption,
} from '@headlessui/vue'
import {
  ArrowDownTrayIcon,
  Bars3Icon,
  Cog6ToothIcon,
  PhotoIcon,
  SunIcon,
  MoonIcon,
  TrashIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline'
import ImageUploader from '@/components/ImageUploader/ImageUploader.vue'
import type { UploaderExpose } from '@/components/ImageUploader/ImageUploader.vue'
import { useAppStore } from '@/stores/app'
import { useCanvasStore } from '@/stores/canvas'
import type { ExportFormat } from '@/types'
import HelpModal from '@/components/Modals/HelpModal.vue'
import AboutModal from '@/components/Modals/AboutModal.vue'
import Logo from '@/components/Logo.vue'

const appStore = useAppStore()
const canvasStore = useCanvasStore()
const isDark = useDark()
const toggleDark = useToggle(isDark)
const { width } = useWindowSize()

const uploader = ref<UploaderExpose | null>(null)

// 监听屏幕宽度变化，确保在切换到PC布局时关闭抽屉
watch(width, (newWidth) => {
  if (newWidth >= 1024) {
    appStore.closeTemplates()
    appStore.closeParameters()
  }
})

onMounted(() => {
  if (uploader.value) {
    canvasStore.setUploader(uploader.value)
  }
})

function handleUploadClick() {
  const firstEmptySlot = canvasStore.imageSlots.findIndex(slot => !slot)
  if (firstEmptySlot !== -1) {
    canvasStore.triggerUpload(firstEmptySlot)
  } else {
    appStore.showWarning('没有空位了', '所有图片位置都已填满。')
  }
}

function handleExportClick() {
  try {
    const dataUrl = canvasStore.exportCanvas()
    if (dataUrl) {
      const link = document.createElement('a')
      link.href = dataUrl
      const extension = canvasStore.exportOptions.format === 'image/png' ? 'png' : 'jpg'
      link.download = `${canvasStore.exportOptions.filename}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      appStore.showSuccess('导出成功', '拼图已保存到您的设备')
    }
  } catch (error) {
    console.error('Export error:', error)
    appStore.showError('导出失败', '导出过程中发生错误')
  }
}

function handleClearCanvas() {
  canvasStore.clearImages()
  appStore.showInfo('画布已清空', '所有图片已从画布中移除。')
}

const qualityOptions = [
  { name: '高清 JPG', description: '推荐，最佳质量和文件大小平衡', format: 'image/jpeg' as ExportFormat, quality: 0.95 },
  { name: '标准 JPG', description: '适合网络分享，文件更小', format: 'image/jpeg' as ExportFormat, quality: 0.85 },
  { name: '无损 PNG', description: '最高质量，保留透明度，文件较大', format: 'image/png' as ExportFormat, quality: 1.0 }
]

const resolutionOptions = [
  { name: '1x', description: '标准分辨率', value: 1 },
  { name: '2x', description: '高清分辨率 (推荐)', value: 2 },
  { name: '3x', description: '超高分辨率', value: 3 }
]

function updateQuality(option: { format: ExportFormat, quality: number }) {
  canvasStore.updateExportOptions({ format: option.format, quality: option.quality })
}
</script>

<template>
  <div class="h-screen w-full flex flex-col font-sans bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
    <ImageUploader ref="uploader" />
    <HelpModal />
    <AboutModal />

    <!-- Header -->
    <header class="flex-shrink-0 w-full h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50 backdrop-blur-sm z-20">
      <div class="flex items-center gap-3">
        <Logo class="h-8 w-8" />
        <h1 class="text-xl font-bold tracking-tight">在线拼图工具</h1>
      </div>
      <div class="hidden md:flex items-center gap-2">
        <button @click="appStore.openHelpModal" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <QuestionMarkCircleIcon class="w-6 h-6" />
        </button>
        <button @click="appStore.openAboutModal" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <InformationCircleIcon class="w-6 h-6" />
        </button>
        <button @click="toggleDark()" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <SunIcon v-if="isDark" class="w-6 h-6" />
          <MoonIcon v-else class="w-6 h-6" />
        </button>
        <a
          href="https://txc.qq.com/products/776962"
          target="_blank"
          rel="noopener noreferrer"
          class="px-3 py-1.5 rounded-full transition-colors text-sm font-medium bg-primary-500/90 text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 shadow-sm"
          title="反馈"
        >反馈</a>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex min-h-0">
      <!-- Desktop Layout -->
      <aside class="hidden lg:flex w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex-col">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">选择模板</h2>
        </div>
        <div class="flex-1 min-h-0 overflow-y-auto p-4">
          <slot name="templates"></slot>
        </div>
      </aside>

      <div class="flex-1 flex flex-col">
        <main class="flex-1 min-h-0">
          <slot name="main"></slot>
        </main>
        <!-- Desktop Action Console -->
        <footer class="hidden lg:flex flex-shrink-0 w-full h-20 items-center justify-center gap-4 px-4 bg-white/50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700/50 backdrop-blur-sm">
          <div class="flex items-center gap-2 sm:gap-4">
            <button @click="handleUploadClick" :disabled="canvasStore.imageSlots.every(slot => !!slot)" class="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-all duration-200 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50">
              <PhotoIcon class="w-6 h-6"/>
              <span class="text-xs sm:text-sm font-medium">上传</span>
            </button>

            <button @click="handleClearCanvas" :disabled="!canvasStore.hasImages" class="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50">
              <TrashIcon class="w-6 h-6"/>
              <span class="text-xs sm:text-sm font-medium">清空</span>
            </button>
          </div>

          <!-- Mobile drawer buttons -->
          <div class="hidden items-center gap-2 sm:gap-4 lg:hidden">
            <button @click="appStore.openTemplates" class="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50">
              <Bars3Icon class="w-6 h-6"/>
              <span class="text-xs sm:text-sm font-medium">模板</span>
            </button>
            <button @click="appStore.openParameters" class="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50">
              <Cog6ToothIcon class="w-6 h-6"/>
              <span class="text-xs sm:text-sm font-medium">调整</span>
            </button>
          </div>

          <div class="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-2 hidden sm:block"></div>

          <div class="flex items-center gap-1">
            <Popover v-slot="{ open }" class="relative">
              <PopoverButton :class="open ? '' : 'text-opacity-90'" class="p-3 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors">
                <Cog6ToothIcon class="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </PopoverButton>
              <transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="translate-y-1 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="translate-y-0 opacity-100"
                leave-to-class="translate-y-1 opacity-0"
              >
                <PopoverPanel class="absolute bottom-full right-0 mb-3 w-80 sm:w-96 z-10 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div class="space-y-4">
                    <div>
                      <label class="text-sm font-medium text-gray-700 dark:text-gray-200">文件名</label>
                      <input type="text" v-model="canvasStore.exportOptions.filename" class="mt-1 block w-full px-3 py-2 text-sm bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>

                    <RadioGroup :model-value="qualityOptions.find(o => o.format === canvasStore.exportOptions.format && o.quality === canvasStore.exportOptions.quality)" @update:model-value="updateQuality">
                      <RadioGroupLabel class="text-sm font-medium text-gray-700 dark:text-gray-200">图片质量</RadioGroupLabel>
                      <div class="mt-2 space-y-2">
                        <RadioGroupOption
                          v-for="option in qualityOptions"
                          :key="option.name"
                          :value="option"
                          v-slot="{ active, checked }"
                        >
                          <div :class="[active ? 'ring-2 ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400' : '']" class="relative flex cursor-pointer rounded-lg p-3 bg-gray-100/50 dark:bg-gray-700/50 focus:outline-none">
                            <div class="flex w-full items-center justify-between">
                              <div class="flex items-center">
                                <div class="text-sm">
                                  <RadioGroupLabel as="p" :class="checked ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'" class="font-medium">{{ option.name }}</RadioGroupLabel>
                                  <p :class="checked ? 'text-primary-600 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'" class="text-xs">{{ option.description }}</p>
                                </div>
                              </div>
                              <div v-show="checked" class="shrink-0 text-primary-500">
                                <CheckCircleIcon class="h-6 w-6" />
                              </div>
                            </div>
                          </div>
                        </RadioGroupOption>
                      </div>
                    </RadioGroup>

                    <RadioGroup v-model="canvasStore.exportOptions.pixelRatio">
                      <RadioGroupLabel class="text-sm font-medium text-gray-700 dark:text-gray-200">分辨率</RadioGroupLabel>
                       <div class="mt-2 grid grid-cols-3 gap-2">
                        <RadioGroupOption
                          v-for="option in resolutionOptions"
                          :key="option.name"
                          :value="option.value"
                          v-slot="{ active, checked }"
                        >
                          <div :class="[active ? 'ring-2 ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400' : '', checked ? 'bg-primary-500/80 text-white' : 'bg-gray-100/50 dark:bg-gray-700/50']" class="cursor-pointer rounded-lg p-3 text-center">
                            <p class="font-bold">{{ option.name }}</p>
                            <p class="text-xs">{{ option.description }}</p>
                          </div>
                        </RadioGroupOption>
                      </div>
                    </RadioGroup>

                  </div>
                </PopoverPanel>
              </transition>
            </Popover>

            <button @click="handleExportClick" class="px-5 py-3 bg-gradient-purple text-white font-bold rounded-[9px] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2" :disabled="!canvasStore.hasImages">
              <ArrowDownTrayIcon class="w-5 h-5"/>
              <span class="text-sm">导出</span>
            </button>
          </div>
        </footer>

        <!-- Mobile Bottom Bar -->
        <footer class="lg:hidden flex-shrink-0 w-full h-16 flex items-center justify-between px-2 bg-white/95 dark:bg-gray-900/70 border-t border-gray-200 dark:border-gray-700/50 backdrop-blur supports-[backdrop-filter]:bg-white/70" :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }">
          <button @click="handleUploadClick" :disabled="canvasStore.imageSlots.every(slot => !!slot)" class="flex-1 h-full flex flex-col items-center justify-center gap-1 text-gray-600 dark:text-gray-300 disabled:opacity-40">
            <PhotoIcon class="w-6 h-6" />
            <span class="text-xs">上传</span>
          </button>
          <button @click="handleClearCanvas" :disabled="!canvasStore.hasImages" class="flex-1 h-full flex flex-col items-center justify-center gap-1 text-gray-600 dark:text-gray-300 disabled:opacity-40">
            <TrashIcon class="w-6 h-6" />
            <span class="text-xs">清空</span>
          </button>
          <button @click="appStore.openTemplates" class="flex-1 h-full flex flex-col items-center justify-center gap-1 text-gray-600 dark:text-gray-300">
            <Bars3Icon class="w-6 h-6" />
            <span class="text-xs">模板</span>
          </button>
          <button @click="appStore.openParameters" class="flex-1 h-full flex flex-col items-center justify-center gap-1 text-gray-600 dark:text-gray-300">
            <Cog6ToothIcon class="w-6 h-6" />
            <span class="text-xs">调整</span>
          </button>
          <button @click="handleExportClick" :disabled="!canvasStore.hasImages" class="flex-1 h-full flex flex-col items-center justify-center gap-1 text-primary-600 dark:text-primary-400 disabled:opacity-40">
            <ArrowDownTrayIcon class="w-6 h-6" />
            <span class="text-xs">导出</span>
          </button>
        </footer>
      </div>

      <aside class="hidden lg:flex w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 flex-col">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">参数调整</h2>
        </div>
        <div class="flex-1 min-h-0 overflow-y-auto p-4">
          <slot name="parameters"></slot>
        </div>
      </aside>
    </div>

    <!-- Drawers for Mobile -->
    <!-- Template Drawer as Bottom Sheet on Mobile -->
    <TransitionRoot as="template" :show="appStore.isTemplatesOpen && width < 1024">
      <Dialog as="div" class="relative z-30 lg:hidden" @close="appStore.closeTemplates">
        <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" />
        </TransitionChild>
        <div class="fixed inset-0 overflow-hidden">
          <div class="absolute inset-0 overflow-hidden">
            <!-- Bottom sheet container -->
            <div class="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center">
              <TransitionChild as="template" enter="transform transition ease-in-out duration-300 sm:duration-500" enter-from="translate-y-full" enter-to="translate-y-0" leave="transform transition ease-in-out duration-300 sm:duration-500" leave-from="translate-y-0" leave-to="translate-y-full">
                <DialogPanel class="pointer-events-auto w-screen max-w-xl h-[85vh] bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl flex flex-col">
                  <div class="w-full h-1.5 rounded-full bg-gray-300/70 dark:bg-gray-700 mx-auto mt-3 mb-2 max-w-[60px]" />
                  <div class="flex-1 min-h-0 overflow-y-auto p-4 pb-6">
                    <slot name="templates"></slot>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Parameter Drawer -->
    <TransitionRoot as="template" :show="appStore.isParametersOpen && width < 1024">
      <Dialog as="div" class="relative z-30 lg:hidden" @close="appStore.closeParameters">
        <TransitionChild as="template" enter="ease-in-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-300" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" />
        </TransitionChild>
        <div class="fixed inset-0 overflow-hidden">
          <div class="absolute inset-0 overflow-hidden">
            <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild as="template" enter="transform transition ease-in-out duration-300 sm:duration-500" enter-from="translate-x-full" enter-to="translate-x-0" leave="transform transition ease-in-out duration-300 sm:duration-500" leave-from="translate-x-0" leave-to="translate-x-full">
                <DialogPanel class="pointer-events-auto w-screen max-w-md flex flex-col h-full bg-white dark:bg-gray-800">
                  <div class="flex-1 min-h-0 overflow-y-auto p-6">
                    <slot name="parameters"></slot>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<style scoped>
/* Responsive layout styles */
@media (max-width: 768px) {
  .sidebar-mobile {
    transform: translateX(-100%);
  }
  
  .sidebar-mobile.open {
    transform: translateX(0);
  }
}
</style>
