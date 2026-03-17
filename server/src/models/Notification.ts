import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import { buildPaginationClause } from '../utils/pagination';

// 定义 Notification 接口
export interface Notification {
  id: number;
  type: string;
  sender_id: number;
  receiver_id: number;
  article_id?: number;
  comment_id?: number;
  is_read: boolean;
  created_at: Date;
}

// 扩展接口，包含发送者信息
export interface NotificationWithSender extends Notification {
  sender_username: string;
  sender_avatar: string | null;
}

// 导出 NotificationModel 对象
export const NotificationModel = {
  /**
   * 创建通知
   * @param data 通知数据
   * @returns 插入的通知 ID
   */
  async createNotification(data: {
    type: string;
    sender_id: number;
    receiver_id: number;
    article_id?: number;
    comment_id?: number;
  }): Promise<number> {
    const sql = `
      INSERT INTO notifications (type, sender_id, receiver_id, article_id, comment_id, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, false, NOW())
    `;
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, [
      data.type,
      data.sender_id,
      data.receiver_id,
      data.article_id || null,
      data.comment_id || null
    ]);
    return (result as any).insertId;
  },
  
  /**
   * 获取接收者的通知列表
   * @param receiverId 接收者 ID
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 通知列表和总数
   */
  async getNotificationsByReceiver(receiverId: number, page: number, pageSize: number): Promise<{ list: NotificationWithSender[]; total: number }> {
    // 构建分页子句
    const pagination = buildPaginationClause(page, pageSize);
    
    // 查询通知列表，关联用户表获取发送者信息
    const listSql = `
      SELECT 
        n.id, n.type, n.sender_id, n.receiver_id, n.article_id, n.comment_id, n.is_read, n.created_at,
        u.username as sender_username, u.avatar as sender_avatar
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.receiver_id = ?
      ORDER BY n.created_at DESC
      ${pagination.sql}
    `;
    
    // 查询总数
    const countSql = 'SELECT COUNT(*) as total FROM notifications WHERE receiver_id = ?';
    
    // 并行执行两个查询
    const [listResult, countResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(listSql, [receiverId, ...pagination.values]),
      pool.execute<RowDataPacket[]>(countSql, [receiverId])
    ]);
    
    // 处理结果
    const list = listResult[0] as NotificationWithSender[];
    const total = (countResult[0] as RowDataPacket[])[0].total as number;
    
    return { list, total };
  },
  
  /**
   * 标记单条通知为已读
   * @param notificationId 通知 ID
   * @returns 操作是否成功
   */
  async markAsRead(notificationId: number): Promise<boolean> {
    const sql = 'UPDATE notifications SET is_read = true WHERE id = ?';
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, [notificationId]);
    return (result as any).affectedRows > 0;
  },
  
  /**
   * 标记所有通知为已读
   * @param receiverId 接收者 ID
   * @returns 操作是否成功
   */
  async markAllAsRead(receiverId: number): Promise<boolean> {
    const sql = 'UPDATE notifications SET is_read = true WHERE receiver_id = ?';
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, [receiverId]);
    return (result as any).affectedRows > 0;
  },
  
  /**
   * 获取未读通知数量
   * @param receiverId 接收者 ID
   * @returns 未读通知数量
   */
  async getUnreadCount(receiverId: number): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM notifications WHERE receiver_id = ? AND is_read = false';
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, [receiverId]);
    return (result as RowDataPacket[])[0].count as number;
  },
  
  /**
   * 根据 ID 获取通知
   * @param notificationId 通知 ID
   * @returns 通知对象或 null
   */
  async getNotificationById(notificationId: number): Promise<Notification | null> {
    const sql = 'SELECT * FROM notifications WHERE id = ?';
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, [notificationId]);
    const notifications = result as Notification[];
    return notifications.length > 0 ? notifications[0] : null;
  }
};
