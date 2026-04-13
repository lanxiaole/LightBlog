<template>
  <ElCard
    :class="['article-card', { 'admin-article': isAdminArticle() }]"
    @click="emit('click', article.id)"
  >
    <template #header>
      <div class="article-header">
        <div class="title-container">
          <h3 class="article-title">{{ article.title }}</h3>
          <ElTag v-if="article.is_pinned" type="success" size="small" effect="dark" style="margin-left: 8px;">置顶</ElTag>
          <ElTag v-if="isAdminArticle()" type="warning" size="small" effect="dark" style="margin-left: 8px;">管理员</ElTag>
        </div>
        <span class="article-date">{{ formatDate(article.created_at) }}</span>
      </div>
    </template>
    <div class="article-summary">
      {{ getSummary(article.content) }}
    </div>
  </ElCard>
</template>

<script setup lang="ts">
import { ElCard, ElTag } from 'element-plus';
import type { Article } from '@/api/article';

/**
 * 文章卡片组件
 * 展示单个文章的基本信息
 */

interface Props {
  /** 文章数据 */
  article: Article;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** 点击卡片 */
  click: [id: number];
}>();

// 判断是否为管理员文章
const isAdminArticle = () => {
  return props.article.author?.role === 'admin';
};

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

<style scoped>
.article-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* 管理员文章样式 */
.admin-article {
  border: 2px solid #f5a623;
  background-color: #fffaf0;
}

.admin-article:hover {
  box-shadow: 0 4px 12px rgba(245, 166, 35, 0.2);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
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

.article-summary {
  color: #606266;
  line-height: 1.6;
}
</style>
