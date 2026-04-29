<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>登录</h2>
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="login-form"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="请输入邮箱"
            prefix-icon="el-icon-message"
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
        <el-form-item>
          <el-checkbox v-model="form.rememberMe">记住密码</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
            :disabled="loading"
          >
            登录
          </el-button>
        </el-form-item>
        <div class="register-link">
          还没有账号？<router-link to="/register">前往注册</router-link>
        </div>
        <div class="admin-link">
          <router-link to="/admin-login">管理员登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const formRef = ref();
const loading = ref(false);
const router = useRouter();
const userStore = useUserStore();

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
});

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
};

const handleLogin = async () => {
  if (!formRef.value) return;

  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true;
        await userStore.login({
          email: form.email,
          password: form.password,
          rememberMe: form.rememberMe
        });
        ElMessage.success('登录成功');
        router.push('/');
      } catch (error: any) {
        ElMessage.error(error.message || '登录失败');
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  max-height: 100vh;
  background: linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 100%);
  padding: 60px 20px 20px;
  overflow-y: auto;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 28px;
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.login-header h2 {
  margin: 0;
  color: #111827;
  font-size: 22px;
  font-weight: 600;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.1);
}

.login-form :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #F97316;
  border-color: #F97316;
}

.login-button {
  width: 100%;
  background-color: #1E3A8A;
  border-color: #1E3A8A;
  border-radius: 6px;
}

.login-button:hover {
  background-color: #1E3A8A;
  opacity: 0.92;
}

.register-link {
  text-align: center;
  margin-top: 16px;
  font-size: 13px;
  color: #6B7280;
}

.register-link a {
  color: #1E3A8A;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  color: #1E40AF;
}

.admin-link {
  text-align: center;
  margin-top: 10px;
  font-size: 12px;
  color: #9CA3AF;
}

.admin-link a {
  color: #9CA3AF;
  text-decoration: none;
}

.admin-link a:hover {
  color: #1E3A8A;
}

@media (max-width: 768px) {
  .login-card {
    width: 90%;
    padding: 20px;
  }

  .login-header h2 {
    font-size: 20px;
  }
}
</style>
