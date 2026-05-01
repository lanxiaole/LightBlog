<template>
  <ArticleListPage
    title="文章列表"
    :fetch-data="fetchArticles"
    empty-text="暂无文章"
  >
    <template #sidebar>
      <Sidebar />
    </template>
  </ArticleListPage>
</template>

<script setup lang="ts">
import ArticleListPage from '@/components/article/ArticleListPage.vue';
import Sidebar from '@/components/common/Sidebar.vue';
import { getArticles } from '@/api/article';

/**
 * 首页
 * 展示文章列表和侧边栏
 */

/**
 * 获取文章列表数据
 * @param params 分页参数
 */
const fetchArticles = async (params: { page: number; pageSize: number }) => {
  const response = await getArticles(params);
  return {
    list: response.list,
    total: response.total
  };
};
</script>
