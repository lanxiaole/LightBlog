<template>
  <div class="user-info-card">
    <!-- 头像区域 -->
    <div class="avatar-area">
      <ElAvatar :size="120" :src="user?.avatar || ''" class="avatar">
        {{ user?.username?.charAt(0)?.toUpperCase() || 'U' }}
      </ElAvatar>
    </div>

    <!-- 昵称 + 简介区域 -->
    <div class="user-basic">
      <h2 class="username">{{ user?.username }}</h2>
      <p class="bio" :class="{ 'bio-empty': !user?.bio }">
        {{ user?.bio || '该用户还没有填写个人简介' }}
      </p>
    </div>

    <!-- 数据统计栏 -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-number">{{ followingCount }}</span>
        <span class="stat-label">关注</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-number">{{ followersCount }}</span>
        <span class="stat-label">粉丝</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-number">{{ articleCount }}</span>
        <span class="stat-label">文章</span>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="actions">
      <ElButton
        v-if="isCurrentUser"
        type="primary"
        class="edit-btn"
        @click="handleEdit"
      >
        编辑资料
      </ElButton>
      <ElButton
        v-else-if="targetUserId !== null"
        :type="isFollowing ? 'default' : 'primary'"
        class="follow-btn"
        @click="handleFollow"
        :loading="followLoading"
      >
        {{ isFollowing ? '取消关注' : '关注' }}
      </ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElAvatar, ElButton } from 'element-plus';
import type { User } from '@/api/user';

/**
 * 用户信息卡片组件
 * 展示用户的基本信息，包括头像、用户名、简介和统计数据
 */

// 组件属性定义
interface Props {
  /** 用户信息 */
  user: User | null;
  /** 是否是当前登录用户 */
  isCurrentUser: boolean;
  /** 粉丝数 */
  followersCount?: number;
  /** 关注数 */
  followingCount?: number;
  /** 文章数 */
  articleCount?: number;
  /** 目标用户 ID，可为 null */
  targetUserId: number | null;
  /** 当前用户是否已关注 */
  isFollowing: boolean;
  /** 关注操作是否正在加载 */
  followLoading: boolean;
}

// 定义组件属性并设置默认值
withDefaults(defineProps<Props>(), {
  followersCount: 0,
  followingCount: 0,
  articleCount: 0
});

// 定义组件事件
const emit = defineEmits<{
  /** 编辑资料按钮点击事件 */
  'edit': [];
  /** 切换关注状态事件 */
  'follow': [];
}>();

/**
 * 处理编辑资料按钮点击
 */
const handleEdit = () => {
  emit('edit');
};

/**
 * 处理关注按钮点击
 */
const handleFollow = () => {
  emit('follow');
};
</script>

<style scoped>
.user-info-card {
  width: 280px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-area {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px solid #1E3A8A;
  transition: transform 0.2s linear;
}

.avatar:hover {
  transform: scale(1.05);
}

.user-basic {
  text-align: center;
  margin-bottom: 20px;
  width: 100%;
}

.username {
  font-size: 20px;
  font-weight: bold;
  color: #111827;
  margin: 0 0 12px 0;
}

.bio {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bio-empty {
  color: #9CA3AF;
}

.stats-bar {
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 0;
  border-top: 1px solid #E5E7EB;
  border-bottom: 1px solid #E5E7EB;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 18px;
  font-weight: bold;
  color: #111827;
}

.stat-label {
  font-size: 14px;
  color: #6B7280;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background-color: #E5E7EB;
}

.actions {
  width: 100%;
}

.edit-btn,
.follow-btn {
  width: 100%;
  border-radius: 6px;
  background-color: #1E3A8A;
  color: #ffffff;
  border: none;
  transition: background-color 0.2s linear;
}

.edit-btn:hover,
.follow-btn:hover {
  background-color: #1E3A8A;
  filter: brightness(0.9);
}

.follow-btn.el-button--default {
  background-color: #ffffff;
  color: #1E3A8A;
  border: 1px solid #1E3A8A;
}

.follow-btn.el-button--default:hover {
  background-color: #F3F4F6;
}

@media (max-width: 767px) {
  .user-info-card {
    width: 100%;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .user-info-card {
    width: 240px;
  }
}
</style>
