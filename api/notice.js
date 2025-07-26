const axios = require('axios');

module.exports = async (secret, title, body) => {
  // 如果没有提供secret，直接返回
  if (!secret || secret === 'undefined') {
    console.log('未配置Server酱密钥，跳过消息推送');
    return;
  }

  let data = `text=${title}&desp=${body}`;

  let config = {
    method: 'post',
    url: `http://sc.ftqq.com/${secret}.send`,
    headers: {
      Host: 'sc.ftqq.com',
      Accept: '*/*',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Origin: 'http://sc.ftqq.com',
      Referer: 'http://sc.ftqq.com/?c=code',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      Cookie: 'PHPSESSID=0c77175e2c4ebd7323b0c3d5f5439e3b',
    },    data: data,
  };

  try {
    return await axios(config);
  } catch (error) {
    console.error('Server酱推送失败:', error.message);
    return null;
  }
};
