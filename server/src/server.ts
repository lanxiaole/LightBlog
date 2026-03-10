import dotenv from 'dotenv';

// 先加载环境变量
dotenv.config();

// 再导入 app
import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});