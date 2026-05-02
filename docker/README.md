# LightBlog Docker 部署

## 项目结构

```
docker/
├── .env.example          # Docker 环境变量示例
├── README.md             # 本文件
├── client/
│   ├── Dockerfile        # 前端镜像构建文件
│   └── nginx.conf        # Nginx 配置
└── server/
    └── Dockerfile        # 后端镜像构建文件
```

## 快速开始

### 1. 配置环境变量

```bash
cd ..  # 回到项目根目录
cp docker/.env.example .env
# 编辑 .env 文件，根据需要修改配置
```

### 2. 启动服务

```bash
docker-compose up -d --build
```

### 3. 访问应用

- 前端：http://localhost:8080
- 后端 API：http://localhost:3000/api
- MySQL：localhost:3307

## 登录管理后台（无需额外设置密码！）

> ⚠️ **安全警告**：
>
> - 数据库已预置管理员账号，密码是 `123456`，**生产环境请务必立即修改**
> - MySQL 默认密码是 `lightblog123`，**生产环境请务必修改**
> - JWT_SECRET 默认值是 `your-secret-key`，**生产环境请务必修改为复杂的随机字符串**

数据库已预置管理员账号，直接登录即可：

| 邮箱                | 用户名    | 密码   |
| ------------------- | --------- | ------ |
| lanxiaole@admin.com | lanxiaole | 123456 |
| jiale@admin.com     | jiale     | 123456 |

访问管理后台：http://localhost:8080/admin-login

---

\*\*（可选）想修改管理员密码？

```bash
# 1. 生成新密码哈希（将 newpassword123 替换为你想设置的密码）
cd server
npm install
node ../database/generate-password.js newpassword123

# 2. 进入 MySQL 容器
docker exec -it lightblog-mysql mysql -u root -p
# 输入密码：lightblog123（或你在 .env 中配置的密码）

# 3. 执行 SQL 更新密码
USE lightblog;

-- 将下面的哈希值替换为你刚刚生成的
UPDATE users SET password = '$2b$10$你的真实哈希值' WHERE email = 'lanxiaole@admin.com';
UPDATE users SET password = '$2b$10$你的真实哈希值' WHERE email = 'jiale@admin.com';
```

---

\*\*（可选）想创建新的管理员账号？

\*\*方法 1：直接插入 SQL（推荐）

```bash
# 1. 生成管理员密码哈希（将 yourpassword123 替换为你想设置的密码）
cd server
npm install
node ../database/generate-password.js yourpassword123
# 复制生成的哈希值

# 2. 进入 MySQL 容器
docker exec -it lightblog-mysql mysql -u root -p
# 输入密码：lightblog123（或你在 .env 中配置的密码）

# 3. 执行 SQL 创建管理员
USE lightblog;

-- 将下面的邮箱、用户名、哈希值替换为你自己的
INSERT INTO `users` (`email`, `username`, `password`, `role`) VALUES
('zhangsan@admin.com', 'zhangsan', '$2b$10$你的真实哈希值', 'admin');
```

\*\*方法 2：先注册普通用户，再升级为管理员

```bash
# 1. 先在前端 http://localhost:8080/register 注册一个普通用户

# 2. 进入 MySQL 容器
docker exec -it lightblog-mysql mysql -u root -p
# 输入密码：lightblog123（或你在 .env 中配置的密码）

# 3. 升级为管理员
USE lightblog;
UPDATE users SET role = 'admin' WHERE username = '你的用户名';
```

## 常用命令

| 命令                           | 说明               |
| ------------------------------ | ------------------ |
| `docker-compose up -d --build` | 构建并启动所有服务 |
| `docker-compose down`          | 停止并删除所有容器 |
| `docker-compose logs -f`       | 查看实时日志       |
| `docker-compose restart`       | 重启所有服务       |
