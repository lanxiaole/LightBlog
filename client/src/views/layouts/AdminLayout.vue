<template>
  <div class="admin-layout">
    <!-- 移动端汉堡菜单按钮 -->
    <button class="mobile-menu-btn" @click="toggleSidebar" v-if="isMobile">
      <ElIcon><Menu /></ElIcon>
    </button>

    <!-- 左侧侧边栏 -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed && isMobile }">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo">
          <ElIcon class="logo-icon"><Reading /></ElIcon>
          <span class="logo-text">LightBlog</span>
        </div>
      </div>

      <!-- 菜单区域 -->
      <ElMenu
        :router="true"
        :default-active="activeMenu"
        class="admin-menu"
        mode="vertical"
      >
        <ElMenuItem index="/admin">
          <ElIcon class="menu-icon"><Reading /></ElIcon>
          <span>仪表盘</span>
        </ElMenuItem>
        <ElMenuItem index="/admin/users">
          <ElIcon class="menu-icon"><User /></ElIcon>
          <span>用户管理</span>
        </ElMenuItem>
        <ElMenuItem index="/admin/articles">
          <ElIcon class="menu-icon"><Document /></ElIcon>
          <span>文章管理</span>
        </ElMenuItem>
        <ElMenuItem index="/admin/categories">
          <ElIcon class="menu-icon"><FolderOpened /></ElIcon>
          <span>分类管理</span>
        </ElMenuItem>
        <ElMenuItem index="/admin/tags">
          <ElIcon class="menu-icon"><CollectionTag /></ElIcon>
          <span>标签管理</span>
        </ElMenuItem>
        <ElMenuItem index="/write">
          <ElIcon class="menu-icon"><Edit /></ElIcon>
          <span>写文章</span>
        </ElMenuItem>
      </ElMenu>

      <!-- 底部退出按钮 -->
      <div class="sidebar-footer">
        <button class="logout-btn" @click="handleLogout">
          <ElIcon><ArrowRight /></ElIcon>
          <span>退出登录</span>
        </button>
      </div>
    </aside>

    <!-- 遮罩层（移动端） -->
    <div class="overlay" v-if="sidebarCollapsed && isMobile" @click="toggleSidebar"></div>

    <!-- 右侧内容区 -->
    <main class="main-content">
      <!-- 顶部导航栏 -->
      <header class="top-nav">
        <div class="nav-left">
          <ElBreadcrumb separator="/" class="breadcrumb">
            <ElBreadcrumbItem :to="{ path: '/admin' }">仪表盘</ElBreadcrumbItem>
            <ElBreadcrumbItem>{{ currentPageTitle }}</ElBreadcrumbItem>
          </ElBreadcrumb>
        </div>
        <div class="nav-right">
          <div class="user-info" @click="toggleUserMenu">
            <ElAvatar :size="36" :src="userAvatar" class="user-avatar">
              {{ username.charAt(0).toUpperCase() }}
            </ElAvatar>
            <span class="user-name">{{ username }}</span>
            <ElIcon class="arrow-icon"><ArrowDown /></ElIcon>
          </div>
          <!-- 用户下拉菜单 -->
          <div class="user-menu" :class="{ 'menu-show': showUserMenu }">
            <div class="menu-item" @click="goToSettings">
              <ElIcon><Setting /></ElIcon>
              <span>个人中心</span>
            </div>
            <div class="menu-item" @click="handleLogout">
              <ElIcon><ArrowRight /></ElIcon>
              <span>退出登录</span>
            </div>
          </div>
        </div>
      </header>

      <!-- 主要内容区 -->
      <div class="content-area">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import {
  ElMenu,
  ElMenuItem,
  ElIcon,
  ElAvatar,
  ElBreadcrumb,
  ElBreadcrumbItem
} from 'element-plus';
import {
  Reading,
  User,
  Document,
  FolderOpened,
  CollectionTag,
  Edit,
  ArrowRight,
  Menu,
  ArrowDown,
  Setting
} from '@element-plus/icons-vue';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

