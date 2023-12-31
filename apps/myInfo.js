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
          reg: '^#?我的信息$',
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
      // Get the current date
      const currentDate = new Date()

      // Get the user's stored updated time
      const userUpdatedTime = new Date(userJson[userId].updatedTime)

      // Calculate the time difference in milliseconds
      const timeDifference = currentDate.getTime() - userUpdatedTime.getTime()

      const nickname = userJson[userId].nickname
      const lastSignInDate = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
      const consecutiveSignInDays = userJson[userId].consecutiveSignInCount
      const totalSignInDays = userJson[userId].signInCount
      const infoUser = [
        `昵称：${nickname}\n`,
        `连续签到：${consecutiveSignInDays}天\n`,
        `累计签到：${totalSignInDays}天\n`,
        `我们已经相识：${lastSignInDate}天`
      ]
      e.reply(infoUser)
    } catch (err) {
      console.error(err)
      e.reply('无法找到用户数据')
    }
  }
}
