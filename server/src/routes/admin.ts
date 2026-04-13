import express from 'express';
import authMiddleware from '../middlewares/auth';
import adminMiddleware from '../middlewares/admin';
import { getStats } from '../controllers/adminController';
import { getUsers, toggleUserStatus, resetUserPassword } from '../controllers/userController';
import { getAllArticles, togglePin, updateStatus, adminDeleteArticle } from '../controllers/articleController';

const router = express.Router();

// 获取统计数据路由（需要管理员权限）
router.get('/stats', authMiddleware, adminMiddleware, getStats);

// 用户管理路由（需要管理员权限）
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.put('/users/:userId/toggle-status', authMiddleware, adminMiddleware, toggleUserStatus);
router.post('/users/:userId/reset-password', authMiddleware, adminMiddleware, resetUserPassword);

// 文章管理路由（需要管理员权限）
router.get('/articles', authMiddleware, adminMiddleware, getAllArticles);
router.put('/articles/:id/toggle-pin', authMiddleware, adminMiddleware, togglePin);
router.put('/articles/:id/status', authMiddleware, adminMiddleware, updateStatus);
router.delete('/articles/:id', authMiddleware, adminMiddleware, adminDeleteArticle);

export default router;