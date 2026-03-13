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

阶段性总结

## 2. 顶部导航栏按钮无法点击

问题表现 ：登录、注册等按钮配置了路由但点击无反应。 原因分析 ：使用了错误的属性绑定方式，按钮不是导航组件，不能直接使用 :to 。 解决方案 ：将路由绑定改为点击事件，通过编程方式实现页面跳转。

```
<el-button type="text" 
@click="router.push('/login')">登录
</el-button>
<el-button type="primary" 
@click="router.push('/register')">注
册</el-button>
```

修改文件 ： client/src/views/layouts/DefaultLayout.vue

## 3. 页面布局问题

问题表现 ：右侧热门推荐和分类区域占用空间过大，影响整体布局平衡。 原因分析 ：侧边栏宽度设置过宽，导致主内容区空间不足。 解决方案 ：调整侧边栏宽度，使其与主内容区比例更加协调。

```
.sidebar {
  width: 200px; /* 从250px调整为
  200px */
  flex-shrink: 0;
}
```

修改文件 ： client/src/views/home/Home.vue

## 4. 分页组件显示英文

问题表现 ：分页组件显示"Prev"、"Next"等英文文本，与网站整体中文风格不一致。 原因分析 ：Element Plus 默认使用英文语言包。 解决方案 ：配置 Element Plus 国际化，引入中文语言包。

```
import zhCn from 'element-plus/es/
locale/lang/zh-cn'

app.use(ElementPlus, {
  locale: zhCn
})
```

修改文件 ： client/src/main.ts

## 5. 背景颜色错位

问题表现 ：页面中部分区域背景色与导航栏不一致，出现明显的色彩断层。 原因分析 ：不同区域的背景色设置不同，导致视觉上的不协调。 解决方案 ：统一调整相关区域的背景色，使其与导航栏保持一致。 修改文件 ： client/src/views/layouts/DefaultLayout.vue

## 6. 文章详情页功能缺失

问题表现 ：需要实现文章详情页，包括获取文章数据和显示作者信息。 原因分析 ：缺少后端 API 接口和前端组件实现。 解决方案 ：

- 后端：添加文章详情查询接口，支持关联查询作者信息
- 前端：创建文章详情页面组件，实现数据加载和错误处理 修改文件 ：
- server/src/models/Article.ts
- server/src/controllers/articleController.ts
- client/src/views/article/Detail.vue

## 7. 编译错误

问题表现 ：出现未使用导入、图标不存在、类型错误等编译问题。 原因分析 ：代码中存在未使用的导入、错误的图标名称和类型不匹配的问题。 解决方案 ：

- 移除未使用的导入
- 替换不存在的图标
- 修复类型错误 修改文件 ： client/src/views/article/Detail.vue

## 8. 路由守卫弃用警告

问题表现 ：Vue Router 警告 next() 回调已弃用。 原因分析 ：Vue Router 4 推荐使用返回值代替 next() 调用。 解决方案 ：修改路由守卫逻辑，使用返回值方式处理导航。

```
router.beforeEach((to) => {
  const token = localStorage.getItem
  ('token') || sessionStorage.
  getItem('token');
  if (to.meta.requiresAuth && 
  !token) {
    return '/login';
  }
  return true;
});
```

修改文件 ： client/src/router/index.ts

## 9. Element Plus 弃用警告

问题表现 ： type="text" 属性在 3.0.0 版本中弃用。 原因分析 ：Element Plus 3.0.0 对按钮类型属性进行了调整。 解决方案 ：根据版本兼容性考虑，选择合适的按钮类型属性。 修改文件 ： client/src/views/layouts/DefaultLayout.vue

## 10. 登录和注册按钮有时无法点击

问题表现 ：按钮有时无法点击，控制台无报错。 原因分析 ：用户状态管理逻辑问题，当用户信息为 null 时，即使 token 存在，也会显示未登录状态。 解决方案 ：优化用户状态判断逻辑，只检查 token 存在性。 修改文件 ： client/src/views/layouts/DefaultLayout.vue

## 11. 发布文章 401 错误

问题表现 ：发布文章时返回 401 Unauthorized 错误。 原因分析 ：前端请求拦截器只从 localStorage 获取 token，而当用户未选择"记住我"时，token 存储在 sessionStorage 中。 解决方案 ：修改请求拦截器，同时从 localStorage 和 sessionStorage 获取 token。

