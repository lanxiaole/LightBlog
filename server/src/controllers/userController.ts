/**
 * 用户控制器
 * 处理用户相关的HTTP请求
 */
import { Request, Response } from 'express';
import { UserService } from '../services/userService';

/**
 * 获取用户资料
 * @param req 请求对象
 * @param res 响应对象
 * @returns 用户资料
 * @status 200 - 成功
 * @status 404 - 用户不存在
 * @status 500 - 服务器内部错误
 */
export async function getUserProfile(req: Request, res: Response): Promise<void> {
  try {
    const { username } = req.params;
    const currentUserId = (req as any).user?.id;
    
    const user = await UserService.getUserProfile(username, currentUserId);
    
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('获取用户资料失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取用户的文章列表
 * @param req 请求对象
 * @param res 响应对象
 * @returns 用户文章列表
 * @status 200 - 成功
 * @status 404 - 用户不存在
 * @status 500 - 服务器内部错误
 */
export async function getUserArticles(req: Request, res: Response): Promise<void> {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    const articles = await UserService.getUserArticles(username, page, pageSize);
    
    res.status(200).json(articles);
  } catch (error) {
    console.error('获取用户文章列表失败:', error);
    if (error instanceof Error && error.message === '用户不存在') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 更新用户资料
 * @param req 请求对象
 * @param res 响应对象
 * @returns 更新结果
 * @status 200 - 更新成功
 * @status 400 - 用户名已被使用
 * @status 401 - 未授权
 * @status 404 - 用户不存在
 * @status 500 - 服务器内部错误
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { username, bio, avatar } = req.body;
     
    const success = await UserService.updateProfile(userId, { username, bio, avatar });
    
    if (success) {
      res.status(200).json({ message: '更新成功' });
    } else {
      res.status(404).json({ message: '用户不存在' });
    }
  } catch (error) {
    console.error('更新用户资料失败:', error);
    if (error instanceof Error && error.message === '用户名已被使用') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取用户列表（管理员）
 * @param req 请求对象
 * @param res 响应对象
 * @returns 用户列表
 * @status 200 - 成功
 * @status 401 - 未授权
 * @status 403 - 非管理员用户
 * @status 500 - 服务器内部错误
 */
export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const { keyword, page, pageSize } = req.query;
    
    const result = await UserService.getUsers({
      keyword: keyword as string,
      page: page ? parseInt(page as string) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string) : undefined
    });
    
    res.status(200).json({
      list: result.list,
      total: result.total,
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 10
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 切换用户状态（管理员）
 * @param req 请求对象
 * @param res 响应对象
 * @returns 更新结果
 * @status 200 - 成功
 * @status 400 - 请求参数错误
 * @status 404 - 用户不存在
 * @status 500 - 服务器内部错误
 */
export async function toggleUserStatus(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      res.status(400).json({ message: 'isActive 必须是布尔值' });
      return;
    }
    
    const success = await UserService.toggleUserStatus(parseInt(userId), isActive);
    
    if (success) {
      res.status(200).json({ message: '状态更新成功' });
    } else {
      res.status(404).json({ message: '用户不存在' });
    }
  } catch (error) {
    console.error('切换用户状态失败:', error);
    if (error instanceof Error && error.message === '用户不存在') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 重置用户密码（管理员）
 * @param req 请求对象
 * @param res 响应对象
 * @returns 新密码
 * @status 200 - 成功
 * @status 404 - 用户不存在
 * @status 500 - 服务器内部错误
 */
export async function resetUserPassword(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    
    const newPassword = await UserService.resetPassword(parseInt(userId));
    
    res.status(200).json({ newPassword });
  } catch (error) {
    console.error('重置用户密码失败:', error);
    if (error instanceof Error && error.message === '用户不存在') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}
