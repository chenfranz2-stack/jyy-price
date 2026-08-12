// 验证 quote.html v3（i18n + 货币切换）
import { readFileSync } from 'fs';
const h = readFileSync('quote.html', 'utf8');

const checks = [
  ['中英文语言包', h.includes('I18N') && h.includes("'en':")],
  ['货币选择器(CNY/USD)', h.includes('currencySel') && h.includes('value="USD"')],
  ['汇率6.75', h.includes('USD_RATE = 6.75')],
  ['美元两位小数', h.includes("(n / USD_RATE).toFixed(2)")],
  ['人民币默认', h.includes("localStorage.getItem('currency') || 'CNY'")],
  ['语言切换按钮', h.includes('id="langBtn"')],
  ['弹窗遮罩关闭', h.includes("if (e.target === plansModal)")],
  ['ESC关闭', h.includes("e.key === 'Escape'")],
  ['附加费动态金额', h.includes('feeAmt')],
  ['JS语法', (() => { const m = h.match(/<script>([\s\S]*?)<\/script>/); try { new Function(m[1]); return true; } catch (e) { return 'ERR: ' + e.message; } })()],
];

let allOk = true;
for (const [name, ok] of checks) {
  console.log((ok === true ? '✅' : '❌') + ' ' + name + (ok === true ? '' : ' → ' + JSON.stringify(ok)));
  if (ok !== true) allOk = false;
}
console.log(allOk ? '\n全部通过' : '\n有未通过的项');
