import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'

export class myInfo extends plugin {
  constructor () {
    super({
      name: 'myInfo',
      dsc: '我的信息',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?myInfo$',
          fnc: 'myInfo'
        }
      ]
    })
  }

  async myInfo (e) {
    const userId = e.user_id
    const filePath = `plugins/signIn-plugin/data/signIn/${userId}.json`

    try {
      const userData = await fs.promises.readFile(filePath)
      const userJson = JSON.parse(userData.toString())

      const nickname = userJson[userId].nickname
      const lastSignInDate = userJson[userId].updatedTime
      const consecutiveSignInDays = userJson[userId].consecutiveSignInCount
      const totalSignInDays = userJson[userId].signInCount
      const infoUser = [
                `昵称：${nickname}\n`,
                `连续签到：${consecutiveSignInDays}天\n`,
                `累计签到：${totalSignInDays}天\n`,
                `连续签到：${lastSignInDate}天`
      ]
      e.reply(infoUser)
    } catch (err) {
      console.error(err)
      e.reply('无法找到用户数据')
    }
  }
}
