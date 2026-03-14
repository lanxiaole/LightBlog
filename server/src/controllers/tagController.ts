import { Request, Response } from 'express';
import { TagModel } from '../models/Tag';

/**
 * 获取所有标签
 * @param req 请求对象
 * @param res 响应对象
 */
export async function getTags(req: Request, res: Response): Promise<void> {
  try {
    // 调用模型方法获取所有标签
    const tags = await TagModel.getAllTags();
    
    // 返回标签列表
    res.status(200).json(tags);
  } catch (error) {
    console.error('获取标签列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}
