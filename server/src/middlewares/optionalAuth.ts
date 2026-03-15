import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * 可选认证中间件
 * 如果提供了有效的 token，则将用户信息附加到 req.user
 * 如果没有提供 token 或 token 无效，则不阻止请求，只是不设置 req.user
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 从请求头中提取 token
    const authHeader = req.headers.authorization;
    
    // 如果没有提供 token，直接继续
    if (!authHeader) {
      next();
      return;
    }
    
    // 检查 token 格式
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      next();
      return;
    }
    
    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key') as {
      id: number;
      email?: string;
      username?: string;
    };
    
    // 将解码后的用户信息附加到 req.user 上
    (req as any).user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username
    };
    
    // 继续处理请求
    next();
  } catch (error) {
    console.error('Optional Auth Middleware Error:', error);
    // 验证失败但不阻止请求
    next();
  }
};

export default optionalAuthMiddleware;
