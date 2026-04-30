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
@import './Settings.scss';
</style>