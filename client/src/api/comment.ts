import api from './index';

// 定义作者类型
export interface Author {
  id: number;
  username: string;
  avatar: string | null;
}

// 定义 Comment 类型
export interface Comment {
  id: number;
  content: string;
  article_id: number;
  user_id: number;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  author?: Author;
}

// 定义获取评论列表的响应类型
export interface GetCommentsResponse {
  list: Comment[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取文章评论列表
 * @param articleId 文章 ID
 * @param params 查询参数
 * @returns 评论列表和分页信息
 */
export async function getComments(articleId: number, params?: { page?: number; pageSize?: number }): Promise<GetCommentsResponse> {
  try {
    const response = await api.get<GetCommentsResponse>(`/articles/${articleId}/comments`, {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`获取评论列表失败: ${error.message}`);
    }
    throw new Error('获取评论列表失败');
  }
}

/**
 * 创建评论
 * @param articleId 文章 ID
 * @param data 评论数据
 * @returns 新评论 ID
 */
export async function createComment(articleId: number, data: { content: string; parent_id?: number }): Promise<{ id: number }> {
  try {
    const response = await api.post<{ id: number }>(`/articles/${articleId}/comments`, data);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`创建评论失败: ${error.message}`);
    }
    throw new Error('创建评论失败');
  }
}

/**
 * 删除评论
 * @param commentId 评论 ID
 * @returns 删除结果
 */
export async function deleteComment(commentId: number): Promise<{ message: string }> {
  try {
    const response = await api.delete<{ message: string }>(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`删除评论失败: ${error.message}`);
    }
    throw new Error('删除评论失败');
  }
}