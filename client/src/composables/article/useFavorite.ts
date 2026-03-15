/**
 * 文章收藏组合式函数
 * 处理文章的收藏/取消收藏逻辑
 */
import { ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { favoriteArticle, unfavoriteArticle } from '@/api/favorite';
import { useUserStore } from '@/stores/user';

/**
 * 文章收藏组合式函数
 * @param articleId 文章ID（ref或number）
 * @returns 收藏相关的状态和方法
 */
export function useFavorite(articleId: number | Ref<number>) {
  const router = useRouter();
  const userStore = useUserStore();

  // 收藏状态
  const favorited = ref(false);
  // 收藏数量
  const favoritesCount = ref(0);
  // 收藏操作加载状态
  const favoriting = ref(false);

  /**
   * 处理收藏/取消收藏
   */
  const toggleFavorite = async () => {
    // 检查是否已登录
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录');
      router.push('/login');
      return;
    }

    // 防止重复点击
    if (favoriting.value) return;

    try {
      favoriting.value = true;

      const id = typeof articleId === 'number' ? articleId : articleId.value;

      if (favorited.value) {
        // 取消收藏
        const result = await unfavoriteArticle(id);
        favorited.value = false;
        favoritesCount.value = result.favoritesCount;
        ElMessage.success('取消收藏');
      } else {
        // 收藏
        const result = await favoriteArticle(id);
        favorited.value = true;
        favoritesCount.value = result.favoritesCount;
        ElMessage.success('收藏成功');
      }
    } catch (err: any) {
      ElMessage.error(err.message || '操作失败');
    } finally {
      favoriting.value = false;
    }
  };

  return {
    favorited,        // 是否已收藏
    favoritesCount,   // 收藏数量
    favoriting,       // 收藏操作加载状态
    toggleFavorite    // 处理收藏/取消收藏
  };
}
