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

    <!-- 最新评论 -->
    <div class="sidebar-section">
      <div class="section-header">
        <el-icon><ChatDotRound /></el-icon>
        <span>最新评论</span>
      </div>
      <div class="recent-comments">
        <div
          v-for="comment in recentComments"
          :key="comment.id"
          class="comment-item"
          @click="navigateToArticle(comment.article_id)"
        >
          <div class="comment-author">
            <el-avatar :size="28" :src="comment.author?.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <span class="author-name">{{ comment.author?.username || '匿名用户' }}</span>
          </div>
          <p class="comment-content">{{ truncateContent(comment.content) }}</p>
          <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
        </div>
        <p v-if="recentComments.length === 0" class="empty-hint">
          暂无评论
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
import { Search, UserFilled, CollectionTag, ChatDotRound, Folder, ArrowRight, User, Document, Star } from '@element-plus/icons-vue';
import type { Category } from '@/api/category';
import type { Tag } from '@/api/tag';
import type { Comment } from '@/api/comment';
import { getUserArticles } from '@/api/user';
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

// 最新评论数据
const recentComments = ref<Comment[]>([]);

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
 * 截断评论内容
 * @param content 评论内容
 */
const truncateContent = (content: string): string => {
  return content.length > 50 ? content.substring(0, 50) + '...' : content;
};

/**
 * 格式化时间
 * @param dateString 日期字符串
 */
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
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
  await fetchUserStats();
});
</script>

<style scoped lang="scss">
// 颜色变量
$primary-color: #1E3A8A;
$secondary-color: #F97316;
$bg-light: #F3F4F6;
$text-dark: #111827;
$text-gray: #6B7280;
$text-light: #9CA3AF;
$white: #FFFFFF;
$border-color: #E5E7EB;

.sidebar {
  width: 100%;
}

// 侧边栏区块
.sidebar-section {
  background: $white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  overflow: hidden;
}

// 搜索框样式
.search-widget {
  padding: 16px;

  :deep(.sidebar-search) {
    .el-input__wrapper {
      border-radius: 6px 0 0 6px;
      box-shadow: 0 0 0 1px $border-color inset;
      transition: box-shadow 0.2s linear;

      &:hover,
      &.is-focus {
        box-shadow: 0 0 0 1px $primary-color inset;
      }
    }

    .el-input-group__append {
      background-color: $primary-color;
      border-color: $primary-color;
      border-radius: 0 6px 6px 0;
      padding: 0 12px;

      .search-btn {
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

// 区块标题
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 16px 12px;
  font-size: 15px;
  font-weight: 600;
  color: $text-dark;
  border-bottom: 1px solid $border-color;

  .el-icon {
    font-size: 18px;
    color: $primary-color;
  }
}

// 个人信息卡片
.personal-card {
  padding: 24px 16px;
  text-align: center;
}

.personal-avatar {
  margin-bottom: 12px;

  :deep(.el-avatar) {
    border: 3px solid rgba($primary-color, 0.1);
  }
}

.personal-name {
  font-size: 18px;
  font-weight: 600;
  color: $text-dark;
  margin: 0 0 8px 0;
}

.personal-bio {
  font-size: 13px;
  color: $text-gray;
  line-height: 1.6;
  margin: 0 0 20px 0;
  padding: 0 8px;
  min-height: 40px;
}

// 用户统计信息
.personal-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 8px;
  padding: 16px 8px;
  background: $bg-light;
  border-radius: 6px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.stat-icon {
  font-size: 16px;
  color: $primary-color;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-num {
  font-size: 16px;
  font-weight: 700;
  color: $text-dark;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: $text-light;
  line-height: 1;
  margin-top: 2px;
}

// 标签云
.tags-cloud {
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 6px 12px;
  background: rgba($primary-color, 0.06);
  color: $text-gray;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s linear;

  &:hover {
    background: $primary-color;
    color: white;
  }
}

// 最新评论
.recent-comments {
  padding: 12px 16px;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid $border-color;
  cursor: pointer;
  transition: background-color 0.2s linear;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba($bg-light, 0.5);
    margin: 0 -16px;
    padding-left: 16px;
    padding-right: 16px;
  }
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.author-name {
  font-size: 13px;
  font-weight: 500;
  color: $text-dark;
}

.comment-content {
  font-size: 13px;
  color: $text-gray;
  line-height: 1.5;
  margin: 0 0 6px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comment-time {
  font-size: 11px;
  color: $text-light;
}

// 分类列表
.category-list {
  padding: 8px 0;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s linear;

  &:hover {
    background-color: $bg-light;

    .category-name {
      color: $primary-color;
    }

    .el-icon {
      color: $primary-color;
      transform: translateX(2px);
    }
  }

  .el-icon {
    font-size: 14px;
    color: $text-light;
    transition: all 0.2s linear;
  }
}

.category-name {
  font-size: 14px;
  color: $text-gray;
  transition: color 0.2s linear;
}

// 空状态提示
.empty-hint {
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: $text-light;
  margin: 0;
}

// 移动端适配
@media (max-width: 767px) {
  .sidebar-section {
    margin-bottom: 16px;
  }

  .blogger-card {
    padding: 20px 16px;
  }

  .tags-cloud {
    padding: 12px;
  }

  .recent-comments {
    padding: 8px 12px;
  }
}
</style>
