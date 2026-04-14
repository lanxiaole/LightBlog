/**
 * 管理员认证服务
 * 处理管理员认证相关的业务逻辑
 */
import pool from '../../config/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

/**
 * 管理员认证服务
 */
export const AdminAuthService = {
  /**
   * 验证管理员用户
   * @param email 邮箱
   * @param password 密码
   * @returns 用户信息
   */
  async validateAdmin(email: string, password: string): Promise<any> {
    try {
      // 获取用户信息
      const [users] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
      const user = users[0];
      
      if (!user) {
        throw new Error('邮箱或密码错误');
      }
      
      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('邮箱或密码错误');
      }
      
      // 检查用户角色
      if (user.role !== 'admin') {
        throw new Error('非管理员用户');
      }
      
      // 检查用户状态
      if (!user.is_active) {
        throw new Error('账号已被禁用，请联系管理员');
      }
      
      return user;
    } catch (error) {
      console.error('验证管理员失败:', error);
      throw error;
    }
  }
};