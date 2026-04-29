<template>
  <div class="followers-page">
    <!-- 加载状态 -->
    <LoadingState v-if="loading" />

    <!-- 错误状态 -->
    <ErrorState v-else-if="error" :message="error" />

    <!-- 空状态 -->
    <div v-else-if="list.length === 0 && !loading" class="empty-state">
      <ElEmpty description="暂无粉丝" />
    </div>

    <!-- 粉丝列表 -->
    <div v-else class="followers-list">
      <div
        v-for="user in list"
        :key="user.id"
        class="user-card"
        @click="goToUserProfile(user.username)"
      >
        <div class="avatar-wrapper">
          <ElAvatar :size="80" :src="user.avatar || undefined" class="avatar">
            {{ user.username.charAt(0).toUpperCase() }}
          </ElAvatar>
        </div>
        <div class="user-info">
          <h3 class="username">{{ user.username }}</h3>
          <p v-if="user.bio" class="bio">{{ user.bio }}</p>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <ElPagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="(size) => { pageSize = size; fetchFollowers(); }"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElAvatar, ElPagination, ElEmpty } from 'element-plus';
import { getFollowers } from '@/api/follow';
import { useUserIdFromUsername } from '@/composables/user/useUserIdFromUsername';
import type { User } from '@/api/user';
import LoadingState from '@/components/common/LoadingState.vue';
import ErrorState from '@/components/common/ErrorState.vue';

const route = useRoute();
const router = useRouter();

// 从路由获取用户名
const username = computed(() => route.params.username as string);

// 使用组合式函数获取用户 ID
const { userId: targetUserId } = useUserIdFromUsername(username);

// 响应式状态
const list = ref<User[]>([]);
const total = ref<number>(0);
const page = ref<number>(1);
const pageSize = ref<number>(10);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

/**
 * 获取粉丝列表
 */
const fetchFollowers = async () => {
  if (!targetUserId.value) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await getFollowers(
      targetUserId.value,
      {
        page: page.value,
        pageSize: pageSize.value
      }
    );
    list.value = response.list;
    total.value = response.total;
  } catch (err) {
    error.value = '获取粉丝列表失败';
    console.error('获取粉丝列表失败:', err);
  } finally {
    loading.value = false;
  }
};

/**
 * 处理分页变化
 */
const handlePageChange = (newPage: number) => {
  page.value = newPage;
  fetchFollowers();
};

/**
 * 跳转到用户个人主页
 */
const goToUserProfile = (username: string) => {
  router.push(`/user/${username}`);
};

// 监听用户 ID 变化，当获取到用户 ID 时获取粉丝列表
watch(targetUserId, (newUserId) => {
  if (newUserId) {
    fetchFollowers();
  }
}, { immediate: true });
</script>

<style scoped>
.followers-page {
  padding: 0;
}

.empty-state {
  padding: 60px 0;
}

.followers-list {
  margin-bottom: 40px;
}

.user-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 16px 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s linear;
}

.user-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.avatar-wrapper {
  flex-shrink: 0;
  margin-right: 16px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #1E3A8A;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.username {
  font-size: 18px;
  font-weight: bold;
  color: #111827;
  margin: 0 0 8px 0;
}

.bio {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

@media (max-width: 767px) {
  .user-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
  }

  .avatar-wrapper {
    margin-right: 0;
    margin-bottom: 12px;
  }

  .username {
    font-size: 16px;
  }
}
</style>
