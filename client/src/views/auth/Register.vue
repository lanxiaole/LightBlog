<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h2>注册</h2>
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="register-form"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="请输入邮箱"
            prefix-icon="el-icon-message"
          />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请确认密码"
            prefix-icon="el-icon-lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="register-button"
            :loading="loading"
            @click="handleRegister"
            :disabled="loading"
          >
            注册
          </el-button>
        </el-form-item>
        <div class="login-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { register } from '@/api/auth';

const formRef = ref();
const loading = ref(false);
const router = useRouter();

const form = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: ''
});

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

const handleRegister = async () => {
  if (!formRef.value) return;

  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      (async () => {
        try {
          loading.value = true;
          await register(form.email, form.username, form.password);
          ElMessage.success('注册成功');
          router.push('/login');
        } catch (error: any) {
          ElMessage.error(error.message || '注册失败');
        } finally {
          loading.value = false;
        }
      })();
    }
  });
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  max-height: 100vh;
  background: linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%);
  padding: 60px 20px 20px;
  overflow-y: auto;
}

.register-card {
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 28px;
}

.register-header {
  text-align: center;
  margin-bottom: 24px;
}

.register-header h2 {
  margin: 0;
  color: #111827;
  font-size: 22px;
  font-weight: 600;
}

.register-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.1);
}

.register-button {
  width: 100%;
  background-color: #1E3A8A;
  border-color: #1E3A8A;
  border-radius: 6px;
}

.register-button:hover {
  background-color: #1E3A8A;
  opacity: 0.92;
}

.login-link {
  text-align: center;
  margin-top: 16px;
  font-size: 13px;
  color: #6B7280;
}

.login-link a {
  color: #1E3A8A;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  color: #1E40AF;
}

@media (max-width: 768px) {
  .register-card {
    width: 90%;
    padding: 20px;
  }

  .register-header h2 {
    font-size: 20px;
  }
}
</style>
