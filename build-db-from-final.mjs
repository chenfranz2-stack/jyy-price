// 从最终版 xlsx 重建 fabrics-db.json（用户修订版为准）
// 各 sheet 列结构统一：序号|系列|面料号/品号|面料单价|面料成份|克重|备注(可选)
// Brown Aaron 特殊：序号|画册编号|面料货号|零剪销售单价|面料成分|克重|备注
import { readFileSync, writeFileSync } from 'fs';
import * as XLSX from 'xlsx';

const wb = XLSX.read(readFileSync('整理版-面料价格合集-最终.xlsx'), { type: 'buffer' });
const db = [];

// 品牌名映射（sheet 名 -> 对外品牌名）
const BRAND_MAP = {
  'JYY自备面料': 'JYY',
  'TALLIA马佐托': 'TALLIA',
  'SVIP-TALLIA零剪': 'TALLIA',
  'BROWN AARON微度': 'Brown Aaron',
  'FILARTE菲拉特': 'Filarte',
  'YUBOYUAN玉帛园': 'YUBOYUAN',
  'VERCELLI韦尔切利': 'VERCELLI',
  'CARPENS卡佩斯': 'CARPENS',
  '申洲': '申洲',
  '美酷': '美酷',
  '美蒂诺(LD)岚缇奥': '美蒂诺',
  'NOBILITY金大': 'NOBILITY',
  'Stylbiella STB': 'STB',
  'T.INGENIATOR英吉尼托': 'T.INGENIATOR',
  '西岡織物': 'NISHIOKA',
  'JY Shirts衬衫': 'JYY',
};

const num = s => {
  if (s == null) return null;
  const m = String(s).replace(/[,\s￥¥]/g, '').match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};

for (const name of wb.SheetNames) {
  if (name === '目录') continue;
  const ws = wb.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (rows.length < 2) continue;
  const header = rows[0].map(h => String(h ?? '').trim());
  const isBrownAaron = header.includes('画册编号');
  const codeIdx = isBrownAaron ? 2 : 2;           // 面料号/品号
  const priceIdx = isBrownAaron ? 3 : 3;          // 单价
  const compIdx = isBrownAaron ? 4 : 4;           // 成份
  const weightIdx = isBrownAaron ? 5 : 5;         // 克重
  const seriesIdx = isBrownAaron ? 1 : 1;         // 系列/画册编号
  const noteIdx = header.length > 6 ? 6 : -1;     // 备注

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[codeIdx]) continue;
    const code = String(r[codeIdx]).trim();
    if (!code || code === '面料号/品号') continue;
    db.push({
      source: name,
      brand: BRAND_MAP[name] || name,
      code,
      series: r[seriesIdx] !== undefined ? String(r[seriesIdx]).trim() : '',
      pricePerMeter: num(r[priceIdx]),
      composition: r[compIdx] !== undefined ? String(r[compIdx]).trim() : '',
      weight: r[weightIdx] !== undefined ? String(r[weightIdx]).trim() : '',
      note: noteIdx >= 0 && r[noteIdx] ? String(r[noteIdx]).trim() : '',
    });
  }
}

// 去重：仅完全一致的行才去重（同号不同克重/成分/备注保留）
const seen = new Set();
const dedup = db.filter(r => {
  const k = [r.source, r.code, r.pricePerMeter, r.composition, r.weight, r.note, r.series].join('|');
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

writeFileSync('fabrics-db.json', JSON.stringify(dedup, null, 0), 'utf8');
console.log('✅ fabrics-db.json 重建完成:', dedup.length, '条');
const bySource = {};
for (const r of dedup) bySource[r.source] = (bySource[r.source] || 0) + 1;
for (const [k, v] of Object.entries(bySource)) console.log(`  ${k}: ${v}`);
