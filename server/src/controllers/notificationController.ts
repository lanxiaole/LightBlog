/**
 * 通知控制器
 * 处理通知相关的HTTP请求
 */
import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

/**
 * 获取用户的通知列表
 * @param req 请求对象
 * @param res 响应对象
 * @returns 通知列表和分页信息
 * @status 200 - 成功
 * @status 401 - 未授权
 * @status 500 - 服务器内部错误
 */
export async function getNotifications(req: Request, res: Response): Promise<void> {
  try {
    const receiverId = (req as any).user?.id;
    
    if (!receiverId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    const { list, total } = await NotificationService.getNotificationsByReceiver(receiverId, page, pageSize);
    
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
 * @returns 标记结果
 * @status 200 - 标记成功
 * @status 400 - 无效的通知ID
 * @status 401 - 未授权
 * @status 403 - 无权限操作此通知
 * @status 404 - 通知不存在
 * @status 500 - 服务器内部错误
 */
export async function markAsRead(req: Request, res: Response): Promise<void> {
  try {
    const notificationId = parseInt(req.params.id as string);
    
    if (isNaN(notificationId) || notificationId <= 0) {
      res.status(400).json({ message: '无效的通知ID' });
      return;
    }
    
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    await NotificationService.markAsRead(notificationId, userId);
    
    res.status(200).json({ message: '标记成功' });
  } catch (error) {
    console.error('标记通知已读失败:', error);
    if (error instanceof Error && 
        (error.message === '通知不存在' || error.message === '无权限操作此通知')) {
      const status = error.message === '通知不存在' ? 404 : 403;
      res.status(status).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 标记所有通知为已读
 * @param req 请求对象
 * @param res 响应对象
 * @returns 标记结果
 * @status 200 - 标记成功
 * @status 401 - 未授权
 * @status 500 - 服务器内部错误
 */
export async function markAllAsRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    await NotificationService.markAllAsRead(userId);
    
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
 * @returns 未读通知数量
 * @status 200 - 成功
 * @status 401 - 未授权
 * @status 500 - 服务器内部错误
 */
export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const count = await NotificationService.getUnreadCount(userId);
    
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
