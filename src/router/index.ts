import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Error from '@/views/Error.vue'
import { getAccessToken, isWebView } from '@/bridge'
import queryClient from '@/queryClient'
import axios from 'axios'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/views/Chat.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/error',
      name: 'error',
      component: Error,
      meta: { requiresAuth: false }
    },
    {
      path: '/:pathMatch(.*)',
      name: 'not-found',
      component: Error
    }

  ]
})

const testAccessToken = async (token?: string) => {
  if (!token) {
    return false
  }
  const queryKey = ['token-test', token.split('.')[2]]
  console.log(queryKey.join('-'))
  const data = await queryClient.fetchQuery({
    queryKey,
    retry: false,
    staleTime: 5 * 60 * 1000,
    queryFn: () => axios<{id?:string}>({
      method: 'GET',
      url: `${import.meta.env.VITE_AUTH_SERVICE_BASE_URL}/user`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(({ data }) => Boolean(data?.id))
      .catch(() => false)
  })
  return data
}

router.beforeEach(
  async (to) => {
    if (to.meta.requiresAuth) {
      const token = await getAccessToken()
      const isTokenGood = await testAccessToken(token)
      const isMobile = isWebView()
      if (!isTokenGood) {
        return isMobile
          ? { name: 'error', query: { kind: 403, path: to.path } }
          : { name: 'login' }
      }
    }
  }
)

export default router
