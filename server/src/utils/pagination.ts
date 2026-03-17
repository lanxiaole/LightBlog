/**
 * 分页工具函数
 * 统一处理分页参数的验证和 SQL 子句构建
 */

/**
 * 验证并转换分页参数
 * @param page 页码（任意类型）
 * @param pageSize 每页数量（任意类型）
 * @returns 验证后的分页参数对象
 */
export function validatePagination(
  page: any,
  pageSize: any
): { page: number; pageSize: number; offset: number; limit: number } {
  // 转换为数字并确保是有效值
  const validPage = Math.max(1, Number(page) || 1);
  const validPageSize = Math.max(1, Math.min(100, Number(pageSize) || 10));

  // 计算偏移量
  const offset = (validPage - 1) * validPageSize;

  return {
    page: validPage,
    pageSize: validPageSize,
    offset,
    limit: validPageSize
  };
}

/**
 * 构建分页子句（参数化查询）
 * @param page 页码
 * @param pageSize 每页数量
 * @returns SQL 子句和参数值
 */
export function buildPaginationClause(
  page: number,
  pageSize: number
): { sql: string; values: number[] } {
  // 验证并转换参数
  const { offset, limit } = validatePagination(page, pageSize);

  // 返回参数化查询的 SQL 子句
  return {
    sql: 'LIMIT ? OFFSET ?',
    values: [limit, offset]
  };
}

/**
 * 直接构建分页 SQL（需谨慎使用，确保参数已验证）
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 拼接好的 SQL 子句
 */
export function buildPaginationSql(
  page: number,
  pageSize: number
): string {
  // 验证并转换参数
  const { offset, limit } = validatePagination(page, pageSize);

  // 直接拼接 SQL（仅在参数已验证的情况下使用）
  return `LIMIT ${limit} OFFSET ${offset}`;
}
