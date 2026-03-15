<script setup lang="ts">
/**
 * 评论输入组件
 * 用于输入评论内容和回复评论
 */
import { ElAvatar, ElButton, ElInput } from 'element-plus';
import { useUserStore } from '@/stores/user';

/**
 * 组件属性
 */
defineProps<{
  /** 评论内容（双向绑定） */
  modelValue: string;
  /** 回复的评论ID，为null时表示普通评论 */
  replyTo: number | null;
  /** 提交状态 */
  submitting: boolean;
}>();

/**
 * 组件事件
 */
const emit = defineEmits<{
  /** 更新评论内容 */
  'update:modelValue': [value: string];
  /** 提交评论 */
  submit: [];
  /** 取消回复 */
  cancelReply: [];
}>();

const userStore = useUserStore();
</script>

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
          type="primary"
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

<style scoped>
.comment-input {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.input-area {
  flex: 1;
}

.reply-info {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.input-actions {
  text-align: right;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .comment-input {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
