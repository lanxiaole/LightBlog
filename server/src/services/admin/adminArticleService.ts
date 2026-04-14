/**
 * 管理员文章服务
 * 处理文章管理相关的业务逻辑
 */
import pool from '../../config/db';
import { RowDataPacket } from 'mysql2';
import { buildPaginationSql } from '../../utils/pagination';

/**
 * 管理员文章服务
 */
export const AdminArticleService = {
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
  }
};