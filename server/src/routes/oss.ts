import express from 'express';
import { OssController } from '../controllers/ossController';

const router = express.Router();

// 测试 OSS 连接
router.get('/test-connection', OssController.testConnection);

// 测试上传文件
router.get('/test-upload', OssController.testUpload);

export default router;
