import express from 'express';
import authMiddleware from '../middlewares/auth';
import {
  favoriteArticle,
  unfavoriteArticle,
  getUserFavorites
} from '../controllers/favoriteController';

const router = express.Router();

// POST /api/articles/:id/favorite - 收藏文章（需要登录）
router.post('/articles/:id/favorite', authMiddleware, favoriteArticle);

// DELETE /api/articles/:id/favorite - 取消收藏（需要登录）
router.delete('/articles/:id/favorite', authMiddleware, unfavoriteArticle);

// GET /api/users/me/favorites - 获取当前用户的收藏列表（需要登录）
router.get('/users/me/favorites', authMiddleware, getUserFavorites);

export default router;