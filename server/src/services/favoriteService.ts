/**
 * 收藏服务
 * 处理文章收藏相关的业务逻辑
 */
import { FavoriteModel } from '../models/Favorite';
import { ArticleModel } from '../models/Article';
import { NotificationModel } from '../models/Notification';

/**
 * 收藏服务
 */
export const FavoriteService = {
  /**
   * 收藏文章
   * @param userId 用户ID
   * @param articleId 文章ID
   * @returns 收藏状态和收藏数量
   * @throws 当文章不存在时抛出错误
   */
  async favoriteArticle(userId: number, articleId: number): Promise<{ favorited: boolean; favoritesCount: number }> {
    const article = await ArticleModel.getArticleById(articleId);
    if (!article) {
      throw new Error('文章不存在');
    }

    await FavoriteModel.favoriteArticle(userId, articleId);

    if (userId !== article.author_id) {
      NotificationModel.createNotification({
        type: 'favorite',
        sender_id: userId,
        receiver_id: article.author_id,
        article_id: articleId
      }).catch(error => {
        console.error('创建收藏通知失败:', error);
      });
    }

    const favoritesCount = await FavoriteModel.getFavoritesCount(articleId);

    return {
      favorited: true,
      favoritesCount
    };
  },

  /**
   * 取消收藏
   * @param userId 用户ID
   * @param articleId 文章ID
   * @returns 收藏状态和收藏数量
   * @throws 当收藏记录不存在时抛出错误
   */
  async unfavoriteArticle(userId: number, articleId: number): Promise<{ favorited: boolean; favoritesCount: number }> {
    const success = await FavoriteModel.unfavoriteArticle(userId, articleId);

    if (!success) {
      throw new Error('收藏记录不存在');
    }

    const favoritesCount = await FavoriteModel.getFavoritesCount(articleId);

    return {
      favorited: false,
      favoritesCount
    };
  },

  /**
   * 获取用户的收藏列表
   * @param userId 用户ID
   * @param page 页码，默认1
   * @param pageSize 每页数量，默认10
   * @returns 收藏的文章列表
   */
  async getUserFavorites(userId: number, page: number = 1, pageSize: number = 10) {
    return await FavoriteModel.getUserFavorites(userId, page, pageSize);
  }
};