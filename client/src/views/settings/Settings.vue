<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { updateUserProfile } from '@/api/user';
import { useRouter } from 'vue-router';
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElAvatar , ElIcon } from 'element-plus';
import 'element-plus/dist/index.css';
import { Upload, ArrowLeft } from '@element-plus/icons-vue';

// 获取用户 store
const userStore = useUserStore();
// 获取路由实例
const router = useRouter();

// 响应式数据
const form = ref({
  username: '',
  bio: ''
});
const loading = ref(false);
const formRef = ref();
const formRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20位', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ]
});

// 计算属性：当前用户头像
const userAvatar = computed(() => userStore.userInfo?.avatar || '');

// 方法：初始化表单数据
const initForm = () => {
  if (userStore.userInfo) {
    form.value = {
      username: userStore.userInfo.username,
      bio: userStore.userInfo.bio || ''
    };
  }
};

// 方法：提交表单
const handleSubmit = async (formEl: any) => {
  if (!formEl) return;

  await formEl.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        // 调用 API 更新用户资料
        await updateUserProfile({
          username: form.value.username,
          bio: form.value.bio
        });

        // 更新 userStore 中的用户信息
        if (userStore.userInfo) {
          userStore.setUserInfo({
            ...userStore.userInfo,
            username: form.value.username,
            bio: form.value.bio
          });
        }

        // 显示成功消息
        ElMessage.success('更新成功');

        // 跳转到个人主页
        router.push(`/user/${form.value.username}`);
      } catch (error: any) {
        // 显示错误消息
        ElMessage.error(error.message || '更新失败');
      } finally {
        loading.value = false;
      }
    } else {
      return false;
    }
  });
};

// 方法：取消编辑
const handleCancel = () => {
  // 跳转到个人主页
  router.push(`/user/${userStore.userInfo?.username || ''}`);
};

// 方法：处理头像上传（暂不实现具体上传功能）
const handleAvatarUpload = () => {
  ElMessage.info('头像上传功能暂未实现');
};

// 生命周期钩子：组件挂载时
onMounted(() => {
  // 初始化表单数据
  initForm();
});
</script>

<template>
  <div class="settings-container">
    <h1 class="page-title">
      <el-icon style="margin-right: 10px; cursor: pointer;" @click="handleCancel">
        <ArrowLeft />
      </el-icon>
      编辑资料
    </h1>

    <el-card class="settings-card">
      <!-- 头像部分 -->
      <div class="avatar-section">
        <el-avatar :size="100" :src="userAvatar" class="user-avatar">
          {{ userStore.userInfo?.username.charAt(0).toUpperCase() }}
        </el-avatar>
        <el-button type="primary" plain @click="handleAvatarUpload" style="margin-top: 15px;">
          <el-icon><Upload /></el-icon>
          上传头像
        </el-button>
      </div>

      <!-- 表单部分 -->
      <el-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-width="80px"
        class="settings-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="个人简介">
          <el-input
            v-model="form.bio"
            type="textarea"
            placeholder="请输入个人简介"
            :rows="4"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit(formRef)" :loading="loading">
            保存
          </el-button>
          <el-button @click="handleCancel" style="margin-left: 10px;">
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.settings-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  color: #303133;
}

.settings-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.user-avatar {
  border: 2px solid #f0f0f0;
}

.settings-form {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .settings-container {
    padding: 10px;
  }

  .settings-card {
    padding: 20px;
  }
}
</style>
