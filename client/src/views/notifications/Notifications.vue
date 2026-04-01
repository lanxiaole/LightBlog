<template>
  <div class="notifications-container">
    <h1 class="page-title">消息中心</h1>

    <!-- 全部已读按钮 -->
    <div class="actions-bar">
      <ElButton
        type="primary"
        @click="handleMarkAllAsRead"
        :loading="loading"
      >
        全部已读
      </ElButton>
    </div>

    <!-- 加载状态 -->
    <LoadingState v-if="loading" />

    <!-- 错误状态 -->
    <ErrorState v-else-if="error" :message="error" @retry="fetchNotifications" />

    <!-- 通知列表 -->
    <div v-else class="notifications-list">
      <!-- 空状态 -->
      <EmptyState v-if="list.length === 0" text="暂无通知" />

      <!-- 通知卡片列表 -->
      <ElCard
        v-for="notification in list"
        :key="notification.id"
        class="notification-card"
        :class="{ 'unread': !notification.is_read }"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-content">
          <!-- 发送者头像 -->
          <div class="sender-info" @click.stop="handleSenderClick(notification)">
            <ElAvatar :src="notification.sender?.avatar || ''" :alt="notification.sender?.username">
              {{ notification.sender?.username?.charAt(0) || 'U' }}
            </ElAvatar>
          </div>

          <!-- 通知内容 -->
          <div class="notification-body">
            <p class="notification-text">{{ getNotificationText(notification) }}</p>
            <div class="notification-meta">
              <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
              <ElTag v-if="!notification.is_read" size="small" type="danger" effect="plain">未读</ElTag>
            </div>
          </div>
        </div>
      </ElCard>

      <!-- 分页组件 -->
      <div v-if="total > 0" class="pagination-container">
        <ElPagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  ElCard,
  ElAvatar,
  ElButton,
  ElPagination,
  ElTag
} from 'element-plus';
import 'element-plus/dist/index.css';
import { getNotifications, markAsRead, markAllAsRead, type Notification } from '@/api/notification';
import { useNotificationStore } from '@/stores/notification';
import LoadingState from '@/components/common/LoadingState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import EmptyState from '@/components/common/EmptyState.vue';

/**
 * 消息中心页面
 * 展示用户的通知列表
 */

const router = useRouter();
const notificationStore = useNotificationStore();

// 响应式状态
const list = ref<Notification[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const error = ref<string | null>(null);

/**
 * 获取通知列表
 */
async function fetchNotifications() {
  loading.value = true;
  error.value = null;

  try {
    const response = await getNotifications({
      page: page.value,
      pageSize: pageSize.value
    });
    list.value = response.list;
    total.value = response.total;
    page.value = response.page;
    pageSize.value = response.pageSize;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取通知失败';
  } finally {
    loading.value = false;
  }
}

/**
 * 处理分页变化
 */
function handlePageChange(newPage: number) {
  page.value = newPage;
  fetchNotifications();
}

/**
 * 处理每页大小变化
 */
function handlePageSizeChange(newPageSize: number) {
  pageSize.value = newPageSize;
  page.value = 1;
  fetchNotifications();
}

/**
 * 标记通知为已读
 */
async function handleMarkAsRead(notification: Notification) {
  try {
    await markAsRead(notification.id);
    // 更新本地状态
    const index = list.value.findIndex(item => item.id === notification.id);
    if (index !== -1 && list.value[index]) {
      list.value[index].is_read = true;
      // 如果是未读通知，减少未读消息数
      notificationStore.decreaseUnreadCount();
    }
  } catch (err) {
    console.error('标记已读失败:', err);
  }
}

/**
 * 标记所有通知为已读
 */
async function handleMarkAllAsRead() {
  try {
    await markAllAsRead();
    // 重置未读消息数
    notificationStore.resetUnreadCount();
    // 重新获取列表
    fetchNotifications();
  } catch (err) {
    console.error('标记全部已读失败:', err);
  }
}

/**
 * 处理通知点击
 */
function handleNotificationClick(notification: Notification) {
  // 标记为已读
  if (!notification.is_read) {
    handleMarkAsRead(notification);
  }

  // 跳转到相应内容
  if (notification.article_id) {
    router.push(`/article/${notification.article_id}`);
  } else if (notification.sender) {
    // 对于关注类型的通知，跳转到发送者的个人主页
    router.push(`/user/${notification.sender.username}`);
  }
}

/**
 * 处理发送者头像点击
 */
function handleSenderClick(notification: Notification) {
  if (notification.sender) {
    router.push(`/user/${notification.sender.username}`);
  }
}

/**
 * 格式化时间
 */
function formatTime(time: string) {
  return new Date(time).toLocaleString();
}

/**
 * 获取通知文本
 */
function getNotificationText(notification: Notification) {
  const senderName = notification.sender?.username || '用户';

  switch (notification.type) {
    case 'like':
      return `${senderName} 点赞了你的文章《${notification.article_title || '文章'}》`;
    case 'comment':
      return `${senderName} 评论了你的文章《${notification.article_title || '文章'}》`;
    case 'reply':
      return `${senderName} 回复了你的评论`;
    case 'favorite':
      return `${senderName} 收藏了你的文章《${notification.article_title || '文章'}》`;
    case 'follow':
      return `${senderName} 关注了你`;
    default:
      return `${senderName} 与你互动`;
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchNotifications();
});
</script>

<style scoped>
.notifications-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.actions-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.notifications-list {
  margin-top: 20px;
}

.notification-card {
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.notification-card.unread {
  border-left: 4px solid #409EFF;
  background-color: #f9f9f9;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.sender-info {
  cursor: pointer;
}

.notification-body {
  flex: 1;
}

.notification-text {
  margin: 0 0 8px 0;
  color: #303133;
  line-height: 1.5;
}

.notification-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.notification-time {
  flex: 1;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style>
