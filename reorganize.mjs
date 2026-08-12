// 整理 17 家品牌面料册 → 统一七列：序号|系列|面料号|单价(零剪)|成份|克重|备注
// 输出: 整理版-面料价格合集.xlsx（每品牌一个 sheet）
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import * as XLSX from 'xlsx';

const HEAD = ['序号', '系列', '面料号/品号', '面料单价(零剪价)', '面料成份', '克重', '备注'];
const dir = 'sheets-json';
const readSheet = n => { try { return JSON.parse(readFileSync(`${dir}/${n}.json`, 'utf8')); } catch (e) { return []; } };

// 工具
const clean = s => String(s ?? '').replace(/\s+/g, ' ').trim();
const num = s => {
  if (s == null) return null;
  const m = String(s).replace(/[,\s￥¥]/g, '').match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};

const out = {}; // brand -> rows[]

function addRows(brand, rows) {
  if (!out[brand]) out[brand] = [];
  for (const r of rows) out[brand].push([r.length ? String(r[0]) : '', ...r.slice(1)]);
}

// ========== 1. JYY特供进口面料：品牌|货号|纱支|价格|上衣|裤子|马甲 ==========
{
  const rows = readSheet('JYY特供进口面料');
  let lastBrand = '';
  const out2 = [];
  for (const r of rows) {
    if (!r[1] || /货号|CODE/i.test(clean(r[1]))) continue;
    let b = clean(r[0]);
    if (/^\d+$/.test(b) || !b) b = lastBrand; else lastBrand = b;
    const code = clean(r[1]);
    if (!code) continue;
    const price = num(r[3]);
    out2.push([1, b, code, price, '', '', `纱支${clean(r[2])}｜上衣${num(r[4]) ?? '?'}｜裤子${num(r[5]) ?? '?'}｜马甲${num(r[6]) ?? '?'}｜面料价${price ?? '?'}`]);
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('JYY特供进口面料', out2);
}

// ========== 2. JYY自备面料：序号|品牌|系统货号|单价代码|面料货号|备货|2.2M色卡|颜色|原面料号|库存|克重/纱支|幅宽|成份|英文|系统单价|备注 ==========
{
  const rows = readSheet('JYY自备面料');
  const hi = rows.findIndex(r => r.some(c => /系统货号/.test(c)));
  const out2 = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    const code = clean(r[4] || r[2]); // 面料货号优先
    if (!code) continue;
    const price = num(r[14]);
    const note = [r[6] && `色卡:${clean(r[6])}`, r[7] && `颜色:${clean(r[7])}`, r[8] && `原面料号:${clean(r[8])}`, r[9] && `库存:${clean(r[9])}`, r[11] && `幅宽:${clean(r[11])}`, r[13] && `英文:${clean(r[13])}`, r[15] && `备注:${clean(r[15])}`, r[5] && `备货:${clean(r[5])}`, r[3] && `代码:${clean(r[3])}`].filter(Boolean).join('｜');
    out2.push([1, clean(r[1]) || 'JYY自备', code, price, clean(r[12]), clean(r[10]), note]);
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('JYY自备面料', out2);
}

// ========== 3. TALLIA马佐托：货号|系列|零剪单价|VIP7|备注|成分|克重|门幅|品牌 ==========
{
  const rows = readSheet('TALLIA马佐托');
  const hi = rows.findIndex(r => r[0] === '货号');
  const out2 = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || r[0] === '货号') continue;
    out2.push([1, clean(r[1]), clean(r[0]), num(r[2]), clean(r[5]), clean(r[6]), [r[3] && `VIP7:${clean(r[3])}`, r[4] && `备注:${clean(r[4])}`, r[7] && `门幅:${clean(r[7])}`].filter(Boolean).join('｜')]);
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('TALLIA马佐托', out2);
}

// ========== 4. SVIP-TALLIA零剪：货号|系列|零剪|SVIP|25米|50米|备注|成分|克重|门幅 ==========
{
  const rows = readSheet('SVIP-TALLIA零剪');
  const hi = rows.findIndex(r => r[0] === '货号');
  const out2 = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || r[0] === '货号') continue;
    out2.push([1, clean(r[1]), clean(r[0]), num(r[2]), clean(r[7]), clean(r[8]), [r[3] && `SVIP:${clean(r[3])}`, r[4] && `25米:${clean(r[4])}`, r[5] && `50米:${clean(r[5])}`, r[6] && `备注:${clean(r[6])}`, r[9] && `门幅:${clean(r[9])}`].filter(Boolean).join('｜')]);
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('SVIP-TALLIA零剪', out2);
}

