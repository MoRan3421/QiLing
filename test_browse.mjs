import { BrowserAutomation } from './server/brain/tools/BrowserAutomation.js';

const browser = new BrowserAutomation();

console.log('🔧 初始化浏览器...');
await browser.initialize();

console.log('🌐 抓取百度首页...');
const result = await browser.fetchPage('https://www.baidu.com', { timeout: 10000 });

console.log('标题:', result.title);
console.log('文本长度:', result.text.length);
console.log('链接数:', result.links.length);
console.log('前5个链接:', result.links.slice(0, 5).map(l => l.text + ' -> ' + l.href));

await browser.close();
console.log('✅ 完成');