<template>
  <div class="tag-page">
    <div class="page-header">
      <h1 class="page-title">标签</h1>
      <p class="page-desc">浏览所有文章标签</p>
    </div>

    <div class="tag-cloud" v-loading="loading">
      <el-tag
        v-for="tag in tags"
        :key="tag.id"
        class="tag-item"
        @click="router.push(`/tag/${tag.name}`)"
      >
        {{ tag.name }}
      </el-tag>
    </div>

    <el-empty v-if="!loading && tags.length === 0" description="暂无标签" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getTags } from '@/api/tag';

const router = useRouter();

interface Tag {
  id: number;
  name: string;
}

const tags = ref<Tag[]>([]);
const loading = ref(true);

const fetchTags = async () => {
  try {
    loading.value = true;
    const data = await getTags();
    tags.value = data;
  } catch (error) {
    console.error('获取标签失败:', error);
    tags.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTags();
});
</script>

<style scoped lang="scss">
$primary-color: #1E3A8A;
$text-dark: #111827;
$text-gray: #6B7280;
$border-color: #E5E7EB;

.tag-page {
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

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.tag-item {
  cursor: pointer;
  padding: 10px 20px;
  font-size: 15px;
  border-radius: 20px;
  transition: all 0.2s linear;
  border: 1px solid $border-color;
  background-color: white;

  &:hover {
    background-color: $primary-color;
    color: white;
    border-color: $primary-color;
    transform: translateY(-2px);
  }
}

@media (max-width: 767px) {
  .tag-page {
    padding: 24px 16px;
  }

  .page-header {
    margin-bottom: 24px;

    .page-title {
      font-size: 24px;
    }
  }

  .tag-cloud {
    gap: 12px;
  }

  .tag-item {
    padding: 8px 16px;
    font-size: 14px;
  }
}
</style>
