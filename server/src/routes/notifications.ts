import express from 'express';
import authMiddleware from '../middlewares/auth';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} from '../controllers/notificationController';

const router = express.Router();

// GET /api/notifications - 获取通知列表（需要登录）
router.get('/', authMiddleware, getNotifications);

// PUT /api/notifications/:id/read - 标记通知为已读（需要登录）
router.put('/:id/read', authMiddleware, markAsRead);

// PUT /api/notifications/read-all - 标记所有通知为已读（需要登录）
router.put('/read-all', authMiddleware, markAllAsRead);

// GET /api/notifications/unread-count - 获取未读通知数量（需要登录）
router.get('/unread-count', authMiddleware, getUnreadCount);

export default router;
