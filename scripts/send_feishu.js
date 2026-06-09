/**
 * 飞书消息发送模块
 * 通过飞书 Bot API 发送消息到指定用户
 *
 * 需要的环境变量（在 GitHub Secrets 中设置）：
 * - FEISHU_APP_ID: 飞书应用 App ID
 * - FEISHU_APP_SECRET: 飞书应用 App Secret
 * - FEISHU_USER_ID: 接收消息的用户 open_id
 */

const axios = require('axios');

const APP_ID = process.env.FEISHU_APP_ID;
const APP_SECRET = process.env.FEISHU_APP_SECRET;
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
 * 发送 markdown 消息给用户
 * @param {string} title - 消息标题（卡片标题）
 * @param {string} content - markdown 内容
 */
async function sendMarkdown(title, content) {
  const token = await getTenantToken();

  const body = {
    receive_id: USER_ID,
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
    'https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=open_id',
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
