<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getArticleDetail, updateArticle } from '@/api/article';
import { useArticleForm } from '@/composables/article/useArticleForm';
import ArticleForm from './components/ArticleForm.vue';

const route = useRoute();
const router = useRouter();

// 文章ID
const articleId = ref<number>(parseInt(route.params.id as string));

// 表单组件引用
const articleFormRef = ref<InstanceType<typeof ArticleForm> | null>(null);

const {
  form,
  categories,
  existingTags,
  loading,
  submitting,
  setFormData,
  validateForm
} = useArticleForm();

// 加载文章详情
const loadArticleDetail = async () => {
  try {
    loading.value = true;
    const article = await getArticleDetail(articleId.value);

    setFormData({
      title: article.title,
      content: article.content,
      cover: article.cover || '',
      category_id: article.category?.id,
      tags: article.tags?.map(t => t.name) || []
    });

    // 设置编辑器内容
    articleFormRef.value?.setEditorContent(article.content);
  } catch (error: any) {
    handleError(error);
  } finally {
    loading.value = false;
  }
};

// 错误处理
const handleError = (error: any) => {
  if (error.message?.includes('403') || error.message?.includes('404')) {
    router.back();
  }
};

// 提交表单
const submitForm = async () => {
  if (!validateForm()) return;

  try {
    submitting.value = true;
    await updateArticle(articleId.value, {
      title: form.value.title,
      content: form.value.content,
      cover: form.value.cover,
      category_id: form.value.category_id,
      tags: form.value.tags
    });
    router.push(`/article/${articleId.value}`);
  } catch (error: any) {
    console.error('更新文章失败:', error);
    // 错误已在拦截器处理
  } finally {
    submitting.value = false;
  }
};

// 取消
const handleCancel = () => {
  router.back();
};

// 组件挂载时初始化
onMounted(() => {
  loadArticleDetail();
});
</script>

<template>
  <div class="edit-article">
    <h1 class="page-title">编辑文章</h1>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-button loading>加载中...</el-button>
    </div>

    <!-- 编辑表单 -->
    <ArticleForm
      v-else
      ref="articleFormRef"
      v-model="form"
      :categories="categories"
      :existing-tags="existingTags"
      :submitting="submitting"
      submit-text="保存修改"
      @submit="submitForm"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.edit-article {
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

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

@media (max-width: 768px) {
  .edit-article {
    padding: 10px;
  }
}
</style>
