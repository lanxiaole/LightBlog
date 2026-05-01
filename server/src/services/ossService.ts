import { createOssClient, ossConfig } from '../config/oss';
import path from 'path';
import { randomUUID } from 'crypto';

export class OssService {
  // 测试 OSS 连接
  static async testConnection(): Promise<{ success: boolean; message: string; bucketInfo?: any }> {
    try {
      const client = createOssClient();
      
      // 尝试上传一个测试文件（用 Buffer）
      const testFileName = `test/connection-test-${Date.now()}.txt`;
      const testContent = Buffer.from('连接测试成功！');
      await client.put(testFileName, testContent);
      
      // 然后删除测试文件
      await client.delete(testFileName);
      
      return {
        success: true,
        message: 'OSS 连接成功！',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `OSS 连接失败: ${error.message}`,
      };
    }
  }

  // 上传文件到 OSS
  static async uploadFile(fileName: string, fileContent: Buffer | string): Promise<{ success: boolean; url?: string; message: string }> {
    try {
      const client = createOssClient();
      
      // 确保是 Buffer 格式
      const contentBuffer = typeof fileContent === 'string' 
        ? Buffer.from(fileContent) 
        : fileContent;
      
      // 上传文件
      await client.put(fileName, contentBuffer);
      
      // 生成访问 URL
      const url = `https://${ossConfig.bucket}.${ossConfig.region}.aliyuncs.com/${fileName}`;
      
      return {
        success: true,
        url,
        message: '文件上传成功！',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `文件上传失败: ${error.message}`,
      };
    }
  }

  // 上传图片到 OSS（自动生成文件名）
  static async uploadImage(
    file: Buffer,
    originalName: string,
    folder: string = 'images'
  ): Promise<{ success: boolean; url?: string; fileName?: string; message: string }> {
    try {
      const client = createOssClient();
      
      const ext = path.extname(originalName) || '.jpg';
      const uuid = randomUUID().replace(/-/g, '');
      const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const fileName = `${folder}/${date}/${uuid}${ext}`;
      
      await client.put(fileName, file);
      
      const url = `https://${ossConfig.bucket}.${ossConfig.region}.aliyuncs.com/${fileName}`;
      
      return {
        success: true,
        url,
        fileName,
        message: '图片上传成功！',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `图片上传失败: ${error.message}`,
      };
    }
  }

  // 删除文件从 OSS
  static async deleteFile(fileName: string): Promise<{ success: boolean; message: string }> {
    try {
      const client = createOssClient();
      await client.delete(fileName);
      return {
        success: true,
        message: '文件删除成功！',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `文件删除失败: ${error.message}`,
      };
    }
  }
}
