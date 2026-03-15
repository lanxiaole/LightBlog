<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElCard, ElSkeleton, ElSkeletonItem, ElDivider, ElBacktop, ElEmpty, ElPagination } from 'element-plus';
import { useArticle } from '@/composables/article/useArticle';
import { useComments } from '@/composables/comment/useComments';
import ArticleHeader from '@/components/article/ArticleHeader.vue';
import CommentInput from '@/components/comment/CommentInput.vue';
import CommentItem from '@/components/comment/CommentItem.vue';

const route = useRoute();
const router = useRouter();

const articleId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? parseInt(id) : 0;
});

const { article, loading, error, isAuthor, fetchArticleDetail, handleDelete } = useArticle();
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
    <div class="back-button">
      <el-button type="text" icon="el-icon-arrow-left" @click="router.back()">
        返回
      </el-button>
    </div>

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

    <el-card v-else class="article-card">
      <ArticleHeader
        :article="article"
        :is-author="isAuthor"
        :total-comments="totalComments"
        @edit="handleEdit"
        @delete="handleDelete"
      />

      <div class="article-content" v-html="article.content"></div>

      <el-divider />

      <div class="comment-section">
        <h3>评论</h3>

        <CommentInput
          v-model="newComment"
          :reply-to="replyTo"
          :submitting="submitting"
          @submit="handleCreateComment"
          @cancel-reply="handleCancelReply"
        />

        <div class="comment-list">
          <div v-if="commentLoading" class="comment-loading">
            <el-skeleton animated>
              <el-skeleton-item variant="text" style="width: 80%; margin-bottom: 10px;"></el-skeleton-item>
              <el-skeleton-item variant="text" style="width: 60%; margin-bottom: 10px;"></el-skeleton-item>
              <el-skeleton-item variant="text" style="width: 70%; margin-bottom: 20px;"></el-skeleton-item>
            </el-skeleton>
          </div>
          <el-empty v-else-if="totalComments === 0" description="暂无评论" />
          <div v-else>
            <CommentItem
              v-for="comment in commentTree"
              :key="comment.id"
              :comment="comment"
              :all-comments="comments"
              @reply="handleReply"
              @delete="handleDeleteComment"
            />
          </div>
        </div>

        <div v-if="totalComments > commentPageSize" class="comment-pagination">
          <el-pagination
            v-model:current-page="commentPage"
            :page-size="commentPageSize"
            :total="totalComments"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </el-card>

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

.comment-section {
  margin-top: 40px;
}

.comment-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.comment-list {
  margin-bottom: 30px;
}

.comment-loading {
  margin: 20px 0;
}

.comment-pagination {
  text-align: center;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .article-detail {
    padding: 10px;
  }
}
</style>
