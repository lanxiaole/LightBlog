import api from '../index';

/**
 * 分类类型
 */
export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

/**
 * 获取分类列表的响应类型
 */
export interface GetCategoriesResponse {
  list: Category[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取分类列表
 * @param params 查询参数
 * @returns 分类列表和分页信息
 */
export async function getCategories(params?: { page?: number; pageSize?: number; keyword?: string }): Promise<GetCategoriesResponse> {
  try {
    const response = await api.get<GetCategoriesResponse>('/admin/categories', {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        keyword: params?.keyword
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: '获取分类列表失败' };
  }
}

/**
 * 创建分类
 * @param data 分类数据
 * @returns 创建的分类对象
 */
export async function createCategory(data: { name: string; description?: string }): Promise<Category> {
  try {
    const response = await api.post<Category>('/admin/categories', data);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: '创建分类失败' };
  }
}

/**
 * 更新分类
 * @param id 分类ID
 * @param data 分类数据
 * @returns 更新后的分类对象
 */
export async function updateCategory(id: number, data: { name: string; description?: string }): Promise<Category> {
  try {
    const response = await api.put<Category>(`/admin/categories/${id}`, data);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: '更新分类失败' };
  }
}

/**
 * 删除分类
 * @param id 分类ID
 */
export async function deleteCategory(id: number): Promise<void> {
  try {
    await api.delete(`/admin/categories/${id}`);
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: '删除分类失败' };
  }
}