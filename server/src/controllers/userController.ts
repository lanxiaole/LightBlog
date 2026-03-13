import { Request, Response } from 'express';
import { UserModel } from '../models/User';

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
    
    // 返回用户信息
    res.status(200).json(user);
  } catch (error) {
    console.error('获取用户资料失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}
