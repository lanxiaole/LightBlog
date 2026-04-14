/**
 * 管理员文章控制器
 * 处理文章管理相关的HTTP请求
 */
import { Request, Response } from 'express';
import { AdminService } from '../../services/admin/adminService';

/**
 * 删除文章（管理后台）
 * @param req 请求对象
 * @param res 响应对象
 * @returns 操作结果
 * @status 200 - 成功
 * @status 400 - 无效的文章ID
 * @status 500 - 服务器内部错误
 */
export async function adminDeleteArticle(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);
    
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }
    
    const success = await AdminService.adminDeleteArticle(id);
    
    if (success) {
      res.status(200).json({ message: '删除成功' });
    } else {
      res.status(500).json({ message: '操作失败' });
    }
  } catch (error) {
    console.error('删除文章失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 获取所有文章（管理后台）
 * @param req 请求对象
 * @param res 响应对象
 * @returns 文章列表和分页信息
 * @status 200 - 成功
 * @status 500 - 服务器内部错误
 */
export async function getAllArticles(req: Request, res: Response): Promise<void> {
  try {
    const keyword = req.query.keyword as string;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    
    const { list, total } = await AdminService.getAllArticles({
      keyword,
      categoryId,
      status,
      page,
      pageSize
    });
    
    res.status(200).json({
      list,
      total,
      page,
      pageSize
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 设置文章置顶状态
 * @param req 请求对象
 * @param res 响应对象
 * @returns 操作结果
 * @status 200 - 成功
 * @status 400 - 无效的文章ID
 * @status 500 - 服务器内部错误
 */
export async function togglePin(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);
    const { isPinned } = req.body;
    
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }
    
    const success = await AdminService.togglePin(id, isPinned);
    
    if (success) {
      res.status(200).json({ message: '置顶状态更新成功' });
    } else {
      res.status(500).json({ message: '操作失败' });
    }
  } catch (error) {
    console.error('更新置顶状态失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 更新文章状态
 * @param req 请求对象
 * @param res 响应对象
 * @returns 操作结果
 * @status 200 - 成功
 * @status 400 - 无效的文章ID
 * @status 500 - 服务器内部错误
 */
export async function updateStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);
    const { status } = req.body;
    
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: '无效的文章ID' });
      return;
    }
    
    const success = await AdminService.updateArticleStatus(id, status);
    
    if (success) {
      res.status(200).json({ message: '状态更新成功' });
    } else {
      res.status(500).json({ message: '操作失败' });
    }
  } catch (error) {
    console.error('更新文章状态失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

export default {
  adminDeleteArticle,
  getAllArticles,
  togglePin,
  updateStatus
};