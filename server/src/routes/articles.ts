import express from 'express';
import authMiddleware from '../middlewares/auth';
import { createArticle, getArticles, getArticleById, getArticlesByCategory, getArticlesByTag, updateArticle } from '../controllers/articleController';

const router = express.Router();

// POST /api/articles - 创建新文章（需要登录）
router.post('/', authMiddleware, createArticle);

// GET /api/articles - 获取文章列表（无需登录）
router.get('/', getArticles);

// GET /api/articles/category/:name - 获取分类文章列表（无需登录）
// 注意：这个路由必须在 /:id 之前定义，否则会被 /:id 匹配
router.get('/category/:name', getArticlesByCategory);

// GET /api/articles/tag/:name - 获取标签文章列表（无需登录）
// 注意：这个路由必须在 /:id 之前定义，否则会被 /:id 匹配
router.get('/tag/:name', getArticlesByTag);

// GET /api/articles/:id - 获取文章详情（无需登录）
router.get('/:id', getArticleById);

// PUT /api/articles/:id - 更新文章信息（需要登录）
router.put('/:id', authMiddleware, updateArticle);

export default router;
