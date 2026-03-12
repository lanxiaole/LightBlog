<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElCard, ElSkeleton, ElSkeletonItem, ElAvatar, ElButton, ElDivider, ElBacktop, ElEmpty } from 'element-plus';
import { Star, Message, View } from '@element-plus/icons-vue';
import { getArticleDetail } from '@/api/article';
import type { Article } from '@/api/article';

// 获取路由实例
const route = useRoute();

// 文章数据
const article = ref<Article | null>(null);
// 加载状态
const loading = ref(true);
// 错误状态
const error = ref('');

// 从路由参数获取文章id
const getArticleId = (): number => {
  const id = route.params.id;
  return typeof id === 'string' ? parseInt(id) : 0;
};

// 获取文章详情
const fetchArticleDetail = async () => {
  const id = getArticleId();
  if (id <= 0) {
    error.value = '无效的文章ID';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    article.value = await getArticleDetail(id);
  } catch (err: any) {
    error.value = err.message || '获取文章详情失败';
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取文章详情
onMounted(() => {
  fetchArticleDetail();
});
</script>

<template>
  <div class="article-detail">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button type="text" icon="el-icon-arrow-left" @click="$router.back()">
        返回
      </el-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton animated>
        <el-skeleton-item variant="h1" style="width: 80%; margin-bottom: 20px;"></el-skeleton-item>
        <el-skeleton-item variant="text" style="width: 60%; margin-bottom: 10px;"></el-skeleton-item>
        <el-skeleton-item variant="text" style="width: 40%; margin-bottom: 20px;"></el-skeleton-item>
        <el-skeleton-item variant="p" style="margin-bottom: 20px;"></el-skeleton-item>
        <el-skeleton-item variant="p" style="margin-bottom: 20px;"></el-skeleton-item>
        <el-skeleton-item variant="p" style="margin-bottom: 20px;"></el-skeleton-item>
      </el-skeleton>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error || !article" class="error-container">
      <el-empty description="文章不存在" />
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>

    <!-- 文章内容 -->
    <el-card v-else class="article-card">
      <!-- 文章标题 -->
      <h1 class="article-title">{{ article.title }}</h1>

      <!-- 作者信息 -->
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
            <span>0</span>
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
      </div>

      <el-divider />

      <!-- 文章正文 -->
      <div class="article-content" v-html="article.content"></div>

      <el-divider />

      <!-- 评论区 -->
      <div class="comment-section">
        <h3>评论</h3>
        <el-empty description="评论功能开发中" />
      </div>
    </el-card>

    <!-- 回到顶部 -->
    <el-backtop :right="40" :bottom="40" />
  </div>
</template>

<style scoped>
.article-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.back-button {
  margin-bottom: 20px;
}

.loading-container {
  margin: 20px 0;
}

.error-container {
  text-align: center;
  padding: 40px 0;
}

.error-container .el-button {
  margin-top: 20px;
}

.article-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #909399;
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  margin: 20px 0;
}

.article-content img {
  max-width: 100%;
  height: auto;
  margin: 10px 0;
}

.article-content p {
  margin-bottom: 16px;
}

.comment-section {
  margin-top: 40px;
}

.comment-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

@media (max-width: 768px) {
  .article-detail {
    padding: 10px;
  }

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
}
</style>
