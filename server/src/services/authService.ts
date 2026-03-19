/**
 * 认证服务
 * 处理用户注册、登录和获取当前用户信息的业务逻辑
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

/**
 * 注册输入接口
 */
export interface RegisterInput {
  email: string;     // 邮箱地址
  username: string;  // 用户名
  password: string;  // 密码
}

/**
 * 登录输入接口
 */
export interface LoginInput {
  email: string;     // 邮箱地址
  password: string;  // 密码
}

/**
 * 认证响应接口
 */
export interface AuthResponse {
  token: string;     // JWT 令牌
  user: {
    id: number;              // 用户ID
    email: string;           // 邮箱地址
    username: string;        // 用户名
    avatar: string | null;   // 头像
    bio: string | null;      // 个人简介
    role: string;            // 用户角色
  };
}

// 邮箱格式正则表达式
const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// 用户名格式正则表达式（3-20位，只允许字母、数字、下划线）
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
// 密码格式正则表达式（至少6位）
const passwordRegex = /^.{6,}$/;

/**
 * 认证服务
 */
export const AuthService = {
  /**
   * 用户注册
   * @param input 注册信息
   * @returns 注册成功的用户信息
   * @throws 当邮箱格式不正确时抛出错误
   * @throws 当用户名格式不正确时抛出错误
   * @throws 当密码格式不正确时抛出错误
   * @throws 当邮箱已被注册时抛出错误
   * @throws 当用户名已被使用时抛出错误
   */
  async register(input: RegisterInput): Promise<{ id: number; email: string; username: string }> {
    const { email, username, password } = input;

    if (!emailRegex.test(email)) {
      throw new Error('邮箱格式不正确');
    }

    if (!usernameRegex.test(username)) {
      throw new Error('用户名长度应为3-20位，且只允许字母、数字、下划线');
    }

    if (!passwordRegex.test(password)) {
      throw new Error('密码长度至少为6位');
    }

    const existingUserByEmail = await UserModel.findUserByEmail(email);
    if (existingUserByEmail) {
      throw new Error('邮箱已被注册');
    }

    const existingUserByUsername = await UserModel.findUserByUsername(username);
    if (existingUserByUsername) {
      throw new Error('用户名已被使用');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = await UserModel.createUser(email, username, hashedPassword);

    return {
      id: userId,
      email,
      username
    };
  },

  /**
   * 用户登录
   * @param input 登录信息
   * @returns 包含令牌和用户信息的认证响应
   * @throws 当邮箱格式不正确时抛出错误
   * @throws 当密码为空时抛出错误
   * @throws 当邮箱或密码错误时抛出错误
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    if (!emailRegex.test(email)) {
      throw new Error('邮箱格式不正确');
    }

    if (!password || password.length < 1) {
      throw new Error('密码不能为空');
    }

    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      throw new Error('邮箱或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('邮箱或密码错误');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role
      }
    };
  },

  /**
   * 获取当前用户信息
   * @param userId 用户ID
   * @returns 用户详细信息
   * @throws 当用户不存在时抛出错误
   */
  async getCurrentUser(userId: number): Promise<{ id: number; email: string; username: string; avatar: string | null; bio: string | null; role: string }> {
    const user = await UserModel.findUserById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role
    };
  }
};