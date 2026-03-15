<script setup lang="ts">
import { ElIcon, ElCard, ElAlert, ElButton, ElPagination } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { useHome } from '@/composables/useHome';
import Sidebar from '@/components/Sidebar.vue';

/**
 * 首页
 * 展示文章列表和侧边栏
 */

const {
  articles,
  total,
  currentPage,
  pageSize,
  categories,
  tags,
  loading,
  error,
  formatDate,
  getSummary,
  navigateToArticle,
  navigateToCategory,
  navigateToTag,
  handleSizeChange,
  handleCurrentChange,
  fetchArticles
} = useHome();
</script>

<template>
  <div class="home-container">
    <div class="main-content">
      <!-- 左侧文章列表 -->
      <div class="article-list">
        <h2 class="page-title">文章列表</h2>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <!-- 错误提示 -->
        <div v-else-if="error" class="error-container">
          <el-alert
            :title="error"
            type="error"
            show-icon
            :closable="false"
          />
          <el-button type="primary" @click="fetchArticles">重试</el-button>
        </div>

        <!-- 文章列表 -->
        <div v-else class="article-items">
          <el-card
            v-for="article in articles"
            :key="article.id"
            class="article-card"
            @click="navigateToArticle(article.id)"
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

        <!-- 分页组件 -->
        <div v-if="!loading && !error" class="pagination-container">
          <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :pager-count="5"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 右侧侧边栏 -->
      <Sidebar
        :categories="categories"
        :tags="tags"
        @category-click="navigateToCategory"
        @tag-click="navigateToTag"
      />
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px 0;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
  padding: 0 20px;
}

.article-list {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #606266;
}

.loading-container .el-icon {
  margin-right: 10px;
}

.error-container {
  padding: 40px 0;
  text-align: center;
}

.error-container .el-button {
  margin-top: 20px;
}

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

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
}
</style>
