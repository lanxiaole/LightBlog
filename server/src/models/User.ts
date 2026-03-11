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
  }
};
