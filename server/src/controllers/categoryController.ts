import { Request, Response } from 'express';
import { CategoryModel } from '../models/Category';

/**
 * 获取所有分类
 * @param req 请求对象
 * @param res 响应对象
 */
export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    // 调用模型方法获取所有分类
    const categories = await CategoryModel.getAllCategories();
    
    // 返回分类列表
    res.status(200).json(categories);
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}
