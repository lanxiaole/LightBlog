<script setup lang="ts">
/**
 * 空状态组件
 * 显示暂无数据的提示
 */

interface Props {
  /** 空状态描述文本 */
  description?: string;
}

withDefaults(defineProps<Props>(), {
  description: '暂无数据'
});
</script>

<template>
  <div class="empty-state">
    <el-empty :description="description" />
  </div>
</template>

<style scoped>
.empty-state {
  padding: 40px 0;
}
</style>
