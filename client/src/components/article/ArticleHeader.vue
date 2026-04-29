<template>
  <header class="article-header">
    <h1 class="article-title">{{ article.title }}</h1>

    <div class="author-bar">
      <div class="author-info">
        <el-avatar :src="article.author?.avatar || undefined" size="default">
          {{ article.author?.username?.charAt(0) || 'U' }}
        </el-avatar>
        <div class="author-meta">
          <span class="author-name">{{ article.author?.username || '未知作者' }}</span>
          <span class="publish-time">{{ formatDate(article.created_at) }}</span>
        </div>
      </div>
      <div class="author-actions">
        <el-button v-if="isAuthor" type="primary" size="small" @click="emit('edit')">
          编辑
        </el-button>
        <el-button v-if="isAuthor" type="danger" size="small" @click="emit('delete')">
          删除
        </el-button>
        <el-button
          v-else-if="targetUserId !== null"
          :type="isFollowing ? 'default' : 'primary'"
          size="small"
          @click="handleFollow"
          :loading="followLoading || false"
        >
          {{ isFollowing ? '取消关注' : '关注' }}
        </el-button>
      </div>
    </div>

    <div class="stats-row">
      <span class="stat-item">
        <el-icon><Message /></el-icon>
        <span>{{ totalComments || 0 }}</span>
      </span>
      <span class="stat-item">
        <span class="icon-thumbs-up"></span>
        <span>{{ likesCount ?? article.likes ?? 0 }}</span>
      </span>
      <span class="stat-item">
        <el-icon :style="{ color: favorited ? '#1E3A8A' : '' }">
          <StarFilled v-if="favorited" />
          <Star v-else />
        </el-icon>
        <span>{{ favoritesCount || 0 }}</span>
      </span>
      <span class="stat-item">
        <el-icon><View /></el-icon>
        <span>{{ article.views }}</span>
      </span>
    </div>

    <div v-if="article.category || (article.tags && article.tags.length > 0)" class="meta-section">
      <div v-if="article.category" class="meta-row">
        <span class="meta-label">分类：</span>
        <el-link type="primary" :href="`/category/${article.category.name}`">
          {{ article.category.name }}
        </el-link>
      </div>
      <div v-if="article.tags && article.tags.length > 0" class="meta-row">
        <span class="meta-label">标签：</span>
        <div class="tags-wrapper">
          <el-link
            v-for="tag in article.tags"
            :key="tag.id"
            :href="`/tag/${tag.name}`"
          >
            <el-tag type="info" size="small">
              {{ tag.name }}
            </el-tag>
          </el-link>
        </div>
      </div>
    </div>

    <div class="divider"></div>
  </header>
</template>

<script setup lang="ts">
import { ElAvatar, ElButton, ElTag, ElLink, ElIcon } from 'element-plus';
import { Star, StarFilled, Message, View } from '@element-plus/icons-vue';
import type { Article } from '@/api/article';

defineProps<{
  article: Article;
  isAuthor: boolean;
  totalComments?: number;
  likesCount?: number;
  favorited?: boolean;
  favoritesCount?: number;
  favoriting?: boolean;
  targetUserId: number | null;
  isFollowing?: boolean;
  followLoading?: boolean;
}>();

const emit = defineEmits<{
  edit: [];
  delete: [];
  follow: [];
}>();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const handleFollow = () => {
  emit('follow');
};
</script>

<style scoped>
.article-header {
  text-align: center;
}

.article-title {
  font-size: 32px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 24px;
  line-height: 1.3;
}

.author-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.author-info {
  display: flex;
  align-items: center;
}

.author-meta {
  margin-left: 12px;
  text-align: left;
}

.author-name {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
}

.publish-time {
  font-size: 14px;
  color: #6B7280;
}

.author-actions {
  display: flex;
  gap: 8px;
}

.author-actions :deep(.el-button) {
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 6px;
}

.author-actions :deep(.el-button--primary) {
  background-color: #1E3A8A;
  border-color: #1E3A8A;
}

.author-actions :deep(.el-button--danger) {
  background-color: #EF4444;
  border-color: #EF4444;
}

.stats-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6B7280;
}

.stat-item :deep(.el-icon) {
  font-size: 14px;
}

.meta-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
}

.meta-row :deep(.el-link) {
  font-size: 14px;
  color: #1E3A8A;
  font-weight: 500;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tags-wrapper :deep(.el-tag) {
  background-color: #F3F4F6;
  border-color: #E5E7EB;
  color: #4B5563;
  font-size: 13px;
}

.divider {
  height: 1px;
  background-color: #E5E7EB;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .article-title {
    font-size: 26px;
  }

  .author-bar {
    flex-direction: column;
    gap: 12px;
  }

  .author-info {
    width: 100%;
    justify-content: center;
  }

  .author-actions {
    width: 100%;
    justify-content: center;
  }

  .author-actions :deep(.el-button) {
    width: 100%;
  }

  .stats-row {
    gap: 16px;
  }
}
</style>
