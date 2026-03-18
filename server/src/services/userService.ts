/**
 * 用户服务
 * 处理用户相关的业务逻辑，如获取用户资料、更新用户信息等
 */
import { UserModel } from '../models/User';
import { ArticleModel } from '../models/Article';
import { FollowModel } from '../models/Follow';
import { Article } from '../models/Article';

/**
 * 更新用户资料的输入接口
 */
export interface UpdateProfileInput {
  username?: string;  // 用户名（可选）
  bio?: string;       // 个人简介（可选）
  avatar?: string;    // 头像（可选）
}

/**
 * 用户资料接口
 */
export interface UserProfile {
  id: number;                // 用户ID
  email: string;             // 邮箱地址
  username: string;          // 用户名
  avatar: string | null;     // 头像
  bio: string | null;        // 个人简介
  created_at: Date;          // 创建时间
  updated_at: Date;          // 更新时间
  followersCount?: number;   // 粉丝数量
  followingCount?: number;   // 关注数量
  isFollowed?: boolean;      // 当前用户是否关注该用户
}

/**
 * 用户服务
 */
export const UserService = {
  /**
   * 获取用户资料
   * @param username 用户名
   * @param currentUserId 当前用户ID（可选，用于获取关注状态）
   * @returns 用户资料
   */
  async getUserProfile(username: string, currentUserId?: number): Promise<UserProfile | null> {
    const user = await UserModel.getPublicUserByUsername(username);

    if (!user) {
      return null;
    }

    const targetUserId = user.id;
    const followersCount = await FollowModel.getFollowersCount(targetUserId);
    const followingCount = await FollowModel.getFollowingCount(targetUserId);

    const userProfile: UserProfile = {
      ...user,
      followersCount,
      followingCount
    };

    if (currentUserId) {
      const isFollowed = await FollowModel.isFollowing(currentUserId, targetUserId);
      userProfile.isFollowed = isFollowed;
    }

    return userProfile;
  },

  /**
   * 获取用户的文章列表
   * @param username 用户名
   * @param page 页码，默认1
   * @param pageSize 每页数量，默认10
   * @returns 文章列表和总记录数
   * @throws 当用户不存在时抛出错误
   */
  async getUserArticles(username: string, page: number = 1, pageSize: number = 10): Promise<{ list: Article[]; total: number }> {
    const user = await UserModel.getPublicUserByUsername(username);

    if (!user) {
      throw new Error('用户不存在');
    }

    return await ArticleModel.getArticlesByUserId(user.id, page, pageSize);
  },

  /**
   * 更新用户资料
   * @param userId 用户ID
   * @param input 更新资料的输入数据
   * @returns 更新是否成功
   * @throws 当用户名已被使用时抛出错误
   */
  async updateProfile(userId: number, input: UpdateProfileInput): Promise<boolean> {
    const { username, bio, avatar } = input;

    const updateData: UpdateProfileInput = {};

    if (username !== undefined) {
      const existingUser = await UserModel.findUserByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('用户名已被使用');
      }
      updateData.username = username;
    }

    if (bio !== undefined) {
      updateData.bio = bio;
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    return await UserModel.updateUserProfile(userId, updateData);
  }
};