import { BrowserAutomation } from './server/brain/tools/BrowserAutomation.js';

const browser = new BrowserAutomation();

console.log('🔍 搜索: 绮灵 AI');
const results = await browser.search('绮灵 AI', { engines: ['duckduckgo'], maxResults: 5 });

results.forEach((r, i) => {
  console.log(`${i + 1}. [${r.engine}] ${r.snippet.slice(0, 80)}...`);
  console.log(`   来源: ${r.source}`);
});

await browser.close();
console.log('✅ 完成');