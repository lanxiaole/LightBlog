/**
 * 收藏控制器
 * 处理文章收藏相关的HTTP请求
 */
import { Request, Response } from 'express';
import { FavoriteService } from '../services/favoriteService';

/**
 * 收藏文章
 * @param req 请求对象
 * @param res 响应对象
 * @returns 收藏结果和文章信息
 * @status 200 - 收藏成功
 * @status 400 - 无效的文章ID
 * @status 401 - 未授权
 * @status 404 - 文章不存在
 * @status 500 - 服务器内部错误
 */
export async function favoriteArticle(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }

    const articleId = parseInt(req.params.id as string);
    if (isNaN(articleId)) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }

    const result = await FavoriteService.favoriteArticle(userId, articleId);

    res.status(200).json({
      message: '收藏成功',
      ...result
    });
  } catch (error) {
    console.error('收藏失败:', error);
    if (error instanceof Error && error.message === '文章不存在') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 取消收藏文章
 * @param req 请求对象
 * @param res 响应对象
 * @returns 取消收藏结果和文章信息
 * @status 200 - 取消收藏成功
 * @status 400 - 无效的文章ID
 * @status 401 - 未授权
 * @status 404 - 收藏记录不存在
 * @status 500 - 服务器内部错误
 */
export async function unfavoriteArticle(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }

    const articleId = parseInt(req.params.id as string);
    if (isNaN(articleId)) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }

    const result = await FavoriteService.unfavoriteArticle(userId, articleId);

    res.status(200).json({
      message: '取消收藏成功',
      ...result
    });
  } catch (error) {
    console.error('取消收藏失败:', error);
    if (error instanceof Error && error.message === '收藏记录不存在') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取用户的收藏列表
 * @param req 请求对象
 * @param res 响应对象
 * @returns 收藏列表和分页信息
 * @status 200 - 成功
 * @status 401 - 未授权
 * @status 500 - 服务器内部错误
 */
export async function getUserFavorites(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const { list, total } = await FavoriteService.getUserFavorites(userId, page, pageSize);

    res.status(200).json({
      list,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}