<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElEmpty, ElPagination, ElAlert } from 'element-plus';
import { useUserFavorites } from '@/composables/user/useUserFavorites';
import { useUserStore } from '@/stores/user';
import ArticleCard from '@/components/article/ArticleCard.vue';
import LoadingState from '@/components/common/LoadingState.vue';
import ErrorState from '@/components/common/ErrorState.vue';

// 获取路由参数
const route = useRoute();
const username = computed(() => route.params.username as string);

// 获取用户 store
const userStore = useUserStore();

// 计算是否是当前登录用户
const isCurrentUser = computed(() => {
  return userStore.isLoggedIn && userStore.userInfo?.username === username.value;
});

// 获取收藏文章列表
const { articles, total, page, pageSize, loading, error, fetchFavorites } = useUserFavorites();

// 跳转到文章详情
const navigateToArticle = (id: number) => {
  window.location.href = `/article/${id}`;
};

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  fetchFavorites(1, size);
};

// 处理页码变化
const handleCurrentChange = (current: number) => {
  fetchFavorites(current, pageSize.value);
};

// 组件挂载时获取第一页数据
onMounted(() => {
  if (isCurrentUser.value) {
    fetchFavorites(1, 10);
  }
});
</script>

<template>
  <div class="favorites-page">
    <h2 class="page-title">我的收藏</h2>

    <!-- 非本人可见提示 -->
    <ElAlert
      v-if="!isCurrentUser"
      title="只有本人可见"
      type="warning"
      :closable="false"
      show-icon
      class="permission-alert"
    />

    <!-- 加载状态 -->
    <LoadingState v-else-if="loading" />

    <!-- 错误状态 -->
    <ErrorState v-else-if="error" :message="error" @retry="() => fetchFavorites(page, pageSize)" />

    <!-- 空状态 -->
    <ElEmpty v-else-if="articles.length === 0" description="暂无收藏文章" />

    <!-- 文章列表 -->
    <div v-else class="article-list">
      <ArticleCard
        v-for="article in articles"
        :key="article.id"
        :article="article"
        @click="navigateToArticle"
      />
    </div>

    <!-- 分页组件 -->
    <div v-if="!loading && !error && articles.length > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="page"
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
</template>

<style scoped>
.favorites-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.permission-alert {
  margin-bottom: 20px;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .favorites-page {
    padding: 10px;
  }
}
</style>