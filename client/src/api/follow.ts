import api from './index';
import type { User } from './user';

/**
 * 关注用户
 * @param userId 用户 ID
 * @returns 关注数和粉丝数
 */
export async function followUser(userId: number): Promise<{ followersCount?: number; followingCount?: number }> {
  try {
    const response = await api.post<{ followersCount?: number; followingCount?: number }>(`/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`关注用户失败: ${error.message}`);
    }
    throw new Error('关注用户失败');
  }
}

/**
 * 取消关注用户
 * @param userId 用户 ID
 * @returns 关注数和粉丝数
 */
export async function unfollowUser(userId: number): Promise<{ followersCount?: number; followingCount?: number }> {
  try {
    const response = await api.delete<{ followersCount?: number; followingCount?: number }>(`/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`取消关注用户失败: ${error.message}`);
    }
    throw new Error('取消关注用户失败');
  }
}

/**
 * 获取用户粉丝列表
 * @param userId 用户 ID
 * @param params 分页参数
 * @returns 粉丝列表和分页信息
 */
export async function getFollowers(userId: number, params?: { page?: number; pageSize?: number }): Promise<{ list: User[]; total: number; page: number; pageSize: number }> {
  try {
    const response = await api.get<{ list: User[]; total: number; page: number; pageSize: number }>(`/users/${userId}/followers`, {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`获取粉丝列表失败: ${error.message}`);
    }
    throw new Error('获取粉丝列表失败');
  }
}

/**
 * 获取用户关注列表
 * @param userId 用户 ID
 * @param params 分页参数
 * @returns 关注列表和分页信息
 */
export async function getFollowing(userId: number, params?: { page?: number; pageSize?: number }): Promise<{ list: User[]; total: number; page: number; pageSize: number }> {
  try {
    const response = await api.get<{ list: User[]; total: number; page: number; pageSize: number }>(`/users/${userId}/following`, {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`获取关注列表失败: ${error.message}`);
    }
    throw new Error('获取关注列表失败');
  }
}

/**
 * 获取关注状态
 * @param userId 用户 ID
 * @returns 关注状态
 */
export async function getFollowStatus(userId: number): Promise<{ isFollowed: boolean }> {
  try {
    const response = await api.get<{ isFollowed: boolean }>(`/users/${userId}/follow/status`);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`获取关注状态失败: ${error.message}`);
    }
    throw new Error('获取关注状态失败');
  }
}
