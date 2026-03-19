/**
 * 用户服务
 * 处理用户相关的业务逻辑，如获取用户资料、更新用户信息等
 */
import { UserModel } from '../models/User';
import { ArticleModel } from '../models/Article';
import { FollowModel } from '../models/Follow';
import { Article } from '../models/Article';
import bcrypt from 'bcryptjs';

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
  },

  /**
   * 获取用户列表
   * @param params 查询参数
   * @param params.keyword 搜索关键词（可选），支持按邮箱或用户名模糊搜索
   * @param params.page 页码（可选），默认为 1
   * @param params.pageSize 每页数量（可选），默认为 10，最大 100
   * @returns 用户列表（不包含密码）和总记录数
   * @throws 当查询失败时抛出错误
   */
  async getUsers(params: { keyword?: string; page?: number; pageSize?: number }): Promise<{ list: any[]; total: number }> {
    const result = await UserModel.getUsers(params);
    return {
      list: result.list.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
      })),
      total: result.total
    };
  },

  /**
   * 切换用户状态
   * @param userId 用户 ID
   * @param isActive 是否激活
   * @returns 更新成功返回 true
   * @throws 当用户不存在时抛出错误
   */
  async toggleUserStatus(userId: number, isActive: boolean): Promise<boolean> {
    const user = await UserModel.findUserById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    return await UserModel.toggleUserStatus(userId, isActive);
  },

  /**
   * 修改密码
   * @param userId 用户 ID
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   * @returns 修改成功返回 true
   * @throws 当用户不存在时抛出错误
   * @throws 当旧密码错误时抛出错误
   * @throws 当密码修改失败时抛出错误
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await UserModel.findUserById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('旧密码错误');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const success = await UserModel.updatePassword(userId, hashedPassword);
    if (!success) {
      throw new Error('密码修改失败');
    }

    return true;
  },

  /**
   * 重置用户密码（管理员）
   * @param userId 用户 ID
   * @returns 新生成的明文密码（用于展示给管理员）
   * @throws 当用户不存在时抛出错误
   * @throws 当密码重置失败时抛出错误
   */
  async resetPassword(userId: number): Promise<string> {
    const user = await UserModel.findUserById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let newPassword = '';
    for (let i = 0; i < 8; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const success = await UserModel.updatePassword(userId, hashedPassword);
    if (!success) {
      throw new Error('密码重置失败');
    }

    return newPassword;
  }
};