/**
 * 管理员控制器
 * 处理管理员相关的HTTP请求
 */
import { Request, Response } from 'express';
import { AdminService } from '../../services/admin/adminService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../models/User';

/**
 * 获取统计数据
 * @param req 请求对象
 * @param res 响应对象
 * @returns 统计数据
 * @status 200 - 成功
 * @status 500 - 服务器内部错误
 */
export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    // 从 req.user 获取当前用户 id（中间件已确保是管理员）
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 调用 AdminService 的 getStats 方法获取统计数据
    const stats = await AdminService.getStats();
    
    // 返回 200 和统计数据对象
    res.status(200).json(stats);
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 删除文章（管理后台）
 * @param req 请求对象
 * @param res 响应对象
 * @returns 操作结果
 * @status 200 - 成功
 * @status 400 - 无效的文章ID
 * @status 500 - 服务器内部错误
 */
export async function adminDeleteArticle(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);
    
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }
    
    const success = await AdminService.adminDeleteArticle(id);
    
    if (success) {
      res.status(200).json({ message: '删除成功' });
    } else {
      res.status(500).json({ message: '操作失败' });
    }
  } catch (error) {
    console.error('删除文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 管理员登录
 * @param req 请求对象
 * @param res 响应对象
 * @returns 登录结果（token和用户信息）
 * @status 200 - 成功
 * @status 400 - 邮箱格式不正确
 * @status 401 - 邮箱或密码错误
 * @status 403 - 非管理员用户
 * @status 500 - 服务器内部错误
 */
export async function adminLogin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // 验证邮箱格式
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: '邮箱格式不正确' });
      return;
    }

    // 验证密码非空
    if (!password || password.length < 1) {
      res.status(401).json({ message: '密码不能为空' });
      return;
    }

    // 获取用户信息
    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ message: '邮箱或密码错误' });
      return;
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: '邮箱或密码错误' });
      return;
    }

    // 检查用户角色
    if (user.role !== 'admin') {
      res.status(403).json({ message: '非管理员用户' });
      return;
    }

    // 检查用户状态
    if (!user.is_active) {
      res.status(403).json({ message: '账号已被禁用，请联系管理员' });
      return;
    }

    // 生成 JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );

    // 返回 token 和用户信息（包含角色）
    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role
      }
    });
  } catch (error) {
    console.error('管理员登录失败:', error);
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
    
    const result = await AdminService.getUsers({
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
    
    const success = await AdminService.toggleUserStatus(parseInt(userId), isActive);
    
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
    
    const newPassword = await AdminService.resetPassword(parseInt(userId));
    
    res.status(200).json({ newPassword });
  } catch (error) {
    console.error('重置用户密码失败:', error);
    if (error instanceof Error && error.message === '用户不存在') {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取所有文章（管理后台）
 * @param req 请求对象
 * @param res 响应对象
 * @returns 文章列表和分页信息
 * @status 200 - 成功
 * @status 500 - 服务器内部错误
 */
export async function getAllArticles(req: Request, res: Response): Promise<void> {
  try {
    const keyword = req.query.keyword as string;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    const { list, total } = await AdminService.getAllArticles({
      keyword,
      categoryId,
      status,
      page,
      pageSize
    });
    
    res.status(200).json({
      list,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 设置文章置顶状态
 * @param req 请求对象
 * @param res 响应对象
 * @returns 操作结果
 * @status 200 - 成功
 * @status 400 - 无效的文章ID
 * @status 500 - 服务器内部错误
 */
export async function togglePin(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);
    const { isPinned } = req.body;
    
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }
    
    const success = await AdminService.togglePin(id, isPinned);
    
    if (success) {
      res.status(200).json({ message: '置顶状态更新成功' });
    } else {
      res.status(500).json({ message: '操作失败' });
    }
  } catch (error) {
    console.error('更新置顶状态失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 更新文章状态
 * @param req 请求对象
 * @param res 响应对象
 * @returns 操作结果
 * @status 200 - 成功
 * @status 400 - 无效的文章ID
 * @status 500 - 服务器内部错误
 */
export async function updateStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);
    const { status } = req.body;
    
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }
    
    const success = await AdminService.updateArticleStatus(id, status);
    
    if (success) {
      res.status(200).json({ message: '状态更新成功' });
    } else {
      res.status(500).json({ message: '操作失败' });
    }
  } catch (error) {
    console.error('更新文章状态失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

export default {
  getStats,
  adminDeleteArticle,
  adminLogin,
  getUsers,
  toggleUserStatus,
  resetUserPassword,
  getAllArticles,
  togglePin,
  updateStatus
};