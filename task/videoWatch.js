const base = require('./base');
const qs = require('qs');
const fs = require('fs');

/**
 * 视频观看 分享
 */
class videoWatch extends base {
  constructor(args) {
    super(args);
  }

  order() {
    return 2;
  }  async run() {
    console.log('\n===== 开始执行视频观看分享任务 =====');
    
    console.log('1. 获取关注用户动态视频列表...');
    const followUpVideoList = await this.queryDynamicNew();
    console.log(`获取视频数量: ${followUpVideoList.length}`);
    this.setUserStatus({ followUpVideoList });
    
    console.log('2. 获取热门视频排行榜...');
    const rankList = await this.getRegionRank();
    console.log(`获取视频数量: ${rankList.length}`);
    this.setUserStatus({ rankList });

    const user = this.getUserStatus();
    console.log('当前用户任务状态检查完成');    // 如果观看任务没有完成
    console.log('\n3. 检查视频观看任务...');
    if (!user.watch) {
      if (user.rankList && user.rankList.length > 0) {
        const selectedVideo = user.rankList[parseInt(Math.random() * user.rankList.length)];
        console.log(`开始观看视频任务`);
        await this.videoHeartBeat(selectedVideo);
      } else {
        console.info('----- 无法获取视频列表，跳过观看任务 -----');
      }
    } else {
      console.info('----- 本日观看视频任务已经完成了，不需要再观看视频了 -----');
    }    // 分享任务
    console.log('\n4. 检查视频分享任务...');
    if (!user.share) {
      if (user.rankList && user.rankList.length > 0) {
        const selectedVideo = user.rankList[parseInt(Math.random() * user.rankList.length)];
        console.log(`开始分享视频任务`);
        await this.videoShare(selectedVideo);
      } else {
        console.info('----- 无法获取视频列表，跳过分享任务 -----');
      }
    } else {
      console.info('----- 本日分享视频任务已经完成了，不需要再分享视频了 -----');
    }
    
    console.log('===== 视频观看分享任务执行完成 =====\n');
  }

  /**
   * 查询 存在哪些视频
   */  async queryDynamicNew() {
    console.log('正在请求关注用户动态API...');
    const dynamicNewURL =
      'https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new';

    const params = {
      uid: await this.getCookie('DedeUserID'),
      type_list: 8,
      from: '',
      platform: 'web',
    };
    
    const cards = await this.request.get(dynamicNewURL, params, 'data.cards');
    console.log('动态API请求完成');
    
    if (cards && Array.isArray(cards) && cards.length !== 0) {
      const videoList = cards.reduce((acc, card) => {
        const bvid = this._.get(card, 'desc.bvid');
        return bvid ? acc.concat(bvid) : acc;
      }, []);
      console.log(`成功解析视频数量: ${videoList.length}`);
      return videoList;
    }
    console.log('未获取到有效的动态视频数据');
    return [];
  }
  async getRegionRank() {
    console.log('正在请求热门视频排行榜API...');
    const RegionRankingURL =
      'https://api.bilibili.com/x/web-interface/ranking/region';

    const selectedRid = this.__randomRegion();
    const params = {
      rid: selectedRid,
      day: 3,
    };    const result = await this.request.get(RegionRankingURL, params, 'data');
    console.log('热门视频API请求完成');
    
    if (Array.isArray(result)) {
      const videoList = result.map((e) => e.bvid).filter(bvid => bvid);
      console.log(`成功解析视频数量: ${videoList.length}`);
      return videoList;
    }
    console.log('未获取到有效的热门视频数据');
    return [];
  }

  __randomRegion() {
    const regions = [1, 3, 4, 5, 160, 22, 119];
    return regions[parseInt(Math.random() * regions.length)];
  }  async videoHeartBeat(bvid) {
    console.log(`正在模拟观看视频`);
    const user = this.getUserStatus();
    const videoHeartbeatURL =
      'https://api.bilibili.com/x/click-interface/web/heartbeat';

    const csrf = await this.getCookie('bili_jct');

    const result = await this.request.post(
      videoHeartbeatURL,
      qs.stringify({
        bvid,
        csrf: csrf,
      })
    );
    
    if (result && result.code === 0) {
      console.info('----- 视频播放成功 -----');
    } else if (result) {
      console.error('----- 视频播放失败 -----');
    } else {
      console.error('----- 视频播放请求失败 -----');
    }
    return result;
  }  async videoShare(bvid) {
    console.log(`正在分享视频`);
    const URL = `https://api.bilibili.com/x/web-interface/share/add`;
    
    const csrf = await this.getCookie('bili_jct');
    
    const result = await this.request.post(
      URL,
      require('qs').stringify({
        bvid,
        csrf: csrf,
      })
    );

    if (result && result.code === 0) {
      console.info('----- 视频分享成功 -----');
    } else if (result) {
      console.error('----- 视频分享失败 -----');
    } else {
      console.error('----- 视频分享请求失败 -----');
    }
  }

  getTaskName() {
    return '用户任务完成状态检查';
  }
}

module.exports = videoWatch;
