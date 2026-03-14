import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import { Tag } from './Tag';

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
  category_id: number | null;
  status: string;
  views: number;
  likes: number;
  created_at: Date;
  updated_at: Date;
  author?: Author;
  category?: {
    id: number;
    name: string;
    description: string | null;
  };
  tags?: Tag[];
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
   * @returns 包含作者、分类和标签信息的文章对象，如果不存在返回 null
   */
  async getArticleById(id: number): Promise<Article | null> {
    const sql = `
      SELECT 
        a.*, 
        u.id as author_id, 
        u.username, 
        u.avatar,
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
    const tags = await this.getArticleTags(id);
    
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
      created_at: article.created_at,
      updated_at: article.updated_at,
      author: {
        id: article.author_id,
        username: article.username,
        avatar: article.avatar
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
   * 根据用户 ID 查询该用户发布的文章
   * @param userId 用户 ID
   * @param page 页码，默认 1
   * @param pageSize 每页数量，默认 10
   * @returns 包含文章列表和总记录数的对象
   */
  async getArticlesByUserId(userId: number, page: number = 1, pageSize: number = 10): Promise<{ list: Article[]; total: number }> {
    // 确保参数是有效的数字
    const validPage = Math.max(1, Number(page));
    const validPageSize = Math.max(1, Math.min(100, Number(pageSize)));
    // 计算偏移量
    const offset = (validPage - 1) * validPageSize;

    // 查询文章列表
    const listSql = `
      SELECT * FROM articles
      WHERE author_id = ? AND status = 'published'
      ORDER BY created_at DESC
      LIMIT ${validPageSize} OFFSET ${offset}
    `;

    // 查询总记录数
    const countSql = `
      SELECT COUNT(*) as total FROM articles
      WHERE author_id = ? AND status = 'published'
    `;

    // 并行执行两个查询
    const [listResult, countResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(listSql, [userId]),
      pool.execute<RowDataPacket[]>(countSql, [userId])
    ]);

    // 处理结果
    const list = listResult[0] as Article[];
    const total = (countResult[0] as RowDataPacket[])[0].total as number;

    return { list, total };
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
   * 为文章添加标签
   * @param articleId 文章 ID
   * @param tagIds 标签 ID 数组
   */
  async addArticleTags(articleId: number, tagIds: number[]): Promise<void> {
    if (tagIds.length === 0) {
      return;
    }
    
    // 构建批量插入的 SQL 语句
    const placeholders = tagIds.map(() => '(?, ?)').join(', ');
    const values = tagIds.flatMap(tagId => [articleId, tagId]);
    
    const sql = `
      INSERT INTO article_tags (article_id, tag_id)
      VALUES ${placeholders}
    `;
    
    await pool.execute<RowDataPacket[]>(sql, values);
  },
  
  /**
   * 删除文章的所有标签
   * @param articleId 文章 ID
   */
  async removeArticleTags(articleId: number): Promise<void> {
    const sql = 'DELETE FROM article_tags WHERE article_id = ?';
    
    await pool.execute<RowDataPacket[]>(sql, [articleId]);
  },
  
  /**
   * 获取文章的所有标签
   * @param articleId 文章 ID
   * @returns 标签列表
   */
  async getArticleTags(articleId: number): Promise<Tag[]> {
    const sql = `
      SELECT t.*
      FROM tags t
      JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?
      ORDER BY t.name ASC
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [articleId]);
    const tags = rows as Tag[];
    return tags;
  },
  
  /**
   * 根据分类名称查询文章（分页）
   * @param categoryName 分类名称
   * @param page 页码，默认 1
   * @param pageSize 每页数量，默认 10
   * @returns 包含文章列表和总记录数的对象
   */
  async getArticlesByCategory(categoryName: string, page: number = 1, pageSize: number = 10): Promise<{ list: Article[]; total: number }> {
    const validPage = Math.max(1, Number(page));
    const validPageSize = Math.max(1, Math.min(100, Number(pageSize)));
    const offset = (validPage - 1) * validPageSize;

    const listSql = `
      SELECT a.* FROM articles a
      JOIN categories c ON a.category_id = c.id
      WHERE c.name = ? AND a.status = 'published'
      ORDER BY a.created_at DESC
      LIMIT ${validPageSize} OFFSET ${offset}
    `;

    const countSql = `
      SELECT COUNT(*) as total FROM articles a
      JOIN categories c ON a.category_id = c.id
      WHERE c.name = ? AND a.status = 'published'
    `;

    const [listResult, countResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(listSql, [categoryName]),
      pool.execute<RowDataPacket[]>(countSql, [categoryName])
    ]);

    const list = listResult[0] as Article[];
    const total = (countResult[0] as RowDataPacket[])[0].total as number;

    return { list, total };
  },
  
  /**
   * 根据标签名称查询文章（分页）
   * @param tagName 标签名称
   * @param page 页码，默认 1
   * @param pageSize 每页数量，默认 10
   * @returns 包含文章列表和总记录数的对象
   */
  async getArticlesByTag(tagName: string, page: number = 1, pageSize: number = 10): Promise<{ list: Article[]; total: number }> {
    const validPage = Math.max(1, Number(page));
    const validPageSize = Math.max(1, Math.min(100, Number(pageSize)));
    const offset = (validPage - 1) * validPageSize;

    const listSql = `
      SELECT a.* FROM articles a
      JOIN article_tags at ON a.id = at.article_id
      JOIN tags t ON at.tag_id = t.id
      WHERE t.name = ? AND a.status = 'published'
      ORDER BY a.created_at DESC
      LIMIT ${validPageSize} OFFSET ${offset}
    `;

    const countSql = `
      SELECT COUNT(*) as total FROM articles a
      JOIN article_tags at ON a.id = at.article_id
      JOIN tags t ON at.tag_id = t.id
      WHERE t.name = ? AND a.status = 'published'
    `;

    const [listResult, countResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(listSql, [tagName]),
      pool.execute<RowDataPacket[]>(countSql, [tagName])
    ]);

    const list = listResult[0] as Article[];
    const total = (countResult[0] as RowDataPacket[])[0].total as number;

    return { list, total };
  }
};
