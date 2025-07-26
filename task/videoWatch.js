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
  }
  async run() {
    console.log('\n===== 开始执行视频观看分享任务 =====');
    
    console.log('1. 获取关注用户动态视频列表...');
    const followUpVideoList = await this.queryDynamicNew();
    console.log(`获取到关注用户视频数量: ${followUpVideoList.length}`);
    this.setUserStatus({ followUpVideoList });
    
    console.log('2. 获取热门视频排行榜...');
    const rankList = await this.getRegionRank();
    console.log(`获取到热门视频数量: ${rankList.length}`);
    this.setUserStatus({ rankList });

    const user = this.getUserStatus();
    console.log('当前用户任务状态:', {
      watch: user.watch || false,
      share: user.share || false
    });

    // 如果观看任务没有完成
    console.log('\n3. 检查视频观看任务...');
    if (!user.watch) {
      if (user.rankList && user.rankList.length > 0) {
        const selectedVideo = user.rankList[parseInt(Math.random() * user.rankList.length)];
        console.log(`选择观看视频: ${selectedVideo}`);
        await this.videoHeartBeat(selectedVideo);
      } else {
        console.info('----- 无法获取视频列表，跳过观看任务 -----');
      }
    } else {
      console.info('----- 本日观看视频任务已经完成了，不需要再观看视频了 -----');
    }

    // 分享任务
    console.log('\n4. 检查视频分享任务...');
    if (!user.share) {
      if (user.rankList && user.rankList.length > 0) {
        const selectedVideo = user.rankList[parseInt(Math.random() * user.rankList.length)];
        console.log(`选择分享视频: ${selectedVideo}`);
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

    console.log('请求参数:', {
      url: dynamicNewURL,
      uid: params.uid,
      type_list: params.type_list
    });
    
    const cards = await this.request.get(dynamicNewURL, params, 'data.cards');
    console.log('API响应结果:', {
      cardsType: typeof cards,
      isArray: Array.isArray(cards),
      length: cards ? cards.length : 0
    });
    
    if (cards && Array.isArray(cards) && cards.length !== 0) {
      const videoList = cards.reduce((acc, card) => {
        const bvid = this._.get(card, 'desc.bvid');
        return bvid ? acc.concat(bvid) : acc;
      }, []);
      console.log(`成功解析出 ${videoList.length} 个视频ID`);
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
    };

    console.log('请求参数:', {
      url: RegionRankingURL,
      rid: selectedRid,
      day: params.day
    });

    const result = await this.request.get(RegionRankingURL, params, 'data');
    console.log('API响应结果:', {
      resultType: typeof result,
      isArray: Array.isArray(result),
      length: result ? result.length : 0
    });
    
    if (Array.isArray(result)) {
      const videoList = result.map((e) => e.bvid).filter(bvid => bvid);
      console.log(`成功解析出 ${videoList.length} 个热门视频ID`);
      return videoList;
    }
    console.log('未获取到有效的热门视频数据');
    return [];
  }

  __randomRegion() {
    const regions = [1, 3, 4, 5, 160, 22, 119];
    return regions[parseInt(Math.random() * regions.length)];
  }
  async videoHeartBeat(bvid) {
    console.log(`正在模拟观看视频: ${bvid}`);
    const user = this.getUserStatus();
    const videoHeartbeatURL =
      'https://api.bilibili.com/x/click-interface/web/heartbeat';

    const csrf = await this.getCookie('bili_jct');
    console.log('请求参数:', {
      url: videoHeartbeatURL,
      bvid: bvid,
      csrf: csrf ? '已获取' : '获取失败'
    });

    const result = await this.request.post(
      videoHeartbeatURL,
      qs.stringify({
        bvid,
        csrf: csrf,
      })
    );
    
    console.log('视频心跳API响应:', {
      hasResult: !!result,
      code: result ? result.code : 'undefined',
      message: result ? (result.message || result.msg) : 'undefined'
    });
    
    if (result && result.code === 0) {
      console.info('----- 视频播放成功 -----');
    } else if (result) {
      console.error('----- error 视频播放失败 -----' + (result.message || result.msg || '未知错误'));
    } else {
      console.error('----- error 视频播放请求失败 -----');
    }
    return result;
  }  async videoShare(bvid) {
    console.log(`正在分享视频: ${bvid}`);
    const URL = `https://api.bilibili.com/x/web-interface/share/add`;
    
    const csrf = await this.getCookie('bili_jct');
    console.log('请求参数:', {
      url: URL,
      bvid: bvid,
      csrf: csrf ? '已获取' : '获取失败'
    });
    
    const result = await this.request.post(
      URL,
      require('qs').stringify({
        bvid,
        csrf: csrf,
      })
    );

    console.log('视频分享API响应:', {
      hasResult: !!result,
      code: result ? result.code : 'undefined',
      message: result ? (result.message || result.msg) : 'undefined'
    });

    if (result && result.code === 0) {
      console.info('----- 视频分享成功 -----');
    } else if (result) {
      console.error('----- error 视频分享失败 -----' + (result.message || result.msg || '未知错误'));
    } else {
      console.error('----- error 视频分享请求失败 -----');
    }
  }

  getTaskName() {
    return '用户任务完成状态检查';
  }
}

module.exports = videoWatch;
