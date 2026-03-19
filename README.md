# LightBlog

## 数据库表结构

### 用户表

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

### 文章表

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

### 分类表

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

### 标签表

```sql
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 文章-标签关联表

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

### 为文章表增加分类字段

```sql
ALTER TABLE `articles` ADD COLUMN `category_id` int DEFAULT NULL AFTER `author_id`;
ALTER TABLE `articles` ADD CONSTRAINT `articles_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;
```

### 评论表

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

### 点赞表

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

### 收藏表

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

### 关注表

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

通知表
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

为 articles 表的 title 和 content 字段创建全文索引
ALTER TABLE `articles` ADD FULLTEXT INDEX `ft_title_content` (`title`, `content`) WITH PARSER ngram;

## 项目配置说明

### 开发环境配置

1. **Vue 官方插件**：不要使用旧版 volar，只使用 vue official
2. **Element Plus 配置**：使用 element 自动导入，不要手动导入
3. **TypeScript 配置**：
   - 在 `tsconfig.app.json` 中设置 `"noImplicitAny": false`
   - 在 `eslint.config.ts` 文件中添加 `'@typescript-eslint/no-explicit-any': 'off'` 规则

## 常见问题及解决方案

### 通用解决方案：处理 404 和 500 错误

#### 问题现象

- **404 错误**：访问粉丝列表和关注列表页面时返回 404 错误
- **500 错误**：修复 404 后出现 "Incorrect arguments to mysqld_stmt_execute" 错误

#### 根本原因

1. **前端问题**
   - 路由参数与 API 参数不匹配：
     - 前端路由使用 username 作为参数（如 /user/lanxiaole/followers）
     - 后端 API 需要 userId 作为参数（如 /users/9/followers）
     - 代码中使用了占位符 0 作为用户 ID，导致 API 调用失败

2. **后端问题**
   - MySQL 参数类型不匹配：
     - 使用参数化查询时，LIMIT 和 OFFSET 子句的参数类型与 MySQL 预期不符
     - 错误信息 "Incorrect arguments to mysqld_stmt_execute" 表明 MySQL 无法正确处理传递的参数

#### 解决方案

1. **前端解决方案**
   - 添加用户信息获取逻辑：
     - 从路由获取 username 参数
     - 通过 getUserProfile API 获取用户信息，提取用户 ID
     - 使用获取到的用户 ID 调用关注相关的 API

   ```typescript
   // 前端核心代码
   const fetchFollowers = async () => {
     if (!username.value) return;

     // 先通过用户名获取用户信息
     const userProfile = await getUserProfile(username.value);
     targetUserId.value = userProfile.id;

     // 使用获取到的用户 ID 调用 API
     const response = await getFollowers(targetUserId.value, {
       page: page.value,
       pageSize: pageSize.value,
     });
     list.value = response.list;
     total.value = response.total;
   };
   ```

