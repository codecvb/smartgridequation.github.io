'use strict';

const store = require('../lib/store');

const [,, usernameArg, passwordArg] = process.argv;

function main() {
  const users = store.getUsers();
  if (!users.length) {
    console.log('还没有管理员账号，请先启动一次服务器完成初始化。');
    process.exit(1);
  }
  const username = usernameArg || users[0].username;
  const password = passwordArg;
  if (!password || password.length < 8) {
    console.log('用法: npm run reset-password -- <用户名> <新密码>');
    console.log('新密码至少 8 位。');
    process.exit(1);
  }
  const user = store.findUser(username);
  if (!user) {
    console.log('找不到用户: ' + username);
    process.exit(1);
  }
  store.changePassword(user.id, password);
  console.log('已重置 ' + username + ' 的密码。');
}

main();
