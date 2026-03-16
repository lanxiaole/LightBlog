import { ref, computed, watch, type Ref } from 'vue';
import { followUser, unfollowUser, getFollowStatus } from '@/api/follow';

/**
 * 关注组合式函数
 * @param targetUserId 目标用户 ID（可以是 number | null 或 ref）
 */
export function useFollow(targetUserId: number | null | Ref<number | null>) {
  // 响应式状态
  const isFollowing = ref<boolean>(false);
  const followersCount = ref<number>(0);
  const followingCount = ref<number>(0);
  const loading = ref<boolean>(false);

  // 计算属性，处理 targetUserId 可能是 ref 的情况
  const currentTargetUserId = computed(() => {
    return targetUserId !== null && typeof targetUserId === 'object' ? targetUserId.value : targetUserId;
  });

  /**
   * 检查关注状态
   */
  const checkStatus = async () => {
    const userId = currentTargetUserId.value;
    if (userId === null) return;

    try {
      const status = await getFollowStatus(userId);
      // 注意：API 响应返回的是 isFollowing，不是 isFollowed
      isFollowing.value = status.isFollowing;
    } catch (error) {
      console.error('检查关注状态失败:', error);
    }
  };

  /**
   * 切换关注状态
   */
  const toggleFollow = async () => {
    const userId = currentTargetUserId.value;
    if (loading.value || userId === null) return;

    loading.value = true;
    try {
      if (isFollowing.value) {
        // 取消关注
        const result = await unfollowUser(userId);
        if (result.followersCount !== undefined) {
          followersCount.value = result.followersCount;
        }
        if (result.followingCount !== undefined) {
          followingCount.value = result.followingCount;
        }
        isFollowing.value = false;
      } else {
        // 关注
        const result = await followUser(userId);
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
  watch(currentTargetUserId, (newUserId) => {
    if (newUserId !== null) {
      checkStatus();
    }
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
