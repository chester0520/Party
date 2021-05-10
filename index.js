import linebot from 'linebot'
import dotenv from 'dotenv'
import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'

// 讓套件讀取 .env 檔案
// 讀取後可以用 process.env.變數 使用
dotenv.config()

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

bot.listen('/', process.env.PORT, () => {
  console.log('機器人啟動')
})

bot.on('message', async event => {
  if (event.message.type === 'text') {
    try {
      const response = await axios.get(`https://www.indievox.com/activity/list/${encodeURI(event.message.text)}`)
      const $ = cheerio.load(response.data)
      const flexarr = []
      let thistext = ''
      $('.panel-body').each(function (r) {
        // for (i = 0; i <= r; i++) {
        //   console.log(i)
        // }
        const flex = {
          type: 'bubble',
          hero: {
            type: 'image',
            url: $(this).find('img').attr('src'),
            size: 'full',
            aspectRatio: '480:640',
            aspectMode: 'fit',
            action: {
              type: 'uri',
              uri: $(this).find('a').attr('href')
            }
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: $(this).find('.multi_ellipsis').text(),
                weight: 'bold',
                size: 'md',
                wrap: true
              },
              {
                type: 'box',
                layout: 'vertical',
                margin: 'lg',
                spacing: 'sm',
                contents: [
                  {
                    type: 'box',
                    layout: 'baseline',
                    spacing: 'sm',
                    contents: [
                      {
                        type: 'text',
                        text: '時間',
                        color: '#aaaaaa',
                        size: 'sm',
                        flex: 1
                      },
                      {
                        type: 'text',
                        text: $(this).find('.date').text(),
                        wrap: true,
                        color: '#666666',
                        size: 'sm',
                        flex: 5
                      }
                    ]
                  }
                ]
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                style: 'link',
                height: 'sm',
                action: {
                  type: 'uri',
                  label: '前往購票網站',
                  uri: $(this).find('a').attr('href')
                }
              },
              {
                type: 'spacer',
                size: 'sm'
              }
            ],
            flex: 0
          }
        }
        flexarr.push(flex)
        thistext += $(this).text()
        // const response1 = await axios.get(`$(this).find('a').attr('href')`)
      })
      const message = {
        type: 'flex',
        altText: thistext,
        contents: {
          type: 'carousel',
          contents: flexarr
        }
      }
      fs.writeFileSync('aaa.json', JSON.stringify(message, null, 2))
      event.reply(message)
    } catch (error) {
      event.reply('發生錯誤')
    }
  }
})
