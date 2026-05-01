// 生成 bcrypt 加密密码的工具脚本
// 使用方法：node database/generate-password.js <password>

const bcrypt = require('bcryptjs');

// 获取命令行参数中的密码
const password = process.argv[2];

if (!password) {
  console.error('请输入要加密的密码！');
  console.log('使用方法：node database/generate-password.js <password>');
  process.exit(1);
}

// 生成盐值和哈希值
const saltRounds = 10;

console.log('正在生成 bcrypt 哈希...');
console.log(`原密码: ${password}`);
console.log(`盐值轮数: ${saltRounds}`);
console.log();

// 同步生成哈希（更简单）
const salt = bcrypt.genSaltSync(saltRounds);
const hash = bcrypt.hashSync(password, salt);

console.log('========================================');
console.log('哈希值:');
console.log(hash);
console.log('========================================');
console.log();
console.log('请将此哈希值复制到 database/schema.sql 中替换管理员密码');
console.log('或直接在 MySQL 中执行 UPDATE 语句更新密码');
console.log();
console.log('MySQL 更新语句示例:');
console.log(`UPDATE users SET password = '${hash}' WHERE email = 'lanxiaole@admin.com';`);
console.log(`UPDATE users SET password = '${hash}' WHERE email = 'weijiale@admin.com';`);
console.log();
console.log('✅ 密码生成完成！');
