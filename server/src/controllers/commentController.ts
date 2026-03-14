import { Request, Response } from 'express';
import { CommentModel } from '../models/Comment';
import { ArticleModel } from '../models/Article';

/**
 * 获取文章评论列表
 * @param req 请求对象
 * @param res 响应对象
 */
export async function getComments(req: Request, res: Response): Promise<void> {
  try {
    // 从路由参数获取 articleId
    const articleId = parseInt(req.params.articleId as string);
    
    // 验证 articleId 是否有效
    if (isNaN(articleId) || articleId <= 0) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }
    
    // 从查询参数获取 page 和 pageSize
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    // 调用模型获取评论列表
    const { list, total } = await CommentModel.getCommentsByArticleId(articleId, page, pageSize);
    
    // 返回 200 状态码和分页数据
    res.status(200).json({
      list,
      total,
      page,
      pageSize
    });
  } catch (error) {
    // 记录错误信息
    console.error('获取评论列表失败:', error);
    // 返回 500 状态码和错误信息
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 创建评论
 * @param req 请求对象
 * @param res 响应对象
 */
export async function createComment(req: Request, res: Response): Promise<void> {
  try {
    // 从 req.user 中获取当前用户 ID
    const userId = (req as any).user?.id;
    
    // 验证 userId 是否存在（确保已通过 auth 中间件）
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 从路由参数获取 articleId
    const articleId = parseInt(req.params.articleId as string);
    
    // 验证 articleId 是否有效
    if (isNaN(articleId) || articleId <= 0) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }
    
    // 从请求体获取 content 和可选的 parent_id
    const { content, parent_id } = req.body;
    
    // 验证 content 不能为空
    if (!content || content.trim() === '') {
      res.status(400).json({ message: '评论内容不能为空' });
      return;
    }
    
    // 如果 parent_id 存在，检查父评论是否属于同一篇文章
    if (parent_id) {
      const parentComment = await CommentModel.getCommentById(parent_id);
      if (!parentComment) {
        res.status(404).json({ message: '父评论不存在' });
        return;
      }
      if (parentComment.article_id !== articleId) {
        res.status(400).json({ message: '父评论不属于当前文章' });
        return;
      }
    }
    
    // 调用模型创建评论
    const commentId = await CommentModel.createComment({
      content,
      article_id: articleId,
      user_id: userId,
      parent_id
    });
    
    // 返回 201 状态码和新评论 id
    res.status(201).json({ id: commentId });
  } catch (error) {
    // 记录错误信息
    console.error('创建评论失败:', error);
    // 返回 500 状态码和错误信息
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 删除评论
 * @param req 请求对象
 * @param res 响应对象
 */
export async function deleteComment(req: Request, res: Response): Promise<void> {
  try {
    // 从路由参数获取评论 id
    const commentId = parseInt(req.params.id as string);
    
    // 验证 commentId 是否有效
    if (isNaN(commentId) || commentId <= 0) {
      res.status(400).json({ message: '无效的评论ID' });
      return;
    }
    
    // 从 req.user 中获取当前用户 ID
    const userId = (req as any).user?.id;
    
    // 验证 userId 是否存在（确保已通过 auth 中间件）
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 调用模型获取评论
    const comment = await CommentModel.getCommentById(commentId);
    
    // 如果评论不存在，返回 404
    if (!comment) {
      res.status(404).json({ message: '评论不存在' });
      return;
    }
    
    // 检查权限：评论作者可删除
    if (comment.user_id !== userId) {
      // 可选：检查文章作者是否可删除
      const article = await ArticleModel.getArticleById(comment.article_id);
      if (!article || article.author_id !== userId) {
        res.status(403).json({ message: '无权限删除此评论' });
        return;
      }
    }
    
    // 调用模型删除评论
    const deleteSuccess = await CommentModel.deleteComment(commentId);
    
    // 如果删除失败，返回 500
    if (!deleteSuccess) {
      res.status(500).json({ message: '删除失败' });
      return;
    }
    
    // 返回 204 状态码（无内容）
    res.status(204).end();
  } catch (error) {
    // 记录错误信息
    console.error('删除评论失败:', error);
    // 返回 500 状态码和错误信息
    res.status(500).json({ message: '服务器内部错误' });
  }
}

export default {
  getComments,
  createComment,
  deleteComment
};