// 归一化 17 张面料表 → 统一数据库 fabrics-db.json
// 记录: { source, brand, code, pricePerMeter, jacket, trousers, vest, price, note }
import { readFileSync, writeFileSync } from 'fs';

const dir = 'sheets-json';
const db = [];
const stats = {};

function readSheet(name) {
  const f = `${dir}/${name}.json`;
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch (e) { return []; }
}
const num = s => {
  if (s == null) return null;
  const m = String(s).replace(/[,\s]/g, '').match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};
function push(rec) {
  if (!rec.code) return;
  rec.code = String(rec.code).trim();
  if (!rec.code) return;
  db.push(rec);
  stats[rec.source] = (stats[rec.source] || 0) + 1;
}

// ===== 1. JYY特供进口面料：直接有上衣/裤子/马甲 =====
{
  const rows = readSheet('JYY特供进口面料');
  let lastBrand = '';
  for (const r of rows) {
    if (!r[1]) continue;
    let brand = String(r[0] || '').trim();
    let code = String(r[1]).trim();
    // 品牌列出现纯数字/空 → 继承上一行品牌
    if (/^\d+$/.test(brand) || !brand) brand = lastBrand || '';
    else lastBrand = brand;
    push({
      source: 'JYY特供进口面料', brand,
      code, yarn: r[2],
      price: num(r[3]), jacket: num(r[4]), trousers: num(r[5]), vest: num(r[6]),
      direct: true,
    });
  }
}

// ===== 2. JYY自备面料：系统货号 + 系统单价 =====
{
  const rows = readSheet('JYY自备面料');
  const head = rows.find(r => r.some(c => /系统货号/.test(c)));
  const hi = rows.indexOf(head);
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    const code = r[2] || r[4]; // 系统货号 / 面料货号
    if (!code) continue;
    push({
      source: 'JYY自备面料', brand: r[1] ? String(r[1]).trim() : '',
      code: String(code).trim(),
      pricePerMeter: num(r[14]), priceCode: num(r[3]),
      color: r[7], weight: r[10], width: r[11], composition: r[12], compEn: r[13],
      note: r[15], direct: false,
    });
  }
}

// ===== 3. TALLIA马佐托 =====
{
  const rows = readSheet('TALLIA马佐托');
  const hi = rows.findIndex(r => r[0] === '货号');
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || r[0] === '货号') continue;
    push({ source: 'TALLIA马佐托', brand: 'TALLIA', code: String(r[0]).trim(),
      series: r[1], pricePerMeter: num(r[2]), vip7: num(r[3]),
      note: r[4], composition: r[5], weight: r[6], width: r[7], direct: false });
  }
}

// ===== 4. SVIP-TALLIA零剪 =====
{
  const rows = readSheet('SVIP-TALLIA零剪');
  const hi = rows.findIndex(r => r[0] === '货号');
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || r[0] === '货号') continue;
    push({ source: 'SVIP-TALLIA零剪', brand: 'TALLIA', code: String(r[0]).trim(),
      series: r[1], pricePerMeter: num(r[2]), svip: num(r[3]), m25: num(r[4]), m50: num(r[5]),
      note: r[6], composition: r[7], weight: r[8], width: r[9], direct: false });
  }
}

// ===== 5. BROWN AARON微度：画册编号 → 面料货号 =====
{
  const rows = readSheet('BROWN AARON微度');
  const hi = rows.findIndex(r => r.some(c => /面料货号/.test(c)));
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    const code = r[5]; // 面料货号
    if (!code) continue;
    push({ source: 'BROWN AARON微度', brand: 'Brown Aaron',
      code: String(code).trim(), album: r[1], model: r[2], sample: r[3],
      pricePerMeter: num(r[6]), composition: r[9], yarn: r[10], weight: r[11],
      feature: r[12], direct: false });
  }
}

// ===== 6. FILARTE菲拉特：多个子表，质地号 + 零剪价 =====
{
  const rows = readSheet('FILARTE菲拉特');
  for (const r of rows) {
    if (!r[0]) continue;
    const code = String(r[0]).trim();
    if (/价格表|样本明细|菲拉特|高级定制|^（|^\d+）|备注|系列/.test(code)) continue;
    if (!/^\d/.test(code)) continue;
    push({ source: 'FILARTE菲拉特', brand: 'Filarte', code,
      composition: r[1], weight: r[2], pricePerMeter: num(r[3]), note: r[4], direct: false });
  }
}

// ===== 7. YUBOYUAN玉帛园 =====
{
  const rows = readSheet('YUBOYUAN玉帛园');
  const hi = rows.findIndex(r => r.some(c => /单价/.test(c)));
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    const code = String(r[0]).trim();
    if (/价格表|样本|编号/.test(code)) continue;
    push({ source: 'YUBOYUAN玉帛园', brand: 'YUBOYUAN', code,
      composition: r[1], yarn: r[2], weight: r[3], pricePerMeter: num(r[4]), direct: false });
  }
}

// ===== 8. VERCELLI韦尔切利 =====
{
  const rows = readSheet('VERCELLI韦尔切利');
  const hi = rows.findIndex(r => r.some(c => /花型号/.test(c)));
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[1]) continue;
    push({ source: 'VERCELLI韦尔切利', brand: 'VERCELLI', code: String(r[1]).trim(),
      yarn: r[2], composition: r[3], weight: r[4],
      pricePerMeter: num(r[5]), direct: false });
  }
}

