import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

// 定义 Tag 接口
export interface Tag {
  id: number;
  name: string;
  created_at: Date;
  articleCount?: number;
  totalLikes?: number;
  totalViews?: number;
  totalFavorites?: number;
}

// 导出 TagModel 对象
export const TagModel = {
  /**
   * 获取所有标签
   * @returns 标签列表，按 name 排序
   */
  async getAllTags(): Promise<Tag[]> {
    const sql = `
      SELECT t.id, t.name, t.created_at, COUNT(at.article_id) as articleCount
      FROM tags t
      LEFT JOIN article_tags at ON t.id = at.tag_id
      LEFT JOIN articles a ON at.article_id = a.id AND a.status = 'published'
      GROUP BY t.id, t.name, t.created_at
      ORDER BY t.name ASC
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql);
    const tags = rows as Tag[];
    return tags;
  },

  /**
   * 获取热门标签
   * 按综合热度排序（文章数权重 30%，点赞数 30%，收藏数 20%，浏览数 20%）
   * @param limit 返回数量限制
   * @returns 热门标签列表
   */
  async getHotTags(limit: number = 8): Promise<Tag[]> {
    const sql = `
      SELECT 
        t.id, 
        t.name, 
        t.created_at, 
        COUNT(at.article_id) as articleCount,
        SUM(IFNULL(a.likes, 0)) as totalLikes,
        SUM(IFNULL(a.views, 0)) as totalViews,
        (SELECT COUNT(*) FROM favorites f WHERE f.article_id IN (SELECT at_inner.article_id FROM article_tags at_inner WHERE at_inner.tag_id = t.id)) as totalFavorites,
        (COUNT(at.article_id) * 0.3 + SUM(IFNULL(a.likes, 0)) * 0.3 + 
         (SELECT COUNT(*) FROM favorites f WHERE f.article_id IN (SELECT at_inner.article_id FROM article_tags at_inner WHERE at_inner.tag_id = t.id)) * 0.2 + 
         SUM(IFNULL(a.views, 0)) * 0.2) as hotScore
      FROM tags t
      LEFT JOIN article_tags at ON t.id = at.tag_id
      LEFT JOIN articles a ON at.article_id = a.id AND a.status = 'published'
      GROUP BY t.id, t.name, t.created_at
      HAVING articleCount > 0
      ORDER BY hotScore DESC
      LIMIT ${limit}
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql);
    const tags = rows as Tag[];
    return tags;
  },
  
  /**
   * 根据 ID 获取标签
   * @param id 标签 ID
   * @returns 标签对象或 null
   */
  async getTagById(id: number): Promise<Tag | null> {
    const sql = 'SELECT * FROM tags WHERE id = ?';
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [id]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0] as Tag;
  },
  
  /**
   * 根据名称获取标签
   * @param name 标签名称
   * @returns 标签对象或 null
   */
  async getTagByName(name: string): Promise<Tag | null> {
    const sql = 'SELECT * FROM tags WHERE name = ?';
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [name]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0] as Tag;
  },
  
  /**
   * 创建新标签
   * @param name 标签名称
   * @returns 新标签的 ID
   */
  async createTag(name: string): Promise<number> {
    const sql = `
      INSERT INTO tags (name, created_at)
      VALUES (?, NOW())
    `;
    
    const [result] = await pool.execute(sql, [name]);
    return (result as any).insertId;
  },
  
  /**
   * 更新标签
   * @param id 标签 ID
   * @param name 标签名称
   * @returns 是否更新成功
   */
  async updateTag(id: number, name: string): Promise<boolean> {
    const sql = 'UPDATE tags SET name = ? WHERE id = ?';
    
    const [result] = await pool.execute(sql, [name, id]);
    return (result as any).affectedRows > 0;
  },
  
  /**
   * 删除标签
   * @param id 标签 ID
   * @returns 是否删除成功
   */
  async deleteTag(id: number): Promise<boolean> {
    const sql = 'DELETE FROM tags WHERE id = ?';
    
    const [result] = await pool.execute(sql, [id]);
    return (result as any).affectedRows > 0;
  },
  
  /**
   * 获取使用该标签的文章数量
   * @param tagId 标签 ID
   * @returns 文章数量
   */
  async getArticleCountByTagId(tagId: number): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM article_tags WHERE tag_id = ?';
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [tagId]);
    return (rows[0] as any).count || 0;
  },
  
  /**
   * 获取或创建标签
   * @param name 标签名称
   * @returns 标签 ID
   */
  async getOrCreateTag(name: string): Promise<number> {
    // 先查找标签是否存在
    const existingTag = await this.getTagByName(name);
    
    // 如果存在，返回 ID
    if (existingTag) {
      return existingTag.id;
    }
    
    // 否则创建新标签并返回 ID
    return await this.createTag(name);
  }
};
