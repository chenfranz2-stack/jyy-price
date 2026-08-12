// 生成 VBC 画册面料清单 Excel（15# + 16#）
import { writeFileSync } from 'fs';
import * as XLSX from 'xlsx';

// 15# 画册数据（从渲染页面提取）
const vbc15 = [
  // 页码, 货号, 颜色, 成分, 纱支, 克重
  ['4', '568004/520', 'Light Grey', '100%W', 'Super110\'s', '240g'],
  ['4', '568009/520', 'Light Blue', '100%W', 'Super110\'s', '240g'],
  ['4', '568008/520', 'Blue', '100%W', 'Super110\'s', '240g'],
  ['4', '568002/520', 'Navy', '100%W', 'Super110\'s', '240g'],
  ['5', '30186/660', 'Light Grey', '100%W', 'Super110\'s', '280g'],
  ['5', '30180/660', 'Grey', '100%W', 'Super110\'s', '280g'],
  ['5', '30182/660', 'Blue', '100%W', 'Super110\'s', '280g'],
  ['5', '30184/660', 'Navy', '100%W', 'Super110\'s', '280g'],
  ['6', '468106/580', 'Navy Blue', '100%W', 'Super110\'s', '260g'],
  ['6', '468107/580', 'Navy', '100%W', 'Super110\'s', '260g'],
  ['6', '468005/580', 'Charcoal', '100%W', 'Super110\'s', '260g'],
  ['7', '468012/580', 'Grey', '100%W', 'Super110\'s', '260g'],
  ['7', '468002/580', 'Navy', '100%W', 'Super110\'s', '260g'],
  ['7', '468001/580', 'Black', '100%W', 'Super110\'s', '260g'],
  ['8', '566010/520', 'Light Blue', '100%W', 'Super110\'s', '260g'],
  ['8', '566009/520', 'Royal Blue', '100%W', 'Super110\'s', '260g'],
  ['8', '566004/520', 'Mid Navy', '100%W', 'Super110\'s', '260g'],
  ['9', '566003/520', 'Navy', '100%W', 'Super110\'s', '260g'],
  ['9', '566002/520', 'Dark Navy', '100%W', 'Super110\'s', '260g'],
  ['9', '566001/520', 'Black', '100%W', 'Super110\'s', '260g'],
  ['10', '30816/520', 'Charcoal', '100%W', 'Super110\'s', '260g'],
  ['10', '568005/520', 'Charcoal', '100%W', 'Super110\'s', '260g'],
  ['11', '30224/660', 'Navy', '100%W', 'Super110\'s', '240g'],
  ['11', '30222/660', 'Black', '100%W', 'Super110\'s', '240g'],
  ['12', '40891/660', 'Light Grey', '100%W', 'Super110\'s', '240g'],
  ['12', '40712/660', 'Navy', '100%W', 'Super110\'s', '240g'],
  ['13', '30631/660', 'Blue', '100%W', 'Super110\'s', '260g'],
  ['13', '30633/660', 'Grey', '100%W', 'Super110\'s', '260g'],
  ['14', '30684/660', 'Navy', '100%W', 'Super110\'s', '260g'],
  ['14', '30683/660', 'Dark Navy', '100%W', 'Super110\'s', '260g'],
  ['14', '30682/660', 'Black', '100%W', 'Super110\'s', '260g'],
  ['15', '30721/660', 'Light Grey', '100%W', 'Super110\'s', '260g'],
  ['15', '30723/660', 'Blue', '100%W', 'Super110\'s', '260g'],
  ['15', '30724/660', 'Navy', '100%W', 'Super110\'s', '260g'],
  ['16', '31671/660', 'Grey', '100%W', 'Super110\'s', '260g'],
  ['16', '31674/660', 'Navy', '100%W', 'Super110\'s', '260g'],
  ['17', '30783/660', 'Navy', '100%W', 'Super110\'s', '240g'],
  ['17', '30786/660', 'Navy Blue', '100%W', 'Super110\'s', '240g'],
];

