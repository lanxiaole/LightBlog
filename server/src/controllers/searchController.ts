import { Request, Response } from 'express';
import { ArticleModel } from '../models/Article';

/**
 * 搜索控制器
 */
export const searchController = {
  /**
   * 搜索文章
   * @param req 请求对象
   * @param res 响应对象
   */
  async searchArticles(req: Request, res: Response): Promise<void> {
    try {
      // 从查询参数获取搜索关键词和分页参数
      const { keyword, page = 1, pageSize = 10 } = req.query;

      // 验证关键词是否为空
      if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
        res.status(400).json({ message: '搜索关键词不能为空' });
        return;
      }

      // 调用模型方法搜索文章
      const result = await ArticleModel.searchArticles(
        keyword as string,
        Number(page),
        Number(pageSize)
      );

      // 返回搜索结果
      res.status(200).json({
        list: result.list,
        total: result.total,
        page: Number(page),
        pageSize: Number(pageSize)
      });
    } catch (error) {
      console.error('搜索文章失败:', error);
      res.status(500).json({ message: '服务器内部错误' });
    }
  }
};
