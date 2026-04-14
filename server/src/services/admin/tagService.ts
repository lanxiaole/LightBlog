/**
 * 管理员标签服务
 * 处理标签管理相关的业务逻辑
 */
import { TagModel, Tag } from '../../models/Tag';
import pool from '../../config/db';
import { RowDataPacket } from 'mysql2';
import { buildPaginationSql } from '../../utils/pagination';

/**
 * 管理员标签服务
 */
export const TagService = {
  /**
   * 分页获取标签列表，支持按名称模糊搜索
   * @param params 查询参数
   * @returns 标签列表和总记录数
   */
  async getTags(params: { page?: number; pageSize?: number; keyword?: string }): Promise<{ list: Tag[]; total: number }> {
    try {
      const { page = 1, pageSize = 10, keyword } = params;
      
      let query = 'SELECT * FROM tags WHERE 1=1';
      const values: any[] = [];
      
      if (keyword) {
        query += ' AND name LIKE ?';
        values.push(`%${keyword}%`);
      }
      
      const countQuery = query.replace('*', 'COUNT(*) as count');
      const [countResult] = await pool.execute(countQuery, values);
      const total = (countResult as RowDataPacket[])[0].count || 0;
      
      query += ` ORDER BY name ASC ${buildPaginationSql(page, pageSize)}`;
      
      const [tagsResult] = await pool.execute<RowDataPacket[]>(query, values);
      const list = tagsResult as Tag[];
      
      return {
        list,
        total
      };
    } catch (error) {
      console.error('获取标签列表失败:', error);
      throw new Error('获取标签列表失败');
    }
  },

  /**
   * 创建新标签
   * @param name 标签名称
   * @returns 创建的标签对象
   */
  async createTag(name: string): Promise<Tag> {
    try {
      // 检查名称是否已存在
      const existingTag = await TagModel.getTagByName(name);
      if (existingTag) {
        throw new Error('标签名称已存在');
      }
      
      // 创建标签
      const tagId = await TagModel.createTag(name);
      
      // 获取创建的标签对象
      const createdTag = await TagModel.getTagById(tagId);
      if (!createdTag) {
        throw new Error('创建标签失败');
      }
      
      return createdTag;
    } catch (error) {
      console.error('创建标签失败:', error);
      throw error;
    }
  },

  /**
   * 更新标签
   * @param id 标签 ID
   * @param name 标签名称
   * @returns 更新后的标签对象
   */
  async updateTag(id: number, name: string): Promise<Tag> {
    try {
      // 检查标签是否存在
      const existingTag = await TagModel.getTagById(id);
      if (!existingTag) {
        throw new Error('标签不存在');
      }
      
      // 检查名称是否与其他标签冲突（排除自身）
      const tagWithSameName = await TagModel.getTagByName(name);
      if (tagWithSameName && tagWithSameName.id !== id) {
        throw new Error('标签名称已存在');
      }
      
      // 更新标签
      const success = await TagModel.updateTag(id, name);
      if (!success) {
        throw new Error('更新标签失败');
      }
      
      // 获取更新后的标签对象
      const updatedTag = await TagModel.getTagById(id);
      if (!updatedTag) {
        throw new Error('获取更新后的标签失败');
      }
      
      return updatedTag;
    } catch (error) {
      console.error('更新标签失败:', error);
      throw error;
    }
  },

  /**
   * 删除标签
   * @param id 标签 ID
   */
  async deleteTag(id: number): Promise<void> {
    try {
      // 检查标签是否存在
      const existingTag = await TagModel.getTagById(id);
      if (!existingTag) {
        throw new Error('标签不存在');
      }
      
      // 检查该标签是否被文章使用
      const articleCount = await TagModel.getArticleCountByTagId(id);
      if (articleCount > 0) {
        throw new Error('该标签下存在文章，无法删除');
      }
      
      // 删除标签
      const success = await TagModel.deleteTag(id);
      if (!success) {
        throw new Error('删除标签失败');
      }
    } catch (error) {
      console.error('删除标签失败:', error);
      throw error;
    }
  }
};