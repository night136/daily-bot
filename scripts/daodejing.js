/**
 * 道德经每日推送 — 每天两章
 * 循环 81 章，按日序号配对 (day N → chapters 2N-1, 2N)
 * 含原文、解读、感悟提示、明日预告
 */

const { sendMarkdown } = require('./send_feishu');
const { sendText: sendWecom } = require('./send_wecom');
const chapters = require('../data/daodejing.json');

async function main() {
  // 使用北京时间 (UTC+8)
  const now = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const start = new Date(now.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));

  // 81章每两天推一对，41天一个循环。第41天只推第81章
  const cycleLen = 41; // 40对 + 1章单独
  const pairIndex = ((dayOfYear - 1) % cycleLen) + 1;
  const ch1 = chapters[pairIndex * 2 - 2];
  const ch2 = pairIndex === cycleLen ? null : chapters[pairIndex * 2 - 1];

  // 明日预告
  const nextPair = (pairIndex % cycleLen) + 1;
  const nextCh1 = chapters[nextPair * 2 - 2];
  const nextCh2 = nextPair === cycleLen ? null : chapters[nextPair * 2 - 1];
  const preview = nextCh2
    ? `第${nextCh1.chapter}-${nextCh2.chapter}章 | ${nextCh1.title} · ${nextCh2.title}`
    : `第${nextCh1.chapter}章 | ${nextCh1.title}（本轮终章）`;

  function formatChapter(ch) {
    return [
      `━━━━━━━━━━━━━━━━━━━━`,
      `📜 第${ch.chapter}章 · ${ch.title}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `【原文】`,
      ch.content,
      ``,
      `【解读】`,
      ch.interpretation,
      ``,
      `💭 【感悟提示】`,
      ch.reflection,
    ].join('\n');
  }

  const body = [
    formatChapter(ch1),
    ch2 ? `\n\n${formatChapter(ch2)}` : '',
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📌 明日预告：${preview}`,
  ].join('\n');

  const chLabel = ch2 ? `第${ch1.chapter}-${ch2.chapter}章` : `第${ch1.chapter}章`;
  const title = `📜 每日道德经 | ${now.getUTCMonth()+1}月${now.getUTCDate()}日 · ${chLabel}`;
  await sendMarkdown(title, body);
  console.log(`道德经第${ch1.chapter}-${ch2.chapter}章推送完成`);

  // 企微版：text文本，内容与飞书一致（含感悟），不截断
  const wecomText = [
    title,
    ``,
    `第${ch1.chapter}章 · ${ch1.title}`,
    ``,
    `【原文】`,
    ch1.content,
    ``,
    `【解读】`,
    ch1.interpretation,
    ``,
    `💭 【感悟提示】`,
    ch1.reflection,
    ...(ch2 ? [
      ``,
      `第${ch2.chapter}章 · ${ch2.title}`,
      ``,
      `【原文】`,
      ch2.content,
      ``,
      `【解读】`,
      ch2.interpretation,
      ``,
      `💭 【感悟提示】`,
      ch2.reflection,
    ] : []),
    ``,
    `📌 明日预告：${preview}`,
  ].join('\n');
  await sendWecom(wecomText);
}

main().catch(err => { console.error(err); process.exit(1); });
