import express from 'express';
import { getUserProfile, getUserArticles } from '../controllers/userController';

const router = express.Router();

// 获取用户资料路由
router.get('/:username', getUserProfile);

// 获取用户文章列表路由
router.get('/:username/articles', getUserArticles);

export default router;
