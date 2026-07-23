import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    name: 'recommendation-stable',
    component: () => import('@/showcase/pages/FeedPage.vue')
  },
  {
    path: '/home/beta',
    name: 'recommendation-beta',
    component: () => import('@/showcase/pages/BetaFeedPage.vue')
  },
  {
    path: '/author/:authorSlug',
    name: 'author',
    component: () => import('@/showcase/pages/AuthorPage.vue')
  },
  {
    path: '/report/:videoId',
    name: 'evidence-report',
    component: () => import('@/showcase/pages/ReportPage.vue')
  },
  { path: '/:pathMatch(.*)*', redirect: '/home' }
]

export default routes
