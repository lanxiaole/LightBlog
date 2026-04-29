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
      <!-- 左侧固定区域 -->
      <aside class="sidebar">
        <UserInfoCard
          :user="user"
          :is-current-user="isCurrentUser"
          :followers-count="followersCount"
          :following-count="followingCount"
          :article-count="articleCount"
          :target-user-id="targetUserId"
          :is-following="isFollowing"
          :follow-loading="followLoading"
          @edit="handleEdit"
          @follow="toggleFollow"
        />
      </aside>

      <!-- 右侧内容区域 -->
      <main class="main-content">
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
      </main>
    </div>
  </div>
</template>

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
import { getUserArticles } from '@/api/user';

// 获取路由参数
const route = useRoute();
const router = useRouter();
const username = computed(() => route.params.username as string);

// 响应式状态
const user = ref<User | null>(null);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
const notFound = ref<boolean>(false);
const articleCount = ref<number>(0);

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
const fetchUserInfo = async (currentUsername: string) => {
  try {
    loading.value = true;
    error.value = null;
    notFound.value = false;

    const response = await import('@/api/user').then(module => module.getUserProfile(currentUsername));
    user.value = response;

    // 获取文章数
    const articlesResponse = await getUserArticles(currentUsername, { page: 1, pageSize: 1 });
    articleCount.value = articlesResponse.total;
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
  { name: `user/${username.value}/following`, label: '关注中' }
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

<style scoped>
.user-layout {
  min-height: 100vh;
  background-color: #F9FAFB;
}

.user-content {
  display: flex;
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
}

.sidebar {
  position: sticky;
  top: 32px;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.tabs-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.content-area {
  min-height: 400px;
}

.not-found {
  text-align: center;
  padding: 60px 0;
}

@media (max-width: 767px) {
  .user-content {
    flex-direction: column;
    padding: 16px;
  }

  .sidebar {
    position: static;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .user-content {
    padding: 24px 16px;
    gap: 24px;
  }
}
</style>
