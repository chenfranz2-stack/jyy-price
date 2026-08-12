// 渲染 PDF 页面为 PNG 图片（扫描版画册用）
// 用法: node render-pdf-pages.mjs <pdf路径> <输出目录> [页码范围,如 1-5 或 1,3,5]
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { PDFParse } from 'pdf-parse';

const file = process.argv[2];
const outDir = process.argv[3] || 'pdf-pages';
if (!file) { console.log('用法: node render-pdf-pages.mjs <pdf路径> <输出目录> [页码 如 1-5]'); process.exit(1); }

// 解析页码参数
let pages = null;
const arg = process.argv[4];
if (arg) {
  if (arg.includes('-')) {
    const [a, b] = arg.split('-').map(Number);
    pages = []; for (let i = a; i <= b; i++) pages.push(i);
  } else {
    pages = arg.split(',').map(Number);
  }
}

const data = readFileSync(file);
const parser = new PDFParse({ data });
mkdirSync(outDir, { recursive: true });

const base = file.replace(/\\/g, '/').split('/').pop().replace(/\.pdf$/i, '');
const opts = pages ? { partial: pages, desiredWidth: 1400 } : { desiredWidth: 1400 };
console.log('渲染中:', base, pages ? `页码 ${pages.join(',')}` : '全部页', '...');
const result = await parser.getScreenshot(opts);
await parser.destroy();

let n = 0;
for (const p of result.pages) {
  n++;
  const name = `${outDir}/${base}-p${p.pageNumber || n}.png`;
  writeFileSync(name, p.data);
  console.log('✅', name, (p.data.length / 1024).toFixed(0) + 'KB');
}
console.log('完成，共', n, '页');
