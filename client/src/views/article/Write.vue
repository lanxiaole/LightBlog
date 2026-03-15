<script setup lang="ts">
import { useRouter } from 'vue-router';
import { createArticle } from '@/api/article';
import { useArticleForm } from '@/composables/article/useArticleForm';
import ArticleForm from './components/ArticleForm.vue';

const router = useRouter();

const {
  form,
  categories,
  existingTags,
  submitting,
  validateForm
} = useArticleForm();

// 提交表单
const submitForm = async () => {
  if (!validateForm()) return;

  try {
    submitting.value = true;
    const result = await createArticle({
      title: form.value.title,
      content: form.value.content,
      cover: form.value.cover,
      category_id: form.value.category_id,
      tags: form.value.tags
    });
    router.push(`/article/${result.id}`);
  } catch (error: any) {
    console.error('创建文章失败:', error);
    // 错误已在拦截器处理
  } finally {
    submitting.value = false;
  }
};

// 取消
const handleCancel = () => {
  router.back();
};
</script>

<template>
  <div class="write-article">
    <h1 class="page-title">写文章</h1>

    <ArticleForm
      v-model="form"
      :categories="categories"
      :existing-tags="existingTags"
      :submitting="submitting"
      submit-text="发布文章"
      @submit="submitForm"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.write-article {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 30px 0;
  color: #303133;
}

@media (max-width: 768px) {
  .write-article {
    padding: 10px;
  }
}
</style>
