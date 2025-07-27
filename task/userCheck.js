const base = require('./base');
const qs = require('qs');
const fs = require('fs');

class userCheck extends base {
  constructor(args) {
    super(args);
  }

  order() {
    return 0;
  }

  async run() {
    const userCheckURL = 'https://api.bilibili.com/x/web-interface/nav';
    let result = {};
    try {
      result = await this.request.get(userCheckURL);
    } catch (e) {
      await this.send('登录失效了，速来更新' + +new Date());
    }
    const isLogin = this._.get(result, 'data.isLogin');
    const username = this._.get(result, 'data.uname');
    const money = this._.get(result, 'data.money');
    if (isLogin) {
      this.userInfo = result.data;
      console.info('----- login success -----');
      const intPart = Math.floor(Math.abs(Number(money))); // 处理可能是字符串的小数
      const lastDigit = intPart % 10;
      console.info(`----- [金币余额个位：${lastDigit}] -----`);
      this.setUserStatus(result.data);
      return true;
    } else {
      await this.send('登录失效了，速来更新' + +new Date());
      return false;
    }
  }

  getTaskName() {
    return '用户登录检查';
  }
}

module.exports = userCheck;
