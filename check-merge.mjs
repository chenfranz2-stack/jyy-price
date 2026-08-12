// 检查各 sheet 的合并单元格定义
import { readFileSync } from 'fs';
import zlib from 'zlib';

const buf = readFileSync('面料价格合集.xlsx');
const files = {};
let i = 0;
while (i < buf.length - 4) {
  if (buf[i] === 0x50 && buf[i+1] === 0x4b && buf[i+2] === 0x03 && buf[i+3] === 0x04) {
    const method = buf.readUInt16LE(i + 8);
    const comp = buf.readUInt32LE(i + 18);
    const nl = buf.readUInt16LE(i + 26);
    const el = buf.readUInt16LE(i + 28);
    const name = buf.subarray(i + 30, i + 30 + nl).toString('utf8');
    const ds = i + 30 + nl + el;
    const data = buf.subarray(ds, ds + comp);
    try { files[name] = method === 8 ? zlib.inflateRawSync(data).toString('utf8') : (method === 0 ? data.toString('utf8') : null); } catch (e) {}
    i = ds + comp;
  } else i++;
}

// 17 个 sheet 文件
const sheets = ['sheet1','sheet2','sheet3','sheet4','sheet5','sheet6','sheet7','sheet8','sheet9','sheet10','sheet11','sheet12','sheet13','sheet14','sheet15','sheet16','sheet17'];
const names = ['JYY自备面料','JYY特供进口面料','NOBILITY金大','Stylbiella STB','JY Shirts衬衫','CARPENS 卡佩斯','美蒂诺(LD)岚缇奥','BROWN AARON微度','VERCELLI韦尔切利','西岡織物','T.INGENIATOR英吉尼托','FILARTE菲拉特','YUBOYUAN玉帛园','TALLIA马佐托','SVIP-TALLIA零剪','美酷','申洲'];

for (let k = 0; k < sheets.length; k++) {
  const xml = files['xl/worksheets/' + sheets[k] + '.xml'];
  if (!xml) { console.log(names[k], '无文件'); continue; }
  const mm = xml.match(/<mergeCells[^>]*>([\s\S]*?)<\/mergeCells>/);
  if (!mm) { console.log(names[k], ': 无合并单元格'); continue; }
  const refs = (mm[1].match(/ref="[^"]+"/g) || []).map(s => s.slice(5, -1));
  // 只统计纵向合并（涉及多行）和非连续行合并
  const multiRow = refs.filter(r => {
    const [a, b] = r.split(':');
    const ra = parseInt(a.replace(/\D/g, ''));
    const rb = parseInt(b.replace(/\D/g, ''));
    return ra !== rb;
  });
  console.log(names[k], ': 合并', refs.length, '处，其中纵向多行合并', multiRow.length, '处');
  if (multiRow.length) console.log('  前8个:', multiRow.slice(0, 8).join(' '));
}
