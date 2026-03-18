/**
 * 搜索控制器
 * 处理搜索相关的HTTP请求
 */
import { Request, Response } from 'express';
import { SearchService } from '../services/searchService';

export const searchController = {
  /**
   * 搜索文章
   * @param req 请求对象
   * @param res 响应对象
   * @returns 搜索结果列表和分页信息
   * @status 200 - 成功
   * @status 400 - 搜索关键词不能为空
   * @status 500 - 服务器内部错误
   */
  async searchArticles(req: Request, res: Response): Promise<void> {
    try {
      const { keyword, page = 1, pageSize = 10 } = req.query;

      if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
        res.status(400).json({ message: '搜索关键词不能为空' });
        return;
      }

      const result = await SearchService.searchArticles(
        keyword as string,
        Number(page),
        Number(pageSize)
      );

      res.status(200).json({
        list: result.list,
        total: result.total,
        page: Number(page),
        pageSize: Number(pageSize)
      });
    } catch (error) {
      console.error('搜索文章失败:', error);
      if (error instanceof Error && error.message === '搜索关键词不能为空') {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: '服务器内部错误' });
    }
  }
};
