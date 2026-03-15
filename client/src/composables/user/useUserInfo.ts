/**
 * 用户信息组合式函数
 * 处理用户信息的获取和状态管理
 */
import { ref } from 'vue';
import { getUserProfile } from '@/api/user';
import type { User } from '@/api/user';

/**
 * 用户信息组合式函数
 * @param username 用户名
 * @returns 用户信息相关的状态和方法
 */
export function useUserInfo(username: string) {
  /** 用户信息 */
  const user = ref<User | null>(null);

  /** 加载状态 */
  const loading = ref<boolean>(false);

  /** 错误信息 */
  const error = ref<string | null>(null);

  /** 用户不存在 */
  const notFound = ref<boolean>(false);

  /**
   * 获取用户信息
   */
  const fetchUserInfo = async () => {
    try {
      loading.value = true;
      error.value = null;
      notFound.value = false;

      const userData = await getUserProfile(username);
      user.value = userData;
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
  fetchUserInfo();

  return {
    user,
    loading,
    error,
    notFound,
    fetchUserInfo
  };
}