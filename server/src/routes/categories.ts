import express from 'express';
import { getCategories, getHotCategories } from '../controllers/categoryController';

const router = express.Router();

// 获取所有分类路由（公开）
router.get('/', getCategories);

// 获取热门分类路由（公开）
router.get('/hot', getHotCategories);

export default router;
