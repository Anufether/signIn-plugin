import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import path from 'path'

export class groupFriendTheoryPlugin extends plugin {
    constructor () {
        super({
            name: '群友说',
            dsc: '收集各种群友言论',
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

    async start (e){
        return  e.reply(segment.image(getRandomImageFilePath()))
    }
}

async function getRandomImageFilePath () {
    try {
        const files = fs.readdirSync('plugins/signIn-plugin/resource/bakaSay')
        const randomIndex = Math.floor(Math.random() * files.length)
        const randomImageFile = files[randomIndex]
        return path.join('plugins/signIn-plugin/resource/bakaSay', randomImageFile)
    } catch (error) {
        console.error('Error reading image directory:', error)
        throw error
    }
}
