import api from './index';

// 定义 Tag 类型
export interface Tag {
  id: number;
  name: string;
  articleCount?: number;
  totalLikes?: number;
  totalViews?: number;
  totalFavorites?: number;
}

/**
 * 获取所有标签
 * @returns 标签列表
 */
export async function getTags(): Promise<Tag[]> {
  try {
    const response = await api.get<Tag[]>('/tags');
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`获取标签列表失败: ${error.message}`);
    }
    throw new Error('获取标签列表失败');
  }
}

/**
 * 获取热门标签
 * @param limit 返回数量限制
 * @returns 热门标签列表
 */
export async function getHotTags(limit?: number): Promise<Tag[]> {
  try {
    const params = limit ? { limit } : undefined;
    const response = await api.get<Tag[]>('/tags/hot', { params });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`获取热门标签失败: ${error.message}`);
    }
    throw new Error('获取热门标签失败');
  }
}
