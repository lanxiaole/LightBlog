import api from '../index';
import type { User } from '../user';

/**
 * 管理员用户类型（扩展 User 类型，包含 is_active 和 role 字段）
 */
export interface AdminUser extends User {
  is_active: boolean;
  role: string;
}

/**
 * 获取用户列表的响应类型
 */
export interface GetUsersResponse {
  list: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取用户列表
 * @param params 查询参数
 * @returns 用户列表和分页信息
 */
export async function getUsers(params?: { keyword?: string; page?: number; pageSize?: number }): Promise<GetUsersResponse> {
  try {
    const response = await api.get<GetUsersResponse>('/admin/users', {
      params: {
        keyword: params?.keyword,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: '获取用户列表失败' };
  }
}

/**
 * 切换用户状态
 * @param userId 用户 ID
 * @param isActive 是否激活
 * @returns 响应信息
 */
export async function toggleUserStatus(userId: number, isActive: boolean): Promise<{ message: string }> {
  try {
    const response = await api.put<{ message: string }>(`/admin/users/${userId}/toggle-status`, { isActive });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: '切换用户状态失败' };
  }
}

/**
 * 重置用户密码
 * @param userId 用户 ID
 * @returns 新密码
 */
export async function resetUserPassword(userId: number): Promise<{ newPassword: string }> {
  try {
    const response = await api.post<{ newPassword: string }>(`/admin/users/${userId}/reset-password`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: '重置用户密码失败' };
  }
}
