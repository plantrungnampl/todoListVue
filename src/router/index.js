import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/todos'
    },
    {
      path: '/todos',
      name: 'todos',
      component: () => import('../views/TodoView.vue'),
    },
  ],
})

export default router
