import express from 'express';
import { getUserProfile } from '../controllers/userController';

const router = express.Router();

// 获取用户资料路由
router.get('/:username', getUserProfile);

export default router;
