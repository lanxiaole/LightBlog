import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * JWT 验证中间件
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 从请求头中提取 token
    const authHeader = req.headers.authorization;
    
    // 检查是否存在 token
    if (!authHeader) {
      res.status(401).json({ message: '未提供认证令牌' });
      return;
    }
    
    // 检查 token 格式
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      res.status(401).json({ message: '未提供认证令牌' });
      return;
    }
    
    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key') as {
      id: number;
      email?: string;
      username?: string;
    };
    
    // 将解码后的用户信息附加到 req.user 上
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username
    };
    
    // 继续处理请求
    next();
  } catch (error) {
    // 验证失败
    res.status(401).json({ message: '无效的令牌' });
  }
};

export default authMiddleware;
