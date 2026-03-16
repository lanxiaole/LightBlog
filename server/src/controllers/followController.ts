import { Request, Response } from 'express';
import { FollowModel } from '../models/Follow';
import { UserModel } from '../models/User';

/**
 * 关注用户
 * @param req 请求对象
 * @param res 响应对象
 */
export async function follow(req: Request, res: Response): Promise<void> {
  try {
    // 从 req.user 获取当前用户 ID（关注者）
    const followerId = (req as any).user?.id;
    
    // 验证用户是否已登录
    if (!followerId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 从路由参数获取被关注者 ID
    const { userId } = req.params;
    const followingId = parseInt(userId);
    
    // 验证被关注者 ID 是否有效
    if (isNaN(followingId)) {
      res.status(400).json({ message: '无效的用户 ID' });
      return;
    }
    
    // 不能关注自己
    if (followerId === followingId) {
      res.status(400).json({ message: '不能关注自己' });
      return;
    }
    
    // 检查被关注者是否存在
    const followingUser = await UserModel.findUserById(followingId);
    if (!followingUser) {
      res.status(404).json({ message: '被关注者不存在' });
      return;
    }
    
    // 调用模型方法关注用户
    const success = await FollowModel.follow(followerId, followingId);
    
    if (success) {
      // 获取新的关注数
      const followingCount = await FollowModel.getFollowingCount(followerId);
      const followersCount = await FollowModel.getFollowersCount(followingId);
      
      res.status(201).json({
        message: '关注成功',
        followingCount,
        followersCount
      });
    } else {
      res.status(500).json({ message: '关注失败' });
    }
  } catch (error) {
    console.error('关注用户失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 取消关注用户
 * @param req 请求对象
 * @param res 响应对象
 */
export async function unfollow(req: Request, res: Response): Promise<void> {
  try {
    // 从 req.user 获取当前用户 ID（关注者）
    const followerId = (req as any).user?.id;
    
    // 验证用户是否已登录
    if (!followerId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 从路由参数获取被关注者 ID
    const { userId } = req.params;
    const followingId = parseInt(userId);
    
    // 验证被关注者 ID 是否有效
    if (isNaN(followingId)) {
      res.status(400).json({ message: '无效的用户 ID' });
      return;
    }
    
    // 检查被关注者是否存在
    const followingUser = await UserModel.findUserById(followingId);
    if (!followingUser) {
      res.status(404).json({ message: '被关注者不存在' });
      return;
    }
    
    // 调用模型方法取消关注用户
    const success = await FollowModel.unfollow(followerId, followingId);
    
    if (success) {
      // 获取新的关注数
      const followingCount = await FollowModel.getFollowingCount(followerId);
      const followersCount = await FollowModel.getFollowersCount(followingId);
      
      res.status(200).json({
        message: '取消关注成功',
        followingCount,
        followersCount
      });
    } else {
      res.status(404).json({ message: '关注记录不存在' });
    }
  } catch (error) {
    console.error('取消关注用户失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取用户的粉丝列表
 * @param req 请求对象
 * @param res 响应对象
 */
export async function getFollowers(req: Request, res: Response): Promise<void> {
  try {
    // 从路由参数获取用户 ID
    const { userId } = req.params;
    const targetUserId = parseInt(userId);
    
    // 验证用户 ID 是否有效
    if (isNaN(targetUserId)) {
      res.status(400).json({ message: '无效的用户 ID' });
      return;
    }
    
    // 检查用户是否存在
    const user = await UserModel.findUserById(targetUserId);
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    
    // 从查询参数获取分页信息
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    // 调用模型方法获取粉丝列表
    const { list, total } = await FollowModel.getFollowers(targetUserId, page, pageSize);
    
    // 返回粉丝列表
    res.status(200).json({
      list,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('获取粉丝列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取用户的关注列表
 * @param req 请求对象
 * @param res 响应对象
 */
export async function getFollowing(req: Request, res: Response): Promise<void> {
  try {
    // 从路由参数获取用户 ID
    const { userId } = req.params;
    const targetUserId = parseInt(userId);
    
    // 验证用户 ID 是否有效
    if (isNaN(targetUserId)) {
      res.status(400).json({ message: '无效的用户 ID' });
      return;
    }
    
    // 检查用户是否存在
    const user = await UserModel.findUserById(targetUserId);
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    
    // 从查询参数获取分页信息
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    // 调用模型方法获取关注列表
    const { list, total } = await FollowModel.getFollowing(targetUserId, page, pageSize);
    
    // 返回关注列表
    res.status(200).json({
      list,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('获取关注列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取关注状态
 * @param req 请求对象
 * @param res 响应对象
 */
export async function getFollowStatus(req: Request, res: Response): Promise<void> {
  try {
    // 从 req.user 获取当前用户 ID
    const currentUserId = (req as any).user?.id;
    
    // 验证用户是否已登录
    if (!currentUserId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 从路由参数获取目标用户 ID
    const { userId } = req.params;
    const targetUserId = parseInt(userId);
    
    // 验证目标用户 ID 是否有效
    if (isNaN(targetUserId)) {
      res.status(400).json({ message: '无效的用户 ID' });
      return;
    }
    
    // 检查目标用户是否存在
    const targetUser = await UserModel.findUserById(targetUserId);
    if (!targetUser) {
      res.status(404).json({ message: '目标用户不存在' });
      return;
    }
    
    // 调用模型方法检查关注状态
    const isFollowing = await FollowModel.isFollowing(currentUserId, targetUserId);
    
    // 返回关注状态
    res.status(200).json({ isFollowing });
  } catch (error) {
    console.error('获取关注状态失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}
