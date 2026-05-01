import { defineStore } from 'pinia';
import { login, getCurrentUser } from '@/api/auth';

// 定义用户信息类型
interface UserInfo {
  id: number;
  email: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  role: string;
}

// 定义登录凭证类型
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

// 从存储中恢复 token
const savedTokenLocal = localStorage.getItem('token');
const savedTokenSession = sessionStorage.getItem('token');
const savedUserInfoLocal = localStorage.getItem('userInfo');
const savedUserInfoSession = sessionStorage.getItem('userInfo');

// 优先用 localStorage 的数据，但是如果没有 token，就用 sessionStorage 的
const activeToken = savedTokenLocal || savedTokenSession;
let parsedUserInfo = null;
if (activeToken) {
  parsedUserInfo = savedUserInfoLocal ? JSON.parse(savedUserInfoLocal) : (savedUserInfoSession ? JSON.parse(savedUserInfoSession) : null);
}

// 定义用户 store
export const useUserStore = defineStore('user', {
  state: () => ({
    // 从 localStorage 或 sessionStorage 初始化 token
    token: savedTokenLocal || savedTokenSession || null,
    userInfo: parsedUserInfo as UserInfo | null
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
        // 移除 sessionStorage 的数据，避免混淆
        sessionStorage.removeItem('token');
      } else {
        // 不记住登录状态，使用 sessionStorage
        sessionStorage.setItem('token', token);
        // 移除 localStorage 的数据，避免混淆
        localStorage.removeItem('token');
      }
    },

    /**
     * 保存用户信息到 state 和存储
     * @param user 用户信息
     * @param rememberMe 是否记住登录状态
     */
    setUserInfo(user: UserInfo, rememberMe: boolean = false) {
      this.userInfo = user;
      if (rememberMe) {
        localStorage.setItem('userInfo', JSON.stringify(user));
        sessionStorage.removeItem('userInfo');
      } else {
        sessionStorage.setItem('userInfo', JSON.stringify(user));
        localStorage.removeItem('userInfo');
      }
    },

    /**
     * 用户登录
     * @param credentials 登录凭证
     */
    async login(credentials: LoginCredentials) {
      const response = await login(credentials.email, credentials.password);
      this.setToken(response.token, credentials.rememberMe);
      this.setUserInfo(response.user, credentials.rememberMe);
      return response;
    },

    /**
     * 初始化用户信息
     * 当页面刷新后，从服务器获取用户信息
     */
    async initUserInfo() {
      if (this.token) {
        // 判断当前 token 是在 localStorage 还是 sessionStorage
        const isInLocalStorage = localStorage.getItem('token') === this.token;

        try {
          const userInfo = await getCurrentUser();
          this.setUserInfo(userInfo, isInLocalStorage);
        } catch (error) {
          console.error('初始化用户信息失败:', error);
          if (!this.userInfo) {
            this.logout();
          }
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
      localStorage.removeItem('userInfo');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userInfo');
    }
  }
});
