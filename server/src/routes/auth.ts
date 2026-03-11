import express from 'express';
import { register } from '../controllers/authController';

const router = express.Router();

// 注册路由
router.post('/register', register);

export default router;
