/**
 * 管理员认证控制器
 * 处理管理员登录相关的HTTP请求
 */
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../models/User';

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

export default {
  adminLogin
};