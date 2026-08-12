// 手机视口测试 quote.html 可交互性
import { readFileSync } from 'fs';
const html = readFileSync('quote.html', 'utf8');

// 1. viewport meta 检查
const vp = html.match(/<meta name="viewport"[^>]*>/i);
console.log('viewport:', vp ? vp[0] : '❌ 缺失');

// 2. 媒体查询存在
const mq = html.match(/@media \(max-width: 720px\)/);
console.log('720px 媒体查询:', mq ? '✅' : '❌');

// 3. 模拟手机宽度下关键元素是否会被压爆
// 检查 .g7 是 4 列 -> 720px 下应变 3 列
const g7 = html.match(/\.g7 \{ grid-template-columns: repeat\(4, 1fr\); \}/);
const g7m = html.match(/@media \(max-width: 720px\)[\s\S]*?\.g7 \{ grid-template-columns: repeat\(3, 1fr\); \}/);
console.log('g7 桌面4列:', g7 ? '✅' : '❌', '| 手机3列:', g7m ? '✅' : '❌');

// 4. 输入框字号（防 iOS 聚焦缩放）
const fs16 = html.match(/@media \(max-width: 720px\)[\s\S]*?input\[type=number\], input\[type=text\] \{ font-size: 16px;/);
console.log('输入框16px(防iOS缩放):', fs16 ? '✅' : '❌');

// 5. 按钮全宽（方便拇指点击）
const btnW = html.match(/@media \(max-width: 720px\)[\s\S]*?\.btn \{ width: 100%;/);
console.log('按钮全宽:', btnW ? '✅' : '❌');

// 6. 弹窗自适应
const modal = html.match(/@media \(max-width: 720px\)[\s\S]*?\.modal-box \{ width: calc\(100vw - 24px\);/);
console.log('弹窗自适应:', modal ? '✅' : '❌');

console.log('\n手机视口 375px 检查：');
const m375 = html.match(/@media \(max-width: 380px\)[\s\S]*?\.g2, \.g3, \.g7 \{ grid-template-columns: 1fr; \}/);
console.log('375px 单列布局:', m375 ? '✅' : '❌');
