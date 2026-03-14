import express from 'express';
import authMiddleware from '../middlewares/auth';
import { createArticle, getArticles, getArticleById, getArticlesByCategory, getArticlesByTag } from '../controllers/articleController';

const router = express.Router();

// POST /api/articles - 创建新文章（需要登录）
router.post('/', authMiddleware, createArticle);

// GET /api/articles - 获取文章列表（无需登录）
router.get('/', getArticles);

// GET /api/articles/:id - 获取文章详情（无需登录）
router.get('/:id', getArticleById);

// GET /api/articles/category/:name - 获取分类文章列表（无需登录）
router.get('/category/:name', getArticlesByCategory);

// GET /api/articles/tag/:name - 获取标签文章列表（无需登录）
router.get('/tag/:name', getArticlesByTag);

export default router;
