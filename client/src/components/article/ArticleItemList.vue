<script setup lang="ts">
import type { Article } from '@/api/article';

/**
 * 文章卡片列表组件
 * 展示文章卡片列表
 */

interface Props {
  /** 文章列表 */
  articles: Article[];
}

defineProps<Props>();

const emit = defineEmits<{
  /** 点击文章卡片 */
  click: [id: number];
}>();

/**
 * 格式化日期
 * @param dateString 日期字符串
 * @returns 格式化后的日期
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

/**
 * 获取文章摘要
 * @param content 文章内容
 * @returns 摘要文本
 */
const getSummary = (content: string): string => {
  // 去除HTML标签
  const plainText = content.replace(/<[^>]*>/g, '');
  // 简单截取前100字作为摘要
  return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
};
</script>

<template>
  <div class="article-items">
    <el-card
      v-for="article in articles"
      :key="article.id"
      class="article-card"
      @click="emit('click', article.id)"
    >
      <template #header>
        <div class="article-header">
          <h3 class="article-title">{{ article.title }}</h3>
          <span class="article-date">{{ formatDate(article.created_at) }}</span>
        </div>
      </template>
      <div class="article-content">
        {{ getSummary(article.content) }}
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.article-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #303133;
}

.article-date {
  font-size: 14px;
  color: #909399;
}

.article-content {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  margin: 0;
}
</style>
