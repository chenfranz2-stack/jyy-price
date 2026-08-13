// 修改：加工费折扣仅作用于基础加工费，附加费不打折
import { readFileSync, writeFileSync } from 'fs';

let s = readFileSync('build-html.mjs', 'utf8');
let n = 0;
const rep = (from, to, label) => {
  if (!s.includes(from)) { console.error('❌ 未找到: ' + label); process.exit(1); }
  s = s.split(from).join(to);
  n++;
  console.log('✅ ' + label);
};

// 1. 计算：laborCost = 基础加工费×折扣，附加费不打折
rep(
  `  const laborCost = (p.baseLabor + addFees) * ld;
  const total = fabricCost + laborCost;`,
  `  const laborCost = p.baseLabor * ld + addFees;
  const total = fabricCost + laborCost;`,
  'laborCost 仅基础加工费打折'
);

// 2. laborLine：显示基础加工费×折扣（不含附加费）
rep(
  `  const laborLine = (ld !== 1)
    ? \\\`\\\${t('labor')}: \\\${money2(p.baseLabor + addFees)} × \\\${ld} = \\\${money2(laborCost)}\\\`
    : \\\`\\\${t('labor')}: \\\${money2(p.baseLabor)}\\\`;`,
  `  const laborLine = (ld !== 1)
    ? \\\`\\\${t('labor')}: \\\${money2(p.baseLabor)} × \\\${ld} = \\\${money2(p.baseLabor * ld)}\\\`
    : \\\`\\\${t('labor')}: \\\${money2(p.baseLabor)}\\\`;`,
  'laborLine 显示基础加工费折扣'
);

// 3. feesLine：附加费一律不打折
rep(
  `  const feesLine = (ld !== 1)
    ? \\\`\\\${t('fees')}: \\\${money2(addFees)} × \\\${ld} = \\\${money2(addFees * ld)}\\\${feeLines.length ? '（' + feeLines.join('，') + '）' : ''}\\\`
    : \\\`\\\${t('fees')}: \\\${money2(addFees)}\\\${feeLines.length ? '（' + feeLines.join('，') + '）' : ''}\\\`;`,
  `  const feesLine = \\\`\\\${t('fees')}: \\\${money2(addFees)}\\\${feeLines.length ? '（' + feeLines.join('，') + '）' : ''}\\\`;`,
  'feesLine 附加费不打折'
);

writeFileSync('build-html.mjs', s, 'utf8');
console.log('🎉 补丁完成，共修改', n, '处');
