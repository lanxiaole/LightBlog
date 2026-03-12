import express from 'express';
import authMiddleware from '../middlewares/auth';
import { register, login, getCurrentUser } from '../controllers/authController';

const router = express.Router();

// 注册路由
router.post('/register', register);

// 登录路由
router.post('/login', login);

// 获取当前用户信息（需要登录）
router.get('/me', authMiddleware, getCurrentUser);

export default router;
