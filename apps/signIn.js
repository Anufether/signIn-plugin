import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import path from 'path'
import { segment } from 'icqq'
import { fileURLToPath } from 'url'
import generateImage from './imgGeneration.cjs'

export class signIn extends plugin {
  constructor () {
    super({
      name: '签到',
      dsc: '签到',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?签到$',
          fnc: 'signIn'
        }
      ]
    })
  }

  async signIn (e) {
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
      return e.reply('今天已经签过到啦，明天再来吧~')
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
      console.log('Updated dayArr:', data[userId].dayArr)
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
    if (data[userId] && data[userId].updatedTime != null) {
      isUpdate = true
    }

    try {
      // 构建、输出签到图片
      const randomImagePath = await getRandomImageFilePath()
      const canvas = await generateImage({
        url: randomImagePath,
        day_arr: data[userId].dayArr,
        zan: isContinuous ? 1 : 2,
        qq: e.user_id,
        name: e.sender.nickname,
        success: signInCount + 1,
        continus: isContinuous ? (consecutiveSignInCount + 1) : 1,
        num: 1,
        last_time: isUpdate ? data[userId].updatedTime : getBeijingFormattedTime()
      })

      // 生成图片路径
      const moduleURL = new URL(import.meta.url)
      const modulePath = fileURLToPath(moduleURL)
      const outputPath = path.join(path.dirname(modulePath), '..', 'data', 'signImg', 'output.png')
      const out = fs.createWriteStream(outputPath)
      const stream = canvas.createPNGStream()

      // 输出图片
      stream.pipe(out)
      out.on('finish', () => {
        console.log('Image created successfully.')
        e.reply(segment.image(outputPath))
      })
      // 更新签到数据
      data[userId] = {
        nickname: e.sender.nickname,
        createdTime: isCreatedTime ? data[userId].createdTime : getBeijingFormattedTime(),
        updatedTime: getBeijingFormattedTime(),
        signInCount: signInCount + 1,
        consecutiveSignInCount: isContinuous ? (consecutiveSignInCount + 1) : 1,
        dayArr: isExist ? data[userId].dayArr : [extractDayFromDate(getCurrentDate())]
      }
      // 写入签到数据
      fs.writeFileSync(fileName, JSON.stringify(data, null, 4))
    } catch (error) {
      console.error('签到失败:', error)
      e.reply('签到失败，请联系管理员')
    }
  }
}

// 随机读取函数图片
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
