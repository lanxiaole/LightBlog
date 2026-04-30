<template>
  <div class="articles-admin">
    <h1 class="page-title">文章管理</h1>
    
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-left">
        <el-select
          v-model="status"
          placeholder="选择状态"
          clearable
          class="filter-select"
        >
          <el-option label="全部" value="" />
          <el-option label="已发布" value="published" />
          <el-option label="草稿" value="draft" />
          <el-option label="下架" value="banned" />
        </el-select>
        
        <el-select
          v-model="categoryId"
          placeholder="选择分类"
          clearable
          class="filter-select"
        >
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
        
        <el-input
          v-model="keyword"
          placeholder="搜索文章标题"
          class="filter-input"
          clearable
          @keyup.enter="handleSearch"
        />
        
        <el-button class="search-btn" @click="handleSearch">搜索</el-button>
      </div>
      
      <div class="filter-right">
        <el-button type="primary" class="add-btn" @click="$router.push('/write')">
          新增文章
        </el-button>
      </div>
    </div>
    
    <!-- 文章列表 -->
    <div class="table-card">
      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%"
        :border="false"
        :highlight-current-row="false"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="scope">
            <span class="article-title">{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="作者" width="120">
          <template #default="scope">
            {{ scope.row.author?.username || '未知' }}
          </template>
        </el-table-column>
        <el-table-column label="分类" width="120">
          <template #default="scope">
            {{ scope.row.category?.name || '未分类' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag
              :class="getStatusTagClass(scope.row.status, scope.row.is_pinned)"
            >
              {{ getStatusText(scope.row.status, scope.row.is_pinned) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="发布时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="views" label="阅读量" width="100" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <button
              class="action-btn action-pin"
              @click="handleTogglePin(scope.row.id, !scope.row.is_pinned)"
            >
              {{ scope.row.is_pinned ? '取消置顶' : '置顶' }}
            </button>
            <button
              class="action-btn action-status"
              @click="handleStatusChange(scope.row.id, scope.row.status === 'published' ? 'banned' : 'published')"
            >
              {{ scope.row.status === 'published' ? '下架' : '发布' }}
            </button>
            <button
              class="action-btn action-edit"
              @click="$router.push(`/article/edit/${scope.row.id}`)"
            >
              编辑
            </button>
            <button
              class="action-btn action-delete"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 空状态 -->
      <div v-if="!loading && list.length === 0" class="empty-state">
        <div class="empty-icon">暂无文章</div>
        <el-button type="primary" @click="$router.push('/write')">新增文章</el-button>
      </div>
    </div>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { getAllArticles, togglePin, updateArticleStatus, deleteArticle } from '@/api/admin/articles';
import { getCategories } from '@/api/category';
import type { AdminArticle } from '@/api/admin/articles';
import type { Category } from '@/api/category';

// 响应式数据
const list = ref<AdminArticle[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');
const categoryId = ref<number | null>(null);
const status = ref('');
const categories = ref<Category[]>([]);
const loading = ref(false);

// 格式化日期
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取状态标签样式类
const getStatusTagClass = (status: string, isPinned: boolean): string => {
  if (isPinned) return 'status-tag pinned';
  switch (status) {
    case 'published':
      return 'status-tag published';
    case 'draft':
      return 'status-tag draft';
    case 'banned':
      return 'status-tag banned';
    default:
      return 'status-tag';
  }
};

// 获取状态文本
const getStatusText = (status: string, isPinned: boolean): string => {
  if (isPinned) return '置顶';
  switch (status) {
    case 'published':
      return '已发布';
    case 'draft':
      return '草稿';
    case 'banned':
      return '已下架';
    default:
      return status;
  }
};

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await getCategories();
    categories.value = response;
  } catch (error: any) {
    ElMessage.error(error.message || '获取分类失败');
  }
};

// 获取文章列表
const fetchArticles = async () => {
  loading.value = true;
  try {
    const response = await getAllArticles({
      keyword: keyword.value,
      categoryId: categoryId.value || undefined,
      status: status.value,
      page: page.value,
      pageSize: pageSize.value
    });
    list.value = response.list;
    total.value = response.total;
  } catch (error: any) {
    ElMessage.error(error.message || '获取文章列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  page.value = 1;
  fetchArticles();
};

// 切换置顶状态
const handleTogglePin = async (id: number, isPinned: boolean) => {
  try {
    await togglePin(id, isPinned);
    ElMessage.success('置顶状态更新成功');
    fetchArticles();
  } catch (error: any) {
    ElMessage.error(error.message || '更新置顶状态失败');
  }
};

// 更新文章状态
const handleStatusChange = async (id: number, newStatus: string) => {
  try {
    await updateArticleStatus(id, newStatus);
    ElMessage.success('状态更新成功');
    fetchArticles();
  } catch (error: any) {
    ElMessage.error(error.message || '更新状态失败');
  }
};

// 删除文章
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？此操作不可恢复', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await deleteArticle(id);
    ElMessage.success('删除成功');
    fetchArticles();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 分页切换
const handlePageChange = (current: number) => {
  page.value = current;
  fetchArticles();
};

// 每页数量切换
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  page.value = 1;
  fetchArticles();
};

// 初始化
onMounted(() => {
  fetchCategories();
  fetchArticles();
});
</script>

<style scoped>
@import './Articles.scss';
</style>