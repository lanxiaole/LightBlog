import express from 'express';
import { OssController } from '../controllers/ossController';

const router = express.Router();

// 测试 OSS 连接
router.get('/test-connection', OssController.testConnection);

// 测试上传文件
router.get('/test-upload', OssController.testUpload);

// 上传图片
router.post('/upload', OssController.uploadImage);

// 删除文件
router.delete('/delete', OssController.deleteFile);

// 富文本编辑器上传图片 (WangEditor 格式)
router.post('/editor-upload', OssController.uploadEditorImage);

export default router;
