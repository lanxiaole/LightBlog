/**
 * 管理员控制器索引
 * 统一导出所有管理员相关的控制器模块
 */

// 导入各个管理员控制器模块
import adminAuth from './adminAuth';
import adminStats from './adminStats';
import adminArticle from './adminArticle';
import adminUser from './adminUser';
import adminCategory from './categoryController';
import adminTag from './tagController';

// 导出各个模块的函数
export * from './adminAuth';
export * from './adminStats';
export * from './adminArticle';
export * from './adminUser';
export * from './categoryController';
export * from './tagController';

// 导出默认对象，包含所有控制器函数
const adminController = {
  ...adminAuth,
  ...adminStats,
  ...adminArticle,
  ...adminUser,
  ...adminCategory,
  ...adminTag
};

export default adminController;