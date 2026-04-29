<template>
  <el-container class="default-layout">
    <!-- 顶部固定导航栏 -->
    <header class="top-navbar">
      <div class="navbar-container">
        <!-- 左侧：Logo -->
        <div class="navbar-brand" @click="router.push('/')">
          <el-icon class="brand-icon"><Reading /></el-icon>
          <span class="brand-text">LightBlog</span>
        </div>

        <!-- 中间：导航菜单（PC端显示） -->
        <nav class="navbar-menu">
          <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">首页</router-link>
          <router-link to="/category" class="nav-link" :class="{ active: $route.path === '/category' || $route.path.startsWith('/category/') }">分类</router-link>
          <router-link to="/tag" class="nav-link" :class="{ active: $route.path === '/tag' || $route.path.startsWith('/tag/') }">标签</router-link>
          <router-link to="/write" class="nav-link" :class="{ active: $route.path === '/write' }">写文章</router-link>
          <router-link
            v-if="userStore.isLoggedIn"
            :to="`/user/${userStore.userInfo?.username || ''}`"
            class="nav-link"
            :class="{ active: $route.path.startsWith('/user') }"
          >关于我</router-link>
          <router-link v-else to="/login" class="nav-link" :class="{ active: $route.path === '/login' }">关于我</router-link>
        </nav>

        <!-- 右侧：用户操作 -->
        <div class="navbar-actions">
          <!-- 搜索框 -->
          <div class="search-box">
            <ElInput
              v-model="searchKeyword"
              placeholder="搜索文章"
              class="search-input"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-icon class="search-icon" @click="handleSearch">
                  <Search />
                </el-icon>
              </template>
            </ElInput>
          </div>

          <!-- 消息图标 -->
          <template v-if="userStore.isLoggedIn">
            <el-badge :value="notificationStore.unreadCount" :hidden="notificationStore.unreadCount === 0" class="message-badge">
              <el-icon class="message-icon" @click="router.push('/notifications')">
                <Message />
              </el-icon>
            </el-badge>
          </template>

          <!-- 登录后显示 -->
          <template v-if="userStore.isLoggedIn">
            <div class="user-dropdown-wrapper">
              <div class="user-dropdown" @click="toggleUserMenu">
                <el-avatar
                  size="small"
                  :src="userStore.userInfo?.avatar"
                  class="user-avatar"
                >
                  <template #default>
                    <el-icon><UserFilled /></el-icon>
                  </template>
                </el-avatar>
                <span class="username">{{ userStore.userInfo?.username || '' }}</span>
                <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
              </div>
              <!-- 用户下拉菜单 -->
              <div class="user-menu" :class="{ 'menu-show': showUserMenu }">
                <div class="menu-item" @click="router.push(`/user/${userStore.userInfo?.username || ''}`); showUserMenu = false">
                  <el-icon><UserFilled /></el-icon>
                  <span>个人中心</span>
                </div>
                <div class="menu-item" @click="router.push('/write'); showUserMenu = false">
                  <el-icon><Edit /></el-icon>
                  <span>写文章</span>
                </div>
                <div v-if="userStore.userInfo?.role === 'admin'" class="menu-item" @click="router.push('/admin'); showUserMenu = false">
                  <el-icon><Setting /></el-icon>
                  <span>管理后台</span>
                </div>
                <div class="menu-item" @click="router.push('/settings'); showUserMenu = false">
                  <el-icon><Setting /></el-icon>
                  <span>设置</span>
                </div>
                <div class="menu-divider"></div>
                <div class="menu-item" @click="userStore.logout(); showUserMenu = false">
                  <el-icon><ArrowRight /></el-icon>
                  <span>退出登录</span>
                </div>
              </div>
            </div>
          </template>

          <!-- 未登录显示 -->
          <template v-else>
            <div class="auth-buttons">
              <el-button text @click="router.push('/login')">登录</el-button>
              <el-button type="primary" @click="router.push('/register')">注册</el-button>
            </div>
          </template>

          <!-- 移动端汉堡菜单 -->
          <el-icon class="mobile-menu-icon" @click="mobileMenuVisible = true">
            <Menu />
          </el-icon>
        </div>
      </div>
    </header>

    <!-- 移动端菜单抽屉 -->
    <el-drawer
      v-model="mobileMenuVisible"
      direction="rtl"
      size="280px"
      :with-header="false"
      class="mobile-menu-drawer"
    >
      <div class="mobile-menu">
        <div class="mobile-menu-header">
          <div class="mobile-brand">
            <el-icon class="brand-icon"><Reading /></el-icon>
            <span>LightBlog</span>
          </div>
        </div>
        <div class="mobile-menu-items">
          <router-link to="/" class="mobile-menu-item" @click="mobileMenuVisible = false">首页</router-link>
          <router-link to="/category" class="mobile-menu-item" @click="mobileMenuVisible = false">分类</router-link>
          <router-link to="/tag" class="mobile-menu-item" @click="mobileMenuVisible = false">标签</router-link>
          <router-link v-if="userStore.isLoggedIn" to="/write" class="mobile-menu-item" @click="mobileMenuVisible = false">写文章</router-link>
          <router-link v-if="userStore.isLoggedIn" :to="`/user/${userStore.userInfo?.username || ''}`" class="mobile-menu-item" @click="mobileMenuVisible = false">关于我</router-link>
          <router-link v-else to="/login" class="mobile-menu-item" @click="mobileMenuVisible = false">关于我</router-link>
        </div>
        <div class="mobile-menu-divider"></div>
        <div class="mobile-menu-items">
          <template v-if="userStore.isLoggedIn">
            <div class="mobile-menu-item" @click="router.push(`/user/${userStore.userInfo?.username || ''}`); mobileMenuVisible = false">个人中心</div>
            <div class="mobile-menu-item" @click="router.push('/write'); mobileMenuVisible = false">写文章</div>
            <div class="mobile-menu-item" @click="userStore.logout(); mobileMenuVisible = false">退出登录</div>
          </template>
          <template v-else>
            <div class="mobile-menu-item" @click="router.push('/login'); mobileMenuVisible = false">登录</div>
            <div class="mobile-menu-item" @click="router.push('/register'); mobileMenuVisible = false">注册</div>
          </template>
        </div>
      </div>
    </el-drawer>

    <!-- 主内容区 -->
    <main class="main-container">
      <router-view />
    </main>

    <!-- 底部页脚 -->
    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-brand">
            <el-icon class="footer-icon"><Reading /></el-icon>
            <span class="footer-name">LightBlog</span>
          </div>
          <p class="footer-desc">轻量、简洁、优雅的博客平台，记录生活与技术的点滴</p>
          <div class="footer-links">
            <router-link to="/">首页</router-link>
            <router-link to="/about">关于</router-link>
            <a href="mailto:contact@lightblog.com">联系我们</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="copyright">© 2026 LightBlog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Search, UserFilled, ArrowDown, Menu, Message, Reading, Edit, Setting, ArrowRight } from '@element-plus/icons-vue';
