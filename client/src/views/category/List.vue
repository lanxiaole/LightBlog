<template>
  <ArticleListPage
    :title="`分类：${categoryName}`"
    :fetch-data="fetchArticles"
    empty-text="该分类下暂无文章"
  >
    <template #sidebar>
      <Sidebar :show-search="false" :show-personal="false" :show-hot-articles="false" :show-hot-tags="false" :show-hot-categories="true" />
    </template>
  </ArticleListPage>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ArticleListPage from '@/components/article/ArticleListPage.vue';
import Sidebar from '@/components/common/Sidebar.vue';
import { getArticlesByCategory } from '@/api/article';

/**
 * 分类文章列表页
 * 展示指定分类下的文章列表
 */

const route = useRoute();

// 从路由参数获取分类名称
const categoryName = computed(() => route.params.name as string || '');

/**
 * 获取分类文章列表数据
 * @param params 分页参数
 */
const fetchArticles = async (params: { page: number; pageSize: number }) => {
  if (!categoryName.value) {
    throw new Error('分类名称不能为空');
  }

  const response = await getArticlesByCategory(categoryName.value, params);
  return {
    list: response.list,
    total: response.total
  };
};
</script>
