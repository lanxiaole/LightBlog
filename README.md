# LightBlog

用户表
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

文章表
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

问题 1：不要使用旧版 volar 只使用 vue official！！
问题 2：使用 element 自动导入，不要手动导入！！！
问题 3：配置 tsconfig.app.json 中 "noImplicitAny": false,
配置 eslint 在 eslint.config.ts 文件中添加了 '@typescript-eslint/no-explicit-any': 'off' 规则

问题现象 ：

- 前端获取文章列表时出现 500 内部服务器错误
- 后端服务器日志显示 Incorrect arguments to mysqld_stmt_execute 错误
- 错误发生在 ArticleModel.getArticles 方法中
  原因分析 ：

- 这个错误通常发生在 MySQL 语句执行时，参数类型不正确
- 具体来说，当使用参数化查询时，传递给 MySQL 的参数类型与 SQL 语句期望的类型不匹配
- 在我们的案例中， pageSize 和 offset 参数可能不是有效的数字类型

## 解决方案

### 步骤 1：识别问题

- 检查后端服务器日志，找到具体的错误信息
- 定位错误发生的位置： ArticleModel.getArticles 方法

### 步骤 2：尝试参数验证

- 首先尝试使用 parseInt() 来确保参数是有效的数字
- 但是这种方法仍然没有解决问题

### 步骤 3：最终解决方案

- 修改 Article.ts 文件，使用 Number() 而不是 parseInt() 来转换参数类型
- 直接将参数值插入到 SQL 语句中，而不是使用参数化查询
- 对参数进行严格的验证和限制，确保它们是有效的数字

### 关键代码修改

```
// 确保参数是有效的数字
const validPage = Math.max(1, Number
(page));
const validPageSize = Math.max(1, 
Math.min(100, Number(pageSize)));
// 计算偏移量
const offset = (validPage - 1) * 
validPageSize;

// 查询文章列表
const listSql = `
  SELECT * FROM articles
  WHERE status = 'published'
  ORDER BY created_at DESC
  LIMIT ${validPageSize} OFFSET $
  {offset}
`;

// 并行执行两个查询
const [listResult, countResult] = 
await Promise.all([
  pool.execute<RowDataPacket[]>
  (listSql),
  pool.execute<RowDataPacket[]>
  (countSql)
]);
```

## 技术说明

1. 参数验证 ：

   - 使用 Math.max(1, Number(page)) 确保 page 是一个大于等于 1 的数字
   - 使用 Math.max(1, Math.min(100, Number(pageSize))) 确保 pageSize 是一个在 1 到 100 之间的数字

2. SQL 语句构建 ：

   - 直接将验证后的参数值插入到 SQL 语句中
   - 虽然这可能会有 SQL 注入的风险，但在这种情况下，我们已经对参数进行了严格的验证和限制，确保它们只能是数字

3. 错误处理 ：

   - 添加了全面的错误处理，确保即使出现错误也能返回适当的错误信息
   - 记录详细的错误日志，便于调试和问题定位

## 预防措施

1. 参数验证 ：

   - 始终对用户输入的参数进行验证和限制
   - 确保参数类型正确，尤其是在与数据库交互时

2. SQL 语句安全 ：

   - 优先使用参数化查询，避免 SQL 注入
   - 如果必须直接插入参数，确保对参数进行严格的验证和限制

3. 错误处理 ：

   - 添加全面的错误处理，确保即使出现错误也能返回适当的错误信息
   - 记录详细的错误日志，便于调试和问题定位

4. 代码测试 ：

   - 定期测试 API 接口，确保它们能够正常工作
   - 测试边界情况，例如参数为负数、0 或非数字值时的情况

- 问题原因 ：顶部导航栏中的个人中心、设置、登录和注册按钮使用了 :to 属性，但这些组件（el-dropdown-item 和 el-button）在这种情况下不支持直接的路由跳转。
- 解决方案 ：

- 将 :to 属性改为 @click 事件
- 使用 router.push() 方法来实现路由跳转
- 在 script 部分添加了 useRouter 的引用，获取路由实例
