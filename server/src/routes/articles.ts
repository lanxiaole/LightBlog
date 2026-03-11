import express from 'express';
import authMiddleware from '../middlewares/auth';
import { createArticle, getArticles } from '../controllers/articleController';

const router = express.Router();

// POST /api/articles - 创建新文章（需要登录）
router.post('/', authMiddleware, createArticle);

// GET /api/articles - 获取文章列表（无需登录）
router.get('/', getArticles);

export default router;
