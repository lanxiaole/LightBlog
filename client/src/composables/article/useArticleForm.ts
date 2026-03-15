import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getCategories } from '@/api/category';
import { getTags } from '@/api/tag';
import type { Category } from '@/api/category';
import type { Tag } from '@/api/tag';

/**
 * 文章表单数据接口
 */
export interface ArticleFormData {
  /** 文章标题 */
  title: string;
  /** 文章内容（HTML格式） */
  content: string;
  /** 封面图URL */
  cover: string;
  /** 分类ID */
  category_id: number | undefined;
  /** 标签列表 */
  tags: string[];
}

/**
 * 文章表单逻辑 Composable
 * 提供文章表单的状态管理和操作方法
 */
export function useArticleForm() {
  /** 表单数据 */
  const form = ref<ArticleFormData>({
    title: '',
    content: '',
    cover: '',
    category_id: undefined,
    tags: []
  });

  /** 分类列表数据 */
  const categories = ref<Category[]>([]);
  /** 标签列表数据 */
  const existingTags = ref<Tag[]>([]);

  /** 加载状态（用于加载文章详情） */
  const loading = ref(false);
  /** 提交状态（用于表单提交） */
  const submitting = ref(false);

  /**
   * 加载分类和标签数据
   * @returns Promise<void>
   */
  const loadCategoriesAndTags = async () => {
    try {
      // 并行请求分类和标签数据，提高性能
      const [categoriesData, tagsData] = await Promise.all([
        getCategories(),
        getTags()
      ]);
      categories.value = categoriesData;
      existingTags.value = tagsData;
    } catch (error: any) {
      // 错误提示
      ElMessage.error(error.message || '获取分类和标签失败');
      // 抛出错误，让调用者可以处理
      throw error;
    }
  };

  /**
   * 验证表单
   * @returns boolean 是否验证通过
   */
  const validateForm = (): boolean => {
    // 验证标题
    if (!form.value.title.trim()) {
      ElMessage.warning('请输入文章标题');
      return false;
    }
    // 验证内容
    if (!form.value.content.trim()) {
      ElMessage.warning('请输入文章内容');
      return false;
    }
    return true;
  };

  /**
   * 设置表单数据（用于编辑文章）
   * @param data 表单数据
   */
  const setFormData = (data: Partial<ArticleFormData>) => {
    form.value = {
      ...form.value,
      ...data
    };
  };

  /**
   * 重置表单
   */
  const resetForm = () => {
    form.value = {
      title: '',
      content: '',
      cover: '',
      category_id: undefined,
      tags: []
    };
  };

  // 组件挂载时自动加载分类和标签数据
  onMounted(() => {
    loadCategoriesAndTags();
  });

  // 暴露状态和方法
  return {
    form,
    categories,
    existingTags,
    loading,
    submitting,
    loadCategoriesAndTags,
    validateForm,
    setFormData,
    resetForm
  };
}
