import express from 'express';
import { follow, unfollow, getFollowers, getFollowing, getFollowStatus } from '../controllers/followController';
import authMiddleware from '../middlewares/auth';

const router = express.Router();

// 关注用户路由（需要登录）
router.post('/users/:userId/follow', authMiddleware, follow);

// 取消关注用户路由（需要登录）
router.delete('/users/:userId/follow', authMiddleware, unfollow);

// 获取用户粉丝列表路由
router.get('/users/:userId/followers', getFollowers);

// 获取用户关注列表路由
router.get('/users/:userId/following', getFollowing);

// 获取关注状态路由（需要登录）
router.get('/users/:userId/follow/status', authMiddleware, getFollowStatus);

export default router;
