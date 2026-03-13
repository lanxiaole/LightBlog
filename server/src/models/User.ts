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
    const sql = 'SELECT * FROM users WHERE email = ?';
    
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
    const sql = 'SELECT * FROM users WHERE username = ?';
    
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
    const sql = 'SELECT * FROM users WHERE id = ?';
    
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
    // 构建 SET 子句和参数
    const setClauses: string[] = [];
    const params: any[] = [];
    
    // 动态添加要更新的字段
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
    
    // 如果没有要更新的字段，直接返回 true
    if (setClauses.length === 0) {
      return true;
    }
    
    // 添加 updated_at 字段
    setClauses.push('updated_at = NOW()');
    
    // 添加 userId 到参数列表
    params.push(userId);
    
    // 构建完整的 SQL 语句
    const sql = `
      UPDATE users
      SET ${setClauses.join(', ')}
      WHERE id = ?
    `;
    
    // 执行更新
    const [result] = await pool.execute<RowDataPacket[]>(sql, params);
    
    // 检查是否更新成功
    return (result as any).affectedRows > 0;
  }
};
