<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCanvasStore } from '@/stores/canvas'
import { useAppStore } from '@/stores/app'
import { trackEvent } from '@/analytics/umami'
import {
  Cog6ToothIcon,
  ArrowsPointingOutIcon,
  PaintBrushIcon,
  ArrowUturnLeftIcon,
  ChevronDownIcon,
  PhotoIcon
} from '@heroicons/vue/24/outline'

const canvasStore = useCanvasStore()
const appStore = useAppStore()

// 宽高比选项
const aspectRatioOptions = [
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' }
]

// 背景颜色预设
const backgroundColors = [
  '#ffffff', '#f1f5f9', '#e2e8f0',
  '#0f172a', '#1e293b', '#334155',
  '#f87171', '#fb923c', '#facc15', '#4ade80',
  '#60a5fa', '#a78bfa', '#f472b6', '#2dd4bf'
]

// 当前样式参数
const styleParams = computed(() => canvasStore.styleParams)
const canvasConfig = computed(() => canvasStore.canvasConfig)
const watermark = computed(() => canvasStore.watermark)

// 折叠控制
const isCanvasSettingsOpen = ref(true)
const isStyleAdjustmentsOpen = ref(true)
const isImageSettingsOpen = ref(true)
const isWatermarkOpen = ref(true)

// 水印位置选项
const positionOptions: { value: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right'; title: string }[] = [
  { value: 'top-left', title: '左上' },
  { value: 'top-right', title: '右上' },
  { value: 'center', title: '居中' },
  { value: 'bottom-left', title: '左下' },
  { value: 'bottom-right', title: '右下' }
]

// 更新间距
const updateSpacing = (value: number) => {
  canvasStore.updateStyleParams({ spacing: value })
}

// 更新圆角
const updateBorderRadius = (value: number) => {
  canvasStore.updateStyleParams({ borderRadius: value })
}

// 更新背景颜色
const updateBackgroundColor = (color: string) => {
  canvasStore.updateStyleParams({ backgroundColor: color })
}

// 更新宽高比
const updateAspectRatio = (ratio: string) => {
  canvasStore.setAspectRatio(ratio)
  appStore.showInfo('比例已更新', `画布比例已调整为 ${ratio}`)
  // 分析埋点：比例变更
  trackEvent('aspect_ratio_changed', { ratio })
}

// 批量设置图片显示模式
const setAllImagesDisplayMode = (mode: 'stretch' | 'original') => {
  const hasImages = canvasStore.imageSlots.some(slot => slot !== null)
  if (!hasImages) {
    appStore.showInfo('设置失败', '请先添加图片')
    return
  }

  // 使用新的方法，既设置图片又保存偏好
  canvasStore.setAllImagesDisplayModeAndDefault(mode)

  const modeText = mode === 'stretch' ? '拉伸填充' : '原始大小'
  appStore.showSuccess('设置成功', `已将所有图片设置为${modeText}模式，并保存为默认偏好`)

  // 分析埋点：显示模式变更
  trackEvent('image_display_mode_changed', { mode, scope: 'all' })
}

