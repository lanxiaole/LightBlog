<template>
  <div class="sidebar">
    <!-- 搜索框 -->
    <div class="sidebar-section">
      <div class="search-widget">
        <ElInput
          v-model="searchKeyword"
          placeholder="搜索文章..."
          class="sidebar-search"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-icon class="search-btn" @click="handleSearch">
              <Search />
            </el-icon>
          </template>
        </ElInput>
      </div>
    </div>

    <!-- 个人信息卡片 -->
    <div class="sidebar-section">
      <div class="personal-card">
        <div class="personal-avatar">
          <el-avatar :size="72" :src="currentUser?.avatar">
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
        </div>
        <h4 class="personal-name">{{ currentUser?.username || '游客' }}</h4>
        <p class="personal-bio">{{ currentUser?.bio || '这个人很懒，还没有填写个人简介' }}</p>

        <!-- 用户统计信息 -->
        <div class="personal-stats">
          <div class="stat-item">
            <el-icon class="stat-icon"><Document /></el-icon>
            <div class="stat-content">
              <span class="stat-num">{{ userStats.articleCount }}</span>
              <span class="stat-label">文章</span>
            </div>
          </div>
          <div class="stat-item">
            <el-icon class="stat-icon"><Like /></el-icon>
            <div class="stat-content">
              <span class="stat-num">{{ userStats.totalLikes }}</span>
              <span class="stat-label">获赞</span>
            </div>
          </div>
          <div class="stat-item">
            <el-icon class="stat-icon"><Star /></el-icon>
            <div class="stat-content">
              <span class="stat-num">{{ userStats.totalFavorites }}</span>
              <span class="stat-label">收藏</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门文章 -->
    <div class="sidebar-section">
      <div class="section-header">
        <el-icon><Star /></el-icon>
        <span>热门文章</span>
      </div>
      <div class="hot-articles">
        <div
          v-for="(article, index) in hotArticles"
          :key="article.id"
          class="hot-article-item"
          @click="navigateToArticle(article.id)"
        >
          <span class="hot-rank" :class="{ 'top-three': index < 3 }">{{ index + 1 }}</span>
          <div class="hot-article-content">
            <span class="hot-article-title">{{ truncateTitle(article.title) }}</span>
            <span class="hot-article-views">
              <el-icon><View /></el-icon>
              {{ formatViews(article.views) }}
            </span>
          </div>
        </div>
        <p v-if="hotArticles.length === 0" class="empty-hint">
          暂无热门文章
        </p>
      </div>
    </div>

    <!-- 热门标签 -->
    <div class="sidebar-section">
      <div class="section-header">
        <el-icon><CollectionTag /></el-icon>
        <span>热门标签</span>
      </div>
      <div class="tags-cloud">
        <span
          v-for="tag in tags.slice(0, 15)"
          :key="tag.id"
          class="tag-item"
          @click="handleTagClick(tag.name)"
        >
          {{ tag.name }}
        </span>
        <p v-if="tags.length === 0" class="empty-hint">
          暂无标签
        </p>
      </div>
    </div>

    <!-- 分类 -->
    <div class="sidebar-section">
      <div class="section-header">
        <el-icon><Folder /></el-icon>
        <span>文章分类</span>
      </div>
      <div class="category-list">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          @click="handleCategoryClick(category.name)"
        >
          <span class="category-name">{{ category.name }}</span>
          <el-icon><ArrowRight /></el-icon>
        </div>
        <p v-if="categories.length === 0" class="empty-hint">
          暂无分类
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElInput } from 'element-plus';
import { Search, UserFilled, CollectionTag, Folder, ArrowRight, Document, Star, View } from '@element-plus/icons-vue';
import type { Category } from '@/api/category';
import type { Tag } from '@/api/tag';
import type { Article } from '@/api/article';
import { getUserArticles } from '@/api/user';
import { getHotArticles } from '@/api/article';
import { useUserStore } from '@/stores/user';

/**
 * 侧边栏组件
 * 展示博主信息、搜索框、热门标签、最新评论和分类
 */

// 组件属性定义
interface Props {
  /** 分类列表 */
  categories: Category[];
  /** 标签列表 */
  tags: Tag[];
}

defineProps<Props>();

// 定义组件事件
const emit = defineEmits<{
  /** 分类点击事件 */
  'category-click': [name: string];
  /** 标签点击事件 */
  'tag-click': [name: string];
}>();

const router = useRouter();
const userStore = useUserStore();

// 搜索关键词
const searchKeyword = ref('');

// 用户统计信息
const userStats = ref({
  articleCount: 0,
  totalLikes: 0,
  totalFavorites: 0
});

// 热门文章数据
const hotArticles = ref<Article[]>([]);

// 计算属性：当前用户信息
const currentUser = computed(() => userStore.userInfo);

/**
 * 处理搜索
 */
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/search', query: { keyword: searchKeyword.value.trim() } });
  }
};

/**
 * 跳转到文章详情
 * @param articleId 文章ID
 */
const navigateToArticle = (articleId: number) => {
  router.push(`/article/${articleId}`);
};

/**
 * 截断文章标题
 * @param title 文章标题
 */
const truncateTitle = (title: string): string => {
  return title.length > 20 ? title.substring(0, 20) + '...' : title;
};

/**
 * 格式化浏览量
 * @param views 浏览量
 */
const formatViews = (views: number): string => {
  if (views >= 10000) {
    return (views / 10000).toFixed(1) + 'w';
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'k';
  }
  return views.toString();
};

/**
 * 获取热门文章
 */
const fetchHotArticles = async () => {
  try {
    const result = await getHotArticles(8);
    hotArticles.value = result.list;
  } catch (error) {
    console.error('获取热门文章失败:', error);
    hotArticles.value = [];
  }
};

/**
 * 获取用户统计信息
 */
const fetchUserStats = async () => {
  try {
    // 只有登录用户才获取个人统计
    if (currentUser.value) {
      // 获取用户的文章列表
      const articlesRes = await getUserArticles(currentUser.value.username, { page: 1, pageSize: 100 });

      // 计算统计信息
      let totalLikes = 0;
      let totalFavorites = 0;

      // 直接使用后端返回的数据计算
      articlesRes.list.forEach((article: any) => {
        totalLikes += article.likesCount || article.likes || 0;
        totalFavorites += article.favoritesCount || 0;
      });

      userStats.value = {
        articleCount: articlesRes.total || 0,
        totalLikes,
        totalFavorites
      };
    } else {
      // 未登录用户显示默认值
      userStats.value = {
        articleCount: 0,
        totalLikes: 0,
        totalFavorites: 0
      };
    }
  } catch (error) {
    console.error('获取用户统计失败:', error);
    // 出错时设置默认值
    userStats.value = {
      articleCount: 0,
      totalLikes: 0,
      totalFavorites: 0
    };
  }
};

/**
 * 处理分类点击
 * @param name 分类名称
 */
const handleCategoryClick = (name: string) => {
  emit('category-click', name);
  router.push(`/category/${name}`);
};

/**
 * 处理标签点击
 * @param name 标签名称
 */
const handleTagClick = (name: string) => {
  emit('tag-click', name);
  router.push(`/tag/${name}`);
};

// 组件挂载时获取数据
onMounted(async () => {
  await userStore.initUserInfo();
  await Promise.all([fetchUserStats(), fetchHotArticles()]);
});
</script>

<style scoped lang="scss">
@import './Sidebar.scss';
</style>
