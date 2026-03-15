<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElButton, ElBacktop, ElIcon } from 'element-plus';
import { Star, StarFilled } from '@element-plus/icons-vue';
import { useArticle } from '@/composables/article/useArticle';
import { useFavorite } from '@/composables/article/useFavorite';
import { useComments } from '@/composables/comment/useComments';
import ArticleContent from './components/ArticleContent.vue';
import CommentSection from './components/CommentSection.vue';

const route = useRoute();
const router = useRouter();

const articleId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? parseInt(id) : 0;
});

const { article, loading, error, isAuthor, liked, likesCount, liking, fetchArticleDetail, handleDelete, handleLike } = useArticle();
const { favorited, favoritesCount, favoriting, toggleFavorite } = useFavorite(articleId);
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

onMounted(async () => {
  await fetchArticleDetail(articleId.value);
  await fetchComments();
});
</script>

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
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- 点赞和收藏按钮 -->
    <div v-if="!loading && !error && article" class="like-section">
      <el-button
        :type="liked ? 'primary' : 'default'"
        :loading="liking"
        @click="handleLike"
        style="margin-right: 20px;"
      >
        <el-icon>
          <star-filled v-if="liked" />
          <star v-else />
        </el-icon>
        <span class="like-count">{{ likesCount }}</span>
      </el-button>
      <el-button
        :type="favorited ? 'warning' : 'default'"
        :loading="favoriting"
        @click="toggleFavorite"
      >
        <el-icon>
          <star-filled v-if="favorited" />
          <star v-else />
        </el-icon>
        <span class="like-count">{{ favoritesCount }}</span>
      </el-button>
    </div>

    <!-- 评论区域 -->
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

    <!-- 返回顶部 -->
    <el-backtop :right="40" :bottom="40" />
  </div>
</template>

<style scoped>
.article-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.back-button {
  margin-bottom: 20px;
}

.like-section {
  display: flex;
  justify-content: center;
  margin: 30px 0;
  padding: 20px 0;
  border-top: 1px solid #e4e7ed;
  border-bottom: 1px solid #e4e7ed;
}

.like-count {
  margin-left: 8px;
}

@media (max-width: 768px) {
  .article-detail {
    padding: 10px;
  }
}
</style>
