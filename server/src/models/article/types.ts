import { Tag } from '../Tag';

// 定义作者接口
export interface Author {
  id: number;
  username: string;
  avatar: string | null;
  role: string;
}

// 定义 Article 接口
export interface Article {
  id: number;
  title: string;
  content: string;
  cover: string | null;
  author_id: number;
  category_id: number | null;
  status: string;
  views: number;
  likes: number;
  created_at: Date;
  updated_at: Date;
  author?: Author;
  category?: {
    id: number;
    name: string;
    description: string | null;
  };
  tags?: Tag[];
}
