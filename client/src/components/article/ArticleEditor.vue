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

<script setup lang="ts">
import { shallowRef } from 'vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';

interface Props {
  modelValue: string;
  height?: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  placeholder: '请输入文章内容...'
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const editorInstance = shallowRef<any>(null);

const editorConfig = {
  placeholder: props.placeholder,
  MENU_CONF: {
    uploadImage: {
      server: 'http://localhost:3000/api/oss/editor-upload',
      fieldName: 'file',
      maxFileSize: 10 * 1024 * 1024,
      allowedFileTypes: ['image/*'],
      meta: {
        token: localStorage.getItem('token') || ''
      },
      metaWithUrl: true,
      customInsert(res: any, insertFn: any) {
        if (res.errno === 0) {
          insertFn(res.data.url);
        }
      }
    }
  }
};

const handleEditorChange = (editor: any) => {
  emit('update:modelValue', editor.getHtml());
};

const handleEditorCreated = (editor: any) => {
  editorInstance.value = editor;
};

defineExpose({
  editorInstance,
  setHtml: (html: string) => {
    editorInstance.value?.setHtml(html);
  }
});
</script>

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
