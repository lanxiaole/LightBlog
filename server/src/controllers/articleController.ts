/**
 * 文章控制器
 * 处理文章相关的HTTP请求
 */
import { Request, Response } from 'express';
import { ArticleService } from '../services/articleService';
import { LikeService } from '../services/likeService';

/**
 * 创建文章
 * @param req 请求对象
 * @param res 响应对象
 * @returns 无
 * @status 201 - 创建成功
 * @status 400 - 请求参数错误
 * @status 401 - 未授权
 * @status 500 - 服务器内部错误
 */
export async function createArticle(req: Request, res: Response): Promise<void> {
  try {
    const { title, content, cover, category_id, tags } = req.body;
    const authorId = (req as any).user?.id;
    
    if (!authorId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    if (!title || !content) {
      res.status(400).json({ message: '标题和内容不能为空' });
      return;
    }
    
    const articleId = await ArticleService.createArticle({
      title,
      content,
      cover,
      author_id: authorId,
      category_id,
      tags
    });
    
    res.status(201).json({ id: articleId });
  } catch (error) {
    console.error('创建文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取文章列表
 * @param req 请求对象
 * @param res 响应对象
 * @returns 文章列表和分页信息
 * @status 200 - 成功
 * @status 500 - 服务器内部错误
 */
export async function getArticles(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    const { list, total } = await ArticleService.getArticles(page, pageSize);
    
    res.status(200).json({
      list,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取文章详情
 * @param req 请求对象
 * @param res 响应对象
 * @returns 文章详情
 * @status 200 - 成功
 * @status 400 - 无效的文章ID
 * @status 404 - 文章不存在
 * @status 500 - 服务器内部错误
 */
export async function getArticleById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }

    const userId = (req as any).user?.id;
    const article = await ArticleService.getArticleById(id, userId);

    if (!article) {
      res.status(404).json({ message: '文章不存在' });
      return;
    }

    res.status(200).json(article);
  } catch (error) {
    console.error('获取文章详情失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 根据分类获取文章列表
 * @param req 请求对象
 * @param res 响应对象
 * @returns 分类文章列表
 * @status 200 - 成功
 * @status 400 - 分类名称不能为空
 * @status 500 - 服务器内部错误
 */
export async function getArticlesByCategory(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    if (!name) {
      res.status(400).json({ message: '分类名称不能为空' });
      return;
    }
    
    const result = await ArticleService.getArticlesByCategory(name, page, pageSize);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('获取分类文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 根据标签获取文章列表
 * @param req 请求对象
 * @param res 响应对象
 * @returns 标签文章列表
 * @status 200 - 成功
 * @status 400 - 标签名称不能为空
 * @status 500 - 服务器内部错误
 */
export async function getArticlesByTag(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    if (!name) {
      res.status(400).json({ message: '标签名称不能为空' });
      return;
    }
    
    const result = await ArticleService.getArticlesByTag(name, page, pageSize);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('获取标签文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 更新文章
 * @param req 请求对象
 * @param res 响应对象
 * @returns 更新结果
 * @status 200 - 更新成功
 * @status 400 - 无效的文章ID
 * @status 401 - 未授权
 * @status 403 - 无权限修改此文章
 * @status 404 - 文章不存在
 * @status 500 - 服务器内部错误
 */
export async function updateArticle(req: Request, res: Response): Promise<void> {
  try {
    const articleId = parseInt(req.params.id);
    const userId = (req as any).user?.id;
    const { title, content, cover, category_id, tags } = req.body;
    
    if (isNaN(articleId) || articleId <= 0) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const success = await ArticleService.updateArticle(articleId, userId, {
      title,
      content,
      cover,
      category_id,
      tags
    });
    
    if (!success) {
      const article = await ArticleService.getArticleById(articleId);
      if (!article) {
        res.status(404).json({ message: '文章不存在' });
        return;
      }
      res.status(403).json({ message: '无权限修改此文章' });
      return;
    }
    
    res.status(200).json({ message: '更新成功' });
  } catch (error) {
    console.error('更新文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 删除文章
 * @param req 请求对象
 * @param res 响应对象
 * @returns 删除结果
 * @status 200 - 删除成功
 * @status 400 - 无效的文章ID
 * @status 401 - 未授权
 * @status 403 - 无权限删除此文章
 * @status 404 - 文章不存在
 * @status 500 - 服务器内部错误
 */
export async function deleteArticle(req: Request, res: Response): Promise<void> {
  try {
    const articleId = parseInt(req.params.id);
    const userId = (req as any).user?.id;
    
    if (isNaN(articleId) || articleId <= 0) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const success = await ArticleService.deleteArticle(articleId, userId);
    
    if (!success) {
      const article = await ArticleService.getArticleById(articleId);
      if (!article) {
        res.status(404).json({ message: '文章不存在' });
        return;
      }
      res.status(403).json({ message: '无权限删除此文章' });
      return;
    }
    
    res.status(200).json({ message: '删除成功' });
  } catch (error) {
    console.error('删除文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 点赞文章
 * @param req 请求对象
 * @param res 响应对象
 * @returns 点赞状态和数量
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
    } else {
      res.status(500).json({ message: '服务器内部错误' });
    }
  }
}

/**
 * 取消点赞
 * @param req 请求对象
 * @param res 响应对象
 * @returns 点赞状态和数量
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
    } else {
      res.status(500).json({ message: '服务器内部错误' });
    }
  }
}
