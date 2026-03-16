import { ref, computed, watch, type Ref } from 'vue';
import { getUserProfile } from '@/api/user';

/**
 * 根据用户名获取用户 ID 的组合式函数
 * @param username 用户名（可以是 string 或 ref）
 * @returns 用户 ID、加载状态和错误信息
 */
export function useUserIdFromUsername(username: string | Ref<string>) {
  // 响应式状态
  const userId = ref<number | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // 计算属性，处理 username 可能是 ref 的情况
  const currentUsername = computed(() => {
    return typeof username === 'object' ? username.value : username;
  });

  /**
   * 根据用户名获取用户 ID
   */
  const fetchUserId = async (name: string) => {
    if (!name) {
      userId.value = null;
      error.value = null;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const userProfile = await getUserProfile(name);
      userId.value = userProfile.id;
      error.value = null;
    } catch (err) {
      // 检查是否是 404 错误（用户不存在）
      if (err instanceof Error && err.message.includes('404')) {
        userId.value = null;
        error.value = '用户不存在';
      } else {
        userId.value = null;
        error.value = '获取用户信息失败';
      }
      console.error('获取用户 ID 失败:', err);
    } finally {
      loading.value = false;
    }
  };

  // 监听用户名变化，自动获取用户 ID
  watch(currentUsername, (newUsername) => {
    if (newUsername) {
      fetchUserId(newUsername);
    } else {
      userId.value = null;
      error.value = null;
    }
  }, { immediate: true });

  return {
    userId,
    loading,
    error
  };
}
