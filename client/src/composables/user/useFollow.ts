import { ref, computed, watch, type Ref } from 'vue';
import { followUser, unfollowUser, getFollowStatus } from '@/api/follow';

/**
 * 关注组合式函数
 * @param targetUserId 目标用户 ID（可以是 number 或 ref）
 */
export function useFollow(targetUserId: number | Ref<number>) {
  // 响应式状态
  const isFollowing = ref<boolean>(false);
  const followersCount = ref<number>(0);
  const followingCount = ref<number>(0);
  const loading = ref<boolean>(false);

  // 计算属性，处理 targetUserId 可能是 ref 的情况
  const currentTargetUserId = computed(() => {
    return typeof targetUserId === 'object' ? targetUserId.value : targetUserId;
  });

  /**
   * 检查关注状态
   */
  const checkStatus = async () => {
    try {
      const status = await getFollowStatus(currentTargetUserId.value);
      isFollowing.value = status.isFollowed;
    } catch (error) {
      console.error('检查关注状态失败:', error);
    }
  };

  /**
   * 切换关注状态
   */
  const toggleFollow = async () => {
    if (loading.value) return;

    loading.value = true;
    try {
      if (isFollowing.value) {
        // 取消关注
        const result = await unfollowUser(currentTargetUserId.value);
        if (result.followersCount !== undefined) {
          followersCount.value = result.followersCount;
        }
        if (result.followingCount !== undefined) {
          followingCount.value = result.followingCount;
        }
        isFollowing.value = false;
      } else {
        // 关注
        const result = await followUser(currentTargetUserId.value);
        if (result.followersCount !== undefined) {
          followersCount.value = result.followersCount;
        }
        if (result.followingCount !== undefined) {
          followingCount.value = result.followingCount;
        }
        isFollowing.value = true;
      }
    } catch (error) {
      console.error('切换关注状态失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 监听目标用户 ID 变化，重新检查状态
  watch(currentTargetUserId, () => {
    checkStatus();
  }, { immediate: true });

  return {
    isFollowing,
    followersCount,
    followingCount,
    loading,
    toggleFollow,
    checkStatus
  };
}
