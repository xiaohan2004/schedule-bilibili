const _ = require('lodash');
const fs = require('fs');
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
  }
  async get(url, params, field) {
    let result = {};
    try {
      console.log(`[HTTP GET] 请求: ${url}`);
      if (params && Object.keys(params).length > 0) {
        console.log('[HTTP GET] 参数:', params);
      }
      result = await this.request.get(url, params, field);
      console.log(`[HTTP GET] 响应成功`);
    } catch (e) {
      console.error(`[HTTP GET] 请求失败: ${e.message}`);
    }
    return result;
  }
  async post(url, params, field) {
    let result = {};
    try {
      console.log(`[HTTP POST] 请求: ${url}`);
      if (params) {
        console.log('[HTTP POST] 参数类型:', typeof params);
      }
      result = await this.request.post(url, params, field);      console.log(`[HTTP POST] 响应成功`);
    } catch (e) {
      console.error(`[HTTP POST] 请求失败: ${e.message}`);
    }
    return result;
  }

  async getCookie(field) {
    const userInfo = this.getUserStatus();
    const res = userInfo.cookie.split(';');
    const [tstr] = res.filter((f) => f.indexOf(field) != -1);
    if (!tstr) {
      console.error(`Cookie字段 ${field} 未找到`);
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
  }

  /**
   * 读取用户信息
   */
  getUserStatus() {
    const userStr = fs.readFileSync(__dirname + '/userStatus.json', {
      encoding: 'utf-8',
    });
    const user = JSON.parse(userStr);
    return user;
  }

  /**
   * 设置用户信息
   * @param {用户信息}} userInfo
   */
  setUserStatus(userInfo) {
    const oldUser = this.getUserStatus();
    userInfo = Object.assign({}, oldUser, userInfo);

    fs.writeFileSync(__dirname + '/userStatus.json', JSON.stringify(userInfo), {
      encoding: 'utf-8',
    });
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
