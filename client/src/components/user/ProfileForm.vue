<template>
  <ElForm
    :model="modelValue"
    :rules="rules"
    ref="formRef"
    label-width="100px"
    class="profile-form"
  >
    <div class="form-row">
      <el-form-item label="用户名" prop="username">
        <el-input
          :model-value="modelValue.username"
          @update:model-value="(val) => handleChange('username', val)"
          placeholder="请输入用户名"
          class="form-input"
        />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input
          :model-value="modelValue.email"
          @update:model-value="(val) => handleChange('email', val)"
          placeholder="请输入邮箱"
          class="form-input"
          disabled
        />
      </el-form-item>
    </div>

    <div class="form-row">
      <el-form-item label="个人简介" prop="bio">
        <el-input
          :model-value="modelValue.bio"
          @update:model-value="(val) => handleChange('bio', val)"
          type="textarea"
          placeholder="请输入个人简介"
          :rows="4"
          class="form-input bio-input"
        />
      </el-form-item>
    </div>

    <div class="form-actions">
      <el-button type="primary" class="submit-btn" @click="handleSubmit($refs.formRef)" :loading="loading">
        保存
      </el-button>
      <el-button class="cancel-btn" @click="handleCancel">
        取消
      </el-button>
    </div>
  </ElForm>
</template>

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
    email: string;
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
  'update:modelValue': [value: { username: string; email: string; bio: string }];
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
const handleChange = (field: 'username' | 'email' | 'bio', value: string) => {
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

<style scoped>
.profile-form {
  width: 100%;
}

.form-row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.form-row .el-form-item {
  flex: 1;
  margin-bottom: 0;
}

.form-input {
  border-radius: 6px;
  border: 1px solid #E5E7EB;
  padding: 12px 16px;
  transition: border-color 0.2s linear;
}

.form-input:focus {
  border-color: #1E3A8A;
  box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.1);
}

.bio-input {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #E5E7EB;
}

.submit-btn {
  background-color: #1E3A8A;
  color: #ffffff;
  border-radius: 6px;
  padding: 10px 24px;
  border: none;
  transition: background-color 0.2s linear;
}

.submit-btn:hover {
  background-color: #1E3A8A;
  filter: brightness(0.9);
}

.cancel-btn {
  border-radius: 6px;
  padding: 10px 24px;
  transition: background-color 0.2s linear;
}

.cancel-btn:hover {
  background-color: #F3F4F6;
}

:deep(.el-form-item__error) {
  font-size: 14px;
  color: #EF4444;
  margin-top: 6px;
}

@media (max-width: 1199px) {
  .form-row {
    flex-direction: column;
  }

  .form-row .el-form-item {
    width: 100%;
  }
}
</style>