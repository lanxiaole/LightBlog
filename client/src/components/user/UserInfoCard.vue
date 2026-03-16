<script setup lang="ts">
import { ElCard, ElAvatar, ElSpace, ElButton } from 'element-plus';
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
  /** 关注数 */
  followersCount?: number;
  /** 关注数 */
  followingCount?: number;
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
  followingCount: 0
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

<template>
  <ElCard class="user-card">
    <div class="user-info">
      <ElAvatar :size="'large'" :src="user?.avatar || ''" class="user-avatar">
        {{ user?.username?.charAt(0)?.toUpperCase() || 'U' }}
      </ElAvatar>
      <div class="user-details">
        <h2 class="username">{{ user?.username }}</h2>
        <p class="bio" v-if="user?.bio">{{ user?.bio }}</p>
        <p class="bio" v-else>该用户还没有填写个人简介</p>
        <ElSpace class="user-stats">
          <span>关注 {{ followingCount }}</span>
          <span>粉丝 {{ followersCount }}</span>
          <ElButton v-if="isCurrentUser" type="primary" @click="handleEdit" style="margin-left: 20px;">
            编辑资料
          </ElButton>
          <ElButton
            v-else-if="targetUserId !== null"
            :type="isFollowing ? 'default' : 'primary'"
            @click="handleFollow"
            :loading="followLoading"
            style="margin-left: 20px;"
          >
            {{ isFollowing ? '取消关注' : '关注' }}
          </ElButton>
        </ElSpace>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.user-card {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.user-avatar {
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: #303133;
}

.bio {
  font-size: 14px;
  color: #606266;
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.user-stats {
  margin-bottom: 10px;
}

.user-stats span {
  color: #606266;
  font-size: 14px;
}

@media (max-width: 768px) {
  .user-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-details {
    width: 100%;
  }
}
</style>
