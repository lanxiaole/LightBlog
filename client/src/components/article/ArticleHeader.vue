<script setup lang="ts">
/**
 * 文章头部组件
 * 显示文章标题、作者信息、统计数据、分类标签等
 */
import { ElAvatar, ElButton, ElDivider, ElTag, ElLink } from 'element-plus';
import { Star, Message, View } from '@element-plus/icons-vue';
import type { Article } from '@/api/article';

/**
 * 组件属性
 */
defineProps<{
  /** 文章数据 */
  article: Article;
  /** 是否为文章作者 */
  isAuthor: boolean;
  /** 评论总数（可选） */
  totalComments?: number;
}>();

/**
 * 组件事件
 */
const emit = defineEmits<{
  /** 编辑文章 */
  edit: [];
  /** 删除文章 */
  delete: [];
}>();
</script>

<template>
  <div class="article-header">
    <h1 class="article-title">{{ article.title }}</h1>

    <div class="author-info">
      <el-avatar :src="article.author?.avatar || undefined" size="default">
        {{ article.author?.username?.charAt(0) || 'U' }}
      </el-avatar>
      <div class="author-details">
        <span class="author-name">{{ article.author?.username || '未知作者' }}</span>
        <span class="publish-time">{{ new Date(article.created_at).toLocaleDateString('zh-CN') }}</span>
      </div>
      <div class="article-stats">
        <span class="stat-item">
          <el-icon><Message /></el-icon>
          <span>{{ totalComments || 0 }}</span>
        </span>
        <span class="stat-item">
          <el-icon><Star /></el-icon>
          <span>{{ article.likes }}</span>
        </span>
        <span class="stat-item">
          <el-icon><View /></el-icon>
          <span>{{ article.views }}</span>
        </span>
      </div>
      <el-button v-if="isAuthor" type="primary" size="small" @click="emit('edit')">
        编辑
      </el-button>
      <el-button v-if="isAuthor" type="danger" size="small" @click="emit('delete')">
        删除
      </el-button>
    </div>

    <div v-if="article.category || (article.tags && article.tags.length > 0)" class="meta-info">
      <div v-if="article.category" class="category-info">
        <span class="label">分类：</span>
        <el-link type="primary" :href="`/category/${article.category.name}`">
          {{ article.category.name }}
        </el-link>
      </div>
      <div v-if="article.tags && article.tags.length > 0" class="tags-info">
        <span class="label">标签：</span>
        <div class="tags-container">
          <el-link
            v-for="tag in article.tags"
            :key="tag.id"
            :href="`/tag/${tag.name}`"
            style="text-decoration: none;"
          >
            <el-tag
              type="info"
              size="small"
            >
              {{ tag.name }}
            </el-tag>
          </el-link>
        </div>
      </div>
    </div>

    <el-divider />
  </div>
</template>

<style scoped>
.article-header {
  margin-bottom: 20px;
}

.article-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #303133;
  line-height: 1.3;
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.author-details {
  margin-left: 12px;
  flex: 1;
}

.author-name {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.publish-time {
  font-size: 14px;
  color: #909399;
}

.article-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.meta-info {
  margin: 15px 0;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.category-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.tags-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
  flex: 1;
}

.category-info:last-child,
.tags-info:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 14px;
  color: #606266;
  margin-right: 8px;
  font-weight: 500;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #909399;
}

.author-info .el-button {
  margin-left: 20px;
}

@media (max-width: 768px) {
  .article-title {
    font-size: 24px;
  }

  .author-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .article-stats {
    width: 100%;
    justify-content: space-between;
  }

  .author-info .el-button {
    width: 100%;
  }
}
</style>
