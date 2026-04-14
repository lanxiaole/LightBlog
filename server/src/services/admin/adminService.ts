/**
 * 管理员服务索引
 * 统一导出所有管理员相关的服务模块
 */

// 导入各个管理员服务模块
import { AdminAuthService } from './adminAuthService';
import { AdminStatsService, AdminStats } from './adminStatsService';
import { AdminArticleService } from './adminArticleService';
import { AdminUserService } from './adminUserService';

// 导出类型
export type { AdminStats };

/**
 * 管理员服务
 * 整合所有管理员相关的服务功能
 */
export const AdminService = {
  // 统计数据相关
  getStats: AdminStatsService.getStats,
  
  // 文章管理相关
  adminDeleteArticle: AdminArticleService.adminDeleteArticle,
  getAllArticles: AdminArticleService.getAllArticles,
  togglePin: AdminArticleService.togglePin,
  updateArticleStatus: AdminArticleService.updateArticleStatus,
  
  // 用户管理相关
  getUsers: AdminUserService.getUsers,
  toggleUserStatus: AdminUserService.toggleUserStatus,
  resetPassword: AdminUserService.resetPassword
};