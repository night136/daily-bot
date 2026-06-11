/**
 * 企业微信消息发送模块
 * 通过群机器人 Webhook 发送消息到企业微信群
 *
 * 需要的环境变量（在 GitHub Secrets 中设置）：
 * - WECOM_WEBHOOK: 群机器人 Webhook 地址
 */

const axios = require('axios');

const WEBHOOK = process.env.WECOM_WEBHOOK;

/**
 * 发送 markdown 消息到企业微信群
 * @param {string} content - markdown 内容
 */
async function sendMarkdown(content) {
  if (!WEBHOOK) {
    console.log('[企微] 未配置 WECOM_WEBHOOK，跳过');
    return;
  }

  const body = {
    msgtype: 'markdown',
    markdown: { content },
  };

  const resp = await axios.post(WEBHOOK, body, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (resp.data.errcode !== 0) {
    throw new Error(`企微发送失败: ${JSON.stringify(resp.data)}`);
  }

  console.log('[企微] 消息发送成功');
  return resp.data;
}

module.exports = { sendMarkdown };
