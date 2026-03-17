import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import { buildPaginationSql, buildPaginationClause } from '../utils/pagination';

/**
 * 收藏接口
 */
export interface Favorite {
  id: number;
  user_id: number;
  article_id: number;
  created_at: Date;
}

/**
 * 收藏模型
 * 处理文章收藏相关的数据库操作
 */
export const FavoriteModel = {
  /**
   * 收藏文章
   * @param userId 用户ID
   * @param articleId 文章ID
   * @returns 是否成功
   */
  async favoriteArticle(userId: number, articleId: number): Promise<boolean> {
    const sql = `
      INSERT INTO favorites (user_id, article_id, created_at)
      VALUES (?, ?, NOW())
    `;

    try {
      await pool.execute(sql, [userId, articleId]);
      return true;
    } catch (error: any) {
      // 忽略重复收藏错误（ER_DUP_ENTRY）
      if (error.code === 'ER_DUP_ENTRY') {
        return true;
      }
      throw error;
    }
  },

  /**
   * 取消收藏
   * @param userId 用户ID
   * @param articleId 文章ID
   * @returns 是否成功
   */
  async unfavoriteArticle(userId: number, articleId: number): Promise<boolean> {
    const sql = `
      DELETE FROM favorites
      WHERE user_id = ? AND article_id = ?
    `;

    const [result] = await pool.execute<RowDataPacket[]>(sql, [userId, articleId]);
    return (result as any).affectedRows > 0;
  },

  /**
   * 检查用户是否已收藏
   * @param userId 用户ID
   * @param articleId 文章ID
   * @returns 是否已收藏
   */
  async hasUserFavorited(userId: number, articleId: number): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as count
      FROM favorites
      WHERE user_id = ? AND article_id = ?
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId, articleId]);
    return (rows[0] as any).count > 0;
  },

  /**
   * 获取文章收藏总数
   * @param articleId 文章ID
   * @returns 收藏数量
   */
  async getFavoritesCount(articleId: number): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count
      FROM favorites
      WHERE article_id = ?
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [articleId]);
    return (rows[0] as any).count || 0;
  },

  /**
   * 获取用户收藏的文章列表
   * @param userId 用户ID
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 包含文章列表和总记录数的对象
   */
  async getUserFavorites(userId: number, page: number, pageSize: number): Promise<{ list: any[]; total: number }> {
    // 使用分页工具函数验证参数
    const paginationClause = buildPaginationSql(page, pageSize);

    // 查询收藏的文章列表
    const listSql = `
      SELECT a.*, u.username, u.avatar
      FROM articles a
      JOIN favorites f ON a.id = f.article_id
      JOIN users u ON a.author_id = u.id
      WHERE f.user_id = ? AND a.status = 'published'
      ORDER BY f.created_at DESC
      ${paginationClause}
    `;

    // 查询总记录数
    const countSql = `
      SELECT COUNT(*) as total
      FROM favorites f
      JOIN articles a ON f.article_id = a.id
      WHERE f.user_id = ? AND a.status = 'published'
    `;

    // 并行执行两个查询
    const [listResult, countResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(listSql, [userId]),
      pool.execute<RowDataPacket[]>(countSql, [userId])
    ]);

    // 处理结果
    const list = listResult[0] as any[];
    const total = (countResult[0] as RowDataPacket[])[0]?.total || 0;

    return { list, total };
  }
};