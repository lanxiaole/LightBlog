import express from 'express';
import cors from 'cors';
import { testConnection } from './config/db';
import authRouter from './routes/auth';
import articleRouter from './routes/articles';
import userRouter from './routes/users';
import categoryRouter from './routes/categories';
import tagRouter from './routes/tags';
import commentRouter from './routes/comments';
import favoriteRouter from './routes/favorites';
import followRouter from './routes/follow';

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 测试数据库连接（仅在开发环境）
if (process.env.NODE_ENV !== 'production') {
  testConnection();
}

// 认证路由
app.use('/api/auth', authRouter);

// 文章路由
app.use('/api/articles', articleRouter);

// 用户路由
app.use('/api/users', userRouter);

// 分类路由
app.use('/api/categories', categoryRouter);

// 标签路由
app.use('/api/tags', tagRouter);

// 评论路由
app.use('/api', commentRouter);

// 收藏路由
app.use('/api', favoriteRouter);

// 关注路由
app.use('/api', followRouter);

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

export default app;