// ========== 5. BROWN AARON微度：序号|画册|模特款|样衣款式|品牌|面料货号|零剪单价|页码|位置|成分|纱织|克重|功能备注 ==========
{
  const rows = readSheet('BROWN AARON微度');
  const hi = rows.findIndex(r => r.some(c => /面料货号/.test(c)));
  const out2 = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    const code = clean(r[5]);
    if (!code || /序号|面料货号/.test(code)) continue;
    out2.push([1, clean(r[3]), code, num(r[6]), clean(r[9]), clean(r[11]), [r[1] && `画册:${clean(r[1])}`, r[2] && `模特款:${clean(r[2])}`, r[7] && `页码:${clean(r[7])}`, r[8] && `位置:${clean(r[8])}`, r[10] && `纱织:${clean(r[10])}`, r[12] && `功能:${clean(r[12])}`].filter(Boolean).join('｜')]);
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('BROWN AARON微度', out2);
}

// ========== 6. FILARTE菲拉特：多子表，标题行分段 ==========
{
  const rows = readSheet('FILARTE菲拉特');
  let section = '';
  const out2 = [];
  for (const r of rows) {
    const first = clean(r[0]);
    // 子表标题行：菲拉特内贸现货价格表 / 菲拉特常规女装价格表 / 菲拉特备纱时尚价格表 / 菲拉特高级定制...
    const m = first.match(/菲拉特([^价格表]*)/);
    if (m && /价格表|样本明细|定制/.test(first)) {
      section = '菲拉特' + m[1].replace(/\s+$/, '');
      continue;
    }
    if (/高级定制/.test(first) || /样本明细/.test(first)) { section = '菲拉特高级定制'; continue; }
    if (!r[0]) continue;
    const code = clean(r[0]);
    if (/^\d{4,}/.test(code)) {
      out2.push([1, section, code, num(r[3]), clean(r[1]), clean(r[2]), r[4] ? `备注:${clean(r[4])}` : '']);
    }
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('FILARTE菲拉特', out2);
}

// ========== 7. YUBOYUAN玉帛园：新编号|成分|纱支|克重|单价 ==========
{
  const rows = readSheet('YUBOYUAN玉帛园');
  const hi = rows.findIndex(r => r.some(c => /单价/.test(c)));
  const out2 = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    const code = clean(r[0]);
    if (!code || /价格表|样本/.test(code)) continue;
    out2.push([1, '', code, num(r[4]), clean(r[1]), clean(r[3]), r[2] ? `纱支:${clean(r[2])}` : '']);
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('YUBOYUAN玉帛园', out2);
}

// ========== 8. VERCELLI韦尔切利：页码|花型号|纱支|成分|克重|零裁价格 ==========
{
  const rows = readSheet('VERCELLI韦尔切利');
  const hi = rows.findIndex(r => r.some(c => /花型号/.test(c)));
  const out2 = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    const code = clean(r[1]);
    if (!code) continue;
    out2.push([1, '', code, num(r[5]), clean(r[3]), clean(r[4]), [r[0] && `页码:${clean(r[0])}`, r[2] && `纱支:${clean(r[2])}`].filter(Boolean).join('｜')]);
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('VERCELLI韦尔切利', out2);
}

// ========== 9. CARPENS卡佩斯：5个分册（明细一~五），每册表头列不同，动态映射 ==========
{
  const rows = readSheet('CARPENS 卡佩斯');
  const out2 = [];
  let section = '';      // 当前分册名
  let colMap = null;     // 当前分册列映射: {code, comp, series, weight, bulk, pack, cut, feature, note}
  const detectCols = r => {
    const idx = {};
    r.forEach((h, i) => {
      const hh = clean(h);
      if (/^品号$|^品号/.test(hh) && !('code' in idx)) idx.code = i;
      else if (/成份|成分/.test(hh) && !('comp' in idx)) idx.comp = i;
      else if (/系列/.test(hh) && !('series' in idx)) idx.series = i;
      else if (/克重/.test(hh) && !('weight' in idx)) idx.weight = i;
      else if (/大货价/.test(hh) && !('bulk' in idx)) idx.bulk = i;
      else if (/整包价/.test(hh) && !('pack' in idx)) idx.pack = i;
      else if (/零剪价|零裁价/.test(hh) && !('cut' in idx)) idx.cut = i;
      else if (/特性/.test(hh) && !('feature' in idx)) idx.feature = i;
      else if (/^备注/.test(hh) && !('note' in idx)) idx.note = i;
    });
    return Object.keys(idx).length >= 2 ? idx : null;
  };
  for (const r of rows) {
    const first = clean(r[0]);
    // 分册标题行
    const m = first.match(/卡佩斯面料册明细（[一二三四五六七八九十]+）?/);
    if (m && !/品号/.test(first)) {
      section = m[0];
      colMap = null;
      continue;
    }
    // 表头行 → 检测列映射
    const detected = detectCols(r);
    if (detected && /品号/.test(clean(r[detected.code]))) {
      colMap = detected;
      continue;
    }
    if (!colMap) continue;
    const code = clean(r[colMap.code]);
    if (!code || /品号/.test(code)) continue;
    out2.push([1, section, code,
      num(r[colMap.cut]),
      r[colMap.comp] !== undefined ? clean(r[colMap.comp]) : '',
      r[colMap.weight] !== undefined ? clean(r[colMap.weight]) : '',
      [colMap.feature !== undefined && r[colMap.feature] ? `特性:${clean(r[colMap.feature])}` : '',
       colMap.bulk !== undefined && r[colMap.bulk] ? `大货价:${clean(r[colMap.bulk])}` : '',
       colMap.pack !== undefined && r[colMap.pack] ? `整包价:${clean(r[colMap.pack])}` : '',
       colMap.note !== undefined && r[colMap.note] ? `备注:${clean(r[colMap.note])}` : ''].filter(Boolean).join('｜')]);
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('CARPENS卡佩斯', out2);
}

// ========== 10. 申洲：品号|色号|克重|成分|大货价|零剪加价|运费|系统核价 ==========
{
  const rows = readSheet('申洲');
  const hi = rows.findIndex(r => r.some(c => /品号/.test(c)));
  const out2 = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    const code = clean(r[0]);
    if (!code) continue;
    out2.push([1, '', code, num(r[7]), clean(r[3]), clean(r[2]), [r[1] && `色号:${clean(r[1])}`, r[4] && `大货价:${clean(r[4])}`, r[5] && `零剪加价:${clean(r[5])}`, r[6] && `运费:${clean(r[6])}`].filter(Boolean).join('｜')]);
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('申洲', out2);
}

// ========== 11. 美酷：说明|样册编号|品类系列|对外零剪|金鸳鸯零剪|金鸳鸯大货|成份|纱支|克重|运费|系统单价 ==========
{
  const rows = readSheet('美酷');
  const hi = rows.findIndex(r => r.some(c => /样册编号/.test(c)));
  const out2 = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    // 面料号优先取样册编号；无样册编号时取说明列中的纯数字编号
    let code = clean(r[1]);
    if (!code && /^\d+$/.test(clean(r[0]))) code = clean(r[0]);
    if (!code) continue;
    out2.push([1, clean(r[2]), code, num(r[10]) ?? num(r[4]), clean(r[6]), clean(r[8]), [r[0] && !/^\d+$/.test(clean(r[0])) ? `说明:${clean(r[0])}` : '', r[3] && `对外零剪:${clean(r[3])}`, r[4] && `金鸳鸯零剪:${clean(r[4])}`, r[5] && `金鸳鸯大货:${clean(r[5])}`, r[7] && `纱支:${clean(r[7])}`, r[9] && `运费:${clean(r[9])}`].filter(Boolean).join('｜')]);
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('美酷', out2);
}

// ========== 12. 美蒂诺(LD)岚缇奥：品类|品号|特征|成份|重量|幅宽|零剪价 ==========
{
  const rows = readSheet('美蒂诺(LD)岚缇奥');
  const hi = rows.findIndex(r => r.some(c => /品号/.test(c)));
  const out2 = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    const code = clean(r[1]);
    if (!code || /册子编号/.test(code)) continue;
    out2.push([1, clean(r[0]), code, num(r[6]), clean(r[3]), clean(r[4]), [r[2] && `特征:${clean(r[2])}`, r[5] && `幅宽:${clean(r[5])}`].filter(Boolean).join('｜')]);
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('美蒂诺(LD)岚缇奥', out2);
}

// ========== 13. NOBILITY金大：系列描述|编号|价格 ==========
{
  const rows = readSheet('NOBILITY金大');
  const out2 = [];
  let lastSeries = '';
  for (const r of rows) {
    const s0 = clean(r[0]);
    const c1 = clean(r[1]);
    if (/series|sereis/i.test(s0) && /^\d+$/.test(c1)) {
      lastSeries = s0;
      out2.push([1, lastSeries, c1, num(r[3]), '', '', r[3] ? `价格:${clean(r[3])}` : '']);
    } else if (/^\d+$/.test(c1) && /^\d+$/.test(clean(r[0]))) {
      // 连续编号行
      out2.push([1, lastSeries, c1, num(r[3]), '', '', r[3] ? `价格:${clean(r[3])}` : '']);
    }
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('NOBILITY金大', out2);
}

// ========== 14. Stylbiella STB：画册/样本|样本编码(多行)|系列(多行)|零剪价(多行) ==========
{
  const rows = readSheet('Stylbiella STB');
  const headRow = rows.find(r => r.some(c => /样本编码/.test(c)));
  const hi = rows.indexOf(headRow);
  const out2 = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    const codes = String(r[1] || '').split('\n').map(s => s.trim()).filter(Boolean);
    const prices = String(r[5] || '').split('\n').map(s => s.trim()).filter(Boolean);
    const series = String(r[2] || '').split('\n').map(s => s.trim()).filter(Boolean);
    codes.forEach((c, idx) => {
      out2.push([1, series[idx] || '', c, num(prices[idx] ?? prices[0]), '', '', r[0] ? `来源:${clean(r[0])}` : '']);
    });
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('Stylbiella STB', out2);
}

// ========== 15. T.INGENIATOR英吉尼托：编号|零切|35m+|70m+|500m+ ==========
{
  const rows = readSheet('T.INGENIATOR英吉尼托');
  const out2 = [];
  for (const r of rows) {
    const code = clean(r[0]);
    if (!/^[A-Z]/.test(code) || /系列/.test(code)) continue;
    out2.push([1, '', code, num(r[1]), '', '', [r[2] && `35m+:${clean(r[2])}`, r[3] && `70m+:${clean(r[3])}`, r[4] && `500m+:${clean(r[4])}`].filter(Boolean).join('｜')]);
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('T.INGENIATOR英吉尼托', out2);
}

// ========== 16. 西岡織物：编号|零切含票|35m+|70m+|500m+ ==========
{
  const rows = readSheet('西岡織物');
  const out2 = [];
  for (const r of rows) {
    const code = clean(r[0]);
    if (!/^N\d/.test(code)) continue;
    out2.push([1, '', code, num(r[1]), '', '', [r[2] && `35m+:${clean(r[2])}`, r[3] && `70m+:${clean(r[3])}`, r[4] && `500m+:${clean(r[4])}`].filter(Boolean).join('｜')]);
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('西岡織物', out2);
}

// ========== 17. JY Shirts衬衫：尾号|包工包料价（保留原结构，备注说明） ==========
{
  const rows = readSheet('JY Shirts衬衫');
  const hi = rows.findIndex(r => r.some(c => /衬衫尾号/.test(c)));
  const out2 = [];
  for (let i = hi + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    out2.push([1, '衬衫', `尾号${clean(r[0])}`, num(r[1]), '', '', '包工包料价格']);
  }
  out2.forEach((r, i) => r[0] = i + 1);
  addRows('JY Shirts衬衫', out2);
}

// ========== 输出 Excel ==========
const wb = XLSX.utils.book_new();
// 目录 sheet
const toc = [['品牌面料册索引', ''], ['整理日期', new Date().toLocaleDateString('zh-CN')], ['格式', '序号|系列|面料号/品号|面料单价(零剪价)|面料成份|克重|备注'], ['', ''], ['品牌', '条数']];
for (const [b, rows] of Object.entries(out)) toc.push([b, rows.length]);
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(toc), '目录');

for (const [brand, rows] of Object.entries(out)) {
  const sheetName = brand.slice(0, 28).replace(/[\\/:*?\[\]]/g, '');
  const aoa = [HEAD, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 6 }, { wch: 22 }, { wch: 18 }, { wch: 14 }, { wch: 26 }, { wch: 12 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
}
writeFileSync('整理版-面料价格合集.xlsx', XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }));
console.log('✅ 整理完成');
for (const [b, rows] of Object.entries(out)) console.log(`  ${b}: ${rows.length} 条`);
console.log('总计:', Object.values(out).reduce((s, r) => s + r.length, 0), '条');
