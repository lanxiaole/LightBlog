<script setup lang="ts">
import { ElForm, ElFormItem, ElInput, ElButton } from 'element-plus';

/**
 * 资料表单组件
 * 用于编辑用户资料，包括用户名和个人简介
 */

// 组件属性定义
interface Props {
  /** 表单数据 */
  modelValue: {
    username: string;
    bio: string;
  };
  /** 表单验证规则 */
  rules?: Record<string, any>;
  /** 提交按钮加载状态 */
  loading?: boolean;
}

// 定义组件属性并设置默认值
const props = withDefaults(defineProps<Props>(), {
  loading: false
});

// 定义组件事件
const emit = defineEmits<{
  /** 表单数据更新事件，用于 v-model 双向绑定 */
  'update:modelValue': [value: { username: string; bio: string }];
  /** 提交按钮点击事件 */
  'submit': [formEl: any];
  /** 取消按钮点击事件 */
  'cancel': [];
}>();

/**
 * 处理表单数据变化
 * @param field 字段名
 * @param value 字段值
 */
const handleChange = (field: 'username' | 'bio', value: string) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  });
};

/**
 * 处理提交按钮点击
 * @param formEl 表单元素引用
 */
const handleSubmit = (formEl: any) => {
  emit('submit', formEl);
};

/**
 * 处理取消按钮点击
 */
const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <ElForm
    :model="modelValue"
    :rules="rules"
    ref="formRef"
    label-width="80px"
    class="settings-form"
  >
    <el-form-item label="用户名" prop="username">
      <el-input 
        :model-value="modelValue.username"
        @update:model-value="(val) => handleChange('username', val)"
        placeholder="请输入用户名" 
      />
    </el-form-item>

    <el-form-item label="个人简介">
      <el-input
        :model-value="modelValue.bio"
        @update:model-value="(val) => handleChange('bio', val)"
        type="textarea"
        placeholder="请输入个人简介"
        :rows="4"
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit($refs.formRef)" :loading="loading">
        保存
      </el-button>
      <el-button @click="handleCancel" style="margin-left: 10px;">
        取消
      </el-button>
    </el-form-item>
  </ElForm>
</template>

<style scoped>
.settings-form {
  margin-top: 20px;
}
</style>
