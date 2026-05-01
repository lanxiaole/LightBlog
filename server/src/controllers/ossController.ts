import { Request, Response } from 'express';
import { OssService } from '../services/ossService';
import multer from 'multer';

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片格式'));
    }
  }
});

export class OssController {
  static async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const result = await OssService.testConnection();
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.bucketInfo,
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `服务器错误: ${error.message}`,
      });
    }
  }

  static async testUpload(req: Request, res: Response): Promise<void> {
    try {
      const testFileName = `test/connection-test-${Date.now()}.txt`;
      const testContent = '这是一个测试文件，用于验证 OSS 连接正常！';
      
      const result = await OssService.uploadFile(testFileName, testContent);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: {
            url: result.url,
            fileName: testFileName,
          },
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `服务器错误: ${error.message}`,
      });
    }
  }

  static uploadImage = [
    upload.single('file'),
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ success: false, message: '请选择要上传的文件' });
        }

        const folder = req.body.folder || 'images';
        const result = await OssService.uploadImage(req.file.buffer, req.file.originalname, folder);

        if (result.success) {
          res.json({
            success: true,
            url: result.url,
            fileName: result.fileName,
            message: '上传成功！'
          });
        } else {
          res.status(500).json(result);
        }
      } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  ];

  static async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileName } = req.body;
      if (!fileName) {
        res.status(400).json({ success: false, message: '文件名不能为空' });
        return;
      }

      const result = await OssService.deleteFile(fileName);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static uploadEditorImage = [
    upload.single('file'),
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.json({
            errno: 1,
            message: '请选择要上传的文件'
          });
        }

        const result = await OssService.uploadImage(req.file.buffer, req.file.originalname, 'editor');

        if (result.success && result.url) {
          res.json({
            errno: 0,
            data: {
              url: result.url
            }
          });
        } else {
          res.json({
            errno: 1,
            message: result.message || '上传失败'
          });
        }
      } catch (error: any) {
        res.json({
          errno: 1,
          message: error.message
        });
      }
    }
  ];
}