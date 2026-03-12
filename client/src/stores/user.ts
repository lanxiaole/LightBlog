import { defineStore } from 'pinia';
import { login, getCurrentUser } from '@/api/auth';

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
  rememberMe: boolean;
}

// 定义用户 store
export const useUserStore = defineStore('user', {
  state: () => ({
    // 从 localStorage 或 sessionStorage 初始化 token
    token: localStorage.getItem('token') || sessionStorage.getItem('token') || null,
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
     * 保存 token 到 state 和存储
     * @param token JWT token
     * @param rememberMe 是否记住登录状态
     */
    setToken(token: string, rememberMe: boolean = false) {
      this.token = token;
      if (rememberMe) {
        // 记住登录状态，使用 localStorage
        localStorage.setItem('token', token);
      } else {
        // 不记住登录状态，使用 sessionStorage
        sessionStorage.setItem('token', token);
      }
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
      this.setToken(response.token, credentials.rememberMe);
      this.setUserInfo(response.user);
      return response;
    },

    /**
     * 初始化用户信息
     * 当页面刷新后，从服务器获取用户信息
     */
    async initUserInfo() {
      if (this.token && !this.userInfo) {
        try {
          const userInfo = await getCurrentUser();
          this.setUserInfo(userInfo);
        } catch (error) {
          console.error('初始化用户信息失败:', error);
          // 如果获取失败，清除 token
          this.logout();
        }
      }
    },

    /**
     * 用户登出
     */
    logout() {
      this.token = null;
      this.userInfo = null;
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
  }
});
