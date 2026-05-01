<template>
  <div class="avatar-upload-container">
    <div class="avatar-wrapper">
      <el-avatar :size="120" :src="displayAvatar" class="avatar">
        {{ getFallbackText() }}
      </el-avatar>
      <div v-if="uploading" class="uploading-overlay">
        <el-icon class="is-loading" size="30">
          <Loading />
        </el-icon>
      </div>
    </div>
    <div class="upload-btn-wrapper">
      <el-button type="primary" plain class="upload-btn" @click="handleUpload" :loading="uploading">
        <el-icon><Upload /></el-icon>
        {{ uploading ? '上传中...' : '上传头像' }}
      </el-button>
    </div>
    <input
      type="file"
      accept="image/jpeg,image/png,image/gif,image/webp"
      class="file-input"
      ref="fileInput"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElAvatar, ElButton, ElIcon, ElMessage } from 'element-plus';
import { Upload, Loading } from '@element-plus/icons-vue';
import { uploadImage } from '@/api/upload';

interface Props {
  avatar: string;
  username: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'upload-success': [url: string];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const previewUrl = ref<string | null>(null);

const displayAvatar = computed(() => {
  return previewUrl.value || props.avatar;
});

const handleUpload = () => {
  fileInput.value?.click();
};

const handleFileChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    previewUrl.value = URL.createObjectURL(file);
    uploading.value = true;

    try {
      const result = await uploadImage(file, 'avatar');

      if (result.success) {
        emit('upload-success', result.url);
        ElMessage.success('头像上传成功！');
        setTimeout(() => {
          previewUrl.value = null;
        }, 500);
      } else {
        ElMessage.error(result.message || '上传失败');
        previewUrl.value = null;
      }
    } catch (error: any) {
      ElMessage.error(error.message || '上传失败');
      previewUrl.value = null;
    } finally {
      uploading.value = false;
      target.value = '';
    }
  };

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
  position: relative;
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

.uploading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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
