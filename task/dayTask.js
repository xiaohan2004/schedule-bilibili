const base = require('./base');
const qs = require('qs');
const fs = require('fs');

/**
 * 漫画签到
 */
class dayTask extends base {
  constructor(args) {
    super(args);
  }

  order() {
    return 1;
  }  async run() {
    console.log('\n===== 开始获取每日任务状态 =====');
    
    const dayTaskURL = 'https://api.bilibili.com/x/member/web/exp/reward';
    
    let result = await this.get(dayTaskURL);
    
    if (result && +result.code === 0) {
      console.info('----- 请求本日任务状态成功 -----');
      this.setUserStatus(result.data || {});
    } else if (result) {
      // 偶发性失败，在请求一次
      console.error(`----- [error] 第一次请求失败，正在重试 -----`);
      
      result = await this.get(dayTaskURL);
      
      if (result && result.data) {
        console.log('重试成功');
        this.setUserStatus(result.data);
      } else {
        console.error('----- [error] 重试后仍然失败，使用默认状态 -----');
        this.setUserStatus({});
      }
    } else {
      console.error('----- [error] 请求本日任务状态失败，使用默认状态 -----');
      this.setUserStatus({});
    }
    
    console.log('===== 每日任务状态获取完成 =====\n');
  }

  getTaskName() {
    return '用户任务完成状态检查';
  }
}

module.exports = dayTask;
