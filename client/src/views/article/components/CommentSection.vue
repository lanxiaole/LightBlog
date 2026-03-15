<script setup lang="ts">
import { ElSkeleton, ElSkeletonItem, ElEmpty, ElPagination } from 'element-plus';
import CommentInput from '@/components/comment/CommentInput.vue';
import CommentItem from '@/components/comment/CommentItem.vue';
import type { Comment } from '@/api/comment';

/**
 * 评论区域组件
 * 包含评论输入框、评论列表和分页
 */

interface Props {
  /** 评论列表 */
  comments: Comment[];
  /** 评论树形结构 */
  commentTree: Comment[];
  /** 评论总数 */
  totalComments: number;
  /** 当前页码 */
  commentPage: number;
  /** 每页评论数 */
  commentPageSize: number;
  /** 新评论内容 */
  newComment: string;
  /** 回复的评论ID */
  replyTo: number | null;
  /** 是否提交中 */
  submitting: boolean;
  /** 评论是否加载中 */
  loading: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  /** 更新评论内容 */
  'update:newComment': [value: string];
  /** 提交评论 */
  submit: [];
  /** 取消回复 */
  cancelReply: [];
  /** 回复评论 */
  reply: [commentId: number];
  /** 删除评论 */
  delete: [commentId: number];
  /** 页码变化 */
  pageChange: [page: number];
}>();

/**
 * 处理评论内容更新
 * @param value 评论内容
 */
const handleCommentUpdate = (value: string) => {
  emit('update:newComment', value);
};
</script>

<template>
  <div class="comment-section">
    <h3>评论</h3>

    <!-- 评论输入 -->
    <CommentInput
      :model-value="newComment"
      :reply-to="replyTo"
      :submitting="submitting"
      @update:model-value="handleCommentUpdate"
      @submit="emit('submit')"
      @cancel-reply="emit('cancelReply')"
    />

    <!-- 评论列表 -->
    <div class="comment-list">
      <!-- 加载状态 -->
      <div v-if="loading" class="comment-loading">
        <el-skeleton animated>
          <el-skeleton-item variant="text" style="width: 80%; margin-bottom: 10px;"></el-skeleton-item>
          <el-skeleton-item variant="text" style="width: 60%; margin-bottom: 10px;"></el-skeleton-item>
          <el-skeleton-item variant="text" style="width: 70%; margin-bottom: 20px;"></el-skeleton-item>
        </el-skeleton>
      </div>

      <!-- 空状态 -->
      <el-empty v-else-if="totalComments === 0" description="暂无评论" />

      <!-- 评论列表 -->
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

    <!-- 分页 -->
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

<style scoped>
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
</style>
