/**
 * 标签服务
 * 处理标签相关的业务逻辑
 */
import { TagModel } from '../models/Tag';

/**
 * 标签服务
 */
export const TagService = {
  /**
   * 获取所有标签
   * @returns 标签列表
   */
  async getAllTags() {
    return await TagModel.getAllTags();
  },

  /**
   * 获取热门标签
   * @param limit 返回数量限制
   * @returns 热门标签列表
   */
  async getHotTags(limit?: number) {
    return await TagModel.getHotTags(limit);
  }
};