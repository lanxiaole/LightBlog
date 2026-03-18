<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { searchArticles } from '@/api/search';
import { ElPagination } from 'element-plus';
import ArticleCard from '@/components/article/ArticleCard.vue';
import LoadingState from '@/components/common/LoadingState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import type { Article } from '@/api/article';

const route = useRoute();
const router = useRouter();

// 响应式状态
const keyword = ref<string>('');
const articles = ref<Article[]>([]);
const total = ref<number>(0);
const page = ref<number>(1);
const pageSize = ref<number>(10);
const loading = ref<boolean>(false);
const error = ref<string>('');

// 从 URL 查询参数获取关键词
const getKeywordFromRoute = () => {
  const routeKeyword = route.query.keyword as string;
  keyword.value = routeKeyword || '';
};

// 获取搜索结果
const fetchResults = async () => {
  if (!keyword.value) return;

  loading.value = true;
  error.value = '';

  try {
    const result = await searchArticles({
      keyword: keyword.value,
      page: page.value,
      pageSize: pageSize.value
    });

    articles.value = result.list;
    total.value = result.total;
    page.value = result.page;
    pageSize.value = result.pageSize;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '搜索失败';
    articles.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 监听关键词和分页参数变化
watch(
  [keyword, page, pageSize],
  () => {
    fetchResults();
  },
  { immediate: false }
);

// 监听路由变化，更新关键词
watch(
  () => route.query.keyword,
  () => {
    getKeywordFromRoute();
    page.value = 1; // 重置页码
    fetchResults();
  },
  { immediate: true }
);

// 处理文章点击
const handleArticleClick = (id: number) => {
  router.push(`/article/${id}`);
};

// 处理分页变化
const handlePageChange = (currentPage: number) => {
  page.value = currentPage;
};

// 处理重试
const handleRetry = () => {
  fetchResults();
};
</script>

<template>
  <div class="search-page">
    <div class="page-header">
      <h1>搜索</h1>
      <div class="search-keyword" v-if="keyword">
        搜索关键词: <span class="keyword">{{ keyword }}</span>
      </div>
    </div>

    <div class="article-list">
      <!-- 加载状态 -->
      <LoadingState v-if="loading" />

      <!-- 错误状态 -->
      <ErrorState
        v-else-if="error"
        :message="error"
        @retry="handleRetry"
      />

      <!-- 空状态 -->
      <EmptyState
        v-else-if="articles.length === 0 && !loading && !error"
        :description="keyword ? '没有找到相关文章' : '请输入搜索关键词'"
      />

      <!-- 文章列表 -->
      <div v-else class="articles">
        <ArticleCard
          v-for="article in articles"
          :key="article.id"
          :article="article"
          @click="handleArticleClick(article.id)"
        />
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > 0 && !loading && !error">
      <ElPagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="(size) => pageSize = size"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.search-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #303133;
}

.search-keyword {
  font-size: 14px;
  color: #606266;
}

.keyword {
  font-weight: 600;
  color: #409eff;
}

.article-list {
  margin-bottom: 20px;
}

.articles {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
