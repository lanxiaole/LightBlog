<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { ElPagination } from 'element-plus';
import 'element-plus/dist/index.css';
import { useUserArticles } from '@/composables/user/useUserArticles';
import ArticleCard from '@/components/article/ArticleCard.vue';
import LoadingState from '@/components/common/LoadingState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import EmptyState from '@/components/common/EmptyState.vue';

/**
 * 用户文章列表页面
 * 展示用户发布的文章列表
 */

const route = useRoute();
const username = computed(() => route.params.username as string);

const {
  articles,
  total,
  page,
  pageSize,
  loading,
  error,
  fetchArticles,
  setPage,
  setPageSize
} = useUserArticles(username);
</script>

<template>
  <div class="profile-container">
    <!-- 加载状态 -->
    <LoadingState v-if="loading" />

    <!-- 错误状态 -->
    <ErrorState v-else-if="error" :message="error" @retry="fetchArticles" />

    <!-- 文章列表 -->
    <div v-else class="articles-section">
      <!-- 空状态 -->
      <EmptyState v-if="articles.length === 0" text="该用户还没有发布文章" />

      <!-- 文章卡片列表 -->
      <div v-else class="articles-list">
        <ArticleCard
          v-for="article in articles"
          :key="article.id"
          :article="article"
        />
      </div>

      <!-- 分页组件 -->
      <div v-if="total > 0" class="pagination-container">
        <ElPagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="setPageSize"
          @current-change="setPage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.articles-section {
  margin-top: 20px;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
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

.articles-card {
  margin-top: 20px;
}
</style>
