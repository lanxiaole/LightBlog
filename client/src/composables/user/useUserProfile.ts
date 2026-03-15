import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getUserProfile, getUserArticles, type User } from '@/api/user';
import { useUserStore } from '@/stores/user';
import type { Article } from '@/api/article';

/**
 * 用户资料逻辑 Composable
 * 提供用户资料页面的状态管理和操作方法
 */
export function useUserProfile() {
  // 获取路由和路由参数
  const route = useRoute();
  const router = useRouter();
  const username = computed(() => route.params.username as string);

  // 获取用户 store
  const userStore = useUserStore();

  /** 用户信息 */
  const user = ref<User | null>(null);

  /** 文章列表数据 */
  const articles = ref<{ list: Article[]; total: number; page: number; pageSize: number }>({
    list: [],
    total: 0,
    page: 1,
    pageSize: 10
  });

  /** 加载状态 */
  const loading = ref(true);

  /** 错误信息 */
  const error = ref<string | null>(null);

  /** 用户是否存在 */
  const userNotFound = ref(false);

  /**
   * 计算属性：是否是当前登录用户
   */
  const isCurrentUser = computed(() => {
    return userStore.isLoggedIn && userStore.userInfo?.username === username.value;
  });

  /**
   * 获取用户信息
   * @returns Promise<void>
   */
  const fetchUserProfile = async () => {
    try {
      const userData = await getUserProfile(username.value);
      user.value = userData;
      userNotFound.value = false;
    } catch (err: any) {
      if (err.response?.status === 404) {
        userNotFound.value = true;
      } else {
        error.value = '获取用户信息失败';
      }
    }
  };

  /**
   * 获取用户文章列表
   * @param page 页码
   * @param pageSize 每页数量
   * @returns Promise<void>
   */
  const fetchUserArticles = async (page: number = 1, pageSize: number = 10) => {
    try {
      const articlesData = await getUserArticles(username.value, { page, pageSize });
      articles.value = {
        ...articlesData,
        page,
        pageSize
      };
    } catch (err) {
      console.error('获取用户文章列表失败:', err);
      error.value = '获取文章列表失败';
    }
  };

  /**
   * 切换页码
   * @param currentPage 当前页码
   * @param pageSize 每页数量
   */
  const handlePageChange = (currentPage: number, pageSize?: number) => {
    fetchUserArticles(currentPage, pageSize || articles.value.pageSize);
  };

  /**
   * 跳转到编辑资料页面
   */
  const goToSettings = () => {
    router.push('/settings');
  };

  /**
   * 截取文章摘要
   * @param content 文章内容
   * @returns 摘要文本
   */
  const getArticleSummary = (content: string): string => {
    // 移除 HTML 标签，截取前 100 字
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  };

  // 组件挂载时加载数据
  onMounted(async () => {
    loading.value = true;
    error.value = null;

    try {
      // 并行请求用户信息和文章列表
      await Promise.all([
        fetchUserProfile(),
        fetchUserArticles()
      ]);
    } catch (err) {
      console.error('加载用户信息和文章列表失败:', err);
      error.value = '加载失败';
    } finally {
      loading.value = false;
    }
  });

  return {
    user,
    articles,
    loading,
    error,
    userNotFound,
    isCurrentUser,
    handlePageChange,
    goToSettings,
    getArticleSummary
  };
}
