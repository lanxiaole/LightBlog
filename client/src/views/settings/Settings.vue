<template>
  <div class="settings-container">
    <h1 class="page-title">
      <el-icon style="margin-right: 10px; cursor: pointer;" @click="handleCancel">
        <ArrowLeft />
      </el-icon>
      编辑资料
    </h1>

    <div class="settings-card">
      <!-- 头像部分 -->
      <div class="avatar-section">
        <AvatarUpload
          :avatar="userAvatar"
          :username="currentUsername"
          @upload="handleAvatarUpload"
        />
      </div>

      <!-- 表单部分 -->
      <ProfileForm
        v-model="form"
        :rules="formRules"
        :loading="loading"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>

    <!-- 修改密码部分 -->
    <div class="settings-card password-card">
      <PasswordForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElIcon } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { useSettings } from '@/composables/user/useSettings';
import AvatarUpload from '@/components/user/AvatarUpload.vue';
import ProfileForm from '@/components/user/ProfileForm.vue';
import PasswordForm from '@/components/user/PasswordForm.vue';

/**
 * 设置页面
 * 用于编辑用户资料和修改密码
 */

const {
  form,
  loading,
  formRules,
  userAvatar,
  currentUsername,
  handleSubmit,
  handleCancel,
  handleAvatarUpload
} = useSettings();
</script>

<style scoped>
.settings-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  color: #111827;
}

.settings-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
}

.avatar-section {
  padding-bottom: 24px;
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 24px;
}

.password-card {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
}

@media (max-width: 767px) {
  .settings-container {
    padding: 16px;
  }

  .settings-card {
    padding: 16px;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .settings-container {
    max-width: 700px;
  }
}
</style>