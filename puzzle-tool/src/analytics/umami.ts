// 轻量 Umami 封装模块
// 目标：
// - 通过动态插入 <script> 的方式按需加载追踪脚本，避免阻塞与侵入
// - 对外仅暴露 initUmami / trackEvent / trackPageview，保持主代码整洁
// - 支持 DEV 环境的 Dry Run（只打印日志，不发送请求），便于本地验证
// 参考：
// - Tracker 配置: https://umami.is/docs/tracker-configuration
// - 事件上报: https://umami.is/docs/track-events

declare global {
  interface Window {
    umami?: {
      track: (
        event: string | ((props: Record<string, unknown>) => Record<string, unknown>),
        data?: Record<string, unknown>
      ) => Promise<void> | void
    }
  }
}

/**
 * Umami 初始化可选参数
 * - scriptUrl: 追踪脚本地址（默认使用你提供的 mean.orm.li）
 * - websiteId: 后台创建的网站 ID，用于归属数据
 * - hostUrl: 上报接口域名，通常与脚本同域，也可显式指定
 * - autoTrack: 是否启用 Umami 内置自动追踪（我们在 main.ts 中选择关闭，转为手动上报）
 * - respectDNT: 是否尊重浏览器 DNT 设置（生产默认开启，DEV 可关闭以便验证）
 * - excludeHash / excludeSearch: 是否忽略 URL hash / querystring，减少噪声
 */
interface InitOptions {
  scriptUrl?: string
  websiteId: string
  hostUrl?: string
  autoTrack?: boolean
  respectDNT?: boolean
  tag?: string
  excludeHash?: boolean
  excludeSearch?: boolean
}

let initialized = false
let loadingPromise: Promise<void> | null = null

// 动态加载 <script>，并附加 Umami data-* 属性
const loadScript = (src: string, attributes: Record<string, string>): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.defer = true
    script.src = src
    Object.entries(attributes).forEach(([k, v]) => script.setAttribute(k, v))
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load Umami script: ${src}`))
    document.head.appendChild(script)
  })
}

/**
 * 初始化 Umami：按需插入脚本 + 配置 data-* 属性
 * - 失败时静默降级（不会影响业务功能）
 */
export const initUmami = (options: InitOptions): Promise<void> => {
  if (initialized) return Promise.resolve()
  if (loadingPromise) return loadingPromise

  const {
    scriptUrl = 'https://mean.orm.li/script.js',
    websiteId,
    hostUrl,
    autoTrack = true,
    respectDNT = true,
    tag,
    excludeHash,
    excludeSearch
  } = options

  const attrs: Record<string, string> = {
    'data-website-id': websiteId,
  }
  if (hostUrl) attrs['data-host-url'] = hostUrl
  if (autoTrack === false) attrs['data-auto-track'] = 'false'
  if (respectDNT) attrs['data-do-not-track'] = 'true'
  if (tag) attrs['data-tag'] = tag
  if (excludeHash) attrs['data-exclude-hash'] = 'true'
  if (excludeSearch) attrs['data-exclude-search'] = 'true'

  loadingPromise = loadScript(scriptUrl, attrs).then(() => {
    initialized = true
  }).catch((err) => {
    // 静默失败，避免影响主流程
    console.warn('[Umami] init failed:', err)
  })

  return loadingPromise
}

/**
 * 上报自定义事件
 * - name: 事件名（如 image_upload_success）
 * - data: 附带的键值对（如 { slotIndex, fileType }）
 * - DEV 且 VITE_ANALYTICS_DRY_RUN=true 时仅打印日志，不真正发送
 */
export const trackEvent = (
  name: string,
  data?: Record<string, unknown>
): void => {
  try {
    if (typeof window === 'undefined') return
    const dryRun = (import.meta as unknown as { env?: { VITE_ANALYTICS_DRY_RUN?: string } }).env?.VITE_ANALYTICS_DRY_RUN === 'true'
    if (!window.umami || typeof window.umami.track !== 'function') return
    // umami.track 可以接收 (eventName, data) 或函数回调
    if (dryRun) {
      console.info('[Umami] DRY RUN: event', { name, data })
    } else {
      window.umami.track(name, data)
    }
  } catch {
    // 静默
  }
}

/**
 * 上报页面浏览（SPA 场景：首屏 + 每次路由变化）
 * - props: 可追加自定义属性
 * - DEV 且 VITE_ANALYTICS_DRY_RUN=true 时仅打印日志，不真正发送
 */
export const trackPageview = (props?: Record<string, unknown>): void => {
  try {
    if (typeof window === 'undefined') return
    const dryRun = (import.meta as unknown as { env?: { VITE_ANALYTICS_DRY_RUN?: string } }).env?.VITE_ANALYTICS_DRY_RUN === 'true'
    if (!window.umami || typeof window.umami.track !== 'function') return
    // 使用回调方式传递自定义属性，兼容最新 API
    if (dryRun) {
      console.info('[Umami] DRY RUN: pageview', props || {})
    } else {
      window.umami.track((defaultProps: Record<string, unknown>) => ({
        ...defaultProps,
        ...(props || {})
      }))
    }
  } catch {
    // 静默
  }
}

/** 检查 umami 是否已挂载（脚本加载成功且 tracker 可用） */
export const isUmamiReady = (): boolean => !!(typeof window !== 'undefined' && window.umami)


