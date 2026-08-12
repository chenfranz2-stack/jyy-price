// 调试 xlsx 解析问题
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

const attr = (n, s) => { const m = s.match(new RegExp(n + '="([^"]*)"')); return m ? m[1] : ''; };

const wb = files['xl/workbook.xml'];
const sheets = [];
let re = /<sheet[^>]*>/g, m;
while ((m = re.exec(wb))) sheets.push({ name: attr('name', m[0]), rid: attr('r:id', m[0]) });
console.log('sheets:', JSON.stringify(sheets));

const rels = files['xl/_rels/workbook.xml.rels'];
const relMap = {};
re = /<Relationship[^>]*>/g;
while ((m = re.exec(rels))) relMap[attr('Id', m[0])] = attr('Target', m[0]);
console.log('relMap:', JSON.stringify(relMap));

const target = sheets[0];
console.log('target:', JSON.stringify(target));
console.log('resolved:', relMap[target.rid]);
console.log('sheetFile exists:', !!files['xl/' + relMap[target.rid]]);
