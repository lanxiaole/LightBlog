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
@import './ArticleContent.scss';
</style>
