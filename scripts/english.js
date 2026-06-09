/**
 * 每日英语单词推送
 * 从词库中随机选 5 个词，推送至飞书
 */

const { sendMarkdown } = require('./send_feishu');
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
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  const picked = shuffle(words).slice(0, 5);

  const lines = picked.map((w, i) => {
    return `${i + 1}. **${w.word}** *(${w.pos})* — ${w.cn}\n> ${w.example}`;
  });

  const content = `${lines.join('\n\n')}`;
  const title = `📝 每日 5 个英语单词 | ${dateStr}`;

  console.log(`推送英语单词: ${dateStr}`);
  await sendMarkdown(title, content);
  console.log('推送成功！');
}

main().catch((err) => {
  console.error('推送失败:', err.message);
  process.exit(1);
});
