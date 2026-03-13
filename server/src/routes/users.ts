import express from 'express';
import { getUserProfile, getUserArticles, updateProfile } from '../controllers/userController';
import authMiddleware from '../middlewares/auth';

const router = express.Router();

// 获取用户资料路由
router.get('/:username', getUserProfile);

// 获取用户文章列表路由
router.get('/:username/articles', getUserArticles);

// 更新用户资料路由（需要登录）
router.put('/profile', authMiddleware, updateProfile);

export default router;
