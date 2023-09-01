import plugin from '../../../lib/plugins/plugin.js'

export class amuse extends plugin {
  constructor () {
    super({
      name: '更新日志',
      dsc: '小柴郡更新日志',
      event: 'message',
      priority: 6,
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
        }
      ]
    })
  }

  async log (e) {
    e.reply('小柴郡的使用详情请访问官网：http://anufether.top/posts/bot')
  }

  async call (e) {
    if (e.user_id === 450993013) {
      e.reply('喵呜~主人，我在这里哦( •̀ ω •́ )✧')
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
}

// 随机加入喵喵语气词
function getRandomChar () {
  const chars = '→↑↓~↖↗'
  const randomIndex = Math.floor(Math.random() * chars.length)
  return chars.charAt(randomIndex)
}
