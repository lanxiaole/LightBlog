<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ArticleListPage from '@/components/article/ArticleListPage.vue';
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

<template>
  <ArticleListPage
    :title="`标签：${tagName}`"
    :fetch-data="fetchArticles"
    empty-text="该标签下暂无文章"
  >
    <template #sidebar>
      <el-card class="sidebar-card">
        <template #header>
          <div class="sidebar-title">热门推荐</div>
        </template>
        <div class="sidebar-content">
          <p>热门文章 1</p>
          <p>热门文章 2</p>
          <p>热门文章 3</p>
          <p>热门文章 4</p>
          <p>热门文章 5</p>
        </div>
      </el-card>

      <el-card class="sidebar-card" style="margin-top: 20px;">
        <template #header>
          <div class="sidebar-title">热门标签</div>
        </template>
        <div class="sidebar-content">
          <el-tag size="small" type="info" style="margin: 5px;">Vue</el-tag>
          <el-tag size="small" type="info" style="margin: 5px;">TypeScript</el-tag>
          <el-tag size="small" type="info" style="margin: 5px;">JavaScript</el-tag>
          <el-tag size="small" type="info" style="margin: 5px;">React</el-tag>
          <el-tag size="small" type="info" style="margin: 5px;">Node.js</el-tag>
        </div>
      </el-card>
    </template>
  </ArticleListPage>
</template>

<style scoped>
.sidebar-card {
  margin-bottom: 20px;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.sidebar-content {
  padding: 10px 0;
}

.sidebar-content p {
  margin: 10px 0;
  font-size: 14px;
  color: #606266;
}
</style>
