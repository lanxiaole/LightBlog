import { Request, Response } from 'express';
import { NotificationModel } from '../models/Notification';

/**
 * 获取通知列表（分页）
 * @param req 请求对象
 * @param res 响应对象
 */
export async function getNotifications(req: Request, res: Response): Promise<void> {
  try {
    // 从 req.user 获取当前用户 id（作为 receiver_id）
    const receiverId = (req as any).user?.id;
    
    // 验证用户是否已登录
    if (!receiverId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 从查询参数获取 page 和 pageSize
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    // 调用模型获取通知列表
    const { list, total } = await NotificationModel.getNotificationsByReceiver(receiverId, page, pageSize);
    
    // 返回 200 和 { list, total, page, pageSize }
    res.status(200).json({
      list,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('获取通知列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 标记通知为已读
 * @param req 请求对象
 * @param res 响应对象
 */
export async function markAsRead(req: Request, res: Response): Promise<void> {
  try {
    // 从路由参数获取通知 id
    const notificationId = parseInt(req.params.id as string);
    
    // 验证通知 id 是否有效
    if (isNaN(notificationId) || notificationId <= 0) {
      res.status(400).json({ message: '无效的通知ID' });
      return;
    }
    
    // 从 req.user 获取当前用户 id
    const userId = (req as any).user?.id;
    
    // 验证用户是否已登录
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 先查询通知是否存在，并确保通知的 receiver_id 等于当前用户 id
    const notification = await NotificationModel.getNotificationById(notificationId);
    
    if (!notification) {
      res.status(404).json({ message: '通知不存在' });
      return;
    }
    
    if (notification.receiver_id !== userId) {
      res.status(403).json({ message: '无权限操作此通知' });
      return;
    }
    
    // 调用模型标记为已读
    await NotificationModel.markAsRead(notificationId);
    
    // 返回 200
    res.status(200).json({ message: '标记成功' });
  } catch (error) {
    console.error('标记通知已读失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 标记所有通知为已读
 * @param req 请求对象
 * @param res 响应对象
 */
export async function markAllAsRead(req: Request, res: Response): Promise<void> {
  try {
    // 从 req.user 获取当前用户 id
    const userId = (req as any).user?.id;
    
    // 验证用户是否已登录
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 调用模型标记所有为已读
    await NotificationModel.markAllAsRead(userId);
    
    // 返回 200
    res.status(200).json({ message: '标记所有通知为已读成功' });
  } catch (error) {
    console.error('标记所有通知已读失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取未读通知数量
 * @param req 请求对象
 * @param res 响应对象
 */
export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  try {
    // 从 req.user 获取当前用户 id
    const userId = (req as any).user?.id;
    
    // 验证用户是否已登录
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 调用模型获取未读数量
    const count = await NotificationModel.getUnreadCount(userId);
    
    // 返回 200 和 { count }
    res.status(200).json({ count });
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};
