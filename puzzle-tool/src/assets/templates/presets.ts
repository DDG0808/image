import type { Template, TemplateGroup } from '@/types'

// 单张图片模板
const singleImageTemplate: Template = {
  id: 'single-1',
  name: '单图',
  imageCount: 1,
  aspectRatio: '1:1',
  thumbnail: '/templates/single.svg',
  layout: [
    { x: 0, y: 0, width: 100, height: 100, zIndex: 1 }
  ]
}

// 两张图片模板
export const twoImageTemplates: Template[] = [
  {
    id: '2-horizontal',
    name: '水平分割',
    imageCount: 2,
    aspectRatio: '4:3',
    thumbnail: '/templates/2-horizontal.svg',
    layout: [
      { x: 0, y: 0, width: 50, height: 100, zIndex: 1 },
      { x: 50, y: 0, width: 50, height: 100, zIndex: 1 }
    ]
  },
  {
    id: '2-vertical',
    name: '垂直分割',
    imageCount: 2,
    aspectRatio: '3:4',
    thumbnail: '/templates/2-vertical.svg',
    layout: [
      { x: 0, y: 0, width: 100, height: 50, zIndex: 1 },
      { x: 0, y: 50, width: 100, height: 50, zIndex: 1 }
    ]
  },
  {
    id: '2-left-large',
    name: '左大右小',
    imageCount: 2,
    aspectRatio: '4:3',
    thumbnail: '/templates/2-left-large.svg',
    layout: [
      { x: 0, y: 0, width: 70, height: 100, zIndex: 1 },
      { x: 70, y: 0, width: 30, height: 100, zIndex: 1 }
    ]
  },
  {
    id: '2-right-large',
    name: '右大左小',
    imageCount: 2,
    aspectRatio: '4:3',
    thumbnail: '/templates/2-right-large.svg',
    layout: [
      { x: 0, y: 0, width: 30, height: 100, zIndex: 1 },
      { x: 30, y: 0, width: 70, height: 100, zIndex: 1 }
    ]
  },
  {
    id: '2-top-large',
    name: '上大下小',
    imageCount: 2,
    aspectRatio: '3:4',
    thumbnail: '/templates/2-top-large.svg',
    layout: [
      { x: 0, y: 0, width: 100, height: 70, zIndex: 1 },
      { x: 0, y: 70, width: 100, height: 30, zIndex: 1 }
    ]
  },
  {
    id: '2-bottom-large',
    name: '下大上小',
    imageCount: 2,
    aspectRatio: '3:4',
    thumbnail: '/templates/2-bottom-large.svg',
    layout: [
      { x: 0, y: 0, width: 100, height: 30, zIndex: 1 },
      { x: 0, y: 30, width: 100, height: 70, zIndex: 1 }
    ]
  },
  {
    id: '2-square',
    name: '正方形拼接',
    imageCount: 2,
    aspectRatio: '1:1',
    thumbnail: '/templates/2-square.svg',
    layout: [
      { x: 0, y: 0, width: 50, height: 100, zIndex: 1 },
      { x: 50, y: 0, width: 50, height: 100, zIndex: 1 }
    ]
  },
  {
    id: '2-diagonal',
    name: '对角分割',
    imageCount: 2,
    aspectRatio: '1:1',
    thumbnail: '/templates/2-diagonal.svg',
    layout: [
      { x: 0, y: 0, width: 100, height: 50, zIndex: 1 },
      { x: 0, y: 50, width: 100, height: 50, zIndex: 1 }
    ]
  }
]

