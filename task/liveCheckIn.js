const base = require('./base');
const qs = require('qs');
const fs = require('fs');

/**
 * 漫画签到
 */
class liveCheckIn extends base {
  order() {
    return 6;
  }  async run() {
    console.log('\n===== 开始执行直播签到任务 =====');
    
    const liveCheckInURL =
      'https://api.live.bilibili.com/xlive/web-ucenter/v1/sign/DoSign';
    
    let result = await this.request.get(liveCheckInURL);
    
    if (result && +result.code === 0) {
      const rewardText = result.data?.text?.specialText || '签到奖励';
      console.info('----- [直播签到成功，本次获得] -----' + rewardText);
    } else if (result) {
      console.info('----- [直播签到失败] -----');
    } else {
      console.error('----- [直播签到请求失败] -----');
    }
    
    console.log('===== 直播签到任务执行完成 =====\n');
  }

  getTaskName() {
    return '直播签到';
  }
}

module.exports = liveCheckIn;
