const {createCanvas,loadImage,registerFont} = require('canvas')
registerFont('plugins/signIn-plugin/resource/fond/w05.ttf', { family: 're'})
module.exports=async (res)=>{
  const canvas = createCanvas()
  canvas.height = 960
  canvas.width = 540
  const ctx = canvas.getContext('2d')
  const bg = await loadImage(res.url)
  let {width,height}=bg
  let w2=960/height*width
  //绘制背景开始
  ctx.drawImage(bg,0-(w2-540)/2,0,960/height*width,960);
  //绘制背景结束

  //圆角矩形开始
  fillRoundRect(ctx,70,150,400,690,10,'rgba(0,0,0,0.3)')
  ctx.strokeStyle='#fff'
  ctx.lineWidth = 3;
  ctx.stroke()
  //圆角矩形结束

  //日历开始
  calendar(ctx,100,520,res.day_arr,res.zan===1?'green':'red')
  //日历结束

  //用户头像开始
  ctx.beginPath();
  let avatar=await loadImage(`https://q1.qlogo.cn/g?b=qq&nk=${res.qq}&s=100`)
  //ctx.drawImage(avatar,100, 170,);//头像
  circleImg(ctx,avatar,100,170,50)
  //用户头像结束

  //写字开始
  textttf(ctx,'签到成功',230,260,'#ffffff','50px re')
  textttf(ctx,res.name.substring(0,10),230,200,'#ffffff','30px re')
  textttf(ctx,'累计签到:'+res.success+(res.zan===1?'(已点赞)':''),100,320,'#ffffff','30px re')
  textttf(ctx,'连续签到:'+res.continus+(res.continus>30?'(你很勤勉呢)':(res.continus<7?'':'(请继续保持)')),100,360,'#ffffff','30px re')
  textttf(ctx,'昨日发言:'+res.num,100,400,'#ffffff','30px re')
  if(res.last_time!==0){
    textttf(ctx,'上次签到:'+timeFrom(res.last_time),100,440,'#ffffff','30px re')
  }
  //写字结束

  //分界线开始
  ctx.beginPath()
  ctx.strokeStyle='#fff'
  ctx.lineWidth = 3;
  ctx.moveTo(70,470)
  ctx.lineTo(470,470)
  ctx.stroke()
  //分界线结束

  return canvas
}
//一个月有多少天
function getMonthDay(year, month) {
  return new Date(year, month, 0).getDate();
}
//一个月1号是星期几
function getWeekday(year, month) {
  let date = new Date(`${year}/${month}/01 00:00:00`);
  return date.getDay();
}
//格式化数字
function formatNum(num) {
  return num < 10 ? '0' + num : num + '';
}
async function calendar (ctx,x,y,day_arr,color) {
  ctx.font = '30px TsangerJinKai05-W05'
  ctx.fillStyle = '#ffffff'
  ctx.lineWidth = 2
  //日历
  let weekDayZh=['日', '一', '二', '三', '四', '五', '六']
  weekDayZh.forEach((item,index)=>{
    ctx.fillText(item, x+index*50, y)
  })
  let now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  let start=getWeekday(year,month)//取1号对应星期
  let circle=color==='green'?await loadImage('plugins/signIn-plugin/resource/img/green.png'):await loadImage('plugins/signIn-plugin/resource/img/red.png')
  for(let i=start;i<getMonthDay(year,month)+start;i++){
    ctx.fillText(formatNum(i+1-start), x+i%7*50, parseInt(i/7)*50+y+50)
    if(day_arr.includes(formatNum(i+1-start)))
      ctx.drawImage(circle,x+i%7*50-15, parseInt(i/7)*50+y+5,65,65);
  }

}
function timeFrom(dateTime = null, format = 'yyyy-mm-dd') {
  // 如果为null,则格式化当前时间
  if (!dateTime) dateTime = Number(new Date());
  // 如果dateTime长度为10或者13，则为秒和毫秒的时间戳，如果超过13位，则为其他的时间格式
  if (dateTime.toString().length === 10) dateTime *= 1000;
  let timestamp = + new Date(Number(dateTime));

  let timer = (Number(new Date()) - timestamp) / 1000;
  // 如果小于5分钟,则返回"刚刚",其他以此类推
  let tips = '';
  switch (true) {
    case timer < 300:
      tips = '刚刚';
      break;
    case timer >= 300 && timer < 3600:
      tips = parseInt(timer / 60) + '分钟前';
      break;
    case timer >= 3600 && timer < 86400:
      tips = parseInt(timer / 3600) + '小时前';
      break;
    case timer >= 86400 && timer < 2592000:
      tips = parseInt(timer / 86400) + '天前';
      break;
    default:
      // 如果format为false，则无论什么时间戳，都显示xx之前
      if(format === false) {
        if(timer >= 2592000 && timer < 365 * 86400) {
          tips = parseInt(timer / (86400 * 30)) + '个月前';
        } else {
          tips = parseInt(timer / (86400 * 365)) + '年前';
        }
      } else {
        tips = timeFormat(timestamp, format);
      }
  }
  return tips;
}
function timeFormat(dateTime = null, fmt = 'yyyy-mm-dd') {
  // 如果为null,则格式化当前时间
  if (!dateTime) dateTime = Number(new Date());
  // 如果dateTime长度为10或者13，则为秒和毫秒的时间戳，如果超过13位，则为其他的时间格式
  if (dateTime.toString().length === 10) dateTime *= 1000;
  let date = new Date(Number(dateTime));
  let ret;
  let opt = {
    "y+": date.getFullYear().toString(), // 年
    "m+": (date.getMonth() + 1).toString(), // 月
    "d+": date.getDate().toString(), // 日
    "h+": date.getHours().toString(), // 时
    "M+": date.getMinutes().toString(), // 分
    "s+": date.getSeconds().toString() // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    }
  }
  return fmt;
}
function textttf(ctx,text,x,y,color='#ffffff',font='30px TsangerJinKai05-W05') {
  ctx.font = font
  ctx.fillStyle = color
  ctx.lineWidth = 2
  ctx.fillText(text, x, y)
}
//圆角图片
function circleImg(ctx, img, x, y, r) {
  ctx.save();
  var d =2 * r;
  var cx = x + r;
  var cy = y + r;
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.clip();
  ctx.drawImage(img, x, y, d, d);
  ctx.restore();
}
function fillRoundRect(ctx, x, y, width, height, radius, /*optional*/ fillColor) {
  //圆的直径必然要小于矩形的宽高
  if (2 * radius > width || 2 * radius > height) { return false; }

  ctx.save();
  ctx.translate(x, y);
  //绘制圆角矩形的各个边
  drawRoundRectPath(ctx, width, height, radius);
  ctx.fillStyle = fillColor || "#000"; //若是给定了值就用给定的值否则给予默认值
  ctx.fill();
  ctx.restore();
}
function drawRoundRectPath(ctx, width, height, radius) {
  ctx.beginPath(0);
  //从右下角顺时针绘制，弧度从0到1/2PI
  ctx.arc(width - radius, height - radius, radius, 0, Math.PI / 2);

  //矩形下边线
  ctx.lineTo(radius, height);

  //左下角圆弧，弧度从1/2PI到PI
  ctx.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);

  //矩形左边线
  ctx.lineTo(0, radius);

  //左上角圆弧，弧度从PI到3/2PI
  ctx.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2);

  //上边线
  ctx.lineTo(width - radius, 0);

  //右上角圆弧
  ctx.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2);

  //右边线
  ctx.lineTo(width, height - radius);
  ctx.closePath();
}


