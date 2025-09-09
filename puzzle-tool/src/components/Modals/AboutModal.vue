<script setup lang="ts">
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'
import { XMarkIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const socialLinks = [
  {
    name: 'Bilibili',
    href: 'https://space.bilibili.com/388035025',
  },
  {
    name: '小红书',
    href: 'https://www.xiaohongshu.com/user/profile/6507395700000000120060b3',
  },
]
</script>

<template>
  <TransitionRoot appear :show="appStore.isAboutModalOpen" as="template">
    <Dialog as="div" @close="appStore.closeAboutModal" class="relative z-50">
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
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 text-left align-middle shadow-xl transition-all">
              <button @click="appStore.closeAboutModal" class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <XMarkIcon class="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>

              <div class="flex flex-col items-center text-center">
                <div class="p-3 bg-gradient-purple rounded-xl">
                  <PhotoIcon class="w-8 h-8 text-white" />
                </div>
                <DialogTitle as="h3" class="mt-4 text-2xl font-bold leading-6 text-gray-900 dark:text-white">
                  在线拼图工具
                </DialogTitle>
                <p class="mt-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  作者：豆豆哥
                </p>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  一个简洁、强大的在线拼图工具，释放您的创造力。
                </p>

                <div class="mt-8 w-full border-t border-gray-200 dark:border-gray-700"></div>

                <p class="mt-8 text-sm font-medium text-gray-700 dark:text-gray-300">关注我们</p>
                <div class="mt-4 flex justify-center gap-6">
                  <a v-for="link in socialLinks" :key="link.name" :href="link.href" target="_blank" rel="noopener noreferrer" class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                    {{ link.name }}
                  </a>
                </div>
              </div>

               <div class="mt-8 text-center">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-primary-100 dark:bg-primary-900/50 px-6 py-2 text-sm font-medium text-primary-900 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 transition-colors"
                  @click="appStore.closeAboutModal"
                >
                  关闭
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
