/**
 * 文章管理组合式函数
 * 处理文章的获取、删除、权限检查等逻辑
 */
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { getArticleDetail, deleteArticle } from '@/api/article';
import { likeArticle, unlikeArticle } from '@/api/like';
import type { Article } from '@/api/article';
import { useUserStore } from '@/stores/user';

/**
 * 文章管理组合式函数
 * @returns 文章相关的状态和方法
 */
export function useArticle() {
  const router = useRouter();
  const userStore = useUserStore();

  // 文章数据
  const article = ref<Article | null>(null);
  // 加载状态
  const loading = ref(true);
  // 错误信息
  const error = ref('');
  // 删除状态
  const deleting = ref(false);
  // 点赞状态
  const liked = ref(false);
  // 点赞数量
  const likesCount = ref(0);
  // 点赞操作加载状态
  const liking = ref(false);

  /**
   * 判断当前用户是否为文章作者
   */
  const isAuthor = computed(() => {
    return Boolean(article.value && userStore.userInfo && article.value.author_id === userStore.userInfo.id);
  });

  /**
   * 判断当前用户是否已登录
   */
  const isLoggedIn = computed(() => {
    return userStore.isLoggedIn;
  });

  /**
   * 获取文章详情
   * @param id 文章ID
   */
  const fetchArticleDetail = async (id: number) => {
    if (id <= 0) {
      error.value = '无效的文章ID';
      loading.value = false;
      return;
    }

    try {
      loading.value = true;
      error.value = '';
      const data = await getArticleDetail(id);
      article.value = data;
      // 设置点赞状态和数量
      liked.value = data.liked || false;
      likesCount.value = data.likesCount || 0;
    } catch (err: any) {
      error.value = err.message || '获取文章详情失败';
    } finally {
      loading.value = false;
    }
  };

  /**
   * 删除文章
   */
  const handleDelete = async () => {
    if (!article.value) return;

    try {
      await ElMessageBox.confirm(
        '确定要删除这篇文章吗？此操作不可撤销',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );

      deleting.value = true;
      await deleteArticle(article.value.id);
      ElMessage.success('删除成功');
      router.push('/');
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '删除失败');
      }
    } finally {
      deleting.value = false;
    }
  };

  /**
   * 处理点赞/取消点赞
   */
  const handleLike = async () => {
    if (!article.value) return;
    
    // 检查是否已登录
    if (!isLoggedIn.value) {
      ElMessage.warning('请先登录');
      router.push('/login');
      return;
    }

    // 防止重复点击
    if (liking.value) return;

    try {
      liking.value = true;
      
      if (liked.value) {
        // 取消点赞
        const result = await unlikeArticle(article.value.id);
        liked.value = false;
        likesCount.value = result.likesCount;
        ElMessage.success('取消点赞');
      } else {
        // 点赞
        const result = await likeArticle(article.value.id);
        liked.value = true;
        likesCount.value = result.likesCount;
        ElMessage.success('点赞成功');
      }
    } catch (err: any) {
      ElMessage.error(err.message || '操作失败');
    } finally {
      liking.value = false;
    }
  };

  return {
    article,        // 文章数据
    loading,        // 加载状态
    error,          // 错误信息
    deleting,       // 删除状态
    isAuthor,       // 是否为作者
    liked,          // 是否已点赞
    likesCount,     // 点赞数量
    liking,         // 点赞操作加载状态
    isLoggedIn,     // 是否已登录
    fetchArticleDetail,  // 获取文章详情
    handleDelete,        // 删除文章
    handleLike           // 处理点赞
  };
}