import { ElBadge, ElInput } from 'element-plus';
import 'element-plus/dist/index.css';
import { useUserStore } from '@/stores/user';
import { useNotificationStore } from '@/stores/notification';
import { useRouter } from 'vue-router';

// 获取用户 store
const userStore = useUserStore();
// 获取通知 store
const notificationStore = useNotificationStore();
// 获取路由实例
const router = useRouter();

// 搜索关键词
const searchKeyword = ref<string>('');

// 移动端菜单显示状态
const mobileMenuVisible = ref(false);

// 用户下拉菜单显示状态
const showUserMenu = ref(false);

// 切换用户菜单
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.user-dropdown-wrapper')) {
    showUserMenu.value = false;
  }
};

// 轮询定时器
let pollingTimer: number | null = null;

// 获取未读消息数
const fetchUnreadCount = async () => {
  if (userStore.isLoggedIn) {
    await notificationStore.fetchUnreadCount();
  } else {
    notificationStore.setUnreadCount(0);
  }
};

// 启动轮询
const startPolling = () => {
  // 清除之前的定时器
  stopPolling();

  // 每 10 秒获取一次未读消息数
  pollingTimer = window.setInterval(() => {
    fetchUnreadCount();
  }, 10000);
};

// 停止轮询
const stopPolling = () => {
  if (pollingTimer !== null) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchUnreadCount();
  // 启动轮询
  startPolling();
  // 添加点击外部关闭菜单监听
  document.addEventListener('click', handleClickOutside);
});

// 组件卸载时清理
onUnmounted(() => {
  // 停止轮询
  stopPolling();
  // 移除点击外部关闭菜单监听
  document.removeEventListener('click', handleClickOutside);
});

// 监听登录状态变化
watch(() => userStore.isLoggedIn, (isLoggedIn) => {
  fetchUnreadCount();
  if (isLoggedIn) {
    // 用户登录，启动轮询
    startPolling();
  } else {
    // 用户退出，停止轮询
    stopPolling();
  }
});

// 搜索方法
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { keyword: searchKeyword.value.trim() } });
  } else {
    router.push('/search');
  }
};
</script>

<style scoped lang="scss">
// 颜色变量
$primary-color: #1E3A8A;
$secondary-color: #F97316;
$bg-light: #F3F4F6;
$text-dark: #111827;
$text-gray: #6B7280;
$border-color: #E5E7EB;

// 布局基础
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: $bg-light;
}

// 顶部导航栏样式
.top-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  transition: all 0.2s linear;
}

.navbar-container {
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// Logo样式
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: opacity 0.2s linear;

  &:hover {
    opacity: 0.8;
  }

  .brand-icon {
    font-size: 28px;
    color: $primary-color;
  }

  .brand-text {
    font-size: 20px;
    font-weight: 700;
    color: $text-dark;
    letter-spacing: -0.5px;
  }
}

