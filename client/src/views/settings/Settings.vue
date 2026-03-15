<script setup lang="ts">
import { ElCard, ElIcon } from 'element-plus';
import 'element-plus/dist/index.css';
import { ArrowLeft } from '@element-plus/icons-vue';
import { useSettings } from '@/composables/user/useSettings';
import AvatarUpload from '@/components/user/AvatarUpload.vue';
import ProfileForm from '@/components/user/ProfileForm.vue';

/**
 * 设置页面
 * 用于编辑用户资料
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
      <AvatarUpload
        :avatar="userAvatar"
        :username="currentUsername"
        @upload="handleAvatarUpload"
      />

      <!-- 表单部分 -->
      <ProfileForm
        v-model="form"
        :rules="formRules"
        :loading="loading"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
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

@media (max-width: 768px) {
  .settings-container {
    padding: 10px;
  }

  .settings-card {
    padding: 20px;
  }
}
</style>
