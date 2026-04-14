/**
 * 管理员服务
 * 处理管理员相关的业务逻辑，如统计数据等
 */
import pool from '../../config/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import { buildPaginationSql } from '../../utils/pagination';

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
 * 管理员服务
 */
export const AdminService = {
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
  },

  /**
   * 管理员删除文章
   * @param articleId 文章ID
   * @returns 是否操作成功
   */
  async adminDeleteArticle(articleId: number): Promise<boolean> {
    try {
      const [result] = await pool.execute('DELETE FROM articles WHERE id = ?', [articleId]);
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('管理员删除文章失败:', error);
      throw new Error('管理员删除文章失败');
    }
  },

  /**
   * 获取所有文章（用于管理后台）
   * @param params 查询参数
   * @returns 文章列表和总记录数
   */
  async getAllArticles(params: { keyword?: string; categoryId?: number; status?: string; page?: number; pageSize?: number }): Promise<{ list: any[]; total: number }> {
    try {
      const { keyword, categoryId, status, page = 1, pageSize = 10 } = params;
      
      let query = `
        SELECT a.*, u.username as author_name 
        FROM articles a
        LEFT JOIN users u ON a.author_id = u.id
        WHERE 1=1
      `;
      const values: any[] = [];
      
      if (keyword) {
        query += ' AND (a.title LIKE ? OR a.content LIKE ?)';
        values.push(`%${keyword}%`, `%${keyword}%`);
      }
      
      if (categoryId) {
        query += ' AND a.category_id = ?';
        values.push(categoryId);
      }
      
      if (status) {
        query += ' AND a.status = ?';
        values.push(status);
      }
      
      const countQuery = query.replace('a.*, u.username as author_name', 'COUNT(*) as count');
      const [countResult] = await pool.execute(countQuery, values);
      const total = (countResult as RowDataPacket[])[0].count || 0;
      
      query += ` ORDER BY a.is_pinned DESC, a.created_at DESC ${buildPaginationSql(page, pageSize)}`;
      
      const [articlesResult] = await pool.execute(query, values);
      
      return {
        list: articlesResult as RowDataPacket[],
        total
      };
    } catch (error) {
      console.error('获取文章列表失败:', error);
      throw new Error('获取文章列表失败');
    }
  },

  /**
   * 设置文章置顶状态
   * @param articleId 文章ID
   * @param isPinned 是否置顶
   * @returns 是否操作成功
   */
  async togglePin(articleId: number, isPinned: boolean): Promise<boolean> {
    try {
      const [result] = await pool.execute('UPDATE articles SET is_pinned = ? WHERE id = ?', [isPinned, articleId]);
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('更新置顶状态失败:', error);
      throw new Error('更新置顶状态失败');
    }
  },

  /**
   * 更新文章状态
   * @param articleId 文章ID
   * @param status 文章状态
   * @returns 是否操作成功
   */
  async updateArticleStatus(articleId: number, status: string): Promise<boolean> {
    try {
      const [result] = await pool.execute('UPDATE articles SET status = ? WHERE id = ?', [status, articleId]);
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('更新文章状态失败:', error);
      throw new Error('更新文章状态失败');
    }
  },

  /**
   * 获取用户列表（用于管理后台）
   * @param params 查询参数
   * @returns 用户列表和总记录数
   */
  async getUsers(params: { keyword?: string; page?: number; pageSize?: number }): Promise<{ list: any[]; total: number }> {
    try {
      const { keyword, page = 1, pageSize = 10 } = params;
      
      let query = 'SELECT * FROM users WHERE 1=1';
      const values: any[] = [];
      
      if (keyword) {
        query += ' AND (email LIKE ? OR username LIKE ?)';
        values.push(`%${keyword}%`, `%${keyword}%`);
      }
      
      const countQuery = query.replace('*', 'COUNT(*) as count');
      const [countResult] = await pool.execute(countQuery, values);
      const total = (countResult as RowDataPacket[])[0].count || 0;
      
      query += ` ORDER BY created_at DESC ${buildPaginationSql(page, pageSize)}`;
      
      const [usersResult] = await pool.execute(query, values);
      
      return {
        list: (usersResult as RowDataPacket[]).map(user => ({
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at
        })),
        total
      };
    } catch (error) {
      console.error('获取用户列表失败:', error);
      throw new Error('获取用户列表失败');
    }
  },

  /**
   * 切换用户状态（用于管理后台）
   * @param userId 用户ID
   * @param isActive 是否激活
   * @returns 是否操作成功
   */
  async toggleUserStatus(userId: number, isActive: boolean): Promise<boolean> {
    try {
      const [result] = await pool.execute('UPDATE users SET is_active = ? WHERE id = ?', [isActive, userId]);
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('切换用户状态失败:', error);
      throw new Error('切换用户状态失败');
    }
  },

  /**
   * 重置用户密码（用于管理后台）
   * @param userId 用户ID
   * @returns 新生成的明文密码
   */
  async resetPassword(userId: number): Promise<string> {
    try {
      // 生成随机密码
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let newPassword = '';
      for (let i = 0; i < 8; i++) {
        newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // 加密密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // 更新密码
      const [result] = await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
      
      if ((result as any).affectedRows > 0) {
        return newPassword;
      } else {
        throw new Error('密码重置失败');
      }
    } catch (error) {
      console.error('重置用户密码失败:', error);
      throw new Error('重置用户密码失败');
    }
  }
};