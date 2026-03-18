/**
 * 点赞服务
 * 处理文章点赞相关的业务逻辑
 */
import { LikeModel } from '../models/Like';
import { ArticleModel } from '../models/Article';
import { NotificationModel } from '../models/Notification';

/**
 * 点赞服务
 */
export const LikeService = {
  /**
   * 点赞文章
   * @param userId 用户ID
   * @param articleId 文章ID
   * @returns 点赞状态和点赞数量
   * @throws 当文章不存在时抛出错误
   */
  async likeArticle(userId: number, articleId: number): Promise<{ liked: boolean; likesCount: number }> {
    const article = await ArticleModel.getArticleById(articleId);
    if (!article) {
      throw new Error('文章不存在');
    }

    await LikeModel.likeArticle(userId, articleId);

    if (userId !== article.author_id) {
      NotificationModel.createNotification({
        type: 'like',
        sender_id: userId,
        receiver_id: article.author_id,
        article_id: articleId
      }).catch(error => {
        console.error('创建点赞通知失败:', error);
      });
    }

    const likesCount = await LikeModel.getLikesCount(articleId);

    return {
      liked: true,
      likesCount
    };
  },

  /**
   * 取消点赞
   * @param userId 用户ID
   * @param articleId 文章ID
   * @returns 点赞状态和点赞数量
   * @throws 当点赞记录不存在时抛出错误
   */
  async unlikeArticle(userId: number, articleId: number): Promise<{ liked: boolean; likesCount: number }> {
    const success = await LikeModel.unlikeArticle(userId, articleId);

    if (!success) {
      throw new Error('点赞记录不存在');
    }

    const likesCount = await LikeModel.getLikesCount(articleId);

    return {
      liked: false,
      likesCount
    };
  },

  /**
   * 获取点赞状态
   * @param userId 用户ID（可选）
   * @param articleId 文章ID
   * @returns 点赞状态和点赞数量
   */
  async getLikeStatus(userId: number | undefined, articleId: number): Promise<{ liked: boolean; likesCount: number }> {
    const likesCount = await LikeModel.getLikesCount(articleId);

    let liked = false;
    if (userId) {
      liked = await LikeModel.hasUserLiked(userId, articleId);
    }

    return {
      liked,
      likesCount
    };
  }
};