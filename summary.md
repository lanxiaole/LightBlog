# 一、项目概述

LightBlog 是一个完整的全栈博客系统，前端采用 Vue3 + TypeScript + Element Plus，后端采用 Node.js + Express + MySQL + TypeScript。项目实现了用户注册登录、文章发布管理、分类标签、评论回复、点赞收藏、关注通知等完整的博客功能。

# 二、数据库设计

整个系统的数据模型围绕用户和文章两个核心实体展开，通过外键关联实现了社交功能和内容管理。

## 2.1 用户表

最基础的用户表，存储用户基本信息和登录凭证：

```sql
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `bio` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

后续扩展——增加角色字段以区分管理员和普通用户：

```sql
ALTER TABLE `users` ADD COLUMN `role` enum('user','admin') NOT NULL DEFAULT 'user' AFTER `bio`;
```

后续扩展——增加账号状态字段以支持禁用功能：

```sql
ALTER TABLE `users` ADD COLUMN `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '账号状态：1启用，0禁用' AFTER `role`;
```

插入管理员账号（密码先用占位符，稍后使用 bcrypt 加密更新）：

```sql
INSERT INTO `users` (`email`, `username`, `password`, `role`, `created_at`, `updated_at`) VALUES
('lanxiaole@admin.com', 'lanxiaole', 'placeholder', 'admin', NOW(), NOW()),
('weijiale@admin.com', 'weijiale', 'placeholder', 'admin', NOW(), NOW());
```

密码加密工具代码：在 Node.js 环境中执行，生成 bcrypt 哈希后手动更新数据库。

```javascript
const bcrypt = require("bcryptjs");
const password = "your_password";
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
console.log(hash); // 把输出的哈希值复制到 SQL UPDATE 语句中
```

然后执行：

```sql
UPDATE `users` SET `password` = '哈希值1' WHERE `email` = 'lanxiaole@admin.com';
UPDATE `users` SET `password` = '哈希值2' WHERE `email` = 'weijiale@admin.com';
```

## 2.2 文章表

核心内容表，每篇文章关联一个作者：

```sql
CREATE TABLE `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `cover` varchar(255) DEFAULT NULL,
  `author_id` int NOT NULL,
  `status` enum('draft','published') DEFAULT 'published',
  `views` int DEFAULT 0,
  `likes` int DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

后续扩展——增加分类字段：

```sql
ALTER TABLE `articles` ADD COLUMN `category_id` int DEFAULT NULL AFTER `author_id`;
ALTER TABLE `articles` ADD CONSTRAINT `articles_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;
```

重要修复——修改 status 字段枚举以支持下架功能（添加 banned 值）：

```sql
ALTER TABLE `articles` MODIFY COLUMN `status` enum('draft','published','banned') DEFAULT 'published';
```

经验总结：如果前端点击"下架"按钮后出现 500 错误，基本上就是数据库表结构中 status 字段的枚举列表缺少了 'banned' 值。这是上线后才发现的问题，因为最早设计表结构时只考虑了"草稿"和"发布"两种状态，没想到后来需要一个"下架/封禁"的状态。

后续扩展——创建全文索引以支持文章搜索：

```sql
ALTER TABLE `articles` ADD FULLTEXT INDEX `ft_title_content` (`title`, `content`) WITH PARSER ngram;
```

## 2.3 分类表

```sql
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 2.4 标签表及关联表

标签表：

