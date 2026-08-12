// 把 xlsx 所有 sheet 导出为 UTF-8 JSON（无第三方依赖）
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import zlib from 'zlib';

const file = process.argv[2] || '面料价格合集.xlsx';
const outDir = process.argv[3] || 'sheets-json';

function parseZip(buf) {
  const files = {};
  let i = 0;
  const len = buf.length;
  while (i < len - 4) {
    if (buf[i] === 0x50 && buf[i+1] === 0x4b && buf[i+2] === 0x03 && buf[i+3] === 0x04) {
      const method = buf.readUInt16LE(i + 8);
      const compSize = buf.readUInt32LE(i + 18);
      const nameLen = buf.readUInt16LE(i + 26);
      const extraLen = buf.readUInt16LE(i + 28);
      const name = buf.subarray(i + 30, i + 30 + nameLen).toString('utf8');
      const dataStart = i + 30 + nameLen + extraLen;
      const data = buf.subarray(dataStart, dataStart + compSize);
      let out;
      try { out = method === 8 ? zlib.inflateRawSync(data) : (method === 0 ? data : null); } catch (e) { out = null; }
      if (out) files[name] = out.toString('utf8');
      i = dataStart + compSize;
    } else i++;
  }
  return files;
}

const attr = (n, s) => { const m = s.match(new RegExp(n + '="([^"]*)"')); return m ? m[1] : ''; };
const decodeXml = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d)));
const extractTexts = xml => { const out = []; const re = /<t[^>]*>([\s\S]*?)<\/t>/g; let m; while ((m = re.exec(xml))) out.push(decodeXml(m[1])); return out.join(''); };

function parseSheet(xml) {
  const cells = [];
  const rowRe = /<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  let rm;
  while ((rm = rowRe.exec(xml))) {
    const rowNum = parseInt(rm[1]);
    const cRe = /<c[^>]*r="([A-Z]+)(\d+)"([^>]*)>([\s\S]*?)<\/c>|<c[^>]*r="([A-Z]+)(\d+)"([^>]*)\/>/g;
    let cm;
    while ((cm = cRe.exec(rm[2]))) {
      const col = cm[1] || cm[5];
      const rn = parseInt(cm[2] || cm[6]);
      const body = cm[4] || '';
      const t = attr('t', cm[3] || cm[7] || '');
      const v = (body.match(/<v>([\s\S]*?)<\/v>/) || [])[1] || '';
      cells.push({ col, row: rn, t, v: decodeXml(v || '') });
    }
  }
  return cells;
}

const buf = readFileSync(file);
const files = parseZip(buf);
const wb = files['xl/workbook.xml'];
const sheets = [];
let re = /<sheet\s[^>]*>/g, m;
while ((m = re.exec(wb))) sheets.push({ name: attr('name', m[0]), rid: attr('r:id', m[0]) });
const rels = files['xl/_rels/workbook.xml.rels'];
const relMap = {};
re = /<Relationship\s[^>]*>/g;
while ((m = re.exec(rels))) relMap[attr('Id', m[0])] = attr('Target', m[0]);
const shared = [];
if (files['xl/sharedStrings.xml']) {
  const siRe = /<si>([\s\S]*?)<\/si>/g;
  let si;
  while ((si = siRe.exec(files['xl/sharedStrings.xml']))) shared.push(extractTexts(si[1]));
}
const colNum = c => [...c].reduce((a, ch) => a * 26 + (ch.charCodeAt(0) - 64), 0);

// 解析合并单元格：返回 { "row:col" -> "左上角row:col" }
function parseMerges(xml) {
  const map = {};
  const mm = xml.match(/<mergeCells[^>]*>([\s\S]*?)<\/mergeCells>/);
  if (!mm) return map;
  const refRe = /ref="([A-Z]+\d+):([A-Z]+\d+)"/g;
  let rm;
  while ((rm = refRe.exec(mm[1]))) {
    const parseRef = s => ({ col: colNum(s.match(/[A-Z]+/)[0]), row: parseInt(s.match(/\d+/)[0]) });
    const a = parseRef(rm[1]);
    const b = parseRef(rm[2]);
    for (let r = a.row; r <= b.row; r++) {
      for (let c = a.col; c <= b.col; c++) {
        map[r + ':' + c] = a.row + ':' + a.col;
      }
    }
  }
  return map;
}

mkdirSync(outDir, { recursive: true });
for (const s of sheets) {
  const sf = 'xl/' + (relMap[s.rid] || '').replace(/^\//, '');
  if (!files[sf]) { console.log('SKIP', s.name, sf); continue; }
  const xml = files[sf];
  const cells = parseSheet(xml);
  const merges = parseMerges(xml);
  const grid = {};
  let maxR = 0, maxC = 0;
  for (const c of cells) {
    const cn = colNum(c.col);
    if (!grid[c.row]) grid[c.row] = {};
    const val = c.t === 's' ? (shared[parseInt(c.v)] !== undefined ? shared[parseInt(c.v)] : '') : c.v;
    grid[c.row][cn] = val;
    maxR = Math.max(maxR, c.row); maxC = Math.max(maxC, cn);
  }
  // 合并单元格值传播：把左上角的值填充到整个合并区域
  for (const [key, src] of Object.entries(merges)) {
    const [r, c] = key.split(':').map(Number);
    const [sr, sc] = src.split(':').map(Number);
    if (grid[sr] && grid[sr][sc] !== undefined && grid[sr][sc] !== '' && (!grid[r] || grid[r][c] === undefined || grid[r][c] === '')) {
      if (!grid[r]) grid[r] = {};
      grid[r][c] = grid[sr][sc];
    }
  }
  // 传播后重新计算 maxC
  for (let r = 1; r <= maxR; r++) if (grid[r]) for (let c = 1; c <= maxC; c++) if (grid[r][c] !== undefined) maxC = Math.max(maxC, c);
  const arr = [];
  for (let r = 1; r <= maxR; r++) {
    const row = [];
    for (let c = 1; c <= maxC; c++) row.push(grid[r] && grid[r][c] !== undefined ? String(grid[r][c]) : '');
    while (row.length && row[row.length - 1] === '') row.pop();
    if (row.some(v => v !== '')) arr.push(row);
  }
  const safeName = s.name.replace(/[\\/:*?"<>|]/g, '_');
  writeFileSync(`${outDir}/${safeName}.json`, JSON.stringify(arr, null, 0), 'utf8');
  console.log(`${s.name}: ${arr.length} 行, 最大 ${maxC} 列 -> ${safeName}.json`);
}
