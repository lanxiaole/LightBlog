<script setup lang="ts">
/**
 * 加载状态组件
 * 显示加载中的动画和提示
 */

interface Props {
  /** 加载提示文本 */
  text?: string;
}

withDefaults(defineProps<Props>(), {
  text: '加载中...'
});
</script>

<template>
  <div class="loading-state">
    <el-icon class="is-loading loading-icon">
      <Loading />
    </el-icon>
    <span class="loading-text">{{ text }}</span>
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #606266;
}

.loading-icon {
  margin-right: 10px;
  font-size: 20px;
}

.loading-text {
  font-size: 14px;
}
</style>
