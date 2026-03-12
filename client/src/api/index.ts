import axios from 'axios';
import router from '@/router';

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从 localStorage 或 sessionStorage 获取 token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    // 如果 token 存在，设置请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理 401 错误（未授权）
    if (error.response && error.response.status === 401) {
      // 清除所有存储中的 token
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      // 跳转到登录页
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
