import express from 'express';
import { getTags } from '../controllers/tagController';

const router = express.Router();

// 获取所有标签路由（公开）
router.get('/', getTags);

export default router;
