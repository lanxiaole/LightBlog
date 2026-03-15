<script setup lang="ts">
/**
 * 错误状态组件
 * 显示错误信息和重试按钮
 */

interface Props {
  /** 错误信息 */
  message: string;
  /** 重试按钮文本 */
  retryText?: string;
}

withDefaults(defineProps<Props>(), {
  retryText: '重试'
});

const emit = defineEmits<{
  /** 重试事件 */
  retry: [];
}>();
</script>

<template>
  <div class="error-state">
    <el-alert
      :title="message"
      type="error"
      show-icon
      :closable="false"
    />
    <el-button type="primary" @click="emit('retry')" class="retry-btn">
      {{ retryText }}
    </el-button>
  </div>
</template>

<style scoped>
.error-state {
  padding: 40px 0;
  text-align: center;
}

.retry-btn {
  margin-top: 20px;
}
</style>
