import { Request, Response } from 'express';
import { LikeModel } from '../models/Like';
import { ArticleModel } from '../models/Article';

/**
 * 点赞文章
 * @param req 请求对象
 * @param res 响应对象
 */
export async function likeArticle(req: Request, res: Response): Promise<void> {
  try {
    // 从 req.user 获取当前用户 id
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }

    // 从路由参数获取文章 id
    const articleId = parseInt(req.params.id as string);
    if (isNaN(articleId)) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }

    // 检查文章是否存在
    const article = await ArticleModel.getArticleById(articleId);
    if (!article) {
      res.status(404).json({ message: '文章不存在' });
      return;
    }

    // 调用模型插入点赞记录
    await LikeModel.likeArticle(userId, articleId);

    // 获取新的点赞总数
    const likesCount = await LikeModel.getLikesCount(articleId);

    // 返回成功响应
    res.status(200).json({
      message: '点赞成功',
      liked: true,
      likesCount
    });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 取消点赞
 * @param req 请求对象
 * @param res 响应对象
 */
export async function unlikeArticle(req: Request, res: Response): Promise<void> {
  try {
    // 从 req.user 获取当前用户 id
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }

    // 从路由参数获取文章 id
    const articleId = parseInt(req.params.id as string);
    if (isNaN(articleId)) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }

    // 调用模型删除点赞记录
    const success = await LikeModel.unlikeArticle(userId, articleId);

    if (!success) {
      res.status(404).json({ message: '点赞记录不存在' });
      return;
    }

    // 获取新的点赞总数
    const likesCount = await LikeModel.getLikesCount(articleId);

    // 返回成功响应
    res.status(200).json({
      message: '取消点赞成功',
      liked: false,
      likesCount
    });
  } catch (error) {
    console.error('取消点赞失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取点赞状态
 * @param req 请求对象
 * @param res 响应对象
 */
export async function getLikeStatus(req: Request, res: Response): Promise<void> {
  try {
    // 从 req.user 获取当前用户 id（可选，未登录也能查看总数）
    const userId = (req as any).user?.id;

    // 从路由参数获取文章 id
    const articleId = parseInt(req.params.id as string);
    if (isNaN(articleId)) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }

    // 获取点赞总数
    const likesCount = await LikeModel.getLikesCount(articleId);

    // 如果用户已登录，查询是否已点赞
    let liked = false;
    if (userId) {
      liked = await LikeModel.hasUserLiked(userId, articleId);
    }

    // 返回点赞状态
    res.status(200).json({
      liked,
      likesCount
    });
  } catch (error) {
    console.error('获取点赞状态失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}
