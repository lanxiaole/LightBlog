import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

/**
 * 点赞接口
 */
export interface Like {
  id: number;
  user_id: number;
  article_id: number;
  created_at: Date;
}

/**
 * 点赞模型
 * 处理文章点赞相关的数据库操作
 */
export const LikeModel = {
  /**
   * 点赞文章
   * @param userId 用户ID
   * @param articleId 文章ID
   * @returns 是否成功
   */
  async likeArticle(userId: number, articleId: number): Promise<boolean> {
    const sql = `
      INSERT INTO likes (user_id, article_id, created_at)
      VALUES (?, ?, NOW())
    `;

    try {
      await pool.execute(sql, [userId, articleId]);
      return true;
    } catch (error: any) {
      // 忽略重复点赞错误（ER_DUP_ENTRY）
      if (error.code === 'ER_DUP_ENTRY') {
        return true;
      }
      throw error;
    }
  },

  /**
   * 取消点赞
   * @param userId 用户ID
   * @param articleId 文章ID
   * @returns 是否成功
   */
  async unlikeArticle(userId: number, articleId: number): Promise<boolean> {
    const sql = `
      DELETE FROM likes
      WHERE user_id = ? AND article_id = ?
    `;

    const [result] = await pool.execute<RowDataPacket[]>(sql, [userId, articleId]);
    return (result as any).affectedRows > 0;
  },

  /**
   * 检查用户是否已点赞
   * @param userId 用户ID
   * @param articleId 文章ID
   * @returns 是否已点赞
   */
  async hasUserLiked(userId: number, articleId: number): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as count
      FROM likes
      WHERE user_id = ? AND article_id = ?
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId, articleId]);
    return (rows[0] as any).count > 0;
  },

  /**
   * 获取文章点赞总数
   * @param articleId 文章ID
   * @returns 点赞数量
   */
  async getLikesCount(articleId: number): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count
      FROM likes
      WHERE article_id = ?
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(sql, [articleId]);
    return (rows[0] as any).count || 0;
  }
};
