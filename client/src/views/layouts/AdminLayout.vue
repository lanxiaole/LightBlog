<template>
  <el-container style="height: 100vh; width: 100%; overflow: hidden;">
    <!-- 左侧侧边栏 -->
    <el-aside width="200px" style="background-color: #f5f5f5; border-right: 1px solid #e4e7ed;">
      <el-menu
        :router="true"
        :default-active="activeMenu"
        class="admin-menu"
        active-text-color="#409eff"
      >
        <el-menu-item index="/admin">
          <el-icon><House /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/articles">
          <el-icon><Document /></el-icon>
          <span>文章管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/categories">
          <el-icon><Collection /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/tags">
          <el-icon><Reading /></el-icon>
          <span>标签管理</span>
        </el-menu-item>
        <el-menu-item index="/write">
          <el-icon><Edit /></el-icon>
          <span>写文章</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧内容区 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header height="60px" style="background-color: #fff; border-bottom: 1px solid #e4e7ed; display: flex; align-items: center; justify-content: space-between; padding: 0 20px;">
        <div>
          <span>欢迎您，{{ userRoleLabel }} {{ username }}</span>
        </div>
        <el-button type="primary" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </el-button>
      </el-header>

      <!-- 主要内容 -->
      <el-main style="padding: 20px; overflow-y: auto;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import {
  ElContainer,
  ElAside,
  ElMenu,
  ElMenuItem,
  ElHeader,
  ElMain,
  ElButton,
  ElIcon
} from 'element-plus';
import { House, User, Document, Collection, Reading, Edit, SwitchButton } from '@element-plus/icons-vue';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

// 计算当前激活的菜单
const activeMenu = computed(() => {
  return route.path;
});

// 获取用户名
const username = computed(() => {
  return userStore.userInfo?.username || '';
});

// 获取用户角色标签
const userRoleLabel = computed(() => {
  return userStore.userInfo?.role === 'admin' ? '管理员' : '用户';
});

// 处理退出登录
const handleLogout = () => {
  userStore.logout();
  router.push('/');
};

// 初始化时获取用户信息
onMounted(() => {
  if (!userStore.userInfo) {
    userStore.initUserInfo();
  }
});
</script>

<style scoped>
.admin-menu {
  height: 100%;
  border-right: none;
}

.el-aside {
  overflow-y: auto;
  flex-shrink: 0;
}

.el-main {
  box-sizing: border-box;
  width: 100%;
}
</style>
