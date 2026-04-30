<template>
  <div
    :class="['article-card', { 'admin-article': isAdminArticle() }]"
    @click="emit('click', article.id)"
  >
    <!-- 封面图区域 -->
    <div v-if="article.cover" class="article-cover">
      <img :src="article.cover" :alt="article.title" />
      <div v-if="article.is_pinned" class="pinned-badge">
        <el-icon><Top /></el-icon>
        <span>置顶</span>
      </div>
    </div>
    <div v-else class="article-cover placeholder">
      <div class="cover-placeholder">
        <el-icon><Document /></el-icon>
      </div>
      <div v-if="article.is_pinned" class="pinned-badge">
        <el-icon><Top /></el-icon>
        <span>置顶</span>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="article-content">
      <!-- 标题区域 -->
      <div class="article-header">
        <h3 class="article-title">{{ article.title }}</h3>
        <ElTag v-if="isAdminArticle()" type="warning" size="small" effect="light" class="admin-tag">管理员</ElTag>
      </div>

      <!-- 摘要 -->
      <p class="article-summary">{{ getSummary(article.content) }}</p>

      <!-- 底部信息 -->
      <div class="article-footer">
        <div class="article-meta">
          <span class="meta-item">
            <el-icon><Calendar /></el-icon>
            {{ formatDate(article.created_at) }}
          </span>
          <span class="meta-item">
            <el-icon><View /></el-icon>
            {{ article.views || 0 }}
          </span>
        </div>
        <div v-if="article.category" class="category-tag">
          {{ article.category.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElTag } from 'element-plus';
import { Top, Document, Calendar, View } from '@element-plus/icons-vue';
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 获取文章摘要
 * @param content 文章内容
 * @returns 摘要文本
 */
const getSummary = (content: string): string => {
  // 去除HTML标签
  const plainText = content.replace(/<[^>]*>/g, '');
  // 简单截取前120字作为摘要
  return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
};
</script>

<style scoped lang="scss">
@import './ArticleCard.scss';
</style>
