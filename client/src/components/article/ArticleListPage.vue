<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Article } from '@/api/article';
import LoadingState from '@/components/common/LoadingState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ArticleCard from './ArticleCard.vue';

/**
 * 文章列表页面通用组件
 * 封装文章列表页面的通用逻辑和布局
 */

interface FetchParams {
  page: number;
  pageSize: number;
}

interface FetchResult {
  list: Article[];
  total: number;
}

interface Props {
  /** 页面标题 */
  title?: string;
  /** 数据获取函数 */
  fetchData: (params: FetchParams) => Promise<FetchResult>;
  /** 空状态提示文本 */
  emptyText?: string;
  /** 是否显示分页 */
  showPagination?: boolean;
  /** 是否显示侧边栏 */
  showSidebar?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  emptyText: '暂无文章',
  showPagination: true,
  showSidebar: true
});

const router = useRouter();

// 数据状态
const articles = ref<Article[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const error = ref('');

/**
 * 加载数据
 */
const loadData = async () => {
  try {
    loading.value = true;
    error.value = '';

    const response = await props.fetchData({
      page: currentPage.value,
      pageSize: pageSize.value
    });

    articles.value = response.list;
    total.value = response.total;
  } catch (err: any) {
    error.value = err.message || '获取数据失败';
  } finally {
    loading.value = false;
  }
};

/**
 * 跳转到文章详情
 * @param id 文章ID
 */
const navigateToArticle = (id: number) => {
  router.push(`/article/${id}`);
};

/**
 * 处理分页大小变化
 * @param size 分页大小
 */
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  loadData();
};

/**
 * 处理页码变化
 * @param current 当前页码
 */
const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  loadData();
};

// 组件挂载时加载数据
onMounted(() => {
  loadData();
});

// 暴露方法给父组件
defineExpose({
  reload: loadData,
  currentPage,
  pageSize
});
</script>

<template>
  <div class="article-list-page" :class="{ 'no-sidebar': !showSidebar }">
    <div class="main-content">
      <!-- 左侧文章列表 -->
      <div class="article-list">
        <h2 v-if="title" class="page-title">{{ title }}</h2>

        <!-- 加载状态 -->
        <LoadingState v-if="loading" />

        <!-- 错误状态 -->
        <ErrorState
          v-else-if="error"
          :message="error"
          @retry="loadData"
        />

        <!-- 空状态 -->
        <EmptyState
          v-else-if="articles.length === 0"
          :description="emptyText"
        />

        <!-- 文章列表 -->
        <div v-else class="article-items">
          <ArticleCard
            v-for="article in articles"
            :key="article.id"
            :article="article"
            @click="navigateToArticle"
          />
        </div>

        <!-- 分页组件 -->
        <div v-if="showPagination && !loading && !error && total > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :pager-count="5"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 右侧侧边栏插槽 -->
      <div v-if="showSidebar" class="sidebar">
        <slot name="sidebar" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-list-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px 0;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
  padding: 0 20px;
}

.article-list {
  flex: 1;
  min-width: 0;
}

.sidebar {
  width: 200px;
  flex-shrink: 0;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.article-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }
}
</style>
