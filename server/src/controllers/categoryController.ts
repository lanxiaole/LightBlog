/**
 * 分类控制器
 * 处理分类相关的HTTP请求
 */
import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';

/**
 * 获取所有分类
 * @param req 请求对象
 * @param res 响应对象
 * @returns 分类列表
 * @status 200 - 成功
 * @status 500 - 服务器内部错误
 */
export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const categories = await CategoryService.getAllCategories();
    
    res.status(200).json(categories);
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取热门分类
 * @param req 请求对象
 * @param res 响应对象
 * @returns 热门分类列表
 * @status 200 - 成功
 * @status 500 - 服务器内部错误
 */
export async function getHotCategories(req: Request, res: Response): Promise<void> {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const categories = await CategoryService.getHotCategories(limit);
    
    res.status(200).json(categories);
  } catch (error) {
    console.error('获取热门分类失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}
