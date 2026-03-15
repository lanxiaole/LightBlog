import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getArticles } from '@/api/article';
import { getCategories } from '@/api/category';
import { getTags } from '@/api/tag';
import type { Article } from '@/api/article';
import type { Category } from '@/api/category';
import type { Tag } from '@/api/tag';

/**
 * 首页逻辑 Composable
 * 提供首页的状态管理和操作方法
 */
export function useHome() {
  // 路由实例
  const router = useRouter();

  // 文章列表数据
  const articles = ref<Article[]>([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);

  // 分类和标签数据
  const categories = ref<Category[]>([]);
  const tags = ref<Tag[]>([]);

  // 加载状态
  const loading = ref(false);
  const error = ref('');

  /**
   * 格式化日期
   * @param dateString 日期字符串
   * @returns 格式化后的日期
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  /**
   * 获取文章摘要
   * @param content 文章内容
   * @returns 摘要文本
   */
  const getSummary = (content: string): string => {
    // 去除HTML标签
    const plainText = content.replace(/<[^>]*>/g, '');
    // 简单截取前100字作为摘要
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  };

  /**
   * 跳转到文章详情页
   * @param id 文章ID
   */
  const navigateToArticle = (id: number) => {
    router.push(`/article/${id}`);
  };

  /**
   * 跳转到分类页面
   * @param name 分类名称
   */
  const navigateToCategory = (name: string) => {
    router.push(`/category/${name}`);
  };

  /**
   * 跳转到标签页面
   * @param name 标签名称
   */
  const navigateToTag = (name: string) => {
    router.push(`/tag/${name}`);
  };

  /**
   * 处理分页大小变化
   * @param size 每页数量
   */
  const handleSizeChange = (size: number) => {
    pageSize.value = size;
    currentPage.value = 1;
    fetchArticles();
  };

  /**
   * 处理页码变化
   * @param current 当前页码
   */
  const handleCurrentChange = (current: number) => {
    currentPage.value = current;
    fetchArticles();
  };

  /**
   * 获取文章列表
   */
  const fetchArticles = async () => {
    try {
      loading.value = true;
      error.value = '';

      const response = await getArticles({
        page: currentPage.value,
        pageSize: pageSize.value
      });

      articles.value = response.list;
      total.value = response.total;
    } catch (err: any) {
      error.value = err.message || '获取文章列表失败';
      ElMessage.error(error.value);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取分类和标签数据
   */
  const fetchCategoriesAndTags = async () => {
    try {
      // 并行获取分类和标签数据
      const [categoryList, tagList] = await Promise.all([
        getCategories(),
        getTags()
      ]);
      categories.value = categoryList;
      tags.value = tagList;
    } catch (error) {
      console.error('获取分类和标签失败:', error);
    }
  };

  // 组件挂载时获取数据
  onMounted(() => {
    fetchArticles();
    fetchCategoriesAndTags();
  });

  return {
    articles,
    total,
    currentPage,
    pageSize,
    categories,
    tags,
    loading,
    error,
    formatDate,
    getSummary,
    navigateToArticle,
    navigateToCategory,
    navigateToTag,
    handleSizeChange,
    handleCurrentChange,
    fetchArticles
  };
}
