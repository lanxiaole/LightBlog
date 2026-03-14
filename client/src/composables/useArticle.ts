/**
 * 文章管理组合式函数
 * 处理文章的获取、删除、权限检查等逻辑
 */
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { getArticleDetail, deleteArticle } from '@/api/article';
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

  /**
   * 判断当前用户是否为文章作者
   */
  const isAuthor = computed(() => {
    return Boolean(article.value && userStore.userInfo && article.value.author_id === userStore.userInfo.id);
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
      article.value = await getArticleDetail(id);
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

  return {
    article,        // 文章数据
    loading,        // 加载状态
    error,          // 错误信息
    deleting,       // 删除状态
    isAuthor,       // 是否为作者
    fetchArticleDetail,  // 获取文章详情
    handleDelete         // 删除文章
  };
}
