<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ElCard, ElSkeleton, ElSkeletonItem, ElEmpty, ElButton } from 'element-plus';
import ArticleHeader from '@/components/article/ArticleHeader.vue';
import type { Article } from '@/api/article';

/**
 * 文章内容组件
 * 展示文章详情，处理加载和错误状态
 */

interface Props {
  /** 文章数据 */
  article: Article | null;
  /** 是否加载中 */
  loading: boolean;
  /** 错误信息 */
  error: string;
  /** 是否为作者 */
  isAuthor: boolean;
  /** 评论总数 */
  totalComments: number;
  /** 点赞数量（可选） */
  likesCount?: number;
  /** 是否已收藏 */
  favorited?: boolean;
  /** 收藏数量 */
  favoritesCount?: number;
  /** 收藏操作加载状态 */
  favoriting?: boolean;
  /** 目标用户 ID，可为 null */
  targetUserId: number | null;
  /** 当前用户是否已关注 */
  isFollowing: boolean;
  /** 关注操作是否正在加载 */
  followLoading: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  /** 编辑文章 */
  edit: [];
  /** 删除文章 */
  delete: [];
  /** 切换关注状态 */
  follow: [];
}>();

const router = useRouter();
</script>

<template>
  <!-- 加载状态 -->
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

  <!-- 错误状态 -->
  <div v-else-if="error || !article" class="error-container">
    <el-empty description="文章不存在" />
    <el-button type="primary" @click="router.push('/')">返回首页</el-button>
  </div>

  <!-- 文章内容 -->
  <el-card v-else class="article-card">
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

    <div class="article-content" v-html="article.content"></div>
  </el-card>
</template>

<style scoped>
.loading-container {
  margin: 20px 0;
}

.error-container {
  text-align: center;
  padding: 40px 0;
}

.error-container .el-button {
  margin-top: 20px;
}

.article-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  margin: 20px 0;
}

.article-content img {
  max-width: 100%;
  height: auto;
  margin: 10px 0;
}

.article-content p {
  margin-bottom: 16px;
}
</style>
