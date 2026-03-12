import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

// 定义作者接口
export interface Author {
  id: number;
  username: string;
  avatar: string | null;
}

// 定义 Article 接口
export interface Article {
  id: number;
  title: string;
  content: string;
  cover: string | null;
  author_id: number;
  status: string;
  views: number;
  likes: number;
  created_at: Date;
  updated_at: Date;
  author?: Author;
}

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
    status?: string;
  }): Promise<number> {
    const sql = `
      INSERT INTO articles (title, content, cover, author_id, status, views, likes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, 0, NOW(), NOW())
    `;
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, [
      article.title,
      article.content,
      article.cover || null,
      article.author_id,
      article.status || 'published'
    ]);
    
    return (result as any).insertId;
  },

  /**
   * 获取文章列表（分页）
   * @param page 页码，默认 1
   * @param pageSize 每页数量，默认 10
   * @returns 包含文章列表和总记录数的对象
   */
  async getArticles(page: number = 1, pageSize: number = 10): Promise<{ list: Article[]; total: number }> {
    // 确保参数是有效的数字
    const validPage = Math.max(1, Number(page));
    const validPageSize = Math.max(1, Math.min(100, Number(pageSize)));
    // 计算偏移量
    const offset = (validPage - 1) * validPageSize;

    // 查询文章列表
    const listSql = `
      SELECT * FROM articles
      WHERE status = 'published'
      ORDER BY created_at DESC
      LIMIT ${validPageSize} OFFSET ${offset}
    `;

    // 查询总记录数
    const countSql = `
      SELECT COUNT(*) as total FROM articles
      WHERE status = 'published'
    `;

    // 并行执行两个查询
    const [listResult, countResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(listSql),
      pool.execute<RowDataPacket[]>(countSql)
    ]);

    // 处理结果
    const list = listResult[0] as Article[];
    const total = (countResult[0] as RowDataPacket[])[0].total as number;

    return { list, total };
  },

  /**
   * 根据文章 id 查询单条文章记录
   * @param id 文章 id
   * @returns 包含作者信息的文章对象，如果不存在返回 null
   */
  async getArticleById(id: number): Promise<Article | null> {
    const sql = `
      SELECT 
        a.*, 
        u.id as author_id, 
        u.username, 
        u.avatar 
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.id = ?
    `;

    const [result] = await pool.execute<RowDataPacket[]>(sql, [id]);
    
    if (result.length === 0) {
      return null;
    }

    const article = result[0] as any;
    
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      cover: article.cover,
      author_id: article.author_id,
      status: article.status,
      views: article.views,
      likes: article.likes,
      created_at: article.created_at,
      updated_at: article.updated_at,
      author: {
        id: article.author_id,
        username: article.username,
        avatar: article.avatar
      }
    };
  }
};
