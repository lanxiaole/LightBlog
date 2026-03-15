import api from './index';

/**
 * 点赞文章
 * @param articleId 文章ID
 * @returns 点赞后的点赞总数
 */
export async function likeArticle(articleId: number): Promise<{ likesCount: number }> {
  try {
    const response = await api.post(`/articles/${articleId}/like`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '点赞失败');
  }
}

/**
 * 取消点赞
 * @param articleId 文章ID
 * @returns 取消点赞后的点赞总数
 */
export async function unlikeArticle(articleId: number): Promise<{ likesCount: number }> {
  try {
    const response = await api.delete(`/articles/${articleId}/like`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '取消点赞失败');
  }
}
