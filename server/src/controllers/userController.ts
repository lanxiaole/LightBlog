import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { ArticleModel } from '../models/Article';
import { FollowModel } from '../models/Follow';

/**
 * 获取用户资料
 * @param req 请求对象
 * @param res 响应对象
 */
export async function getUserProfile(req: Request, res: Response): Promise<void> {
  try {
    // 从路由参数获取用户名
    const { username } = req.params;
    
    // 调用模型方法获取用户信息
    const user = await UserModel.getPublicUserByUsername(username);
    
    // 检查用户是否存在
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    
    // 获取目标用户 ID
    const targetUserId = user.id;
    
    // 获取粉丝数和关注数
    const followersCount = await FollowModel.getFollowersCount(targetUserId);
    const followingCount = await FollowModel.getFollowingCount(targetUserId);
    
    // 构建返回对象
    const userWithFollowInfo = {
      ...user,
      followersCount,
      followingCount
    } as any;
    
    // 如果请求已认证，获取当前用户的关注状态
    const currentUserId = (req as any).user?.id;
    if (currentUserId) {
      const isFollowed = await FollowModel.isFollowing(currentUserId, targetUserId);
      userWithFollowInfo.isFollowed = isFollowed;
    }
    
    // 返回用户信息
    res.status(200).json(userWithFollowInfo);
  } catch (error) {
    console.error('获取用户资料失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取用户文章列表
 * @param req 请求对象
 * @param res 响应对象
 */
export async function getUserArticles(req: Request, res: Response): Promise<void> {
  try {
    // 从路由参数获取用户名
    const { username } = req.params;
    // 从查询参数获取分页信息
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    // 首先获取用户信息，确认用户存在
    const user = await UserModel.getPublicUserByUsername(username);
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    
    // 获取用户文章列表
    const articles = await ArticleModel.getArticlesByUserId(user.id, page, pageSize);
    
    // 返回文章列表
    res.status(200).json(articles);
  } catch (error) {
    console.error('获取用户文章列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 更新用户资料
 * @param req 请求对象
 * @param res 响应对象
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    // 从 req.user 获取当前用户 ID
    const userId = (req as any).user?.id;
    
    // 验证用户 ID 是否存在（确保已通过 auth 中间件）
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 从请求体获取要更新的字段
    const { username, bio, avatar } = req.body;
     
    // 构建更新数据对象
    const updateData: { username?: string; bio?: string; avatar?: string } = {};
    
    if (username !== undefined) {
      // 检查新用户名是否已被其他用户使用
      const existingUser = await UserModel.findUserByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        res.status(400).json({ message: '用户名已被使用' });
        return;
      }
      updateData.username = username;
    }
    
    if (bio !== undefined) {
      updateData.bio = bio;
    }
    
    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }
    
    // 调用模型方法更新用户资料
    const success = await UserModel.updateUserProfile(userId, updateData);
    
    if (success) {
      res.status(200).json({ message: '更新成功' });
    } else {
      res.status(404).json({ message: '用户不存在' });
    }
  } catch (error) {
    console.error('更新用户资料失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}
