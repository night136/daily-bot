/**
 * 易经每日推送 — 每天一卦
 * 64 卦循环，按日序号映射 (day N → 第 N 卦)
 * 含卦序/卦名/卦辞爻辞/象彖释义/解读/感悟提示/明日预告
 */

const { sendMarkdown } = require('./send_feishu');
const { sendText: sendWecom } = require('./send_wecom');
const guaList = require('../data/yijing.json');

async function main() {
  // 使用北京时间 (UTC+8)
  const now = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const start = new Date(now.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));

  // 64 卦循环：每天一卦，64 天一个周期
  const cycleLen = guaList.length; // 64
  const index = ((dayOfYear - 1) % cycleLen) + 1;
  const gua = guaList[index - 1];

  // 明日预告
  const nextIndex = (index % cycleLen) + 1;
  const nextGua = guaList[nextIndex - 1];
  const preview = `第${nextGua.index}卦 · ${nextGua.title}`;

  function formatGua(gua) {
    return [
      `━━━━━━━━━━━━━━━━━━━━`,
      `☯ 第${gua.index}卦 · ${gua.title}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      ``,
      gua.content,
      ``,
      `【解读】`,
      gua.interpretation,
      ``,
      `💭 【感悟提示】`,
      gua.reflection,
    ].join('\n');
  }

  const body = [
    formatGua(gua),
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📌 明日预告：${preview}`,
  ].join('\n');

  const title = `☯ 每日易经 | ${now.getUTCMonth() + 1}月${now.getUTCDate()}日 · 第${gua.index}卦 ${gua.title}`;
  await sendMarkdown(title, body);
  console.log(`易经第${gua.index}卦「${gua.title}」飞书推送完成`);

  // 企微版：text 文本
  const wecomText = [
    title,
    ``,
    `第${gua.index}卦 · ${gua.title}`,
    ``,
    gua.content,
    ``,
    `【解读】`,
    gua.interpretation,
    ``,
    `💭 【感悟提示】`,
    gua.reflection,
    ``,
    `📌 明日预告：${preview}`,
  ].join('\n');
  await sendWecom(wecomText);
  console.log(`易经第${gua.index}卦「${gua.title}」企微推送完成`);
}

main().catch(err => { console.error(err); process.exit(1); });
