import api from './index';

// 定义 Category 类型
export interface Category {
  id: number;
  name: string;
  description: string | null;
}

/**
 * 获取所有分类
 * @returns 分类列表
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`获取分类列表失败: ${error.message}`);
    }
    throw new Error('获取分类列表失败');
  }
}
