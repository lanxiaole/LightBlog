import express from 'express';
import cors from 'cors';

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

export default app;