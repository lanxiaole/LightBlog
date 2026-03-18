/**
 * 关注控制器
 * 处理用户关注相关的HTTP请求
 */
import { Request, Response } from 'express';
import { FollowService } from '../services/followService';

/**
 * 关注用户
 * @param req 请求对象
 * @param res 响应对象
 * @returns 关注结果和被关注用户信息
 * @status 201 - 关注成功
 * @status 400 - 请求参数错误或不能关注自己
 * @status 401 - 未授权
 * @status 404 - 被关注者不存在
 * @status 500 - 服务器内部错误
 */
export async function follow(req: Request, res: Response): Promise<void> {
  try {
    const followerId = (req as any).user?.id;
    
    if (!followerId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { userId } = req.params;
    const followingId = parseInt(userId);
    
    if (isNaN(followingId)) {
      res.status(400).json({ message: '无效的用户 ID' });
      return;
    }
    
    const result = await FollowService.follow(followerId, followingId);
    
    res.status(201).json({
      message: '关注成功',
      ...result
    });
  } catch (error) {
    console.error('关注用户失败:', error);
    if (error instanceof Error && 
        (error.message === '不能关注自己' || error.message === '被关注者不存在')) {
      const status = error.message === '被关注者不存在' ? 404 : 400;
      res.status(status).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 取消关注用户
 * @param req 请求对象
 * @param res 响应对象
 * @returns 取消关注结果和被关注用户信息
 * @status 200 - 取消关注成功
 * @status 400 - 无效的用户 ID
 * @status 401 - 未授权
 * @status 404 - 被关注者不存在或关注记录不存在
 * @status 500 - 服务器内部错误
 */
export async function unfollow(req: Request, res: Response): Promise<void> {
  try {
    const followerId = (req as any).user?.id;
    
    if (!followerId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { userId } = req.params;
    const followingId = parseInt(userId);
    
    if (isNaN(followingId)) {
      res.status(400).json({ message: '无效的用户 ID' });
      return;
    }
    
    const result = await FollowService.unfollow(followerId, followingId);
    
    res.status(200).json({
      message: '取消关注成功',
      ...result
    });
  } catch (error) {
    console.error('取消关注用户失败:', error);
    if (error instanceof Error && 
        (error.message === '被关注者不存在' || error.message === '关注记录不存在')) {
      const status = error.message === '被关注者不存在' ? 404 : 404;
      res.status(status).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取用户的粉丝列表
 * @param req 请求对象
 * @param res 响应对象
 * @returns 粉丝列表和分页信息
 * @status 200 - 成功
 * @status 400 - 无效的用户 ID
 * @status 404 - 用户不存在
 * @status 500 - 服务器内部错误
 */
export async function getFollowers(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const targetUserId = parseInt(userId);
    
    if (isNaN(targetUserId)) {
      res.status(400).json({ message: '无效的用户 ID' });
      return;
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    const { list, total } = await FollowService.getFollowers(targetUserId, page, pageSize);
    
    res.status(200).json({
      list,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('获取粉丝列表失败:', error);
    if (error instanceof Error && error.message === '用户不存在') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取用户的关注列表
 * @param req 请求对象
 * @param res 响应对象
 * @returns 关注列表和分页信息
 * @status 200 - 成功
 * @status 400 - 无效的用户 ID
 * @status 404 - 用户不存在
 * @status 500 - 服务器内部错误
 */
export async function getFollowing(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const targetUserId = parseInt(userId);
    
    if (isNaN(targetUserId)) {
      res.status(400).json({ message: '无效的用户 ID' });
      return;
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    const { list, total } = await FollowService.getFollowing(targetUserId, page, pageSize);
    
    res.status(200).json({
      list,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('获取关注列表失败:', error);
    if (error instanceof Error && error.message === '用户不存在') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取关注状态
 * @param req 请求对象
 * @param res 响应对象
 * @returns 关注状态
 * @status 200 - 成功
 * @status 400 - 无效的用户 ID
 * @status 401 - 未授权
 * @status 404 - 目标用户不存在
 * @status 500 - 服务器内部错误
 */
export async function getFollowStatus(req: Request, res: Response): Promise<void> {
  try {
    const currentUserId = (req as any).user?.id;
    
    if (!currentUserId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { userId } = req.params;
    const targetUserId = parseInt(userId);
    
    if (isNaN(targetUserId)) {
      res.status(400).json({ message: '无效的用户 ID' });
      return;
    }
    
    const isFollowing = await FollowService.isFollowing(currentUserId, targetUserId);
    
    res.status(200).json({ isFollowing });
  } catch (error) {
    console.error('获取关注状态失败:', error);
    if (error instanceof Error && error.message === '目标用户不存在') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}
