import express from 'express';
import { getComments, createComment, deleteComment } from '../controllers/commentController';
import authMiddleware from '../middlewares/auth';

const router = express.Router();

// 获取文章评论列表
router.get('/articles/:articleId/comments', getComments);

// 创建评论（需要登录）
router.post('/articles/:articleId/comments', authMiddleware, createComment);

// 删除评论（需要登录）
router.delete('/comments/:id', authMiddleware, deleteComment);

export default router;