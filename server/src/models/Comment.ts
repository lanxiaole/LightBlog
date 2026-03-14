import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

// 定义作者接口
export interface Author {
  id: number;
  username: string;
  avatar: string | null;
}

// 定义 Comment 接口
export interface Comment {
  id: number;
  content: string;
  article_id: number;
  user_id: number;
  parent_id: number | null;
  created_at: Date;
  updated_at: Date;
  author?: Author;
}

// 导出 CommentModel 对象
export const CommentModel = {
  /**
   * 创建新评论
   * @param comment 评论信息
   * @returns 插入的评论 ID
   */
  async createComment(comment: {
    content: string;
    article_id: number;
    user_id: number;
    parent_id?: number;
  }): Promise<number> {
    const sql = `
      INSERT INTO comments (content, article_id, user_id, parent_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, [
      comment.content,
      comment.article_id,
      comment.user_id,
      comment.parent_id || null
    ]);
    
    return (result as any).insertId;
  },

  /**
   * 根据文章 ID 获取评论列表（分页）
   * @param articleId 文章 ID
   * @param page 页码，默认 1
   * @param pageSize 每页数量，默认 10
   * @returns 包含评论列表和总记录数的对象
   */
  async getCommentsByArticleId(articleId: number, page: number = 1, pageSize: number = 10): Promise<{ list: Comment[]; total: number }> {
    // 确保参数是有效的数字
    const validPage = Math.max(1, Number(page));
    const validPageSize = Math.max(1, Math.min(100, Number(pageSize)));
    // 计算偏移量
    const offset = (validPage - 1) * validPageSize;

    // 查询评论列表，关联用户信息
    const listSql = `
      SELECT 
        c.*, 
        u.id as author_id, 
        u.username, 
        u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.article_id = ?
      ORDER BY c.parent_id ASC, c.created_at DESC
      LIMIT ? OFFSET ?
    `;

    // 查询总记录数
    const countSql = `
      SELECT COUNT(*) as total FROM comments
      WHERE article_id = ?
    `;

    // 并行执行两个查询
    const [listResult, countResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(listSql, [articleId, validPageSize, offset]),
      pool.execute<RowDataPacket[]>(countSql, [articleId])
    ]);

    // 处理结果
    const list = (listResult[0] as any[]).map(row => ({
      id: row.id,
      content: row.content,
      article_id: row.article_id,
      user_id: row.user_id,
      parent_id: row.parent_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author: {
        id: row.author_id,
        username: row.username,
        avatar: row.avatar
      }
    }));
    const total = (countResult[0] as RowDataPacket[])[0].total as number;

    return { list, total };
  },

  /**
   * 删除评论
   * @param id 评论 ID
   * @returns 是否删除成功
   */
  async deleteComment(id: number): Promise<boolean> {
    const sql = 'DELETE FROM comments WHERE id = ?';
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, [id]);
    
    return (result as any).affectedRows > 0;
  },

  /**
   * 根据 ID 获取评论
   * @param id 评论 ID
   * @returns 评论对象，如果不存在返回 null
   */
  async getCommentById(id: number): Promise<Comment | null> {
    const sql = 'SELECT * FROM comments WHERE id = ?';
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, [id]);
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0] as Comment;
  }
};