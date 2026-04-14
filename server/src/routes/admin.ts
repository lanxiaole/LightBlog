import express from 'express';
import authMiddleware from '../middlewares/auth';
import adminMiddleware from '../middlewares/admin';
import { getStats, adminDeleteArticle, getUsers, toggleUserStatus, resetUserPassword, getAllArticles, togglePin, updateStatus, getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/admin/adminController';

const router = express.Router();

// 统计数据
router.get('/stats', authMiddleware, adminMiddleware, getStats);

// 用户管理
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.put('/users/:userId/toggle-status', authMiddleware, adminMiddleware, toggleUserStatus);
router.post('/users/:userId/reset-password', authMiddleware, adminMiddleware, resetUserPassword);

// 文章管理
router.get('/articles', authMiddleware, adminMiddleware, getAllArticles);
router.put('/articles/:id/toggle-pin', authMiddleware, adminMiddleware, togglePin);
router.put('/articles/:id/status', authMiddleware, adminMiddleware, updateStatus);
router.delete('/articles/:id', authMiddleware, adminMiddleware, adminDeleteArticle);

// 分类管理
router.get('/categories', authMiddleware, adminMiddleware, getCategories);
router.post('/categories', authMiddleware, adminMiddleware, createCategory);
router.put('/categories/:id', authMiddleware, adminMiddleware, updateCategory);
router.delete('/categories/:id', authMiddleware, adminMiddleware, deleteCategory);

export default router;