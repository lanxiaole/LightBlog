<script setup lang="ts">
import { ref } from 'vue';
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElSelect,
  ElOption
} from 'element-plus';
import ArticleEditor from '@/components/article/ArticleEditor.vue';
import CoverUpload from '@/components/article/CoverUpload.vue';
import type { Category } from '@/api/category';
import type { Tag } from '@/api/tag';

/**
 * 文章表单组件
 * 用于创建和编辑文章的共享表单
 */

interface Props {
  /** 表单数据 */
  modelValue: {
    title: string;
    content: string;
    cover: string;
    category_id?: number;
    tags: string[];
  };
  /** 分类列表 */
  categories: Category[];
  /** 已有标签列表 */
  existingTags: Tag[];
  /** 是否提交中 */
  submitting: boolean;
  /** 提交按钮文本 */
  submitText?: string;
  /** 编辑器初始内容（用于编辑时） */
  initialContent?: string;
}

const props = withDefaults(defineProps<Props>(), {
  submitText: '发布文章',
  initialContent: ''
});

const emit = defineEmits<{
  /** 更新表单数据 */
  'update:modelValue': [value: Props['modelValue']];
  /** 提交表单 */
  submit: [];
  /** 取消 */
  cancel: [];
}>();

// 编辑器引用
const articleEditorRef = ref<InstanceType<typeof ArticleEditor> | null>(null);

/**
 * 设置编辑器内容
 * @param html HTML内容
 */
const setEditorContent = (html: string) => {
  articleEditorRef.value?.setHtml(html);
};

/**
 * 更新表单字段
 * @param field 字段名
 * @param value 字段值
 */
const updateField = <K extends keyof Props['modelValue']>(
  field: K,
  value: Props['modelValue'][K]
) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  });
};

// 暴露方法给父组件
defineExpose({
  setEditorContent
});
</script>

<template>
  <el-form :model="modelValue" label-width="80px" class="article-form">
    <!-- 标题 -->
    <el-form-item label="标题" required>
      <el-input
        :model-value="modelValue.title"
        @update:model-value="updateField('title', $event)"
        placeholder="请输入文章标题"
        :maxlength="100"
        show-word-limit
      />
    </el-form-item>

    <!-- 分类 -->
    <el-form-item label="分类">
      <el-select
        :model-value="modelValue.category_id"
        @update:model-value="updateField('category_id', $event)"
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
        :model-value="modelValue.tags"
        @update:model-value="updateField('tags', $event)"
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
      <CoverUpload
        :model-value="modelValue.cover"
        @update:model-value="updateField('cover', $event)"
      />
    </el-form-item>

    <!-- 正文 -->
    <el-form-item label="正文" required>
      <ArticleEditor
        ref="articleEditorRef"
        :model-value="modelValue.content"
        @update:model-value="updateField('content', $event)"
      />
    </el-form-item>

    <!-- 操作按钮 -->
    <el-form-item>
      <el-button type="primary" @click="emit('submit')" :loading="submitting">
        {{ submitText }}
      </el-button>
      <el-button @click="emit('cancel')">
        取消
      </el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.article-form {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .article-form {
    padding: 15px;
  }
}
</style>
