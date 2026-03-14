<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElCard, ElSkeleton, ElSkeletonItem, ElAvatar, ElButton, ElDivider, ElBacktop, ElEmpty, ElTag, ElLink, ElMessageBox, ElMessage } from 'element-plus';
import { Star, Message, View } from '@element-plus/icons-vue';
import { getArticleDetail, deleteArticle } from '@/api/article';
import type { Article } from '@/api/article';
import { useUserStore } from '@/stores/user';

// 获取路由实例
const route = useRoute();
const router = useRouter();

// 用户 store
const userStore = useUserStore();

// 文章数据
const article = ref<Article | null>(null);
// 加载状态
const loading = ref(true);
// 错误状态
const error = ref('');

// 判断是否为文章作者
const isAuthor = computed(() => {
  return article.value && userStore.userInfo && article.value.author_id === userStore.userInfo.id;
});

// 删除状态
const deleting = ref(false);

// 删除文章
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这篇文章吗？此操作不可撤销',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    deleting.value = true;
    await deleteArticle(article.value!.id);
    ElMessage.success('删除成功');
    router.push('/');
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  } finally {
    deleting.value = false;
  }
};

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
        <el-button v-if="isAuthor" type="primary" size="small" @click="$router.push(`/edit/${article.id}`)">
          编辑
        </el-button>
        <el-button v-if="isAuthor" type="danger" size="small" @click="handleDelete" :loading="deleting">
          删除
        </el-button>
      </div>

      <!-- 分类和标签 -->
      <div v-if="article.category || (article.tags && article.tags.length > 0)" class="meta-info">
        <div v-if="article.category" class="category-info">
          <span class="label">分类：</span>
          <el-link type="primary" @click="$router.push(`/category/${article.category.name}`)">
            {{ article.category.name }}
          </el-link>
        </div>
        <div v-if="article.tags && article.tags.length > 0" class="tags-info">
          <span class="label">标签：</span>
          <el-tag
            v-for="tag in article.tags"
            :key="tag.id"
            type="info"
            size="small"
            style="margin-right: 8px; margin-bottom: 8px; cursor: pointer;"
            @click="$router.push(`/tag/${tag.name}`)"
          >
            {{ tag.name }}
          </el-tag>
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

.meta-info {
  margin: 15px 0;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.category-info,
.tags-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
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

  .author-info .el-button {
    width: 100%;
  }
}
</style>
