/**
 * 每日 AI 新闻推送
 * 通过多个 RSS/API 来源获取当天 AI 领域新闻
 * 筛选 3-5 条有价值的信息推送至飞书
 */

const axios = require('axios');
const { sendMarkdown } = require('./send_feishu');

/**
 * 通过 GitHub 搜索 API 获取 AI 相关 trending 内容
 */
async function fetchGitHubTrending() {
  try {
    const yesterday = new Date(Date.now() - 86400000);
    const dateStr = yesterday.toISOString().split('T')[0];
    const resp = await axios.get(
      `https://api.github.com/search/repositories?q=ai+coding+embodied+created:%3E${dateStr}&sort=stars&order=desc&per_page=3`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    );
    return (resp.data.items || []).map((item) => ({
      source: 'GitHub Trending',
      text: `**${item.full_name}** ⭐${item.stargazers_count}\n${item.description || '无描述'}\n[查看](${item.html_url})`,
    }));
  } catch {
    return [];
  }
}

/**
 * 通过 Hacker News API 获取 AI 热门话题
 */
async function fetchHackerNews() {
  try {
    const topResp = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
    const topIds = topResp.data.slice(0, 30);

    const items = await Promise.all(
      topIds.map((id) =>
        axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((r) => r.data)
      )
    );

    const aiItems = items
      .filter(
        (item) =>
          item &&
          item.title &&
          (item.title.toLowerCase().includes('ai') ||
            item.title.toLowerCase().includes('llm') ||
            item.title.toLowerCase().includes('gpt') ||
            item.title.toLowerCase().includes('coding') ||
            item.title.toLowerCase().includes('robot'))
      )
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3);

    return aiItems.map((item) => ({
      source: 'Hacker News',
      text: `**${item.title}** 🔥${item.score || 0}\n[查看](https://news.ycombinator.com/item?id=${item.id})`,
    }));
  } catch {
    return [];
  }
}

async function main() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  console.log('开始获取 AI 新闻...');
  const [github, hn] = await Promise.all([fetchGitHubTrending(), fetchHackerNews()]);

  const allNews = [...github, ...hn];
  if (allNews.length === 0) {
    console.log('没有获取到新闻');
    return;
  }

  const picked = allNews.slice(0, 5);
  const lines = picked.map((n, i) => {
    return `${i + 1}. [${n.source}] ${n.text}`;
  });

  const content = `${lines.join('\n\n')}`;
  const title = `📰 每日 AI 新闻推送 | ${dateStr}`;

  console.log(`推送 ${picked.length} 条新闻`);
  await sendMarkdown(title, content);
  console.log('推送成功！');
}

main().catch((err) => {
  console.error('推送失败:', err.message);
  process.exit(1);
});
