/**
 * 分类服务
 * 处理分类相关的业务逻辑
 */
import { CategoryModel } from '../models/Category';

/**
 * 分类服务
 */
export const CategoryService = {
  /**
   * 获取所有分类
   * @returns 分类列表
   */
  async getAllCategories() {
    return await CategoryModel.getAllCategories();
  },

  /**
   * 获取热门分类
   * @param limit 返回数量限制
   * @returns 热门分类列表
   */
  async getHotCategories(limit?: number) {
    return await CategoryModel.getHotCategories(limit);
  }
};