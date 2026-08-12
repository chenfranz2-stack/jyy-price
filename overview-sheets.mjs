// 快速概览每个 sheet 的结构：表头 + 前3行数据（紧凑输出）
import { readFileSync } from 'fs';

const dir = 'sheets-json';
const files = readFileSync('sheets-index.txt', 'utf8').trim().split('\n').filter(Boolean);

for (const f of files) {
  const name = f.replace(/\.json$/, '');
  const rows = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
  if (!rows.length) { console.log(`\n### ${name}: 空`); continue; }
  console.log(`\n### ${name} (${rows.length} 行)`);
  // 找表头行：第一个包含中文/英文列名的行
  const headIdx = rows.findIndex(r => r.some(c => /(货号|价格|单价|CODE|PRICE|品牌|成分|克重|系列|备注|JACKET|TROUSERS|VEST|色|面料)/i.test(c)));
  const head = rows[Math.max(0, headIdx)];
  console.log('表头:', head.join(' | ').slice(0, 200));
  const dataStart = headIdx >= 0 ? headIdx + 1 : 1;
  for (let i = dataStart; i < Math.min(dataStart + 3, rows.length); i++) {
    console.log('  例:', rows[i].join(' | ').slice(0, 200));
  }
}
