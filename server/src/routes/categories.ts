import express from 'express';
import { getCategories } from '../controllers/categoryController';

const router = express.Router();

// 获取所有分类路由（公开）
router.get('/', getCategories);

export default router;
