// 生成 VBC 报价模板（格式与 整理版-面料价格合集-最终.xlsx 完全一致）
// 序号|系列|面料号/品号|面料单价(零剪价)|面料成份|克重|备注
// 价格 = 货号尾号/2，如 520/2=260
import { writeFileSync, readFileSync } from 'fs';
import * as XLSX from 'xlsx';

// 15# / 16# 数据: [页码, 货号, 颜色, 成分, 纱支, 克重]
const vbc15 = [
  ['4', '568004/520', 'Light Grey', '100%W', "Super110's", '240g'],
  ['4', '568009/520', 'Light Blue', '100%W', "Super110's", '240g'],
  ['4', '568008/520', 'Blue', '100%W', "Super110's", '240g'],
  ['4', '568002/520', 'Navy', '100%W', "Super110's", '240g'],
  ['5', '30186/660', 'Light Grey', '100%W', "Super110's", '280g'],
  ['5', '30180/660', 'Grey', '100%W', "Super110's", '280g'],
  ['5', '30182/660', 'Blue', '100%W', "Super110's", '280g'],
  ['5', '30184/660', 'Navy', '100%W', "Super110's", '280g'],
  ['6', '468106/580', 'Navy Blue', '100%W', "Super110's", '260g'],
  ['6', '468107/580', 'Navy', '100%W', "Super110's", '260g'],
  ['6', '468005/580', 'Charcoal', '100%W', "Super110's", '260g'],
  ['7', '468012/580', 'Grey', '100%W', "Super110's", '260g'],
  ['7', '468002/580', 'Navy', '100%W', "Super110's", '260g'],
  ['7', '468001/580', 'Black', '100%W', "Super110's", '260g'],
  ['8', '566010/520', 'Light Blue', '100%W', "Super110's", '260g'],
  ['8', '566009/520', 'Royal Blue', '100%W', "Super110's", '260g'],
  ['8', '566004/520', 'Mid Navy', '100%W', "Super110's", '260g'],
  ['9', '566003/520', 'Navy', '100%W', "Super110's", '260g'],
  ['9', '566002/520', 'Dark Navy', '100%W', "Super110's", '260g'],
  ['9', '566001/520', 'Black', '100%W', "Super110's", '260g'],
  ['10', '30816/520', 'Charcoal', '100%W', "Super110's", '260g'],
  ['10', '568005/520', 'Charcoal', '100%W', "Super110's", '260g'],
  ['11', '30224/660', 'Navy', '100%W', "Super110's", '240g'],
  ['11', '30222/660', 'Black', '100%W', "Super110's", '240g'],
  ['12', '40891/660', 'Light Grey', '100%W', "Super110's", '240g'],
  ['12', '40712/660', 'Navy', '100%W', "Super110's", '240g'],
  ['13', '30631/660', 'Blue', '100%W', "Super110's", '260g'],
  ['13', '30633/660', 'Grey', '100%W', "Super110's", '260g'],
  ['14', '30684/660', 'Navy', '100%W', "Super110's", '260g'],
  ['14', '30683/660', 'Dark Navy', '100%W', "Super110's", '260g'],
  ['14', '30682/660', 'Black', '100%W', "Super110's", '260g'],
  ['15', '30721/660', 'Light Grey', '100%W', "Super110's", '260g'],
  ['15', '30723/660', 'Blue', '100%W', "Super110's", '260g'],
  ['15', '30724/660', 'Navy', '100%W', "Super110's", '260g'],
  ['16', '31671/660', 'Grey', '100%W', "Super110's", '260g'],
  ['16', '31674/660', 'Navy', '100%W', "Super110's", '260g'],
  ['17', '30783/660', 'Navy', '100%W', "Super110's", '240g'],
  ['17', '30786/660', 'Navy Blue', '100%W', "Super110's", '240g'],
];
const vbc16 = [
  ['2', '32532/660', 'Blue', '100%W', "Super110's", '260g'],
  ['2', '32531/660', 'Charcoal', '100%W', "Super110's", '260g'],
  ['2', '32113/660', 'Navy', '100%W', "Super110's", '260g'],
  ['3', '32673/660', 'Grey', '100%W', "Super110's", '260g'],
  ['3', '32676/660', 'Royal Blue', '100%W', "Super110's", '260g'],
  ['4', '41241/720', 'Light Grey', '100%W', "Super120's", '230g'],
  ['4', '42611/720', 'Light Grey', '100%W', "Super120's", '230g'],
  ['5', '40131/720', 'Light Blue', '100%W', "Super120's", '230g'],
  ['5', '40821/720', 'Light Blue', '100%W', "Super120's", '230g'],
  ['6', '40225/660', 'Burgundy', '84%W 16%M', "Super120's", '230g'],
  ['6', '40395/660', 'Navy Murl', '84%W 16%M', "Super120's", '230g'],
  ['6', '40152/660', 'Blue', '84%W 16%M', "Super120's", '230g'],
  ['7', '30352/580', 'Light Grey', '100%W', "Super110's", '240g'],
  ['7', '30492/580', 'Medium Grey', '100%W', "Super110's", '240g'],
  ['8', '30132/660', 'Dark Navy', '100%W', "Super110's", '260g'],
  ['8', '30131/660', 'Navy', '100%W', "Super110's", '260g'],
  ['10', '31518/660', 'Grey', '100%W', "Super110's", '260g'],
  ['10', '31519/660', 'Navy', '100%W', "Super110's", '260g'],
  ['11', '31896/660', 'Navy', '100%W', "Super110's", '260g'],
  ['11', '31894/660', 'Charcoal', '100%W', "Super110's", '260g'],
  ['11', '31891/660', 'Navy Blue', '100%W', "Super110's", '260g'],
  ['12', '50313/840', 'Navy', '100%W', "Super150's", '270g'],
  ['12', '50183/840', 'Navy', '100%W', "Super150's", '270g'],
  ['13', '50188/840', 'Grey', '100%W', "Super150's", '290g'],
  ['13', '50186/840', 'Navy', '100%W', "Super150's", '290g'],
  ['14', '50015/840', 'Charcoal', '100%W', "Super150's", '270g'],
  ['14', '50269/840', 'Navy', '100%W', "Super150's", '270g'],
  ['15', '50357/840', 'Black', '100%W', "Super150's", '280g'],
  ['15', '50356/840', 'Navy', '100%W', "Super150's", '280g'],
  ['16', '50401/840', 'Grey', '100%W', "Super150's", '270g'],
  ['16', '50614/840', 'Grey', '100%W', "Super150's", '270g'],
  ['17', '52810/840', 'Grey', '100%W', "Super150's", '270g'],
  ['17', '52809/840', 'Light Grey', '100%W', "Super150's", '270g'],
  ['17', '52803/840', 'Blue', '100%W', "Super150's", '270g'],
];

