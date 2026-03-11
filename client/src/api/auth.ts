import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

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
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data as ErrorResponse;
    }
    throw { message: '注册失败' } as ErrorResponse;
  }
}

export default api;
