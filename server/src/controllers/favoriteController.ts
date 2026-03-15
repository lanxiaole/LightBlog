import { Request, Response } from 'express';
import { FavoriteModel } from '../models/Favorite';
import { ArticleModel } from '../models/Article';

/**
 * 收藏文章
 * @param req 请求对象
 * @param res 响应对象
 */
export async function favoriteArticle(req: Request, res: Response): Promise<void> {
  try {
    // 从 req.user 获取当前用户 id
    const userId = req.user?.id;
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

    // 调用模型插入收藏记录
    await FavoriteModel.favoriteArticle(userId, articleId);

    // 获取新的收藏总数
    const favoritesCount = await FavoriteModel.getFavoritesCount(articleId);

    // 返回成功响应
    res.status(200).json({
      message: '收藏成功',
      favorited: true,
      favoritesCount
    });
  } catch (error) {
    console.error('收藏失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 取消收藏
 * @param req 请求对象
 * @param res 响应对象
 */
export async function unfavoriteArticle(req: Request, res: Response): Promise<void> {
  try {
    // 从 req.user 获取当前用户 id
    const userId = req.user?.id;
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

    // 调用模型删除收藏记录
    const success = await FavoriteModel.unfavoriteArticle(userId, articleId);

    if (!success) {
      res.status(404).json({ message: '收藏记录不存在' });
      return;
    }

    // 获取新的收藏总数
    const favoritesCount = await FavoriteModel.getFavoritesCount(articleId);

    // 返回成功响应
    res.status(200).json({
      message: '取消收藏成功',
      favorited: false,
      favoritesCount
    });
  } catch (error) {
    console.error('取消收藏失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取用户收藏列表
 * @param req 请求对象
 * @param res 响应对象
 */
export async function getUserFavorites(req: Request, res: Response): Promise<void> {
  try {
    // 从 req.user 获取当前用户 id
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }

    // 从查询参数获取 page/pageSize（默认 1, 10）
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    // 调用模型获取收藏文章列表
    const { list, total } = await FavoriteModel.getUserFavorites(userId, page, pageSize);

    // 返回成功响应
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