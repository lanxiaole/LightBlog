import api from '../index';
import type { Article } from '../article';

/**
 * 管理员文章类型（扩展 Article 类型，包含 is_pinned 字段）
 */
export interface AdminArticle extends Article {
  is_pinned: boolean;
}

/**
 * 获取文章列表的响应类型
 */
export interface GetArticlesResponse {
  list: AdminArticle[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取所有文章（用于管理后台）
 * @param params 查询参数
 * @returns 文章列表和分页信息
 */
export async function getAllArticles(params?: { keyword?: string; categoryId?: number; status?: string; page?: number; pageSize?: number }): Promise<GetArticlesResponse> {
  try {
    const response = await api.get<GetArticlesResponse>('/admin/articles', {
      params: {
        keyword: params?.keyword,
        categoryId: params?.categoryId,
        status: params?.status,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: '获取文章列表失败' };
  }
}

/**
 * 设置文章置顶状态
 * @param id 文章ID
 * @param isPinned 是否置顶
 * @returns 响应信息
 */
export async function togglePin(id: number, isPinned: boolean): Promise<{ message: string }> {
  try {
    const response = await api.put<{ message: string }>(`/admin/articles/${id}/toggle-pin`, { isPinned });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: '更新置顶状态失败' };
  }
}

/**
 * 更新文章状态
 * @param id 文章ID
 * @param status 文章状态
 * @returns 响应信息
 */
export async function updateArticleStatus(id: number, status: string): Promise<{ message: string }> {
  try {
    const response = await api.put<{ message: string }>(`/admin/articles/${id}/status`, { status });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: '更新文章状态失败' };
  }
}

/**
 * 删除文章
 * @param id 文章ID
 * @returns 响应信息
 */
export async function deleteArticle(id: number): Promise<{ message: string }> {
  try {
    const response = await api.delete<{ message: string }>(`/admin/articles/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: '删除文章失败' };
  }
}
