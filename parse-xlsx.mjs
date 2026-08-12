// 纯 Node 解析 xlsx：不依赖任何第三方库
// 用法: node parse-xlsx.mjs <文件.xlsx> [sheet索引或名称] [--json]
import { readFileSync, writeFileSync } from 'fs';
import zlib from 'zlib';

// ---------- ZIP 解析 ----------
function parseZip(buf) {
  const files = {};
  let i = 0;
  const len = buf.length;
  // 扫描本地文件头 PK\x03\x04
  while (i < len - 4) {
    if (buf[i] === 0x50 && buf[i+1] === 0x4b && buf[i+2] === 0x03 && buf[i+3] === 0x04) {
      const method = buf.readUInt16LE(i + 8);       // 压缩方法 0=store 8=deflate
      const compSize = buf.readUInt32LE(i + 18);
      const nameLen = buf.readUInt16LE(i + 26);
      const extraLen = buf.readUInt16LE(i + 28);
      const name = buf.subarray(i + 30, i + 30 + nameLen).toString('utf8');
      const dataStart = i + 30 + nameLen + extraLen;
      const data = buf.subarray(dataStart, dataStart + compSize);
      let out;
      try {
        out = method === 8 ? zlib.inflateRawSync(data) : (method === 0 ? data : null);
      } catch (e) { out = null; }
      if (out) files[name] = out.toString('utf8');
      i = dataStart + compSize;
    } else {
      i++;
    }
  }
  return files;
}

// ---------- XML 工具 ----------
function attr(name, s) {
  const m = s.match(new RegExp(name + '="([^"]*)"'));
  return m ? m[1] : '';
}
function decodeXmlEntities(s) {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d)));
}
// 提取 <t> 文本（含 <r><t> 富文本）
function extractTexts(xml) {
  const out = [];
  const re = /<t[^>]*>([\s\S]*?)<\/t>/g;
  let m;
  while ((m = re.exec(xml))) out.push(decodeXmlEntities(m[1]));
  return out.join('');
}
// 解析 sheet 数据：返回 {r, c, v} 列表
function parseSheet(xml) {
  const cells = [];
  const rowRe = /<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  let rm;
  while ((rm = rowRe.exec(xml))) {
    const rowNum = parseInt(rm[1]);
    const rowXml = rm[2];
    const cRe = /<c[^>]*r="([A-Z]+)(\d+)"([^>]*)>([\s\S]*?)<\/c>|<c[^>]*r="([A-Z]+)(\d+)"([^>]*)\/>/g;
    let cm;
    while ((cm = cRe.exec(rowXml))) {
      const col = cm[1] || cm[5];
      const rn = parseInt(cm[2] || cm[6]);
      const body = cm[4] || '';
      const t = attr('t', cm[3] || cm[7] || '');
      const v = (body.match(/<v>([\s\S]*?)<\/v>/) || [])[1] || '';
      cells.push({ col, row: rn, t, v: decodeXmlEntities(v || ''), raw: body });
    }
  }
  return cells;
}

// ---------- 主流程 ----------
const file = process.argv[2];
const wantSheet = process.argv[3];
const asJson = process.argv.includes('--json');
const buf = readFileSync(file);
const files = parseZip(buf);

if (!files['xl/workbook.xml']) {
  console.error('不是有效的 xlsx（缺少 xl/workbook.xml）');
  console.error('找到的条目：', Object.keys(files).slice(0, 20).join(', '));
  process.exit(1);
}

// sheet 名 + rId
const wb = files['xl/workbook.xml'];
const sheets = [];
const shRe = /<sheet\s[^>]*>/g;
let sm;
while ((sm = shRe.exec(wb))) {
  sheets.push({ name: attr('name', sm[0]), rid: attr('r:id', sm[0]), id: attr('sheetId', sm[0]) });
}
// rId -> 文件
const rels = files['xl/_rels/workbook.xml.rels'] || '';
const relMap = {};
const relRe = /<Relationship\s[^>]*>/g;
let rl;
while ((rl = relRe.exec(rels))) {
  relMap[attr('Id', rl[0])] = attr('Target', rl[0]);
}
// sharedStrings
const shared = [];
if (files['xl/sharedStrings.xml']) {
  const siRe = /<si>([\s\S]*?)<\/si>/g;
  let si;
  while ((si = siRe.exec(files['xl/sharedStrings.xml']))) shared.push(extractTexts(si[1]));
}

function renderCell(c) {
  if (c.t === 's') return shared[parseInt(c.v)] !== undefined ? shared[parseInt(c.v)] : '';
  if (c.t === 'inlineStr') return extractTexts(c.raw);
  return c.v;
}

// 选择 sheet
let target = sheets[0];
if (wantSheet) {
  target = sheets.find(s => s.name === wantSheet) || sheets[parseInt(wantSheet) - 1] || target;
}
const sheetFile = 'xl/' + (relMap[target.rid] || '').replace(/^\//, '');
const xml = files[sheetFile];
if (!xml) {
  console.error('找不到 sheet 文件:', sheetFile);
  process.exit(1);
}

const cells = parseSheet(xml);
// 按行列排序，组成表格
const grid = {};
let maxR = 0, maxC = 0;
const colNum = c => [...c].reduce((a, ch) => a * 26 + (ch.charCodeAt(0) - 64), 0);
for (const c of cells) {
  const cn = colNum(c.col);
  if (!grid[c.row]) grid[c.row] = {};
  grid[c.row][cn] = renderCell(c);
  maxR = Math.max(maxR, c.row); maxC = Math.max(maxC, cn);
}

console.log('文件:', file);
console.log('工作表数量:', sheets.length, '| 工作表:', sheets.map(s => s.name).join(' / '));
console.log('选中工作表:', target.name, '| 数据范围: 1..' + maxR + ' 行 x 1..' + maxC + ' 列');
console.log('---');

if (asJson) {
  const arr = [];
  for (let r = 1; r <= maxR; r++) {
    const row = [];
    for (let c = 1; c <= maxC; c++) row.push(grid[r] && grid[r][c] !== undefined ? grid[r][c] : '');
    if (row.some(v => v !== '')) arr.push(row);
  }
  writeFileSync(file.replace(/\.xlsx$/i, '') + '.json', JSON.stringify(arr, null, 1), 'utf8');
  console.log('已输出 JSON:', file.replace(/\.xlsx$/i, '') + '.json', '| 共', arr.length, '行');
} else {
  for (let r = 1; r <= maxR; r++) {
    const row = [];
    for (let c = 1; c <= maxC; c++) row.push(grid[r] && grid[r][c] !== undefined ? String(grid[r][c]).replace(/\n/g, '⏎') : '');
    // 去掉尾部空列
    while (row.length && row[row.length - 1] === '') row.pop();
    if (row.some(v => v !== '')) console.log(row.join(' | '));
  }
}
