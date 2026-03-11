import api from './index';

// 定义注册请求类型
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

// 定义注册响应类型
export interface RegisterResponse {
  id: number;
  email: string;
  username: string;
}

// 定义错误响应类型
export interface ErrorResponse {
  message: string;
}

// 定义登录请求类型
export interface LoginRequest {
  email: string;
  password: string;
}

// 定义登录响应类型
export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
    avatar: string | null;
    bio: string | null;
  };
}

/**
 * 注册新用户
 * @param email 邮箱
 * @param username 用户名
 * @param password 密码
 * @returns 注册成功的用户信息
 */
export async function register(
  email: string,
  username: string,
  password: string
): Promise<RegisterResponse> {
  try {
    const response = await api.post<RegisterResponse>('/auth/register', {
      email,
      username,
      password
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ErrorResponse;
    }
    throw { message: '注册失败' } as ErrorResponse;
  }
}

/**
 * 用户登录
 * @param email 邮箱
 * @param password 密码
 * @returns 登录成功的 token 和用户信息
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data as ErrorResponse;
    }
    throw { message: '登录失败' } as ErrorResponse;
  }
}

export default api;
