// 把 VBC 表合并进 整理版-面料价格合集-最终.xlsx
import { readFileSync, writeFileSync } from 'fs';
import * as XLSX from 'xlsx';

const mainFile = '整理版-面料价格合集-最终.xlsx';
const vbcFile = 'VBC报价模板.xlsx';
const outFile = '整理版-面料价格合集-含VBC.xlsx';

const wb = XLSX.read(readFileSync(mainFile), { type: 'buffer' });

// 读 VBC 模板
const vbcWb = XLSX.read(readFileSync(vbcFile), { type: 'buffer' });
const vbcWs = vbcWb.Sheets['VBC'];
const vbcRows = XLSX.utils.sheet_to_json(vbcWs, { header: 1 });

// 已有 VBC sheet 则替换
if (wb.SheetNames.includes('VBC')) {
  const idx = wb.SheetNames.indexOf('VBC');
  wb.SheetNames.splice(idx, 1);
  delete wb.Sheets['VBC'];
}
XLSX.utils.book_append_sheet(wb, vbcWs, 'VBC');

// 更新目录
if (wb.Sheets['目录']) {
  const tocRows = XLSX.utils.sheet_to_json(wb.Sheets['目录'], { header: 1 });
  // 找到品牌|条数 区域，替换/新增 VBC 行
  let found = false;
  for (const r of tocRows) {
    if (r[0] === 'VBC') { r[1] = vbcRows.length - 1; found = true; break; }
  }
  if (!found) tocRows.push(['VBC', vbcRows.length - 1]);
  // 更新合计行（如果有"合计"）
  for (const r of tocRows) {
    if (/合计|总计/.test(String(r[0] || ''))) {
      const sum = tocRows.filter(x => typeof x[1] === 'number').reduce((s, x) => s + x[1], 0);
      r[1] = sum;
    }
  }
  wb.Sheets['目录'] = XLSX.utils.aoa_to_sheet(tocRows);
}

writeFileSync(outFile, XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }));
console.log('✅ 已合并，输出:', outFile);
console.log('工作表:', wb.SheetNames.join(' / '));
console.log('VBC 条数:', vbcRows.length - 1);
