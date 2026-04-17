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
// 颜色变量
$primary-color: #1E3A8A;
$secondary-color: #F97316;
$bg-light: #F3F4F6;
$text-dark: #111827;
$text-gray: #6B7280;
$text-light: #9CA3AF;
$white: #FFFFFF;
$border-color: #E5E7EB;
$admin-color: #F59E0B;

.article-card {
  display: flex;
  background: $white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s linear;
  border: 1px solid $border-color;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

/* 管理员文章样式 */
.admin-article {
  border-left: 4px solid $admin-color;
}

// 封面图区域
.article-cover {
  flex: 0 0 35%;
  min-height: 180px;
  max-height: 220px;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  &.placeholder {
    background: linear-gradient(135deg, $bg-light 0%, #E5E7EB 100%);
    display: flex;
    align-items: center;
    justify-content: center;

    .cover-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba($primary-color, 0.1);

      .el-icon {
        font-size: 28px;
        color: $primary-color;
      }
    }
  }
}

// 置顶标签
.pinned-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba($secondary-color, 0.95);
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: 500;

  .el-icon {
    font-size: 12px;
  }
}

// 内容区域
.article-content {
  flex: 1;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
}

.article-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

.article-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: $text-dark;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.admin-tag {
  flex-shrink: 0;
  margin-top: 2px;
}

.article-summary {
  flex: 1;
  font-size: 14px;
  color: $text-gray;
  line-height: 1.7;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// 底部信息
.article-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid $border-color;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: $text-light;

  .el-icon {
    font-size: 14px;
  }
}

.category-tag {
  padding: 4px 10px;
  background: rgba($primary-color, 0.08);
  color: $primary-color;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
}

// 平板端适配
@media (max-width: 991px) {
  .article-cover {
    flex: 0 0 40%;
    min-height: 160px;
  }

  .article-content {
    padding: 16px 20px;
  }

  .article-title {
    font-size: 16px;
  }

  .article-summary {
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
}

// 移动端适配
@media (max-width: 767px) {
  .article-card {
    flex-direction: column;
  }

  .article-cover {
    flex: none;
    height: 180px;
    min-height: auto;
  }

  .article-content {
    padding: 16px;
  }

  .article-title {
    font-size: 16px;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .article-summary {
    -webkit-line-clamp: 2;
    line-clamp: 2;
    margin-bottom: 12px;
  }

  .article-footer {
    padding-top: 10px;
  }

  .meta-item {
    font-size: 12px;
  }
}
</style>
