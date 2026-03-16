import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

// 定义 Follow 接口
export interface Follow {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: Date;
}

// 导出 FollowModel 对象
export const FollowModel = {
  /**
   * 关注用户
   * @param followerId 关注者 ID
   * @param followingId 被关注者 ID
   * @returns 是否关注成功
   */
  async follow(followerId: number, followingId: number): Promise<boolean> {
    try {
      const sql = `
        INSERT INTO follows (follower_id, following_id, created_at)
        VALUES (?, ?, NOW())
      `;
      
      const [result] = await pool.execute<RowDataPacket[]>(sql, [followerId, followingId]);
      return (result as any).affectedRows > 0;
    } catch (error) {
      // 忽略重复插入错误
      if ((error as any).code === 'ER_DUP_ENTRY') {
        return true;
      }
      throw error;
    }
  },
  
  /**
   * 取消关注用户
   * @param followerId 关注者 ID
   * @param followingId 被关注者 ID
   * @returns 是否取消关注成功
   */
  async unfollow(followerId: number, followingId: number): Promise<boolean> {
    const sql = `
      DELETE FROM follows
      WHERE follower_id = ? AND following_id = ?
    `;
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, [followerId, followingId]);
    return (result as any).affectedRows > 0;
  },
  
  /**
   * 检查是否已关注
   * @param followerId 关注者 ID
   * @param followingId 被关注者 ID
   * @returns 是否已关注
   */
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as count
      FROM follows
      WHERE follower_id = ? AND following_id = ?
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [followerId, followingId]);
    return (rows[0] as any).count > 0;
  },
  
  /**
   * 获取粉丝数
   * @param userId 用户 ID
   * @returns 粉丝数
   */
  async getFollowersCount(userId: number): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count
      FROM follows
      WHERE following_id = ?
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId]);
    return (rows[0] as any).count;
  },
  
  /**
   * 获取关注数
   * @param userId 用户 ID
   * @returns 关注数
   */
  async getFollowingCount(userId: number): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count
      FROM follows
      WHERE follower_id = ?
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId]);
    return (rows[0] as any).count;
  },
  
  /**
   * 获取粉丝列表
   * @param userId 用户 ID
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 粉丝列表和总数
   */
  async getFollowers(userId: number, page: number, pageSize: number): Promise<{ list: any[]; total: number }> {
    // 确保参数是有效的数字
    const validPage = Math.max(1, Number(page));
    const validPageSize = Math.max(1, Math.min(100, Number(pageSize)));
    // 计算偏移量
    const offset = (validPage - 1) * validPageSize;
    
    // 获取粉丝列表
    const listSql = `
      SELECT u.id, u.username, u.avatar, u.bio, u.created_at
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ${Number(userId)}
      ORDER BY f.created_at DESC
      LIMIT ${validPageSize} OFFSET ${offset}
    `;
    
    const [listRows] = await pool.execute<RowDataPacket[]>(listSql);
    
    // 获取粉丝总数
    const totalSql = `
      SELECT COUNT(*) as total
      FROM follows
      WHERE following_id = ${Number(userId)}
    `;
    
    const [totalRows] = await pool.execute<RowDataPacket[]>(totalSql);
    const total = (totalRows[0] as any).total;
    
    return {
      list: listRows,
      total
    };
  },
  
  /**
   * 获取关注列表
   * @param userId 用户 ID
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 关注列表和总数
   */
  async getFollowing(userId: number, page: number, pageSize: number): Promise<{ list: any[]; total: number }> {
    // 确保参数是有效的数字
    const validPage = Math.max(1, Number(page));
    const validPageSize = Math.max(1, Math.min(100, Number(pageSize)));
    // 计算偏移量
    const offset = (validPage - 1) * validPageSize;
    
    // 获取关注列表
    const listSql = `
      SELECT u.id, u.username, u.avatar, u.bio, u.created_at
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ${Number(userId)}
      ORDER BY f.created_at DESC
      LIMIT ${validPageSize} OFFSET ${offset}
    `;
    
    const [listRows] = await pool.execute<RowDataPacket[]>(listSql);
    
    // 获取关注总数
    const totalSql = `
      SELECT COUNT(*) as total
      FROM follows
      WHERE follower_id = ${Number(userId)}
    `;
    
    const [totalRows] = await pool.execute<RowDataPacket[]>(totalSql);
    const total = (totalRows[0] as any).total;
    
    return {
      list: listRows,
      total
    };
  }
};
