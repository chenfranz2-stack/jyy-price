// 精准检查 PDFParse API（只打印方法名，不打印实现）
const { PDFParse } = require('pdf-parse');
const proto = Object.getPrototypeOf(new PDFParse());
const names = Object.getOwnPropertyNames(proto).filter(n => n !== 'constructor');
console.log('实例方法:', names.join(', '));
console.log('静态方法:', Object.getOwnPropertyNames(PDFParse).filter(n => !['length','name','prototype'].includes(n)).join(', '));