// 3张图片模板
export const threeImageTemplates: Template[] = [
  {
    id: '3-horizontal',
    name: '三等分水平',
    imageCount: 3,
    aspectRatio: '16:9',
    thumbnail: '/templates/3-horizontal.svg',
    layout: [
      { x: 0, y: 0, width: 33.33, height: 100, zIndex: 1 },
      { x: 33.33, y: 0, width: 33.33, height: 100, zIndex: 1 },
      { x: 66.66, y: 0, width: 33.34, height: 100, zIndex: 1 }
    ]
  },
  {
    id: '3-vertical',
    name: '三等分垂直',
    imageCount: 3,
    aspectRatio: '9:16',
    thumbnail: '/templates/3-vertical.svg',
    layout: [
      { x: 0, y: 0, width: 100, height: 33.33, zIndex: 1 },
      { x: 0, y: 33.33, width: 100, height: 33.33, zIndex: 1 },
      { x: 0, y: 66.66, width: 100, height: 33.34, zIndex: 1 }
    ]
  },
  {
    id: '3-left-right',
    name: '左一右二',
    imageCount: 3,
    aspectRatio: '4:3',
    thumbnail: '/templates/3-left-right.svg',
    layout: [
      { x: 0, y: 0, width: 50, height: 100, zIndex: 1 },
      { x: 50, y: 0, width: 50, height: 50, zIndex: 1 },
      { x: 50, y: 50, width: 50, height: 50, zIndex: 1 }
    ]
  },
  {
    id: '3-right-left',
    name: '右一左二',
    imageCount: 3,
    aspectRatio: '4:3',
    thumbnail: '/templates/3-right-left.svg',
    layout: [
      { x: 50, y: 0, width: 50, height: 100, zIndex: 1 },
      { x: 0, y: 0, width: 50, height: 50, zIndex: 1 },
      { x: 0, y: 50, width: 50, height: 50, zIndex: 1 }
    ]
  },
  {
    id: '3-top-bottom',
    name: '上一下二',
    imageCount: 3,
    aspectRatio: '3:4',
    thumbnail: '/templates/3-top-bottom.svg',
    layout: [
      { x: 0, y: 0, width: 100, height: 50, zIndex: 1 },
      { x: 0, y: 50, width: 50, height: 50, zIndex: 1 },
      { x: 50, y: 50, width: 50, height: 50, zIndex: 1 }
    ]
  },
  {
    id: '3-bottom-top',
    name: '下一上二',
    imageCount: 3,
    aspectRatio: '3:4',
    thumbnail: '/templates/3-bottom-top.svg',
    layout: [
      { x: 0, y: 50, width: 100, height: 50, zIndex: 1 },
      { x: 0, y: 0, width: 50, height: 50, zIndex: 1 },
      { x: 50, y: 0, width: 50, height: 50, zIndex: 1 }
    ]
  },
  {
    id: '3-large-small',
    name: '一大二小',
    imageCount: 3,
    aspectRatio: '4:3',
    thumbnail: '/templates/3-large-small.svg',
    layout: [
      { x: 0, y: 0, width: 66.66, height: 100, zIndex: 1 },
      { x: 66.66, y: 0, width: 33.34, height: 50, zIndex: 1 },
      { x: 66.66, y: 50, width: 33.34, height: 50, zIndex: 1 }
    ]
  },
  {
    id: '3-pyramid',
    name: '金字塔型',
    imageCount: 3,
    aspectRatio: '4:3',
    thumbnail: '/templates/3-pyramid.svg',
    layout: [
      { x: 25, y: 0, width: 50, height: 50, zIndex: 1 },
      { x: 0, y: 50, width: 50, height: 50, zIndex: 1 },
      { x: 50, y: 50, width: 50, height: 50, zIndex: 1 }
    ]
  }
]

