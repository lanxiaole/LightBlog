import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/layouts/DefaultLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/views/home/Home.vue'), meta: { title: '首页' } },
        { path: 'login', name: 'login', component: () => import('@/views/auth/Login.vue'), meta: { title: '登录' } },
        { path: 'register', name: 'register', component: () => import('@/views/auth/Register.vue'), meta: { title: '注册' } },
        { path: 'article/:id', name: 'article-detail', component: () => import('@/views/article/Detail.vue'), meta: { title: '文章详情' } },
        { path: 'category/:name', name: 'category', component: () => import('@/views/category/List.vue'), meta: { title: '分类' } },
        { path: 'tag/:name', name: 'tag', component: () => import('@/views/tag/List.vue'), meta: { title: '标签' } },
        { path: 'search', name: 'search', component: () => import('@/views/search/Search.vue'), meta: { title: '搜索' } },
        { path: 'settings', name: 'settings', component: () => import('@/views/settings/Settings.vue'), meta: { requiresAuth: true, title: '设置' } },
        { path: 'write', name: 'write', component: () => import('@/views/article/Write.vue'), meta: { requiresAuth: true, title: '写文章' } },
        { path: 'edit/:id', name: 'edit', component: () => import('@/views/article/Edit.vue'), meta: { requiresAuth: true, title: '编辑文章' } },
        { path: 'notifications', name: 'notifications', component: () => import('@/views/notifications/Notifications.vue'), meta: { requiresAuth: true, title: '消息中心' } },
        // 用户个人主页相关路由
        {
          path: 'user/:username',
          component: () => import('@/views/layouts/UserLayout.vue'),
          children: [
            { path: '', name: 'user-profile', component: () => import('@/views/user/Profile.vue'), meta: { title: '个人主页' } },
            { path: 'favorites', name: 'user-favorites', component: () => import('@/views/user/Favorites.vue'), meta: { title: '收藏' } },
            { path: 'followers', name: 'user-followers', component: () => import('@/views/user/Followers.vue'), meta: { title: '关注者' } },
            { path: 'following', name: 'user-following', component: () => import('@/views/user/Following.vue'), meta: { title: '关注' } },
            { path: 'about', name: 'user-about', component: () => import('@/views/user/About.vue'), meta: { title: '关于' } }
          ]
        },
        // 后台管理相关路由
        {
          path: 'admin',
          meta: { requiresAuth: true, title: '后台管理' },
          children: [
            { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/Dashboard.vue'), meta: { title: '仪表盘' } },
            { path: 'users', name: 'admin-users', component: () => import('@/views/admin/Users.vue'), meta: { title: '用户管理' } },
            { path: 'articles', name: 'admin-articles', component: () => import('@/views/admin/Articles.vue'), meta: { title: '文章管理' } },
            { path: 'categories', name: 'admin-categories', component: () => import('@/views/admin/Categories.vue'), meta: { title: '分类管理' } },
            { path: 'tags', name: 'admin-tags', component: () => import('@/views/admin/Tags.vue'), meta: { title: '标签管理' } }
          ]
        },
        // 404 页面
        { path: ':pathMatch(.*)*', name: 'not-found', component: () => import('@/views/error/NotFound.vue'), meta: { title: '404' } }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to) => {
  // 检查是否需要登录
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // 检查是否有 token
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // 如果需要登录但没有 token，跳转到登录页
  if (requiresAuth && !token) {
    return '/login';
  }
  // 如果已经登录但访问登录或注册页，跳转到首页
  else if ((to.path === '/login' || to.path === '/register') && token) {
    return '/';
  }
  // 其他情况正常跳转
  return true;
});

export default router
