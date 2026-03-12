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

Vue Router 4 中已弃用 next() 回调函数，现在应该使用返回值的形式来处理导航。

解决方案 ：

1. 修改了 router.beforeEach 函数，移除了 next 参数
2. 将 next('/login') 改为 return '/login'
3. 将 next('/') 改为 return '/'
4. 将 next() 改为 return true

根据 Element Plus 的文档， type="text" 属性在 3.0.0 版本中会被弃用，建议使用 type="link" 代替。

问题原因 ：

- 前端请求拦截器只从 localStorage 中获取 token，而没有从 sessionStorage 中获取
- 当用户选择"记住我"时，token 存储在 localStorage 中，否则存储在 sessionStorage 中
- 这导致在某些情况下，token 无法被正确添加到请求头中，从而导致 401 错误
  解决方案 ：

1. 修改前端请求拦截器 ：

   - 同时从 localStorage 和 sessionStorage 中获取 token
   - 确保无论用户是否选择"记住我"，都能正确获取 token

2. 修改前端响应拦截器 ：

   - 当遇到 401 错误时，同时清除 localStorage 和 sessionStorage 中的 token
   - 确保用户被正确重定向到登录页

   问题原因 ：

- 当用户没有选择"记住我"时，token 存储在 sessionStorage 中
- 页面刷新后， userStore.token 能正确从 sessionStorage 中读取，所以 isLoggedIn 为 true
- 但是 userStore.userInfo 为 null，因为它只在登录时设置，没有在页面刷新时重新获取
- DefaultLayout.vue 中的条件判断是 v-if="userStore.isLoggedIn && userStore.userInfo" ，所以即使 token 存在，只要 userInfo 为 null，就会显示未登录状态
- 当显示未登录状态时，登录和注册按钮应该是可点击的，但由于条件判断逻辑错误，导致状态混乱
  解决方案 ：

1. 修改条件判断逻辑 ：

   - 将 v-if="userStore.isLoggedIn && userStore.userInfo" 改为 v-if="userStore.isLoggedIn"
   - 这样只要 token 存在，就会显示登录状态，不会因为 userInfo 为 null 而显示未登录状态

2. 添加空值检查 ：

   - 修复了引用 userStore.userInfo 的地方，添加了空值检查（使用可选链操作符 ?. ）
   - 确保即使 userInfo 为 null，页面也能正常显示

   问题原因 ：

- 当用户没有选择"记住我"时，token 存储在 sessionStorage 中
- 页面刷新后， userStore.token 能正确从 sessionStorage 中读取，但 userStore.userInfo 为 null
- 由于 userInfo 为 null，页面无法显示用户名和头像
  解决方案 ：

1. 后端 ：

   - 添加了 getCurrentUser 控制器方法，用于获取当前登录用户的信息
   - 添加了 findUserById 模型方法，用于根据用户 ID 查找用户
   - 添加了 /auth/me 路由，使用 authMiddleware 保护

2. 前端 ：

   - 添加了 getCurrentUser API 函数，用于调用后端的 /auth/me 接口
   - 在 userStore 中添加了 initUserInfo 方法，用于在页面刷新后获取用户信息
   - 在 main.ts 中添加了初始化用户信息的逻辑

   无法上传文章
   具体原因 ：

3. 认证信息丢失 ：当用户没有选择"记住我"时，token 存储在 sessionStorage 中，但页面刷新后，前端没有正确获取和使用这个 token
4. 请求无认证头 ：发布文章的 API 请求（ /api/articles ）需要认证，但由于 token 丢失，请求头中没有包含 Authorization: Bearer {token}
5. 后端拒绝请求 ：后端的 auth 中间件验证失败，返回 401 错误，导致文章上传失败

- 文章内容存储的是带有 HTML 标签的富文本（如 <p>1</p> ）
- 预览时直接截取内容，没有去除 HTML 标签，导致标签也被显示出来
  解决方案 ：

- 修改了 getSummary 函数，在截取内容之前先去除 HTML 标签
- 使用正则表达式 /<[^>]\*>/g 匹配并移除所有 HTML 标签
- 然后再对纯文本内容进行截取，确保预览只显示前 100 个字符

从开始制作发布文章页面到现在，我们完成了以下工作：

1. 创建发布文章页面组件 ：

   - 生成 client/src/views/article/Write.vue 组件，使用 Vue 3 + TypeScript + Element Plus + wangEditor
   - 集成 wangEditor 富文本编辑器，实现标题输入、内容编辑和封面图上传功能
   - 添加表单验证和提交逻辑，成功后跳转到文章详情页

2. 修复编译和类型错误 ：

   - 移除未使用的 ElIcon 导入
   - 移除未使用的图标导入（Upload, Check, Close）
   - 修复 file-list 属性的类型错误，为文件对象添加 name 属性

3. 解决路由和认证问题 ：

   - 修复路由守卫中使用已弃用的 next() 回调的问题，改为返回值形式
   - 处理 Element Plus 的弃用警告（ type="text" 改为 type="link" ，后因版本兼容改回 type="text" ）
   - 修复发布文章时的 401 错误，修改前端请求拦截器，同时从 localStorage 和 sessionStorage 获取 token
   - 解决登录状态在刷新后丢失的问题：
     - 后端添加 getCurrentUser 接口，用于获取当前登录用户信息
     - 前端添加 getCurrentUser API 函数
     - 在 userStore 中添加 initUserInfo 方法，页面刷新后自动获取用户信息
     - 在 DefaultLayout.vue 中添加 onMounted 钩子，组件挂载时初始化用户信息

4. 优化用户体验 ：

   - 修复文章列表页预览显示 HTML 标签的问题，在 getSummary 函数中去除 HTML 标签
   - 确保登录状态在刷新后保持，避免用户重新登录
   - 优化认证流程，确保发布文章时正确携带 token
