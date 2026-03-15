<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ElForm, ElFormItem, ElInput, ElButton, ElSelect, ElOption } from 'element-plus';
import { createArticle } from '@/api/article';
import { useArticleForm } from '@/composables/article/useArticleForm';
import ArticleEditor from '@/components/article/ArticleEditor.vue';
import CoverUpload from '@/components/article/CoverUpload.vue';

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
</script>

<template>
  <div class="write-article">
    <h1 class="page-title">写文章</h1>

    <el-form :model="form" label-width="80px" class="article-form">
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
        <ArticleEditor v-model="form.content" />
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          发布文章
        </el-button>
        <el-button @click="$router.back()">
          取消
        </el-button>
      </el-form-item>
    </el-form>
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

.article-form {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .write-article {
    padding: 10px;
  }

  .article-form {
    padding: 15px;
  }
}
</style>
