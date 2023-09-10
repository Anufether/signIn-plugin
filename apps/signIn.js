import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import path from 'path'
import { axios, segment } from 'icqq'
import generateImage from './imgGeneration.cjs'
import moment from 'moment'
import _ from 'lodash'

export class signIn extends plugin {
  constructor () {
    super({
      name: '签到',
      dsc: '签到',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: '^#?签到$',
          fnc: 'signIn'
        },
        {
          reg: '^原图',
          fnc: 'getOriginalPicture'
        },
        {
          reg: '^签到定制',
          fnc: 'signInCustom'
        }
      ]
    })

    // 创建一个锁对象
    this.lock = false
  }

  get Bot () {
    return this.e.bot ?? Bot
  }

  async signInCustom (e) {
    if (!await this.handelImg(e)) return
    // 需要定制图片的URL
    const imageUrl = e.img[0]

    // 保存到本地
    const localFilePath = `plugins/signIn-plugin/data/customBackground/${e.user_id}.jpg`

    // 使用axios下载图片
    axios.get(imageUrl, { responseType: 'stream' })
      .then(response => {
        const fileStream = fs.createWriteStream(localFilePath)

        response.data.pipe(fileStream)

        fileStream.on('finish', () => {
          fileStream.close()
          console.log('图片已成功保存到本地:', localFilePath)
          e.reply('定制成功！( •̀ ω •́ )✧')
        })
      })
      .catch(error => {
        console.error('下载图片时出错:', error)
        e.reply('❎ 定制失败，请联系管理员')
      })
  }

  async handelImg (e) {
    if (e.source) {
      let source
      if (e.isGroup) {
        source = (await e.group.getChatHistory(e.source.seq, 1)).pop()
      } else {
        source = (await e.friend.getChatHistory(e.source.time, 1)).pop()
      }
      e.img = [source.message.find(item => item.type === 'image')?.url]
    }
    if (!_.isEmpty(e.img)) return true
    this.setContext('MonitorImg')
    e.reply('⚠ 请发送图片')
    return false
  }

  async MonitorImg () {
    if (!this.e.img) {
      this.e.reply('❎ 未检测到图片操作已取消')
    } else {
      // this.reply(this.e.img[0])
      await this.signInCustom(this.e)
    }
    this.finish('MonitorImg')
  }

  async signIn (e) {
    // 检查是否已经被锁定
    if (this.lock) {
      return
    }

    // 判断是否在群中
    if (!e.isGroup) {
      return e.reply('❎ 签到失败，签到功能仅在群聊中可用哦(*/ω＼*)')
    }

    // 锁定事件处理
    this.lock = true

    const userId = e.user_id
    const fileName = `plugins/signIn-plugin/data/signIn/${userId}.json`

    // 检查文件是否存在
    const fileExists = fs.existsSync(fileName)
    let data = {}

    if (fileExists) {
      // 读取保存数据的JSON文件
      try {
        const fileData = fs.readFileSync(fileName)
        data = JSON.parse(fileData.toString())
      } catch (error) {
        console.error('读取数据失败:', error)
      }
    }

    // 检查是否已经签到过
    if (data[userId] && convertTimeToDateString(data[userId].updatedTime) === getCurrentDate()) {
      return e.reply('今天已经签过到啦，明天再来吧(*^▽^*)~')
    }

    // 获取连续签到数和累计签到数
    const signInCount = (data[userId] && data[userId].signInCount) || 0
    const consecutiveSignInCount = (data[userId] && data[userId].consecutiveSignInCount) || 0

    // 判断是否连续签到
    let isContinuous = false
    if (data[userId] && convertTimeToDateString(data[userId].updatedTime) === getYesterdayDate()) {
      isContinuous = true
    }

    // 判断数组是否存在且与当前月份相同
    let isExist = false
    if (data[userId] && data[userId].dayArr != null && extractMonthFromDate(data[userId].updatedTime) === extractMonthFromDate(getBeijingFormattedTime())) {
      // 将 dayArr 转换为数组（如果尚未是数组）
      if (!Array.isArray(data[userId].dayArr)) {
        data[userId].dayArr = [data[userId].dayArr]
      }
      isExist = true
      data[userId].dayArr.push(extractDayFromDate(getCurrentDate()))
      // console.log('Updated dayArr:', data[userId].dayArr)
    }

    // 创建时间是否存在
    let isCreatedTime = false
    if (data[userId] && data[userId].createdTime === true) {
      data[userId].createdTime = null
    }
    if (data[userId] && data[userId].createdTime != null) {
      isCreatedTime = true
    }

    // 更新时间是否存在
    let isUpdate = false
    let tempTime
    if (data[userId] && data[userId].updatedTime != null) {
      tempTime = data[userId].updatedTime
      isUpdate = true
    }

    // 更新签到数据
    data[userId] = {
      nickname: e.sender.nickname,
      createdTime: isCreatedTime ? data[userId].createdTime : getBeijingFormattedTime(),
      updatedTime: getBeijingFormattedTime(),
      signInCount: signInCount + 1,
      consecutiveSignInCount: isContinuous ? (consecutiveSignInCount + 1) : 1,
      dayArr: isExist ? data[userId].dayArr : [extractDayFromDate(getCurrentDate())]
    }

    // 获取昨日时间key
    let dayKey = `YZ:signIn:count:group:${e.group_id}:${e.user_id}:day:${moment().subtract(1, 'days').format('MMDD')}`

    try {
      // 构建、输出签到图片
      const randomImagePath = await getRandomImageFilePath()
      const customImagePath = await getCustomImageFilePath(e.user_id)
      const canvas = await generateImage({
        url: customImagePath || randomImagePath,
        day_arr: data[userId].dayArr,
        zan: isContinuous ? 1 : 2,
        qq: e.user_id,
        name: e.sender.nickname,
        success: signInCount + 1,
        continus: isContinuous ? (consecutiveSignInCount + 1) : 1,
        num: await redis.get(dayKey) || 1,
        last_time: isUpdate ? parseDateTime(tempTime) : parseDateTime(getBeijingFormattedTime)
      })

      const chunks = []
      const stream = canvas.createPNGStream()

      stream.on('data', (chunk) => {
        chunks.push(chunk)
      })
      // 原始信息变量
      let msg = null

      stream.on('end', async () => {
        const imageBuffer = Buffer.concat(chunks)
        const base64Image = imageBuffer.toString('base64')
        const imageSegment = segment.image('base64://' + base64Image)
        msg = await this.Bot.sendGroupMsg(e.group_id, imageSegment)
        // console.log(msg.message_id)
        await redis.set(`YZ:signIn:${msg.message_id}`, randomImagePath, { EX: 3600 * 3 })
      })

      // 写入签到数据
      fs.writeFileSync(fileName, JSON.stringify(data, null, 4))

      // 解锁事件处理
      this.lock = false
    } catch (error) {
      // 在异常情况下也需要解锁
      this.lock = false
      console.error('签到失败:', error)
      e.reply('签到失败(ToT)/~~~，请联系管理员或重新签到')
    }
  }

  async getOriginalPicture (e) {
    let source
    if (e.reply_id) {
      source = { message_id: e.reply_id }
    } else {
      if (!e.hasReply && !e.source) {
        return false
      }
      // 引用的消息不是自己的消息
      if (e.source.user_id !== e.self_id) {
        return false
      }
      // 引用的消息不是纯图片
      if (!/^\[图片]$/.test(e.source.message)) {
        return false
      }
      // 获取原消息
      if (e.group?.getChatHistory) {
        source = (await e.group.getChatHistory(e.source.seq, 1)).pop()
      } else if (e.friend?.getChatHistory) {
        source = (await e.friend.getChatHistory(e.source.time, 1)).pop()
      }
    }
    if (source) {
      let imgPath = await redis.get(`YZ:signIn:${source.message_id}`)
      if (imgPath) {
        e.reply(segment.image(`file://${imgPath}`), false, { recallMsg: 10 })
      }
      return true
    }
    e.reply('消息太过久远了，小柴郡也忘了原图是啥了，下次早点来吧~')
    return false
  }
}

