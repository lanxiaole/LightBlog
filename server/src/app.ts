import express from 'express';
import cors from 'cors';
import { testConnection } from './config/db';
import authRouter from './routes/auth';
import articleRouter from './routes/articles';
import userRouter from './routes/users';

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

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

export default app;