// 4张图片模板
export const fourImageTemplates: Template[] = [
  {
    id: '4-grid',
    name: '四宫格',
    imageCount: 4,
    aspectRatio: '1:1',
    thumbnail: '/templates/4-grid.svg',
    layout: [
      { x: 0, y: 0, width: 50, height: 50, zIndex: 1 },
      { x: 50, y: 0, width: 50, height: 50, zIndex: 1 },
      { x: 0, y: 50, width: 50, height: 50, zIndex: 1 },
      { x: 50, y: 50, width: 50, height: 50, zIndex: 1 }
    ]
  },
  {
    id: '4-horizontal',
    name: '四等分水平',
    imageCount: 4,
    aspectRatio: '16:9',
    thumbnail: '/templates/4-horizontal.svg',
    layout: [
      { x: 0, y: 0, width: 25, height: 100, zIndex: 1 },
      { x: 25, y: 0, width: 25, height: 100, zIndex: 1 },
      { x: 50, y: 0, width: 25, height: 100, zIndex: 1 },
      { x: 75, y: 0, width: 25, height: 100, zIndex: 1 }
    ]
  },
  {
    id: '4-vertical',
    name: '四等分垂直',
    imageCount: 4,
    aspectRatio: '9:16',
    thumbnail: '/templates/4-vertical.svg',
    layout: [
      { x: 0, y: 0, width: 100, height: 25, zIndex: 1 },
      { x: 0, y: 25, width: 100, height: 25, zIndex: 1 },
      { x: 0, y: 50, width: 100, height: 25, zIndex: 1 },
      { x: 0, y: 75, width: 100, height: 25, zIndex: 1 }
    ]
  },
  {
    id: '4-left-main',
    name: '左主右辅',
    imageCount: 4,
    aspectRatio: '4:3',
    thumbnail: '/templates/4-left-main.svg',
    layout: [
      { x: 0, y: 0, width: 60, height: 100, zIndex: 1 },
      { x: 60, y: 0, width: 40, height: 33.33, zIndex: 1 },
      { x: 60, y: 33.33, width: 40, height: 33.33, zIndex: 1 },
      { x: 60, y: 66.66, width: 40, height: 33.34, zIndex: 1 }
    ]
  },
  {
    id: '4-right-main',
    name: '右主左辅',
    imageCount: 4,
    aspectRatio: '4:3',
    thumbnail: '/templates/4-right-main.svg',
    layout: [
      { x: 40, y: 0, width: 60, height: 100, zIndex: 1 },
      { x: 0, y: 0, width: 40, height: 33.33, zIndex: 1 },
      { x: 0, y: 33.33, width: 40, height: 33.33, zIndex: 1 },
      { x: 0, y: 66.66, width: 40, height: 33.34, zIndex: 1 }
    ]
  },
  {
    id: '4-top-main',
    name: '上主下辅',
    imageCount: 4,
    aspectRatio: '3:4',
    thumbnail: '/templates/4-top-main.svg',
    layout: [
      { x: 0, y: 0, width: 100, height: 60, zIndex: 1 },
      { x: 0, y: 60, width: 33.33, height: 40, zIndex: 1 },
      { x: 33.33, y: 60, width: 33.33, height: 40, zIndex: 1 },
      { x: 66.66, y: 60, width: 33.34, height: 40, zIndex: 1 }
    ]
  },
  {
    id: '4-bottom-main',
    name: '下主上辅',
    imageCount: 4,
    aspectRatio: '3:4',
    thumbnail: '/templates/4-bottom-main.svg',
    layout: [
      { x: 0, y: 40, width: 100, height: 60, zIndex: 1 },
      { x: 0, y: 0, width: 33.33, height: 40, zIndex: 1 },
      { x: 33.33, y: 0, width: 33.33, height: 40, zIndex: 1 },
      { x: 66.66, y: 0, width: 33.34, height: 40, zIndex: 1 }
    ]
  },
  {
    id: '4-collage',
    name: '自由拼贴',
    imageCount: 4,
    aspectRatio: '4:3',
    thumbnail: '/templates/4-collage.svg',
    layout: [
      { x: 0, y: 0, width: 60, height: 60, zIndex: 1 },
      { x: 60, y: 0, width: 40, height: 60, zIndex: 1 },
      { x: 0, y: 60, width: 40, height: 40, zIndex: 1 },
      { x: 40, y: 60, width: 60, height: 40, zIndex: 1 }
    ]
  }
]

