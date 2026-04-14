/**
 * 认证控制器
 * 处理用户注册、登录和获取当前用户信息的HTTP请求
 */
import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { UserModel } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * 用户注册
 * @param req 请求对象
 * @param res 响应对象
 * @returns 注册成功的用户信息
 * @status 201 - 注册成功
 * @status 400 - 请求参数错误
 * @status 409 - 邮箱或用户名已存在
 * @status 500 - 服务器内部错误
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, username, password } = req.body;

    const result = await AuthService.register({ email, username, password });

    res.status(201).json(result);
  } catch (error) {
    console.error('注册失败:', error);
    if (error instanceof Error) {
      if (error.message === '邮箱格式不正确' || 
          error.message === '用户名长度应为3-20位，且只允许字母、数字、下划线' ||
          error.message === '密码长度至少为6位') {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error.message === '邮箱已被注册' || error.message === '用户名已被使用') {
        res.status(409).json({ message: error.message });
        return;
      }
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 用户登录
 * @param req 请求对象
 * @param res 响应对象
 * @returns 包含令牌和用户信息的认证响应
 * @status 200 - 登录成功
 * @status 400 - 邮箱格式不正确
 * @status 401 - 邮箱或密码错误
 * @status 403 - 账号已被禁用
 * @status 500 - 服务器内部错误
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const result = await AuthService.login({ email, password });

    res.status(200).json(result);
  } catch (error) {
    console.error('登录失败:', error);
    if (error instanceof Error && error.message === '邮箱格式不正确') {
      res.status(400).json({ message: error.message });
      return;
    }
    if (error instanceof Error && (error.message === '邮箱或密码错误' || error.message === '密码不能为空')) {
      res.status(401).json({ message: error.message });
      return;
    }
    if (error instanceof Error && error.message === '账号已被禁用，请联系管理员') {
      res.status(403).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取当前用户信息
 * @param req 请求对象
 * @param res 响应对象
 * @returns 当前用户的详细信息
 * @status 200 - 成功
 * @status 401 - 未授权
 * @status 404 - 用户不存在
 * @status 500 - 服务器内部错误
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }
    
    const user = await AuthService.getCurrentUser(userId);
    
    res.status(200).json(user);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    if (error instanceof Error && error.message === '用户不存在') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}


