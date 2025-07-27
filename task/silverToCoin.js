const base = require('./base');
const qs = require('qs');

/**
 * 漫画签到
 */
class silverToCoin extends base {
  constructor(args) {
    super(args);
    this.silverToCoinURL = `https://api.live.bilibili.com/pay/v1/Exchange/silver2coin`;
    // 查询银瓜子兑换状态
    this.silverToCoinStatusURL =
      'https://api.live.bilibili.com/pay/v1/Exchange/getStatus';
  }

  order() {
    return 4;
  }  async run() {
    console.log('\n===== 开始执行银瓜子换硬币任务 =====');
    
    console.log('1. 正在尝试兑换银瓜子...');
    const csrf = await this.getCookie('bili_jct');
    
    // 银瓜子兑换硬币通常需要POST请求，并且需要csrf参数
    const result = await this.request.post(
      this.silverToCoinURL,
      qs.stringify({
        csrf: csrf,
      })
    );
    
    if (result && result.code === 0) {
      console.info('----- [银瓜子兑换硬币成功] -----');
    } else if (result) {
      console.info(`----- [银瓜子兑换硬币失败] -----`);
    } else {
      console.error('----- [银瓜子兑换硬币请求失败] -----');
    }

    console.log('2. 查询银瓜子余额...');
    
    const queryCoinStatus = await this.request.get(
      this.silverToCoinStatusURL,
      {},
      'data'
    );
    
    if (queryCoinStatus && queryCoinStatus.silver !== undefined) {
      const silver = Number(queryCoinStatus.silver);
      const silverIntPart = Math.floor(Math.abs(silver));
      const silverLastDigit = silverIntPart % 10;
      console.info(`----- [当前银瓜子余额个位：${silverLastDigit}] -----`);
    } else {
      console.error('----- [无法获取银瓜子余额] -----');
    }
    
    console.log('===== 银瓜子换硬币任务执行完成 =====\n');
  }

  getTaskName() {
    return '银瓜子换硬币';
  }
}

module.exports = silverToCoin;
