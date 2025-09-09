import { createRouter, createWebHistory } from 'vue-router'
import PuzzleEditor from '../views/PuzzleEditor.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'puzzle-editor',
      component: PuzzleEditor,
      meta: {
        title: '在线拼图工具'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        title: '关于'
      }
    }
  ],
})

// 路由守卫：设置页面标题
router.beforeEach((to) => {
  document.title = to.meta?.title as string || '在线拼图工具'
})

export default router
