/**
 * 每日英语单词推送
 * 从词库中随机选 5 个词，推送至飞书
 */

const { sendMarkdown } = require('./send_feishu');
const { sendNews: sendWecom } = require('./send_wecom');
const words = require('../data/words.json');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function main() {
  // 使用北京时间 (UTC+8)
  const today = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const dateStr = `${today.getUTCFullYear()}年${today.getUTCMonth() + 1}月${today.getUTCDate()}日`;

  const picked = shuffle(words).slice(0, 5);

  const lines = picked.map((w, i) => {
    return `${i + 1}. **${w.word}** *(${w.pos})* — ${w.cn}\n> ${w.example}`;
  });

  const content = `${lines.join('\n\n')}`;
  const title = `📝 每日 5 个英语单词 | ${dateStr}`;

  // 企微图文卡片：去掉 markdown 格式符，纯文本
  const plainLines = picked.map((w, i) => {
    return `${i + 1}. ${w.word} (${w.pos}) — ${w.cn}\n   例: ${w.example}`;
  });
  const wecomDesc = plainLines.join('\n\n');

  console.log(`推送英语单词: ${dateStr}`);
  await sendMarkdown(title, content);
  await sendWecom(title, wecomDesc);
  console.log('推送成功！');
}

main().catch((err) => {
  console.error('推送失败:', err.message);
  process.exit(1);
});
