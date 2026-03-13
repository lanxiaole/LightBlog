<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElCard, ElAvatar, ElSkeleton, ElPagination, ElButton, ElSpace, ElDivider } from 'element-plus';
import 'element-plus/dist/index.css';
import { getUserProfile, getUserArticles, type User } from '@/api/user';
import { useUserStore } from '@/stores/user';
import type { Article } from '@/api/article';

// 获取路由和路由参数
const route = useRoute();
const router = useRouter();
const username = computed(() => route.params.username as string);

// 获取用户 store
const userStore = useUserStore();

// 响应式数据
const user = ref<User | null>(null);
const articles = ref<{ list: Article[]; total: number; page: number; pageSize: number }>({
  list: [],
  total: 0,
  page: 1,
  pageSize: 10
});
const loading = ref(true);
const error = ref<string | null>(null);
const userNotFound = ref(false);

// 计算属性：是否是当前登录用户
const isCurrentUser = computed(() => {
  return userStore.isLoggedIn && userStore.userInfo?.username === username.value;
});

// 方法：获取用户信息
const fetchUserProfile = async () => {
  try {
    const userData = await getUserProfile(username.value);
    user.value = userData;
    userNotFound.value = false;
  } catch (err: any) {
    if (err.response?.status === 404) {
      userNotFound.value = true;
    } else {
      error.value = '获取用户信息失败';
    }
  }
};

// 方法：获取用户文章列表
const fetchUserArticles = async (page: number = 1, pageSize: number = 10) => {
  try {
    const articlesData = await getUserArticles(username.value, { page, pageSize });
    articles.value = articlesData;
  } catch (err) {
    console.error('获取用户文章列表失败:', err);
    error.value = '获取文章列表失败';
  }
};

// 方法：切换页码
const handlePageChange = (currentPage: number) => {
  fetchUserArticles(currentPage, articles.value.pageSize);
};

// 方法：跳转到编辑资料页面
const goToSettings = () => {
  router.push('/settings');
};

// 方法：截取文章摘要
const getArticleSummary = (content: string): string => {
  // 移除 HTML 标签，截取前 100 字
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
};

// 生命周期钩子：组件挂载时
onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    // 并行请求用户信息和文章列表
    await Promise.all([
      fetchUserProfile(),
      fetchUserArticles()
    ]);
  } catch (err) {
    console.error('加载用户信息和文章列表失败:', err);
    error.value = '加载失败';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="profile-container">
    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 用户不存在提示 -->
    <div v-else-if="userNotFound" class="not-found">
      <h2>用户不存在</h2>
      <p>抱歉，您访问的用户不存在或已被删除。</p>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-container">
      <ElCard class="user-card">
        <ElSkeleton :rows="6" animated />
      </ElCard>
      <ElCard class="articles-card" style="margin-top: 20px;">
        <ElSkeleton :rows="10" animated />
      </ElCard>
    </div>

    <!-- 用户资料和文章列表 -->
    <template v-else>
      <!-- 用户信息卡片 -->
      <ElCard class="user-card">
        <div class="user-info">
          <ElAvatar :size="'large'" :src="user?.avatar || ''" class="user-avatar">
            {{ user?.username.charAt(0).toUpperCase() }}
          </ElAvatar>
          <div class="user-details">
            <h2 class="username">{{ user?.username }}</h2>
            <p class="bio" v-if="user?.bio">{{ user?.bio }}</p>
            <p class="bio" v-else>该用户还没有填写个人简介</p>
            <ElSpace class="user-stats">
              <span>关注 123</span>
              <span>粉丝 456</span>
              <ElButton v-if="isCurrentUser" type="primary" @click="goToSettings" style="margin-left: 20px;">
                编辑资料
              </ElButton>
            </ElSpace>
          </div>
        </div>
      </ElCard>

      <ElDivider>文章列表</ElDivider>

      <!-- 文章列表 -->
      <div class="articles-container">
        <router-link :to="`/article/${article.id}`" v-for="article in articles.list" :key="article.id" style="text-decoration: none; color: inherit;">
          <ElCard class="article-card" style="cursor: pointer;">
            <h3 class="article-title">{{ article.title }}</h3>
            <p class="article-summary">{{ getArticleSummary(article.content) }}</p>
            <div class="article-meta">
              <span>{{ new Date(article.created_at).toLocaleDateString() }}</span>
              <span>阅读 {{ article.views }}</span>
            </div>
          </ElCard>
        </router-link>

        <!-- 无文章提示 -->
        <div v-if="articles.list.length === 0" class="no-articles">
          <p>该用户还没有发布文章</p>
        </div>

        <!-- 分页组件 -->
        <div v-if="articles.total > articles.pageSize" class="pagination-container">
          <ElPagination
            v-model:current-page="articles.page"
            v-model:page-size="articles.pageSize"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="articles.total"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.error-message {
  color: #f56c6c;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.not-found {
  text-align: center;
  padding: 60px 0;
}

.not-found h2 {
  font-size: 24px;
  color: #606266;
  margin-bottom: 10px;
}

.loading-container {
  margin-top: 20px;
}

.user-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.user-avatar {
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: #303133;
}

.bio {
  font-size: 14px;
  color: #606266;
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.user-stats {
  margin-bottom: 10px;
}

.user-stats span {
  color: #606266;
  font-size: 14px;
}

.articles-container {
  margin-top: 20px;
}

.article-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.article-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.article-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: #303133;
}

.article-summary {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin: 0 0 15px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
  margin-top: 10px;
}

.no-articles {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .user-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-details {
    width: 100%;
  }
}
</style>
