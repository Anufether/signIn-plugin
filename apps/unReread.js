import plugin from '../../../lib/plugins/plugin.js'

export class unReread extends plugin {
    constructor () {
        super({
            name: '复读机',
            dsc: '打断复读',
            event: 'message',
            priority: 6,
            rule: [
                {
                    reg: '^#?baka说$',
                    fnc: 'start'
                }
            ]
        })
    }

}
