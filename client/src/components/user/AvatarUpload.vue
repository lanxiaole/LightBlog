<template>
  <div class="avatar-upload-container">
    <div class="avatar-wrapper">
      <ElAvatar :size="120" :src="avatar" class="avatar">
        {{ getFallbackText() }}
      </ElAvatar>
    </div>
    <div class="upload-btn-wrapper">
      <ElButton type="primary" plain class="upload-btn" @click="handleUpload">
        <ElIcon><Upload /></ElIcon>
        上传头像
      </ElButton>
    </div>
    <input
      type="file"
      accept="image/jpeg,image/png,image/gif"
      class="file-input"
      ref="fileInput"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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
}

// 定义组件属性
const props = defineProps<Props>();

// 定义组件事件
const emit = defineEmits<{
  /** 上传按钮点击事件 */
  'upload': [event: Event];
}>();

// 文件输入引用
const fileInput = ref<HTMLInputElement | null>(null);

/**
 * 处理上传按钮点击
 */
const handleUpload = () => {
  fileInput.value?.click();
};

/**
 * 处理文件选择
 */
const handleFileChange = (event: Event) => {
  emit('upload', event);
};

/**
 * 获取头像回退文字
 * 当头像URL为空时显示用户名的首字母
 */
const getFallbackText = () => {
  return props.username.charAt(0).toUpperCase();
};
</script>

<style scoped>
.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper {
  margin-bottom: 20px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px solid #1E3A8A;
  transition: transform 0.2s linear;
}

.avatar:hover {
  transform: scale(1.05);
}

.upload-btn-wrapper {
  width: 100%;
  max-width: 200px;
}

.upload-btn {
  width: 100%;
  border-radius: 6px;
  border: 2px dashed #E5E7EB;
  background-color: #F9FAFB;
  color: #6B7280;
  padding: 12px 24px;
  transition: all 0.2s linear;
}

.upload-btn:hover {
  border-color: #1E3A8A;
  color: #1E3A8A;
  background-color: #ffffff;
}

.file-input {
  display: none;
}
</style>