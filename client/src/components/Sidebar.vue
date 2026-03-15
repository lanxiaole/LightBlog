<script setup lang="ts">
import { ElCard, ElTag } from 'element-plus';
import type { Category } from '@/api/category';
import type { Tag } from '@/api/tag';

/**
 * 侧边栏组件
 * 展示热门推荐、分类和标签
 */

// 组件属性定义
interface Props {
  /** 分类列表 */
  categories: Category[];
  /** 标签列表 */
  tags: Tag[];
  /** 热门推荐列表（可选） */
  hotArticles?: string[];
}

// 定义组件属性并设置默认值
withDefaults(defineProps<Props>(), {
  hotArticles: () => ['热门文章 1', '热门文章 2', '热门文章 3', '热门文章 4', '热门文章 5']
});

// 定义组件事件
const emit = defineEmits<{
  /** 分类点击事件 */
  'category-click': [name: string];
  /** 标签点击事件 */
  'tag-click': [name: string];
}>();

/**
 * 处理分类点击
 * @param name 分类名称
 */
const handleCategoryClick = (name: string) => {
  emit('category-click', name);
};

/**
 * 处理标签点击
 * @param name 标签名称
 */
const handleTagClick = (name: string) => {
  emit('tag-click', name);
};
</script>

<template>
  <div class="sidebar">
    <!-- 热门推荐 -->
    <ElCard class="sidebar-card">
      <template #header>
        <div class="sidebar-title">热门推荐</div>
      </template>
      <div class="sidebar-content">
        <p v-for="(article, index) in hotArticles" :key="index">
          {{ article }}
        </p>
      </div>
    </ElCard>

    <!-- 分类 -->
    <ElCard class="sidebar-card" style="margin-top: 20px;">
      <template #header>
        <div class="sidebar-title">分类</div>
      </template>
      <div class="sidebar-content">
        <p
          v-for="category in categories"
          :key="category.id"
          @click="handleCategoryClick(category.name)"
          class="clickable"
        >
          {{ category.name }}
        </p>
        <p v-if="categories.length === 0" class="no-data">
          暂无分类
        </p>
      </div>
    </ElCard>

    <!-- 标签 -->
    <ElCard class="sidebar-card" style="margin-top: 20px;">
      <template #header>
        <div class="sidebar-title">标签</div>
      </template>
      <div class="sidebar-content">
        <ElTag
          v-for="tag in tags"
          :key="tag.id"
          size="small"
          type="info"
          @click="handleTagClick(tag.name)"
          class="tag-item"
        >
          {{ tag.name }}
        </ElTag>
        <p v-if="tags.length === 0" class="no-data">
          暂无标签
        </p>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.sidebar {
  width: 200px;
  flex-shrink: 0;
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
}

.sidebar-content p.clickable {
  cursor: pointer;
  transition: color 0.3s ease;
}

.sidebar-content p.clickable:hover {
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
  .sidebar {
    width: 100%;
  }
}
</style>
