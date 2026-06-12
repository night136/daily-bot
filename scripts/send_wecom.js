/**
 * 企业微信消息发送模块
 * 通过群机器人 Webhook 发送消息到企业微信群
 *
 * 需要的环境变量（在 GitHub Secrets 中设置）：
 * - WECOM_WEBHOOKS: 逗号分隔的 Webhook 地址列表
 *   例如: "https://qyapi.weixin.qq.com/xxx?key=aaa,https://qyapi.weixin.qq.com/xxx?key=bbb"
 *
 * 兼容旧配置：
 * - WECOM_WEBHOOK: 单个 Webhook 地址（群1）
 * - WECOM_WEBHOOK_2: 单个 Webhook 地址（群2）
 */

const axios = require('axios');

// 优先使用 WECOM_WEBHOOKS（逗号分隔），兼容旧的 WECOM_WEBHOOK / WECOM_WEBHOOK_2
const WEBHOOKS = [
  ...(process.env.WECOM_WEBHOOKS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
  process.env.WECOM_WEBHOOK,
  process.env.WECOM_WEBHOOK_2,
].filter(Boolean);

/**
 * 发送 markdown 消息到企业微信群
 * @param {string} content - markdown 内容
 */
async function sendMarkdown(content) {
  if (WEBHOOKS.length === 0) {
    console.log("[企微] 未配置任何 WECOM_WEBHOOK，跳过");
    return;
  }

  for (const webhook of WEBHOOKS) {
    try {
      const resp = await axios.post(webhook, {
        msgtype: 'markdown',
        markdown: { content },
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (resp.data.errcode !== 0) {
        console.error(`[企微] 发送失败: ${JSON.stringify(resp.data)}`);
      } else {
        console.log(`[企微] 消息发送成功 (webhook=${webhook.slice(0, 50)}...)`);
      }
    } catch (err) {
      console.error(`[企微] 发送异常: ${err.message}`);
    }
  }
}

module.exports = { sendMarkdown };
