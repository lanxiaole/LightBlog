<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElForm, ElFormItem, ElInput, ElButton, ElSelect, ElOption } from 'element-plus';
import { getArticleDetail, updateArticle } from '@/api/article';
import { useArticleForm } from '@/composables/useArticleForm';
import ArticleEditor from '@/components/ArticleEditor.vue';
import CoverUpload from '@/components/CoverUpload.vue';

const route = useRoute();
const router = useRouter();

// 文章ID
const articleId = ref<number>(parseInt(route.params.id as string));

// 编辑器引用
const articleEditorRef = ref<InstanceType<typeof ArticleEditor> | null>(null);

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
    articleEditorRef.value?.setHtml(article.content);
  } catch (error: any) {
    handleError(error);
  } finally {
    loading.value = false;
  }
};

// 错误处理
const handleError = (error: any) => {
  if (error.message?.includes('403')) {
    router.back();
  } else if (error.message?.includes('404')) {
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

// 组件挂载时初始化
onMounted(() => {
  loadArticleDetail();
});
</script>

<template>
  <div class="edit-article">
    <h1 class="page-title">编辑文章</h1>

    <div v-show="loading" class="loading-container">
      <el-button loading>加载中...</el-button>
    </div>

    <el-form v-show="!loading" :model="form" label-width="80px" class="article-form">
      <!-- 标题 -->
      <el-form-item label="标题" required>
        <el-input
          v-model="form.title"
          placeholder="请输入文章标题"
          :maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <!-- 分类 -->
      <el-form-item label="分类">
        <el-select
          v-model="form.category_id"
          placeholder="请选择分类"
          clearable
        >
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </el-form-item>

      <!-- 标签 -->
      <el-form-item label="标签">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="请选择或输入标签"
        >
          <el-option
            v-for="tag in existingTags"
            :key="tag.id"
            :label="tag.name"
            :value="tag.name"
          />
        </el-select>
      </el-form-item>

      <!-- 封面图 -->
      <el-form-item label="封面图">
        <CoverUpload v-model="form.cover" />
      </el-form-item>

      <!-- 正文 -->
      <el-form-item label="正文" required>
        <ArticleEditor ref="articleEditorRef" v-model="form.content" />
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          保存修改
        </el-button>
        <el-button @click="$router.back()">
          取消
        </el-button>
      </el-form-item>
    </el-form>
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

.article-form {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .edit-article {
    padding: 10px;
  }

  .article-form {
    padding: 15px;
  }
}
</style>
