/**
 * 查找飞书群聊 chat_id
 * 列出机器人所在的所有群聊，按名称匹配
 */
const axios = require('axios');

const APP_ID = process.env.FEISHU_APP_ID;
const APP_SECRET = process.env.FEISHU_APP_SECRET;
const TARGET_NAME = process.env.GROUP_NAME || '每日推送道德经';

async function main() {
  // 1. 获取 token
  const tokenResp = await axios.post(
    'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
    { app_id: APP_ID, app_secret: APP_SECRET },
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (tokenResp.data.code !== 0) {
    console.error('获取token失败:', JSON.stringify(tokenResp.data));
    process.exit(1);
  }

  const token = tokenResp.data.tenant_access_token;

  // 2. 列出群聊
  const chatsResp = await axios.get(
    'https://open.feishu.cn/open-apis/im/v1/chats',
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { page_size: 100 },
    }
  );

  if (chatsResp.data.code !== 0) {
    console.error('获取群列表失败:', JSON.stringify(chatsResp.data));
    process.exit(1);
  }

  const items = chatsResp.data.data.items || [];
  console.log(`共 ${items.length} 个群聊:`);

  let found = null;
  for (const item of items) {
    console.log(`  chat_id: ${item.chat_id}  名称: ${item.name}`);
    if (item.name === TARGET_NAME) {
      found = item;
    }
  }

  if (found) {
    console.log(`\n✅ 找到目标群: ${found.name}`);
    console.log(`chat_id: ${found.chat_id}`);
    // 输出到 GitHub Actions output
    if (process.env.GITHUB_OUTPUT) {
      const fs = require('fs');
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `chat_id=${found.chat_id}\n`);
    }
  } else {
    console.log(`\n❌ 未找到名为 "${TARGET_NAME}" 的群聊`);
    console.log('请确认机器人已加入该群');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('执行失败:', err.message);
  process.exit(1);
});