// 读取定制图片
async function getCustomImageFilePath (id) {
  const filePath = `plugins/signIn-plugin/data/customBackground/${id}.jpg`
  try {
    if (fs.existsSync(filePath)) {
      return filePath
    } else {
      return null
    }
  } catch (err) {
    console.error(`发生错误: ${err}`)
    return null
  }
}

// 随机读取图片
async function getRandomImageFilePath () {
  try {
    const files = fs.readdirSync('plugins/signIn-plugin/resource/imageBackground')
    const randomIndex = Math.floor(Math.random() * files.length)
    const randomImageFile = files[randomIndex]
    return path.join('plugins/signIn-plugin/resource/imageBackground', randomImageFile)
  } catch (error) {
    console.error('Error reading image directory:', error)
    throw error
  }
}

// 标准时间转化为月数
function extractMonthFromDate (dateString) {
  const date = new Date(dateString)
  return (date.getMonth() + 1).toString().padStart(2, '0')
}

// 标准时间转化为天数
function extractDayFromDate (dateString) {
  const date = new Date(dateString)
  return date.getDate().toString().padStart(2, '0')
}

// 获取当前日期
function getCurrentDate () {
  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, '0') // 月份需要加 1
  const day = today.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}

function convertTimeToDateString (timeString) {
  const date = new Date(timeString)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取当前精确时间
function getBeijingFormattedTime () {
  const now = new Date()
  now.setHours(now.getHours())

  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`
}

// 获取昨天的日期（YYYY-MM-DD）
function getYesterdayDate () {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateTime (dateTime) {
  const parsedDate = new Date(dateTime)
  return parsedDate.getTime()
}
