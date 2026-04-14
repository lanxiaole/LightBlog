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
 * 修改密码
 * @param req 请求对象
 * @param res 响应对象
 * @returns 更新结果
 * @status 200 - 修改成功
 * @status 400 - 请求参数错误
 * @status 401 - 未授权
 * @status 500 - 服务器内部错误
 */
export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      res.status(400).json({ message: '旧密码和新密码不能为空' });
      return;
    }
    
    if (newPassword.length < 6) {
      res.status(400).json({ message: '新密码长度至少为6位' });
      return;
    }
    
    const success = await UserService.changePassword(userId, oldPassword, newPassword);
    
    if (success) {
      res.status(200).json({ message: '密码修改成功' });
    }
  } catch (error) {
    console.error('修改密码失败:', error);
    if (error instanceof Error && error.message === '旧密码错误') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}