const HEAD = ['序号', '系列', '面料号/品号', '面料单价(零剪价)', '面料成份', '克重', '备注'];

// 价格 = 尾号/2
const priceOf = code => {
  const m = String(code).match(/\/(\d+)$/);
  return m ? Math.round(parseInt(m[1]) / 2) : null;
};

const mkRow = (r, series) => {
  const [page, code, color, comp, yarn, weight] = r;
  const price = priceOf(code);
  return [0, series, code, price, comp, weight, `颜色:${color}｜纱支:${yarn}｜页码:${page}`];
};

const rows15 = vbc15.map(r => mkRow(r, 'VBC#15'));
const rows16 = vbc16.map(r => mkRow(r, 'VBC#16'));

// 序号连续
rows15.forEach((r, i) => r[0] = i + 1);
rows16.forEach((r, i) => r[0] = i + 1);

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([HEAD, ...rows15, ...rows16]);
ws['!cols'] = [{ wch: 6 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 8 }, { wch: 50 }];
XLSX.utils.book_append_sheet(wb, ws, 'VBC');

writeFileSync('VBC报价模板.xlsx', XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }));
console.log('✅ VBC报价模板.xlsx 生成:', rows15.length + rows16.length, '条');
console.log('样例:', JSON.stringify(rows15[0]));
console.log('样例:', JSON.stringify(rows16[0]));
