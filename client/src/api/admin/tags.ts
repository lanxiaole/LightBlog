import api from '../index';

/**
 * 标签类型
 */
export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

/**
 * 获取标签列表的响应类型
 */
export interface GetTagsResponse {
  list: Tag[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取标签列表
 * @param params 查询参数
 * @returns 标签列表和分页信息
 */
export async function getTags(params?: { page?: number; pageSize?: number; keyword?: string }): Promise<GetTagsResponse> {
  try {
    const response = await api.get<GetTagsResponse>('/admin/tags', {
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
    throw { message: '获取标签列表失败' };
  }
}

/**
 * 创建标签
 * @param name 标签名称
 * @returns 创建的标签对象
 */
export async function createTag(name: string): Promise<Tag> {
  try {
    const response = await api.post<Tag>('/admin/tags', { name });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: '创建标签失败' };
  }
}

/**
 * 更新标签
 * @param id 标签ID
 * @param name 标签名称
 * @returns 更新后的标签对象
 */
export async function updateTag(id: number, name: string): Promise<Tag> {
  try {
    const response = await api.put<Tag>(`/admin/tags/${id}`, { name });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: '更新标签失败' };
  }
}

/**
 * 删除标签
 * @param id 标签ID
 */
export async function deleteTag(id: number): Promise<void> {
  try {
    await api.delete(`/admin/tags/${id}`);
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: '删除标签失败' };
  }
}