<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { trackEvent } from '@/analytics/umami'
import AppLayout from '@/components/AppLayout.vue'
import TemplateSelector from '@/components/TemplateSelector/TemplateSelector.vue'
import ImageUploader from '@/components/ImageUploader/ImageUploader.vue'
import Canvas from '@/components/Canvas/Canvas.vue'
import ParameterPanel from '@/components/ParameterPanel/ParameterPanel.vue'

const appStore = useAppStore()

// 根据当前步骤决定显示哪个组件
const currentComponent = computed(() => {
  switch (appStore.currentStep) {
    case 'template':
      return TemplateSelector
    case 'upload':
      return ImageUploader
    case 'edit':
      return Canvas
    case 'export':
      return Canvas // 导出步骤也显示Canvas
    default:
      return TemplateSelector
  }
})

const showParameterPanel = computed(() => {
  return appStore.currentStep === 'edit' || appStore.currentStep === 'export'
})

const steps = ['template', 'upload', 'edit', 'export'] as const

const handleStepClick = (index: number) => {
  if (index <= appStore.stepIndex) {
    const target = steps[index]
    const from = steps[appStore.stepIndex]
    appStore.jumpToStep(target)
    // 分析埋点：步骤导航（点击步骤条）
    trackEvent('step_navigation', {
      from,
      to: target,
      action: 'jump'
    })
  }
}

function trackNextStep() {
  trackEvent('step_navigation', {
    from: steps[appStore.stepIndex],
    to: steps[Math.min(appStore.stepIndex + 1, steps.length - 1)],
    action: 'next'
  })
  appStore.nextStep()
}

function trackPreviousStep() {
  trackEvent('step_navigation', {
    from: steps[appStore.stepIndex],
    to: steps[Math.max(appStore.stepIndex - 1, 0)],
    action: 'previous'
  })
  appStore.previousStep()
}
</script>

<template>
  <AppLayout>
    <!-- 左侧面板：模板选择或参数面板 -->
    <template #sidebar>
      <TemplateSelector v-if="appStore.currentStep === 'template'" />
      <ParameterPanel v-else-if="showParameterPanel" />
      <div v-else class="p-4">
        <!-- 其他步骤的侧边栏内容 -->
      </div>
    </template>

    <!-- 主要内容区域 -->
    <template #main>
      <div class="h-full flex flex-col">
        <!-- 现代化步骤指示器 -->
        <div class="glass-card m-6 mb-0 p-6 border-b border-white/10">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-purple rounded-xl flex items-center justify-center">
                <span class="text-white text-lg">🧩</span>
              </div>
              <div>
                <h1 class="text-xl font-bold text-white">
                  在线拼图工具
                </h1>
                <p class="text-white/60 text-sm">
                  创建精美的图片拼图，轻松分享美好回忆
                </p>
              </div>
            </div>
            
            <!-- 步骤计数器 -->
            <div class="glass-card p-3 text-center">
              <div class="text-lg font-bold text-white">
                {{ appStore.stepIndex + 1 }}<span class="text-white/60 text-sm">/4</span>
              </div>
              <div class="text-xs text-white/60 mt-1">步骤</div>
            </div>
          </div>
          
          <!-- 现代化进度指示器 -->
          <div class="flex items-center justify-between mb-6">
            <div 
              v-for="(step, index) in [
                { name: '模板选择', icon: '📐' },
                { name: '图片上传', icon: '📸' },
                { name: '编辑调整', icon: '🎨' },
                { name: '导出保存', icon: '💾' }
              ]"
              :key="step.name"
              class="flex items-center"
              :class="{ 'flex-1': index < 3 }"
            >
              <div class="flex flex-col items-center">
                <!-- 步骤图标 -->
                <div 
                  class="step-indicator group cursor-pointer"
                  :class="{
                    'active': index === appStore.stepIndex,
                    'completed': index < appStore.stepIndex,
                    'inactive': index > appStore.stepIndex
                  }"
                  @click="handleStepClick(index)"
                >
                  <span class="text-lg">{{ step.icon }}</span>
                  <div 
                    v-if="index < appStore.stepIndex"
                    class="absolute inset-0 bg-gradient-success rounded-full flex items-center justify-center"
                  >
                    <span class="text-white text-sm">✓</span>
                  </div>
                </div>
                
                <!-- 步骤标签 -->
                <span 
                  class="mt-2 text-xs font-medium text-center transition-colors"
                  :class="{
                    'text-white': index <= appStore.stepIndex,
                    'text-white/40': index > appStore.stepIndex
                  }"
                >
                  {{ step.name }}
                </span>
              </div>
              
              <!-- 连接线 -->
              <div 
                v-if="index < 3"
                class="step-connector flex-1 mx-6"
                :class="{ 'active': index < appStore.stepIndex }"
              />
            </div>
          </div>
          
          <!-- 动画进度条 -->
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${appStore.progress}%` }"
            />
          </div>
        </div>

        <!-- 动态内容区域 -->
        <div class="flex-1 m-6 mt-4 glass-card overflow-hidden">
          <div class="h-full relative">
            <Transition name="page" mode="out-in">
              <component :is="currentComponent" :key="appStore.currentStep" />
            </Transition>
          </div>
        </div>

        <!-- 现代化底部操作栏 -->
        <div class="glass-card m-6 mt-0 p-6 border-t border-white/10">
          <div class="flex justify-between items-center">
            <button 
              v-if="appStore.canGoPrevious"
              @click="trackPreviousStep"
              class="btn-secondary group"
            >
              <span class="mr-2 transition-transform group-hover:-translate-x-1">←</span>
              上一步
            </button>
            <div v-else class="w-20" />

            <div class="flex items-center gap-4">
              <!-- 当前步骤提示 -->
              <div class="text-center">
                <div class="text-white/60 text-xs">当前步骤</div>
                <div class="text-white font-medium text-sm">
                  {{ ['模板选择', '图片上传', '编辑调整', '导出保存'][appStore.stepIndex] }}
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex gap-3">
                <button 
                  v-if="appStore.canGoNext"
                  @click="trackNextStep"
                  class="btn-primary group"
                >
                  下一步
                  <span class="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </button>
                
                <button 
                  v-if="appStore.currentStep === 'export'"
                  class="btn-success group"
                  @click="trackEvent('export_clicked')"
                >
                  <span class="mr-2">🚀</span>
                  导出拼图
                  <div class="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppLayout>
</template>

<style scoped>
/* 页面过渡动画 */
.page-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.page-leave-active {
  transition: all 0.3s ease-in;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
}

/* 步骤指示器增强 */
.step-indicator {
  position: relative;
  overflow: hidden;
}

.step-indicator::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.step-indicator:hover::before {
  opacity: 1;
}

.step-indicator.active::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B5CF6, #A855F7);
  z-index: -1;
  animation: pulse-ring 2s ease-in-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* 按钮增强效果 */
.btn-success {
  position: relative;
  overflow: hidden;
}

.btn-success::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.6s ease;
  transform: translate(-50%, -50%);
}

.btn-success:hover::before {
  width: 300px;
  height: 300px;
}
</style>