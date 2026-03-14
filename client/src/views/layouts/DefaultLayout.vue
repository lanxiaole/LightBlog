<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { House, User, Plus, Edit, Search, UserFilled, ArrowDown, CollectionTag, Menu } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { useRoute, useRouter } from 'vue-router';
import { getCategories } from '@/api/category';
import { getTags } from '@/api/tag';
import type { Category } from '@/api/category';
import type { Tag } from '@/api/tag';

// 获取用户 store
const userStore = useUserStore();
// 获取当前路由
const route = useRoute();
// 获取路由实例
const router = useRouter();

// 分类和标签数据
const categories = ref<Category[]>([]);
const tags = ref<Tag[]>([]);

// 生成面包屑数据
const breadcrumbItems = computed(() => {
  // 过滤掉没有 title 的路由
  return route.matched.filter(item => item.meta.title).map(item => {
    // 对于根路径，直接使用 '/' 作为路径
    if (item.path === '') {
      return {
        title: item.meta.title,
        path: '/'
      };
    }
    // 对于其他路径，使用实际路径
    return {
      title: item.meta.title,
      path: item.path
    };
  });
});

// 获取分类和标签数据
const fetchCategoriesAndTags = async () => {
  try {
    // 获取分类
    const categoryList = await getCategories();
    categories.value = categoryList;

    // 获取标签
    const tagList = await getTags();
    tags.value = tagList;
  } catch (error) {
    console.error('获取分类和标签失败:', error);
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchCategoriesAndTags();
});
</script>

<template>
  <el-container class="default-layout" style="min-height: 100vh;">
    <!-- 左侧导航栏 -->
    <el-aside width="200px" style="background-color: #fff; border-right: 1px solid #e5e5e5;">
      <div class="logo" style="padding: 20px; text-align: center; font-size: 18px; font-weight: bold; background-color: #fff;">
        轻量博客
      </div>
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical-demo"
        router
        style="height: calc(100vh - 72px);"
      >
        <!-- 首页 -->
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>

        <!-- 登录后显示 -->
        <template v-if="userStore.isLoggedIn">
          <!-- 个人中心 -->
          <el-menu-item :index="`/user/${userStore.userInfo?.username || ''}`">
            <el-icon><User /></el-icon>
            <span>个人中心</span>
          </el-menu-item>

          <!-- 写文章 -->
          <el-menu-item index="/write">
            <el-icon><Edit /></el-icon>
            <span>写文章</span>
          </el-menu-item>
        </template>

        <!-- 未登录显示 -->
        <template v-else>
          <el-menu-item index="/login">
            <el-icon><User /></el-icon>
            <span>登录</span>
          </el-menu-item>
          <el-menu-item index="/register">
            <el-icon><Plus /></el-icon>
            <span>注册</span>
          </el-menu-item>
        </template>

        <!-- 分类 -->
        <el-sub-menu index="/category">
          <template #title>
            <el-icon><Menu /></el-icon>
            <span>分类</span>
          </template>
          <el-menu-item v-for="category in categories" :key="category.id" :index="`/category/${category.name}`">
            {{ category.name }}
          </el-menu-item>
          <el-menu-item v-if="categories.length === 0" disabled>
            暂无分类
          </el-menu-item>
        </el-sub-menu>

        <!-- 标签 -->
        <el-sub-menu index="/tag">
          <template #title>
            <el-icon><CollectionTag /></el-icon>
            <span>标签</span>
          </template>
          <el-menu-item v-for="tag in tags" :key="tag.id" :index="`/tag/${tag.name}`">
            {{ tag.name }}
          </el-menu-item>
          <el-menu-item v-if="tags.length === 0" disabled>
            暂无标签
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 右侧内容区 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header height="60px" style="background-color: #fff; border-bottom: 1px solid #e5e5e5; display: flex; align-items: center; justify-content: space-between;">
        <!-- 左侧：logo 和面包屑 -->
        <div style="display: flex; align-items: center;">
          <div class="logo" style="font-size: 18px; font-weight: bold; margin-right: 30px;">
            LightBlog
          </div>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index" :to="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <!-- 右侧：用户信息 -->
        <div style="display: flex; align-items: center;">
          <el-icon class="search-icon" style="margin-right: 20px; cursor: pointer;">
            <Search />
          </el-icon>

          <!-- 登录后显示 -->
        <template v-if="userStore.isLoggedIn">
          <el-dropdown>
            <span class="el-dropdown-link" style="display: flex; align-items: center; cursor: pointer;">
              <el-avatar
                size="small"
                style="margin-right: 10px;"
                :src="userStore.userInfo?.avatar"
              >
                <template #default>
                  <el-icon><UserFilled /></el-icon>
                </template>
              </el-avatar>
              <span style="margin-right: 5px;">{{ userStore.userInfo?.username || '' }}</span>
              <el-icon class="el-icon--right">
                <ArrowDown />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push(`/user/${userStore.userInfo?.username || ''}`)">个人中心</el-dropdown-item>
                <el-dropdown-item @click="router.push('/settings')">设置</el-dropdown-item>
                <el-dropdown-item divided @click="userStore.logout()">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>

        <!-- 未登录显示 -->
        <template v-else>
          <el-button type="text" @click="router.push('/login')" style="margin-right: 10px;">登录</el-button>
          <el-button type="primary" @click="router.push('/register')">注册</el-button>
        </template>
        </div>
      </el-header>

      <!-- 主要内容区 -->
      <el-main style="padding: 20px;">
        <router-view />
      </el-main>

      <!-- 底部版权信息 -->
      <el-footer height="60px" style="background-color: #f5f5f5; border-top: 1px solid #e5e5e5; text-align: center; line-height: 60px;">
        © 2026 LightBlog. All rights reserved.
      </el-footer>
    </el-container>
  </el-container>
</template>

<style scoped>
.default-layout {
  min-height: 100vh;
}

.el-menu-vertical-demo {
  border-right: none;
}

.logo {
  color: #409eff;
}

.search-icon:hover {
  color: #409eff;
}
</style>
