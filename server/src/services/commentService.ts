/**
 * 评论服务
 * 处理评论相关的业务逻辑，如创建评论、删除评论等
 */
import { CommentModel } from '../models/Comment';
import { ArticleModel } from '../models/Article';
import { NotificationModel } from '../models/Notification';

/**
 * 创建评论的输入接口
 */
export interface CreateCommentInput {
  content: string;       // 评论内容
  article_id: number;    // 文章ID
  user_id: number;       // 用户ID
  parent_id?: number;    // 父评论ID（可选，用于回复）
}

/**
 * 评论服务
 */
export const CommentService = {
  /**
   * 根据文章ID获取评论列表
   * @param articleId 文章ID
   * @param page 页码，默认1
   * @param pageSize 每页数量，默认10
   * @returns 评论列表
   */
  async getCommentsByArticleId(articleId: number, page: number = 1, pageSize: number = 10) {
    return await CommentModel.getCommentsByArticleId(articleId, page, pageSize);
  },

  /**
   * 创建评论
   * @param input 创建评论的输入数据
   * @returns 新创建的评论ID
   * @throws 当父评论不存在时抛出错误
   * @throws 当父评论不属于当前文章时抛出错误
   */
  async createComment(input: CreateCommentInput): Promise<number> {
    const { content, article_id, user_id, parent_id } = input;

    if (parent_id) {
      const parentComment = await CommentModel.getCommentById(parent_id);
      if (!parentComment) {
        throw new Error('父评论不存在');
      }
      if (parentComment.article_id !== article_id) {
        throw new Error('父评论不属于当前文章');
      }
    }

    const commentId = await CommentModel.createComment({
      content,
      article_id,
      user_id,
      parent_id
    });

    const article = await ArticleModel.getArticleById(article_id);
    if (article) {
      if (user_id !== article.author_id) {
        NotificationModel.createNotification({
          type: 'comment',
          sender_id: user_id,
          receiver_id: article.author_id,
          article_id: article_id,
          comment_id: commentId
        }).catch(error => {
          console.error('创建评论通知失败:', error);
        });
      }

      if (parent_id) {
        const parentComment = await CommentModel.getCommentById(parent_id);
        if (parentComment && parentComment.user_id !== user_id) {
          NotificationModel.createNotification({
            type: 'reply',
            sender_id: user_id,
            receiver_id: parentComment.user_id,
            article_id: article_id,
            comment_id: commentId
          }).catch(error => {
            console.error('创建回复通知失败:', error);
          });
        }
      }
    }

    return commentId;
  },

  /**
   * 删除评论
   * @param commentId 评论ID
   * @param userId 当前用户ID（用于权限验证）
   * @returns 删除是否成功
   * @throws 当评论不存在时抛出错误
   * @throws 当无权限删除此评论时抛出错误
   */
  async deleteComment(commentId: number, userId: number): Promise<boolean> {
    const comment = await CommentModel.getCommentById(commentId);

    if (!comment) {
      throw new Error('评论不存在');
    }

    if (comment.user_id !== userId) {
      const article = await ArticleModel.getArticleById(comment.article_id);
      if (!article || article.author_id !== userId) {
        throw new Error('无权限删除此评论');
      }
    }

    return await CommentModel.deleteComment(commentId);
  }
};