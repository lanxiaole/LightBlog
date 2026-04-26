<template>
  <div class="category-page">
    <div class="page-header">
      <h1 class="page-title">分类</h1>
      <p class="page-desc">浏览所有文章分类</p>
    </div>

    <div class="category-grid" v-loading="loading">
      <el-card
        v-for="category in categories"
        :key="category.id"
        class="category-card"
        @click="router.push(`/category/${category.name}`)"
      >
        <div class="category-icon">
          <el-icon><Folder /></el-icon>
        </div>
        <div class="category-info">
          <h3 class="category-name">{{ category.name }}</h3>
          <p class="category-count">{{ category.articleCount || 0 }} 篇文章</p>
        </div>
      </el-card>
    </div>

    <el-empty v-if="!loading && categories.length === 0" description="暂无分类" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Folder } from '@element-plus/icons-vue';
import { getCategories } from '@/api/category';

const router = useRouter();

interface Category {
  id: number;
  name: string;
  description: string | null;
  articleCount?: number;
}

const categories = ref<Category[]>([]);
const loading = ref(true);

const fetchCategories = async () => {
  try {
    loading.value = true;
    const data = await getCategories();
    categories.value = data;
  } catch (error) {
    console.error('获取分类失败:', error);
    categories.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped lang="scss">
$primary-color: #1E3A8A;
$text-dark: #111827;
$text-gray: #6B7280;
$border-color: #E5E7EB;
$bg-light: #F3F4F6;

.category-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;

  .page-title {
    font-size: 32px;
    font-weight: 700;
    color: $text-dark;
    margin: 0 0 12px 0;
  }

  .page-desc {
    font-size: 16px;
    color: $text-gray;
    margin: 0;
  }
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.category-card {
  cursor: pointer;
  transition: all 0.2s linear;
  border: 1px solid $border-color;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    border-color: $primary-color;
  }

  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    padding: 20px;
  }
}

.category-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, $primary-color, #3B82F6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;

  .el-icon {
    font-size: 28px;
    color: white;
  }
}

.category-info {
  flex: 1;

  .category-name {
    font-size: 18px;
    font-weight: 600;
    color: $text-dark;
    margin: 0 0 8px 0;
  }

  .category-count {
    font-size: 14px;
    color: $text-gray;
    margin: 0;
  }
}

@media (max-width: 767px) {
  .category-page {
    padding: 24px 16px;
  }

  .page-header {
    margin-bottom: 24px;

    .page-title {
      font-size: 24px;
    }
  }

  .category-grid {
    grid-template-columns: 1fr;
  }
}
</style>
