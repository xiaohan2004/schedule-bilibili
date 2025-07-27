const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Request = require('./../api/base');
const notice = require('./../api/notice');
const request = new Request();
class Task {
  constructor() {
    this.request = new Request();
    // util
    this._ = _;
  }
  getTaskName() {
    throw new Error('getTaskName() Must be implement');
  }

  async run() {
    throw new Error('run() Must be implement');
  }

  order() {
    throw new Error('order() Must be implement');
  }  async get(url, params, field) {
    let result = {};
    try {
      result = await this.request.get(url, params, field);
      console.log(`[HTTP GET] 请求成功`);
    } catch (e) {
      console.error(`[HTTP GET] 请求失败`);
    }
    return result;
  }  async post(url, params, field) {
    let result = {};
    try {
      result = await this.request.post(url, params, field);
      console.log(`[HTTP POST] 请求成功`);
    } catch (e) {
      console.error(`[HTTP POST] 请求失败`);
    }
    return result;
  }

  async getCookie(field) {
    const userInfo = this.getUserStatus();
    const res = userInfo.cookie.split(';');
    const [tstr] = res.filter((f) => f.indexOf(field) != -1);    if (!tstr) {
      console.error(`Cookie字段未找到`);
      return null;
    }
    let [_, jct] = tstr.split('=');
    return jct ? jct.trim() : null;
  }

  async send(msg) {
    await notice(
      this.getUserStatus().serverSecret,
      'Bilibili 通知' + +new Date(),
      msg
    );
  }  /**
   * 读取用户信息
   */
  getUserStatus() {
    const userStatusPath = __dirname + '/userStatus.json';
    const fallbackPath = path.join(process.cwd(), 'userStatus.json');
    
    try {
      // 首先尝试从task目录读取
      if (fs.existsSync(userStatusPath)) {
        const userStr = fs.readFileSync(userStatusPath, {
          encoding: 'utf-8',
        });
        const user = JSON.parse(userStr);
        return user;
      }
        // 如果task目录中没有，尝试从工作目录读取
      if (fs.existsSync(fallbackPath)) {
        console.log('从备用位置读取用户配置');
        const userStr = fs.readFileSync(fallbackPath, {
          encoding: 'utf-8',
        });
        const user = JSON.parse(userStr);
        return user;
      }
      
      // 两个位置都没有文件
      console.log('userStatus.json 不存在，返回默认配置');
      return { cookie: '', serverSecret: '' };
      
    } catch (error) {
      console.error('读取用户状态失败:', error.message);
      return { cookie: '', serverSecret: '' };
    }
  }/**
   * 设置用户信息
   * @param {用户信息}} userInfo
   */
  setUserStatus(userInfo) {
    try {
      const oldUser = this.getUserStatus();
      userInfo = Object.assign({}, oldUser, userInfo);

      const userStatusPath = __dirname + '/userStatus.json';
      const taskDir = __dirname;
      
      // 确保目录存在
      if (!fs.existsSync(taskDir)) {
        console.log('创建task目录...');
        fs.mkdirSync(taskDir, { recursive: true });
      }
        // 写入文件
      fs.writeFileSync(userStatusPath, JSON.stringify(userInfo, null, 2), {
        encoding: 'utf-8',
      });
      console.log('用户状态保存成功');
    } catch (error) {
      console.error('保存用户状态失败');
      console.error('尝试使用备用路径保存...');
      
      // 备用方案：使用进程工作目录
      try {
        const fallbackPath = path.join(process.cwd(), 'userStatus.json');
        fs.writeFileSync(fallbackPath, JSON.stringify(userInfo, null, 2), {
          encoding: 'utf-8',
        });
        console.log('用户状态已保存到备用位置');
      } catch (fallbackError) {
        console.error('备用保存方案也失败');
      }
    }
  }

  async getVideoTitle(bvid) {
    const videoViewURL =
      'https://api.bilibili.com/x/web-interface/view?bvid=' + bvid;

    let title = '未能获取到标题';
    const result = await request.get(videoViewURL);
    if (+result.code === 0) {
      const owner = this._.get(result, 'data.owner.name');
      return owner + ' ' + result.data.title;
    }
    return title;
  }

  /**
   * 返回会员类型
   * 0: 无会员
   * 1: 月会员
   * 2: 年会员
   */
  queryVipStatusType() {
    const user = this.getUserStatus();
    if (user.vipStatus === 1) {
      return user.vipType;
    }
    return 0;
  }
}

module.exports = Task;