// ===== 9. CARPENS 卡佩斯 =====
{
  const rows = readSheet('CARPENS 卡佩斯');
  const hi = rows.findIndex(r => r.some(c => /品号/.test(c)));
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[1]) continue;
    push({ source: 'CARPENS 卡佩斯', brand: 'CARPENS', code: String(r[1]).trim(),
      composition: r[2], series: r[3], weight: r[4], feature: r[5],
      bulkPrice: num(r[6]), packPrice: num(r[7]), pricePerMeter: num(r[8]), direct: false });
  }
}

// ===== 10. 申洲 =====
{
  const rows = readSheet('申洲');
  const hi = rows.findIndex(r => r.some(c => /品号/.test(c)));
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    push({ source: '申洲', brand: '申洲', code: String(r[0]).trim(),
      color: r[1], weight: r[2], composition: r[3],
      bulkPrice: num(r[4]), cutAdd: num(r[5]), freight: num(r[6]), pricePerMeter: num(r[7]), direct: false });
  }
}

// ===== 11. 美酷 =====
{
  const rows = readSheet('美酷');
  const hi = rows.findIndex(r => r.some(c => /样册编号/.test(c)));
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    const code = r[1];
    if (!code) continue;
    push({ source: '美酷', brand: '美酷', code: String(code).trim(),
      series: r[2], retailPrice: num(r[3]), jyyCut: num(r[4]), jyyBulk: num(r[5]),
      composition: r[6], yarn: r[7], weight: r[8], freight: num(r[9]), pricePerMeter: num(r[10]), direct: false });
  }
}

// ===== 12. 美蒂诺(LD)岚缇奥 =====
{
  const rows = readSheet('美蒂诺(LD)岚缇奥');
  const hi = rows.findIndex(r => r.some(c => /品号/.test(c)));
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[1]) continue;
    const code = String(r[1]).trim();
    if (/册子编号/.test(code)) continue;
    push({ source: '美蒂诺(LD)岚缇奥', brand: '美蒂诺', code,
      feature: r[2], composition: r[3], weight: r[4], width: r[5],
      pricePerMeter: num(r[6]), direct: false });
  }
}

// ===== 13. NOBILITY金大：系列 + 价格（拆多行）=====
{
  const rows = readSheet('NOBILITY金大');
  for (const r of rows) {
    const seriesCell = r[0] || '';
    const codeCell = r[1] || '';
    const priceCell = r[3] || '';
    if (!/series|sereis|系列/i.test(seriesCell)) continue;
    if (!/^\d+$/.test(String(codeCell).trim())) continue;
    push({ source: 'NOBILITY金大', brand: 'NOBILITY', code: String(codeCell).trim(),
      seriesDesc: seriesCell.replace(/\n/g, ' '),
      pricePerMeter: num(priceCell), priceUSD: (String(priceCell).match(/\$(\d+)/) || [])[1] || null,
      direct: false });
  }
}

// ===== 14. JY Shirts衬衫：尾号档位价格 =====
{
  const rows = readSheet('JY Shirts衬衫');
  const hi = rows.findIndex(r => r.some(c => /衬衫尾号/.test(c)));
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    push({ source: 'JY Shirts衬衫', brand: 'JYY', code: 'SHIRT-' + String(r[0]).trim(),
      pricePerPiece: num(r[1]), direct: false });
  }
}

// ===== 15-17. STB / T.INGENIATOR / 西岡 / 零剪多档（结构乱，做简单提取）=====
{
  const rows = readSheet('Stylbiella STB');
  // 多行单元格展开：样本编码 + 零剪价
  const headRow = rows.find(r => r.some(c => /样本编码/.test(c)));
  const hi = rows.indexOf(headRow);
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    const codes = String(r[1] || '').split('\n').map(s => s.trim()).filter(Boolean);
    const prices = String(r[5] || '').split('\n').map(s => s.trim()).filter(Boolean);
    const series = String(r[2] || '').split('\n').map(s => s.trim()).filter(Boolean);
    codes.forEach((c, idx) => {
      push({ source: 'Stylbiella STB', brand: 'STB', code: c,
        series: series[idx] || series[0] || '',
        pricePerMeter: num(prices[idx] !== undefined ? prices[idx] : prices[0]),
        direct: false });
    });
  }
}
{
  const rows = readSheet('T.INGENIATOR英吉尼托');
  for (const r of rows) {
    if (!r[0] || !/^[A-Z]/.test(String(r[0]))) continue;
    const code = String(r[0]).trim();
    if (/系列/.test(code)) continue;
    push({ source: 'T.INGENIATOR英吉尼托', brand: 'T.INGENIATOR', code,
      pricePerMeter: num(r[1]), m35: r[2], m70: r[3], m500: r[4], direct: false });
  }
}
{
  const rows = readSheet('西岡織物');
  for (const r of rows) {
    if (!r[0] || !/^N\d/.test(String(r[0]))) continue;
    push({ source: '西岡織物', brand: 'NISHIOKA', code: String(r[0]).trim(),
      pricePerMeter: num(r[1]), m35: num(r[2]), m70: num(r[3]), m500: r[4], direct: false });
  }
}

// 去重（同 code 同 source）
const seen = new Set();
const dedup = db.filter(r => {
  const k = r.source + '|' + r.code;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

writeFileSync('fabrics-db.json', JSON.stringify(dedup, null, 0), 'utf8');
console.log('总记录:', dedup.length);
for (const [k, v] of Object.entries(stats)) console.log(`  ${k}: ${v}`);
console.log('带直接成衣价(上衣/裤子/马甲):', dedup.filter(r => r.direct).length);
console.log('有面料单价:', dedup.filter(r => r.pricePerMeter != null).length);