// 导航菜单样式
.navbar-menu {
  display: flex;
  align-items: center;
  gap: 32px;

  .nav-link {
    font-size: 15px;
    color: $text-gray;
    text-decoration: none;
    transition: color 0.2s linear;
    position: relative;

    &:hover {
      color: $primary-color;
    }

    &.active {
      color: $primary-color;
      font-weight: 500;

      &::after {
        content: '';
        position: absolute;
        bottom: -20px;
        left: 0;
        right: 0;
        height: 2px;
        background-color: $primary-color;
      }
    }
  }
}

// 右侧操作区样式
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

// 搜索框样式定制
.search-box {
  :deep(.search-input) {
    width: 220px;

    .el-input__wrapper {
      border-radius: 6px 0 0 6px;
      box-shadow: 0 0 0 1px $border-color inset;
      transition: box-shadow 0.2s linear;

      &:hover {
        box-shadow: 0 0 0 1px $primary-color inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px $primary-color inset;
      }
    }

    .el-input-group__append {
      background-color: $primary-color;
      border-color: $primary-color;
      border-radius: 0 6px 6px 0;
      padding: 0 12px;

      .search-icon {
        color: white;
        font-size: 16px;
        cursor: pointer;
        transition: opacity 0.2s linear;

        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
}

// 消息图标样式
.message-badge {
  :deep(.el-badge__content) {
    background-color: $secondary-color;
  }
}

.message-icon {
  font-size: 22px;
  color: $text-gray;
  cursor: pointer;
  transition: color 0.2s linear;

  &:hover {
    color: $primary-color;
  }
}

// 用户下拉样式
.user-dropdown-wrapper {
  position: relative;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s linear;

  &:hover {
    background-color: $bg-light;
  }

  .user-avatar {
    border: 2px solid $border-color;
  }

  .username {
    font-size: 14px;
    color: $text-dark;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dropdown-arrow {
    font-size: 12px;
    color: $text-gray;
  }
}

// 用户下拉菜单
.user-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
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

  &:hover {
    background-color: #F3F4F6;
  }
}

.menu-divider {
  height: 1px;
  background-color: #F3F4F6;
  margin: 8px 0;
}

// 认证按钮样式
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

// 移动端菜单图标
.mobile-menu-icon {
  font-size: 24px;
  color: $text-gray;
  cursor: pointer;
  display: none;
  transition: color 0.2s linear;

  &:hover {
    color: $primary-color;
  }
}

// 主内容区
.main-container {
  flex: 1;
  margin-top: 64px;
  min-height: calc(100vh - 64px - 200px);
}

// 移动端菜单样式
.mobile-menu {
  padding: 20px 0;

  .mobile-menu-header {
    padding: 0 20px 20px;
    border-bottom: 1px solid $border-color;
    margin-bottom: 16px;

    .mobile-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
      font-weight: 600;
      color: $text-dark;

      .brand-icon {
        font-size: 24px;
        color: $primary-color;
      }
    }
  }

  .mobile-menu-items {
    display: flex;
    flex-direction: column;
  }

  .mobile-menu-item {
    padding: 14px 20px;
    font-size: 15px;
    color: $text-dark;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.2s linear;

    &:hover {
      background-color: $bg-light;
      color: $primary-color;
    }
  }

  .mobile-menu-divider {
    height: 1px;
    background-color: $border-color;
    margin: 12px 0;
  }
}

// 页脚样式
.site-footer {
  background-color: white;
  border-top: 1px solid $border-color;
  padding: 48px 24px 24px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-content {
  text-align: center;
  margin-bottom: 32px;
}

.footer-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 12px;

  .footer-icon {
    font-size: 24px;
    color: $primary-color;
  }

  .footer-name {
    font-size: 18px;
    font-weight: 600;
    color: $text-dark;
  }
}

.footer-desc {
  font-size: 14px;
  color: $text-gray;
  margin-bottom: 20px;
  line-height: 1.6;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 24px;

  a {
    font-size: 14px;
    color: $text-gray;
    text-decoration: none;
    transition: color 0.2s linear;

    &:hover {
      color: $primary-color;
    }
  }
}

.footer-bottom {
  border-top: 1px solid $border-color;
  padding-top: 20px;
  text-align: center;

  .copyright {
    font-size: 13px;
    color: #9CA3AF;
    margin: 0;
  }
}

// 响应式适配
@media (max-width: 1199px) {
  .navbar-menu {
    gap: 24px;
  }

  .search-box :deep(.search-input) {
    width: 180px;
  }
}

@media (max-width: 991px) {
  .navbar-menu {
    display: none;
  }

  .search-box {
    display: none;
  }

  .mobile-menu-icon {
    display: block;
  }

  .username {
    display: none;
  }
}

@media (max-width: 767px) {
  .navbar-container {
    padding: 0 16px;
  }

  .navbar-brand .brand-text {
    font-size: 18px;
  }

  .auth-buttons {
    .el-button {
      padding: 8px 12px;
      font-size: 13px;
    }
  }

  .site-footer {
    padding: 32px 16px 20px;
  }

  .footer-links {
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>
