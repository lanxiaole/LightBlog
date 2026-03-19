import express from 'express';
import authMiddleware from '../middlewares/auth';
import adminMiddleware from '../middlewares/admin';
import { getStats } from '../controllers/adminController';
import { getUsers, toggleUserStatus, resetUserPassword } from '../controllers/userController';

const router = express.Router();

// 获取统计数据路由（需要管理员权限）
router.get('/stats', authMiddleware, adminMiddleware, getStats);

// 用户管理路由（需要管理员权限）
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.put('/users/:userId/toggle-status', authMiddleware, adminMiddleware, toggleUserStatus);
router.post('/users/:userId/reset-password', authMiddleware, adminMiddleware, resetUserPassword);

export default router;