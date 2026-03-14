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
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
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
      <div class="sidebar">
        <el-card class="sidebar-card">
          <template #header>
            <div class="sidebar-title">热门推荐</div>
          </template>
          <div class="sidebar-content">
            <p>热门文章 1</p>
            <p>热门文章 2</p>
            <p>热门文章 3</p>
            <p>热门文章 4</p>
            <p>热门文章 5</p>
          </div>
        </el-card>

        <el-card class="sidebar-card" style="margin-top: 20px;">
          <template #header>
            <div class="sidebar-title">分类</div>
          </template>
          <div class="sidebar-content">
            <p v-for="category in categories" :key="category.id" @click="navigateToCategory(category.name)">
              {{ category.name }}
            </p>
            <p v-if="categories.length === 0" class="no-data">
              暂无分类
            </p>
          </div>
        </el-card>

        <el-card class="sidebar-card" style="margin-top: 20px;">
          <template #header>
            <div class="sidebar-title">标签</div>
          </template>
          <div class="sidebar-content">
            <el-tag
              v-for="tag in tags"
              :key="tag.id"
              size="small"
              type="info"
              @click="navigateToTag(tag.name)"
              class="tag-item"
            >
              {{ tag.name }}
            </el-tag>
            <p v-if="tags.length === 0" class="no-data">
              暂无标签
            </p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { getArticles } from '@/api/article';
import { getCategories } from '@/api/category';
import { getTags } from '@/api/tag';
import type { Article } from '@/api/article';
import type { Category } from '@/api/category';
import type { Tag } from '@/api/tag';

// 路由实例
const router = useRouter();

// 文章列表数据
const articles = ref<Article[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 分类和标签数据
const categories = ref<Category[]>([]);
const tags = ref<Tag[]>([]);

// 加载状态
const loading = ref(false);
const error = ref('');

// 格式化日期
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

// 获取文章摘要
const getSummary = (content: string): string => {
  // 去除HTML标签
  const plainText = content.replace(/<[^>]*>/g, '');
  // 简单截取前100字作为摘要
  return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
};

// 跳转到文章详情页
const navigateToArticle = (id: number) => {
  router.push(`/article/${id}`);
};

// 跳转到分类页面
const navigateToCategory = (name: string) => {
  router.push(`/category/${name}`);
};

// 跳转到标签页面
const navigateToTag = (name: string) => {
  router.push(`/tag/${name}`);
};

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchArticles();
};

// 处理页码变化
const handleCurrentChange = (current: number) => {
  currentPage.value = current;
  fetchArticles();
};

// 获取文章列表
const fetchArticles = async () => {
  try {
    loading.value = true;
    error.value = '';

    const response = await getArticles({
      page: currentPage.value,
      pageSize: pageSize.value
    });

    articles.value = response.list;
    total.value = response.total;
  } catch (err: any) {
    error.value = err.message || '获取文章列表失败';
    ElMessage.error(error.value);
  } finally {
    loading.value = false;
  }
};

// 获取分类和标签数据
const fetchCategoriesAndTags = async () => {
  try {
    // 获取分类
    const categoryList = await getCategories();
    categories.value = categoryList;

    // 获取标签
    const tagList = await getTags();
    tags.value = tagList;
  } catch (error) {
    console.error('获取分类和标签失败:', error);
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchArticles();
  fetchCategoriesAndTags();
});
</script>

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

.sidebar {
  width: 200px;
  flex-shrink: 0;
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

.sidebar-card {
  margin-bottom: 20px;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.sidebar-content {
  padding: 10px 0;
}

.sidebar-content p {
  margin: 10px 0;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: color 0.3s ease;
}

.sidebar-content p:hover {
  color: #409eff;
}

.no-data {
  color: #909399;
  font-style: italic;
}

.tag-item {
  margin: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-item:hover {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }
}
</style>
