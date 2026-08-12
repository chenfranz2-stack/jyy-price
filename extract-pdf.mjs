// PDF 文本提取工具 v2（pdf-parse v2 API）
// 用法: node extract-pdf.mjs <pdf路径> [--text] [--info] [--page N]
import { readFileSync, writeFileSync } from 'fs';
import { PDFParse } from 'pdf-parse';

const file = process.argv[2];
if (!file) { console.log('用法: node extract-pdf.mjs <pdf路径> [--text]'); process.exit(1); }

const data = readFileSync(file);
const parser = new PDFParse({ data });

if (process.argv.includes('--info')) {
  try {
    const info = await parser.getInfo();
    console.log('📄 文档信息:', JSON.stringify(info).slice(0, 500));
  } catch (e) { console.log('info 失败:', e.message); }
}

try {
  const result = await parser.getText();
  console.log('✅ PDF 解析成功');
  console.log('页数:', result.pages?.length ?? '?');
  const texts = (result.pages || []).map(p => p.text || '').join('\n');
  console.log('文本长度:', texts.length, '字符');
  if (process.argv.includes('--text')) {
    const out = file.replace(/\.pdf$/i, '') + '.txt';
    writeFileSync(out, texts, 'utf8');
    console.log('已输出:', out);
  } else {
    console.log('--- 前 800 字 ---');
    console.log(texts.slice(0, 800));
  }
} catch (e) {
  console.error('❌ 解析失败:', e.message);
  console.error('可能原因: 扫描版PDF(纯图片无文字层) / 加密PDF / 损坏文件');
}
