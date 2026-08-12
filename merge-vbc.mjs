// 把 VBC 报价模板合并进 fabrics-db.json 并重建 quote.html
import { readFileSync, writeFileSync } from 'fs';
import * as XLSX from 'xlsx';

// 1. 读现有数据库
const db = JSON.parse(readFileSync('fabrics-db.json', 'utf8'));
const before = db.length;

// 2. 读 VBC 模板
const wb = XLSX.read(readFileSync('VBC报价模板.xlsx'), { type: 'buffer' });
const ws = wb.Sheets['VBC'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
const head = rows[0];

let added = 0;
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || !r[2]) continue;
  const code = String(r[2]).trim();
  if (!code || code === '面料号/品号') continue;
  // 已存在则跳过
  if (db.some(x => x.code === code && x.source === 'VBC画册')) continue;
  db.push({
    source: 'VBC画册',
    brand: 'VBC',
    code,
    series: r[1] || '',
    pricePerMeter: r[3] != null ? Number(r[3]) : null,
    composition: r[4] ? String(r[4]) : '',
    weight: r[5] ? String(r[5]) : '',
    note: r[6] ? String(r[6]) : '',
  });
  added++;
}

writeFileSync('fabrics-db.json', JSON.stringify(db, null, 0), 'utf8');
console.log(`✅ 数据库更新: ${before} → ${db.length}（新增 ${added} 条 VBC）`);
