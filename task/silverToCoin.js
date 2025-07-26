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
    console.log('请求参数:', {
      url: this.silverToCoinURL,
      csrf: csrf ? '已获取' : '获取失败'
    });
    
    // 银瓜子兑换硬币通常需要POST请求，并且需要csrf参数
    const result = await this.request.post(
      this.silverToCoinURL,
      qs.stringify({
        csrf: csrf,
      })
    );
    
    console.log('银瓜子兑换API响应:', {
      hasResult: !!result,
      code: result ? result.code : 'undefined',
      message: result ? (result.msg || result.message) : 'undefined'
    });
    
    if (result && result.code === 0) {
      console.info('----- [银瓜子兑换硬币成功] -----');
    } else if (result) {
      console.info(`----- [银瓜子兑换硬币失败 原因是: ${result.msg || result.message || '未知错误'}] -----`);
    } else {
      console.error('----- [银瓜子兑换硬币请求失败，无法连接到API] -----');
    }

    console.log('2. 查询银瓜子余额...');
    console.log('请求参数:', {
      url: this.silverToCoinStatusURL
    });
    
    const queryCoinStatus = await this.request.get(
      this.silverToCoinStatusURL,
      {},
      'data'
    );
    
    console.log('银瓜子余额查询API响应:', {
      hasResult: !!queryCoinStatus,
      silver: queryCoinStatus ? queryCoinStatus.silver : 'undefined'
    });
    
    if (queryCoinStatus) {
      console.info(`----- [当前银瓜子余额：${queryCoinStatus.silver || '获取失败'}] -----`);
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
