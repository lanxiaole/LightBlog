<template>
  <div class="comment-section">
    <div class="section-header">
      <h3>评论</h3>
      <span class="comment-count">{{ totalComments }}</span>
    </div>

    <CommentInput
      :model-value="newComment"
      :reply-to="replyTo"
      :submitting="submitting"
      @update:model-value="handleCommentUpdate"
      @submit="emit('submit')"
      @cancel-reply="emit('cancelReply')"
    />

    <div class="comment-list">
      <div v-if="loading" class="comment-loading">
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
          @reply="emit('reply', $event)"
          @delete="emit('delete', $event)"
        />
      </div>
    </div>

    <div v-if="totalComments > commentPageSize" class="comment-pagination">
      <el-pagination
        :current-page="commentPage"
        :page-size="commentPageSize"
        :total="totalComments"
        layout="prev, pager, next"
        @current-change="emit('pageChange', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElSkeleton, ElSkeletonItem, ElEmpty, ElPagination } from 'element-plus';
import CommentInput from '@/components/comment/CommentInput.vue';
import CommentItem from '@/components/comment/CommentItem.vue';
import type { Comment } from '@/api/comment';

interface Props {
  comments: Comment[];
  commentTree: Comment[];
  totalComments: number;
  commentPage: number;
  commentPageSize: number;
  newComment: string;
  replyTo: number | null;
  submitting: boolean;
  loading: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  'update:newComment': [value: string];
  submit: [];
  cancelReply: [];
  reply: [commentId: number];
  delete: [commentId: number];
  pageChange: [page: number];
}>();

const handleCommentUpdate = (value: string) => {
  emit('update:newComment', value);
};
</script>

<style scoped>
.comment-section {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid #E5E7EB;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.comment-count {
  font-size: 14px;
  color: #6B7280;
  padding: 2px 8px;
  background-color: #F3F4F6;
  border-radius: 10px;
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

.comment-pagination :deep(.el-pagination) {
  display: inline-flex;
}

@media (max-width: 768px) {
  .comment-section {
    margin-top: 30px;
    padding-top: 30px;
  }
}
</style>
