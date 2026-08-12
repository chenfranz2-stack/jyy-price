// 生成独立 quote.html v3：中英文切换 + 货币选择(CNY/USD, 汇率6.75) + 面料库搜索 + 完整核算
import { readFileSync, writeFileSync } from 'fs';

const db = JSON.parse(readFileSync('fabrics-db.json', 'utf8'));

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🧵 JYY Suit Price Calculator</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Microsoft YaHei", Arial, sans-serif; background: #f4f2ee; color: #2a2a2a; padding: 20px; }
  .wrap { max-width: 1000px; margin: 0 auto; }
  .topbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; gap: 10px; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .sub { color: #888; font-size: 13px; }
  .search-box { display: flex; gap: 8px; margin-bottom: 8px; }
  #q { flex: 1; padding: 12px 14px; font-size: 16px; border: 2px solid #d8d2c8; border-radius: 8px; outline: none; }
  #q:focus { border-color: #8a7a5c; }
  .badge { display: inline-block; background: #8a7a5c; color: #fff; font-size: 12px; padding: 3px 10px; border-radius: 12px; margin-left: 8px; }
  .stats { font-size: 12px; color: #999; margin-bottom: 10px; }
  .card { background: #fff; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
  .card h3 { font-size: 15px; margin-bottom: 4px; }
  .brand { color: #8a7a5c; font-weight: normal; font-size: 13px; }
  .meta { font-size: 12px; color: #999; margin-bottom: 8px; }
  .use-btn { float: right; background: #8a7a5c; color: #fff; border: none; border-radius: 6px; padding: 6px 14px; cursor: pointer; font-size: 13px; }
  .use-btn:hover { background: #6f6146; }
  .panel { background: #fff; border-radius: 10px; padding: 16px; margin-bottom: 14px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
  .panel h2 { font-size: 16px; margin-bottom: 12px; color: #8a7a5c; }
  .panel h3 { font-size: 14px; margin: 12px 0 8px; color: #555; }
  .grid { display: grid; gap: 10px; }
  .g2 { grid-template-columns: 1fr 1fr; }
  .g3 { grid-template-columns: repeat(3, 1fr); }
  .g7 { grid-template-columns: repeat(4, 1fr); }
  label.lbl { display: block; font-size: 13px; color: #777; margin-bottom: 4px; }
  select, input[type=number], input[type=text] { width: 100%; padding: 9px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; background: #fafaf8; }
  select:focus, input:focus { outline: none; border-color: #8a7a5c; }
  .radio-card { border: 1px solid #ddd; border-radius: 8px; padding: 8px; text-align: center; cursor: pointer; font-size: 13px; user-select: none; }
  .radio-card.sel { border-color: #8a7a5c; background: #f3efe6; font-weight: bold; }
  .fee { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 4px 0; }
  .fee input { width: auto; }
  .result { background: #2a2a2a; color: #fff; border-radius: 10px; padding: 20px; margin-bottom: 14px; }
  .result .total { font-size: 34px; font-weight: bold; color: #d4b483; margin: 6px 0; }
  .result .detail { font-size: 13px; color: #bbb; line-height: 1.9; }
  .result .detail b { color: #fff; }
  .btn { background: #8a7a5c; color: #fff; border: none; border-radius: 8px; padding: 10px 22px; font-size: 15px; cursor: pointer; margin-right: 8px; }
  .btn:hover { background: #6f6146; }
  .btn.ghost { background: #eee; color: #444; }
  .btn.ghost:hover { background: #ddd; }
  .empty { text-align: center; color: #aaa; padding: 30px 0; }
  .note { font-size: 12px; color: #a66; margin-top: 6px; }
  .plan-item { border: 1px solid #eee; border-radius: 6px; padding: 8px 10px; margin-bottom: 6px; cursor: pointer; font-size: 13px; }
  .plan-item:hover { background: #f7f4ee; }
  .plan-item .t { color: #999; font-size: 11px; }
  .modal { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 50; }
  .modal-box { background: #fff; border-radius: 10px; padding: 18px; width: 420px; max-height: 80vh; overflow-y: auto; }
  .modal-box h3 { margin-bottom: 10px; }
  /* 隐藏规则必须放在 .modal 之后，且提高优先级，否则 display:flex 会覆盖 display:none */
  .modal.hidden, .hidden { display: none !important; }
  .rate-hint { font-size: 11px; color: #aaa; margin-top: 4px; }

  /* ===== 移动端适配 ===== */
  @media (max-width: 720px) {
    body { padding: 10px; }
    h1 { font-size: 19px; }
    .topbar { flex-direction: column; gap: 8px; }
    #langBtn { align-self: flex-end; }
    .search-box { flex-direction: column; }
    #q { font-size: 16px; padding: 13px 14px; }
    .use-btn { float: none; width: 100%; padding: 10px 14px; font-size: 15px; }
    .card { padding: 12px; }
    .g2, .g3, .g7 { grid-template-columns: 1fr 1fr; }
    .g7 { grid-template-columns: repeat(3, 1fr); }
    label.lbl { font-size: 14px; }
    select, input[type=number], input[type=text] { font-size: 16px; padding: 11px 10px; }
    .radio-card { font-size: 14px; padding: 11px 6px; }
    .fee { font-size: 14px; padding: 8px 0; }
    .fee input { width: 20px; height: 20px; }
    .result { padding: 16px; }
    .result .total { font-size: 28px; }
    .btn { width: 100%; margin: 6px 0; padding: 13px 22px; font-size: 16px; }
    .plan-item { padding: 11px 12px; font-size: 14px; }
    .modal-box { width: calc(100vw - 24px); padding: 16px; }
    .stats { font-size: 13px; }
  }
  @media (max-width: 380px) {
    .g2, .g3, .g7 { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="topbar">
    <div>
      <h1>🧵 <span data-i18n="title">西服价格核算</span> <span class="badge">JYY</span></h1>
      <div class="sub" data-i18n="subtitle">输入面料号查询 → 一键带入核算器 → 选产品/尺码/纹路/附加项 → 出价</div>
    </div>
    <button class="btn ghost" id="langBtn">EN</button>
  </div>

  <div class="search-box">
    <input id="q" type="text" data-i18n-ph="searchPh" placeholder="输入面料号或品牌（N707062 / 2134C / YB18 / 8890…）" autofocus>
  </div>
  <div class="stats" id="stats"></div>
  <div id="searchResults"></div>
  <div class="empty hidden" id="searchEmpty">🔍</div>

  <!-- 核算器 -->
  <div class="panel" id="calcPanel">
    <h2>🧮 <span data-i18n="calcTitle">价格核算</span></h2>
    <div class="grid g3">
      <div>
        <label class="lbl" data-i18n="fabricPriceLbl">面料单价（元/米）</label>
        <input type="number" id="fabricPrice" value="200" min="0" step="0.01">
      </div>
      <div>
        <label class="lbl" data-i18n="patternLbl">面料纹路</label>
        <select id="fabricPattern">
          <option value="plain" data-i18n="pat_plain">净色</option>
          <option value="stripe" data-i18n="pat_stripe">条纹</option>
          <option value="plaid" data-i18n="pat_plaid">格纹</option>
        </select>
      </div>
      <div>
        <label class="lbl" data-i18n="currencyLbl">结果货币</label>
        <select id="currencySel">
          <option value="CNY">人民币 CNY (¥)</option>
          <option value="USD">美元 USD ($)</option>
        </select>
        <div class="rate-hint" id="rateHint" data-i18n="rateHint">汇率 1 USD = 6.75 CNY</div>
      </div>
    </div>
    <div class="grid g3">
      <div>
        <label class="lbl" data-i18n="fabricDiscLbl">面料折扣系数</label>
        <input type="number" id="fabricDisc" value="1" min="0" step="0.01">
      </div>
      <div>
        <label class="lbl" data-i18n="laborDiscLbl">加工费折扣系数</label>
        <input type="number" id="laborDisc" value="1" min="0" step="0.01">
      </div>
      <div>
        <div class="rate-hint" data-i18n="discHint">1 = 无折扣，如 0.85 = 85折</div>
      </div>
    </div>
    <h3 data-i18n="productTitle">产品类型</h3>
    <div class="grid g7" id="productTypes">
      <div class="radio-card" data-v="maleSuit" data-i18n="prod_maleSuit">男西服套装</div>
      <div class="radio-card" data-v="femaleSuit" data-i18n="prod_femaleSuit">女西服套装</div>
      <div class="radio-card" data-v="maleJacket" data-i18n="prod_maleJacket">男西服上衣</div>
      <div class="radio-card" data-v="femaleJacket" data-i18n="prod_femaleJacket">女西服上衣</div>
      <div class="radio-card" data-v="pants" data-i18n="prod_pants">西裤</div>
      <div class="radio-card" data-v="coat" data-i18n="prod_coat">大衣</div>
      <div class="radio-card" data-v="vest" data-i18n="prod_vest">马甲</div>
    </div>
    <h3 data-i18n="sizeTitle">尺码范围</h3>
    <div class="grid g3" id="sizeRanges">
      <div class="radio-card" data-v="small" data-i18n="size_small">小号 (S-M)</div>
      <div class="radio-card sel" data-v="medium" data-i18n="size_medium">中号 (L-XL)</div>
      <div class="radio-card" data-v="large" data-i18n="size_large">大号 (XXL+)</div>
    </div>

    <div id="jacketCoatFees" class="hidden">
      <h3 data-i18n="jcFeeTitle">上装/外套附加</h3>
      <div class="grid g2">
        <label class="fee"><input type="checkbox" id="halfLining"> <span data-i18n="fee_halfLining">半里/无里</span> <span class="feeAmt" data-fee="halfLining">(+¥50)</span></label>
        <label class="fee"><input type="checkbox" id="handmadeEyelet"> <span data-i18n="fee_handmadeEyelet">手工米兰眼</span> <span class="feeAmt" data-fee="handmadeEyelet">(+¥50)</span></label>
        <label class="fee"><input type="checkbox" id="rushOrder"> <span data-i18n="fee_rushOrder">加急费</span> <span class="feeAmt" data-fee="rushOrder">(+¥200)</span></label>
        <label class="fee"><input type="checkbox" id="semiProductFitting"> <span data-i18n="fee_semiProductFitting">上装半成品试衣</span> <span class="feeAmt" data-fee="semiProductFitting">(+¥150)</span></label>
        <label class="fee"><input type="checkbox" id="shellFitting"> <span data-i18n="fee_shellFitting">上装毛壳试衣</span> <span class="feeAmt" data-fee="shellFitting">(+¥300)</span></label>
      </div>
    </div>
    <div id="pantsFees" class="hidden">
      <h3 data-i18n="pantsFeeTitle">西裤附加</h3>
      <div class="grid g2">
        <label class="fee"><input type="checkbox" id="sideAdjuster"> <span data-i18n="fee_sideAdjuster">侧腰调节袢</span> <span class="feeAmt" data-fee="sideAdjuster">(+¥50)</span></label>
        <label class="fee"><input type="checkbox" id="elasticWaist"> <span data-i18n="fee_elasticWaist">松紧腰/活动腰</span> <span class="feeAmt" data-fee="elasticWaist">(+¥50)</span></label>
        <label class="fee"><input type="checkbox" id="pantsRushOrder"> <span data-i18n="fee_pantsRushOrder">加急费</span> <span class="feeAmt" data-fee="pantsRushOrder">(+¥100)</span></label>
        <label class="fee"><input type="checkbox" id="pantsSemiProductFitting"> <span data-i18n="fee_pantsSemiProductFitting">西裤半成品试衣</span> <span class="feeAmt" data-fee="pantsSemiProductFitting">(+¥50)</span></label>
        <label class="fee"><input type="checkbox" id="pantsShellFitting"> <span data-i18n="fee_pantsShellFitting">西裤毛壳试衣</span> <span class="feeAmt" data-fee="pantsShellFitting">(+¥150)</span></label>
      </div>
    </div>
    <div id="vestFees" class="hidden">
      <h3 data-i18n="vestFeeTitle">马甲附加</h3>
      <div class="grid g2">
        <label class="fee"><input type="checkbox" id="vestWithCollar"> <span data-i18n="fee_vestWithCollar">带领马甲</span> <span class="feeAmt" data-fee="vestWithCollar">(+¥50)</span></label>
        <label class="fee"><input type="checkbox" id="vestShellFitting"> <span data-i18n="fee_vestShellFitting">马甲毛壳试衣</span> <span class="feeAmt" data-fee="vestShellFitting">(+¥150)</span></label>
      </div>
    </div>
    <h3 data-i18n="customFeeTitle">自定义其他费用</h3>
    <input type="number" id="customOtherFee" value="0" min="0" step="0.01" style="max-width:200px">
    <div style="margin-top:14px">
      <button class="btn" id="calcBtn" data-i18n="calcBtn">开始核算</button>
      <button class="btn ghost" id="savePlanBtn" data-i18n="savePlanBtn">保存方案</button>
      <button class="btn ghost" id="loadPlanBtn" data-i18n="loadPlanBtn">加载方案</button>
    </div>
  </div>

  <!-- 结果 -->
  <div class="result hidden" id="result">
    <div style="font-size:13px;color:#bbb" data-i18n="resultTitle">核算结果</div>
    <div class="total" id="totalPrice">¥0</div>
    <div class="detail" id="priceDetail"></div>
  </div>

  <div class="panel">
    <h2>📖 <span data-i18n="refTitle">快速参考</span></h2>
    <div style="font-size:13px;color:#666;line-height:1.9" id="refTable"></div>
  </div>
</div>

<!-- 方案弹窗 -->
<div class="modal hidden" id="plansModal">
  <div class="modal-box">
    <h3 data-i18n="plansTitle">已保存的方案</h3>
    <div id="plansList"></div>
    <button class="btn ghost" id="closePlansModal" style="margin-top:10px;width:100%" data-i18n="closeBtn">关闭</button>
  </div>
</div>

<script>
const DB = __DATA__;
const norm = s => String(s || '').toUpperCase().replace(/\\s+/g, '');

// ===== 语言包 =====
const I18N = {
  zh: {
    title:'西服价格核算', subtitle:'输入面料号查询 → 一键带入核算器 → 选产品/尺码/纹路/附加项 → 出价',
    searchPh:'输入面料号或品牌（N707062 / 2134C / YB18 / 8890…）',
    calcTitle:'价格核算', fabricPriceLbl:'面料单价（元/米）', patternLbl:'面料纹路', currencyLbl:'结果货币',
    rateHint:'汇率 1 USD = 6.75 CNY',
    productTitle:'产品类型', sizeTitle:'尺码范围',
    prod_maleSuit:'男西服套装', prod_femaleSuit:'女西服套装', prod_maleJacket:'男西服上衣', prod_femaleJacket:'女西服上衣',
    prod_pants:'西裤', prod_coat:'大衣', prod_vest:'马甲',
    size_small:'小号 (S-M)', size_medium:'中号 (L-XL)', size_large:'大号 (XXL+)',
    pat_plain:'净色', pat_stripe:'条纹', pat_plaid:'格纹',
    jcFeeTitle:'上装/外套附加', pantsFeeTitle:'西裤附加', vestFeeTitle:'马甲附加',
    fee_halfLining:'半里/无里', fee_handmadeEyelet:'手工米兰眼', fee_rushOrder:'加急费',
    fee_semiProductFitting:'上装半成品试衣', fee_shellFitting:'上装毛壳试衣',
    fee_sideAdjuster:'侧腰调节袢', fee_elasticWaist:'松紧腰/活动腰', fee_pantsRushOrder:'加急费',
    fee_pantsSemiProductFitting:'西裤半成品试衣', fee_pantsShellFitting:'西裤毛壳试衣',
    fee_vestWithCollar:'带领马甲', fee_vestShellFitting:'马甲毛壳试衣',
    customFeeTitle:'自定义其他费用', calcBtn:'开始核算', savePlanBtn:'保存方案', loadPlanBtn:'加载方案',
    fabricDiscLbl:'面料折扣系数', laborDiscLbl:'加工费折扣系数', discHint:'1 = 无折扣，如 0.85 = 85折',
    resultTitle:'核算结果', refTitle:'快速参考',
    plansTitle:'已保存的方案', closeBtn:'关闭', noPlans:'暂无保存的方案', planSaved:'方案已保存 ✅',
    useFabricBtn:'使用此面料', directPrice:'成衣价', fabricUnit:'面料单价', perMeter:'/米', noPrice:'无价格数据',
    series:'系列', composition:'成分', yarn:'纱支', note:'备注',
    fabric:'面料', labor:'基础加工费', fees:'附加费用', total:'总计', unitM:'米',
    searchStats:'共 {n} 条匹配（库内 {total} 条面料）', searchPhEmpty:'输入面料号开始查询 🔍', searchNoHit:'❌ 没找到，试试部分货号或品牌名',
    useHint:'点击「使用此面料」带入核算器，按产品/尺码/纹路计算成衣价',
    refRows:'加工费 {labor} ｜ 用量 {s}/{m}/{l}米（小/中/大）', refPattern:'纹路加耗: 条纹 +0.1~0.2米 ｜ 格纹 +0.1~0.3米（按产品）',
    planTime:'面料', planFabric:'面料'
  },
  en: {
    title:'Suit Price Calculator', subtitle:'Search fabric code → load into calculator → select product/size/pattern/options → get price',
    searchPh:'Fabric code or brand (N707062 / 2134C / YB18 / 8890…)',
    calcTitle:'Price Calculator', fabricPriceLbl:'Fabric Price (CNY/m)', patternLbl:'Pattern', currencyLbl:'Result Currency',
    rateHint:'Rate 1 USD = 6.75 CNY',
    productTitle:'Product Type', sizeTitle:'Size Range',
    prod_maleSuit:"Men's Suit", prod_femaleSuit:"Women's Suit", prod_maleJacket:"Men's Jacket", prod_femaleJacket:"Women's Jacket",
    prod_pants:'Trousers', prod_coat:'Overcoat', prod_vest:'Waistcoat',
    size_small:'Small (S-M)', size_medium:'Medium (L-XL)', size_large:'Large (XXL+)',
    pat_plain:'Plain', pat_stripe:'Stripe', pat_plaid:'Plaid',
    jcFeeTitle:'Jacket / Coat Extras', pantsFeeTitle:'Trousers Extras', vestFeeTitle:'Waistcoat Extras',
    fee_halfLining:'Half-lined / Unlined', fee_handmadeEyelet:'Handmade Milanese Eyelet', fee_rushOrder:'Rush Order',
    fee_semiProductFitting:'Basted Fitting', fee_shellFitting:'Shell Fitting',
    fee_sideAdjuster:'Side Adjusters', fee_elasticWaist:'Elastic / Extended Waist', fee_pantsRushOrder:'Rush Order',
    fee_pantsSemiProductFitting:'Basted Fitting', fee_pantsShellFitting:'Shell Fitting',
    fee_vestWithCollar:'Collared Waistcoat', fee_vestShellFitting:'Shell Fitting',
    customFeeTitle:'Other Custom Fees', calcBtn:'Calculate', savePlanBtn:'Save Plan', loadPlanBtn:'Load Plan',
    fabricDiscLbl:'Fabric Discount Factor', laborDiscLbl:'Labor Discount Factor', discHint:'1 = no discount, e.g. 0.85 = 15% off',
    resultTitle:'Result', refTitle:'Quick Reference',
    plansTitle:'Saved Plans', closeBtn:'Close', noPlans:'No saved plans yet', planSaved:'Plan saved ✅',
    useFabricBtn:'Use this fabric', directPrice:'Garment price', fabricUnit:'Fabric price', perMeter:'/m', noPrice:'No price data',
    series:'Series', composition:'Composition', yarn:'Yarn', note:'Note',
    fabric:'Fabric', labor:'Base Labor', fees:'Extras', total:'Total', unitM:'m',
    searchStats:'{n} match(es) of {total} fabrics', searchPhEmpty:'Type a fabric code to search 🔍', searchNoHit:'❌ Not found. Try a partial code or brand name',
    useHint:'Click "Use this fabric" to load it into the calculator',
    refRows:'Labor {labor} ｜ Usage {s}/{m}/{l}m (S/M/L)', refPattern:'Pattern extra: Stripe +0.1~0.2m ｜ Plaid +0.1~0.3m (by product)',
    planTime:'Fabric', planFabric:'Fabric'
  }
};
let lang = localStorage.getItem('lang') || 'zh';
let currency = localStorage.getItem('currency') || 'CNY';
const USD_RATE = 6.75;
const t = k => (I18N[lang] && I18N[lang][k] !== undefined) ? I18N[lang][k] : (I18N.zh[k] !== undefined ? I18N.zh[k] : k);
function money(n) { // 大数字：CNY 整数，USD 两位小数
  if (n == null) return '—';
  if (currency === 'USD') return '$' + (n / USD_RATE).toFixed(2);
  return '¥' + Number(n).toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}
function money2(n) { // 明细：CNY 两位，USD 两位
  if (n == null) return '—';
  if (currency === 'USD') return '$' + (n / USD_RATE).toFixed(2);
  return '¥' + Number(n).toFixed(2);
}

// ===== 旧系统提取的核算规则 =====
const PRODUCT_CFG = {
  femaleSuit:  { key:'prod_femaleSuit',  baseLabor:950,  usage:{small:2.79, medium:3.1,  large:3.41} },
  maleSuit:    { key:'prod_maleSuit',    baseLabor:1000, usage:{small:3.0,  medium:3.3,  large:3.63} },
  femaleJacket:{ key:'prod_femaleJacket',baseLabor:700,  usage:{small:1.53, medium:1.7,  large:1.87} },
  maleJacket:  { key:'prod_maleJacket',  baseLabor:750,  usage:{small:1.71, medium:1.9,  large:2.09} },
  pants:       { key:'prod_pants',       baseLabor:250,  usage:{small:1.26, medium:1.4,  large:1.54} },
  coat:        { key:'prod_coat',        baseLabor:950,  usage:{small:2.34, medium:2.6,  large:2.86} },
  vest:        { key:'prod_vest',        baseLabor:250,  usage:{small:0.9,  medium:1.0,  large:1.1} }
};
const PATTERN_EXTRA = {
  plain:  { maleSuit:0, femaleSuit:0, maleJacket:0, femaleJacket:0, pants:0, coat:0, vest:0 },
  stripe: { maleSuit:0.2, femaleSuit:0.2, maleJacket:0.1, femaleJacket:0.1, pants:0.1, coat:0.1, vest:0.1 },
  plaid:  { maleSuit:0.3, femaleSuit:0.3, maleJacket:0.2, femaleJacket:0.2, pants:0.1, coat:0.2, vest:0.2 }
};

// ===== 状态 =====
let selProduct = 'maleSuit';
let selSize = 'medium';

// ===== 搜索 =====
function search(q) {
  const n = norm(q);
  if (!n) return [];
  return DB.filter(r => {
    const c = norm(r.code);
    return c === n || c.includes(n) || n.includes(c) || norm(r.brand).includes(n) || norm(r.source).includes(n);
  }).slice(0, 20);
}

function renderSearch() {
  const q = document.getElementById('q').value.trim();
  const box = document.getElementById('searchResults');
  const empty = document.getElementById('searchEmpty');
  const hits = search(q);
  document.getElementById('stats').textContent = q ? t('searchStats').replace('{n}', hits.length).replace('{total}', DB.length) : '';
  if (!q) { box.innerHTML = ''; empty.classList.remove('hidden'); empty.textContent = t('searchPhEmpty'); return; }
  if (!hits.length) { box.innerHTML = ''; empty.classList.remove('hidden'); empty.textContent = t('searchNoHit'); return; }
  empty.classList.add('hidden');
  box.innerHTML = hits.map(r => {
    const extra = [r.series && (t('series') + ' ' + r.series), r.composition && (t('composition') + ' ' + r.composition), r.weight, r.note && (t('note') + ' ' + r.note)].filter(Boolean).join(' · ');
    let priceTxt;
    if (r.direct) priceTxt = \`<span style="color:#8a5a2b">\${t('directPrice')}: 上衣 \${money(r.jacket)} / 裤子 \${money(r.trousers)} / 马甲 \${money(r.vest)}</span>\`;
    else if (r.pricePerMeter != null) priceTxt = \`\${t('fabricUnit')} \${money(r.pricePerMeter)}\${t('perMeter')}\`;
    else priceTxt = t('noPrice');
    return \`<div class="card">
      <button class="use-btn" onclick="useFabric('\${r.code.replace(/'/g, "\\\\'")}', \${r.pricePerMeter ?? 'null'})">\${t('useFabricBtn')} →</button>
      <h3>\${r.code} <span class="brand">\${r.brand || ''}</span></h3>
      <div class="meta">\${r.source}\${extra ? ' · ' + extra : ''}</div>
      <div style="font-size:14px">\${priceTxt}</div>
      \${r.direct ? '' : (r.pricePerMeter != null ? '<div class="note">' + t('useHint') + '</div>' : '')}
    </div>\`;
  }).join('');
}

function useFabric(code, price) {
  if (price != null) document.getElementById('fabricPrice').value = price;
  document.getElementById('q').value = code;
  renderSearch();
  calc();
  document.getElementById('calcPanel').scrollIntoView({ behavior: 'smooth' });
}
window.useFabric = useFabric;

// ===== 附加费 =====
const FEE_MAP = {
  halfLining: 50, handmadeEyelet: 50, rushOrder: 200, semiProductFitting: 150, shellFitting: 300,
  sideAdjuster: 50, elasticWaist: 50, pantsRushOrder: 100, pantsSemiProductFitting: 50, pantsShellFitting: 150,
  vestWithCollar: 50, vestShellFitting: 150
};
const FEE_LINES = {
  halfLining:'fee_halfLining', handmadeEyelet:'fee_handmadeEyelet', rushOrder:'fee_rushOrder',
  semiProductFitting:'fee_semiProductFitting', shellFitting:'fee_shellFitting',
  sideAdjuster:'fee_sideAdjuster', elasticWaist:'fee_elasticWaist', pantsRushOrder:'fee_pantsRushOrder',
  pantsSemiProductFitting:'fee_pantsSemiProductFitting', pantsShellFitting:'fee_pantsShellFitting',
  vestWithCollar:'fee_vestWithCollar', vestShellFitting:'fee_vestShellFitting'
};
function jacketCoatFees() { return ['halfLining','handmadeEyelet','rushOrder','semiProductFitting','shellFitting'].reduce((s,id)=>s+(document.getElementById(id).checked?FEE_MAP[id]:0),0); }
function pantsFees() { return ['sideAdjuster','elasticWaist','pantsRushOrder','pantsSemiProductFitting','pantsShellFitting'].reduce((s,id)=>s+(document.getElementById(id).checked?FEE_MAP[id]:0),0); }
function vestFees() { return ['vestWithCollar','vestShellFitting'].reduce((s,id)=>s+(document.getElementById(id).checked?FEE_MAP[id]:0),0); }
function updateFeeVisibility() {
  const jc = ['maleJacket','femaleJacket','coat','maleSuit','femaleSuit'].includes(selProduct);
  const pt = ['pants','maleSuit','femaleSuit'].includes(selProduct);
  const v = selProduct === 'vest';
  document.getElementById('jacketCoatFees').classList.toggle('hidden', !jc);
  document.getElementById('pantsFees').classList.toggle('hidden', !pt);
  document.getElementById('vestFees').classList.toggle('hidden', !v);
}

// ===== 核算 =====
function calc() {
  const fabricPrice = parseFloat(document.getElementById('fabricPrice').value) || 0;
  const fabricDisc = parseFloat(document.getElementById('fabricDisc').value);
  const laborDisc = parseFloat(document.getElementById('laborDisc').value);
  const fd = (isFinite(fabricDisc) && fabricDisc > 0) ? fabricDisc : 1;
  const ld = (isFinite(laborDisc) && laborDisc > 0) ? laborDisc : 1;
  const pattern = document.getElementById('fabricPattern').value;
  const p = PRODUCT_CFG[selProduct];
  const usage = p.usage[selSize] + PATTERN_EXTRA[pattern][selProduct];
  const fabricCost = fabricPrice * usage * fd;
  let addFees = 0;
  if (['maleJacket','femaleJacket','coat','maleSuit','femaleSuit'].includes(selProduct)) addFees += jacketCoatFees();
  if (['pants','maleSuit','femaleSuit'].includes(selProduct)) addFees += pantsFees();
  if (selProduct === 'vest') addFees += vestFees();
  addFees += parseFloat(document.getElementById('customOtherFee').value) || 0;
  const laborCost = (p.baseLabor + addFees) * ld;
  const total = fabricCost + laborCost;

  document.getElementById('totalPrice').textContent = money2(total);
  const feeLines = [];
  for (const [id, key] of Object.entries(FEE_LINES)) {
    if (document.getElementById(id).checked) {
      const v = FEE_MAP[id];
      feeLines.push(t(key) + ' +' + (currency === 'USD' ? '$' + (v / USD_RATE).toFixed(2) : v));
    }
  }
  const customFee = parseFloat(document.getElementById('customOtherFee').value) || 0;
  if (customFee > 0) feeLines.push(t('customFeeTitle') + ' +' + (currency === 'USD' ? '$' + (customFee / USD_RATE).toFixed(2) : customFee));
  const sz = t('size_' + selSize);
  const pt = t('pat_' + pattern);
  const fabricLine = (fd !== 1)
    ? \`\${t('fabric')}: \${money2(fabricPrice)}\${t('perMeter')} × \${usage.toFixed(2)}\${t('unitM')} × \${fd} = \${money2(fabricCost)}\`
    : \`\${t('fabric')}: \${money2(fabricPrice)}\${t('perMeter')} × \${usage.toFixed(2)}\${t('unitM')} = \${money2(fabricCost)}\`;
  const laborLine = (ld !== 1)
    ? \`\${t('labor')}: \${money2(p.baseLabor + addFees)} × \${ld} = \${money2(laborCost)}\`
    : \`\${t('labor')}: \${money2(p.baseLabor)}\`;
  const feesLine = (ld !== 1)
    ? \`\${t('fees')}: \${money2(addFees)} × \${ld} = \${money2(addFees * ld)}\${feeLines.length ? '（' + feeLines.join('，') + '）' : ''}\`
    : \`\${t('fees')}: \${money2(addFees)}\${feeLines.length ? '（' + feeLines.join('，') + '）' : ''}\`;
  document.getElementById('priceDetail').innerHTML =
    \`<b>\${t(p.key)}</b>（\${sz} · \${pt}）<br>
     \${fabricLine}<br>
     \${laborLine}<br>
     \${feesLine}<br>
     <b>\${t('total')}: \${money2(total)}</b>\`;
  document.getElementById('result').classList.remove('hidden');
}
window.calc = calc;

// ===== 方案保存 =====
function savePlan() {
  const plan = {
    name: 'Plan ' + new Date().toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US'),
    fabricPrice: document.getElementById('fabricPrice').value,
    fabricPattern: document.getElementById('fabricPattern').value,
    productType: selProduct,
    sizeRange: selSize,
    customOtherFee: document.getElementById('customOtherFee').value,
    fabricDisc: document.getElementById('fabricDisc').value,
    laborDisc: document.getElementById('laborDisc').value,
    halfLining: document.getElementById('halfLining').checked,
    handmadeEyelet: document.getElementById('handmadeEyelet').checked,
    rushOrder: document.getElementById('rushOrder').checked,
    semiProductFitting: document.getElementById('semiProductFitting').checked,
    shellFitting: document.getElementById('shellFitting').checked,
    sideAdjuster: document.getElementById('sideAdjuster').checked,
    elasticWaist: document.getElementById('elasticWaist').checked,
    pantsRushOrder: document.getElementById('pantsRushOrder').checked,
    pantsSemiProductFitting: document.getElementById('pantsSemiProductFitting').checked,
    pantsShellFitting: document.getElementById('pantsShellFitting').checked,
    vestWithCollar: document.getElementById('vestWithCollar').checked,
    vestShellFitting: document.getElementById('vestShellFitting').checked,
    timestamp: Date.now()
  };
  let plans = JSON.parse(localStorage.getItem('pricingPlans') || '[]');
  plans.push(plan);
  localStorage.setItem('pricingPlans', JSON.stringify(plans));
  alert(t('planSaved'));
}
function loadPlans() {
  const plans = JSON.parse(localStorage.getItem('pricingPlans') || '[]');
  const list = document.getElementById('plansList');
  if (!plans.length) { list.innerHTML = '<div style="color:#999;text-align:center;padding:14px">' + t('noPlans') + '</div>'; return; }
  plans.sort((a,b)=>b.timestamp-a.timestamp);
  list.innerHTML = plans.map((p,i) => \`<div class="plan-item" onclick="loadPlan(\${i})">
    <div>\${t(PRODUCT_CFG[p.productType]?.key || 'prod_maleSuit')} · \${t('size_' + (p.sizeRange || 'medium'))} · \${t('pat_' + (p.fabricPattern || 'plain'))}</div>
    <div class="t">\${new Date(p.timestamp).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')} · \${t('planFabric')} \${money2(+p.fabricPrice)}\${t('perMeter')}</div>
  </div>\`).join('');
}
function loadPlan(idx) {
  const plans = JSON.parse(localStorage.getItem('pricingPlans') || '[]');
  const p = plans.sort((a,b)=>b.timestamp-a.timestamp)[idx];
  if (!p) return;
  document.getElementById('fabricPrice').value = p.fabricPrice;
  document.getElementById('fabricPattern').value = p.fabricPattern;
  document.getElementById('customOtherFee').value = p.customOtherFee;
  if (p.fabricDisc != null) document.getElementById('fabricDisc').value = p.fabricDisc;
  if (p.laborDisc != null) document.getElementById('laborDisc').value = p.laborDisc;
  selProduct = p.productType; selSize = p.sizeRange;
  syncRadio();
  for (const id of Object.keys(FEE_MAP)) document.getElementById(id).checked = !!p[id];
  updateFeeVisibility();
  calc();
  document.getElementById('plansModal').classList.add('hidden');
}
window.loadPlan = loadPlan;

function syncRadio() {
  document.querySelectorAll('#productTypes .radio-card').forEach(el => el.classList.toggle('sel', el.dataset.v === selProduct));
  document.querySelectorAll('#sizeRanges .radio-card').forEach(el => el.classList.toggle('sel', el.dataset.v === selSize));
}

// ===== 参考表 =====
function renderRef() {
  const rows = Object.values(PRODUCT_CFG).map(p =>
    t('refRows').replace('{labor}', p.baseLabor).replace('{s}', p.usage.small).replace('{m}', p.usage.medium).replace('{l}', p.usage.large)
  ).join('<br>');
  document.getElementById('refTable').innerHTML = rows + '<br>' + t('refPattern');
}

// ===== 语言切换 =====
function applyLang() {
  document.getElementById('langBtn').textContent = lang === 'zh' ? 'EN' : '中文';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll('.feeAmt').forEach(el => {
    const v = FEE_MAP[el.dataset.fee];
    el.textContent = currency === 'USD' ? '(+$' + (v / USD_RATE).toFixed(2) + ')' : '(+¥' + v + ')';
  });
  renderSearch(); renderRef(); updateFeeVisibility(); calc();
}
function toggleLang() {
  lang = lang === 'zh' ? 'en' : 'zh';
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  applyLang();
}
document.getElementById('langBtn').addEventListener('click', toggleLang);

// ===== 货币切换 =====
document.getElementById('currencySel').addEventListener('change', e => {
  currency = e.target.value;
  localStorage.setItem('currency', currency);
  applyLang();
});

// ===== 事件 =====
document.getElementById('q').addEventListener('input', renderSearch);
document.getElementById('fabricPrice').addEventListener('input', calc);
document.getElementById('fabricDisc').addEventListener('input', calc);
document.getElementById('laborDisc').addEventListener('input', calc);
document.getElementById('fabricPattern').addEventListener('change', calc);
document.getElementById('customOtherFee').addEventListener('input', calc);
document.querySelectorAll('#productTypes .radio-card').forEach(el => el.addEventListener('click', () => { selProduct = el.dataset.v; syncRadio(); updateFeeVisibility(); calc(); }));
document.querySelectorAll('#sizeRanges .radio-card').forEach(el => el.addEventListener('click', () => { selSize = el.dataset.v; syncRadio(); calc(); }));
document.querySelectorAll('.fee input').forEach(el => el.addEventListener('change', calc));
document.getElementById('calcBtn').addEventListener('click', calc);
document.getElementById('savePlanBtn').addEventListener('click', savePlan);
document.getElementById('loadPlanBtn').addEventListener('click', () => { loadPlans(); document.getElementById('plansModal').classList.remove('hidden'); });
document.getElementById('closePlansModal').addEventListener('click', () => document.getElementById('plansModal').classList.add('hidden'));
// 点击遮罩关闭 + ESC 关闭
const plansModal = document.getElementById('plansModal');
plansModal.addEventListener('click', e => { if (e.target === plansModal) plansModal.classList.add('hidden'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') plansModal.classList.add('hidden'); });

// 初始化
document.getElementById('currencySel').value = currency;
document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
applyLang();
</script>
</body>
</html>`;

const out = html.replace('__DATA__', JSON.stringify(db));
writeFileSync('quote.html', out, 'utf8');
console.log('quote.html v3 生成:', (out.length / 1024).toFixed(0) + ' KB,', db.length, '条面料');
