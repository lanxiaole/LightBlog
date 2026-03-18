/**
 * 点赞控制器
 * 处理文章点赞相关的HTTP请求
 */
import { Request, Response } from 'express';
import { LikeService } from '../services/likeService';

/**
 * 点赞文章
 * @param req 请求对象
 * @param res 响应对象
 * @returns 点赞结果和文章信息
 * @status 200 - 点赞成功
 * @status 400 - 无效的文章ID
 * @status 401 - 未授权
 * @status 404 - 文章不存在
 * @status 500 - 服务器内部错误
 */
export async function likeArticle(req: Request, res: Response): Promise<void> {
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

    const result = await LikeService.likeArticle(userId, articleId);

    res.status(200).json({
      message: '点赞成功',
      ...result
    });
  } catch (error) {
    console.error('点赞失败:', error);
    if (error instanceof Error && error.message === '文章不存在') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 取消点赞文章
 * @param req 请求对象
 * @param res 响应对象
 * @returns 取消点赞结果和文章信息
 * @status 200 - 取消点赞成功
 * @status 400 - 无效的文章ID
 * @status 401 - 未授权
 * @status 404 - 点赞记录不存在
 * @status 500 - 服务器内部错误
 */
export async function unlikeArticle(req: Request, res: Response): Promise<void> {
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

    const result = await LikeService.unlikeArticle(userId, articleId);

    res.status(200).json({
      message: '取消点赞成功',
      ...result
    });
  } catch (error) {
    console.error('取消点赞失败:', error);
    if (error instanceof Error && error.message === '点赞记录不存在') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取点赞状态
 * @param req 请求对象
 * @param res 响应对象
 * @returns 点赞状态和文章点赞数
 * @status 200 - 成功
 * @status 400 - 无效的文章ID
 * @status 500 - 服务器内部错误
 */
export async function getLikeStatus(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;

    const articleId = parseInt(req.params.id as string);
    if (isNaN(articleId)) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }

    const result = await LikeService.getLikeStatus(userId, articleId);

    res.status(200).json(result);
  } catch (error) {
    console.error('获取点赞状态失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}
