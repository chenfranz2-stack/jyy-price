// 面料报价查询工具：输入面料号 → 输出 上衣/裤子/马甲 价格
// 用法: node quote.mjs <面料号或关键词> [--all]
import { readFileSync } from 'fs';

const db = JSON.parse(readFileSync('fabrics-db.json', 'utf8'));
const q = (process.argv[2] || '').trim().toUpperCase();
if (!q) {
  console.log('用法: node quote.mjs <面料号>  例: node quote.mjs N707062');
  console.log('支持模糊匹配: 输入部分货号即可，如 2134C、YB18、8890');
  process.exit(0);
}

const norm = s => String(s || '').toUpperCase().replace(/\s+/g, '');
const hits = db.filter(r => {
  const c = norm(r.code);
  return c === q || c.includes(q) || q.includes(c) || (r.brand && norm(r.brand).includes(q));
});

if (!hits.length) {
  console.log(`❌ 未找到 "${process.argv[2]}" 相关面料。`);
  console.log('试试: 输入部分货号，或问我 "列出所有品牌"');
  process.exit(0);
}

console.log(`🔍 找到 ${hits.length} 条匹配（${process.argv[2]}）\n`);
for (const r of hits) {
  console.log(`【${r.code}】 ${r.brand || ''}${r.series ? ' · ' + r.series : ''}`);
  console.log(`  来源: ${r.source}`);
  if (r.direct) {
    console.log(`  ── 成衣价 ──`);
    console.log(`  上衣 ${r.jacket} | 裤子 ${r.trousers} | 马甲 ${r.vest} | 面料价 ${r.price}`);
  } else {
    console.log(`  面料单价: ${r.pricePerMeter ?? '?'} 元/米${r.svip ? ` | SVIP ${r.svip}` : ''}${r.m25 ? ` | 25米 ${r.m25}` : ''}${r.m50 ? ` | 50米 ${r.m50}` : ''}`);
    if (r.bulkPrice != null) console.log(`  大货价 ${r.bulkPrice} | 整包价 ${r.packPrice ?? '?'} | 零剪价 ${r.pricePerMeter}`);
    if (r.jyyBulk != null) console.log(`  金鸳鸯大货 ${r.jyyBulk} | 金鸳鸯零剪 ${r.jyyCut} | 对外零剪 ${r.retailPrice}`);
    console.log(`  ⚠️ 该表只有面料单价，成衣价需按规则换算（待你确认用量+工费）`);
  }
  if (r.composition) console.log(`  成分: ${r.composition}${r.weight ? ' | ' + r.weight : ''}${r.yarn ? ' | ' + r.yarn : ''}`);
  if (r.note) console.log(`  备注: ${r.note}`);
  console.log('');
}

// 汇总可用品牌
if (process.argv.includes('--all') || process.argv[2] === 'list') {
  console.log('=== 数据库品牌分布 ===');
  const bySource = {};
  for (const r of db) bySource[r.source] = (bySource[r.source] || 0) + 1;
  for (const [k, v] of Object.entries(bySource)) console.log(`  ${k}: ${v} 条`);
}
