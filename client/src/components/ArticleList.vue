<script setup lang="ts">
import { ElCard, ElPagination } from 'element-plus';
import type { Article } from '@/api/article';

/**
 * 文章列表组件
 * 展示文章列表，支持分页
 */

// 组件属性定义
interface Props {
  /** 文章列表数据 */
  articles: {
    list: Article[];
    total: number;
    page: number;
    pageSize: number;
  };
  /** 加载状态 */
  loading?: boolean;
}

// 定义组件属性并设置默认值
defineProps<Props>();

// 定义组件事件
const emit = defineEmits<{
  /** 页码变化事件 */
  'page-change': [currentPage: number];
  /** 页大小变化事件 */
  'page-size-change': [pageSize: number];
}>();

/**
 * 处理页码变化
 * @param currentPage 当前页码
 */
const handlePageChange = (currentPage: number) => {
  emit('page-change', currentPage);
};

/**
 * 截取文章摘要
 * @param content 文章内容
 * @returns 摘要文本
 */
const getArticleSummary = (content: string): string => {
  // 移除 HTML 标签，截取前 100 字
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
};
</script>

<template>
  <div class="articles-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="h3" style="width: 60%; margin-bottom: 16px;" />
          <el-skeleton-item variant="text" style="margin-bottom: 8px;" />
          <el-skeleton-item variant="text" style="width: 80%; margin-bottom: 24px;" />
        </template>
      </el-skeleton>
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="h3" style="width: 60%; margin-bottom: 16px;" />
          <el-skeleton-item variant="text" style="margin-bottom: 8px;" />
          <el-skeleton-item variant="text" style="width: 80%; margin-bottom: 24px;" />
        </template>
      </el-skeleton>
    </div>

    <!-- 文章列表 -->
    <template v-else>
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
    </template>

    <!-- 分页组件 -->
    <div v-if="articles.total > articles.pageSize" class="pagination-container">
      <ElPagination
        :current-page="articles.page"
        :page-size="articles.pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="articles.total"
        @current-change="handlePageChange"
        @size-change="(size) => emit('page-size-change', size)"
      />
    </div>
  </div>
</template>

<style scoped>
.articles-container {
  margin-top: 20px;
}

.loading-state {
  padding: 20px 0;
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
  line-clamp: 2;
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
</style>
