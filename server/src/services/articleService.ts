/**
 * 文章服务
 * 处理文章相关的业务逻辑
 */
import { ArticleModel } from '../models/Article';
import { TagModel } from '../models/Tag';
import { LikeModel } from '../models/Like';
import { FavoriteModel } from '../models/Favorite';
import { Article } from '../models/Article';

/**
 * 创建文章的输入接口
 */
export interface CreateArticleInput {
  title: string;           // 文章标题
  content: string;         // 文章内容
  cover?: string;          // 文章封面（可选）
  author_id: number;       // 作者ID
  category_id?: number;    // 分类ID（可选）
  tags?: string[];         // 标签数组（可选）
}

/**
 * 更新文章的输入接口
 */
export interface UpdateArticleInput {
  title?: string;          // 文章标题（可选）
  content?: string;        // 文章内容（可选）
  cover?: string;          // 文章封面（可选）
  category_id?: number;    // 分类ID（可选）
  tags?: string[];         // 标签数组（可选）
}

/**
 * 带有状态的文章接口（包含点赞和收藏状态）
 */
export interface ArticleWithStatus extends Article {
  liked?: boolean;           // 用户是否点赞
  likesCount?: number;       // 点赞总数
  favorited?: boolean;       // 用户是否收藏
  favoritesCount?: number;   // 收藏总数
}

/**
 * 文章服务
 */
export const ArticleService = {
  /**
   * 创建新文章
   * @param input 创建文章的输入数据
   * @returns 新创建的文章ID
   */
  async createArticle(input: CreateArticleInput): Promise<number> {
    const { title, content, cover, author_id, category_id, tags } = input;

    const articleId = await ArticleModel.createArticle({
      title,
      content,
      cover,
      author_id,
      category_id
    });

    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagIds = await Promise.all(
        tags.map(async (tagName: string) => {
          return await TagModel.getOrCreateTag(tagName);
        })
      );

      await ArticleModel.addArticleTags(articleId, tagIds);
    }

    return articleId;
  },

  /**
   * 获取文章列表（分页）
   * @param page 页码，默认1
   * @param pageSize 每页数量，默认10
   * @returns 文章列表和总记录数
   */
  async getArticles(page: number = 1, pageSize: number = 10): Promise<{ list: Article[]; total: number }> {
    return await ArticleModel.getArticles(page, pageSize);
  },

  /**
   * 根据ID获取文章详情
   * @param id 文章ID
   * @param userId 当前用户ID（可选，用于获取点赞和收藏状态）
   * @returns 文章详情（包含点赞和收藏状态）
   */
  async getArticleById(id: number, userId?: number): Promise<ArticleWithStatus | null> {
    const article = await ArticleModel.getArticleById(id);

    if (!article) {
      return null;
    }

    const likesCount = await LikeModel.getLikesCount(id);
    const favoritesCount = await FavoriteModel.getFavoritesCount(id);

    let liked = false;
    let favorited = false;

    if (userId) {
      liked = await LikeModel.hasUserLiked(userId, id);
      favorited = await FavoriteModel.hasUserFavorited(userId, id);
    }

    return {
      ...article,
      liked,
      likesCount,
      favorited,
      favoritesCount
    };
  },

  /**
   * 根据分类名称获取文章列表
   * @param name 分类名称
   * @param page 页码，默认1
   * @param pageSize 每页数量，默认10
   * @returns 文章列表、总记录数和分类名称
   */
  async getArticlesByCategory(name: string, page: number = 1, pageSize: number = 10): Promise<{ list: Article[]; total: number; categoryName: string }> {
    const result = await ArticleModel.getArticlesByCategory(name, page, pageSize);
    return {
      ...result,
      categoryName: name
    };
  },

  /**
   * 根据标签名称获取文章列表
   * @param name 标签名称
   * @param page 页码，默认1
   * @param pageSize 每页数量，默认10
   * @returns 文章列表、总记录数和标签名称
   */
  async getArticlesByTag(name: string, page: number = 1, pageSize: number = 10): Promise<{ list: Article[]; total: number; tagName: string }> {
    const result = await ArticleModel.getArticlesByTag(name, page, pageSize);
    return {
      ...result,
      tagName: name
    };
  },

  /**
   * 更新文章
   * @param id 文章ID
   * @param userId 当前用户ID（用于权限验证）
   * @param userRole 当前用户角色（用于权限验证）
   * @param input 更新文章的输入数据
   * @returns 更新是否成功
   */
  async updateArticle(id: number, userId: number, userRole: string | undefined, input: UpdateArticleInput): Promise<boolean> {
    const { title, content, cover, category_id, tags } = input;

    const article = await ArticleModel.getArticleById(id);

    if (!article) {
      return false;
    }

    if (article.author_id !== userId && userRole !== 'admin') {
      return false;
    }

    const updateSuccess = await ArticleModel.updateArticle(id, {
      title,
      content,
      cover,
      category_id
    });

    if (!updateSuccess) {
      return false;
    }

    if (tags && Array.isArray(tags)) {
      await ArticleModel.removeArticleTags(id);

      const tagIds = await Promise.all(
        tags.map(async (tagName: string) => {
          return await TagModel.getOrCreateTag(tagName);
        })
      );

      await ArticleModel.addArticleTags(id, tagIds);
    }

    return true;
  },

  /**
   * 删除文章
   * @param id 文章ID
   * @param userId 当前用户ID（用于权限验证）
   * @param userRole 当前用户角色（用于权限验证）
   * @returns 删除是否成功
   */
  async deleteArticle(id: number, userId: number, userRole: string | undefined): Promise<boolean> {
    const article = await ArticleModel.getArticleById(id);

    if (!article) {
      return false;
    }

    if (article.author_id !== userId && userRole !== 'admin') {
      return false;
    }

    return await ArticleModel.deleteArticle(id);
  },

  /**
   * 根据用户ID获取文章列表
   * @param userId 用户ID
   * @param page 页码，默认1
   * @param pageSize 每页数量，默认10
   * @returns 文章列表和总记录数
   */
  async getArticlesByUserId(userId: number, page: number = 1, pageSize: number = 10): Promise<{ list: Article[]; total: number }> {
    return await ArticleModel.getArticlesByUserId(userId, page, pageSize);
  },

  /**
   * 搜索文章
   * @param keyword 搜索关键词
   * @param page 页码，默认1
   * @param pageSize 每页数量，默认10
   * @returns 搜索结果（文章列表和总记录数）
   */
  async searchArticles(keyword: string, page: number = 1, pageSize: number = 10): Promise<{ list: Article[]; total: number }> {
    return await ArticleModel.searchArticles(keyword, page, pageSize);
  },

  /**
   * 增加文章浏览量
   * @param id 文章ID
   * @returns 是否更新成功
   */
  async incrementViews(id: number): Promise<boolean> {
    return await ArticleModel.incrementViews(id);
  },

  /**
   * 获取热门文章列表
   * @param limit 返回数量限制，默认 10
   * @returns 热门文章列表
   */
  async getHotArticles(limit: number = 10): Promise<Article[]> {
    return await ArticleModel.getHotArticles(limit);
  }


};