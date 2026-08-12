// 检查 PDFParse 类的 API
const { PDFParse } = require('pdf-parse');
console.log('PDFParse 静态方法:', Object.getOwnPropertyNames(PDFParse));
const p = new PDFParse();
console.log('实例方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(p)));
console.log('实例属性:', Object.keys(p));
