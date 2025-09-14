<script setup lang="ts">
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'
import {
  XMarkIcon,
  CursorArrowRaysIcon,
  CloudArrowUpIcon,
  PaintBrushIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/vue/24/outline'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const helpSteps = [
  {
    icon: CursorArrowRaysIcon,
    title: '选择模板',
    description: '从左侧模板库中选择一个您喜欢的拼图布局开始创作。',
  },
  {
    icon: CloudArrowUpIcon,
    title: '上传图片',
    description: '点击底部“上传”按钮，或将图片直接拖拽到画布的虚线框中。',
  },
  {
    icon: PaintBrushIcon,
    title: '调整画布',
    description: '在右侧参数面板中，您可以精细调整画布的宽高比、边距、圆角和背景色。',
  },
  {
    icon: MagnifyingGlassPlusIcon,
    title: '编辑图片',
    description: '鼠标悬停在图片上，即可使用悬浮工具栏进行缩放、平移、重置或删除该图片。',
  },
  {
    icon: ArrowDownTrayIcon,
    title: '导出作品',
    description: '完成创作后，点击右下角“导出”按钮，设置参数后即可保存您的作品。',
  },
]
</script>

<template>
  <TransitionRoot appear :show="appStore.isHelpModalOpen" as="template">
    <Dialog as="div" @close="appStore.closeHelpModal" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 text-left align-middle shadow-xl transition-all">
              <DialogTitle as="h3" class="text-2xl font-bold leading-6 text-gray-900 dark:text-white">
                使用帮助
              </DialogTitle>
              <button @click="appStore.closeHelpModal" class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <XMarkIcon class="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>

              <div class="mt-6 space-y-6">
                <div v-for="(step, index) in helpSteps" :key="index" class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                    <component :is="step.icon" class="w-6 h-6 text-primary-500 dark:text-primary-400" />
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-800 dark:text-gray-100">{{ step.title }}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ step.description }}</p>
                  </div>
                </div>
              </div>

              <div class="mt-8 text-center">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-primary-100 dark:bg-primary-900/50 px-6 py-2 text-sm font-medium text-primary-900 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 transition-colors"
                  @click="appStore.closeHelpModal"
                >
                  我知道了
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
