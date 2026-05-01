import { Request, Response } from 'express';
import { OssService } from '../services/ossService';

export class OssController {
  // 测试 OSS 连接
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

  // 测试上传文件
  static async testUpload(req: Request, res: Response): Promise<void> {
    try {
      // 上传一个测试文件
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
}
