import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

// 定义 Category 接口
export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
}

// 导出 CategoryModel 对象
export const CategoryModel = {
  /**
   * 获取所有分类
   * @returns 分类列表，按 name 排序
   */
  async getAllCategories(): Promise<Category[]> {
    const sql = 'SELECT * FROM categories ORDER BY name ASC';
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql);
    const categories = rows as Category[];
    return categories;
  },

  /**
   * 根据 ID 获取分类
   * @param id 分类 ID
   * @returns 分类对象或 null
   */
  async getCategoryById(id: number): Promise<Category | null> {
    const sql = 'SELECT * FROM categories WHERE id = ?';
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [id]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0] as Category;
  },

  /**
   * 根据名称获取分类
   * @param name 分类名称
   * @returns 分类对象或 null
   */
  async getCategoryByName(name: string): Promise<Category | null> {
    const sql = 'SELECT * FROM categories WHERE name = ?';
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [name]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0] as Category;
  },

  /**
   * 创建分类
   * @param name 分类名称
   * @param description 分类描述
   * @returns 创建的分类 ID
   */
  async createCategory(name: string, description?: string): Promise<number> {
    const sql = 'INSERT INTO categories (name, description) VALUES (?, ?)';
    
    const [result] = await pool.execute(sql, [name, description || null]);
    return (result as any).insertId;
  },

  /**
   * 更新分类
   * @param id 分类 ID
   * @param name 分类名称
   * @param description 分类描述
   * @returns 是否更新成功
   */
  async updateCategory(id: number, name: string, description?: string): Promise<boolean> {
    const sql = 'UPDATE categories SET name = ?, description = ? WHERE id = ?';
    
    const [result] = await pool.execute(sql, [name, description || null, id]);
    return (result as any).affectedRows > 0;
  },

  /**
   * 删除分类
   * @param id 分类 ID
   * @returns 是否删除成功
   */
  async deleteCategory(id: number): Promise<boolean> {
    const sql = 'DELETE FROM categories WHERE id = ?';
    
    const [result] = await pool.execute(sql, [id]);
    return (result as any).affectedRows > 0;
  }
};
