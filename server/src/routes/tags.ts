import express from 'express';
import { getTags, getHotTags } from '../controllers/tagController';

const router = express.Router();

// 获取所有标签路由（公开）
router.get('/', getTags);

// 获取热门标签路由（公开）
router.get('/hot', getHotTags);

export default router;
