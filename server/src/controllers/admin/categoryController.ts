/**
 * 管理员分类控制器
 * 处理分类管理相关的HTTP请求
 */
import { Request, Response } from 'express';
import { CategoryService } from '../../services/admin/categoryService';

/**
 * 获取分类列表
 * @param req 请求对象
 * @param res 响应对象
 * @returns 分类列表和分页信息
 * @status 200 - 成功
 * @status 500 - 服务器内部错误
 */
export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const keyword = req.query.keyword as string;
    
    const { list, total } = await CategoryService.getCategories({
      page,
      pageSize,
      keyword
    });
    
    res.status(200).json({
      list,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 创建分类
 * @param req 请求对象
 * @param res 响应对象
 * @returns 创建的分类对象
 * @status 201 - 成功
 * @status 400 - 请求参数错误
 * @status 500 - 服务器内部错误
 */
export async function createCategory(req: Request, res: Response): Promise<void> {
  try {
    const { name, description } = req.body;
    
    // 验证 name 不能为空
    if (!name || name.trim() === '') {
      res.status(400).json({ message: '分类名称不能为空' });
      return;
    }
    
    const category = await CategoryService.createCategory(name, description);
    
    res.status(201).json(category);
  } catch (error) {
    console.error('创建分类失败:', error);
    if (error instanceof Error && error.message === '分类名称已存在') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 更新分类
 * @param req 请求对象
 * @param res 响应对象
 * @returns 更新后的分类对象
 * @status 200 - 成功
 * @status 400 - 请求参数错误
 * @status 404 - 分类不存在
 * @status 500 - 服务器内部错误
 */
export async function updateCategory(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);
    const { name, description } = req.body;
    
    // 验证 id 是有效数字
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: '无效的分类 ID' });
      return;
    }
    
    // 验证 name 不能为空
    if (!name || name.trim() === '') {
      res.status(400).json({ message: '分类名称不能为空' });
      return;
    }
    
    const category = await CategoryService.updateCategory(id, name, description);
    
    res.status(200).json(category);
  } catch (error) {
    console.error('更新分类失败:', error);
    if (error instanceof Error) {
      if (error.message === '分类不存在') {
        res.status(404).json({ message: error.message });
        return;
      } else if (error.message === '分类名称已存在') {
        res.status(400).json({ message: error.message });
        return;
      }
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 删除分类
 * @param req 请求对象
 * @param res 响应对象
 * @status 200 - 成功
 * @status 400 - 请求参数错误
 * @status 404 - 分类不存在
 * @status 409 - 有文章关联无法删除
 * @status 500 - 服务器内部错误
 */
export async function deleteCategory(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);
    
    // 验证 id 是有效数字
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: '无效的分类 ID' });
      return;
    }
    
    await CategoryService.deleteCategory(id);
    
    res.status(200).json({ message: '删除成功' });
  } catch (error) {
    console.error('删除分类失败:', error);
    if (error instanceof Error) {
      if (error.message === '分类不存在') {
        res.status(404).json({ message: error.message });
        return;
      } else if (error.message === '该分类下有文章，无法删除') {
        res.status(409).json({ message: error.message });
        return;
      }
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

export default {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};