const axios = require('axios');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const send = require('./notice');

class Base {
  constructor() {
    // tools
    this._ = _;

    // plugins
    this.axios = axios;    // params
    this.serverBaseURL = '';
    this.pathURL = '';
    this.timeOut = 2000;

    let user = { cookie: '', serverSecret: '' };
    const userStatusPath = path.join(__dirname, './../task/userStatus.json');
    
    try {
      if (fs.existsSync(userStatusPath)) {
        const userStr = fs.readFileSync(userStatusPath, {
          encoding: 'utf-8',
        });
        user = JSON.parse(userStr);
      } else {
        console.log('userStatus.json 不存在，使用默认配置');
      }
    } catch (error) {
      console.error('读取用户配置失败:', error.message);
    }

    this.userAgent =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15';
    this.cookie = user.cookie || '';
  }

  async get(url, params = {}, field = '') {
    const headers = {
      'Content-Type': 'application/json',
      Referer: 'https://www.bilibili.com',
      Connection: 'keep-alive',
      'User-Agent': this.userAgent,
      Cookie: this.cookie,
    };
    let result = {};
    try {
      result = await axios.get(url, {
        headers,
        params,
      });    } catch (e) {
      console.error('API请求失败:', e.message);
      // 只有在有serverSecret的情况下才发送通知
      try {
        const userStatusPath = path.join(__dirname, './../task/userStatus.json');
        if (fs.existsSync(userStatusPath)) {
          const user = JSON.parse(
            fs.readFileSync(userStatusPath, {
              encoding: 'utf-8',
            })
          );
          if (user.serverSecret) {
            try {
              await send(user.serverSecret, 'B站任务API请求失败', `请求URL: ${url}\n错误信息: ${e.message}`);
            } catch (sendError) {
              console.error('发送通知失败:', sendError.message);
            }
          }
        }
      } catch (readError) {
        console.error('读取用户配置失败:', readError.message);
      }
    }

    return field === '' ? result.data : this._.get(result.data, field);
  }

  async post(url, params = {}, field = '') {
    const headers = {
      'Content-Type':
        typeof params === 'string'
          ? 'application/x-www-form-urlencoded'
          : 'application/json',
      Referer: 'https://www.bilibili.com',
      Connection: 'keep-alive',
      'User-Agent': this.userAgent,
      Cookie: this.cookie,
    };
    let result = {};

    try {
      result = await axios({
        url,
        method: 'POST',
        headers,
        data: params,
      });
    } catch (e) {
      return null;
    }

    return field === '' ? result.data : this._.get(result.data, field);
  }
}

module.exports = Base;
