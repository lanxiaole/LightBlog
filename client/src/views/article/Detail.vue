<template>
  <div class="article-detail">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button type="text" icon="el-icon-arrow-left" @click="router.back()">
        返回
      </el-button>
    </div>

    <!-- 文章内容 -->
    <ArticleContent
      :article="article"
      :loading="loading"
      :error="error"
      :is-author="isAuthor"
      :total-comments="totalComments"
      :likes-count="likesCount"
      :favorited="favorited"
      :favorites-count="favoritesCount"
      :favoriting="favoriting"
      :target-user-id="targetUserId"
      :is-following="isFollowing || false"
      :follow-loading="followLoading || false"
      @edit="handleEdit"
      @delete="handleDelete"
      @follow="toggleFollow"
    />

    <div v-if="!loading && !error && article" class="action-bar">
      <el-button
        :class="['action-btn', { 'active': liked }]"
        :loading="liking"
        @click="handleLike"
      >
        <span :class="liked ? 'icon-thumbs-up-filled' : 'icon-thumbs-up'" style="margin-right: 6px;"></span>
        <span>{{ likesCount }}</span>
      </el-button>
      <el-button
        :class="['action-btn', { 'active': favorited }]"
        :loading="favoriting"
        @click="toggleFavorite"
      >
        <el-icon>
          <star-filled v-if="favorited" />
          <star v-else />
        </el-icon>
        <span style="margin-left: 6px;">{{ favoritesCount }}</span>
      </el-button>
      <el-button class="action-btn" @click="handleShare">
        <el-icon><Share /></el-icon>
        <span style="margin-left: 6px;">分享</span>
      </el-button>
    </div>

    <CommentSection
      v-if="!loading && !error && article"
      v-model:new-comment="newComment"
      :comments="comments"
      :comment-tree="commentTree"
      :total-comments="totalComments"
      :comment-page="commentPage"
      :comment-page-size="commentPageSize"
      :reply-to="replyTo"
      :submitting="submitting"
      :loading="commentLoading"
      @submit="handleCreateComment"
      @cancel-reply="handleCancelReply"
      @reply="handleReply"
      @delete="handleDeleteComment"
      @page-change="handlePageChange"
    />

    <el-backtop :right="40" :bottom="40" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElButton, ElBacktop, ElIcon } from 'element-plus';
import { Star, StarFilled, Share } from '@element-plus/icons-vue';
import { useArticle } from '@/composables/article/useArticle';
import { useFavorite } from '@/composables/article/useFavorite';
import { useComments } from '@/composables/comment/useComments';
import { useFollow } from '@/composables/user/useFollow';
import ArticleContent from './components/ArticleContent.vue';
import CommentSection from './components/CommentSection.vue';

const route = useRoute();
const router = useRouter();

const articleId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? parseInt(id) : 0;
});

const { article, loading, error, isAuthor, liked, likesCount, liking, fetchArticleDetail, handleDelete, handleLike } = useArticle();
const { favorited, favoritesCount, favoriting, toggleFavorite, fetchFavoriteStatus } = useFavorite(articleId);

const targetUserId = computed(() => article.value?.author?.id || null);

const { isFollowing, loading: followLoading, toggleFollow, checkStatus } = useFollow(targetUserId);

watch(article, (newArticle) => {
  if (newArticle && newArticle.author?.id) {
    checkStatus();
  }
}, { immediate: true });

const {
  comments,
  totalComments,
  commentPage,
  commentPageSize,
  newComment,
  replyTo,
  submitting,
  commentLoading,
  commentTree,
  fetchComments,
  handleCreateComment,
  handleDeleteComment,
  handleReply,
  handleCancelReply,
  handlePageChange
} = useComments(articleId.value);

const handleEdit = () => {
  if (article.value) {
    router.push(`/edit/${article.value.id}`);
  }
};

const handleShare = () => {
  if (article.value) {
    navigator.clipboard.writeText(window.location.href);
  }
};

onMounted(async () => {
  await fetchArticleDetail(articleId.value);
  if (article.value && article.value.author?.id) {
    await checkStatus();
    await fetchFavoriteStatus();
  }
  await fetchComments();
});
</script>

<style scoped>
.article-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px;
}

.back-button {
  margin-bottom: 24px;
}

.back-button :deep(.el-button) {
  color: #6B7280;
  font-size: 14px;
}

.back-button :deep(.el-button:hover) {
  color: #1E3A8A;
}

.action-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 32px 0;
  padding: 20px 0;
  border-top: 1px solid #E5E7EB;
  border-bottom: 1px solid #E5E7EB;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
  background-color: #ffffff;
  color: #6B7280;
  font-size: 14px;
  transition: all 0.2s linear;
}

.action-btn:hover {
  border-color: #1E3A8A;
  color: #1E3A8A;
}

.action-btn.active {
  background-color: #1E3A8A;
  border-color: #1E3A8A;
  color: #ffffff;
}

.action-btn.active :deep(.el-icon) {
  color: #ffffff;
}

@media (max-width: 768px) {
  .article-detail {
    padding: 20px 15px;
  }

  .action-bar {
    gap: 12px;
    padding: 16px 0;
  }

  .action-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}

@media (max-width: 1199px) and (min-width: 768px) {
  .article-detail {
    max-width: 90%;
  }
}

@media (max-width: 767px) {
  .article-detail {
    max-width: 95%;
  }
}
</style>
