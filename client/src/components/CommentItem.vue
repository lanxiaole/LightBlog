<script setup lang="ts">
/**
 * 评论项组件
 * 用于显示单条评论及其回复，支持递归渲染多层回复
 */
import { ref } from 'vue';
import { ElAvatar, ElButton } from 'element-plus';
import { useUserStore } from '@/stores/user';
import type { Comment } from '@/api/comment';

/**
 * 组件属性
 */
defineProps<{
  /** 评论数据 */
  comment: Comment;
  /** 所有评论列表，用于过滤回复 */
  allComments: Comment[];
  /** 回复回调函数 */
  onReply: (commentId: number) => void;
  /** 删除回调函数 */
  onDelete: (commentId: number) => void;
}>();

const userStore = useUserStore();

// 展开/收起回复
const isExpanded = ref(true);

/**
 * 切换展开/收起状态
 */
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <div class="comment-item">
    <div class="comment-header">
      <el-avatar :src="comment.author?.avatar || undefined" size="small">
        {{ comment.author?.username?.charAt(0) || 'U' }}
      </el-avatar>
      <div class="comment-meta">
        <span class="comment-author">{{ comment.author?.username || '未知用户' }}</span>
        <span class="comment-time">{{ new Date(comment.created_at).toLocaleString('zh-CN') }}</span>
      </div>
      <div class="comment-actions">
        <el-button
          v-if="userStore.isLoggedIn"
          type="text"
          size="small"
          @click="onReply(comment.id)"
        >
          回复
        </el-button>
        <el-button
          v-if="userStore.isLoggedIn && userStore.userInfo?.id === comment.user_id"
          type="text"
          size="small"
          @click="onDelete(comment.id)"
          style="color: #f56c6c;"
        >
          删除
        </el-button>
      </div>
    </div>
    <div class="comment-content">{{ comment.content }}</div>

    <!-- 回复列表 -->
    <div v-if="allComments.filter(c => c.parent_id === comment.id).length > 0" class="replies">
      <div v-if="allComments.filter(c => c.parent_id === comment.id).length > 2" class="reply-toggle">
        <el-button type="text" size="small" @click="toggleExpand">
          {{ isExpanded ? `收起 ${allComments.filter(c => c.parent_id === comment.id).length} 条回复` : `展开 ${allComments.filter(c => c.parent_id === comment.id).length} 条回复` }}
        </el-button>
      </div>
      <div v-if="isExpanded">
        <CommentItem
          v-for="reply in allComments.filter(c => c.parent_id === comment.id)"
          :key="reply.id"
          :comment="reply"
          :all-comments="allComments"
          :on-reply="onReply"
          :on-delete="onDelete"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.comment-meta {
  margin-left: 10px;
  flex: 1;
}

.comment-author {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  margin-bottom: 10px;
  padding-left: 34px;
}

.replies {
  margin-top: 15px;
  margin-left: 34px;
  padding-left: 15px;
  border-left: 2px solid #f0f0f0;
}

.reply-toggle {
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .comment-meta {
    margin-left: 0;
  }

  .comment-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .comment-content {
    padding-left: 0;
  }

  .replies {
    margin-left: 0;
    padding-left: 10px;
  }
}
</style>
