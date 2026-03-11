import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';

// 定义注册请求体接口
interface RegisterBody {
  email: string;
  username: string;
  password: string;
}

// 邮箱验证正则
const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// 用户名验证正则
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

// 密码验证正则（至少6位）
const passwordRegex = /^.{6,}$/;

/**
 * 注册新用户
 * @param req 请求对象
 * @param res 响应对象
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    // 从请求体解构参数
    const { email, username, password } = req.body as RegisterBody;

    // 验证邮箱格式
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: '邮箱格式不正确' });
      return;
    }

    // 验证用户名
    if (!usernameRegex.test(username)) {
      res.status(400).json({ message: '用户名长度应为3-20位，且只允许字母、数字、下划线' });
      return;
    }

    // 验证密码
    if (!passwordRegex.test(password)) {
      res.status(400).json({ message: '密码长度至少为6位' });
      return;
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await UserModel.findUserByEmail(email);
    if (existingUserByEmail) {
      res.status(409).json({ message: '邮箱已被注册' });
      return;
    }

    // 检查用户名是否已存在
    const existingUserByUsername = await UserModel.findUserByUsername(username);
    if (existingUserByUsername) {
      res.status(409).json({ message: '用户名已被使用' });
      return;
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建新用户
    const userId = await UserModel.createUser(email, username, hashedPassword);

    // 返回成功响应
    res.status(201).json({
      id: userId,
      email,
      username
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}
