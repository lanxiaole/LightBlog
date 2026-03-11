import { defineStore } from 'pinia';
import { login } from '@/api/auth';

// 定义用户信息类型
interface UserInfo {
  id: number;
  email: string;
  username: string;
  avatar: string | null;
  bio: string | null;
}

// 定义登录凭证类型
interface LoginCredentials {
  email: string;
  password: string;
}

// 定义用户 store
export const useUserStore = defineStore('user', {
  state: () => ({
    // 从 localStorage 初始化 token
    token: localStorage.getItem('token') || null,
    userInfo: null as UserInfo | null
  }),
  
  getters: {
    /**
     * 判断用户是否已登录
     */
    isLoggedIn: (state) => !!state.token
  },
  
  actions: {
    /**
     * 保存 token 到 state 和 localStorage
     * @param token JWT token
     */
    setToken(token: string) {
      this.token = token;
      localStorage.setItem('token', token);
    },
    
    /**
     * 保存用户信息到 state
     * @param user 用户信息
     */
    setUserInfo(user: UserInfo) {
      this.userInfo = user;
    },
    
    /**
     * 用户登录
     * @param credentials 登录凭证
     */
    async login(credentials: LoginCredentials) {
      const response = await login(credentials.email, credentials.password);
      this.setToken(response.token);
      this.setUserInfo(response.user);
      return response;
    },
    
    /**
     * 用户登出
     */
    logout() {
      this.token = null;
      this.userInfo = null;
      localStorage.removeItem('token');
    }
  }
});
