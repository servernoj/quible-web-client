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
      path: '/live',
      name: 'live',
      props: (route) => ({ isDebug: typeof route.query.debug !== 'undefined' && !/^false$/i.test(route.query.debug as string) }),
      component: () => import('@/views/Live.vue')
    },
    // {
    //   path: '/chat',
    //   name: 'chat',
    //   component: () => import('@/views/Chat.vue'),
    //   meta: { requiresAuth: true }
    // },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/error',
      name: 'error',
      component: Error
    },
    {
      path: '/forms',
      redirect: '/'
    },
    {
      path: '/forms/activation',
      component: () => import('@/views/forms/UserActivation.vue')
    },
    {
      path: '/forms/accept-private-chat-invitation',
      component: () => import('@/views/forms/AcceptChatInvitation.vue')
    },
    {
      path: '/forms/password-reset',
      component: () => import('@/views/forms/PasswordReset.vue')
    },
    {
      path: '/forms/register',
      component: () => import('@/views/forms/UserRegistration.vue')
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
          : { name: 'login', query: { target: to.path } }
      }
    }
  }
)

export default router
