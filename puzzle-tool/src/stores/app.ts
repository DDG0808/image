import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppState } from '@/types'

export const useAppStore = defineStore('app', () => {
  // 状态
  const currentStep = ref<AppState['currentStep']>('template')
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isMobile = ref(false)
  const sidebarOpen = ref(true)
  const isTemplatesOpen = ref(false)
  const isParametersOpen = ref(false)
  const isHelpModalOpen = ref(false)
  const isAboutModalOpen = ref(false)
  
  // 计算属性
  const canGoNext = computed(() => {
    // 根据当前步骤判断是否可以进入下一步
    switch (currentStep.value) {
      case 'template':
        return true // 总是可以选择模板后进入上传步骤
      case 'upload':
        return true // 假设总是可以进入编辑步骤
      case 'edit':
        return true // 总是可以进入导出步骤
      case 'export':
        return false // 导出是最后一步
      default:
        return false
    }
  })

  const canGoPrevious = computed(() => {
    return currentStep.value !== 'template'
  })

  const stepIndex = computed(() => {
    const steps = ['template', 'upload', 'edit', 'export']
    return steps.indexOf(currentStep.value)
  })

  const progress = computed(() => {
    return ((stepIndex.value + 1) / 4) * 100
  })

  // 方法
  const setCurrentStep = (step: AppState['currentStep']) => {
    currentStep.value = step
    clearError()
  }

  const nextStep = () => {
    if (!canGoNext.value) return
    
    const steps: AppState['currentStep'][] = ['template', 'upload', 'edit', 'export']
    const currentIndex = steps.indexOf(currentStep.value)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const previousStep = () => {
    if (!canGoPrevious.value) return
    
    const steps: AppState['currentStep'][] = ['template', 'upload', 'edit', 'export']
    const currentIndex = steps.indexOf(currentStep.value)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const jumpToStep = (step: AppState['currentStep']) => {
    setCurrentStep(step)
  }

  // 加载状态管理
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
    if (loading) {
      clearError()
    }
  }

  const startLoading = () => setLoading(true)
  const stopLoading = () => setLoading(false)

  // 错误管理
  const setError = (message: string) => {
    error.value = message
    isLoading.value = false
  }

  const clearError = () => {
    error.value = null
  }

  // 响应式设计相关
  const setMobile = (mobile: boolean) => {
    isMobile.value = mobile
    // 移动端默认关闭侧边栏
    if (mobile) {
      sidebarOpen.value = false
    }
  }

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const closeSidebar = () => {
    sidebarOpen.value = false
  }

  const openSidebar = () => {
    sidebarOpen.value = true
  }

  // Drawer a11y
  const openTemplates = () => isTemplatesOpen.value = true
  const closeTemplates = () => isTemplatesOpen.value = false
  const openParameters = () => isParametersOpen.value = true
  const closeParameters = () => isParametersOpen.value = false

  const openHelpModal = () => isHelpModalOpen.value = true
  const closeHelpModal = () => isHelpModalOpen.value = false
  const openAboutModal = () => isAboutModalOpen.value = true
  const closeAboutModal = () => isAboutModalOpen.value = false

  // 通知管理
  const notifications = ref<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
  }>>([])

  const addNotification = (notification: {
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
  }) => {
    const id = `notification_${Date.now()}`
    notifications.value.push({
      id,
      duration: 5000, // 默认5秒
      ...notification
    })

    // 自动移除通知
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration || 5000)
    }
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  // 快捷方法
  const showSuccess = (title: string, message?: string) => {
    addNotification({ type: 'success', title, message })
  }

  const showError = (title: string, message?: string) => {
    addNotification({ type: 'error', title, message, duration: 8000 })
  }

  const showWarning = (title: string, message?: string) => {
    addNotification({ type: 'warning', title, message })
  }

  const showInfo = (title: string, message?: string) => {
    addNotification({ type: 'info', title, message })
  }

  // 初始化方法
  const init = () => {
    // 检测是否为移动设备
    const checkMobile = () => {
      setMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }

  return {
    // 状态
    currentStep,
    isLoading,
    error,
    isMobile,
    sidebarOpen,
    notifications,
    isTemplatesOpen,
    isParametersOpen,
    isHelpModalOpen,
    isAboutModalOpen,
    // 计算属性
    canGoNext,
    canGoPrevious,
    stepIndex,
    progress,
    // 步骤管理
    setCurrentStep,
    nextStep,
    previousStep,
    jumpToStep,
    // 加载状态
    setLoading,
    startLoading,
    stopLoading,
    // 错误管理
    setError,
    clearError,
    // 响应式
    setMobile,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    openTemplates,
    closeTemplates,
    openParameters,
    closeParameters,
    openHelpModal,
    closeHelpModal,
    openAboutModal,
    closeAboutModal,
    // 通知
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    // 初始化
    init
  }
})