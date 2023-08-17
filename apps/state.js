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
                }
            ]
        })
    }

    async log(e){
        e.reply('小柴郡的使用详情请访问官网：http://anufether.top/posts/bot')
    }
}
