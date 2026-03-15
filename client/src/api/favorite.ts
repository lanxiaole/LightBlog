import api from './index';
import type { Article } from './article';

/**
 * 收藏文章
 * @param articleId 文章ID
 * @returns 收藏后的收藏总数
 */
export async function favoriteArticle(articleId: number): Promise<{ favoritesCount: number }> {
  try {
    const response = await api.post(`/articles/${articleId}/favorite`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '收藏失败');
  }
}

/**
 * 取消收藏
 * @param articleId 文章ID
 * @returns 取消收藏后的收藏总数
 */
export async function unfavoriteArticle(articleId: number): Promise<{ favoritesCount: number }> {
  try {
    const response = await api.delete(`/articles/${articleId}/favorite`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '取消收藏失败');
  }
}

/**
 * 获取用户收藏列表
 * @param params 查询参数
 * @returns 收藏文章列表和分页信息
 */
export async function getUserFavorites(params?: { page?: number; pageSize?: number }): Promise<{ list: Article[]; total: number; page: number; pageSize: number }> {
  try {
    const response = await api.get('/users/me/favorites', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '获取收藏列表失败');
  }
}