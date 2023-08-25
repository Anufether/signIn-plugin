import plugin from '../../../lib/plugins/plugin.js'

export class state extends plugin {
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
        }
      ]
    })
  }

  async log (e) {
    e.reply('小柴郡的使用详情请访问官网：http://anufether.top/posts/bot')
  }

  async call (e)  {
    e.reply('喵呜~主人，我在这里哦( •̀ ω •́ )✧')
  }
}
