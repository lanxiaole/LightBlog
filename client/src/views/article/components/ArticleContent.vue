<template>
  <div v-if="loading" class="loading-container">
    <el-skeleton animated>
      <el-skeleton-item variant="h1" style="width: 80%; margin-bottom: 20px;"></el-skeleton-item>
      <el-skeleton-item variant="text" style="width: 60%; margin-bottom: 10px;"></el-skeleton-item>
      <el-skeleton-item variant="text" style="width: 40%; margin-bottom: 20px;"></el-skeleton-item>
      <el-skeleton-item variant="p" style="margin-bottom: 20px;"></el-skeleton-item>
      <el-skeleton-item variant="p" style="margin-bottom: 20px;"></el-skeleton-item>
      <el-skeleton-item variant="p" style="margin-bottom: 20px;"></el-skeleton-item>
    </el-skeleton>
  </div>

  <div v-else-if="error || !article" class="error-container">
    <el-empty description="文章不存在" />
    <el-button type="primary" @click="router.push('/')">返回首页</el-button>
  </div>

  <article v-else class="article-card">
    <ArticleHeader
      :article="article"
      :is-author="isAuthor"
      :total-comments="totalComments"
      :likes-count="likesCount"
      :favorited="favorited"
      :favorites-count="favoritesCount"
      :favoriting="favoriting"
      :target-user-id="targetUserId"
      :is-following="isFollowing"
      :follow-loading="followLoading"
      @edit="emit('edit')"
      @delete="emit('delete')"
      @follow="emit('follow')"
    />

    <div class="article-body" v-html="article.content"></div>
  </article>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ElSkeleton, ElSkeletonItem, ElEmpty, ElButton } from 'element-plus';
import ArticleHeader from '@/components/article/ArticleHeader.vue';
import type { Article } from '@/api/article';

interface Props {
  article: Article | null;
  loading: boolean;
  error: string;
  isAuthor: boolean;
  totalComments: number;
  likesCount?: number;
  favorited?: boolean;
  favoritesCount?: number;
  favoriting?: boolean;
  targetUserId: number | null;
  isFollowing?: boolean;
  followLoading?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  edit: [];
  delete: [];
  follow: [];
}>();

const router = useRouter();
</script>

<style scoped>
.loading-container {
  margin: 20px 0;
}

.error-container {
  text-align: center;
  padding: 60px 0;
}

.error-container .el-button {
  margin-top: 20px;
}

.article-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 32px;
}

.article-body {
  font-size: 16px;
  line-height: 1.8;
  color: #111827;
  margin-top: 24px;
}

.article-body h1 {
  font-size: 28px;
  font-weight: 600;
  color: #111827;
  margin: 24px 0 16px;
  line-height: 1.4;
}

.article-body h2 {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 22px 0 14px;
  line-height: 1.4;
}

.article-body h3 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 20px 0 12px;
  line-height: 1.4;
}

.article-body p {
  margin-bottom: 16px;
}

.article-body img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  display: block;
  margin: 16px auto;
}

.article-body code {
  background-color: #F3F4F6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
}

.article-body pre {
  background-color: #F3F4F6;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 16px 0;
}

.article-body pre code {
  background: none;
  padding: 0;
  font-size: 14px;
  line-height: 1.6;
}

.article-body blockquote {
  border-left: 4px solid #1E3A8A;
  background-color: #F9FAFB;
  padding: 12px 16px;
  margin: 16px 0;
  border-radius: 0 6px 6px 0;
  color: #4B5563;
}

.article-body ul,
.article-body ol {
  margin: 16px 0;
  padding-left: 24px;
}

.article-body li {
  margin-bottom: 8px;
}

.article-body hr {
  border: none;
  border-top: 1px solid #E5E7EB;
  margin: 32px 0;
}

@media (max-width: 768px) {
  .article-card {
    padding: 20px;
  }

  .article-body {
    font-size: 15px;
  }

  .article-body h1 {
    font-size: 24px;
  }

  .article-body h2 {
    font-size: 20px;
  }

  .article-body h3 {
    font-size: 18px;
  }
}
</style>
