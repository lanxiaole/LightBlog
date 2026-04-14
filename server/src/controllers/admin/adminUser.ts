/**
 * 管理员用户控制器
 * 处理用户管理相关的HTTP请求
 */
import { Request, Response } from 'express';
import { AdminService } from '../../services/admin/adminService';

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

export default {
  getUsers,
  toggleUserStatus,
  resetUserPassword
};