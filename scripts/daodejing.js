/**
 * 道德经每日推送
 * 按日期循环选择章节（d % 81），每天推送一章
 */

const { sendMarkdown } = require('./send_feishu');
const chapters = require('../data/daodejing.json');

async function main() {
  const now = new Date();
  // 用 (今年第几天 % 81) 来选章节，确保每天一章循环
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % chapters.length;
  const chapter = chapters[index];

  const title = `📖 道德经 · 第${chapter.chapter}章`;
  const content = `**${chapter.title}**\n\n${chapter.content}`;

  console.log(`推送: ${title}`);
  await sendMarkdown(title, content);
  console.log('推送成功！');
}

main().catch((err) => {
  console.error('推送失败:', err.message);
  process.exit(1);
});