```
const token = localStorage.getItem
('token') || sessionStorage.getItem
('token');
if (token) {
  config.headers.Authorization = 
  `Bearer ${token}`;
}
```

修改文件 ： client/src/api/index.ts

## 12. 登录状态刷新后丢失

问题表现 ：未勾选"记住我"时，刷新页面登录状态丢失。 原因分析 ：页面刷新后，用户信息对象为 null，导致显示未登录状态。 解决方案 ：

- 后端：添加获取当前用户信息的接口
- 前端：在页面刷新后自动从服务器获取用户信息

```
// 前端：在 userStore 中添加 
initUserInfo 方法
async initUserInfo() {
  if (this.token && !this.userInfo) 
  {
    try {
      const userInfo = await 
      getCurrentUser();
      this.setUserInfo(userInfo);
    } catch (error) {
      this.logout();
    }
  }
}
```

修改文件 ：

- server/src/controllers/authController.ts
- client/src/stores/user.ts

## 13. 后端路由 404 错误

问题表现 ：新增的用户信息接口返回 404 错误。 原因分析 ：后端服务器未重启，新添加的路由未生效。 解决方案 ：重启后端服务器，使新添加的路由生效。 操作 ：

```
# 查找占用端口 3000 的进程
netstat -ano | findstr :3000
# 终止进程
taskkill /PID [进程ID] /F
# 重新启动服务器
npm run dev
```

## 14. 文章列表预览显示 HTML 标签

问题表现 ：文章预览显示 <p>1</p> 等 HTML 标签，影响阅读体验。 原因分析 ：直接截取包含 HTML 标签的内容，未做处理。 解决方案 ：在显示预览前去除 HTML 标签，只保留纯文本内容。

```
const getSummary = (content: string)
: string => {
  // 去除HTML标签
  const plainText = content.replace
  (/<[^>]*>/g, '');
  // 截取前100字作为摘要
  return plainText.length > 100 ? 
  plainText.substring(0, 100) + '...
  ' : plainText;
};
```

修改文件 ： client/src/views/home/Home.vue

## 15. 写文章页面编译错误

问题表现 ：出现未使用导入和类型错误等编译问题。 原因分析 ：代码中存在未使用的导入和类型不匹配的问题。 解决方案 ：

- 移除未使用的导入

1. TypeScript 类型错误
   问题表现：在编写 TypeScript 代码时，使用 any 类型会导致编译错误，例如在 Register.vue 文件中，TypeScript 会报错提示 "Unexpected any. Specify a type instead."
   原因分析：TypeScript 配置默认启用了 noImplicitAny 规则，不允许使用 any 类型，同时 ESLint 也配置了 @typescript-eslint/no-explicit-any 规则
   解决方案：
   修改 tsconfig.app.json 文件，添加 "noImplicitAny": false 配置
   修改 eslint.config.ts 文件，添加 "@typescript-eslint/no-explicit-any": "off" 规则
2. Element Plus 组件无法解析/样式不生效
   问题表现：Element Plus 组件显示为原始 HTML 标签，没有应用样式，例如按钮和表单组件看起来和普通 HTML 元素一样
   原因分析：自动导入配置问题，导致 Element Plus 的组件和样式没有正确加载
   解决方案：
   改为手动导入 Element Plus 及样式，在 main.ts 文件中添加：
   TypeScript

import ElementPlus from 'element-plus';import 'element-plus/dist/index.css';app.use(ElementPlus); 3. 注册接口 404 错误
问题表现：前端调用注册接口时返回 404 错误，控制台显示 "POST http://localhost:3000/api/auth/register 404 (Not Found)"
原因分析：后端路由未挂载，Express 应用没有注册认证路由
解决方案：
在 server/src/app.ts 文件中添加路由挂载代码：
TypeScript

import authRouter from './routes/auth';app.use('/api/auth', authRouter); 4. 登录失败提示 "axios is not defined"
问题表现：登录失败时控制台显示 "axios is not defined" 错误
原因分析：在 auth.ts 文件中使用了 axios.isAxiosError 方法，但没有正确导入 axios
解决方案：
移除 axios.isAxiosError 检查，直接检查 error.response：
TypeScript

