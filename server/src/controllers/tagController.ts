/**
 * 标签控制器
 * 处理标签相关的HTTP请求
 */
import { Request, Response } from 'express';
import { TagService } from '../services/tagService';

/**
 * 获取所有标签
 * @param req 请求对象
 * @param res 响应对象
 * @returns 标签列表
 * @status 200 - 成功
 * @status 500 - 服务器内部错误
 */
export async function getTags(req: Request, res: Response): Promise<void> {
  try {
    const tags = await TagService.getAllTags();
    
    res.status(200).json(tags);
  } catch (error) {
    console.error('获取标签列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}