// 重置参数
const resetParams = () => {
  canvasStore.updateStyleParams({
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
  canvasStore.updateWatermark({
    enabled: false,
    text: '',
    fontSize: 20,
    opacity: 0.25,
    rotation: 45,
    density: 'medium'
  })

  // 重置所有图片显示模式为拉伸
  canvasStore.imageSlots.forEach((slot, index) => {
    if (slot) {
      canvasStore.setImageDisplayMode(index, 'stretch')
    }
  })

  appStore.showSuccess('参数已重置', '所有参数已恢复为默认值')
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex-1 overflow-y-auto -mr-4 pr-2 space-y-8">
      <!-- 画布设置 -->
      <div>
        <div class="mb-3 flex items-center justify-between select-none cursor-pointer" @click="isCanvasSettingsOpen = !isCanvasSettingsOpen">
          <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
          <ArrowsPointingOutIcon class="w-5 h-5"/>
          画布设置
        </h4>
          <ChevronDownIcon class="w-5 h-5 transition-transform text-gray-400" :class="isCanvasSettingsOpen ? 'rotate-0' : '-rotate-90'" />
        </div>
        
        <!-- 宽高比选择 -->
        <div v-show="isCanvasSettingsOpen">
          <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            宽高比
          </label>
           <div class="grid grid-cols-5 gap-1 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
            <button
              v-for="option in aspectRatioOptions"
              :key="option.value"
              @click="updateAspectRatio(option.value)"
              class="px-2 py-2 text-center rounded-md text-sm transition-colors duration-200"
              :class="[
                canvasConfig.aspectRatio === option.value
                  ? 'bg-white dark:bg-gray-900/50 shadow text-primary-500 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- 样式调整 -->
      <div>
        <div class="mb-3 flex items-center justify-between select-none cursor-pointer" @click="isStyleAdjustmentsOpen = !isStyleAdjustmentsOpen">
          <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
          <PaintBrushIcon class="w-5 h-5"/>
          样式调整
        </h4>
          <ChevronDownIcon class="w-5 h-5 transition-transform text-gray-400" :class="isStyleAdjustmentsOpen ? 'rotate-0' : '-rotate-90'" />
        </div>
        
        <div v-show="isStyleAdjustmentsOpen" class="space-y-4">
        <!-- 间距调节 -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
              <label class="text-xs font-medium text-gray-500 dark:text-gray-400">图片间距</label>
            <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ styleParams.spacing }}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            :value="styleParams.spacing"
            @input="updateSpacing(parseInt(($event.target as HTMLInputElement).value))"
            class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <!-- 圆角调节 -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <label class="text-xs font-medium text-gray-500 dark:text-gray-400">圆角</label>
            <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ styleParams.borderRadius }}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            :value="styleParams.borderRadius"
            @input="updateBorderRadius(parseInt(($event.target as HTMLInputElement).value))"
            class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

          <!-- 边框调节 -->
          <div class="mb-6">
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">边框间距</label>
            <div class="space-y-3">
              <div class="flex items-center gap-4">
                <label class="w-10 text-xs text-gray-500 dark:text-gray-400">上</label>
                <input type="range" min="0" max="100" :value="styleParams.padding.top" @input="canvasStore.updateStyleParams({ padding: { ...styleParams.padding, top: parseInt(($event.target as HTMLInputElement).value) } })" class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider" />
                <span class="text-xs w-8 text-right font-mono">{{ styleParams.padding.top }}px</span>
              </div>
              <div class="flex items-center gap-4">
                <label class="w-10 text-xs text-gray-500 dark:text-gray-400">右</label>
                <input type="range" min="0" max="100" :value="styleParams.padding.right" @input="canvasStore.updateStyleParams({ padding: { ...styleParams.padding, right: parseInt(($event.target as HTMLInputElement).value) } })" class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider" />
                <span class="text-xs w-8 text-right font-mono">{{ styleParams.padding.right }}px</span>
              </div>
              <div class="flex items-center gap-4">
                <label class="w-10 text-xs text-gray-500 dark:text-gray-400">下</label>
                <input type="range" min="0" max="100" :value="styleParams.padding.bottom" @input="canvasStore.updateStyleParams({ padding: { ...styleParams.padding, bottom: parseInt(($event.target as HTMLInputElement).value) } })" class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider" />
                <span class="text-xs w-8 text-right font-mono">{{ styleParams.padding.bottom }}px</span>
              </div>
              <div class="flex items-center gap-4">
                <label class="w-10 text-xs text-gray-500 dark:text-gray-400">左</label>
                <input type="range" min="0" max="100" :value="styleParams.padding.left" @input="canvasStore.updateStyleParams({ padding: { ...styleParams.padding, left: parseInt(($event.target as HTMLInputElement).value) } })" class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider" />
                <span class="text-xs w-8 text-right font-mono">{{ styleParams.padding.left }}px</span>
              </div>
            </div>
          </div>


        <!-- 背景颜色 -->
        <div>
          <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            背景颜色
          </label>
          <div class="grid grid-cols-7 gap-2 mb-3">
            <button
              v-for="color in backgroundColors"
              :key="color"
              @click="updateBackgroundColor(color)"
              class="w-full aspect-square rounded-full border-2 transition-all duration-200 hover:scale-110"
              :class="[
                styleParams.backgroundColor === color 
                  ? 'border-primary-500 ring-2 ring-primary-500/30' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              ]"
              :style="{ backgroundColor: color }"
              :title="color"
            />
             <!-- 自定义颜色选择器 -->
              <div class="relative w-full aspect-square">
                <label
                  class="w-full h-full rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 overflow-hidden"
                  :class="[
                    !backgroundColors.includes(styleParams.backgroundColor)
                    ? 'border-primary-500 ring-2 ring-primary-500/30'
                    : 'border-gray-300 dark:border-gray-600'
                  ]"
                  :for="'color-picker-input'"
                >
                  <div
                    class="w-full h-full rounded-full"
                    :style="{ backgroundColor: !backgroundColors.includes(styleParams.backgroundColor) ? styleParams.backgroundColor : 'transparent' }"
                  >
                    <div
                      v-if="backgroundColors.includes(styleParams.backgroundColor)"
                      class="w-full h-full rounded-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500"
                    ></div>
                  </div>
                </label>
            <input
                  id="color-picker-input"
              type="color"
              :value="styleParams.backgroundColor"
              @input="updateBackgroundColor(($event.target as HTMLInputElement).value)"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 图片设置 -->
      <div>
        <div class="mb-3 flex items-center justify-between select-none cursor-pointer" @click="isImageSettingsOpen = !isImageSettingsOpen">
          <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <PhotoIcon class="w-5 h-5"/>
            图片设置
          </h4>
          <ChevronDownIcon class="w-5 h-5 transition-transform text-gray-400" :class="isImageSettingsOpen ? 'rotate-0' : '-rotate-90'" />
        </div>

        <div v-show="isImageSettingsOpen" class="space-y-4 p-3 rounded-md bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/50">
          <div>
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">显示模式</label>
            <div class="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <button
                @click="setAllImagesDisplayMode('stretch')"
                class="px-3 py-2 text-center rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                :class="[
                  'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900/50 shadow hover:bg-gray-50 dark:hover:bg-gray-800'
                ]"
                :title="'将所有图片设置为拉伸模式，图片会拉伸填满整个相框区域'"
              >
                <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1 2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2zm2 1v10h10V3H3z"/>
                  <path d="M4 4h8v8H4V4z"/>
                </svg>
                拉伸填充
              </button>
              <button
                @click="setAllImagesDisplayMode('original')"
                class="px-3 py-2 text-center rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                :class="[
                  'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900/50 shadow hover:bg-gray-50 dark:hover:bg-gray-800'
                ]"
                :title="'将所有图片设置为原图模式，按照图片原始像素大小显示，可能超出相框边界'"
              >
                <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1 2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2zm2 1v10h10V3H3z"/>
                  <path d="M6 5h4v6H6V5z"/>
                </svg>
                原始大小
              </button>
            </div>
            <div class="mt-2">
              <div class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                <div class="flex items-start gap-1 mb-1">
                  <span class="font-medium">拉伸填充：</span>
                  <span>图片会拉伸填满整个相框，可能会改变原始比例</span>
                </div>
                <div class="flex items-start gap-1">
                  <span class="font-medium">原始大小：</span>
                  <span>按照图片原始像素尺寸显示，可能超出相框边界</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 水印配置 -->
      <div>
        <div class="mb-3 flex items-center justify-between select-none cursor-pointer" @click="isWatermarkOpen = !isWatermarkOpen">
          <h4 class="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <Cog6ToothIcon class="w-5 h-5"/>
            水印配置
          </h4>
          <ChevronDownIcon class="w-5 h-5 transition-transform text-gray-400" :class="isWatermarkOpen ? 'rotate-0' : '-rotate-90'" />
        </div>

        <div v-show="isWatermarkOpen" class="space-y-4 p-3 rounded-md bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/50">
          
          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">启用图片水印</span>
            <div class="relative inline-flex items-center">
              <input 
                type="checkbox" 
                :checked="watermark.enabled" 
                @change="canvasStore.updateWatermark({ enabled: ($event.target as HTMLInputElement).checked })" 
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
            </div>
          </label>

          <div class="space-y-4" :class="!watermark.enabled && 'opacity-50 pointer-events-none transition-opacity'">
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 pt-2">水印文字</label>
            <input
              type="text"
              :value="watermark.text"
              @input="canvasStore.updateWatermark({ text: ($event.target as HTMLInputElement).value })"
              placeholder="例如：豆豆哥出品"
              class="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />

            <div class="grid grid-cols-2 gap-x-4 gap-y-3">
               <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="text-xs font-medium text-gray-500 dark:text-gray-400">字号</label>
                  <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ watermark.fontSize }}px</span>
                </div>
                <input type="range" min="10" max="80" step="1" :value="watermark.fontSize" @input="canvasStore.updateWatermark({ fontSize: parseInt(($event.target as HTMLInputElement).value) })" class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider" />
              </div>
               <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="text-xs font-medium text-gray-500 dark:text-gray-400">透明度</label>
                  <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ watermark.opacity }}</span>
                </div>
                <input type="range" min="0" max="1" step="0.01" :value="watermark.opacity" @input="canvasStore.updateWatermark({ opacity: parseFloat(($event.target as HTMLInputElement).value) })" class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider" />
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="text-xs font-medium text-gray-500 dark:text-gray-400">旋转角度</label>
                <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ watermark.rotation }}°</span>
              </div>
              <input type="range" min="-90" max="90" step="1" :value="watermark.rotation" @input="canvasStore.updateWatermark({ rotation: parseInt(($event.target as HTMLInputElement).value) })" class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider" />
            </div>

            <div class="pt-2 space-y-3">
              <div>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">水印密度 (平铺)</label>
                <div class="grid grid-cols-3 gap-1 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                  <button
                    class="px-2 py-1.5 rounded-md text-xs"
                    :class="watermark.mode === 'tile' && watermark.density === 'sparse' ? 'bg-white dark:bg-gray-900/50 shadow text-primary-500 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'"
                    @click="canvasStore.updateWatermark({ mode: 'tile', density: 'sparse' })"
                  >稀疏</button>
                  <button
                    class="px-2 py-1.5 rounded-md text-xs"
                    :class="watermark.mode === 'tile' && watermark.density === 'medium' ? 'bg-white dark:bg-gray-900/50 shadow text-primary-500 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'"
                    @click="canvasStore.updateWatermark({ mode: 'tile', density: 'medium' })"
                  >中等</button>
                  <button
                    class="px-2 py-1.5 rounded-md text-xs"
                    :class="watermark.mode === 'tile' && watermark.density === 'dense' ? 'bg-white dark:bg-gray-900/50 shadow text-primary-500 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'"
                    @click="canvasStore.updateWatermark({ mode: 'tile', density: 'dense' })"
                  >密集</button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">水印位置 (单个)</label>
                <div class="grid grid-cols-5 gap-1 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                  <button v-for="pos in positionOptions" :key="pos.value"
                    class="py-1.5 rounded-md flex items-center justify-center"
                    :title="pos.title"
                    :class="watermark.mode === 'single' && watermark.position === pos.value ? 'bg-white dark:bg-gray-900/50 shadow text-primary-500' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'"
                    @click="canvasStore.updateWatermark({ mode: 'single', position: pos.value })"
                  >
                    <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path v-if="pos.value === 'top-left'" d="M6 6h1v6H6V6zm1-1h6v1H7V5z"/>
                      <path v-if="pos.value === 'top-right'" d="M14 6h-1v6h1V6zm-1-1h-6v1h6V5z"/>
                      <path v-if="pos.value === 'center'" d="M9 9h2v2H9V9z"/>
                      <path v-if="pos.value === 'bottom-left'" d="M6 14h1V8H6v6zm1 1h6v-1H7v1z"/>
                      <path v-if="pos.value === 'bottom-right'" d="M14 14h-1V8h1v6zm-1 1h-6v-1h6v1z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
      <button 
        @click="resetParams"
        class="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg text-gray-600 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
      >
        <ArrowUturnLeftIcon class="w-4 h-4"/>
        重置所有参数
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 自定义滑块样式 */
.slider {
  --thumb-color: #a855f7;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 18px;
  width: 18px;
  border-radius: 9999px;
  background: var(--thumb-color);
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-top: -8px;
}
.dark .slider::-webkit-slider-thumb {
  border-color: #334155;
}
.slider::-moz-range-thumb {
  height: 18px;
  width: 18px;
  border-radius: 9999px;
  background: var(--thumb-color);
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.dark .slider::-moz-range-thumb {
   border-color: #334155;
}
</style>