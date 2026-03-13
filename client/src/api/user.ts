import api from './index';
import type { Article } from './article';

// 定义 User 类型（公开信息，不含密码）
export interface User {
  id: number;
  email: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

// 定义获取用户文章列表的响应类型
export interface GetUserArticlesResponse {
  list: Article[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取用户资料
 * @param username 用户名
 * @returns 用户资料
 */
export async function getUserProfile(username: string): Promise<User> {
  try {
    const response = await api.get<User>(`/users/${username}`);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`获取用户资料失败: ${error.message}`);
    }
    throw new Error('获取用户资料失败');
  }
}

/**
 * 获取用户文章列表
 * @param username 用户名
 * @param params 分页参数
 * @returns 用户文章列表和分页信息
 */
export async function getUserArticles(username: string, params?: { page?: number; pageSize?: number }): Promise<GetUserArticlesResponse> {
  try {
    const response = await api.get<GetUserArticlesResponse>(`/users/${username}/articles`, {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`获取用户文章列表失败: ${error.message}`);
    }
    throw new Error('获取用户文章列表失败');
  }
}

/**
 * 更新用户资料
 * @param data 要更新的字段
 * @returns 响应信息
 */
export async function updateUserProfile(data: { username?: string; bio?: string; avatar?: string }): Promise<{ message: string }> {
  try {
    const response = await api.put<{ message: string }>('/users/profile', data);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`更新用户资料失败: ${error.message}`);
    }
    throw new Error('更新用户资料失败');
  }
}
