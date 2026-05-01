import api from './index';

// 定义 Category 类型
export interface Category {
  id: number;
  name: string;
  description: string | null;
  articleCount?: number;
  totalLikes?: number;
  totalViews?: number;
  totalFavorites?: number;
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

/**
 * 获取热门分类
 * @param limit 返回数量限制
 * @returns 热门分类列表
 */
export async function getHotCategories(limit?: number): Promise<Category[]> {
  try {
    const params = limit ? { limit } : undefined;
    const response = await api.get<Category[]>('/categories/hot', { params });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`获取热门分类失败: ${error.message}`);
    }
    throw new Error('获取热门分类失败');
  }
}
