<template>
  <div class="comment-input">
    <el-avatar v-if="userStore.userInfo" :src="userStore.userInfo.avatar || undefined" size="small">
      {{ userStore.userInfo.username?.charAt(0) || 'U' }}
    </el-avatar>
    <el-avatar v-else size="small">U</el-avatar>
    <div class="input-area">
      <div v-if="replyTo" class="reply-info">
        回复评论 #{{ replyTo }}
        <el-button type="text" size="small" @click="emit('cancelReply')">取消</el-button>
      </div>
      <el-input
        :model-value="modelValue"
        @update:model-value="emit('update:modelValue', $event)"
        type="textarea"
        :rows="3"
        placeholder="写下你的评论..."
        :disabled="!userStore.isLoggedIn"
      />
      <div class="input-actions">
        <el-button
          class="submit-btn"
          @click="emit('submit')"
          :loading="submitting"
          :disabled="!userStore.isLoggedIn || !modelValue.trim()"
        >
          发表评论
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElAvatar, ElButton, ElInput } from 'element-plus';
import { useUserStore } from '@/stores/user';

defineProps<{
  modelValue: string;
  replyTo: number | null;
  submitting: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  submit: [];
  cancelReply: [];
}>();

const userStore = useUserStore();
</script>

<style scoped>
.comment-input {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.input-area {
  flex: 1;
}

.reply-info {
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reply-info :deep(.el-button) {
  color: #1E3A8A;
  padding: 0;
}

.input-area :deep(.el-textarea__inner) {
  border-radius: 6px;
  border-color: #E5E7EB;
  font-size: 14px;
  line-height: 1.6;
}

.input-area :deep(.el-textarea__inner:focus) {
  border-color: #1E3A8A;
  box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.1);
}

.input-actions {
  text-align: right;
  margin-top: 12px;
}

.submit-btn {
  padding: 7px 20px;
  font-size: 14px;
  background-color: #F97316;
  border-color: #F97316;
  border-radius: 6px;
  color: #ffffff;
  transition: all 0.2s linear;
}

.submit-btn:hover:not(:disabled) {
  background-color: #EA580C;
  border-color: #EA580C;
}

.submit-btn:disabled {
  background-color: #D1D5DB;
  border-color: #D1D5DB;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .comment-input {
    flex-direction: column;
    align-items: flex-start;
  }

  .submit-btn {
    width: 100%;
  }
}
</style>
