/**
 * 管理员分类服务
 * 处理分类管理相关的业务逻辑
 */
import { CategoryModel, Category } from '../../models/Category';
import pool from '../../config/db';
import { RowDataPacket } from 'mysql2';
import { buildPaginationSql } from '../../utils/pagination';

/**
 * 管理员分类服务
 */
export const CategoryService = {
  /**
   * 分页获取分类列表，支持按名称模糊搜索
   * @param params 查询参数
   * @returns 分类列表和总记录数
   */
  async getCategories(params: { page?: number; pageSize?: number; keyword?: string }): Promise<{ list: Category[]; total: number }> {
    try {
      const { page = 1, pageSize = 10, keyword } = params;
      
      let query = 'SELECT * FROM categories WHERE 1=1';
      const values: any[] = [];
      
      if (keyword) {
        query += ' AND name LIKE ?';
        values.push(`%${keyword}%`);
      }
      
      const countQuery = query.replace('*', 'COUNT(*) as count');
      const [countResult] = await pool.execute(countQuery, values);
      const total = (countResult as RowDataPacket[])[0].count || 0;
      
      query += ` ORDER BY name ASC ${buildPaginationSql(page, pageSize)}`;
      
      const [categoriesResult] = await pool.execute<RowDataPacket[]>(query, values);
      const list = categoriesResult as Category[];
      
      return {
        list,
        total
      };
    } catch (error) {
      console.error('获取分类列表失败:', error);
      throw new Error('获取分类列表失败');
    }
  },

  /**
   * 创建新分类
   * @param name 分类名称
   * @param description 分类描述
   * @returns 创建的分类对象
   */
  async createCategory(name: string, description?: string): Promise<Category> {
    try {
      // 检查名称是否已存在
      const existingCategory = await CategoryModel.getCategoryByName(name);
      if (existingCategory) {
        throw new Error('分类名称已存在');
      }
      
      // 创建分类
      const categoryId = await CategoryModel.createCategory(name, description);
      
      // 获取创建的分类对象
      const createdCategory = await CategoryModel.getCategoryById(categoryId);
      if (!createdCategory) {
        throw new Error('创建分类失败');
      }
      
      return createdCategory;
    } catch (error) {
      console.error('创建分类失败:', error);
      throw error;
    }
  },

  /**
   * 更新分类
   * @param id 分类 ID
   * @param name 分类名称
   * @param description 分类描述
   * @returns 更新后的分类对象
   */
  async updateCategory(id: number, name: string, description?: string): Promise<Category> {
    try {
      // 检查分类是否存在
      const existingCategory = await CategoryModel.getCategoryById(id);
      if (!existingCategory) {
        throw new Error('分类不存在');
      }
      
      // 检查名称是否与其他分类冲突（排除自身）
      const categoryWithSameName = await CategoryModel.getCategoryByName(name);
      if (categoryWithSameName && categoryWithSameName.id !== id) {
        throw new Error('分类名称已存在');
      }
      
      // 更新分类
      const success = await CategoryModel.updateCategory(id, name, description);
      if (!success) {
        throw new Error('更新分类失败');
      }
      
      // 获取更新后的分类对象
      const updatedCategory = await CategoryModel.getCategoryById(id);
      if (!updatedCategory) {
        throw new Error('获取更新后的分类失败');
      }
      
      return updatedCategory;
    } catch (error) {
      console.error('更新分类失败:', error);
      throw error;
    }
  },

  /**
   * 删除分类
   * @param id 分类 ID
   */
  async deleteCategory(id: number): Promise<void> {
    try {
      // 检查分类是否存在
      const existingCategory = await CategoryModel.getCategoryById(id);
      if (!existingCategory) {
        throw new Error('分类不存在');
      }
      
      // 检查该分类下是否有文章
      const [articleResult] = await pool.execute('SELECT COUNT(*) as count FROM articles WHERE category_id = ?', [id]);
      const articleCount = (articleResult as RowDataPacket[])[0].count || 0;
      
      if (articleCount > 0) {
        throw new Error('该分类下有文章，无法删除');
      }
      
      // 删除分类
      const success = await CategoryModel.deleteCategory(id);
      if (!success) {
        throw new Error('删除分类失败');
      }
    } catch (error) {
      console.error('删除分类失败:', error);
      throw error;
    }
  }
};