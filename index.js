const tasks = require('./task');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

(async function () {
  const [cookie, serverSecret] = process.argv.slice(2);
  console.log('=====================================');
  console.log('     🚀 B站自动任务脚本启动');
  console.log('=====================================');
  console.log('启动时间:', new Date().toLocaleString());
  console.log('接收到的参数:', {
    hasCookie: !!cookie,
    hasServerSecret: !!serverSecret
  });

  if (!cookie) {
    console.error('----- [参数传递不正确，请检查参数] -----');
    return;
  }  // save user data
  console.log('保存用户配置到 userStatus.json...');
  fs.writeFileSync(
    path.join(__dirname, './task/userStatus.json'),
    JSON.stringify({ cookie, serverSecret }),
    { encoding: 'utf-8' }
  );
  console.log('用户配置保存完成');

  // run task
  console.log('\n开始加载任务列表...');
  let taskLists = Object.keys(tasks);
  taskLists = taskLists.filter((f) => !['Base', 'Index', 'CoinAdd'].some((s) => f === s));
  console.log('发现任务:', taskLists);

  console.log('正在初始化任务实例...');
  const taskList = taskLists
    .reduce((acc, taskName) => {
      console.log(`初始化任务: ${taskName}`);
      const taskNameClass = require('./task/' + _.lowerFirst(taskName));
      const newObj = new taskNameClass();
      return acc.concat(newObj);
    }, [])
    .sort((x, y) => x.order() - y.order());

  console.log(`共 ${taskList.length} 个任务，按优先级排序完成`);
  console.log('任务执行顺序:', taskList.map(task => `${task.order()}. ${task.getTaskName()}`));

  console.log('\n🎯 开始执行任务序列...');
  for (const task of taskList) {
    console.info('\n');
    console.info(`----- 执行 ${task.getTaskName()} -----`);
    console.log(`任务优先级: ${task.order()}`);
    
    const startTime = Date.now();
    const r = await task.run();
    const endTime = Date.now();
    
    console.log(`任务耗时: ${endTime - startTime}ms`);
    console.info(`----- ${task.getTaskName()} 执行完成 -----`);
    
    if (r === false) {
      console.log('❌ 任务返回false，停止后续任务执行');
      break;
    }
  }
  
  console.log('\n🎉 所有任务执行完成！');
  console.log('结束时间:', new Date().toLocaleString());
})();
