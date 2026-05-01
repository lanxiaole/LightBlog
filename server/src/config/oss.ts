import OSS from 'ali-oss';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// OSS 配置
export const ossConfig = {
  region: process.env.OSS_REGION || 'oss-cn-beijing',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
  bucket: process.env.OSS_BUCKET || 'lightblog1',
};

// 创建 OSS 客户端
export const createOssClient = (): OSS => {
  return new OSS(ossConfig);
};
