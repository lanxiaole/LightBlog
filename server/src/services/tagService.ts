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
  }
};