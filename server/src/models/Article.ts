import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import { Article, Author } from './article/types';
import { ArticleTagModel } from './article/tags';
import { ArticleCategoryModel } from './article/categories';
import { ArticleQueryModel } from './article/queries';

// 重新导出类型
export type { Article, Author };

// 导出 ArticleModel 对象
export const ArticleModel = {
  /**
   * 创建新文章
   * @param article 文章信息
   * @returns 插入的文章 ID
   */
  async createArticle(article: {
    title: string;
    content: string;
    cover?: string;
    author_id: number;
    category_id?: number;
    status?: string;
  }): Promise<number> {
    const sql = `
      INSERT INTO articles (title, content, cover, author_id, category_id, status, views, likes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, 0, NOW(), NOW())
    `;
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, [
      article.title,
      article.content,
      article.cover || null,
      article.author_id,
      article.category_id || null,
      article.status || 'published'
    ]);
    
    return (result as any).insertId;
  },

  /**
   * 根据文章 id 查询单条文章记录
   * @param id 文章 id
   * @returns 包含作者、分类和标签信息的文章对象，如果不存在返回 null
   */
  async getArticleById(id: number): Promise<Article | null> {
    const sql = `
      SELECT 
        a.*, 
        u.id as author_id, 
        u.username, 
        u.avatar,
        u.role as author_role,
        c.id as category_id,
        c.name as category_name,
        c.description as category_description
      FROM articles a
      JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = ?
    `;

    const [result] = await pool.execute<RowDataPacket[]>(sql, [id]);
    
    if (result.length === 0) {
      return null;
    }

    const article = result[0] as any;
    
    // 获取文章的标签
    const tags = await ArticleTagModel.getArticleTags(id);
    
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      cover: article.cover,
      author_id: article.author_id,
      category_id: article.category_id,
      status: article.status,
      views: article.views,
      likes: article.likes,
      is_pinned: article.is_pinned,
      created_at: article.created_at,
      updated_at: article.updated_at,
      author: {
        id: article.author_id,
        username: article.username,
        avatar: article.avatar,
        role: article.author_role
      },
      category: article.category_id ? {
        id: Number(article.category_id),
        name: String(article.category_name),
        description: article.category_description as string | null
      } : undefined,
      tags: tags
    };
  },

  /**
   * 更新文章信息
   * @param id 文章 ID
   * @param data 要更新的字段（可选字段）
   * @returns 是否更新成功
   */
  async updateArticle(id: number, data: { title?: string; content?: string; cover?: string; category_id?: number }): Promise<boolean> {
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    
    if (data.content !== undefined) {
      updates.push('content = ?');
      values.push(data.content);
    }
    
    if (data.cover !== undefined) {
      updates.push('cover = ?');
      values.push(data.cover);
    }
    
    if (data.category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(data.category_id);
    }
    
    if (updates.length === 0) {
      return false;
    }
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    const sql = `
      UPDATE articles
      SET ${updates.join(', ')}
      WHERE id = ?
    `;
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, values);
    
    return (result as any).affectedRows > 0;
  },

  /**
   * 删除文章
   * @param id 文章 ID
   * @returns 是否删除成功
   */
  async deleteArticle(id: number): Promise<boolean> {
    const sql = 'DELETE FROM articles WHERE id = ?';
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, [id]);
    
    return (result as any).affectedRows > 0;
  },

  /**
   * 设置文章置顶状态
   * @param id 文章 ID
   * @param isPinned 是否置顶
   * @returns 是否更新成功
   */
  async togglePin(id: number, isPinned: boolean): Promise<boolean> {
    const sql = 'UPDATE articles SET is_pinned = ?, updated_at = NOW() WHERE id = ?';
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, [isPinned, id]);
    
    return (result as any).affectedRows > 0;
  },

  /**
   * 更新文章状态
   * @param id 文章 ID
   * @param status 文章状态
   * @returns 是否更新成功
   */
  async updateArticleStatus(id: number, status: string): Promise<boolean> {
    const sql = 'UPDATE articles SET status = ?, updated_at = NOW() WHERE id = ?';
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, [status, id]);
    
    return (result as any).affectedRows > 0;
  },

  // 导入标签相关操作
  ...ArticleTagModel,

  // 导入分类相关操作
  ...ArticleCategoryModel,

  // 导入查询相关操作
  ...ArticleQueryModel
};