// 5张图片模板
export const fiveImageTemplates: Template[] = [
  {
    id: '5-cross',
    name: '十字形',
    imageCount: 5,
    aspectRatio: '1:1',
    thumbnail: '/templates/5-cross.svg',
    layout: [
      { x: 33.33, y: 0, width: 33.34, height: 33.33, zIndex: 1 },
      { x: 0, y: 33.33, width: 33.33, height: 33.34, zIndex: 1 },
      { x: 33.33, y: 33.33, width: 33.34, height: 33.34, zIndex: 1 },
      { x: 66.66, y: 33.33, width: 33.34, height: 33.34, zIndex: 1 },
      { x: 33.33, y: 66.66, width: 33.34, height: 33.34, zIndex: 1 }
    ]
  },
  {
    id: '5-left-main',
    name: '左主右辅',
    imageCount: 5,
    aspectRatio: '4:3',
    thumbnail: '/templates/5-left-main.svg',
    layout: [
      { x: 0, y: 0, width: 60, height: 100, zIndex: 1 },
      { x: 60, y: 0, width: 40, height: 25, zIndex: 1 },
      { x: 60, y: 25, width: 40, height: 25, zIndex: 1 },
      { x: 60, y: 50, width: 40, height: 25, zIndex: 1 },
      { x: 60, y: 75, width: 40, height: 25, zIndex: 1 }
    ]
  },
  {
    id: '5-right-main',
    name: '右主左辅',
    imageCount: 5,
    aspectRatio: '4:3',
    thumbnail: '/templates/5-right-main.svg',
    layout: [
      { x: 40, y: 0, width: 60, height: 100, zIndex: 1 },
      { x: 0, y: 0, width: 40, height: 25, zIndex: 1 },
      { x: 0, y: 25, width: 40, height: 25, zIndex: 1 },
      { x: 0, y: 50, width: 40, height: 25, zIndex: 1 },
      { x: 0, y: 75, width: 40, height: 25, zIndex: 1 }
    ]
  },
  {
    id: '5-top-main',
    name: '上主下辅',
    imageCount: 5,
    aspectRatio: '3:4',
    thumbnail: '/templates/5-top-main.svg',
    layout: [
      { x: 0, y: 0, width: 100, height: 60, zIndex: 1 },
      { x: 0, y: 60, width: 25, height: 40, zIndex: 1 },
      { x: 25, y: 60, width: 25, height: 40, zIndex: 1 },
      { x: 50, y: 60, width: 25, height: 40, zIndex: 1 },
      { x: 75, y: 60, width: 25, height: 40, zIndex: 1 }
    ]
  },
  {
    id: '5-center-focus',
    name: '中心焦点',
    imageCount: 5,
    aspectRatio: '1:1',
    thumbnail: '/templates/5-center-focus.svg',
    layout: [
      { x: 25, y: 25, width: 50, height: 50, zIndex: 2 },
      { x: 0, y: 0, width: 50, height: 50, zIndex: 1 },
      { x: 50, y: 0, width: 50, height: 50, zIndex: 1 },
      { x: 0, y: 50, width: 50, height: 50, zIndex: 1 },
      { x: 50, y: 50, width: 50, height: 50, zIndex: 1 }
    ]
  },
  {
    id: '5-mixed',
    name: '混合布局',
    imageCount: 5,
    aspectRatio: '4:3',
    thumbnail: '/templates/5-mixed.svg',
    layout: [
      { x: 0, y: 0, width: 50, height: 50, zIndex: 1 },
      { x: 50, y: 0, width: 25, height: 50, zIndex: 1 },
      { x: 75, y: 0, width: 25, height: 50, zIndex: 1 },
      { x: 0, y: 50, width: 33.33, height: 50, zIndex: 1 },
      { x: 33.33, y: 50, width: 66.67, height: 50, zIndex: 1 }
    ]
  }
]

