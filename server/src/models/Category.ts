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
  }
};
