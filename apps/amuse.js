import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'icqq'
import moment from 'moment'

export class amuse extends plugin {
  constructor () {
    super({
      name: '更新日志',
      dsc: '小柴郡更新日志',
      event: 'message',
      priority: 6000,
      rule: [
        {
          reg: '^#?更新日志$',
          fnc: 'log'
        },
        {
          reg: '^#?召唤$',
          fnc: 'call'
        },
        {
          reg: '^喵+$',
          fnc: 'miao'
        },
        {
          reg: '^随机柴郡',
          fnc: 'cj'
        },
        {
          reg: '^#?(kfc|v50|网易云热评|舔狗日记)$',
          fnc: 'text'
        },
        {
          reg: '^#?发癫(.*)',
          fnc: 'fd'
        },
        {
          reg: '^.*$',
          fnc: 'count'
        }
      ]
    })
  }

  async log (e) {
    e.reply('小柴郡的使用详情请访问官网：http://anufether.top/posts/bot')
  }

  async call (e) {
    if (e.user_id === 450993013) {
      e.reply('喵呜~主人，我在这里哦( •̀ ω •́ )✧\n')
    }
  }

  async miao (e) {
    // 加入喵言喵语
    if (Array.isArray(e.message) && e.message.length > 0) {
      // 获取数组中的第一个对象
      const messageObject = e.message[0]

      // 检查对象是否有text属性并且是字符串类型
      // eslint-disable-next-line no-prototype-builtins
      if (messageObject.hasOwnProperty('text') && typeof messageObject.text === 'string') {
        const text = messageObject.text

        // 随机选择一个字符
        const randomChar = getRandomChar()

        // 现在你可以使用text和randomChar变量来进行操作
        const result = `${text}${randomChar}`
        this.reply(result)
      } else {
        console.error('对象没有text属性或text属性不是字符串类型')
      }
    }
  }

  // 随机柴郡图
  async cj () {
    let urls = ['http://api.yujn.cn/api/chaijun.php?', 'http://chaijun.avocado.wiki']
    const randomIndex = Math.random()
    let url
    console.log('randomIndex: ' + randomIndex)
    if (randomIndex < 0.7) {
      url = urls[1] // 返回第一个 URL，概率为 0.7
    } else {
      url = urls[0] // 返回第二个 URL，概率为 0.3
    }
    // 发送消息
    await this.reply(segment.image(url))
    return true // 返回true 阻挡消息不再往下
  }

  async text (e) {
    let message = e.msg
    let key
    if (message.includes('v50') || message.includes('kfc')) {
      key = 'kfc'
    } else if (message.includes('舔狗日记')) {
      key = 'tg'
    } else if (message.includes('网易云热评')) {
      key = 'wyy'
    }
    let url = `http://api.gakki.icu/${key}?type=json`
    let res = await fetch(url) // 调用接口获取数据
    let result = await res.json()
    if (result.code === 200) {
      await e.reply(result.data)
    } else if (result.code === 429) {
      e.reply('太快力q(≧▽≦q)受不了，请慢一点~')
    } else {
      e.reply('查询失败,可能接口失效力~，请联系憨憨捏~')
    }
  }

  async fd (e) {
    let encode
    if (e.at) {
      const at = e.group.pickMember(e.at)
      encode = at.info?.card || at.info?.nickname
    } else {
      encode = e.msg.replace(/^#?发癫/, '').trim()
    }
    if (!encode) return e.reply('输入内容不能为空')
    let url = `https://api.gakki.icu/fd?msg=${encode}`
    let response = await fetch(url) // 调用接口获取数据
    const text = await response.text()
    await this.reply(text)
  }

  async count (e) {
    let key = 'YZ:signIn:count:'
    if (!e.isGroup) {
      let dayKey = `${key}${e.user_id}:day:${moment().format('MMDD')}`
      // 使用 async/await 来等待 Redis 操作完成
      await redis.incr(dayKey)

      // 设置 key 的过期时间，这里设置为 30 天（3600 秒 * 24 小时 * 2 天）
      await redis.expire(dayKey, 3600 * 24 * 2)
    } else {
      // e.reply(e.img[0])
      key += `group:${e.group_id}:`
      let dayKey = `${key}${e.user_id}:day:${moment().format('MMDD')}`
      // 使用 async/await 来等待 Redis 操作完成
      await redis.incr(dayKey)

      // 设置 key 的过期时间，这里设置为 30 天（3600 秒 * 24 小时 * 2 天）
      await redis.expire(dayKey, 3600 * 24 * 2)
    }
  }
}

// 随机加入喵喵语气词
function getRandomChar () {
  const chars = '→↑↓~'
  const randomIndex = Math.floor(Math.random() * chars.length)
  return chars.charAt(randomIndex)
}
