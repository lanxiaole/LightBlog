<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElUpload, ElSelect, ElOption } from 'element-plus';

import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';
import { getArticleDetail, updateArticle } from '@/api/article';
import { getCategories } from '@/api/category';
import { getTags } from '@/api/tag';
import type { Category } from '@/api/category';
import type { Tag } from '@/api/tag';

// 路由实例
const route = useRoute();
const router = useRouter();

// 从路由获取文章ID
const articleId = ref<number>(parseInt(route.params.id as string));

// 表单数据
const form = ref({
  title: '',
  content: '',
  cover: '',
  category_id: undefined as number | undefined,
  tags: [] as string[]
});

// 分类和标签数据
const categories = ref<Category[]>([]);
const existingTags = ref<Tag[]>([]);

// 加载状态
const loading = ref(false);
const submitting = ref(false);

// 编辑器实例
let editorInstance: any = null;

// 编辑器配置
const editorConfig = {
  placeholder: '请输入文章内容...',
  MENU_CONF: {
    uploadImage: {
      server: '/api/upload',
      fieldName: 'file'
    }
  }
};

// 编辑器内容变化回调
const handleEditorChange = (editor: any) => {
  form.value.content = editor.getHtml();
};

// 编辑器创建完成回调
const handleEditorCreated = (editor: any) => {
  editorInstance = editor;
};

// 上传封面图
const handleCoverUpload = (file: any) => {
  form.value.cover = URL.createObjectURL(file.raw);
  return false;
};

// 移除封面图
const handleCoverRemove = () => {
  form.value.cover = '';
};

// 提交表单
const submitForm = async () => {
  if (!form.value.title.trim()) {
    ElMessage.warning('请输入文章标题');
    return;
  }
  if (!form.value.content.trim()) {
    ElMessage.warning('请输入文章内容');
    return;
  }

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
    ElMessage.success('文章更新成功');
  } catch (error: any) {
    if (error.message.includes('403')) {
      ElMessage.error('无权限修改此文章');
    } else if (error.message.includes('404')) {
      ElMessage.error('文章不存在');
    } else {
      ElMessage.error(error.message || '文章更新失败');
    }
  } finally {
    submitting.value = false;
  }
};

// 加载文章详情
const loadArticleDetail = async () => {
  try {
    loading.value = true;
    const article = await getArticleDetail(articleId.value);

    form.value.title = article.title;
    form.value.content = article.content;
    form.value.cover = article.cover || '';
    form.value.category_id = article.category?.id;
    form.value.tags = article.tags?.map(t => t.name) || [];

    // 等待 DOM 更新后设置编辑器内容
    await nextTick();
    if (editorInstance) {
      editorInstance.setHtml(article.content);
    }
  } catch (error: any) {
    if (error.message.includes('403')) {
      ElMessage.error('无权限修改此文章');
      router.back();
    } else if (error.message.includes('404')) {
      ElMessage.error('文章不存在');
      router.back();
    } else {
      ElMessage.error(error.message || '加载文章详情失败');
    }
  } finally {
    loading.value = false;
  }
};

// 组件挂载时初始化
onMounted(async () => {
  try {
    categories.value = await getCategories();
    existingTags.value = await getTags();
    await loadArticleDetail();
  } catch (error: any) {
    ElMessage.error(error.message || '初始化失败');
  }
});

// 组件卸载前销毁编辑器
onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.destroy();
  }
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
        <el-upload
          class="cover-upload"
          action="#"
          :auto-upload="false"
          :on-change="handleCoverUpload"
          :on-remove="handleCoverRemove"
          :file-list="form.cover ? [{ url: form.cover, name: '封面图' }] : []"
          :limit="1"
        >
          <el-button type="primary" icon="el-icon-upload">
            选择封面
          </el-button>
          <template #tip>
            <div class="el-upload__tip">
              请选择一张图片作为封面（可选）
            </div>
          </template>
        </el-upload>
        <div v-if="form.cover" class="cover-preview">
          <img :src="form.cover" alt="封面预览" />
        </div>
      </el-form-item>

      <!-- 正文 -->
      <el-form-item label="正文" required>
        <div class="editor-container">
          <Toolbar
            style="border-bottom: 1px solid #ccc"
            :editor="editorInstance"
            :default-config="editorConfig"
          />
          <Editor
            style="height: 400px; overflow-y: auto"
            v-model="form.content"
            :default-config="editorConfig"
            @on-change="handleEditorChange"
            @on-created="handleEditorCreated"
          />
        </div>
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

.editor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.cover-upload {
  margin-bottom: 15px;
}

.cover-preview {
  margin-top: 10px;
  max-width: 300px;
}

.cover-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .edit-article {
    padding: 10px;
  }

  .article-form {
    padding: 15px;
  }

  .editor-container {
    height: 300px;
  }

  .editor-container :deep(.w-e-text-container) {
    height: calc(100% - 40px) !important;
  }
}
</style>
