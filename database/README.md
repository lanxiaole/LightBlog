# LightBlog 数据库初始化指南

## 📋 文件说明

| 文件                   | 说明                                  |
| ---------------------- | ------------------------------------- |
| `schema.sql`           | 数据库表结构和初始化数据的完整SQL脚本 |
| `generate-password.js` | 密码加密工具，用于生成bcrypt哈希值    |

## 🚀 快速开始

### 1️⃣ 创建并初始化数据库

```bash
# 方法1：直接执行SQL文件
mysql -u root -p < database/schema.sql

# 方法2：在MySQL命令行中执行
mysql -u root -p
# 进入MySQL后：
source database/schema.sql
```

### 2️⃣ 生成管理员密码

```bash
# 进入server目录
cd server

# 安装依赖（如果还没安装）
npm install

# 返回项目根目录
cd ..

# 生成密码（将 lejiawei1 替换为你想设置的密码）
node database/generate-password.js lejiawei1
```

### 3️⃣ 创建管理员账号

复制生成的哈希值，然后在MySQL中创建管理员：

```sql
-- 登录MySQL
mysql -u root -p

-- 选择数据库
USE lightblog;

-- 创建管理员账号（将下面的哈希值替换为你生成的）
INSERT INTO users (email, username, password, role) VALUES
('lanxiaole@admin.com', 'lanxiaole', '$2b$10$你的真实哈希值', 'admin'),
('weijiale@admin.com', 'weijiale', 'lejiawei1');

-- 如果需要修改密码：
UPDATE users SET password = '$2b$10$你的真实哈希值' WHERE email = 'lanxiaole@admin.com';
UPDATE users SET password = '$2b$10$你的真实哈希值' WHERE email = 'weijiale@admin.com';
```

## 👤 推荐管理员账号

| 邮箱                | 用户名    | 默认密码  |
| ------------------- | --------- | --------- |
| lanxiaole@admin.com | lanxiaole | lejiawei1 |
| weijiale@admin.com  | weijiale  | lejiawei1 |

**⚠️ 重要：请务必在首次使用后修改默认密码！**

## 📊 数据库表结构

项目包含以下数据表：

| 表名            | 说明            |
| --------------- | --------------- |
| `users`         | 用户表          |
| `categories`    | 文章分类表      |
| `tags`          | 文章标签表      |
| `articles`      | 文章表          |
| `article_tags`  | 文章-标签关联表 |
| `comments`      | 评论表          |
| `likes`         | 点赞表          |
| `favorites`     | 收藏表          |
| `follows`       | 关注表          |
| `notifications` | 通知表          |

## ✨ 特色功能

- **Fulltext 索引**：文章表支持 ngram 分词器，支持中文全文搜索
- **Is_pinned 字段**：支持文章置顶功能
- **完整的外键约束**：确保数据一致性

## 🔧 自定义初始化数据

如果你想添加更多初始数据，可以编辑 `database/schema.sql` 文件底部的 INSERT 语句部分。

## ⚠️ 安全提示

1. **不要将 `.env` 文件提交到 Git** - 该文件包含数据库密码等敏感信息
2. **修改默认密码** - 首次部署后立即修改管理员密码
3. **使用强密码** - 生产环境使用复杂密码
4. **限制数据库用户权限** - 不要使用 root 用户运行应用
5. **定期备份数据库** - 防止数据丢失
