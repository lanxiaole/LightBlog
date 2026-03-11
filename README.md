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
