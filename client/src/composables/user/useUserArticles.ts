import { ref, computed, watch, type Ref } from 'vue';
import { getUserArticles } from '@/api/user';
import type { Article } from '@/api/article';

/**
 * 用户文章列表组合式函数
 * @param username 用户名（可以是 ref 或普通字符串）
 */
export function useUserArticles(username: string | Ref<string>) {
  // 响应式状态
  const articles = ref<Article[]>([]);
  const total = ref<number>(0);
  const page = ref<number>(1);
  const pageSize = ref<number>(10);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // 计算属性，处理 username 可能是 ref 的情况
  const currentUsername = computed(() => {
    return typeof username === 'object' ? username.value : username;
  });

  // 获取文章列表
  const fetchArticles = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await getUserArticles(currentUsername.value, {
        page: page.value,
        pageSize: pageSize.value
      });

      articles.value = response.list;
      total.value = response.total;
      page.value = response.page;
      pageSize.value = response.pageSize;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取文章列表失败';
      articles.value = [];
      total.value = 0;
    } finally {
      loading.value = false;
    }
  };

  // 设置页码
  const setPage = (newPage: number) => {
    page.value = newPage;
    fetchArticles();
  };

  // 设置每页数量
  const setPageSize = (newPageSize: number) => {
    pageSize.value = newPageSize;
    page.value = 1; // 重置页码
    fetchArticles();
  };

  // 监听用户名变化
  watch(currentUsername, () => {
    page.value = 1; // 重置页码
    fetchArticles();
  });

  // 初始加载
  fetchArticles();

  return {
    articles,
    total,
    page,
    pageSize,
    loading,
    error,
    fetchArticles,
    setPage,
    setPageSize
  };
}