// 6张图片模板
export const sixImageTemplates: Template[] = [
    {
    id: '6-grid',
    name: '六宫格',
    imageCount: 6,
    aspectRatio: '4:3',
    thumbnail: '',
    layout: [
      { x: 0, y: 0, width: 33.33, height: 50, zIndex: 1 },
      { x: 33.33, y: 0, width: 33.33, height: 50, zIndex: 1 },
      { x: 66.66, y: 0, width: 33.34, height: 50, zIndex: 1 },
      { x: 0, y: 50, width: 33.33, height: 50, zIndex: 1 },
      { x: 33.33, y: 50, width: 33.33, height: 50, zIndex: 1 },
      { x: 66.66, y: 50, width: 33.34, height: 50, zIndex: 1 }
    ]
  },
  {
    id: '6-main-bottom',
    name: '上二下四',
    imageCount: 6,
    aspectRatio: '1:1',
    thumbnail: '',
    layout: [
      { x: 0, y: 0, width: 50, height: 50, zIndex: 1 },
      { x: 50, y: 0, width: 50, height: 50, zIndex: 1 },
      { x: 0, y: 50, width: 25, height: 50, zIndex: 1 },
      { x: 25, y: 50, width: 25, height: 50, zIndex: 1 },
      { x: 50, y: 50, width: 25, height: 50, zIndex: 1 },
      { x: 75, y: 50, width: 25, height: 50, zIndex: 1 }
    ]
  },
  {
    id: '6-vertical-strip',
    name: '垂直三列',
    imageCount: 6,
    aspectRatio: '3:4',
    thumbnail: '',
    layout: [
      { x: 0, y: 0, width: 33.33, height: 100, zIndex: 1 },
      { x: 33.33, y: 0, width: 33.33, height: 50, zIndex: 1 },
      { x: 33.33, y: 50, width: 33.33, height: 50, zIndex: 1 },
      { x: 66.66, y: 0, width: 33.34, height: 33.33, zIndex: 1 },
      { x: 66.66, y: 33.33, width: 33.34, height: 33.33, zIndex: 1 },
      { x: 66.66, y: 66.66, width: 33.34, height: 33.34, zIndex: 1 }
    ]
  },
  {
    id: '6-dynamic',
    name: '动感布局',
    imageCount: 6,
    aspectRatio: '16:9',
    thumbnail: '',
    layout: [
      { x: 0, y: 0, width: 60, height: 60, zIndex: 1 },
      { x: 60, y: 0, width: 40, height: 30, zIndex: 1 },
      { x: 60, y: 30, width: 40, height: 30, zIndex: 1 },
      { x: 0, y: 60, width: 30, height: 40, zIndex: 1 },
      { x: 30, y: 60, width: 30, height: 40, zIndex: 1 },
      { x: 60, y: 60, width: 40, height: 40, zIndex: 1 }
    ]
  }
]

// 7张图片模板
export const sevenImageTemplates: Template[] = [
    {
    id: '7-main-center',
    name: '中心焦点',
    imageCount: 7,
    aspectRatio: '4:3',
    thumbnail: '',
    layout: [
      { x: 25, y: 25, width: 50, height: 50, zIndex: 2 },
      { x: 0, y: 0, width: 25, height: 50, zIndex: 1 },
      { x: 75, y: 0, width: 25, height: 50, zIndex: 1 },
      { x: 25, y: 0, width: 50, height: 25, zIndex: 1 },
      { x: 0, y: 50, width: 25, height: 50, zIndex: 1 },
      { x: 75, y: 50, width: 25, height: 50, zIndex: 1 },
      { x: 25, y: 75, width: 50, height: 25, zIndex: 1 }
    ]
  },
  {
    id: '7-gallery',
    name: '画廊风格',
    imageCount: 7,
    aspectRatio: '16:9',
    thumbnail: '',
    layout: [
      { x: 0, y: 0, width: 50, height: 100, zIndex: 1 },
      { x: 50, y: 0, width: 25, height: 50, zIndex: 1 },
      { x: 75, y: 0, width: 25, height: 50, zIndex: 1 },
      { x: 50, y: 50, width: 50, height: 50, zIndex: 1 },
      { x: 0, y: 100, width: 25, height: 0, zIndex: 1 },
      { x: 25, y: 100, width: 25, height: 0, zIndex: 1 },
      { x: 50, y: 100, width: 50, height: 0, zIndex: 1 }
    ]
  },
  {
    id: '7-main-top',
    name: '顶部焦点',
    imageCount: 7,
    aspectRatio: '4:3',
    thumbnail: '',
    layout: [
      { x: 0, y: 0, width: 100, height: 50, zIndex: 1 },
      { x: 0, y: 50, width: 33.33, height: 25, zIndex: 1 },
      { x: 33.33, y: 50, width: 33.33, height: 25, zIndex: 1 },
      { x: 66.66, y: 50, width: 33.34, height: 25, zIndex: 1 },
      { x: 0, y: 75, width: 33.33, height: 25, zIndex: 1 },
      { x: 33.33, y: 75, width: 33.33, height: 25, zIndex: 1 },
      { x: 66.66, y: 75, width: 33.34, height: 25, zIndex: 1 }
    ]
  }
]

