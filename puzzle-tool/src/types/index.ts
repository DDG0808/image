// 模板相关类型定义
export interface LayoutConfig {
  x: number
  y: number
  width: number
  height: number
  zIndex: number
}

export interface Template {
  id: string
  name: string
  imageCount: number
  layout: LayoutConfig[]
  aspectRatio: string
  thumbnail: string
  category?: string
}

export interface TemplateGroup {
  count: number
  templates: Template[]
}

// 图片变换相关类型定义
export interface ImageTransform {
  scale: number    // 缩放比例，1.0为原始大小
  offsetX: number  // X轴偏移量（像素）
  offsetY: number  // Y轴偏移量（像素）
}

// 图片相关类型定义
export interface ImageFile {
  id: string
  file: File
  url: string
  width: number
  height: number
  size: number
  transform?: ImageTransform  // 可选的变换属性
}

export interface ImagePosition {
  imageId: string
  layoutIndex: number
  x: number
  y: number
  scale: number
  rotation: number
}

// Canvas相关类型定义
export type ExportFormat = 'image/jpeg' | 'image/png'

export interface CanvasConfig {
  width: number
  height: number
  aspectRatio: string
  backgroundColor: string
  padding: number
  borderRadius: number
}

export interface ExportOptions {
  format: ExportFormat
  quality: number // For JPEG, 0-1
  pixelRatio: number // 1x, 2x, 3x etc.
  filename: string
}

// 应用状态类型定义
export interface AppState {
  currentStep: 'template' | 'upload' | 'edit' | 'export'
  isLoading: boolean
  error: string | null
}

// 参数调整相关类型
export interface StyleParams {
  spacing: number
  borderRadius: number
  backgroundColor: string
  opacity: number
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

// 事件类型定义
export interface TemplateChangeEvent {
  template: Template
}

export interface ImageUploadEvent {
  images: ImageFile[]
}

export interface ParameterUpdateEvent {
  params: StyleParams
}

// 工具类型
export type AspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | 'custom'

export type ImageFormat = 'jpg' | 'png' | 'webp'

export type ExportQuality = 'original' | 'high' | 'medium' | 'low'

// 水印相关类型
export type WatermarkDensity = 'sparse' | 'medium' | 'dense'

export type WatermarkPosition = 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right'

export interface WatermarkOptions {
  enabled: boolean
  mode: 'tile' | 'single'
  text: string
  fontSize: number
  opacity: number // 0~1
  rotation: number // 角度
  density: WatermarkDensity
  position: WatermarkPosition
}