import api from './index';

// 定义 Article 类型
export interface Article {
  id: number;
  title: string;
  content: string;
  cover: string | null;
  author_id: number;
  status: string;
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
}

// 定义获取文章列表的响应类型
export interface GetArticlesResponse {
  list: Article[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取文章列表
 * @param params 查询参数
 * @returns 文章列表和分页信息
 */
export async function getArticles(params?: { page?: number; pageSize?: number }): Promise<GetArticlesResponse> {
  try {
    const response = await api.get<GetArticlesResponse>('/articles', {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`获取文章列表失败: ${error.message}`);
    }
    throw new Error('获取文章列表失败');
  }
}