2. **后端解决方案**
   - 修改 SQL 语句构建方式：
     - 直接将参数值插入到 SQL 语句中，而不是使用参数化查询
     - 对参数进行严格的验证和限制，确保它们是有效的数字

   ```typescript
   // 后端核心代码
   async getFollowers(userId: number, page: number, pageSize: number) {
     // 确保参数是有效的数字
     const validPage = Math.max(1, Number(page));
     const validPageSize = Math.max(1, Math.min(100, Number(pageSize)));
     const offset = (validPage - 1) * validPageSize;

     // 直接将参数插入 SQL 语句
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

#### 为什么经常出现这样的问题

1. **前端层面**
   - 路由设计与 API 设计不一致：
     - 路由通常使用更友好的 username 作为参数
     - API 通常使用更唯一的 userId 作为参数
     - 每次创建新页面时，都需要处理这种参数转换

2. **后端层面**
   - MySQL 参数化查询的局限性：
     - MySQL 对 LIMIT 和 OFFSET 子句的参数类型有严格要求
     - 使用参数化查询时，这些参数可能无法正确转换为 MySQL 期望的类型
     - 每次实现分页功能时，都可能遇到类似问题

#### 预防措施

1. **前端最佳实践**
   - 使用已创建的 `useUserIdFromUsername` 组合式函数：
     - 该函数已封装在 `client/src/composables/user/useUserIdFromUsername.ts` 中
     - 统一处理从用户名到用户 ID 的转换
     - 在需要用户 ID 的页面中直接调用此函数

   ```typescript
   // 前端使用示例
   import { useUserIdFromUsername } from "@/composables/user/useUserIdFromUsername";

   const { userId, loading, error } = useUserIdFromUsername(username);

   // 当 userId 变化时，使用它调用 API
   watch(userId, (newUserId) => {
     if (newUserId) {
       // 使用用户 ID 调用关注相关的 API
       fetchFollowers(newUserId);
     }
   });
   ```

2. **后端最佳实践**
   - 使用已创建的 `pagination` 工具函数：
     - 该函数已封装在 `server/src/utils/pagination.ts` 中
     - 统一处理分页参数的验证和 SQL 语句构建
     - 在需要分页的查询中直接调用此函数

   ```typescript
   // 后端使用示例
   import { buildPaginationSql } from '../utils/pagination';

   async getFollowers(userId: number, page: number, pageSize: number) {
     // 直接使用工具函数构建分页 SQL
     const paginationSql = buildPaginationSql(page, pageSize);

     // 构建完整的 SQL 语句
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

3. 前端传递的参数 ：即使前端代码中使用的是数字类型，在 HTTP 请求中，所有参数都会被序列化为字符串格式。
4. 后端接收参数 ：Express 框架默认会将查询参数解析为字符串类型，即使前端传递的是数字。例如， req.query.page 接收到的是字符串 "1"，而不是数字 1。
5. MySQL 驱动的处理 ：当使用参数化查询时，MySQL 驱动会将所有参数视为字符串类型传递给 MySQL 服务器。虽然 MySQL 通常会自动转换类型，但在 LIMIT 和 OFFSET 子句中，这种自动转换可能会失败，导致 "Incorrect arguments to mysqld_stmt_execute" 错误。
6. buildPaginationSql 的作用 ：这个函数通过以下步骤解决问题：
   - 首先使用 validatePagination 验证并转换参数为有效的数字
   - 然后直接将验证后的数字拼接到 SQL 语句中
   - 这样 MySQL 服务器接收到的就是直接的数字，而不是需要转换的字符串参数
     这种方法是安全的，因为 validatePagination 函数会严格验证参数，确保它们是有效的数字，并且限制了 pageSize 的最大值（100），因此不存在 SQL 注入的风险。

总结来说，这是 MySQL 驱动在处理 LIMIT 和 OFFSET 子句时的一个特殊限制，通过使用 buildPaginationSql 函数可以安全地解决这个问题。3. **文档和规范**

- 建立 API 设计规范：
  - 明确路由参数和 API 参数的使用约定
  - 记录常见问题和解决方案
  - 为新开发者提供参考文档
- 推广使用已创建的工具函数：
  - 在团队中推广使用 `useUserIdFromUsername` 和 `pagination` 工具函数
  - 确保所有新开发的页面和 API 都使用这些工具函数
  - 定期检查代码库，确保工具函数的正确使用

  数据库用户表增加角色字段
  -- 添加角色字段，默认普通用户
  ALTER TABLE `users` ADD COLUMN `role` enum('user','admin') NOT NULL DEFAULT 'user' AFTER `bio`;

-- 插入管理员账号（密码暂用占位，稍后使用 bcrypt 加密更新）
-- 注意：这里的密码是明文，需要加密处理，下面会提供 Node.js 脚本生成加密密码
-- 我们先插入，稍后更新
INSERT INTO `users` (`email`, `username`, `password`, `role`, `created_at`, `updated_at`) VALUES
('lanxiaole@admin.com', 'lanxiaole', 'placeholder', 'admin', NOW(), NOW()),
('weijiale@admin.com', 'weijiale', 'placeholder', 'admin', NOW(), NOW());

密码加密：需要生成 bcrypt 哈希。你可以编写一个临时脚本或在 Node.js 环境中执行以下代码：
const bcrypt = require('bcryptjs');
const password = 'lejiawei1';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
console.log(hash);
得到两个哈希后，手动更新数据库：

sql
UPDATE `users` SET `password` = '哈希值1' WHERE `email` = 'lanxiaole@admin.com';
UPDATE `users` SET `password` = '哈希值2' WHERE `email` = 'weijiale@admin.com';

### 后端问题

#### 1. 文章列表获取失败（500 错误）

- **问题现象**：前端获取文章列表时出现 500 内部服务器错误，后端服务器日志显示 `Incorrect arguments to mysqld_stmt_execute` 错误
- **原因分析**：MySQL 语句执行时参数类型不正确，特别是 `pageSize` 和 `offset` 参数。当使用参数化查询时，传递给 MySQL 的参数类型与 SQL 语句期望的类型不匹配
- **解决方案**：
  - 修改 `Article.ts` 文件，使用 `Number()` 而不是 `parseInt()` 来转换参数类型
  - 直接将参数值插入到 SQL 语句中，而不是使用参数化查询
  - 对参数进行严格的验证和限制，确保它们是有效的数字

  ```typescript
  // 确保参数是有效的数字
  const validPage = Math.max(1, Number(page));
  const validPageSize = Math.max(1, Math.min(100, Number(pageSize)));
  // 计算偏移量
  const offset = (validPage - 1) * validPageSize;

  // 查询文章列表
  const listSql = `
    SELECT * FROM articles
    WHERE status = 'published'
    ORDER BY created_at DESC
    LIMIT ${validPageSize} OFFSET ${offset}
  `;
  ```

#### 2. 后端路由 404 错误

- **问题现象**：新增的用户信息接口返回 404 错误，前端控制台显示 "GET http://localhost:3000/api/auth/me 404 (Not Found)"
- **原因分析**：后端服务器未重启，新添加的路由未生效
- **解决方案**：重启后端服务器，使新添加的路由生效

  ```bash
  # 查找占用端口 3000 的进程
  netstat -ano | findstr :3000
  # 终止进程
  taskkill /PID [进程ID] /F
  # 重新启动服务器
  npm run dev
  ```

#### 3. Express Request 类型扩展失败

- **问题现象**：TypeScript 报错 "Property 'user' does not exist on type 'Request'"，在 auth.ts 中间件和 articleController.ts 控制器中都出现了这个错误
- **原因分析**：在 auth.ts 中直接声明命名空间扩展 Request 类型无效，TypeScript 无法识别
- **解决方案**：创建 `server/src/types/express.d.ts` 文件，在全局命名空间扩展 Request 类型

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

### 前端问题

#### 1. 顶部导航栏按钮无法点击

- **问题表现**：登录、注册等按钮配置了路由但点击无反应，控制台无报错
- **原因分析**：使用了错误的属性绑定方式，按钮不是导航组件，不能直接使用 `:to`
- **解决方案**：将路由绑定改为点击事件，通过编程方式实现页面跳转

  ```vue
  <!-- 修改前 -->
  <el-button type="text" :to="'/login'">登录</el-button>

  <!-- 修改后 -->
  <el-button type="text" @click="router.push('/login')">登录</el-button>
  <el-button type="primary" @click="router.push('/register')">注册</el-button>
  ```

#### 2. 分页组件显示英文

- **问题表现**：分页组件显示"Prev"、"Next"等英文文本，与网站整体中文风格不一致
- **原因分析**：Element Plus 默认使用英文语言包
- **解决方案**：配置 Element Plus 国际化，引入中文语言包

  ```typescript
  // client/src/main.ts
  import zhCn from "element-plus/es/locale/lang/zh-cn";

  app.use(ElementPlus, {
    locale: zhCn,
  });
  ```

#### 3. 路由守卫弃用警告

- **问题表现**：Vue Router 警告 "[Vue Router warn]: `next` is deprecated in navigation guards and will be removed in a future version. Use `return` instead."
- **原因分析**：Vue Router 4 推荐使用返回值代替 next() 调用
- **解决方案**：修改路由守卫逻辑，使用返回值方式处理导航

  ```typescript
  // 修改前
  router.beforeEach((to, from, next) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (to.meta.requiresAuth && !token) {
      next("/login");
    } else {
      next();
    }
  });

  // 修改后
  router.beforeEach((to) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (to.meta.requiresAuth && !token) {
      return "/login";
    }
    return true;
  });
  ```

#### 4. Element Plus 弃用警告

- **问题表现**：控制台显示 "[Element Plus] `type="text"` is deprecated, please use `type="link"` instead."
- **原因分析**：Element Plus 3.0.0 对按钮类型属性进行了调整，`type="text"` 属性在 3.0.0 版本中会被弃用
- **解决方案**：根据版本兼容性考虑，选择合适的按钮类型属性

  ```vue
  <!-- 修改前 -->
  <el-button type="text">登录</el-button>

  <!-- 修改后 (Element Plus 3.0.0+) -->
  <el-button type="link">登录</el-button>
  ```

#### 5. 登录和注册按钮有时无法点击

- **问题表现**：按钮有时无法点击，控制台无报错，刷新页面后可能恢复正常
- **原因分析**：用户状态管理逻辑问题，当用户信息为 null 时，即使 token 存在，也会显示未登录状态
- **解决方案**：优化用户状态判断逻辑，只检查 token 存在性

  ```vue
  <!-- 修改前 -->
  <div v-if="userStore.isLoggedIn && userStore.userInfo">
    <!-- 登录状态 -->
  </div>

  <!-- 修改后 -->
  <div v-if="userStore.isLoggedIn">
    <!-- 登录状态 -->
  </div>
  ```

#### 6. 发布文章 401 错误

- **问题表现**：发布文章时返回 401 Unauthorized 错误，控制台显示 "POST http://localhost:3000/api/articles 401 (Unauthorized)"
- **原因分析**：前端请求拦截器只从 localStorage 获取 token，而当用户未选择"记住我"时，token 存储在 sessionStorage 中
- **解决方案**：修改请求拦截器，同时从 localStorage 和 sessionStorage 获取 token

  ```typescript
  // client/src/api/index.ts
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  ```

#### 7. 登录状态刷新后丢失

- **问题表现**：未勾选"记住我"时，刷新页面登录状态丢失，显示未登录状态
- **原因分析**：页面刷新后，用户信息对象为 null，导致显示未登录状态
- **解决方案**：
  - 后端：添加获取当前用户信息的接口
  - 前端：在页面刷新后自动从服务器获取用户信息

  ```typescript
  // 前端：在 userStore 中添加 initUserInfo 方法
  async initUserInfo() {
    if (this.token && !this.userInfo) {
      try {
        const userInfo = await getCurrentUser();
        this.setUserInfo(userInfo);
      } catch (error) {
        this.logout();
      }
    }
  }
  ```

#### 8. 文章列表预览显示 HTML 标签

- **问题表现**：文章预览显示 `<p>1</p>` 等 HTML 标签，影响阅读体验
- **原因分析**：直接截取包含 HTML 标签的内容，未做处理
- **解决方案**：在显示预览前去除 HTML 标签，只保留纯文本内容

  ```typescript
  const getSummary = (content: string): string => {
    // 去除HTML标签
    const plainText = content.replace(/<[^>]*>/g, "");
    // 截取前100字作为摘要
    return plainText.length > 100
      ? plainText.substring(0, 100) + "..."
      : plainText;
  };
  ```

#### 9. TypeScript 类型错误

- **问题表现**：在编写 TypeScript 代码时，使用 any 类型会导致编译错误，例如 "Unexpected any. Specify a type instead."
- **原因分析**：TypeScript 配置默认启用了 noImplicitAny 规则，不允许使用 any 类型，同时 ESLint 也配置了 @typescript-eslint/no-explicit-any 规则
- **解决方案**：
  - 修改 tsconfig.app.json 文件，添加 "noImplicitAny": false 配置
  - 修改 eslint.config.ts 文件，添加 "@typescript-eslint/no-explicit-any": "off" 规则

  ```json
  // tsconfig.app.json
  {
    "compilerOptions": {
      "noImplicitAny": false
    }
  }
  ```

#### 10. Element Plus 组件无法解析/样式不生效

- **问题表现**：Element Plus 组件显示为原始 HTML 标签，没有应用样式，例如按钮和表单组件看起来和普通 HTML 元素一样
- **原因分析**：自动导入配置问题，导致 Element Plus 的组件和样式没有正确加载
- **解决方案**：改为手动导入 Element Plus 及样式

  ```typescript
  // client/src/main.ts
  import ElementPlus from "element-plus";
  import "element-plus/dist/index.css";

  app.use(ElementPlus);
  ```

#### 11. 注册接口 404 错误

- **问题表现**：前端调用注册接口时返回 404 错误，控制台显示 "POST http://localhost:3000/api/auth/register 404 (Not Found)"
- **原因分析**：后端路由未挂载，Express 应用没有注册认证路由
- **解决方案**：在 server/src/app.ts 文件中添加路由挂载代码

  ```typescript
  // server/src/app.ts
  import authRouter from "./routes/auth";
  app.use("/api/auth", authRouter);
  ```

#### 12. 面包屑组件实现问题

- **问题表现**：面包屑组件没有正确处理根路径和动态路由，例如根路径显示为空，动态路由显示为 /article/:id 这种格式
- **原因分析**：breadcrumbItems 计算属性没有正确处理根路径和动态路由的情况
- **解决方案**：修改 breadcrumbItems 计算属性，确保正确处理根路径和动态路由

  ```typescript
  const breadcrumbItems = computed(() => {
    return route.matched
      .filter((item) => item.meta.title)
      .map((item) => {
        if (item.path === "") {
          return {
            title: item.meta.title,
            path: "/",
          };
        }
        return {
          title: item.meta.title,
          path: item.path,
        };
      });
  });
  ```

#### 13. 顶部导航栏用户信息区域问题

- **问题表现**：头像显示方式不正确，当 userInfo.avatar 存在时，图片没有正确显示，显示为文本
- **原因分析**：使用了错误的方式设置头像图片，将图片 URL 作为 el-avatar 的子内容，而不是使用 src 属性
- **解决方案**：使用 el-avatar 的 :src 属性来设置头像图片，使用 <template #default> 来设置默认头像

  ```vue
  <el-avatar
    size="small"
    style="margin-right: 10px;"
    :src="userStore.userInfo?.avatar"
  >
    <template #default>
      <el-icon><UserFilled /></el-icon>
    </template>
  </el-avatar>
  ```

#### 14. formRef 使用 any 类型

- **问题描述**：在创建 Register.vue 组件时，为了获取表单实例，使用了 const formRef = ref<any>(null)，这不符合 TypeScript 的类型安全最佳实践
- **解决方案**：
  - 从 Element Plus 导入 FormInstance 类型：import type { FormInstance } from 'element-plus'
  - 使用 import type 语法是因为项目启用了 verbatimModuleSyntax 配置
  - 更新类型定义：const formRef = ref<FormInstance | null>(null)
  - 调整 handleSubmit 函数中的代码，移除 await 关键字，因为 validate 方法不返回 Promise

  ```typescript
  import type { FormInstance } from "element-plus";

  const formRef = ref<FormInstance | null>(null);

  const handleSubmit = () => {
    formRef.value?.validate((valid) => {
      if (valid) {
        // 提交表单
      }
    });
  };
  ```

#### 15. el-input 组件 rows 属性类型错误

- **问题表现**：当使用 rows="4" 时，4 被解析为字符串类型，而 Element Plus 期望的是数字类型，控制台显示类型错误
- **解决方案**：使用 Vue 的绑定语法，将 rows="4" 改为 :rows="4"，这样 4 就会被解析为数字类型

  ```vue
  <!-- 修改前 -->
  <el-input type="textarea" rows="4"></el-input>

  <!-- 修改后 -->
  <el-input type="textarea" :rows="4"></el-input>
  ```

#### 16. formRef 变量未定义

- **问题表现**：在模板中使用 formRef 时出现了类型错误，显示 "Cannot find name 'formRef'"
- **解决方案**：在 script 部分添加 formRef 的定义，使用 ref() 函数来创建一个响应式引用

  ```typescript
  import { ref } from "vue";
  import type { FormInstance } from "element-plus";

  const formRef = ref<FormInstance | null>(null);
  ```

## 最佳实践

### 1. 递归组件最佳实践

- **问题**：组件递归调用自己时，Vue 3 虽然能自动处理，但显式声明更健壮
- **解决方案**：使用 `defineOptions` 显式声明组件名称
  ```vue
  <script setup lang="ts">
  defineOptions({
    name: "CommentItem", // 显式声明组件名称
  });
  </script>
  <template>
    <div>
      <!-- 评论内容 -->
      <CommentItem v-if="hasReplies" />
    </div>
  </template>
  ```

````

### 2. TypeScript 空值安全

- **问题**：可选链操作符使用不完整，存在运行时错误风险
- **解决方案**：使用完整的可选链操作符进行安全访问，并提供默认值

  ```vue
  <ElAvatar>
    {{ user?.username?.charAt(0)?.toUpperCase() || 'U' }}
  </ElAvatar>
````

### 3. 加载状态设计

- **问题**：数据加载时界面空白，用户体验差
- **解决方案**：区分 loading、empty、error 三种状态，使用骨架屏（Skeleton）提升感知性能

  ```vue
  <template>
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="h3" />
          <el-skeleton-item variant="text" />
        </template>
      </el-skeleton>
    </div>

    <!-- 实际内容 -->
    <template v-else>
      <div v-if="articles.list.length === 0">暂无文章</div>
      <div v-else>
        <!-- 文章列表 -->
      </div>
    </template>
  </template>
  ```

### 4. 代码质量优化

- **添加详细注释**：为所有关键文件添加详细注释，提高代码可读性
- **修复类型错误**：确保类型安全
- **优化组件布局和样式**：提升用户体验

### 5. 数据库操作安全

- **参数验证**：始终对用户输入的参数进行验证和限制
- **SQL 语句安全**：优先使用参数化查询，避免 SQL 注入
- **错误处理**：添加全面的错误处理，确保即使出现错误也能返回适当的错误信息

### 6. 认证和授权

- **token 管理**：同时从 localStorage 和 sessionStorage 中获取 token
- **用户状态管理**：在页面刷新后自动获取用户信息
- **权限控制**：使用中间件保护需要认证的路由

## 系统架构

### 前端架构

- **技术栈**：Vue 3 + TypeScript + Element Plus + Vue Router + Pinia
- **文件组织**：
  - `components/` - 全局共享组件
  - `composables/` - 组合式函数
  - `api/` - API 接口
  - `views/` - 页面视图
  - `stores/` - 状态管理

### 后端架构

- **技术栈**：Node.js + Express + MySQL + TypeScript
- **文件组织**：
  - `controllers/` - 控制器层
  - `models/` - 数据模型层
  - `routes/` - 路由层
  - `middlewares/` - 中间件
  - `types/` - 类型定义

## 项目启动流程

### 后端启动

1. 进入 `server` 目录
2. 运行 `npm install` 安装依赖
3. 运行 `npm run build` 构建项目
4. 运行 `npm run start` 启动服务器

### 前端启动

1. 进入 `client` 目录
2. 运行 `npm install` 安装依赖
3. 运行 `npm run dev` 启动开发服务器
4. 访问 `http://localhost:5173` 查看应用

## 注意事项

1. **数据库配置**：确保在 `server/src/config` 中正确配置数据库连接信息
2. **环境变量**：根据实际环境配置相应的环境变量
3. **API 接口**：所有 API 接口都以 `/api` 为前缀
4. **认证**：需要认证的接口会返回 401 错误，前端需要处理这种情况并跳转到登录页
5. **错误处理**：后端会返回统一的错误格式，前端需要根据错误信息进行相应的处理

### 问题原因

1. 数据关联缺失 ：后端 Notification 模型的 SQL 查询没有关联文章表，无法获取文章标题，导致所有通知中的文章标题显示为默认的"文章"。
2. 数据结构不匹配 ：后端返回的数据结构与前端期望的不匹配，前端期望的是 sender 对象（包含 id、username、avatar），但后端返回的是 sender_username 和 sender_avatar 字段，导致前端无法正确显示发送者信息，头像显示为默认的"U"。

### 修复方法

1. 添加文章表关联 ：修改 Notification 模型的 getNotificationsByReceiver 方法，在 SQL 查询中添加 LEFT JOIN articles a ON n.article_id = a.id ，以获取文章标题。
2. 调整返回数据结构 ：在处理查询结果时，将 sender_username 和 sender_avatar 转换为 sender 对象，以匹配前端的期望结构。
3. 更新接口定义 ：修改 NotificationWithSender 接口，将 sender_username 和 sender_avatar 属性替换为 sender 对象，确保类型定义与实际返回数据一致。

### 问题原因

- useFavorite 组合式函数中的 favorited 和 favoritesCount 都是通过 ref 初始化的，没有从服务器获取初始值
- 每次页面刷新时，这些值都会重置为默认值（ false 和 0 ）
- 服务器端的收藏状态和数量是正确的，但是前端没有在页面加载时从服务器获取这些值

### 解决方案

1. 添加收藏相关字段 ：在 Article 接口中添加了 favorited 和 favoritesCount 字段
2. 添加获取收藏状态方法 ：在 useFavorite 组合式函数中添加了 fetchFavoriteStatus 方法，用于从服务器获取初始的收藏状态和数量
3. 调用获取收藏状态方法 ：在 Detail.vue 页面的 onMounted 钩子中，在文章加载完成后调用 fetchFavoriteStatus 方法来获取初始的收藏状态和数量

问题原因 ：

- 管理员登录成功后，跳转到 /admin 页面
- 但 /admin 页面会请求 /api/admin/stats 接口
- 该接口返回 401 错误，导致响应拦截器将用户重定向到 /login 页面
- 原因是 admin.ts 路由文件中，只使用了 adminMiddleware ，没有使用 authMiddleware
- adminMiddleware 依赖于 req.user ，而 req.user 是由 authMiddleware 设置的
  解决方案 ：

- 在 server/src/routes/admin.ts 文件中，为 /stats 路由添加 authMiddleware ，放在 adminMiddleware 之前
- 这样就能确保 req.user 被正确设置， adminMiddleware 能够正常验证管理员权限
