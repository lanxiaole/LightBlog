<script setup lang="ts">
import { shallowRef } from 'vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';

/**
 * 富文本编辑器组件
 * 封装了 WangEditor 编辑器，提供统一的编辑体验
 */

// 组件属性定义
interface Props {
  /** 编辑器内容，支持 v-model 双向绑定 */
  modelValue: string;
  /** 编辑器高度，默认 400px */
  height?: string;
  /** 编辑器占位符，默认 '请输入文章内容...' */
  placeholder?: string;
}

// 定义组件属性并设置默认值
const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  placeholder: '请输入文章内容...'
});

// 定义组件事件
const emit = defineEmits<{
  /** 内容变化时触发的事件，用于 v-model 双向绑定 */
  'update:modelValue': [value: string];
}>();

/** 编辑器实例（使用 shallowRef 优化性能） */
const editorInstance = shallowRef<any>(null);

/** 编辑器配置 */
const editorConfig = {
  // 占位符文本
  placeholder: props.placeholder,
  // 菜单配置
  MENU_CONF: {
    // 图片上传配置
    uploadImage: {
      server: '/api/upload', // 上传接口地址
      fieldName: 'file' // 上传字段名
    }
  }
};

/**
 * 编辑器内容变化回调
 * @param editor 编辑器实例
 */
const handleEditorChange = (editor: any) => {
  // 触发内容变化事件，更新 v-model 绑定的值
  emit('update:modelValue', editor.getHtml());
};

/**
 * 编辑器创建完成回调
 * @param editor 编辑器实例
 */
const handleEditorCreated = (editor: any) => {
  // 保存编辑器实例，用于后续操作
  editorInstance.value = editor;
};

// 暴露方法给父组件
defineExpose({
  // 暴露编辑器实例
  editorInstance,
  // 暴露设置HTML内容的方法
  setHtml: (html: string) => {
    editorInstance.value?.setHtml(html);
  }
});
</script>

<template>
  <div class="editor-container">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorInstance"
      :default-config="editorConfig"
    />
    <Editor
      :style="{ height, overflowY: 'auto' }"
      :model-value="modelValue"
      :default-config="editorConfig"
      @on-change="handleEditorChange"
      @on-created="handleEditorCreated"
    />
  </div>
</template>

<style scoped>
.editor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .editor-container :deep(.w-e-text-container) {
    height: calc(100% - 40px) !important;
  }
}
</style>