```sql
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

文章-标签多对多关联表：

```sql
CREATE TABLE `article_tags` (
  `article_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`article_id`, `tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `article_tags_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `article_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 2.5 评论表

支持一级评论和回复（通过 parent_id 自引用实现嵌套）：

```sql
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `article_id` int NOT NULL,
  `user_id` int NOT NULL,
  `parent_id` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `article_id` (`article_id`),
  KEY `user_id` (`user_id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 2.6 点赞表

使用联合主键确保同一用户对同一文章只能点赞一次：

```sql
CREATE TABLE `likes` (
  `user_id` int NOT NULL,
  `article_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `article_id`),
  KEY `article_id` (`article_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 2.7 收藏表

结构与点赞表类似：

```sql
CREATE TABLE `favorites` (
  `user_id` int NOT NULL,
  `article_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `article_id`),
  KEY `article_id` (`article_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 2.8 关注表

用 follower_id 和 following_id 分别记录"关注的人"和"被关注的人"：

```sql
CREATE TABLE `follows` (
  `follower_id` int NOT NULL COMMENT '关注者 ID',
  `following_id` int NOT NULL COMMENT '被关注者 ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`follower_id`, `following_id`),
  KEY `following_id` (`following_id`),
  CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 2.9 通知表

支持多种通知类型（评论、回复、点赞、收藏、关注），关联文章和评论：

```sql
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('comment','reply','like','favorite','follow') NOT NULL COMMENT '通知类型',
  `sender_id` int NOT NULL COMMENT '触发通知的用户ID',
  `receiver_id` int NOT NULL COMMENT '接收通知的用户ID',
  `article_id` int DEFAULT NULL COMMENT '关联文章ID（如果适用）',
  `comment_id` int DEFAULT NULL COMMENT '关联评论ID（如果适用）',
  `is_read` tinyint(1) DEFAULT '0' COMMENT '是否已读',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `receiver_id` (`receiver_id`),
  KEY `sender_id` (`sender_id`),
  KEY `article_id` (`article_id`),
  KEY `comment_id` (`comment_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_4` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

# 三、系统架构

## 3.1 前端架构

技术栈：Vue 3 + TypeScript + Element Plus + Vue Router + Pinia

文件组织：

- `components/` — 全局共享组件（如导航栏、侧边栏、文章卡片、评论组件等）
- `composables/` — 组合式函数（如 useUserIdFromUsername、useFavorite 等封装的业务逻辑）
- `api/` — API 接口封装（axios 实例 + 请求拦截器 + 各模块 API 函数）
- `views/` — 页面视图（首页、文章详情、用户中心、后台管理等）
- `stores/` — Pinia 状态管理（用户状态、文章状态等）

## 3.2 后端架构

技术栈：Node.js + Express + MySQL + TypeScript

文件组织：

- `controllers/` — 控制器层，处理 HTTP 请求和响应
- `models/` — 数据模型层，封装数据库查询逻辑
- `routes/` — 路由层，定义 API 端点和中间件
- `middlewares/` — 中间件（认证中间件、管理员权限中间件等）
- `types/` — TypeScript 类型定义

## 3.3 数据流向

```
前端请求 (getUserArticles)
       ↓
后端路由 → Controller → Model
       ↓
SQL 查询 (含子查询计算统计字段)
       ↓
返回 { list, total }
       ↓
前端累加统计 → 更新 UI
```

# 四、项目启动流程

## 后端启动

```bash
cd server
npm install
npm run build
npm run start
```

## 前端启动

```bash
cd client
npm install
npm run dev
# 访问 http://localhost:5173
```

# 五、开发环境配置

| 配置项       | 说明                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| Vue 插件     | 使用 Vue Official，不要用旧版 volar                                                         |
| Element Plus | 手动导入：`import ElementPlus from 'element-plus'` + `import 'element-plus/dist/index.css'` |
| TypeScript   | tsconfig.app.json 中设置 `"noImplicitAny": false`                                           |
| ESLint       | eslint.config.ts 中关闭 `'@typescript-eslint/no-explicit-any': 'off'`                       |

# 六、核心问题排查与解决方案

以下是项目开发过程中遇到的所有重要问题，按类别整理。每个问题都记录了现象、原因、解决方案和关键代码。

## 6.1 通用问题：404 和 500 错误深度排查

这是项目中最复杂、最常反复出现的问题，需要从前后端两个层面来理解。

**问题现象**

- 404 错误：访问粉丝列表和关注列表页面时返回 404 错误
- 500 错误：修复 404 后，出现 "Incorrect arguments to mysqld_stmt_execute" 错误

**根本原因**

1. 前端问题 — 路由参数与 API 参数不匹配

前端路由使用 username 作为参数（如 /user/lanxiaole/followers），因为用户名对用户更友好、可读性更强。但后端 API 需要 userId 作为参数（如 /users/9/followers），因为用户 ID 是唯一且不变的（而用户名可能被修改）。代码中用了占位符 0 作为用户 ID，导致 API 调用失败。

背景解释：为什么路由用 username 而 API 用 userId？这是 Web 开发的常见权衡——URL 应该对人类友好（/user/lanxiaole 比 /user/9 更好看也更 SEO），但数据库查询用唯一且不变的 id 更高效安全。所以需要在中间做一次转换。

2. 后端问题 — MySQL 参数类型限制

使用参数化查询时，LIMIT 和 OFFSET 子句的参数类型与 MySQL 预期不符。这是 MySQL 驱动的一个已知限制：当使用参数化查询时，MySQL 驱动会将所有参数视为字符串类型传递给 MySQL 服务器。虽然 MySQL 通常会自动转换类型（比如 '123' 自动转成 123），但在 LIMIT 和 OFFSET 子句中，这种自动转换会失败，导致 "Incorrect arguments to mysqld_stmt_execute" 错误。

背景解释：前端传参时，即使是数字类型，在 HTTP 请求中也会被序列化为字符串（URL 参数本身就是字符串）。Express 的 req.query.page 接收到的是字符串 "1"，而不是数字 1。如果直接把这个字符串传给参数化查询的 LIMIT ?，MySQL 就蒙了。

**解决方案**

前端 — 用户名转用户 ID

需要先从路由获取 username 参数，然后通过 getUserProfile API 获取用户信息，从中提取出用户 ID，最后用这个 ID 调用关注相关的 API。

```typescript
const fetchFollowers = async () => {
  if (!username.value) return;

  // 第一步：通过用户名获取用户信息（包含 userId）
  const userProfile = await getUserProfile(username.value);
  targetUserId.value = userProfile.id;

  // 第二步：用获取到的 userId 调用关注 API
  const response = await getFollowers(targetUserId.value, {
    page: page.value,
    pageSize: pageSize.value,
  });
  list.value = response.list;
  total.value = response.total;
};
```

后端 — 参数验证后直接拼接 SQL

先将参数用 Number() 和 Math.max()/Math.min() 验证并转换为有效数字，然后直接拼接到 SQL 语句中（而不是用参数化查询的 ? 占位符）。这样做是安全的，因为参数已经被严格验证过，不可能包含 SQL 注入代码。

```typescript
async getFollowers(userId: number, page: number, pageSize: number) {
  // 严格验证参数，确保是有效且安全的数字
  const validPage = Math.max(1, Number(page));
  const validPageSize = Math.max(1, Math.min(100, Number(pageSize)));
  const offset = (validPage - 1) * validPageSize;

  // 直接拼接（已验证，安全）
  const listSql = `
    SELECT u.id, u.username, u.avatar, u.bio, u.created_at
    FROM follows f
    JOIN users u ON f.follower_id = u.id
    WHERE f.following_id = ${Number(userId)}
    ORDER BY f.created_at DESC
    LIMIT ${validPageSize} OFFSET ${offset}
  `;

  const [listRows] = await pool.execute<RowDataPacket[]>(listSql);
  // ...
}
```

**预防措施**

前端：使用已封装的 useUserIdFromUsername 组合式函数统一处理。

这个函数封装在 `client/src/composables/user/useUserIdFromUsername.ts` 中，所有需要"用户名转ID"的页面都应该用它，而不是自己写转换逻辑。

```typescript
import { useUserIdFromUsername } from "@/composables/user/useUserIdFromUsername";

const { userId, loading, error } = useUserIdFromUsername(username);

// 监听 userId 变化，自动调用后续 API
watch(userId, (newUserId) => {
  if (newUserId) {
    fetchFollowers(newUserId);
  }
});
```

后端：使用已封装的 buildPaginationSql 工具函数。

这个函数封装在 `server/src/utils/pagination.ts` 中，负责验证分页参数并生成安全的 SQL 片段。

```typescript
import { buildPaginationSql } from '../utils/pagination';

async getFollowers(userId: number, page: number, pageSize: number) {
  const paginationSql = buildPaginationSql(page, pageSize);

  const listSql = `
    SELECT u.id, u.username, u.avatar, u.bio, u.created_at
    FROM follows f
    JOIN users u ON f.follower_id = u.id
    WHERE f.following_id = ${Number(userId)}
    ORDER BY f.created_at DESC
    ${paginationSql}
  `;

  const [listRows] = await pool.execute<RowDataPacket[]>(listSql);
  // ...
}
```

技术要点总结：buildPaginationSql 函数会先用 validatePagination 验证并转换参数为有效数字，然后直接拼接。这种方式安全是因为：参数被严格限制了范围（pageSize 最大 100），且只包含数字，不可能构成 SQL 注入。

**为什么这个问题会反复出现？**

前端层面：路由设计（username）和 API 设计（userId）天然不一致。每次创建新页面时，只要涉及用户相关操作，都需要处理这种转换。没有统一的工具函数之前，很容易忘。

后端层面：MySQL 驱动在 LIMIT 和 OFFSET 上的参数化查询限制是一个"坑"，每次实现分页查询时都可能遇到。

## 6.2 后端问题汇总

### 6.2.1 文章列表获取失败（500 错误）

现象：前端获取文章列表时 500 错误，后端日志显示 Incorrect arguments to mysqld_stmt_execute

原因：MySQL 参数化查询对 LIMIT 和 OFFSET 的类型转换失败

解决：修改 Article.ts 文件，先将 pageSize 和 offset 用 Number() 转换，然后直接拼接进 SQL（而不是用参数化查询的 ? 占位符）

```typescript
const validPage = Math.max(1, Number(page));
const validPageSize = Math.max(1, Math.min(100, Number(pageSize)));
const offset = (validPage - 1) * validPageSize;

const listSql = `
  SELECT * FROM articles
  WHERE status = 'published'
  ORDER BY created_at DESC
  LIMIT ${validPageSize} OFFSET ${offset}
`;
```

### 6.2.2 新增路由返回 404

现象：新增的用户信息接口（如 /api/auth/me）返回 404

原因：后端服务器没有重启，新添加的路由没有生效

解决：杀掉占用端口的进程后重新启动

```bash
# 查找占用 3000 端口的进程
netstat -ano | findstr :3000
# 强制终止该进程
taskkill /PID [进程ID] /F
# 重新启动
npm run dev
```

经验总结：后端每次新增或修改路由后，都需要重启服务才能生效。不像前端的热更新，Express 默认不会自动重载路由。

### 6.2.3 Express Request 类型扩展失败

现象：TypeScript 报错 Property 'user' does not exist on type 'Request'，在认证中间件和控制器中都出现

原因：在 auth.ts 中间件里直接声明命名空间扩展 Request 类型是无效的，TypeScript 无法跨文件识别

解决：创建 server/src/types/express.d.ts 文件，在全局命名空间中扩展 Request 类型（这样所有文件都能识别）

```typescript
// server/src/types/express.d.ts
declare namespace Express {
  interface Request {
    user?: {
      id: number;
      email: string;
      username: string;
    };
  }
}
```

### 6.2.4 注册接口返回 404

现象：POST /api/auth/register 返回 404

原因：Express 应用创建了新路由文件，但没有在入口文件中挂载

解决：在 server/src/app.ts 中添加路由注册

```typescript
import authRouter from "./routes/auth";
app.use("/api/auth", authRouter);
```

### 6.2.5 管理员页面反复跳转登录页

现象：管理员登录成功后，跳转到 /admin 页面后又被重定向回 /login

原因：/api/admin/stats 接口只使用了 adminMiddleware，但这个中间件依赖 req.user 来判断权限，而 req.user 是由 authMiddleware 设置的。没有 authMiddleware，req.user 是 undefined，导致 401 错误，触发拦截器跳转

解决：在 server/src/routes/admin.ts 中，为 /stats 路由同时添加 authMiddleware（放前面）和 adminMiddleware（放后面），保证执行顺序正确

```typescript
router.get("/stats", authMiddleware, adminMiddleware, adminController.getStats);
```

经验总结：中间件的执行顺序很重要。authMiddleware 负责解析 token 并设置 req.user，adminMiddleware 负责检查 req.user.role 是否为 admin。顺序反了就会出错。

### 6.2.6 通知数据与前端预期不匹配

现象：通知列表中发送者头像显示为默认字母 "U"，文章标题显示为默认文字 "文章"

原因：

- 数据关联缺失：后端 Notification 模型的 SQL 查询没有 JOIN 文章表和用户表，拿不到文章标题和发送者详细信息
- 数据结构不匹配：后端返回的是 sender_username 和 sender_avatar 这种扁平字段，但前端期望的是 sender: { id, username, avatar } 这种嵌套对象

解决：

- 在 SQL 查询中添加 LEFT JOIN articles a ON n.article_id = a.id 和 LEFT JOIN users sender ON n.sender_id = sender.id
- 在处理查询结果时，将 sender_username/sender_avatar 转换为 sender 嵌套对象，使其匹配前端期望

```typescript
// 改造后的返回结构
sender: {
  id: row.sender_id,
  username: row.sender_username,
  avatar: row.sender_avatar
}
```

## 6.3 前端问题汇总

### 6.3.1 顶部导航栏按钮无法点击

现象：登录、注册等按钮配置了路由路径，但点击后没有任何反应，控制台也不报错

原因：`<el-button>` 不是 Vue Router 的导航组件（`<router-link>` 才是），给它绑 `:to="'/login'"` 属性不会产生导航效果

解决：改用 @click 事件，通过编程方式跳转

```vue
<!-- 错误写法 -->
<el-button type="text" :to="'/login'">登录</el-button>

<!-- 正确写法 -->
<el-button type="text" @click="router.push('/login')">登录</el-button>
<el-button type="primary" @click="router.push('/register')">注册</el-button>
```

### 6.3.2 分页组件显示英文

现象：分页组件显示 "Prev"、"Next" 等英文，与中文网站不协调

原因：Element Plus 默认使用英文语言包

解决：在 main.ts 中引入中文语言包并配置

```typescript
import zhCn from "element-plus/es/locale/lang/zh-cn";

app.use(ElementPlus, {
  locale: zhCn,
});
```

### 6.3.3 Vue Router 4 路由守卫弃用警告

现象：控制台警告 next is deprecated in navigation guards

原因：Vue Router 4 不再推荐使用 next() 回调来控制导航，改为用返回值

解决：将 next() 改为 return 目标路径

```typescript
// 旧写法
router.beforeEach((to, from, next) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else {
    next();
  }
});

// 新写法
router.beforeEach((to) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (to.meta.requiresAuth && !token) {
    return "/login"; // 返回目标路径表示重定向
  }
  return true; // 返回 true 表示允许通过
});
```

### 6.3.4 Element Plus 弃用警告

现象：控制台提示 type="text" is deprecated

原因：Element Plus 3.0.0+ 将 type="text" 弃用，改为 type="link"

解决：将按钮属性从 type="text" 改为 type="link"

```vue
<!-- 旧写法 -->

<el-button type="text">登录</el-button>

<!-- 新写法（Element Plus 3.0.0+） -->

<el-button type="link">登录</el-button>
```

### 6.3.5 按钮间歇性无法点击

现象：登录后有时按钮无法点击，控制台无报错，刷新后可能恢复。问题不稳定复现

原因：判断条件 v-if="userStore.isLoggedIn && userStore.userInfo" 过于严格。页面刷新后 userInfo 对象可能还没从服务器取回来（为 null），但 token 是存在的，应该显示登录状态

解决：只检查 isLoggedIn（即只检查 token 是否存在）

```vue
<!-- 旧写法：双重检查，userInfo 为 null 时不显示 -->
<div v-if="userStore.isLoggedIn && userStore.userInfo">

<!-- 新写法：只检查 token 是否存在 -->
<div v-if="userStore.isLoggedIn">
```

### 6.3.6 发布文章返回 401

现象：登录状态正常，但发布文章时返回 401 Unauthorized

原因：前端请求拦截器只从 localStorage 读取 token。当用户登录时没有勾选"记住我"，token 存在 sessionStorage 中，拦截器拿不到

解决：同时从两个存储中获取 token

```typescript
// 请求拦截器中
const token = localStorage.getItem("token") || sessionStorage.getItem("token");
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

背景解释："记住我"功能的核心就是存储位置的区别——勾选后存 localStorage（持久化，关闭浏览器也不丢），不勾选存 sessionStorage（关闭浏览器就清除）。

### 6.3.7 刷新后登录状态丢失

现象：没有勾选"记住我"时刷新页面，即使 sessionStorage 中有 token，也显示未登录状态

原因：刷新后 userInfo 对象被重置为 null（Vue 的响应式状态在刷新后会丢失），但前端没有尝试从服务器重新获取

解决：

后端添加 /api/auth/me 接口，用于返回当前登录用户的信息

前端在 userStore 中添加 initUserInfo 方法，在应用初始化或刷新时自动调用

```typescript
// 前端 userStore
async initUserInfo() {
if (this.token && !this.userInfo) {
try {
const userInfo = await getCurrentUser();
this.setUserInfo(userInfo);
} catch (error) {
// token 过期或无效，清除登录状态
this.logout();
}
}
}
```

### 6.3.8 文章预览显示 HTML 标签

现象：文章列表中的预览显示 <p>1</p> 这样的原始 HTML 标签，影响阅读

原因：富文本编辑器（如 Quill、TinyMCE）生成的 content 包含 HTML 标签，直接截取前 100 字会截到标签

解决：先用正则去除所有 HTML 标签，再截取纯文本

```typescript
const getSummary = (content: string): string => {
  // 去除所有 HTML 标签，只保留纯文本
  const plainText = content.replace(/<[^>]\*>/g, "");
  // 截取前 100 字作为摘要
  return plainText.length > 100
    ? plainText.substring(0, 100) + "..."
    : plainText;
};
```

### 6.3.9 TypeScript any 类型报错

现象：使用 any 类型时编译报错 Unexpected any

原因：tsconfig 默认启用了 noImplicitAny 规则，ESLint 也配置了 @typescript-eslint/no-explicit-any 规则

解决：在配置文件中放宽限制

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "noImplicitAny": false
  }
}
```

同时在 eslint.config.ts 中添加：

```typescript
'@typescript-eslint/no-explicit-any': 'off'
```

### 6.3.10 Element Plus 组件样式不生效

现象：Element Plus 组件（按钮、表单等）看起来和普通 HTML 元素一样，没有任何样式

原因：自动导入配置出现问题，导致 Element Plus 的组件和样式没有被正确加载

解决：放弃自动导入，改为手动导入

```typescript
// client/src/main.ts
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

app.use(ElementPlus);
```

### 6.3.11 面包屑组件路由显示错误

现象：面包屑中根路径显示为空，动态路由显示为 /article/:id（带着 :id 参数名而不是实际值）

原因：breadcrumbItems 计算属性没有正确处理根路径（path 为空字符串时）和动态路由

解决：特殊处理根路径，确保其映射到 / 并显示首页标题

```typescript
const breadcrumbItems = computed(() => {
  return route.matched
    .filter((item) => item.meta.title)
    .map((item) => {
      if (item.path === "") {
        return { title: item.meta.title, path: "/" };
      }
      return { title: item.meta.title, path: item.path };
    });
});
```

背景解释：route.matched 是当前路由匹配到的所有路由记录数组。根路由 / 的 path 是空字符串 ""，需要特殊处理。

### 6.3.12 头像显示为文本而非图片

现象：当 userInfo.avatar 存在时，头像显示为图片 URL 文本而不是图片

原因：把图片 URL 作为 el-avatar 的子内容（放在标签中间），而不是绑到 src 属性上。el-avatar 会把它当成普通文本渲染

解决：用 :src 属性绑定头像图片，用 `<template #default>` 设置默认图标

```vue
<el-avatar
  size="small"
  style="margin-right: 10px;"
  :src="userStore.userInfo?.avatar"
>
  <!-- 默认插槽：当 src 图片加载失败时显示的默认头像 -->
  <template #default>
    <el-icon><UserFilled /></el-icon>
  </template>
</el-avatar>
```

### 6.3.13 formRef 类型安全问题

现象：在注册组件中获取表单实例时，用了 `const formRef = ref<any>(null)`，不符合 TypeScript 类型安全规范

解决：从 Element Plus 导入 FormInstance 类型，使用正确的类型声明

```typescript
import type { FormInstance } from "element-plus";

const formRef = ref<FormInstance | null>(null);

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      // 表单验证通过，提交数据
    }
  });
};
```

注意：这里使用 import type 语法是因为项目启用了 verbatimModuleSyntax 配置，类型导入必须显式标记。

### 6.3.14 el-input 的 rows 属性类型错误

现象：使用 `rows="4"` 时控制台报类型错误

原因：不加冒号时，"4" 是字符串，Element Plus 期望 rows 是 number 类型

解决：用 `:rows="4"`（v-bind 语法），这样 4 会被作为 JavaScript 表达式解析为数字

```vue
<!-- 错误：传字符串 -->
<el-input type="textarea" rows="4"></el-input>

<!-- 正确：传数字 -->
<el-input type="textarea" :rows="4"></el-input>
```

### 6.3.15 通知头像和文章标题异常

此问题已在后端部分（6.2.6 通知数据结构不匹配）中同步解决。后端调整返回数据后，前端即可正常显示。

# 七、功能实现要点

## 7.1 置顶功能

问题：置顶功能只在管理员页面生效，文章列表页没有体现；而且置顶后无法取消

解决：

- 在所有文章查询 SQL 中添加 `ORDER BY is_pinned DESC, created_at DESC`（置顶的排最前面，同级别的按时间排列）
- 确保所有查询方法返回 is_pinned 字段
- 前端 ArticleCard 组件中显示置顶标识

## 7.2 下架功能

问题：点击"下架"按钮后出现 500 错误

原因：数据库 status 字段的 ENUM 类型只有 'draft' 和 'published'，没有 'banned'。MySQL 在尝试存入 'banned' 时直接报错

解决：执行 SQL 修改表结构，将 'banned' 添加到 ENUM 列表中

```sql
ALTER TABLE `articles` MODIFY COLUMN `status` enum('draft','published','banned') DEFAULT 'published';
```

## 7.3 收藏状态持久化

问题：在 useFavorite 组合式函数中，favorited（是否已收藏）和 favoritesCount（收藏数）都通过 ref 初始化为 false 和 0，没有从服务器获取初始值。每次刷新页面，这些值都重置，即使该文章之前已被收藏

解决：

- 在 Article 接口中添加 favorited 和 favoritesCount 字段
- 在 useFavorite 中添加 fetchFavoriteStatus 方法，从服务器获取初始状态
- 在文章详情页 onMounted 时调用该方法

## 7.4 用户信息卡片统计数据实现

**文章数量**

来源：后端 API 返回的 total 字段

获取过程：前端调用 getUserArticles 接口 → 后端查询数据库 → 返回包含 total 字段的响应 → 前端直接使用

**获赞总数**

来源：后端在 SQL 查询中通过子查询计算每篇文章的点赞数，前端累加

后端 SQL 写法：

```sql
(SELECT COUNT(*) FROM likes WHERE article_id = a.id) as likesCount
```

前端累加逻辑：

```typescript
totalLikes += article.likesCount || article.likes || 0;
```

**收藏总数**

来源：与获赞数类似，通过 SQL 子查询计算

后端 SQL 写法：

```sql
(SELECT COUNT(*) FROM favorites WHERE article_id = a.id) as favoritesCount
```

前端累加逻辑：

```typescript
totalFavorites += article.favoritesCount || 0;
```

**性能优化经验**

最初的实现是对每篇文章单独调用详情接口来获取统计数，后来发现这样做网络请求太多。改为在后端 SQL 查询中直接用子查询计算统计数据，减少了 N 次网络请求，性能大幅提升。

# 八、界面美化与响应式适配

## 8.1 首页 UI 重构

- 使用 SCSS 进行样式管理
- 实现响应式断点：≤767px 移动端、768-1199px 平板、≥1200px PC

## 8.2 侧边栏个人信息卡片

实现流程：

1. 使用 useUserStore 获取当前登录用户信息
2. 通过 getUserArticles 接口获取该用户的文章列表
3. 遍历文章列表，累加计算总获赞数和总收藏数
4. 将计算结果更新到响应式对象，模板中自动刷新

## 8.3 CSS 兼容性

为 -webkit-line-clamp 添加标准 line-clamp 作为兼容方案：

```css
-webkit-line-clamp: 2;
line-clamp: 2;
```

## 8.4 穿透 Element Plus 组件样式

使用 :deep() 选择器穿透组件的样式封装（Scoped CSS），修改内部元素的样式：

```css
:deep(.el-card__body) {
  overflow: hidden !important;
  padding: 15px !important;
  height: calc(100% - 40px) !important;
  display: flex;
  flex-direction: column;
}
```

背景解释：Element Plus 的 `<el-card>` 组件内部有一个 .el-card\_\_body 元素，它有自己的 overflow 和 padding 设置。即使在父容器上设置 overflow: hidden，由于这个内部元素的存在，滚动条依然会出现。:deep() 选择器可以穿透 Vue 的 Scoped CSS 限制，直接修改子组件内部的样式。

# 九、最佳实践

## 9.1 递归组件

当组件需要递归调用自己时（如评论的嵌套回复），使用 defineOptions 显式声明组件名称，比依赖 Vue 的自动推断更可靠：

```vue
<script setup lang="ts">
defineOptions({
  name: "CommentItem",
});
</script>

<template>
  <div>
    <!-- 递归调用自己 -->
    <CommentItem v-if="hasReplies" />
  </div>
</template>
```

## 9.2 TypeScript 空值安全

使用完整的可选链操作符访问可能为 null/undefined 的属性，并提供默认值：

```vue
<ElAvatar>
  {{ user?.username?.charAt(0)?.toUpperCase() || 'U' }}
</ElAvatar>
```

## 9.3 加载状态设计

区分 loading（加载中）、empty（空数据）、error（错误）三种状态，避免用户看到空白页面。使用 Element Plus 的骨架屏提升等待体验：

```vue
<template>
  <!-- 加载中 -->
  <div v-if="loading">
    <el-skeleton animated>
      <template #template>
        <el-skeleton-item variant="h3" />
        <el-skeleton-item variant="text" />
      </template>
    </el-skeleton>
  </div>

  <!-- 加载完成 -->
  <template v-else>
    <div v-if="articles.list.length === 0">暂无文章</div>
    <!-- 文章列表 -->
  </template>
</template>
```

## 9.4 数据库操作安全

- 始终对用户输入的参数进行验证和范围限制
- 分页参数必须用 validatePagination 验证后再拼接 SQL（pageSize 限制在 1~100，page 限制在 ≥1）
- 优先使用参数化查询防止 SQL 注入，只在必要时（如 LIMIT/OFFSET）才用验证后拼接

## 9.5 认证与授权

- Token 从 localStorage 和 sessionStorage 两个地方同时获取（兼容"记住我"和"临时会话"）
- 页面刷新后自动调用 /api/auth/me 恢复用户状态（initUserInfo 方法）
- 中间件按正确顺序组合：authMiddleware（解析 token）在前，adminMiddleware（检查权限）在后

# 十、总结

LightBlog 是一个从零搭建的全栈博客项目，经历了数据库设计、用户认证、内容管理、社交功能（评论、点赞、收藏、关注、通知）、后台管理、界面美化等完整的开发流程。

项目中的大量问题都是因为前后端参数传递链路中的类型不一致、格式不匹配造成的。最核心的经验是：

- 前端路由参数和 API 参数往往不一样（username vs userId），需要用工具函数统一转换
- MySQL 参数化查询对 LIMIT/OFFSET 的兼容性差，需要用验证后拼接的方式处理
- Token 存储位置的不统一（localStorage vs sessionStorage）会导致间歇性认证失败
- 数据库表结构需要预留扩展空间（如 status 字段后续需要加 banned 值）

这些问题在开发中反复出现，通过封装统一的工具函数（useUserIdFromUsername、buildPaginationSql）可以从根本上减少重复踩坑。
