import { createOssClient, ossConfig } from '../config/oss';

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
}
