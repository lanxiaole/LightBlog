/*
 Navicat Premium Dump SQL

 Source Server         : main
 Source Server Type    : MySQL
 Source Server Version : 80300 (8.3.0)
 Source Host           : localhost:3306
 Source Schema         : lightblog

 Target Server Type    : MySQL
 Target Server Version : 80300 (8.3.0)
 File Encoding         : 65001

 Date: 01/05/2026 22:11:12
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for article_tags
-- ----------------------------
DROP TABLE IF EXISTS `article_tags`;
CREATE TABLE `article_tags`  (
  `article_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`article_id`, `tag_id`) USING BTREE,
  INDEX `tag_id`(`tag_id` ASC) USING BTREE,
  CONSTRAINT `article_tags_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `article_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of article_tags
-- ----------------------------
INSERT INTO `article_tags` VALUES (12, 1);
INSERT INTO `article_tags` VALUES (14, 1);
INSERT INTO `article_tags` VALUES (9, 2);
INSERT INTO `article_tags` VALUES (11, 3);
INSERT INTO `article_tags` VALUES (17, 4);
INSERT INTO `article_tags` VALUES (18, 6);

-- ----------------------------
-- Table structure for articles
-- ----------------------------
DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `cover` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `author_id` int NOT NULL,
  `category_id` int NULL DEFAULT NULL,
  `status` enum('draft','published','banned') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'published',
  `is_pinned` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否置顶：0否，1是',
  `views` int NULL DEFAULT 0,
  `likes` int NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `author_id`(`author_id` ASC) USING BTREE,
  INDEX `articles_ibfk_2`(`category_id` ASC) USING BTREE,
  FULLTEXT INDEX `ft_title_content`(`title`, `content`) WITH PARSER `ngram`,
  CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `articles_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of articles
-- ----------------------------
INSERT INTO `articles` VALUES (4, '测试文章标题', '这是一篇测试文章的内容，包含了一些测试文本。这是文章的第二段，用于测试文章摘要功能。', NULL, 11, NULL, 'published', 0, 0, 0, '2026-03-11 20:45:24', '2026-03-11 20:45:24');
INSERT INTO `articles` VALUES (5, '1', '<p>1</p>', NULL, 9, NULL, 'published', 0, 0, 0, '2026-03-12 20:55:55', '2026-04-13 22:12:00');
INSERT INTO `articles` VALUES (6, '来测！', '<h1>我是H1！</h1><p><strong>我加粗！</strong></p><p><u>下划线！</u></p><p><u>😀😚</u></p><p><span style=\"background-color: rgb(247, 89, 171);\"><u>改颜色！</u></span></p>', 'blob:http://localhost:5173/f0da872f-cb55-428c-b76b-7f2257aebc12', 9, NULL, 'published', 0, 0, 0, '2026-03-12 21:00:52', '2026-04-13 22:11:59');
INSERT INTO `articles` VALUES (8, '长文章！', '<p>长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长</p>', NULL, 9, NULL, 'published', 0, 0, 0, '2026-03-13 19:09:36', '2026-03-13 19:09:36');
INSERT INTO `articles` VALUES (9, '分类和标签测试', '<p><br></p>', '', 9, 3, 'published', 0, 1, 0, '2026-03-14 14:55:42', '2026-05-01 19:54:09');
INSERT INTO `articles` VALUES (11, '做饭小妙招', '<p>柿子炒鸡蛋123</p>', '', 9, 2, 'published', 0, 1, 0, '2026-03-14 16:42:58', '2026-05-01 19:55:58');
INSERT INTO `articles` VALUES (12, '学习js', '<p>学12</p>', '', 9, 3, 'published', 0, 1, 0, '2026-03-15 14:04:54', '2026-05-01 16:50:33');
INSERT INTO `articles` VALUES (14, 'lan的文章', '<p>1</p>', NULL, 12, 3, 'published', 0, 2, 0, '2026-03-16 18:12:33', '2026-05-01 19:55:24');
INSERT INTO `articles` VALUES (15, '公告', '<p>这是一则管理员发布的公告</p>', NULL, 15, NULL, 'published', 0, 1, 0, '2026-03-19 18:48:19', '2026-04-30 21:41:09');
INSERT INTO `articles` VALUES (16, '测试（管理员修改）', '<p><br></p>', 'https://lightblog1.oss-cn-beijing.aliyuncs.com/cover/20260501/c6af59887e3948a48df0f2bb40c6b541.jpg', 9, NULL, 'published', 0, 10, 0, '2026-03-19 18:51:08', '2026-05-01 19:54:23');
INSERT INTO `articles` VALUES (17, '公告2', '<p>这是2公告</p><p><br></p><p>修改<img src=\"https://lightblog1.oss-cn-beijing.aliyuncs.com/editor/20260501/821ab1b49d2d446d81a394a95b46c9a1.png\" alt=\"\" data-href=\"\" style=\"\"/></p>', 'https://lightblog1.oss-cn-beijing.aliyuncs.com/cover/20260501/395aec1c71fb477481b8b773ed4a954c.png', 15, 2, 'published', 1, 24, 0, '2026-04-13 18:43:13', '2026-05-01 21:50:01');
INSERT INTO `articles` VALUES (18, '图片测试', '<p>实现图片上传！</p>', 'https://lightblog1.oss-cn-beijing.aliyuncs.com/cover/20260501/7f6f1bd0cd424d6e8a10c7e4e3315a52.png', 15, 2, 'published', 0, 2, 0, '2026-05-01 16:44:53', '2026-05-01 16:45:02');

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES (1, '技术', '技术相关文章', '2026-03-14 14:22:29');
INSERT INTO `categories` VALUES (2, '生活', '生活随笔', '2026-03-14 14:22:29');
INSERT INTO `categories` VALUES (3, '学习', '学习笔记', '2026-03-14 14:22:29');
INSERT INTO `categories` VALUES (5, '美食', NULL, '2026-04-14 20:16:27');

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `article_id` int NOT NULL,
  `user_id` int NOT NULL,
  `parent_id` int NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `article_id`(`article_id` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `parent_id`(`parent_id` ASC) USING BTREE,
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of comments
-- ----------------------------
INSERT INTO `comments` VALUES (2, '测试', 11, 9, NULL, '2026-03-14 17:15:31', '2026-03-14 17:15:31');
INSERT INTO `comments` VALUES (3, '我来回复！', 11, 9, 2, '2026-03-14 17:20:18', '2026-03-14 17:20:18');
INSERT INTO `comments` VALUES (4, '我来回复回复！', 11, 9, 3, '2026-03-14 17:20:29', '2026-03-14 17:20:29');
INSERT INTO `comments` VALUES (5, '我也回复', 11, 12, 2, '2026-03-14 20:23:05', '2026-03-14 20:23:05');
INSERT INTO `comments` VALUES (6, '我来', 11, 12, NULL, '2026-03-14 20:23:15', '2026-03-14 20:23:15');
INSERT INTO `comments` VALUES (9, '回复回复回复！', 11, 9, 4, '2026-03-14 20:33:35', '2026-03-14 20:33:35');
INSERT INTO `comments` VALUES (10, '回复回复回复回复！', 11, 9, 9, '2026-03-14 20:34:08', '2026-03-14 20:34:08');
INSERT INTO `comments` VALUES (11, '1', 11, 9, 3, '2026-03-14 22:10:24', '2026-03-14 22:10:24');
INSERT INTO `comments` VALUES (12, '1', 12, 9, NULL, '2026-03-15 15:58:35', '2026-03-15 15:58:35');
INSERT INTO `comments` VALUES (14, '好', 14, 9, NULL, '2026-03-17 20:46:47', '2026-03-17 20:46:47');
INSERT INTO `comments` VALUES (15, '你好', 12, 15, 12, '2026-04-29 19:04:07', '2026-04-29 19:04:07');
INSERT INTO `comments` VALUES (16, '1', 17, 15, NULL, '2026-04-29 19:17:19', '2026-04-29 19:17:19');
INSERT INTO `comments` VALUES (17, '1', 17, 15, 16, '2026-04-29 19:17:22', '2026-04-29 19:17:22');
INSERT INTO `comments` VALUES (18, '测试', 17, 9, NULL, '2026-04-30 21:42:34', '2026-04-30 21:42:34');
INSERT INTO `comments` VALUES (19, '2', 17, 9, NULL, '2026-04-30 21:44:10', '2026-04-30 21:44:10');

-- ----------------------------
-- Table structure for favorites
-- ----------------------------
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites`  (
  `user_id` int NOT NULL,
  `article_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `article_id`) USING BTREE,
  INDEX `article_id`(`article_id` ASC) USING BTREE,
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of favorites
-- ----------------------------
INSERT INTO `favorites` VALUES (9, 6, '2026-03-17 20:46:16');
INSERT INTO `favorites` VALUES (9, 11, '2026-03-16 17:17:21');
INSERT INTO `favorites` VALUES (9, 14, '2026-03-17 20:39:52');
INSERT INTO `favorites` VALUES (9, 17, '2026-04-17 21:52:25');
INSERT INTO `favorites` VALUES (12, 6, '2026-03-17 17:28:53');
INSERT INTO `favorites` VALUES (12, 11, '2026-03-16 17:17:27');
INSERT INTO `favorites` VALUES (12, 14, '2026-03-16 22:06:27');
INSERT INTO `favorites` VALUES (15, 14, '2026-03-18 22:00:43');
INSERT INTO `favorites` VALUES (15, 16, '2026-04-17 22:08:49');
INSERT INTO `favorites` VALUES (15, 17, '2026-04-29 20:48:28');

-- ----------------------------
-- Table structure for follows
-- ----------------------------
DROP TABLE IF EXISTS `follows`;
CREATE TABLE `follows`  (
  `follower_id` int NOT NULL COMMENT '关注者ID',
  `following_id` int NOT NULL COMMENT '被关注者ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`follower_id`, `following_id`) USING BTREE,
  INDEX `following_id`(`following_id` ASC) USING BTREE,
  CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of follows
-- ----------------------------
INSERT INTO `follows` VALUES (9, 12, '2026-03-16 18:57:33');
INSERT INTO `follows` VALUES (9, 15, '2026-04-17 21:35:25');
INSERT INTO `follows` VALUES (12, 9, '2026-03-16 19:51:52');
INSERT INTO `follows` VALUES (15, 9, '2026-04-29 19:56:41');
INSERT INTO `follows` VALUES (15, 12, '2026-04-29 20:06:12');

-- ----------------------------
-- Table structure for likes
-- ----------------------------
DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes`  (
  `user_id` int NOT NULL,
  `article_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `article_id`) USING BTREE,
  INDEX `article_id`(`article_id` ASC) USING BTREE,
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of likes
-- ----------------------------
INSERT INTO `likes` VALUES (9, 6, '2026-03-17 20:46:22');
INSERT INTO `likes` VALUES (9, 11, '2026-03-15 16:38:22');
INSERT INTO `likes` VALUES (9, 14, '2026-03-17 20:46:31');
INSERT INTO `likes` VALUES (9, 17, '2026-04-26 16:56:28');
INSERT INTO `likes` VALUES (12, 6, '2026-03-17 17:19:42');
INSERT INTO `likes` VALUES (15, 14, '2026-03-18 22:00:42');
INSERT INTO `likes` VALUES (15, 16, '2026-04-17 22:13:40');
INSERT INTO `likes` VALUES (15, 17, '2026-04-29 19:17:12');

-- ----------------------------
-- Table structure for notifications
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('comment','reply','like','favorite','follow') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '通知类型',
  `sender_id` int NOT NULL COMMENT '触发通知的用户ID',
  `receiver_id` int NOT NULL COMMENT '接收通知的用户ID',
  `article_id` int NULL DEFAULT NULL COMMENT '关联文章ID（如果适用）',
  `comment_id` int NULL DEFAULT NULL COMMENT '关联评论ID（如果适用）',
  `is_read` tinyint(1) NULL DEFAULT 0 COMMENT '是否已读',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `receiver_id`(`receiver_id` ASC) USING BTREE,
  INDEX `sender_id`(`sender_id` ASC) USING BTREE,
  INDEX `article_id`(`article_id` ASC) USING BTREE,
  INDEX `comment_id`(`comment_id` ASC) USING BTREE,
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `notifications_ibfk_4` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 32 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of notifications
-- ----------------------------
INSERT INTO `notifications` VALUES (3, 'like', 12, 9, 6, NULL, 1, '2026-03-17 17:19:42');
INSERT INTO `notifications` VALUES (4, 'favorite', 12, 9, 6, NULL, 1, '2026-03-17 17:28:53');
INSERT INTO `notifications` VALUES (5, 'favorite', 12, 9, 6, NULL, 1, '2026-03-17 19:26:09');
INSERT INTO `notifications` VALUES (6, 'favorite', 12, 9, 6, NULL, 0, '2026-03-17 19:48:17');
INSERT INTO `notifications` VALUES (7, 'favorite', 12, 9, 6, NULL, 0, '2026-03-17 20:39:03');
INSERT INTO `notifications` VALUES (8, 'favorite', 12, 9, 6, NULL, 0, '2026-03-17 20:39:30');
INSERT INTO `notifications` VALUES (9, 'favorite', 9, 12, 14, NULL, 0, '2026-03-17 20:39:52');
INSERT INTO `notifications` VALUES (10, 'favorite', 9, 12, 14, NULL, 0, '2026-03-17 20:39:55');
INSERT INTO `notifications` VALUES (12, 'favorite', 12, 9, 6, NULL, 0, '2026-03-17 20:40:12');
INSERT INTO `notifications` VALUES (13, 'favorite', 12, 9, 6, NULL, 0, '2026-03-17 20:40:14');
INSERT INTO `notifications` VALUES (14, 'like', 9, 12, 14, NULL, 0, '2026-03-17 20:46:31');
INSERT INTO `notifications` VALUES (15, 'comment', 9, 12, 14, 14, 0, '2026-03-17 20:46:47');
INSERT INTO `notifications` VALUES (16, 'like', 15, 12, 14, NULL, 0, '2026-03-18 22:00:42');
INSERT INTO `notifications` VALUES (17, 'favorite', 15, 12, 14, NULL, 0, '2026-03-18 22:00:43');
INSERT INTO `notifications` VALUES (18, 'follow', 9, 15, NULL, NULL, 0, '2026-04-17 21:35:25');
INSERT INTO `notifications` VALUES (19, 'like', 15, 9, 16, NULL, 0, '2026-04-17 21:46:25');
INSERT INTO `notifications` VALUES (20, 'favorite', 15, 9, 16, NULL, 0, '2026-04-17 21:46:25');
INSERT INTO `notifications` VALUES (21, 'favorite', 9, 15, 17, NULL, 0, '2026-04-17 21:52:25');
INSERT INTO `notifications` VALUES (22, 'like', 15, 9, 16, NULL, 0, '2026-04-17 22:08:44');
INSERT INTO `notifications` VALUES (23, 'favorite', 15, 9, 16, NULL, 0, '2026-04-17 22:08:49');
INSERT INTO `notifications` VALUES (24, 'like', 15, 9, 16, NULL, 0, '2026-04-17 22:13:40');
INSERT INTO `notifications` VALUES (25, 'like', 9, 15, 17, NULL, 0, '2026-04-26 16:56:28');
INSERT INTO `notifications` VALUES (26, 'comment', 15, 9, 12, 15, 0, '2026-04-29 19:04:07');
INSERT INTO `notifications` VALUES (27, 'reply', 15, 9, 12, 15, 0, '2026-04-29 19:04:07');
INSERT INTO `notifications` VALUES (28, 'follow', 15, 9, NULL, NULL, 0, '2026-04-29 19:56:41');
INSERT INTO `notifications` VALUES (29, 'follow', 15, 12, NULL, NULL, 0, '2026-04-29 20:06:12');
INSERT INTO `notifications` VALUES (30, 'comment', 9, 15, 17, 18, 0, '2026-04-30 21:42:34');
INSERT INTO `notifications` VALUES (31, 'comment', 9, 15, 17, 19, 0, '2026-04-30 21:44:10');

-- ----------------------------
-- Table structure for tags
-- ----------------------------
DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tags
-- ----------------------------
INSERT INTO `tags` VALUES (1, 'JavaScript', '2026-03-14 14:55:42');
INSERT INTO `tags` VALUES (2, 'vue', '2026-03-14 15:16:45');
INSERT INTO `tags` VALUES (3, '做饭', '2026-03-14 16:42:58');
INSERT INTO `tags` VALUES (4, '公告', '2026-04-13 18:43:13');
INSERT INTO `tags` VALUES (5, 'python', '2026-04-14 21:13:26');
INSERT INTO `tags` VALUES (6, '测试', '2026-05-01 16:44:53');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `role` enum('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '账号状态：1启用，0禁用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (2, '939630650@qq.com', '111111', '$2a$10$QGB6hz7fiWp60W5ZKOH8QuLRSvR2RCYcIjMMF.nw3E1oHBME9xWgC', NULL, NULL, 'user', 1, '2026-03-10 22:20:42', '2026-03-10 22:20:42');
INSERT INTO `users` VALUES (3, 'test@example.com', 'testuser', '$2a$10$8g1BdiCAN2NnZaQJmH303eSjkVvhxkhjT0X2ZUPs0l/Mr7CMlap.2', NULL, NULL, 'user', 1, '2026-03-11 14:13:10', '2026-03-11 14:13:10');
INSERT INTO `users` VALUES (4, '123456@QQ.com', '123456', '$2a$10$s10/lPz3exZe2o7gVnErue3VpACRDZjXtvcito6REhUnGC7qE25NK', NULL, NULL, 'user', 1, '2026-03-11 14:14:24', '2026-03-11 14:14:24');
INSERT INTO `users` VALUES (5, '55555555@QQ.com', '555555', '$2a$10$yIDStJg25In7QpBmdCpSdOsYMniO6zQB3JhNotFNexywA5XYXUZy6', NULL, NULL, 'user', 1, '2026-03-11 14:18:53', '2026-03-11 14:18:53');
INSERT INTO `users` VALUES (6, '555555555@QQ.com', '444444', '$2a$10$RUwXOpQEFkP0.XLvJEWAs..W.cDI9fLjaaSXzfKbCoj9TckipI5Ze', NULL, NULL, 'user', 1, '2026-03-11 14:19:14', '2026-03-11 14:19:14');
INSERT INTO `users` VALUES (7, '5555555@QQ.com', '111', '$2a$10$IplN/zEKsnQoD5paIvLDHuYdxEtr1U8vDEjNu8.t9RSlV6gb1PlrO', NULL, NULL, 'user', 1, '2026-03-11 14:21:00', '2026-03-19 19:22:46');
INSERT INTO `users` VALUES (8, '555555699995@QQ.com', '1111115', '$2a$10$93NCjo4r91TlXP0O3qMnouuDiw2WQmH3COK.cvOQ1eA.f7uIjqW/2', NULL, NULL, 'user', 1, '2026-03-11 15:09:41', '2026-03-11 15:09:41');
INSERT INTO `users` VALUES (9, 'le939630650@gmail.com', 'lanxiaole1', '$2a$10$97QZ/pa0eQ444WvSCTU8G.NQrgUixka5wr8ot9.EepF3VXWT//61u', 'https://lightblog1.oss-cn-beijing.aliyuncs.com/avatar/20260501/0efdfe1e279c4b35a7ff0200d8cc5891.jpg', '111', 'user', 1, '2026-03-11 15:41:38', '2026-05-01 17:05:27');
INSERT INTO `users` VALUES (11, 'test2@example.com', 'testuser2', 'password123', NULL, '这是另一个测试用户', 'user', 1, '2026-03-11 20:44:50', '2026-03-11 20:44:50');
INSERT INTO `users` VALUES (12, '123@qq.com', 'lan', '$2a$10$pVWw6LwpVETgFUuUcIa4HO/7g8oQ2Ts.3722g5ejiPWR7.fKVtfXu', NULL, NULL, 'user', 1, '2026-03-14 20:21:06', '2026-03-14 20:21:06');
INSERT INTO `users` VALUES (15, 'lanxiaole@admin.com', 'lanxiaole', '$2b$10$dJfEdhmQNf7vB5JFkCfOi.QK/vzH.R4bILW3QZ4BJ/9ErOWGr4v0S', 'https://lightblog1.oss-cn-beijing.aliyuncs.com/avatar/20260501/942710c0359148e6946f1d0542954627.jpg', '', 'admin', 1, '2026-03-18 15:26:24', '2026-05-01 16:43:56');
INSERT INTO `users` VALUES (16, 'weijiale@admin.com', 'weijiale', '$2b$10$dJfEdhmQNf7vB5JFkCfOi.QK/vzH.R4bILW3QZ4BJ/9ErOWGr4v0S', NULL, NULL, 'admin', 1, '2026-03-18 15:26:24', '2026-04-13 18:40:00');
INSERT INTO `users` VALUES (17, 'test1@user.com', 'test1', '$2a$10$jGFgbcqXdBQVmD8rB8JX8uwPt3oNJ3A0X0lc6fCSFmFnxShT7Hc96', NULL, NULL, 'user', 1, '2026-03-19 16:41:37', '2026-05-01 17:04:48');

SET FOREIGN_KEY_CHECKS = 1;
