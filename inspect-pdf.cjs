// 检查 pdf-parse 模块结构
const p = require('pdf-parse');
console.log('typeof:', typeof p);
console.log('keys:', Object.keys(p));
console.log('has default:', !!p.default, typeof (p.default));
console.log('has PDFParse:', !!p.PDFParse);
if (p.default) console.log('default keys:', Object.keys(p.default));
