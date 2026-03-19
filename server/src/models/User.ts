import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

// 定义 User 接口
export interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  avatar: string | null;
  bio: string | null;
  role: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// 导出 UserModel 对象
export const UserModel = {
  /**
   * 创建新用户
   * @param email 邮箱
   * @param username 用户名
   * @param password 密码（已加密）
   * @returns 插入的用户 ID
   */
  async createUser(email: string, username: string, password: string): Promise<number> {
    const sql = `
      INSERT INTO users (email, username, password, avatar, bio, created_at, updated_at)
      VALUES (?, ?, ?, NULL, NULL, NOW(), NOW())
    `;
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, [email, username, password]);
    return (result as any).insertId;
  },
  
  /**
   * 根据邮箱查找用户
   * @param email 邮箱
   * @returns 用户对象或 null
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT id, email, username, password, avatar, bio, role, is_active, created_at, updated_at FROM users WHERE email = ?';
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [email]);
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  },
  
  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户对象或 null
   */
  async findUserByUsername(username: string): Promise<User | null> {
    const sql = 'SELECT id, email, username, password, avatar, bio, role, is_active, created_at, updated_at FROM users WHERE username = ?';
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [username]);
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  },
  
  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户对象或 null
   */
  async findUserById(id: number): Promise<User | null> {
    const sql = 'SELECT id, email, username, password, avatar, bio, role, is_active, created_at, updated_at FROM users WHERE id = ?';
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [id]);
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  },
  
  /**
   * 根据用户名查询用户，返回除密码外的所有字段
   * @param username 用户名
   * @returns 除密码外的用户对象或 null
   */
  async getPublicUserByUsername(username: string): Promise<Omit<User, 'password'> | null> {
    const sql = 'SELECT id, email, username, avatar, bio, created_at, updated_at FROM users WHERE username = ?';
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [username]);
    const users = rows as Omit<User, 'password'>[];
    return users.length > 0 ? users[0] : null;
  },
  
  /**
   * 更新用户资料
   * @param userId 用户 ID
   * @param data 要更新的字段
   * @returns 更新成功返回 true
   */
  async updateUserProfile(userId: number, data: { username?: string; bio?: string; avatar?: string }): Promise<boolean> {
    const setClauses: string[] = [];
    const params: any[] = [];
    
    if (data.username !== undefined) {
      setClauses.push('username = ?');
      params.push(data.username);
    }
    
    if (data.bio !== undefined) {
      setClauses.push('bio = ?');
      params.push(data.bio);
    }
    
    if (data.avatar !== undefined) {
      setClauses.push('avatar = ?');
      params.push(data.avatar);
    }
    
    if (setClauses.length === 0) {
      return true;
    }
    
    setClauses.push('updated_at = NOW()');
    params.push(userId);
    
    const sql = `
      UPDATE users
      SET ${setClauses.join(', ')}
      WHERE id = ?
    `;
    
    const [result] = await pool.execute<RowDataPacket[]>(sql, params);
    
    return (result as any).affectedRows > 0;
  },

  /**
   * 获取用户列表
   * @param params 查询参数
   * @param params.keyword 搜索关键词（可选），支持按邮箱或用户名模糊搜索
   * @param params.page 页码（可选），默认为 1
   * @param params.pageSize 每页数量（可选），默认为 10，最大 100
   * @returns 用户列表和总记录数
   */
  async getUsers(params: { keyword?: string; page?: number; pageSize?: number }): Promise<{ list: User[]; total: number }> {
    const { keyword = '', page = 1, pageSize = 10 } = params;
    const validPage = Math.max(1, Number(page));
    const validPageSize = Math.max(1, Math.min(100, Number(pageSize)));
    const offset = (validPage - 1) * validPageSize;

    let whereClause = '';
    let queryParams: any[] = [];

    if (keyword) {
      whereClause = 'WHERE email LIKE ? OR username LIKE ?';
      queryParams = [`%${keyword}%`, `%${keyword}%`];
    }

    const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const [countResult] = await pool.execute<RowDataPacket[]>(countSql, queryParams);
    const total = (countResult[0] as any).total;

    const listSql = `
      SELECT id, email, username, password, avatar, bio, role, is_active, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${validPageSize} OFFSET ${offset}
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(listSql, queryParams);
    const list = rows as User[];

    return { list, total };
  },

  /**
   * 切换用户状态
   * @param userId 用户 ID
   * @param isActive 是否激活
   * @returns 更新成功返回 true
   */
  async toggleUserStatus(userId: number, isActive: boolean): Promise<boolean> {
    const sql = 'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?';
    const [result] = await pool.execute<RowDataPacket[]>(sql, [isActive, userId]);
    return (result as any).affectedRows > 0;
  },

  /**
   * 更新用户密码
   * @param userId 用户 ID
   * @param hashedPassword 加密后的密码
   * @returns 更新成功返回 true
   */
  async updatePassword(userId: number, hashedPassword: string): Promise<boolean> {
    const sql = 'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?';
    const [result] = await pool.execute<RowDataPacket[]>(sql, [hashedPassword, userId]);
    return (result as any).affectedRows > 0;
  }
};
