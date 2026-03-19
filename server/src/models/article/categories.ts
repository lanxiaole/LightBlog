import pool from '../../config/db';
import { RowDataPacket } from 'mysql2';
import { buildPaginationSql } from '../../utils/pagination';
import { Article } from './types';

// 导出文章分类相关操作
export const ArticleCategoryModel = {
  /**
   * 根据分类名称查询文章（分页）
   * @param categoryName 分类名称
   * @param page 页码，默认 1
   * @param pageSize 每页数量，默认 10
   * @returns 包含文章列表和总记录数的对象
   */
  async getArticlesByCategory(categoryName: string, page: number = 1, pageSize: number = 10): Promise<{ list: Article[]; total: number }> {
    // 使用分页工具函数验证参数
    const paginationClause = buildPaginationSql(page, pageSize);

    const listSql = `
      SELECT 
        a.*, 
        u.id as author_id, 
        u.username, 
        u.avatar,
        u.role as author_role
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      JOIN users u ON a.author_id = u.id
      WHERE c.name = ? AND a.status = 'published'
      ORDER BY (u.role = 'admin') DESC, a.created_at DESC
      ${paginationClause}
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

    // 处理结果，添加作者信息
    const list = (listResult[0] as any[]).map(article => ({
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
        avatar: article.avatar,
        role: article.author_role
      }
    }));
    const total = (countResult[0] as RowDataPacket[])[0].total as number;

    return { list, total };
  }
};
