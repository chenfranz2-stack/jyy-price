// 检查 quote.html 结构问题
import { readFileSync } from 'fs';
const h = readFileSync('quote.html', 'utf8');

// 1. 尺码区块
const s = h.indexOf('id="sizeRanges"');
const sEnd = h.indexOf('</div>', s);
console.log('=== 尺码区块 ===');
console.log(h.slice(s, sEnd + 6));

// 2. 产品区块
const p = h.indexOf('id="productTypes"');
const pEnd = h.indexOf('</div>', p);
console.log('\n=== 产品区块 ===');
console.log(h.slice(p, pEnd + 6));

// 3. 半成品试衣 出现位置
console.log('\n=== 半成品试衣出现次数 ===', (h.match(/半成品试衣/g) || []).length);
// 4. 弹窗区块
const m = h.indexOf('plansModal');
console.log('\n=== 弹窗HTML ===');
console.log(h.slice(h.indexOf('id="plansModal"'), h.indexOf('id="plansModal"') + 600));
