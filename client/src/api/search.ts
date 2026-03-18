import api from './index';
import type { Article } from './article';

// 定义搜索文章的响应类型
export interface SearchArticlesResponse {
  list: Article[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 搜索文章
 * @param params 搜索参数
 * @returns 搜索结果和分页信息
 */
export async function searchArticles(params: { keyword: string; page?: number; pageSize?: number }): Promise<SearchArticlesResponse> {
  try {
    const response = await api.get<SearchArticlesResponse>('/search', {
      params: {
        keyword: params.keyword,
        page: params.page || 1,
        pageSize: params.pageSize || 10
      }
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`搜索文章失败: ${error.message}`);
    }
    throw new Error('搜索文章失败');
  }
}
