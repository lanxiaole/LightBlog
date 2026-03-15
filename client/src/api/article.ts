import api from './index';
import type { Tag } from './tag';

// 定义作者类型
export interface Author {
  id: number;
  username: string;
  avatar: string | null;
}

// 定义 Article 类型
export interface Article {
  id: number;
  title: string;
  content: string;
  cover: string | null;
  author_id: number;
  category_id: number | null;
  status: string;
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
  author?: Author;
  category?: {
    id: number;
    name: string;
    description: string | null;
  };
  tags?: Tag[];
  // 点赞相关字段（仅在详情接口返回）
  liked?: boolean;
  likesCount?: number;
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

/**
 * 获取文章详情
 * @param id 文章ID
 * @returns 文章详情
 */
export async function getArticleDetail(id: number): Promise<Article> {
  try {
    const response = await api.get<Article>(`/articles/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`获取文章详情失败: ${error.message}`);
    }
    throw new Error('获取文章详情失败');
  }
}

/**
 * 创建文章
 * @param data 文章数据
 * @returns 新文章ID
 */
export async function createArticle(data: { title: string; content: string; cover?: string; category_id?: number; tags?: string[] }): Promise<{ id: number }> {
  try {
     const response = await api.post<{ id: number }>('/articles', data);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`创建文章失败: ${error.message}`);
    }
    throw new Error('创建文章失败');
  }
}

/**
 * 根据分类获取文章列表
 * @param categoryName 分类名称
 * @param params 查询参数
 * @returns 文章列表和分页信息
 */
export async function getArticlesByCategory(categoryName: string, params?: { page?: number; pageSize?: number }): Promise<GetArticlesResponse & { categoryName: string }> {
  try {
    const response = await api.get<GetArticlesResponse & { categoryName: string }>(`/articles/category/${categoryName}`, {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`获取分类文章失败: ${error.message}`);
    }
    throw new Error('获取分类文章失败');
  }
}

/**
 * 根据标签获取文章列表
 * @param tagName 标签名称
 * @param params 查询参数
 * @returns 文章列表和分页信息
 */
export async function getArticlesByTag(tagName: string, params?: { page?: number; pageSize?: number }): Promise<GetArticlesResponse & { tagName: string }> {
  try {
    const response = await api.get<GetArticlesResponse & { tagName: string }>(`/articles/tag/${tagName}`, {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`获取标签文章失败: ${error.message}`);
    }
    throw new Error('获取标签文章失败');
  }
}

/**
 * 更新文章
 * @param id 文章ID
 * @param data 要更新的数据
 * @returns 更新结果
 */
export async function updateArticle(id: number, data: { title?: string; content?: string; cover?: string; category_id?: number; tags?: string[] }): Promise<{ message: string }> {
  try {
    const response = await api.put<{ message: string }>(`/articles/${id}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`更新文章失败: ${error.message}`);
    }
    throw new Error('更新文章失败');
  }
}

/**
 * 删除文章
 * @param id 文章ID
 * @returns 删除结果
 */
export async function deleteArticle(id: number): Promise<{ message: string }> {
  try {
    const response = await api.delete<{ message: string }>(`/articles/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`删除文章失败: ${error.message}`);
    }
    throw new Error('删除文章失败');
  }
}
