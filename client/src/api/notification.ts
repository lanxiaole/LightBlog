import api from './index';

// 定义发送者类型
export interface NotificationSender {
  id: number;
  username: string;
  avatar: string | null;
}

// 定义 Notification 类型
export interface Notification {
  id: number;
  type: string;
  sender_id: number;
  receiver_id: number;
  article_id?: number;
  article_title?: string;
  comment_id?: number;
  is_read: boolean;
  created_at: string;
  sender?: NotificationSender;
}

// 定义获取通知列表的响应类型
export interface GetNotificationsResponse {
  list: Notification[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取通知列表
 * @param params 查询参数
 * @returns 通知列表和分页信息
 */
export async function getNotifications(params?: { page?: number; pageSize?: number }): Promise<GetNotificationsResponse> {
  try {
    const response = await api.get<GetNotificationsResponse>('/notifications', {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`获取通知列表失败: ${error.message}`);
    }
    throw new Error('获取通知列表失败');
  }
}

/**
 * 标记通知为已读
 * @param id 通知ID
 */
export async function markAsRead(id: number): Promise<void> {
  try {
    await api.put(`/notifications/${id}/read`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`标记通知已读失败: ${error.message}`);
    }
    throw new Error('标记通知已读失败');
  }
}

/**
 * 标记所有通知为已读
 */
export async function markAllAsRead(): Promise<void> {
  try {
    await api.put('/notifications/read-all');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`标记所有通知已读失败: ${error.message}`);
    }
    throw new Error('标记所有通知已读失败');
  }
}

/**
 * 获取未读通知数量
 * @returns 未读通知数量
 */
export async function getUnreadCount(): Promise<{ count: number }> {
  try {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`获取未读通知数量失败: ${error.message}`);
    }
    throw new Error('获取未读通知数量失败');
  }
}