// 16# 画册数据
const vbc16 = [
  ['2', '32532/660', 'Blue', '100%W', 'Super110\'s', '260g'],
  ['2', '32531/660', 'Charcoal', '100%W', 'Super110\'s', '260g'],
  ['2', '32113/660', 'Navy', '100%W', 'Super110\'s', '260g'],
  ['3', '32673/660', 'Grey', '100%W', 'Super110\'s', '260g'],
  ['3', '32676/660', 'Royal Blue', '100%W', 'Super110\'s', '260g'],
  ['4', '41241/720', 'Light Grey', '100%W', 'Super120\'s', '230g'],
  ['4', '42611/720', 'Light Grey', '100%W', 'Super120\'s', '230g'],
  ['5', '40131/720', 'Light Blue', '100%W', 'Super120\'s', '230g'],
  ['5', '40821/720', 'Light Blue', '100%W', 'Super120\'s', '230g'],
  ['6', '40225/660', 'Burgundy', '84%W 16%M', 'Super120\'s', '230g'],
  ['6', '40395/660', 'Navy Murl', '84%W 16%M', 'Super120\'s', '230g'],
  ['6', '40152/660', 'Blue', '84%W 16%M', 'Super120\'s', '230g'],
  ['7', '30352/580', 'Light Grey', '100%W', 'Super110\'s', '240g'],
  ['7', '30492/580', 'Medium Grey', '100%W', 'Super110\'s', '240g'],
  ['8', '30132/660', 'Dark Navy', '100%W', 'Super110\'s', '260g'],
  ['8', '30131/660', 'Navy', '100%W', 'Super110\'s', '260g'],
  ['10', '31518/660', 'Grey', '100%W', 'Super110\'s', '260g'],
  ['10', '31519/660', 'Navy', '100%W', 'Super110\'s', '260g'],
  ['11', '31896/660', 'Navy', '100%W', 'Super110\'s', '260g'],
  ['11', '31894/660', 'Charcoal', '100%W', 'Super110\'s', '260g'],
  ['11', '31891/660', 'Navy Blue', '100%W', 'Super110\'s', '260g'],
  ['12', '50313/840', 'Navy', '100%W', 'Super150\'s', '270g'],
  ['12', '50183/840', 'Navy', '100%W', 'Super150\'s', '270g'],
  ['13', '50188/840', 'Grey', '100%W', 'Super150\'s', '290g'],
  ['13', '50186/840', 'Navy', '100%W', 'Super150\'s', '290g'],
  ['14', '50015/840', 'Charcoal', '100%W', 'Super150\'s', '270g'],
  ['14', '50269/840', 'Navy', '100%W', 'Super150\'s', '270g'],
  ['15', '50357/840', 'Black', '100%W', 'Super150\'s', '280g'],
  ['15', '50356/840', 'Navy', '100%W', 'Super150\'s', '280g'],
  ['16', '50401/840', 'Grey', '100%W', 'Super150\'s', '270g'],
  ['16', '50614/840', 'Grey', '100%W', 'Super150\'s', '270g'],
  ['17', '52810/840', 'Grey', '100%W', 'Super150\'s', '270g'],
  ['17', '52809/840', 'Light Grey', '100%W', 'Super150\'s', '270g'],
  ['17', '52803/840', 'Blue', '100%W', 'Super150\'s', '270g'],
];

const HEAD = ['序号', '画册', '页码', '面料货号', '颜色', '成分', '纱支', '克重', '备注'];
const mkRows = (arr, book) => arr.map((r, i) => [i + 1, book, ...r, '']);

const wb = XLSX.utils.book_new();
const ws15 = XLSX.utils.aoa_to_sheet([HEAD, ...mkRows(vbc15, '15#')]);
const ws16 = XLSX.utils.aoa_to_sheet([HEAD, ...mkRows(vbc16, '16#')]);
ws15['!cols'] = [{ wch: 5 }, { wch: 6 }, { wch: 5 }, { wch: 13 }, { wch: 14 }, { wch: 10 }, { wch: 11 }, { wch: 6 }, { wch: 30 }];
ws16['!cols'] = ws15['!cols'];
XLSX.utils.book_append_sheet(wb, ws15, 'VBC 15#画册');
XLSX.utils.book_append_sheet(wb, ws16, 'VBC 16#画册');

// 目录
const toc = [['意大利 VBC 画册面料清单', ''], ['来源', 'C:\\Users\\Administrator\\Desktop\\合作面料商资料\\意裁VBC'], ['整理日期', new Date().toLocaleDateString('zh-CN')], ['', ''], ['画册', '面料数'], ['15#', vbc15.length], ['16#', vbc16.length], ['合计', vbc15.length + vbc16.length]];
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(toc), '目录');

writeFileSync('VBC画册面料清单.xlsx', XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }));
console.log('✅ VBC画册面料清单.xlsx 生成');
console.log('15#:', vbc15.length, '条 | 16#:', vbc16.length, '条 | 合计:', vbc15.length + vbc16.length);
