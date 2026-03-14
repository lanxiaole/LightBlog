import { Request, Response } from 'express';
import { ArticleModel } from '../models/Article';
import { TagModel } from '../models/Tag';

/**
 * 创建新文章
 * @param req 请求对象
 * @param res 响应对象
 */
export async function createArticle(req: Request, res: Response): Promise<void> {
  try {
    // 从请求体获取文章信息
    const { title, content, cover, category_id, tags } = req.body;
    
    // 从 req.user 中获取作者 ID
    const authorId = (req as any).user?.id;
    
    // 验证 author_id 是否存在（确保已通过 auth 中间件）
    if (!authorId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 验证 title 和 content 不能为空
    if (!title || !content) {
      res.status(400).json({ message: '标题和内容不能为空' });
      return;
    }
    
    // 调用模型创建文章
    const articleId = await ArticleModel.createArticle({
      title,
      content,
      cover,
      author_id: authorId,
      category_id
    });
    
    // 如果有 tags 数组，处理标签关联
    if (tags && Array.isArray(tags) && tags.length > 0) {
      // 对每个标签调用 getOrCreateTag 获取标签 id
      const tagIds = await Promise.all(
        tags.map(async (tagName: string) => {
          return await TagModel.getOrCreateTag(tagName);
        })
      );
      
      // 调用 Article 模型的 addArticleTags 关联文章和标签
      await ArticleModel.addArticleTags(articleId, tagIds);
    }
    
    // 返回 201 状态码和新文章 id
    res.status(201).json({ id: articleId });
  } catch (error) {
    // 记录错误信息
    console.error('创建文章失败:', error);
    // 返回 500 状态码和错误信息
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取文章列表（分页）
 * @param req 请求对象
 * @param res 响应对象
 */
export async function getArticles(req: Request, res: Response): Promise<void> {
  try {
    // 从查询参数获取 page 和 pageSize
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    // 调用模型获取分页数据
    const { list, total } = await ArticleModel.getArticles(page, pageSize);
    
    // 返回 200 状态码和分页数据
    res.status(200).json({
      list,
      total,
      page,
      pageSize
    });
  } catch (error) {
    // 记录错误信息
    console.error('获取文章列表失败:', error);
    // 返回 500 状态码和错误信息
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 根据ID获取文章详情
 * @param req 请求对象
 * @param res 响应对象
 */
export async function getArticleById(req: Request, res: Response): Promise<void> {
  try {
    // 从路由参数获取id并转换为数字
    const id = parseInt(req.params.id as string);
    
    // 验证id是否有效
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }
    
    // 调用模型获取文章数据
    const article = await ArticleModel.getArticleById(id);
    
    // 如果文章不存在，返回404
    if (!article) {
      res.status(404).json({ message: '文章不存在' });
      return;
    }
    
    // 返回200和文章对象
    res.status(200).json(article);
  } catch (error) {
    // 记录错误信息
    console.error('获取文章详情失败:', error);
    // 返回500状态码和错误信息
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 根据分类名称获取文章列表
 * @param req 请求对象
 * @param res 响应对象
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
    
    const { list, total } = await ArticleModel.getArticlesByCategory(name, page, pageSize);
    
    res.status(200).json({
      list,
      total,
      page,
      pageSize,
      categoryName: name
    });
  } catch (error) {
    console.error('获取分类文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 根据标签名称获取文章列表
 * @param req 请求对象
 * @param res 响应对象
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
    
    const { list, total } = await ArticleModel.getArticlesByTag(name, page, pageSize);
    
    res.status(200).json({
      list,
      total,
      page,
      pageSize,
      tagName: name
    });
  } catch (error) {
    console.error('获取标签文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

export default {
  createArticle,
  getArticles,
  getArticleById,
  getArticlesByCategory,
  getArticlesByTag
};
