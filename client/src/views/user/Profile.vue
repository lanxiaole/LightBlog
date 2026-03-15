<script setup lang="ts">
import { ElSkeleton, ElCard, ElDivider } from 'element-plus';
import 'element-plus/dist/index.css';
import { useUserProfile } from '@/composables/user/useUserProfile';
import UserInfoCard from '@/components/user/UserInfoCard.vue';
import ArticleList from '@/components/ArticleList.vue';

/**
 * 用户资料页面
 * 展示用户信息和文章列表
 */

const {
  user,
  articles,
  loading,
  error,
  userNotFound,
  isCurrentUser,
  handlePageChange,
  goToSettings
} = useUserProfile();
</script>

<template>
  <div class="profile-container">
    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 用户不存在提示 -->
    <div v-else-if="userNotFound" class="not-found">
      <h2>用户不存在</h2>
      <p>抱歉，您访问的用户不存在或已被删除。</p>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-container">
      <ElCard class="user-card">
        <ElSkeleton :rows="6" animated />
      </ElCard>
      <ElCard class="articles-card" style="margin-top: 20px;">
        <ElSkeleton :rows="10" animated />
      </ElCard>
    </div>

    <!-- 用户资料和文章列表 -->
    <template v-else>
      <!-- 用户信息卡片 -->
      <UserInfoCard
        :user="user"
        :is-current-user="isCurrentUser"
        :followers-count="123"
        :following-count="456"
        @edit="goToSettings"
      />

      <ElDivider>文章列表</ElDivider>

      <!-- 文章列表 -->
      <ArticleList
        :articles="articles"
        :loading="loading"
        @page-change="handlePageChange"
        @page-size-change="(size) => handlePageChange(1, size)"
      />
    </template>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
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
