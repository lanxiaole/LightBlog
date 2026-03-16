<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElCard, ElAvatar, ElPagination, ElSkeleton, ElEmpty, ElAlert } from 'element-plus';
import { getFollowers } from '@/api/follow';
import { useUserIdFromUsername } from '@/composables/user/useUserIdFromUsername';
import type { User } from '@/api/user';

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
    // 使用获取到的用户 ID 调用 getFollowers API
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

<template>
  <div class="followers-page">
    <h1 class="page-title">粉丝列表</h1>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton animated>
        <el-skeleton-item variant="p" style="margin-bottom: 20px;"></el-skeleton-item>
        <el-skeleton-item variant="p" style="margin-bottom: 20px;"></el-skeleton-item>
        <el-skeleton-item variant="p" style="margin-bottom: 20px;"></el-skeleton-item>
      </el-skeleton>
    </div>

    <!-- 错误状态 -->
    <el-alert
      v-else-if="error"
      type="error"
      :title="error"
      show-icon
      class="error-alert"
    />

    <!-- 空状态 -->
    <el-empty
      v-else-if="list.length === 0 && !loading"
      description="暂无粉丝"
      class="empty-state"
    />

    <!-- 粉丝列表 -->
    <div v-else class="followers-list">
      <el-card
        v-for="user in list"
        :key="user.id"
        class="follower-card"
      >
        <div class="follower-info" @click="goToUserProfile(user.username)">
          <el-avatar :src="user.avatar || undefined" size="default">
            {{ user.username.charAt(0) }}
          </el-avatar>
          <div class="follower-details">
            <h3 class="follower-name">{{ user.username }}</h3>
            <p v-if="user.bio" class="follower-bio">{{ user.bio }}</p>
          </div>
        </div>
      </el-card>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
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

<style scoped>
.followers-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
  color: #303133;
}

.loading-container {
  margin: 40px 0;
}

.error-alert {
  margin: 40px 0;
}

.empty-state {
  margin: 60px 0;
}

.followers-list {
  margin-bottom: 40px;
}

.follower-card {
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.follower-card:hover {
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
}

.follower-info {
  display: flex;
  align-items: flex-start;
}

.follower-details {
  margin-left: 16px;
  flex: 1;
}

.follower-name {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: #303133;
}

.follower-bio {
  font-size: 14px;
  color: #606266;
  margin: 0;
  line-height: 1.4;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .followers-page {
    padding: 10px;
  }

  .page-title {
    font-size: 20px;
  }

  .follower-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .follower-details {
    margin-left: 0;
    margin-top: 12px;
  }
}
</style>
