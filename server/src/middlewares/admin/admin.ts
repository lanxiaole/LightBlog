import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../../models/User';

/**
 * 管理员权限验证中间件
 * 验证当前用户是否为管理员
 */
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 从 req.user 获取当前用户 id
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未提供认证令牌' });
      return;
    }
    
    // 调用 UserModel.findUserById 获取用户信息
    const user = await UserModel.findUserById(userId);
    
    // 如果用户不存在或用户角色不是 'admin'，返回 403
    if (!user || user.role !== 'admin') {
      res.status(403).json({ message: '需要管理员权限' });
      return;
    }
    
    // 验证通过，调用 next()
    next();
  } catch (error) {
    console.error('管理员权限验证失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export default adminMiddleware;