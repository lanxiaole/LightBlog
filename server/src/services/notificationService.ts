/**
 * 通知服务
 * 处理用户通知相关的业务逻辑
 */
import { NotificationModel } from '../models/Notification';

/**
 * 通知服务
 */
export const NotificationService = {
  /**
   * 获取用户的通知列表
   * @param receiverId 接收者ID
   * @param page 页码，默认1
   * @param pageSize 每页数量，默认10
   * @returns 通知列表
   */
  async getNotificationsByReceiver(receiverId: number, page: number = 1, pageSize: number = 10) {
    return await NotificationModel.getNotificationsByReceiver(receiverId, page, pageSize);
  },

  /**
   * 标记通知为已读
   * @param notificationId 通知ID
   * @param userId 用户ID（用于权限验证）
   * @throws 当通知不存在时抛出错误
   * @throws 当无权限操作此通知时抛出错误
   */
  async markAsRead(notificationId: number, userId: number): Promise<void> {
    const notification = await NotificationModel.getNotificationById(notificationId);

    if (!notification) {
      throw new Error('通知不存在');
    }

    if (notification.receiver_id !== userId) {
      throw new Error('无权限操作此通知');
    }

    await NotificationModel.markAsRead(notificationId);
  },

  /**
   * 标记所有通知为已读
   * @param userId 用户ID
   */
  async markAllAsRead(userId: number): Promise<void> {
    await NotificationModel.markAllAsRead(userId);
  },

  /**
   * 获取未读通知数量
   * @param userId 用户ID
   * @returns 未读通知数量
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await NotificationModel.getUnreadCount(userId);
  }
};