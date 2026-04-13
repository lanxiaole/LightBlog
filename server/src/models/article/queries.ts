import pool from '../../config/db';
import { RowDataPacket } from 'mysql2';
import { buildPaginationSql } from '../../utils/pagination';
import { Article } from './types';

// 导出文章查询相关操作
export const ArticleQueryModel = {
  /**
   * 获取文章列表（分页）
   * @param page 页码，默认 1
   * @param pageSize 每页数量，默认 10
   * @returns 包含文章列表和总记录数的对象
   */
  async getArticles(page: number = 1, pageSize: number = 10): Promise<{ list: Article[]; total: number }> {
    // 使用分页工具函数验证参数
    const paginationClause = buildPaginationSql(page, pageSize);

    // 查询文章列表（包含作者信息）
    const listSql = `
      SELECT 
        a.*, 
        u.id as author_id, 
        u.username, 
        u.avatar,
        u.role as author_role
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.status = 'published'
      ORDER BY a.created_at DESC
      ${paginationClause}
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
  },

  /**
   * 根据用户 ID 查询该用户发布的文章
   * @param userId 用户 ID
   * @param page 页码，默认 1
   * @param pageSize 每页数量，默认 10
   * @returns 包含文章列表和总记录数的对象
   */
  async getArticlesByUserId(userId: number, page: number = 1, pageSize: number = 10): Promise<{ list: Article[]; total: number }> {
    // 使用分页工具函数验证参数
    const paginationClause = buildPaginationSql(page, pageSize);

    // 查询文章列表（包含作者信息）
    const listSql = `
      SELECT 
        a.*, 
        u.id as author_id, 
        u.username, 
        u.avatar,
        u.role as author_role
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.author_id = ? AND a.status = 'published'
      ORDER BY a.created_at DESC
      ${paginationClause}
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
  },



  /**
   * 根据标签名称查询文章（分页）
   * @param tagName 标签名称
   * @param page 页码，默认 1
   * @param pageSize 每页数量，默认 10
   * @returns 包含文章列表和总记录数的对象
   */
  async getArticlesByTag(tagName: string, page: number = 1, pageSize: number = 10): Promise<{ list: Article[]; total: number }> {
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
      JOIN article_tags at ON a.id = at.article_id
      JOIN tags t ON at.tag_id = t.id
      JOIN users u ON a.author_id = u.id
      WHERE t.name = ? AND a.status = 'published'
      ORDER BY a.created_at DESC
      ${paginationClause}
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
  },

  /**
   * 搜索文章（分页）
   * @param keyword 搜索关键词
   * @param page 页码，默认 1
   * @param pageSize 每页数量，默认 10
   * @returns 包含文章列表和总记录数的对象
   */
  async searchArticles(keyword: string, page: number = 1, pageSize: number = 10): Promise<{ list: Article[]; total: number }> {
    // 如果关键词为空，返回空列表
    if (!keyword || keyword.trim() === '') {
      return { list: [], total: 0 };
    }

    // 使用分页工具函数构建分页 SQL
    const paginationClause = buildPaginationSql(page, pageSize);

    // 构建搜索关键词（添加通配符）
    const searchKeyword = `%${keyword.trim()}%`;

    // 查询文章列表（包含作者信息）
    const listSql = `
      SELECT 
        a.*, 
        u.id as author_id, 
        u.username, 
        u.avatar,
        u.role as author_role
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE (a.title LIKE ? OR a.content LIKE ?) AND a.status = 'published'
      ORDER BY a.created_at DESC
      ${paginationClause}
    `;

    // 查询总记录数
    const countSql = `
      SELECT COUNT(*) as total FROM articles a
      WHERE (a.title LIKE ? OR a.content LIKE ?) AND a.status = 'published'
    `;

    // 并行执行两个查询
    const [listResult, countResult] = await Promise.all([
      pool.execute<RowDataPacket[]>(listSql, [searchKeyword, searchKeyword]),
      pool.execute<RowDataPacket[]>(countSql, [searchKeyword, searchKeyword])
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
