import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

// 定义注册请求体接口
interface RegisterBody {
  email: string;
  username: string;
  password: string;
}

// 定义登录请求体接口
interface LoginBody {
  email: string;
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

/**
 * 用户登录
 * @param req 请求对象
 * @param res 响应对象
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    // 从请求体解构参数
    const { email, password } = req.body as LoginBody;

    // 验证邮箱格式
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: '邮箱格式不正确' });
      return;
    }

    // 验证密码
    if (!password || password.length < 1) {
      res.status(400).json({ message: '密码不能为空' });
      return;
    }

    // 查找用户
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

    // 生成 JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );

    // 返回成功响应
    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取当前登录用户信息
 * @param req 请求对象
 * @param res 响应对象
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    // 从 req.user 中获取用户 ID
    const userId = (req as any).user?.id;
    
    // 验证用户 ID 是否存在（确保已通过 auth 中间件）
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    // 查找用户
    const user = await UserModel.findUserById(userId);
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }
    
    // 返回用户信息
    res.status(200).json({
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}
