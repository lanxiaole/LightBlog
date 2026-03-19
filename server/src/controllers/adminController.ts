/**
 * 管理员控制器
 * 处理管理员相关的HTTP请求
 */
import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';

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

export default {
  getStats
};