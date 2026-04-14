/**
 * 管理员用户服务
 * 处理用户管理相关的业务逻辑
 */
import pool from '../../config/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import { buildPaginationSql } from '../../utils/pagination';

/**
 * 管理员用户服务
 */
export const AdminUserService = {
  /**
   * 获取用户列表（用于管理后台）
   * @param params 查询参数
   * @returns 用户列表和总记录数
   */
  async getUsers(params: { keyword?: string; page?: number; pageSize?: number }): Promise<{ list: any[]; total: number }> {
    try {
      const { keyword, page = 1, pageSize = 10 } = params;
      
      let query = 'SELECT * FROM users WHERE 1=1';
      const values: any[] = [];
      
      if (keyword) {
        query += ' AND (email LIKE ? OR username LIKE ?)';
        values.push(`%${keyword}%`, `%${keyword}%`);
      }
      
      const countQuery = query.replace('*', 'COUNT(*) as count');
      const [countResult] = await pool.execute(countQuery, values);
      const total = (countResult as RowDataPacket[])[0].count || 0;
      
      query += ` ORDER BY created_at DESC ${buildPaginationSql(page, pageSize)}`;
      
      const [usersResult] = await pool.execute(query, values);
      
      return {
        list: (usersResult as RowDataPacket[]).map(user => ({
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at
        })),
        total
      };
    } catch (error) {
      console.error('获取用户列表失败:', error);
      throw new Error('获取用户列表失败');
    }
  },

  /**
   * 切换用户状态（用于管理后台）
   * @param userId 用户ID
   * @param isActive 是否激活
   * @returns 是否操作成功
   */
  async toggleUserStatus(userId: number, isActive: boolean): Promise<boolean> {
    try {
      const [result] = await pool.execute('UPDATE users SET is_active = ? WHERE id = ?', [isActive, userId]);
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('切换用户状态失败:', error);
      throw new Error('切换用户状态失败');
    }
  },

  /**
   * 重置用户密码（用于管理后台）
   * @param userId 用户ID
   * @returns 新生成的明文密码
   */
  async resetPassword(userId: number): Promise<string> {
    try {
      // 生成随机密码
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let newPassword = '';
      for (let i = 0; i < 8; i++) {
        newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // 加密密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // 更新密码
      const [result] = await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
      
      if ((result as any).affectedRows > 0) {
        return newPassword;
      } else {
        throw new Error('密码重置失败');
      }
    } catch (error) {
      console.error('重置用户密码失败:', error);
      throw new Error('重置用户密码失败');
    }
  }
};