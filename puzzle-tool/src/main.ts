import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import VueKonva from 'vue-konva'
import { initUmami, trackPageview } from './analytics/umami'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueKonva)

app.mount('#app')

// 初始化 Umami（仅生产或显式启用本地调试时），并监听路由变化上报 pageview
// 说明：
// - 生产默认启用，DEV 需通过 .env.local 设置 VITE_ENABLE_ANALYTICS_DEV=true 才会启用
// - autoTrack: false 关闭 Umami 的自动追踪，统一走我们手动的 trackPageview，避免重复上报
// - VITE_ANALYTICS_DRY_RUN=true 时仅打印日志，不发送请求，便于本地验证
// 环境变量含义：
// - VITE_ENABLE_ANALYTICS_DEV: 'true' 表示在开发环境也启用真实上报（默认不启用）
// - VITE_ANALYTICS_DRY_RUN: 'true' 表示仅打印（Dry Run），不发送网络请求（默认不启用）
if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_ANALYTICS_DEV === 'true') {
  // 与用户提供的一致的脚本地址与网站ID
  initUmami({
    scriptUrl: 'https://mean.orm.li/script.js',
    websiteId: '49db1284-7960-4ce7-bf67-5178b0186362',
    hostUrl: 'https://mean.orm.li',
    autoTrack: false,
    respectDNT: true,
    excludeHash: true
  }).then(() => {
    // Dry Run: 仅在控制台打印，不真正发送网络请求
    const dryRun = import.meta.env.VITE_ANALYTICS_DRY_RUN === 'true'
    // 本地调试时，为避免 DNT 影响，可在 env 里覆盖；此处仅打印提示
    if (import.meta.env.VITE_ENABLE_ANALYTICS_DEV === 'true' && import.meta.env.VITE_ANALYTICS_DRY_RUN !== 'true') {
      console.info('[Umami] DEV mode with real reporting enabled')
    }
    // 首次加载
    if (import.meta.env.VITE_ENABLE_ANALYTICS_DEV === 'true') {
      console.info('[Umami] init complete', { env: 'DEV', dryRun })
    }
    if (!dryRun) {
      trackPageview()
    } else {
      console.info('[Umami] DRY RUN: pageview (initial)')
    }
    // SPA 路由变更
    router.afterEach(() => {
      if (!dryRun) {
        trackPageview()
      } else {
        console.info('[Umami] DRY RUN: pageview (route change)')
      }
    })
  })
}
