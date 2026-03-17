import { defineStore } from 'pinia';
import { getUnreadCount } from '@/api/notification';

// 定义通知 store
export const useNotificationStore = defineStore('notification', {
  state: () => ({
    // 未读消息数
    unreadCount: 0
  }),

  getters: {
    /**
     * 获取未读消息数
     */
    getUnreadCount: (state) => state.unreadCount
  },

  actions: {
    /**
     * 设置未读消息数
     * @param count 未读消息数
     */
    setUnreadCount(count: number) {
      this.unreadCount = count;
    },

    /**
     * 减少未读消息数
     * @param count 减少的数量，默认为 1
     */
    decreaseUnreadCount(count: number = 1) {
      this.unreadCount = Math.max(0, this.unreadCount - count);
    },

    /**
     * 重置未读消息数为 0
     */
    resetUnreadCount() {
      this.unreadCount = 0;
    },

    /**
     * 从服务器获取未读消息数
     */
    async fetchUnreadCount() {
      try {
        const response = await getUnreadCount();
        this.setUnreadCount(response.count);
        return response.count;
      } catch (error) {
        console.error('获取未读消息数失败:', error);
        return 0;
      }
    }
  }
});
