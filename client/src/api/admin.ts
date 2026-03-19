import api from './index';

/**
 * 统计数据类型
 */
export interface Stats {
  userCount: number;
  articleCount: number;
  commentCount: number;
  todayNewUsers: number;
  last7DaysUserTrend: Array<{ date: string; count: number }>;
  last7DaysArticleTrend: Array<{ date: string; count: number }>;
}

/**
 * 错误响应类型
 */
export interface ErrorResponse {
  message: string;
}

/**
 * 获取统计数据
 * @returns 统计数据
 */
export async function getStats(): Promise<Stats> {
  try {
    const response = await api.get<Stats>('/admin/stats');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ErrorResponse;
    }
    throw { message: '获取统计数据失败' } as ErrorResponse;
  }
}

export default api;