// 8张图片模板
export const eightImageTemplates: Template[] = [
    {
    id: '8-grid',
    name: '八宫格',
    imageCount: 8,
    aspectRatio: '4:3',
    thumbnail: '',
    layout: [
      { x: 0, y: 0, width: 25, height: 50, zIndex: 1 },
      { x: 25, y: 0, width: 25, height: 50, zIndex: 1 },
      { x: 50, y: 0, width: 25, height: 50, zIndex: 1 },
      { x: 75, y: 0, width: 25, height: 50, zIndex: 1 },
      { x: 0, y: 50, width: 25, height: 50, zIndex: 1 },
      { x: 25, y: 50, width: 25, height: 50, zIndex: 1 },
      { x: 50, y: 50, width: 25, height: 50, zIndex: 1 },
      { x: 75, y: 50, width: 25, height: 50, zIndex: 1 }
    ]
  },
  {
    id: '8-diamond',
    name: '钻石布局',
    imageCount: 8,
    aspectRatio: '1:1',
    thumbnail: '',
    layout: [
      { x: 25, y: 0, width: 50, height: 25, zIndex: 1 },
      { x: 0, y: 25, width: 25, height: 50, zIndex: 1 },
      { x: 75, y: 25, width: 25, height: 50, zIndex: 1 },
      { x: 25, y: 75, width: 50, height: 25, zIndex: 1 },
      { x: 25, y: 25, width: 25, height: 25, zIndex: 2 },
      { x: 50, y: 25, width: 25, height: 25, zIndex: 2 },
      { x: 25, y: 50, width: 25, height: 25, zIndex: 2 },
      { x: 50, y: 50, width: 25, height: 25, zIndex: 2 }
    ]
  },
   {
    id: '8-story',
    name: '故事板',
    imageCount: 8,
    aspectRatio: '16:9',
    thumbnail: '',
    layout: [
      { x: 0, y: 0, width: 40, height: 100, zIndex: 1 },
      { x: 40, y: 0, width: 20, height: 50, zIndex: 1 },
      { x: 60, y: 0, width: 20, height: 50, zIndex: 1 },
      { x: 80, y: 0, width: 20, height: 50, zIndex: 1 },
      { x: 40, y: 50, width: 20, height: 50, zIndex: 1 },
      { x: 60, y: 50, width: 20, height: 50, zIndex: 1 },
      { x: 80, y: 50, width: 20, height: 50, zIndex: 1 },
      { x: 40, y: 100, width: 60, height: 0, zIndex: 1 } // Placeholder for correct layout
    ]
  }
]

