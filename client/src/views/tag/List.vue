<template>
  <ArticleListPage
    :title="`标签：${tagName}`"
    :fetch-data="fetchArticles"
    empty-text="该标签下暂无文章"
  >
    <template #sidebar>
      <Sidebar :show-search="false" :show-personal="false" :show-hot-articles="false" :show-hot-tags="true" :show-hot-categories="false" />
    </template>
  </ArticleListPage>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ArticleListPage from '@/components/article/ArticleListPage.vue';
import Sidebar from '@/components/common/Sidebar.vue';
import { getArticlesByTag } from '@/api/article';

/**
 * 标签文章列表页
 * 展示指定标签下的文章列表
 */

const route = useRoute();

// 从路由参数获取标签名称
const tagName = computed(() => route.params.name as string || '');

/**
 * 获取标签文章列表数据
 * @param params 分页参数
 */
const fetchArticles = async (params: { page: number; pageSize: number }) => {
  if (!tagName.value) {
    throw new Error('标签名称不能为空');
  }

  const response = await getArticlesByTag(tagName.value, params);
  return {
    list: response.list,
    total: response.total
  };
};
</script>
