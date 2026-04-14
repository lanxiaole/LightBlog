/**
 * 管理员统计服务
 * 处理统计数据相关的业务逻辑
 */
import pool from '../../config/db';
import { RowDataPacket } from 'mysql2';

/**
 * 统计数据接口
 */
export interface AdminStats {
  userCount: number;
  articleCount: number;
  commentCount: number;
  todayNewUsers: number;
  last7DaysUserTrend: Array<{ date: string; count: number }>;
  last7DaysArticleTrend: Array<{ date: string; count: number }>;
}

/**
 * 管理员统计服务
 */
export const AdminStatsService = {
  /**
   * 获取统计数据
   * @returns 统计数据对象
   */
  async getStats(): Promise<AdminStats> {
    try {
      // 1. 获取用户总数
      const [userCountResult] = await pool.execute('SELECT COUNT(*) as count FROM users');
      const userCount = (userCountResult as RowDataPacket[])[0].count || 0;

      // 2. 获取文章总数
      const [articleCountResult] = await pool.execute('SELECT COUNT(*) as count FROM articles');
      const articleCount = (articleCountResult as RowDataPacket[])[0].count || 0;

      // 3. 获取评论总数
      const [commentCountResult] = await pool.execute('SELECT COUNT(*) as count FROM comments');
      const commentCount = (commentCountResult as RowDataPacket[])[0].count || 0;

      // 4. 获取今日新增用户数
      const [todayNewUsersResult] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()');
      const todayNewUsers = (todayNewUsersResult as RowDataPacket[])[0].count || 0;

      // 5. 获取近7天每日新增用户数
      const [userTrendResult] = await pool.execute('SELECT DATE(created_at) as date, COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DATE(created_at) ORDER BY date');
      const last7DaysUserTrend = (userTrendResult as RowDataPacket[]).map((row: RowDataPacket) => ({
        date: row.date,
        count: row.count
      }));

      // 6. 获取近7天每日文章发布数
      const [articleTrendResult] = await pool.execute('SELECT DATE(created_at) as date, COUNT(*) as count FROM articles WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DATE(created_at) ORDER BY date');
      const last7DaysArticleTrend = (articleTrendResult as RowDataPacket[]).map((row: RowDataPacket) => ({
        date: row.date,
        count: row.count
      }));

      // 返回统计数据
      return {
        userCount,
        articleCount,
        commentCount,
        todayNewUsers,
        last7DaysUserTrend,
        last7DaysArticleTrend
      };
    } catch (error) {
      console.error('获取统计数据失败:', error);
      throw new Error('获取统计数据失败');
    }
  }
};