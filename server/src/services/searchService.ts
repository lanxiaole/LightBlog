/**
 * 搜索服务
 * 处理搜索相关的业务逻辑
 */
import { ArticleModel } from '../models/Article';

/**
 * 搜索服务
 */
export const SearchService = {
  /**
   * 搜索文章
   * @param keyword 搜索关键词
   * @param page 页码，默认1
   * @param pageSize 每页数量，默认10
   * @returns 搜索结果（文章列表和总记录数）
   * @throws 当搜索关键词为空时抛出错误
   */
  async searchArticles(keyword: string, page: number = 1, pageSize: number = 10) {
    if (!keyword || keyword.trim() === '') {
      throw new Error('搜索关键词不能为空');
    }

    return await ArticleModel.searchArticles(keyword, page, pageSize);
  }
};