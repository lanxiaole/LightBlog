<script setup lang="ts">
import { ElAvatar, ElButton, ElIcon } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';

/**
 * 头像上传组件
 * 展示用户头像和上传按钮
 */

// 组件属性定义
interface Props {
  /** 头像URL */
  avatar: string;
  /** 用户名（用于头像回退显示） */
  username: string;
  /** 头像尺寸 */
  size?: number;
}

// 定义组件属性并设置默认值
const props = withDefaults(defineProps<Props>(), {
  size: 100
});

// 定义组件事件
const emit = defineEmits<{
  /** 上传按钮点击事件 */
  'upload': [];
}>();

/**
 * 处理上传按钮点击
 */
const handleUpload = () => {
  emit('upload');
};

/**
 * 获取头像回退文字
 * 当头像URL为空时显示用户名的首字母
 */
const getFallbackText = () => {
  return props.username.charAt(0).toUpperCase();
};
</script>

<template>
  <div class="avatar-section">
    <ElAvatar :size="size" :src="avatar" class="user-avatar">
      {{ getFallbackText() }}
    </ElAvatar>
    <ElButton type="primary" plain @click="handleUpload" style="margin-top: 15px;">
      <ElIcon><Upload /></ElIcon>
      上传头像
    </ElButton>
  </div>
</template>

<style scoped>
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.user-avatar {
  border: 2px solid #f0f0f0;
}
</style>
