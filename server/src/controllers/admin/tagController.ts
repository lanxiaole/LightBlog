/**
 * 管理员标签控制器
 * 处理标签管理相关的HTTP请求
 */
import { Request, Response } from 'express';
import { TagService } from '../../services/admin/tagService';

/**
 * 获取标签列表
 * @param req 请求对象
 * @param res 响应对象
 * @returns 标签列表和分页信息
 * @status 200 - 成功
 * @status 500 - 服务器内部错误
 */
export async function getTags(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const keyword = req.query.keyword as string;
    
    const { list, total } = await TagService.getTags({
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
    console.error('获取标签列表失败:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 创建标签
 * @param req 请求对象
 * @param res 响应对象
 * @returns 创建的标签对象
 * @status 201 - 成功
 * @status 400 - 请求参数错误
 * @status 500 - 服务器内部错误
 */
export async function createTag(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.body;
    
    // 验证 name 不能为空
    if (!name || name.trim() === '') {
      res.status(400).json({ message: '标签名称不能为空' });
      return;
    }
    
    const tag = await TagService.createTag(name);
    
    res.status(201).json(tag);
  } catch (error) {
    console.error('创建标签失败:', error);
    if (error instanceof Error && error.message === '标签名称已存在') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 更新标签
 * @param req 请求对象
 * @param res 响应对象
 * @returns 更新后的标签对象
 * @status 200 - 成功
 * @status 400 - 请求参数错误
 * @status 404 - 标签不存在
 * @status 500 - 服务器内部错误
 */
export async function updateTag(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);
    const { name } = req.body;
    
    // 验证 id 是有效数字
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: '无效的标签 ID' });
      return;
    }
    
    // 验证 name 不能为空
    if (!name || name.trim() === '') {
      res.status(400).json({ message: '标签名称不能为空' });
      return;
    }
    
    const tag = await TagService.updateTag(id, name);
    
    res.status(200).json(tag);
  } catch (error) {
    console.error('更新标签失败:', error);
    if (error instanceof Error) {
      if (error.message === '标签不存在') {
        res.status(404).json({ message: error.message });
        return;
      } else if (error.message === '标签名称已存在') {
        res.status(400).json({ message: error.message });
        return;
      }
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

/**
 * 删除标签
 * @param req 请求对象
 * @param res 响应对象
 * @status 200 - 成功
 * @status 400 - 请求参数错误
 * @status 404 - 标签不存在
 * @status 409 - 有文章关联无法删除
 * @status 500 - 服务器内部错误
 */
export async function deleteTag(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string);
    
    // 验证 id 是有效数字
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: '无效的标签 ID' });
      return;
    }
    
    await TagService.deleteTag(id);
    
    res.status(200).json({ message: '删除成功' });
  } catch (error) {
    console.error('删除标签失败:', error);
    if (error instanceof Error) {
      if (error.message === '标签不存在') {
        res.status(404).json({ message: error.message });
        return;
      } else if (error.message === '该标签下存在文章，无法删除') {
        res.status(409).json({ message: error.message });
        return;
      }
    }
    res.status(500).json({ message: '服务器内部错误' });
  }
}

export default {
  getTags,
  createTag,
  updateTag,
  deleteTag
};