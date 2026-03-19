import express from 'express';
import adminMiddleware from '../middlewares/admin';
import { getStats } from '../controllers/adminController';

const router = express.Router();

// 获取统计数据路由（需要管理员权限）
router.get('/stats', adminMiddleware, getStats);

export default router;