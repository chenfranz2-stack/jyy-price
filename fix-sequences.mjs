// 以用户修订版为准：重排所有 sheet 序号为连续 1..N，更新目录条数
// 输出: 整理版-面料价格合集-最终.xlsx
import { readFileSync, writeFileSync } from 'fs';
import * as XLSX from 'xlsx';

const src = '整理版-用户修订.xlsx';
const out = '整理版-面料价格合集-最终.xlsx';
const wb = XLSX.read(readFileSync(src), { type: 'buffer' });

const brandCounts = {};
for (const name of wb.SheetNames) {
  if (name === '目录') continue;
  const ws = wb.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (!rows.length) continue;
  const header = rows[0];
  const dataRows = rows.slice(1).filter(r => r.some(c => String(c ?? '').trim() !== ''));
  // 重排序号（第1列）
  dataRows.forEach((r, i) => { r[0] = i + 1; });
  const newAoa = [header, ...dataRows];
  const newWs = XLSX.utils.aoa_to_sheet(newAoa);
  newWs['!cols'] = [{ wch: 6 }, { wch: 22 }, { wch: 18 }, { wch: 14 }, { wch: 26 }, { wch: 12 }, { wch: 60 }];
  // 替换原 sheet（保留 sheet 位置）
  const idx = wb.SheetNames.indexOf(name);
  wb.Sheets[name] = newWs;
  brandCounts[name] = dataRows.length;
  console.log(`${name}: ${dataRows.length} 条，序号已重排`);
}

// 更新目录
if (wb.Sheets['目录']) {
  const tocRows = [['品牌面料册索引', ''], ['整理日期', new Date().toLocaleDateString('zh-CN')], ['格式', '序号|系列|面料号/品号|面料单价(零剪价)|面料成份|克重|备注'], ['', ''], ['品牌', '条数']];
  for (const [b, c] of Object.entries(brandCounts)) tocRows.push([b, c]);
  wb.Sheets['目录'] = XLSX.utils.aoa_to_sheet(tocRows);
}

writeFileSync(out, XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }));
console.log('\n✅ 最终版生成:', out);
console.log('总条数:', Object.values(brandCounts).reduce((s, v) => s + v, 0));
