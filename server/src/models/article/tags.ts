import pool from '../../config/db';
import { RowDataPacket } from 'mysql2';
import { Tag } from '../Tag';

// 导出文章标签相关操作
export const ArticleTagModel = {
  /**
   * 为文章添加标签
   * @param articleId 文章 ID
   * @param tagIds 标签 ID 数组
   */
  async addArticleTags(articleId: number, tagIds: number[]): Promise<void> {
    if (tagIds.length === 0) {
      return;
    }
    
    // 构建批量插入的 SQL 语句
    const placeholders = tagIds.map(() => '(?, ?)').join(', ');
    const values = tagIds.flatMap(tagId => [articleId, tagId]);
    
    const sql = `
      INSERT INTO article_tags (article_id, tag_id)
      VALUES ${placeholders}
    `;
    
    await pool.execute<RowDataPacket[]>(sql, values);
  },
  
  /**
   * 删除文章的所有标签
   * @param articleId 文章 ID
   */
  async removeArticleTags(articleId: number): Promise<void> {
    const sql = 'DELETE FROM article_tags WHERE article_id = ?';
    
    await pool.execute<RowDataPacket[]>(sql, [articleId]);
  },
  
  /**
   * 获取文章的所有标签
   * @param articleId 文章 ID
   * @returns 标签列表
   */
  async getArticleTags(articleId: number): Promise<Tag[]> {
    const sql = `
      SELECT t.*
      FROM tags t
      JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?
      ORDER BY t.name ASC
    `;
    
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [articleId]);
    const tags = rows as Tag[];
    return tags;
  }
};
