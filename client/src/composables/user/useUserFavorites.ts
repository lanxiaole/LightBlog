/**
 * 用户收藏文章列表组合式函数
 * 处理用户收藏文章列表的状态管理和操作方法
 */
import { ref } from 'vue';
import { getUserFavorites } from '@/api/favorite';
import type { Article } from '@/api/article';

/**
 * 用户收藏文章列表组合式函数
 * @returns 收藏文章相关的状态和方法
 */
export function useUserFavorites() {
  /** 文章列表 */
  const articles = ref<Article[]>([]);

  /** 总数 */
  const total = ref<number>(0);

  /** 当前页码 */
  const page = ref<number>(1);

  /** 每页数量 */
  const pageSize = ref<number>(10);

  /** 加载状态 */
  const loading = ref<boolean>(false);

  /** 错误信息 */
  const error = ref<string | null>(null);

  /**
   * 获取收藏文章列表
   * @param pageNum 页码
   * @param size 每页数量
   */
  const fetchFavorites = async (pageNum: number = 1, size: number = 10) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await getUserFavorites({ page: pageNum, pageSize: size });

      articles.value = response.list;
      total.value = response.total;
      page.value = response.page;
      pageSize.value = response.pageSize;
    } catch (err: any) {
      console.error('获取收藏文章列表失败:', err);
      error.value = err.message || '获取收藏文章列表失败';
    } finally {
      loading.value = false;
    }
  };

  return {
    articles,
    total,
    page,
    pageSize,
    loading,
    error,
    fetchFavorites
  };
}
