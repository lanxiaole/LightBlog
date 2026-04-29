<template>
  <div class="comment-item">
    <div class="comment-card">
      <div class="comment-header">
        <el-avatar :src="comment.author?.avatar || undefined" size="small">
          {{ comment.author?.username?.charAt(0) || 'U' }}
        </el-avatar>
        <div class="comment-meta">
          <span class="comment-author">{{ comment.author?.username || '未知用户' }}</span>
          <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
        </div>
        <div class="comment-actions">
          <el-button
            v-if="userStore.isLoggedIn"
            class="reply-btn"
            type="text"
            size="small"
            @click="onReply(comment.id)"
          >
            回复
          </el-button>
          <el-button
            v-if="userStore.isLoggedIn && userStore.userInfo?.id === comment.user_id"
            class="delete-btn"
            type="text"
            size="small"
            @click="onDelete(comment.id)"
          >
            删除
          </el-button>
        </div>
      </div>
      <div class="comment-content">{{ comment.content }}</div>
    </div>

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

<script setup lang="ts">
import { ref } from 'vue';
import { ElAvatar, ElButton } from 'element-plus';
import { useUserStore } from '@/stores/user';
import type { Comment } from '@/api/comment';

defineOptions({
  name: 'CommentItem'
});

defineProps<{
  comment: Comment;
  allComments: Comment[];
  onReply: (commentId: number) => void;
  onDelete: (commentId: number) => void;
}>();

const userStore = useUserStore();

const isExpanded = ref(true);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.comment-item {
  margin-bottom: 16px;
}

.comment-card {
  background-color: #ffffff;
  border-radius: 6px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.comment-meta {
  margin-left: 10px;
  flex: 1;
}

.comment-author {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
}

.comment-time {
  font-size: 12px;
  color: #9CA3AF;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.reply-btn {
  color: #6B7280;
  font-size: 13px;
  padding: 0;
  transition: color 0.2s linear;
}

.reply-btn:hover {
  color: #1E3A8A;
}

.delete-btn {
  color: #EF4444;
  font-size: 13px;
  padding: 0;
}

.delete-btn:hover {
  color: #DC2626;
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  margin-top: 8px;
}

.replies {
  margin-top: 12px;
  margin-left: 36px;
  padding-left: 16px;
  border-left: 2px solid #E5E7EB;
}

.reply-toggle {
  margin-bottom: 10px;
}

.reply-toggle :deep(.el-button) {
  color: #6B7280;
  font-size: 13px;
}

.reply-toggle :deep(.el-button:hover) {
  color: #1E3A8A;
}

@media (max-width: 768px) {
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .comment-meta {
    margin-left: 0;
    width: 100%;
  }

  .comment-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .replies {
    margin-left: 0;
    padding-left: 12px;
  }
}
</style>
