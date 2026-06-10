/**
 * 飞书消息发送模块
 * 通过飞书 Bot API 发送消息到指定用户或群聊
 *
 * 需要的环境变量（在 GitHub Secrets 中设置）：
 * - FEISHU_APP_ID: 飞书应用 App ID
 * - FEISHU_APP_SECRET: 飞书应用 App Secret
 * - FEISHU_CHAT_ID: (可选) 群聊 chat_id，设置后优先发到群
 * - FEISHU_USER_ID: (可选) 接收消息的用户 open_id，chat_id 未设置时使用
 */

const axios = require('axios');

const APP_ID = process.env.FEISHU_APP_ID;
const APP_SECRET = process.env.FEISHU_APP_SECRET;
const CHAT_ID = process.env.FEISHU_CHAT_ID;
const USER_ID = process.env.FEISHU_USER_ID;

/**
 * 获取 tenant_access_token
 */
async function getTenantToken() {
  const resp = await axios.post(
    'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
    { app_id: APP_ID, app_secret: APP_SECRET },
    { headers: { 'Content-Type': 'application/json' } }
  );
  if (resp.data.code !== 0) {
    throw new Error(`获取token失败: ${JSON.stringify(resp.data)}`);
  }
  return resp.data.tenant_access_token;
}

/**
 * 发送 markdown 消息
 * 优先发送到群聊（FEISHU_CHAT_ID），否则发给个人（FEISHU_USER_ID）
 * @param {string} title - 消息标题（卡片标题）
 * @param {string} content - markdown 内容
 */
async function sendMarkdown(title, content) {
  const token = await getTenantToken();

  // 确定发送目标和 receive_id_type
  const targetId = CHAT_ID || USER_ID;
  const idType = CHAT_ID ? 'chat_id' : 'open_id';

  if (!targetId) {
    throw new Error('未设置 FEISHU_CHAT_ID 或 FEISHU_USER_ID，无法发送消息');
  }

  console.log(`发送目标: ${CHAT_ID ? '群聊(' + CHAT_ID + ')' : '个人(' + USER_ID + ')'}`);

  const body = {
    receive_id: targetId,
    msg_type: 'interactive',
    content: JSON.stringify({
      config: { wide_screen_mode: true },
      header: {
        title: { tag: 'plain_text', content: title },
        template: 'blue',
      },
      elements: [
        {
          tag: 'markdown',
          content: content,
        },
        {
          tag: 'hr',
        },
        {
          tag: 'note',
          elements: [
            { tag: 'plain_text', content: '🤖 每日自动推送 · powered by GitHub Actions' },
          ],
        },
      ],
    }),
  };

  const resp = await axios.post(
    `https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=${idType}`,
    body,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (resp.data.code !== 0) {
    throw new Error(`发送消息失败: ${JSON.stringify(resp.data)}`);
  }
  return resp.data;
}

module.exports = { sendMarkdown };