// 9张图片模板
export const nineImageTemplates: Template[] = [
    {
    id: '9-grid',
    name: '九宫格',
    imageCount: 9,
    aspectRatio: '1:1',
    thumbnail: '',
    layout: [
      { x: 0, y: 0, width: 33.33, height: 33.33, zIndex: 1 },
      { x: 33.33, y: 0, width: 33.33, height: 33.33, zIndex: 1 },
      { x: 66.66, y: 0, width: 33.34, height: 33.33, zIndex: 1 },
      { x: 0, y: 33.33, width: 33.33, height: 33.34, zIndex: 1 },
      { x: 33.33, y: 33.33, width: 33.33, height: 33.34, zIndex: 1 },
      { x: 66.66, y: 33.33, width: 33.34, height: 33.34, zIndex: 1 },
      { x: 0, y: 66.67, width: 33.33, height: 33.33, zIndex: 1 },
      { x: 33.33, y: 66.67, width: 33.33, height: 33.33, zIndex: 1 },
      { x: 66.66, y: 66.67, width: 33.34, height: 33.33, zIndex: 1 }
    ]
  },
  {
    id: '9-main-center-pro',
    name: '高级中心',
    imageCount: 9,
    aspectRatio: '1:1',
    thumbnail: '',
    layout: [
      { x: 30, y: 30, width: 40, height: 40, zIndex: 2 },
      { x: 0, y: 0, width: 30, height: 30, zIndex: 1 },
      { x: 30, y: 0, width: 40, height: 30, zIndex: 1 },
      { x: 70, y: 0, width: 30, height: 30, zIndex: 1 },
      { x: 0, y: 30, width: 30, height: 40, zIndex: 1 },
      { x: 70, y: 30, width: 30, height: 40, zIndex: 1 },
      { x: 0, y: 70, width: 30, height: 30, zIndex: 1 },
      { x: 30, y: 70, width: 40, height: 30, zIndex: 1 },
      { x: 70, y: 70, width: 30, height: 30, zIndex: 1 }
    ]
  },
  {
    id: '9-diamond-pro',
    name: '菱形焦点',
    imageCount: 9,
    aspectRatio: '1:1',
    thumbnail: '',
    layout: [
      { x: 33.33, y: 0, width: 33.34, height: 33.33, zIndex: 1 },
      { x: 0, y: 33.33, width: 33.33, height: 33.34, zIndex: 1 },
      { x: 66.66, y: 33.33, width: 33.34, height: 33.34, zIndex: 1 },
      { x: 33.33, y: 66.66, width: 33.34, height: 33.34, zIndex: 1 },
      { x: 0, y: 0, width: 33.33, height: 33.33, zIndex: 1 },
      { x: 66.66, y: 0, width: 33.34, height: 33.33, zIndex: 1 },
      { x: 0, y: 66.66, width: 33.33, height: 33.34, zIndex: 1 },
      { x: 66.66, y: 66.66, width: 33.34, height: 33.34, zIndex: 1 },
      { x: 33.33, y: 33.33, width: 33.34, height: 33.34, zIndex: 2 }
    ]
  }
]


// 所有模板合集
export const allTemplates: Template[] = [
  singleImageTemplate,
  ...twoImageTemplates,
  ...threeImageTemplates,
  ...fourImageTemplates,
  ...fiveImageTemplates,
  ...sixImageTemplates,
  ...sevenImageTemplates,
  ...eightImageTemplates,
  ...nineImageTemplates,
]

// 按图片数量分组的模板
export const templatesByCount: Record<number, TemplateGroup> = {
  1: { count: 1, templates: [singleImageTemplate] },
  2: { count: 2, templates: twoImageTemplates },
  3: { count: 3, templates: threeImageTemplates },
  4: { count: 4, templates: fourImageTemplates },
  5: { count: 5, templates: fiveImageTemplates },
  6: { count: 6, templates: sixImageTemplates },
  7: { count: 7, templates: sevenImageTemplates },
  8: { count: 8, templates: eightImageTemplates },
  9: { count: 9, templates: nineImageTemplates },
}

// 默认模板（用于初始化）
export const defaultTemplate = twoImageTemplates[0]