<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElTabs, ElTabPane, ElCard, ElEmpty } from 'element-plus';

import { useUserStore } from '@/stores/user';
import type { User } from '@/api/user';
import UserInfoCard from '@/components/user/UserInfoCard.vue';
import LoadingState from '@/components/common/LoadingState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import { useFollow } from '@/composables/user/useFollow';

// 获取路由参数
const route = useRoute();
const router = useRouter();
const username = computed(() => route.params.username as string);

// 响应式状态
const user = ref<User | null>(null);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
const notFound = ref<boolean>(false);

// 计算目标用户 ID
const targetUserId = computed(() => user.value?.id || null);

// 使用关注组合式函数
const { isFollowing, followersCount, followingCount, toggleFollow, loading: followLoading } = useFollow(targetUserId);

// 监听用户信息变化，更新关注数和粉丝数
watch(user, (newUser) => {
  if (newUser) {
    if (newUser.followersCount !== undefined) {
      followersCount.value = newUser.followersCount;
    }
    if (newUser.followingCount !== undefined) {
      followingCount.value = newUser.followingCount;
    }
  }
}, { immediate: true });

// 获取用户信息
const fetchUserInfo = async (currentUsername) => {
  try {
    loading.value = true;
    error.value = null;
    notFound.value = false;

    const response = await import('@/api/user').then(module => module.getUserProfile(currentUsername));
    user.value = response;
  } catch (err: any) {
    if (err.response?.status === 404) {
      notFound.value = true;
      error.value = '用户不存在';
    } else {
      error.value = err.message || '获取用户信息失败';
    }
  } finally {
    loading.value = false;
  }
};

// 初始化时获取用户信息
fetchUserInfo(username.value);

// 监听用户名变化，重新获取用户信息
watch(username, (newUsername) => {
  fetchUserInfo(newUsername);
});

// 获取用户 store
const userStore = useUserStore();

// 计算是否是当前登录用户
const isCurrentUser = computed(() => {
  return userStore.isLoggedIn && userStore.userInfo?.username === username.value;
});

// 标签页配置
const tabs = [
  { name: `user/${username.value}`, label: '文章' },
  { name: `user/${username.value}/favorites`, label: '收藏' },
  { name: `user/${username.value}/followers`, label: '关注者' },
  { name: `user/${username.value}/following`, label: '关注中' },
  { name: `user/${username.value}/about`, label: '关于' }
];

// 处理标签页点击
const handleTabClick = (tab: any) => {
  const path = `/${tab.props.name}`;
  router.push(path);
};

// 处理编辑资料按钮点击
const handleEdit = () => {
  router.push('/settings');
};

// 获取当前激活的标签页
const activeTab = computed(() => {
  return route.path.replace('/', '');
});
</script>

<template>
  <div class="user-layout">
    <!-- 加载状态 -->
    <LoadingState v-if="loading" />

    <!-- 错误状态 -->
    <ErrorState v-else-if="error && !notFound" :message="error" />

    <!-- 用户不存在状态 -->
    <div v-else-if="notFound" class="not-found">
      <ElEmpty description="用户不存在" />
    </div>

    <!-- 用户信息和标签页 -->
    <div v-else class="user-content">
      <!-- 用户信息卡片 -->
      <UserInfoCard
        :user="user"
        :is-current-user="isCurrentUser"
        :followers-count="followersCount"
        :following-count="followingCount"
        :target-user-id="targetUserId"
        :is-following="isFollowing"
        :follow-loading="followLoading"
        @edit="handleEdit"
        @follow="toggleFollow"
      />

      <!-- 标签页导航 -->
      <ElCard class="tabs-card">
        <ElTabs v-model="activeTab" @tab-click="handleTabClick">
          <ElTabPane
            v-for="tab in tabs"
            :key="tab.name"
            :label="tab.label"
            :name="tab.name"
          >
          </ElTabPane>
        </ElTabs>
      </ElCard>

      <!-- 内容区域 -->
      <div class="content-area">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-layout {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.user-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tabs-card {
  margin-bottom: 20px;
}

.content-area {
  min-height: 400px;
}

.not-found {
  text-align: center;
  padding: 60px 0;
}

@media (max-width: 768px) {
  .user-layout {
    padding: 10px;
  }
}
</style>