// 响应式状态
const sidebarCollapsed = ref(false);
const showUserMenu = ref(false);
const isMobile = ref(false);

// 检测是否为移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 767;
  if (!isMobile.value) {
    sidebarCollapsed.value = false;
  }
};

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

// 切换用户菜单
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

// 点击外部关闭用户菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.user-info') && !target.closest('.user-menu')) {
    showUserMenu.value = false;
  }
};

// 计算当前激活的菜单
const activeMenu = computed(() => {
  return route.path;
});

// 获取用户名
const username = computed(() => {
  return userStore.userInfo?.username || '';
});

// 获取用户头像
const userAvatar = computed(() => {
  return userStore.userInfo?.avatar || '';
});

// 获取当前页面标题
const currentPageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/admin': '仪表盘',
    '/admin/users': '用户管理',
    '/admin/articles': '文章管理',
    '/admin/categories': '分类管理',
    '/admin/tags': '标签管理',
    '/write': '写文章'
  };
  return titles[route.path] || '';
});

// 处理退出登录
const handleLogout = () => {
  showUserMenu.value = false;
  userStore.logout();
  router.push('/');
};

// 跳转到设置页面
const goToSettings = () => {
  showUserMenu.value = false;
  router.push('/settings');
};

// 初始化时获取用户信息
onMounted(() => {
  if (!userStore.userInfo) {
    userStore.initUserInfo();
  }
  checkMobile();
  window.addEventListener('resize', checkMobile);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #F9FAFB;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 100;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 6px;
  background-color: #1E3A8A;
  color: #ffffff;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  display: none;
}

@media (max-width: 767px) {
  .mobile-menu-btn {
    display: flex;
  }
}

/* 侧边栏 */
.sidebar {
  width: 220px;
  height: 100vh;
  background-color: #1E3A8A;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 50;
  transition: transform 0.2s linear;
}

.sidebar-collapsed {
  transform: translateX(-100%);
}

@media (min-width: 768px) and (max-width: 1199px) {
  .sidebar {
    width: 200px;
  }
}

@media (max-width: 767px) {
  .sidebar {
    width: 240px;
  }
}

/* Logo区域 */
.logo-section {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 20px;
  color: #F97316;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
}

/* 菜单 */
.admin-menu {
  flex: 1;
  border-right: none;
  background-color: transparent;
}

.admin-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  padding: 0 20px;
  margin: 0;
  border-radius: 0;
  color: rgba(255, 255, 255, 0.9);
  transition: background-color 0.2s linear;
}

.admin-menu .el-menu-item:hover {
  background-color: #1E40AF;
}

.admin-menu .el-menu-item.is-active {
  background-color: #1E40AF;
  border-left: 3px solid #F97316;
}

.menu-icon {
  font-size: 18px;
  margin-right: 12px;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 6px;
  background-color: transparent;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background-color 0.2s linear;
}

.logout-btn:hover {
  background-color: #1E40AF;
}

/* 遮罩层 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 220px;
}

@media (min-width: 768px) and (max-width: 1199px) {
  .main-content {
    margin-left: 200px;
  }
}

@media (max-width: 767px) {
  .main-content {
    margin-left: 0;
  }
}

/* 顶部导航栏 */
.top-nav {
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.nav-left {
  flex: 1;
}

.breadcrumb :deep(.el-breadcrumb__item) {
  font-size: 14px;
}

.breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #111827;
  font-weight: 500;
}

.nav-right {
  display: flex;
  align-items: center;
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s linear;
}

.user-info:hover {
  background-color: #F3F4F6;
}

.user-avatar {
  border: 2px solid #1E3A8A;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.arrow-icon {
  font-size: 14px;
  color: #6B7280;
}

/* 用户下拉菜单 */
.user-menu {
  position: fixed;
  top: calc(60px + 16px);
  right: 24px;
  width: 160px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: all 0.2s linear;
  z-index: 1000;
}

.menu-show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s linear;
}

.menu-item:hover {
  background-color: #F3F4F6;
}

/* 内容区域 */
.content-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #F9FAFB;
}
</style>
