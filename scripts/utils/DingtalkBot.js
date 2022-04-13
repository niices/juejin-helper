const axios = require('axios')
const crypto = require('crypto')
const dayjs = require('dayjs')

class DingtalkBot {
  constructor(options = {}) {
    this.text = ''

    this.webhook = options.webhook
    this.secret = options.secret
    const timestamp = new Date().getTime()
    const sign = this.signFn(this.secret, `${timestamp}\n${this.secret}`)
    this.allWebhookUrl = `${this.webhook}&timestamp=${timestamp}&sign=${sign}`
  }

  signFn(secret, content) {
    // 加签
    const str = crypto
      .createHmac('sha256', secret)
      .update(content)
      .digest()
      .toString('base64')
    return encodeURIComponent(str)
  }

  send(data) {
    let p;
    // 没有这两个参数则静默失败
    if (!this.webhook || !this.secret) {
      p = Promise.resolve({
        errcode: -1,
        errmsg: 'webhook和secret不能为空',
      })
    } else {
      p = axios({
        url: this.allWebhookUrl,
        method: 'POST',
        data,
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
      }).then((res) => {
        return res.data
      })
    }
    return p;
  }

  sendMessage(msg) {
    this.send({
      msgtype: 'markdown',
      markdown: {
        title: '掘金每日签到',
        text: `- ${dayjs().format('HH:mm:ss')} ${msg}\n`,
      }
    }).then((res) => {
      console.log(res);
      console.log('提醒成功');
    })
  }
}

module.exports = DingtalkBot