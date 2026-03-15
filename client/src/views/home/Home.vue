<script setup lang="ts">
import ArticleListPage from '@/components/article/ArticleListPage.vue';
import Sidebar from '@/components/Sidebar.vue';
import { getArticles } from '@/api/article';
import { getCategories } from '@/api/category';
import { getTags } from '@/api/tag';
import { ref, onMounted } from 'vue';
import type { Category } from '@/api/category';
import type { Tag } from '@/api/tag';

/**
 * 首页
 * 展示文章列表和侧边栏
 */

const categories = ref<Category[]>([]);
const tags = ref<Tag[]>([]);

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

/**
 * 获取分类和标签数据
 */
const fetchSidebarData = async () => {
  try {
    const [categoriesRes, tagsRes] = await Promise.all([
      getCategories(),
      getTags()
    ]);
    categories.value = categoriesRes;
    tags.value = tagsRes;
  } catch (error) {
    console.error('获取侧边栏数据失败:', error);
  }
};

// 组件挂载时获取侧边栏数据
onMounted(() => {
  fetchSidebarData();
});
</script>

<template>
  <ArticleListPage
    title="文章列表"
    :fetch-data="fetchArticles"
    empty-text="暂无文章"
  >
    <template #sidebar>
      <Sidebar :categories="categories" :tags="tags" />
    </template>
  </ArticleListPage>
</template>
