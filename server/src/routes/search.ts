import express from 'express';
import { searchController } from '../controllers/searchController';

const router = express.Router();

/**
 * 搜索文章
 * GET /api/search
 */
router.get('/', searchController.searchArticles);

export default router;
