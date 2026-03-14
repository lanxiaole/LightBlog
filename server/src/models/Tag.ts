import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

// 定义 Tag 接口
export interface Tag {
  id: number;
  name: string;
  created_at: Date;
}

// 导出 TagModel 对象
export const TagModel = {
  /**
   * 获取所有标签
   * @returns 标签列表，按 name 排序
   */
  async getAllTags(): Promise<Tag[]> {
    const sql = 'SELECT * FROM tags ORDER BY name ASC';
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql);
    const tags = rows as Tag[];
    return tags;
  },
  
  /**
   * 根据名称查找标签
   * @param name 标签名称
   * @returns 标签对象或 null
   */
  async findTagByName(name: string): Promise<Tag | null> {
    const sql = 'SELECT * FROM tags WHERE name = ?';
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [name]);
    const tags = rows as Tag[];
    return tags.length > 0 ? tags[0] : null;
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
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, [name]);
    return (result as any).insertId;
  },
  
  /**
   * 获取或创建标签
   * @param name 标签名称
   * @returns 标签 ID
   */
  async getOrCreateTag(name: string): Promise<number> {
    // 先查找标签是否存在
    const existingTag = await this.findTagByName(name);
    
    // 如果存在，返回 ID
    if (existingTag) {
      return existingTag.id;
    }
    
    // 否则创建新标签并返回 ID
    return await this.createTag(name);
  }
};
