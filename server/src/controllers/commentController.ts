/**
 * 评论控制器
 * 处理评论相关的HTTP请求
 */
import { Request, Response } from 'express';
import { CommentService } from '../services/commentService';

/**
 * 获取文章的评论列表
 * @param req 请求对象
 * @param res 响应对象
 * @returns 评论列表和分页信息
 * @status 200 - 成功
 * @status 400 - 无效的文章ID
 * @status 500 - 服务器内部错误
 */
export async function getComments(req: Request, res: Response): Promise<void> {
  try {
    const articleId = parseInt(req.params.articleId as string);
    
    if (isNaN(articleId) || articleId <= 0) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    const { list, total } = await CommentService.getCommentsByArticleId(articleId, page, pageSize);
    
    res.status(200).json({
      list,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('获取评论列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 创建评论
 * @param req 请求对象
 * @param res 响应对象
 * @returns 新创建的评论ID
 * @status 201 - 创建成功
 * @status 400 - 请求参数错误
 * @status 401 - 未授权
 * @status 500 - 服务器内部错误
 */
export async function createComment(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const articleId = parseInt(req.params.articleId as string);
    
    if (isNaN(articleId) || articleId <= 0) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }
    
    const { content, parent_id } = req.body;
    
    if (!content || content.trim() === '') {
      res.status(400).json({ message: '评论内容不能为空' });
      return;
    }
    
    const commentId = await CommentService.createComment({
      content,
      article_id: articleId,
      user_id: userId,
      parent_id
    });
    
    res.status(201).json({ id: commentId });
  } catch (error) {
    console.error('创建评论失败:', error);
    if (error instanceof Error && 
        (error.message === '父评论不存在' || error.message === '父评论不属于当前文章')) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 删除评论
 * @param req 请求对象
 * @param res 响应对象
 * @returns 无
 * @status 204 - 删除成功
 * @status 400 - 无效的评论ID
 * @status 401 - 未授权
 * @status 403 - 无权限删除此评论
 * @status 404 - 评论不存在
 * @status 500 - 服务器内部错误
 */
export async function deleteComment(req: Request, res: Response): Promise<void> {
  try {
    const commentId = parseInt(req.params.id as string);
    
    if (isNaN(commentId) || commentId <= 0) {
      res.status(400).json({ message: '无效的评论ID' });
      return;
    }
    
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    await CommentService.deleteComment(commentId, userId);
    
    res.status(204).end();
  } catch (error) {
    console.error('删除评论失败:', error);
    if (error instanceof Error && 
        (error.message === '评论不存在' || error.message === '无权限删除此评论')) {
      const status = error.message === '评论不存在' ? 404 : 403;
      res.status(status).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

export default {
  getComments,
  createComment,
  deleteComment
};