if (error.response) { // 处理错误响应} 5. 未勾选"记住我"仍保持登录状态
问题表现：即使未勾选"记住我"，登录状态也会持久化，下次打开页面时仍然保持登录状态
原因分析：路由守卫逻辑问题，未正确区分 localStorage 和 sessionStorage 的使用
解决方案：
修改 user.ts 中的 setToken 方法，根据 rememberMe 参数选择存储方式：
TypeScript

const setToken = (token: string, rememberMe: boolean) => { if (rememberMe) { localStorage.setItem ('token', token); } else { sessionStorage.setItem ('token', token); }};
修改路由守卫，仅保护需要认证的路由 6. Express Request 类型扩展失败
问题表现：TypeScript 报错 "Property 'user' does not exist on type 'Request'"，在 auth.ts 中间件和 articleController.ts 控制器中都出现了这个错误
原因分析：在 auth.ts 中直接声明命名空间扩展 Request 类型无效，TypeScript 无法识别
解决方案：
创建 server/src/types/express.d.ts 文件，在全局命名空间扩展 Request 类型：
TypeScript

declare namespace Express { interface Request { user?: { id: number; email: string; username: string; }; }} 7. 数据库连接失败 "Access denied"
问题表现：后端启动时显示数据库连接失败，错误信息为 "Access denied for user 'root'@'localhost' (using password: YES)"
原因分析：缺少 .env 文件配置数据库凭据，导致使用默认凭据连接数据库失败
解决方案：
创建 server/.env 文件，添加数据库连接配置：
PlainText

DB_HOST=localhostDB_USER=rootDB_PASSWORD=123456DB_NAME=lightblog 8. 后端服务器启动失败
问题表现：运行 npm run start 时显示 "Cannot find module 'dist/server.js'" 错误
原因分析：未构建后端项目，缺少 dist 目录和编译后的文件
解决方案：
运行 npm run build 构建后端项目，生成 dist 目录和编译后的文件 9. 端口 3000 被占用
问题表现：启动后端服务器时显示 "Error: listen EADDRINUSE: address already in use :::3000" 错误
原因分析：之前的服务器实例还在运行，占用了端口 3000
解决方案：
使用 netstat -ano | findstr :3000 命令找到占用端口的进程 PID
使用 taskkill /PID <PID> /F 命令终止占用端口的进程 10. 文章列表获取失败
问题表现：前端获取文章列表时返回 500 错误，错误信息为 "Incorrect arguments to mysqld_stmt_execute"
原因分析：MySQL 语句执行时参数类型不正确，在 Article.ts 文件中使用参数化查询时，参数类型与 SQL 语句预期的类型不匹配
解决方案：
修改 Article.ts 文件，直接将参数值插入到 SQL 语句中，而不是使用参数化查询：
TypeScript

const offset = (page - 1) _ pageSize;const query = `SELECT _ FROM articles ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`; 11. 导入图标组件错误
问题表现：TypeScript 报错，提示 "已声明'Setting'，但从未读取其值。已声明'Document'，但从未读取其值。模块"@element-plus/icons-vue"没有导出的成员"Category"。"
原因分析：导入了未使用的图标，且 Category 图标在 Element Plus 中不存在
解决方案：
移除未使用的图标（Setting, Document）
替换不存在的 Category 图标为 Menu 图标 12. 面包屑组件实现
问题表现：面包屑组件没有正确处理根路径和动态路由，例如根路径显示为空，动态路由显示为 /article/:id 这种格式
原因分析：breadcrumbItems 计算属性没有正确处理根路径和动态路由的情况
解决方案：
修改 breadcrumbItems 计算属性，确保正确处理根路径和动态路由：
TypeScript

const breadcrumbItems = computed(() => { return route.matched.filter (item => item.meta.title).map (item => { if (item.path === '') { return { title: item.meta.title, path: '/' }; } return { title: item.meta.title, path: item.path }; });}); 13. 左侧导航栏 logo 背景问题
问题表现：左侧导航栏的 logo 背景与整体背景冲突，看起来不协调，有明显的颜色差异
原因分析：logo 部分的背景颜色与导航栏不一致，导致视觉上出现断层
解决方案：
修改 logo 部分的背景颜色，使其与导航栏一致：
HTML

<div class="logo" style="padding: 20px; text-align: center; font-size: 18px; font-weight: bold; background-color: #f5f7fa;">  轻量博客</div>
14. 分页组件语言问题
问题表现：分页组件显示英文，与整体中文界面不一致，影响用户体验
原因分析：Element Plus 分页组件默认显示英文，需要手动设置为中文
解决方案：
添加 prev-text 和 next-text 属性，将分页组件改为中文：
HTML

<el-pagination v-model:current-page="current Page" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total" prev-text="上一页" next-text="下一页" @size-change="handleSizeChang e" @current-change="handleCurren tChange"/> 15. 右侧侧边栏宽度问题
问题表现：右侧热门推荐和分类占的空间过大，影响整体布局，导致左侧文章列表显示空间不足
原因分析：侧边栏宽度设置为 300px，相对较大，与整体布局比例不协调
解决方案：
将侧边栏宽度从 300px 改为 250px：
CSS

.sidebar { width: 250px; flex-shrink: 0;} 16. 顶部导航栏用户信息区域
问题表现：头像显示方式不正确，当 userInfo.avatar 存在时，图片没有正确显示，而是显示为文本
原因分析：使用了错误的方式设置头像图片，将图片 URL 作为 el-avatar 的子内容，而不是使用 src 属性
解决方案：
使用 el-avatar 的 :src 属性来设置头像图片，使用 <template #default> 来设置默认头像：
HTML

<el-avatar   size="small"   style="margin-right: 10px;"  :src="userStore.userInfo.  avatar"> <template #default> <el-icon><UserFilled /></ el-icon> </template></el-avatar> 17. 网站标题和语言一致性
问题表现：网站标题和部分内容使用英文，与整体中文界面不一致
解决方案：
将左侧导航栏和顶部栏的 logo 从英文 "LightBlog" 改为中文 "轻量博客"
保持网站整体语言的一致性，提升用户体验

问题 1：Element Plus 未安装
问题描述：项目需要使用 Element Plus 组件库来实现注册表单的 UI 组件，但在查看 client/package.json 文件时，发现项目依赖中没有包含 Element Plus。

解决方案：

执行命令：npm install element-plus
验证安装成功：命令输出显示 "added 20 packages, and audited 346 packages in 24s"，且没有发现漏洞
问题 2：formRef 使用 any 类型
问题描述：在创建 Register.vue 组件时，为了获取表单实例，使用了 const formRef = ref<any>(null)，这不符合 TypeScript 的类型安全最佳实践。

解决方案：

从 Element Plus 导入 FormInstance 类型：import type { FormInstance } from 'element-plus'
使用 import type 语法是因为项目启用了 verbatimModuleSyntax 配置
更新类型定义：const formRef = ref<FormInstance | null>(null)
调整 handleSubmit 函数中的代码，移除 await 关键字，因为 validate 方法不返回 Promise
问题 3：验证器函数的 callback 参数使用 any 类型
问题描述：表单验证器函数的 callback 参数使用了 any 类型，用户希望避免使用 any 类型以提高代码的类型安全性。

解决方案：

尝试导入 Element Plus 提供的类型：
首先尝试导入 FormRule 和 FormCallback，但发现 Element Plus 没有这些类型
然后尝试导入 Callback 类型，但发现这是 MessageBox 组件的回调类型，不适合表单验证
定义自定义类型：type ValidatorCallback = (error?: string | Error) => void
更新验证器函数的参数类型：callback: ValidatorCallback
问题 4：验证器函数的 rule 参数使用 any 类型
问题描述：表单验证器函数的 rule 参数使用了 any 类型，用户希望避免使用 any 类型以提高代码的类型安全性。

解决方案：

定义自定义类型 FormRule，包含表单验证规则的常见属性：
TypeScript

type FormRule = { required?: boolean; message?: string; trigger?: string; min?: number; max?: number; type?: string; validator?: (rule: FormRule, value: any, callback: ValidatorCallback) => void;};
更新验证器函数的参数类型：rule: FormRule
验证过程
在解决每个问题后，我都会运行 npm run type-check 命令来验证代码是否通过类型检查：

第一次修改后：出现类型导入错误，因为没有使用 import type 语法
第二次修改后：出现 Callback 类型参数不匹配错误
第三次修改后：类型检查通过，没有错误

使用了 TypeScript 的 Omit 类型来排除密码字段
