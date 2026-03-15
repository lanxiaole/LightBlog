import express from 'express';
import authMiddleware from '../middlewares/auth';
import optionalAuthMiddleware from '../middlewares/optionalAuth';
import { 
  createArticle,
  getArticles,
  getArticleById,
  getArticlesByCategory,
  getArticlesByTag,
  updateArticle,
  deleteArticle 
} from '../controllers/articleController';
import {
  likeArticle,
  unlikeArticle
} from '../controllers/likeController';

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

// GET /api/articles/:id - 获取文章详情（可选登录，登录后可获取点赞状态）
router.get('/:id', optionalAuthMiddleware, getArticleById);

// PUT /api/articles/:id - 更新文章信息（需要登录）
router.put('/:id', authMiddleware, updateArticle);

// DELETE /api/articles/:id - 删除文章（需要登录）
router.delete('/:id', authMiddleware, deleteArticle);

// POST /api/articles/:id/like - 点赞文章（需要登录）
// 注意：这个路由必须在 /:id 之后定义，避免被 /:id 匹配
router.post('/:id/like', authMiddleware, likeArticle);

// DELETE /api/articles/:id/like - 取消点赞（需要登录）
router.delete('/:id/like', authMiddleware, unlikeArticle);

export default router;
