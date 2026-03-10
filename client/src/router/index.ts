import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/layouts/DefaultLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/views/home/Home.vue') },
        { path: 'login', name: 'login', component: () => import('@/views/auth/Login.vue') },
        { path: 'register', name: 'register', component: () => import('@/views/auth/Register.vue') },
        { path: 'article/:id', name: 'article-detail', component: () => import('@/views/article/Detail.vue') },
        { path: 'category/:name', name: 'category', component: () => import('@/views/category/List.vue') },
        { path: 'tag/:name', name: 'tag', component: () => import('@/views/tag/List.vue') },
        { path: 'search', name: 'search', component: () => import('@/views/search/Search.vue') },
        { path: 'settings', name: 'settings', component: () => import('@/views/settings/Settings.vue') },
        { path: 'write', name: 'write', component: () => import('@/views/article/Write.vue') },
        { path: 'edit/:id', name: 'edit', component: () => import('@/views/article/Edit.vue') },
        { path: 'notifications', name: 'notifications', component: () => import('@/views/notifications/Notifications.vue') }
      ]
    },
    {
      path: '/user/:username',
      component: () => import('@/views/layouts/UserLayout.vue'),
      children: [
        { path: '', name: 'user-profile', component: () => import('@/views/user/Profile.vue') },
        { path: 'followers', name: 'user-followers', component: () => import('@/views/user/Followers.vue') },
        { path: 'following', name: 'user-following', component: () => import('@/views/user/Following.vue') },
        { path: 'about', name: 'user-about', component: () => import('@/views/user/About.vue') }
      ]
    },
    {
      path: '/admin',
      component: () => import('@/views/layouts/AdminLayout.vue'),
      children: [
        { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/Dashboard.vue') },
        { path: 'users', name: 'admin-users', component: () => import('@/views/admin/Users.vue') },
        { path: 'articles', name: 'admin-articles', component: () => import('@/views/admin/Articles.vue') },
        { path: 'categories', name: 'admin-categories', component: () => import('@/views/admin/Categories.vue') },
        { path: 'tags', name: 'admin-tags', component: () => import('@/views/admin/Tags.vue') }
      ]
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/error/NotFound.vue') }
  ]
})

export default router
