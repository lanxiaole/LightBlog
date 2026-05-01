<template>
  <div class="cover-upload-wrapper">
    <el-upload
      class="cover-upload"
      action="#"
      :auto-upload="false"
      :on-change="handleCoverUpload"
      :on-remove="handleCoverRemove"
      :file-list="fileList"
      :limit="1"
      :loading="uploading"
      accept="image/jpeg,image/png,image/gif,image/webp"
    >
      <el-button type="primary" :loading="uploading">
        <el-icon v-if="!uploading"><Upload /></el-icon>
        {{ uploading ? '上传中...' : '选择封面' }}
      </el-button>
      <template #tip>
        <div class="el-upload__tip">
          请选择一张图片作为封面（可选，最大10MB）
        </div>
      </template>
    </el-upload>
    <div v-if="modelValue" class="cover-preview">
      <img :src="modelValue" alt="封面预览" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElUpload, ElButton, ElMessage, ElIcon } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';
import { uploadImage } from '@/api/upload';

interface Props {
  modelValue: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const uploading = ref(false);

const fileList = computed(() => {
  return props.modelValue ? [{ url: props.modelValue, name: '封面图' }] : [];
});

const handleCoverUpload = async (file: any) => {
  uploading.value = true;
  
  try {
    const result = await uploadImage(file.raw, 'cover');
    
    if (result.success) {
      emit('update:modelValue', result.url);
      ElMessage.success('封面上传成功！');
    } else {
      ElMessage.error(result.message || '上传失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '上传失败');
  } finally {
    uploading.value = false;
  }
};

const handleCoverRemove = () => {
  emit('update:modelValue', '');
};
</script>

<style scoped>
.cover-upload-wrapper {
  width: 100%;
}

.cover-upload {
  margin-bottom: 15px;
}

.cover-preview {
  margin-top: 10px;
  max-width: 300px;
}

.cover-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>
