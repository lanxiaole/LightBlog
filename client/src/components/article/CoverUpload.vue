<script setup lang="ts">
import { computed } from 'vue';
import { ElUpload, ElButton } from 'element-plus';

/**
 * 封面上传组件
 * 封装了 Element Plus 的上传组件，提供封面图上传、预览和删除功能
 */

// 组件属性定义
interface Props {
  /** 封面图URL，支持 v-model 双向绑定 */
  modelValue: string;
}

// 定义组件属性
const props = defineProps<Props>();

// 定义组件事件
const emit = defineEmits<{
  /** 封面图变化时触发的事件，用于 v-model 双向绑定 */
  'update:modelValue': [value: string];
}>();

/**
 * 计算上传组件的文件列表
 * 根据当前封面图URL生成文件列表
 */
const fileList = computed(() => {
  return props.modelValue ? [{ url: props.modelValue, name: '封面图' }] : [];
});

/**
 * 上传封面图处理函数
 * @param file 上传的文件对象
 * @returns false 阻止自动上传
 */
const handleCoverUpload = (file: any) => {
  // 使用本地URL作为封面图（临时解决方案）
  emit('update:modelValue', URL.createObjectURL(file.raw));
  return false; // 阻止自动上传
};

/**
 * 移除封面图处理函数
 */
const handleCoverRemove = () => {
  // 清空封面图
  emit('update:modelValue', '');
};
</script>

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
    >
      <el-button type="primary" icon="el-icon-upload">
        选择封面
      </el-button>
      <template #tip>
        <div class="el-upload__tip">
          请选择一张图片作为封面（可选）
        </div>
      </template>
    </el-upload>
    <div v-if="modelValue" class="cover-preview">
      <img :src="modelValue" alt="封面预览" />
    </div>
  </div>
</template>

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
